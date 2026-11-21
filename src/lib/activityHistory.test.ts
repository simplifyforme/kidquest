import {describe,expect,it} from "vitest";
import type {CompletedSession} from "../types";
import {activityStats,EMPTY_STATS,formatDuration} from "./activityHistory";

const sessions:CompletedSession[]=[
 {id:"run-1",activityId:"mathematiques",kind:"quiz",startedAt:"2026-11-21T08:00:00Z",completedAt:"2026-11-21T08:03:20Z",durationSeconds:200,correct:6,total:8},
 {id:"run-2",activityId:"mathematiques",kind:"quiz",startedAt:"2026-11-21T09:00:00Z",completedAt:"2026-11-21T09:02:30Z",durationSeconds:150,correct:8,total:8},
 {id:"run-3",activityId:"chess-beginner",kind:"lesson",startedAt:"2026-11-21T10:00:00Z",completedAt:"2026-11-21T10:09:10Z",durationSeconds:550,correct:4,total:6},
];

describe("completed activity history",()=>{
 it("computes exact completion count, scores and elapsed times per activity",()=>{
  const stats=activityStats(sessions,"mathematiques");
  expect(stats.count).toBe(2);
  expect(stats.best).toBe(100);
  expect(stats.average).toBe(88);
  expect(stats.totalCorrect).toBe(14);
  expect(stats.totalQuestions).toBe(16);
  expect(stats.shortestSeconds).toBe(150);
  expect(stats.lastPlayed).toBe("2026-11-21T09:02:30Z");
 });
 it("reports a completed lesson independently of math exercises",()=>{
  expect(activityStats(sessions,"chess-beginner")).toMatchObject({
    count:1,best:67,average:67,totalCorrect:4,totalQuestions:6,shortestSeconds:550
  });
 });
 it("never fabricates histories for activities not yet completed",()=>{
  expect(activityStats(sessions,"nombres")).toEqual(EMPTY_STATS);
 });
 it("formats exact second durations without guessing",()=>{
  expect(formatDuration(0)).toBe("0 s");
  expect(formatDuration(15)).toBe("15 s");
  expect(formatDuration(90)).toBe("1 min 30 s");
  expect(formatDuration(550)).toBe("9 min 10 s");
 });
});
