import { calculateMasterChart as calculateChart } from "./masterChart/entry";
/**
 * Twelve-Sign Celestial Horary — independent from traditional question-time Horary.
 *
 * In Agent View the selected sign's classical ruler is the anchor (the exact
 * moving longitude becomes the first equal-house cusp). God View remains the
 * same permanent 0° Aries reference for every sign. This is a symbolic
 * ruler-centered lens, NOT a local Ascendant, birth chart or traditional
 * horary perfection verdict.
 */
import { type ChartResult } from "./astronomy";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import { agentHouseFor, dualPlacement, equalHouseCusps, godHouseFor, type FrameRelationship } from "./astrologyCore";
import { FIXED_STARS, formatLongitude, normalizeLongitude, ZODIAC_SIGNS } from "../shared/hybrid";
import { SIGN_RULERS, SIGN_SYMBOLS, type ZodiacSign } from "../shared/zodiacSigns";
import { invokeLLM } from "./_core/llm";
import { FIRMAMENT_MASTER_INTERPRETATION_PROMPT } from "./firmament-master";

export type SignReadingInput = { sign: ZodiacSign; date: string; time: string; question?: string };
export const ASC_SIDE_HOUSES = [1, 2, 3, 6, 10, 11] as const;
export const DSC_SIDE_HOUSES = [4, 5, 7, 8, 9, 12] as const;

type Tone = "flow" | "friction";
export type ZodiacAspect = {
  first: string; second: string; aspect: string; orb: number; tone: Tone;
  firstAgentHouse: number; secondAgentHouse: number;
  firstGodHouse: number; secondGodHouse: number;
};
export type ZodiacPlacement = {
  name: string; longitude: number; display: string; retrograde: boolean;
  speed: number; godHouse: number; agentHouse: number;
  relationship?: FrameRelationship;
  overlay: ChartResult["movingBodies"][number]["overlay"];
  fixedStarContacts: Array<{ name: string; orb: number }>;
};
export type SideSummary = {
  name: string; houses: readonly number[]; flow: number; friction: number;
  occupied: string[]; contacts: number;
};
export type ZodiacSignEvidence = {
  sign: ZodiacSign; symbol: string; ruler: string; anchorLongitude: number;
  anchorDisplay: string; date: string; time: string; utc: string; question?: string;
  model: "ruler-exact-longitude"; reference: "geocentric-UTC";
  agentHouses: number[]; godHouses: number[];
  signTerritory: { from: number; to: number; planets: string[]; themes: string };
  placements: ZodiacPlacement[]; aspects: ZodiacAspect[];
  agent: { asc: SideSummary; dsc: SideSummary };
  god: { asc: SideSummary; dsc: SideSummary };
  evidenceText: string;
};
export type ZodiacSignReading = { evidence: ZodiacSignEvidence; reading: string; generatedBy: "master-interpreter" | "deterministic"; masterSynthesis: { snapshotId: string; methodCount: number; qualityPassed: boolean; scope: "god-view-sky"; } };

