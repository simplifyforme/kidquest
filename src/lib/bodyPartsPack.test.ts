import {describe, expect, it} from "vitest";
import bodyParts from "../../site/activities/lichaamsdelen-nl/pack.json";
import catalog from "../../site/catalog.json";
import type {ContentPack} from "../types";
import type {RemoteCatalog} from "./catalogConfig";
import {getCatalog} from "./catalog";
import {isValidPack} from "./updates";
import {correctLabel, eligibleModes, isCorrectText, planModes} from "./exerciseModes";

const pack = bodyParts as ContentPack;
const expected = {
 voet:"de voet", teen:"de teen", knie:"de knie", been:"het been",
 enkel:"de enkel", heup:"de heup", haar:"het haar", hand:"de hand",
 vinger:"de vinger", duim:"de duim", elleboog:"de elleboog", rug:"de rug",
 borst:"de borst", arm:"de arm", schouder:"de schouder", hals:"de hals",
 mond:"de mond", neus:"de neus", oor:"het oor", wenkbrauw:"de wenkbrauw",
 tand:"de tand", voorhoofd:"het voorhoofd", oog:"het oog", tong:"de tong"
};

describe("downloadable school Dutch body parts", () => {
 it("installs as an independent Dutch school activity with its own icon", () => {
  expect(isValidPack(pack)).toBe(true);
  expect(pack.locale).toBe("nl-BE");
  expect(getCatalog([pack], catalog as RemoteCatalog).find(e => e.id === pack.id))
   .toMatchObject({category:"dutch", kind:"quiz", emoji:"🧍"});
 });

 it("covers precisely the 24 requested words with articles in three illustrated challenges", () => {
  expect(pack.questions).toHaveLength(72);
  expect(new Set(pack.questions.map(q => q.id)).size).toBe(72);
  expect(new Set(pack.questions.map(q => q.correctAnswerId)))
   .toEqual(new Set(Object.keys(expected)));
  for (const [word, label] of Object.entries(expected)) {
   const questions = pack.questions.filter(q => q.correctAnswerId === word);
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
  expect(isCorrectText(tongue, "de tang")).toBe(false);
 });

 it("preserves every published question ID and keeps the image in all three interactions", () => {
  for(const word of Object.keys(expected)){
   for(const oldKind of ["woord","raadsel"]){
    expect(pack.questions.some(q=>q.id===`lichaamsdelen-nl-${oldKind}-${word}`)).toBe(true);
   }
  }
  expect(pack.version).toBe(2);
  for(const q of pack.questions){
   expect(q.media).toMatchObject({type:"image",file:q.correctAnswerId+".png"});
   expect(q.media!.alt).not.toContain(correctLabel(q));
   expect(eligibleModes(q,pack.questions)).toEqual([q.responseMode]);
   for(let session=0;session<5;session++)expect(planModes([q],pack.questions,session)).toEqual([q.responseMode]);
  }
 });
});
