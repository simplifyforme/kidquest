import type {CompletedSession} from "../types";

export type ActivityStats={
 count:number;best:number;average:number;totalCorrect:number;totalQuestions:number;
 shortestSeconds:number|null;lastPlayed:string|null;
};
export const EMPTY_STATS:ActivityStats={
 count:0,best:0,average:0,totalCorrect:0,totalQuestions:0,
 shortestSeconds:null,lastPlayed:null
};
/** Only completed lessons/exercises count, never abandoned attempts. */
export function activityStats(sessions:CompletedSession[],activityId:string):ActivityStats{
 const runs=sessions.filter(s=>s.activityId===activityId);
 if(!runs.length)return {...EMPTY_STATS};
 let best=0,totalCorrect=0,totalQuestions=0,shortest=Infinity,lastPlayed:string|null=null,percents=0;
 for(const r of runs){
  const percentage=Math.round(r.correct/r.total*100);
  best=Math.max(best,percentage);percents+=percentage;
  totalCorrect+=r.correct;totalQuestions+=r.total;
  shortest=Math.min(shortest,r.durationSeconds);
  if(lastPlayed===null||r.completedAt>lastPlayed)lastPlayed=r.completedAt;
 }
 return {
  count:runs.length,best,average:Math.round(percents/runs.length),
  totalCorrect,totalQuestions,shortestSeconds:shortest,lastPlayed
 };
}
export function formatDuration(seconds:number):string{
 const rounded=Math.max(0,Math.floor(seconds));
 const min=Math.floor(rounded/60);
 const sec=rounded%60;
 return min?min+" min "+String(sec).padStart(2,"0")+" s":sec+" s";
}