const SIGN_THEMES: Record<ZodiacSign, string> = {
  Aries: "initiative and courage", Taurus: "resources, values and stability",
  Gemini: "communication and exchange", Cancer: "home and care",
  Leo: "creative expression and visibility", Virgo: "discernment and practical refinement",
  Libra: "partnership and diplomacy", Scorpio: "trust and transformation",
  Sagittarius: "exploration and belief", Capricorn: "responsibility and endurance",
  Aquarius: "community and originality", Pisces: "compassion and imagination",
};
const targets: Array<{ degrees: number; label: string; tone: Tone }> = [
  { degrees: 0, label: "conjunction", tone: "flow" },
  { degrees: 60, label: "sextile", tone: "flow" },
  { degrees: 90, label: "square", tone: "friction" },
  { degrees: 120, label: "trine", tone: "flow" },
  { degrees: 180, label: "opposition", tone: "friction" },
];
const sep = (a: number, b: number) => {
  const d = normalizeLongitude(a - b);
  return Math.min(d, 360 - d);
};
export function createRulerAnchoredEvidence(
  sign: ZodiacSign,
  sky: Pick<ChartResult, "movingBodies" | "utc">,
  date: string,
  time: string,
  question?: string,
): ZodiacSignEvidence {
  const ruler = SIGN_RULERS[sign];
  const rulingPlanet = sky.movingBodies.find(row => row.name === ruler);
  if (!rulingPlanet || !Number.isFinite(rulingPlanet.longitude)) {
    throw new Error(`The current ${ruler} position is unavailable for ${sign}.`);
  }
  const anchorLongitude = normalizeLongitude(rulingPlanet.longitude);
  const agentHouses = equalHouseCusps(anchorLongitude);
  const godHouses = equalHouseCusps(0);
  const placements: ZodiacPlacement[] = sky.movingBodies
    .filter(row => Number.isFinite(row.longitude))
    .map(row => {
      const both = dualPlacement(row.longitude, anchorLongitude, row.name);
      const fixedStarContacts = FIXED_STARS
        .map(([name, longitude]) => ({ name, orb: Number(sep(row.longitude, longitude).toFixed(2)) }))
        .filter(star => star.orb <= 5);
      return {
        name: row.name, longitude: normalizeLongitude(row.longitude), display: formatLongitude(row.longitude),
        speed: row.speed ?? 0, retrograde: Boolean(row.retrograde),
        godHouse: godHouseFor(row.longitude), agentHouse: agentHouseFor(row.longitude, anchorLongitude),
        relationship: "frameRelationship" in both ? both.frameRelationship : undefined, overlay: row.overlay, fixedStarContacts,
      };
    });
  const signStart = ZODIAC_SIGNS.indexOf(sign) * 30;
  const signTerritory = { from: signStart, to: signStart + 30, planets: placements.filter(row => row.longitude >= signStart && row.longitude < signStart + 30).map(row => row.name), themes: SIGN_THEMES[sign] };
  const aspects: ZodiacAspect[] = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const first = placements[i], second = placements[j];
      const distance = sep(first.longitude, second.longitude);
      const candidate = targets.map(t => ({ ...t, orb: Math.abs(distance - t.degrees) }))
        .sort((a, b) => a.orb - b.orb)[0];
      if (candidate.orb <= 5) aspects.push({
        first: first.name, second: second.name, aspect: candidate.label,
        orb: Number(candidate.orb.toFixed(2)), tone: candidate.tone,
        firstAgentHouse: first.agentHouse, secondAgentHouse: second.agentHouse,
        firstGodHouse: first.godHouse, secondGodHouse: second.godHouse,
      });
    }
  }
  const sideSummary = (frame: "agent" | "god", houses: readonly number[], name: string): SideSummary => {
    const active = (house: number) => houses.includes(house);
    const score = aspects.flatMap(a => [
      { tone: a.tone, house: frame === "agent" ? a.firstAgentHouse : a.firstGodHouse },
      { tone: a.tone, house: frame === "agent" ? a.secondAgentHouse : a.secondGodHouse },
    ]).filter(contact => active(contact.house));
    return {
      name, houses, flow: score.filter(contact => contact.tone === "flow").length,
      friction: score.filter(contact => contact.tone === "friction").length, contacts: score.length,
      occupied: placements.filter(row => active(frame === "agent" ? row.agentHouse : row.godHouse))
        .map(row => `${row.name} (H${frame === "agent" ? row.agentHouse : row.godHouse})`),
    };
  };
  const agent = { asc: sideSummary("agent", ASC_SIDE_HOUSES, "Ruler-anchored ASC territory"), dsc: sideSummary("agent", DSC_SIDE_HOUSES, "Ruler-anchored DSC territory") };
  const god = { asc: sideSummary("god", ASC_SIDE_HOUSES, "Fixed God View ASC territory"), dsc: sideSummary("god", DSC_SIDE_HOUSES, "Fixed God View DSC territory") };
  const evidenceText = [
    `Sign: ${sign}; traditional ruler: ${ruler}; reference moment: ${sky.utc}; user question: ${question || "General sign themes"}.`,
    `SIGN-SPECIFIC TERRITORY: ${sign} occupies ${signTerritory.from}°–${signTerritory.to}° of the fixed zodiac. Its traditional themes: ${signTerritory.themes}. Planets in that sign: ${signTerritory.planets.join(", ") || "none"}. Signs sharing a ruler have identical ruler-anchored house grids, but different sign territories.`,
    `AGENT VIEW: House 1 begins at the exact geocentric longitude of ${ruler}: ${formatLongitude(anchorLongitude)} (${anchorLongitude.toFixed(4)}°). These are conceptual ruler-anchored equal houses, NOT physical local-horizon houses.`,
    `GOD VIEW: Fixed 0° Aries = House 1, 30° sectors, independent of selected sign or selected ruler.`,
    `Every planet and all houses evaluated with the same 5° aspect orb. Conjunction, sextile, trine are labeled flow; square, opposition are labeled friction. These are symbolic descriptors, not probabilistic forecasts. Conjunctions can be difficult depending on context.`,
    `All placements (moving positions shared by both frames):\n${placements.map(p => `- ${p.name} ${p.display}; God H${p.godHouse} / Agent H${p.agentHouse}; ${p.retrograde ? "retrograde" : "direct"}; nakshatra ${p.overlay.nakshatra} pada ${p.overlay.pada}; manzil ${p.overlay.manzil}; decan ${p.overlay.decan}; fixed-star contacts within 5°: ${p.fixedStarContacts.map(x => `${x.name} (${x.orb}°)`).join(", ") || "none"}`).join("\n")}`,
    `All major aspects within 5°:\n${aspects.map(a => `- ${a.first} ${a.aspect} ${a.second}, orb ${a.orb}°, ${a.tone}; Agent H${a.firstAgentHouse}/H${a.secondAgentHouse}; God H${a.firstGodHouse}/H${a.secondGodHouse}`).join("\n") || "- none"}`,
    `Agent ASC houses 1,2,3,6,10,11 flow ${agent.asc.flow}, friction ${agent.asc.friction}; Agent DSC houses 4,5,7,8,9,12 flow ${agent.dsc.flow}, friction ${agent.dsc.friction}.`,
    `God ASC houses 1,2,3,6,10,11 flow ${god.asc.flow}, friction ${god.asc.friction}; God DSC houses 4,5,7,8,9,12 flow ${god.dsc.flow}, friction ${god.dsc.friction}.`,
    `The base ephemeris sky is unchanged when switching signs. Only the Agent house anchor and related house territories change. Never silently rotate God View or confuse the symbolic first cusp with a rising sign.`,
  ].join("\n\n");
  return {
    sign, symbol: SIGN_SYMBOLS[ZODIAC_SIGNS.indexOf(sign)], ruler, anchorLongitude,
    anchorDisplay: formatLongitude(anchorLongitude), date, time, utc: sky.utc, question,
    model: "ruler-exact-longitude", reference: "geocentric-UTC",
    agentHouses, godHouses, signTerritory, placements, aspects, agent, god, evidenceText,
  };
}

