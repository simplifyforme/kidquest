/** One storage write per solved challenge or completed round, including fast repeat clicks.
 * Failed writes may be retried. A new recorder is created for every replay/review. */
export function createAdventureRecorder(){
 const done=new Set<string>(),pending=new Map<string,Promise<void>>();
 return {run(key:string,write:()=>Promise<void>):Promise<void>{
  if(done.has(key))return Promise.resolve();
  const running=pending.get(key);if(running)return running;
  const task=Promise.resolve().then(write).then(()=>{done.add(key)}).finally(()=>{pending.delete(key)});
  pending.set(key,task);return task;
 }};
}
