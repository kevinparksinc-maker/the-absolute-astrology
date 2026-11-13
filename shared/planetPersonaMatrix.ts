import { aspectBetween, type ChartResult, type ChartRow } from "../server/astronomy";
import { placementRows } from "./placementMiniReadings";
import { retrievePlacementDossier } from "../server/astrologyKnowledge/canon/retriever";
import { calculateVedicStrength } from "../server/astrologyKnowledge/vedic/strength";
import { evaluateVedicJyotishSystem } from "../server/astrologyKnowledge/canon/vedicJyotishCanon";
import { EGYPTIAN_BOUNDS_TABLE } from "../server/astrologyKnowledge/canon/dignitiesAndHorary";
import { normalizeLongitude, ZODIAC_SIGNS } from "./hybrid";

export type PlanetPersonaTrait = {
  planet: string;
  display: string;
  sign: string;
  degreeInSign: number;
  formattedPosition: string;
  house: number;
  houseArena: string;
  houseStrengthVirupas: number;
  houseSupportTier: "above-chart-average" | "below-chart-average" | "at-chart-average";
  decanNumber: number;
  decanSubRuler: string;
  decanFlavor: string;
  chaldeanFaceRuler: string;
  nakshatraName: string;
  nakshatraPada: number;
  nakshatraDeity: string;
  nakshatraShakti: string;
  manzilName: string;
  manzilEnglish: string;
  manzilStationRole: string;
  essentialDignities: string[];
  essentialDebilities: string[];
  sovereigntyTier: "High Sovereignty / Exalted / Domicile" | "Moderate / Neutral" | "Friction / Debility";
  boundsEgyptian: string;
  navamshaD9: string;
  shadbalaVirupas: number;
  shadbalaAdequacyRatio: number;
  shadbalaStatus: "Robust & Capable" | "Strained / Strategic";
  activeAspects: string[];
  activeDashaRole: string;
  fixedStarContact?: string;
  godFrameArchetype: string;
  agentFrameLived: string;
  personaArchetype: string;
  charismaProfile: string;
};

const HOUSE_ARENAS: Record<number, string> = {
  1: "Identity, physical vitality, primary life presence, personal autonomy",
  2: "Sustenance, tangible wealth, personal resources, earned security",
  3: "Immediate communication, craft, local connections, tactical agility",
  4: "Ancestral roots, emotional sanctuary, home foundations, private life",
  5: "Creative offspring, sovereignty, artistic joy, deliberate romance",
  6: "Daily discipline, labor, bodily health, crisis management",
  7: "The Other, public contracts, intimate mirrors, open partners",
  8: "Shared assets, crisis transformation, deep psychology, inheritance",
  9: "Higher wisdom, sacred philosophy, long pilgrimages, divine law",
  10: "Public authority, executive career, legacy, civic standing",
  11: "Community alliances, patronage, future ideals, shared gains",
  12: "Inner retreats, solitary contemplation, unseen currents, transcendent surrender",
};

const PLANET_ARCHETYPE_TITLES: Record<string, string> = {
  Sun: "The Sovereign Beacon",
  Moon: "The Instinctual Sanctuary",
  Mercury: "The Strategic Architect",
  Venus: "The Harmonizing Alchemist",
  Mars: "The Sovereign Blade",
  Jupiter: "The Cosmopolitan Sage",
  Saturn: "The Bastion of Endurance",
  Uranus: "The Awakener & Lightning Rod",
  Neptune: "The Transcendent Mystic",
  Pluto: "The Underworld Transformer",
  Ascendant: "The Primal Helm & Physical Dawn",
  Descendant: "The Sacred Mirror & Contract Partner",
  NorthNode: "The Evolutionary Horizon (Rahu)",
  "North Node": "The Evolutionary Horizon (Rahu)",
  SouthNode: "The Ancestral Crucible (Ketu)",
  "South Node": "The Ancestral Crucible (Ketu)",
};

function getEgyptianBound(sign: string, degInSign: number): string {
  const table = EGYPTIAN_BOUNDS_TABLE[sign] ?? [];
  for (const [limit, ruler] of table) {
    if (degInSign < limit) return `${ruler} Bounds`;
  }
  return "Saturn Bounds";
}

/**
 * Generates an integrated, charismatic personality narrative uniting the 7+ methods.
 * Gives the planet distinct charisma and pinpoint psychological reality.
 */
