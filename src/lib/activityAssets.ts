import {isTauri,invoke} from "@tauri-apps/api/core";
import type {ActivityAssetManifest,QuestionMedia} from "../types";

const knownExtensions:Record<string,string>={
 jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",
 gif:"image/gif",mp4:"video/mp4",webm:"video/webm",
 mp3:"audio/mpeg",ogg:"audio/ogg",wav:"audio/wav"
};
const storagePrefix="kidquest.activity.media.";
const filePattern=/^[a-z0-9][a-z0-9_-]{0,70}\.(jpg|jpeg|png|webp|gif|mp4|webm|mp3|ogg|wav)$/;
const idPattern=/^[a-z0-9][a-z0-9-]{0,60}$/;
const maxAsset=20_000_000;
const maxBundle=60_000_000;
const repoBase="https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/activities/";

export function validActivityAsset(activityId:string,item:unknown):item is ActivityAssetManifest{
 if(!idPattern.test(activityId)||!item||typeof item!=="object")return false;
 const a=item as Partial<ActivityAssetManifest>;
 if(typeof a.file!=="string"||!filePattern.test(a.file)||
    typeof a.mime!=="string"||knownExtensions[a.file.split(".").pop()||""]!==a.mime||
    typeof a.url!=="string"||
    a.url!==repoBase+activityId+"/assets/"+a.file||
    typeof a.bytes!=="number"||!Number.isSafeInteger(a.bytes)||a.bytes<=0||a.bytes>maxAsset||
    typeof a.sha256!=="string"||!/^[a-f0-9]{64}$/i.test(a.sha256))return false;
 return true;
}
export function validateActivityAssets(activityId:string,items:unknown):items is ActivityAssetManifest[]{
 if(!Array.isArray(items)||items.length>80)return false;
 if(new Set(items.map(x=>(x as ActivityAssetManifest)?.file)).size!==items.length)return false;
 return items.every(x=>validActivityAsset(activityId,x))&&items.reduce<number>((sum,x)=>sum+(x as ActivityAssetManifest).bytes,0)<=maxBundle;
}
export function validQuestionMedia(media:unknown):media is QuestionMedia{
 if(!media||typeof media!=="object")return false;
 const m=media as Partial<QuestionMedia>;
 if(typeof m.file!=="string"||!filePattern.test(m.file)||
    !["image","gif","video","audio"].includes(String(m.type))||
    typeof m.alt!=="string"||m.alt.length<1||m.alt.length>130)return false;
 const mime=knownExtensions[m.file.split(".").pop()||""];
 return m.type==="gif"?mime==="image/gif":
    m.type==="image"?mime.startsWith("image/"):m.type==="video"?mime.startsWith("video/"):mime.startsWith("audio/");
}
async function digest(data:Uint8Array):Promise<string>{
 const hash=await crypto.subtle.digest("SHA-256",new Uint8Array(data));
 return Array.from(new Uint8Array(hash)).map(n=>n.toString(16).padStart(2,"0")).join("");
}
function encode(bytes:Uint8Array):string{
 let str="";const step=32768;
 for(let i=0;i<bytes.length;i+=step)
  str+=String.fromCharCode(...bytes.slice(i,i+step));
 return btoa(str);
}
function decode(value:string):Uint8Array{
 const binary=atob(value);const result=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)result[i]=binary.charCodeAt(i);
 return result;
}
/** Real Windows path: %LOCALAPPDATA%/be.kidquest.academy/activities/<id>/assets/<filename>.
 * The native command checks that every segment stays within the application's directory. */
export async function cachedActivityAsset(activityId:string,filename:string):Promise<Uint8Array|null>{
 if(!idPattern.test(activityId)||!filePattern.test(filename))return null;
 try{
  if(isTauri()){
   const exists=await invoke<boolean>("activity_asset_exists",{activityId,filename});
   return exists?new Uint8Array(await invoke<number[]>("read_activity_asset",{activityId,filename})):null;
  }
  const value=localStorage.getItem(storagePrefix+activityId+"/"+filename);
  return value?decode(value):null;
 }catch{return null}
}
async function saveActivityAsset(activityId:string,filename:string,bytes:Uint8Array):Promise<void>{
 if(isTauri()){
  await invoke("save_activity_asset",{activityId,filename,bytes:Array.from(bytes)});
 }else{
  localStorage.setItem(storagePrefix+activityId+"/"+filename,encode(bytes));
 }
}
/** Only download missing assets. Content is SHA-256 verified BEFORE writing locally. */
export async function ensureActivityAssets(activityId:string,assets:ActivityAssetManifest[]):Promise<number>{
 if(!validateActivityAssets(activityId,assets))throw Error("Liste de médias non valide");
 let saved=0;
 for(const asset of assets){
  const existing=await cachedActivityAsset(activityId,asset.file);
  if(existing&&existing.length===asset.bytes&&(await digest(existing))===asset.sha256.toLowerCase())continue;
  const res=await fetch(asset.url,{cache:"no-store",signal:AbortSignal.timeout(30000)});
  if(!res.ok)throw Error("Média introuvable : "+asset.file);
  const length=Number(res.headers.get("Content-Length"));
  if(length>asset.bytes)throw Error("Média plus volumineux que prévu");
  const bytes=new Uint8Array(await res.arrayBuffer());
  if(bytes.length!==asset.bytes||await digest(bytes)!==asset.sha256.toLowerCase())
   throw Error("Média corrompu : "+asset.file);
  await saveActivityAsset(activityId,asset.file,bytes);
  saved++;
 }
 return saved;
}
export function activityMime(filename:string):string{
 return knownExtensions[filename.split(".").pop()||""]||"application/octet-stream";
}
