import type { ChartResult, ChartRow } from "../astronomy";
import {
  detectAllYogas,
  analyzePatterns,
  runAstroReading,
  type PatternAnalysis,
  type PlanetPlacement,
  type ReadingResult,
  type YogaResult,
} from "./index";

export type GenesisAstroPipelineResult = {
  engine: "genesis-astro-engine";
  mode: "natal-only" | "transit-only" | "full";
  result: ReadingResult | null;
  error: string | null;
  yogas: YogaResult[];
  natalInput: string;
  transitInput: string;
};

export type GenesisPatternPipelineResult = {
  engine: "genesis-pattern-engine-original";
  analysis: PatternAnalysis;
};

function angularDistance(a: number, b: number) {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

function placement(
  row: ChartRow,
  kind: "natal" | "transit",
  sunLongitude?: number
): PlanetPlacement {
  const sign = row.display.split(" ")[0];
  const degree = row.longitude % 30;
  const solarDistance =
    sunLongitude === undefined || row.name === "Sun"
      ? Number.POSITIVE_INFINITY
      : angularDistance(row.longitude, sunLongitude);
  return {
    planet: row.name,
    degree,
    sign,
    house: row.house,
    rx: Boolean(row.retrograde),
    combust: solarDistance <= 8.5,
    cazimi: solarDistance <= 0.2833,
    absolute: row.longitude,
    raw: `${row.name}: ${degree.toFixed(4)}° ${sign}, ${row.house} house`,
    kind,
  };
}

function asText(rows: ChartRow[], kind: "natal" | "transit") {
  const sunLongitude = rows.find(row => row.name === "Sun")?.longitude;
  return rows
    .filter(row => Number.isFinite(row.longitude))
    .map(row => {
      const item = placement(row, kind, sunLongitude);
      return `${item.planet}: ${item.degree.toFixed(4)}° ${item.sign}, ${item.house} house${item.rx ? " Rx" : ""}`;
    })
    .join("\n");
}

export function runGenesisAstroPipeline(
  chart: ChartResult
): GenesisAstroPipelineResult {
  const natalRows = chart.movingBodies;
  const transitRows = chart.readingScope === "natal" ? [] : chart.transits;
  const natalInput = asText(natalRows, "natal");
  const transitInput = asText(transitRows, "transit");
  const reading = runAstroReading(
    natalInput,
    transitInput,
    `Firmament ${chart.worldview} / ${chart.readingScope} chart`
  );
  const yogaRows = natalRows.map(row => ({
    name: row.name,
    sign: row.display.split(" ")[0],
    house: row.house,
    degree: row.longitude % 30,
  }));
  return {
    engine: "genesis-astro-engine",
    mode: reading.mode,
    result: reading.result,
    error: reading.error,
    yogas: detectAllYogas(yogaRows),
    natalInput,
    transitInput,
  };
}

export function runGenesisPatternPipeline(
  chart: ChartResult
): GenesisPatternPipelineResult {
  const toRecord = (rows: ChartRow[], kind: "natal" | "transit") =>
    Object.fromEntries(
      rows.map(row => {
        const item = placement(
          row,
          kind,
          rows.find(candidate => candidate.name === "Sun")?.longitude
        );
        return [
          item.planet,
          {
            planet: item.planet,
            degree: item.absolute ?? item.degree,
            sign: item.sign,
            house: item.house,
            rx: item.rx,
            combust: item.combust,
            cazimi: item.cazimi,
            absolute: item.absolute,
            raw: item.raw,
            kind: item.kind,
          },
        ];
      })
    );
  const natal = toRecord(chart.movingBodies, "natal");
  const transit = toRecord(
    chart.readingScope === "natal" ? [] : chart.transits,
    "transit"
  );
  const effectiveTransit = transit;
  return {
    engine: "genesis-pattern-engine-original",
    analysis: analyzePatterns(natal, effectiveTransit, {
      houseSystem: "equal",
    }),
  };
}
