import type { ChartResult } from "../astronomy";
import type { AstrologyEvidencePacket, EvidenceItem } from "../astrologyKnowledge/types";

export type PlacementMethodStatus = "included" | "no-result" | "not-applicable" | "incomplete" | "reference-only" | "failed";
export type PlacementRelation = "reinforces" | "qualifies" | "contradicts" | "contextual" | "unavailable";

export type PlacementContribution = {
  method: string;
  label: string;
  status: PlacementMethodStatus;
  relation: PlacementRelation;
  result: string[];
  sourceTrace: string[];
  reason?: string;
};

export type PlacementPacket = {
  body: string;
  display: string;
  sign: string;
  degree: number;
  house: number;
  mode: ChartResult["readingScope"];
  contributions: PlacementContribution[];
  includedMethods: string[];
  excludedMethods: string[];
  unresolvedMethods: string[];
  convergences: string[];
  contradictions: string[];
  prompt: string;
};

export type PlacementAdapterContext = {
  chart: ChartResult;
  body: string;
  row: NonNullable<ChartResult["movingBodies"]>[number] | NonNullable<ChartResult["ascendant"]>;
  packet: AstrologyEvidencePacket;
};

export type PlacementAdapter = (context: PlacementAdapterContext) => PlacementContribution;

export function evidenceForBody(packet: AstrologyEvidencePacket, body: string): EvidenceItem[] {
  const normalized = body.toLowerCase();
  return [
    ...packet.westernEvidence,
    ...packet.genesisAstroEvidence,
    ...packet.patternEvidence,
    ...packet.behavioralEvidence,
    ...packet.lifeEventEvidence,
    ...packet.canonEvidence,
    ...packet.vedicEvidence,
    ...packet.arabicEvidence,
    ...packet.lunarEvidence,
    ...packet.fixedStarEvidence,
    ...packet.timingEvidence,
  ].filter(item => {
    const subject = item.subject.toLowerCase();
    const statement = item.statement.toLowerCase();
    return subject === normalized || subject.includes(normalized) || statement.includes(normalized);
  });
}

export function contributionFromEvidence(
  context: PlacementAdapterContext,
  method: string,
  label: string,
  items: EvidenceItem[],
  options: { relation?: PlacementRelation; reason?: string } = {},
): PlacementContribution {
  const incomplete = context.packet.incomplete.filter(item => item.toLowerCase().includes(method.toLowerCase()) || item.toLowerCase().includes(label.toLowerCase()));
  if (incomplete.length && !items.length) {
    return { method, label, status: "incomplete", relation: "unavailable", result: [], sourceTrace: [], reason: incomplete.join("; ") };
  }
  if (!items.length) {
    return { method, label, status: "no-result", relation: "unavailable", result: [], sourceTrace: [], reason: options.reason ?? "No placement-specific evidence was returned for this chart and method." };
  }
  return {
    method,
    label,
    status: "included",
    relation: options.relation ?? "contextual",
    result: items.map(item => item.statement),
    sourceTrace: items.map(item => `${item.sourceTrace.sourceTitle} · ${item.technique}`),
    reason: options.reason,
  };
}
