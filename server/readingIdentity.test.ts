import {describe,expect,it} from "vitest";
import {readingCacheIdentity} from "../shared/readingIdentity";
import {calculateChart} from "./astronomy";
const input={location:"Dallas, Texas, USA",latitude:32.7767,longitude:-96.797,timezone:"America/Chicago",date:"1986-11-20",time:"10:06",readingScope:"natal" as const};
describe("reading identity",()=>{
 it("does not reuse a Mars reading for a Moon selection or another account",async()=>{
  const chart=await calculateChart(input);
  const mars=readingCacheIdentity(chart,"natal","Interpret Mars","account-a");
  expect(readingCacheIdentity(chart,"natal","Interpret Moon","account-a")).not.toBe(mars);
  expect(readingCacheIdentity(chart,"natal","Interpret Mars","account-b")).not.toBe(mars);
  expect(readingCacheIdentity(chart,"transit","Interpret Mars","account-a")).not.toBe(mars);
  expect(readingCacheIdentity(chart,"natal"," Interpret   Mars ","account-a")).toBe(mars);
 });
 it("invalidates a reading when its calculated chart moment or houses change",async()=>{
  const chart=await calculateChart(input);
  const identity=readingCacheIdentity(chart,"natal","Interpret Mars","account-a");
  expect(readingCacheIdentity({...chart,transitDate:"2026-11-05T12:00:00Z"},"natal","Interpret Mars","account-a")).not.toBe(identity);
  expect(readingCacheIdentity({...chart,houses:chart.houses.map(cusp=>cusp+1)},"natal","Interpret Mars","account-a")).not.toBe(identity);
 });
});
