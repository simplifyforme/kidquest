import { useEffect,useMemo,useState } from "react";
import { ArrowLeft,ArrowRight,BookOpen,ChevronRight,Download,Home,Medal,RefreshCw,RotateCcw,Settings,ShieldCheck,Sparkles,Star,Trophy,WifiOff,Volume2 } from "lucide-react";
import { builtinPacks } from "./data/builtin";
import { getPacks,getProgress,saveAnswer,DEFAULT_PROGRESS } from "./lib/storage";
import { checkAppUpdate,checkContentUpdates,findPackId } from "./lib/updates";
import { getActivities,getActivityQuestions,baseActivities } from "./lib/activities";
import type { Activity } from "./lib/activities";
import type { ContentPack,Progress,Question,Result } from "./types";
import ExercisePlay from "./components/ExercisePlay";
import { planModes } from "./lib/exerciseModes";
import type { ExerciseMode } from "./lib/exerciseModes";
import AnimatedLessonPlayer from "./components/AnimatedLessonPlayer";
import { chessBeginnerLesson } from "./lessons/chessBeginner";

type Screen="home"|"quiz"|"result"|"settings"|"lesson";
const EMPTY:Progress={...DEFAULT_PROGRESS};
function shuffle<T>(a:T[]):T[]{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function badgeName(points:number){return points>=500?"Super explorateur":points>=200?"Champion des étoiles":points>=50?"Apprenti héros":"Explorateur débutant"}
function speech(text:string){if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=/\b(hallo|dag|dank|goed|rood|blauw|geel|groen|ik |hoe |fijne )/i.test(text)?"nl-BE":"fr-BE";u.rate=0.8;window.speechSynthesis.speak(u)}
export default function App(){
 const [screen,setScreen]=useState<Screen>("home");
 const [packs,setPacks]=useState<ContentPack[]>(builtinPacks);
 const [progress,setProgress]=useState<Progress>(EMPTY);
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
 const activities=useMemo(()=>getActivities(packs),[packs]);
 const question=questions[index];
 const correct=answerRight===true;
 const mode=modeSequence[index] ?? "choice";
 const completed=questions.length>0&&index>=questions.length;
 useEffect(()=>{let cancelled=false;Promise.all([getPacks(),getProgress()]).then(([ps,pr])=>{if(!cancelled){setPacks(ps);setProgress(pr)}}).catch(()=>{if(!cancelled)setMessage({kind:"error",message:"Impossible d'ouvrir le stockage. Les résultats risquent de ne pas être enregistrés."})}).finally(()=>{if(!cancelled)setLoading(false)});return ()=>{cancelled=true}},[]);
 useEffect(()=>{if(loading)return;const id=setTimeout(async()=>{const result=await checkContentUpdates();if(result.kind==="success"){setPacks(await getPacks());setMessage(result)}},1800);return ()=>clearTimeout(id)},[loading]);
 function start(a:Activity){const pool=shuffle(getActivityQuestions(packs,a));if(!pool.length){setMessage({kind:"info",message:"Aucune question disponible pour cette activité."});return}
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
 function next(){setSelected(null);setAnswerRight(null);if(index+1>=questions.length){setIndex(questions.length);setScreen("result")}else{setIndex(i=>i+1)}}
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
    <section className="welcome"><div className="welcome-copy"><span className="eyebrow">✨ TON ACADÉMIE DES DÉCOUVERTES</span><h1>Prêt pour une nouvelle <em>aventure ?</em></h1><p>Choisis une mission, apprends en t'amusant et gagne plein d'étoiles !</p><div className="hero-chips"><span>🏆 Niveau {level}</span><span>🔥 {progress.streak} de suite</span><span>🎯 {progress.correct} réussites</span></div></div><div className="hero-illustration" aria-hidden="true"><span className="hero-orbit orbit1">⭐</span><span className="hero-orbit orbit2">✏️</span><span className="hero-orbit orbit3">💫</span><div className="hero-mascot">🦊</div><span className="hero-ground"/></div></section>
    <section className="section-head"><div><span className="eyebrow">À TOI DE JOUER</span><h2>Choisis ta mission <span>🚀</span></h2></div><span className="section-hint">{activities.length} aventures disponibles</span></section>
    <section className="activity-grid">{activities.map(a=><button key={a.packId} className={`activity-card ${a.className}`} onClick={()=>start(a)}><div className="card-top"><span className="activity-tag">{a.tag}</span><span className="card-arrow"><ArrowRight size={19}/></span></div><div className="activity-emoji">{a.emoji}</div><h3>{a.title}</h3><p>{a.subtitle}</p><div className="activity-foot">Commencer <ChevronRight size={18}/></div></button>)}</section>
    <section className="lesson-section"><div className="section-head"><div><span className="eyebrow">NOUVEAU · COURS ANIMÉ</span><h2>Apprends avec des démonstrations <span>♟️</span></h2></div></div><button className="chess-course-card" onClick={()=>{setScreen("lesson");setMessage(null)}}><div className="chess-course-figure">♙ ♘ ♗ ♖ ♕ ♔</div><div><span className="course-badge">🎓 Leçon + démonstrations + tests</span><h3>{chessBeginnerLesson.title}</h3><p>{chessBeginnerLesson.subtitle} · {chessBeginnerLesson.scenes.length} étapes illustrées</p><span className="course-start">Découvrir les échecs <ArrowRight size={18}/></span></div></button></section>
    <section className="bottom-panels"><div className="level-panel"><div className="panel-icon">🏅</div><div className="panel-copy"><h3>Niveau {level} · {badgeName(progress.points)}</h3><p>Encore {100-progressInLevel} points pour le niveau suivant !</p><div className="progress-track"><span style={{width:`${progressInLevel}%`}}/></div></div><b>{progressInLevel}/100</b></div><div className="encourage-panel"><span>💡</span><div><b>Un petit défi chaque jour !</b><p>En t'entraînant régulièrement, tu deviens plus fort.</p></div></div></section>
   </>}
   {!loading&&screen==="quiz"&&question&&!completed&&<>
    <div className="quiz-navigation"><button className="back-link" onClick={()=>setScreen("home")}><ArrowLeft size={19}/> Quitter la mission</button><span className="quiz-category">{activity.emoji} {activity.title}</span></div>
    <div className="quiz-progress-line"><div className="quiz-track"><span style={{width:`${(index/questions.length)*100}%`}}/></div><b>{index+1} / {questions.length}</b></div>
    <section className="quiz-panel"><div className="question-top"><span className="question-number">QUESTION {index+1}</span><span className="question-points"><Star size={16} fill="currentColor"/> +10 points</span></div><div className="question-emoji">{question.emoji||"✨"}</div><h1>{question.prompt}</h1>{activity.subject==="dutch"&&<button className="listen-btn" onClick={()=>speech(question.prompt)}><Volume2 size={17}/> Écouter la phrase</button>}<ExercisePlay key={question.id + ":" + mode} question={question} pool={sessionPool} mode={mode} locked={selected!==null||busy} onAnswer={(right,answerId)=>{void choose(right,answerId)}} />{selected!==null&&<div className={`feedback ${correct?"feedback-good":"feedback-bad"}`} role="status"><span className="feedback-icon">{correct?"🎉":"💪"}</span><div><b>{correct?"Bravo ! +10 étoiles !":"Continue, tu progresses !"}</b><p>{question.explanation}</p></div></div>}{selected!==null&&<button className="primary next-btn" onClick={next}>{index+1===questions.length?"Voir mes résultats":"Question suivante"} <ArrowRight size={19}/></button>}</section>
   </>}
   {!loading&&screen==="lesson"&&<AnimatedLessonPlayer lesson={chessBeginnerLesson} onClose={()=>setScreen("home")} onAttempt={async(id,right)=>{const now=new Date().toISOString();const next:Progress={...progress,points:progress.points+(right?10:0),attempted:progress.attempted+1,correct:progress.correct+(right?1:0),streak:right?progress.streak+1:0,bestStreak:Math.max(progress.bestStreak,right?progress.streak+1:0),lastPlayed:now};await saveAnswer(next,{questionId:id,correct:right,answerId:right?"chess-correct":"chess-retry",date:now,packId:"chess-beginner"});setProgress(next)}}/>}
   {!loading&&screen==="result"&&<section className="results"><div className="results-confetti">✨ ⭐ 🎉</div><div className="results-mascot">🦊</div><span className="eyebrow">MISSION TERMINÉE</span><h1>Bravo, champion !</h1><p>Tu as terminé « {activity.title} » ! Continue comme ça !</p><div className="result-stats"><div><span>⭐</span><b>+{totalCorrect*10}</b><small>points gagnés</small></div><div><span>🎯</span><b>{totalCorrect}/{questions.length}</b><small>bonnes réponses</small></div><div><span>🏆</span><b>{level}</b><small>ton niveau</small></div></div><div className="result-actions"><button className="primary" onClick={()=>start(activity)}><RotateCcw size={18}/> Rejouer</button><button className="secondary" onClick={()=>setScreen("home")}><Home size={18}/> Mes missions</button></div></section>}
   {!loading&&screen==="settings"&&<section className="settings-page"><button className="back-link" onClick={()=>setScreen("home")}><ArrowLeft size={19}/> Retour à l'accueil</button><div className="settings-heading"><span className="eyebrow">MON ACADÉMIE</span><h1>Paramètres et nouveautés ⚙️</h1><p>Mes activités restent disponibles même sans connexion Internet.</p></div><div className="settings-cards"><div className="settings-card"><div className="settings-icon"><Download/></div><h2>Mises à jour</h2><p>Vérifie si de nouveaux exercices ou jeux sont disponibles.</p><button className="primary" disabled={updateBusy} onClick={updates}><RefreshCw size={18} className={updateBusy?"spin":""}/>{updateBusy?"Vérification…":"Vérifier les mises à jour"}</button></div><div className="settings-card"><div className="settings-icon"><Trophy/></div><h2>Mes exploits</h2><p>{progress.correct} bonnes réponses sur {progress.attempted} essais, et une meilleure série de {progress.bestStreak} !</p><div className="achievement"><Medal size={19}/> {badgeName(progress.points)}</div></div><div className="settings-card"><div className="settings-icon"><BookOpen/></div><h2>Mes exercices</h2><p>{allQuestions.length} questions installées dans {packs.length} packs pédagogiques.</p><div className="achievement"><WifiOff size={19}/> Disponibles hors ligne</div></div></div><div className="small-note">Version 0.3.0 · Les données de progression restent sur cet ordinateur. Aucun compte enfant n'est nécessaire.</div></section>}
  </main>
  <footer className="footer"><span>KidQuest ✦ Apprendre est une aventure</span><span>Fait avec 💜 pour les petits curieux</span></footer>
 </div>;
}
