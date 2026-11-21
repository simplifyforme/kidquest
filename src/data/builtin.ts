import type { ContentPack,Question,Subject } from "../types";

const q=(id:string,subject:Subject,skill:string,prompt:string,choices:string[],right:number,explanation:string,emoji="✨"):Question=>({
 id,subject,skill,prompt,answers:choices.map((label,i)=>({id:String(i),label})),correctAnswerId:String(right),explanation,emoji
});
export const builtinPacks:ContentPack[]=[
 {id:"mathematiques",version:1,title:"Les défis de calcul",questions:[
  q("math-01","math","addition","Combien font 8 + 7 ?",["13","15","16","14"],1,"8 + 7 = 15.","➕"),
  q("math-02","math","soustraction","Combien font 18 − 9 ?",["9","8","10","7"],0,"18 − 9 = 9.","➖"),
  q("math-03","math","multiplication","Combien font 6 × 4 ?",["20","28","24","26"],2,"6 × 4 = 24.","✖️"),
  q("math-04","math","addition","Combien font 27 + 15 ?",["32","42","43","41"],1,"27 + 15 = 42.","🧮"),
  q("math-05","math","multiplication","Combien font 7 × 8 ?",["54","56","58","64"],1,"7 × 8 = 56.","⭐"),
  q("math-06","math","soustraction","Combien font 50 − 17 ?",["43","37","33","23"],2,"50 − 17 = 33.","🎯"),
  q("math-07","math","multiplication","Combien font 9 × 3 ?",["27","21","29","24"],0,"9 × 3 = 27.","🚀"),
  q("math-08","math","addition","Combien font 36 + 28 ?",["54","62","64","66"],2,"36 + 28 = 64.","🔢"),
  q("math-09","math","probleme","Lina a 12 billes et en gagne 6. Combien en a-t-elle ?",["16","18","20","22"],1,"12 + 6 = 18 billes.","🔮"),
  q("math-10","math","probleme","24 bonbons sont partagés entre 4 enfants. Combien chacun reçoit-il ?",["4","5","8","6"],3,"24 ÷ 4 = 6 bonbons.","🍬")
 ]},
 {id:"nombres",version:1,title:"Les nombres en lettres",questions:[
  q("num-01","numbers","francais","Comment écrit-on 14 en français ?",["quarante","quatorze","quatre","quinze"],1,"14 s'écrit quatorze.","🔤"),
  q("num-02","numbers","francais","Quel nombre correspond à « soixante » ?",["16","70","60","80"],2,"Soixante = 60.","🔢"),
  q("num-03","numbers","francais","Comment écrit-on 81 en français (Belgique) ?",["quatre-vingt-un","huitante et un","quatre-vingt-dix","octante"],0,"81 s'écrit quatre-vingt-un.","✏️"),
  q("num-04","numbers","francais","Comment écrit-on 95 en français (Belgique) ?",["nonante-cinq","quatre-vingt-cinq","septante-cinq","quatre-vingt-quinze"],3,"95 s'écrit quatre-vingt-quinze.","📖"),
  q("num-05","numbers","neerlandais","Comment dit-on 8 en néerlandais ?",["acht","tien","zes","vijf"],0,"8 = acht.","🇳🇱"),
  q("num-06","numbers","neerlandais","Comment écrit-on 12 en néerlandais ?",["twintig","twaalf","twee","dertien"],1,"12 = twaalf.","🔤"),
  q("num-07","numbers","neerlandais","Que signifie « twintig » ?",["12","30","20","2"],2,"Twintig signifie vingt.","💡"),
  q("num-08","numbers","neerlandais","Comment écrit-on 21 en néerlandais ?",["twintigéén","tweeëntwintig","eenenveertig","eenentwintig"],3,"21 = eenentwintig (forme usuelle, sans accent).","🧠"),
  q("num-09","numbers","neerlandais","Comment écrit-on 101 en néerlandais ?",["honderdeen","honderdtien","eenhonderdtien","duizendéén"],0,"101 = honderd(en)een ; honderdeen est accepté dans cette activité.","🎓"),
  q("num-10","numbers","francais","Comment écrit-on 72 en français (Belgique) ?",["soixante-douze","septante-deux","soixante-deux","quatre-vingt-deux"],1,"En Belgique, on emploie souvent septante-deux.","🇧🇪")
 ]},
 {id:"francais",version:1,title:"Les mots malins",questions:[
  q("fr-01","french","orthographe","Quelle écriture est correcte ?",["un éléfant","un éléphant","un élefan","un éléfand"],1,"On écrit un éléphant.","🐘"),
  q("fr-02","french","grammaire","Complète : « Les chats ___ dans le jardin. »",["joue","jouent","joues","jouer"],1,"Au pluriel : les chats jouent.","🐈"),
  q("fr-03","french","vocabulaire","Quel est le contraire de « rapide » ?",["vite","fort","lent","haut"],2,"Le contraire de rapide est lent.","🐢"),
  q("fr-04","french","orthographe","Choisis le mot bien écrit.",["bibliotèque","bibliothèque","biblothèque","bibliotéque"],1,"Bibliothèque contient th et è.","📚"),
  q("fr-05","french","grammaire","Complète : « J'___ huit ans. »",["ai","est","as","ont"],0,"On dit : j'ai huit ans.","🎂"),
  q("fr-06","french","vocabulaire","Quel mot désigne un jeune chien ?",["chaton","poussin","chiot","veau"],2,"Un jeune chien est un chiot.","🐶"),
  q("fr-07","french","grammaire","Le pluriel de « cheval » est…",["chevals","chevaux","chevalles","chevaus"],1,"Un cheval, des chevaux.","🐴"),
  q("fr-08","french","orthographe","Complète : « Il fait très ___ aujourd'hui. »",["bô","beau","bot","beaux"],1,"Il fait beau.","☀️")
 ]},
 {id:"neerlandais",version:1,title:"Mission : Hallo, vriend!",questions:[
  q("nl-01","dutch","salutations","Que signifie « Hallo » ?",["Au revoir","Bonjour","Merci","Pardon"],1,"Hallo = Bonjour / Salut.","👋"),
  q("nl-02","dutch","salutations","Comment dire « Au revoir » en néerlandais ?",["Dag","Water","Groen","Rood"],0,"Dag signifie Bonjour ou Au revoir selon le contexte.","🌈"),
  q("nl-03","dutch","salutations","Que signifie « Dank je » ?",["Bonne nuit","S'il te plaît","Merci","Oui"],2,"Dank je = Merci.","💛"),
  q("nl-04","dutch","couleurs","Comment dire « rouge » ?",["blauw","geel","groen","rood"],3,"Rood = rouge.","🔴"),
  q("nl-05","dutch","couleurs","Quelle couleur est « blauw » ?",["Bleu","Rouge","Jaune","Vert"],0,"Blauw = bleu.","🔵"),
  q("nl-06","dutch","couleurs","Comment dire « jaune » ?",["zwart","geel","wit","rood"],1,"Geel = jaune.","🟡"),
  q("nl-07","dutch","presentations","Comment dire « Je m'appelle Emma » ?",["Ik woon Emma","Ik heet Emma","Ik ben acht","Ik kom Emma"],1,"Ik heet Emma = Je m'appelle Emma.","🧒"),
  q("nl-08","dutch","presentations","Que signifie « Hoe gaat het? » ?",["Où habites-tu ?","Quel âge as-tu ?","Comment ça va ?","Quel est ton nom ?"],2,"Hoe gaat het? = Comment ça va ?","💬"),
  q("nl-09","dutch","salutations","Comment répondre : « Hoe gaat het? »",["Goed!","Rood!","Huis!","Twee!"],0,"Goed! = Bien !","😊"),
  q("nl-10","dutch","couleurs","Que signifie « groen » ?",["Vert","Bleu","Blanc","Noir"],0,"Groen = vert.","🟢"),
  q("nl-11","dutch","presentations","Que signifie « Ik woon in Brussel » ?",["Je vais à Bruxelles","Je parle bruxellois","J'habite à Bruxelles","Je viens de Bruxelles"],2,"Ik woon = J'habite.","🏠"),
  q("nl-12","dutch","salutations","Comment dire « Bonne journée » ?",["Welterusten","Goedemorgen","Tot ziens","Fijne dag"],3,"Fijne dag = Bonne journée.","☀️")
 ]}
];
