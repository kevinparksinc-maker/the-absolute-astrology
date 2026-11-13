import { calculateMasterChart as calculateChart } from "./masterChart/entry";
import { type ChartInput } from "./astronomy";
import { calculateEnergyRead } from "../shared/energyScoring";
import { localDateTime } from "../shared/transitTime";

/** Each sample runs the existing engine at a real instant; no interpolated scores. */
export async function calculateHarmonicForecast(input: ChartInput, start: string, steps = 48) {
  const startMs = Date.parse(start);
  if (!Number.isFinite(startMs) || !Number.isInteger(steps) || steps < 1 || steps > 48)
    throw new Error("A valid start instant and 1–48 half-hour steps are required.");
  const timezone = input.transitTimezone || input.timezone;
  const points = [];
  for (let step = 0; step <= steps; step++) {
    const moment = new Date(startMs + step * 30 * 60 * 1000);
    const local = localDateTime(moment, timezone);
    try {
      const chart = await calculateChart({ ...input, readingScope: "combined",
        transitDate: local.date, transitTime: local.time,
        transitXYZPositions: undefined, transitSunriseAnchor: undefined, transitInstantUtc: undefined });
      const score = calculateEnergyRead(chart)!;
      points.push({ moment: chart.transitDate, score, error: null });
    } catch (error) {
      // Repeated or missing local times remain explicit gaps, never guessed samples.
      points.push({ moment: moment.toISOString(), score: null,
        error: error instanceof Error ? error.message : "Calculation unavailable" });
    }
  }
  return { timezone, stepMinutes: 30, points };
}
