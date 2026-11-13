import type { ChartInput, ChartResult } from "../astronomy";
import { buildUnifiedMasterChart } from "./builder";
import { synthesizeMasterSnapshot } from "../astrologyKnowledge/synthesis/readingBridge";

/** Public chart production always binds the complete formation before returning. */
export async function calculateMasterChart(
  input: ChartInput
): Promise<ChartResult> {
  const mode = input.readingScope ?? "combined";
  const snapshot = await buildUnifiedMasterChart({ ...input, mode });
  const { canonicalChart, synthesis } = await synthesizeMasterSnapshot(
    snapshot,
    mode,
    "Evaluate this chart's complete method formation before output."
  );
  return {
    ...canonicalChart,
    methodBindings: {
      snapshotId: snapshot.snapshotId,
      base: snapshot.methodExecutionLedger,
      transit: snapshot.transit?.framework?.methodExecutionLedger ?? [],
      synthesisAudit: {
        passed: synthesis.qualityAudit.passed,
        groundedRatio: synthesis.qualityAudit.groundedRatio,
        canonApplicationCount: synthesis.canonApplications.length,
      },
    },
  };
}
