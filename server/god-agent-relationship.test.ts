import { describe, expect, it } from "vitest";
import { buildFrameRelationship, ROYAL_STARS, royalStarContacts, translationFor } from "./astrologyCore";
import { calculateChart } from "./astronomy";

describe("God's View of the Agent relationship layer", () => {
  it("classifies matching frames as convergence", () => {
    expect(buildFrameRelationship(8, 8)).toMatchObject({ type: "convergence" });
  });

  it("classifies an opposite axis as tension without changing the sky", () => {
    const relationship = buildFrameRelationship(8, 2);
    expect(relationship.type).toBe("tension");
    expect(relationship.tension).toContain("face one another across an axis");
  });

  it("classifies a private Agent channel as concealment", () => {
    expect(buildFrameRelationship(3, 12)).toMatchObject({ type: "concealment" });
  });

  it("keeps one longitude while exposing both house assignments", async () => {
    const result = await calculateChart({
      location: "Dallas, Texas, USA",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      date: "1986-11-20",
      time: "10:06",
      worldview: "agent-vs-god",
      readingScope: "natal",
    });
    const sun = result.movingBodies.find(row => row.name === "Sun")!;
    const paired = result.godPlacements.find(row => row.name === "Sun")!;
    expect(sun.longitude).toBe(paired.longitude);
    expect(sun.godHouse).toBeDefined();
    expect(sun.agentHouse).toBeDefined();
    expect(sun.frameRelationship?.translation).toBeTruthy();
    expect(paired.frameRelationship?.type).toBe(sun.frameRelationship?.type);
  });

  it("keeps the existing location responsibilities explicit", async () => {
    const base = {
      location: "Dallas, Texas, USA",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      date: "1986-11-20",
      time: "10:06",
      transitDate: "2025-01-15",
      transitTime: "14:30",
      worldview: "agent-vs-god" as const,
      readingScope: "combined" as const,
    };
    const newYork = await calculateChart({ ...base, transitLocation: "New York", transitLatitude: 40.7128, transitLongitude: -74.006, transitTimezone: "America/New_York" });
    const tokyo = await calculateChart({ ...base, transitLocation: "Tokyo", transitLatitude: 35.6762, transitLongitude: 139.6503, transitTimezone: "Asia/Tokyo" });
    const nyJupiter = newYork.transits.find(row => row.name === "Jupiter")!;
    const tokyoJupiter = tokyo.transits.find(row => row.name === "Jupiter")!;
    expect(nyJupiter.agentHouse).toBeDefined();
    expect(tokyoJupiter.agentHouse).toBeDefined();
    expect(newYork.input.transitLocation).toBe("New York");
    expect(tokyo.input.transitLocation).toBe("Tokyo");
  });
  it("keeps all four relationship classifications deterministic", () => {
    expect(buildFrameRelationship(8, 8)).toMatchObject({ type: "convergence", tension: null });
    expect(buildFrameRelationship(8, 5)).toMatchObject({ type: "translation", tension: null });
    expect(buildFrameRelationship(8, 2)).toMatchObject({ type: "tension" });
    expect(buildFrameRelationship(3, 12)).toMatchObject({ type: "concealment", tension: null });
  });

  it("writes unique planet-specific translations and syntheses from both house frames", () => {
    const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
    const relationships = planets.map(planet => translationFor(planet, 11, 9));
    const translations = relationships.map(row => row.translation);
    const syntheses = relationships.map(row => row.synthesis);

    expect(new Set(translations).size).toBe(planets.length);
    expect(new Set(syntheses).size).toBe(planets.length);
    planets.forEach((planet, index) => {
      expect(translations[index]).toContain(planet);
      expect(translations[index]).toContain("God House 11");
      expect(translations[index]).toContain("Agent House 9");
      expect(syntheses[index]).toContain(planet);
    });

    expect(translationFor("Neptune", 1, 3).translation).toContain("Neptune in God House 1");
    expect(translationFor("Neptune", 1, 3).translation).toContain("Agent House 3");
    expect(translationFor("Neptune", 1, 12).translation).toContain("1st-house undoing/opposition to the Agent");
    expect(translationFor("Pluto", 11, 9).translation).toContain("Pluto in God House 11");
  });

  it("returns a known Royal Star contact at the configured star longitude", () => {
    const star = ROYAL_STARS[0];
    const contact = royalStarContacts(star.longitude).find(row => row.name === star.name)!;
    expect(contact).toMatchObject({ name: star.name, distance: 0, contact: true, weight: 5 });
  });

  it("keeps non-Moon transit longitudes stable across locations at the same UTC moment", async () => {
    const base = {
      location: "Dallas, Texas, USA", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago",
      date: "1986-11-20", time: "10:06", worldview: "agent-vs-god" as const, readingScope: "combined" as const,
      transitDate: "2025-01-15", transitTime: "14:30",
    };
    const newYork = await calculateChart({ ...base, transitLocation: "New York", transitLatitude: 40.7128, transitLongitude: -74.006, transitTimezone: "America/New_York" });
    const tokyo = await calculateChart({ ...base, transitLocation: "Tokyo", transitLatitude: 35.6762, transitLongitude: 139.6503, transitTimezone: "Asia/Tokyo", transitDate: "2025-01-16", transitTime: "04:30" });
    expect(newYork.transitDate).toBe(tokyo.transitDate);
    for (const name of ["Jupiter", "Saturn"]) {
      const ny = newYork.transits.find(row => row.name === name)!;
      const tokyoRow = tokyo.transits.find(row => row.name === name)!;
      expect(tokyoRow.longitude).toBeCloseTo(ny.longitude, 8);
      expect(tokyoRow.godHouse).toBe(ny.godHouse);
    }
    expect(newYork.transits.find(row => row.name === "Jupiter")!.agentHouse).not.toBe(tokyo.transits.find(row => row.name === "Jupiter")!.agentHouse);
  });

});
