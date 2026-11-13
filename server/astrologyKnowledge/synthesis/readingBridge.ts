import { createHash } from "node:crypto";
import { formatSynthesisContext } from "./context";
import type { UnifiedMasterChartSnapshot } from "../../masterChart/types";
import type { ChartResult } from "../../astronomy";
import {
  buildUnifiedMasterChart,
  getMasterNatalChart,
} from "../../masterChart/builder";
import {
  canonDossierToEvidenceItems,
  retrieveChartCanonDossier,
} from "../canon/retriever";
import { buildCanonRuleApplications } from "./canonApplications";
import { synthesizeMasterReading } from "./synthesizer";
import type { SynthesisResult } from "./types";

/** All ordinary chart readings enter through the same calculated method ledger. */
async function synthesizeChartForReadingUncached(
  chart: ChartResult,
  mode: "natal" | "transit" | "combined",
  question: string
): Promise<{
  snapshot: UnifiedMasterChartSnapshot;
  synthesis: SynthesisResult;
  context: string;
  canonicalChart: ChartResult;
}> {
  const input = {
    ...chart.input,
    worldview: chart.worldview,
    mode,
    instantUtc: chart.utc,
    ...(mode === "natal" ? {} : { transitInstantUtc: chart.transitDate }),
  };
  if (
    !input.date ||
    (chart.worldview !== "god" &&
      (!input.location ||
        !input.time ||
        !input.timezone ||
        !Number.isFinite(input.latitude) ||
        !Number.isFinite(input.longitude)))
  ) {
    throw new Error(
      "MASTER_INPUT_MISSING: Resolved chart date, time, coordinates and timezone are required; no substitute data is used."
    );
  }
  const snapshot =
    mode === "natal" && chart.worldview === "agent-vs-god"
      ? await getMasterNatalChart(input)
      : await buildUnifiedMasterChart(input);
  // Do not silently interpret a second chart if an earlier client chart differs.
  for (const body of chart.movingBodies) {
    const canonical = snapshot.baseCelestialState.planets.find(
      row => row.name === body.name
    );
    if (!canonical)
      throw new Error(
        `Master Chart is missing ${body.name}; cannot synthesize a divergent reading.`
      );
    const difference = Math.abs(
      ((canonical.longitude - body.longitude + 540) % 360) - 180
    );
    if (difference > 0.01)
      throw new Error(
        `Master Chart mismatch for ${body.name}: ${difference.toFixed(4)}°. Refresh the chart before reading.`
      );
  }
  const angularDifference = (a: number, b: number) =>
    Math.abs(((a - b + 540) % 360) - 180);
  if (
    chart.ascendant &&
    (!snapshot.baseCelestialState.ascendant ||
      angularDifference(
        snapshot.baseCelestialState.ascendant.longitude,
        chart.ascendant.longitude
      ) > 0.01)
  ) {
    throw new Error(
      "Master Chart Ascendant mismatch. Refresh the chart before reading."
    );
  }
  if (
    chart.houses.length !== (snapshot.natal?.houses ?? []).length ||
    chart.houses.some(
      (cusp, index) =>
        angularDifference(cusp, snapshot.natal!.houses[index]) > 0.01
    )
  ) {
    throw new Error(
      "Master Chart equal-house cusp mismatch. Refresh the chart before reading."
    );
  }
  if (
    mode !== "natal" &&
    chart.transits.length > 0 !== Boolean(snapshot.transit?.planets.length)
  ) {
    throw new Error(
      "Master Chart transit coverage mismatch. Refresh the chart before reading."
    );
  }
  if (mode !== "natal" && chart.transits.length) {
    for (const transit of chart.transits) {
      const canonical = snapshot.transit?.planets.find(
        row => row.name === transit.name
      );
      if (
        !canonical ||
        angularDifference(canonical.longitude, transit.longitude) > 0.01
      ) {
        throw new Error(
          `Master Chart transit mismatch for ${transit.name}. Refresh the chart before reading.`
        );
      }
    }
  }
  return synthesizeMasterSnapshot(snapshot, mode, question);
}

