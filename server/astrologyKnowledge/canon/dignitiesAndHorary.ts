import { normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import type { ChartResult, ChartRow } from "../../astronomy";
import { SIGN_CANON_RECORDS, PLANET_CANON_RECORDS } from "./planetsAndSigns";
import type {
  DetectedTraditionalMechanism,
  HoraryMechanismRecord,
  RetrievedPlacementDossier,
} from "./types";

/**
 * Egyptian Bounds / Terms (Hellenistic & Arabic standard: Nechepso/Petosiris, Valens, Dorotheus, Abu Ma'shar).
 * Each tuple is [endDegreeExclusive, ruler].
 */
export const EGYPTIAN_BOUNDS_TABLE: Record<string, Array<[number, string]>> = {
  Aries: [[6, "Jupiter"], [12, "Venus"], [20, "Mercury"], [25, "Mars"], [30, "Saturn"]],
  Taurus: [[8, "Venus"], [14, "Mercury"], [22, "Jupiter"], [27, "Saturn"], [30, "Mars"]],
  Gemini: [[6, "Mercury"], [12, "Jupiter"], [17, "Venus"], [24, "Mars"], [30, "Saturn"]],
  Cancer: [[7, "Mars"], [13, "Venus"], [19, "Mercury"], [26, "Jupiter"], [30, "Saturn"]],
  Leo: [[6, "Jupiter"], [11, "Venus"], [18, "Saturn"], [24, "Mercury"], [30, "Mars"]],
  Virgo: [[7, "Mercury"], [17, "Venus"], [21, "Jupiter"], [28, "Mars"], [30, "Saturn"]],
  Libra: [[6, "Saturn"], [14, "Mercury"], [21, "Jupiter"], [28, "Venus"], [30, "Mars"]],
  Scorpio: [[7, "Mars"], [11, "Venus"], [19, "Mercury"], [24, "Jupiter"], [30, "Saturn"]],
  Sagittarius: [[12, "Jupiter"], [17, "Venus"], [21, "Mercury"], [26, "Saturn"], [30, "Mars"]],
  Capricorn: [[7, "Mercury"], [14, "Jupiter"], [22, "Venus"], [26, "Saturn"], [30, "Mars"]],
  Aquarius: [[7, "Mercury"], [13, "Venus"], [20, "Jupiter"], [25, "Mars"], [30, "Saturn"]],
  Pisces: [[12, "Venus"], [16, "Jupiter"], [19, "Mercury"], [28, "Mars"], [30, "Saturn"]],
};

/**
 * Ptolemaic Bounds / Terms (Ptolemy, Tetrabiblos I.21; William Lilly, Christian Astrology).
 * Preserved distinctly from Egyptian Terms so conflicting traditions are never silently merged.
 */
export const PTOLEMAIC_BOUNDS_TABLE: Record<string, Array<[number, string]>> = {
  Aries: [[6, "Jupiter"], [14, "Venus"], [21, "Mercury"], [26, "Mars"], [30, "Saturn"]],
  Taurus: [[8, "Venus"], [15, "Mercury"], [22, "Jupiter"], [26, "Saturn"], [30, "Mars"]],
  Gemini: [[7, "Mercury"], [14, "Jupiter"], [21, "Venus"], [25, "Saturn"], [30, "Mars"]],
  Cancer: [[6, "Mars"], [13, "Jupiter"], [20, "Mercury"], [27, "Venus"], [30, "Saturn"]],
  Leo: [[6, "Saturn"], [13, "Mercury"], [19, "Venus"], [25, "Jupiter"], [30, "Mars"]],
  Virgo: [[7, "Mercury"], [13, "Venus"], [18, "Jupiter"], [24, "Saturn"], [30, "Mars"]],
  Libra: [[6, "Saturn"], [11, "Venus"], [19, "Jupiter"], [24, "Mercury"], [30, "Mars"]],
  Scorpio: [[6, "Mars"], [14, "Jupiter"], [21, "Venus"], [27, "Mercury"], [30, "Saturn"]],
  Sagittarius: [[8, "Jupiter"], [14, "Venus"], [19, "Mercury"], [25, "Saturn"], [30, "Mars"]],
  Capricorn: [[6, "Venus"], [12, "Mercury"], [19, "Jupiter"], [25, "Mars"], [30, "Saturn"]],
  Aquarius: [[6, "Saturn"], [12, "Mercury"], [20, "Venus"], [25, "Jupiter"], [30, "Mars"]],
  Pisces: [[8, "Venus"], [14, "Jupiter"], [20, "Mercury"], [26, "Mars"], [30, "Saturn"]],
};

export const CHALDEAN_ORDER_7 = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
] as const;

export const TRADITIONAL_ASPECT_DOCTRINE: Record<
  string,
  {
    angle: number;
    planetaryNature: string;
    quality: string;
    traditionalMeaning: string;
    provenance: string;
  }
