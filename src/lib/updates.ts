import { isTauri } from "@tauri-apps/api/core";
import { builtinPacks } from "../data/builtin";
import type { ContentManifest,ContentPack,Question,Result } from "../types";
import { getPacks,installPack } from "./storage";

// Content distribution repository to be created and enabled separately.
const MANIFEST_URL="https://simplifyforme.github.io/kidquest/manifest.json";
const APP_UPDATE_ENABLED=false; // Enable only AFTER adding the signed updater public key and a public release endpoint.

export function isValidQuestion(q:unknown):q is Question{
 if(!q||typeof q!=="object")return false;
 const x=q as Partial<Question>;
 return typeof x.id==="string"&&x.id.length<120&&typeof x.subject==="string"&&["math","numbers","french","dutch"].includes(x.subject)&&typeof x.prompt==="string"&&x.prompt.length<=500&&typeof x.correctAnswerId==="string"&&Array.isArray(x.answers)&&x.answers.length>=2&&x.answers.length<=6&&x.answers.every(a=>typeof a.id==="string"&&typeof a.label==="string"&&a.label.length<=200)&&x.answers.some(a=>a.id===x.correctAnswerId)&&typeof x.explanation==="string";
}
export function isValidPack(p:unknown):p is ContentPack{
 if(!p||typeof p!=="object")return false;
 const x=p as Partial<ContentPack>;
 return typeof x.id==="string"&&/^[a-z0-9-]{1,60}$/.test(x.id)&&Number.isSafeInteger(x.version)&&x.version!>=1&&typeof x.title==="string"&&x.title.length<=100&&Array.isArray(x.questions)&&x.questions.length>0&&x.questions.length<=500&&x.questions.every(isValidQuestion)&&new Set(x.questions.map(q=>q.id)).size===x.questions.length;
}
export async function sha256(content:string):Promise<string>{
 const bytes=new TextEncoder().encode(content);const buf=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function sameOriginOrHttps(url:string):boolean{try{return new URL(url).protocol==="https:"}catch{return false}}
export async function checkContentUpdates():Promise<Result>{
 try{
  const response=await fetch(MANIFEST_URL,{cache:"no-store",signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error("catalogue indisponible ("+response.status+")");
  const body=await response.json() as ContentManifest;
  if(body.schemaVersion!==1||!Array.isArray(body.packs)||body.packs.length>100)throw new Error("manifeste non compatible");
  const versions=new Map((await getPacks()).map(p=>[p.id,p.version]));
  let count=0;
  for(const item of body.packs){
   if(typeof item.id!=="string"||typeof item.version!=="number"||typeof item.url!=="string"||!/^[a-f0-9]{64}$/i.test(item.sha256)||!sameOriginOrHttps(item.url))throw new Error("entrée de manifeste invalide");
   if((versions.get(item.id)||0)>=item.version)continue;
   const response=await fetch(item.url,{signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw new Error("pack indisponible : "+item.id);
   const raw=await response.text();
   if(raw.length>1024*1024)throw new Error("pack trop volumineux");
   if((await sha256(raw))!==item.sha256.toLowerCase())throw new Error("empreinte invalide : "+item.id);
   const pack:unknown=JSON.parse(raw);
   if(!isValidPack(pack)||pack.id!==item.id||pack.version!==item.version)throw new Error("pack invalide : "+item.id);
   await installPack(pack);
   versions.set(pack.id,pack.version);
   count++;
  }
  return {kind:count?"success":"info",message:count?`${count} nouveau(x) pack(s) installé(s) !`:"Tous les exercices sont à jour."};
 }catch(e){
  return {kind:"info",message:"Les exercices locaux restent disponibles. Mise à jour distante indisponible ("+(e instanceof Error?e.message:"réseau")+")."};
 }
}
export async function checkAppUpdate():Promise<Result>{
 if(!isTauri())return {kind:"info",message:"Les mises à jour de l'application concernent Windows."};
 if(!APP_UPDATE_ENABLED)return {kind:"info",message:"La mise à jour signée de l'application sera activée après configuration des clés de signature."};
 try{
  const {check}=await import("@tauri-apps/plugin-updater");
  const update=await check();
  if(!update)return {kind:"info",message:"KidQuest est à jour."};
  await update.downloadAndInstall();
  const {relaunch}=await import("@tauri-apps/plugin-process");
  await relaunch();
  return {kind:"success",message:"Nouvelle version installée."};
 }catch{return {kind:"error",message:"Impossible d'installer la mise à jour de l'application."}}
}
export function findPackId(questionId:string,packs:ContentPack[]=builtinPacks):string{
 return packs.find(p=>p.questions.some(q=>q.id===questionId))?.id||"unknown";
}
