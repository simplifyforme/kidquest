import {useEffect,useRef,useState} from "react";
import type {FormEvent} from "react";
import {bodyWords,bodyGap,isBodyWord,makeBodyRound,makeBodyMemory,memoryPair,shuffled} from "../games/bodyAdventure";
import type {BodyChallenge,BodyMemoryCard,BodyMode,BodyWord} from "../games/bodyAdventure";
import type {GameCallbacks} from "./gameTypes";
import {createAdventureRecorder} from "../games/adventureRecorder";
import "./adventures.css";
const images=import.meta.glob<string>("../../site/activities/lichaamsdelen-nl/assets/*.png",{eager:true,query:"?url",import:"default"});
export function BodyPicture({word,small=false}:{word:BodyWord;small?:boolean}){
 return <img className={"adventure-picture "+(small?"small":"")} src={images[`../../site/activities/lichaamsdelen-nl/assets/${word.id}.png`]} alt={word.fr+" : partie indiquée en rouge"}/>;
}
type Mode=BodyMode|"learn"|"memory"|"mixed";
const modes:[Mode,string][]=[["learn","🔎 Découvrir"],["quiz","🎯 Trouver"],["write","✏️ Écrire"],["gaps","🕵️ Mot troué"],["letters","🧩 Lettres"],["memory","🃏 Memory"],["mixed","🏆 Grand défi"]];
function say(word:string){if(!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(word);u.lang="nl-BE";u.rate=.8;window.speechSynthesis.speak(u)}
export default function BodyAdventurePlay(props:GameCallbacks){
 const [mode,setMode]=useState<Mode>("learn"),[round,setRound]=useState<BodyChallenge[]>([]),[roundKey,setRoundKey]=useState(0),[busy,setBusy]=useState(false);
 function start(next:Mode,items?:BodyChallenge[]){if(busy)return;if("speechSynthesis"in window)window.speechSynthesis.cancel();setMode(next);setRound(items??(next!=="learn"&&next!=="memory"?makeBodyRound(next):[]));setRoundKey(k=>k+1);if(next!=="learn")props.onRoundStart()}
 useEffect(()=>()=>{if("speechSynthesis"in window)window.speechSynthesis.cancel()},[]);
 return <section className="imported-activity adventure body-adventure" lang="fr-BE">
  <button className="back-link" disabled={busy} onClick={props.onClose}>← Nederlands — École</button>
  <header className="adventure-hero"><div><small>NEDERLANDS · AVENTURE</small><h1>🧍 Mission corps humain</h1><p>Regarde, écoute et joue !</p></div><span className="adventure-badge">24 mots · sans de/het</span></header>
  <nav className="adventure-menu" aria-label="Mini-jeux du corps humain">{modes.map(([id,title])=><button key={id} disabled={busy} aria-pressed={mode===id} onClick={()=>start(id)}>{title}</button>)}</nav>
  {mode==="learn"?<section className="adventure-card"><h2>Mes mots du corps</h2><p>Touche une image pour écouter.</p><div className="adventure-discovery">{bodyWords.map(word=><button key={word.id} onClick={()=>say(word.nl)}><BodyPicture word={word} small/><b lang="nl-BE">{word.nl} 🔊</b><small>{word.fr}</small></button>)}</div><button className="primary" onClick={()=>start("quiz")}>🎯 Première mission</button></section>:
   mode==="memory"?<BodyMemory key={roundKey} {...props} onBusy={setBusy} onReplay={()=>start("memory")}/>:
   <BodyRound key={roundKey} {...props} challenges={round} onBusy={setBusy} onReplay={()=>start(mode)} onReview={items=>start(mode,items)} onMixed={()=>start("mixed")}/>}
 </section>;
}
type RoundProps=GameCallbacks&{challenges:BodyChallenge[];onBusy:(v:boolean)=>void;onReplay:()=>void;onReview:(items:BodyChallenge[])=>void;onMixed:()=>void};
function BodyRound({challenges,onAttempt,onComplete,onBusy,onReplay,onReview,onMixed}:RoundProps){
 const [position,setPosition]=useState(0),[typed,setTyped]=useState(""),[answered,setAnswered]=useState(false),[finished,setFinished]=useState(false),[feedback,setFeedback]=useState("");
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[missed,setMissed]=useState<BodyChallenge[]>([]),[wrong,setWrong]=useState<string[]>([]),[picked,setPicked]=useState<number[]>([]);
 const recorder=useRef(createAdventureRecorder()),inputRef=useRef<HTMLInputElement>(null),nextRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{inputRef.current?.focus()},[position]);
 useEffect(()=>{if(answered)nextRef.current?.focus()},[answered]);
 const item=challenges[position],help=useRef(false),lock=useRef(false),done=useRef(false),tries=useRef(0);
 const [tiles,setTiles]=useState(()=>shuffled(Array.from(item.word.nl).map((letter,id)=>({letter,id}))));
 function working(v:boolean){setBusy(v);onBusy(v)}
 function reset(next:BodyChallenge){setTyped("");setPicked([]);setTiles(shuffled(Array.from(next.word.nl).map((letter,id)=>({letter,id}))));setAnswered(false);setFeedback("");setWrong([]);setError("");help.current=false;lock.current=false;tries.current=0}
 async function solved(){if(lock.current||answered)return;lock.current=true;working(true);setError("");
  try{await recorder.current.run(item.id,()=>onAttempt(item.id,!help.current));if(help.current)setMissed(a=>[...a,item]);setAnswered(true);setFeedback("🌟 Bravo ! "+item.word.fr+" = "+item.word.nl)}
  catch{lock.current=false;setError("Sauvegarde impossible. Réessaie.")}
  finally{working(false)}
 }
 function check(value:string){if(lock.current||answered||busy)return;if(!value.trim()){setFeedback("Écris un mot 😊");return}
  if(isBodyWord(value,item.word.nl)){void solved();return}
  help.current=true;tries.current++;setWrong(a=>a.includes(value)?a:[...a,value]);setFeedback(tries.current<2?"💪 Essaie encore !":"💡 Le mot est « "+item.word.nl+" ». À toi !");
 }
 function hint(){help.current=true;setFeedback("💡 "+item.word.nl.slice(0,2)+"… · "+item.word.nl.length+" lettres")}
 async function next(){if(busy||!answered||done.current)return;if(position+1<challenges.length){const n=position+1;setPosition(n);reset(challenges[n]);return}
  done.current=true;working(true);setError("");try{await recorder.current.run("complete",()=>onComplete(challenges.length-missed.length,challenges.length));setFinished(true)}catch{done.current=false;setError("Le résultat n’a pas été enregistré. Réessaie.")}finally{working(false)}
 }
 function submit(e:FormEvent){e.preventDefault();check(typed)}
 if(finished)return <section className="adventure-card adventure-result"><div className="adventure-trophy">🏆</div><h2>Mission réussie !</h2><p>{challenges.length} défis résolus · {challenges.length-missed.length} sans aide</p><div className="imported-actions"><button className="primary" onClick={onReplay}>🔄 Nouveau mélange</button>{missed.length>0&&<button className="secondary" onClick={()=>onReview(missed)}>💪 Revoir mes difficultés</button>}<button className="secondary" onClick={onMixed}>🏆 Grand défi</button></div></section>;
 return <section className="adventure-card adventure-question"><div className="adventure-counter"><span>Défi {position+1} / {challenges.length}</span><span>⭐ {position+(answered?1:0)} résolus</span></div><progress aria-label="Progression" value={position+(answered?1:0)} max={challenges.length}/>
  <h2>{item.mode==="quiz"?"Trouve le mot !":item.mode==="letters"?"Assemble les lettres !":item.mode==="gaps"?"Complète le mot !":"Écris le mot !"}</h2>
  <BodyPicture word={item.word}/><p className="adventure-cue">{item.word.fr}</p>
  {item.mode==="quiz"?<div className="adventure-options">{item.choices.map(word=><button key={word} lang="nl-BE" disabled={answered||busy||wrong.includes(word)} onClick={()=>check(word)}>{word}</button>)}</div>:
   item.mode==="letters"?<div><div className="adventure-slots" aria-live="polite">{picked.length?picked.map(id=>tiles.find(t=>t.id===id)!.letter).join(""):"…"}</div><div className="adventure-tiles">{tiles.map(t=><button key={t.id} disabled={answered||busy||picked.includes(t.id)} onClick={()=>setPicked(a=>[...a,t.id])}>{t.letter}</button>)}</div><div className="imported-actions"><button className="secondary" disabled={answered||busy||!picked.length} onClick={()=>setPicked(a=>a.slice(0,-1))}>⌫ Effacer</button><button className="primary" disabled={answered||busy||picked.length!==tiles.length} onClick={()=>check(picked.map(id=>tiles.find(t=>t.id===id)!.letter).join(""))}>Vérifier</button></div></div>:
   <form className="adventure-form" onSubmit={submit}>{item.mode==="gaps"&&<p className="adventure-holes" aria-label="Mot à compléter">{bodyGap(item.word.nl)}</p>}<label htmlFor="body-word">Le mot en néerlandais</label><div><input ref={inputRef} id="body-word" value={typed} onChange={e=>setTyped(e.target.value)} disabled={answered||busy} autoComplete="off" autoCapitalize="off" spellCheck={false}/><button className="primary" disabled={answered||busy||!typed.trim()}>Vérifier</button></div></form>}
  {!answered&&<div className="imported-actions"><button className="secondary" disabled={busy} onClick={hint}>💡 Indice</button><button className="secondary" disabled={busy} onClick={()=>{help.current=true;say(item.word.nl);setFeedback("🔊 Écoute, puis essaie.")}}>🔊 Écouter</button></div>}
  <p className={"adventure-feedback "+(answered?"good":"")} role="status">{error||feedback}</p>
  {answered&&<button ref={nextRef} className="primary" disabled={busy} onClick={()=>{void next()}}>{position+1===challenges.length?"Voir mon résultat →":"Suivant →"}</button>}
 </section>;
}
type MemoryProps=GameCallbacks&{onBusy:(v:boolean)=>void;onReplay:()=>void};
function BodyMemory({onAttempt,onComplete,onBusy,onReplay}:MemoryProps){
 const [cards]=useState(()=>makeBodyMemory()),[open,setOpen]=useState<string[]>([]),[matched,setMatched]=useState<string[]>([]),[busy,setBusy]=useState(false),[finished,setFinished]=useState(false),[feedback,setFeedback]=useState("");
 const recorder=useRef(createAdventureRecorder());
 const errors=useRef(new Set<string>()),perfect=useRef(0),lock=useRef(false),done=useRef(false),timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current)},[]);
 function working(v:boolean){setBusy(v);onBusy(v)}
 async function flip(card:BodyMemoryCard){if(lock.current||busy||matched.includes(card.word.id)||open.includes(card.key))return;
  if(!open.length){setOpen([card.key]);return}
  lock.current=true;const first=cards.find(c=>c.key===open[0])!;setOpen([first.key,card.key]);
  if(memoryPair(first,card)){working(true);try{const right=!errors.current.has(card.word.id);await recorder.current.run(card.word.id,()=>onAttempt("adventure-memory-"+card.word.id,right));if(right)perfect.current++;setMatched(a=>[...a,card.word.id]);setOpen([]);setFeedback("🌟 "+card.word.fr+" = "+card.word.nl);lock.current=false}catch{setFeedback("Sauvegarde impossible. Retourne les cartes pour réessayer.");setOpen([]);lock.current=false}finally{working(false)}}
  else{errors.current.add(first.word.id);errors.current.add(card.word.id);setFeedback("💪 Observe bien. Tu peux réessayer !");timeout.current=setTimeout(()=>{setOpen([]);lock.current=false},1000)}
 }
 async function finish(){if(done.current||busy)return;done.current=true;working(true);try{await recorder.current.run("complete",()=>onComplete(perfect.current,6));setFinished(true)}catch{done.current=false;setFeedback("Sauvegarde impossible. Réessaie.")}finally{working(false)}}
 if(finished)return <section className="adventure-card adventure-result"><div className="adventure-trophy">🏆</div><h2>Toutes les paires trouvées !</h2><p>6 paires · {perfect.current} sans erreur</p><button className="primary" onClick={onReplay}>🔄 Nouveau memory</button></section>;
 return <section className="adventure-card"><h2>🃏 Retrouve les paires</h2><p>Une image + son mot néerlandais.</p><p className="adventure-cue">⭐ {matched.length} / 6 paires</p><div className="adventure-memory">{cards.map((card,i)=>{const visible=open.includes(card.key)||matched.includes(card.word.id);return <button key={card.key} className={matched.includes(card.word.id)?"matched":""} disabled={busy||matched.includes(card.word.id)} aria-label={visible?(card.kind==="word"?card.word.nl:card.word.fr):"Carte cachée "+(i+1)} onClick={()=>{void flip(card)}}>{visible?(card.kind==="picture"?<BodyPicture word={card.word} small/>:<span lang="nl-BE">{card.word.nl}</span>):"?"}</button>})}</div><p className="adventure-feedback" role="status">{feedback}</p>{matched.length===6&&<button className="primary" disabled={busy} onClick={()=>{void finish()}}>🏆 Terminer</button>}</section>;
}
