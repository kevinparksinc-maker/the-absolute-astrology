import type { UnifiedMasterChartSnapshot } from "../../masterChart/types";
import { buildDivisionalCharts, type Division } from "./divisionalCharts";

/**
 * VEDIC CHART READER — one authoritative saved natal chart, many derived charts.
 *
 * This service does not accept a birth date, time, coordinates or an ephemeris.
 * It does not calculate sunrise, planetary positions or the natal Ascendant.
 * The profile repository must supply its already-calculated Master Natal
 * Snapshot. The five charts are mathematical projections of THAT snapshot.
 *
 * D1: preserve natal longitude, Ascendant and 12 equal-house cusps.
 * D2: divide signs into 2 × 15° Hora sections (Sun/Leo, Moon/Cancer).
 * D3: divide signs into 3 × 10° Drekkana sections (1st/5th/9th).
 * D9: divide signs into 9 × 3°20′ Navamsha sections (modality starts).
 * D10: divide signs into 10 × 3° Dashamsha sections (odd/even starts).
 *
 * All D2-D10 planets and divisional Ascendants are transformed from natal
 * longitude; divisional houses are projected from the transformed Ascendant.
 * This is the application's explicit fixed-frame variant, not an implicit
 * Lahiri conversion. A D-chart is NOT a second astronomical birth chart.
 *
 * Display consumers receive chartLayout = north-indian-diamond, house cusps,
 * numbered houses, Ascendant, placements, house assignments and formula
 * traces. Interpretations must consume these computed results, not guess.
 */
export function vedicChartsFromMasterNatal(snapshot: UnifiedMasterChartSnapshot) {
  if (snapshot.inputs.mode !== "natal") {
    throw new Error("Vedic divisional charts require the authoritative natal snapshot, not a transit chart.");
  }
  const state = snapshot.baseCelestialState;
  if (!state?.ascendant || !Array.isArray(state.planets) || state.houses?.length !== 12) {
    throw new Error("Master natal chart is missing its Ascendant, planets or 12 houses.");
  }
  const charts = buildDivisionalCharts({
    ascendantLongitude: state.ascendant.longitude,
    planets: [
      ...state.planets.map(p => ({ name: p.name, longitude: p.longitude })),
      { name: state.northNode.name, longitude: state.northNode.longitude },
      { name: state.southNode.name, longitude: state.southNode.longitude },
    ],
    d1HouseCusps: state.houses.map(h => h.cusp),
  });
  return {
    sourceSnapshotId: snapshot.snapshotId,
    source: "profile-master-natal" as const,
    astronomicalRecalculation: false as const,
    charts,
    byDivision: Object.fromEntries(charts.map(chart => [chart.division, chart])) as Record<Division, (typeof charts)[number]>,
  };
}

/**
 * The caller owns the profile persistence/cache. Fetch the existing snapshot;
 * do not call getMasterNatalChart() or calculateChart() from this service.
 */
export async function loadProfileVedicCharts(
  profileId: string,
  loadSavedNatalSnapshot: (profileId: string) => Promise<UnifiedMasterChartSnapshot | null>,
) {
  const snapshot = await loadSavedNatalSnapshot(profileId);
  if (!snapshot) throw new Error("Saved profile natal chart not found. Generate and save D1 before requesting Vargas.");
  return vedicChartsFromMasterNatal(snapshot);
}
