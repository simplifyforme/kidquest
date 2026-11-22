import { useEffect,useRef,useState } from "react";
import type {FormEvent} from "react";
import {verbMissions,verbLessonNotes,normalizeVerbAnswer,verbAdventureTips,makeVerbAdventureRound} from "../games/verbData";
import type {VerbQuestion} from "../games/verbData";
import "./adventures.css";
import {createAdventureRecorder} from "../games/adventureRecorder";
import type {GameCallbacks} from "./gameTypes";

function HighlightedText({value}:{value:string}){
 const pieces=value.split(/(<mark>.*?<\/mark>)/g);
 return <>{pieces.map((piece,index)=>piece.startsWith("<mark>")&&piece.endsWith("</mark>")?
  <mark key={index}>{piece.slice(6,-7)}</mark>:<span key={index}>{piece}</span>)}</>;
}
export default function VerbPlay({onClose,onAttempt,onComplete,onRoundStart}:GameCallbacks){
 const [lesson,setLesson]=useState(true),[tip,setTip]=useState(0);
 const [mission,setMission]=useState(0),[screen,setScreen]=useState<"intro"|"play"|"result">("intro");
 const [round,setRound]=useState<VerbQuestion[]>(verbMissions[0].questions),[position,setPosition]=useState(0);
 const [mistakes,setMistakes]=useState<VerbQuestion[]>([]),[neededHelp,setNeededHelp]=useState(false);
 const [answered,setAnswered]=useState(false),[typed,setTyped]=useState("");
 const [feedback,setFeedback]=useState(""),[wrongOptions,setWrongOptions]=useState<string[]>([]);
 const [hintStep,setHintStep]=useState(0),[review,setReview]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const tries=useRef(0),inputRef=useRef<HTMLInputElement>(null),nextRef=useRef<HTMLButtonElement>(null);
 const lock=useRef(false),recorder=useRef(createAdventureRecorder());
 const current=verbMissions[mission],item=round[position];
 useEffect(()=>{if(screen==="play"&&!lesson)inputRef.current?.focus()},[position,screen,lesson]);
 useEffect(()=>{if(answered)nextRef.current?.focus()},[answered]);
 function select(index:number){if(busy)return;setLesson(false);setMission(index);setRound(verbMissions[index].questions);setScreen("intro");setError("");setBusy(false);lock.current=false}
 function start(questions=current.questions,onlyMistakes=false){
  onRoundStart();recorder.current=createAdventureRecorder();setRound(onlyMistakes?[...questions]:makeVerbAdventureRound(current));setPosition(0);setMistakes([]);setReview(onlyMistakes);
  resetQuestion();setScreen("play");
 }
 function resetQuestion(){
  tries.current=0;  setNeededHelp(false);setAnswered(false);setTyped("");setFeedback("");setWrongOptions([]);setHintStep(0);setBusy(false);setError("");lock.current=false;
 }
 async function finishQuestion(answerFromChild:boolean){
  if(lock.current||answered||busy)return;
  lock.current=true;setBusy(true);setError("");
  const perfect=!neededHelp&&answerFromChild;
  try{
   const id=(item.id??("verbs-"+current.id+"-"+position))+(review?"-retry":"");
   await recorder.current.run(id,()=>onAttempt(id,perfect));
   if(!perfect)setMistakes(previous=>[...previous,item]);
   setAnswered(true);setFeedback("✨ Bravo ! "+item.explanation);
  }catch{setError("Sauvegarde impossible. Réessaie.");lock.current=false}
  finally{setBusy(false)}
 }
 function check(value:string){
  if(answered||busy||lock.current)return;
  if(!normalizeVerbAnswer(value))return;
  if(normalizeVerbAnswer(value)===normalizeVerbAnswer(item.answer)){
   void finishQuestion(true);return;
  }
  setNeededHelp(true);tries.current++;
  setFeedback(tries.current>=2?"💡 "+item.explanation+" À toi !":"💪 Essaie encore. "+item.hint);setHintStep(1);
  if(item.options)setWrongOptions(a=>a.includes(value)?a:[...a,value]);
 }
 function showHint(){
  if(answered||busy)return;
  if(hintStep===0){setNeededHelp(true);setHintStep(1);setFeedback(item.hint)}
  else void finishQuestion(false);
 }
 async function next(){
  if(busy||!answered)return;
  if(position+1<round.length){setPosition(i=>i+1);resetQuestion();return}
  setBusy(true);setError("");
  try{await recorder.current.run("complete",()=>onComplete(round.length-mistakes.length,round.length));setScreen("result")}
  catch{setError("Le résultat n'a pas été enregistré. Réessaie.")}
  finally{setBusy(false)}
 }
 function submit(event:FormEvent){event.preventDefault();check(typed)}
 return <section className="imported-activity verbs-activity" lang="fr-BE">
  <button type="button" className="back-link" disabled={busy} onClick={onClose}>← Retour au Français</button>
  <header className="game-hero verbs"><div className="game-hero-icon">🔎</div><div><span className="eyebrow">FRANÇAIS · GRAMMAIRE</span><h1>La chasse aux verbes</h1><p>Touche les mots, transforme et gagne des étoiles !</p></div></header>
  <div className="mini-game-menu" role="group" aria-label="Missions">
   <button type="button" disabled={busy} aria-pressed={lesson} className={lesson?"selected":""} onClick={()=>setLesson(true)}>📖 Mes astuces</button>
   {verbMissions.map((g,i)=><button type="button" disabled={busy} key={g.id} aria-pressed={!lesson&&i===mission} className={!lesson&&i===mission?"selected":""} onClick={()=>select(i)}>{g.name}</button>)}
  </div>
  {lesson&&<section className="adventure-card adventure-lesson"><small>Astuce {tip+1} / {verbAdventureTips.length}</small><h2>{verbAdventureTips[tip].title}</h2><p>{verbAdventureTips[tip].text}</p><p className="adventure-example">{verbAdventureTips[tip].example}</p><div className="imported-actions"><button className="secondary" disabled={tip===0} onClick={()=>setTip(i=>i-1)}>← Avant</button><button className="secondary" disabled={tip===verbAdventureTips.length-1} onClick={()=>setTip(i=>i+1)}>Après →</button><button className="primary" onClick={()=>select(0)}>🔎 Première mission</button></div></section>}
  {!lesson&&<><details className="game-tip"><summary>💡 Mon aide-mémoire</summary>
   <div className="notes-list">{verbLessonNotes.map((note,i)=><p key={i}>{note}</p>)}</div>
  </details>
  {screen==="intro"&&<section className="imported-card"><span className="big-emoji">🕵️</span><h2>{current.title}</h2><p>{current.intro}</p><button className="primary" type="button" onClick={()=>start()}>C’est parti !</button></section>}
  {screen==="play"&&item&&<section className="imported-card">
    <div className="game-subtitle"><span>{review?"Révision · ":""}{current.title}</span><span>{position+1} / {round.length} · ⭐ {position+(answered?1:0)} résolus</span></div>
    <div className="quiz-track"><span style={{width:(position/round.length*100)+"%"}}/></div>
    <h2>{item.question}</h2>
    {item.interaction!=="sentence"&&<p className="imported-question emphasized"><HighlightedText value={item.prompt}/></p>}
    {item.options?<div className={item.interaction==="sentence"?"adventure-sentence":"imported-options"}>
      {item.options.map(option=><button type="button" key={option} disabled={answered||busy||wrongOptions.includes(option)} onClick={()=>check(option)}
       className={wrongOptions.includes(option)?"wrong":answered&&option===item.answer?"right":""}>{option}</button>)}
    </div>:<form className="imported-form" onSubmit={submit}>
      <input ref={inputRef} aria-label="Ton infinitif" placeholder="Écris ton infinitif" autoComplete="off" spellCheck={false}
       value={typed} onChange={e=>setTyped(e.target.value)} disabled={answered||busy}/>
      <button type="submit" className="primary" disabled={answered||busy||!typed.trim()}>Valider</button>
    </form>}
    <p className={"imported-feedback "+(answered?"success":"")} role="status">{error||feedback}</p>
    <div className="imported-actions">
      {!answered&&<button type="button" className="secondary" disabled={busy} onClick={showHint}>💡 {hintStep===0?"Un indice":"Voir la réponse"}</button>}
      {answered&&<button ref={nextRef} type="button" className="primary" disabled={busy} onClick={()=>{void next()}}>{position+1===round.length?"Voir mon résultat →":"Suivant →"}</button>}
    </div>
   </section>}
  {screen==="result"&&<section className="imported-card imported-result">
    <div className="big-emoji">{mistakes.length?"🌟":"🏅"}</div><h2>{mistakes.length?"Mission terminée !":"Mission réussie sans aide !"}</h2>
    <p>{round.length-mistakes.length} sur {round.length} sans erreur ni indice.</p>
    <p><strong>À retenir à voix haute :</strong> {current.memory}</p>
    <div className="imported-actions">
      <button type="button" className="primary" onClick={()=>start()}>🔄 Rejouer</button>
      {mistakes.length>0&&<button type="button" className="primary" onClick={()=>start(mistakes,true)}>Rejouer les questions à revoir</button>}
      <button type="button" className="secondary" onClick={()=>select((mission+1)%verbMissions.length)}>{mission===verbMissions.length-1?"Retour à la première mission":"Mission suivante →"}</button>
    </div>
   </section>}
 </> }
 </section>;
}
