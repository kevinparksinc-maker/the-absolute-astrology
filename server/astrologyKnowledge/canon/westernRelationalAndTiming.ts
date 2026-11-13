import { normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import type { ChartResult, ChartRow } from "../../astronomy";
import {
  EGYPTIAN_BOUNDS_TABLE,
  evaluatePlacementDignityAndCondition,
  lookupBoundRuler,
  PTOLEMAIC_BOUNDS_TABLE,
  TRADITIONAL_ASPECT_DOCTRINE,
} from "./dignitiesAndHorary";
import { HOUSE_CANON_RECORDS } from "./housesAndFrames";
import { PLANET_CANON_RECORDS, SIGN_CANON_RECORDS } from "./planetsAndSigns";
import type {
  DispositorChainNode,
  ProvenanceRecord,
  RelationalHouseChainSynthesis,
  WesternTimingActivationRecord,
} from "./types";

/**
 * Complete Language of Planetary Relationships & Condition vs. Delivery Doctrine
 */
export const PLANETARY_RELATIONSHIP_DOCTRINE: Record<
  string,
  {
    name: string;
    definition: string;
    classicalMechanism: string;
    humanRealityMeaning: string;
    provenance: ProvenanceRecord;
  }
> = {
  "maltreatment-vs-bonification": {
    name: "Maltreatment (Kakōsis) vs. Bonification (Agathopoiēsis)",
    definition:
      "How a planet is strengthened, supported, obstructed, or redirected by the rays of benefics (Jupiter/Venus) versus malefics (Saturn/Mars), strongly modified by Sect and Reception.",
    classicalMechanism:
      "An unreceived square, opposition, or conjunction from an out-of-sect malefic obstructs or delays outward delivery (Kakōsis). When that same malefic receives the planet by domicile or exaltation—or is in sect—obstruction converts into disciplined structure, rigor, or strategic redirection.",
    humanRealityMeaning:
      "Why pressure in a chart does not automatically equal failure: an aspect from Saturn with reception looks like a demanding mentor, strict professional standard, or hard-won mastery rather than sheer blockage.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos; Vettius Valens, Anthology; Antiochus of Athens",
      authorOrEra: "1st–2nd Century CE",
      epistemicCategory: "TRADITION",
    },
  },
  "inherent-dignity-vs-house-delivery": {
    name: "Inherent Essential Dignity vs. Accidental House Delivery",
    definition:
      "Distinguishes a planet's internal quality/integrity (essential dignity: domicile, exaltation, triplicity, bound, face) from its situational power to act outwardly in the world (house angularity, solar visibility, and relationship to its dispositor).",
    classicalMechanism:
      "A planet in Domicile or Exaltation placed in a Cadent house (6th, 8th, 12th) or Combust possesses high internal capability and noble intent, yet acts behind the scenes, in private institutions, or after delay. Conversely, a Peregrine or Debilitated planet on an Angle (1st, 10th) has loud, immediate public impact but must work with unconventional or strained resources.",
    humanRealityMeaning:
      "Explains why someone can have extraordinary inner talent or qualifications (high essential dignity) yet feel unseen or redirected into private/research/crisis roles (cadent house or combustion), or vice versa.",
    provenance: {
      tradition: "medieval",
      sourceTitle: "Abu Ma'shar, Great Introduction; Guido Bonatti, Liber Astronomiae; William Lilly, Christian Astrology",
      epistemicCategory: "TRADITION",
    },
  },
  "dispositor-and-host-hospitality": {
    name: "Dispositor Chains & Host Hospitality",
    definition:
      "Every planet (unless in its own domicile) is a guest in the sign of another planet (its domicile lord / dispositor). The host planet's condition and sightline determine how well the guest planet's agenda is resourced.",
    classicalMechanism:
      "If Planet A sits in the sign of Planet B, and Planet B beholds Planet A by classical aspect (reception), B supplies A with resources. If B is in aversion (2nd, 6th, 8th, 12th sign from A), the guest planet operates without direct oversight or support from its landlord.",
    humanRealityMeaning:
      "Shows which core drive in your chart ultimately calls the shots (Final Dispositor) or whether two drives co-govern through a Mutual Reception alliance.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Masha'allah, On Reception; Sahl ibn Bishr, Introduction",
      epistemicCategory: "TRADITION",
    },
  },
};

