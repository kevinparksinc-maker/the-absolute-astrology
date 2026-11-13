import { describe, expect, it } from "vitest";
import { calculateChart, parseLocalToUtc } from "./astronomy";
import { calculateEnergyRead, calculateIndependentEnergyRead, energyIntensity } from "../shared/energyScoring";
import { calculateHarmonicForecast } from "./harmonicForecast";
import { localDateTime } from "../shared/transitTime";

const input = {
  location: "Dallas, Texas, USA", latitude: 32.7767, longitude: -96.797,
  timezone: "America/Chicago", date: "1986-11-20", time: "10:06",
  transitLocation: "Las Vegas, Nevada, USA", transitLatitude: 36.1699, transitLongitude: -115.1398,
  transitTimezone: "America/Los_Angeles", transitDate: "2026-11-04", transitTime: "09:00",
  worldview: "agent" as const, readingScope: "combined" as const,
};

describe("energy read consistency", () => {
  it("preserves Dallas natal positions while calculating Las Vegas transit snapshots", async () => {
    const first = await calculateChart(input);
    const next = await calculateChart({ ...input, transitTime: "09:30" });
    expect(next.movingBodies).toEqual(first.movingBodies);
    expect(next.utc).toBe(first.utc);
    expect(next.transitDate).not.toBe(first.transitDate);
    expect(next.transits.find(p => p.name === "Moon")?.longitude).not.toBe(first.transits.find(p => p.name === "Moon")?.longitude);
    const score = calculateEnergyRead(first)!;
    expect(score.harmonious.length + score.challenging.length + score.dynamic.length).toBe(score.contactsCount);
    expect(score.flowWeight).toBe(score.harmonious.reduce((sum,c) => sum+c.strength,0));
    expect(score.frictionWeight).toBe(score.challenging.reduce((sum,c) => sum+c.strength,0));
    expect(score.flowPct + score.frictionPct).toBe(100);
    expect(new Set(score.contacts.map(c => `${c.transit}:${c.natal}`)).size).toBe(score.contactsCount);
  });

  it("uses full weight for sextiles and half weight for minor contacts, without duplicate inflation", async () => {
    const chart = await calculateChart(input);
    chart.transits = [{ ...chart.transits[0], name: "Sun", natalContacts: [], minorNatalContacts: [
      { natalName: "Moon", aspect: "sextile", orb: 0, weightMultiplier: 0.5, classification: "flow" },
      { natalName: "Moon", aspect: "sextile", orb: 0, weightMultiplier: 0.5, classification: "flow" },
      { natalName: "Mars", aspect: "semisquare", orb: 0, weightMultiplier: 0.5, classification: "friction" },
    ] }];
    const score = calculateEnergyRead(chart)!;
    expect(score.contactsCount).toBe(2);
    expect(score.flowWeight).toBe(125);
    expect(score.frictionWeight).toBe(62.5);
    expect([0,1,2,3,4,5,5.01,-1,NaN].map(energyIntensity)).toEqual([5,4,3,2,1,1,0,0,0]);
  });

  it("scores independent sky pairs once with no self-conjunctions or natal overlay", async () => {
    const chart = await calculateChart({ ...input, readingScope: "natal" });
    chart.movingBodies = [{ ...chart.movingBodies[0], name: "Sun", longitude: 0 }, { ...chart.movingBodies[1], name: "Moon", longitude: 60 }];
    const score = calculateIndependentEnergyRead(chart)!;
    expect(score.contacts.filter(c => [c.transit,c.natal].includes("Sun") && [c.transit,c.natal].includes("Moon"))).toHaveLength(1);
    expect(score.contacts.some(c => c.transit === c.natal)).toBe(false);
    expect(score.contacts.find(c => c.transit === "Sun" && c.natal === "Moon")?.strength).toBe(125);
  });

  it("produces 30-minute forecast samples matching direct engine calculations", async () => {
    const forecast = await calculateHarmonicForecast(input, "2026-11-04T17:00:00.000Z", 2);
    expect(forecast.points).toHaveLength(3);
    expect(forecast.points.map(p=>p.moment)).toEqual(["2026-11-04T17:00:00.000Z","2026-11-04T17:30:00.000Z","2026-11-04T18:00:00.000Z"]);
    for (const point of forecast.points) {
      const local = localDateTime(new Date(point.moment), input.transitTimezone);
      const direct = calculateEnergyRead(await calculateChart({ ...input, transitDate: local.date, transitTime: local.time }));
      expect(point.score).toEqual(direct);
    }
  });

  it("calculates all 49 samples across midnight and the pre-dawn horizon", async () => {
    const forecast = await calculateHarmonicForecast(input, "2026-11-04T17:00:00.000Z");
    expect(forecast.points).toHaveLength(49);
    expect(forecast.points.filter(p => p.error)).toEqual([]);
    expect(new Set(forecast.points.map(p => p.moment)).size).toBe(49);
    const preDawn = await calculateChart({ ...input, date: "1986-11-20", time: "04:00", transitTime: "04:00" });
    expect(preDawn.ascendant).not.toBeNull();
    expect(preDawn.transits.every(body => Number.isFinite(body.agentHouse))).toBe(true);
  });

  it.each([
    ["America/Chicago", "10:06", "1986-11-20T16:06:00.000Z"],
    ["Asia/Kolkata", "10:06", "1986-11-20T04:36:00.000Z"],
    ["Asia/Kathmandu", "10:06", "1986-11-20T04:21:00.000Z"],
  ])("retains the correct instant for %s including fractional offsets", (timezone,time,expected) => {
    expect(parseLocalToUtc("1986-11-20",time,timezone).toISOString()).toBe(expected);
  });

  it("keeps repeated DST wall times explicit rather than choosing a guessed instant", () => {
    expect(() => parseLocalToUtc("2026-11-01","01:30","America/Los_Angeles")).toThrow("ambiguous");
  });
});

describe("saved horizon repair", () => {
  it("repairs a saved Las Vegas label paired with Dallas coordinates without changing birth data", async () => {
    const { repairProfileLocations } = await import("../shared/profileLocations");
    const broken = { ...input, transitLatitude: input.latitude, transitLongitude: input.longitude, transitTimezone: input.timezone };
    const fixed = repairProfileLocations(broken);
    expect(fixed.latitude).toBe(input.latitude);
    expect(fixed.longitude).toBe(input.longitude);
    expect(fixed.date).toBe(input.date);
    expect(fixed.transitLatitude).toBe(36.1699);
    expect(fixed.transitLongitude).toBe(-115.1398);
    expect(fixed.transitTimezone).toBe("America/Los_Angeles");
    expect(repairProfileLocations(fixed)).toBe(fixed);
  });
});
