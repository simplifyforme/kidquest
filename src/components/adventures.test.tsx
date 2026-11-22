import {describe,expect,it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import BodyAdventurePlay from "./BodyAdventurePlay";
import VerbPlay from "./VerbPlay";
const callbacks={onClose:()=>{},onRoundStart:()=>{},onAttempt:async()=>{},onComplete:async()=>{}};
describe("adventure discovery screens",()=>{
 it("shows all 24 locally bundled pictures with French help and a Dutch listening button",()=>{
  const html=renderToStaticMarkup(<BodyAdventurePlay {...callbacks}/>);
  expect((html.match(/<img /g)||[]).length).toBe(24);
  expect(html).not.toContain('src="http');
  expect(html).toContain("bras");expect(html).toContain("arm 🔊");
  for(const mode of ["Découvrir","Trouver","Écrire","Mot troué","Lettres","Memory","Grand défi"])expect(html).toContain(mode);
  expect(html).not.toContain("<iframe");
 });
 it("starts French with one short tip and offers predicate and form missions",()=>{
  const html=renderToStaticMarkup(<VerbPlay {...callbacks}/>);
  expect(html).toContain("Astuce 1 / 5");expect(html).toContain("Les formes");expect(html).toContain("Le prédicat");expect(html).toContain("Grand défi");
  expect(html).not.toContain("<iframe");expect(html).not.toContain("dangerouslySetInnerHTML");
 });
});
