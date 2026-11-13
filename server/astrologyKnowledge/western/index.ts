import type { ChartResult, ChartRow } from "../../astronomy";
import { detectWesternAspects } from "../../utils/patternMatcher";
import { sourceById, ASTROLOGY_RULES } from "../registry";
import type { EvidenceItem, KnowledgePlan, SourceTrace } from "../types";

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
const EXALTATIONS: Record<string, string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mercury: "Virgo",
  Venus: "Pisces",
  Mars: "Capricorn",
  Jupiter: "Cancer",
  Saturn: "Libra",
};
const FALLS: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mercury: "Pisces",
  Venus: "Virgo",
  Mars: "Cancer",
  Jupiter: "Capricorn",
  Saturn: "Aries",
};
const DIGNITY_RULE = ASTROLOGY_RULES.find(
  rule => rule.id === "western-dignity-basic"
)!;
const TRACE: SourceTrace = {
  sourceId: DIGNITY_RULE.sourceId,
  tradition: "western",
  technique: DIGNITY_RULE.technique,
  sourceTitle: sourceById(DIGNITY_RULE.sourceId)?.name ?? DIGNITY_RULE.sourceId,
  retrievedAt: new Date().toISOString(),
  ruleId: DIGNITY_RULE.id,
  confidence: "high",
};
const factTrace: SourceTrace = {
  sourceId: "firmament-ephemeris",
  tradition: "firmament",
  technique: "calculation",
  sourceTitle: "Firmament local ephemeris",
  retrievedAt: new Date().toISOString(),
  confidence: "high",
};

function rows(chart: ChartResult): ChartRow[] {
  return [
    ...chart.movingBodies,
    chart.ascendant,
    chart.descendant,
    chart.midheaven,
    chart.northNode,
    chart.southNode,
  ].filter((row): row is ChartRow => Boolean(row));
}
function sign(row: ChartRow) {
  return typeof row.display === "string"
    ? row.display.split(" ")[0]
    : "unknown";
}
function selected(row: ChartRow, plan: KnowledgePlan) {
  return (
    plan.subjects.some(subject =>
      row.name
        .toLowerCase()
        .includes(subject.toLowerCase().replace("-house", ""))
    ) ||
    ["Sun", "Moon", "Ascendant", "Saturn", "Jupiter", "Venus"].includes(
      row.name
    )
  );
}

export function resolveWesternEvidence(
  chart: ChartResult,
  plan: KnowledgePlan
): EvidenceItem[] {
  const placements = rows(chart).filter(row => Number.isFinite(row.longitude));
  const evidence: EvidenceItem[] = placements
    .filter(row => selected(row, plan))
    .map(row => ({
      id: `western-fact-${row.name}`,
      tradition: "firmament",
      category: "calculated-fact",
      technique: "calculation",
      subject: row.name,
      statement: `${row.name} is at ${row.display}, in displayed house ${row.house}${row.agentHouse == null ? "" : ` and Agent House ${row.agentHouse}`}.`,
      concepts: [row.name.toLowerCase(), `house-${row.house}`],
      polarity: "neutral",
      strength: 1,
      sourceId: factTrace.sourceId,
      sourceTrace: factTrace,
    }));
  for (const row of placements.filter(row => selected(row, plan))) {
    const rowSign = sign(row);
    const ruler = RULERS[rowSign];
    const condition =
      EXALTATIONS[row.name] === rowSign
        ? "exalted"
        : FALLS[row.name] === rowSign
          ? "debilitated"
          : ruler === row.name
            ? "in its domicile"
            : "without a basic domicile or exaltation condition";
    evidence.push({
      id: `western-dignity-${row.name}`,
      tradition: "western",
      category: "deterministic-rule",
      technique: "dignity",
      subject: row.name,
      statement: `${row.name} in ${rowSign} is ${condition}; ${rowSign} is ruled by ${ruler}.`,
      concepts: ["condition", condition, rowSign.toLowerCase()],
      polarity:
        condition === "debilitated"
          ? "pressured"
          : condition === "exalted" || condition === "in its domicile"
            ? "supportive"
            : "neutral",
      strength: 0.7,
      ruleId: DIGNITY_RULE.id,
      sourceId: TRACE.sourceId,
      sourceTrace: TRACE,
    });
  }
  const aspectRows = placements.filter(
    row => row.name !== "Ascendant" || chart.agentViewAvailable
  );
  for (const aspect of detectWesternAspects(
    aspectRows.map(row => ({
      planet: row.name,
      longitude: row.longitude,
      house: row.house,
    }))
  )) {
    evidence.push({
      id: `western-aspect-${aspect.planetA}-${aspect.planetB}-${aspect.type}`,
      tradition: "western",
      category: "deterministic-rule",
      technique: "aspects",
      subject: `${aspect.planetA}-${aspect.planetB}`,
      statement: `${aspect.planetA} ${aspect.type} ${aspect.planetB} within ${aspect.orb.toFixed(2)}° using the unified five-degree Firmament relationship rule.`,
      concepts: [
        aspect.type,
        aspect.planetA.toLowerCase(),
        aspect.planetB.toLowerCase(),
        ...aspect.themes,
      ],
      polarity: ["square", "opposition"].includes(aspect.type)
        ? "pressured"
        : "supportive",
      strength: aspect.strength,
      ruleId: "western-5-degree-geometry",
      sourceId: "firmament-architecture",
      sourceTrace: {
        sourceId: "firmament-architecture",
        tradition: "firmament",
        technique: "aspects",
        sourceTitle: "Firmament architecture",
        retrievedAt: new Date().toISOString(),
        ruleId: "western-5-degree-geometry",
        confidence: "high",
      },
    });
  }
  return evidence;
}
