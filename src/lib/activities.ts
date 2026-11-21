import type { ContentPack, Question, Subject } from "../types";
import { builtinPacks } from "../data/builtin";

export type Activity = {
  subject: Subject;
  title: string;
  subtitle: string;
  emoji: string;
  className: string;
  tag: string;
  packId: string;
};

export const baseActivities: Activity[] = [
  { subject: "math", packId: "mathematiques", title: "Défis maths", subtitle: "Calcule et deviens champion !", emoji: "🧮", className: "math", tag: "Calcul" },
  { subject: "numbers", packId: "nombres", title: "Nombres magiques", subtitle: "Les nombres en toutes lettres", emoji: "🔢", className: "numbers", tag: "Écriture" },
  { subject: "french", packId: "francais", title: "Mots malins", subtitle: "Joue avec le français", emoji: "📚", className: "french", tag: "Français" },
  { subject: "dutch", packId: "neerlandais", title: "Hallo, vriend !", subtitle: "Découvre tes premiers mots", emoji: "🚀", className: "dutch", tag: "Néerlandais" }
];

const subjectEmojis: Record<Subject, string> = {
  math: "🎯",
  numbers: "🔠",
  french: "📝",
  dutch: "🇳🇱"
};

const subjectStyles: Record<Subject, string> = {
  math: "math",
  numbers: "numbers",
  french: "french",
  dutch: "dutch"
};

/**
 * A data-only JSON pack is a fully independent mission.
 * Installing or updating a pack automatically makes its card appear;
 * there is no need to ship new application code for compatible quiz packs.
 */
export function getActivities(packs: ContentPack[]): Activity[] {
  const basePackIds = new Set(builtinPacks.map(pack => pack.id));
  const extra = packs
    .filter(pack => !basePackIds.has(pack.id) && pack.questions.length > 0)
    .map(pack => {
      const subject = pack.questions[0].subject;
      return {
        subject,
        packId: pack.id,
        title: pack.title,
        subtitle: `${pack.questions.length} questions à découvrir`,
        emoji: pack.id === "neerlandais-verbes-a1" ? "🗣️" : subjectEmojis[subject],
        className: subjectStyles[subject],
        tag: "Nouveau pack"
      };
    });
  return [...baseActivities, ...extra];
}

export function getActivityQuestions(packs: ContentPack[], activity: Activity): Question[] {
  const pack = packs.find(item => item.id === activity.packId);
  return pack?.questions.filter(question => question.subject === activity.subject) ?? [];
}
