import type { ChartResult } from "./astronomy";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import {
  formatCompactSynthesisContext,
  type CompactSynthesisOptions,
} from "./astrologyKnowledge/synthesis/context";

export type MasterReadingMode = "natal" | "transit" | "combined";
export type MasterPipelineResult = Awaited<
  ReturnType<typeof synthesizeChartForReading>
>;

/** One verified calculation + Canon + synthesis gate; no alternate reconstruction. */
export function buildMasterPipeline(
  chart: ChartResult,
  mode: MasterReadingMode,
  question = "What should I understand from this chart?"
) {
  return synthesizeChartForReading(chart, mode, question);
}
export function formatMasterGateContext(result: MasterPipelineResult): string {
  return result.context;
}
export function formatCompactMasterGateContext(
  result: MasterPipelineResult,
  options?: CompactSynthesisOptions
): string {
  return formatCompactSynthesisContext(result.synthesis, options);
}