export const WESTERN_TIMING_DOCTRINE_LIBRARY: Record<
  WesternTimingActivationRecord["techniqueId"],
  {
    name: string;
    eraClassification: WesternTimingActivationRecord["eraClassification"];
    definition: string;
    howItActivatesNatalPromise: string;
    provenance: ProvenanceRecord;
  }
> = {
  "annual-profection": {
    name: "Annual Profections (Circumambulation of the Year)",
    eraClassification: "hellenistic-medieval",
    definition:
      "Advances the Ascendant by 1 sign (1 house) per completed year of life (Age 0 = 1st house, Age 1 = 2nd house, Age 12 = 1st house, Age 24 = 1st house, Age 36 = 1st house, etc.).",
    howItActivatesNatalPromise:
      "The domicile lord of the profected sign becomes the Lord of the Year (Chronocrator). It wakes up the natal promise of (1) the profected house, (2) the houses ruled by the Lord of the Year, and (3) the natal house where the Lord of the Year sits. Transits to and from the Lord of the Year carry primary weight during that year.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Vettius Valens, Anthology IV; Paulus Alexandrinus; Abu Ma'shar, On Solar Revolutions",
      epistemicCategory: "TRADITION",
    },
  },
  "zodiacal-releasing": {
    name: "Zodiacal Releasing (Aphesis from Lot of Fortune / Spirit)",
    eraClassification: "hellenistic-medieval",
    definition:
      "Hellenistic time-lord system of Vettius Valens dividing life into major (L1), sub (L2), and sub-sub (L3) chapters starting from the Lot of Fortune (bodily/circumstantial fate) or Lot of Spirit (career/volitional direction) using planetary period lengths.",
    howItActivatesNatalPromise:
      "Signs angular to the Lot of Fortune/Spirit mark peak intensity and public turning points; 'Loosing of the Bond' (Sundesmos) marks major directional pivots where long-standing career or life structures reorganize.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Vettius Valens, Anthology Book IV",
      authorOrEra: "2nd Century CE",
      epistemicCategory: "TRADITION",
    },
  },
  "primary-directions": {
    name: "Primary Directions (Equatorial Circumambulation)",
    eraClassification: "hellenistic-medieval",
    definition:
      "Moves natal significators (Ascendant, Midheaven, Sun, Moon, Lot of Fortune) along the celestial equator by diurnal rotation (1° of Right Ascension / Oblique Ascension ≈ 1 year of life, Ptolemy key) to the bodies, aspects, and bounds (terms) of promissors.",
    howItActivatesNatalPromise:
      "As the Ascendant or Midheaven directs through the Egyptian or Ptolemaic bounds of each sign, the Bound Lord becomes the Division/Distributor Lord, while exact hits to natal planets trigger structural milestone events promised in the radix.",
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Ptolemy, Tetrabiblos III.10; Dorotheus of Sidon; Al-Qabisi",
      epistemicCategory: "TRADITION",
    },
  },
  "solar-return": {
    name: "Solar Return (Annual Revolution of the Nativity)",
    eraClassification: "hellenistic-medieval",
    definition:
      "Chart cast for the exact moment the transiting Sun returns to its exact natal ecliptic longitude each year.",
    howItActivatesNatalPromise:
      "A Solar Return cannot override the natal promise; instead, the condition of the Annual Profection Lord (Lord of the Year) inside the Solar Return chart—and the natal house brought to the Solar Return Ascendant—shows how that year's chapter manifests.",
    provenance: {
      tradition: "arabic",
      sourceTitle: "Abu Ma'shar, On the Revolutions of the Years of Nativities; Sahl ibn Bishr",
      epistemicCategory: "TRADITION",
    },
  },
  "secondary-progressions": {
    name: "Secondary Progressions (Day-for-a-Year Symbolic Timing)",
    eraClassification: "modern-secondary",
    definition:
      "Symbolic equivalence where 1 solar day of ephemeris motion after birth corresponds to 1 tropical year of life (Progressed Sun moves ~1°/year; Progressed Moon moves ~1°/month through signs and houses).",
    howItActivatesNatalPromise:
      "Clearly separated from Hellenistic/medieval time-lord techniques: tracks internal psychological maturation, evolving emotional climate (Progressed Moon phase), and when a natal configuration ripens from within.",
    provenance: {
      tradition: "modern-psychological",
      sourceTitle: "Placidus de Titis (17th C. precursor); Alan Leo; Dane Rudhyar (Modern Psychological Timing)",
      epistemicCategory: "MODERN_SYNTHESIS",
    },
  },
};