function deterministicReading(e: ZodiacSignEvidence) {
  const ruler = e.placements.find(p => p.name === e.ruler)!;
  const links = e.aspects.filter(a => a.first === e.ruler || a.second === e.ruler);
  const contacts = links.length ? links.map(a => `${a.first} ${a.aspect} ${a.second} (${a.orb}°)`).join("; ") : "no configured major aspects to the ruler within 5°";
  return [
    `## ${e.sign}: what the sky emphasizes`,
    `Your sign's classical ruler, ${e.ruler}, stands at ${e.anchorDisplay}. For this sign-centered reading, that exact point becomes the beginning of Agent House 1. This is a symbolic perspective, not a birth Ascendant or a traditional Horary verdict.`,
    `## The selected sign territory`,
    `${e.sign} traditionally emphasizes ${e.signTerritory.themes}. Its permanent zodiac sector contains ${e.signTerritory.planets.join(", ") || "no moving planets"} at this moment. This sign-based distinction remains visible even when two signs share a planetary ruler.`,
    `## How your ruling planet is involved`,
    `${e.ruler} is in God View House ${ruler.godHouse} and Agent View House 1 by construction. Its current major contacts: ${contacts}. Where these planets meet, their symbolic themes can be considered together; challenging contacts point toward areas needing more effort or negotiation.`,
    `## Where energy flows, and where it meets resistance`,
    `Agent View finds ${e.agent.asc.flow} flow and ${e.agent.asc.friction} friction contacts in the 1/2/3/6/10/11 house family; the other 4/5/7/8/9/12 family has ${e.agent.dsc.flow} flow and ${e.agent.dsc.friction} friction contacts. God View independently finds ${e.god.asc.flow}/${e.god.asc.friction} and ${e.god.dsc.flow}/${e.god.dsc.friction}. Each contact is counted once per participating house, not weighed as a proven outcome.`,
    `## What this can mean in everyday life`,
    `Use the ruler contacts and occupied houses to examine practical themes such as initiative, finances, communication, relationships, home, work and personal commitments. The same planetary sky is seen from two house perspectives; differences express distinct interpretive reference frames, not a contradiction in the ephemeris.`,
    `## A grounded next step`,
    e.question ? `For “${e.question}”, compare the ruler's aspects with the house domains relevant to that subject rather than treating a sign-wide picture as a guaranteed yes/no event.` : "Choose a specific question to focus the interpretation on a life situation rather than claiming a universal outcome for everyone born under this sign.",
  ].join("\n\n");
}

