import {
  FIXED_STARS,
  formatLongitude,
  normalizeLongitude,
  ZODIAC_SIGNS,
} from "../../../shared/hybrid";
import type { ChartResult } from "../../astronomy";
import { HOUSE_CANON_RECORDS } from "./housesAndFrames";
import type { FixedStarCanonRecord, LotCanonRecord } from "./types";

const FIXED_STAR_DOCTRINE: Record<
  string,
  Omit<FixedStarCanonRecord, "name" | "firmamentLockedLongitude">
> = {
  Aldebaran: {
    isRoyalStar: true,
    watcherDirection: "East (Vernal)",
    constellation: "Alpha Tauri (The Bull's Southern Eye)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "First-magnitude red giant star (α Tauri) marking the eye of Taurus along the ecliptic.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (45.00°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Mars (with Venusian sub-tone in medieval lists)",
    traditionalMeaning:
      "Royal Star and Watcher of the East: grants high courage, executive prominence, and public stewardship when paired with strict moral integrity.",
    giftWhenIntegrated:
      "Uncompromising honesty, pioneering leadership, and capacity to stand firm under intense public pressure.",
    nemesisOrTest:
      "Cutting ethical corners for speed or power; rise followed by sudden reversal if integrity is compromised.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 45°00′ (Taurus 15°00′) in the Firmament Hybrid Zodiac; evaluated within a 5° Royal Star contact orb (tightest within 1°–2°).",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Royal Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle:
        "Ptolemy, Tetrabiblos I.9; Anonymous of 379; Brady, Fixed Stars (Royal Stars of Persia)",
      epistemicCategory: "TRADITION",
    },
  },

  Regulus: {
    isRoyalStar: true,
    watcherDirection: "North (Summer)",
    constellation: "Alpha Leonis (Cor Leonis — The Heart of the Lion)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "First-magnitude multiple star system (α Leonis) lying almost directly on the ecliptic plane (~0°27′ latitude).",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (135.00°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Mars and Jupiter",
    traditionalMeaning:
      "Royal Star and Watcher of the North (Cor Leonis): sovereignty, honors, nobility of spirit, and natural command.",
    giftWhenIntegrated:
      "Magnanimous authority, high visibility, and leadership that elevates rather than humiliates rivals.",
    nemesisOrTest:
      "Revenge, vindictiveness, or hubris; classical and Persian tradition warns that Regulus withdraws its crown the moment the native stoops to petty retaliation.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 135°00′ (Leo 15°00′) in the Firmament Hybrid Zodiac; evaluated within a 5° Royal Star contact orb (tightest within 1°–2°).",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Royal Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle:
        "Ptolemy, Tetrabiblos I.9; Rhetorius; Abu Ma'shar; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },

  Antares: {
    isRoyalStar: true,
    watcherDirection: "West (Autumnal)",
    constellation: "Alpha Scorpii (Cor Scorpii — The Heart of the Scorpion)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "First-magnitude red supergiant (α Scorpii) opposite Aldebaran across the ecliptic axis.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (225.0167°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Mars and Jupiter",
    traditionalMeaning:
      "Royal Star and Watcher of the West: strategic intensity, fearlessness in crisis, and deep transformative conviction.",
    giftWhenIntegrated:
      "Unflinching courage in high-stakes environments, strategic depth, and loyalty that does not flinch at life-and-death thresholds.",
    nemesisOrTest:
      "Obsession, destructive compulsion, or manufacturing crisis when life becomes quiet.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 225°01′ (Scorpio 15°01′) in the Firmament Hybrid Zodiac; evaluated within a 5° Royal Star contact orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Royal Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos I.9; Anonymous of 379; Robson",
      epistemicCategory: "TRADITION",
    },
  },

  Fomalhaut: {
    isRoyalStar: true,
    watcherDirection: "South (Winter)",
    constellation: "Alpha Piscis Austrini (The Mouth of the Southern Fish)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "First-magnitude star (α Piscis Austrini) receiving the stream of Aquarius.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (315.00°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Venus and Mercury",
    traditionalMeaning:
      "Royal Star and Watcher of the South: charismatic idealism, poetic/spiritual vision, and enduring cultural or artistic imprint.",
    giftWhenIntegrated:
      "Translating transcendent vision, beauty, or spiritual conviction into work that outlives the self.",
    nemesisOrTest:
      "Corrupting a pure ideal for personal vanity, or drifting into ungrounded illusion disconnected from human accountability.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 315°00′ (Aquarius 15°00′) in the Firmament Hybrid Zodiac; evaluated within a 5° Royal Star contact orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Royal Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos I.9; Anonymous of 379",
      epistemicCategory: "TRADITION",
    },
  },

  Spica: {
    isRoyalStar: false,
    constellation: "Alpha Virginis (The Ear of Wheat in the Virgin's Hand)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "First-magnitude binary star (α Virginis) lying ~2° south of the ecliptic.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (179.10°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Venus and Mars (or Venus and Jupiter)",
    traditionalMeaning:
      "The preeminent fortunate non-Royal fixed star: unexpected grace, intellectual and artistic brilliance, and protection amidst difficulty.",
    giftWhenIntegrated:
      "Refined mastery of craft, scholarship, or art that brings honor and safe passage.",
    nemesisOrTest:
      "Relying on natural brilliance without ethical stewardship.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 179°06′ (Virgo 29°06′) in the Firmament Hybrid Zodiac; evaluated within 1°–2° conjunction orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Fixed Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy; Anonymous of 379; Al-Biruni; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },

  Sirius: {
    isRoyalStar: false,
    constellation: "Alpha Canis Majoris (The Scorching One / Dog Star)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Brightest star in Earth's night sky (apparent magnitude −1.46); heliacal rising anchored the ancient Egyptian calendar.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (79.35°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Jupiter and Mars",
    traditionalMeaning:
      "Extraordinary ambition, guardianship, high public impact, and small actions producing outsized collective consequences.",
    giftWhenIntegrated:
      "Fierce devotion to a mission, protective guardianship, and historic reach.",
    nemesisOrTest:
      "Burnout from excessive heat, impatience, or letting fierce passion scorch close relationships.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 79°21′ (Gemini 19°21′) in the Firmament Hybrid Zodiac; evaluated within 1°–2° conjunction orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Fixed Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos I.9; Manilius, Astronomica",
      epistemicCategory: "TRADITION",
    },
  },

  Algol: {
    isRoyalStar: false,
    constellation: "Beta Persei (Caput Medusae — The Gorgon's Head)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Eclipsing binary star system (β Persei) whose brightness visibly dims every 2 days, 20 hours, and 49 minutes.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (31.4333°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Saturn and Jupiter",
    traditionalMeaning:
      "Confrontation with raw, unvarnished intensity, visceral outrage, and situations demanding that one 'not lose one's head' under extreme pressure.",
    giftWhenIntegrated:
      "Apotropaic (protective) ferocity: the capacity to face terrifying realities and protect the vulnerable without blinking.",
    nemesisOrTest:
      "Being consumed by rage, panic, or extremis when provoked.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 31°26′ (Taurus 01°26′) in the Firmament Hybrid Zodiac; evaluated within 1°–2° conjunction orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Fixed Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos I.9; William Lilly; Robson",
      epistemicCategory: "TRADITION",
    },
  },

  Rigel: {
    isRoyalStar: false,
    constellation: "Beta Orionis (The Left Foot of Orion)",
    astronomicalFact: {
      category: "FACT",
      statement: "Blue supergiant (β Orionis), usually the brightest star in Orion.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (52.10°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Jupiter and Saturn (or Mars)",
    traditionalMeaning:
      "Technical mastery, education, inventive skill, and rapid advancement that requires continual effort to maintain.",
    giftWhenIntegrated:
      "Bringing practical knowledge, engineering, or teaching skill to bear on complex problems.",
    nemesisOrTest:
      "Overextending authority without maintaining the underlying structure.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 52°06′ (Taurus 22°06′) in the Firmament Hybrid Zodiac; evaluated within 1°–2° conjunction orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Fixed Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos I.9; Anonymous of 379",
      epistemicCategory: "TRADITION",
    },
  },

  Polaris: {
    isRoyalStar: false,
    constellation: "Alpha Ursae Minoris (The Pole Star)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Current northern pole star (α Ursae Minoris) standing near the north celestial pole.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (63.8333°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Saturn and Venus",
    traditionalMeaning:
      "Unwavering orientation, true north, endurance, and serving as a directional anchor while others are disoriented.",
    giftWhenIntegrated:
      "Steady moral and strategic compass that others rely upon in uncertain waters.",
    nemesisOrTest:
      "Rigidity, isolation at the top, or refusing to adapt when circumstances shift.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 63°50′ (Gemini 03°50′) in the Firmament Hybrid Zodiac; evaluated within 1°–2° conjunction orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Fixed Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "medieval",
      sourceTitle: "Ptolemy; Robson, Fixed Stars and Constellations",
      epistemicCategory: "TRADITION",
    },
  },

  Hamal: {
    isRoyalStar: false,
    constellation: "Alpha Arietis (The Forehead of the Ram)",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Brightest star in Aries (α Arietis), marking the horn/forehead of the Ram.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Stellar Catalog / Firmament Locked Hybrid Frame (12.9333°)",
        epistemicCategory: "FACT",
      },
    },
    ptolemaicPlanetaryNature: "Of the nature of Mars and Saturn",
    traditionalMeaning:
      "Fierce independence, headstrong determination, and refusal to submit to arbitrary authority.",
    giftWhenIntegrated:
      "Self-directed courage and willingness to pioneer a hard path alone.",
    nemesisOrTest:
      "Stubbornness, head-on collisions with authority, or acting before weighing the cost.",
    firmamentOrbRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Locked at 12°56′ (Aries 12°56′) in the Firmament Hybrid Zodiac; evaluated within 1°–2° conjunction orb.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Fixed Star Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos I.9; Robson",
      epistemicCategory: "TRADITION",
    },
  },
};

