import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import type { GameChartSnapshot, MethodResult } from "../../shared/simulationLab/contracts";
import { teamSideForHouse } from "../../shared/simulationLab/teamHouses";
import type { ChartResult } from "../astronomy";

const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 5, Moon: 5, Mars: 5, Jupiter: 5, Saturn: 5, Pluto: 5,
  Mercury: 4, Neptune: 4, Venus: 3, Uranus: 3,
};
const NODE_WEIGHTS: Record<string, number> = { "North Node": 5, "South Node": 3 };

/** Transparent experimental house-occupancy baseline, not a calibrated win model.
 * Venus is deliberately included as devotional/competitive investment.
 * No fabricated planetary positions and no implied probability.
 */
export function evaluatePlanetaryTeamHouses(chart: ChartResult): MethodResult {
  if (!chart.ascendant || chart.houses.length !== 12)
    throw new Error("SPORTS_HOUSE_METHOD_NO_ASCENDANT: Sunrise-anchored event houses required.");
  const bodies = [...chart.movingBodies, chart.northNode, chart.southNode];
  const seen = new Set<string>();
  let asc = 0, desc = 0;
  const contributing: string[] = [];
  for (const body of bodies) {
    if (seen.has(body.name)) continue;
    seen.add(body.name);
    const weight = PLANET_WEIGHTS[body.name] ?? NODE_WEIGHTS[body.name];
    if (weight === undefined) continue;
    if (!Number.isInteger(body.house) || body.house < 1 || body.house > 12)
      throw new Error(`SPORTS_HOUSE_METHOD_INVALID_HOUSE: ${body.name}`);
    const side = teamSideForHouse(body.house);
    if (side === "asc") asc += weight;
    else desc += weight;
    contributing.push(`${body.name} H${body.house} (${side.toUpperCase()}, ${weight})`);
  }
  if (!contributing.length) throw new Error("SPORTS_HOUSE_METHOD_NO_PLANETS");
  return {
    methodId: "sports-team-house-occupancy",
    methodName: "God/Agent event-chart team-house occupancy baseline",
    verdict: asc === desc ? "tie" : asc > desc ? "asc" : "desc",
    ascScore: asc,
    descScore: desc,
    evidenceIds: bodies.filter(b => PLANET_WEIGHTS[b.name] !== undefined || NODE_WEIGHTS[b.name] !== undefined)
      .map(b => `chart:body:${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}:house`),
    what: `Calculated team-house occupancy: ASC ${asc}, DESC ${desc} weighted symbolic points.`,
    why: contributing.join("; "),
    consequence: "One experimental symbolic baseline; not a standalone game prediction.",
    limitations: [
      "These are configured symbolic weights, not statistical probabilities or validated causal effects.",
      "No weather, injuries, actual team quality, or opponent availability is included in this method.",
      "God View lacks a local horizon and must not be assigned fabricated team houses.",
    ],
  };
}

const outputSchema = z.object({
  selectedSide: z.enum(["asc", "desc", "no-pick"]),
  reasoning: z.string().trim().min(120).max(2600),
  keyFactors: z.array(z.object({
    methodId: z.string().min(1),
    finding: z.string().trim().min(12).max(500),
    evidenceIds: z.array(z.string().min(1)).min(1),
  })).min(1),
  contraryEvidence: z.string().trim().min(30).max(1200),
  conditions: z.string().trim().min(30).max(1200),
  confidence: z.enum(["low", "moderate"]),
  methodsReviewed: z.array(z.string().min(1)),
});
export type SportsPrediction = z.infer<typeof outputSchema> & {
  team: string | null;
  methodCount: number;
  calculatedScore: { asc: number; desc: number };
  warning: string;
};

export function validateSportsPrediction(
  raw: unknown,
  snapshot: GameChartSnapshot,
  methods: readonly MethodResult[]
): SportsPrediction {
  const result = outputSchema.parse(raw);
  const ids = methods.map(m => m.methodId);
  if (new Set(ids).size !== ids.length || new Set(result.methodsReviewed).size !== ids.length ||
      !ids.every(id => result.methodsReviewed.includes(id)))
    throw new Error("SPORTS_PREDICTION_AUDIT_FAILED: Every method must be reviewed exactly once.");
  const source = new Map(methods.map(m => [m.methodId, m]));
  const available = new Set([...snapshot.chartEvidence, ...snapshot.physicalEvidence].map(e => e.id));
  const cited = new Set<string>();
  for (const factor of result.keyFactors) {
    const method = source.get(factor.methodId);
    if (!method || method.verdict === "unavailable")
      throw new Error("SPORTS_PREDICTION_AUDIT_FAILED: Unsupported method contribution.");
    for (const id of factor.evidenceIds) {
      if (!available.has(id) || !method.evidenceIds.includes(id))
        throw new Error(`SPORTS_PREDICTION_AUDIT_FAILED: Unsupported evidence ${id}.`);
    }
    cited.add(factor.methodId);
  }
  if (methods.some(m => m.verdict !== "unavailable" && m.evidenceIds.length && !cited.has(m.methodId)))
    throw new Error("SPORTS_PREDICTION_AUDIT_FAILED: Active method omitted from reasoning.");
  let asc = 0, desc = 0;
  for (const m of methods) {
    if (m.ascScore !== null && m.descScore !== null) {
      if (!Number.isFinite(m.ascScore) || !Number.isFinite(m.descScore) || m.ascScore < 0 || m.descScore < 0)
        throw new Error("SPORTS_PREDICTION_AUDIT_FAILED: Invalid calculated method scores.");
      asc += m.ascScore; desc += m.descScore;
    }
  }
  const pick = asc === desc ? "no-pick" : asc > desc ? "asc" : "desc";
  if (result.selectedSide !== pick)
    throw new Error("SPORTS_PREDICTION_AUDIT_FAILED: AI verdict conflicts with audited method arithmetic.");
  return {
    ...result,
    team: pick === "asc" ? snapshot.ascTeam : pick === "desc" ? snapshot.descTeam : null,
    methodCount: methods.length,
    calculatedScore: { asc, desc },
    warning: "Symbolic, experimental model; scores are not win probabilities. Confirm weather, injuries, and team form before acting.",
  };
}

