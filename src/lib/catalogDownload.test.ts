import {describe,expect,it} from "vitest";
import {sha256,verifyRemoteCatalog} from "./updates";
import publishedCatalog from "../../site/catalog.json";

describe("secure remote catalog distribution",()=>{
 const raw=JSON.stringify(publishedCatalog)+"\n";
 it("accepts a SHA-256 checked version of the catalog",async()=>{
  const descriptor={version:publishedCatalog.version,url:"https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/catalog.json",sha256:await sha256(raw)};
  expect(await verifyRemoteCatalog(raw,descriptor)).toMatchObject({schemaVersion:1,version:publishedCatalog.version});
 });
 it("rejects tampered bytes even if the JSON is well formed",async()=>{
  const descriptor={version:1,url:"https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/catalog.json",sha256:await sha256(raw)};
  await expect(verifyRemoteCatalog(raw.replace("Wiskunde","Maths"),descriptor)).rejects.toThrow("empreinte");
 });
 it("rejects an incorrect version even with a matching hash",async()=>{
  const descriptor={version:publishedCatalog.version+1,url:"https://raw.githubusercontent.com/simplifyforme/kidquest/main/site/catalog.json",sha256:await sha256(raw)};
  await expect(verifyRemoteCatalog(raw,descriptor)).rejects.toThrow("format");
 });
 it("rejects oversized files before SHA check",async()=>{
  const large="a".repeat(65537);
  await expect(verifyRemoteCatalog(large,{version:1,url:"https://example.org/catalog.json",sha256:"0".repeat(64)})).rejects.toThrow("volumineux");
 });
});
