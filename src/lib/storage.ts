import { isTauri } from "@tauri-apps/api/core";
import type { Attempt,CompletedSession,ContentPack,Progress } from "../types";
import { builtinPacks } from "../data/builtin";
import type { RemoteCatalog } from "./catalogConfig";
import { isValidRemoteCatalog } from "./catalogConfig";

export const DEFAULT_PROGRESS:Progress={points:0,correct:0,attempted:0,streak:0,bestStreak:0,lastPlayed:null};
const storageKey="kidquest.progress.v1";
const sessionStorageKey="kidquest.completed.sessions.v1";
const hiddenStorageKey="kidquest.hidden.activities.v1";
const remoteCatalogKey="kidquest.remote.catalog.v1";
let dbPromise:Promise<import("@tauri-apps/plugin-sql").default>|null=null;
async function database(){
 if(!dbPromise){
  dbPromise=import("@tauri-apps/plugin-sql").then(({default:Database})=>Database.load("sqlite:kidquest.db")).then(async db=>{
   await db.execute("CREATE TABLE IF NOT EXISTS progress (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL)");
   await db.execute("CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id TEXT NOT NULL, correct INTEGER NOT NULL, answer_id TEXT NOT NULL, date TEXT NOT NULL, pack_id TEXT NOT NULL)");
   await db.execute("CREATE TABLE IF NOT EXISTS packs (id TEXT PRIMARY KEY, version INTEGER NOT NULL, json TEXT NOT NULL)");
   await db.execute("CREATE TABLE IF NOT EXISTS completed_sessions (id TEXT PRIMARY KEY, activity_id TEXT NOT NULL, kind TEXT NOT NULL, started_at TEXT NOT NULL, completed_at TEXT NOT NULL, duration_seconds INTEGER NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL)");
   await db.execute("CREATE INDEX IF NOT EXISTS idx_completed_sessions_activity ON completed_sessions (activity_id, completed_at DESC)");
   await db.execute("CREATE TABLE IF NOT EXISTS hidden_activities (activity_id TEXT PRIMARY KEY)");
   await db.execute("CREATE TABLE IF NOT EXISTS remote_catalog (id INTEGER PRIMARY KEY CHECK(id=1),version INTEGER NOT NULL,json TEXT NOT NULL)");
   return db;
  }).catch(e=>{dbPromise=null;throw e});
 }
 return dbPromise;
}
export async function getProgress():Promise<Progress>{
 if(!isTauri()){
  try {const raw=localStorage.getItem(storageKey);return raw?{...DEFAULT_PROGRESS,...JSON.parse(raw)}:DEFAULT_PROGRESS;}catch{return DEFAULT_PROGRESS;}
 }
 const db=await database();
 // The append-only attempt table is the source of truth: a single successful INSERT
 // persists both an answer and its future points, without cross-IPC transactions.
 const attempts=await db.select<{correct:number;date:string}[]>("SELECT correct,date FROM attempts ORDER BY id ASC");
 let points=0,correct=0,streak=0,bestStreak=0,lastPlayed:string|null=null;
 for(const attempt of attempts){
  if(attempt.correct){points+=10;correct++;streak++;bestStreak=Math.max(bestStreak,streak)}
  else streak=0;
  lastPlayed=attempt.date;
 }
 return {points,correct,attempted:attempts.length,streak,bestStreak,lastPlayed};
}
export async function saveAnswer(progress:Progress, attempt:Attempt):Promise<void>{
 if(!isTauri()){localStorage.setItem(storageKey,JSON.stringify(progress));return;}
 const db=await database();
 await db.execute("INSERT INTO attempts (question_id,correct,answer_id,date,pack_id) VALUES ($1,$2,$3,$4,$5)",[attempt.questionId,attempt.correct?1:0,attempt.answerId,attempt.date,attempt.packId]);
}
export async function getPacks():Promise<ContentPack[]>{
 if(!isTauri()){
  try{const downloaded=JSON.parse(localStorage.getItem("kidquest.packs.v1")||"[]") as ContentPack[];const ids=new Set(downloaded.map(p=>p.id));return [...builtinPacks.filter(p=>!ids.has(p.id)),...downloaded]}catch{return builtinPacks}
 }
 const db=await database();const rows=await db.select<{json:string}[]>("SELECT json FROM packs");
 const downloaded:ContentPack[]=rows.map(r=>JSON.parse(r.json));
 const overrides=new Set(downloaded.map(p=>p.id));
 return [...builtinPacks.filter(p=>!overrides.has(p.id)),...downloaded];
}
export async function installPack(pack:ContentPack):Promise<void>{
 if(!isTauri()){
  const downloaded=JSON.parse(localStorage.getItem("kidquest.packs.v1")||"[]") as ContentPack[];
  localStorage.setItem("kidquest.packs.v1",JSON.stringify([...downloaded.filter(p=>p.id!==pack.id),pack]));return;
 }
 const db=await database();
 await db.execute("INSERT INTO packs(id,version,json) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET version=excluded.version,json=excluded.json",[pack.id,pack.version,JSON.stringify(pack)]);
}


