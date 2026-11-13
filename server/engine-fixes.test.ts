import { describe, expect, it } from "vitest";
import { calculateChart } from "./astronomy";
import { calculateHoraryChart } from "./horary";

const dallas = { location: "Dallas, Texas, USA", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago", date: "1986-11-20", time: "10:06" };

describe("aspect wraparound", () => {
  it("finds every transit-to-natal contact, including pairs that cross 0°/360°", async () => {
    const right = (a: number, b: number) => { let d = Math.abs(a - b) % 360; if (d > 180) d = 360 - d; return [0, 90, 120, 180].some(t => Math.abs(d - t) <= 5); };
    let truth = 0, found = 0;
    for (let i = 0; i < 365; i += 5) {
      const transitDate = new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);
      const chart = await calculateChart({ ...dallas, worldview: "agent", readingScope: "combined", transitLocation: dallas.location, transitLatitude: dallas.latitude, transitLongitude: dallas.longitude, transitTimezone: dallas.timezone, transitDate, transitTime: "12:00" });
      const targets = [...chart.movingBodies, chart.ascendant!, chart.descendant!, chart.northNode, chart.southNode];
      for (const row of chart.transits) {
        truth += targets.filter(target => right(row.longitude, target.longitude)).length;
        found += row.natalContacts.length;
      }
    }
    expect(found).toBe(truth);
  });
});

describe("horary without a natal profile", () => {
  it("does not invent natal contacts by comparing the question chart to itself", async () => {
    const chart = await calculateHoraryChart({ location: dallas.location, latitude: dallas.latitude, longitude: dallas.longitude, timezone: dallas.timezone, date: "2026-10-03", time: "09:00", question: "Will I get the job offer?", subject: "querent", topicHouse: 10 });
    expect(chart.natalChart).toBeFalsy();
    for (const row of chart.transitChart.transits) expect(row.natalContacts).toEqual([]);
    expect(chart.evidenceText).not.toMatch(/conjunction natal/);
    expect(chart.evidenceText).toMatch(/no natal profile was supplied/);
  });

  it("still reports natal contacts when a natal profile is supplied", async () => {
    const chart = await calculateHoraryChart({ location: dallas.location, latitude: dallas.latitude, longitude: dallas.longitude, timezone: dallas.timezone, date: "2026-10-03", time: "09:00", question: "Will I get the job offer?", subject: "querent", topicHouse: 10, natal: dallas });
    expect(chart.natalChart).toBeTruthy();
    expect(chart.evidenceText).toMatch(/compared with the natal foundation/);
  });
});

describe("God View live sky", () => {
  it("does not create natal contacts or personal-house comparisons", async () => {
    const chart = await calculateChart({
      location: "God View",
      latitude: 0,
      longitude: 0,
      timezone: "UTC",
      date: "",
      time: "",
      transitLocation: "God View",
      transitLatitude: 0,
      transitLongitude: 0,
      transitTimezone: "UTC",
      transitDate: "2026-10-03",
      transitTime: "17:13",
      worldview: "god",
      readingScope: "transit",
      birthTimeKnown: false,
    });
    expect(chart.agentViewAvailable).toBe(false);
    expect(chart.ascendant).toBeNull();
    expect(chart.transits.every(row => row.natalContacts.length === 0)).toBe(true);
  });
});
