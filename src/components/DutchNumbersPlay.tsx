import { useRef,useState } from "react";
import type {KeyboardEvent} from "react";
import {checkDutchNumber,makeDutchNumberSession,numberHint,numberToDutch} from "../games/dutchNumbers";
import type {NumberDirection,NumberLevel,NumberPractice,NumberQuestion} from "../games/dutchNumbers";
import type {GameCallbacks} from "./gameTypes";
export default function DutchNumbersPlay({onClose,onAttempt,onComplete,onRoundStart}:GameCallbacks){
 const [screen,setScreen]=useState<"setup"|"play"|"result">("setup");
 const [level,setLevel]=useState<NumberLevel>("all"),[direction,setDirection]=useState<NumberDirection>("mixed");
 const [count,setCount]=useState(10),[practice,setPractice]=useState<NumberPractice>("normal");
 const [session,setSession]=useState<NumberQuestion[]>([]),[index,setIndex]=useState(0);
 const [correct,setCorrect]=useState(0),[stars,setStars]=useState(0);
 const [typed,setTyped]=useState(""),[answered,setAnswered]=useState(false);
 const [failed,setFailed]=useState(false),[hadHint,setHadHint]=useState(false);
 const [mistakes,setMistakes]=useState<NumberQuestion[]>([]),[feedback,setFeedback]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const lock=useRef(false);
 const question=session[index];
 function start(items?:NumberQuestion[]){
  onRoundStart();
  setSession(items??makeDutchNumberSession(level,direction,count,practice));
  setIndex(0);setCorrect(0);setMistakes([]);setScreen("play");
  reset();
 }
 function reset(){setTyped("");setAnswered(false);setFailed(false);setHadHint(false);setFeedback("");setError("");setBusy(false);lock.current=false}
 async function check(){
  if(!question||answered||busy||lock.current)return;
  const value=typed.trim();
  if(!value){setFeedback("✏️ Schrijf eerst een antwoord!");return}
  if(!checkDutchNumber(value,question)){
   if(!failed)setMistakes(previous=>[...previous,question]);
   setFailed(true);setFeedback("🔍 Bijna! Probeer opnieuw. "+(question.mode==="number"?"Denk aan de waarde van het getal.":"Let op de spelling en de volgorde."));
   return;
  }
  lock.current=true;setBusy(true);
  const firstTry=!failed;
  try{
   await onAttempt("getallenheld-"+index+"-"+question.n+"-"+question.mode,firstTry&&!hadHint);
   if(firstTry){setCorrect(c=>c+1);setStars(s=>s+(hadHint?1:2))}
   setAnswered(true);
   setFeedback("🎉 Super! Het juiste antwoord is "+question.n+" = "+numberToDutch(question.n)+".");
  }catch{lock.current=false;setError("Opslaan is niet gelukt. Probeer opnieuw.")}
  finally{setBusy(false)}
 }
 function hint(){if(!question||answered||busy)return;setHadHint(true);setFeedback("💡 "+numberHint(question))}
 async function next(){
  if(!answered||busy)return;
  if(index+1<session.length){setIndex(i=>i+1);reset();return}
  setBusy(true);setError("");
  try{await onComplete(correct,session.length);setScreen("result")}
  catch{setError("Het resultaat kon niet worden opgeslagen. Probeer opnieuw.")}
  finally{setBusy(false)}
 }
 function onKey(event:KeyboardEvent<HTMLInputElement>){if(event.key==="Enter"){event.preventDefault();if(answered)void next();else void check()}}
 return <section className="imported-activity numbers-activity" lang="nl-BE">
  <button type="button" className="back-link" onClick={onClose}>← Terug naar Wiskunde</button>
  <header className="game-hero numbers"><div className="game-hero-icon">🦊</div><div><span className="eyebrow">OEFENEN IS LEUK!</span><h1>Getallenheld ⭐</h1><p>Leer Nederlandse getallen van 0 tot 1000</p></div><span className="star-pill">⭐ {stars} sterren</span></header>
  {screen==="setup"&&<section className="imported-card">
    <h2>🎮 Kies je oefening</h2>
    <div className="number-settings">
      <label>Moeilijkheid
       <select value={level} onChange={e=>setLevel(e.target.value as NumberLevel)}>
        <option value="easy">🌱 Beginner · 0–20</option><option value="medium">🌿 Gevorderd · 21–100</option>
        <option value="hard">🚀 Uitdaging · 101–1000</option><option value="all">🌈 Alles door elkaar · 0–1000</option>
       </select>
      </label>
      <label>Soort oefening
       <select value={direction} onChange={e=>setDirection(e.target.value as NumberDirection)}>
        <option value="number">🔢 Woorden → cijfers</option><option value="words">✍️ Cijfers → woorden</option>
        <option value="mixed">🔀 Allebei door elkaar</option>
       </select>
      </label>
      <label>Aantal vragen
       <select value={count} onChange={e=>setCount(Number(e.target.value))}>
        {[5,10,15,20].map(c=><option key={c} value={c}>{c} vragen</option>)}
       </select>
      </label>
      <label>Extra oefenen
       <select value={practice} onChange={e=>setPractice(e.target.value as NumberPractice)}>
        <option value="normal">Willekeurige getallen</option><option value="tricky">Lastige getallen (met tientallen)</option>
       </select>
      </label>
    </div>
    <div className="imported-actions"><button type="button" className="primary" onClick={()=>start()}>▶ Start het spel</button></div>
    <div className="lesson-tip">💡 <strong>Tip:</strong> Lees elk getal hardop voordat je antwoordt. Bij 42 zeg je tweeënveertig — eerst de eenheden, dan de tientallen!</div>
    <details className="game-tip"><summary>📚 Spiekbriefje: hoe schrijf je getallen?</summary>
     <p><b>1–10:</b> één, twee, drie, vier, vijf, zes, zeven, acht, negen, tien.</p>
     <p><b>11–20:</b> elf, twaalf, dertien, veertien, vijftien, zestien, zeventien, achttien, negentien, twintig.</p>
     <p><b>Tientallen:</b> dertig, veertig, vijftig, zestig, zeventig, tachtig, negentig.</p>
     <p><b>Voorbeelden:</b> 21 = eenentwintig, 32 = tweeëndertig, 75 = vijfenzeventig, 106 = honderdzes, 342 = driehonderdtweeënveertig, 1000 = duizend.</p>
     <p>Let op de puntjes: <b>tweeën</b> en <b>drieën</b>. Schrijf samengestelde getallen als één woord.</p>
    </details>
   </section>}
  {screen==="play"&&question&&<section className="imported-card">
    <div className="game-subtitle"><span>Vraag {index+1} / {session.length}</span><span>✅ {correct} meteen goed</span></div>
    <div className="quiz-track"><span style={{width:(index/session.length*100)+"%"}}/></div>
    <div className="number-question"><p>{question.mode==="number"?"Schrijf dit in cijfers 🔢":"Schrijf dit in Nederlandse letters ✍️"}</p><h2>{question.mode==="number"?numberToDutch(question.n):question.n}</h2></div>
    <div className="number-answer">
     <label htmlFor="kidquest-dutch-number-answer">{question.mode==="number"?"Welk getal is dit?":"Hoe schrijf je dit getal?"}</label>
     <input id="kidquest-dutch-number-answer" autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      inputMode={question.mode==="number"?"numeric":"text"} value={typed} disabled={answered||busy}
      placeholder={question.mode==="number"?"Bijvoorbeeld: 42":"Bijvoorbeeld: tweeënveertig"}
      onKeyDown={onKey} onChange={e=>setTyped(e.target.value)}/>
    </div>
    <p className={"imported-feedback "+(answered?"success":"")} role="status">{error||feedback}</p>
    <div className="imported-actions">
     {!answered&&<><button type="button" className="primary" disabled={busy} onClick={()=>{void check()}}>✔ Controleer</button>
      <button type="button" className="secondary" disabled={busy} onClick={hint}>💡 Hint</button></>}
     {answered&&<button type="button" className="primary" disabled={busy} onClick={()=>{void next()}}>Volgende ➜</button>}
     <button type="button" className="secondary" onClick={()=>setScreen("setup")}>↩ Menu</button>
    </div>
   </section>}
  {screen==="result"&&<section className="imported-card imported-result">
    <div className="big-emoji">{correct===session.length?"🏆":correct>=session.length*.6?"🌟":"💪"}</div>
    <h2>{correct===session.length?"Fantastisch! Alles goed!":"Goed geoefend!"}</h2>
    <p>Je hebt {correct} van de {session.length} vragen meteen goed beantwoord. Blijf oefenen, dan word je een getallenheld!</p>
    <div className="result-stats"><div><span>✅</span><b>{correct}/{session.length}</b><small>meteen goed</small></div><div><span>⭐</span><b>{stars}</b><small>sterren totaal</small></div></div>
    {mistakes.length>0&&<div className="mistake-list"><p>Deze getallen kun je nog eens oefenen:</p>
      <ul>{mistakes.map((q,i)=><li key={i}>{q.n} = {numberToDutch(q.n)}</li>)}</ul>
    </div>}
    <div className="imported-actions">
      <button type="button" className="primary" onClick={()=>start()}>🔄 Opnieuw oefenen</button>
      <button type="button" className="secondary" onClick={()=>setScreen("setup")}>⚙ Andere oefening</button>
      {mistakes.length>0&&<button type="button" className="primary" onClick={()=>start(mistakes)}>🎯 Oefen de foutjes opnieuw</button>}
    </div>
   </section>}
 </section>;
}
