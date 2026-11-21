import {describe,expect,it} from "vitest";
import {builtinPacks} from "../data/builtin";
import {getCatalog} from "./catalog";
import {isValidRemoteCatalog,resolveCategories} from "./catalogConfig";
import type {RemoteCatalog} from "./catalogConfig";
import publishedCatalog from "../../site/catalog.json";

const remote=publishedCatalog as RemoteCatalog;
describe("versioned remote presentation catalog",()=>{
 it("accepts the published catalog and preserves the four established subjects",()=>{
  expect(isValidRemoteCatalog(remote)).toBe(true);
  expect(remote.version).toBe(1);
  expect(resolveCategories(remote).map(c=>c.id)).toEqual(["math","french","dutch","chess"]);
  const entries=getCatalog(builtinPacks,remote);
  expect(entries.find(e=>e.id==="plant-playground")?.category).toBe("dutch");
  expect(entries.find(e=>e.id==="chess-beginner")?.kind).toBe("lesson");
 });
 it("can change subjects, titles, icons and sorting using JSON only, without touching IDs",()=>{
  const version2:RemoteCatalog={
   schemaVersion:1,version:2,
   categories:[...remote.categories,{id:"science",title:"Sciences",emoji:"🧪",subtitle:"Observer et découvrir",colorClass:"nature",language:"fr-BE",order:4}],
   activities:[
    {id:"plant-playground",category:"science",title:"Les plantes — Sciences",subtitle:"Six jeux scientifiques",emoji:"🌿",order:0},
    {id:"nombres",category:"math",title:"Getallen tot 1000",order:1}
   ]
  };
  expect(isValidRemoteCatalog(version2)).toBe(true);
  expect(resolveCategories(version2).map(c=>c.id)).toContain("science");
  const entries=getCatalog(builtinPacks,version2);
  const plant=entries.find(e=>e.id==="plant-playground")!;
  expect(plant).toMatchObject({id:"plant-playground",kind:"interactive",category:"science",title:"Les plantes — Sciences",emoji:"🌿"});
  expect(entries[0].id).toBe("plant-playground");
  expect(entries.find(e=>e.id==="nombres")?.title).toBe("Getallen tot 1000");
  expect(getCatalog(builtinPacks).find(e=>e.id==="plant-playground")?.category).toBe("dutch");
 });
 it("rejects executable markup, URLs, unknown categories, duplicate IDs and too many items",()=>{
  const copy=(mutate:(x:RemoteCatalog)=>void)=>{
   const o:RemoteCatalog=JSON.parse(JSON.stringify(remote));
   mutate(o);return isValidRemoteCatalog(o);
  };
  expect(copy(x=>{x.version=0})).toBe(false);
  expect(copy(x=>{x.activities[0].title="<img onerror=alert(1)>";})).toBe(false);
  expect(copy(x=>{x.activities[0].category="unregistered";})).toBe(false);
  expect(copy(x=>{x.activities.push({...x.activities[0]});})).toBe(false);
  expect(copy(x=>{x.categories[0].colorClass="background:evil";})).toBe(false);
  expect(copy(x=>{x.categories[0].title="";})).toBe(false);
  expect(isValidRemoteCatalog({schemaVersion:1,version:1,categories:[],activities:Array(301).fill({id:"a"})})).toBe(false);
 });
 it("does not turn metadata into new runnable games",()=>{
  const config:RemoteCatalog={schemaVersion:1,version:8,categories:[],activities:[{id:"not-installed-game",category:"math",title:"Fake title"}]};
  expect(isValidRemoteCatalog(config)).toBe(true);
  expect(getCatalog(builtinPacks,config).some(e=>e.id==="not-installed-game")).toBe(false);
 });
});
