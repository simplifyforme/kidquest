import { describe, expect, it } from "vitest";
import { builtinPacks } from "../data/builtin";
import type { ContentPack } from "../types";
import { getActivities, getActivityQuestions } from "./activities";

const extraPack: ContentPack = {
  id: "neerlandais-verbes-a1",
  version: 1,
  title: "Les verbes faciles en néerlandais",
  questions: [{
    id: "test-nl-verb-1",
    subject: "dutch",
    skill: "verbes-zijn",
    prompt: "Ik ___ blij.",
    answers: [{id:"a",label:"ben"},{id:"b",label:"is"}],
    correctAnswerId: "a",
    explanation: "Ik ben",
  }]
};

describe("dynamic missions from content packs", () => {
  it("keeps the four bundled missions offline", () => {
    expect(getActivities(builtinPacks)).toHaveLength(4);
  });
  it("shows an independent mission for a downloaded pack", () => {
    const activities=getActivities([...builtinPacks,extraPack]);
    expect(activities).toHaveLength(5);
    const activity=activities[4];
    expect(activity.title).toBe(extraPack.title);
    expect(activity.packId).toBe(extraPack.id);
    expect(getActivityQuestions([...builtinPacks,extraPack],activity).map(q=>q.id)).toEqual(["test-nl-verb-1"]);
  });
  it("does not add duplicate cards for updated built-in packs", () => {
    const overridden={...builtinPacks[3],version:2};
    const packs=[...builtinPacks.slice(0,3),overridden];
    expect(getActivities(packs)).toHaveLength(4);
    expect(getActivityQuestions(packs,getActivities(packs)[3])).toEqual(overridden.questions);
  });
  it("supports new subjects via existing quiz-compatible data", () => {
    expect(getActivityQuestions([...builtinPacks,extraPack],getActivities([...builtinPacks,extraPack])[0]).every(q=>q.subject==="math")).toBe(true);
  });
});
