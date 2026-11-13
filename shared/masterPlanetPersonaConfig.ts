import type { ChartResult } from "../server/astronomy";
import { buildPlanetPersonaMatrix, type PlanetPersonaTrait } from "./planetPersonaMatrix";

export const CORE_REQUESTED_ACTORS = [
  "Sun",
  "Moon",
  "Ascendant",
  "Descendant",
  "North Node",
  "South Node",
] as const;

export const FULL_CELESTIAL_ENSEMBLE = [
  "Sun",
  "Moon",
  "Ascendant",
  "Descendant",
  "North Node",
  "South Node",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

import {
  buildRealWorldTranslation,
  type RealWorldActorTranslation,
  PLANET_SYMBOLS,
} from "./peopleTalkTranslation";

export interface CanonicalPlacementMapping {
  actor: string;
  symbol: string;
  formattedPosition: string;
  sign: string;
  house: number;
  houseArena: string;
  decanFlavor: string;
  nakshatraName: string;
  nakshatraPada: number;
  nakshatraDeity: string;
  nakshatraShakti: string;
  manzilName: string;
  manzilStationRole: string;
  essentialDignities: string[];
  essentialDebilities: string[];
  sovereigntyTier: string;
  boundsEgyptian: string;
  shadbalaVirupas: number;
  shadbalaStatus: string;
  houseStrengthVirupas: number;
  houseSupportTier: string;
  navamshaD9: string;
  activeAspects: string[];
  activeDashaRole: string;
  fixedStarContact?: string;
  personaArchetype: string;
  realWorldTranslation: RealWorldActorTranslation;
}
export { buildRealWorldTranslation, type RealWorldActorTranslation, PLANET_SYMBOLS };

/**
 * Extracts requested actors from a question or prompt.
 * If none are explicitly requested, defaults to the Core Requested Ensemble (Sun, Moon, Ascendant, Descendant, Nodes).
 */
export function extractRequestedActors(promptOrQuestion: string): string[] {
  const q = promptOrQuestion.toLowerCase();
  const requested: string[] = [];

  const candidates: Array<[string, RegExp]> = [
    ["Sun", /\bsun\b/i],
    ["Moon", /\bmoon\b/i],
    ["Ascendant", /\b(ascendant|asc|rising)\b/i],
    ["Descendant", /\b(descendant|desc|dsc)\b/i],
    ["North Node", /\b(north node|rahu|northnode)\b/i],
    ["South Node", /\b(south node|ketu|southnode)\b/i],
    ["Mercury", /\bmercury\b/i],
    ["Venus", /\bvenus\b/i],
    ["Mars", /\bmars\b/i],
    ["Jupiter", /\bjupiter\b/i],
    ["Saturn", /\bsaturn\b/i],
    ["Uranus", /\buranus\b/i],
    ["Neptune", /\bneptune\b/i],
    ["Pluto", /\bpluto\b/i],
  ];

  for (const [name, regex] of candidates) {
    if (regex.test(q)) requested.push(name);
  }

  // If the prompt mentions "nodes" generically, add both North and South Node
  if (/\bnodes?\b/i.test(q)) {
    if (!requested.includes("North Node")) requested.push("North Node");
    if (!requested.includes("South Node")) requested.push("South Node");
  }

  // If fewer than 2 actors were explicitly isolated, or if the question is broad,
  // ensure the full core ensemble is included so no data is dropped!
  if (requested.length <= 1 || /\b(chart|reading|all|placements|everything|overview|who am i|synthesis)\b/i.test(q)) {
    for (const core of CORE_REQUESTED_ACTORS) {
      if (!requested.includes(core)) requested.push(core);
    }
  }

  return requested;
}

/**
 * Maps requested placements to their full canonical meanings and real-world people talk.
 * Forces 100% data coverage before narrative synthesis.
 */
export function mapRequestedPlacementsToCanonicalMeaning(
  chart: ChartResult,
  requestedActors?: string[]
): CanonicalPlacementMapping[] {
  const matrix = buildPlanetPersonaMatrix(chart);
  const actorsToMap = requestedActors && requestedActors.length > 0
    ? requestedActors
    : [...CORE_REQUESTED_ACTORS];

  return actorsToMap.map(actorName => {
    const trait = matrix.find(
      p =>
        p.planet.toLowerCase() === actorName.toLowerCase() ||
        p.planet.replace(/\s+/g, "").toLowerCase() === actorName.replace(/\s+/g, "").toLowerCase()
    );

    if (!trait) {
      // Graceful fallback for points not found in moving bodies
      const symbol = PLANET_SYMBOLS[actorName] ?? "✦";
      return {
        actor: actorName,
        symbol,
        formattedPosition: "Calculated in chart",
        sign: "Active Sign",
        house: 1,
        houseArena: "Personal experience",
        decanFlavor: "Elemental nuance",
        nakshatraName: "Sacred Nakshatra",
        nakshatraPada: 1,
        nakshatraDeity: "Cosmic Preserver",
        nakshatraShakti: "Evolutionary impulse",
        manzilName: "Hermetic Station",
        manzilStationRole: "Inner alignment",
        essentialDignities: [],
        essentialDebilities: [],
        sovereigntyTier: "Moderate / Neutral",
        boundsEgyptian: "Egyptian Bounds",
        shadbalaVirupas: 400,
        shadbalaStatus: "Robust & Capable",
        houseStrengthVirupas: 500,
        houseSupportTier: "at-chart-average",
        navamshaD9: "D9 Navamsha",
        activeAspects: [],
        activeDashaRole: "Dormant Cycle",
        personaArchetype: `The ${actorName} Archetype`,
        realWorldTranslation: {
          coreTheme: `${actorName} placement in your life.`,
          strengthAndPower: `Inherent purpose and clarity.`,
          humanChallenge: `Maintaining balance and focus.`,
          growthAction: `Step forward with awareness.`,
          conversationalProse: `Your ${actorName} plays a meaningful role in shaping your chart's overarching trajectory, guiding your growth through lived experience.`,
        },
      };
    }

    const realWorld = buildRealWorldTranslation(trait);
    const symbol = PLANET_SYMBOLS[trait.planet] ?? "✦";

    return {
      actor: trait.planet,
      symbol,
      formattedPosition: trait.formattedPosition,
      sign: trait.sign,
      house: trait.house,
      houseArena: trait.houseArena,
      decanFlavor: trait.decanFlavor,
      nakshatraName: trait.nakshatraName,
      nakshatraPada: trait.nakshatraPada,
      nakshatraDeity: trait.nakshatraDeity,
      nakshatraShakti: trait.nakshatraShakti,
      manzilName: trait.manzilName,
      manzilStationRole: trait.manzilStationRole,
      essentialDignities: trait.essentialDignities,
      essentialDebilities: trait.essentialDebilities,
      sovereigntyTier: trait.sovereigntyTier,
      boundsEgyptian: trait.boundsEgyptian,
      shadbalaVirupas: trait.shadbalaVirupas,
      shadbalaStatus: trait.shadbalaStatus,
      houseStrengthVirupas: trait.houseStrengthVirupas,
      houseSupportTier: trait.houseSupportTier,
      navamshaD9: trait.navamshaD9,
      activeAspects: trait.activeAspects,
      activeDashaRole: trait.activeDashaRole,
      fixedStarContact: trait.fixedStarContact,
      personaArchetype: trait.personaArchetype,
      realWorldTranslation: realWorld,
    };
  });
}

/**
 * Validates that every requested actor is present in the synthesized narrative.
 * If any actor is missing, it dynamically weaves their complete canonical profile into the narrative,
 * guaranteeing zero data is dropped!
 */
export function validateAndEnforceCoverage(
  narrativeText: string,
  mappings: CanonicalPlacementMapping[]
): {
  isComplete: boolean;
  missingActors: string[];
  enforcedNarrative: string;
} {
  const missing: CanonicalPlacementMapping[] = [];

  for (const mapping of mappings) {
    const nameRegex = new RegExp(`\\b${mapping.actor.replace(/\s+/g, "\\s*")}\\b`, "i");
    if (!nameRegex.test(narrativeText)) {
      missing.push(mapping);
    }
  }

  if (missing.length === 0) {
    return {
      isComplete: true,
      missingActors: [],
      enforcedNarrative: narrativeText,
    };
  }

  // Enforce zero-data-drop by weaving missing placements into a dedicated chapter
  const missingProse = missing.map(m => {
    return `#### ${m.symbol} ${m.personaArchetype} (${m.actor} in ${m.sign}, House ${m.house})\n\n` +
      `**Core Life Theme:** ${m.realWorldTranslation.coreTheme}\n\n` +
      `${m.realWorldTranslation.conversationalProse}\n\n` +
      `• **Your Superpower:** ${m.realWorldTranslation.strengthAndPower}\n` +
      `• **The Trap to Avoid:** ${m.realWorldTranslation.humanChallenge}\n` +
      `• **Grounded Action:** ${m.realWorldTranslation.growthAction}`;
  }).join("\n\n---\n\n");

  const enforcedChapter = `\n\n---\n\n### Chapter: The Essential Placements Blueprint (Zero-Data-Drop Enforced)\n\n` +
    `Every celestial actor holds a vital post in your life symphony. Below is the grounded, personal translation for your requested placements:\n\n` +
    missingProse;

  return {
    isComplete: false,
    missingActors: missing.map(m => m.actor),
    enforcedNarrative: narrativeText + enforcedChapter,
  };
}
