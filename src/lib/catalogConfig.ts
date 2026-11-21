import { CATEGORIES } from "./catalog";
import type { CategoryInfo } from "./catalog";

export type CategoryDefinition = CategoryInfo & {order?:number};
export type ActivityPresentation = {
 id:string;category?:string;title?:string;subtitle?:string;emoji?:string;order?:number;
};
export type RemoteCatalog = {
 schemaVersion:1;version:number;
 categories:CategoryDefinition[];
 activities:ActivityPresentation[];
};
const ID=/^[a-z0-9][a-z0-9-]{0,79}$/;
const COLOR_CLASSES=new Set(["math","french","dutch","chess","nature"]);
const LANGUAGES=new Set(["fr-BE","nl-BE"]);
const isObject=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==="object"&&!Array.isArray(x);
const safeText=(x:unknown,max:number):x is string=>
 typeof x==="string"&&x.length>0&&x.length<=max&&
 !/[\u0000-\u001f\u007f<>]/.test(x) && !/^\s*$/.test(x);
const safeOrder=(x:unknown)=>x===undefined||(Number.isInteger(x)&&Number(x)>=0&&Number(x)<=10000);

/**
 * Configuration is presentation data ONLY. No URLs, HTML, components or executable
 * scripts may be supplied by the catalog.
 */
export function isValidRemoteCatalog(raw:unknown):raw is RemoteCatalog{
 if(!isObject(raw)||raw.schemaVersion!==1||!Number.isSafeInteger(raw.version)||
    Number(raw.version)<1||!Array.isArray(raw.categories)||raw.categories.length>24||
    !Array.isArray(raw.activities)||raw.activities.length>300)return false;
 const known=new Set<string>(CATEGORIES.map(c=>c.id));
 const categories=new Set<string>();
 for(const rawCategory of raw.categories){
  if(!isObject(rawCategory)||typeof rawCategory.id!=="string"||!ID.test(rawCategory.id)||
    categories.has(rawCategory.id)||!safeText(rawCategory.title,64)||
    !safeText(rawCategory.subtitle,160)||!safeText(rawCategory.emoji,16)||
    !COLOR_CLASSES.has(String(rawCategory.colorClass))||
    !LANGUAGES.has(String(rawCategory.language))||!safeOrder(rawCategory.order))return false;
  categories.add(rawCategory.id);known.add(rawCategory.id);
 }
 const ids=new Set<string>();
 for(const rawActivity of raw.activities){
  if(!isObject(rawActivity)||typeof rawActivity.id!=="string"||!ID.test(rawActivity.id)||
     ids.has(rawActivity.id)||!safeOrder(rawActivity.order))return false;
  ids.add(rawActivity.id);
  if(rawActivity.category!==undefined&&(!ID.test(String(rawActivity.category))||
     !known.has(String(rawActivity.category))))return false;
  if(rawActivity.title!==undefined&&!safeText(rawActivity.title,100))return false;
  if(rawActivity.subtitle!==undefined&&!safeText(rawActivity.subtitle,180))return false;
  if(rawActivity.emoji!==undefined&&!safeText(rawActivity.emoji,16))return false;
 }
 return true;
}

export function resolveCategories(config:RemoteCatalog|null):CategoryInfo[]{
 if(!config)return CATEGORIES;
 const overrides=new Map(config.categories.map(c=>[c.id,c]));
 const base=CATEGORIES.map(c=>({...c,...overrides.get(c.id)}));
 const extras=config.categories.filter(c=>!CATEGORIES.some(base=>base.id===c.id));
 return [...base,...extras].sort((a,b)=>{
  const aOrder=overrides.get(a.id)?.order??CATEGORIES.findIndex(c=>c.id===a.id);
  const bOrder=overrides.get(b.id)?.order??CATEGORIES.findIndex(c=>c.id===b.id);
  return (aOrder<0?999:aOrder)-(bOrder<0?999:bOrder);
 });
}
