import {describe,it,expect} from "vitest";
import {xyzToEquatorial,mod360,sector,equatorialAscendantFromLast,siderealAtSunrise,equalHouseCusps,equalHouse,nodeAxis,majorAspects,dayLots} from "./xyzWheel";
describe("independent custom XYZ equatorial wheel",()=>{
 it("handles XYZ quadrants and invalid vectors",()=>{
  expect(xyzToEquatorial({x:0,y:1,z:0}).ra).toBe(90);
  expect(xyzToEquatorial({x:-1,y:0,z:0}).ra).toBe(180);
  expect(xyzToEquatorial({x:0,y:-1,z:0}).ra).toBe(270);
  expect(xyzToEquatorial({x:0,y:0,z:1}).dec).toBe(90);
  expect(()=>xyzToEquatorial({x:0,y:0,z:0})).toThrow();
 });
 it("partitions 360 into 12 half-open sectors and houses",()=>{
  expect(mod360(-1)).toBe(359);expect(sector(30).sign).toBe("Taurus");
  const asc=294.75,cusps=equalHouseCusps(asc);
  expect(cusps).toHaveLength(12);
  expect(cusps[1]).toBeCloseTo(324.75);
  expect(equalHouse(17.24,asc)).toBe(3);
  expect(equalHouse(197.24,asc)).toBe(9);
  for(let i=0;i<12;i++)expect(equalHouse(cusps[i],asc)).toBe(i+1);
 });
 it("keeps the nodes opposite across wraparound",()=>{
  for(const asc of [0,29.9,294.75,359.9])for(const north of [0,17.24,180,359.999]){
   const x=nodeAxis(north,asc);
   expect(mod360(x.south-x.north)).toBe(180);
   expect(x.southHouse).toBe(1+(x.northHouse+5)%12);
  }
 });
 it("derives eastern equatorial horizon from sidereal angle",()=>{
  expect(equatorialAscendantFromLast(204.75)).toBeCloseTo(294.75);
  expect(siderealAtSunrise(90,0,0,0)).toBeCloseTo(0);
  expect(siderealAtSunrise(90,80,80)).toBeNull();
 });
 it("reports unique major aspects and day Lots",()=>{
  const x=majorAspects([{id:"A",ra:0},{id:"B",ra:180},{id:"C",ra:120}]);
  expect(x).toHaveLength(3);
  expect(x.find(v=>v.aspect==="opposition")?.harmonious).toBe(false);
  expect(dayLots(100,20,40,true)).toEqual({fortune:120,spirit:80});
 });
});