> = {
  conjunction: {
    angle: 0,
    planetaryNature: "Variable (depends on the planets bodily united)",
    quality: "Bodily union (Synodos / Kollēsis)",
    traditionalMeaning:
      "Direct fusion of two planetary principles in the same sign/degree; unmediated urgency where neither planet can act without triggering the other.",
    provenance: "Antiochus of Athens; Vettius Valens; Abu Ma'shar",
  },
  sextile: {
    angle: 60,
    planetaryNature: "Nature of Venus",
    quality: "Harmonious, cooperative, and inviting",
    traditionalMeaning:
      "Supportive connection of friendship and shared affinity; opens doors when consciously acted upon.",
    provenance: "Ptolemy, Tetrabiblos I.13; Dorotheus of Sidon",
  },
  square: {
    angle: 90,
    planetaryNature: "Nature of Mars",
    quality: "Dynamic tension, friction, and contest (Tetragon)",
    traditionalMeaning:
      "Cross-purpose pressure between signs of the same modality; forces concrete action, boundary definition, and structural work.",
    provenance: "Ptolemy, Tetrabiblos I.13; Rhetorius",
  },
  trine: {
    angle: 120,
    planetaryNature: "Nature of Jupiter",
    quality: "Natural harmony and elemental reinforcement (Trigon)",
    traditionalMeaning:
      "Flowing agreement within the same element; provides natural protection, ease, and mutual reinforcement.",
    provenance: "Ptolemy, Tetrabiblos I.13; Dorotheus of Sidon",
  },
  opposition: {
    angle: 180,
    planetaryNature: "Nature of Saturn",
    quality: "Full polarity, confrontation, and mirror awareness (Diametros)",
    traditionalMeaning:
      "Two principles facing each other across the wheel; exposes blind spots through relationship, rivalry, or the tension of opposites.",
    provenance: "Ptolemy, Tetrabiblos I.13; Abu Ma'shar",
  },
  aversion: {
    angle: 30, // 30° (semi-sextile) or 150° (inconjunct/quincunx) = non-beholding signs
    planetaryNature: "Aversion (Apostrophos / Inconjunct)",
    quality: "Disconnection, blind spot, or lack of direct sightline",
    traditionalMeaning:
      "Signs 2, 6, 8, or 12 places apart do not behold each other by classical Ptolemaic ray; requires constant readjustment or operates in separate compartments of life.",
    provenance: "Paulus Alexandrinus, Introductory Matters; Vettius Valens",
  },
};

export const HORARY_MECHANISM_RECORDS: Record<
  HoraryMechanismRecord["id"],
  HoraryMechanismRecord
