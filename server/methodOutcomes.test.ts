import { MASTER_METHOD_IDS } from "./masterChart/registry";
import { describe, expect, it } from "vitest";
import { buildUnifiedMasterChart } from "./masterChart";
import { retrieveChartCanonDossier, canonDossierToEvidenceItems } from "./astrologyKnowledge/canon/retriever";
import { buildCanonRuleApplications } from "./astrologyKnowledge/synthesis/canonApplications";
import { buildMethodOutcomes } from "./astrologyKnowledge/synthesis/methodOutcomes";
import type { UnifiedMasterChartSnapshot } from "./masterChart/types";

const input = {
  location: "Alexandria, Egypt", latitude: 31.2001, longitude: 29.9187,
  timezone: "Africa/Cairo", date: "1988-08-08", time: "12:00", mode: "natal" as const,
};

describe("structured method-specific outcomes", () => {
  it("emits one explicit outcome for every registered method layer", async () => {
    const snapshot = await buildUnifiedMasterChart(input);
    const canon = buildCanonRuleApplications(
      snapshot,
      canonDossierToEvidenceItems(retrieveChartCanonDossier(snapshot.natal!)),
    );
    const outcomes = buildMethodOutcomes(snapshot, canon);

    expect(outcomes).toHaveLength(MASTER_METHOD_IDS.length);
    expect(new Set(outcomes.map(outcome => outcome.methodId)).size).toBe(MASTER_METHOD_IDS.length);
    for (const outcome of outcomes) {
      expect(["interpreted", "reference-only", "not-applicable", "failed"]).toContain(outcome.status);
      expect(outcome.chartScope).toBe(outcome.methodId === "transit-activation-layer" ? "event" : "natal");
      expect(outcome.interpretation.length).toBeGreaterThan(0);
      expect(outcome.judgment.length).toBeGreaterThan(0);
      expect(outcome.contribution.length).toBeGreaterThan(0);
      if (outcome.status === "interpreted") {
        expect(outcome.calculatedFindings.length).toBeGreaterThan(0);
        expect(outcome.canonApplications.length).toBeGreaterThan(0);
        expect(outcome.evidenceIds.length).toBeGreaterThan(0);
      }
    }
    expect(outcomes.find(outcome => outcome.methodId === "chinese-lunar-mansions-xiu")?.status).toBe("reference-only");
  });

  it("rejects an invalid decan finding instead of promoting its raw text", async () => {
    const snapshot = await buildUnifiedMasterChart(input);
    const canon = buildCanonRuleApplications(
      snapshot,
      canonDossierToEvidenceItems(retrieveChartCanonDossier(snapshot.natal!)),
    );
    const original = buildMethodOutcomes(snapshot, canon).find(
      outcome => outcome.methodId === "elemental-decans",
    )!;
    const altered: UnifiedMasterChartSnapshot = {
      ...snapshot,
      layers: {
        ...snapshot.layers,
        "elemental-decans": {
          ...snapshot.layers["elemental-decans"],
          results: [{ body: "Sun", sign: "Altered", decanIndex: 99, behavioralNuance: "Altered calculated testimony" }],
          evidenceIds: ["decan-sun-99"],
        },
      },
      methodExecutionLedger: snapshot.methodExecutionLedger.map(layer =>
        layer.id === "elemental-decans"
          ? { ...layer, results: [{ body: "Sun", sign: "Altered", decanIndex: 99, behavioralNuance: "Altered calculated testimony" }], evidenceIds: ["decan-sun-99"] }
          : layer,
      ),
    };
    const changed = buildMethodOutcomes(altered, canon).find(
      outcome => outcome.methodId === "elemental-decans",
    )!;

    expect(changed.status).toBe("failed");
    expect(changed.interpretation).toContain("METHOD_RULE_INPUT_INVALID");
    expect(changed.judgment).not.toContain("Altered calculated testimony");
    expect(changed.interpretation).not.toBe(original.interpretation);
    expect(changed.evidenceIds).toEqual(["decan-sun-99"]);
  });
});