/** Server-created snapshots enter here directly: no second ephemeris pass. */
export async function synthesizeMasterSnapshot(
  snapshot: UnifiedMasterChartSnapshot,
  mode: "natal" | "transit" | "combined",
  question: string
) {
  // The Master Chart remains the only calculation source. Its canonical natal
  // ChartResult is passed to the existing deterministic retriever; no second
  // astronomical calculation or alternate house/frame pipeline is introduced.
  const canonicalChart = snapshot.natal;
  if (!canonicalChart)
    throw new Error("MASTER_CHART_MISSING: Snapshot has no canonical chart.");
  const canonDossier = retrieveChartCanonDossier(canonicalChart);
  const canonEvidence = canonDossierToEvidenceItems(canonDossier);
  const canonApplications = buildCanonRuleApplications(snapshot, canonEvidence);
  // The same registry is evaluated for each sky. Namespace event evidence so
  // Saturn's present mansion can never be mistaken for natal Saturn's mansion.
  const event = snapshot.transit?.framework;
  const eventLayers =
    event?.methodExecutionLedger.map(layer => ({
      ...layer,
      id: `transit:${layer.id}`,
      name: `Current sky · ${layer.name}`,
      frame: layer.frame,
      evidenceIds: layer.evidenceIds.map(id => `transit:${id}`),
      prerequisites: layer.prerequisites.map(id => `transit:${id}`),
    })) ?? [];
  if (event?.natal) {
    const applications = buildCanonRuleApplications(
      event,
      canonDossierToEvidenceItems(retrieveChartCanonDossier(event.natal))
    );
    canonApplications.push(
      ...applications.map(application => ({
        ...application,
        canonEvidenceId: `transit:${application.canonEvidenceId}`,
        subject: `Current sky ${application.subject}`,
        calculationEvidenceIds: application.calculationEvidenceIds.map(
          id => `transit:${id}`
        ),
      }))
    );
  }
  const synthesisSnapshot = {
    ...snapshot,
    layers: {
      ...snapshot.layers,
      ...Object.fromEntries(eventLayers.map(layer => [layer.id, layer])),
    },
    methodExecutionLedger: [...snapshot.methodExecutionLedger, ...eventLayers],
  };
  const synthesis = await synthesizeMasterReading({
    snapshot: synthesisSnapshot,
    readingMode: mode,
    userQuestion: question,
    canonApplications,
  });
  if (!synthesis.qualityAudit.passed) {
    console.warn(
      "[SYNTHESIS_THEME_COVERAGE] Rule-based theme coverage is incomplete; forwarding all calculated results to the AI:",
      synthesis.qualityAudit.unsupportedClaims
    );
  }
  const context = formatSynthesisContext(synthesis);
  return { snapshot, synthesis, context, canonicalChart };
}

// Reuse concurrent/repeated reads of the exact same source chart and question.
// Client-supplied method bindings are never trusted as calculation evidence.
const verifiedReadings = new Map<
  string,
  {
    expiresAt: number;
    promise: ReturnType<typeof synthesizeChartForReadingUncached>;
  }
>();
export async function synthesizeChartForReading(
  chart: ChartResult,
  mode: "natal" | "transit" | "combined",
  question: string
) {
  const { methodBindings: _ignored, ...source } = chart;
  const key = createHash("sha256")
    .update(JSON.stringify({ source, mode, question }))
    .digest("hex");
  const cached = verifiedReadings.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;
  const promise = synthesizeChartForReadingUncached(chart, mode, question);
  verifiedReadings.set(key, { expiresAt: Date.now() + 60_000, promise });
  while (verifiedReadings.size > 8)
    verifiedReadings.delete(verifiedReadings.keys().next().value!);
  try {
    return await promise;
  } catch (error) {
    if (verifiedReadings.get(key)?.promise === promise)
      verifiedReadings.delete(key);
    throw error;
  }
}