> = {
  "applying-aspect": {
    id: "applying-aspect",
    name: "Applying Aspect (Application toward Perfection)",
    category: "perfection",
    definition:
      "The faster planet is moving toward exact aspect with the slower planet before either leaves its current sign.",
    astronomicalCriterion:
      "Angular separation from exact aspect angle is decreasing over time (d(orb)/dt < 0) within the configured orb.",
    traditionalJudgment:
      "Signifies events and dynamics actively coming into being, approaching culmination, or pressing for resolution.",
    psychologicalAnalogue:
      "A pattern that feels acute, formative, and impossible to ignore—something you are actively growing into.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Masha'allah, On Reception; Sahl ibn Bishr, Introduction; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },
  "separating-aspect": {
    id: "separating-aspect",
    name: "Separating Aspect (Defluxion / Separation)",
    category: "perfection",
    definition:
      "The faster planet has already passed the exact aspect degree and is moving away from the slower planet.",
    astronomicalCriterion:
      "Angular separation from exact aspect angle is increasing over time (d(orb)/dt > 0).",
    traditionalJudgment:
      "Signifies what has already occurred, the immediate past cause of the matter, or an ingrained habit already absorbed.",
    psychologicalAnalogue:
      "A familiar baseline lesson or past experience that now acts as seasoned instinct or memory.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Masha'allah; Sahl ibn Bishr; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },
  "mutual-reception": {
    id: "mutual-reception",
    name: "Mutual Reception",
    category: "reception",
    definition:
      "Two planets each occupy a sign (or exaltation/triplicity/term/face) ruled by the other.",
    astronomicalCriterion:
      "Planet A is in an essential dignity of Planet B while Planet B is simultaneously in an essential dignity of Planet A.",
    traditionalJudgment:
      "Provides mutual aid, exchange of resources, and an escape route or cooperative agreement even under difficult aspects.",
    psychologicalAnalogue:
      "Two seemingly conflicting parts of your psyche actually back each other up when under pressure.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Masha'allah, On Reception; Bonatti, Liber Astronomiae",
      epistemicCategory: "TRADITION",
    },
  },
  "unilateral-reception": {
    id: "unilateral-reception",
    name: "Reception by Dignity",
    category: "reception",
    definition:
      "One planet occupies the domicile, exaltation, triplicity, bound, or face of another planet that aspects it.",
    astronomicalCriterion:
      "Planet A beholds Planet B while Planet B sits in Planet A's dignity.",
    traditionalJudgment:
      "The receiving planet welcomes, supports, and grants hospitality to the guest planet's agenda.",
    psychologicalAnalogue:
      "One area of your life naturally makes room for and supports the needs of another.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr; Abu Ma'shar",
      epistemicCategory: "TRADITION",
    },
  },
  "translation-of-light": {
    id: "translation-of-light",
    name: "Translation of Light (Translatio Lucis)",
    category: "perfection",
    definition:
      "A faster planet separates from an aspect with one slower planet and immediately applies to an aspect with a second slower planet.",
    astronomicalCriterion:
      "Fast body F has speed > both A and B, is separating from A within 5° orb, and is applying to B within 5° orb.",
    traditionalJudgment:
      "Brings two otherwise disconnected significators together through a third party, go-between, message, or catalyst (often the Moon or Mercury).",
    psychologicalAnalogue:
      "A third factor—often emotional responsiveness (Moon) or communication (Mercury)—bridges two parts of your life that could not connect directly.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr, Introduction; William Lilly, Christian Astrology p. 110",
      epistemicCategory: "TRADITION",
    },
  },
  "collection-of-light": {
    id: "collection-of-light",
    name: "Collection of Light (Collectio Lucis)",
    category: "perfection",
    definition:
      "Two faster planets that do not aspect each other both apply to a third, slower/heavier planet (such as Saturn or Jupiter).",
    astronomicalCriterion:
      "Bodies A and B are not in aspect with each other, both move faster than C, and both are applying to C within 5° orb.",
    traditionalJudgment:
      "A senior authority, judge, institution, or overarching life commitment gathers both sides together to settle the matter.",
    psychologicalAnalogue:
      "A deeper long-term responsibility or guiding principle (Saturn/Jupiter) unifies two scattered desires into one coherent path.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr; Bonatti; William Lilly, Christian Astrology p. 110",
      epistemicCategory: "TRADITION",
    },
  },
  prohibition: {
    id: "prohibition",
    name: "Prohibition (Impediment by Interception)",
    category: "impediment",
    definition:
      "While Significator A is applying to Significator B, a third planet C completes its aspect to A or B first, intercepting the perfection.",
    astronomicalCriterion:
      "A applies to B at orb_AB, while C applies to A or B with a smaller time-to-exactness (degreesToPerfection / relativeSpeed).",
    traditionalJudgment:
      "A competing priority, rival, or external obstacle steps in before the original aim can complete unchallenged.",
    psychologicalAnalogue:
      "Just as you move toward a goal or connection, an interrupting fear, duty, or protective habit cuts in first.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr; Abu Ma'shar; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },
  refranation: {
    id: "refranation",
    name: "Refranation (Holding Back Before Perfection)",
    category: "impediment",
    definition:
      "One of two applying planets stations retrograde (or direct) before the aspect becomes exact, pulling back from completion.",
    astronomicalCriterion:
      "Two planets are within applying orb, but one is retrograde or slowing near station so the aspect fails to perfect or reverses.",
    traditionalJudgment:
      "Second thoughts, hesitation, withdrawal of consent, or a change of heart right before commitment.",
    psychologicalAnalogue:
      "Approaching closeness or decisive action and then pulling the hand back at the last moment out of caution or self-protection.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr; Bonatti; William Lilly, Christian Astrology p. 111",
      epistemicCategory: "TRADITION",
    },
  },
  frustration: {
    id: "frustration",
    name: "Frustration",
    category: "impediment",
    definition:
      "A faster planet applies to a slower planet, but before the aspect perfects, the slower planet already perfects an aspect with a third planet or changes sign.",
    astronomicalCriterion:
      "Fast planet F applies to slow planet S, while S is closer to perfecting an aspect with third planet T.",
    traditionalJudgment:
      "Seeking something whose attention or commitment is already tied up elsewhere ('the proverb: between the cup and the lip').",
    psychologicalAnalogue:
      "Reaching for validation or resolution from a situation that is already committed to another priority.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Bonatti, Liber Astronomiae; William Lilly, Christian Astrology",
      epistemicCategory: "TRADITION",
    },
  },
  cazimi: {
    id: "cazimi",
    name: "Cazimi (In the Heart of the Sun)",
    category: "solar-condition",
    definition:
      "A planet is within 17 arcminutes (0.2833°) of the exact center of the Sun.",
    astronomicalCriterion: "Angular distance from the Sun <= 0.2833° (17′).",
    traditionalJudgment:
      "Supreme accidental fortification: the planet sits in the throne-room of the King, protected and empowered with extraordinary clarity.",
    psychologicalAnalogue:
      "A flash of unmistakable inner authority and clarity inside what would otherwise feel like overwhelming pressure.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Abu Ma'shar; Sahl ibn Bishr; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },
  combustion: {
    id: "combustion",
    name: "Combustion (Burnt by the Sun)",
    category: "solar-condition",
    definition:
      "A planet is between 17 arcminutes (0.2833°) and 8°30′ (8.5°) of the Sun.",
    astronomicalCriterion: "0.2833° < Angular distance from the Sun <= 8.5°.",
    traditionalJudgment:
      "The planet is hidden by solar glare: its significations act privately, under intense pressure, or feel overshadowed by an authority figure or survival urgency.",
    psychologicalAnalogue:
      "A part of you that works so close to your core identity that you struggle to see it objectively, or feel anxious that it will be overpowered.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Rhetorius; Abu Ma'shar; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },
  "under-the-beams": {
    id: "under-the-beams",
    name: "Under the Sun's Beams (Sub Radiis)",
    category: "solar-condition",
    definition:
      "A planet is between 8°30′ (8.5°) and 17°00′ of the Sun.",
    astronomicalCriterion: "8.5° < Angular distance from the Sun <= 17.0°.",
    traditionalJudgment:
      "Moderate concealment: the planet's agency is veiled, private, or still emerging into public visibility.",
    psychologicalAnalogue:
      "A capacity that operates quietly behind the scenes rather than demanding center stage.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy; Paulus Alexandrinus; Abu Ma'shar",
      epistemicCategory: "TRADITION",
    },
  },
  besiegement: {
    id: "besiegement",
    name: "Besiegement (Obsessio by Mars and Saturn)",
    category: "impediment",
    definition:
      "A planet is enclosed in the same sign or within tight degree span between the two classical malefics, Mars and Saturn, with no intervening benefic ray.",
    astronomicalCriterion:
      "Planet's longitude lies between Mars and Saturn within a <= 15° span.",
    traditionalJudgment:
      "Feeling hemmed in between two hard choices—urgency (Mars) on one side and restriction/delay (Saturn) on the other.",
    psychologicalAnalogue:
      "Feeling caught between pressure to act immediately and fear of making a costly mistake.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr; Bonatti; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },
  "retrograde-condition": {
    id: "retrograde-condition",
    name: "Planetary Retrogradation",
    category: "motion",
    definition:
      "Apparent westward motion against the order of the signs (negative daily longitude speed) for Mercury, Venus, Mars, Jupiter, or Saturn.",
    astronomicalCriterion: "Daily ecliptic speed < 0 (excluding Lunar Nodes).",
    traditionalJudgment:
      "Turns the planet's function inward, counter-cultural, or iterative: revision, second-guessing, delayed outer delivery, and self-taught mastery.",
    psychologicalAnalogue:
      "Refusing to take the standard path at face value; needing to review, internalize, and test a truth privately before trusting it.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Vettius Valens; Abu Ma'shar; William Lilly",
      epistemicCategory: "TRADITION",
    },
  },
  "void-of-course": {
    id: "void-of-course",
    name: "Void of Course Moon (Kenodromia)",
    category: "motion",
    definition:
      "The Moon completes no further major Ptolemaic aspect before leaving its current sign.",
    astronomicalCriterion:
      "No major aspect target (0°, 60°, 90°, 120°, 180°) with classical planets falls between the Moon's current degree in its sign and 30°00′ of that sign.",
    traditionalJudgment:
      "In horary, matters proceed slowly or hardly unless the Moon is in Taurus, Cancer, Sagittarius, or Pisces (Lilly qualification). In natal charts, indicates an inner emotional life that resists external scripts.",
    psychologicalAnalogue:
      "Moving by your own internal compass rather than reacting to every external demand.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr; William Lilly, Christian Astrology p. 112",
      epistemicCategory: "TRADITION",
    },
  },
};

