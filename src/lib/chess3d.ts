import type { Square } from "../lessons/chessTypes";

/** All 2D/3D boards use a1 at near-left, h1 at near-right for White. */
export function squareToWorld(square: Square): {x:number;z:number} {
  const file=square.charCodeAt(0)-97;
  const rank=Number(square[1]);
  if(!/^[a-h][1-8]$/.test(square))throw new Error("Invalid square: "+square);
  return {x:file-3.5,z:4.5-rank};
}
export function worldToSquare(x:number,z:number): Square|null {
  const file=Math.round(x+3.5),rank=Math.round(4.5-z);
  if(file<0||file>7||rank<1||rank>8)return null;
  return "abcdefgh"[file]+rank;
}
export function clampCameraAngle(angle:number):number {
  return Math.max(0.32,Math.min(1.29,angle));
}
export function clampCameraDistance(distance:number):number {
  return Math.max(9,Math.min(19,distance));
}
export function boardIsDark(file:number,rank:number):boolean {
  // a1 is DARK; h1 LIGHT.
  return (file+rank)%2===1;
}
