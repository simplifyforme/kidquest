export type VerbQuestion={
 prompt:string;options:string[]|null;answer:string;explanation:string;hint:string;question:string
};
export type VerbMission={id:string;name:string;title:string;intro:string;memory:string;questions:VerbQuestion[]};
const choice=(prompt:string,options:string[]|null,answer:string,explanation:string,hint:string,question:string):VerbQuestion=>({prompt,options,answer,explanation,hint,question});
const verb=(sentence:string,word:string,explanation:string,hint:string)=>choice(sentence,sentence.replace(/[.!?]$/,"").split(" "),word,explanation,hint,"Clique sur le verbe conjugué.");
const classify=(sentence:string,word:string,isVerb:boolean,explanation:string,hint:string)=>choice(sentence.replace("{mot}","<mark>"+word+"</mark>"),["C’est un verbe","C’est un autre mot"],isVerb?"C’est un verbe":"C’est un autre mot",explanation,hint,"Le mot surligné est-il un verbe ?");
const inf=(prompt:string,answer:string,options:string[]|null,explanation:string,hint="Essaie la phrase « Il faut… » avec le même verbe.")=>choice(prompt,options,answer,explanation,hint,"Retrouve l’infinitif du verbe surligné.");
const forms=(prompt:string,answer:string,explanation:string,hint:string)=>choice(prompt,["Verbe conjugué","Verbe à l’infinitif"],answer,explanation,hint,"Quelle est la forme du verbe surligné ?");
const groups=["1er groupe","2e groupe","3e groupe"];
const group=(prompt:string,answer:1|2|3,explanation:string,hint="Regarde la fin de l’infinitif. Pour un verbe en -ir, dis la forme avec « nous ».")=>choice(prompt,groups,groups[answer-1],explanation,hint,"Dans quel groupe va ce verbe ?");
/** Reproduction of the four pedagogical missions in la_chasse_aux_verbes.html. */
export const verbMissions:VerbMission[]=[
 {id:"spot",name:"🔎 Repérer",title:"Détective des verbes",
  intro:"Change le sujet ou imagine que la scène se passe demain. Écoute le mot qui change : « Le chat saute » → « Demain, le chat sautera ». Saute est le verbe !",
  memory:"Pour repérer un verbe conjugué, je change le sujet ou le temps.",questions:[
  verb("Le chat saute.","saute","Le chat saute → demain, le chat sautera.","Commence par « Demain, le chat… »"),
  verb("Mila ferme la porte.","ferme","Mila ferme → Mila et Tom ferment.","Avec Mila et Tom, quel mot devient « ferment » ?"),
  verb("Les enfants sont contents.","sont","Les enfants sont contents → un enfant est content. « Sont » vient du verbe être et décrit leur état.","Demain, les enfants seront contents. Quel mot devient « seront » ?"),
  verb("Tu as un ballon.","as","Tu as → nous avons. « As » vient du verbe avoir.","Commence par « Nous… »"),
  classify("La {mot} est grande.","porte",false,"Ici, « porte » est le nom d’un objet. Le verbe est « est ».","De quel objet parle la phrase ?"),
  classify("Mila {mot} son cartable.","porte",true,"Mila porte → demain, Mila portera.","Commence par « Demain, Mila… »"),
  classify("Il {mot} vite.","marche",true,"Il marche → demain, il marchera.","Imagine que l’action se passe demain."),
  classify("La {mot} est haute.","marche",false,"Ici, « marche » désigne une partie de l’escalier. Le verbe est « est ».","Quelle partie d’un escalier peut être haute ?")
 ]},
 {id:"infinitive",name:"🧩 Retrouver",title:"Le nom secret du verbe",
  intro:"« Nous jouons » et « tu joues » viennent de jouer. Pour retrouver ce nom, dis « Il faut jouer ». C’est l’infinitif !",
  memory:"« Il faut… » m’aide à retrouver l’infinitif.",questions:[
  inf("Tu <mark>chantes</mark> sous la douche.","chanter",["chantes","chant","chanter"],"Il faut chanter. « Chantes » vient de chanter."),
  inf("Nous <mark>finissons</mark> le puzzle.","finir",["finir","fini","finissons"],"Il faut finir le puzzle."),
  inf("Ils <mark>prennent</mark> le bus.","prendre",["prennent","partir","prendre"],"Il faut prendre le bus."),
  inf("Elle <mark>est</mark> calme.","être",["est","être","avoir"],"Il faut être calme. « Est » vient du verbe être."),
  inf("J’<mark>ai</mark> faim.","avoir",["avoir","ai","être"],"On dit « avoir faim ». « Ai » vient du verbe avoir.","Pense à « Je peux … faim »."),
  inf("Il <mark>va</mark> à l’école.","aller",["va","venir","aller"],"Il faut aller à l’école. « Va » vient de aller."),
  inf("Le chien <mark>court</mark> vite.","courir",null,"Il faut courir. « Court » vient de courir."),
  inf("Nous <mark>choisissons</mark> un livre.","choisir",null,"Il faut choisir. Avec « nous », on dit « nous choisissons »."),
  forms("Lina <mark>dessine</mark> un chat.","Verbe conjugué","« Dessine » est conjugué avec le sujet Lina. Son infinitif est dessiner.","Demain, Lina dessinera un chat. Observe le mot qui change."),
  forms("Lina aime <mark>dessiner</mark> des chats.","Verbe à l’infinitif","« Dessiner » est à l’infinitif. Dans cette phrase, c’est « aime » qui est conjugué.","On peut aussi dire « Nous aimons dessiner ». Observe le mot qui reste pareil.")
 ]},
 {id:"groups",name:"🧺 Classer",title:"Les trois équipes",
  intro:"Les verbes en -er vont dans l’équipe 1, sauf aller. Pour les verbes en -ir, appelle « nous » : si tu entends -issons, c’est l’équipe 2 !",
  memory:"-er sauf aller : groupe 1. -ir avec nous … -issons : groupe 2. Les autres : groupe 3. Être et avoir sont étudiés à part ici.",questions:[
  group("chanter",1,"« Chanter » finit en -er. Il est du 1er groupe."),
  group("finir",2,"Finir → nous finissons. On entend -issons : 2e groupe.","Dis « Nous finissons ». Écoute la fin."),
  group("partir",3,"Partir → nous partons. On entend -ons : 3e groupe.","Dis « Nous partons ». Écoute la fin."),
  group("aller",3,"« Aller » finit en -er. C’est l’exception à retenir : 3e groupe.","Quel est le verbe en -er qui va dans le 3e groupe ?"),
  group("grandir",2,"Grandir → nous grandissons. C’est le 2e groupe.","Dis « Nous grandissons ». Écoute la fin."),
  group("courir",3,"Courir → nous courons. C’est le 3e groupe.","Dis « Nous courons ». Écoute la fin."),
  group("prendre",3,"« Prendre » finit en -re. C’est le 3e groupe."),
  group("jouer",1,"« Jouer » finit en -er. C’est le 1er groupe."),
  group("choisir",2,"Choisir → nous choisissons. C’est le 2e groupe.","Dis « Nous choisissons ». Écoute la fin."),
  group("voir",3,"« Voir » finit en -oir. C’est le 3e groupe.")
 ]},
 {id:"final",name:"🏆 Défi final",title:"Le défi des trois clés",
  intro:"Pour chaque phrase, trouve le verbe conjugué, écris son infinitif et choisis son groupe. Tu peux dire tes réponses à voix haute avant de les valider.",
  memory:"Je retrouve les trois clés : le verbe conjugué, son infinitif et son groupe.",questions:[
  verb("Le jardinier arrose les fleurs.","arrose","Demain, le jardinier arrosera les fleurs.","Commence par « Demain, le jardinier… »"),
  inf("Le jardinier <mark>arrose</mark> les fleurs.","arroser",null,"Il faut arroser les fleurs."),
  group("arroser",1,"« Arroser » finit en -er : 1er groupe."),
  verb("Mila réussit son défi.","réussit","Mila réussit → demain, Mila réussira.","Commence par « Demain, Mila… »"),
  inf("Mila <mark>réussit</mark> son défi.","réussir",null,"Il faut réussir le défi."),
  group("réussir",2,"Réussir → nous réussissons : 2e groupe.","Dis « Nous réussissons ». Écoute la fin."),
  verb("Le bébé dort bien.","dort","Le bébé dort → les bébés dorment.","Commence par « Les bébés… »"),
  inf("Le bébé <mark>dort</mark> bien.","dormir",null,"Il faut dormir."),
  group("dormir",3,"Dormir → nous dormons : 3e groupe.","Dis « Nous dormons ». Écoute la fin.")
 ]}
];
export const verbLessonNotes=[
 "Un verbe peut dire ce qu’on fait (courir) ou comment on est (être fatigué).",
 "Un verbe conjugué s’accorde avec son sujet et indique un temps : il joue → ils jouent, ou demain, il jouera.",
 "L’infinitif est le nom du verbe dans le dictionnaire : « Il joue » → « Il faut jouer ».",
 "1er groupe : infinitif en -er, sauf aller. Exemple : chanter.",
 "2e groupe : infinitif en -ir et nous … -issons au présent. Exemple : finir → nous finissons.",
 "3e groupe : les autres verbes, comme partir → nous partons, prendre, voir et aller.",
 "Être et avoir sont deux auxiliaires particuliers que ce jeu met à part."
];
export function normalizeVerbAnswer(value:string):string{
 return value.trim().toLocaleLowerCase("fr").replace(/[.!?]+$/,"").trim();
}
