import { calculateMasterChart as calculateChart } from "../masterChart/entry";
import { type ChartResult } from "../astronomy";
import type { Evidence, GameChartSnapshot } from "../../shared/simulationLab/contracts";

export type GameChartRequest = Readonly<{
  id: string;
  league: GameChartSnapshot["league"];
  scheduledDate: string;
  scheduledTime: string;
  venue: GameChartSnapshot["venue"];
  ascTeam: string;
  descTeam: string;
  chartVersion: string;
}>;

export type CalculatedGameChart = Readonly<{
  snapshot: GameChartSnapshot;
  /** Full original Absolute engine result; no second planetary calculation. */
  chart: ChartResult;
}>;

function chartEvidence(chart: ChartResult): readonly Evidence[] {
  const entries: Evidence[] = [];
  const add = (id: string, description: string, value?: number | string) =>
    entries.push({ id, description, ...(value === undefined ? {} : { value }), source: "absolute:calculateChart" });
  add("chart:julian-day", "Ephemeris Julian day", chart.julianDay);
  add("chart:utc", "Event instant in UTC", chart.utc);
  if (chart.ascendant) add("chart:ascendant", "Sunrise-derived Ascendant longitude", chart.ascendant.longitude);
  if (chart.descendant) add("chart:descendant", "Descendant longitude", chart.descendant.longitude);
  if (chart.midheaven) add("chart:midheaven", "Midheaven longitude", chart.midheaven.longitude);
  chart.houses.forEach((longitude, index) => add(`chart:house:${index + 1}`, `Equal-house cusp ${index + 1}`, longitude));
  for (const body of [...chart.movingBodies, chart.northNode, chart.southNode]) {
    const id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    add(`chart:body:${id}:longitude`, `${body.name} longitude`, body.longitude);
    add(`chart:body:${id}:house`, `${body.name} house`, body.house);
    if (body.xyz) {
      add(`chart:body:${id}:x`, `${body.name} Cartesian X`, body.xyz.x);
      add(`chart:body:${id}:y`, `${body.name} Cartesian Y`, body.xyz.y);
      add(`chart:body:${id}:z`, `${body.name} Cartesian Z`, body.xyz.z);
    }
  }
  return entries;
}

/** Shared calculation entry point for sports. Contest rules belong in separate method adapters. */
export async function buildMasterGameChart(request: GameChartRequest): Promise<CalculatedGameChart> {
  if (!request.id || !request.ascTeam || !request.descTeam || request.ascTeam === request.descTeam) {
    throw new Error("A game ID and two distinct team assignments are required.");
  }
  const chart = await calculateChart({
    location: request.venue.name,
    latitude: request.venue.latitude,
    longitude: request.venue.longitude,
    timezone: request.venue.timezone,
    date: request.scheduledDate,
    time: request.scheduledTime,
    worldview: "agent",
    readingScope: "natal",
    birthTimeKnown: true,
    chartRole: "event",
  });
  if (!chart.validation.passed || !chart.ascendant) {
    throw new Error("Master Game Chart failed validation or has no Ascendant.");
  }
  const snapshot: GameChartSnapshot = {
    id: request.id,
    generatedAt: new Date().toISOString(),
    league: request.league,
    scheduledStart: chart.utc,
    venue: { ...request.venue },
    ascTeam: request.ascTeam,
    descTeam: request.descTeam,
    chartEvidence: chartEvidence(chart),
    physicalEvidence: [],
    chartVersion: request.chartVersion,
    masterMethods: chart.methodBindings,
  };
  return { snapshot, chart };
}
