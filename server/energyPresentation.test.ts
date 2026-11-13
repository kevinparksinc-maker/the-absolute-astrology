import { describe, expect, it, vi } from "vitest";
import { geocodeLocation, calculateChart } from "./astronomy";
import { knownCity, KNOWN_CITIES } from "../shared/profileLocations";
import { describeAspectPair } from "../shared/energyInterpretation";
import {
  calculateEnergyRead,
  calculateIndependentEnergyRead,
} from "../shared/energyScoring";

const input = {
  location: "Dallas, Texas, USA",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  transitLocation: "Las Vegas, Nevada, USA",
  transitLatitude: 36.1699,
  transitLongitude: -115.1398,
  transitTimezone: "America/Los_Angeles",
  transitDate: "2026-11-04",
  transitTime: "03:21",
  worldview: "agent" as const,
  readingScope: "combined" as const,
};

describe("energy screen evidence and location consistency", () => {
  it("resolves Dallas and Las Vegas from the same canonical tuples used by presets", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("No external lookup expected"));
    try {
      for (const city of KNOWN_CITIES) {
        const result = await geocodeLocation(city.shortLabel.toLowerCase());
        expect(result).toEqual({
          label: city.label,
          latitude: city.latitude,
          longitude: city.longitude,
          timezone: city.timezone,
        });
      }
      expect(await geocodeLocation("  Las   vegas ")).toEqual({
        label: "Las Vegas, Nevada, USA",
        latitude: 36.1699,
        longitude: -115.1398,
        timezone: "America/Los_Angeles",
      });
      expect(knownCity("Las Vegas, Nevada")?.timezone).toBe(
        "America/Los_Angeles"
      );
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });
  it("explains a trine through the actual pair, house, position and orb", async () => {
    const chart = await calculateChart(input);
    const sunMoon = describeAspectPair(
      chart.movingBodies[0],
      chart.movingBodies[1],
      "Trine",
      0.42
    );
    const mercurySaturn = describeAspectPair(
      chart.movingBodies[2],
      chart.movingBodies[6],
      "Trine",
      2.1
    );
    expect(sunMoon).toContain("identity, purpose and visibility");
    expect(sunMoon).toContain(chart.movingBodies[0].display);
    expect(sunMoon).toContain("0.42° orb");
    expect(mercurySaturn).toContain("thinking, decisions and communication");
    expect(mercurySaturn).toContain("responsibility, discipline and limits");
    expect(mercurySaturn).not.toBe(sunMoon);
    expect(sunMoon).not.toContain("Effortless talent");
  });
  it("keeps independent sky pairs separate from personal natal targets at the same instant", async () => {
    const chart = await calculateChart(input);
    const personal = calculateEnergyRead(chart)!;
    const sky = await calculateChart({
      ...input,
      location: input.transitLocation,
      latitude: input.transitLatitude,
      longitude: input.transitLongitude,
      timezone: input.transitTimezone,
      date: input.transitDate,
      time: input.transitTime,
      readingScope: "natal",
    });
    const independent = calculateIndependentEnergyRead(sky)!;
    expect(personal.contactsCount).toBeGreaterThan(0);
    expect(independent.contactsCount).toBeGreaterThan(0);
    expect(
      personal.contacts.some(contact =>
        ["Ascendant", "Descendant"].includes(contact.natal)
      )
    ).toBe(true);
    expect(
      independent.contacts.some(contact =>
        ["Ascendant", "Descendant"].includes(contact.natal)
      )
    ).toBe(false);
    expect(
      independent.contacts.every(contact => contact.transit !== contact.natal)
    ).toBe(true);
    expect(new Date(chart.transitDate).getTime()).toBe(
      new Date(sky.utc).getTime()
    );
  });
  it("uses an explicit zero-contact signal and zero weights for a successful empty result", async () => {
    const chart = await calculateChart(input);
    const score = calculateEnergyRead({ ...chart, transits: [] })!;
    expect(score.signal).toBe("No active contacts");
    expect(score.contactsCount).toBe(0);
    expect(score.flowPct).toBe(0);
    expect(score.frictionPct).toBe(0);
  });
});