function generateCharismaProfile(trait: Omit<PlanetPersonaTrait, "charismaProfile">): string {
  const dignityPhrase = trait.essentialDignities.length
    ? `standing with sovereign ${trait.essentialDignities.join(", ")} authority`
    : trait.essentialDebilities.length
    ? `operating with high-friction, strategic tension via ${trait.essentialDebilities.join(", ")}`
    : "operating as a neutral, discerning mediator";

  const virupaPhrase = trait.shadbalaStatus === "Robust & Capable"
    ? `backed by robust operational capacity (${trait.shadbalaVirupas} virupas, ${(trait.shadbalaAdequacyRatio * 100).toFixed(0)}% adequacy)`
    : `requiring conscious cultivation and tactical patience (${trait.shadbalaVirupas} virupas, ${(trait.shadbalaAdequacyRatio * 100).toFixed(0)}% adequacy)`;

  const aspectSummary = trait.activeAspects.length
    ? `Directly in dialogue through ${trait.activeAspects.slice(0, 2).join(" and ")}.`
    : "Standing relatively unhindered, broadcasting its archetype with raw independence.";

  return `${trait.personaArchetype} commands House ${trait.house} (${trait.houseArena}), ${dignityPhrase}. Infused with the sub-elemental flavor of ${trait.decanFlavor} and regulated by ${trait.boundsEgyptian}, its emotional pulse is governed by Nakshatra ${trait.nakshatraName} (Deity: ${trait.nakshatraDeity}; Shakti: ${trait.nakshatraShakti}) and anchored in the Hermetic station of ${trait.manzilName}. In real-world manifestation, it is ${virupaPhrase}, while receiving ${trait.houseSupportTier} environmental support from its house sector. ${aspectSummary} Soul-level evolution is channeled through its Navamsha D9 in ${trait.navamshaD9}.`;
}

/**
 * Builds the canonical Planet Personality Matrix for every body in the chart.
 * Assembles all 7+ foundational methods into an Excel-ready grid and charismatic character profile.
 */
