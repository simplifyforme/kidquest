import {describe,expect,it} from "vitest";
import {bodyWords,makeBodyRound,bodyGap,isBodyWord,makeBodyMemory,memoryPair} from "./bodyAdventure";
import {verbMissions,mixedVerbRound,verbAdventureTips,makeVerbAdventureRound,normalizeVerbAnswer} from "./verbData";
import {getCatalog} from "../lib/catalog";
import {builtinPacks} from "../data/builtin";
import {filterVisibleActivities} from "../lib/activityVisibility";
const bundledPictures=import.meta.glob("../../site/activities/lichaamsdelen-nl/assets/*.png",{eager:true,query:"?url",import:"default"});

describe("HTML-inspired native adventures",()=>{
 it("keeps all 24 body words without articles and bundles an offline picture for each",()=>{
  expect(bodyWords).toHaveLength(24);
  expect(new Set(bodyWords.map(w=>w.id)).size).toBe(24);
  for(const w of bodyWords){
   expect(w.nl).toBe(w.id);expect(w.nl).not.toMatch(/^(de|het) /);
   expect(bundledPictures[`../../site/activities/lichaamsdelen-nl/assets/${w.id}.png`]).toBeTruthy();
   expect(isBodyWord(w.nl.toUpperCase()+"!",w.nl)).toBe(true);
   expect(isBodyWord("de "+w.nl,w.nl)).toBe(true);
  }
  expect(isBodyWord("tang","tong")).toBe(false);
  expect(isBodyWord("","arm")).toBe(false);
 });
 it("makes distinct short rounds, balanced mixed challenges and real image-word memory pairs",()=>{
  for(const mode of ["quiz","write","gaps","letters","mixed"] as const){
   const round=makeBodyRound(mode,bodyWords,()=>.3);
   expect(round).toHaveLength(8);expect(new Set(round.map(q=>q.id)).size).toBe(8);
   for(const q of round){expect(q.choices).toHaveLength(4);expect(new Set(q.choices).size).toBe(4);expect(q.choices).toContain(q.word.nl)}
   if(mode==="mixed")for(const kind of ["quiz","write","gaps","letters"])expect(round.filter(q=>q.mode===kind)).toHaveLength(2);
  }
  expect(bodyGap("elleboog")).toBe("e_l_b_o_");
  const cards=makeBodyMemory(()=>.3);expect(cards).toHaveLength(12);
  expect(new Set(cards.map(c=>c.key)).size).toBe(12);
  for(const c of cards){const partner=cards.find(p=>p.key!==c.key&&p.word.id===c.word.id)!;expect(memoryPair(c,partner)).toBe(true);expect(memoryPair(c,c)).toBe(false)}
  expect(memoryPair(cards[0],cards.find(c=>c.word.id!==cards[0].word.id)!)).toBe(false);
 });
 it("preserves all legacy verb question keys and teaches complete and one-word predicates",()=>{
  expect(verbMissions.slice(0,4).map(m=>m.id)).toEqual(["spot","infinitive","groups","final"]);
  for(const m of verbMissions.slice(0,4))m.questions.forEach((q,i)=>expect(q.id).toBe(`verbs-${m.id}-${i}`));
  expect(makeVerbAdventureRound(verbMissions[3],()=>0)).toEqual(verbMissions[3].questions);
  expect(normalizeVerbAnswer("ÊTRE !")).toBe("etre");
  expect(verbMissions).toHaveLength(7);expect(verbAdventureTips).toHaveLength(5);
  const predicate=verbMissions.find(m=>m.id==="predicate")!;
  expect(predicate.questions.find(q=>q.prompt==="Le chat dort.")?.answer).toBe("dort");
  expect(predicate.questions.find(q=>q.prompt==="Le bébé est calme.")?.answer).toBe("est calme");
  expect(predicate.questions.find(q=>q.prompt==="Lina mange une pomme.")?.answer).toBe("mange une pomme");
  for(const m of verbMissions)for(const q of m.questions){
   expect(q.explanation).toBeTruthy();expect(q.hint).toBeTruthy();
   if(q.options){expect(q.options).toContain(q.answer);expect(new Set(q.options).size).toBe(q.options.length)}
   if(q.interaction==="sentence")expect(q.options?.join(" ")).toBe(q.prompt.replace(/[.!?]$/,""));
  }
  const mixed=mixedVerbRound(()=>.2);expect(mixed).toHaveLength(10);
  expect(new Set(mixed.map(q=>q.id)).size).toBe(10);
  for(const id of ["spot","infinitive","groups","forms","predicate"])expect(mixed.filter(q=>q.id?.startsWith("verbs-"+id+"-"))).toHaveLength(2);
 });
 it("keeps the body activity ID, offline availability and parent exclusions without duplicate cards",()=>{
  const entries=getCatalog(builtinPacks);
  const body=entries.filter(e=>e.id==="lichaamsdelen-nl");expect(body).toHaveLength(1);expect(body[0]).toMatchObject({kind:"interactive",category:"dutch"});
  expect(filterVisibleActivities(entries,["lichaamsdelen-nl"]).some(e=>e.id==="lichaamsdelen-nl")).toBe(false);
 });
});
