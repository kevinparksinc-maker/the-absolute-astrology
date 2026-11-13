import type { ChartResult, ChartRow } from "../../astronomy";
import {
  NAKSHATRAS,
  ZODIAC_SIGNS,
  normalizeLongitude,
} from "../../../shared/hybrid";
import { sourceById } from "../registry";
import type { EvidenceItem, KnowledgePlan, SourceTrace } from "../types";
import { resolveVedicTimingAndAshtakavarga } from "./timingAndAshtakavarga";

const RULERS: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};
const VEDIC_TRACE = (
  technique: string,
  ruleId: string,
  sourceId = "local-vedic-rules"
): SourceTrace => ({
  sourceId,
  tradition: "vedic",
  technique,
  sourceTitle: sourceById(sourceId)?.name ?? sourceId,
  sourceUrl: sourceById(sourceId)?.url,
  retrievedAt: new Date().toISOString(),
  ruleId,
  confidence: sourceId === "tvam-jyotish" ? "reference-only" : "high",
});
const FACT_TRACE: SourceTrace = {
  sourceId: "firmament-ephemeris",
  tradition: "firmament",
  technique: "calculation",
  sourceTitle: "Firmament local ephemeris",
  retrievedAt: new Date().toISOString(),
  confidence: "high",
};
function nakshatra(longitude: number) {
  const size = 360 / 27;
  const index = Math.floor(normalizeLongitude(longitude) / size);
  const within = normalizeLongitude(longitude) - index * size;
  return {
    name: NAKSHATRAS[index],
    pada: Math.floor(within / (size / 4)) + 1,
    start: index * size,
    end: (index + 1) * size,
  };
}
function rows(chart: ChartResult) {
  return [
    ...chart.movingBodies,
    chart.ascendant,
    chart.northNode,
    chart.southNode,
  ].filter((row): row is ChartRow => Boolean(row));
}
export function resolveVedicEvidence(
  chart: ChartResult,
  plan: KnowledgePlan
): EvidenceItem[] {
  const all = rows(chart).filter(row => Number.isFinite(row.longitude));
  const asc =
    chart.ascendant && Number.isFinite(chart.ascendant.longitude)
      ? chart.ascendant
      : undefined;
  const evidence: EvidenceItem[] = [];
  for (const row of all) {
    const n = nakshatra(row.longitude);
    const sign = ZODIAC_SIGNS[Math.floor(row.longitude / 30)];
    if (
      plan.subjects.some(subject =>
        row.name
          .toLowerCase()
          .includes(subject.toLowerCase().replace("natal-", ""))
      ) ||
      ["Sun", "Moon", "Jupiter", "Saturn", "Ascendant"].includes(row.name)
    ) {
      evidence.push({
        id: `vedic-nakshatra-${row.name}`,
        tradition: "vedic",
        category: "deterministic-rule",
        technique: "nakshatra",
        subject: row.name,
        statement: `${row.name} crosses ${n.name}, pada ${n.pada}, from ${n.start.toFixed(2)}° to ${n.end.toFixed(2)}° on the fixed 0° Aries background.`,
        concepts: [
          "lunar-mansion",
          n.name.toLowerCase(),
          `pada-${n.pada}`,
          sign.toLowerCase(),
        ],
        polarity: "neutral",
        strength: 0.8,
        ruleId: "vedic-nakshatra-27",
        sourceId: "firmament-architecture",
        sourceTrace: VEDIC_TRACE(
          "nakshatra",
          "vedic-nakshatra-27",
          "firmament-architecture"
        ),
      });
      if (asc) {
        const ascSign = ZODIAC_SIGNS[Math.floor(asc.longitude / 30)];
        const houseLord =
          RULERS[
            ZODIAC_SIGNS[(Math.floor(asc.longitude / 30) + row.house - 1) % 12]
          ];
        evidence.push({
          id: `vedic-house-lord-${row.name}`,
          tradition: "vedic",
          category: "deterministic-rule",
          technique: "house-lord",
          subject: row.name,
          statement: `From the ${ascSign} Ascendant, ${row.name} is placed in house ${row.house}; the sign governing that house is ruled by ${houseLord}.`,
          concepts: [
            `house-${row.house}`,
            "house-lord",
            houseLord.toLowerCase(),
          ],
          polarity: "neutral",
          strength: 0.65,
          ruleId: "vedic-house-lords",
          sourceId: "local-vedic-rules",
          sourceTrace: VEDIC_TRACE("house-lord", "vedic-house-lords"),
        });
      }
    }
  }
  for (const row of all) {
    if (!["Mars", "Jupiter", "Saturn"].includes(row.name)) continue;
    const offsets =
      row.name === "Mars"
        ? [4, 7, 8]
        : row.name === "Jupiter"
          ? [5, 7, 9]
          : [3, 7, 10];
    for (const offset of offsets) {
      const target = ((row.house - 1 + offset - 1) % 12) + 1;
      evidence.push({
        id: `vedic-drishti-${row.name}-${target}`,
        tradition: "vedic",
        category: "deterministic-rule",
        technique: "drishti",
        subject: row.name,
        statement: `Traditional ${row.name} graha drishti reaches house ${target} from its supplied house ${row.house}.`,
        concepts: ["drishti", row.name.toLowerCase(), `house-${target}`],
        polarity: row.name === "Jupiter" ? "supportive" : "pressured",
        strength: 0.6,
        ruleId: "vedic-graha-drishti",
        sourceId: "local-vedic-rules",
        sourceTrace: VEDIC_TRACE("drishti", "vedic-graha-drishti"),
      });
    }
  }
  if (plan.includeDivisionalCharts.length)
    evidence.push({
      id: "vedic-varga-status",
      tradition: "vedic",
      category: "uncertainty",
      technique: "varga",
      subject: plan.includeDivisionalCharts.join(","),
      statement: `${plan.includeDivisionalCharts.join(" and ")} was requested, but chart-specific divisional positions are not enabled; no varga conclusion is made.`,
      concepts: ["varga", "incomplete"],
      polarity: "neutral",
      strength: 0,
      ruleId: "vedic-varga-architecture",
      sourceId: "local-vedic-rules",
      sourceTrace: VEDIC_TRACE("varga", "vedic-varga-architecture"),
    });
  // Advanced Vedic timing and strength are calculated in one auditable layer.
  // The layer emits explicit uncertainty evidence when required birth data is missing.
  evidence.push(...resolveVedicTimingAndAshtakavarga(chart));
  return evidence;
}