const CLASSICAL_7 = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
];

/**
 * Builds complete Dispositor Chains & Reception/Condition-vs-Delivery diagnostics for all classical placements.
 */
export function buildDispositorChains(
  chart: ChartResult,
  isDayChart: boolean
): DispositorChainNode[] {
  const bodies = chart.movingBodies.filter(
    b => CLASSICAL_7.includes(b.name) && Number.isFinite(b.longitude)
  );
  const byName = new Map<string, ChartRow>();
  for (const b of bodies) byName.set(b.name, b);

  const lordOf = (planetName: string): string | null => {
    const row = byName.get(planetName);
    if (!row) return null;
    const sign = ZODIAC_SIGNS[Math.floor(normalizeLongitude(row.longitude) / 30)];
    return SIGN_CANON_RECORDS[sign]?.domicileLord ?? null;
  };

  return bodies.map(row => {
    const lon = normalizeLongitude(row.longitude);
    const sign = ZODIAC_SIGNS[Math.floor(lon / 30)];
    const degInSign = lon % 30;
    const signRec = SIGN_CANON_RECORDS[sign];
    const domicileLord = signRec?.domicileLord ?? "Sun";
    const exaltationLord = signRec?.exaltation?.planet ?? null;
    const termLordEgyptian = lookupBoundRuler(EGYPTIAN_BOUNDS_TABLE, sign, degInSign);
    const termLordPtolemaic = lookupBoundRuler(PTOLEMAIC_BOUNDS_TABLE, sign, degInSign);

    // Trace chain up to 8 steps
    const chain: string[] = [row.name];
    const visited = new Set<string>([row.name]);
    let current = row.name;
    let finalDispositor: string | null = null;
    let inMutualReceptionLoop = false;
    let loopMembers: string[] = [];

    for (let step = 0; step < 8; step += 1) {
      const next = lordOf(current);
      if (!next) break;
      if (next === current) {
        finalDispositor = current;
        break;
      }
      chain.push(next);
      if (visited.has(next)) {
        const loopStart = chain.indexOf(next);
        loopMembers = chain.slice(loopStart, chain.length - 1);
        inMutualReceptionLoop = loopMembers.length === 2;
        break;
      }
      visited.add(next);
      current = next;
    }

    // Check sightline/reception with domicile lord
    let receptionWithLord: DispositorChainNode["receptionWithLord"] = "unreceived-aspect";
    if (domicileLord === row.name) {
      receptionWithLord = "domicile-self";
    } else {
      const lordRow = byName.get(domicileLord);
      if (lordRow) {
        const signIdxA = Math.floor(lon / 30);
        const signIdxB = Math.floor(normalizeLongitude(lordRow.longitude) / 30);
        const signDist = Math.min(
          Math.abs(signIdxA - signIdxB),
          12 - Math.abs(signIdxA - signIdxB)
        );
        const lordSign = ZODIAC_SIGNS[signIdxB];
        const lordSignLord = SIGN_CANON_RECORDS[lordSign]?.domicileLord;
        if (lordSignLord === row.name) {
          receptionWithLord = "mutual-reception";
        } else if ([0, 2, 3, 4, 6].includes(signDist)) {
          receptionWithLord = "aspect-with-reception";
        } else {
          receptionWithLord = "aversion-to-lord";
        }
      }
    }

    const cond = evaluatePlacementDignityAndCondition(row, chart, isDayChart);
    const hasEssential = cond.essentialDignities.length > 0;
    const isAngular = [1, 4, 7, 10].includes(row.house);
    const isCadent = [3, 6, 9, 12].includes(row.house);

    let conditionVsDeliveryNote = "";
    if (hasEssential && isAngular && cond.solarCondition === "free-of-solar-rays") {
      conditionVsDeliveryNote = `${row.name} combines strong inherent dignity (${cond.essentialDignities[0]}) with angular accidental power (House ${row.house}) and clear solar visibility: high capacity both to conceive and to deliver visibly.`;
    } else if (hasEssential && (isCadent || cond.solarCondition === "combust")) {
      conditionVsDeliveryNote = `${row.name} has strong inherent quality (${cond.essentialDignities[0]}) but sits in ${isCadent ? `cadent House ${row.house}` : "solar combustion"}: rich internal mastery and integrity, but its outward delivery works behind the scenes, privately, or after deliberate gestation rather than immediate public fanfare.`;
    } else if (!hasEssential && isAngular) {
      conditionVsDeliveryNote = `${row.name} is prominently placed in Angular House ${row.house} despite lacking major essential dignity in ${sign}: it acts loudly and visibly in the life, relying on its dispositor ${domicileLord} (${receptionWithLord === "aspect-with-reception" || receptionWithLord === "mutual-reception" ? "which beholds and receives it with support" : "which is in aversion, requiring self-made adaptation"}) to supply steadiness.`;
    } else {
      conditionVsDeliveryNote = `${row.name} in ${sign} (House ${row.house}) answers to domicile lord ${domicileLord} (${receptionWithLord.replace(/-/g, " ")}); Egyptian term lord: ${termLordEgyptian ?? "—"}, Ptolemaic term lord: ${termLordPtolemaic ?? "—"}.`;
    }

    return {
      planet: row.name,
      sign,
      domicileLord,
      exaltationLord,
      termLordEgyptian,
      termLordPtolemaic,
      chainToFinalDispositor: chain,
      finalDispositor,
      inMutualReceptionLoop,
      loopMembers,
      receptionWithLord,
      conditionVsDeliveryNote,
    };
  });
}

