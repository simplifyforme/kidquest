import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { AnimatedLesson } from "../lessons/chessTypes";
import { playActions } from "../lessons/chessTypes";
import AnimatedChessBoard from "./AnimatedChessBoard";
const CartoonChessBoard3D = lazy(()=>import("./CartoonChessBoard3D"));

type Props = {
  lesson: AnimatedLesson;
  onClose: () => void;
  onAttempt: (questionId: string, success: boolean) => Promise<void>;
};

type VoiceState = "idle" | "speaking" | "unavailable";

const frenchMaleNames = /henri|paul|thomas|nicolas|antoine|alain|claude|male|homme|masculin|guy|gerard|gérard|marc|julien|adam|alexandre|remy|rémy/i;

function wordsWithPositions(text: string): {word: string; start:number;end:number}[] {
  const re=/\S+/g;const found:{word:string;start:number;end:number}[]=[];
  for(const hit of text.matchAll(re))found.push({word:hit[0],start:hit.index,end:hit.index+hit[0].length});
  return found;
}

function chooseFrenchVoice(voices: SpeechSynthesisVoice[]): {voice:SpeechSynthesisVoice|null; male:boolean} {
  const french=voices.filter(v=>v.lang.toLowerCase().startsWith("fr"));
  const male=french.find(v=>frenchMaleNames.test(v.name));
  return {voice:male??french.find(v=>v.lang.toLowerCase()==="fr-be")??french[0]??null,male:!!male};
}

