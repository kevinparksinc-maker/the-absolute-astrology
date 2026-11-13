import type { ChartResult, ChartRow } from "../../astronomy";
import { overlay, MANAZIL, normalizeLongitude } from "../../../shared/hybrid";
import { calculateArabicLots } from "../../utils/arabicLots";
import { sourceById } from "../registry";
import type { EvidenceItem, KnowledgePlan, SourceTrace } from "../types";

const trace = (
  technique: string,
  ruleId: string,
  sourceId = "local-arabic-rules"
): SourceTrace => ({
  sourceId,
  tradition: "arabic",
  technique,
  sourceTitle: sourceById(sourceId)?.name ?? sourceId,
  sourceUrl: sourceById(sourceId)?.url,
  retrievedAt: new Date().toISOString(),
  ruleId,
  confidence: sourceId === "canopy-arabian" ? "reference-only" : "high",
});
const factTrace: SourceTrace = {
  sourceId: "firmament-ephemeris",
  tradition: "firmament",
  technique: "calculation",
  sourceTitle: "Firmament local ephemeris",
  retrievedAt: new Date().toISOString(),
  confidence: "high",
};
function rows(chart: ChartResult) {
  return [
    ...chart.movingBodies,
    chart.ascendant,
    chart.northNode,
    chart.southNode,
  ].filter((row): row is ChartRow => Boolean(row));
}
function manzil(longitude: number) {
  const index = Math.floor(normalizeLongitude(longitude) / (360 / 28));
  return {
    name: MANAZIL[index],
    start: index * (360 / 28),
    end: (index + 1) * (360 / 28),
  };
}
export function resolveArabicEvidence(
  chart: ChartResult,
  plan: KnowledgePlan
): EvidenceItem[] {
  const all = rows(chart).filter(row => Number.isFinite(row.longitude));
  const evidence: EvidenceItem[] = [];
  for (const row of all) {
    const ov = overlay(row.longitude);
    const m = manzil(row.longitude);
    if (
      row.name === "Moon" ||
      row.name === "Ascendant" ||
      plan.subjects.some(subject =>
        row.name.toLowerCase().includes(subject.toLowerCase())
      )
    )
      evidence.push({
        id: `arabic-manzil-${row.name}`,
        tradition: "arabic",
        category: "deterministic-rule",
        technique: "manzil",
        subject: row.name,
        statement: `${row.name} is in ${m.name}, bounded by ${m.start.toFixed(2)}°–${m.end.toFixed(2)}°; the same longitude overlays ${ov.decan}.`,
        concepts: ["manzil", m.name.toLowerCase(), "lunar-layer"],
        polarity: "neutral",
        strength: 0.75,
        ruleId: "arabic-manazil-28",
        sourceId: "firmament-architecture",
        sourceTrace: trace(
          "manzil",
          "arabic-manazil-28",
          "firmament-architecture"
        ),
      });
  }
  if (
    chart.ascendant &&
    chart.movingBodies.find(row => row.name === "Sun") &&
    chart.movingBodies.find(row => row.name === "Moon")
  ) {
    const sun = chart.movingBodies.find(row => row.name === "Sun")!;
    const moon = chart.movingBodies.find(row => row.name === "Moon")!;
    const sect = sun.house >= 7 ? "day" : "night";
    evidence.push({
      id: "arabic-sect",
      tradition: "arabic",
      category: "deterministic-rule",
      technique: "sect",
      subject: "chart",
      statement: `The chart is treated as a ${sect} chart because the Sun is in house ${sun.house}; sect is preserved as an Arabic doctrine, not blended into Western dignity.`,
      concepts: ["sect", sect],
      polarity: "neutral",
      strength: 0.8,
      ruleId: "arabic-day-sect",
      sourceId: "local-arabic-rules",
      sourceTrace: trace("sect", "arabic-day-sect"),
    });
    const lots = calculateArabicLots({
      ascendant: chart.ascendant.longitude,
      sun: sun.longitude,
      moon: moon.longitude,
      sect,
    });
    for (const [name, longitude] of Object.entries(lots)) {
      const m = manzil(longitude);
      evidence.push({
        id: `arabic-lot-${name}`,
        tradition: "arabic",
        category: "deterministic-rule",
        technique: "lots",
        subject: name,
        statement: `Lot of ${name[0].toUpperCase() + name.slice(1)} calculates to ${longitude.toFixed(4)}°, activating ${m.name}.`,
        concepts: ["lot", name, m.name.toLowerCase()],
        polarity: "neutral",
        strength: 0.85,
        ruleId: "arabic-lots",
        sourceId: "local-arabic-rules",
        sourceTrace: trace("lots", "arabic-lots"),
      });
    }
  } else
    evidence.push({
      id: "arabic-lots-uncertain",
      tradition: "arabic",
      category: "uncertainty",
      technique: "lots",
      subject: "fortune-spirit",
      statement:
        "Fortune and Spirit were not calculated because an exact Ascendant, Sun, and Moon set was not supplied.",
      concepts: ["lots", "incomplete"],
      polarity: "neutral",
      strength: 0,
      ruleId: "arabic-lots",
      sourceId: "local-arabic-rules",
      sourceTrace: trace("lots", "arabic-lots"),
    });
  if (plan.includeTiming)
    evidence.push({
      id: "arabic-hours-status",
      tradition: "arabic",
      category: "uncertainty",
      technique: "planetary-hours",
      subject: "timing",
      statement:
        "Planetary hours are not calculated without local sunrise and sunset inputs.",
      concepts: ["planetary-hours", "incomplete"],
      polarity: "neutral",
      strength: 0,
      ruleId: "arabic-planetary-hours",
      sourceId: "canopy-arabian",
      sourceTrace: trace(
        "planetary-hours",
        "arabic-planetary-hours",
        "canopy-arabian"
      ),
    });
  return evidence;
}
