import { NAKSHATRAS, normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import type { ChartResult, ChartRow } from "../../astronomy";
import { PLANET_CANON_RECORDS, SIGN_CANON_RECORDS } from "./planetsAndSigns";
import type {
  DetectedVedicYoga,
  ProvenanceRecord,
  VedicAyanamsaMode,
  VedicStrengthAndPanchangaSummary,
  VedicVargaDoctrineRecord,
  VedicYogaCanonRecord,
} from "./types";

/**
 * Compute approximate Lahiri (Chitrapaksha) or Raman Ayanamsa for a given Julian Day / UTC date,
 * while preserving Firmament's 0° Aries Tropical Hybrid mode (0° offset) as the default hybrid lock.
 */
export function calculateAyanamsaDegrees(
  utcIso: string,
  mode: VedicAyanamsaMode
): number {
  if (mode === "firmament-tropical-hybrid") return 0;
  const year = utcIso ? new Date(utcIso).getUTCFullYear() : 2000;
  const effectiveYear = Number.isFinite(year) ? year : 2000;
  // Mean Lahiri at J2000.0 is ~23.856° with precession rate ~50.29"/yr (0.01397°/yr)
  const lahiri = 23.856 + (effectiveYear - 2000) * 0.01397;
  if (mode === "classical-sidereal-raman") {
    return Number((lahiri - 1.44).toFixed(4));
  }
  return Number(lahiri.toFixed(4));
}

export function toVedicLongitude(
  tropicalLongitude: number,
  utcIso: string,
  mode: VedicAyanamsaMode
): number {
  const offset = calculateAyanamsaDegrees(utcIso, mode);
  return normalizeLongitude(tropicalLongitude - offset);
}

/**
 * Complete Shodashavarga / Divisional Chart Interpretation Doctrine (D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D60)
 */
export const VEDIC_VARGA_DOCTRINE_RECORDS: Record<
  VedicVargaDoctrineRecord["code"],
  VedicVargaDoctrineRecord
> = {
  D1: {
    code: "D1",
    sanskritName: "Rashi (Root Natal Chart)",
    divisionCount: 1,
    primaryDomain: "Physical body, concrete life circumstances, and primary macro-structure",
    whenToConsult: "Always consulted first as the root tree (Sthula) from which all divisional fruits hang.",
    evaluationRule: "Evaluate Lagna (Ascendant), house lords, kendra/trikona relationships, and planetary dignity.",
    relationToD1Rashi: "Root reference chart; no divisional chart can completely invent a promise absent in D1, though D9 can elevate or undercut D1 dignity.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra (BPHS) Ch. 6–7",
      epistemicCategory: "TRADITION",
    },
  },
  D2: {
    code: "D2",
    sanskritName: "Hora",
    divisionCount: 2,
    primaryDomain: "Wealth, liquid sustenance, family resources, and speech",
    whenToConsult: "When assessing financial resilience, livelihood stability, and 2nd/11th house Dhana promises.",
    evaluationRule: "Parashari Hora divides each 30° sign into two 15° halves ruled by the Sun (Simha/Leo) and Moon (Karka/Cancer): odd signs 0°–15° = Sun, 15°–30° = Moon; even signs 0°–15° = Moon, 15°–30° = Sun.",
    relationToD1Rashi: "Qualifies whether D1 financial combinations produce steady tangible accumulation or fluctuating effort.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D3: {
    code: "D3",
    sanskritName: "Drekkana",
    divisionCount: 3,
    primaryDomain: "Courage (Parakrama), siblings, allies, initiative, and co-born support",
    whenToConsult: "When evaluating 3rd-house enterprise, risk tolerance, siblings, and hands-on execution.",
    evaluationRule: "Each sign is divided into three 10° parts: 0°–10° maps to the same sign (1st), 10°–20° to the 5th sign from it, and 20°–30° to the 9th sign from it (Parashari elemental trine mapping).",
    relationToD1Rashi: "Shows whether Mars and the 3rd lord in D1 have the stamina to execute under pressure.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6; Varahamihira, Brihat Jataka",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote: "Distinct from Western/Hellenistic Chaldean Face decans; Parashari Drekkana maps by elemental trines (1st, 5th, 9th).",
    },
  },
  D4: {
    code: "D4",
    sanskritName: "Chaturthamsha (Turyamsha)",
    divisionCount: 4,
    primaryDomain: "Fixed assets, landed property, home sanctuary, emotional grounding (Sukha), and fortune",
    whenToConsult: "When evaluating real estate, relocation, domestic peace, and 4th-house foundations.",
    evaluationRule: "Four 7°30′ segments per sign mapping to the 1st, 4th, 7th, and 10th signs (Kendras) from the base sign.",
    relationToD1Rashi: "Confirms whether D1 4th-house and Moon/Venus indicators yield lasting domestic peace and property.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D7: {
    code: "D7",
    sanskritName: "Saptamsha",
    divisionCount: 7,
    primaryDomain: "Progeny, children, creative legacy, and generative fruitfulness",
    whenToConsult: "When examining 5th-house matters, children, disciples, or long-term creative offspring.",
    evaluationRule: "Seven 4°17′08″ segments per sign; for odd signs counting starts from the sign itself, for even signs from the 7th sign opposite.",
    relationToD1Rashi: "Tests the fertility and continuity of D1 5th-house and Jupiter significations.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D9: {
    code: "D9",
    sanskritName: "Navamsha (Dharmamsha)",
    divisionCount: 9,
    primaryDomain: "Marriage/partnership covenant, inner dharma, spiritual fruit, and true underlying strength of planets",
    whenToConsult: "Mandatory in all readings alongside D1: reveals the fruit on the D1 tree, marriage quality, and second-half-of-life maturation.",
    evaluationRule: "Nine 3°20′ segments per sign (identical to the 108 Nakshatra Padas): Fire signs start at Aries, Earth at Capricorn, Air at Libra, Water at Cancer. A planet in the same sign in D1 and D9 is Vargottama (supreme reinforcement).",
    relationToD1Rashi: "If a planet is exalted in D1 but debilitated (Neecha) in D9, its outer promise loses inner stamina over time; if debilitated in D1 but exalted/own-sign in D9, early struggle matures into high competence.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6–8; Jaimini Upadesha Sutras",
      epistemicCategory: "TRADITION",
    },
  },
  D10: {
    code: "D10",
    sanskritName: "Dashamsha (Karmamsha)",
    divisionCount: 10,
    primaryDomain: "Career, public authority, vocation (Karma), social impact, and status",
    whenToConsult: "Whenever career, leadership, vocation, or 10th-house execution is examined.",
    evaluationRule: "Ten 3°00′ segments per sign: odd signs count from the sign itself; even signs count from the 9th sign from it.",
    relationToD1Rashi: "Distinguishes between mere job activity in D1 and enduring vocational authority in D10.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D12: {
    code: "D12",
    sanskritName: "Dwadashamsha",
    divisionCount: 12,
    primaryDomain: "Parents, ancestral lineage, inherited family conditioning, and karmic continuity",
    whenToConsult: "When examining parental relationships, family-of-origin imprints, and Sun/Moon ancestral roots.",
    evaluationRule: "Twelve 2°30′ segments per sign counting sequentially from the sign itself.",
    relationToD1Rashi: "Illuminates the ancestral and parental backdrop behind the D1 4th, 9th, and 10th houses.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D16: {
    code: "D16",
    sanskritName: "Shodashamsha (Kalamsha)",
    divisionCount: 16,
    primaryDomain: "Vehicles, emotional contentment, luxuries, and deeper inner happiness/grief",
    whenToConsult: "When examining 4th-house emotional comfort, conveyances, and Venus/Moon pleasures.",
    evaluationRule: "Sixteen 1°52′30″ divisions starting from Aries (Movable), Leo (Fixed), or Sagittarius (Dual).",
    relationToD1Rashi: "Deepens D4 analysis by testing emotional satisfaction inside material comfort.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D20: {
    code: "D20",
    sanskritName: "Vimshamsha",
    divisionCount: 20,
    primaryDomain: "Spiritual practice (Upasana), devotion, meditation, and grace",
    whenToConsult: "When examining spiritual dedication, mantra/meditation inclination, and 5th/9th/12th spiritual themes.",
    evaluationRule: "Twenty 1°30′ divisions starting from Aries (Movable), Sagittarius (Fixed), or Leo (Dual).",
    relationToD1Rashi: "Shows how the native metabolizes existential questions into contemplative practice.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D24: {
    code: "D24",
    sanskritName: "Chaturvimshamsha (Siddhamsha)",
    divisionCount: 24,
    primaryDomain: "Higher learning, scholarship, mastery of sacred or technical knowledge (Vidya)",
    whenToConsult: "When evaluating education, research, intellectual mastery, and Mercury/Jupiter learning.",
    evaluationRule: "Twenty-four 1°15′ divisions starting from Leo (odd signs) or Cancer (even signs).",
    relationToD1Rashi: "Reveals the depth of scholarship behind D1 4th, 5th, and 9th houses.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D27: {
    code: "D27",
    sanskritName: "Saptavimshamsha (Bhamsha / Nakshatramsha)",
    divisionCount: 27,
    primaryDomain: "Inherent physical/nervous stamina, subtle strengths, and vulnerabilities",
    whenToConsult: "When evaluating vitality, constitutional resilience, and subtle stress thresholds.",
    evaluationRule: "Twenty-seven 1°06′40″ segments aligned with the 12 signs by elemental starting points (Fire=Aries, Earth=Cancer, Air=Libra, Water=Capricorn).",
    relationToD1Rashi: "Tests the bodily stamina supporting D1 Ascendant and Sun/Moon.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  D30: {
    code: "D30",
    sanskritName: "Trimshamsha",
    divisionCount: 30,
    primaryDomain: "Adversity, vulnerabilities, moral tests (Arishta), and crisis resilience",
    whenToConsult: "When examining 6th/8th/12th house pressures, health vulnerabilities, or shadow tests.",
    evaluationRule: "Unequal planetary segments in odd/even signs ruled by Mars, Saturn, Jupiter, Mercury, and Venus (closely parallel in structure to Hellenistic/Egyptian bounds, excluding luminaries).",
    relationToD1Rashi: "Pinpoints where a D1 placement faces its sharpest karmic test or crisis.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6; Varahamihira, Brihat Jataka",
      epistemicCategory: "TRADITION",
    },
  },
  D60: {
    code: "D60",
    sanskritName: "Shashtiamsha",
    divisionCount: 60,
    primaryDomain: "Root past-life karma (Sanchita/Prarabdha) and finest-grain differentiation (0°30′ arc)",
    whenToConsult: "Only when birth time is rectified to the minute; carries the highest weight in Parashara's Shodashavarga Vimshopaka Bala.",
    evaluationRule: "Sixty 0°30′ segments per sign; highly sensitive to exact birth-time precision.",
    relationToD1Rashi: "Uncertain unless birth time is exact to within 1–2 minutes.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 6–7",
      epistemicCategory: "TRADITION",
    },
  },
};

