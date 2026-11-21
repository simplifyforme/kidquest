import {readdir,readFile,mkdir,writeFile,stat} from "node:fs/promises";
import {join} from "node:path";
const root="site/activities";
const folders=await readdir(root,{withFileTypes:true});
for(const folder of folders.filter(x=>x.isDirectory())){
 const base=join(root,folder.name);
 let sources=[];
 try{sources=JSON.parse(await readFile(join(base,"photo-sources.json"),"utf8"))}catch(e){
  if(e?.code==="ENOENT")continue;throw e
 }
 if(!Array.isArray(sources)||sources.length>30)throw Error("Invalid media source declaration");
 await mkdir(join(base,"assets"),{recursive:true});
 for(const source of sources){
  if(!/^[a-z0-9_-]{1,70}\.jpg$/.test(source.file)||typeof source.commonsFile!=="string"||
     !source.source?.startsWith("https://commons.wikimedia.org/wiki/File:")||source.license!=="CC0 1.0")
   throw Error("Invalid photo source declaration for "+folder.name);
  const dest=join(base,"assets",source.file);
  try{if((await stat(dest)).size>0){console.log("Already available",dest);continue}}catch(e){if(e.code!=="ENOENT")throw e}
  const url="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(source.commonsFile)+"?width=480";
  let bytes=null;
  for(let tries=0;tries<3;tries++){
   try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{"User-Agent":"KidQuest-Educational-Content/1.0 (https://github.com/simplifyforme/kidquest)"}});
    if(!response.ok)throw Error("HTTP "+response.status);
    const body=Buffer.from(await response.arrayBuffer());
    if(body.length<200||body.length>2_000_000||body[0]!==0xff||body[1]!==0xd8)
      throw Error("Unexpected content, JPEG required");
    bytes=body;break;
   }catch(e){console.log("Attempt",tries+1,"failed for",source.commonsFile, String(e))}
  }
  if(!bytes)throw Error("Could not fetch licensed photograph "+source.commonsFile);
  await writeFile(dest,bytes);
  console.log("Downloaded",dest,bytes.length,"bytes");
 }
}