export function lookupBoundRuler(
  table: Record<string, Array<[number, string]>>,
  signName: string,
  degreeInSign: number
): string | undefined {
  const bounds = table[signName];
  if (!bounds) return undefined;
  return bounds.find(([end]) => degreeInSign < end)?.[1];
}

export function lookupChaldeanFaceRuler(longitude: number): string {
  const index = Math.floor(normalizeLongitude(longitude) / 10) % 36;
  return CHALDEAN_ORDER_7[(index + 2) % 7]; // Aries 1st decan starts with Mars (index 2 in Chaldean order)
}

export function evaluatePlacementDignityAndCondition(
  row: ChartRow,
  chart: ChartResult,
  isDayChart: boolean
): RetrievedPlacementDossier["dignityAndCondition"] {
  const lon = normalizeLongitude(row.longitude);
  const signIndex = Math.floor(lon / 30);
  const signName = ZODIAC_SIGNS[signIndex];
  const degInSign = lon % 30;
  const signRec = SIGN_CANON_RECORDS[signName];
  const planetRec = PLANET_CANON_RECORDS[row.name];

  const egyptianTermRuler = lookupBoundRuler(
    EGYPTIAN_BOUNDS_TABLE,
    signName,
    degInSign
  );
  const ptolemaicTermRuler = lookupBoundRuler(
    PTOLEMAIC_BOUNDS_TABLE,
    signName,
    degInSign
  );
  const chaldeanFaceRuler = lookupChaldeanFaceRuler(lon);
  const dorotheanTriplicityRulers = signRec?.triplicityLords.dorothean;

  const essentialDignities: string[] = [];
  const essentialDebilities: string[] = [];

  const isClassicalPlanet = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
  ].includes(row.name);

  if (isClassicalPlanet && signRec) {
    if (signRec.domicileLord === row.name) {
      essentialDignities.push(`Domicile Lord of ${signName} (+5)`);
    }
    if (signRec.exaltation?.planet === row.name) {
      essentialDignities.push(
        `Exalted in ${signName} (classical degree ${signRec.exaltation.classicalDegree}°, +4)`
      );
    }
    if (
      dorotheanTriplicityRulers &&
      [
        dorotheanTriplicityRulers.day,
        dorotheanTriplicityRulers.night,
        dorotheanTriplicityRulers.participating,
      ].includes(row.name)
    ) {
      const role =
        dorotheanTriplicityRulers.day === row.name
          ? "Day Triplicity Lord"
          : dorotheanTriplicityRulers.night === row.name
            ? "Night Triplicity Lord"
            : "Participating Triplicity Lord";
      essentialDignities.push(`${role} of ${signRec.element} (+3)`);
    }
    if (egyptianTermRuler === row.name) {
      essentialDignities.push(`In own Egyptian Bound/Term (+2)`);
    }
    if (ptolemaicTermRuler === row.name && ptolemaicTermRuler !== egyptianTermRuler) {
      essentialDignities.push(`In own Ptolemaic Term (+2 variant)`);
    }
    if (chaldeanFaceRuler === row.name) {
      essentialDignities.push(`In own Chaldean Decan/Face (+1)`);
    }

    if (signRec.detrimentLords.includes(row.name)) {
      essentialDebilities.push(`Detriment in ${signName} (−5)`);
    }
    if (signRec.fall?.planet === row.name) {
      essentialDebilities.push(
        `Fall in ${signName} (classical degree ${signRec.fall.classicalDegree}°, −4)`
      );
    }
    if (essentialDignities.length === 0) {
      essentialDebilities.push(
        `Peregrine in ${signName} (no essential dignity; relies on domicile host ${signRec.domicileLord})`
      );
    }
  }

  // Solar condition
  const sunRow = chart.movingBodies.find(b => b.name === "Sun");
  let solarCondition: RetrievedPlacementDossier["dignityAndCondition"]["solarCondition"] =
    "free-of-solar-rays";
  let solarDistanceDeg: number | undefined;

  if (row.name === "Sun") {
    solarCondition = "solar-source";
  } else if (sunRow) {
    const rawDiff = Math.abs(lon - normalizeLongitude(sunRow.longitude));
    solarDistanceDeg = Number(Math.min(rawDiff, 360 - rawDiff).toFixed(2));
    if (solarDistanceDeg <= 0.2833) {
      solarCondition = "cazimi";
    } else if (solarDistanceDeg <= 8.5) {
      solarCondition = "combust";
    } else if (solarDistanceDeg <= 17.0) {
      solarCondition = "under-the-beams";
    }
  }

  // Sect alignment
  let sectAlignment = "Not part of classical sect";
  if (planetRec) {
    if (planetRec.traditionalQualities.sect === "diurnal") {
      sectAlignment = isDayChart
        ? "In Sect (Diurnal planet in a Day Chart — more constructive, temperate, and supported)"
        : "Contrary to Sect (Diurnal planet in a Night Chart — works harder against the grain)";
    } else if (planetRec.traditionalQualities.sect === "nocturnal") {
      sectAlignment = !isDayChart
        ? "In Sect (Nocturnal planet in a Night Chart — more constructive, temperate, and supported)"
        : "Contrary to Sect (Nocturnal planet in a Day Chart — sharper and more reactive under pressure)";
    } else if (planetRec.traditionalQualities.sect === "participating") {
      const oriental =
        sunRow && normalizeLongitude(sunRow.longitude - lon) < 180;
      sectAlignment = oriental
        ? "Mercury Oriental (rises before the Sun — diurnal, proactive, and forthright)"
        : "Mercury Occidental (sets after the Sun — nocturnal, reflective, and analytical)";
    }
  }

  const house = row.house;
  const accidentalCondition = [1, 4, 7, 10].includes(house)
    ? `Angular in House ${house} (high accidental force and immediate visibility)`
    : [2, 5, 8, 11].includes(house)
      ? `Succedent in House ${house} (steady, stabilizing accidental strength)`
      : `Cadent in House ${house} (reflective, preparatory, or behind-the-scenes channel)`;

  const summaryParts = [
    essentialDignities.length
      ? `Dignities: ${essentialDignities.join(", ")}`
      : null,
    essentialDebilities.length
      ? `Debilities/Condition: ${essentialDebilities.join(", ")}`
      : null,
    `Terms: ${egyptianTermRuler ?? "—"} (Egyptian)${ptolemaicTermRuler && ptolemaicTermRuler !== egyptianTermRuler ? ` / ${ptolemaicTermRuler} (Ptolemaic)` : ""}`,
    `Face: ${chaldeanFaceRuler}`,
    solarCondition !== "free-of-solar-rays" && solarCondition !== "solar-source"
      ? `Solar status: ${solarCondition} (${solarDistanceDeg}° from Sun)`
      : null,
    row.retrograde && !/node/i.test(row.name) ? "Motion: Retrograde" : null,
  ].filter(Boolean);

  return {
    essentialDignities,
    essentialDebilities,
    egyptianTermRuler,
    ptolemaicTermRuler,
    chaldeanFaceRuler,
    dorotheanTriplicityRulers,
    solarCondition,
    solarDistanceDeg,
    sectAlignment,
    accidentalCondition,
    conditionSummary: summaryParts.join(" · "),
  };
}