/**
 * Classical Vedic Yogas & Cancellation (Bhanga) Canon
 */
export const VEDIC_YOGA_CANON_RECORDS: Record<string, VedicYogaCanonRecord> = {
  "dharma-karmadhipati-raja-yoga": {
    id: "dharma-karmadhipati-raja-yoga",
    name: "Dharma-Karmadhipati Raja Yoga (9th & 10th Lord Union)",
    category: "raja-yoga",
    formationRule:
      "The lord of a Kendra (1, 4, 7, 10—especially the 10th house of Karma) joins, mutually aspects, or exchanges signs (Parivartana) with the lord of a Trikona (1, 5, 9—especially the 9th house of Dharma).",
    requiredConditions: [
      "Clear Kendra (1/4/7/10) and Trikona (1/5/9) lordship from the Ascendant",
      "Conjunction in the same sign, mutual aspect, or Parivartana (mutual reception) between the two lords",
    ],
    exceptionsAndBhanga: [
      "Raja Yoga Bhanga occurs if either lord is deeply combust, in uncancelled debilitation (Neecha without Neecha Bhanga), or simultaneously rules a Dusthana (6th, 8th, 12th) without neutralizing support.",
    ],
    classicalMeaning:
      "Elevates the native to leadership, meaningful public stewardship, and purposeful achievement where inner principle (Trikona) aligns with outer vocation (Kendra).",
    humanRealityManifestation:
      "[MODERN_SYNTHESIS] You do your best work when your career isn't just a paycheck—when your public role (Kendra) is directly backed by your personal ethics and long-term purpose (Trikona).",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 39–41; Phaladeepika",
      epistemicCategory: "TRADITION",
    },
  },
  "dhana-yoga": {
    id: "dhana-yoga",
    name: "Classical Dhana Yoga (Wealth & Resource Convergence)",
    category: "dhana-yoga",
    formationRule:
      "Connection (conjunction, mutual aspect, or sign exchange) between the lords of the 2nd, 5th, 9th, and 11th houses, or their strong connection with the 1st lord, Jupiter, or Venus.",
    requiredConditions: [
      "Involvement of at least two wealth/fortune houses (2nd = accumulated resources, 11th = gains/networks, 5th = intelligence/merit, 9th = fortune/bhagya)",
    ],
    exceptionsAndBhanga: [
      "Kemadruma or severe affliction by 6th/8th/12th lords without reception introduces cycles of financial leakage or rebuilding before stability.",
    ],
    classicalMeaning:
      "Capacity to generate, steward, and multiply material and intellectual resources.",
    humanRealityManifestation:
      "[MODERN_SYNTHESIS] Resourcefulness that links what you value (2nd) with your wider network and long-term vision (9th/11th).",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 41; Saravali",
      epistemicCategory: "TRADITION",
    },
  },
  "pancha-mahapurusha-yoga": {
    id: "pancha-mahapurusha-yoga",
    name: "Pancha Mahapurusha Yoga (Ruchaka, Bhadra, Hamsa, Malavya, Shasha)",
    category: "pancha-mahapurusha",
    formationRule:
      "One of the five non-luminary classical planets (Mars = Ruchaka, Mercury = Bhadra, Jupiter = Hamsa, Venus = Malavya, Saturn = Shasha) occupies its own domicile (Svakshetra) or exaltation (Uccha) in a Kendra (1st, 4th, 7th, or 10th house) from the Ascendant.",
    requiredConditions: [
      "Planet must be Mars, Mercury, Jupiter, Venus, or Saturn",
      "Must occupy its own sign or exaltation sign",
      "Must sit in House 1, 4, 7, or 10 from Lagna",
    ],
    exceptionsAndBhanga: [
      "Classical texts (Phaladeepika / Saravali) note that close conjunction with the Sun (combustion) or tight affliction by Rahu/Ketu modifies the yoga from effortless external status into an intense internal discipline.",
    ],
    classicalMeaning:
      "Marks an archetypal pillar of character: Ruchaka (martial courage/command), Bhadra (analytic mastery), Hamsa (moral/philosophical wisdom), Malavya (aesthetic/relational grace), or Shasha (structural authority and endurance).",
    humanRealityManifestation:
      "[MODERN_SYNTHESIS] A core planetary superpower sits right on one of the four main pillars of your life—people immediately feel this quality when they meet or work with you.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Varahamihira, Brihat Jataka; Mantreshwara, Phaladeepika Ch. 6",
      epistemicCategory: "TRADITION",
    },
  },
  "gaja-kesari-yoga": {
    id: "gaja-kesari-yoga",
    name: "Gaja Kesari Yoga (Jupiter in Kendra from the Moon)",
    category: "lunar-solar-yoga",
    formationRule:
      "Jupiter occupies a Kendra (1st, 4th, 7th, or 10th sign/house) counted from the Moon.",
    requiredConditions: [
      "Jupiter in 1st, 4th, 7th, or 10th sign from the Moon",
    ],
    exceptionsAndBhanga: [
      "Weakened or modified if Jupiter is in debilitation (Capricorn), combust, or if the Moon itself is severely afflicted without benefic aspect.",
    ],
    classicalMeaning:
      "Resilient reputation, emotional generosity, wise counsel, and protective grace during life crises ('like the lion facing the elephant').",
    humanRealityManifestation:
      "[MODERN_SYNTHESIS] Emotional intelligence backed by perspective: even when you feel stressed, you have a built-in philosophical compass that helps you regain dignity and counsel others.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 36; Phaladeepika",
      epistemicCategory: "TRADITION",
    },
  },
  "neecha-bhanga-raja-yoga": {
    id: "neecha-bhanga-raja-yoga",
    name: "Neecha Bhanga Raja Yoga (Cancellation of Debilitation)",
    category: "arista-or-cancellation",
    formationRule:
      "A planet in its fall/debilitation (Neecha) has its debilitation cancelled because (a) the domicile lord of that sign or the planet exalted in that sign sits in a Kendra from the Lagna or Moon, or (b) the debilitated planet is aspected by its dispositor or is exalted in Navamsha (D9).",
    requiredConditions: [
      "A classical planet occupies its sign of Fall (Neecha)",
      "The dispositor of that sign or the exaltation lord of that sign is in Kendra (1/4/7/10) from Ascendant or Moon, or receives the planet",
    ],
    exceptionsAndBhanga: [
      "Does not erase early-life sensitivity or initial struggle; rather, it converts early vulnerability into hard-won mastery.",
    ],
    classicalMeaning:
      "Cancellation of debilitation that transforms an initial weakness or outsider position into extraordinary resilience and authority.",
    humanRealityManifestation:
      "[MODERN_SYNTHESIS] The exact area where you once felt underestimated, under-resourced, or out of place becomes your sharpest competence because you had to learn it from the ground up.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Mantreshwara, Phaladeepika Ch. 7; Brihat Parashara Hora Shastra",
      epistemicCategory: "TRADITION",
    },
  },
};

