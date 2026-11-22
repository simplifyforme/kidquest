import {describe,expect,it} from "vitest";
import {builtinPacks} from "../data/builtin";
import {eligibleModes,planModes} from "./exerciseModes";
import {isValidQuestion} from "./updates";
import type {Question} from "../types";
const base={...builtinPacks.find(p=>p.id==="neerlandais")!.questions[0],media:{type:"image" as const,file:"arm.png",alt:"Le bras"}};
describe("explicit image response modes",()=>{
 it("keeps legacy image questions in choice mode",()=>{
  expect(eligibleModes(base,[base])).toEqual(["choice"]);
 });
 it("supports writing and letter puzzles without dropping the illustration",()=>{
  for(const responseMode of ["choice","write","letters"] as const){
   const q:Question={...base,responseMode};
   expect(isValidQuestion(q)).toBe(true);
   expect(eligibleModes(q,[q])).toEqual([responseMode]);
   expect(planModes([q],[q],4)).toEqual([responseMode]);
   expect(q.media).toBe(base.media);
  }
 });
 it("validates the language of the French cue independently of the Dutch game interface",()=>{
  expect(isValidQuestion({...base,promptLocale:"fr-BE"})).toBe(true);
  expect(isValidQuestion({...base,promptLocale:"nl-BE"})).toBe(true);
  expect(isValidQuestion({...base,promptLocale:"unknown"})).toBe(false);
 });
 it("rejects invalid or unsupported image modes and modes without images",()=>{
  expect(isValidQuestion({...base,responseMode:"memory"})).toBe(false);
  expect(isValidQuestion({...base,responseMode:"write",media:undefined})).toBe(false);
  expect(isValidQuestion({...base,responseMode:"write",media:{type:"audio",file:"arm.mp3",alt:"Le bras"}})).toBe(false);
  const long:Question={...base,responseMode:"letters",answers:[{id:"a",label:"a".repeat(30)},{id:"b",label:"b"}],correctAnswerId:"a"};
  expect(eligibleModes(long,[long])).toEqual(["write"]);
 });
});
