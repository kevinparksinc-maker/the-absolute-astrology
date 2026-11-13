import { describe, expect, it } from "vitest";
import { InvariantVectorEngine } from "../../core/astrology/InvariantVectorEngine";

const normal = {x:0,y:0,z:1};
const xAxis = {x:1,y:0,z:0};
const aldebaran = {x:Math.SQRT1_2,y:Math.SQRT1_2,z:0};
const engine = new InvariantVectorEngine(normal,xAxis,aldebaran);

describe("Invariant Babylonian vector geometry (synthetic fixtures only)", () => {
  it("anchors calibration star at 45 degrees", () => {
    expect(engine.computeLongitude(aldebaran)).toBeCloseTo(45,10);
  });
  it("repeated fixed input has no coordinate-frame drift", () => {
    const p={x:-1,y:2,z:3};
    expect(engine.computeLongitude(p)).toBe(engine.computeLongitude(p));
  });
  it("computes forward speed in degrees per day", () => {
    const state=engine.computePlanetaryState({pos:{x:2,y:0,z:1},vel:{x:0,y:2,z:0}});
    expect(state.longitude).toBeCloseTo(0,10);
    expect(state.speed).toBeCloseTo(180/Math.PI,10);
  });
  it("computes retrograde speed and scales correctly with distance", () => {
    const a=engine.computePlanetaryState({pos:{x:2,y:0,z:0},vel:{x:0,y:-2,z:0}});
    const b=engine.computePlanetaryState({pos:{x:20,y:0,z:0},vel:{x:0,y:-20,z:0}});
    expect(a.speed).toBeLessThan(0);
    expect(a.speed).toBeCloseTo(b.speed,10);
  });
  it("wraps longitudes into [0,360)", () => {
    expect(engine.computeLongitude({x:1,y:-0.001,z:0})).toBeGreaterThan(359);
  });
  it("generates twelve equal house cusps", () => {
    const h=engine.equalHouses(12.5);
    expect(h).toHaveLength(12);
    expect(h[0]).toBe(12.5);
    expect(h[1]).toBe(42.5);
    expect(h[11]).toBe(342.5);
  });
  it("rejects degenerate input and plane projection", () => {
    expect(()=>engine.computeLongitude({x:0,y:0,z:0})).toThrow();
    expect(()=>engine.computeLongitude({x:0,y:0,z:1})).toThrow();
    expect(()=>new InvariantVectorEngine(normal,{x:0,y:0,z:1},aldebaran)).toThrow();
  });
});