/**
 * Jyotish Strength & Framework Doctrine (Shadbala, Bhava Bala, Ashtakavarga, Vimshopaka Bala, Graha Drishti, Avasthas, Panchanga)
 */
export const VEDIC_STRENGTH_AND_FRAMEWORK_DOCTRINE: Record<
  string,
  {
    name: string;
    whatItEstablishes: string;
    whatItCannotEstablishAlone: string;
    provenance: ProvenanceRecord;
  }
> = {
  shadbala: {
    name: "Shadbala (Sixfold Planetary Strength)",
    whatItEstablishes:
      "Measures a planet's quantitative horsepower across six axes: Sthana Bala (positional), Dig Bala (directional—Jupiter/Mercury in 1st, Sun/Mars in 10th, Saturn in 7th, Moon/Venus in 4th), Kala Bala (temporal/sect), Cheshta Bala (motional/retrograde), Naisargika Bala (natural brightness), and Drik Bala (aspectual).",
    whatItCannotEstablishAlone:
      "High Shadbala shows a planet acts forcefully, but does NOT tell you whether it is functionally benefic or malefic for a specific Ascendant, nor whether its house placement is auspicious.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 27; Sripathi Paddhati",
      epistemicCategory: "TRADITION",
    },
  },
  "bhava-bala": {
    name: "Bhava Bala (House Strength)",
    whatItEstablishes:
      "Evaluates the stability of a house container via Bhavadhipati Bala (strength of its lord), Bhava Digbala, and Bhava Drishti Bala.",
    whatItCannotEstablishAlone:
      "Cannot replace the timing of when that house is triggered by Dasha or transit.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 28",
      epistemicCategory: "TRADITION",
    },
  },
  ashtakavarga: {
    name: "Ashtakavarga (Eightfold Point Bindu Matrix)",
    whatItEstablishes:
      "Scores each sign from 0–8 bindus (benefic points) per planet and 0–56 in Sarvashtakavarga (SAV), showing how comfortable a transit or placement is in a given sign relative to all 7 planets + Lagna.",
    whatItCannotEstablishAlone:
      "High SAV (>30 bindus) cushions a house with environmental support, but cannot cancel a direct natal yoga or Dasha lordship.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 66–72; Varahamihira",
      epistemicCategory: "TRADITION",
    },
  },
  "vimshopaka-bala": {
    name: "Vimshopaka Bala (20-Point Divisional Dignity Composite)",
    whatItEstablishes:
      "Aggregates a planet's dignity across Shad-varga (6), Sapta-varga (7), Dasha-varga (10), or Shodasha-varga (16) divisional charts on a 20-point scale.",
    whatItCannotEstablishAlone:
      "Requires an exact birth time (especially when D60 is included); when birth time is approximate, D1 + D9 (Navamsha) carry primary interpretive authority.",
    provenance: {
      tradition: "vedic",
      sourceTitle: "Brihat Parashara Hora Shastra Ch. 7",
      epistemicCategory: "TRADITION",
    },
  },
};

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima / Amavasya",
];

