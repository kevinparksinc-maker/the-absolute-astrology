import { describe, expect, it } from "vitest";
import { calculateChart } from "./astronomy";
import { calculateEnergyRead } from "../shared/energyScoring";
import { buildEnergyAssessment } from "../shared/energyAssessment";

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
  transitDate: "2026-11-05",
  transitTime: "12:33",
  worldview: "agent" as const,
  readingScope: "combined" as const,
};

describe("energy assessment", () => {
  it("explains the actual weighted leaders, placements, risks and actions", async () => {
    const chart = await calculateChart(input);
    const score = calculateEnergyRead(chart)!;
    const assessment = buildEnergyAssessment(chart, score);
    const text = assessment.paragraphs.join(" ");
    expect(text).toContain(
      `${score.flowWeight.toFixed(1)} (${score.flowPct}%)`
    );
    expect(text).toContain(
      `${score.frictionWeight.toFixed(1)} (${score.frictionPct}%)`
    );
    for (const group of [score.challenging, score.harmonious]) {
      const leader = [...group].sort(
        (a, b) =>
          b.strength - a.strength || a.orb - b.orb || a.id.localeCompare(b.id)
      )[0];
      expect(text).toContain(
        `${leader.transit} ${leader.aspect} natal ${leader.natal}`
      );
      expect(text).toContain(`${leader.orb.toFixed(2)}° orb`);
      expect(text).toContain(`${leader.strength.toFixed(1)} weighted points`);
    }
    expect(text).toContain("House");
    expect(text).toContain("The pressure can show up as");
    expect(text).toContain("How to work with this");
    expect(text).not.toContain("Both harmony and friction are present");
    expect(text).not.toContain("interpretation unavailable");
    // Identical percentages with different planetary drivers must change meaning.
    const swapped = {
      ...chart,
      transits: chart.transits.map(b => ({
        ...b,
        name:
          b.name === "Mars" ? "Saturn" : b.name === "Saturn" ? "Mars" : b.name,
      })),
    };
    const changed = buildEnergyAssessment(
      swapped,
      calculateEnergyRead(swapped)!
    );
    expect(changed.paragraphs).not.toEqual(assessment.paragraphs);
  });
  it("does not invent an assessment for an empty result", async () => {
    const chart = { ...(await calculateChart(input)), transits: [] };
    const assessment = buildEnergyAssessment(
      chart,
      calculateEnergyRead(chart)!
    );
    expect(assessment.headline).toBe("No contacts within 5°");
    expect(assessment.paragraphs.join()).not.toContain("Support —");
  });
});
