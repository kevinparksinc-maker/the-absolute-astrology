import { createHash } from "node:crypto";
import type { ChartResult } from "./astronomy";
import { invokeLLM } from "./_core/llm";
import { MINI_SYNTHESIS_STYLE } from "./master-interpreter";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import { packCompactSynthesisForLLM } from "./astrologyKnowledge/synthesis/context";
import type { VedicStrength } from "./astrologyKnowledge/vedic/strength";

type VerifiedSynthesis = Awaited<ReturnType<typeof synthesizeChartForReading>>;

async function executeBuildChartMethodOutcomes(
  snapshot: VerifiedSynthesis["snapshot"],
  synthesis: VerifiedSynthesis["synthesis"],
  mode: "natal" | "transit" | "combined"
) {
  const layers = [
    ...snapshot.methodExecutionLedger,
    ...(snapshot.transit?.framework?.methodExecutionLedger ?? []).map(
      layer => ({ ...layer, id: `transit:${layer.id}` })
    ),
  ];
  const byId = new Map(layers.map(layer => [layer.id, layer]));
  const interpreted = synthesis.methodOutcomes.filter(
    m => m.calculatedFindings.length || m.findingJudgments.length
  );
  const miniReadings: Record<string, string> = {};
  if (interpreted.length) {
    try {
      const compactPayload = packCompactSynthesisForLLM(synthesis, {
        maxJudgmentChars: 130,
        maxVargaRows: 4,
        maxTransitRows: 12,
        maxHouseRows: 8,
        maxOtherRows: 5,
      });
      const response = await invokeLLM({
        max_tokens: 4096,
        timeoutMs: 120_000,
        messages: [
          {
            role: "system",
            content:
              MINI_SYNTHESIS_STYLE +
              "\nWrite a unique, grounded second-person mini reading for EACH method. Lead with the practical real-world takeaway, translate every technical score/degree into everyday human behavior, ban poetic filler ('cosmic', 'sacred', 'tapestry', 'bastion', 'alchemist', 'underworld'), and explain WHAT, WHY, HOW and CONSEQUENCE cleanly. No dictionary definitions, copied house slugs, or repeated generic text. Respond ONLY as a JSON object mapping exact method IDs to finished prose. Do not invent calculations.",
          },
          {
            role: "user",
            content: JSON.stringify({
              ...compactPayload,
              requestedMethodIds: interpreted.map(m => m.methodId),
            }),
          },
        ],
      });
      const content = response.choices?.[0]?.message.content;
      const raw =
        typeof content === "string"
          ? content
          : (content ?? [])
              .filter(p => p.type === "text")
              .map(p => (p as { text: string }).text)
              .join("");
      const parsed = JSON.parse(
        raw.trim().replace(/^\s*```(?:json)?\s*/, "").replace(/\s*```\s*$/, "")
      );
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        for (const method of interpreted) {
          const reading = (parsed as Record<string, unknown>)[method.methodId];
          if (typeof reading === "string" && reading.trim()) {
            miniReadings[method.methodId] = reading.trim();
          }
        }
      }
    } catch (err) {
      console.warn(
        "[ChartMethodOutcomes] AI mini readings generation skipped/unavailable:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return {
    snapshotId: synthesis.snapshotId,
    mode,
    methods: synthesis.methodOutcomes.map(outcome => {
      const layer = byId.get(outcome.methodId);
      if (!layer)
        throw new Error(
          `METHOD_OUTPUT_MISSING: ${outcome.methodId} has no calculation record.`
        );
      return {
        ...outcome,
        aiMiniReading: miniReadings[outcome.methodId] ?? null,
        formula: layer.technique,
        calculationVersion: layer.calculationVersion,
        prerequisites: layer.prerequisites,
        sourceIds: layer.sourceIds,
        planetStrength:
          outcome.methodId.replace(/^transit:/, "") === "vedic-shadbala"
            ? (layer.results as VedicStrength["planets"])
            : undefined,
        houseStrength:
          outcome.methodId.replace(/^transit:/, "") === "vedic-bhava-bala"
            ? (layer.results as VedicStrength["houses"])
            : undefined,
      };
    }),
    qualityAudit: synthesis.qualityAudit,
  };
}

type MethodOutcomesResult = Awaited<
  ReturnType<typeof executeBuildChartMethodOutcomes>
>;

const methodOutcomesCache = new Map<
  string,
  { expiresAt: number; promise: Promise<MethodOutcomesResult> }
>();

/** The chart and final narrator consume the same judged methods, with compact cached AI mini readings. */
export async function buildChartMethodOutcomes(
  chart: ChartResult,
  mode: "natal" | "transit" | "combined"
) {
  const { snapshot, synthesis } = await synthesizeChartForReading(
    chart,
    mode,
    "Show each method's own calculated outcome before whole-chart synthesis."
  );

  const cacheKey = createHash("sha256")
    .update(`${synthesis.snapshotId}:${mode}`)
    .digest("hex");
  const cached = methodOutcomesCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = executeBuildChartMethodOutcomes(snapshot, synthesis, mode);
  methodOutcomesCache.set(cacheKey, {
    expiresAt: Date.now() + 30 * 60_000,
    promise,
  });
  while (methodOutcomesCache.size > 24) {
    methodOutcomesCache.delete(methodOutcomesCache.keys().next().value!);
  }
  try {
    const res = await promise;
    // Do not poison the 30-min cache if the AI call failed to populate any miniReadings.
    if (interpretedHasNoReadings(res)) {
      methodOutcomesCache.delete(cacheKey);
    }
    return res;
  } catch (err) {
    if (methodOutcomesCache.get(cacheKey)?.promise === promise) {
      methodOutcomesCache.delete(cacheKey);
    }
    throw err;
  }
}

function interpretedHasNoReadings(res: MethodOutcomesResult): boolean {
  const anyInterpreted = res.methods.some(
    m => m.calculatedFindings?.length || m.findingJudgments?.length
  );
  if (!anyInterpreted) return false;
  return !res.methods.some(m => Boolean(m.aiMiniReading));
}
