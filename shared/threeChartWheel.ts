import type { ChartResult, ChartRow } from "../server/astronomy";

export type WheelLayerId = "god" | "transit" | "natal";
export type WheelLayer = { id: WheelLayerId; label: string; color: string; radius: number; rows: ChartRow[]; utc?: string };

// Birth positions and question-time positions are different datasets, even when
// transit also carries a natal foundation for calculating personal contacts.
export function threeChartLayers(natal: ChartResult | undefined, transit: ChartResult, god: ChartResult): WheelLayer[] {
  return [
    { id: "god", label: "God View", color: "#67e8f9", radius: 270, rows: god.transits, utc: god.transitDate },
    { id: "transit", label: "Transits", color: "#c4b5fd", radius: 205, rows: transit.transits, utc: transit.transitDate },
    { id: "natal", label: "Natal", color: "#f4c95d", radius: 140, rows: natal?.movingBodies ?? [], utc: natal?.utc },
  ];
}
