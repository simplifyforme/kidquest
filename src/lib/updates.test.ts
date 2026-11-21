import { describe,expect,it } from "vitest";
import { builtinPacks } from "../data/builtin";
import { isValidPack,isValidQuestion,sha256 } from "./updates";
describe("Content contract",()=>{
 it("bundled packs are valid with unique IDs",()=>{
  const ids=builtinPacks.flatMap(p=>p.questions.map(q=>q.id));
  expect(new Set(ids).size).toBe(ids.length);
  for(const pack of builtinPacks)expect(isValidPack(pack)).toBe(true);
 });
 it("rejects a bad answer",()=>{expect(isValidQuestion({...builtinPacks[0].questions[0],correctAnswerId:"missing"})).toBe(false)});
 it("hashes pack bytes for integrity",async()=>{expect(await sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")});
});
