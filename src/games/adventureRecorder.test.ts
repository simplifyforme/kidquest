import {describe,expect,it,vi} from "vitest";
import {createAdventureRecorder} from "./adventureRecorder";
describe("adventure score and completion recording",()=>{
 it("coalesces fast duplicate writes and never awards the same challenge twice in a round",async()=>{
  const recorder=createAdventureRecorder(),write=vi.fn(async()=>{});
  await Promise.all([recorder.run("arm",write),recorder.run("arm",write)]);
  await recorder.run("arm",write);expect(write).toHaveBeenCalledTimes(1);
  await recorder.run("been",write);expect(write).toHaveBeenCalledTimes(2);
 });
 it("allows a failed transaction to be retried but records completion just once",async()=>{
  const recorder=createAdventureRecorder();let calls=0;
  const write=async()=>{calls++;if(calls===1)throw Error("storage")};
  await expect(recorder.run("complete",write)).rejects.toThrow("storage");
  await recorder.run("complete",write);await recorder.run("complete",write);
  expect(calls).toBe(2);
  await createAdventureRecorder().run("complete",write);expect(calls).toBe(3);
 });
});
