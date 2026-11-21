import {useEffect,useState} from "react";
import type {QuestionMedia as Media} from "../types";
import {activityMime,cachedActivityAsset} from "../lib/activityAssets";

export default function QuestionMedia({activityId,media}:{activityId:string;media:Media}){
 const [source,setSource]=useState<string|null>(null);
 const [missing,setMissing]=useState(false);
 useEffect(()=>{
  let cancelled=false;
  let url:string|null=null;
  setSource(null);setMissing(false);
  cachedActivityAsset(activityId,media.file).then(bytes=>{
   if(cancelled)return;
   if(!bytes){setMissing(true);return}
   url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:activityMime(media.file)}));
   setSource(url);
  }).catch(()=>{if(!cancelled)setMissing(true)});
  return ()=>{cancelled=true;if(url)URL.revokeObjectURL(url)};
 },[activityId,media.file]);
 if(missing)return <p className="question-media-missing" role="status">📷 Photo non disponible hors ligne. Vérifie les mises à jour dans Paramètres.</p>;
 if(!source)return <div className="question-media-loading" role="status">Chargement de l’image…</div>;
 return <figure className="question-media">
  {(media.type==="image"||media.type==="gif")&&<img src={source} alt={media.alt} loading="eager"/>}
  {media.type==="video"&&<video src={source} controls preload="metadata" playsInline aria-label={media.alt}/>}
  {media.type==="audio"&&<audio src={source} controls preload="metadata" aria-label={media.alt}/>}
 </figure>;
}
