import { describe, expect, it } from "vitest";
import type { ChartResult } from "../../astronomy";
import { resolveVedicTimingAndAshtakavarga } from "./timingAndAshtakavarga";

const chart = {
  input: {
    location: "Dallas, Texas, USA",
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
    date: "1986-11-20",
    time: "10:06",
    birthTimeKnown: true,
  },
  utc: "1986-11-20T16:06:00.000Z",
  julianDay: 2446751.17,
  worldview: "agent",
  readingScope: "natal",
  agentViewAvailable: true,
  momentPrecision: "exact",
  ascendant: { name: "Ascendant", longitude: 256, display: "Sagittarius 16°00′", house: 1 },
  movingBodies: [
    { name: "Sun", longitude: 238, display: "Scorpio 28°00′", house: 12 },
    { name: "Moon", longitude: 103.5, display: "Cancer 13°30′", house: 8 },
    { name: "Mars", longitude: 300, display: "Aquarius 0°00′", house: 3 },
    { name: "Mercury", longitude: 240, display: "Sagittarius 0°00′", house: 1 },
    { name: "Jupiter", longitude: 345, display: "Pisces 15°00′", house: 4 },
    { name: "Venus", longitude: 210, display: "Scorpio 0°00′", house: 12 },
    { name: "Saturn", longitude: 100, display: "Cancer 10°00′", house: 8 },
  ],
} as unknown as ChartResult;

describe("Vedic Dasha and Ashtakavarga calculation layer", () => {
  it("emits a calculated Vimshottari timeline when birth-time data is exact", () => {
    const evidence = resolveVedicTimingAndAshtakavarga(chart);
    expect(evidence.some(item => item.technique === "dasha" && item.category === "calculated-fact")).toBe(true);
    expect(evidence.find(item => item.technique === "dasha")?.statement).toContain("Birth Nakshatra");
  });

  it("checks classical BAV totals and the 337-point SAV total before exposing scores", () => {
    const evidence = resolveVedicTimingAndAshtakavarga(chart);
    const item = evidence.find(candidate => candidate.technique === "ashtakavarga");
    expect(item?.category).toBe("calculated-fact");
    expect(item?.statement).toContain("SAV total checksum 337 bindus");
    expect(item?.sourceTrace.calculationSettings?.checksums).toMatchObject({
      Sun: 48, Moon: 49, Mars: 39, Mercury: 54, Jupiter: 56, Venus: 52, Saturn: 39, SAV: 337,
    });
  });

  it("covers later-life dates without dropping the current Dasha", () => {
    const old = { ...chart, utc: "1886-11-20T16:06:00.000Z" } as ChartResult;
    const evidence = resolveVedicTimingAndAshtakavarga(old);
    const dasha = evidence.find(item => item.technique === "dasha");
    expect(dasha?.category).toBe("calculated-fact");
    expect(dasha?.statement).toContain("Current Mahadasha:");
  });

  it("uses the fixed Firmament grid without date-dependent Lahiri adjustment", () => {
    const base = resolveVedicTimingAndAshtakavarga(chart);
    const later = resolveVedicTimingAndAshtakavarga({
      ...chart,
      utc: "2086-11-20T16:06:00.000Z",
      julianDay: 2483275.17,
    } as ChartResult);
    const dasha = (items: typeof base) => items.find(item => item.technique === "dasha");
    expect(dasha(base)?.sourceTrace.calculationSettings?.coordinateFrame).toBe("firmament-fixed-tropical");
    expect(dasha(base)?.sourceTrace.calculationSettings?.birthNakshatra).toBe(
      dasha(later)?.sourceTrace.calculationSettings?.birthNakshatra
    );
    expect(dasha(base)?.sourceTrace.calculationSettings?.firmamentMoonDegrees).toBe(103.5);
    const ashta = (items: typeof base) => items.find(item => item.technique === "ashtakavarga");
    expect(ashta(base)?.statement).toBe(ashta(later)?.statement);
  });

  it("uses fixed Nakshatra boundaries for Vimshottari starts", () => {
    const atEnd = (longitude: number) => resolveVedicTimingAndAshtakavarga({
      ...chart,
      movingBodies: chart.movingBodies.map(row => row.name === "Moon" ? { ...row, longitude } : row),
    } as ChartResult).find(item => item.technique === "dasha");
    expect(atEnd(0)?.sourceTrace.calculationSettings?.birthNakshatra).toBe("Ashwini");
    expect(atEnd(360 / 27)?.sourceTrace.calculationSettings?.birthNakshatra).toBe("Bharani");
    expect(atEnd(359.999999)?.sourceTrace.calculationSettings?.birthNakshatra).toBe("Revati");
    expect(atEnd(360)?.sourceTrace.calculationSettings?.birthNakshatra).toBe("Ashwini");
  });

  it("refuses exact Dasha timing when birth time is unknown", () => {
    const uncertain = {
      ...chart,
      input: { ...chart.input, birthTimeKnown: false },
    } as ChartResult;
    const evidence = resolveVedicTimingAndAshtakavarga(uncertain);
    expect(evidence.find(item => item.technique === "dasha")?.category).toBe("uncertainty");
    expect(evidence.find(item => item.technique === "dasha")?.statement).toContain("birth time");
  });
});
