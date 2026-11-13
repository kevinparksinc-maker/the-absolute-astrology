import type { ChartResult } from "./astronomy";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import { narrateMasterSynthesis } from "./astrologyKnowledge/synthesis/narrative";

/** Audio reads the same AI synthesis as the chart, never rule-template prose. */
export async function buildChartBriefing(chart: ChartResult) {
  const question = "Explain the selected chart’s integrated patterns, mechanisms, strengths and challenges as a complete personal reading suitable for listening.";
  const { synthesis } = await synthesizeChartForReading(chart, chart.readingScope, question);
  const narrated = await narrateMasterSynthesis(synthesis, question);
  return {
    snapshotId: synthesis.snapshotId,
    chapters: narrated.narrative.sections.map(section => ({
      id: section.id,
      title: section.title,
      subtitle: "Your integrated chart reading",
      text: section.text,
      evidenceIds: synthesis.sourceSnapshot.methodExecutionLedger.flatMap(layer => layer.evidenceIds),
    })),
  };
}
