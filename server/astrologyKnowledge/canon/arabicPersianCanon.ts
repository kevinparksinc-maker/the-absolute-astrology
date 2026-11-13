import {
  formatLongitude,
  normalizeLongitude,
  ZODIAC_SIGNS,
} from "../../../shared/hybrid";
import type { ChartResult } from "../../astronomy";
import {
  EGYPTIAN_BOUNDS_TABLE,
  lookupBoundRuler,
  lookupChaldeanFaceRuler,
} from "./dignitiesAndHorary";
import { HOUSE_CANON_RECORDS } from "./housesAndFrames";
import { SIGN_CANON_RECORDS } from "./planetsAndSigns";
import type {
  ArabicPersianTraditionSummary,
  LotCanonRecord,
  ProvenanceRecord,
} from "./types";

/**
 * Distinct Medieval Arabic & Persian Author Lineages (preserving authorial differences rather than flattening under one generic label).
 */
export const MEDIEVAL_ARABIC_PERSIAN_LINEAGES: Record<
  string,
  {
    author: string;
    eraAndSchool: string;
    keyWorks: string[];
    distinctiveDoctrines: string[];
    provenance: ProvenanceRecord;
  }
> = {
  "masha-allah": {
    author: "Masha'allah ibn Athari (Messahalla)",
    eraAndSchool: "8th–early 9th Century CE · Early Abbasid Baghdad / Persian-Jewish lineage",
    keyWorks: ["On Reception (De Receptione)", "Book of Nativities", "On Conjunctions, Religions, and Peoples"],
    distinctiveDoctrines: [
      "Primary foundational architecture of Reception (by domicile and exaltation) and its power to reverse or mitigate impediment in interrogations.",
      "Sa'at al-Qiran (Mundane Saturn–Jupiter conjunctions across triplicities).",
    ],
    provenance: {
      tradition: "persian",
      sourceTitle: "Masha'allah, On Reception",
      authorOrEra: "c. 740–815 CE",
      epistemicCategory: "TRADITION",
    },
  },
  "sahl-ibn-bishr": {
    author: "Sahl ibn Bishr (Zael)",
    eraAndSchool: "9th Century CE · Khurasan / Baghdad School",
    keyWorks: ["The Introduction (al-Madkhal)", "The Fifty Judgments (Quinquaginta Praecepta)", "On Elections", "On Interrogations"],
    distinctiveDoctrines: [
      "Codified the 16 modes of perfection and impediment (Translation of Light, Collection of Light, Prohibition, Refranation, Frustration) for interrogational and electional judgment.",
      "Strict attention to the condition of the Moon and the Lord of the Ascendant in elections.",
    ],
    provenance: {
      tradition: "arabic",
      sourceTitle: "Sahl ibn Bishr, Works of Sahl ibn Bishr",
      authorOrEra: "c. 786–845 CE",
      epistemicCategory: "TRADITION",
    },
  },
  "abu-mashar": {
    author: "Abu Ma'shar al-Balkhi (Albumasar)",
    eraAndSchool: "9th Century CE · Balkh / Abbasid Baghdad (Encyclopedic Persian-Arabic Synthesis)",
    keyWorks: [
      "The Great Introduction to Astrology (Kitab al-Madkhal al-Kabir)",
      "The Book of Religions and Dynasties (On the Great Conjunctions)",
      "On the Revolutions of the Years of Nativities",
    ],
    distinctiveDoctrines: [
      "Comprehensive system of Arabic Lots (Sahm / Siham), Firdaria planetary period rulers, and annual revolutions combined with profections.",
      "Preserved both Hellenistic (Valens/Ptolemy) and Persian (Zij al-Shah) timing methods while distinguishing their formulas.",
    ],
    provenance: {
      tradition: "persian",
      sourceTitle: "Abu Ma'shar, Great Introduction (VI–VIII)",
      authorOrEra: "787–886 CE",
      epistemicCategory: "TRADITION",
    },
  },
  "al-qabisi": {
    author: "Al-Qabisi (Alcabitius)",
    eraAndSchool: "10th Century CE · Aleppo / Hamdanid Court",
    keyWorks: ["Introduction to the Art of Judgments of the Stars (al-Madkhal ila Sina'at Ahkam al-Nujum)"],
    distinctiveDoctrines: [
      "Standardized the semi-arc quadrant house division (Alcabitius houses) and concise tabular presentation of Lots, essential dignities, and Firdaria.",
    ],
    provenance: {
      tradition: "arabic",
      sourceTitle: "Al-Qabisi, Introduction to Astrology",
      authorOrEra: "10th Century CE",
      epistemicCategory: "TRADITION",
    },
  },
  "al-biruni": {
    author: "Abu Rayhan al-Biruni",
    eraAndSchool: "11th Century CE · Khwarazm / Ghaznavid Court (Mathematical & Comparative Astronomy/Astrology)",
    keyWorks: ["The Book of Instruction in the Elements of the Art of Astrology (Kitab al-Tafhim)", "Al-Qanun al-Mas'udi"],
    distinctiveDoctrines: [
      "Rigorous mathematical comparison of Greek, Persian, and Indian (Jyotish) astrological techniques, preserving distinct Lot tables and planetary strength tallies without conflating them.",
    ],
    provenance: {
      tradition: "persian",
      sourceTitle: "Al-Biruni, Book of Instruction (Kitab al-Tafhim)",
      authorOrEra: "973–1048 CE",
      epistemicCategory: "TRADITION",
    },
  },
  "ibn-ezra-and-bonatti": {
    author: "Abraham Ibn Ezra & Guido Bonatti",
    eraAndSchool: "12th–13th Century CE · Andalusian/Hebrew & Italian Latin Transmission",
    keyWorks: ["Ibn Ezra, Beginning of Wisdom & Book of Nativities", "Bonatti, Liber Astronomiae"],
    distinctiveDoctrines: [
      "Formalized Almuten Figuris (the overarching sovereign planet of the chart by compound dignity points across Sun, Moon, Ascendant, Lot of Fortune, and prenatal Lunation).",
    ],
    provenance: {
      tradition: "medieval",
      sourceTitle: "Ibn Ezra, Book of Nativities; Guido Bonatti, Liber Astronomiae",
      authorOrEra: "12th–13th Century CE",
      epistemicCategory: "TRADITION",
    },
  },
};

