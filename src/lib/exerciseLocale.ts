import {exerciseModeNames} from "./exerciseModes";
import type {ExerciseMode} from "./exerciseModes";

export type QuizLocale = "fr-BE"|"nl-BE";
type Copy={
 modes:Record<ExerciseMode,string>;
 yourTurn:string;writeLabel:string;answerPlaceholder:string;check:string;
 trueIntro:string;true:string;false:string;
 lettersInstruction:string;wordsInstruction:string;tokenPlaceholder:string;
 erase:string;restart:string;missingLabel:string;missingPlaceholder:string;
 matchingInstruction:string;matchingStatus:string;retry:string;
 memoryInstruction:string;memoryStatus:string;continue:string;
 numberInstruction:string;numberAria:string;validate:string;
 listenQuestion:string;hiddenCard:string;
};

const fr:Copy={
 modes:exerciseModeNames,yourTurn:"À toi de jouer !",writeLabel:"Écris la bonne réponse :",
 answerPlaceholder:"Ta réponse ici…",check:"Vérifier",trueIntro:"La réponse serait :",
 true:"✅ Vrai !",false:"❌ Faux !",lettersInstruction:"Appuie sur les lettres dans le bon ordre.",
 wordsInstruction:"Choisis les mots pour former la réponse.",tokenPlaceholder:"❔ À toi de construire la réponse",
 erase:"Effacer",restart:"Recommencer",missingLabel:"Quelles lettres manquent dans la réponse ?",
 missingPlaceholder:"Lettres manquantes…",
 matchingInstruction:"Sélectionne une question à gauche, puis sa réponse à droite. Trois associations à réussir !",
 matchingStatus:"paires trouvées",retry:"Réessaie, tu peux y arriver !",
 memoryInstruction:"Retourne les cartes pour retrouver les trois paires question–réponse !",
 memoryStatus:"paires retrouvées",continue:"Continue !",
 numberInstruction:"Déplace le curseur jusqu'au bon résultat puis valide.",
 numberAria:"Choisir un nombre de 0 à 100",validate:"Valider",
 listenQuestion:"Écouter la question",hiddenCard:"Carte cachée"
};
const nl:Copy={
 modes:{
  choice:"Kies het juiste antwoord",write:"Schrijf het antwoord",truefalse:"Juist of fout?",
  duel:"Kies tussen twee antwoorden",letters:"Zet de letters op volgorde",
  words:"Zet de woorden op volgorde",missing:"Vul de ontbrekende letters in",
  matching:"Verbind de juiste paren",memory:"Memoryspel",numberline:"Zoek het juiste getal"
 },
 yourTurn:"Jij bent aan zet!",writeLabel:"Schrijf het juiste antwoord:",
 answerPlaceholder:"Typ je antwoord…",check:"Controleer",trueIntro:"Het antwoord zou zijn:",
 true:"✅ Juist!",false:"❌ Fout!",lettersInstruction:"Tik op de letters in de juiste volgorde.",
 wordsInstruction:"Kies de woorden in de juiste volgorde.",tokenPlaceholder:"❔ Maak het juiste antwoord",
 erase:"Wis",restart:"Opnieuw",missingLabel:"Welke letters ontbreken er?",
 missingPlaceholder:"Ontbrekende letters…",
 matchingInstruction:"Kies links een vraag en rechts het juiste antwoord. Zoek drie paren!",
 matchingStatus:"paren gevonden",retry:"Probeer opnieuw, het lukt je!",
 memoryInstruction:"Draai de kaarten om en zoek drie paren van vragen en antwoorden!",
 memoryStatus:"paren gevonden",continue:"Doe zo voort!",
 numberInstruction:"Schuif naar het juiste getal en controleer.",
 numberAria:"Kies een getal van 0 tot 100",validate:"Controleer",
 listenQuestion:"Luister naar de vraag",hiddenCard:"Verborgen kaart"
};
export function getExerciseCopy(locale:QuizLocale):Copy{return locale==="nl-BE"?nl:fr}
