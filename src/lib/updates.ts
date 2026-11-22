import { isTauri } from "@tauri-apps/api/core";
import { builtinPacks } from "../data/builtin";
import type { ContentManifest,ContentPack,Question,Result,ManifestCatalog } from "../types";
import type { RemoteCatalog } from "./catalogConfig";
import { getPacks,installPack,getRemoteCatalog,installRemoteCatalog } from "./storage";
import { isValidRemoteCatalog } from "./catalogConfig";
import {ensureActivityAssets,validateActivityAssets,validQuestionMedia} from "./activityAssets";

// Content distribution repository to be created and enabled separately.
const MANIFEST_URL="https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/manifest.json";
const APP_UPDATE_ENABLED=false; // Enable only AFTER adding the signed updater public key and a public release endpoint.

export function isValidQuestion(q:unknown):q is Question{
 if(!q||typeof q!=="object")return false;
 const x=q as Partial<Question>;
 return typeof x.id==="string"&&x.id.length<120&&typeof x.subject==="string"&&["math","numbers","french","dutch"].includes(x.subject)&&typeof x.prompt==="string"&&x.prompt.length<=500&&typeof x.correctAnswerId==="string"&&Array.isArray(x.answers)&&x.answers.length>=2&&x.answers.length<=6&&x.answers.every(a=>typeof a.id==="string"&&typeof a.label==="string"&&a.label.length<=200)&&x.answers.some(a=>a.id===x.correctAnswerId)&&typeof x.explanation==="string"&&(x.media===undefined||validQuestionMedia(x.media))&&(x.responseMode===undefined||(["choice","write","letters"].includes(x.responseMode)&&x.media?.type==="image"));
}
export function isValidPack(p:unknown):p is ContentPack{
 if(!p||typeof p!=="object")return false;
 const x=p as Partial<ContentPack>;
 return typeof x.id==="string"&&/^[a-z0-9-]{1,60}$/.test(x.id)&&Number.isSafeInteger(x.version)&&x.version!>=1&&typeof x.title==="string"&&x.title.length<=100&&(x.category===undefined||["math","french","dutch","chess","nature"].includes(x.category))&&(x.locale===undefined||["nl-BE","fr-BE"].includes(x.locale))&&Array.isArray(x.questions)&&x.questions.length>0&&x.questions.length<=500&&x.questions.every(isValidQuestion)&&new Set(x.questions.map(q=>q.id)).size===x.questions.length;
}
export async function sha256(content:string):Promise<string>{
 const bytes=new TextEncoder().encode(content);const buf=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
/** Verify exact published bytes before parsing or persisting any remote metadata. */
export async function verifyRemoteCatalog(raw:string,descriptor:ManifestCatalog):Promise<RemoteCatalog>{
 if(new TextEncoder().encode(raw).length>65536)throw Error("catalogue trop volumineux");
 if((await sha256(raw))!==descriptor.sha256.toLowerCase())throw Error("empreinte catalogue invalide");
 const parsed:unknown=JSON.parse(raw);
 if(!isValidRemoteCatalog(parsed)||parsed.version!==descriptor.version)
  throw Error("format du catalogue invalide");
 return parsed;
}
function sameOriginOrHttps(url:string):boolean{try{return new URL(url).protocol==="https:"}catch{return false}}
export async function checkContentUpdates():Promise<Result>{
 try{
  // The query avoids serving stale versions of the mutable manifest from a CDN edge.
  const response=await fetch(MANIFEST_URL+"?t="+Date.now(),{cache:"no-store",signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error("catalogue indisponible ("+response.status+")");
  const body:ContentManifest=await response.json() as ContentManifest;
  if(body.schemaVersion!==1||!Array.isArray(body.packs)||body.packs.length>100)
   throw new Error("manifeste non compatible");
  const versions=new Map((await getPacks()).map(p=>[p.id,p.version]));
  let count=0;
  let catalogUpdated=false;
  let bundleCount=0;
  let mediaCount=0;
  const errors:string[]=[];
  try{
   for(const item of body.packs){
    if(typeof item.id!=="string"||typeof item.version!=="number"||typeof item.url!=="string"||
       !/^[a-f0-9]{64}$/i.test(item.sha256)||!sameOriginOrHttps(item.url))
     throw new Error("entrée de manifeste invalide");
    if((versions.get(item.id)||0)>=item.version)continue;
    const response=await fetch(item.url,{cache:"no-store",signal:AbortSignal.timeout(12000)});
    if(!response.ok)throw new Error("pack indisponible : "+item.id);
    const raw=await response.text();
    if(new TextEncoder().encode(raw).length>1024*1024)throw new Error("pack trop volumineux");
    if((await sha256(raw))!==item.sha256.toLowerCase())throw new Error("empreinte invalide : "+item.id);
    const pack:unknown=JSON.parse(raw);
    if(!isValidPack(pack)||pack.id!==item.id||pack.version!==item.version)
      throw new Error("pack invalide : "+item.id);
    await installPack(pack);
    versions.set(pack.id,pack.version);
    count++;
   }
  }catch(e){errors.push("packs : "+(e instanceof Error?e.message:"réseau"))}

  // Independent per-activity directories: pack.json + hashed assets (jpg/png/gif/video/audio).
  // Install questions only AFTER all corresponding assets are verified and stored offline.
  if(body.activities!==undefined){
   try{
    if(!Array.isArray(body.activities)||body.activities.length>100)throw Error("liste d’activités invalide");
    for(const entry of body.activities){
     if(typeof entry.id!=="string"||!/^[a-z0-9-]{1,60}$/.test(entry.id)||
        !Number.isSafeInteger(entry.version)||entry.version<1||
        typeof entry.url!=="string"||!sameOriginOrHttps(entry.url)||
        !/^[a-f0-9]{64}$/i.test(entry.sha256)||
        !validateActivityAssets(entry.id,entry.assets))throw Error("activité invalide");
     if((versions.get(entry.id)||0)>=entry.version)continue;
     const response=await fetch(entry.url,{cache:"no-store",signal:AbortSignal.timeout(12000)});
     if(!response.ok)throw Error("questions indisponibles : "+entry.id);
     const raw=await response.text();
     if(new TextEncoder().encode(raw).length>1024*1024)throw Error("questions trop volumineuses");
     if(await sha256(raw)!==entry.sha256.toLowerCase())throw Error("empreinte des questions incorrecte");
     const data:unknown=JSON.parse(raw);
     if(!isValidPack(data)||data.id!==entry.id||data.version!==entry.version)
       throw Error("pack de l’activité invalide");
     if(data.questions.some(q=>q.media&&!entry.assets.some(a=>a.file===q.media?.file)))
       throw Error("média manquant dans le manifeste : "+entry.id);
     mediaCount+=await ensureActivityAssets(entry.id,entry.assets);
     await installPack(data);
     versions.set(entry.id,entry.version);
     bundleCount++;
    }
   }catch(e){errors.push("activités avec médias : "+(e instanceof Error?e.message:"réseau"))}
  }

  // Optional catalog: old manifests still work, and pack errors cannot prevent
  // a verified catalog update from installing.
  if(body.catalog!==undefined){
   try{
    const descriptor=body.catalog;
    if(!Number.isSafeInteger(descriptor.version)||descriptor.version<1||
       typeof descriptor.url!=="string"||!sameOriginOrHttps(descriptor.url)||
       typeof descriptor.sha256!=="string"||!/^[a-f0-9]{64}$/i.test(descriptor.sha256))
     throw new Error("référence catalogue invalide");
    const current=await getRemoteCatalog();
    if(!current||descriptor.version>current.version){
     const answer=await fetch(descriptor.url,{cache:"no-store",signal:AbortSignal.timeout(12000)});
     if(!answer.ok)throw new Error("catalogue indisponible ("+answer.status+")");
     const raw=await answer.text();
     const data=await verifyRemoteCatalog(raw,descriptor);
     catalogUpdated=await installRemoteCatalog(data);
    }
   }catch(e){errors.push("organisation : "+(e instanceof Error?e.message:"réseau"))}
  }
  const updated=count>0||bundleCount>0||catalogUpdated;
  const changes=[
   count?count+" nouveau(x) pack(s) installé(s)":"",bundleCount?bundleCount+" activité(s) et "+mediaCount+" média(s) installés":"",catalogUpdated?"Organisation des matières mise à jour":""
  ].filter(Boolean).join(". ");
  const warning=errors.length?" Attention : "+errors.join(" ; ")+".":"";
  return updated?
    {kind:"success",message:changes+"."+warning}:
    {kind:"info",message:errors.length?
      "Les contenus locaux restent disponibles. Mise à jour partiellement indisponible : "+errors.join(" ; ")+"."
      :"Tous les exercices et l'organisation des matières sont à jour."};
 }catch(e){
  return {kind:"info",message:"Les contenus locaux restent disponibles. Mise à jour distante indisponible ("+
   (e instanceof Error?e.message:"réseau")+")."};
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
