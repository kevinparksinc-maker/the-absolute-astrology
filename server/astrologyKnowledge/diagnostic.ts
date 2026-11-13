import type { ChartResult } from "../astronomy";
import {
  buildAstrologyEvidencePacket,
  formatEvidencePacket,
} from "./evidencePacket";

export type EvidenceTraceDiagnostic = {
  question: string;
  selectedTechniques: string[];
  selectedSubjects: string[];
  packet: ReturnType<typeof buildAstrologyEvidencePacket>;
  readableTrace: string;
};

/** Developer-facing inspection surface; it never calls the LLM or hides incomplete rules. */
export function diagnoseAstrologyEvidence(
  chart: ChartResult,
  question: string,
  mode: "natal" | "transit" | "combined" = chart.readingScope
): EvidenceTraceDiagnostic {
  const packet = buildAstrologyEvidencePacket(chart, question, mode);
  return {
    question,
    selectedTechniques: packet.plan.techniques,
    selectedSubjects: packet.plan.subjects,
    packet,
    readableTrace: formatEvidencePacket(packet),
  };
}
