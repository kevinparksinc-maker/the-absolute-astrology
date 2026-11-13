import { describe, expect, it } from "vitest";
import { buildUnifiedMasterChart } from "./masterChart";
import { synthesizeMasterReading } from "./astrologyKnowledge/synthesis/synthesizer";
import { extractPropositionsFromSnapshot } from "./astrologyKnowledge/synthesis/normalizer";
import type { CanonRuleApplication } from "./astrologyKnowledge/synthesis/types";

const input = {
  location: "Alexandria, Egypt", latitude: 31.2001, longitude: 29.9187,
  timezone: "Africa/Cairo", date: "1988-08-08", time: "12:00", mode: "natal" as const,
};

describe("Unified synthesis method-coverage contract", () => {
  it("incorporates each computed layer's actual findings into interpreted themes", async () => {
    const snapshot = await buildUnifiedMasterChart(input);
    const synthesis = await synthesizeMasterReading({ snapshot, readingMode: "natal" });
    const propositions = extractPropositionsFromSnapshot(snapshot);
    const linked = new Set(synthesis.themes.flatMap(theme => theme.linkedPropositionIds));
    for (const layer of snapshot.methodExecutionLedger) {
      const entry = synthesis.methodFindings.find(method => method.id === layer.id);
      expect(entry?.status).toBe(layer.status);
      if (layer.status !== "computed-with-result") continue;
      const records = Array.isArray(layer.results) ? layer.results : layer.results == null ? [] : [layer.results];
      expect(records.length).toBeGreaterThan(0);
      for (let index = 0; index < records.length; index++) {
        const id = `prop-method-${layer.id}-${index}`;
        expect(propositions.some(prop => prop.id === id)).toBe(true);
        expect(linked.has(id)).toBe(true);
        const proposition = propositions.find(prop => prop.id === id)!;
        expect(synthesis.themes.some(theme => theme.linkedPropositionIds.includes(id) && theme.whyHow.includes(proposition.plainLanguageMeaning) && proposition.supportingEvidenceIds.every(evidenceId => theme.evidenceIds.includes(evidenceId)))).toBe(true);
        expect(synthesis.integratedNarrative.some(line => line.includes(layer.name))).toBe(true);
      }
    }
    for (const theme of synthesis.themes) {
      expect(theme.evidenceIds.length).toBeGreaterThan(0);
      expect(theme.linkedPropositionIds.length).toBeGreaterThan(0);
      expect(theme.consequences).toContain("Evidence:");
      expect(theme.deeperMeaning).toContain("Symbolic interpretation of");
      const evidenceProps = propositions.filter(prop => theme.linkedPropositionIds.includes(prop.id) && !prop.id.endsWith("-remaining") && prop.supportingEvidenceIds.length > 0);
      expect(theme.concreteManifestations.length).toBe(Math.min(4, evidenceProps.length));
      for (const manifestation of theme.concreteManifestations) {
        expect(evidenceProps.some(prop => manifestation.includes(prop.plainLanguageMeaning) && prop.supportingEvidenceIds.every(id => manifestation.includes(id)))).toBe(true);
      }
    }
    expect(synthesis.qualityAudit.unsupportedClaims).toEqual([]);
  });

  it("never promotes reference-only Chinese mansions into computed interpretations", async () => {
    const snapshot = await buildUnifiedMasterChart(input);
    const synthesis = await synthesizeMasterReading({ snapshot, readingMode: "natal" });
    const xiu = synthesis.methodFindings.find(layer => layer.id === "chinese-lunar-mansions-xiu");
    expect(xiu?.status).toBe("reference-only");
    expect(synthesis.themes.flatMap(theme => theme.linkedPropositionIds)
      .some(id => id.startsWith("prop-method-chinese-lunar-mansions-xiu-"))).toBe(false);
  });

  it("changes the interpretation when a matched Canon rule changes and fails when the rule is detached", async () => {
    const snapshot = await buildUnifiedMasterChart(input);
    const application: CanonRuleApplication = {
      canonEvidenceId: "canon-placement-sun",
      ruleId: "test-sun-rule",
      sourceId: "test-canon",
      sourceTitle: "Test Canon",
      technique: "canon-placement-dossier",
      subject: "Sun",
      statement: "Sun rule version A applies to the calculated Sun placement.",
      calculationEvidenceIds: ["planet-sun"],
      confidence: "high",
      implementationStatus: "implemented",
    };
    const applied = await synthesizeMasterReading({
      snapshot,
      readingMode: "natal",
      canonApplications: [application],
    });
    expect(applied.integratedNarrative.join("\n")).toContain(application.statement);
    expect(applied.canonApplications[0].ruleId).toBe("test-sun-rule");

    const detached = await synthesizeMasterReading({
      snapshot,
      readingMode: "natal",
      canonApplications: [{ ...application, calculationEvidenceIds: [] }],
    });
    expect(detached.qualityAudit.passed).toBe(false);
    expect(detached.qualityAudit.unsupportedClaims.some(claim => claim.includes("test-sun-rule"))).toBe(true);
  });
});