export function buildPlanetPersonaMatrix(chart: ChartResult): PlanetPersonaTrait[] {
  const sun = chart.movingBodies.find(p => p.name === "Sun");
  const isDayChart = Boolean(sun && sun.house >= 7);

  let vedicStrength: ReturnType<typeof calculateVedicStrength> | null = null;
  try {
    vedicStrength = calculateVedicStrength(chart);
  } catch {
    /* Optional fallback */
  }

  let vedicSystem: ReturnType<typeof evaluateVedicJyotishSystem> | null = null;
  try {
    vedicSystem = evaluateVedicJyotishSystem(chart);
  } catch {
    /* Optional fallback */
  }

  const rows = placementRows(chart);

  return rows.map((row): PlanetPersonaTrait => {
    const dossier = retrievePlacementDossier(row, chart, isDayChart);
    const norm = normalizeLongitude(row.longitude);
    const sign = ZODIAC_SIGNS[Math.floor(norm / 30)] || "Aries";
    const degInSign = Number((norm % 30).toFixed(2));
    const houseArena = HOUSE_ARENAS[row.house] ?? `House ${row.house} field of experience`;

    const decanSubRuler = dossier.decanRecord?.triplicitySubRuler ?? "itself";
    const decanNumber = dossier.decanRecord?.decanNumber ?? 1;
    const decanFlavor = dossier.decanRecord
      ? `${dossier.decanRecord.triplicitySubRuler} flavor: Decan ${decanNumber} (${dossier.decanRecord.sign} triplicity) — ${dossier.decanRecord.traditionalTitle}`
      : "Pure sign expression";
    const chaldeanFaceRuler = dossier.decanRecord?.chaldeanFaceRuler ?? decanSubRuler;

    const boundsEgyptian = getEgyptianBound(sign, degInSign);

    const nakshatraName = dossier.nakshatraRecord?.name ?? "Unknown Nakshatra";
    const nakshatraPada = dossier.activePada?.pada ?? 1;
    const nakshatraDeity = dossier.nakshatraRecord?.deity ?? "Cosmic Preserver";
    const nakshatraShakti = dossier.nakshatraRecord?.shakti || (dossier.nakshatraRecord ? `Governed by ${dossier.nakshatraRecord.vimshottariRuler}` : "Cosmic Shakti");

    const manzilName = dossier.manzilRecord?.name ?? "Unknown Manzil";
    const manzilEnglish = dossier.manzilRecord?.englishTranslation ?? "";
    const manzilStationRole = dossier.manzilRecord?.natalAndPsychologicalMeaning || dossier.manzilRecord?.englishTranslation || `Hermetic station of ${manzilName}`;

    const essentialDignities = dossier.dignityAndCondition.essentialDignities ?? [];
    const essentialDebilities = dossier.dignityAndCondition.essentialDebilities ?? [];

    let sovereigntyTier: PlanetPersonaTrait["sovereigntyTier"] = "Moderate / Neutral";
    if (essentialDignities.some(d => /domicile|exalt/i.test(d))) {
      sovereigntyTier = "High Sovereignty / Exalted / Domicile";
    } else if (essentialDebilities.some(d => /fall|detriment/i.test(d))) {
      sovereigntyTier = "Friction / Debility";
    }

    const planetStrength = vedicStrength?.planets.find(p => p.body === row.name);
    const shadbalaVirupas = planetStrength ? Math.round(planetStrength.totalVirupas) : 400;
    const shadbalaAdequacyRatio = planetStrength ? Number(planetStrength.adequacyRatio.toFixed(2)) : 1.0;
    const shadbalaStatus: PlanetPersonaTrait["shadbalaStatus"] = shadbalaAdequacyRatio >= 1.0
      ? "Robust & Capable"
      : "Strained / Strategic";

    const houseStrength = vedicStrength?.houses.find(h => h.house === row.house);
    const houseStrengthVirupas = houseStrength ? Math.round(houseStrength.totalVirupas) : 500;
    const houseSupportTier = (houseStrength?.relativeSupport || "at-chart-average") as PlanetPersonaTrait["houseSupportTier"];

    const navamshaD9 = dossier.activePada
      ? `${dossier.activePada.navamshaSign} (Ruler: ${dossier.activePada.navamshaRuler})`
      : "Unassigned";

    // Geometric aspects involving this placement
    const activeAspects: string[] = rows
      .filter(other => other.name !== row.name)
      .map(other => {
        const contact = aspectBetween(row.longitude, other.longitude);
        if (contact && contact.orb <= 5) {
          return `${contact.aspect.charAt(0).toUpperCase() + contact.aspect.slice(1)} ${other.name} (${contact.orb.toFixed(2)}° orb)`;
        }
        return null;
      })
      .filter((a): a is string => Boolean(a));

    // Dasha timing role
    let activeDashaRole = "Dormant Cycle";
    if (vedicSystem?.vimshottariDasha) {
      const v = vedicSystem.vimshottariDasha;
      if (v.currentActiveMahadasha && v.currentActiveMahadasha.toLowerCase() === row.name.toLowerCase()) {
        activeDashaRole = `Current Mahadasha Lord (${v.currentActiveMahadasha} Cycle)`;
      } else if (v.currentActiveAntardasha && v.currentActiveAntardasha.toLowerCase() === row.name.toLowerCase()) {
        activeDashaRole = `Active Antardasha Sub-Lord (${v.currentActiveAntardasha})`;
      } else if (v.startingMahadashaLord && v.startingMahadashaLord.toLowerCase() === row.name.toLowerCase()) {
        activeDashaRole = `Birth Mahadasha Lord`;
      }
    }

    const fixedStarContact = dossier.fixedStarContacts.length > 0
      ? dossier.fixedStarContacts.map(fc => `${fc.star.name} (${fc.orbDeg.toFixed(2)}° orb)${fc.star.isRoyalStar ? " [Royal Watcher Star]" : ""}`).join("; ")
      : undefined;

    const godFrameArchetype = `${row.name} in ${sign}: Sovereign Cosmic Principle`;
    const agentFrameLived = dossier.godToAgentNote || dossier.planetInHouseKnowledge?.core || dossier.planetInHouseSynthesis;
    const personaArchetype = PLANET_ARCHETYPE_TITLES[row.name] ?? `The ${row.name} Sovereign`;

    const partialTrait = {
      planet: row.name,
      display: row.display,
      sign,
      degreeInSign: degInSign,
      formattedPosition: row.display,
      house: row.house,
      houseArena,
      houseStrengthVirupas,
      houseSupportTier,
      decanNumber,
      decanSubRuler,
      decanFlavor,
      chaldeanFaceRuler,
      nakshatraName,
      nakshatraPada,
      nakshatraDeity,
      nakshatraShakti,
      manzilName,
      manzilEnglish,
      manzilStationRole,
      essentialDignities,
      essentialDebilities,
      sovereigntyTier,
      boundsEgyptian,
      navamshaD9,
      shadbalaVirupas,
      shadbalaAdequacyRatio,
      shadbalaStatus,
      activeAspects,
      activeDashaRole,
      fixedStarContact,
      godFrameArchetype,
      agentFrameLived,
      personaArchetype,
    };

    const charismaProfile = generateCharismaProfile(partialTrait);

    return {
      ...partialTrait,
      charismaProfile,
    };
  });
}