/**
 * Evaluates Western Timing & Activation Doctrine for the chart (Annual Profection + ZR + Primary Directions + Solar Return + Secondary Progressions).
 */
export function evaluateWesternTimingActivations(
  chart: ChartResult,
  isDayChart: boolean
): WesternTimingActivationRecord[] {
  const records: WesternTimingActivationRecord[] = [];
  const birthYear = chart.utc ? new Date(chart.utc).getUTCFullYear() : NaN;
  const transitYear = chart.transitDate
    ? new Date(chart.transitDate).getUTCFullYear()
    : new Date().getUTCFullYear();
  const age =
    Number.isFinite(birthYear) && transitYear >= birthYear
      ? transitYear - birthYear
      : undefined;

  const ascSignIndex =
    chart.ascendant && Number.isFinite(chart.ascendant.longitude)
      ? Math.floor(normalizeLongitude(chart.ascendant.longitude) / 30)
      : 0;

  if (age !== undefined && chart.agentViewAvailable) {
    const profectedHouse = (age % 12) + 1;
    const profectedSign = ZODIAC_SIGNS[(ascSignIndex + profectedHouse - 1) % 12];
    const timeLord = SIGN_CANON_RECORDS[profectedSign]?.domicileLord ?? "Sun";
    const timeLordRow = chart.movingBodies.find(b => b.name === timeLord);
    const houseRec = HOUSE_CANON_RECORDS[profectedHouse];

    records.push({
      techniqueId: "annual-profection",
      name: `Annual Profection (Age ${age} · House ${profectedHouse} in ${profectedSign})`,
      eraClassification: "hellenistic-medieval",
      calculatedOrDoctrineStatus: "calculated-active",
      activeSignOrPeriod: `${profectedSign} (House ${profectedHouse})`,
      timeLordOrActivatedBody: timeLord,
      activatedHouse: profectedHouse,
      natalPromiseExplanation: `[TRADITION · Hellenistic/Medieval Annual Profection] At age ${age}, the annual profection arrives at House ${profectedHouse} (${profectedSign} — ${houseRec?.traditionalTitle ?? "life domain"}). ${timeLord} becomes the Lord of the Year (Chronocrator).`,
      interactionWithNatalChart: timeLordRow
        ? `${timeLord} is placed natally in ${timeLordRow.display} (House ${timeLordRow.house}), linking this year's ${profectedHouse}th-house themes (${houseRec?.coreTopics.slice(0, 2).join(", ")}) directly to natal House ${timeLordRow.house} matters. Any transits to or from ${timeLord} carry primary activation authority this year.`
        : `${timeLord} governs the year's overarching natal agenda.`,
      provenance: WESTERN_TIMING_DOCTRINE_LIBRARY["annual-profection"].provenance,
    });
  } else {
    records.push({
      techniqueId: "annual-profection",
      name: "Annual Profections (Time-Lord Activation Doctrine)",
      eraClassification: "hellenistic-medieval",
      calculatedOrDoctrineStatus: "doctrine-only",
      natalPromiseExplanation:
        WESTERN_TIMING_DOCTRINE_LIBRARY["annual-profection"].definition,
      interactionWithNatalChart:
        WESTERN_TIMING_DOCTRINE_LIBRARY["annual-profection"].howItActivatesNatalPromise,
      provenance: WESTERN_TIMING_DOCTRINE_LIBRARY["annual-profection"].provenance,
    });
  }

  for (const techId of [
    "zodiacal-releasing",
    "primary-directions",
    "solar-return",
    "secondary-progressions",
  ] as const) {
    const doc = WESTERN_TIMING_DOCTRINE_LIBRARY[techId];
    records.push({
      techniqueId: techId,
      name: doc.name,
      eraClassification: doc.eraClassification,
      calculatedOrDoctrineStatus: "doctrine-only",
      natalPromiseExplanation: `[${doc.provenance.epistemicCategory}] ${doc.definition}`,
      interactionWithNatalChart: doc.howItActivatesNatalPromise,
      provenance: doc.provenance,
    });
  }

  return records;
}

