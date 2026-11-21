import { describe, expect, it } from "vitest";
import { builtinPacks } from "../data/builtin";
import type { Question } from "../types";
import {
  ALL_MODES, correctLabel, eligibleModes, isCorrectText, isNumericAnswer,
  makeMissing, matchingPairs, normalizeAnswer, planModes, rotate
} from "./exerciseModes";

const maths = builtinPacks.find(p=>p.id==="mathematiques")!.questions;
const french = builtinPacks.find(p=>p.id==="francais")!.questions;
const numbers = builtinPacks.find(p=>p.id==="nombres")!.questions;
const dutch = builtinPacks.find(p=>p.id==="neerlandais")!.questions;
const pools = [maths,french,numbers,dutch];

describe("10 compatible exercise methods", () => {
  it("declares ten truly distinct interactions", () => {
    expect(ALL_MODES).toHaveLength(10);
    expect(new Set(ALL_MODES).size).toBe(10);
  });
  it("keeps the entire original question format, all four courses", () => {
    pools.forEach(pool => pool.forEach(q => {
      expect(correctLabel(q).length).toBeGreaterThan(0);
      expect(eligibleModes(q,pool)).toContain("choice");
      expect(eligibleModes(q,pool)).toContain("write");
      expect(eligibleModes(q,pool)).toContain("truefalse");
      expect(eligibleModes(q,pool)).toContain("duel");
    }));
  });
  it("uses all ten methods across existing materials and repeat sessions", () => {
    const encountered=new Set(pools.flatMap(pool =>
      Array.from({length:12},(_,session)=>planModes(pool,pool,session)).flat()
    ));
    expect([...encountered].sort()).toEqual([...ALL_MODES].sort());
  });
  it("never selects an ineligible mode", () => {
    for(const pool of pools) {
      for(let session=0;session<20;session++) {
        const selected=planModes(pool,pool,session);
        expect(selected).toHaveLength(pool.length);
        selected.forEach((mode,i)=>expect(eligibleModes(pool[i],pool)).toContain(mode));
      }
    }
  });
  it("accepts case/accent differences but not incorrect meanings", () => {
    expect(normalizeAnswer("ÉLÉPHANT !")).toBe(normalizeAnswer("elephant"));
    expect(isCorrectText(french[0],"Un éléphant")).toBe(true);
    expect(isCorrectText(french[0],"un chien")).toBe(false);
  });
  it("shows numeric slider only for numeric answers", () => {
    expect(isNumericAnswer(maths[0])).toBe(true);
    expect(isNumericAnswer(french[0])).toBe(false);
    expect(eligibleModes(maths[0],maths)).toContain("numberline");
    expect(eligibleModes(french[0],french)).not.toContain("numberline");
  });
  it("forms 3 distinct matching pairs without duplicate answers", () => {
    const three=matchingPairs(dutch[0],dutch);
    expect(three).toHaveLength(3);
    expect(new Set(three.map(q=>correctLabel(q)) ).size).toBe(3);
    expect(three[0].id).toBe(dutch[0].id);
  });
  it("uses tiles only when the right answer is suitable", () => {
    expect(eligibleModes(french[0],french)).toContain("words");
    expect(eligibleModes(maths[0],maths)).not.toContain("words");
    expect(eligibleModes(numbers[0],numbers)).toContain("letters");
    const missing=makeMissing(correctLabel(numbers[0]));
    expect(missing.before+missing.hidden+missing.after).toBe(correctLabel(numbers[0]));
  });
  it("does not mutate the remote JSON question contents", () => {
    const q:Question={...dutch[0],answers:dutch[0].answers.map(a=>({...a}))};
    const original=JSON.stringify(q);
    planModes([q],[q,...dutch],12);
    rotate(q.answers,3);
    expect(JSON.stringify(q)).toBe(original);
  });
});
