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
  { subject: "math", packId: "mathematiques", title: "Rekenavonturen", subtitle: "Reken en word een kampioen!", emoji: "🧮", className: "math", tag: "Rekenen" },
  { subject: "numbers", packId: "nombres", title: "Getallen in woorden", subtitle: "Leer getallen schrijven", emoji: "🔢", className: "numbers", tag: "Getallen" },
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
        title: pack.id === "tables-multiplication-1-10" ? "Maaltafels van 1 tot 10" : pack.title,
        subtitle: subject === "math" || subject === "numbers" ? `${pack.questions.length} oefeningen om te ontdekken` : `${pack.questions.length} questions à découvrir`,
        emoji: pack.id === "neerlandais-verbes-a1" ? "🗣️" : subjectEmojis[subject],
        className: subjectStyles[subject],
        tag: subject === "math" || subject === "numbers" ? "Oefeningen" : "Nouveau pack"
      };
    });
  return [...baseActivities, ...extra];
}

export function getActivityQuestions(packs: ContentPack[], activity: Activity): Question[] {
  const pack = packs.find(item => item.id === activity.packId);
  if(!pack)return [];
  return pack.questions.filter(question=>question.subject===activity.subject).map(question=>{
    // A previously downloaded v1 pack can be cached while the Dutch v2 arrives.
    // Preserve all IDs and answers offline.
    if(pack.id==="tables-multiplication-1-10" && pack.version<2){
      const match=/^Combien font (\d+) × (\d+) \?$/.exec(question.prompt);
      if(match)return {...question,prompt:`Hoeveel is ${match[1]} × ${match[2]} ?`};
    }
    return question;
  });
}