export const FIXED_STAR_CANON_RECORDS: FixedStarCanonRecord[] = FIXED_STARS.map(
  ([name, lon]) => ({
    name,
    firmamentLockedLongitude: lon,
    ...(FIXED_STAR_DOCTRINE[name] ?? {
      isRoyalStar: false,
      constellation: "Stellar catalog anchor; see astronomical identification",
      astronomicalFact: {
        category: "FACT" as const,
        statement: `${name} is included as a permanent reference in the custom Aldebaran-calibrated stellar catalog.`,
        provenance: {
          tradition: "firmament" as const,
          sourceTitle: "Fixed-star catalog: 2026 reference positions, Aldebaran 45-degree calibration",
          epistemicCategory: "FACT" as const,
        },
      },
      ptolemaicPlanetaryNature: "Not yet source-verified",
      traditionalMeaning: "Historical star-specific interpretation pending source verification.",
      giftWhenIntegrated: "Not assigned until traditional evidence is verified.",
      nemesisOrTest: "Not assigned until traditional evidence is verified.",
      firmamentOrbRule: {
        category: "FIRMAMENT_CANON" as const,
        statement: "A natal planet activates this fixed star within a 5-degree conjunction orb.",
        provenance: {
          tradition: "firmament" as const,
          sourceTitle: "The Absolute fixed-star activation rule",
          epistemicCategory: "FIRMAMENT_CANON" as const,
        },
      },
      provenance: {
        tradition: "firmament" as const,
        sourceTitle: "The Absolute expanded fixed-star reference catalog",
        epistemicCategory: "FIRMAMENT_CANON" as const,
      },
    }),
  })
);

