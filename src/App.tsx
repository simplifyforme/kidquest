import { useEffect,useMemo,useRef,useState } from "react";
import { ArrowLeft,ArrowRight,BookOpen,ChevronRight,Download,Home,Medal,RefreshCw,RotateCcw,Settings,ShieldCheck,Sparkles,Star,Trophy,WifiOff,Volume2 } from "lucide-react";
import { builtinPacks } from "./data/builtin";
import { getPacks,getProgress,getCompletedSessions,saveCompletedSession,saveAnswer,DEFAULT_PROGRESS } from "./lib/storage";
import { checkAppUpdate,checkContentUpdates,findPackId } from "./lib/updates";
import { getActivityQuestions,baseActivities } from "./lib/activities";
import type { Activity } from "./lib/activities";
import type { CompletedSession,ContentPack,Progress,Question,Result } from "./types";
import ExercisePlay from "./components/ExercisePlay";
import { planModes } from "./lib/exerciseModes";
import type { ExerciseMode } from "./lib/exerciseModes";
import { CATEGORIES, getCatalog, isMathSubject } from "./lib/catalog";
import type { CatalogEntry, CategoryId } from "./lib/catalog";
import { activityStats,formatDuration } from "./lib/activityHistory";
import AnimatedLessonPlayer from "./components/AnimatedLessonPlayer";
import { chessBeginnerLesson } from "./lessons/chessBeginner";