/**
 * The Relational Interpretation Engine across all houses:
 * Connects (1) Why a planet signifies a domain -> (2) How its dignity & house affect delivery ->
 * (3) How aspecting planets strengthen, obstruct, discipline, or redirect ->
 * (4) Applying vs separating & reception -> (5) Timing activation ->
 * (6) Lived Human Reality -> (7) Supported vs Contradictory vs Uncertain conclusions.
 */
export function buildRelationalHouseChains(
  chart: ChartResult,
  isDayChart: boolean,
  timingRecords: WesternTimingActivationRecord[]
): RelationalHouseChainSynthesis[] {
  const classicalBodies = chart.movingBodies.filter(
    b => CLASSICAL_7.includes(b.name) && Number.isFinite(b.longitude)
  );
  const byName = new Map<string, ChartRow>();
  for (const b of classicalBodies) byName.set(b.name, b);

  const ascSignIndex =
    chart.ascendant && Number.isFinite(chart.ascendant.longitude) && chart.agentViewAvailable
      ? Math.floor(normalizeLongitude(chart.ascendant.longitude) / 30)
      : 0;

  const keyHouses = [1, 4, 7, 10];
  const profection = timingRecords.find(
    t => t.techniqueId === "annual-profection" && t.calculatedOrDoctrineStatus === "calculated-active"
  );
  if (profection?.activatedHouse && !keyHouses.includes(profection.activatedHouse)) {
    keyHouses.push(profection.activatedHouse);
  }

  const MEAN_SPEED: Record<string, number> = {
    Moon: 13.176,
    Mercury: 1.383,
    Venus: 1.2,
    Sun: 0.9856,
    Mars: 0.524,
    Jupiter: 0.083,
    Saturn: 0.0335,
  };

  return keyHouses.map(houseNum => {
    const houseRec = HOUSE_CANON_RECORDS[houseNum];
    const signOnCusp = ZODIAC_SIGNS[(ascSignIndex + houseNum - 1) % 12];
    const signRec = SIGN_CANON_RECORDS[signOnCusp];
    const ruler = signRec?.domicileLord ?? "Sun";
    const rulerRow = byName.get(ruler);

    if (!rulerRow) {
      return {
        house: houseNum,
        houseTopic: houseRec?.traditionalTitle ?? `House ${houseNum}`,
        signOnCusp,
        ruler,
        rulerSign: "Unknown",
        rulerHouse: houseNum,
        inherentDignityVsDelivery: `${ruler} rules House ${houseNum} (${signOnCusp}).`,
        incomingAspectsToRuler: [],
        timingActivationStatus: "Awaiting full planetary coordinates.",
        humanRealityManifestation: `Matters of ${houseRec?.coreTopics.join(", ") ?? "this house"} are governed by ${ruler}.`,
        supportedConclusions: [`${signOnCusp} on House ${houseNum} assigns stewardship to ${ruler}.`],
        contradictionsOrQualifications: [],
        uncertainties: ["Ruler position unavailable."],
        workedChainSummary: `House ${houseNum} (${signOnCusp}) -> ruled by ${ruler}.`,
      };
    }

    const rulerLon = normalizeLongitude(rulerRow.longitude);
    const rulerSign = ZODIAC_SIGNS[Math.floor(rulerLon / 30)];
    const rulerHouse = rulerRow.house;
    const targetHouseRec = HOUSE_CANON_RECORDS[rulerHouse];
    const cond = evaluatePlacementDignityAndCondition(rulerRow, chart, isDayChart);

    // 1 & 2: Why it signifies + how condition and house placement affect delivery
    const hasEssentialDignity = cond.essentialDignities.length > 0;
    const hasDebility = cond.essentialDebilities.some(
      d => d.includes("Detriment") || d.includes("Fall")
    );
    const isCadent = [3, 6, 9, 12].includes(rulerHouse);
    const isAngular = [1, 4, 7, 10].includes(rulerHouse);

    const inherentDignityVsDelivery = [
      `Because ${signOnCusp} occupies House ${houseNum} (${houseRec?.traditionalTitle}), ${ruler} is the functional significator of ${houseRec?.coreTopics.slice(0, 3).join(", ")}.`,
      `${ruler} is placed in ${rulerSign} in House ${rulerHouse} (${targetHouseRec?.traditionalTitle ?? `House ${rulerHouse}`}), routing House ${houseNum} matters directly through House ${rulerHouse} (${targetHouseRec?.coreTopics.slice(0, 2).join(" and ")}).`,
      hasEssentialDignity
        ? `Inherently, ${ruler} has strong essential dignity (${cond.essentialDignities.join(", ")}), giving authentic internal competence and integrity.`
        : hasDebility
          ? `Inherently, ${ruler} is under essential debility (${cond.essentialDebilities[0]}), meaning it must work against convention or build custom tools rather than relying on effortless privilege.`
          : `Inherently, ${ruler} is peregrine in ${rulerSign}, relying on its host ${SIGN_CANON_RECORDS[rulerSign]?.domicileLord} for material backing.`,
      isAngular
        ? `Accidentally, placement in Angular House ${rulerHouse} grants high visibility and immediate traction in the outer world.`
        : isCadent
          ? `Accidentally, placement in Cadent House ${rulerHouse} redirects delivery away from simple public conformity toward behind-the-scenes work, research, preparation, or institutional sanctuaries.`
          : `Accidentally, placement in Succedent House ${rulerHouse} builds results steadily over time through persistent resource accumulation.`,
    ].join(" ");

    // 3 & 4: Aspects to the ruler, applying vs separating, reception, strengthen/obstruct/redirect
    const incomingAspectsToRuler: RelationalHouseChainSynthesis["incomingAspectsToRuler"] = [];
    const aspectAngles: Array<[number, string]> = [
      [0, "conjunction"],
      [60, "sextile"],
      [90, "square"],
      [120, "trine"],
      [180, "opposition"],
    ];

    for (const other of classicalBodies) {
      if (other.name === ruler) continue;
      const otherLon = normalizeLongitude(other.longitude);
      const sep = Math.min(
        Math.abs(rulerLon - otherLon),
        360 - Math.abs(rulerLon - otherLon)
      );
      for (const [angle, aspectName] of aspectAngles) {
        const orb = Math.abs(sep - angle);
        if (orb <= 5) {
          const vRuler = (MEAN_SPEED[ruler] ?? 0.1) * (rulerRow.retrograde ? -0.5 : 1);
          const vOther = (MEAN_SPEED[other.name] ?? 0.1) * (other.retrograde ? -0.5 : 1);
          const nextRuler = normalizeLongitude(rulerLon + vRuler * 0.1);
          const nextOther = normalizeLongitude(otherLon + vOther * 0.1);
          const nextSep = Math.min(
            Math.abs(nextRuler - nextOther),
            360 - Math.abs(nextRuler - nextOther)
          );
          const applying = Math.abs(nextSep - angle) < orb;

          const otherSign = ZODIAC_SIGNS[Math.floor(otherLon / 30)];
          const otherSignRec = SIGN_CANON_RECORDS[otherSign];
          const rulerSignRec = SIGN_CANON_RECORDS[rulerSign];

          const otherReceivesRuler =
            rulerSignRec?.domicileLord === other.name ||
            rulerSignRec?.exaltation?.planet === other.name;
          const rulerReceivesOther =
            otherSignRec?.domicileLord === ruler ||
            otherSignRec?.exaltation?.planet === ruler;
          const hasReception = otherReceivesRuler || rulerReceivesOther;

          const isBenefic = ["Jupiter", "Venus"].includes(other.name);
          const isMalefic = ["Saturn", "Mars"].includes(other.name);
          const isHard = ["square", "opposition", "conjunction"].includes(aspectName);

          let effect: RelationalHouseChainSynthesis["incomingAspectsToRuler"][number]["effect"] =
            "strengthens";
          if (isMalefic && isHard && !hasReception) {
            effect = other.name === "Saturn" ? "disciplines-and-redirects" : "obstructs";
          } else if (isMalefic && hasReception) {
            effect = "supports-with-reception";
          } else if (!isBenefic && isHard && !hasReception) {
            effect = "pressures-without-reception";
          }

          const receptionNote =
            otherReceivesRuler && rulerReceivesOther
              ? `Mutual reception between ${ruler} and ${other.name} turns potential friction into a cooperative alliance.`
              : otherReceivesRuler
                ? `${other.name} receives ${ruler} in ${rulerSign}, granting hospitality and structural support despite the ${aspectName}.`
                : rulerReceivesOther
                  ? `${ruler} receives ${other.name} in ${otherSign}, giving ${ruler} leverage to manage ${other.name}'s demands.`
                  : `No major domicile/exaltation reception; the ${aspectName} operates at full unmediated intensity.`;

          incomingAspectsToRuler.push({
            fromPlanet: other.name,
            aspect: aspectName,
            orb: Number(orb.toFixed(2)),
            applying,
            effect,
            receptionNote,
          });
        }
      }
    }

    // 5: Timing activation
    const activeTransitsToRuler = (chart.transits ?? []).flatMap(t =>
      (t.natalContacts ?? [])
        .filter(c => c.natalName === ruler && c.orb <= 5)
        .map(c => `Transit ${t.name} ${c.aspect} natal ${ruler} (${c.orb.toFixed(2)}°)`)
    );
    const isProfectedLord = profection?.timeLordOrActivatedBody === ruler;
    const isProfectedHouse = profection?.activatedHouse === houseNum;

    const timingActivationStatus = [
      isProfectedHouse
        ? `ACTIVE ANNUAL PROFECTION HOUSE: House ${houseNum} is the active profected house of the year.`
        : null,
      isProfectedLord
        ? `ACTIVE LORD OF THE YEAR: ${ruler} is the active Annual Profection Chronocrator, making this house's natal promise acute right now.`
        : null,
      activeTransitsToRuler.length > 0
        ? `Active Transits triggering ${ruler}: ${activeTransitsToRuler.join("; ")}.`
        : `No tight <=5° outer transit currently perfected on ${ruler}; operates at its baseline natal cadence unless triggered by lunar/inner movement.`,
    ]
      .filter(Boolean)
      .join(" ");

    // 6: Human Reality Manifestation
    const aspectNarrative =
      incomingAspectsToRuler.length > 0
        ? incomingAspectsToRuler
            .map(
              a =>
                `${a.fromPlanet}'s ${a.applying ? "applying" : "separating"} ${a.aspect} (${a.orb}°) ${a.effect.replace(/-/g, " ")} ${ruler}'s agenda (${a.receptionNote})`
            )
            .join("; ")
        : `${ruler} operates without tight classical aspect interference, expressing ${rulerSign} in House ${rulerHouse} with self-contained focus.`;

    const humanRealityManifestation = `[MODERN_SYNTHESIS · Lived Experience] In everyday life, ${houseRec?.coreTopics[0] ?? `House ${houseNum}`} (House ${houseNum}) does not develop in isolation—it unfolds through ${targetHouseRec?.coreTopics[0] ?? `House ${rulerHouse}`} (House ${rulerHouse}, where ${ruler} lives). ${
      isCadent
        ? `Because ${ruler} sits in House ${rulerHouse}, major breakthroughs in ${houseRec?.coreTopics[0] ?? "this area"} often happen away from the spotlight, through quiet preparation, research, or healing old institutional/internal burdens before stepping forward.`
        : `Because ${ruler} sits in House ${rulerHouse}, choices in ${houseRec?.coreTopics[0] ?? "this area"} immediately register in ${targetHouseRec?.coreTopics[0] ?? "that sphere"}.`
    } ${aspectNarrative}`;

    // 7: Supported, Contradictory, and Uncertain conclusions
    const supportedConclusions: string[] = [
      `${ruler} rules House ${houseNum} (${signOnCusp}) and links it structurally to House ${rulerHouse} (${rulerSign}).`,
    ];
    const contradictionsOrQualifications: string[] = [];
    const uncertainties: string[] = [];

    if (hasEssentialDignity && isCadent) {
      contradictionsOrQualifications.push(
        `Qualification (Dignity vs. House): ${ruler} is essentially dignified (${cond.essentialDignities[0]}) yet placed in cadent House ${rulerHouse}—strong inner capability is qualified by private, delayed, or behind-the-scenes delivery.`
      );
    }
    if (!hasEssentialDignity && isAngular) {
      contradictionsOrQualifications.push(
        `Qualification (Angularity vs. Peregrine/Debility): ${ruler} has high accidental visibility in Angular House ${rulerHouse}, but must rely on its dispositor ${SIGN_CANON_RECORDS[rulerSign]?.domicileLord} for sustainable backing.`
      );
    }
    for (const asp of incomingAspectsToRuler) {
      if (asp.effect === "supports-with-reception" && ["square", "opposition"].includes(asp.aspect)) {
        contradictionsOrQualifications.push(
          `Relational Qualification: ${asp.fromPlanet} ${asp.aspect}s ${ruler} (${asp.orb}°), which superficially looks obstructive, but reception converts the tension into structured support.`
        );
      } else if (asp.effect === "obstructs" || asp.effect === "disciplines-and-redirects") {
        supportedConclusions.push(
          `${asp.fromPlanet} (${asp.applying ? "applying" : "separating"} ${asp.aspect}, ${asp.orb}°) ${asp.effect.replace(/-/g, " ")} ${ruler}'s delivery of House ${houseNum} matters.`
        );
      }
    }
    if (!chart.agentViewAvailable) {
      uncertainties.push(
        `Birth time / local horizon is unavailable (God View only): House ${houseNum} rulership reflects the universal Solar/Aries archetype rather than local Ascendant-derived houses.`
      );
    }

    const workedChainSummary = `House ${houseNum} (${houseRec?.traditionalTitle}, ${signOnCusp}) → ruled by ${ruler} in ${rulerSign} (House ${rulerHouse}) | ${inherentDignityVsDelivery} | Aspects: ${aspectNarrative} | Timing: ${timingActivationStatus}`;

    return {
      house: houseNum,
      houseTopic: houseRec?.traditionalTitle ?? `House ${houseNum}`,
      signOnCusp,
      ruler,
      rulerSign,
      rulerHouse,
      inherentDignityVsDelivery,
      incomingAspectsToRuler,
      timingActivationStatus,
      humanRealityManifestation,
      supportedConclusions,
      contradictionsOrQualifications,
      uncertainties,
      workedChainSummary,
    };
  });
}
