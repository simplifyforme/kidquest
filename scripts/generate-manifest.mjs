import { readdir,readFile,writeFile } from "node:fs/promises";
import {join} from "node:path";
import { createHash } from "node:crypto";
const base="https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/";
const files=(await readdir("site/packs")).filter(x=>x.endsWith(".json")).sort();
const packs=[];
for(const file of files){
 const bytes=await readFile("site/packs/"+file);
 const data=JSON.parse(bytes.toString("utf8"));
 if(!/^[a-z0-9-]+$/.test(data.id)||!Number.isSafeInteger(data.version))throw new Error("Invalid pack "+file);
 packs.push({id:data.id,version:data.version,url:base+"packs/"+file,sha256:createHash("sha256").update(bytes).digest("hex")});
}
const catalogBytes=await readFile("site/catalog.json");
const catalog=JSON.parse(catalogBytes.toString("utf8"));
if(catalog.schemaVersion!==1||!Number.isSafeInteger(catalog.version)||catalog.version<1)
 throw Error("Invalid catalog version");
const catalogDescriptor={version:catalog.version,url:base+"catalog.json",sha256:createHash("sha256").update(catalogBytes).digest("hex")};
const activities=[];
const folders=(await readdir("site/activities",{withFileTypes:true})).filter(x=>x.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name));
const mimes={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",gif:"image/gif",mp4:"video/mp4",webm:"video/webm",mp3:"audio/mpeg",ogg:"audio/ogg",wav:"audio/wav"};
for(const folder of folders){
 if(!/^[a-z0-9-]{1,60}$/.test(folder.name))throw Error("Invalid activity folder "+folder.name);
 const path=join("site/activities",folder.name);
 const bytes=await readFile(join(path,"pack.json"));
 const data=JSON.parse(bytes.toString("utf8"));
 if(data.id!==folder.name||!Number.isSafeInteger(data.version)||data.version<1||!Array.isArray(data.questions))
  throw Error("Invalid activity package "+folder.name);
 let files=[];
 try{files=(await readdir(join(path,"assets"),{withFileTypes:true})).filter(x=>x.isFile()).sort((a,b)=>a.name.localeCompare(b.name))}
 catch(e){if(e.code!=="ENOENT")throw e}
 const assets=[];
 let totalSize=0;
 for(const file of files){
  if(!/^[a-z0-9][a-z0-9_-]{0,70}\.(jpg|jpeg|png|webp|gif|mp4|webm|mp3|ogg|wav)$/.test(file.name))
   throw Error("Unsupported media file "+file.name);
  const binary=await readFile(join(path,"assets",file.name));
  if(!binary.length||binary.length>20_000_000)throw Error("Invalid file size "+file.name);
  totalSize+=binary.length;
  const ext=file.name.split(".").pop();
  assets.push({file:file.name,url:base+"activities/"+folder.name+"/assets/"+file.name,sha256:createHash("sha256").update(binary).digest("hex"),bytes:binary.length,mime:mimes[ext]});
 }
 if(totalSize>60_000_000)throw Error("Activity bundle too large "+folder.name);
 for(const q of data.questions){
  if(q.media&&!assets.some(a=>a.file===q.media.file))throw Error("Media missing for "+q.id);
 }
 activities.push({id:data.id,version:data.version,url:base+"activities/"+folder.name+"/pack.json",sha256:createHash("sha256").update(bytes).digest("hex"),assets});
}
await writeFile("site/manifest.json",JSON.stringify({schemaVersion:1,packs,catalog:catalogDescriptor,activities},null,2)+"\n");

console.log("Generated manifest for",packs.length,"pack(s) and",activities.length,"activity folders");