/**
 * Extended Historical Arabic & Persian Lots (Siham) with Day/Night reversals and Source Variants preserved
 */
export const EXTENDED_ARABIC_LOTS_CANON: LotCanonRecord[] = [
  {
    id: "lot-of-substance",
    name: "Lot of Substance & Livelihood (Sahm al-Mal)",
    dayFormula: "Ascendant + Cusp/Lord of 2nd House − Significator of 2nd (or Asc + 2nd Cusp − 2nd Lord)",
    nightFormula: "Ascendant + Cusp/Lord of 2nd House − Significator of 2nd (unreversed in Abu Ma'shar; reversed in some later Latin lists)",
    associatedPlanet: "Jupiter",
    traditionalMeaning:
      "Indicates the tangible means of sustenance, movable goods, and how livelihood is acquired and stewarded.",
    psychologicalMeaning:
      "[MODERN_SYNTHESIS] Your felt relationship to material security and self-provisioning.",
    horaryAndNatalUse:
      "Evaluated alongside the 2nd house and its lord to judge financial flow and material backing.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Abu Ma'shar, Great Introduction VIII.4; Al-Qabisi",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote:
        "Paul of Alexandria calculates from Asc + 2nd Sign − 2nd Lord; Abu Ma'shar notes unreversed usage across day and night.",
    },
  },
  {
    id: "lot-of-father",
    name: "Lot of the Father (Sahm al-Ab)",
    dayFormula: "Ascendant + Saturn − Sun",
    nightFormula: "Ascendant + Sun − Saturn",
    associatedPlanet: "Sun",
    traditionalMeaning:
      "Signifies the father, paternal lineage, authority figures, and inherited relationship to structure.",
    psychologicalMeaning:
      "[MODERN_SYNTHESIS] How you internalize paternal authority, standards, and structural expectations.",
    horaryAndNatalUse:
      "Exception rule (Abu Ma'shar / Valens): if Saturn is Under the Sun's Beams (within 17° of Sun), the formula shifts to Ascendant + Jupiter − Mars (Day) / Ascendant + Mars − Jupiter (Night).",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Vettius Valens; Abu Ma'shar, Great Introduction VIII; Al-Biruni",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote:
        "Preserves the classical Under-the-Beams substitution rule when Saturn is combust/under beams.",
    },
  },
  {
    id: "lot-of-mother",
    name: "Lot of the Mother (Sahm al-Umm)",
    dayFormula: "Ascendant + Moon − Venus",
    nightFormula: "Ascendant + Venus − Moon",
    associatedPlanet: "Moon",
    traditionalMeaning:
      "Signifies the mother, maternal lineage, early nurture, and domestic matrix.",
    psychologicalMeaning:
      "[MODERN_SYNTHESIS] The somatic imprint of early care, belonging, and emotional safety.",
    horaryAndNatalUse:
      "Evaluated with its domicile lord to understand maternal lineage and domestic conditioning.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Vettius Valens; Abu Ma'shar, Great Introduction VIII",
      epistemicCategory: "TRADITION",
    },
  },
  {
    id: "lot-of-marriage-authority",
    name: "Lot of Marriage (Valens Universal vs. Abu Ma'shar Sect/Gender Variants)",
    dayFormula: "Ascendant + Venus − Saturn (Valens universal & Abu Ma'shar Men's Lot)",
    nightFormula: "Ascendant + Saturn − Venus (Valens nocturnal reversal; Abu Ma'shar Women's Lot uses Asc + Saturn − Venus)",
    associatedPlanet: "Venus",
    traditionalMeaning:
      "The structural bond of marriage, covenant partnership, and how affection (Venus) meets long-term commitment (Saturn).",
    psychologicalMeaning:
      "[MODERN_SYNTHESIS] Where romantic desire and real-world accountability meet in partnership.",
    horaryAndNatalUse:
      "Preserves both Valens's sect-reversible Lot and Abu Ma'shar's unreversed gender/covenant lots ( plus Al-Qabisi's 7th-cusp Lot: Asc + 7th Cusp − Venus).",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Vettius Valens; Abu Ma'shar, Great Introduction VIII; Al-Qabisi",
      epistemicCategory: "SCHOOL_VARIANT",
      disputedOrVariantNote:
        "Valens reverses by Day/Night sect; Abu Ma'shar distinguishes Asc+Venus−Saturn vs Asc+Saturn−Venus by subject; Al-Qabisi also records Asc+Descendant−Venus.",
    },
  },
  {
    id: "lot-of-exaltation",
    name: "Lot of Exaltation / Eminence (Sahm al-Sharaf)",
    dayFormula: "Ascendant + 19° Aries (Exaltation of Sun) − Sun",
    nightFormula: "Ascendant + 3° Taurus (Exaltation of Moon) − Moon",
    associatedPlanet: "Sun",
    traditionalMeaning:
      "Marks areas of high distinction, noble recognition, or where the native rises above baseline circumstances.",
    psychologicalMeaning:
      "[MODERN_SYNTHESIS] Where you feel called to step into excellence and unmistakable dignity.",
    horaryAndNatalUse:
      "Used in Hellenistic and Persian nativities to judge eminence and public distinction.",
    provenance: {
      tradition: "persian",
      sourceTitle: "Vettius Valens; Abu Ma'shar; Al-Biruni, Kitab al-Tafhim",
      epistemicCategory: "TRADITION",
    },
  },
];

