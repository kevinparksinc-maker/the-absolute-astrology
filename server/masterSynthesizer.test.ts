import { MASTER_METHOD_IDS } from "./masterChart/registry";
import { describe, it, expect } from "vitest";
import { buildUnifiedMasterChart } from "./masterChart";
import {
  extractPropositionsFromSnapshot,
  clusterPropositionsIntoThemes,
  synthesizeMasterReading,
} from "./astrologyKnowledge/synthesis";
import { retrieveChartCanonDossier, canonDossierToEvidenceItems } from "./astrologyKnowledge/canon/retriever";
import { buildCanonRuleApplications } from "./astrologyKnowledge/synthesis/canonApplications";

const SAMPLE_INPUT = {
  location: "Athens, Greece",
  latitude: 37.9838,
  longitude: 23.7275,
  timezone: "Europe/Athens",
  date: "1990-05-15",
  time: "14:30",
  mode: "natal" as const,
};

describe("Master Synthesizer Pipeline", () => {
  it("distinguishes sub-four-decimal coordinate changes in snapshot identity", async () => {
    const first = await buildUnifiedMasterChart(SAMPLE_INPUT);
    const shifted = await buildUnifiedMasterChart({ ...SAMPLE_INPUT, latitude: SAMPLE_INPUT.latitude + 0.000001 });
    expect(shifted.snapshotId).not.toBe(first.snapshotId);
  });

  it("extracts grounded propositions with explicit evidence IDs across traditions", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);
    const propositions = extractPropositionsFromSnapshot(snapshot);

    expect(propositions.length).toBeGreaterThanOrEqual(6);
    for (const prop of propositions) {
      expect(prop.id).toBeDefined();
      expect(prop.domain).toBeDefined();
      expect(prop.causalMechanism).toBeDefined();
      expect(prop.supportingEvidenceIds.length).toBeGreaterThan(0);
      expect(prop.tradition).toBeDefined();
    }
  });

  it("clusters propositions by lived human domains and detects cross-tradition corroboration", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);
    const propositions = extractPropositionsFromSnapshot(snapshot);
    const { themes, tensions } = clusterPropositionsIntoThemes(propositions);

    expect(themes.length).toBeGreaterThanOrEqual(4);

    const domains = themes.map(t => t.domain);
    expect(domains).toContain("identity");
    expect(domains).toContain("purpose_work");

    for (const theme of themes) {
      expect(theme.primaryConclusion).toBeDefined();
      expect(theme.whyHow).toBeDefined();
      expect(theme.concreteManifestations.length).toBeGreaterThan(0);
      expect(theme.convergenceAssessment.independentTraditions.length).toBeGreaterThan(0);
      expect(theme.evidenceIds.length).toBeGreaterThan(0);
    }
  });

  it("synthesizes a complete master reading with dominant conclusion, integrated prose, and 100% evidence traceability", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);
    const result = await synthesizeMasterReading({
      snapshot,
      readingMode: "natal",
      userQuestion: "What is my core life trajectory and highest calling?",
    });

    expect(result.snapshotId).toBe(snapshot.snapshotId);
    expect(result.dominantConclusion).toContain("celestial configuration");
    expect(result.integratedNarrative.length).toBeGreaterThanOrEqual(4);

    // Verify trace map has entries for every theme and dominant conclusion
    expect(result.evidenceTraceMap["dominant-conclusion"]).toBeDefined();
    expect(result.evidenceTraceMap["dominant-conclusion"].length).toBeGreaterThan(0);

    for (const theme of result.themes) {
      expect(result.evidenceTraceMap[theme.id]).toEqual(theme.evidenceIds);
    }

    // Verify method ledger summary reports real counts
    expect(result.methodLedgerSummary.totalEvaluated).toBe(MASTER_METHOD_IDS.length);
    expect(result.methodLedgerSummary.computedWithResult).toBeGreaterThanOrEqual(10);
    expect(result.methodLedgerSummary.referenceOnly).toBe(1); // Chinese 28 Xiu

    // Quality audit verification
    expect(result.qualityAudit.passed).toBe(true);
    expect(result.qualityAudit.groundedRatio).toBe(1.0);
    expect(result.qualityAudit.unsupportedClaims).toHaveLength(0);
  });

  it("propagates a changed calculated finding into the method judgment and final synthesis", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);
    const canonApplications = buildCanonRuleApplications(
      snapshot,
      canonDossierToEvidenceItems(retrieveChartCanonDossier(snapshot.natal!)),
    );
    const original = await synthesizeMasterReading({
      snapshot,
      readingMode: "natal",
      userQuestion: "What is my core life trajectory?",
      canonApplications,
    });
    const aspectLayer = snapshot.methodExecutionLedger.find(layer => layer.id === "western-aspects-and-orbs")!;
    const alteredAspects = aspectLayer.results.map((result, index) =>
      index === 0 ? { ...result, aspect: "Trine", nature: "harmony", orb: 0.25 } : result,
    );
    const altered = {
      ...snapshot,
      methodExecutionLedger: snapshot.methodExecutionLedger.map(layer =>
        layer.id === aspectLayer.id ? { ...layer, results: alteredAspects } : layer,
      ),
      layers: {
        ...snapshot.layers,
        [aspectLayer.id]: { ...snapshot.layers[aspectLayer.id], results: alteredAspects },
      },
    };
    const changed = await synthesizeMasterReading({
      snapshot: altered,
      readingMode: "natal",
      userQuestion: "What is my core life trajectory?",
      canonApplications,
    });
    const originalOutcome = original.methodOutcomes.find(outcome => outcome.methodId === aspectLayer.id)!;
    const changedOutcome = changed.methodOutcomes.find(outcome => outcome.methodId === aspectLayer.id)!;

    expect(changedOutcome.judgment).not.toBe(originalOutcome.judgment);
    expect(changed.themes).not.toEqual(original.themes);
    expect(changedOutcome.findingJudgments[0].valence).toBe("supportive");
    expect(changedOutcome.findingJudgments[0].rules.some(rule=>rule.ruleId==="aspect-trine")).toBe(true);
    expect(changed.integratedNarrative.some(line => line.includes(changedOutcome.findingJudgments[0].judgment))).toBe(true);
  });

  it("keeps the transit layer rule-linked in a combined natal/transit worked example", async () => {
    const snapshot = await buildUnifiedMasterChart({
      ...SAMPLE_INPUT,
      mode: "combined",
      transitLocation: "New York, New York, USA",
      transitLatitude: 40.7128,
      transitLongitude: -74.006,
      transitTimezone: "America/New_York",
      transitDate: "2026-10-31",
      transitTime: "12:00",
    });
    const result = await synthesizeMasterReading({
      snapshot,
      readingMode: "combined",
      userQuestion: "What is active now in relation to my natal promise?",
    });
    const transit = result.methodOutcomes.find(outcome => outcome.methodId === "transit-activation-layer")!;

    expect(transit.chartScope).toBe("event");
    expect(["interpreted", "failed", "not-applicable"]).toContain(transit.status);
    if (transit.status === "interpreted") {
      expect(transit.canonApplications.length).toBeGreaterThan(0);
      expect(transit.judgment).toContain("transit");
    }
    expect(result.integratedNarrative.some(line => line.includes("METHOD OUTCOME [transit-activation-layer]"))).toBe(true);
  });
});
