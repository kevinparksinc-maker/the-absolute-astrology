import type { ChartResult, ChartRow } from "../astronomy";

/**
 * Single, read-only distribution contract for all Master Chart calculation layers.
 * The astronomy engine calculates once; layer adapters consume this shared context.
 * Never mutate the source chart or independently recalculate its positions here.
 */
export interface MasterChartDataBus {
  readonly chart: ChartResult;
  readonly planets: readonly ChartRow[];
  readonly houses: readonly number[];
  readonly ascendant: ChartRow | null;
  readonly sun: ChartRow;
  readonly moon: ChartRow;
  readonly transits: readonly ChartRow[];
}

/** Fail explicitly instead of substituting a fabricated angle or body position. */
export function createMasterChartDataBus(chart: ChartResult): MasterChartDataBus {
  const ascendant = chart.ascendant;
  if (chart.worldview !== "god" && (!ascendant || !Number.isFinite(ascendant.longitude))) {
    throw new Error("MASTER_CHART_MISSING_ASCENDANT");
  }
  if (chart.houses.length !== 12 || chart.houses.some(h => !Number.isFinite(h))) {
    throw new Error("MASTER_CHART_INVALID_HOUSES");
  }
  const sun = chart.movingBodies.find(p => p.name === "Sun");
  const moon = chart.movingBodies.find(p => p.name === "Moon");
  if (!sun || !Number.isFinite(sun.longitude)) throw new Error("MASTER_CHART_MISSING_SUN");
  if (!moon || !Number.isFinite(moon.longitude)) throw new Error("MASTER_CHART_MISSING_MOON");
  return Object.freeze({
    chart,
    planets: chart.movingBodies,
    houses: chart.houses,
    ascendant,
    sun,
    moon,
    transits: chart.transits ?? [],
  });
}
