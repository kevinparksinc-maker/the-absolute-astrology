import type { SynthesisResult } from "./types";

/** Direct, lossless handoff of the calculated chart to the AI. No interpretation gating or selection. */
export function buildNarrativePacket(synthesis: SynthesisResult, question: string) {
  return {
    packet: {
      question,
      mode: synthesis.mode,
      snapshot: synthesis.sourceSnapshot,
      calculatedMethodOutcomes: synthesis.sourceSnapshot.methodExecutionLedger,
      // Preserve the method's outcomes as well as its raw calculation. The AI
      // reconciles these findings; the theme builder must never select for it.
      methodOutcomes: synthesis.methodOutcomes,
      canonApplications: synthesis.canonApplications,
      calculationCoverage: synthesis.methodLedgerSummary,
      themeCoverage: synthesis.qualityAudit,
    },
  };
}
