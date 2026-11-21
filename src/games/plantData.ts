export type PlantMode="choice"|"order"|"write";
export type PlantItem={prompt:string;answer:string;other:string[];hint?:string;aliases?:string[]};
export type PlantGame={id:string;title:string;intro:string;mode:PlantMode;options?:string[];items:PlantItem[]};
const item=(prompt:string,answer:string,...other:string[]):PlantItem=>({prompt,answer,other});
const parts=["wortels","stengel","bladeren","bloem","vrucht","stam"];
const needs=["water","licht","lucht","voedingsstoffen","een geschikte temperatuur"];
/** Adapted verbatim from de_plant_speeltuin.html: six games, choices, order and free-writing. */
export const plantGames:PlantGame[]=[
 {id:"detective",title:"🔎 Plantendetective",intro:"Welk deel van de plant zoek ik?",mode:"choice",options:parts,items:[
 item("Ik zit meestal onder de grond en houd de plant vast.","wortels"),
 item("Ik draag de bladeren en de bloem van een jonge bonenplant.","stengel"),
 item("Ik ben het dikke, houtige deel van een boom.","stam"),
 item("Ik zit aan de stengel en ben meestal groen en plat. Ik ben één van de …","bladeren"),
 item("Ik kan bloemblaadjes in mooie kleuren hebben.","bloem"),
 item("Een aardbei is hier een voorbeeld van.","vrucht")]},
 {id:"needs",title:"💧 Red de plant",intro:"Wat ontbreekt er? Lees de aanwijzing en kies.",mode:"choice",options:needs,items:[
 item("De aarde is droog. De plant heeft dorst.","water"),
 item("De plant staat in een donkere kast.","licht"),
 item("In de kas is het veel te koud voor deze plant.","een geschikte temperatuur"),
 item("De wortels nemen water op. Welke stoffen nemen ze ook op?","voedingsstoffen"),
 item("Welk mengsel van gassen zit om de plant heen?","lucht"),
 item("De plant staat ver van het raam. Haar bladeren krijgen bijna geen …","licht")]},
 {id:"functions",title:"🍃 Wie doet wat?",intro:"Kies het plantendeel dat dit doet.",mode:"choice",options:parts.slice(0,5),items:[
 item("Ik maak voedsel met behulp van licht.","bladeren"),
 item("Ik neem water en voedingsstoffen op en houd de plant vast.","wortels"),
 item("Ik draag de bonenplant en vervoer water en voedingsstoffen.","stengel"),
 item("Uit mij kan een vrucht groeien.","bloem"),
 item("Ik bevat en bescherm de zaden.","vrucht")]},
 {id:"growth",title:"🌿 Van zaad tot vrucht",intro:"Klik op de kaarten in de juiste volgorde.",mode:"order",items:[
 item("Hoe groeit de plant?","zaad","kieming","jonge plant","volwassen plant","bloem","vrucht met zaden"),
 item("Wat groeit eerst bij de kieming?","worteltje","stengel en blaadjes")]},
 {id:"bulb",title:"🧅 Bol of knol?",intro:"Kies het juiste woord.",mode:"choice",items:[
 item("Welke is een bol?","ui","aardappel"),
 item("Welke is een stengelknol?","aardappel","ui"),
 item("Hoe heten de vlezige lagen van een ui?","rokken","ogen","scheuten"),
 item("Waaruit groeien de scheuten van een aardappel?","ogen","rokken","wortels"),
 item("Wat slaan een bol én een knol op?","voedsel","licht","lucht"),
 item("Uit een bol én uit een knol kan een nieuwe plant groeien.","waar","niet waar")]},
 {id:"write",title:"✍️ Schrijf het woord",intro:"Typ het ontbrekende woord en druk op Enter.",mode:"write",items:[
 {...item("Een boom heeft een dikke …","stam"),hint:"un tronc"},
 {...item("De … nemen water op.","wortels"),hint:"les racines"},
 {...item("Uit een … kan een vrucht groeien.","bloem"),hint:"une fleur"},
 {...item("Bij de kieming groeit eerst een …","worteltje"),hint:"une petite racine",aliases:["wortel"]},
 {...item("De ui is een …","bol"),hint:"un bulbe"},
 {...item("De aardappel is een …","knol"),hint:"un tubercule",aliases:["stengelknol"]},
 {...item("Een zaadje heeft lucht en warmte nodig. Het heeft ook … nodig.","water"),hint:"de l’eau"},
 {...item("De bladeren maken voedsel met behulp van …","licht"),hint:"la lumière"}]}
];
export function normalisePlantWord(answer:string):string{
 return answer.toLocaleLowerCase("nl").trim().replace(/[.!?]+$/,"").trim().replace(/^(de|het|een)\s+/,"");
}
export function isPlantAnswerCorrect(item:PlantItem,input:string):boolean{
 const value=normalisePlantWord(input);
 return [item.answer,...(item.aliases??[])].includes(value);
}
export function plantSteps(item:PlantItem):string[]{return [item.answer,...item.other]}
