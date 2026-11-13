import { describe, expect, it } from "vitest";
import { ascendantFromSunrise, solarAnglesFromFixedXYZ, ROTATION_DEGREES_PER_HOUR } from "./sunriseAscendant";

describe("The Absolute: Sun equatorial XYZ sunrise + elapsed rotation at exactly 15 degrees per hour", () => {
  it("converts geocentric equatorial XYZ to a 360 degree wheel angle", () => {
    expect(solarAnglesFromFixedXYZ({ x: 0, y: 1, z: 1 }).longitude).toBe(90);
    expect(solarAnglesFromFixedXYZ({ x: 0, y: 1, z: 1 }).declination).toBeCloseTo(45, 8);
  });
  it("uses the Sun position directly at sunrise without an additional horizon offset", () => {
    const sunriseSunXYZ = { x: Math.cos(235 * Math.PI / 180), y: Math.sin(235 * Math.PI / 180), z: 0 };
    const result = ascendantFromSunrise({
      sunriseUtc: "1986-11-20T13:06:00Z",
      eventUtc: "1986-11-20T16:06:00Z",
      sunriseSunXYZ,
      latitude: 32.7767,
    });
    expect(result.sunriseHorizon).toBeCloseTo(235, 8);
    expect(result.elapsedHours).toBe(3);
    expect(result.ascendant).toBeCloseTo(235 + 3 * ROTATION_DEGREES_PER_HOUR, 8);
    expect(result.model).toBe("sun-equatorial-xyz-at-sunrise-plus-15-degrees-per-hour-v1");
  });
  it("does not change the rule based on latitude after sunrise is established", () => {
    const input = {
      sunriseUtc: "1986-11-20T13:06:00Z",
      eventUtc: "1986-11-20T16:06:00Z",
      sunriseSunXYZ: { x: 0, y: 1, z: 0.4 },
    };
    expect(ascendantFromSunrise({ ...input, latitude: 0 }).ascendant)
      .toBeCloseTo(ascendantFromSunrise({ ...input, latitude: 40 }).ascendant, 8);
  });
  it("rejects invalid or future sunrise rather than falling back", () => {
    expect(() => ascendantFromSunrise({
      sunriseUtc: "1986-11-20T18:00:00Z",
      eventUtc: "1986-11-20T16:06:00Z",
      sunriseSunXYZ: { x: 1, y: 0, z: 0 },
      latitude: 32,
    })).toThrow("Sunrise anchor must precede");
  });
});
