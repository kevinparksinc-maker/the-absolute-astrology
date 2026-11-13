import { MASTER_METHOD_IDS } from "./masterChart/registry";
import { describe, expect, it } from "vitest";
import { calculateChart } from "./astronomy";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";

const input = {
  location: "Alexandria, Egypt", latitude: 31.2001, longitude: 29.9187,
  timezone: "Africa/Cairo", date: "1988-08-08", time: "12:00",
  readingScope: "natal" as const,
};

describe("Canonical synthesis reading bridge", () => {
  it("accepts matching calculated planets, ascendant, houses and includes method findings", async () => {
    const chart = await calculateChart(input);
    const result = await synthesizeChartForReading(chart, "natal", "What does this chart say?");
    expect(result.synthesis.methodFindings.length).toBe(MASTER_METHOD_IDS.length);
    expect(result.synthesis.methodOutcomes.length).toBe(MASTER_METHOD_IDS.length);
    expect(result.synthesis.methodOutcomes.every(outcome => outcome.interpretation.length > 0)).toBe(true);
    expect(result.context).toContain("methodOutcomes");
    expect(result.context).toContain("methodOutcomeAudit");
    expect(result.synthesis.canonApplications.length).toBeGreaterThan(0);
    expect(result.synthesis.canonApplications.some(application =>
      application.ruleId === "firmament-canon-dossier" &&
      application.calculationEvidenceIds.includes("planet-sun")
    )).toBe(true);
    expect(result.context).toContain("CALCULATED METHOD FINDINGS");
    expect(result.context).toContain("CANON RULE APPLICATIONS");
    expect(result.context).toContain("firmament-canon-dossier");
    expect(result.context).toContain("vedic-nakshatras-and-padas");
  });

  it("rejects a changed ascendant or equal-house cusp before interpretation", async () => {
    const chart = await calculateChart(input);
    const shiftedAsc = { ...chart, ascendant: chart.ascendant
      ? { ...chart.ascendant, longitude: (chart.ascendant.longitude + 1) % 360 }
      : chart.ascendant };
    await expect(synthesizeChartForReading(shiftedAsc, "natal", "Check angles")).rejects.toThrow("Ascendant mismatch");
    const shiftedHouses = { ...chart, houses: chart.houses.map((cusp, index) =>
      index === 0 ? (cusp + 1) % 360 : cusp) };
    await expect(synthesizeChartForReading(shiftedHouses, "natal", "Check houses")).rejects.toThrow("cusp mismatch");
  });

  it("refuses a silently changed planet position", async () => {
    const chart = await calculateChart(input);
    const altered = { ...chart, movingBodies: chart.movingBodies.map((body, index) =>
      index === 0 ? { ...body, longitude: (body.longitude + 10) % 360 } : body) };
    await expect(synthesizeChartForReading(altered, "natal", "Check chart")).rejects.toThrow("mismatch");
  });
});