/** No fabricated judgment: LLM explains reproducible methods and must agree
 * with deterministic scores; contradictory outputs fail loudly.
 */
export async function predictSportsGame(
  snapshot: GameChartSnapshot,
  methods: readonly MethodResult[]
): Promise<SportsPrediction> {
  if (!methods.length) throw new Error("SPORTS_PREDICTION_NO_METHODS");
  const evidence = new Set([...snapshot.chartEvidence, ...snapshot.physicalEvidence].map(e => e.id));
  if (!snapshot.masterMethods?.synthesisAudit.passed)
    throw new Error("SPORTS_PREDICTION_MASTER_AUDIT_FAILED");
  for (const m of methods) {
    if (m.verdict === "unavailable" && (m.ascScore !== null || m.descScore !== null))
      throw new Error("SPORTS_PREDICTION_INVALID_UNAVAILABLE_METHOD");
    if (m.evidenceIds.some(id => !evidence.has(id)))
      throw new Error(`SPORTS_PREDICTION_UNTRACEABLE_EVIDENCE: ${m.methodId}`);
  }
  let asc = 0, desc = 0;
  for (const m of methods) {
    if (m.ascScore !== null && m.descScore !== null) {
      asc += m.ascScore; desc += m.descScore;
    }
  }
  const requiredSide = asc === desc ? "no-pick" : asc > desc ? "asc" : "desc";
  const response = await invokeLLM({
    max_tokens: 1900,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `THE ABSOLUTE — MASTER SPORTS ASTROLOGY INTERPRETER.
You are evaluating a game using recorded, calculated astrology-method outcomes, not inventing outcomes.
Use direct modern second-person or team-centered prose. Connect WHAT → WHY → HOW → CONSEQUENCE → MEANING.
Distinguish God View fixed background from Agent View venue-local rising houses.
Do not invent stars, houses, aspects, injuries, weather, probabilities, historical results or unprovided matchup facts.
Use the full Mesopotamian Venus/Inanna meaning: emotional devotion, loyalty and competitive commitment as a SYMBOLIC lens; never equate Venus with automatic weakness or guaranteed wins.
Explain supportive and contradictory indicators and how the verdict could fail.
The server has already determined the side from arithmetic. selectedSide must be exactly the requiredSide. If no-pick, explain a genuine tie; do not force an outcome.
Return JSON exactly with selectedSide, reasoning (120+ chars), keyFactors array of {methodId,finding,evidenceIds}, contraryEvidence (30+ chars), conditions (30+ chars), confidence ("low" or "moderate"), methodsReviewed (every methodId exactly once).
Every active method with evidence MUST have at least one keyFactor using one or more evidenceIds supplied by that same method. You may use only exact evidence IDs and method IDs. Scores are symbolic points, NOT win probabilities.` },
      { role: "user", content: JSON.stringify({
        game: { id: snapshot.id, league: snapshot.league, date: snapshot.scheduledStart,
          ascTeam: snapshot.ascTeam, descTeam: snapshot.descTeam, venue: snapshot.venue },
        requiredSide, computedSymbolicTotals: { asc, desc }, methods,
        chartEvidence: snapshot.chartEvidence, physicalEvidence: snapshot.physicalEvidence,
        calculatedMasterMethods: snapshot.masterMethods?.base.map(m => ({
          id: m.id, status: m.status, frame: m.frame, name: m.name,
          evidenceIds: m.evidenceIds, sourceIds: m.sourceIds,
        })),
      }) },
    ],
  });
  const message = response.choices?.[0]?.message?.content;
  const text = typeof message === "string" ? message :
    Array.isArray(message) ? message.filter(x => x.type === "text").map(x => x.text).join("") : "";
  let parsed: unknown;
  try { parsed = JSON.parse(text.replace(/^\s*```(?:json)?\s*/, "").replace(/\s*```\s*$/, "")); }
  catch { throw new Error("SPORTS_PREDICTION_INVALID_JSON: AI result is unreadable."); }
  return validateSportsPrediction(parsed, snapshot, methods);
}