/**
 * Deterministically detects traditional horary & natal mechanisms across the chart:
 * - Mutual & Unilateral Receptions
 * - Applying vs. Separating Aspects
 * - Translation of Light & Collection of Light
 * - Prohibition, Refranation, Frustration, Besiegement
 * - Cazimi, Combustion, Under the Beams, Retrograde, Void of Course Moon
 */
export function detectHoraryAndTraditionalMechanisms(
  chart: ChartResult,
  isDayChart: boolean
): DetectedTraditionalMechanism[] {
  const mechanisms: DetectedTraditionalMechanism[] = [];
  const classicalNames = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
  ];
  const classicalBodies = chart.movingBodies.filter(
    b => classicalNames.includes(b.name) && Number.isFinite(b.longitude)
  );

  const MEAN_SPEED: Record<string, number> = {
    Moon: 13.176,
    Mercury: 1.383,
    Venus: 1.2,
    Sun: 0.9856,
    Mars: 0.524,
    Jupiter: 0.083,
    Saturn: 0.0335,
  };

  const velocityOf = (row: ChartRow) => {
    const base = MEAN_SPEED[row.name] ?? 0.01;
    return row.retrograde ? -base * 0.5 : base;
  };

  const aspectAngles: Array<[number, string]> = [
    [0, "conjunction"],
    [60, "sextile"],
    [90, "square"],
    [120, "trine"],
    [180, "opposition"],
  ];

  type DetectedPairAspect = {
    fast: ChartRow;
    slow: ChartRow;
    aspect: string;
    orb: number;
    applying: boolean;
    timeToExact: number;
  };

  const pairAspects: DetectedPairAspect[] = [];

  const mapMechanismTradition = (
    id: HoraryMechanismRecord["id"]
  ): "western" | "arabic" => {
    const lineage = HORARY_MECHANISM_RECORDS[id].provenance.tradition;
    return lineage === "hellenistic" ? "western" : "arabic";
  };

  for (let i = 0; i < classicalBodies.length; i += 1) {
    for (let j = i + 1; j < classicalBodies.length; j += 1) {
      const a = classicalBodies[i];
      const b = classicalBodies[j];
      const speedA = Math.abs(velocityOf(a));
      const speedB = Math.abs(velocityOf(b));
      const fast = speedA >= speedB ? a : b;
      const slow = speedA >= speedB ? b : a;

      const lonFast = normalizeLongitude(fast.longitude);
      const lonSlow = normalizeLongitude(slow.longitude);
      const sep = Math.min(
        Math.abs(lonFast - lonSlow),
        360 - Math.abs(lonFast - lonSlow)
      );

      for (const [target, aspectName] of aspectAngles) {
        const orb = Math.abs(sep - target);
        if (orb <= 5) {
          // Determine applying vs separating by stepping 0.1 day forward
          const nextFast = normalizeLongitude(lonFast + velocityOf(fast) * 0.1);
          const nextSlow = normalizeLongitude(lonSlow + velocityOf(slow) * 0.1);
          const nextSep = Math.min(
            Math.abs(nextFast - nextSlow),
            360 - Math.abs(nextFast - nextSlow)
          );
          const nextOrb = Math.abs(nextSep - target);
          const applying = nextOrb < orb;
          const relSpeed = Math.max(0.01, Math.abs(velocityOf(fast) - velocityOf(slow)));
          const timeToExact = orb / relSpeed;

          pairAspects.push({
            fast,
            slow,
            aspect: aspectName,
            orb: Number(orb.toFixed(2)),
            applying,
            timeToExact,
          });

          const mechId = applying ? "applying-aspect" : "separating-aspect";
          const doctrine = TRADITIONAL_ASPECT_DOCTRINE[aspectName];
          const confidence: "high" | "moderate" = orb <= 2.5 ? "high" : "moderate";
          mechanisms.push({
            mechanismId: mechId,
            title: `${fast.name} ${applying ? "Applying" : "Separating"} ${aspectName} ${slow.name} (${orb.toFixed(2)}°)`,
            involvedBodies: [fast.name, slow.name],
            statement: `${fast.name} is ${applying ? "applying to" : "separating from"} a ${aspectName} with ${slow.name} at ${orb.toFixed(2)}° orb (${doctrine?.planetaryNature ?? "classical ray"}). ${applying ? "Applying aspects indicate an active, developing dynamic pressing toward culmination." : "Separating aspects indicate an already-formed imprint or prior experience informing the present."}`,
            epistemicCategory: "TRADITION",
            sourceTitle: HORARY_MECHANISM_RECORDS[mechId].provenance.sourceTitle,
            provenanceTradition: mapMechanismTradition(mechId),
            historicalLineage: HORARY_MECHANISM_RECORDS[mechId].provenance.tradition,
            confidence,
          });

          // Check Refranation (applying aspect where one body is retrograde)
          if (applying && (fast.retrograde || slow.retrograde)) {
            const retroBody = fast.retrograde ? fast.name : slow.name;
            mechanisms.push({
              mechanismId: "refranation",
              title: `Refranation / Retrograde Qualification (${fast.name}–${slow.name})`,
              involvedBodies: [fast.name, slow.name],
              statement: `${fast.name} and ${slow.name} are within ${orb.toFixed(2)}° of a ${aspectName}, while ${retroBody} is retrograde—indicating second thoughts, internal review, or holding back before full external commitment.`,
              epistemicCategory: "TRADITION",
              sourceTitle: HORARY_MECHANISM_RECORDS.refranation.provenance.sourceTitle,
              provenanceTradition: mapMechanismTradition("refranation"),
              historicalLineage: HORARY_MECHANISM_RECORDS.refranation.provenance.tradition,
              confidence,
            });
          }
        }
      }
    }
  }

  // Mutual & Unilateral Receptions (Domicile & Exaltation)
  for (let i = 0; i < classicalBodies.length; i += 1) {
    for (let j = i + 1; j < classicalBodies.length; j += 1) {
      const a = classicalBodies[i];
      const b = classicalBodies[j];
      const signA = ZODIAC_SIGNS[Math.floor(normalizeLongitude(a.longitude) / 30)];
      const signB = ZODIAC_SIGNS[Math.floor(normalizeLongitude(b.longitude) / 30)];
      const recA = SIGN_CANON_RECORDS[signA];
      const recB = SIGN_CANON_RECORDS[signB];
      if (!recA || !recB) continue;

      const bRulerOfA =
        recA.domicileLord === b.name
          ? "domicile"
          : recA.exaltation?.planet === b.name
            ? "exaltation"
            : null;
      const aRulerOfB =
        recB.domicileLord === a.name
          ? "domicile"
          : recB.exaltation?.planet === a.name
            ? "exaltation"
            : null;

      if (bRulerOfA && aRulerOfB) {
        mechanisms.push({
          mechanismId: "mutual-reception",
          title: `Mutual Reception between ${a.name} (${signA}) and ${b.name} (${signB})`,
          involvedBodies: [a.name, b.name],
          statement: `${a.name} in ${signA} and ${b.name} in ${signB} are in Mutual Reception by ${bRulerOfA}/${aRulerOfB}: each planet hosts and backs up the other, providing cooperative resilience and a constructive outlet under pressure.`,
          epistemicCategory: "TRADITION",
          sourceTitle: HORARY_MECHANISM_RECORDS["mutual-reception"].provenance.sourceTitle,
          provenanceTradition: mapMechanismTradition("mutual-reception"),
          historicalLineage: HORARY_MECHANISM_RECORDS["mutual-reception"].provenance.tradition,
          confidence: "high",
        });
      }
    }
  }

  // Translation of Light: fast planet F separates from A and applies to B
  for (const fast of classicalBodies) {
    const separatingFrom = pairAspects.filter(
      p => p.fast.name === fast.name && !p.applying
    );
    const applyingTo = pairAspects.filter(
      p => p.fast.name === fast.name && p.applying
    );
    for (const sep of separatingFrom) {
      for (const app of applyingTo) {
        if (sep.slow.name !== app.slow.name) {
          mechanisms.push({
            mechanismId: "translation-of-light",
            title: `Translation of Light by ${fast.name} (${sep.slow.name} → ${app.slow.name})`,
            involvedBodies: [fast.name, sep.slow.name, app.slow.name],
            statement: `${fast.name} separates from ${sep.aspect} ${sep.slow.name} (${sep.orb}°) and immediately applies to ${app.aspect} ${app.slow.name} (${app.orb}°), translating light and bridging those two planetary spheres.`,
            epistemicCategory: "TRADITION",
            sourceTitle: HORARY_MECHANISM_RECORDS["translation-of-light"].provenance.sourceTitle,
            provenanceTradition: mapMechanismTradition("translation-of-light"),
            historicalLineage: HORARY_MECHANISM_RECORDS["translation-of-light"].provenance.tradition,
            confidence: sep.orb <= 3 && app.orb <= 3 ? "high" : "moderate",
          });
        }
      }
    }
  }

  // Collection of Light: two faster bodies A and B both apply to slower body C
  for (const slow of classicalBodies) {
    const incoming = pairAspects.filter(
      p => p.slow.name === slow.name && p.applying
    );
    if (incoming.length >= 2) {
      for (let i = 0; i < incoming.length; i += 1) {
        for (let j = i + 1; j < incoming.length; j += 1) {
          const first = incoming[i].fast;
          const second = incoming[j].fast;
          const connectedDirectly = pairAspects.some(
            p =>
              (p.fast.name === first.name && p.slow.name === second.name) ||
              (p.fast.name === second.name && p.slow.name === first.name)
          );
          if (!connectedDirectly) {
            mechanisms.push({
              mechanismId: "collection-of-light",
              title: `Collection of Light by ${slow.name} (gathering ${first.name} & ${second.name})`,
              involvedBodies: [slow.name, first.name, second.name],
              statement: `Both ${first.name} and ${second.name} apply to slower ${slow.name}, which collects their light and unifies their separate agendas under ${slow.name}'s authority.`,
              epistemicCategory: "TRADITION",
              sourceTitle: HORARY_MECHANISM_RECORDS["collection-of-light"].provenance.sourceTitle,
              provenanceTradition: mapMechanismTradition("collection-of-light"),
              historicalLineage: HORARY_MECHANISM_RECORDS["collection-of-light"].provenance.tradition,
              confidence: incoming[i].orb <= 3 && incoming[j].orb <= 3 ? "high" : "moderate",
            });
          }
        }
      }
    }
  }

  // Prohibition & Frustration: when two bodies apply to the same target, the one that perfects first prohibits/frustrates the later one
  for (const target of classicalBodies) {
    const incoming = pairAspects
      .filter(p => (p.slow.name === target.name || p.fast.name === target.name) && p.applying)
      .sort((a, b) => a.timeToExact - b.timeToExact);
    if (incoming.length >= 2) {
      const earlier = incoming[0];
      const later = incoming[1];
      const interrupter =
        earlier.fast.name === target.name ? earlier.slow.name : earlier.fast.name;
      const delayed =
        later.fast.name === target.name ? later.slow.name : later.fast.name;
      if (interrupter !== delayed) {
        mechanisms.push({
          mechanismId: "prohibition",
          title: `Prohibition / Interception on ${target.name} (${interrupter} precedes ${delayed})`,
          involvedBodies: [target.name, interrupter, delayed],
          statement: `While ${delayed} is applying to ${target.name} (${later.aspect}, ${later.orb}°), ${interrupter} perfects its ${earlier.aspect} to ${target.name} first (${earlier.orb}°), introducing a competing priority or test before ${delayed}'s agenda completes.`,
          epistemicCategory: "TRADITION",
          sourceTitle: HORARY_MECHANISM_RECORDS.prohibition.provenance.sourceTitle,
          provenanceTradition: mapMechanismTradition("prohibition"),
          historicalLineage: HORARY_MECHANISM_RECORDS.prohibition.provenance.tradition,
          confidence: earlier.orb <= 3 ? "high" : "moderate",
        });
      }
    }
  }

  // Solar Conditions (Cazimi, Combustion, Under the Beams) & Retrograde
  for (const row of classicalBodies) {
    const cond = evaluatePlacementDignityAndCondition(row, chart, isDayChart);
    if (cond.solarCondition === "cazimi") {
      mechanisms.push({
        mechanismId: "cazimi",
        title: `${row.name} Cazimi (${cond.solarDistanceDeg}° from Sun)`,
        involvedBodies: [row.name, "Sun"],
        statement: `${row.name} is Cazimi in the heart of the Sun (${cond.solarDistanceDeg}°), extraordinarily fortified in clarity and authority.`,
        epistemicCategory: "TRADITION",
        sourceTitle: HORARY_MECHANISM_RECORDS.cazimi.provenance.sourceTitle,
        provenanceTradition: mapMechanismTradition("cazimi"),
        historicalLineage: HORARY_MECHANISM_RECORDS.cazimi.provenance.tradition,
        confidence: "high",
      });
    } else if (cond.solarCondition === "combust") {
      mechanisms.push({
        mechanismId: "combustion",
        title: `${row.name} Combust (${cond.solarDistanceDeg}° from Sun)`,
        involvedBodies: [row.name, "Sun"],
        statement: `${row.name} is Combust within ${cond.solarDistanceDeg}° of the Sun: its significations operate privately, under intense solar pressure, or require conscious separation from ego/authority pressure.`,
        epistemicCategory: "TRADITION",
        sourceTitle: HORARY_MECHANISM_RECORDS.combustion.provenance.sourceTitle,
        provenanceTradition: mapMechanismTradition("combustion"),
        historicalLineage: HORARY_MECHANISM_RECORDS.combustion.provenance.tradition,
        confidence: (cond.solarDistanceDeg ?? 8) <= 4 ? "high" : "moderate",
      });
    } else if (cond.solarCondition === "under-the-beams") {
      mechanisms.push({
        mechanismId: "under-the-beams",
        title: `${row.name} Under the Sun's Beams (${cond.solarDistanceDeg}° from Sun)`,
        involvedBodies: [row.name, "Sun"],
        statement: `${row.name} is Under the Sun's Beams (${cond.solarDistanceDeg}° from the Sun), working behind the scenes or in private preparation.`,
        epistemicCategory: "TRADITION",
        sourceTitle: HORARY_MECHANISM_RECORDS["under-the-beams"].provenance.sourceTitle,
        provenanceTradition: mapMechanismTradition("under-the-beams"),
        historicalLineage: HORARY_MECHANISM_RECORDS["under-the-beams"].provenance.tradition,
        confidence: "moderate",
      });
    }

    if (row.retrograde) {
      mechanisms.push({
        mechanismId: "retrograde-condition",
        title: `${row.name} Retrograde in ${row.display}`,
        involvedBodies: [row.name],
        statement: `${row.name} is Retrograde at ${row.display} (House ${row.house}): turns ${row.name}'s function inward toward reflection, revision, and self-reliance rather than automatic outward consensus.`,
        epistemicCategory: "TRADITION",
        sourceTitle: HORARY_MECHANISM_RECORDS["retrograde-condition"].provenance.sourceTitle,
        provenanceTradition: mapMechanismTradition("retrograde-condition"),
        historicalLineage: HORARY_MECHANISM_RECORDS["retrograde-condition"].provenance.tradition,
        confidence: "high",
      });
    }
  }

  return mechanisms;
}
