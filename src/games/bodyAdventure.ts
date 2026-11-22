import {normalizeAnswer} from "../lib/exerciseModes";
export type BodyWord={id:string;fr:string;nl:string};
export type BodyMode="quiz"|"write"|"gaps"|"letters";
export type BodyChallenge={id:string;word:BodyWord;mode:BodyMode;choices:string[]};
export const bodyWords:BodyWord[]=[
 {
  "id": "voet",
  "fr": "pied",
  "nl": "voet"
 },
 {
  "id": "teen",
  "fr": "orteil",
  "nl": "teen"
 },
 {
  "id": "knie",
  "fr": "genou",
  "nl": "knie"
 },
 {
  "id": "been",
  "fr": "jambe",
  "nl": "been"
 },
 {
  "id": "enkel",
  "fr": "cheville",
  "nl": "enkel"
 },
 {
  "id": "heup",
  "fr": "hanche",
  "nl": "heup"
 },
 {
  "id": "haar",
  "fr": "cheveux",
  "nl": "haar"
 },
 {
  "id": "hand",
  "fr": "main",
  "nl": "hand"
 },
 {
  "id": "vinger",
  "fr": "doigt",
  "nl": "vinger"
 },
 {
  "id": "duim",
  "fr": "pouce",
  "nl": "duim"
 },
 {
  "id": "elleboog",
  "fr": "coude",
  "nl": "elleboog"
 },
 {
  "id": "rug",
  "fr": "dos",
  "nl": "rug"
 },
 {
  "id": "borst",
  "fr": "poitrine",
  "nl": "borst"
 },
 {
  "id": "arm",
  "fr": "bras",
  "nl": "arm"
 },
 {
  "id": "schouder",
  "fr": "épaule",
  "nl": "schouder"
 },
 {
  "id": "hals",
  "fr": "cou",
  "nl": "hals"
 },
 {
  "id": "mond",
  "fr": "bouche",
  "nl": "mond"
 },
 {
  "id": "neus",
  "fr": "nez",
  "nl": "neus"
 },
 {
  "id": "oor",
  "fr": "oreille",
  "nl": "oor"
 },
 {
  "id": "wenkbrauw",
  "fr": "sourcil",
  "nl": "wenkbrauw"
 },
 {
  "id": "tand",
  "fr": "dent",
  "nl": "tand"
 },
 {
  "id": "voorhoofd",
  "fr": "front",
  "nl": "voorhoofd"
 },
 {
  "id": "oog",
  "fr": "œil",
  "nl": "oog"
 },
 {
  "id": "tong",
  "fr": "langue",
  "nl": "tong"
 }
];
export function shuffled<T>(items:readonly T[],random:()=>number=Math.random):T[]{
 const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result;
}
export function bodyGap(word:string):string{return Array.from(word).map((c,i)=>i%2?"_":c).join("")}
export function isBodyWord(value:string,expected:string):boolean{
 const bare=value.trim().replace(/^(de|het)\s+/i,"");return !!bare&&normalizeAnswer(bare)===normalizeAnswer(expected);
}
export function makeBodyRound(mode:BodyMode|"mixed",pool:readonly BodyWord[]=bodyWords,random:()=>number=Math.random):BodyChallenge[]{
 const kinds:BodyMode[]=["quiz","write","gaps","letters"];
 return shuffled(pool,random).slice(0,8).map((word,index)=>({id:`adventure-${mode==="mixed"?kinds[index%4]:mode}-${word.id}`,word,
  mode:mode==="mixed"?kinds[index%4]:mode,
  choices:shuffled([word,...shuffled(pool.filter(w=>w.id!==word.id),random).slice(0,3)],random).map(w=>w.nl)}));
}
export type BodyMemoryCard={key:string;word:BodyWord;kind:"picture"|"word"};
export function makeBodyMemory(random:()=>number=Math.random):BodyMemoryCard[]{
 return shuffled(shuffled(bodyWords,random).slice(0,6).flatMap(word=>[
  {key:word.id+"-picture",word,kind:"picture" as const},{key:word.id+"-word",word,kind:"word" as const}
 ]),random);
}
export function memoryPair(a:BodyMemoryCard,b:BodyMemoryCard):boolean{return a.word.id===b.word.id&&a.kind!==b.kind}
