import { PLANET_CANON_RECORDS } from "../astrologyKnowledge/canon/planetsAndSigns";
import { SUMERIAN_CELESTIAL_ASSOCIATIONS, SUMERIAN_CELESTIAL_SOURCE_ID, ENLIL_HISTORICAL_NOTE } from "../astrologyKnowledge/canon/sumerianCelestial";
import { detectAllYogas } from "../genesisBackup/vedicYogaDetector";
import { calculateEnergyRead, ENERGY_ASPECT_FLOW } from "../../shared/energyScoring";
import { registeredMethodLedger } from "./registry";
import { calculateVedicStrength, STRENGTH_VERSION } from "../astrologyKnowledge/vedic/strength";
import { localDateTime } from "../../shared/transitTime";
import { createMasterChartDataBus } from "./chartDataBus";
import { buildDivisionalCharts } from "../astrologyKnowledge/vedic/divisionalCharts";
import crypto from "crypto";
import {
  calculateChart,
  aspectBetween,
  minorAspectBetween,
  type ChartResult,
  type ChartRow,
} from "../astronomy";
import {
  formatLongitude,
  normalizeLongitude,
  overlay,
  ZODIAC_SIGNS,
} from "../../shared/hybrid";
import {
  calculateChartHermeticLots,
} from "../astrologyKnowledge/canon/fixedStarsAndLots";
import { getNakshatraCanonByLongitude } from "../astrologyKnowledge/canon/nakshatras27";
import { getManzilCanonByLongitude } from "../astrologyKnowledge/canon/manazil28";
import {
  CHINESE_MANSIONS,
  CHINESE_MANSION_HISTORICAL_SOURCE,
} from "../astrologyKnowledge/canon/chineseMansions28";
import { getDecanCanonByLongitude, elementalDecanTeaching } from "../astrologyKnowledge/canon/decans36";
import {
  resolveVedicTimingAndAshtakavarga,
  timingMethodCalculations,
} from "../astrologyKnowledge/vedic/timingAndAshtakavarga";
import { seferYetzirahEvidence } from "../astrologyKnowledge/canon/seferYetzirah";
import { runGenesisPatternPipeline } from "../genesisBackup/adapter";
import type {
  LayerRecord,
  MasterChartInput,
  UnifiedMasterChartSnapshot,
} from "./types";

function godFrameContacts(body: ChartResult["transits"][number]) {
  return { ...body,
    natalContacts: body.natalContacts.filter(contact => !["Ascendant", "Descendant"].includes(contact.natalName)),
    minorNatalContacts: body.minorNatalContacts.filter(contact => !["Ascendant", "Descendant"].includes(contact.natalName)),
  };
}

function computeSnapshotId(input: MasterChartInput, version: string): string {
  const content = JSON.stringify({
    location: input.location,
    lat: input.latitude,
    lon: input.longitude,
    tz: input.timezone,
    d: input.date,
    t: input.time,
    tl: input.transitLocation ?? "",
    tlat: input.transitLatitude ?? null,
    tlon: input.transitLongitude ?? null,
    ttz: input.transitTimezone ?? "",
    td: input.transitDate ?? "",
    tt: input.transitTime ?? "",
    instant: input.transitInstantUtc ?? "",
    baseInstant: input.instantUtc ?? "",
    birthTimeKnown: input.birthTimeKnown, chartRole: input.chartRole, elevation: input.elevation,
    m: input.mode ?? "natal",
    w: input.worldview ?? "agent-vs-god",
    sunriseAnchor: input.sunriseAnchor ?? null,
    transitSunriseAnchor: input.transitSunriseAnchor ?? null,
    xyz: input.xyzPositions ? Object.entries(input.xyzPositions).sort(([a], [b]) => a.localeCompare(b)) : null,
    transitXYZ: input.transitXYZPositions ? Object.entries(input.transitXYZPositions).sort(([a], [b]) => a.localeCompare(b)) : null,
    role: input.chartRole ?? "natal",
    v: version,
  });
  return "umc-" + crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

// Reuse the same versioned natal foundation across reading requests in this
// server process. Event/transit snapshots are deliberately never cached here.
// A bounded cache prevents unbounded growth; persistence is a separate concern.
const NATAL_CACHE_LIMIT = 64;
const natalSnapshotCache = new Map<string, Promise<UnifiedMasterChartSnapshot>>();

export async function getMasterNatalChart(
  input: MasterChartInput
): Promise<UnifiedMasterChartSnapshot> {
  const natalInput: MasterChartInput = {
    ...input,
    mode: "natal",
    worldview: "agent-vs-god",
    transitDate: undefined,
    transitTime: undefined,
    transitInstantUtc: undefined,
    transitLocation: undefined,
    transitLatitude: undefined,
    transitLongitude: undefined,
    transitTimezone: undefined,
    transitSunriseAnchor: undefined,
    transitXYZPositions: undefined,
  };
  const key = computeSnapshotId(natalInput, "firmament-master-2026.3");
  const cached = natalSnapshotCache.get(key);
  if (cached) {
    natalSnapshotCache.delete(key);
    natalSnapshotCache.set(key, cached);
    return cached;
  }
  const pending = buildUnifiedMasterChart(natalInput);
  natalSnapshotCache.set(key, pending);
  while (natalSnapshotCache.size > NATAL_CACHE_LIMIT) {
    const oldest = natalSnapshotCache.keys().next().value;
    if (oldest === undefined) break;
    natalSnapshotCache.delete(oldest);
  }
  try {
    return await pending;
  } catch (error) {
    if (natalSnapshotCache.get(key) === pending) natalSnapshotCache.delete(key);
    throw error;
  }
}

function getSign(longitude: number): string {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)];
}

