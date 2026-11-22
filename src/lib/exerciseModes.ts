import type { Question } from "../types";

export type ExerciseMode =
  | "choice"
  | "write"
  | "truefalse"
  | "duel"
  | "letters"
  | "words"
  | "missing"
  | "matching"
  | "memory"
  | "numberline";

export const exerciseModeNames: Record<ExerciseMode, string> = {
  choice: "Choisis la réponse",
  write: "Écris la réponse",
  truefalse: "Vrai ou faux ?",
  duel: "Duel de réponses",
  letters: "Reconstruis le mot",
  words: "Remets les mots en ordre",
  missing: "Lettres manquantes",
  matching: "Relie les paires",
  memory: "Jeu de mémoire",
  numberline: "Trouve le nombre"
};

export const ALL_MODES: ExerciseMode[] = [
  "choice", "write", "truefalse", "duel", "letters",
  "words", "missing", "matching", "memory", "numberline"
];

export function correctLabel(question: Question): string {
  return question.answers.find(a => a.id === question.correctAnswerId)?.label ?? "";
}

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .toLocaleLowerCase("fr-BE")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

export function isCorrectText(question: Question, typed: string): boolean {
  const expected = correctLabel(question);
  if (!expected.trim() || !typed.trim()) return false;
  return normalizeAnswer(expected) === normalizeAnswer(typed);
}

export function isNumericAnswer(question: Question): boolean {
  const answer = correctLabel(question).trim();
  return /^\d{1,3}$/.test(answer) && Number(answer) >= 0 && Number(answer) <= 100;
}

/** A matching board has three distinct prompts and three distinct answers. */
export function matchingPairs(question: Question, pool: Question[]): Question[] {
  const items = [question];
  const usedAnswers = new Set([normalizeAnswer(correctLabel(question))]);
  const usedPrompts = new Set([question.prompt]);
  const others = [...pool].filter(q => q.id !== question.id).sort((a, b) => a.id.localeCompare(b.id));
  for (const candidate of others) {
    const answer = normalizeAnswer(correctLabel(candidate));
    if (!answer || usedAnswers.has(answer) || usedPrompts.has(candidate.prompt)) continue;
    items.push(candidate);
    usedAnswers.add(answer);
    usedPrompts.add(candidate.prompt);
    if (items.length === 3) break;
  }
  return items;
}

export function eligibleModes(question: Question, pool: Question[]): ExerciseMode[] {
  // Images remain above ExercisePlay in all three modes; legacy photo packs stay in choice.
  if(question.media){
    if(question.responseMode==="write")return ["write"];
    if(question.responseMode==="letters"){
      const length=Array.from(correctLabel(question).replace(/\s+/g," ").replace(/ /g,"")).length;
      return length>=2&&length<=15?["letters"]:["write"];
    }
    return ["choice"];
  }
  const answer = correctLabel(question);
  const characters = Array.from(answer.replace(/\s+/g, ""));
  const words = answer.trim().split(/\s+/);
  const pairs = matchingPairs(question, pool);
  return ALL_MODES.filter(mode => {
    if (mode === "choice" || mode === "truefalse" || mode === "duel")
      return question.answers.length >= 2;
    if (mode === "write") return answer.length > 0 && answer.length <= 65;
    if (mode === "letters") return characters.length >= 2 && characters.length <= 15;
    if (mode === "words") return words.length >= 2 && words.length <= 8;
    if (mode === "missing") return answer.trim().length >= 4 && answer.trim().length <= 35;
    if (mode === "matching" || mode === "memory") return pairs.length === 3;
    if (mode === "numberline") return isNumericAnswer(question);
    return false;
  });
}

/**
 * No method picker for the child. Each session rotates available modes and
 * prefers those not yet used within that session, with a predictable fallback.
 */
export function planModes(questions: Question[], pool: Question[], session: number): ExerciseMode[] {
  const counts = new Map<ExerciseMode, number>(ALL_MODES.map(m => [m, 0]));
  return questions.map((question, index) => {
    const available = eligibleModes(question, pool);
    if (available.length === 0) return "write";
    const preferred = ALL_MODES[(session * 3 + index) % ALL_MODES.length];
    const lowest = Math.min(...available.map(m => counts.get(m) ?? 0));
    const candidates = available.filter(m => (counts.get(m) ?? 0) === lowest);
    const chosen = candidates.includes(preferred)
      ? preferred
      : candidates[(session + index) % candidates.length];
    counts.set(chosen, (counts.get(chosen) ?? 0) + 1);
    return chosen;
  });
}

export function makeMissing(answer: string): { before: string; hidden: string; after: string } {
  const chars = Array.from(answer);
  const take = Math.min(3, Math.max(1, Math.floor(chars.length / 3)));
  const start = Math.max(1, Math.floor((chars.length - take) / 2));
  return {
    before: chars.slice(0, start).join(""),
    hidden: chars.slice(start, start + take).join(""),
    after: chars.slice(start + take).join("")
  };
}

/** Deterministic shuffled order: reproducible within a question on rerender. */
export function rotate<T>(items: T[], seed: number): T[] {
  if (!items.length) return [];
  const shift = ((seed % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)].reverse();
}
