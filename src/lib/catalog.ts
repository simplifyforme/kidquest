import { getActivities } from "./activities";
import type { Activity } from "./activities";
import type { ContentPack, Subject } from "../types";

export type CategoryId="math"|"french"|"dutch"|"chess";
export type CatalogEntry=
 | {kind:"quiz";id:string;category:CategoryId;title:string;subtitle:string;emoji:string;activity:Activity}
 | {kind:"lesson";id:string;category:CategoryId;title:string;subtitle:string;emoji:string};
export type CategoryInfo={id:CategoryId;title:string;emoji:string;subtitle:string;colorClass:string;language:"nl-BE"|"fr-BE"};

export const CATEGORIES:CategoryInfo[]=[
 {id:"math",title:"Wiskunde",emoji:"🔢",subtitle:"Rekenen, getallen en maaltafels",colorClass:"math",language:"nl-BE"},
 {id:"french",title:"Français",emoji:"📖",subtitle:"Mots, vocabulaire et orthographe",colorClass:"french",language:"fr-BE"},
 {id:"dutch",title:"Nederlands",emoji:"🇳🇱",subtitle:"Découvre les mots et les verbes",colorClass:"dutch",language:"fr-BE"},
 {id:"chess",title:"Échecs",emoji:"♟️",subtitle:"Apprends les règles et les pièces",colorClass:"chess",language:"fr-BE"}
];

const subjectCategory:Record<Subject,CategoryId>={
 math:"math",numbers:"math",french:"french",dutch:"dutch"
};

export function getCategoryForActivity(activity:Activity,packs:ContentPack[]):CategoryId{
 const pack=packs.find(p=>p.id===activity.packId);
 return pack?.category??subjectCategory[activity.subject];
}

/** Data driven. Every new pack automatically appears under its subject/category. */
export function getCatalog(packs:ContentPack[]):CatalogEntry[]{
 const quizEntries:CatalogEntry[]=getActivities(packs).map(a=>({
   kind:"quiz" as const,id:a.packId,category:getCategoryForActivity(a,packs),
   title:a.title,subtitle:a.subtitle,emoji:a.emoji,activity:a
 }));
 return [...quizEntries,{
   kind:"lesson",id:"chess-beginner",category:"chess",title:"Les échecs : mes premiers pas",
   subtitle:"Cours animé avec échiquier 2D / 3D et défis",emoji:"♟️"
 }];
}
export function countCategory(entries:CatalogEntry[],category:CategoryId):number{
 return entries.filter(e=>e.category===category).length;
}
export function isMathSubject(subject:Subject):boolean{
 return subject==="math"||subject==="numbers";
}
export function isDutchMathActivity(activity:Activity):boolean{
 return isMathSubject(activity.subject);
}