/**
 * Hermetic & Arabic Lots (Paulus Alexandrinus, Introductory Matters ch. 23;
 * Olympiodorus; Abu Ma'shar, Great Introduction Book VI; Al-Biruni).
 * Preserves both Day/Night reversal formulas and classical variant formulas explicitly.
 */
export const LOT_CANON_RECORDS: Record<string, LotCanonRecord> = {
  fortune: {
    id: "fortune",
    name: "Lot of Fortune (Pars Fortunae / Tyche)",
    dayFormula: "Ascendant + Moon − Sun",
    nightFormula: "Ascendant + Sun − Moon",
    associatedPlanet: "Moon",
    traditionalMeaning:
      "The primary Lunar Lot of the body, health, material circumstances, livelihood, and what happens to the native through the environment rather than pure willpower.",
    psychologicalMeaning:
      "How life lands in your body and material reality—where tangible ease or physical friction meets you automatically.",
    horaryAndNatalUse:
      "In natal charts, shows the concrete vessel of fortune and bodily well-being; in horary, co-signifies the querent's treasure, resources, and immediate material advantage.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle:
        "Nechepso & Petosiris; Vettius Valens, Anthology II; Paulus Alexandrinus ch. 23; Abu Ma'shar",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote:
        "Valens, Paulus, Dorotheus, and Abu Ma'shar reverse the formula at night (Asc + Sun − Moon); Ptolemy (Tetrabiblos III.10) kept the diurnal formula (Asc + Moon − Sun) for both day and night. Firmament uses sect-reversal as primary and notes the Ptolemaic variant.",
    },
  },

  spirit: {
    id: "spirit",
    name: "Lot of Spirit (Pars Spiritus / Daimon)",
    dayFormula: "Ascendant + Sun − Moon",
    nightFormula: "Ascendant + Moon − Sun",
    associatedPlanet: "Sun",
    traditionalMeaning:
      "The primary Solar Lot of conscious intention, vocation, deliberate agency, soul-direction, and what the native initiates by choice.",
    psychologicalMeaning:
      "Where your deliberate willpower, ethics, and career authorship steer your life.",
    horaryAndNatalUse:
      "Evaluated alongside the Lot of Fortune to distinguish what happens to you (Fortune) from what you consciously choose and build (Spirit).",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Vettius Valens, Anthology II & IV; Paulus Alexandrinus ch. 23; Abu Ma'shar",
      epistemicCategory: "TRADITION",
    },
  },

  eros: {
    id: "eros",
    name: "Lot of Eros (Love, Desire & Magnetic Appetite)",
    dayFormula: "Ascendant + Venus − Lot of Spirit",
    nightFormula: "Ascendant + Lot of Spirit − Venus",
    associatedPlanet: "Venus",
    traditionalMeaning:
      "Hermetic Lot of Venus: voluntary affection, erotic magnetism, friendship, and what the heart actively desires and courts.",
    psychologicalMeaning:
      "What draws your heart and desire when you feel free to choose what you love.",
    horaryAndNatalUse:
      "Illuminates romantic motivation, relational appetite, and creative longing.",
    provenance: {
      tradition: "hermetic",
      sourceTitle:
        "Paulus Alexandrinus, Introductory Matters ch. 23 (Panaretos); Olympiodorus",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote:
        "Paulus Alexandrinus uses Asc + Venus − Spirit (reversed at night); Firmicus Maternus and some medieval tables use Asc + Venus − Fortune. Both are documented.",
    },
  },

  necessity: {
    id: "necessity",
    name: "Lot of Necessity (Ananke / Constraint & Obligation)",
    dayFormula: "Ascendant + Lot of Fortune − Mercury",
    nightFormula: "Ascendant + Mercury − Lot of Fortune",
    associatedPlanet: "Mercury",
    traditionalMeaning:
      "Hermetic Lot of Mercury: binding obligations, contracts, subordination, rivalries, and the non-negotiable pressures that must be navigated.",
    psychologicalMeaning:
      "Where you encounter non-negotiable terms, mental pressure, or situations requiring strategic problem-solving.",
    horaryAndNatalUse:
      "Used in questions of binding agreements, debts, constraints, and unavoidable tests.",
    provenance: {
      tradition: "hermetic",
      sourceTitle: "Paulus Alexandrinus, Introductory Matters ch. 23",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote:
        "Paulus uses Asc + Fortune − Mercury (reversed at night); Firmicus Maternus uses Asc + Fortune − Spirit.",
    },
  },

  courage: {
    id: "courage",
    name: "Lot of Courage (Tolma / Boldness)",
    dayFormula: "Ascendant + Lot of Fortune − Mars",
    nightFormula: "Ascendant + Mars − Lot of Fortune",
    associatedPlanet: "Mars",
    traditionalMeaning:
      "Hermetic Lot of Mars: boldness, decisive action, confrontation, and how the native mobilizes martial force.",
    psychologicalMeaning:
      "Where you summon nerve, cut through fear, and stand up for yourself.",
    horaryAndNatalUse:
      "Evaluated in questions of conflict, competition, surgery, or bold enterprise.",
    provenance: {
      tradition: "hermetic",
      sourceTitle: "Paulus Alexandrinus, Introductory Matters ch. 23",
      epistemicCategory: "TRADITION",
    },
  },

  victory: {
    id: "victory",
    name: "Lot of Victory (Nike / Faith & Good Outcome)",
    dayFormula: "Ascendant + Jupiter − Lot of Spirit",
    nightFormula: "Ascendant + Lot of Spirit − Jupiter",
    associatedPlanet: "Jupiter",
    traditionalMeaning:
      "Hermetic Lot of Jupiter: trust, alliance, fortunate patronage, success of enterprises, and philosophical uplift.",
    psychologicalMeaning:
      "Where confidence, mentorship, and earned goodwill carry your efforts across the finish line.",
    horaryAndNatalUse:
      "Indicates where support, relief, and constructive resolution enter the chart.",
    provenance: {
      tradition: "hermetic",
      sourceTitle: "Paulus Alexandrinus, Introductory Matters ch. 23",
      epistemicCategory: "TRADITION",
    },
  },

  nemesis: {
    id: "nemesis",
    name: "Lot of Nemesis (Saturnian Reckoning & Hidden Burden)",
    dayFormula: "Ascendant + Lot of Fortune − Saturn",
    nightFormula: "Ascendant + Saturn − Lot of Fortune",
    associatedPlanet: "Saturn",
    traditionalMeaning:
      "Hermetic Lot of Saturn: hidden burdens, chronic tests, reckoning with time/limits, and what demands humble accountability.",
    psychologicalMeaning:
      "The quiet weight or fear of failure that matures into deep wisdom once faced squarely.",
    horaryAndNatalUse:
      "Identifies the source of delay, exhaustion, or structural reckoning.",
    provenance: {
      tradition: "hermetic",
      sourceTitle: "Paulus Alexandrinus, Introductory Matters ch. 23",
      epistemicCategory: "TRADITION",
    },
  },
};