export default function AnimatedLessonPlayer({lesson,onClose,onAttempt}:Props) {
  const [index,setIndex]=useState(0);
  const [boardMode,setBoardMode]=useState<"2d"|"3d">(()=>{try{return localStorage.getItem("kidquest.chess.view.v1")==="2d"?"2d":"3d"}catch{return "3d"}});
  const [cameraView,setCameraView]=useState<"angled"|"top">("angled");
  const [cameraReset,setCameraReset]=useState(0);
  const [webglError,setWebglError]=useState(false);
  const [actionIndex,setActionIndex]=useState(0);
  const [playing,setPlaying]=useState(true);
  const [spokenIndex,setSpokenIndex]=useState(-1);
  const [voiceState,setVoiceState]=useState<VoiceState>("idle");
  const [voiceWarning,setVoiceWarning]=useState<string|null>(null);
  const [answer,setAnswer]=useState<string|null>(null);
  const [wrong,setWrong]=useState(false);
  const [saving,setSaving]=useState(false);
  const [awarded,setAwarded]=useState(0);
  const [utteranceVersion,setUtteranceVersion]=useState(0);
  const [voiceAvailable,setVoiceAvailable]=useState(typeof window!=="undefined" && "speechSynthesis" in window);
  const versionRef=useRef(0);
  const scene=lesson.scenes[index];
  const words=useMemo(()=>wordsWithPositions(scene.narration),[scene.narration]);
  const actions=scene.actions;
  const pieces=useMemo(()=>playActions(scene.pieces,actions,actionIndex),[scene,actions,actionIndex]);
  const totalChallenges=lesson.scenes.filter(s=>s.challenge).length;

  const stopSpeaking=useCallback(()=>{
    versionRef.current+=1;
    if("speechSynthesis" in window)window.speechSynthesis.cancel();
    setVoiceState("idle");setSpokenIndex(-1);
  },[]);
  useEffect(()=>()=>{versionRef.current++;if("speechSynthesis" in window)window.speechSynthesis.cancel()},[]);
  useEffect(()=>{
    stopSpeaking();
    setActionIndex(0);setPlaying(!scene.challenge);setAnswer(null);setWrong(false);
  },[index,scene.challenge,stopSpeaking]);
  useEffect(()=>{
    if(!playing||actionIndex>=actions.length||scene.challenge)return;
    const id=window.setTimeout(()=>setActionIndex(n=>n+1),1400);
    return ()=>window.clearTimeout(id);
  },[actionIndex,actions.length,playing,scene.challenge]);

  function narrate() {
    if(!("speechSynthesis" in window)){setVoiceWarning("La lecture vocale n'est pas disponible sur cet ordinateur.");setVoiceAvailable(false);return}
    stopSpeaking();
    setVoiceWarning(null);
    const synthesizer=window.speechSynthesis;
    const selected=chooseFrenchVoice(synthesizer.getVoices());
    const utterance=new SpeechSynthesisUtterance(scene.narration);
    if(selected.voice)utterance.voice=selected.voice;
    utterance.lang="fr-FR";
    utterance.rate=0.84;
    utterance.pitch=0.95;
    const run=++versionRef.current;
    utterance.onstart=()=>{if(versionRef.current===run)setVoiceState("speaking")};
    utterance.onboundary=event=>{
      if(versionRef.current!==run)return;
      const n=words.findIndex(w=>event.charIndex>=w.start&&event.charIndex<w.end);
      if(n>=0)setSpokenIndex(n);
    };
    utterance.onend=()=>{if(versionRef.current===run){setVoiceState("idle");setSpokenIndex(-1)}};
    utterance.onerror=event=>{if(versionRef.current===run){setVoiceState("unavailable");setVoiceWarning("Voix non disponible : vérifie les voix françaises installées dans Windows. ("+event.error+")")}};
    if(!selected.male)setVoiceWarning("Aucune voix masculine française reconnue sur ce PC. KidQuest utilise la voix française disponible ; ajoute une voix masculine dans Windows pour la sélectionner automatiquement.");
    setUtteranceVersion(v=>v+1);
    synthesizer.speak(utterance);
  }

  async function attempt(square:string) {
    if(!scene.challenge||answer!==null||saving)return;
    if(!scene.challenge.validTargets.includes(square)){setWrong(true);return}
    setSaving(true);setAnswer(square);
    try{
      const success=!wrong;
      await onAttempt(lesson.id+":"+scene.id,success);
      if(success)setAwarded(v=>v+1);
    }catch {
      // The child can still advance if persistent storage is temporarily unavailable.
      setVoiceWarning("La réponse est correcte, mais l'enregistrement des points a échoué.");
    }finally{setSaving(false)}
  }
  function advance(step:number){stopSpeaking();setIndex(i=>Math.max(0,Math.min(lesson.scenes.length-1,i+step)))}
  function replay(){setActionIndex(0);setPlaying(true)}
  const finished=index===lesson.scenes.length-1;
  function changeBoardMode(mode:"2d"|"3d"){
    setBoardMode(mode);
    try{localStorage.setItem("kidquest.chess.view.v1",mode)}catch{/* storage optional */}
  }

  return <section className="animated-lesson" aria-label={lesson.title}>
    <div className="lesson-topline">
      <button type="button" className="back-link" onClick={()=>{stopSpeaking();onClose()}}><ArrowLeft size={18}/> Mes missions</button>
      <span>♟️ {lesson.title}</span>
    </div>
    <div className="lesson-progress"><div className="quiz-track"><span style={{width:((index+1)/lesson.scenes.length*100)+"%"}}/></div><b>{index+1} / {lesson.scenes.length}</b></div>
    <div className="lesson-content">
      <div className="lesson-explanation">
        <span className="eyebrow">COURS ANIMÉ · DÉBUTANT</span>
        <h1>{scene.title}</h1>
        <div className="lesson-narration" key={scene.id} aria-label={scene.narration}>
          {words.map((word,i)=><span key={i} className={"spoken-word"+(spokenIndex===i?" speaking-now":"")}>{word.word}{" "}</span>)}
        </div>
        <div className="narration-actions">
          <button type="button" className="primary" onClick={narrate} disabled={!voiceAvailable}>
            <Volume2 size={18}/> {voiceState==="speaking"?"Réécouter":"Écouter l'explication"}
          </button>
          {voiceState==="speaking"&&<button type="button" className="secondary" onClick={stopSpeaking}><VolumeX size={17}/> Stop</button>}
        </div>
        {voiceWarning&&<p className="voice-warning" role="status">{voiceWarning}</p>}
        <div className="lesson-tip">💡 <strong>À retenir :</strong> {scene.tip}</div>
        {scene.challenge?
          <div className="lesson-challenge">
            <h2>🎯 À toi de jouer !</h2>
            <p>{scene.challenge.prompt}</p>
            {answer!==null?<p className="lesson-correct" role="status"><CheckCircle2 size={19}/> {scene.challenge.feedback} {wrong?"Tu as trouvé après un essai.":"⭐ +10 points !"}</p>
              :wrong?<p className="lesson-try-again" role="status">Essaie une autre case. Regarde les cases éclairées !</p>
              :<p className="lesson-instruction">Clique sur la bonne case de l'échiquier.</p>}
          </div>:<div className="lesson-animation-controls">
            <button type="button" className="secondary" onClick={replay} disabled={actions.length===0}><RotateCcw size={17}/> Revoir le mouvement</button>
            {actions.length>0&&<button type="button" className="secondary" onClick={()=>setPlaying(v=>!v)}><Play size={17}/> {playing?"Pause":"Reprendre"}</button>}
            {actions.length>0&&<span className="lesson-action-status">Mouvement {Math.min(actionIndex,actions.length)} / {actions.length}</span>}
          </div>}
        <div className="lesson-navigation">
          <button type="button" className="secondary" onClick={()=>advance(-1)} disabled={index===0}><ArrowLeft size={17}/> Précédent</button>
          {finished?
            <button type="button" className="primary" onClick={()=>{stopSpeaking();onClose()}}>Terminer le cours 🎉</button>:
            <button type="button" className="primary" disabled={!!scene.challenge && answer===null} onClick={()=>advance(1)}>Suivant <ArrowRight size={17}/></button>}
        </div>
      </div>
      <div className="lesson-board-area">
        <div className="chess-view-controls" aria-label="Affichage de l’échiquier">
          <div className="chess-view-switch" role="group" aria-label="Choisir le mode 2D ou 3D">
            <button type="button" className={boardMode==="3d"?"chess-view-selected":""} disabled={webglError} aria-pressed={boardMode==="3d"} onClick={()=>changeBoardMode("3d")}>🧊 3D cartoon</button>
            <button type="button" className={boardMode==="2d"?"chess-view-selected":""} aria-pressed={boardMode==="2d"} onClick={()=>changeBoardMode("2d")}>▦ 2D classique</button>
          </div>
          {boardMode==="3d"&&!webglError&&<div className="chess-camera-controls" role="group" aria-label="Caméra 3D">
            <button type="button" onClick={()=>{setCameraView("angled");setCameraReset(n=>n+1)}}>↗ Vue inclinée</button>
            <button type="button" onClick={()=>{setCameraView("top");setCameraReset(n=>n+1)}}>⬇ Vue du dessus</button>
          </div>}
        </div>
        {boardMode==="3d"&&!webglError?<Suspense fallback={<div className="chess-loading">Préparation des pièces 3D…</div>}>
          <CartoonChessBoard3D pieces={pieces} scene={scene} selected={answer}
            onSquare={scene.challenge&&answer===null&&!saving?attempt:undefined}
            onUnavailable={()=>{setWebglError(true);changeBoardMode("2d")}} view={cameraView} resetId={cameraReset}/>
        </Suspense>:<AnimatedChessBoard pieces={pieces} scene={scene} selected={answer} onSquare={scene.challenge&&answer===null&&!saving?attempt:undefined}/>}
        {webglError&&<p className="chess-3d-warning" role="status">La 3D n’est pas disponible sur ce PC. La leçon reste entièrement jouable en 2D.</p>}
        {boardMode==="3d"&&!webglError&&<p className="chess-3d-help">🖱️ Glisse pour orienter la caméra · Molette pour zoomer · Clique sur les cases vertes pendant les défis. Pour utiliser le clavier, passe en 2D.</p>}
        <div className="chess-legend"><span>♔ Pièces blanches</span><span>♚ Pièces noires</span></div>
        <p className="lesson-action-note">{scene.actions[Math.max(0,actionIndex-1)]?.note??"Regarde le déplacement des pièces sur l'échiquier."}</p>
        <div className="lesson-achievement">🏅 {awarded} / {totalChallenges} défis réussis du premier coup</div>
      </div>
    </div>
    {finished&&<div className="lesson-finish">🏆 Tu connais maintenant les bases des échecs !</div>}
    <span hidden>{utteranceVersion}</span>
  </section>;
}
