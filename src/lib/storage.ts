import { isTauri } from "@tauri-apps/api/core";
import type { Attempt,ContentPack,Progress } from "../types";
import { builtinPacks } from "../data/builtin";

export const DEFAULT_PROGRESS:Progress={points:0,correct:0,attempted:0,streak:0,bestStreak:0,lastPlayed:null};
const storageKey="kidquest.progress.v1";
let dbPromise:Promise<import("@tauri-apps/plugin-sql").default>|null=null;
async function database(){
 if(!dbPromise){
  dbPromise=import("@tauri-apps/plugin-sql").then(({default:Database})=>Database.load("sqlite:kidquest.db")).then(async db=>{
   await db.execute("CREATE TABLE IF NOT EXISTS progress (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL)");
   await db.execute("CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id TEXT NOT NULL, correct INTEGER NOT NULL, answer_id TEXT NOT NULL, date TEXT NOT NULL, pack_id TEXT NOT NULL)");
   await db.execute("CREATE TABLE IF NOT EXISTS packs (id TEXT PRIMARY KEY, version INTEGER NOT NULL, json TEXT NOT NULL)");
   return db;
  }).catch(e=>{dbPromise=null;throw e});
 }
 return dbPromise;
}
export async function getProgress():Promise<Progress>{
 if(!isTauri()){
  try {const raw=localStorage.getItem(storageKey);return raw?{...DEFAULT_PROGRESS,...JSON.parse(raw)}:DEFAULT_PROGRESS;}catch{return DEFAULT_PROGRESS;}
 }
 const db=await database();const rows=await db.select<{json:string}[]>("SELECT json FROM progress WHERE id=1");
 return rows.length?{...DEFAULT_PROGRESS,...JSON.parse(rows[0].json)}:DEFAULT_PROGRESS;
}
export async function saveAnswer(progress:Progress, attempt:Attempt):Promise<void>{
 if(!isTauri()){localStorage.setItem(storageKey,JSON.stringify(progress));return;}
 const db=await database();
 await db.execute("BEGIN TRANSACTION");
 try{
  await db.execute("INSERT INTO attempts (question_id,correct,answer_id,date,pack_id) VALUES ($1,$2,$3,$4,$5)",[attempt.questionId,attempt.correct?1:0,attempt.answerId,attempt.date,attempt.packId]);
  await db.execute("INSERT INTO progress (id,json) VALUES (1,$1) ON CONFLICT(id) DO UPDATE SET json=excluded.json",[JSON.stringify(progress)]);
  await db.execute("COMMIT");
 }catch(e){await db.execute("ROLLBACK");throw e}
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
