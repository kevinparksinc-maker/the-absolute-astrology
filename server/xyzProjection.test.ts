import { describe, expect, it } from "vitest";
import { calculateChart, longitudeFromXYZ } from "./astronomy";

describe("fixed-wheel XYZ projection", () => {
  it.each([
    [{ x: 1, y: 0, z: 0 }, 0],
    [{ x: 0, y: 1, z: 4 }, 90],
    [{ x: -1, y: 0, z: -3 }, 180],
    [{ x: 0, y: -1, z: 0 }, 270],
    [{ x: 1, y: -1, z: 0 }, 315],
  ])("maps Cartesian direction %j to %s degrees", (vector, expected) => {
    expect(longitudeFromXYZ(vector)).toBeCloseTo(expected, 8);
  });
  it("ignores Z when projecting onto the fixed zodiac plane", () => {
    expect(longitudeFromXYZ({ x: 1, y: 1, z: 900 })).toBeCloseTo(45);
  });
  it.each([
    { x: 0, y: 0, z: 1 },
    { x: Number.NaN, y: 1, z: 0 },
    { x: 1, y: Number.POSITIVE_INFINITY, z: 0 },
  ])("rejects invalid vector %j", vector => {
    expect(() => longitudeFromXYZ(vector)).toThrow("Invalid XYZ coordinates");
  });
});

describe("chart XYZ integration", () => {
  const base = {
    location: "God View",
    latitude: 0,
    longitude: 0,
    timezone: "UTC",
    date: "1986-11-20",
    time: "12:00",
    worldview: "god" as const,
    readingScope: "natal" as const,
    birthTimeKnown: true,
  };
  it("obtains real XYZ vectors for planetary positions by default", async () => {
    const chart = await calculateChart(base);
    expect(chart.movingBodies).toHaveLength(10);
    for (const planet of chart.movingBodies) {
      expect(planet.coordinateSource).toBe("swiss-ephemeris");
      expect(planet.xyz).toBeDefined();
      expect(planet.longitude).toBeCloseTo(longitudeFromXYZ(planet.xyz!), 6);
    }
  });
  it("honors an external vector instead of overwriting it", async () => {
    const chart = await calculateChart({ ...base, xyzPositions: { Mars: { x: 1, y: 1, z: 0.25 } } });
    const mars = chart.movingBodies.find(row => row.name === "Mars");
    expect(mars?.coordinateSource).toBe("external-xyz");
    expect(mars?.longitude).toBeCloseTo(45, 6);
    expect(mars?.xyz).toEqual({ x: 1, y: 1, z: 0.25 });
  });
  it("uses a supplied historical sunrise XYZ anchor for Agent equal-house cusps", async () => {
    const chart = await calculateChart({
      location: "Dallas, TX",
      latitude: 0,
      longitude: 0,
      timezone: "UTC",
      date: "1986-11-20",
      time: "18:00",
      worldview: "agent",
      readingScope: "natal",
      sunriseAnchor: {
        sunriseUtc: "1986-11-20T12:00:00Z",
        sunriseSunXYZ: { x: 1, y: 0, z: 0 },
      },
    });
    const expected = 90;
    expect(chart.ascendant?.longitude).toBeCloseTo(expected, 6);
    expect(chart.houses[0]).toBeCloseTo(expected, 6);
    expect(chart.houses[1]).toBeCloseTo((expected + 30) % 360, 6);
    expect(chart.validation.notes.join(" ")).toContain("sunrise XYZ anchor supplied by caller; independent historical-source verification is not recorded");
  });

});
