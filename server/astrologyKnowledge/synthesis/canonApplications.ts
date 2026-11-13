import type { UnifiedMasterChartSnapshot } from "../../masterChart/types";
import type { EvidenceItem } from "../types";
import type { CanonRuleApplication } from "./types";

const slug = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

function chartEvidenceIdsForItem(
  item: EvidenceItem,
  snapshot: UnifiedMasterChartSnapshot,
): string[] {
  const evidence = new Set<string>();
  const concepts = new Set(item.concepts.map(concept => concept.toLowerCase()));

  for (const id of snapshot.methodExecutionLedger.flatMap(layer => layer.evidenceIds)) {
    if (concepts.has(id.toLowerCase())) evidence.add(id);
  }

  const bodyNames = new Set<string>();
  for (const body of [item.subject, ...item.concepts]) {
    const match = body.match(/(?:^|[-\s])(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|rahu|ketu|north[- ]node|south[- ]node|ascendant|descendant|midheaven)(?:$|[-\s])/i);
    if (match) bodyNames.add(slug(match[1]));
  }
  for (const body of Array.from(bodyNames)) {
    const id = `planet-${body}`;
    if (snapshot.methodExecutionLedger.some(layer => layer.evidenceIds.includes(id))) evidence.add(id);
  }

  const houses = new Set<string>();
  for (const value of [item.subject, ...item.concepts]) {
    const match = value.match(/(?:house[- ]|House\s+)(\d{1,2})/i);
    if (match) houses.add(`house-${match[1]}`);
  }
  for (const house of Array.from(houses)) {
    if (snapshot.methodExecutionLedger.some(layer => layer.evidenceIds.includes(house))) evidence.add(house);
  }

  // Some Canon outputs are calculated by a named method rather than a single
  // planet/house evidence ID. Preserve that calculation lineage as well.
  const techniqueHints = [item.technique, ...item.concepts].map(slug);
  for (const layer of snapshot.methodExecutionLedger) {
    if (techniqueHints.some(hint => hint && (layer.id.includes(hint) || layer.technique.includes(hint)))) {
      layer.evidenceIds.forEach(id => evidence.add(id));
    }
  }

  return Array.from(evidence);
}

export function buildCanonRuleApplications(
  snapshot: UnifiedMasterChartSnapshot,
  canonEvidence: EvidenceItem[],
): CanonRuleApplication[] {
  const applications: CanonRuleApplication[] = canonEvidence.map(item => ({
    canonEvidenceId: item.id,
    ruleId: item.ruleId ?? item.sourceTrace.ruleId ?? "unknown-canon-rule",
    sourceId: item.sourceId,
    sourceTitle: item.sourceTrace.sourceTitle,
    technique: item.technique,
    subject: item.subject,
    statement: item.statement,
    calculationEvidenceIds: chartEvidenceIdsForItem(item, snapshot),
    confidence: item.sourceTrace.confidence,
    implementationStatus: item.sourceTrace.implementationStatus,
  }));
  return applications;
}
