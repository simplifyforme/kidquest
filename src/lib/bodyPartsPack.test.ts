import {describe, expect, it} from "vitest";
import bodyParts from "../../site/activities/lichaamsdelen-nl/pack.json";
import catalog from "../../site/catalog.json";
import type {ContentPack} from "../types";
import type {RemoteCatalog} from "./catalogConfig";
import {getCatalog} from "./catalog";
import {isValidPack} from "./updates";
import {correctLabel, eligibleModes, isCorrectText, planModes, matchingPairs, normalizeAnswer} from "./exerciseModes";

const pack = bodyParts as ContentPack;
const expected = {
 voet:"voet", teen:"teen", knie:"knie", been:"been",
 enkel:"enkel", heup:"heup", haar:"haar", hand:"hand",
 vinger:"vinger", duim:"duim", elleboog:"elleboog", rug:"rug",
 borst:"borst", arm:"arm", schouder:"schouder", hals:"hals",
 mond:"mond", neus:"neus", oor:"oor", wenkbrauw:"wenkbrauw",
 tand:"tand", voorhoofd:"voorhoofd", oog:"oog", tong:"tong"
};

describe("downloadable school Dutch body parts", () => {
 it("installs as an independent Dutch school activity with its own icon", () => {
  expect(isValidPack(pack)).toBe(true);
  expect(pack.locale).toBe("nl-BE");
  expect(getCatalog([pack], catalog as RemoteCatalog).find(e => e.id === pack.id))
   .toMatchObject({category:"dutch", kind:"quiz", emoji:"🧍"});
 });

 it("covers precisely the 24 requested words without articles in three illustrated challenges", () => {
  expect(pack.questions).toHaveLength(120);
  expect(new Set(pack.questions.map(q => q.id)).size).toBe(120);
  expect(new Set(pack.questions.map(q => q.correctAnswerId)))
   .toEqual(new Set(Object.keys(expected)));
  for (const [word, label] of Object.entries(expected)) {
   const questions = pack.questions.filter(q => q.correctAnswerId === word && q.media);
   expect(questions, word).toHaveLength(3);
   expect(new Set(questions.map(q => q.skill)))
    .toEqual(new Set(["lichaamsdelen-kijk", "lichaamsdelen-schrijf", "lichaamsdelen-bouw"]));
   for (const q of questions) {
    expect(q.subject).toBe("dutch");
    expect(q.promptLocale).toBe("fr-BE");
    expect(correctLabel(q), q.id).toBe(label);
    expect(q.prompt.length).toBeLessThan(25);
    expect(q.prompt).not.toMatch(/Antwoord|Welk|Hoe|Ik /);
    expect(q.explanation.length).toBeLessThan(65);
    expect(q.explanation.toLowerCase()).toContain(label);
    expect(q.answers).toHaveLength(4);
    expect(new Set(q.answers.map(a => a.id)).size).toBe(4);
    expect(new Set(q.answers.map(a => a.label)).size).toBe(4);
    expect(q.answers.filter(a => a.id === q.correctAnswerId)).toHaveLength(1);
    expect(isCorrectText(q, label.toUpperCase()+"!")).toBe(true);
    expect(isCorrectText(q, q.answers.find(a => a.id !== word)!.label)).toBe(false);
   }
  }
  const tongue = pack.questions.find(q => q.id === "lichaamsdelen-nl-woord-tong")!;
  expect(tongue.prompt).toBe("La langue");
  expect(isCorrectText(tongue, "tang")).toBe(false);
  expect(isCorrectText(tongue, "tong")).toBe(true);
 });

 it("preserves every published question ID and keeps the image in all three interactions", () => {
  for(const word of Object.keys(expected)){
   for(const oldKind of ["woord","raadsel","bouw"]){
    expect(pack.questions.some(q=>q.id===`lichaamsdelen-nl-${oldKind}-${word}`)).toBe(true);
   }
  }
  expect(pack.version).toBe(3);
  for(const q of pack.questions.filter(q=>q.media)){
   expect(q.media).toMatchObject({type:"image",file:q.correctAnswerId+".png"});
   expect(q.media!.alt).not.toContain("de "+correctLabel(q));
   expect(eligibleModes(q,pack.questions)).toEqual([q.responseMode]);
   for(let session=0;session<5;session++)expect(planModes([q],pack.questions,session)).toEqual([q.responseMode]);
  }
 });
 it("adds 48 short word games and reaches eight different interactions without a new engine",()=>{
  const text=pack.questions.filter(q=>!q.media);
  expect(text).toHaveLength(48);
  expect(text.filter(q=>q.skill==="lichaamsdelen-terug")).toHaveLength(24);
  expect(text.filter(q=>q.skill==="lichaamsdelen-gat")).toHaveLength(24);
  for(const q of pack.questions){
   expect(q.prompt.length).toBeLessThan(30);
   expect(q.explanation.length).toBeLessThan(45);
   expect(q.answers.every(a=>! /^(de|het) /i.test(a.label))).toBe(true);
   expect(new Set(q.answers.map(a=>normalizeAnswer(a.label))).size).toBe(4);
   expect(q.explanation).not.toMatch(/\b(de|het)\b/i);
  }
  for(const q of text){
   expect(q.responseMode).toBeUndefined();
   expect(eligibleModes(q,pack.questions)).toEqual(expect.arrayContaining(["choice","write","letters","truefalse","duel","matching","memory"]));
   const pairs=matchingPairs(q,pack.questions);
   expect(new Set(pairs.map(p=>p.prompt)).size).toBe(3);
   expect(new Set(pairs.map(correctLabel)).size).toBe(3);
  }
  const modes=new Set(Array.from({length:12},(_,session)=>planModes(pack.questions,pack.questions,session)).flat());
  expect([...modes].sort()).toEqual(["choice","write","letters","missing","truefalse","duel","matching","memory"].sort());
  const reverse=text.find(q=>q.id==="lichaamsdelen-nl-terug-arm")!;
  expect(reverse.prompt).toBe("arm → FR");expect(correctLabel(reverse)).toBe("bras");expect(reverse.promptLocale).toBe("nl-BE");
  expect(isCorrectText(text.find(q=>q.id==="lichaamsdelen-nl-terug-oog")!,"oeil")).toBe(true);
  const hole=text.find(q=>q.id==="lichaamsdelen-nl-gat-arm")!;
  expect(hole.prompt).toBe("a_m · Bras");expect(correctLabel(hole)).toBe("arm");
 });

});
