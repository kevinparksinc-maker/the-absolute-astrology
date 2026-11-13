import { describe, expect, it } from "vitest";
import { FIXED_STARS, overlay, formatLongitude } from "../shared/hybrid";
import { agentHouseFor, equalHouseCusps, godHouseFor, royalStarContacts } from "./astrologyCore";
import { calculateChart } from "./astronomy";

describe("Astrology core worldview math", () => {
  it("maps the fixed God frame from Aries through Pisces", () => {
    expect(godHouseFor(0)).toBe(1);
    expect(godHouseFor(29.999)).toBe(1);
    expect(godHouseFor(30)).toBe(2);
    expect(godHouseFor(359.999)).toBe(12);
  });
  it("builds 30-degree Equal House cusps from the Ascendant", () => {
    expect(equalHouseCusps(277.35)).toEqual([277.35, 307.35, 337.35, 7.35, 37.35, 67.35, 97.35, 127.35, 157.35, 187.35, 217.35, 247.35]);
    expect(agentHouseFor(277.35, 277.35)).toBe(1);
    expect(agentHouseFor(7.35, 277.35)).toBe(4);
  });
  it("marks Royal Star anchors and assigns stepped 5-degree weights", () => {
    const contacts = royalStarContacts(45);
    expect(contacts.find(star => star.name === "Aldebaran")).toMatchObject({ longitude: 45, distance: 0, contact: true, weight: 5 });
    expect(contacts).toHaveLength(4);
    expect(royalStarContacts(49.9).find(star => star.name === "Aldebaran")).toMatchObject({ contact: true, weight: 1 });
    expect(royalStarContacts(50.1).find(star => star.name === "Aldebaran")).toMatchObject({ contact: false, weight: 0 });
  });
});

describe("Hybrid Zodiac constants and overlays", () => {
  it("keeps the prescribed Hamal and Antares constants frozen", () => {
    expect(FIXED_STARS.find(([name]) => name === "Hamal")?.[1]).toBe(12.9333);
    expect(FIXED_STARS.find(([name]) => name === "Antares")?.[1]).toBe(225.0167);
    expect(FIXED_STARS.find(([name]) => name === "Aldebaran")?.[1]).toBe(45);
    expect(FIXED_STARS.find(([name]) => name === "Regulus")?.[1]).toBe(135);
    expect(FIXED_STARS.find(([name]) => name === "Fomalhaut")?.[1]).toBe(315);
  });
  it("starts the overlay wheel at tropical Aries", () => {
    expect(overlay(0)).toMatchObject({
      nakshatra: "Ashwini",
      pada: 1,
      manzil: "Al-Sharatain",
      decan: "Mars (Aries 1st)",
      nakshatraRuler: "Ketu",
      chineseMansion: "Kui (Legs)",
      chineseBoundaryModel: "historical-han-width-proportional-firmament-adaptation",
    });
    expect(formatLongitude(12.9333)).toBe("Aries 12°56′");
  });
  it("keeps canonical geocentric longitudes while exposing lunar parallax separately", async () => {
    const newYork = await calculateChart({ location: "New York", latitude: 40.7128, longitude: -74.006, timezone: "UTC", date: "1986-11-20", time: "10:06", worldview: "agent", readingScope: "natal" });
    const tokyo = await calculateChart({ location: "Tokyo", latitude: 35.6762, longitude: 139.6503, timezone: "UTC", date: "1986-11-20", time: "10:06", worldview: "agent", readingScope: "natal" });
    const nyMoon = newYork.movingBodies.find(row => row.name === "Moon")!;
    const tokyoMoon = tokyo.movingBodies.find(row => row.name === "Moon")!;
    expect(nyMoon.longitude).toBeCloseTo(tokyoMoon.longitude, 8);
    expect(nyMoon.topocentricLongitude).toBeDefined();
    expect(tokyoMoon.topocentricLongitude).toBeDefined();
    expect(Math.abs(nyMoon.topocentricLongitude! - tokyoMoon.topocentricLongitude!)).toBeGreaterThan(0.1);
  });
  it("selects the latest sunrise across UTC civil-day boundaries", async () => {
    // 08:00 Tokyo on Nov 7, expressed explicitly in UTC on Nov 6.
    const tokyo = await calculateChart({ location: "Tokyo", latitude: 35.6762, longitude: 139.6503, timezone: "UTC", date: "2026-11-06", time: "23:00", worldview: "agent", readingScope: "natal" });
    const local = await calculateChart({ ...tokyo.input, timezone: "Asia/Tokyo", date: "2026-11-07", time: "08:00" });
    expect(tokyo.utc).toBe(local.utc);
    expect(tokyo.ascendant!.longitude).toBeCloseTo(local.ascendant!.longitude, 8);
  });
  it("supports date-only God Natal calculations without inventing personal angles", async () => {
    const result = await calculateChart({ location: "", latitude: 0, longitude: 0, timezone: "", date: "1986-11-20", time: "", worldview: "god", readingScope: "natal", birthTimeKnown: false });
    expect(result.ascendant).toBeNull();
    expect(result.midheaven).toBeNull();
    expect(result.agentViewAvailable).toBe(false);
    expect(result.movingBodies.find(row => row.name === "Moon")?.uncertainty?.label).toContain("possible on this date");
    expect(result.movingBodies.every(row => row.godHouse && row.godHouse >= 1 && row.godHouse <= 12)).toBe(true);
  });
  it("keeps God View planetary positions independent of observer location", async () => {
    const base = { location: "New York", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York", date: "1986-11-20", time: "10:06", worldview: "god" as const, readingScope: "natal" as const };
    const newYork = await calculateChart(base);
    const tokyo = await calculateChart({ ...base, location: "Tokyo", latitude: 35.6762, longitude: 139.6503 });
    expect(tokyo.movingBodies.map(row => row.longitude)).toEqual(newYork.movingBodies.map(row => row.longitude));
  });
  it("marks the documented Dallas profile as the validation case", async () => {
    const result = await calculateChart({ location: "Dallas, Texas, USA", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago", date: "1986-11-20", time: "10:06" });
    expect(result.validation.passed).toBe(true);
    expect(result.frozenStars.find(row => row.name === "Hamal")?.display).toBe("Aries 12°56′");
  });
});
