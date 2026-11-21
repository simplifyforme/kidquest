const ones=["","een","twee","drie","vier","vijf","zes","zeven","acht","negen"];
const under20=["nul","één","twee","drie","vier","vijf","zes","zeven","acht","negen","tien","elf","twaalf","dertien","veertien","vijftien","zestien","zeventien","achttien","negentien"];
const tens=["","","twintig","dertig","veertig","vijftig","zestig","zeventig","tachtig","negentig"];
/** The original 0–1000 rules from nederlandse_getallen_oefenen.html. */
export function numberToDutch(n:number):string{
 if(!Number.isInteger(n)||n<0||n>1000)throw Error("Ongeldig getal");
 if(n===1000)return "duizend";
 if(n<20)return under20[n];
 if(n<100){
  const t=Math.floor(n/10),u=n%10;
  if(!u)return tens[t];
  return ones[u]+((u===2||u===3)?"ën":"en")+tens[t];
 }
 const h=Math.floor(n/100),rest=n%100;
 return (h===1?"honderd":ones[h]+"honderd")+(rest?numberToDutch(rest):"");
}
export function normalizeDutchNumber(value:string):string{
 return value.toLocaleLowerCase("nl").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/[\s\-’']/g,"").trim();
}
export type NumberLevel="easy"|"medium"|"hard"|"all";
export type NumberDirection="number"|"words"|"mixed";
export type NumberPractice="normal"|"tricky";
export type NumberQuestion={n:number;mode:"number"|"words"};
function random(min:number,max:number,rand:()=>number){return Math.floor(rand()*(max-min+1))+min}
export function makeDutchNumberSession(level:NumberLevel,direction:NumberDirection,length:number,practice:NumberPractice,rand:()=>number=Math.random):NumberQuestion[]{
 if(!Number.isInteger(length)||length<1||length>50)throw Error("Ongeldig aantal vragen");
 const [min,max]=level==="easy"?[0,20]:level==="medium"?[21,100]:level==="hard"?[101,1000]:[0,1000];
 const seen=new Set<number>(),questions:NumberQuestion[]=[];
 for(let i=0;i<length;i++){
  let n=random(min,max,rand),tries=0;
  do{
   n=random(min,max,rand);
   if(practice==="tricky"&&(n%100<21||n%10===0))continue;
   if(!seen.has(n))break;
   tries++;
  }while(tries<150);
  // Avoid endless retries when too many questions are requested for the available range.
  if(seen.has(n)){
   const alternative=Array.from({length:max-min+1},(_,offset)=>min+offset)
    .find(k=>!seen.has(k)&&(practice!=="tricky"||(k%100>=21&&k%10!==0)));
   if(alternative!==undefined)n=alternative;
  }
  seen.add(n);
  questions.push({n,mode:direction==="mixed"?(i%2===0?"number":"words"):direction});
 }
 // Shuffle the questions, preserving their word/number modes.
 for(let i=questions.length-1;i>0;i--){const j=random(0,i,rand);[questions[i],questions[j]]=[questions[j],questions[i]]}
 return questions;
}
export function checkDutchNumber(input:string,question:NumberQuestion):boolean{
 if(question.mode==="number")return /^\d+$/.test(input.trim())&&Number(input.trim())===question.n;
 return normalizeDutchNumber(input)===normalizeDutchNumber(numberToDutch(question.n));
}
export function numberHint(question:NumberQuestion):string{
 if(question.mode==="number"){
  const n=question.n,h=Math.floor(n/100),t=Math.floor(n%100/10),u=n%10;
  return n===1000?"Het is tien keer honderd.":n<20?"Het ligt tussen 0 en 20.":(h?"Honderdtallen: "+h+" · ":"")+"Tientallen: "+t+" · Eenheden: "+u;
 }
 const value=numberToDutch(question.n),cut=Math.max(2,Math.ceil(value.length/3));
 return "Het woord begint met “"+value.slice(0,cut)+"…” en heeft "+value.length+" letters.";
}
