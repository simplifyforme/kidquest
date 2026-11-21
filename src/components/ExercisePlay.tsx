import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, Delete, RotateCcw, Volume2 } from "lucide-react";
import type { Question } from "../types";
import {
  correctLabel, exerciseModeNames, isCorrectText, makeMissing,
  matchingPairs, normalizeAnswer, rotate
} from "../lib/exerciseModes";
import type { ExerciseMode } from "../lib/exerciseModes";

type Props = {
  question: Question;
  pool: Question[];
  mode: ExerciseMode;
  locked: boolean;
  onAnswer: (right: boolean, answerId: string) => void;
};

function getIncorrect(question: Question): {id:string;label:string} {
  return question.answers.find(a => a.id !== question.correctAnswerId) ?? question.answers[0];
}

function speak(text: string, dutch: boolean): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = dutch ? "nl-BE" : "fr-BE";
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

export default function ExercisePlay({ question, pool, mode, locked, onAnswer }: Props) {
  const expected = correctLabel(question);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [memoryOpen, setMemoryOpen] = useState<number[]>([]);
  const [memorySolved, setMemorySolved] = useState<string[]>([]);
  const [memoryWaiting, setMemoryWaiting] = useState(false);
  const [range, setRange] = useState(50);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const pairs = useMemo(() => matchingPairs(question, pool), [question, pool]);
  const wrong = getIncorrect(question);
  const seed = question.id.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  const showTrue = seed % 2 === 0;
  const offered = showTrue ? question.answers.find(a => a.id === question.correctAnswerId)! : wrong;
  const duel = rotate([question.answers.find(a => a.id === question.correctAnswerId)!, wrong], seed);
  const letters = useMemo(() => rotate(Array.from(expected.replace(/\s/g, "")).map((text, i) => ({text, id: i})), seed), [expected, seed]);
  const words = useMemo(() => rotate(expected.trim().split(/\s+/).map((text, i) => ({text, id: i})), seed), [expected, seed]);
  const missing = useMemo(() => makeMissing(expected), [expected]);
  const matchAnswers = useMemo(() => rotate(pairs.map(p => ({id:p.id,label:correctLabel(p)})), seed), [pairs, seed]);
  const memoryCards = useMemo(() => rotate(pairs.flatMap(p => [
    {pair:p.id,kind:"prompt" as const,label:p.prompt},
    {pair:p.id,kind:"answer" as const,label:correctLabel(p)}
  ]), seed), [pairs, seed]);

  function submitText(event: FormEvent) {
    event.preventDefault();
    if (locked || !typed.trim()) return;
    onAnswer(isCorrectText(question, typed), "typed:" + typed.slice(0, 100));
  }
  function completeTokens(source: {text:string;id:number}[], ids: number[]) {
    const answer = ids.map(id => source.find(item => item.id === id)?.text ?? "").join(mode==="words"?" ":"");
    onAnswer(normalizeAnswer(answer) === normalizeAnswer(expected), mode + ":" + answer.slice(0, 85));
  }
  function selectPair(answerId: string) {
    if (locked || !activePrompt || matched.includes(answerId)) return;
    if (activePrompt === answerId) {
      const next = [...matched, answerId];
      setMatched(next);
      setActivePrompt(null);
      if (next.length === pairs.length) onAnswer(mistakes === 0, "matching:" + (mistakes ? "retry" : "perfect"));
    } else {
      setMistakes(x => x + 1);
      setActivePrompt(null);
    }
  }
  function turnCard(index: number) {
    const card = memoryCards[index];
    if (locked || memoryWaiting || memorySolved.includes(card.pair) || memoryOpen.includes(index)) return;
    if (memoryOpen.length === 0) { setMemoryOpen([index]); return; }
    const first = memoryCards[memoryOpen[0]];
    const correct = first.pair === card.pair && first.kind !== card.kind;
    setMemoryOpen([memoryOpen[0], index]);
    if (correct) {
      const next = [...memorySolved, card.pair];
      setMemorySolved(next);
      timeoutRef.current = setTimeout(() => {
        setMemoryOpen([]);
        if (next.length === pairs.length) onAnswer(mistakes === 0, "memory:" + (mistakes ? "retry" : "perfect"));
      }, 550);
    } else {
      setMistakes(value => value + 1);
      setMemoryWaiting(true);
      timeoutRef.current = setTimeout(() => { setMemoryOpen([]); setMemoryWaiting(false); }, 850);
    }
  }

  const tokenMode = mode === "letters" || mode === "words";
  const source = mode === "words" ? words : letters;
  const constructed = picked.map(id => source.find(c => c.id === id)?.text ?? "");
  const display = mode === "words" ? constructed.join(" ") : constructed.join("");

  return <section className="mode-content" aria-label={exerciseModeNames[mode]}>
    <div className="mode-heading">
      <span className="mode-chip">🎲 {exerciseModeNames[mode]}</span>
      {mode !== "choice" && <span className="mode-help">À toi de jouer !</span>}
    </div>
    {mode === "choice" && <div className="answer-grid">
      {question.answers.map((answer, index) =>
        <button key={answer.id} className="answer" disabled={locked} onClick={() => onAnswer(answer.id === question.correctAnswerId, answer.id)}>
          <span className="answer-letter">{String.fromCharCode(65 + index)}</span>{answer.label}
        </button>
      )}
    </div>}

    {mode === "write" && <form className="input-challenge" onSubmit={submitText}>
      <label htmlFor="kidquest-typed">Écris la bonne réponse :</label>
      <input id="kidquest-typed" autoFocus autoComplete="off" spellCheck={false}
        inputMode={/^\d+$/.test(expected)?"numeric":"text"}
        placeholder="Ta réponse ici…" value={typed} disabled={locked} onChange={e=>setTyped(e.target.value)} />
      <button className="primary" type="submit" disabled={locked || !typed.trim()}><Check size={19}/> Vérifier</button>
    </form>}

    {mode === "truefalse" && <div className="judgement">
      <p className="judgement-text">La réponse serait : <strong>« {offered.label} »</strong></p>
      <div className="answer-grid">
        <button className="answer choice-yes" disabled={locked} onClick={()=>onAnswer(showTrue,"true")}>✅ Vrai !</button>
        <button className="answer choice-no" disabled={locked} onClick={()=>onAnswer(!showTrue,"false")}>❌ Faux !</button>
      </div>
    </div>}

    {mode === "duel" && <div className="duel-grid">
      {duel.map((answer,index)=><button className="duel-option" key={answer.id}
        disabled={locked} onClick={()=>onAnswer(answer.id===question.correctAnswerId,answer.id)}>
        <span className="duel-number">{index===0?"1":"2"}</span>{answer.label}
      </button>)}
    </div>}

    {tokenMode && <div className="token-challenge">
      <p className="question-instruction">{mode==="letters"?"Appuie sur les lettres dans le bon ordre.":"Choisis les mots pour former la réponse."}</p>
      <div className="assembled-answer" aria-live="polite">{display || "❔ À toi de construire la réponse"}</div>
      <div className="token-grid">
        {source.map(tile=><button key={tile.id} type="button" className="letter-tile"
          disabled={locked || picked.includes(tile.id)}
          onClick={()=>setPicked(value=>[...value,tile.id])}>{tile.text}</button>)}
      </div>
      <div className="challenge-actions">
        <button type="button" className="secondary" disabled={locked || !picked.length}
          onClick={()=>setPicked(v=>v.slice(0,-1))}><Delete size={17}/> Effacer</button>
        <button type="button" className="secondary" disabled={locked || !picked.length}
          onClick={()=>setPicked([])}><RotateCcw size={17}/> Recommencer</button>
        <button type="button" className="primary" disabled={locked || picked.length!==source.length}
          onClick={()=>completeTokens(source,picked)}><Check size={17}/> Vérifier</button>
      </div>
    </div>}

    {mode === "missing" && <form className="input-challenge" onSubmit={event=>{
      event.preventDefault();
      if (!locked && typed.trim()) onAnswer(normalizeAnswer(typed)===normalizeAnswer(missing.hidden), "missing:"+typed.slice(0,60));
    }}>
      <label htmlFor="missing-answer">Quelles lettres manquent dans la réponse ?</label>
      <div className="missing-word"><span>{missing.before}</span><span className="blank-letters">{"_".repeat(Array.from(missing.hidden).length)}</span><span>{missing.after}</span></div>
      <input id="missing-answer" autoComplete="off" spellCheck={false} value={typed}
        onChange={e=>setTyped(e.target.value)} disabled={locked} placeholder="Lettres manquantes…" />
      <button className="primary" type="submit" disabled={locked || !typed.trim()}><Check size={17}/> Vérifier</button>
    </form>}

    {mode === "matching" && <div className="pair-challenge">
      <p className="question-instruction">Sélectionne une question à gauche, puis sa réponse à droite. Trois associations à réussir !</p>
      <div className="pairs-columns">
        <div className="pair-column">
          {pairs.map(p=><button key={p.id} className={"pair-tile "+(activePrompt===p.id?"pair-active":"")+(matched.includes(p.id)?" pair-matched":"")}
            disabled={locked || matched.includes(p.id)} onClick={()=>setActivePrompt(p.id)}>{p.prompt}</button>)}
        </div>
        <div className="pair-column">
          {matchAnswers.map(a=><button key={a.id} className={"pair-tile "+(matched.includes(a.id)?"pair-matched":"")}
            disabled={locked || matched.includes(a.id) || !activePrompt} onClick={()=>selectPair(a.id)}>{a.label}</button>)}
        </div>
      </div>
      <p className="board-status">{matched.length}/3 paires trouvées {mistakes>0?"· Réessaie, tu peux y arriver !":""}</p>
    </div>}

    {mode === "memory" && <div className="memory-challenge">
      <p className="question-instruction">Retourne les cartes pour retrouver les trois paires question–réponse !</p>
      <div className="memory-board">
        {memoryCards.map((card,index)=>{
          const visible=memoryOpen.includes(index)||memorySolved.includes(card.pair);
          return <button key={index} className={"memory-tile "+(visible?"memory-visible":"")+(memorySolved.includes(card.pair)?" memory-solved":"")}
            disabled={locked || memoryWaiting || memorySolved.includes(card.pair)}
            onClick={()=>turnCard(index)} aria-label={visible?card.label:"Carte cachée "+(index+1)}>
            {visible?card.label:"❔"}
          </button>;
        })}
      </div>
      <p className="board-status">{memorySolved.length}/3 paires retrouvées {mistakes>0?"· Continue !":""}</p>
    </div>}

    {mode === "numberline" && <div className="number-challenge">
      <p className="question-instruction">Déplace le curseur jusqu'au bon résultat puis valide.</p>
      <div className="chosen-number">{range}</div>
      <input aria-label="Choisir un nombre de 0 à 100" type="range" min={0} max={100} step={1}
        value={range} disabled={locked} onChange={e=>setRange(Number(e.target.value))}/>
      <div className="range-labels"><span>0</span><span>50</span><span>100</span></div>
      <button className="primary" disabled={locked}
        onClick={()=>onAnswer(range===Number(expected),"range:"+range)}><Check size={17}/> Valider {range}</button>
    </div>}

    {mode === "write" && question.subject==="dutch" && <button type="button" className="listen-btn" onClick={()=>speak(question.prompt,true)}><Volume2 size={17}/> Écouter la question</button>}
  </section>;
}
