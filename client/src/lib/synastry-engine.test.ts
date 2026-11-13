import { describe, expect, it } from "vitest";
import type { ChartResult } from "../../../server/astronomy";
import { computeSynastry } from "./synastry-engine";

function chart(points: Array<[string,number]>,asc?:number): ChartResult {
 return {
  movingBodies:points.map(([name,longitude])=>({name,longitude})),
  ascendant:asc==null?null:{longitude},
 } as ChartResult;
}
describe("Synastry calculation integrity",()=>{
 it("never invents compatibility values before both charts are present",()=>{
  const result=computeSynastry(null,chart([["Sun",42]],15));
  expect(result.aspects).toEqual([]);
  expect(result.houseOverlays).toEqual([]);
  expect(result.scores.overall).toBe(0);
 });
 it("uses 5° maximum with 0° wraparound for every cross-planet pair",()=>{
  const a=chart([["Sun",359],["Moon",45],["Venus",150]],0);
  const b=chart([["Mars",1],["Mercury",51]],30);
  const r=computeSynastry(a,b);
  expect(r.aspects.find(x=>x.planetA==="Sun"&&x.planetB==="Mars")?.orb).toBe(2);
  expect(r.aspects.find(x=>x.planetA==="Moon"&&x.planetB==="Mercury")).toBeUndefined();
  expect(r.aspects.every(x=>x.orb<=5)).toBe(true);
 });
 it("derives both directions of house overlays from the two actual ascendants",()=>{
  const a=chart([["Sun",5],["Venus",79]],0);
  const b=chart([["Mars",185]],180);
  const r=computeSynastry(a,b);
  expect(r.houseOverlays).toHaveLength(3);
  expect(r.houseOverlays.find(o=>o.planet==="Person A · Sun")?.inHouse).toBe(7);
  expect(r.houseOverlays.find(o=>o.planet==="Person B · Mars")?.inHouse).toBe(7);
 });
 it("never assigns an invented house overlay where the natal ascendant is unavailable",()=>{
  const a=chart([["Sun",5]],0);
  const b=chart([["Mars",185]]);
  const r=computeSynastry(a,b);
  expect(r.houseOverlays).toHaveLength(1);
  expect(r.houseOverlays[0].planet).toBe("Person B · Mars");
 });
 it("does not assign predetermined 60+ compatibility when only tension is present",()=>{
  const r=computeSynastry(chart([["Sun",0]],0),chart([["Mars",90]],0));
  expect(r.aspects[0].aspect).toBe("Square");
  expect(r.scores.overall).toBe(0);
  expect(r.scores.archetype).toBe("Growth through friction");
 });
});
