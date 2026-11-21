import {describe,expect,it} from "vitest";
import {plantGames,plantSteps,isPlantAnswerCorrect} from "./plantData";
import {verbMissions,verbLessonNotes,normalizeVerbAnswer} from "./verbData";
import {checkDutchNumber,makeDutchNumberSession,numberHint,numberToDutch,normalizeDutchNumber} from "./dutchNumbers";
import {builtinPacks} from "../data/builtin";
import {getCatalog} from "../lib/catalog";
import {filterVisibleActivities,isActivityVisible} from "../lib/activityVisibility";

describe("imported original HTML educational activities",()=>{
 it("preserves all six plant games, 33 prompts and native modes",()=>{
  expect(plantGames.map(g=>g.id)).toEqual(["detective","needs","functions","growth","bulb","write"]);
  expect(plantGames.map(g=>g.items.length)).toEqual([6,6,5,2,6,8]);
  expect(plantGames.every(g=>g.items.every(i=>i.prompt&&i.answer))).toBe(true);
  const growth=plantGames.find(g=>g.id==="growth")!;
  expect(plantSteps(growth.items[0])).toEqual(["zaad","kieming","jonge plant","volwassen plant","bloem","vrucht met zaden"]);
  const written=plantGames.find(g=>g.id==="write")!;
  expect(isPlantAnswerCorrect(written.items[3],"de wortel!")).toBe(true);
  expect(isPlantAnswerCorrect(written.items[5],"stengelknol")).toBe(true);
  expect(isPlantAnswerCorrect(written.items[5],"aardappel")).toBe(false);
  expect(written.items.every(i=>!!i.hint)).toBe(true);
 });
 it("preserves all four verb missions, 37 questions and lessons",()=>{
  expect(verbMissions.map(m=>m.questions.length)).toEqual([8,10,10,9]);
  expect(verbLessonNotes).toHaveLength(7);
  const all=verbMissions.flatMap(m=>m.questions);
  expect(all.every(q=>q.question&&q.prompt&&q.answer&&q.explanation&&q.hint)).toBe(true);
  expect(all.some(q=>q.options===null)).toBe(true);
  expect(all.some(q=>q.prompt.includes("<mark>"))).toBe(true);
  expect(all.find(q=>q.prompt.includes("La <mark>porte"))?.answer).toBe("C’est un autre mot");
  expect(normalizeVerbAnswer("  FINIR ! ")).toBe("finir");
 });
 it("spells 0 to 1000 in Belgian Dutch without truncating accents",()=>{
  expect(numberToDutch(0)).toBe("nul");
  expect(numberToDutch(14)).toBe("veertien");
  expect(numberToDutch(21)).toBe("eenentwintig");
  expect(numberToDutch(32)).toBe("tweeëndertig");
  expect(numberToDutch(42)).toBe("tweeënveertig");
  expect(numberToDutch(75)).toBe("vijfenzeventig");
  expect(numberToDutch(101)).toBe("honderdeen");
  expect(numberToDutch(106)).toBe("honderdzes");
  expect(numberToDutch(342)).toBe("driehonderdtweeënveertig");
  expect(numberToDutch(1000)).toBe("duizend");
  expect(()=>numberToDutch(1001)).toThrow();
  expect(normalizeDutchNumber("Twee-en-veertig")).toBe("tweeenveertig");
  expect(checkDutchNumber("twee-en-veertig",{n:42,mode:"words"})).toBe(true);
  expect(checkDutchNumber("42",{n:42,mode:"number"})).toBe(true);
  expect(checkDutchNumber("43",{n:42,mode:"number"})).toBe(false);
 });
 it("keeps mixed number modes, difficulty ranges and hints with deterministic unique questions",()=>{
  for(const level of ["easy","medium","hard","all"] as const){
   const items=makeDutchNumberSession(level,"mixed",10,"normal",()=>0);
   expect(items).toHaveLength(10);
   expect(new Set(items.map(q=>q.n)).size).toBe(10);
   expect(items.filter(q=>q.mode==="number")).toHaveLength(5);
   expect(items.filter(q=>q.mode==="words")).toHaveLength(5);
   expect(items.every(q=>q.n>= (level==="medium"?21:level==="hard"?101:0))).toBe(true);
  }
  // Even in easy 0-20, the 'tricky tens' option cannot hang the generator.
  const beginner=makeDutchNumberSession("easy","number",5,"tricky",()=>0);
  expect(beginner).toHaveLength(5);
  expect(numberHint({n:342,mode:"number"})).toContain("Honderdtallen");
  expect(numberHint({n:342,mode:"words"})).toContain("Het woord begint");
 });
 it("makes every new course visible by default while opt-outs remain hidden",()=>{
  const entries=getCatalog(builtinPacks);
  expect(entries.find(e=>e.id==="plant-playground")?.category).toBe("nature");
  expect(entries.find(e=>e.id==="dutch-numbers-1000")?.category).toBe("math");
  expect(entries.find(e=>e.id==="french-verb-hunt")?.category).toBe("french");
  expect(filterVisibleActivities(entries,[])).toHaveLength(entries.length);
  expect(isActivityVisible("a-future-pack-not-yet-downloaded",["francais"])).toBe(true);
  const afterHide=filterVisibleActivities(entries,["francais","plant-playground"]);
  expect(afterHide.some(e=>e.id==="francais")).toBe(false);
  expect(afterHide.some(e=>e.id==="plant-playground")).toBe(false);
  expect(afterHide.some(e=>e.id==="dutch-numbers-1000")).toBe(true);
  expect(filterVisibleActivities(entries,[])).toHaveLength(entries.length);
 });
});
