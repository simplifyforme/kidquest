import {describe, expect, it} from "vitest";
import colors from "../../site/activities/kleuren-nl/pack.json";
import type {ContentPack} from "../types";
import {isValidPack} from "./updates";
import {correctLabel, eligibleModes} from "./exerciseModes";
import {getCatalog} from "./catalog";
import catalog from "../../site/catalog.json";
import type {RemoteCatalog} from "./catalogConfig";

const pack = colors as ContentPack;
describe("downloadable Dutch colours", () => {
 it("accepts the pack and exposes it in Nederlands with its own icon", () => {
  expect(isValidPack(pack)).toBe(true);
  expect(pack.locale).toBe("nl-BE");
  expect(getCatalog([pack], catalog as RemoteCatalog).find(a => a.id === pack.id))
   .toMatchObject({category:"dutch", emoji:"🎨", kind:"quiz"});
 });
 it("keeps the swatch visible and gives vocabulary questions varied compatible modes", () => {
  const visual = pack.questions.filter(q => q.media);
  const vocabulary = pack.questions.filter(q => !q.media);
  expect(visual).toHaveLength(11);
  expect(vocabulary).toHaveLength(11);
  expect(new Set(pack.questions.map(q => q.id)).size).toBe(22);
  for (const q of visual) {
   expect(eligibleModes(q, pack.questions)).toEqual(["choice"]);
   const counterpart = vocabulary.find(v => correctLabel(v) === correctLabel(q));
   expect(counterpart).toBeDefined();
   expect(eligibleModes(counterpart!, pack.questions)).toEqual(expect.arrayContaining(["write", "letters", "matching"]));
   expect(new Set(q.answers.map(a => a.label)).size).toBe(4);
   expect(q.media!.alt).not.toContain(correctLabel(q));
  }
 });
});
