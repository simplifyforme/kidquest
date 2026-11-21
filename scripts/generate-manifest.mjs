import { readdir,readFile,writeFile } from "node:fs/promises";
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
await writeFile("site/manifest.json",JSON.stringify({schemaVersion:1,packs},null,2)+"\n");
console.log("Generated manifest for",packs.length,"pack(s)");