const NITYA_YOGA_NAMES = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];

const VIMSHOTTARI_SEQUENCE: Array<{ lord: string; years: number }> = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 },
];

const VARA_INFO: Array<{ name: string; ruler: string; meaning: string }> = [
  { name: "Ravivara (Sunday)", ruler: "Sun", meaning: "Vitality, authority, dharma, and visible leadership." },
  { name: "Somavara (Monday)", ruler: "Moon", meaning: "Emotional attunement, receptivity, relational care, and adaptability." },
  { name: "Mangalavara (Tuesday)", ruler: "Mars", meaning: "Decisive action, courage, technical execution, and boundary defense." },
  { name: "Budhavara (Wednesday)", ruler: "Mercury", meaning: "Analytical discernment, synthesis, trade, and articulate communication." },
  { name: "Guruvara (Thursday)", ruler: "Jupiter", meaning: "Wisdom, teaching, ethical stewardship, and protective expansion." },
  { name: "Shukravara (Friday)", ruler: "Venus", meaning: "Relational harmony, artistic craft, diplomacy, and material grace." },
  { name: "Shanivara (Saturday)", ruler: "Saturn", meaning: "Endurance, structural realism, long-term duty, and mastery through time." },
];

/**
 * Evaluates the complete Jyotish interpretive system (Panchanga, Jaimini Chara Karakas, Arudha Lagna,
 * Navamsha D9 + Vargottama, Vimshottari Dasha, and Classical Yogas with Bhanga checks),
 * explicitly tracking whether Firmament Tropical Hybrid (0° Aries) or Classical Sidereal (Lahiri/Raman) is used.
 */