export async function buildUnifiedMasterChart(
  input: MasterChartInput
): Promise<UnifiedMasterChartSnapshot> {
  const mode = input.mode ?? "natal";
  const engineVersion = "firmament-master-2026.3";
  const createdAtUtc = new Date().toISOString();

  // 1. Calculate authoritative base celestial state using established astronomy engine
  const chart: ChartResult = await calculateChart({
    location: input.location,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    date: input.date,
    time: input.time,
    transitDate: input.transitDate,
    transitTime: input.transitTime,
    transitInstantUtc: input.transitInstantUtc,
    instantUtc: input.instantUtc,
    birthTimeKnown: input.birthTimeKnown, chartRole: input.chartRole, elevation: input.elevation,
    transitLocation: input.transitLocation,
    transitLatitude: input.transitLatitude,
    transitLongitude: input.transitLongitude,
    transitTimezone: input.transitTimezone,
    readingScope: mode,
    // The snapshot contains BOTH frames; calculate the available local anchor
    // even when the requested display is God View. Project the display below.
    worldview: input.worldview === "god" && input.birthTimeKnown !== false && input.location && input.time && input.timezone && Number.isFinite(input.latitude) && Number.isFinite(input.longitude) ? "agent-vs-god" : input.worldview ?? "agent-vs-god",
    xyzPositions: input.xyzPositions,
    transitXYZPositions: input.transitXYZPositions,
    sunriseAnchor: input.sunriseAnchor,
    transitSunriseAnchor: input.transitSunriseAnchor,
  });

  const snapshotId = computeSnapshotId({ ...input, instantUtc: chart.utc,
    ...(mode === "natal" ? { transitInstantUtc: undefined } : { transitInstantUtc: chart.transitDate }) }, engineVersion);

  // Distribute one validated astronomical state to every registered layer.
  // A missing Ascendant or required body is a hard error, never a zero-degree fallback.
  const chartData = createMasterChartDataBus(chart);
  const basePlanets = chartData.planets;
  const frameworkPlacements = [...basePlanets, chart.northNode, chart.southNode,
    ...[chart.ascendant, chart.descendant, chart.midheaven].filter((row): row is ChartRow => Boolean(row))];
  const baseHouses = chartData.houses.map((cusp, idx) => ({
    house: idx + 1,
    sign: getSign(cusp),
    cusp,
    degreeDisplay: formatLongitude(cusp),
  }));
  const ascendant = chartData.ascendant;

  // 2. Build God View (fixed Aries 1 - Pisces 12 cosmic frame) and Agent View (geocentric equal house from Ascendant)
  const godPlacements = basePlanets.map(p => {
    const norm = normalizeLongitude(p.longitude);
    const godHouse = Math.floor(norm / 30) + 1;
    return {
      body: p.name,
      longitude: p.longitude,
      display: p.display,
      godHouse,
      sign: getSign(p.longitude),
    };
  });

  const agentPlacements = (ascendant ? basePlanets : []).map(p => {
    return {
      body: p.name,
      longitude: p.longitude,
      display: p.display,
      agentHouse: p.agentHouse ?? p.house,
      sign: getSign(p.longitude),
    };
  });

  const frameRelationships = basePlanets
    .filter(p => p.frameRelationship)
    .map(p => ({
      body: p.name,
      longitude: p.longitude,
      display: p.display,
      godHouse: p.godHouse ?? (Math.floor(normalizeLongitude(p.longitude) / 30) + 1),
      agentHouse: p.agentHouse ?? p.house,
      relationship: `${p.frameRelationship!.type}: ${p.frameRelationship!.translation}`,
    }));

  // 3. Assemble the complete registered method formation.
  const layers: Record<string, LayerRecord> = {};

  // Layer 1: Western Planets & Signs
  layers["western-planets-and-signs"] = {
    id: "western-planets-and-signs",
    tradition: "hellenistic",
    technique: "planetary-longitudes-and-signs",
    name: "Western Classical Longitudes & Signs",
    status: "computed-with-result",
    frame: "shared",
    prerequisites: ["swiss-ephemeris-base"],
    calculationVersion: engineVersion,
    evidenceIds: basePlanets.map(p => `planet-${p.name.toLowerCase()}`),
    sourceIds: ["ptolemy-tetrabiblos-1"],
    results: basePlanets.map(p => ({
      name: p.name,
      longitude: p.longitude,
      display: p.display,
      sign: getSign(p.longitude),
      retrograde: p.retrograde,
      speed: p.speed,
      overlay: p.overlay,
    })),
  };

  // Sumerian historical celestial associations, not an invented natal algorithm.
  const sumerianResults = basePlanets
    .filter(p => Object.prototype.hasOwnProperty.call(SUMERIAN_CELESTIAL_ASSOCIATIONS, p.name))
    .map(p => ({
      body: p.name,
      display: p.display,
      longitude: p.longitude,
      sign: getSign(p.longitude),
      house: p.agentHouse ?? p.house,
      association: SUMERIAN_CELESTIAL_ASSOCIATIONS[p.name as keyof typeof SUMERIAN_CELESTIAL_ASSOCIATIONS],
    }));
  layers["sumerian-celestial-foundations"] = {
    id: "sumerian-celestial-foundations",
    tradition: "sumerian",
    technique: "attested-sun-moon-venus-symbolic-associations",
    name: "Sumerian Celestial Foundations",
    status: sumerianResults.length === 3 ? "computed-with-result" : "failed",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: sumerianResults.map(p => `sumerian-${p.body.toLowerCase()}`),
    sourceIds: [SUMERIAN_CELESTIAL_SOURCE_ID],
    results: sumerianResults,
    notes: `Historical correspondences with an explicitly modern interpretive lens; not a recovered horoscope algorithm. ${ENLIL_HISTORICAL_NOTE}`,
    ...(sumerianResults.length !== 3 ? { errorCode: "SUMERIAN_MISSING_CALCULATED_BODY" } : {}),
  };

  // Layer 2: Western Houses & Angles
  layers["western-houses-and-angles"] = {
    id: "western-houses-and-angles",
    tradition: "hellenistic",
    technique: "equal-houses-and-cardinal-angles",
    name: "12 Equal Houses & Horizon Angles",
    status: ascendant ? "computed-with-result" : "not-applicable",
    notes: ascendant ? undefined : "God View has no observer-specific Ascendant or local equal houses; the fixed zodiac sectors remain in God View.",
    frame: "agent",
    prerequisites: ["topocentric-ascendant"],
    calculationVersion: engineVersion,
    evidenceIds: ascendant ? [
      "angle-ascendant",
      "angle-descendant",
      ...chart.houses.map((_, i) => `house-${i + 1}`),
    ] : [],
    sourceIds: ["hellenistic-equal-houses"],
    results: {
      ascendant,
      descendant: chart.descendant,
      houses: baseHouses,
    },
  };

  // Layer 3: Western Aspects & Orbs
  const majorAspects = chart.movingBodies.flatMap(p1 =>
    chart.movingBodies.filter(p2 => p1.name < p2.name).map(p2 => {
      const contact = aspectBetween(p1.longitude, p2.longitude) || minorAspectBetween(p1.longitude, p2.longitude);
      if (!contact) return null;
      const diff = Math.abs(normalizeLongitude(p1.longitude) - normalizeLongitude(p2.longitude));
      return {
        body1: p1.name, body2: p2.name,
        aspect: contact.aspect[0].toUpperCase() + contact.aspect.slice(1),
        angle: Math.round((diff > 180 ? 360 - diff : diff) * 100) / 100,
        orb: Math.round(contact.orb * 100) / 100,
        nature: ENERGY_ASPECT_FLOW[contact.aspect] === -1 ? "friction" : "harmony",
      };
    }).filter((a): a is NonNullable<typeof a> => a !== null)
  );

  layers["western-aspects-and-orbs"] = {
    id: "western-aspects-and-orbs",
    tradition: "hellenistic",
    technique: "ptolemaic-aspects",
    name: "Ptolemaic Aspects & Orbs",
    status: majorAspects.length > 0 ? "computed-with-result" : "computed-no-result",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: majorAspects.map(a => `aspect-${a.body1}-${a.aspect}-${a.body2}`.toLowerCase()),
    sourceIds: ["ptolemy-aspect-orbs"],
    results: majorAspects,
  };

  // Layer 4: Western Essential Dignities
  const rulershipMap: Record<string, string> = {
    Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
    Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
    Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
  };
  const exaltationMap: Record<string, string> = {
    Aries: "Sun", Taurus: "Moon", Cancer: "Jupiter", Virgo: "Mercury",
    Capricorn: "Mars", Pisces: "Venus",
  };
  const dignities = basePlanets.map(p => {
    const sign = getSign(p.longitude);
    const isDomicile = rulershipMap[sign] === p.name;
    const isExalted = exaltationMap[sign] === p.name;
    let status = "Peregrine";
    if (isDomicile) status = "Domicile (Ruler)";
    else if (isExalted) status = "Exaltation";
    else if (PLANET_CANON_RECORDS[p.name]?.rulerships.detriments.includes(sign)) status = "Detriment";
    else if (PLANET_CANON_RECORDS[p.name]?.rulerships.fallSign === sign) status = "Fall";
    return {
      body: p.name,
      sign,
      dignity: status,
      rulerOfSign: rulershipMap[sign],
    };
  });

  layers["western-essential-dignities"] = {
    id: "western-essential-dignities",
    tradition: "hellenistic",
    technique: "essential-dignities",
    name: "Essential Dignities & Sign Rulerships",
    status: "computed-with-result",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: dignities.map(d => `dignity-${d.body.toLowerCase().replace(/\s+/g, "-")}`),
    sourceIds: ["dorotheus-carmen-astrologicum"],
    results: dignities,
  };

  // Layer 5: Fixed Stars & Royal Watchers
  const royalStarContacts = chart.frozenStars.map(fs => ({
    name: fs.name,
    fixedLongitude: fs.longitude,
    display: fs.display,
    contacts: frameworkPlacements
      .map(p => {
        const diff = Math.abs(normalizeLongitude(p.longitude) - normalizeLongitude(fs.longitude));
        const orb = diff > 180 ? 360 - diff : diff;
        return {
          body: p.name,
          orb: Math.round(orb * 100) / 100,
          isConjunction: orb <= 5,
        };
      })
      .filter(c => c.isConjunction),
    activationOrbDegrees: 5,
    reading: `${fs.name} is a permanent stellar anchor at ${fs.display}. ${frameworkPlacements.filter(p => { const d = Math.abs(normalizeLongitude(p.longitude) - normalizeLongitude(fs.longitude)); return Math.min(d, 360 - d) <= 5; }).map(p => `${p.name} activates it by conjunction`).join("; ") || "No natal planet activates this star within 5°"}. Historical symbolic interpretation requires an attested star-specific doctrine.`,
  }));

  layers["fixed-stars-royal-watchers"] = {
    id: "fixed-stars-royal-watchers",
    tradition: "babylonian",
    technique: "fixed-stars-and-royal-watchers",
    name: "Polaris-Centered Firmament & Royal Watchers",
    status: "computed-with-result",
    frame: "god",
    prerequisites: ["firmament-fixed-frame"],
    calculationVersion: engineVersion,
    evidenceIds: royalStarContacts.map(s => `star-${s.name.toLowerCase()}`),
    sourceIds: ["ptolemy-fixed-stars", "babylonian-mul-apin"],
    results: royalStarContacts,
  };

  // Layer 6: Arabic & Hermetic Lots
  const sunRow = basePlanets.find(p => p.name === "Sun");
  const isDayChart = sunRow ? sunRow.house >= 7 && sunRow.house <= 12 : true;
  const lotsArray = calculateChartHermeticLots(chart, isDayChart);
  const calculatedLots = lotsArray.map(item => ({
    key: item.lot.id,
    name: item.lot.name,
    longitude: item.longitude,
    display: item.display,
    sign: item.sign,
    house: item.house,
    formula: isDayChart ? item.lot.dayFormula : item.lot.nightFormula,
  }));

  layers["arabic-hermetic-lots"] = {
    id: "arabic-hermetic-lots",
    tradition: "arabic-persian",
    technique: "hermetic-lots-arabic-parts",
    name: "Hermetic Lots (Fortune, Spirit, Eros, Necessity)",
    status: !ascendant ? "not-applicable" : calculatedLots.length > 0 ? "computed-with-result" : "computed-no-result",
    notes: ascendant ? undefined : "Hermetic Lots require a local Ascendant.",
    frame: "agent",
    prerequisites: ["western-houses-and-angles", "western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: calculatedLots.map(l => `lot-${l.key.toLowerCase()}`),
    sourceIds: ["paulus-alexandrinus-ch23", "al-biruni-astrology"],
    results: calculatedLots,
  };

  // Layer 7: Arabic Lunar Manazil (28 Mansions)
  const manazilResults = frameworkPlacements.map(p => {
    const canon = getManzilCanonByLongitude(p.longitude);
    return {
      body: p.name,
      longitude: p.longitude,
      manzilNumber: canon.index,
      transliteration: canon.name,
      meaning: canon.englishTranslation,
      traditionalQuality: canon.traditionalQuality,
    };
  });

  layers["arabic-lunar-manazil"] = {
    id: "arabic-lunar-manazil",
    tradition: "arabic-persian",
    technique: "28-lunar-manazil",
    name: "Arabic 28 Manazil al-Qamar",
    status: "computed-with-result",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: manazilResults.map(m => `manzil-${m.body.toLowerCase().replace(/\s+/g, "-")}-${m.manzilNumber}`),
    sourceIds: ["al-sufi-book-of-fixed-stars"],
    results: manazilResults,
  };

  // Layer 8: Vedic Nakshatras & Padas (27 Lunar Mansions)
  const nakshatraResults = frameworkPlacements.map(p => {
    const canon = getNakshatraCanonByLongitude(p.longitude);
    return {
      body: p.name,
      longitude: p.longitude,
      nakshatraNumber: canon.nakshatra.index,
      name: canon.nakshatra.name,
      pada: canon.pada.pada,
      rulingDeity: canon.nakshatra.deity,
      planetaryLord: canon.nakshatra.vimshottariRuler,
      shakti: canon.nakshatra.shakti,
      purushartha: canon.nakshatra.motivationPuruSharthas,
    };
  });

  layers["vedic-nakshatras-and-padas"] = {
    id: "vedic-nakshatras-and-padas",
    tradition: "vedic",
    technique: "27-nakshatras-and-padas",
    name: "Vedic 27 Nakshatras & Padas",
    status: "computed-with-result",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: nakshatraResults.map(n => `nakshatra-${n.body.toLowerCase().replace(/\s+/g, "-")}-${n.nakshatraNumber}`),
    sourceIds: ["taittiriya-samhita", "surya-siddhanta"],
    results: nakshatraResults,
  };

  // Layer 9: Complete deterministic D1/D2/D3/D9/D10 chart data.
  // Every divisional chart derives from the same natal Ascendant and planets.
  const vargaResults = ascendant ? buildDivisionalCharts({
    ascendantLongitude: ascendant.longitude,
    planets: [
      ...basePlanets.map(p => ({ name: p.name, longitude: p.longitude })),
      { name: chart.northNode.name, longitude: chart.northNode.longitude },
      { name: chart.southNode.name, longitude: chart.southNode.longitude },
    ],
    d1HouseCusps: chart.houses,
  }) : [];

  layers["vedic-vargas-divisional"] = {
    id: "vedic-vargas-divisional",
    tradition: "vedic",
    technique: "parashari-divisional-vargas",
    name: "Vedic Divisional Charts (D1, D2, D3, D9 Navamsha, D10)",
    status: ascendant ? "computed-with-result" : "not-applicable",
    notes: ascendant ? undefined : "Divisional house charts require a known Ascendant; no substitute anchor is used.",
    frame: "agent",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: vargaResults.map(v => `varga-${v.division.toLowerCase()}`),
    sourceIds: ["brihat-parashara-hora-shastra"],
    results: vargaResults,
  };

  // Layer 10: Vedic Timing & Ashtakavarga
  let timingResult: ReturnType<typeof resolveVedicTimingAndAshtakavarga> = [];
  let timingError: string | undefined;
  try {
    timingResult = ascendant && input.birthTimeKnown !== false ? resolveVedicTimingAndAshtakavarga(chart) : [];
  } catch (err) {
    timingError = err instanceof Error ? err.message : String(err);
  }
  // Uncertainty and calculation-error evidence is not a successful calculation.
  const timingHasFailure = timingResult.some(item =>
    item.category === "uncertainty" || item.id.includes("calculation-error") ||
    item.id.includes("checksum-failed")
  );

  const timingData = timingResult.length && !timingError && !timingHasFailure ? timingMethodCalculations(chart) : undefined;
  layers["vedic-dasha-and-ashtakavarga"] = {
    id: "vedic-dasha-and-ashtakavarga",
    tradition: "vedic",
    technique: "vimshottari-dasha-and-ashtakavarga",
    name: "Vimshottari Dasha Lords & Ashtakavarga Bindus",
    status: !ascendant || input.birthTimeKnown === false ? "not-applicable" : timingError || timingHasFailure ? "failed" : timingResult.length > 0 ? "computed-with-result" : "computed-no-result",
    frame: "agent",
    prerequisites: ["vedic-nakshatras-and-padas"],
    calculationVersion: engineVersion,
    evidenceIds: timingResult.map(t => t.id),
    sourceIds: ["brihat-parashara-dasha-system"],
    errorCode: timingError ? "VEDIC_TIMING_EXCEPTION" : timingHasFailure ? "VEDIC_TIMING_UNAVAILABLE_OR_INVALID" : undefined,
    notes: timingError ?? (!ascendant || input.birthTimeKnown === false ? "The combined Dasha/Ashtakavarga adapter requires a known birth time and local Lagna; these results are not asserted for an unlocated or date-only sky." : undefined),
    results: timingResult.map(item => ({ ...item,
      calculation: timingData?.[item.technique as "dasha" | "ashtakavarga"],
    })),
  };

  // The same numerical strength calculation feeds both independent methods.
  const strengthApplicable = Boolean(ascendant && input.birthTimeKnown !== false);
  let strength: ReturnType<typeof calculateVedicStrength> | undefined;
  let strengthError: string | undefined;
  if (strengthApplicable) {
    try { strength = calculateVedicStrength(chart); }
    catch (error) { strengthError = error instanceof Error ? error.message : String(error); }
  }
  for (const [id, name, results, evidenceIds] of [
    ["vedic-shadbala", "Shadbala · Sixfold Planetary Strength", strength?.planets, strength?.planets.map(p => `shadbala-${p.body.toLowerCase()}`)],
    ["vedic-bhava-bala", "Bhava Bala · Twelve House Strengths", strength?.houses, strength?.houses.map(h => `bhava-bala-house-${h.house}`)],
  ] as const) layers[id] = {
    id, name, tradition:"vedic", technique:id === "vedic-shadbala" ? "bphs-sixfold-shadbala" : "bphs-bhava-adhipati-dig-drishti",
    status: !strengthApplicable ? "not-applicable" : strengthError ? "failed" : "computed-with-result",
    frame:"agent", prerequisites:["western-planets-and-signs","western-houses-and-angles"],
    calculationVersion:STRENGTH_VERSION, results:results ?? [], evidenceIds:evidenceIds ?? [],
    sourceIds:["brihat-parashara-hora-shastra-26-27"],
    ...(strengthError ? {errorCode:"VEDIC_STRENGTH_FAILED"} : {}),
    notes: !strengthApplicable ? "A known local Ascendant and birth time are required for numerical strength." : strengthError ?? `BPHS formulas applied to The Absolute's supplied XYZ and Equal Houses. Selected variants: ${JSON.stringify(strength!.coordinateVariant)}. Sources: ${JSON.stringify(strength!.sources)}. Temporal inputs: ${JSON.stringify(strength!.temporal)}`,
  };

  // Layer 11: Vedic Graha Drishti (Special Aspects)
  const classicalDrishtiPlanets = new Set(["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]);
  const drishtiAspects = basePlanets.flatMap(p => {
    if (!classicalDrishtiPlanets.has(p.name)) return [];
    const pSignIndex = Math.floor(normalizeLongitude(p.longitude) / 30);
    const offsets = [7,
      ...(p.name === "Mars" ? [4, 8] : []),
      ...(p.name === "Jupiter" ? [5, 9] : []),
      ...(p.name === "Saturn" ? [3, 10] : []),
    ];
    return offsets.map(offset => ({
      planet: p.name,
      targetSign: ZODIAC_SIGNS[(pSignIndex + offset - 1) % 12],
      targetHouseOffset: offset,
      type: offset === 7 ? "7th Drishti (Opposition)" : `${offset}th Special Drishti`,
    }));
  });

  layers["vedic-graha-drishti"] = {
    id: "vedic-graha-drishti",
    tradition: "vedic",
    technique: "graha-drishti-special-aspects",
    name: "Vedic Graha Drishti (Mars 4/8, Jupiter 5/9, Saturn 3/10)",
    status: drishtiAspects.length > 0 ? "computed-with-result" : "computed-no-result",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: drishtiAspects.map(d => `drishti-${d.planet.toLowerCase()}-${d.targetHouseOffset}`),
    sourceIds: ["parashari-drishti-canon"],
    results: drishtiAspects,
  };

  // Layer 12: Chinese Lunar Mansions (28 Xiu)
  layers["chinese-lunar-mansions-xiu"] = {
    id: "chinese-lunar-mansions-xiu",
    tradition: "chinese",
    technique: "28-xiu-four-symbols",
    name: "Chinese 28 Xiu & 4 Directional Animal Symbols",
    status: "reference-only",
    frame: "shared",
    prerequisites: [],
    calculationVersion: engineVersion,
    evidenceIds: CHINESE_MANSIONS.map(m => `xiu-${m.index}-${m.pinyin.toLowerCase()}`),
    sourceIds: [CHINESE_MANSION_HISTORICAL_SOURCE.title],
    notes: "Historical determinative equatorial star catalog preserved as reference. Individual personal chart placements are not asserted without pre-calculated unequal ancient sector boundaries.",
    results: {
      source: CHINESE_MANSION_HISTORICAL_SOURCE,
      mansionsCount: CHINESE_MANSIONS.length,
      sampleMansions: CHINESE_MANSIONS.slice(0, 7),
    },
  };

  // Layer 13: Elemental-family decans (separate from Chaldean faces)
  const decanResults = frameworkPlacements.map(p => {
    const canon = getDecanCanonByLongitude(p.longitude);
    return {
      body: p.name,
      longitude: p.longitude,
      decanIndex: canon.index,
      sign: canon.sign,
      elementalFamilySign: elementalDecanTeaching(canon).subSign,
      elementalFamilyRuler: canon.triplicitySubRuler,
      traditionalTitle: elementalDecanTeaching(canon).label,
      behavioralNuance: elementalDecanTeaching(canon).statement,
      chaldeanReference: { label: canon.label, title: canon.traditionalTitle },
      reading: `${p.name} in ${canon.sign}, decan ${canon.index}: ${elementalDecanTeaching(canon).statement} Elemental-family ruler: ${canon.triplicitySubRuler}. This is the decan-layer interpretation to be reconciled with the planet\'s house, aspects, dignities, and other natal testimony.`,
    };
  });

  layers["elemental-decans"] = {
    id: "elemental-decans",
    tradition: "hellenistic",
    technique: "36-elemental-family-decans",
    name: "36 Elemental Decans & Faces (10° Divisions)",
    status: "computed-with-result",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: decanResults.map(d => `decan-${d.body.toLowerCase().replace(/\s+/g, "-")}-${d.decanIndex}`),
    sourceIds: ["firmament-elemental-family-decans", "planetary-sign-canon"],
    results: decanResults,
  };

  // Layer 14: Kabbalah & Sefer Yetzirah
  const syEvidence = seferYetzirahEvidence(chart, "natal");
  layers["kabbalah-sefer-yetzirah"] = {
    id: "kabbalah-sefer-yetzirah",
    tradition: "kabbalah",
    technique: "sefer-yetzirah-32-paths-and-letters",
    name: "Sefer Yetzirah 32 Paths, 7 Doubles & Contraries",
    status: syEvidence.length > 0 ? "computed-with-result" : "computed-no-result",
    frame: "shared",
    prerequisites: ["western-planets-and-signs"],
    calculationVersion: engineVersion,
    evidenceIds: syEvidence.map(e => e.id),
    sourceIds: ["sefer-yetzirah-westcott-recension"],
    results: syEvidence,
  };

  // Layer 15: Genesis Behavioral Patterns & Yogas
  let genesisResult: any = null;
  let genesisError: string | null = null;
  try {
    genesisResult = runGenesisPatternPipeline({ ...chart, readingScope: "natal", transits: [] });
  } catch (err) {
    genesisError = err instanceof Error ? err.message : String(err);
  }

  layers["genesis-behavioral-patterns"] = {
    id: "genesis-behavioral-patterns",
    tradition: "genesis",
    technique: "genesis-pattern-engine-and-yogas",
    name: "Genesis Behavioral Patterns & Vedic Yogas",
    status: genesisError ? "failed" : genesisResult?.analysis ? "computed-with-result" : "computed-no-result",
    frame: chart.agentViewAvailable ? "agent" : "god",
    prerequisites: ["western-aspects-and-orbs", "western-houses-and-angles"],
    calculationVersion: engineVersion,
    evidenceIds: ["genesis-patterns-core", "genesis-yogas"],
    sourceIds: ["genesis-symbolic-engine"],
    results: genesisResult?.analysis ? { ...genesisResult.analysis,
      yogas: chart.ascendant ? detectAllYogas(basePlanets.map(p=>({name:p.name,sign:getSign(p.longitude),house:p.agentHouse??p.house,degree:p.longitude%30}))) : [],
      yogaScope: chart.ascendant ? "Hamsa Yoga conditions in the configured local sub-engine" : "No local Yoga judgment without an Ascendant",
    } : null,
    ...(genesisError ? { errorCode: "GENESIS_PIPELINE_FAILED", notes: genesisError } : {}),
  };

  // Layer 16: Transit Activation Layer (when mode is transit or combined)
  if (mode === "transit" || mode === "combined") {
    const transitAspects = (calculateEnergyRead(input.worldview === "god" ? { ...chart, transits: chart.transits.map(godFrameContacts) } : chart)?.contacts ?? []).map(contact => ({
      transitBody: contact.transit, natalBody: contact.natal,
      aspect: contact.aspect[0].toUpperCase() + contact.aspect.slice(1),
      orb: contact.orb, nature: contact.flow === -1 ? "friction" as const : "harmonic" as const,
      intensity: contact.intensity, stars: contact.stars, natalStars: contact.natalStars,
      majorFactor: contact.majorFactor, strength: contact.strength,
    }));

    layers["transit-activation-layer"] = {
      id: "transit-activation-layer",
      tradition: "firmament",
      technique: "transit-to-natal-activation",
      name: "Active Transits & Dynamic Orbs",
      status: transitAspects.length > 0 ? "computed-with-result" : "computed-no-result",
      frame: "transit",
      prerequisites: ["western-planets-and-signs"],
      calculationVersion: engineVersion,
      evidenceIds: transitAspects.map(t => `transit-${t.transitBody}-${t.aspect}-${t.natalBody}`.toLowerCase()),
      sourceIds: ["firmament-transit-weather"],
      results: transitAspects,
    };
  } else {
    layers["transit-activation-layer"] = {
      id: "transit-activation-layer",
      tradition: "firmament",
      technique: "transit-to-natal-activation",
      name: "Active Transits & Dynamic Orbs",
      status: "not-applicable",
      frame: "transit",
      prerequisites: [],
      calculationVersion: engineVersion,
      evidenceIds: [],
      sourceIds: [],
      notes: "Mode is natal-only; transit layer is dormant until transit moment is requested.",
    };
  }

  // 4. Assemble Method Execution Ledger and Validation Summary
  // Validate registered layer output contracts before publishing the snapshot.
  // Reference-only and mode-inapplicable layers retain their explicit statuses.
  const expectedPlanetCount = basePlanets.length;
  const requiredArrayCounts: Record<string, number> = {
    "western-planets-and-signs": expectedPlanetCount,
    "arabic-lunar-manazil": frameworkPlacements.length,
    "vedic-nakshatras-and-padas": frameworkPlacements.length,
    "elemental-decans": frameworkPlacements.length,
  };
  for (const [layerId, expectedCount] of Object.entries(requiredArrayCounts)) {
    const layer = layers[layerId];
    if (!layer) continue;
    if (!Array.isArray(layer.results) || layer.results.length !== expectedCount) {
      layer.status = "failed";
      layer.errorCode = "MASTER_CHART_LAYER_OUTPUT_COUNT_MISMATCH";
      layer.notes = `Expected ${expectedCount} planetary records; received ${Array.isArray(layer.results) ? layer.results.length : "non-array"}.`;
    }
  }
  const housesLayer = layers["western-houses-and-angles"];
  if (housesLayer && baseHouses.length !== 12) {
    housesLayer.status = "failed";
    housesLayer.errorCode = "MASTER_CHART_HOUSE_COUNT_MISMATCH";
  }
  const methodExecutionLedger = registeredMethodLedger(layers);
  const computedWithResultCount = methodExecutionLedger.filter(
    l => l.status === "computed-with-result"
  ).length;
  const failedMethods = methodExecutionLedger.filter(l => l.status === "failed");
  const unavailableMethods = methodExecutionLedger.filter(l =>
    l.status === "not-implemented" || l.status === "reference-only"
  );
  const methodWarnings = unavailableMethods.map(l =>
    `${l.name}: ${l.status}. ${l.notes ?? "No executable calculation was recorded."}`
  );

  const snapshot: UnifiedMasterChartSnapshot = {
    snapshotId,
    schemaVersion: "1.0.0",
    createdAtUtc,
    inputs: {
      // Birth coordinates and timestamps are not profile IDs. Identity is supplied
      // only when an authenticated profile registry is connected.
      profileIds: [],
      eventInstantUtc: chart.utc,
      timezone: input.timezone,
      locationContext: {
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
      },
      mode,
      chartRole: input.chartRole ?? "natal",
    },
    frameConfig: {
      zodiacMode: "fixed-cartesian-xyz",
      firmamentAnchorVersion: "sunrise-xyz-15deg-hour-v1",
      firmamentCenter: "polaris-centered-firmament-dome",
      obliquityMode: "zero-tilt-xy-projection",
      precessionMode: "none-user-frame-fixed-anchor",
      houseSystem: "topocentric-equal-house-ascendant",
      engineVersion,
    },
    baseCelestialState: {
      julianDay: chart.julianDay,
      utc: chart.utc,
      ascendant,
      midheaven: chart.midheaven,
      descendant: chart.descendant,
      northNode: chart.northNode,
      southNode: chart.southNode,
      planets: [...basePlanets],
      houses: baseHouses,
    },
    godView: {
      description: "Polaris-centered firmament dome with a fixed Aries 1 to Pisces 12 background and Cartesian XYZ planetary projection",
      cosmicFrame: "fixed-aries-1-to-pisces-12",
      polarisCenter: true,
      placements: godPlacements,
    },
    agentView: {
      description: "Geocentric planetary longitudes with a separate topocentric lunar correction and Equal House cusps anchored directly to the rising Ascendant degree",
      ascendantAnchor: ascendant?.display ?? "Unavailable: God View has no local Ascendant",
      houseSystem: "topocentric-equal-house-from-ascendant",
      placements: agentPlacements,
      frameRelationships,
    },
    natal: input.worldview === "god" ? {
      ...chart,
      input: { ...chart.input, worldview: "god" },
      worldview: "god",
      agentViewAvailable: false,
      ascendant: null,
      descendant: null,
      midheaven: null,
      houses: Array.from({ length: 12 }, (_, i) => i * 30),
      movingBodies: chart.movingBodies.map(body => ({ ...body, house: body.godHouse ?? Math.floor(normalizeLongitude(body.longitude) / 30) + 1 })),
      frozenStars: chart.frozenStars.map(body => ({ ...body, house: body.godHouse ?? Math.floor(normalizeLongitude(body.longitude) / 30) + 1 })),
      northNode: { ...chart.northNode, house: chart.northNode.godHouse ?? Math.floor(normalizeLongitude(chart.northNode.longitude) / 30) + 1 },
      southNode: { ...chart.southNode, house: chart.southNode.godHouse ?? Math.floor(normalizeLongitude(chart.southNode.longitude) / 30) + 1 },
      transitHouseFrame: "god-fixed",
      transits: chart.transits.map(body => ({ ...godFrameContacts(body), house: body.godHouse ?? Math.floor(normalizeLongitude(body.longitude) / 30) + 1 })),
    } : chart,
    transit: mode === "transit" || mode === "combined"
      ? {
          transitInstantUtc: chart.transitDate ?? chart.utc,
          planets: chart.transits ?? [],
          aspectsToNatal: (layers["transit-activation-layer"].results as any) ?? [],
        }
      : undefined,
    layers,
    methodExecutionLedger,
    validation: {
      // Keep validation.complete conservative: reference-only canon remains
      // disclosed as incomplete in the snapshot contract. The interpretation
      // gate separately distinguishes that status from failed calculations.
      complete: failedMethods.length === 0 && unavailableMethods.length === 0,
      errors: failedMethods.map(l => `${l.name}: ${l.errorCode ?? "calculation failed"}`),
      warnings: methodWarnings,
      totalMethods: methodExecutionLedger.length,
      computedWithResultCount,
    },
  };

  if (snapshot.transit) {
    const timezone = input.transitTimezone || input.timezone;
    const local = localDateTime(new Date(chart.transitDate), timezone);
    const event = await buildUnifiedMasterChart({
      ...input,
      location: input.transitLocation || (input.worldview === "god" ? "" : input.location),
      latitude: input.transitLatitude ?? input.latitude,
      longitude: input.transitLongitude ?? input.longitude,
      timezone, date: local.date, time: local.time, instantUtc: chart.transitDate,
      mode: "natal", birthTimeKnown: true, chartRole: "event",
      xyzPositions: input.transitXYZPositions,
      sunriseAnchor: input.transitSunriseAnchor,
      transitDate: undefined, transitTime: undefined, transitInstantUtc: undefined,
      transitLocation: undefined, transitLatitude: undefined, transitLongitude: undefined,
      transitTimezone: undefined, transitXYZPositions: undefined, transitSunriseAnchor: undefined,
    });
    // An event sky carries the full formation, independently from the natal sky.
    // Its cycle/varga results describe the event model, never a person's birth history.
    for (const transit of chart.transits) {
      const body = [...event.baseCelestialState.planets, event.baseCelestialState.northNode, event.baseCelestialState.southNode].find(row => row.name === transit.name);
      if (!body || Math.abs(((body.longitude - transit.longitude + 540) % 360) - 180) > 0.00001)
        throw new Error(`TRANSIT_FRAMEWORK_MISMATCH: ${transit.name} differs from the event chart.`);
    }
    snapshot.transit.framework = event;
  }
  return Object.freeze(snapshot);
}