type Screen="home"|"category"|"quiz"|"result"|"settings"|"lesson";
const EMPTY:Progress={...DEFAULT_PROGRESS};
function shuffle<T>(a:T[]):T[]{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function badgeName(points:number){return points>=500?"Super explorateur":points>=200?"Champion des étoiles":points>=50?"Apprenti héros":"Explorateur débutant"}
function speech(text:string,forceLanguage?:"nl-BE"|"fr-BE"){if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=forceLanguage??(/\b(hallo|dag|dank|goed|rood|blauw|geel|groen|ik |hoe |fijne )/i.test(text)?"nl-BE":"fr-BE");u.rate=0.8;window.speechSynthesis.speak(u)}
export default function App(){
 const [screen,setScreen]=useState<Screen>("home");
 const [categoryId,setCategoryId]=useState<CategoryId>("math");
 const [lastOpened,setLastOpened]=useState<string|null>(()=>{try{return localStorage.getItem("kidquest.lastOpened.v1")}catch{return null}});
 const [packs,setPacks]=useState<ContentPack[]>(builtinPacks);
 const [progress,setProgress]=useState<Progress>(EMPTY);
 const [sessions,setSessions]=useState<CompletedSession[]>([]);
 const startedAtRef=useRef(new Date().toISOString());
 const sessionIdRef=useRef("");
 const recordingRef=useRef(false);
 const [loading,setLoading]=useState(true);
 const [activity,setActivity]=useState<Activity>(baseActivities[0]);
 const [questions,setQuestions]=useState<Question[]>([]);
 const [index,setIndex]=useState(0);
 const [selected,setSelected]=useState<string|null>(null);
 const [answerRight,setAnswerRight]=useState<boolean|null>(null);
 const [sessionPool,setSessionPool]=useState<Question[]>([]);
 const [modeSequence,setModeSequence]=useState<ExerciseMode[]>([]);
 const [totalCorrect,setTotalCorrect]=useState(0);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState<Result|null>(null);
 const [updateBusy,setUpdateBusy]=useState(false);
 const [sessionKey,setSessionKey]=useState(0);
 const level=Math.floor(progress.points/100)+1;
 const progressInLevel=progress.points%100;
 const allQuestions=useMemo(()=>packs.flatMap(p=>p.questions),[packs]);
 const catalog=useMemo(()=>getCatalog(packs),[packs]);
 const currentCategory=CATEGORIES.find(cat=>cat.id===categoryId)??CATEGORIES[0];
 const categoryEntries=catalog.filter(entry=>entry.category===categoryId);
 const recentEntry=catalog.find(entry=>entry.kind+":"+entry.id===lastOpened);
 const dutchMath=isMathSubject(activity.subject);
 const question=questions[index];
 const correct=answerRight===true;
 const mode=modeSequence[index] ?? "choice";
 const completed=questions.length>0&&index>=questions.length;
 useEffect(()=>{let cancelled=false;Promise.all([getPacks(),getProgress(),getCompletedSessions()]).then(([ps,pr,history])=>{if(!cancelled){setPacks(ps);setProgress(pr);setSessions(history)}}).catch(()=>{if(!cancelled)setMessage({kind:"error",message:"Impossible d'ouvrir le stockage. Les résultats risquent de ne pas être enregistrés."})}).finally(()=>{if(!cancelled)setLoading(false)});return ()=>{cancelled=true}},[]);
 useEffect(()=>{if(loading)return;const id=setTimeout(async()=>{const result=await checkContentUpdates();if(result.kind==="success"){setPacks(await getPacks());setMessage(result)}},1800);return ()=>clearTimeout(id)},[loading]);
 function newSession(){
  startedAtRef.current=new Date().toISOString();
  sessionIdRef.current=typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():"kidquest-"+Date.now()+"-"+Math.random().toString(36).slice(2);
  recordingRef.current=false;
 }
 async function recordCompletion(activityId:string,kind:"quiz"|"lesson",correctAnswers:number,totalQuestions:number){
  if(recordingRef.current)return;
  recordingRef.current=true;
  const completedAt=new Date().toISOString();
  const entry:CompletedSession={id:sessionIdRef.current,activityId,kind,startedAt:startedAtRef.current,completedAt,
   durationSeconds:Math.max(1,Math.ceil((Date.parse(completedAt)-Date.parse(startedAtRef.current))/1000)),correct:correctAnswers,total:totalQuestions};
  try{await saveCompletedSession(entry);setSessions(old=>old.some(item=>item.id===entry.id)?old:[entry,...old]);}
  catch(e){recordingRef.current=false;throw e}
 }
 function openCategory(id:CategoryId){setCategoryId(id);setMessage(null);setScreen("category")}
 function returnToCategory(){setScreen("category")}
 function openEntry(entry:CatalogEntry){
  setCategoryId(entry.category);
  const key=entry.kind+":"+entry.id;setLastOpened(key);
  try{localStorage.setItem("kidquest.lastOpened.v1",key)}catch{/* optional */}
  if(entry.kind==="quiz")start(entry.activity);
  else{newSession();setMessage(null);setScreen("lesson")}
 }
 function start(a:Activity){const pool=shuffle(getActivityQuestions(packs,a));if(!pool.length){setMessage({kind:"info",message:"Aucune question disponible pour cette activité."});return}
  newSession();
  const sessionQuestions=pool.slice(0,Math.min(8,pool.length)).map(q=>({...q,answers:shuffle(q.answers)}));
  setActivity(a);setSessionPool(pool);setQuestions(sessionQuestions);setModeSequence(planModes(sessionQuestions,pool,sessionKey+1));setIndex(0);setSelected(null);setAnswerRight(null);setTotalCorrect(0);setSessionKey(k=>k+1);setScreen("quiz");setMessage(null);
 }
 async function choose(right:boolean,answerId:string){
  if(selected!==null||busy||!question)return;
  setBusy(true);
  const now=new Date().toISOString();
  const next:Progress={...progress,points:progress.points+(right?10:0),attempted:progress.attempted+1,correct:progress.correct+(right?1:0),streak:right?progress.streak+1:0,bestStreak:Math.max(progress.bestStreak,right?progress.streak+1:0),lastPlayed:now};
  try{
   await saveAnswer(next,{questionId:question.id,correct:right,answerId,date:now,packId:findPackId(question.id,packs)});
   setProgress(next);setSelected(answerId);setAnswerRight(right);if(right)setTotalCorrect(c=>c+1);
  }catch{
   setMessage({kind:"error",message:"Erreur de sauvegarde. Réessaie ta réponse."});
  }finally{setBusy(false)}
 }
 async function next(){
  if(busy||recordingRef.current)return;
  if(index+1>=questions.length){
   setBusy(true);
   try{await recordCompletion(activity.packId,"quiz",totalCorrect,questions.length);setSelected(null);setAnswerRight(null);setIndex(questions.length);setScreen("result")}
   catch{setMessage({kind:"error",message:"Impossible d’enregistrer la partie terminée. Réessaie."})}
   finally{setBusy(false)}
  }else{setSelected(null);setAnswerRight(null);setIndex(i=>i+1)}
 }
 async function updates(){
  if(updateBusy)return;setUpdateBusy(true);setMessage(null);
  const content=await checkContentUpdates();
  if(content.kind==="success")setPacks(await getPacks());
  const app=await checkAppUpdate();
  setMessage({kind:content.kind==="success"?"success":app.kind==="error"?"error":"info",message:content.message+" "+app.message});
  setUpdateBusy(false);
 }
 return <div className="app">
  <div className="decoration deco-one"/><div className="decoration deco-two"/>
  <header className="topbar">
   <button className="brand" onClick={()=>setScreen("home")} aria-label="Retour à l'accueil"><span className="brand-icon">✦</span><span>Kid<span className="brand-accent">Quest</span></span></button>
   <div className="header-actions"><span className="offline-note"><ShieldCheck size={15}/> Mes jeux sont hors ligne</span><div className="points-pill"><Star size={18} fill="currentColor"/><b>{progress.points}</b><span>points</span></div><button className="icon-btn" title="Paramètres et mises à jour" onClick={()=>setScreen("settings")}><Settings size={21}/></button></div>
  </header>
  <main className="content" key={screen==="quiz"?`quiz-${sessionKey}`:screen}>
   {message&&<div className={`notice ${message.kind}`} role="status"><span>{message.message}</span><button onClick={()=>setMessage(null)} aria-label="Fermer">×</button></div>}
   {loading?<section className="loading"><Sparkles/> Préparation de ton académie…</section>:null}
   {!loading&&screen==="home"&&<>
    <section className="welcome"><div className="welcome-copy"><span className="eyebrow">✨ TON ACADÉMIE DES DÉCOUVERTES</span><h1>Prêt pour une nouvelle <em>aventure ?</em></h1><p>Choisis une matière pour découvrir les cours et les exercices !</p><div className="hero-chips"><span>🏆 Niveau {level}</span><span>🔥 {progress.streak} de suite</span><span>🎯 {progress.correct} réussites</span></div></div><div className="hero-illustration" aria-hidden="true"><span className="hero-orbit orbit1">⭐</span><span className="hero-orbit orbit2">✏️</span><span className="hero-orbit orbit3">💫</span><div className="hero-mascot">🦊</div><span className="hero-ground"/></div></section>
    {recentEntry&&<section className="recent-section"><span className="eyebrow">REPRENDRE</span><button className="recent-card" onClick={()=>openEntry(recentEntry)}><span className="recent-emoji">{recentEntry.emoji}</span><span><b>Continuer mon aventure</b><small>{recentEntry.title}</small></span><ArrowRight size={21}/></button></section>}
    <section className="section-head"><div><span className="eyebrow">MES MATIÈRES</span><h2>Qu'aimerais-tu apprendre ? <span>🚀</span></h2></div><span className="section-hint">{CATEGORIES.length} matières à explorer</span></section>
    <section className="category-grid">{CATEGORIES.map(cat=>{
      const count=catalog.filter(item=>item.category===cat.id).length;
      return <button key={cat.id} className={"category-card "+cat.colorClass} onClick={()=>openCategory(cat.id)}>
       <span className="category-emoji">{cat.emoji}</span><h3>{cat.title}</h3><p>{cat.subtitle}</p><div className="category-footer"><span>{count} {cat.id==="math"?(count===1?"oefening":"oefeningen"):(count===1?"activité":"activités")}</span><ArrowRight size={19}/></div>
      </button>;
    })}</section>
    <section className="bottom-panels"><div className="level-panel"><div className="panel-icon">🏅</div><div className="panel-copy"><h3>Niveau {level} · {badgeName(progress.points)}</h3><p>Encore {100-progressInLevel} points pour le niveau suivant !</p><div className="progress-track"><span style={{width:progressInLevel+"%"}}/></div></div><b>{progressInLevel}/100</b></div><div className="encourage-panel"><span>💡</span><div><b>Un petit défi chaque jour !</b><p>En t'entraînant régulièrement, tu deviens plus fort.</p></div></div></section>
   </>}
   {!loading&&screen==="category"&&<section className="catalog-page">
    <button className="back-link" onClick={()=>setScreen("home")}><ArrowLeft size={19}/>{categoryId==="math"?"Terug naar het begin":"Retour aux matières"}</button>
    <div className={"category-hero "+currentCategory.colorClass}><span className="category-hero-emoji">{currentCategory.emoji}</span><div><span className="eyebrow">{categoryId==="math"?"MIJN WISKUNDE":"MES DÉCOUVERTES"}</span><h1>{currentCategory.title}</h1><p>{currentCategory.subtitle}</p><span className="category-hero-count">{categoryEntries.length} {categoryId==="math"?"activiteiten":"activités"}</span></div></div>
    {categoryEntries.some(e=>e.kind==="lesson")&&<section className="catalog-section"><h2>🎓 {categoryId==="math"?"Leren":"Apprendre"}</h2><div className="catalog-activity-grid">{categoryEntries.filter(e=>e.kind==="lesson").map(entry=><button key={entry.id} className="catalog-activity-card course" onClick={()=>openEntry(entry)}><span className="catalog-entry-emoji">{entry.emoji}</span><div><span className="catalog-type">COURS ANIMÉ</span><h3>{entry.title}</h3><p>{entry.subtitle}</p><span className="catalog-played">🏅 {activityStats(sessions,entry.id).count} fois terminé</span></div><ChevronRight size={21}/></button>)}</div></section>}
    {categoryEntries.some(e=>e.kind==="quiz")&&<section className="catalog-section"><h2>🎯 {categoryId==="math"?"Oefeningen":"S'entraîner"}</h2><div className="catalog-activity-grid">{categoryEntries.filter(e=>e.kind==="quiz").map(entry=><button key={entry.id} className={"catalog-activity-card "+currentCategory.colorClass} onClick={()=>openEntry(entry)}><span className="catalog-entry-emoji">{entry.emoji}</span><div><span className="catalog-type">{categoryId==="math"?"OEFENING":"EXERCICE"}</span><h3>{entry.title}</h3><p>{entry.subtitle}</p><span className="catalog-played">🏅 {activityStats(sessions,entry.id).count} {categoryId==="math"?"keer voltooid":"fois terminé"}</span></div><ChevronRight size={21}/></button>)}</div></section>}
   </section>}
   {!loading&&screen==="quiz"&&question&&!completed&&<>
    <div className="quiz-navigation"><button className="back-link" onClick={returnToCategory}><ArrowLeft size={19}/>{dutchMath?"Terug naar Wiskunde":"Quitter la mission"}</button><span className="quiz-category">{activity.emoji} {activity.title}</span></div>
    <div className="quiz-progress-line"><div className="quiz-track"><span style={{width:`${(index/questions.length)*100}%`}}/></div><b>{index+1} / {questions.length}</b></div>
    <section className="quiz-panel"><div className="question-top"><span className="question-number">{dutchMath?"VRAAG":"QUESTION"} {index+1}</span><span className="question-points"><Star size={16} fill="currentColor"/> +10 {dutchMath?"punten":"points"}</span></div><div className="question-emoji">{question.emoji||"✨"}</div><h1>{question.prompt}</h1>{(activity.subject==="dutch"||dutchMath)&&<button className="listen-btn" onClick={()=>speech(question.prompt,dutchMath?"nl-BE":undefined)}><Volume2 size={17}/> {dutchMath?"Luister naar de vraag":"Écouter la phrase"}</button>}<ExercisePlay key={question.id + ":" + mode} question={question} pool={sessionPool} mode={mode} locale={dutchMath?"nl-BE":"fr-BE"} locked={selected!==null||busy} onAnswer={(right,answerId)=>{void choose(right,answerId)}} />{selected!==null&&<div className={`feedback ${correct?"feedback-good":"feedback-bad"}`} role="status"><span className="feedback-icon">{correct?"🎉":"💪"}</span><div><b>{correct?(dutchMath?"Goed gedaan! +10 sterren!":"Bravo ! +10 étoiles !"):(dutchMath?"Goed geprobeerd!":"Continue, tu progresses !")}</b><p>{question.explanation}</p></div></div>}{selected!==null&&<button className="primary next-btn" onClick={()=>{void next()}} disabled={busy}>{index+1===questions.length?(dutchMath?"Bekijk mijn resultaat":"Voir mes résultats"):(dutchMath?"Volgende vraag":"Question suivante")} <ArrowRight size={19}/></button>}</section>
   </>}
   {!loading&&screen==="lesson"&&<AnimatedLessonPlayer lesson={chessBeginnerLesson} onClose={returnToCategory} onComplete={async(correctCount,total)=>{await recordCompletion("chess-beginner","lesson",correctCount,total)}} onAttempt={async(id,right)=>{const now=new Date().toISOString();const next:Progress={...progress,points:progress.points+(right?10:0),attempted:progress.attempted+1,correct:progress.correct+(right?1:0),streak:right?progress.streak+1:0,bestStreak:Math.max(progress.bestStreak,right?progress.streak+1:0),lastPlayed:now};await saveAnswer(next,{questionId:id,correct:right,answerId:right?"chess-correct":"chess-retry",date:now,packId:"chess-beginner"});setProgress(next)}}/>}
   {!loading&&screen==="result"&&<section className="results"><div className="results-confetti">✨ ⭐ 🎉</div><div className="results-mascot">🦊</div><span className="eyebrow">{dutchMath?"OEFENING AFGEROND":"MISSION TERMINÉE"}</span><h1>{dutchMath?"Goed gedaan, kampioen!":"Bravo, champion !"}</h1><p>{dutchMath?"Je hebt « "+activity.title+" » afgerond! Doe zo voort!":"Tu as terminé « "+activity.title+" » ! Continue comme ça !"}</p><div className="result-stats"><div><span>⭐</span><b>+{totalCorrect*10}</b><small>{dutchMath?"punten verdiend":"points gagnés"}</small></div><div><span>🎯</span><b>{totalCorrect}/{questions.length}</b><small>{dutchMath?"juiste antwoorden":"bonnes réponses"}</small></div><div><span>🏆</span><b>{level}</b><small>{dutchMath?"jouw niveau":"ton niveau"}</small></div></div><div className="result-actions"><button className="primary" onClick={()=>start(activity)}><RotateCcw size={18}/>{dutchMath?"Opnieuw spelen":"Rejouer"}</button><button className="secondary" onClick={returnToCategory}><Home size={18}/>{dutchMath?"Wiskunde":"Mes missions"}</button></div></section>}
   {!loading&&screen==="settings"&&<section className="settings-page"><button className="back-link" onClick={()=>setScreen("home")}><ArrowLeft size={19}/> Retour à l'accueil</button><div className="settings-heading"><span className="eyebrow">MON ACADÉMIE</span><h1>Paramètres et nouveautés ⚙️</h1><p>Mes activités restent disponibles même sans connexion Internet.</p></div><div className="settings-cards"><div className="settings-card"><div className="settings-icon"><Download/></div><h2>Mises à jour</h2><p>Vérifie si de nouveaux exercices ou jeux sont disponibles.</p><button className="primary" disabled={updateBusy} onClick={updates}><RefreshCw size={18} className={updateBusy?"spin":""}/>{updateBusy?"Vérification…":"Vérifier les mises à jour"}</button></div><div className="settings-card"><div className="settings-icon"><Trophy/></div><h2>Mes exploits</h2><p>{progress.correct} bonnes réponses sur {progress.attempted} essais, et une meilleure série de {progress.bestStreak} !</p><div className="achievement"><Medal size={19}/> {badgeName(progress.points)}</div></div><div className="settings-card"><div className="settings-icon"><BookOpen/></div><h2>Mes exercices</h2><p>{allQuestions.length} questions installées dans {packs.length} packs pédagogiques.</p><div className="achievement"><WifiOff size={19}/> Disponibles hors ligne</div></div></div><section className="history-section"><div className="section-head"><div><span className="eyebrow">SUIVI DES APPRENTISSAGES</span><h2>Historique des cours et exercices 📊</h2></div><span className="section-hint">{sessions.length} activités terminées</span></div>
      <p className="history-help">Chaque ligne représente une activité terminée : score, date et temps passé. Les anciennes réponses et étoiles sont conservées ; les durées ne sont enregistrées qu'à partir de cette version.</p>
      <div className="history-list">{catalog.map(entry=>{
       const stats=activityStats(sessions,entry.id);
       const runs=sessions.filter(s=>s.activityId===entry.id);
       return <details className="history-entry" key={entry.kind+":"+entry.id}>
         <summary><span className="history-icon">{entry.emoji}</span><span className="history-title"><b>{entry.title}</b><small>{stats.count} {stats.count>1?"réalisations":"réalisation"} · Meilleur score {stats.count?stats.best+" %":"—"}</small></span><span className="history-expand"><ChevronRight size={20}/></span></summary>
         <div className="history-detail">
           {runs.length===0?<p>Aucune partie terminée enregistrée pour cette activité.</p>:<>
             <div className="history-stats"><span>🏅 {stats.count} parties</span><span>🎯 Moyenne : {stats.average} %</span><span>⏱️ Meilleur temps : {stats.shortestSeconds===null?"—":formatDuration(stats.shortestSeconds)}</span></div>
             <div className="history-table-wrap"><table className="history-table"><thead><tr><th>Essai</th><th>Date</th><th>Score</th><th>Durée</th></tr></thead><tbody>{runs.map((run,i)=><tr key={run.id}><td>#{runs.length-i}</td><td>{new Date(run.completedAt).toLocaleString("fr-BE",{dateStyle:"short",timeStyle:"short"})}</td><td><b>{run.correct}/{run.total}</b> ({Math.round(run.correct/run.total*100)} %)</td><td>{formatDuration(run.durationSeconds)}</td></tr>)}</tbody></table></div>
           </>}
         </div>
       </details>;
      })}</div>
     </section><div className="small-note">Version 0.6.0 · Les données de progression restent sur cet ordinateur. Aucun compte enfant n'est nécessaire.</div></section>}
  </main>
  <footer className="footer"><span>KidQuest ✦ Apprendre est une aventure</span><span>Fait avec 💜 pour les petits curieux</span></footer>
 </div>;
}
