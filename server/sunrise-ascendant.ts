/** Sunrise-anchored Ascendant model.
 * A sunrise time and calibrated fixed-frame solar longitude MUST be supplied.
 * This is a user-defined angular model, not an independently validated physical horizon solver.
 */
export const ROTATION_DEGREES_PER_DAY = 360;
const norm = (v: number) => ((v % 360) + 360) % 360;
export interface SunriseAnchor {
  sunriseUtc: Date;
  chartUtc: Date;
  sunriseSunLongitude: number;
}
export function calculateSunriseAscendant(anchor: SunriseAnchor) {
  const sunrise = anchor.sunriseUtc.getTime();
  const chart = anchor.chartUtc.getTime();
  if (![sunrise, chart, anchor.sunriseSunLongitude].every(Number.isFinite)) throw new Error("Invalid sunrise anchor");
  const elapsedDays = (chart - sunrise) / 86400000;
  const rotation = elapsedDays * ROTATION_DEGREES_PER_DAY;
  const ascendant = norm(anchor.sunriseSunLongitude + rotation);
  return {
    ascendant,
    descendant: norm(ascendant + 180),
    equalHouseCusps: Array.from({length:12}, (_, i) => norm(ascendant + i * 30)),
    elapsedRotationDegrees: rotation,
    method: "sunrise-anchored" as const,
  };
}
