import {describe,expect,it} from "vitest";
import animals from "../../site/activities/dieren-nl/pack.json";
import {eligibleModes} from "./exerciseModes";
import {isValidPack} from "./updates";
import {validQuestionMedia,validActivityAsset,validateActivityAssets,activityMime} from "./activityAssets";

describe("self-contained educational activity bundles",()=>{
 it("contains eight complete animal photograph questions in Dutch",()=>{
  expect(isValidPack(animals)).toBe(true);
  expect(animals.id).toBe("dieren-nl");
  expect(animals.locale).toBe("nl-BE");
  expect(animals.category).toBe("dutch");
  expect(animals.questions).toHaveLength(8);
  expect(new Set(animals.questions.map(q=>q.id)).size).toBe(8);
  for(const q of animals.questions){
   expect(validQuestionMedia(q.media)).toBe(true);
   expect(q.answers).toHaveLength(4);
   expect(q.answers.some(a=>a.id===q.correctAnswerId)).toBe(true);
   expect(q.media.file).toMatch(/^[a-z]+\.jpg$/);
   expect(eligibleModes(q,animals.questions as never)).toEqual(["choice"]);
  }
 });
 it("accepts safe image, gif, video and audio resources, but rejects scripts and traversal",()=>{
  const valid=(file:string,mime:string)=>({file,mime,bytes:120,sha256:"a".repeat(64),
   url:"https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/activities/dieren-nl/assets/"+file});
  expect(validateActivityAssets("dieren-nl",[
   valid("chat.jpg","image/jpeg"),valid("animation.gif","image/gif"),
   valid("clip.mp4","video/mp4"),valid("pronunciation.mp3","audio/mpeg")
  ])).toBe(true);
  expect(validActivityAsset("dieren-nl",valid("../escape.jpg","image/jpeg"))).toBe(false);
  expect(validActivityAsset("dieren-nl",valid("danger.js","application/javascript"))).toBe(false);
  expect(validActivityAsset("dieren-nl",{...valid("chat.jpg","image/jpeg"),url:"https://evil.invalid/a.jpg"})).toBe(false);
  expect(validActivityAsset("../evil",valid("chat.jpg","image/jpeg"))).toBe(false);
  expect(validateActivityAssets("dieren-nl",[valid("chat.jpg","image/jpeg"),valid("chat.jpg","image/jpeg")])).toBe(false);
  expect(activityMime("animal.gif")).toBe("image/gif");
 });
 it("blocks executable resources and dangerous media descriptions",()=>{
  expect(validQuestionMedia({type:"image",file:"cat.jpg",alt:"Foto van een dier"})).toBe(true);
  expect(validQuestionMedia({type:"gif",file:"fun.gif",alt:"Animation"})).toBe(true);
  expect(validQuestionMedia({type:"video",file:"movie.mp4",alt:"Video"})).toBe(true);
  expect(validQuestionMedia({type:"audio",file:"words.mp3",alt:"Audio"})).toBe(true);
  expect(validQuestionMedia({type:"video",file:"malware.exe",alt:"Danger"})).toBe(false);
  expect(validQuestionMedia({type:"image",file:"../escape.jpg",alt:"Danger"})).toBe(false);
 });
});