export function evaluateVedicJyotishSystem(
  chart: ChartResult,
  coordinateMode: VedicAyanamsaMode = "firmament-tropical-hybrid"
): VedicStrengthAndPanchangaSummary {
  const ayanamsaDegreesApplied = calculateAyanamsaDegrees(chart.utc, coordinateMode);
  const convert = (lon: number) => toVedicLongitude(lon, chart.utc, coordinateMode);

  const sunRow = chart.movingBodies.find(b => b.name === "Sun");
  const moonRow = chart.movingBodies.find(b => b.name === "Moon");
  const sunLon = sunRow ? convert(sunRow.longitude) : 0;
  const moonLon = moonRow ? convert(moonRow.longitude) : 0;

  // 1. Panchanga (Tithi, Vara, Nitya Yoga, Karana)
  const elongation = normalizeLongitude(moonLon - sunLon);
  const tithiIndex = Math.floor(elongation / 12) + 1; // 1..30
  const paksha: "Shukla (Waxing)" | "Krishna (Waning)" =
    tithiIndex <= 15 ? "Shukla (Waxing)" : "Krishna (Waning)";
  const tithiWithinPaksha = ((tithiIndex - 1) % 15);
  const tithiName =
    tithiIndex === 15
      ? "Purnima (Full Moon)"
      : tithiIndex === 30
        ? "Amavasya (New Moon)"
        : `${paksha.split(" ")[0]} ${TITHI_NAMES[tithiWithinPaksha]}`;
  const tithiRulers = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"];
  const tithiRuler = tithiRulers[(tithiIndex - 1) % 8];

  const utcDate = chart.utc ? new Date(chart.utc) : new Date();
  const dayOfWeek = Number.isFinite(utcDate.getUTCDay()) ? utcDate.getUTCDay() : 0;
  const vara = VARA_INFO[dayOfWeek];

  const yogaSum = normalizeLongitude(sunLon + moonLon);
  const yogaIndex = Math.floor(yogaSum / (360 / 27)) + 1;
  const yogaName = NITYA_YOGA_NAMES[(yogaIndex - 1) % 27];

  const karanaIndex = Math.floor(elongation / 6) + 1; // 1..60
  const movableKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)"];
  const karanaName =
    karanaIndex === 1
      ? "Kimstughna"
      : karanaIndex >= 58
        ? ["Shakuni", "Chatushpada", "Naga"][karanaIndex - 58] ?? "Naga"
        : movableKaranas[(karanaIndex - 2) % 7];

  // 2. Jaimini 7-Planet Chara Karakas (Sun..Saturn sorted by degree within sign descending)
  const classical7 = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const karakaRows = chart.movingBodies
    .filter(b => classical7.includes(b.name) && Number.isFinite(b.longitude))
    .map(b => {
      const vLon = convert(b.longitude);
      return {
        planet: b.name,
        degreeInSign: Number((vLon % 30).toFixed(2)),
      };
    })
    .sort((a, b) => b.degreeInSign - a.degreeInSign);

  const karakaLabels: Array<{
    karaka: VedicStrengthAndPanchangaSummary["charaKarakas"][number]["karaka"];
    signification: string;
  }> = [
    { karaka: "Atmakaraka (AK)", signification: "Soul significator: primary spiritual curriculum, deep integrity test, and inner king of the chart." },
    { karaka: "Amatyakaraka (AmK)", signification: "Minister & career counselor: how the soul executes its vocation and professional counsel." },
    { karaka: "Bhratrikaraka (BK)", signification: "Siblings, allies, mentors, and courageous initiative." },
    { karaka: "Matrikaraka (MK)", signification: "Mother, emotional sanctuary, nourishment, and domestic peace." },
    { karaka: "Putrakaraka (PK)", signification: "Creative intelligence, children, merit, and future legacy." },
    { karaka: "Gnatikaraka (GK)", signification: "Rivals, obstacles, acute diagnostic skill, and crisis mastery." },
    { karaka: "Darakaraka (DK)", signification: "Spouse, covenant partner, and what you magnetize in intimate partnership." },
  ];

  const charaKarakas = karakaRows.map((item, idx) => ({
    karaka: karakaLabels[idx]?.karaka ?? "Darakaraka (DK)",
    planet: item.planet,
    degreeInSign: item.degreeInSign,
    signification: karakaLabels[idx]?.signification ?? "",
  }));

  // 3. Arudha Lagna (AL) & Upapada Lagna (UL)
  const ascLon = chart.ascendant && Number.isFinite(chart.ascendant.longitude)
    ? convert(chart.ascendant.longitude)
    : 0;
  const lagnaSignIdx = Math.floor(ascLon / 30);
  const lagnaSign = ZODIAC_SIGNS[lagnaSignIdx];
  const lagnaLord = SIGN_CANON_RECORDS[lagnaSign]?.domicileLord ?? "Mars";
  const lagnaLordRow = chart.movingBodies.find(b => b.name === lagnaLord);
  const lagnaLordSignIdx = lagnaLordRow
    ? Math.floor(convert(lagnaLordRow.longitude) / 30)
    : lagnaSignIdx;

  const distFromLagnaToLord = (lagnaLordSignIdx - lagnaSignIdx + 12) % 12;
  let alSignIdx = (lagnaLordSignIdx + distFromLagnaToLord) % 12;
  // Classical Jaimini exception (Sutra 1.1.29): if AL falls in 1st or 7th from Lagna, shift by 10 signs
  const alOffsetFromLagna = (alSignIdx - lagnaSignIdx + 12) % 12;
  if (alOffsetFromLagna === 0 || alOffsetFromLagna === 6) {
    alSignIdx = (alSignIdx + 9) % 12; // 10th sign inclusive
  }
  const alSign = ZODIAC_SIGNS[alSignIdx];
  const alHouseFromLagna = ((alSignIdx - lagnaSignIdx + 12) % 12) + 1;

  // 12th house Upapada Lagna (UL) for marriage/partnership reality
  const twelfthSignIdx = (lagnaSignIdx + 11) % 12;
  const twelfthLord = SIGN_CANON_RECORDS[ZODIAC_SIGNS[twelfthSignIdx]]?.domicileLord ?? "Jupiter";
  const twelfthLordRow = chart.movingBodies.find(b => b.name === twelfthLord);
  const twelfthLordSignIdx = twelfthLordRow
    ? Math.floor(convert(twelfthLordRow.longitude) / 30)
    : twelfthSignIdx;
  const dist12 = (twelfthLordSignIdx - twelfthSignIdx + 12) % 12;
  let ulSignIdx = (twelfthLordSignIdx + dist12) % 12;
  const ulOffset = (ulSignIdx - twelfthSignIdx + 12) % 12;
  if (ulOffset === 0 || ulOffset === 6) {
    ulSignIdx = (ulSignIdx + 9) % 12;
  }
  const ulUpapadaSign = ZODIAC_SIGNS[ulSignIdx];

  // 4. Vimshottari Dasha Calculation from Moon's longitude
  const nakSpan = 360 / 27;
  const moonNakIdx = Math.floor(moonLon / nakSpan) % 27;
  const birthNakshatra = NAKSHATRAS[moonNakIdx];
  const fractionRemaining = 1 - (moonLon - moonNakIdx * nakSpan) / nakSpan;
  const startSeqIdx = moonNakIdx % 9;
  const startDash = VIMSHOTTARI_SEQUENCE[startSeqIdx];
  const balanceAtBirthYears = Number((startDash.years * fractionRemaining).toFixed(2));

  const birthTimeMs = chart.utc ? new Date(chart.utc).getTime() : NaN;
  const refTimeMs = chart.transitDate ? new Date(chart.transitDate).getTime() : Date.now();
  let currentActiveMahadasha: string | undefined;
  let currentActiveAntardasha: string | undefined;

  if (Number.isFinite(birthTimeMs) && refTimeMs >= birthTimeMs) {
    const ageYears = (refTimeMs - birthTimeMs) / (365.2425 * 86400 * 1000);
    let elapsed = 0;
    for (let step = 0; step < 18; step += 1) {
      const seq = VIMSHOTTARI_SEQUENCE[(startSeqIdx + step) % 9];
      const span = step === 0 ? balanceAtBirthYears : seq.years;
      if (ageYears <= elapsed + span) {
        currentActiveMahadasha = seq.lord;
        // Antardasha inside current Mahadasha
        const timeIntoMaha = step === 0 ? seq.years - balanceAtBirthYears + ageYears : ageYears - elapsed;
        let subElapsed = 0;
        const mahaIdx = (startSeqIdx + step) % 9;
        for (let sub = 0; sub < 9; sub += 1) {
          const subSeq = VIMSHOTTARI_SEQUENCE[(mahaIdx + sub) % 9];
          const subSpan = (seq.years * subSeq.years) / 120;
          if (timeIntoMaha <= subElapsed + subSpan) {
            currentActiveAntardasha = subSeq.lord;
            break;
          }
          subElapsed += subSpan;
        }
        break;
      }
      elapsed += span;
    }
  }

  // 5. Navamsha (D9) Placements & Vargottama Detection
  const padaSpan = 360 / 108; // 3.3333°
  const navamshaD9Placements = chart.movingBodies
    .filter(b => Number.isFinite(b.longitude))
    .map(b => {
      const vLon = convert(b.longitude);
      const d1Sign = ZODIAC_SIGNS[Math.floor(vLon / 30)];
      const globalPadaIdx = Math.floor(vLon / padaSpan) % 108;
      const d9Sign = ZODIAC_SIGNS[globalPadaIdx % 12];
      const isVargottama = d1Sign === d9Sign;
      const d9Ruler = SIGN_CANON_RECORDS[d9Sign]?.domicileLord ?? "Sun";
      return {
        body: b.name,
        d1Sign,
        d9Sign,
        isVargottama,
        d9Ruler,
        synthesis: isVargottama
          ? `${b.name} is VARGOTTAMA in ${d1Sign} (occupying ${d1Sign} in both D1 Rashi and D9 Navamsha): extraordinary internal consistency, durability, and alignment between outer action and inner dharma.`
          : `${b.name} in D1 ${d1Sign} matures into D9 Navamsha ${d9Sign} (ruled by ${d9Ruler}), coloring its deeper relational and second-half-of-life fruit with ${d9Sign} qualities.`,
      };
    });

  // 6. Classical Vedic Yogas & Cancellation (Bhanga) Detection
  const detectedYogas: DetectedVedicYoga[] = [];
  const signIdxOf = (name: string) => {
    const r = chart.movingBodies.find(b => b.name === name);
    return r ? Math.floor(convert(r.longitude) / 30) : -1;
  };
  const houseFromLagna = (signIdx: number) => ((signIdx - lagnaSignIdx + 12) % 12) + 1;

  // Check Gaja Kesari Yoga (Jupiter in 1, 4, 7, 10 from Moon)
  const jupSignIdx = signIdxOf("Jupiter");
  const moonSignIdx = signIdxOf("Moon");
  if (jupSignIdx >= 0 && moonSignIdx >= 0) {
    const distFromMoon = ((jupSignIdx - moonSignIdx + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(distFromMoon)) {
      const jupSign = ZODIAC_SIGNS[jupSignIdx];
      const isDebilitated = jupSign === "Capricorn";
      const isCombust =
        sunRow &&
        Math.min(
          Math.abs(convert(sunRow.longitude) - convert(chart.movingBodies.find(b => b.name === "Jupiter")!.longitude)),
          360 - Math.abs(convert(sunRow.longitude) - convert(chart.movingBodies.find(b => b.name === "Jupiter")!.longitude))
        ) <= 8.5;
      const status: DetectedVedicYoga["status"] =
        isDebilitated || isCombust ? "formed-modified" : "formed-strong";
      detectedYogas.push({
        yogaId: "gaja-kesari-yoga",
        name: "Gaja Kesari Yoga",
        category: "lunar-solar-yoga",
        involvedBodies: ["Jupiter", "Moon"],
        housesInvolved: [houseFromLagna(jupSignIdx), houseFromLagna(moonSignIdx)],
        status,
        classicalExplanation: `Jupiter in ${jupSign} occupies the ${distFromMoon}${distFromMoon === 1 ? "st" : distFromMoon === 4 ? "th" : distFromMoon === 7 ? "th" : "th"} Kendra from the Moon in ${ZODIAC_SIGNS[moonSignIdx]}.`,
        cancellationOrModificationNote:
          status === "formed-modified"
            ? `Modified by ${isDebilitated ? "Jupiter's fall in Capricorn" : "solar combustion"}: wisdom and protective counsel are earned through private testing rather than effortless ease.`
            : "Unimpeded Kendra alignment between Moon and Jupiter.",
        humanRealitySynthesis: VEDIC_YOGA_CANON_RECORDS["gaja-kesari-yoga"].humanRealityManifestation,
        coordinateFrame: coordinateMode,
        provenance: VEDIC_YOGA_CANON_RECORDS["gaja-kesari-yoga"].provenance,
      });
    }
  }

  // Check Pancha Mahapurusha Yogas (Mars, Mercury, Jupiter, Venus, Saturn in own/exaltation in Kendra 1/4/7/10)
  const mahapurushaMap: Record<string, string> = {
    Mars: "Ruchaka Mahapurusha Yoga",
    Mercury: "Bhadra Mahapurusha Yoga",
    Jupiter: "Hamsa Mahapurusha Yoga",
    Venus: "Malavya Mahapurusha Yoga",
    Saturn: "Shasha Mahapurusha Yoga",
  };
  for (const [pName, yogaTitle] of Object.entries(mahapurushaMap)) {
    const pSignIdx = signIdxOf(pName);
    if (pSignIdx < 0) continue;
    const h = houseFromLagna(pSignIdx);
    const pSign = ZODIAC_SIGNS[pSignIdx];
    const signRec = SIGN_CANON_RECORDS[pSign];
    const isOwnOrExalted =
      signRec?.domicileLord === pName || signRec?.exaltation?.planet === pName;
    if (isOwnOrExalted && [1, 4, 7, 10].includes(h)) {
      detectedYogas.push({
        yogaId: `pancha-mahapurusha-${pName.toLowerCase()}`,
        name: yogaTitle,
        category: "pancha-mahapurusha",
        involvedBodies: [pName],
        housesInvolved: [h],
        status: "formed-strong",
        classicalExplanation: `${pName} occupies ${pSign} (${signRec?.domicileLord === pName ? "Domicile / Svakshetra" : "Exaltation / Uccha"}) in Angular Kendra House ${h}.`,
        cancellationOrModificationNote:
          "Active Kendra Mahapurusha pillar; check solar distance for public vs. private expression.",
        humanRealitySynthesis: VEDIC_YOGA_CANON_RECORDS["pancha-mahapurusha-yoga"].humanRealityManifestation,
        coordinateFrame: coordinateMode,
        provenance: VEDIC_YOGA_CANON_RECORDS["pancha-mahapurusha-yoga"].provenance,
      });
    }
  }

  // Check Dharma-Karmadhipati Raja Yoga (9th & 10th lords conjoined or in mutual reception)
  const ninthSign = ZODIAC_SIGNS[(lagnaSignIdx + 8) % 12];
  const tenthSign = ZODIAC_SIGNS[(lagnaSignIdx + 9) % 12];
  const ninthLord = SIGN_CANON_RECORDS[ninthSign]?.domicileLord;
  const tenthLord = SIGN_CANON_RECORDS[tenthSign]?.domicileLord;
  if (ninthLord && tenthLord) {
    const s9 = signIdxOf(ninthLord);
    const s10 = signIdxOf(tenthLord);
    if (s9 >= 0 && s10 >= 0) {
      const sameSign = s9 === s10;
      const mutualAspect = Math.abs(s9 - s10) === 6;
      const parivartana =
        SIGN_CANON_RECORDS[ZODIAC_SIGNS[s9]]?.domicileLord === tenthLord &&
        SIGN_CANON_RECORDS[ZODIAC_SIGNS[s10]]?.domicileLord === ninthLord;
      if (sameSign || mutualAspect || parivartana) {
        detectedYogas.push({
          yogaId: "dharma-karmadhipati-raja-yoga",
          name: "Dharma-Karmadhipati Raja Yoga (9th & 10th Lords)",
          category: "raja-yoga",
          involvedBodies: Array.from(new Set([ninthLord, tenthLord])),
          housesInvolved: [9, 10, houseFromLagna(s9)],
          status: "formed-strong",
          classicalExplanation: `9th lord ${ninthLord} (${ninthSign}) and 10th lord ${tenthLord} (${tenthSign}) unite by ${parivartana ? "Parivartana (Mutual Reception)" : sameSign ? `conjunction in ${ZODIAC_SIGNS[s9]}` : "mutual 7th-sign aspect"}.`,
          cancellationOrModificationNote:
            "Links higher principle (9th) directly with vocational authority (10th).",
          humanRealitySynthesis:
            VEDIC_YOGA_CANON_RECORDS["dharma-karmadhipati-raja-yoga"].humanRealityManifestation,
          coordinateFrame: coordinateMode,
          provenance: VEDIC_YOGA_CANON_RECORDS["dharma-karmadhipati-raja-yoga"].provenance,
        });
      }
    }
  }

  // Check Neecha Bhanga Raja Yoga for any debilitated planet
  for (const pName of classical7) {
    const pSignIdx = signIdxOf(pName);
    if (pSignIdx < 0) continue;
    const pSign = ZODIAC_SIGNS[pSignIdx];
    const signRec = SIGN_CANON_RECORDS[pSign];
    if (signRec?.fall?.planet === pName) {
      const dispositor = signRec.domicileLord;
      const exaltLord = signRec.exaltation?.planet;
      const dispSignIdx = signIdxOf(dispositor);
      const exaltSignIdx = exaltLord ? signIdxOf(exaltLord) : -1;
      const dispInKendraFromLagnaOrMoon =
        dispSignIdx >= 0 &&
        ([1, 4, 7, 10].includes(houseFromLagna(dispSignIdx)) ||
          (moonSignIdx >= 0 && [0, 3, 6, 9].includes((dispSignIdx - moonSignIdx + 12) % 12)));
      const exaltInKendraFromLagnaOrMoon =
        exaltSignIdx >= 0 &&
        ([1, 4, 7, 10].includes(houseFromLagna(exaltSignIdx)) ||
          (moonSignIdx >= 0 && [0, 3, 6, 9].includes((exaltSignIdx - moonSignIdx + 12) % 12)));

      if (dispInKendraFromLagnaOrMoon || exaltInKendraFromLagnaOrMoon) {
        detectedYogas.push({
          yogaId: `neecha-bhanga-${pName.toLowerCase()}`,
          name: `Neecha Bhanga Raja Yoga (${pName} in ${pSign})`,
          category: "arista-or-cancellation",
          involvedBodies: [pName, dispositor, ...(exaltLord ? [exaltLord] : [])],
          housesInvolved: [houseFromLagna(pSignIdx)],
          status: "formed-strong",
          classicalExplanation: `${pName} is in fall (Neecha) in ${pSign}, but its debilitation is cancelled (Neecha Bhanga) because ${dispInKendraFromLagnaOrMoon ? `its dispositor ${dispositor}` : `its exaltation lord ${exaltLord}`} occupies an angular Kendra from the Ascendant or Moon.`,
          cancellationOrModificationNote:
            "Early sensitivity or non-traditional footing in this sphere converts into resilient mastery.",
          humanRealitySynthesis:
            VEDIC_YOGA_CANON_RECORDS["neecha-bhanga-raja-yoga"].humanRealityManifestation,
          coordinateFrame: coordinateMode,
          provenance: VEDIC_YOGA_CANON_RECORDS["neecha-bhanga-raja-yoga"].provenance,
        });
      }
    }
  }

  return {
    coordinateMode,
    ayanamsaDegreesApplied,
    panchanga: {
      tithi: {
        index: tithiIndex,
        name: tithiName,
        paksha,
        ruler: tithiRuler,
        meaning: `Lunar phase relationship (Moon–Sun elongation ${elongation.toFixed(1)}°, ruled by ${tithiRuler}): governs relationalglue, emotional stamina, and how intentions take form.`,
      },
      vara: {
        name: vara.name,
        ruler: vara.ruler,
        meaning: vara.meaning,
      },
      yoga: {
        index: yogaIndex,
        name: yogaName,
        meaning: `Luni-solar longitudinal sum (Sun + Moon = ${yogaSum.toFixed(1)}°): ${yogaName} shapes the background constitutional integration of solar purpose and lunar mind.`,
      },
      karana: {
        name: karanaName,
        meaning: `Half-tithi actional signature (${karanaName}): governs practical execution, work habits, and tangible completion.`,
      },
    },
    charaKarakas,
    arudhaLagnaview: {
      alSign,
      alHouseFromLagna,
      ulUpapadaSign,
      interpretation: `Arudha Lagna (AL — Maya/Public Mirror) falls in ${alSign} (House ${alHouseFromLagna} from Lagna), showing how your persona and status are perceived in the concrete world; Upapada Lagna (UL — Marriage/Covenant Padam) falls in ${ulUpapadaSign}, showing the lived reality of committed partnership.`,
    },
    vimshottariDasha: {
      birthNakshatra,
      startingMahadashaLord: startDash.lord,
      balanceAtBirthYears,
      currentActiveMahadasha,
      currentActiveAntardasha,
      interpretation: currentActiveMahadasha
        ? `Born in ${birthNakshatra} (${startDash.lord} Mahadasha balance ${balanceAtBirthYears} yrs). Active period: ${currentActiveMahadasha} Mahadasha / ${currentActiveAntardasha ?? startDash.lord} Antardasha—activating houses ruled and occupied by ${currentActiveMahadasha} and ${currentActiveAntardasha ?? startDash.lord}.`
        : `Born with Moon in ${birthNakshatra}, initiating life in ${startDash.lord} Mahadasha (${balanceAtBirthYears} yrs remaining at birth).`,
    },
    navamshaD9Placements,
    detectedYogas,
  };
}