export async function getZodiacSignReading(input: SignReadingInput): Promise<ZodiacSignReading> {
  // Use the original deterministic ephemeris; no invented location or local Ascendant.
  const sky = await calculateChart({
    location: "", latitude: 0, longitude: 0, timezone: "UTC",
    date: input.date, time: input.time, worldview: "god",
    readingScope: "transit", birthTimeKnown: true,
  });
  const evidence = createRulerAnchoredEvidence(input.sign, sky, input.date, input.time, input.question);
  // The canonical methods are calculated for the actual God View sky.
  // They MUST NOT replace the special ruler-anchored Agent houses above.
  const { synthesis, context } = await synthesizeChartForReading(
    sky, "natal", input.question || `Sign-centered reading for ${input.sign}`
  );
  const masterSynthesis = {
    snapshotId: synthesis.snapshotId,
    methodCount: synthesis.methodLedgerSummary.computedWithResult,
    qualityPassed: synthesis.qualityAudit.passed,
    scope: "god-view-sky" as const,
  };
  const fallback = deterministicReading(evidence) +
    `\\n\\n## Unified Master Method Evidence (God View sky)\\n${context}`;
  try {
    const response = await invokeLLM({
      maxTokens: 2400,
      messages: [
        { role: "system", content: `${FIRMAMENT_MASTER_INTERPRETATION_PROMPT}\nYou are interpreting a sign-centered ruler-anchored celestial reading, NOT a natal chart, local Ascendant or traditional Horary yes/no judgment. Ground each relationship in the supplied evidence. Answer WHAT, WHY, HOW, CONSEQUENCE, MEANING in clear English. Keep flow/friction symbolic and avoid invented facts, certainty or universal outcome claims. Explain God View independently from Agent View. Discuss relevant house themes and supported nakshatras, manazil, decans and fixed star conjunctions only where relevant. Do not invent a 12-sign forecast algorithm beyond the supplied snapshot.` },
        { role: "user", content: evidence.evidenceText + "\n\nCANONICAL MASTER METHOD FINDINGS (GOD VIEW SKY ONLY; do not reinterpret their house placements as ruler-anchored Agent houses):\n" + context + "\n\nProvide a thorough human-facing interpretation of this sign's sky. Start with a direct meaningful answer and explain the ruling planet, all relevant houses, contacts, and God/Agent comparison. Include possible concrete life manifestations, practical reflection, and epistemic boundaries." },
      ],
    });
    const reading = response.choices[0]?.message?.content;
    if (typeof reading === "string" && reading.trim()) return { evidence, reading, generatedBy: "master-interpreter", masterSynthesis };
  } catch {
    // A useful, traceable evidence reading remains available without an AI key.
  }
  return { evidence, reading: fallback, generatedBy: "deterministic", masterSynthesis };
}
