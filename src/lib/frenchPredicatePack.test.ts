import {describe,expect,it} from "vitest";
import data from "../../site/activities/verbe-predicat-fr/pack.json";
import catalog from "../../site/catalog.json";
import type {ContentPack} from "../types";
import type {RemoteCatalog} from "./catalogConfig";
import {isValidPack} from "./updates";
import {getCatalog} from "./catalog";
import {correctLabel,eligibleModes,isCorrectText,matchingPairs,normalizeAnswer} from "./exerciseModes";
const pack=data as ContentPack;
const expected=[
 ["pomme","mange","manger","mange une pomme"],
 ["chat","dort","dormir","dort"],
 ["balle","lance","lancer","lance la balle"],
 ["repas","prépare","préparer","prépare le repas"],
 ["chien","est","être","est petit"],
 ["livre","regardons","regarder","regardons un livre"],
 ["jouets","ranges","ranger","ranges tes jouets"],
 ["enfants","jouent","jouer","jouent"]
];
describe("beginner French verbs and predicates",()=>{
 it("installs separately in French school without replacing the existing verb hunt",()=>{
  expect(isValidPack(pack)).toBe(true);
  expect(pack.locale).toBe("fr-BE");
  expect(getCatalog([pack],catalog as RemoteCatalog).find(e=>e.id===pack.id))
   .toMatchObject({kind:"quiz",category:"french",emoji:"🕵️"});
  expect(catalog.activities.find(e=>e.id==="french-verb-hunt")).toMatchObject({category:"french"});
 });
 it("teaches all three notions, including full predicates, one-word predicates and a state verb",()=>{
  expect(pack.questions).toHaveLength(32);
  expect(new Set(pack.questions.map(q=>q.id)).size).toBe(32);
  for(const [key,verb,inf,predicate] of expected){
   for(const [suffix,answer] of [["conjugue",verb],["infinitif",inf],["predicat",predicate]]){
    const q=pack.questions.find(q=>q.id===`verbe-predicat-fr-${key}-${suffix}`)!;
    expect(q).toBeDefined();expect(correctLabel(q)).toBe(answer);
    expect(q.explanation).toContain(answer);
   }
   const q=pack.questions.find(q=>q.id===`verbe-predicat-fr-${key}-forme`)!;
   expect(["infinitif","verbe conjugué"]).toContain(correctLabel(q));
  }
  const state=pack.questions.find(q=>q.id==="verbe-predicat-fr-chien-conjugue")!;
  expect(state.explanation).toContain("état");
  const pred=pack.questions.find(q=>q.id==="verbe-predicat-fr-chien-predicat")!;
  expect(isCorrectText(pred,"est")).toBe(false);
  expect(isCorrectText(pred,"est petit")).toBe(true);
 });
 it("keeps questions short and self-contained in every eligible game",()=>{
  for(const q of pack.questions){
   expect(q.subject).toBe("french");expect(q.prompt.length).toBeLessThan(180);
   expect(q.explanation.length).toBeLessThan(280);
   expect(new Set(q.answers.map(a=>normalizeAnswer(a.label))).size).toBe(q.answers.length);
   expect(q.answers.filter(a=>a.id===q.correctAnswerId)).toHaveLength(1);
   expect(isCorrectText(q,correctLabel(q).toUpperCase()+"!")).toBe(true);
   for(const a of q.answers.filter(a=>a.id!==q.correctAnswerId))expect(isCorrectText(q,a.label)).toBe(false);
   expect(eligibleModes(q,pack.questions)).toEqual(expect.arrayContaining(["choice","write","matching","memory"]));
   expect(new Set(matchingPairs(q,pack.questions).map(correctLabel)).size).toBe(3);
   expect(q.media).toBeUndefined();
  }
 });
});
