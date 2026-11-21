import { useEffect,useMemo,useRef,useState } from "react";
import type {FormEvent} from "react";
import {plantGames,isPlantAnswerCorrect,plantSteps} from "../games/plantData";
import type {PlantItem} from "../games/plantData";
import type {GameCallbacks} from "./gameTypes";

function shuffle<T>(values:T[]):T[]{
 const shuffled=[...values];
 for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
 return shuffled;
}
export default function PlantPlay({onClose,onAttempt,onComplete,onRoundStart}:GameCallbacks){
 const [gameIndex,setGameIndex]=useState(0),[deck,setDeck]=useState<PlantItem[]>(()=>shuffle(plantGames[0].items));
 const [index,setIndex]=useState(0),[firstTry,setFirstTry]=useState(0);
 const [mistakes,setMistakes]=useState(0),[picked,setPicked]=useState<string[]>([]);
 const [typed,setTyped]=useState(""),[feedback,setFeedback]=useState(""),[answered,setAnswered]=useState(false);
 const [busy,setBusy]=useState(false),[finished,setFinished]=useState(false),[saveError,setSaveError]=useState("");
 const lock=useRef(false);
 const game=plantGames[gameIndex],item=deck[index];
 const ordered=useMemo(()=>item?shuffle(plantSteps(item)):[],[item,gameIndex,index]);
 useEffect(()=>{lock.current=false},[index,gameIndex]);
 function begin(id:number){
  onRoundStart();
  setGameIndex(id);setDeck(shuffle(plantGames[id].items));setIndex(0);setFirstTry(0);
  setMistakes(0);setPicked([]);setTyped("");setFeedback("");setAnswered(false);
  setFinished(false);setSaveError("");setBusy(false);lock.current=false;
 }
 async function solve(){
  if(lock.current||busy||answered)return;
  lock.current=true;setBusy(true);setSaveError("");
  const success=mistakes===0;
  try{
   await onAttempt("plant-"+game.id+"-"+index,success);
   if(success)setFirstTry(x=>x+1);
   setAnswered(true);setFeedback("Goed gedaan! Je krijgt een blaadje. 🍃");
  }catch{setSaveError("Opslaan is niet gelukt. Probeer opnieuw.");lock.current=false;}
  finally{setBusy(false)}
 }
 function wrong(){
  setMistakes(m=>m+1);setFeedback("Probeer opnieuw. Lees de aanwijzing nog eens.");
 }
 function choice(value:string){
  if(busy||answered)return;
  if(value===item.answer)void solve();else wrong();
 }
 function order(value:string){
  if(busy||answered||picked.includes(value))return;
  const correct=plantSteps(item)[picked.length];
  if(value!==correct){setMistakes(m=>m+1);setFeedback("Dat komt op een ander moment. Probeer opnieuw.");return}
  const next=[...picked,value];setPicked(next);
  if(next.length===plantSteps(item).length)void solve();
  else setFeedback("Goed! Wat komt daarna?");
 }
 function write(event:FormEvent){
  event.preventDefault();if(busy||answered||!typed.trim())return;
  if(isPlantAnswerCorrect(item,typed))void solve();
  else{setMistakes(m=>m+1);setFeedback(mistakes===0?"Bijna! Lees de zin nog eens.":"Hint: het woord begint met "+item.answer[0]+".")}
 }
 async function next(){
  if(busy||!answered)return;
  if(index+1<deck.length){
   setIndex(i=>i+1);setMistakes(0);setPicked([]);setTyped("");setFeedback("");setAnswered(false);setSaveError("");return;
  }
  setBusy(true);
  try{await onComplete(firstTry,deck.length);setFinished(true);setSaveError("");}
  catch{setSaveError("De resultaten konden niet worden opgeslagen. Probeer opnieuw.")}
  finally{setBusy(false)}
 }
 return <section className="imported-activity plant-activity" lang="nl-BE">
  <button type="button" className="back-link" onClick={onClose}>← Terug naar Natuur</button>
  <header className="game-hero plant"><div className="game-hero-icon">🌱</div><div><span className="eyebrow">NATUUR · LEREN EN SPELEN</span><h1>De plant · Speeltuin</h1><p>Kies een spel en laat je tuin groeien.</p></div></header>
  <div className="mini-game-menu" role="group" aria-label="Spellen">
   {plantGames.map((g,i)=><button type="button" key={g.id} aria-pressed={gameIndex===i}
    className={gameIndex===i?"selected":""} onClick={()=>begin(i)}>{g.title}</button>)}
  </div>
  <div className="imported-card">
   <div className="game-subtitle"><span>{finished?"Spel klaar!":"Opdracht "+(index+1)+" van "+deck.length}</span><span>🍃 {firstTry} goed bij de eerste poging</span></div>
   <div className="quiz-track"><span style={{width:((finished?deck.length:index)/deck.length*100)+"%"}}/></div>
   <h2>{game.title}</h2>
   {finished?<div className="imported-result"><div className="big-emoji">🌱 {"🍃".repeat(deck.length)}</div>
    <p>Je hebt alle {deck.length} opdrachten opgelost. {firstTry} lukten bij de eerste poging.</p>
    <button type="button" className="primary" onClick={()=>begin(gameIndex)}>Opnieuw spelen</button>
    <button type="button" className="secondary" onClick={()=>begin((gameIndex+1)%plantGames.length)}>Volgend spel →</button></div>
   :item&&<>
    <p className="imported-hint">{game.intro}</p>
    <p className="imported-question">{item.prompt}</p>
    {game.mode==="choice"&&<div className="imported-options">
      {shuffleOnce(item,game.options).map(option=><button type="button" key={option} disabled={answered||busy} onClick={()=>choice(option)}>{option}</button>)}
     </div>}
    {game.mode==="order"&&<div className="order-game">
     <ol className="order-slots">{plantSteps(item).map((_,i)=><li key={i} className={picked[i]?"filled":""}>{picked[i]??"…"}</li>)}</ol>
     <div className="imported-options">{ordered.map(value=><button type="button" key={value} disabled={answered||busy||picked.includes(value)} onClick={()=>order(value)}>{value}</button>)}</div>
    </div>}
    {game.mode==="write"&&<div>
      <form className="imported-form" onSubmit={write}>
       <input aria-label="Jouw antwoord" autoComplete="off" spellCheck={false} value={typed} onChange={e=>setTyped(e.target.value)} disabled={answered||busy} placeholder="Typ je antwoord…"/>
       <button type="submit" className="primary" disabled={answered||busy||!typed.trim()}>Kijk na</button>
      </form>
      <details className="game-tip"><summary>💡 Hint in het Frans</summary><p>{item.hint}</p></details>
     </div>}
    <p className={"imported-feedback "+(answered?"success":"")} role="status">{saveError||feedback}</p>
    <div className="imported-actions">
      {answered&&<button type="button" className="primary" disabled={busy} onClick={()=>{void next()}}>{index+1===deck.length?"Bekijk je tuin":"Volgende →"}</button>}
      <button type="button" className="secondary" onClick={()=>begin(gameIndex)}>Opnieuw spelen</button>
    </div>
   </>}
  </div>
  <details className="game-tip"><summary>Aide en français</summary><p>Choisis un jeu. Clique sur la bonne réponse ou écris-la, selon la consigne. Pour les étapes de croissance, clique sur les cartes dans l’ordre. Tu peux recommencer chaque jeu.</p></details>
 </section>;
}
/** Stable random choice order per item, not regenerated on each click. */
const optionsCache=new WeakMap<PlantItem,string[]>();
function shuffleOnce(item:PlantItem,options?:string[]):string[]{
 const original=options??plantSteps(item);
 let existing=optionsCache.get(item);
 if(!existing){existing=shuffle(original);optionsCache.set(item,existing)}
 return existing;
}
