import { describe, expect, it } from "vitest";
import { calculateChart } from "./astronomy";

describe("Transit layer", () => {
  it("adds current transit positions against natal houses", async () => {
    const result = await calculateChart({ location: "Dallas, Texas, USA", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago", date: "1986-11-20", time: "10:06", transitLocation: "New York, New York, USA", transitLatitude: 40.7128, transitLongitude: -74.006, transitTimezone: "America/New_York", transitDate: "2025-01-15", transitTime: "14:30" });
    expect(result.transitDate).toMatch(/Z$/);
    expect(result.transits).toHaveLength(12);
    expect(result.transits.map(row => row.name)).toContain("Jupiter");
    expect(result.transits.every(row => row.house >= 1 && row.house <= 12)).toBe(true);
    expect(result.transits.every(row => Array.isArray(row.natalContacts))).toBe(true);
    expect(result.input.transitLocation).toBe("New York, New York, USA");
    expect(result.transitDate).toBe("2025-01-15T19:30:00.000Z");
    expect(result.descendant.longitude).toBeCloseTo((result.ascendant.longitude + 180) % 360, 8);
    expect(result.northNode.name).toBe("North Node");
    expect(result.southNode.longitude).toBeCloseTo((result.northNode.longitude + 180) % 360, 8);
    expect(result.transits.map(row => row.name)).toEqual(expect.arrayContaining(["North Node", "South Node"]));
    expect(result.momentPrecision).toBe("exact");
    expect(result.transitHouseFrame).toBe("transit-location");
    expect(result.transits.find(row => row.name === "Moon")?.topocentricLongitude).toBeDefined();
  });

  it("uses the selected transit date and time in God View", async () => {
    const result = await calculateChart({
      location: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
      date: "1986-11-20",
      time: "",
      transitDate: "2025-01-15",
      transitTime: "",
      transitTimezone: "America/New_York",
      worldview: "god",
      readingScope: "transit",
      birthTimeKnown: false,
    });
    expect(result.transitDate).toBe("2025-01-15T12:00:00.000Z");
    expect(result.momentPrecision).toBe("date-only-reference");
    expect(result.transitHouseFrame).toBe("god-fixed");
    expect(result.transits.find(row => row.name === "Moon")?.topocentricLongitude).toBeUndefined();
    await expect(calculateChart({ ...result.input, worldview: "agent", readingScope: "transit", location: "Dallas", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago", date: "1986-11-20", time: "10:06", transitLocation: "", transitLatitude: 0, transitLongitude: 0, transitTimezone: "", transitDate: "2025-01-15", transitTime: "14:30" })).rejects.toThrow("Transit location must be resolved before calculating transit houses.");
  });

  it("ignores stale transit fields in a natal-only reading and returns the sanitized input", async () => {
    const result = await calculateChart({ location: "Dallas, Texas, USA", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago", date: "1986-11-20", time: "10:06", readingScope: "natal", transitLocation: "stale form value", transitLatitude: 40.7128, transitLongitude: -74.006, transitTimezone: "America/New_York", transitDate: "2025-01-15", transitTime: "14:30" });
    expect(result.readingScope).toBe("natal");
    expect(result.input.transitLocation).toBeUndefined();
    expect(result.input.transitDate).toBeUndefined();
  });

});
