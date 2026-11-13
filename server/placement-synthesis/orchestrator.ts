import { stringifyEvidence } from "../astrologyKnowledge/synthesis/evidenceTransport";
import { synthesizeChartForReading } from "../astrologyKnowledge/synthesis/readingBridge";
import { buildNarrativePacket } from "../astrologyKnowledge/synthesis/narrativePacket";
import { invokeLLM } from "../_core/llm";
import { MINI_SYNTHESIS_STYLE } from "../master-interpreter";
import { buildAstrologyEvidencePacket } from "../astrologyKnowledge";
import type { ChartResult } from "../astronomy";
import { PLACEMENT_METHODS } from "./registry";
import type { PlacementAdapterContext, PlacementContribution, PlacementPacket } from "./types";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const signAt = (longitude: number) => SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)];

function findRow(chart: ChartResult, body: string) {
  if (body === "Ascendant") return chart.ascendant;
  return chart.movingBodies.find(row => row.name.toLowerCase() === body.toLowerCase());
}

function promptFor(packet: PlacementPacket) {
  const methodText = packet.contributions.map(item => [
    `METHOD: ${item.label} (${item.method})`,
    `STATUS: ${item.status}`,
    `RELATION: ${item.relation}`,
    item.reason ? `REASON: ${item.reason}` : "",
    item.result.length ? item.result.map(result => `RESULT: ${result}`).join("\n") : "RESULT: none returned",
    item.sourceTrace.length ? `SOURCE TRACE: ${item.sourceTrace.join(" | ")}` : "",
  ].filter(Boolean).join("\n")).join("\n\n");
  return `You are the Firmament precision placement synthesizer. Interpret one exact placement, not a generic horoscope.

PLACEMENT: ${packet.body} at ${packet.display}; ${packet.sign}, ${packet.degree.toFixed(4)}°; House ${packet.house}; reading scope ${packet.mode}.

Every configured method below was executed and has an explicit status. Use every included result that is relevant. Do not invent a result for no-result, not-applicable, incomplete, reference-only, or failed methods. Do not merely name methods: explain how their actual results reinforce, qualify, or contradict one another. Preserve distinct traditions and coordinate systems. The final meaning must be specific to this placement and chart, not a generic Sun/sign/house paragraph.

${methodText}

CROSS-METHOD CONVERGENCES:
${packet.convergences.length ? packet.convergences.join("\n") : "None returned."}

CROSS-METHOD CONTRADICTIONS:
${packet.contradictions.length ? packet.contradictions.join("\n") : "None returned."}

Write exactly two dense paragraphs. Weave the methods into natural prose. Cover observable character, motivations, relationships, group/social expression, gifts, tensions, and developmental direction where supported. Mention meaningful qualifications when methods disagree or inputs are missing. Do not output a list, headings, a method inventory, or vague filler. Do not claim certainty about private mental states, diagnosis, fate, or guaranteed events.`;
}

export function buildPlacementPacket(chart: ChartResult, body: string, question = "") : PlacementPacket {
  const row = findRow(chart, body);
  if (!row) throw new Error(`Placement ${body} was not found in the calculated chart.`);
  const packet = buildAstrologyEvidencePacket(chart, question || `Interpret ${body} as a precise placement`, chart.readingScope);
  const context: PlacementAdapterContext = { chart, body, row, packet };
  const contributions: PlacementContribution[] = PLACEMENT_METHODS.map(({ adapter }) => {
    try { return adapter(context); }
    catch (error) { return { method: "unknown", label: "Adapter failure", status: "failed", relation: "unavailable", result: [], sourceTrace: [], reason: error instanceof Error ? error.message : String(error) }; }
  });
  const convergences = packet.convergences
    .filter(item => item.evidenceIds.some(id => contributions.some(contribution => contribution.sourceTrace.some(trace => trace.includes(id)))))
    .map(item => item.explanation);
  const contradictions = packet.contradictions
    .filter(item => item.evidenceIds.some(id => contributions.some(contribution => contribution.sourceTrace.some(trace => trace.includes(id)))))
    .map(item => item.explanation);
  const result: PlacementPacket = {
    body,
    display: row.display,
    sign: signAt(row.longitude),
    degree: row.longitude % 30,
    house: row.house,
    mode: chart.readingScope,
    contributions,
    includedMethods: contributions.filter(item => item.status === "included").map(item => item.method),
    excludedMethods: contributions.filter(item => ["not-applicable", "reference-only"].includes(item.status)).map(item => item.method),
    unresolvedMethods: contributions.filter(item => ["no-result", "incomplete", "failed"].includes(item.status)).map(item => item.method),
    convergences,
    contradictions,
    prompt: "",
  };
  result.prompt = promptFor(result);
  return result;
}

export async function synthesizePlacement(chart: ChartResult, body: string, question = "") {
  const packet = buildPlacementPacket(chart, body, question);
  const { synthesis: fullSynthesis } = await synthesizeChartForReading(chart, chart.readingScope, question || `Interpret ${body}`);
  const response = await invokeLLM({
    messages: [
      { role: "system", content: `${MINI_SYNTHESIS_STYLE}\nProduce precise, grounded two-paragraph astrology placement interpretations from the supplied evidence packet.` },
      { role: "user", content: packet.prompt + "\n\nFULL CALCULATED CHART AND METHOD OUTCOMES:\n" + stringifyEvidence(buildNarrativePacket(fullSynthesis, question).packet) },
    ],
    maxTokens: 900,
  });
  const content = response.choices[0]?.message?.content;
  const synthesis = typeof content === "string" ? content.trim() : "";
  if (["length", "max_tokens"].includes(response.choices[0]?.finish_reason ?? ""))
    throw new Error("PLACEMENT_SYNTHESIS_INCOMPLETE: AI response was truncated.");
  if (!synthesis) throw new Error("PLACEMENT_SYNTHESIS_EMPTY: AI returned no reading.");
  return { packet: { ...packet, prompt: undefined }, synthesis };
}
