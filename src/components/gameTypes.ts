export type GameCallbacks={
 onClose:()=>void;
 /** Store the first fully solved answer (false after a mistake or hint). */
 onAttempt:(questionId:string,correctFirstTry:boolean)=>Promise<void>;
 /** Append one completed round with its score and elapsed time. */
 onComplete:(correct:number,total:number)=>Promise<void>;
 /** Start a fresh timed round after the user selects a game or retries. */
 onRoundStart:()=>void;
};