export function findFixedStarContactsForLongitude(
  longitude: number
): Array<{ star: FixedStarCanonRecord; orbDeg: number }> {
  const L = normalizeLongitude(longitude);
  const contacts: Array<{ star: FixedStarCanonRecord; orbDeg: number }> = [];
  for (const star of FIXED_STAR_CANON_RECORDS) {
    const raw = Math.abs(L - normalizeLongitude(star.firmamentLockedLongitude));
    const dist = Number(Math.min(raw, 360 - raw).toFixed(2));
    const maxOrb = star.isRoyalStar ? 5.0 : 2.0;
    if (dist <= maxOrb) {
      contacts.push({ star, orbDeg: dist });
    }
  }
  return contacts.sort((a, b) => a.orbDeg - b.orbDeg);
}

export function calculateChartHermeticLots(
  chart: ChartResult,
  isDayChart: boolean
): Array<{
  lot: LotCanonRecord;
  longitude: number;
  display: string;
  sign: string;
  house: number;
  houseInterpretation: string;
}> {
  if (!chart.ascendant || !Number.isFinite(chart.ascendant.longitude)) {
    return [];
  }
  const asc = normalizeLongitude(chart.ascendant.longitude);
  const bodyLon = (name: string) => {
    const found = chart.movingBodies.find(b => b.name === name);
    return found && Number.isFinite(found.longitude)
      ? normalizeLongitude(found.longitude)
      : undefined;
  };

  const sun = bodyLon("Sun");
  const moon = bodyLon("Moon");
  if (sun == null || moon == null) return [];

  const fortune = isDayChart
    ? normalizeLongitude(asc + moon - sun)
    : normalizeLongitude(asc + sun - moon);
  const spirit = isDayChart
    ? normalizeLongitude(asc + sun - moon)
    : normalizeLongitude(asc + moon - sun);

  const venus = bodyLon("Venus");
  const mercury = bodyLon("Mercury");
  const mars = bodyLon("Mars");
  const jupiter = bodyLon("Jupiter");
  const saturn = bodyLon("Saturn");

  const computed: Array<[string, number | undefined]> = [
    ["fortune", fortune],
    ["spirit", spirit],
    [
      "eros",
      venus != null
        ? isDayChart
          ? normalizeLongitude(asc + venus - spirit)
          : normalizeLongitude(asc + spirit - venus)
        : undefined,
    ],
    [
      "necessity",
      mercury != null
        ? isDayChart
          ? normalizeLongitude(asc + fortune - mercury)
          : normalizeLongitude(asc + mercury - fortune)
        : undefined,
    ],
    [
      "courage",
      mars != null
        ? isDayChart
          ? normalizeLongitude(asc + fortune - mars)
          : normalizeLongitude(asc + mars - fortune)
        : undefined,
    ],
    [
      "victory",
      jupiter != null
        ? isDayChart
          ? normalizeLongitude(asc + jupiter - spirit)
          : normalizeLongitude(asc + spirit - jupiter)
        : undefined,
    ],
    [
      "nemesis",
      saturn != null
        ? isDayChart
          ? normalizeLongitude(asc + fortune - saturn)
          : normalizeLongitude(asc + saturn - fortune)
        : undefined,
    ],
  ];

  const houseForLon = (lon: number) => {
    if (chart.agentViewAvailable && chart.ascendant) {
      return (Math.floor(normalizeLongitude(lon - asc) / 30) % 12) + 1;
    }
    return (Math.floor(normalizeLongitude(lon) / 30) % 12) + 1;
  };

  return computed
    .filter((entry): entry is [string, number] => entry[1] != null)
    .map(([id, longitude]) => {
      const lot = LOT_CANON_RECORDS[id];
      const sign = ZODIAC_SIGNS[Math.floor(longitude / 30)];
      const house = houseForLon(longitude);
      const houseRec = HOUSE_CANON_RECORDS[house];
      const houseInterpretation = houseRec
        ? `${lot.name} falls in ${sign} in House ${house} (${houseRec.traditionalTitle}), anchoring ${lot.psychologicalMeaning.toLowerCase()} within ${houseRec.coreTopics[0].toLowerCase()}.`
        : `${lot.name} falls in ${sign} in House ${house}.`;
      return {
        lot,
        longitude: Number(longitude.toFixed(4)),
        display: formatLongitude(longitude),
        sign,
        house,
        houseInterpretation,
      };
    });
}
