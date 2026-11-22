import {describe, expect, it} from "vitest";
import bodyParts from "../../site/activities/lichaamsdelen-nl/pack.json";
import catalog from "../../site/catalog.json";
import type {ContentPack} from "../types";
import type {RemoteCatalog} from "./catalogConfig";
import {getCatalog} from "./catalog";
import {isValidPack} from "./updates";
import {correctLabel, eligibleModes, isCorrectText, matchingPairs} from "./exerciseModes";

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

 it("covers precisely the 24 requested words with articles in vocabulary and riddle questions", () => {
  expect(pack.questions).toHaveLength(48);
  expect(new Set(pack.questions.map(q => q.id)).size).toBe(48);
  expect(new Set(pack.questions.map(q => q.correctAnswerId)))
   .toEqual(new Set(Object.keys(expected)));
  for (const [word, label] of Object.entries(expected)) {
   const questions = pack.questions.filter(q => q.correctAnswerId === word);
   expect(questions, word).toHaveLength(2);
   expect(new Set(questions.map(q => q.skill)))
    .toEqual(new Set(["lichaamsdelen-woord", "lichaamsdelen-raadsel"]));
   for (const q of questions) {
    expect(q.subject).toBe("dutch");
    expect(correctLabel(q), q.id).toBe(label);
    expect(q.prompt).toContain("Antwoord met de of het.");
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
  expect(tongue.prompt).toContain("la langue (dans la bouche)");
  expect(isCorrectText(tongue, "de tang")).toBe(false);
 });

 it("supports writing and word games with three distinct, self-contained matching pairs", () => {
  for (const q of pack.questions) {
   expect(eligibleModes(q, pack.questions)).toEqual(expect.arrayContaining([
    "choice", "write", "letters", "missing", "matching", "memory"
   ]));
   const pairs = matchingPairs(q, pack.questions);
   expect(pairs).toHaveLength(3);
   expect(new Set(pairs.map(correctLabel)).size).toBe(3);
   expect(new Set(pairs.map(p => p.prompt)).size).toBe(3);
   expect(q.media).toBeUndefined();
  }
 });
});
