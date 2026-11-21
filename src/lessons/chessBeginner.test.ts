import { describe, expect, it } from "vitest";
import { chessBeginnerLesson } from "./chessBeginner";
import { coordinates, playActions, validateLesson } from "./chessTypes";

describe("Animated chess beginner curriculum", () => {
  it("provides a complete pedagogical course with interactive challenges", () => {
    expect(validateLesson(chessBeginnerLesson)).toBe(true);
    expect(chessBeginnerLesson.scenes.length).toBeGreaterThanOrEqual(15);
    expect(chessBeginnerLesson.scenes.filter(s=>s.challenge).length).toBeGreaterThanOrEqual(6);
    expect(new Set(chessBeginnerLesson.scenes.map(s=>s.id)).size).toBe(chessBeginnerLesson.scenes.length);
  });
  it("teaches each of the six pieces and key beginner rules", () => {
    const ids=chessBeginnerLesson.scenes.map(s=>s.id);
    for(const id of ["pawn","pawn-capture","rook","bishop","queen","knight","king","check","mate","castle","promotion","rules"])
      expect(ids).toContain(id);
    expect(chessBeginnerLesson.scenes.every(s=>s.narration.length>30)).toBe(true);
  });
  it("keeps the board oriented from the white player's perspective", () => {
    expect(coordinates("a8")).toEqual({x:0,y:0});
    expect(coordinates("h1")).toEqual({x:7,y:7});
  });
  it("animates legal demonstration moves with captures", () => {
    const pawn=chessBeginnerLesson.scenes.find(s=>s.id==="pawn")!;
    expect(playActions(pawn.pieces,pawn.actions)[0].square).toBe("e4");
    expect(pawn.pieces[0].square).toBe("e2"); // no mutation of original data
    const capture=chessBeginnerLesson.scenes.find(s=>s.id==="pawn-capture")!;
    const final=playActions(capture.pieces,capture.actions);
    expect(final).toHaveLength(1);
    expect(final[0].square).toBe("d5");
  });
  it("has specific correct squares for all clickable challenges", () => {
    const challenges=chessBeginnerLesson.scenes.filter(s=>s.challenge);
    for(const scene of challenges){
      expect(scene.challenge!.validTargets).toHaveLength(1);
      expect(scene.pieces.some(p=>p.square===scene.challenge!.from)).toBe(true);
      expect(scene.challenge!.prompt.length).toBeGreaterThan(12);
    }
    expect(challenges.find(s=>s.id==="knight-test")!.challenge!.validTargets).toEqual(["e6"]);
  });
  it("promotes a pawn to a queen on the final rank", () => {
    const scene=chessBeginnerLesson.scenes.find(s=>s.id==="promotion")!;
    const final=playActions(scene.pieces,scene.actions);
    expect(final[0]).toMatchObject({square:"a8",kind:"Q"});
  });
  it("demonstrates castling with both rook and king moving", () => {
    const castle=chessBeginnerLesson.scenes.find(s=>s.id==="castle")!;
    const end=playActions(castle.pieces,castle.actions);
    expect(end.find(p=>p.kind==="K")!.square).toBe("g1");
    expect(end.find(p=>p.kind==="R")!.square).toBe("f1");
  });
});
