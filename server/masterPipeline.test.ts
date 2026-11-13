import { calculateHarmonicForecast } from "./harmonicForecast";
import { calculateEnergyRead } from "../shared/energyScoring";
import { describe, expect, it } from "vitest";
import { calculateChart } from "./astronomy";
import { calculateMasterChart } from "./masterChart/entry";
import { MASTER_METHOD_IDS } from "./masterChart/registry";
import { buildMasterPipeline } from "./master-pipeline";
import { buildMasterGameChart } from "./simulationLab/masterGameChart";
import { getNakshatraCanonByLongitude } from "./astrologyKnowledge/canon/nakshatras27";
import { getManzilCanonByLongitude } from "./astrologyKnowledge/canon/manazil28";

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
  transitDate: "2026-11-06",
  transitTime: "11:06",
  worldview: "agent" as const,
  readingScope: "combined" as const,
};

describe("Mandatory shared Master Chart formation", () => {
  it("binds the same registry independently to natal and current skies before output", async () => {
    const chart = await calculateMasterChart(input);
    const bound = chart.methodBindings!;
    expect(bound.base.map(m => m.id)).toEqual(MASTER_METHOD_IDS);
    expect(bound.transit.map(m => m.id)).toEqual(MASTER_METHOD_IDS);
    expect(bound.synthesisAudit).toMatchObject({
      passed: true,
      groundedRatio: 1,
    });
    expect(bound.synthesisAudit.canonApplicationCount).toBeGreaterThan(0);
    const raw = await calculateChart(input);
    expect(chart.movingBodies).toEqual(raw.movingBodies);
    expect(chart.transits).toEqual(raw.transits);
    const saturn = chart.transits.find(p => p.name === "Saturn")!;
    const nakshatras = bound.transit.find(
      m => m.id === "vedic-nakshatras-and-padas"
    )!.results as any[];
    const manazil = bound.transit.find(m => m.id === "arabic-lunar-manazil")!
      .results as any[];
    expect(nakshatras.find(p => p.body === "Saturn").name).toBe(
      getNakshatraCanonByLongitude(saturn.longitude).nakshatra.name
    );
    expect(manazil.find(p => p.body === "Saturn").transliteration).toBe(
      getManzilCanonByLongitude(saturn.longitude).name
    );
    const { synthesis, snapshot } = await buildMasterPipeline(
      chart,
      "combined",
      "Read Saturn's present and natal framework"
    );
    expect(synthesis.methodFindings).toHaveLength(MASTER_METHOD_IDS.length * 2);
    expect(snapshot.snapshotId).toBe(bound.snapshotId);
    const contacts = snapshot.layers["transit-activation-layer"]
      .results as any[];
    expect(contacts).toHaveLength(calculateEnergyRead(chart)!.contactsCount);
    expect(contacts.some(c => c.natalBody === "Ascendant")).toBe(true);
    expect(contacts.some(c => c.majorFactor === 0.5)).toBe(true);
    expect(
      synthesis.canonApplications.some(
        a =>
          a.ruleId === "firmament-nakshatra-pada" &&
          a.statement.includes("shakti")
      )
    ).toBe(true);
    expect(
      synthesis.canonApplications.some(
        a =>
          a.ruleId.startsWith("firmament-fixed-star-") &&
          a.statement.includes("Test:")
      )
    ).toBe(true);
    expect(snapshot.transit?.framework?.inputs.locationContext.location).toBe(
      input.transitLocation
    );
    expect(snapshot.transit?.framework?.inputs.timezone).toBe(
      input.transitTimezone
    );
    expect(
      synthesis.canonApplications.some(a =>
        a.calculationEvidenceIds.includes("transit:planet-saturn")
      )
    ).toBe(true);
    expect(
      synthesis.canonApplications.some(a =>
        a.calculationEvidenceIds.includes("planet-saturn")
      )
    ).toBe(true);
  });

  it("rejects missing chart data and divergent positions instead of inventing replacements", async () => {
    const chart = await calculateChart(input);
    await expect(
      buildMasterPipeline(
        { ...chart, input: { ...chart.input, latitude: undefined as never } },
        "combined"
      )
    ).rejects.toThrow("MASTER_INPUT_MISSING");
    await expect(
      buildMasterPipeline(
        {
          ...chart,
          movingBodies: chart.movingBodies.map((p, i) =>
            i ? p : { ...p, longitude: p.longitude + 1 }
          ),
        },
        "combined"
      )
    ).rejects.toThrow("mismatch");
  });

  it("preserves supplied XYZ, sunrise anchors, exact timestamps and God frame", async () => {
    const radians = (123 * Math.PI) / 180;
    const custom = {
      ...input,
      worldview: "god" as const,
      sunriseAnchor: {
        sunriseUtc: "1986-11-20T13:04:00Z",
        sunriseSunXYZ: { x: 1, y: 2, z: 0.1 },
      },
      transitSunriseAnchor: {
        sunriseUtc: "2026-11-06T14:08:00Z",
        sunriseSunXYZ: { x: 2, y: 1, z: 0.2 },
      },
      xyzPositions: { Sun: { x: 1, y: 0, z: 0 } },
      transitXYZPositions: {
        Saturn: { x: Math.cos(radians), y: Math.sin(radians), z: 0 },
      },
      transitInstantUtc: "2026-11-06T19:06:23Z",
    };
    const chart = await calculateMasterChart(custom);
    const result = await buildMasterPipeline(chart, "combined");
    expect(chart.worldview).toBe("god");
    expect(chart.transitDate).toBe("2026-11-06T19:06:23.000Z");
    expect(chart.movingBodies.find(p => p.name === "Sun")!.longitude).toBe(0);
    expect(
      chart.transits.find(p => p.name === "Saturn")!.longitude
    ).toBeCloseTo(123, 8);
    expect(result.canonicalChart.input.sunriseAnchor).toEqual(
      custom.sunriseAnchor
    );
    expect(
      result.snapshot.transit?.framework?.natal?.input.sunriseAnchor
    ).toEqual(custom.transitSunriseAnchor);
  });

  it("uses the event-time horizon at the birth location when no separate transit location was supplied", async () => {
    const chart = await calculateMasterChart({
      ...input,
      transitLocation: undefined,
      transitLatitude: undefined,
      transitLongitude: undefined,
      transitTimezone: undefined,
      transitDate: undefined,
      transitTime: undefined,
      transitInstantUtc: "2026-11-06T19:06:00Z",
    });
    const { snapshot } = await buildMasterPipeline(chart, "combined");
    const event = snapshot.transit!.framework!.natal!;
    expect(chart.transitHouseFrame).toBe("natal-location");
    for (const body of chart.transits.filter(
      row => row.name !== "North Node" && row.name !== "South Node"
    ))
      expect(body.house).toBe(
        event.movingBodies.find(row => row.name === body.name)!.house
      );
  });

  it("advances forecast snapshots even when the source chart has an exact transit instant", async () => {
    const chart = await calculateMasterChart({
      ...input,
      transitInstantUtc: "2026-11-06T19:06:23Z",
    });
    const forecast = await calculateHarmonicForecast(
      chart.input,
      "2026-11-06T19:30:00Z",
      2
    );
    expect(forecast.points.map(p => p.moment)).toEqual([
      "2026-11-06T19:30:00.000Z",
      "2026-11-06T20:00:00.000Z",
      "2026-11-06T20:30:00.000Z",
    ]);
    expect(forecast.points.every(p => p.score && !p.error)).toBe(true);
  });

  it("keeps the formation for God-only charts without fabricating a local horizon", async () => {
    const chart = await calculateMasterChart({
      location: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
      date: "1986-11-20",
      time: "",
      worldview: "god",
      readingScope: "natal",
      birthTimeKnown: false,
    });
    expect(chart.ascendant).toBeNull();
    expect(chart.methodBindings!.base.map(m => m.id)).toEqual(
      MASTER_METHOD_IDS
    );
    expect(
      chart.methodBindings!.base.find(
        m => m.id === "western-houses-and-angles"
      )!.status
    ).toBe("not-applicable");
    expect(
      chart.methodBindings!.base.find(
        m => m.id === "vedic-nakshatras-and-padas"
      )!.status
    ).toBe("computed-with-result");
    // Canon without a local horizon remains in the AI input. Its unmatched
    // rule-theme coverage is reported honestly rather than filtering it out.
    expect(chart.methodBindings!.synthesisAudit.passed).toBe(false);
    expect(chart.methodBindings!.synthesisAudit.canonApplicationCount).toBeGreaterThan(0);
  });

  it("sports charts inherit the same formation and expose the calculated results to adapters", async () => {
    const game = await buildMasterGameChart({
      id: "pipeline-regression",
      league: "NFL",
      scheduledDate: "2026-11-06",
      scheduledTime: "12:00",
      venue: {
        name: input.transitLocation,
        latitude: input.transitLatitude,
        longitude: input.transitLongitude,
        timezone: input.transitTimezone,
      },
      ascTeam: "Home",
      descTeam: "Away",
      chartVersion: "test",
    });
    expect(game.snapshot.masterMethods!.base.map(m => m.id)).toEqual(
      MASTER_METHOD_IDS
    );
    expect(game.snapshot.masterMethods!.synthesisAudit.passed).toBe(true);
    expect(game.chart.methodBindings).toBe(game.snapshot.masterMethods);
    expect(game.snapshot.scheduledStart).toBe(game.chart.utc);
  });
});