const DIURNAL_FIRDARIA: Array<{ planet: string; years: number }> = [
  { planet: "Sun", years: 10 },
  { planet: "Venus", years: 8 },
  { planet: "Mercury", years: 13 },
  { planet: "Moon", years: 9 },
  { planet: "Saturn", years: 11 },
  { planet: "Jupiter", years: 12 },
  { planet: "Mars", years: 7 },
  { planet: "North Node", years: 3 },
  { planet: "South Node", years: 2 },
];

const NOCTURNAL_FIRDARIA_STANDARD: Array<{ planet: string; years: number }> = [
  { planet: "Moon", years: 9 },
  { planet: "Saturn", years: 11 },
  { planet: "Jupiter", years: 12 },
  { planet: "Mars", years: 7 },
  { planet: "Sun", years: 10 },
  { planet: "Venus", years: 8 },
  { planet: "Mercury", years: 13 },
  { planet: "North Node", years: 3 },
  { planet: "South Node", years: 2 },
];

/**
 * Evaluates the Medieval Arabic & Persian Tradition System:
 * - Firdaria (75-year Persian/Arabic planetary periods with 1/7th sub-periods, preserving Diurnal vs Nocturnal variants)
 * - Almuten Figuris (Ibn Ezra / Bonatti compound dignity sovereign over Sun, Moon, Ascendant, and Lot of Fortune)
 * - Extended Lots with their Domicile Lords and House placements
 * - The 4 Historical Branches (Nativities, Elections, Interrogations, and Mundane Conjunctions/Ingresses)
 */
