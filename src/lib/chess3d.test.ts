import {describe,expect,it} from "vitest";
import {boardIsDark,clampCameraAngle,clampCameraDistance,squareToWorld,worldToSquare} from "./chess3d";
import {chessBeginnerLesson} from "../lessons/chessBeginner";
import {playActions} from "../lessons/chessTypes";

describe("cartoon chess 3D world mapping",()=>{
 it("keeps White at the bottom with the light square h1 at bottom-right",()=>{
   expect(squareToWorld("a1")).toEqual({x:-3.5,z:3.5});
   expect(squareToWorld("h1")).toEqual({x:3.5,z:3.5});
   expect(squareToWorld("a8")).toEqual({x:-3.5,z:-3.5});
   expect(boardIsDark(0,1)).toBe(true);
   expect(boardIsDark(7,1)).toBe(false);
 });
 it("round-trips every one of the 64 squares",()=>{
   for(const file of "abcdefgh")for(let rank=1;rank<=8;rank++){
     const square=file+rank;
     const {x,z}=squareToWorld(square);
     expect(worldToSquare(x,z)).toBe(square);
   }
   expect(worldToSquare(20,5)).toBeNull();
   expect(()=>squareToWorld("z9")).toThrow();
 });
 it("keeps the child-facing camera above and near the front",()=>{
   expect(clampCameraAngle(-4)).toBe(.32);
   expect(clampCameraAngle(4)).toBe(1.29);
   expect(clampCameraDistance(1)).toBe(9);
   expect(clampCameraDistance(100)).toBe(19);
 });
 it("reuses each existing chess lesson scene without separate 3D rules",()=>{
   for(const scene of chessBeginnerLesson.scenes){
     expect(scene.pieces.every(p=>{const {x,z}=squareToWorld(p.square);return worldToSquare(x,z)===p.square;})).toBe(true);
     const final=playActions(scene.pieces,scene.actions);
     expect(final.every(p=>worldToSquare(squareToWorld(p.square).x,squareToWorld(p.square).z)===p.square)).toBe(true);
   }
 });
});
