import { describe, expect, it } from "vitest";
import { calculateSunriseAscendant, ROTATION_DEGREES_PER_DAY } from "../../server/sunrise-ascendant";
describe("Sunrise Ascendant: synthetic inputs", () => {
 const sunrise = new Date("1986-11-20T12:00:00Z");
 it("uses sunrise Sun longitude as zero elapsed anchor", () => {
  expect(calculateSunriseAscendant({sunriseUtc:sunrise,chartUtc:sunrise,sunriseSunLongitude:240}).ascendant).toBe(240);
 });
 it("advances by sidereal rotation in an hour", () => {
  const result=calculateSunriseAscendant({sunriseUtc:sunrise,chartUtc:new Date(sunrise.getTime()+3600000),sunriseSunLongitude:240});
  expect(result.ascendant).toBeCloseTo(240+ROTATION_DEGREES_PER_DAY/24,8);
 });
 it("constructs twelve equal cusps and opposite descendant", () => {
  const result=calculateSunriseAscendant({sunriseUtc:sunrise,chartUtc:sunrise,sunriseSunLongitude:350});
  expect(result.equalHouseCusps).toHaveLength(12);
  expect(result.equalHouseCusps[1]).toBe(20);
  expect(result.descendant).toBe(170);
 });
 it("rejects invalid reference", () => {
  expect(()=>calculateSunriseAscendant({sunriseUtc:sunrise,chartUtc:sunrise,sunriseSunLongitude:NaN})).toThrow();
 });
});