export function evaluateArabicPersianTradition(
  chart: ChartResult,
  isDayChart: boolean
): ArabicPersianTraditionSummary {
  const sect: ArabicPersianTraditionSummary["sect"] = !chart.agentViewAvailable
    ? "god-view-unsected"
    : isDayChart
      ? "day"
      : "night";

  // 1. Firdaria Calculation
  const seq = isDayChart ? DIURNAL_FIRDARIA : NOCTURNAL_FIRDARIA_STANDARD;
  const birthTimeMs = chart.utc ? new Date(chart.utc).getTime() : NaN;
  const refTimeMs = chart.transitDate ? new Date(chart.transitDate).getTime() : Date.now();
  let currentMajorLord: string | undefined;
  let currentSubLord: string | undefined;
  let activeAge: number | undefined;

  if (Number.isFinite(birthTimeMs) && refTimeMs >= birthTimeMs) {
    activeAge = Number(((refTimeMs - birthTimeMs) / (365.2425 * 86400 * 1000)).toFixed(1));
    const cycleAge = activeAge % 75;
    let acc = 0;
    for (let i = 0; i < seq.length; i += 1) {
      const item = seq[i];
      if (cycleAge <= acc + item.years) {
        currentMajorLord = item.planet;
        if (item.planet === "North Node" || item.planet === "South Node") {
          currentSubLord = item.planet;
        } else {
          const sevenPlanets = seq.filter(
            s => s.planet !== "North Node" && s.planet !== "South Node"
          );
          const startIdx = sevenPlanets.findIndex(s => s.planet === item.planet);
          const subSpan = item.years / 7;
          const intoMajor = cycleAge - acc;
          const subOffset = Math.min(6, Math.floor(intoMajor / subSpan));
          currentSubLord = sevenPlanets[(startIdx + subOffset) % 7]?.planet ?? item.planet;
        }
        break;
      }
      acc += item.years;
    }
  }

  // 2. Almuten Figuris (Compound Essential + Accidental Dignity Tally across Sun, Moon, Ascendant, Lot of Fortune)
  const classical7 = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  const scores: Record<string, number> = {
    Sun: 0,
    Moon: 0,
    Mercury: 0,
    Venus: 0,
    Mars: 0,
    Jupiter: 0,
    Saturn: 0,
  };

  const scorePoint = (lon: number) => {
    const L = normalizeLongitude(lon);
    const sign = ZODIAC_SIGNS[Math.floor(L / 30)];
    const deg = L % 30;
    const signRec = SIGN_CANON_RECORDS[sign];
    if (!signRec) return;
    if (scores[signRec.domicileLord] !== undefined) scores[signRec.domicileLord] += 5;
    if (signRec.exaltation && scores[signRec.exaltation.planet] !== undefined) {
      scores[signRec.exaltation.planet] += 4;
    }
    const trip = signRec.triplicityLords.dorothean;
    if (scores[trip.day] !== undefined) scores[trip.day] += 3;
    if (scores[trip.night] !== undefined) scores[trip.night] += 3;
    if (scores[trip.participating] !== undefined) scores[trip.participating] += 3;
    const term = lookupBoundRuler(EGYPTIAN_BOUNDS_TABLE, sign, deg);
    if (term && scores[term] !== undefined) scores[term] += 2;
    const face = lookupChaldeanFaceRuler(L);
    if (face && scores[face] !== undefined) scores[face] += 1;
  };

  const sunRow = chart.movingBodies.find(b => b.name === "Sun");
  const moonRow = chart.movingBodies.find(b => b.name === "Moon");
  const ascLon =
    chart.ascendant && Number.isFinite(chart.ascendant.longitude)
      ? normalizeLongitude(chart.ascendant.longitude)
      : 0;

  if (sunRow) scorePoint(sunRow.longitude);
  if (moonRow) scorePoint(moonRow.longitude);
  if (chart.ascendant) scorePoint(ascLon);

  const fortuneLon =
    sunRow && moonRow
      ? normalizeLongitude(
          isDayChart
            ? ascLon + moonRow.longitude - sunRow.longitude
            : ascLon + sunRow.longitude - moonRow.longitude
        )
      : ascLon;
  scorePoint(fortuneLon);

  // Add accidental house scores for the 7 classical planets (Ibn Ezra / Bonatti house weights)
  const houseScoreMap: Record<number, number> = {
    1: 12, 10: 11, 7: 10, 4: 9, 11: 8, 5: 7, 2: 6, 9: 5, 8: 4, 3: 3, 6: 2, 12: 1,
  };
  for (const b of chart.movingBodies) {
    if (scores[b.name] !== undefined) {
      scores[b.name] += houseScoreMap[b.house] ?? 3;
    }
  }

  const sortedAlmuten = [...classical7].sort((a, b) => scores[b] - scores[a]);
  const winnerPlanet = sortedAlmuten[0] ?? "Sun";

  // 3. Calculate Extended Lots & their Domicile Lords
  const getLon = (name: string) => {
    const r = chart.movingBodies.find(b => b.name === name);
    return r ? normalizeLongitude(r.longitude) : undefined;
  };
  const houseOfLon = (lon: number) => {
    if (!chart.agentViewAvailable) return Math.floor(normalizeLongitude(lon) / 30) + 1;
    const ascSignIdx = Math.floor(ascLon / 30);
    const targetSignIdx = Math.floor(normalizeLongitude(lon) / 30);
    return ((targetSignIdx - ascSignIdx + 12) % 12) + 1;
  };

  const satLon = getLon("Saturn") ?? 0;
  const jupLon = getLon("Jupiter") ?? 0;
  const marLon = getLon("Mars") ?? 0;
  const venLon = getLon("Venus") ?? 0;
  const sLon = sunRow ? normalizeLongitude(sunRow.longitude) : 0;
  const mLon = moonRow ? normalizeLongitude(moonRow.longitude) : 0;

  // Check if Saturn is under the Sun's beams (within 17°) for Lot of the Father substitution
  const satSunDist = Math.min(Math.abs(satLon - sLon), 360 - Math.abs(satLon - sLon));
  const satUnderBeams = satSunDist <= 17;

  const secondCuspLon = normalizeLongitude(ascLon + 30);
  const secondSign = ZODIAC_SIGNS[Math.floor(secondCuspLon / 30)];
  const secondLord = SIGN_CANON_RECORDS[secondSign]?.domicileLord ?? "Venus";
  const secondLordLon = getLon(secondLord) ?? secondCuspLon;

  const lotCoords: Array<{ lot: LotCanonRecord; lon: number; variantNote?: string }> = [
    {
      lot: EXTENDED_ARABIC_LOTS_CANON[0], // Substance
      lon: normalizeLongitude(ascLon + secondCuspLon - secondLordLon),
    },
    {
      lot: EXTENDED_ARABIC_LOTS_CANON[1], // Father
      lon: satUnderBeams
        ? normalizeLongitude(isDayChart ? ascLon + jupLon - marLon : ascLon + marLon - jupLon)
        : normalizeLongitude(isDayChart ? ascLon + satLon - sLon : ascLon + sLon - satLon),
      variantNote: satUnderBeams
        ? "Saturn is within 17° of the Sun (Under the Beams), so Abu Ma'shar's classical Jupiter/Mars substitution formula was applied."
        : "Standard Sun/Saturn formula applied.",
    },
    {
      lot: EXTENDED_ARABIC_LOTS_CANON[2], // Mother
      lon: normalizeLongitude(isDayChart ? ascLon + mLon - venLon : ascLon + venLon - mLon),
    },
    {
      lot: EXTENDED_ARABIC_LOTS_CANON[3], // Marriage
      lon: normalizeLongitude(isDayChart ? ascLon + venLon - satLon : ascLon + satLon - venLon),
      variantNote: `Valens sect-adjusted formula (${isDayChart ? "Day: Asc + Venus − Saturn" : "Night: Asc + Saturn − Venus"}); Al-Qabisi 7th-cusp variant falls at ${formatLongitude(normalizeLongitude(ascLon + normalizeLongitude(ascLon + 180) - venLon))}.`,
    },
    {
      lot: EXTENDED_ARABIC_LOTS_CANON[4], // Exaltation
      lon: normalizeLongitude(isDayChart ? ascLon + 19 - sLon : ascLon + 33 - mLon),
    },
  ];

  const extendedLots = lotCoords.map(({ lot, lon, variantNote }) => {
    const sign = ZODIAC_SIGNS[Math.floor(lon / 30)];
    const house = houseOfLon(lon);
    const lord = SIGN_CANON_RECORDS[sign]?.domicileLord ?? "Sun";
    const lordRow = chart.movingBodies.find(b => b.name === lord);
    const lordHouse = lordRow?.house ?? house;
    const hRec = HOUSE_CANON_RECORDS[house];
    return {
      lot,
      longitude: Number(lon.toFixed(4)),
      display: formatLongitude(lon),
      sign,
      house,
      lord,
      lordHouse,
      houseInterpretation: `${lot.name} falls in ${sign} (House ${house} — ${hRec?.traditionalTitle ?? "life domain"}), while its domicile lord ${lord} sits in House ${lordHouse}, linking ${lot.traditionalMeaning.toLowerCase()} directly to House ${lordHouse} execution.`,
      variantNote,
    };
  });

  return {
    sect,
    firdariaSystem: {
      variantUsed: "Abu Ma'shar / Alcabitius Standard",
      currentMajorLord,
      currentSubLord,
      activeAge,
      explanation: currentMajorLord
        ? `[TRADITION · Persian/Arabic Firdaria (${isDayChart ? "Diurnal Sun-led sequence" : "Nocturnal Moon-led sequence"})] At age ${activeAge}, the native is in the Major Firdaria of ${currentMajorLord} and Sub-period of ${currentSubLord ?? currentMajorLord}. ${currentMajorLord} sets the multi-year chapter theme while ${currentSubLord ?? currentMajorLord} colors the immediate sub-chapter.`
        : `[TRADITION · Persian/Arabic Firdaria] ${isDayChart ? "Diurnal charts begin with Sun (10y) → Venus (8y) → Mercury (13y) → Moon (9y) → Saturn (11y) → Jupiter (12y) → Mars (7y) → Nodes (5y)." : "Nocturnal charts begin with Moon (9y) → Saturn (11y) → Jupiter (12y) → Mars (7y) → Sun (10y) → Venus (8y) → Mercury (13y) → Nodes (5y) (Abu Ma'shar/Alcabitius standard; variant nocturnal order places Nodes before Sun)."}`,
      provenance: MEDIEVAL_ARABIC_PERSIAN_LINEAGES["abu-mashar"].provenance,
    },
    almutenFiguris: {
      winnerPlanet,
      scores,
      explanation: `[TRADITION · Ibn Ezra & Bonatti Almuten Figuris] Across the five hylegical/essential pillars (Sun, Moon, Ascendant, Lot of Fortune, and Accidental House force), ${winnerPlanet} holds the highest compound authority (${scores[winnerPlanet]} pts), acting as the overarching Guardian/Sovereign planet of the chart.`,
      provenance: MEDIEVAL_ARABIC_PERSIAN_LINEAGES["ibn-ezra-and-bonatti"].provenance,
    },
    extendedLots,
    branchDoctrines: {
      nativities:
        "Mawalid (Nativities — Masha'allah, Abu Ma'shar, Ibn Ezra): Evaluates temperament, Almuten Figuris, Lots and their domicile lords, and time-lords (Firdaria, Profections, Solar Revolutions, Primary Directions).",
      elections:
        "Ikhtiyarat (Elections — Sahl ibn Bishr, Al-Biruni): Selects an auspicious time by fortifying the Moon, the Ascendant and its lord, and the House/Significator of the intended enterprise, while avoiding Moon Void of Course, Combustion, and Malefic Prohibition.",
      interrogations:
        "Masa'il (Horary Interrogations — Masha'allah, Sahl ibn Bishr): Judges a specific question by matching Querent (1st Lord + Moon) and Quesited (Target House Lord) for Perfection via Applying Aspect, Reception, Translation of Light, or Collection of Light, weighed against Prohibition, Refranation, and Frustration.",
      mundaneIngressesAndConjunctions:
        "Tahawil al-Sinin & Qiranat (Mundane — Masha'allah, Abu Ma'shar): Evaluates the Sun's Vernal Ingress into 0° Aries alongside the 20-year, 240-year (Triplicity shift), and 960-year Saturn–Jupiter Great Conjunctions.",
    },
  };
}
