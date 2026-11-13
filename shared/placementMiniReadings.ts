import { READING_FRAMEWORK_VERSION } from "./readingIdentity";
import type { ChartResult, ChartRow } from "../server/astronomy";

export const PLACEMENT_MINI_VERSION = "placement-minis-v4-bounded";
export function placementRows(chart: ChartResult): ChartRow[] {
  return [
    ...chart.movingBodies,
    chart.ascendant,
    chart.descendant,
    chart.northNode,
    chart.southNode,
  ].filter((row): row is ChartRow => Boolean(row));
}
/** Natal mini readings are unaffected by a live transit refresh. */
export function placementMiniIdentity(
  chart: ChartResult,
  layer: "natal" | "transit" = "natal",
  accountId = "guest"
) {
  const input = chart.input;
  return `${PLACEMENT_MINI_VERSION}:${READING_FRAMEWORK_VERSION}:${JSON.stringify(
    {
      accountId,
      layer,
      worldview: chart.worldview,
      birth: {
        date: input.date,
        time: input.time,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
        birthTimeKnown: input.birthTimeKnown,
        sunriseAnchor: input.sunriseAnchor,
        xyzPositions: input.xyzPositions,
      },
      utc: chart.utc,
      houses: chart.houses,
      placements: placementRows(chart).map(p => [
        p.name,
        p.longitude,
        p.house,
        p.godHouse,
        p.agentHouse,
        p.retrograde,
        p.speed,
      ]),
      ...(layer === "transit"
        ? {
            transitDate: chart.transitDate,
            transits: chart.transits,
            transitLocation: input.transitLocation,
            transitLatitude: input.transitLatitude,
            transitLongitude: input.transitLongitude,
            transitTimezone: input.transitTimezone,
            transitSunriseAnchor: input.transitSunriseAnchor,
          }
        : {}),
    }
  )}`;
}
