import {describe,expect,it} from "vitest";
import {builtinPacks} from "../data/builtin";
import type {ContentPack} from "../types";
import multiplicationPack from "../../site/packs/tables-multiplication-1-10.json";
import {ALL_MODES} from "./exerciseModes";
import {getActivityQuestions,getActivities} from "./activities";
import {CATEGORIES,getCatalog,countCategory,getCategoryForActivity,isMathSubject} from "./catalog";
import {getExerciseCopy} from "./exerciseLocale";

const multiplication=multiplicationPack as ContentPack;

describe("category-first catalog and Dutch maths",()=>{
 it("keeps four categories and places plants within Nederlands",()=>{
  expect(CATEGORIES.map(c=>c.title)).toEqual(["Wiskunde","Français","Nederlands","Échecs"]);
  const catalog=getCatalog(builtinPacks);
  expect(countCategory(catalog,"math")).toBe(3);
  expect(countCategory(catalog,"french")).toBe(2);
  expect(countCategory(catalog,"dutch")).toBe(3);
  expect(countCategory(catalog,"chess")).toBe(1);
  expect(catalog.find(e=>e.id==="plant-playground")?.category).toBe("dutch");
  expect(catalog.find(e=>e.category==="chess")?.kind).toBe("lesson");
 });
 it("places every downloaded pack into the right category automatically",()=>{
  const full=[...builtinPacks,multiplication];
  const catalog=getCatalog(full);
  expect(countCategory(catalog,"math")).toBe(4);
  const entry=catalog.find(e=>e.id==="tables-multiplication-1-10");
  expect(entry?.title).toBe("Maaltafels van 1 tot 10");
  expect(entry?.category).toBe("math");
  expect(getCategoryForActivity(getActivities(full)[4],full)).toBe("math");
  expect(catalog.map(c=>c.id)).toEqual([
   "mathematiques","nombres","francais","neerlandais",
   "tables-multiplication-1-10","chess-beginner",
   "plant-playground","dutch-numbers-1000","french-verb-hunt","lichaamsdelen-nl"
  ]);
 });
 it("routes downloaded legacy nature content to Nederlands without changing its identifiers",()=>{
  const legacy:ContentPack={id:"legacy-plant-nl",version:1,title:"Planten",category:"nature",locale:"nl-BE",questions:[{id:"legacy-plant-01",subject:"dutch",skill:"plants",prompt:"Wat heeft de plant nodig?",answers:[{id:"a",label:"water"},{id:"b",label:"steen"}],correctAnswerId:"a",explanation:"Water."}]};
  const catalog=getCatalog([...builtinPacks,legacy]);
  expect(catalog.find(e=>e.id===legacy.id)?.category).toBe("dutch");
  expect(catalog.find(e=>e.id==="plant-playground")?.category).toBe("dutch");
  expect(legacy.category).toBe("nature");
 });
 it("retains all embedded math IDs and answer keys while translating everything",()=>{
  for(const pack of builtinPacks.filter(p=>p.id==="mathematiques"||p.id==="nombres")){
   expect(pack.version).toBe(2);
   expect(pack.locale).toBe("nl-BE");
   expect(pack.questions).toHaveLength(10);
   for(const question of pack.questions){
    expect(question.prompt).not.toMatch(/Combien|Comment|Quel nombre|en français|français|Que signifie|billes|bonbons/);
    expect(question.answers.some(a=>a.id===question.correctAnswerId)).toBe(true);
    expect(question.explanation.length).toBeGreaterThan(3);
   }
  }
  expect(builtinPacks[0].questions[0].id).toBe("math-01");
  expect(builtinPacks[1].questions[0].id).toBe("num-01");
  expect(builtinPacks[1].questions[0].answers[1].label).toBe("veertien");
  expect(builtinPacks[1].questions[2].answers[0].label).toBe("eenentachtig");
 });
 it("preserves all 100 multiplication questions and correct products in version two",()=>{
  expect(multiplication.id).toBe("tables-multiplication-1-10");
  expect(multiplication.version).toBe(2);
  expect(multiplication.locale).toBe("nl-BE");
  expect(multiplication.questions).toHaveLength(100);
  expect(new Set(multiplication.questions.map(q=>q.id)).size).toBe(100);
  for(const q of multiplication.questions){
   const match=/^multiplication-(\d+)-(\d+)$/.exec(q.id);
   expect(match).not.toBeNull();
   const a=Number(match![1]),b=Number(match![2]);
   expect(q.prompt).toBe("Hoeveel is "+a+" × "+b+" ?");
   expect(Number(q.answers.find(answer=>answer.id===q.correctAnswerId)?.label)).toBe(a*b);
  }
 });
 it("localizes old downloaded v1 multiplication prompts without changing IDs or answers",()=>{
  const v1={...multiplication,version:1,questions:multiplication.questions.slice(0,2).map(q=>({
   ...q,prompt:q.prompt.replace("Hoeveel is","Combien font")
  }))};
  const activity=getActivities([...builtinPacks,v1]).find(a=>a.packId===v1.id)!;
  const result=getActivityQuestions([...builtinPacks,v1],activity);
  expect(result.map(q=>q.prompt)).toEqual(v1.questions.map(q=>q.prompt.replace("Combien font","Hoeveel is")));
  expect(result.map(q=>q.id)).toEqual(v1.questions.map(q=>q.id));
  expect(v1.questions[0].prompt).toContain("Combien font");
 });
 it("translates every UI mode for math and keeps French elsewhere",()=>{
  const dutch=getExerciseCopy("nl-BE");
  const french=getExerciseCopy("fr-BE");
  for(const mode of ALL_MODES){
   expect(dutch.modes[mode]).not.toBe(french.modes[mode]);
  }
  expect(dutch.writeLabel).toBe("Schrijf het juiste antwoord:");
  expect(dutch.check).toBe("Controleer");
  expect(french.check).toBe("Vérifier");
  expect(isMathSubject("numbers")).toBe(true);
  expect(isMathSubject("math")).toBe(true);
  expect(isMathSubject("french")).toBe(false);
 });
});