/** Append-only completion history. Never infer durations from historic question attempts. */
export async function getCompletedSessions():Promise<CompletedSession[]>{
 if(!isTauri()){
  try{
   const decoded=JSON.parse(localStorage.getItem(sessionStorageKey)||"[]") as CompletedSession[];
   return decoded.sort((a,b)=>b.completedAt.localeCompare(a.completedAt));
  }catch{return []}
 }
 const db=await database();
 const rows=await db.select<{
  id:string;activity_id:string;kind:"quiz"|"lesson";started_at:string;
  completed_at:string;duration_seconds:number;correct:number;total:number;
 }[]>("SELECT id,activity_id,kind,started_at,completed_at,duration_seconds,correct,total FROM completed_sessions ORDER BY completed_at DESC");
 return rows.map(r=>({
  id:r.id,activityId:r.activity_id,kind:r.kind,
  startedAt:r.started_at,completedAt:r.completed_at,
  durationSeconds:r.duration_seconds,correct:r.correct,total:r.total
 }));
}
export async function saveCompletedSession(session:CompletedSession):Promise<void>{
 if(!session.id||!session.activityId||!["quiz","lesson"].includes(session.kind)||
    !Number.isFinite(session.durationSeconds)||session.durationSeconds<0||
    !Number.isInteger(session.total)||session.total<1||
    !Number.isInteger(session.correct)||session.correct<0||session.correct>session.total||
    !Number.isFinite(Date.parse(session.startedAt))||!Number.isFinite(Date.parse(session.completedAt)))
  throw new Error("Historique de l'activité invalide.");
 if(!isTauri()){
  const stored=await getCompletedSessions();
  const next=stored.some(s=>s.id===session.id)?stored:[session,...stored];
  localStorage.setItem(sessionStorageKey,JSON.stringify(next));
  return;
 }
 const db=await database();
 await db.execute(
  "INSERT OR IGNORE INTO completed_sessions (id,activity_id,kind,started_at,completed_at,duration_seconds,correct,total) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
  [session.id,session.activityId,session.kind,session.startedAt,session.completedAt,
   Math.floor(session.durationSeconds),session.correct,session.total]
 );
}

/**
 * Visibility is an opt-out preference: absence of an id means VISIBLE.
 * Thus every newly downloaded or bundled activity is automatically visible.
 * Records are kept if a pack disappears temporarily and reappears later.
 */
export async function getHiddenActivityIds():Promise<string[]>{
 if(!isTauri()){
  try{
   const ids:unknown=JSON.parse(localStorage.getItem(hiddenStorageKey)||"[]");
   return Array.isArray(ids)?ids.filter((id):id is string=>typeof id==="string"):[];
  }catch{return []}
 }
 const db=await database();
 const rows=await db.select<{activity_id:string}[]>("SELECT activity_id FROM hidden_activities");
 return rows.map(row=>row.activity_id);
}
export async function setActivityVisible(activityId:string,visible:boolean):Promise<void>{
 if(!activityId||activityId.length>128)throw new Error("Invalid activity ID");
 if(!isTauri()){
  const ids=new Set(await getHiddenActivityIds());
  if(visible)ids.delete(activityId);else ids.add(activityId);
  localStorage.setItem(hiddenStorageKey,JSON.stringify([...ids]));
  return;
 }
 const db=await database();
 if(visible)await db.execute("DELETE FROM hidden_activities WHERE activity_id=$1",[activityId]);
 else await db.execute("INSERT OR IGNORE INTO hidden_activities(activity_id) VALUES ($1)",[activityId]);
}


/** Last verified remote catalog, available without Internet across launches. */
export async function getRemoteCatalog():Promise<RemoteCatalog|null>{
 if(!isTauri()){
  try{const raw=localStorage.getItem(remoteCatalogKey);
   if(!raw)return null;
   const parsed:unknown=JSON.parse(raw);
   return isValidRemoteCatalog(parsed)?parsed:null;
  }catch{return null}
 }
 const db=await database();
 const rows=await db.select<{json:string}[]>("SELECT json FROM remote_catalog WHERE id=1");
 if(!rows.length)return null;
 try{
  const parsed:unknown=JSON.parse(rows[0].json);
  return isValidRemoteCatalog(parsed)?parsed:null;
 }catch{return null}
}

/** Only monotonic verified versions are persisted; no destructive migrations. */
export async function installRemoteCatalog(catalog:RemoteCatalog):Promise<boolean>{
 if(!isValidRemoteCatalog(catalog))throw Error("Catalogue invalide");
 const previous=await getRemoteCatalog();
 if(previous&&catalog.version<=previous.version)return false;
 if(!isTauri()){
  localStorage.setItem(remoteCatalogKey,JSON.stringify(catalog));
  return true;
 }
 const db=await database();
 await db.execute("INSERT INTO remote_catalog(id,version,json) VALUES (1,$1,$2) ON CONFLICT(id) DO UPDATE SET version=excluded.version,json=excluded.json WHERE excluded.version > remote_catalog.version",
  [catalog.version,JSON.stringify(catalog)]);
 return true;
}
