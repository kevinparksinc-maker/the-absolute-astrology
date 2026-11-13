import { calculateMasterChart as calculateChart } from "./masterChart/entry";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import { type ChartInput } from "./astronomy";
import { withCurrentQuestion } from "./_core/conversation";
import { invokeLLM, type Message } from "./_core/llm";
import { normalizeLongitude, ZODIAC_SIGNS } from "../shared/hybrid";
import type { FrameRelationship } from "./astrologyCore";
import { HORARY_TOPICS } from "../shared/horary";
import { calculateLookahead, type Lookahead } from "./horaryLookahead";
import { calculateTraditionalHorary, type TraditionalHoraryEvidence } from "./horaryTraditional";
import { HORARY_SYSTEM as HORARY_SPECIALIZED_SYSTEM } from "./horary-instructions";
import { FULL_SYNTHESIS_STYLE } from "./master-interpreter";
import { FIRMAMENT_CARE_DELIVERY_STANDARD, FIRMAMENT_MASTER_INTERPRETATION_PROMPT } from "./firmament-master";
import { FIRMAMENT_VISIBLE_INTERPRETATION_FORMAT } from "./firmament-output";
import { retrieveChartCanonDossier } from "./astrologyKnowledge/canon/retriever";
import { getPlanetInHouseKnowledge } from "./astrologyKnowledge/canon/planetInHouseInterpretations";
import { synthesizeHoraryWithGroq } from "./services/groqHoraryService";

export type HoraryInput = Pick<ChartInput, "location" | "latitude" | "longitude" | "timezone" | "date" | "time"> & {
  question: string;
  subject: "querent" | "other";
  topicHouse: number;
  /** House of the person asked about, counted from the querent. */
  subjectHouse?: number;
  natal?: Pick<ChartInput, "location" | "latitude" | "longitude" | "timezone" | "date" | "time">;
};

type HoraryPlacement = {
  name: string;
  longitude: number;
  display: string;
  sign: string;
  house: number;
  retrograde: boolean;
  speed: number;
  godHouse?: number;
  agentHouse?: number;
  frameRelationship?: FrameRelationship;
};

type HoraryAspect = {
  first: string;
  second: string;
  aspect: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
  phase: "applying" | "separating" | "unclear";
};

export type HoraryChart = {
  question: string;
  subject: "querent" | "other";
  subjectHouse: number;
  subjectRuler: string;
  topicHouse: number;
  actualTopicHouse: number;
  topicLabel: string;
  askedAt: string;
  location: string;
  timezone: string;
  houseSystem: "Equal House";
  ascendant: { longitude: number; display: string; sign: string };
  querentRuler: string;
  topicRuler: string;
  moon: HoraryPlacement;
  houses: Array<{ house: number; longitude: number; sign: string; ruler: string }>;
  placements: HoraryPlacement[];
  relevantAspects: HoraryAspect[];
  otherCloseAspects: HoraryAspect[];
  lookahead: Lookahead;
  natalChart?: Awaited<ReturnType<typeof calculateChart>>;
  transitChart: Awaited<ReturnType<typeof calculateChart>>;
  godChart: Awaited<ReturnType<typeof calculateChart>>;
  traditional: TraditionalHoraryEvidence;
  canonEvidenceText: string;
  evidenceText: string;
  judgmentEvidenceText: string;
  unifiedSynthesisContext?: string;
  unifiedSynthesisSnapshotId?: string;
};

const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};
const CLASSICAL_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const ASPECT_TARGETS: Array<[number, HoraryAspect["aspect"]]> = [
  [0, "conjunction"], [60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"],
];
const ASPECT_ORB_DEGREES = 5;

function inferSubjectHouse(input: HoraryInput) {
  if (input.subject === "querent") return 1;
  if (input.subjectHouse && Number.isInteger(input.subjectHouse) && input.subjectHouse >= 1 && input.subjectHouse <= 12) return input.subjectHouse;
  const q = input.question.toLowerCase();
  if (/\b(my|our)\s+(child|son|daughter|kid)\b|\b(child|son|daughter)\s+of\s+mine\b/.test(q)) return 5;
  if (/\b(my|our)\s+(brother|sister|sibling)\b/.test(q)) return 3;
  if (/\b(my|our)\s+(mother|mum|mom|father|dad|parent)\b/.test(q)) return /\b(father|dad)\b/.test(q) ? 10 : 4;
  if (/\b(my|our)\s+(boss|manager|employer)\b/.test(q)) return 10;
  if (/\b(my|our)\s+(friend|group|team)\b/.test(q)) return 11;
  if (/\b(my|our)\s+(partner|spouse|husband|wife|boyfriend|girlfriend)\b/.test(q)) return 7;
  return 7;
}
function signOf(longitude: number) {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)];
}

function ordinal(value: number) {
  const remainder = value % 100;
  const suffix = remainder >= 11 && remainder <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[value % 10] ?? "th";
  return `${value}${suffix}`;
}

function separation(a: number, b: number) {
  return Math.abs(((normalizeLongitude(a - b) + 180) % 360) - 180);
}

export function aspectBetween(a: HoraryPlacement, b: HoraryPlacement): HoraryAspect | null {
  const distance = separation(a.longitude, b.longitude);
  const closest = ASPECT_TARGETS.map(([target, aspect]) => ({ aspect, orb: Math.abs(distance - target) }))
    .sort((left, right) => left.orb - right.orb)[0];
  if (!closest || closest.orb > ASPECT_ORB_DEGREES) return null;

  // Use the instantaneous change in the signed angular error. A full-day
  // projection can jump across perfection (especially for the Moon) and label
  // an approaching contact as separating.
  const signedDistance = ((normalizeLongitude(a.longitude - b.longitude) + 180) % 360) - 180;
  const target = ASPECT_TARGETS.find(([, aspect]) => aspect === closest.aspect)![0];
  const signedTarget = signedDistance < 0 ? -target : target;
  const error = signedDistance - signedTarget;
  const relativeSpeed = a.speed - b.speed;
  const phase = Math.abs(error) < 1e-7 || Math.abs(relativeSpeed) < 1e-7
    ? "unclear"
    : error * relativeSpeed < 0 ? "applying" : "separating";
  return { first: a.name, second: b.name, aspect: closest.aspect, orb: Number(closest.orb.toFixed(2)), phase };
}

function uniquePairs(placements: HoraryPlacement[], names: string[]) {
  const selected = Array.from(new Set(names)).map(name => placements.find(placement => placement.name === name)).filter((row): row is HoraryPlacement => Boolean(row));
  const pairs: Array<[HoraryPlacement, HoraryPlacement]> = [];
  for (let i = 0; i < selected.length; i += 1) {
    for (let j = i + 1; j < selected.length; j += 1) pairs.push([selected[i], selected[j]]);
  }
  return pairs;
}

export async function calculateHoraryChart(input: HoraryInput): Promise<HoraryChart> {
  const calculated = await calculateChart({
    location: input.location,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    date: input.date,
    time: input.time,
    // A horary chart is one chart cast for the question moment, not a natal chart
    // paired with today's sky. Supplying the same moment keeps the existing
    // calculation interface deterministic while only the first chart is read.
    transitLocation: input.location,
    transitLatitude: input.latitude,
    transitLongitude: input.longitude,
    transitTimezone: input.timezone,
    transitDate: input.date,
    transitTime: input.time,
  });
  if (!calculated.ascendant) throw new Error("Horary requires an Agent View Ascendant.");
  const ascendant = calculated.ascendant;
  const natalChart = input.natal
    ? await calculateChart({
        ...input.natal,
        transitLocation: input.location,
        transitLatitude: input.latitude,
        transitLongitude: input.longitude,
        transitTimezone: input.timezone,
        transitDate: input.date,
        transitTime: input.time,
        worldview: "agent-vs-god",
        readingScope: "combined",
        birthTimeKnown: Boolean(input.natal.time),
      })
    : undefined;
  // Without a natal profile there is nothing for the question-moment sky to contact.
  // Do not compare the question chart against itself: that invents natal contacts.
  const transitChart = natalChart ?? { ...calculated, transits: calculated.transits.map(row => ({ ...row, natalContacts: [], minorNatalContacts: [] })) };
  const godChart = await calculateChart({
    location: input.location,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    date: input.date,
    time: input.time,
    transitDate: input.date,
    transitTime: input.time,
    transitTimezone: input.timezone,
    transitLocation: input.location,
    transitLatitude: input.latitude,
    transitLongitude: input.longitude,
    worldview: "god",
    readingScope: "transit",
    birthTimeKnown: true,
  });

  const placements: HoraryPlacement[] = calculated.movingBodies.map(row => ({
    name: row.name,
    longitude: row.longitude,
    display: row.display,
    sign: signOf(row.longitude),
    house: row.house,
    retrograde: Boolean(row.retrograde),
    speed: row.speed ?? 0,
    godHouse: row.godHouse,
    agentHouse: row.agentHouse,
    frameRelationship: row.frameRelationship,
  }));
  const houses = calculated.houses.map((longitude, index) => {
    const sign = signOf(longitude);
    return { house: index + 1, longitude, sign, ruler: TRADITIONAL_RULERS[sign] };
  });
  const topic = HORARY_TOPICS.find(item => item.house === input.topicHouse);
  if (!topic) throw new Error("Choose a valid topic house before casting the horary chart.");

  const querentRuler = houses[0].ruler;
  const subjectHouse = inferSubjectHouse(input);
  const subjectRuler = houses[subjectHouse - 1].ruler;
  const actualTopicHouse = ((subjectHouse - 1 + input.topicHouse - 1) % 12) + 1;
  const topicRuler = houses[actualTopicHouse - 1].ruler;
  const moon = placements.find(row => row.name === "Moon");
  if (!moon) throw new Error("The Moon position is not available in the calculated question chart.");
  const aspectNames = Array.from(new Set([querentRuler, subjectRuler, topicRuler, "Moon"]));
  const relevantAspects = uniquePairs(placements, aspectNames)
    .map(([first, second]) => aspectBetween(first, second))
    .filter((aspect): aspect is HoraryAspect => Boolean(aspect));
  const significatorNames = new Set(aspectNames);
  const canonDossier = retrieveChartCanonDossier(calculated);
  const canonDossierEvidenceText = canonDossier.placements
    .filter(row => significatorNames.has(row.body))
    .map(row => [
      `- ${row.body}: ${row.planetInSignSynthesis}`,
      `  - Condition: ${row.dignityAndCondition.conditionSummary}`,
      `  - House doctrine: ${row.planetInHouseSynthesis}`,
      row.godToAgentNote ? `  - God → Agent: ${row.godToAgentNote}` : null,
    ].filter((line): line is string => Boolean(line)).join("\n"))
    .join("\n") || "- No local canon placement dossier was available for the selected significators.";
  // Canon-first dual-frame interpretation: resolve every available placement against
  // the 144-record local library before requesting language synthesis.
  const canonBodyName = (name: string) =>
    name === "North Node" || name === "True Node" ? "Rahu" :
    name === "South Node" ? "Ketu" : name;
  const dualFrameCanonEvidence = placements.map(row => {
    const body = canonBodyName(row.name);
    const views = [
      { label: "God View", house: row.godHouse },
      { label: "Agent View", house: row.agentHouse ?? row.house },
    ];
    const records = views.map(view => {
      const record = view.house == null ? null : getPlanetInHouseKnowledge(body, view.house);
      if (!record) return `  - ${view.label}: no matching planet-in-house canon record; do not invent one.`;
      return [
        `  - ${view.label}: House ${view.house} · ${record.domain} [${record.ruleId}]`,
        `    Core: ${record.core}`,
        `    Career: ${record.career}`,
        `    Relationships: ${record.relationships}`,
        `    Challenge: ${record.challenge}`,
        `    Gift: ${record.gift}`,
        `    Vedic / historical context: ${record.vedic}`,
        `    Provenance: ${record.epistemicStatus}; ${record.sourceCaveat}`,
        `    Interpretation rule: ${record.interpretiveGuardrail}`,
      ].join("\\n");
    });
    return `- ${row.name} at ${row.display}\\n${records.join("\\n")}`;
  }).join("\\n");
  const canonEvidenceText = `DUAL-FRAME PLANET-IN-HOUSE CANON (resolved locally before interpretation):\\n${dualFrameCanonEvidence}\\n\\nSIGNIFICATOR CONDITION DOSSIER:\\n${canonDossierEvidenceText}`;
  // Other close contacts may add context, but do not become additional significators.
  const otherCloseAspects = uniquePairs(placements, CLASSICAL_PLANETS)
    .filter(([first, second]) => !(significatorNames.has(first.name) && significatorNames.has(second.name)))
    .map(([first, second]) => aspectBetween(first, second))
    .filter((aspect): aspect is HoraryAspect => Boolean(aspect));
  // Future exact contacts and stations are astronomical data, not event forecasts.
  const lookahead = calculateLookahead(calculated.julianDay, input.timezone);
  const ascendantLongitude = ascendant.longitude;
  const ascendantSign = signOf(ascendantLongitude);
  const askedAt = calculated.utc;
  const placementLines = placements
    .filter(row => CLASSICAL_PLANETS.includes(row.name))
    .map(row => `- ${row.name}: ${row.display}; ${row.sign}, house ${row.house}${row.retrograde ? "; retrograde" : ""}`)
    .join("\n");
  const houseLines = houses
    .map(row => `- House ${row.house}: ${row.sign} on cusp; ruler ${row.ruler}`)
    .join("\n");
  const frameLines = placements
    .filter(row => row.frameRelationship && row.godHouse != null && row.agentHouse != null)
    .map(row => {
      const relationship = row.frameRelationship!;
      return [
        `- ${row.name}: one calculated longitude ${row.display}`,
        `  - God View: House ${row.godHouse}; themes: ${relationship.godThemes.join(" · ")}`,
        `  - Agent View: House ${row.agentHouse}; themes: ${relationship.agentThemes.join(" · ")}`,
        `  - Relationship shown in the box: ${relationship.type}`,
        `  - Translation shown in the box: ${relationship.translation}`,
        relationship.tension ? `  - Tension / visibility note shown in the box: ${relationship.tension}` : null,
        `  - Synthesis shown in the box: ${relationship.synthesis}`,
      ].filter((line): line is string => Boolean(line)).join("\n");
    })
    .join("\n") || "- No dual God/Agent relationship was calculated.";
  const aspectLines = relevantAspects.length
    ? relevantAspects.map(row => `- ${row.first} ${row.aspect} ${row.second}, orb ${row.orb}° (${row.phase})`).join("\n")
    : "- No major aspect among the listed significators and Moon was within the configured 5° orb.";
  const otherAspectLines = otherCloseAspects.length
    ? otherCloseAspects.map(row => `- ${row.first} ${row.aspect} ${row.second}, orb ${row.orb}° (${row.phase})`).join("\n")
    : "- None within the configured 5° orb.";
  const upcomingLines = lookahead.upcomingAspects.length
    ? lookahead.upcomingAspects.map(row => {
        const role = significatorNames.has(row.first) || significatorNames.has(row.second) ? "involves a significator or the Moon" : "background only";
        return `- ${row.first} ${row.aspect} ${row.second}: exact ${row.exactAtLocal} (${role})`;
      }).join("\n")
    : "- None found in the window.";
  const stationLines = lookahead.stations.length
    ? lookahead.stations.map(row => `- ${row.planet} turns ${row.turns} on ${row.atLocal}`).join("\n")
    : "- No planet changes direction in the window.";
  const traditional = calculateTraditionalHorary({ ascendant: { name: "Ascendant", longitude: ascendant.longitude, house: 1 }, houses, placements, topicRuler, subjectRuler, querentRuler, questionRuler: input.subject === "querent" ? querentRuler : subjectRuler, lookahead, referenceUtc: askedAt });
  const lotLines = traditional.lots.map(lot => `- ${lot.name}: ${lot.display}; house ${lot.house}; ${lot.formula}; ${lot.meaning}`).join("\n");
  const dignityLines = traditional.dignities.map(row => `- ${row.planet}: ${row.sign}, house ${row.house}; essential ${row.essential.length ? row.essential.join(", ") : "none"} (${row.essentialScore}); accidental ${row.accidental.join(", ")} (${row.accidentalScore}); debilities ${row.debilities.length ? row.debilities.join(", ") : "none"}`).join("\n");
  const receptionLines = traditional.receptions.length ? traditional.receptions.map(row => `- ${row.description}`).join("\n") : "- No configured reception found among the classical planets.";
  const starLines = traditional.fixedStars.length ? traditional.fixedStars.map(row => `- ${row.planet} conjunct ${row.star}, orb ${row.orb}°; nature ${row.nature}; ${row.meaning}`).join("\n") : "- No classical planet or Ascendant is within the configured 1° fixed-star orb.";
  const overlayLines = traditional.overlays.map(row => `- ${row.body}: ${row.display}; Nakshatra ${row.nakshatra} Pada ${row.pada}; Manzil ${row.manzil}; Decan ${row.decan}`).join("\n");
  const timingLines = traditional.timing.length ? traditional.timing.map(row => `- ${row.from} ${row.aspect} ${row.to}: ${row.degreesToPerfection}°; ${row.estimatedUnits}; ${row.method}`).join("\n") : "- No configured key-significator perfection estimate was available.";
  const corePlacementLines = placements
    .filter(row => significatorNames.has(row.name))
    .map(row => `- ${row.name}: ${row.display}; ${row.sign}, House ${row.house}${row.retrograde ? "; retrograde" : ""}`)
    .join("\n");
  const natalEvidence = natalChart
    ? `NATAL / AGENT EVIDENCE SET (person's birth chart; local houses belong to the person):\n${natalChart.movingBodies.map(row => `- ${row.name}: ${row.display}; house ${row.house}`).join("\n")}\n- Ascendant: ${natalChart.ascendant?.display ?? "unavailable"}\n- Birth UTC: ${natalChart.utc}`
    : "NATAL / AGENT EVIDENCE SET: unavailable; no complete person birth profile was supplied. Do not infer or invent a natal chart.";
  const transitEvidence = natalChart
    ? `TRANSIT / QUESTION-MOMENT EVIDENCE SET (sky at the supplied question moment, compared with the natal foundation):\n${transitChart.transits.map(row => `- ${row.name}: ${row.display}; contacts ${row.natalContacts.length ? row.natalContacts.map(contact => `${contact.aspect} natal ${contact.natalName} (${contact.orb}°)`).join(", ") : "none within configured orb"}`).join("\n")}\n- Transit UTC: ${transitChart.transitDate}`
    : `TRANSIT / QUESTION-MOMENT EVIDENCE SET (sky at the supplied question moment; positions only, because no natal profile was supplied, so there are no natal contacts to report):\n${transitChart.transits.map(row => `- ${row.name}: ${row.display}`).join("\n")}\n- Transit UTC: ${transitChart.transitDate}`;
  const godEvidence = `GOD VIEW / GEOCENTRIC EVIDENCE SET (same question moment; no observer, horizon, Ascendant, or local houses):\n${godChart.movingBodies.map(row => `- ${row.name}: ${row.display}; God House ${row.godHouse}`).join("\n")}\n- Transit UTC: ${godChart.transitDate}`;
  const natalQuestionEvidence = natalChart
    ? `QUERENT NATAL LAYER FOR THIS HORARY (use only as the person's background and natal foundation):\n${natalChart.movingBodies.map(row => `- ${row.name}: ${row.display}; natal Agent House ${row.agentHouse ?? row.house}`).join("\n")}\n- Natal Ascendant: ${natalChart.ascendant?.display ?? "unavailable"}`
    : "QUERENT NATAL LAYER: unavailable; no complete natal profile was supplied.";
  const transitQuestionEvidence = natalChart
    ? `QUESTION-MOMENT TRANSITS TO THE QUERENT NATAL CHART:\n${transitChart.transits.map(row => `- ${row.name}: ${row.display}; ${row.natalContacts.length ? row.natalContacts.map(contact => `${contact.aspect} natal ${contact.natalName} (${contact.orb}°)`).join(", ") : "no configured natal contact"}`).join("\n")}`
    : "QUESTION-MOMENT TRANSITS: positions are available, but no natal comparison contacts can be calculated without a complete querent natal profile.";
  const evidenceText = [
    `Question: ${input.question}`,
    `Question asked at: ${askedAt} UTC (${input.date} ${input.time} local; ${input.timezone})`,
    `Location: ${input.location} (${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)})`,
    `Coordinate model: equatorial ephemeris XYZ projected into the fixed firmament frame, without tropical/sidereal conversion. House system: Equal House, with 30-degree cusps from the sunrise-anchored Ascendant and elapsed rotation at exactly 15 degrees per hour. Planetary longitudes are geocentric; a separate topocentric (parallax-corrected) Moon longitude is available but is not used for houses or aspects.`,
    `Question topic: ${topic.label} (${ordinal(input.topicHouse)} house from the ${input.subject === "querent" ? "querent" : "other person"}).`,
    `Ascendant: ${ascendant.display} (${ascendantSign}); querent's primary ruler: ${querentRuler}.`,
    `Person asked about: ${input.subject === "querent" ? "the querent (House 1)" : `another person (House ${subjectHouse})`}; that person's ruler: ${subjectRuler}.`,
    `Topic house: house ${input.topicHouse} counted from the person asked about is actual chart house ${actualTopicHouse}; cusp sign ${houses[actualTopicHouse - 1].sign}; topic ruler ${topicRuler}.`,
    `Significator roles: querent = House 1 ruler ${querentRuler}; person asked about = House ${subjectHouse} ruler ${subjectRuler}; matter = actual chart House ${actualTopicHouse} ruler ${topicRuler}. Traditional judgment compares ${input.subject === "querent" ? `the querent ruler ${querentRuler}` : `the subject ruler ${subjectRuler}`} with matter ruler ${topicRuler}; retain the querent ruler as context. Do not interchange these roles.`,
    `Moon: ${moon.display}, ${moon.sign}, house ${moon.house}${moon.retrograde ? ", retrograde" : ""}.`,
    `Traditional planetary placements:\n${placementLines}`,
    `House cusps and traditional rulers:\n${houseLines}`,
    `GOD VIEW / AGENT VIEW RELATIONSHIP SYNTHESIS (contextual layer; do not replace horary testimony):\n${frameLines}`,
    `Major aspects among the querent, person, matter significators, and Moon (maximum 5° orb):\n${aspectLines}`,
    `Other close major aspects among the seven classical planets (max 5° orb; at least one planet is not a significator or the Moon):\n${otherAspectLines}`,
    `Upcoming exact aspects (calculated from the ephemeris; local timezone ${input.timezone}; Moon contacts cover ${lookahead.moonWindowDays} days and other contacts cover ${lookahead.windowDays} days). A listed date/time is when the planetary contact becomes exact, not a prediction of when an event will happen:\n${upcomingLines}`,
    `Planetary stations in the next ${lookahead.windowDays} days (date indicates when the planet changes apparent direction, not an event prediction):\n${stationLines}`,
    `TRADITIONAL LOTS / ARABIC PARTS (calculated formulas; interpret in context):\n${lotLines}`,
    `ESSENTIAL AND ACCIDENTAL DIGNITY / DEBILITY (traditional scoring aid, not a standalone judgment):\n${dignityLines}`,
    `RECEPTION / MUTUAL RECEPTION (host receives guest):\n${receptionLines}`,
    `TRADITIONAL MOON STATUS: ${traditional.moonStatus.explanation}${traditional.moonStatus.nextApplications.length ? `\nNext applications: ${traditional.moonStatus.nextApplications.map(a => `${a.planet} ${a.aspect} in ${a.daysToPerfection} days`).join("; ")}` : ""}`,
    `PERFECTION / INTERRUPTION TESTIMONY:\n${traditional.perfection.length ? traditional.perfection.map(p => `- ${p.type.toUpperCase()} (${p.strength}): ${p.description}`).join("\n") : "- No configured direct perfection, translation, collection, or prohibition testimony was found."}`,
    `PROVISIONAL TRADITIONAL JUDGMENT: ${traditional.judgment.verdict}; score ${traditional.judgment.score}. ${traditional.judgment.explanation}`,
    `FIXED-STAR TESTIMONY (conjunctions within 1° only):\n${starLines}`,
    `RADICALITY / CONSIDERATIONS BEFORE JUDGMENT: status ${traditional.radicality.status}; ${traditional.radicality.explanation}\n${traditional.radicality.considerations.length ? traditional.radicality.considerations.map(row => `- ${row}`).join("\n") : "- No configured caution was triggered."}`,
    `TRADITIONAL EVENT-TIMING AID (degrees to perfection and modality estimate; not a guaranteed event date):\n${timingLines}`,
    `LUNAR MANSION / MANZIL / DECAN CONTEXT FOR CLASSICAL PLANETS AND ASCENDANT:\n${overlayLines}`,
    "FULL 16/20-LAYER SYNTHESIS REPORT (contextual; horary testimony remains primary)",
    "16 SELF-KNOWLEDGE DIMENSIONS: supplied through the unified Master method evidence when available; missing dimensions remain explicitly unavailable.",
    "16-SYSTEM CONVERGENCE AUDIT: compare returned system evidence without inventing absent results.",
    "PLANET INTERACTION MATRIX: use the calculated aspects and relationship evidence supplied above.",
    "LANGUAGE SAFETY RESTRICTIONS: symbolic possibilities are not diagnoses, guarantees, biographies, or claims about another person’s private mind.",
    natalEvidence,
    transitEvidence,
    godEvidence,
    "Three-layer reading rule: keep the NATAL / AGENT, TRANSIT / QUESTION-MOMENT, and GOD VIEW / GEOCENTRIC evidence sets explicitly separate. Use natal houses only for the person layer; use transit contacts to describe activation; use God View for the whole-sky context. Never turn God View into local houses or a personal Ascendant.",
    "Method boundary: the traditional layer now calculates configured Lots, dignity/debility indicators, reception, close fixed-star testimony, radicality cautions, a non-deterministic perfection timing aid, and lunar mansion/Manzil/Decan overlays. Configured perfection records include direct contact, translation, collection, and prohibition when supported by the supplied evidence. This is not an exhaustive implementation of every traditional doctrine or a complete traditional event-timing judgment; do not invent records that were not returned.",
  ].join("\n\n");
  const judgmentEvidenceText = [
    `Question: ${input.question}`,
    `Question asked at: ${askedAt} UTC (${input.date} ${input.time} local; ${input.timezone})`,
    `Question topic: ${topic.label}; the selected relative House ${input.topicHouse} is actual chart House ${actualTopicHouse}.`,
    `Roles: querent = House 1 ruler ${querentRuler}; person asked about = House ${subjectHouse} ruler ${subjectRuler}; matter = actual House ${actualTopicHouse} ruler ${topicRuler}. Traditional judgment compares ${input.subject === "querent" ? querentRuler : subjectRuler} with ${topicRuler}; keep the roles separate.`,
    `Ascendant: ${ascendant.display}; Moon: ${moon.display}, ${moon.sign}, House ${moon.house}${moon.retrograde ? ", retrograde" : ""}.`,
    `Core placements:\n${corePlacementLines}`,
    `Relevant major aspects supplied by the calculator (maximum 5° orb):\n${aspectLines}`,
    `LOCAL FIRMAMENT CANON / DETERMINISTICALLY RETRIEVED FOR THE RELEVANT SIGNIFICATORS:\n${canonEvidenceText}`,
    natalQuestionEvidence,
    transitQuestionEvidence,
    `Radicality / considerations before judgment: status ${traditional.radicality.status}; ${traditional.radicality.explanation}${traditional.radicality.considerations.length ? `\n- ${traditional.radicality.considerations.join("\n- ")}` : ""}`,
    `Configured traditional support: ${traditional.receptions.length ? traditional.receptions.map(row => row.description).join("; ") : "No configured reception found."}`,
    "This is the compact judgment evidence. The complete technical appendix follows, including dignity/debility, Lots, receptions, timing, fixed stars, lunar mansion/Manzil/Decan/Nakshatra overlays, and the Moon/perfection testimony. Use all supplied layers in clear English, keeping traditional horary significators and perfection as the primary judgment, with natal and transit charts as context.",
  ].join("\n\n");

  return {
    question: input.question,
    subject: input.subject,
    subjectHouse,
    subjectRuler,
    topicHouse: input.topicHouse,
    actualTopicHouse,
    topicLabel: topic.label,
    askedAt,
    location: input.location,
    timezone: input.timezone,
    houseSystem: "Equal House",
    ascendant: { longitude: ascendantLongitude, display: ascendant.display, sign: ascendantSign },
    querentRuler,
    topicRuler,
    moon,
    houses,
    placements,
    relevantAspects,
    otherCloseAspects,
    lookahead,
    natalChart,
    transitChart,
    godChart,
    traditional,
    canonEvidenceText,
    evidenceText,
    judgmentEvidenceText,
  };
}

const HORARY_SYSTEM = `${FULL_SYNTHESIS_STYLE}\n\n---\n\n${FIRMAMENT_MASTER_INTERPRETATION_PROMPT}\n\n---\n\n${FIRMAMENT_CARE_DELIVERY_STANDARD}\n\n---\n\nHORARY VISIBLE ANSWER CONTRACT — REQUIRED\n${FIRMAMENT_VISIBLE_INTERPRETATION_FORMAT}\n\n---\n\nHORARY READING PRESENTATION — FLEXIBLE\nThe three-wheel framework guides examination, not the conclusion or format. Select the order, emphasis, and level of detail that best answer the actual question. No exact headings or mandatory emotional preamble. Give clear evidence for conclusions, including challenging and contradictory testimony.\n\n---\n\n${HORARY_SPECIALIZED_SYSTEM}`;

function responseText(content: string | Array<{ type: string; text?: string }> | undefined) {
  return typeof content === "string"
    ? content
    : (content ?? []).filter(part => part.type === "text").map(part => part.text ?? "").join("\n");
}

async function answer(messages: Message[], maxTokens = 6000) {
  const controller = new AbortController();
  const responsePromise = invokeLLM({ model: "claude-sonnet-4-6", messages, maxTokens, signal: controller.signal });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort(new Error("Horary synthesis deadline exceeded."));
      reject(new Error("Horary language synthesis exceeded its 30-second time budget."));
    }, 30_000);
  });
  let response: Awaited<typeof responsePromise>;
  try {
    response = await Promise.race([responsePromise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
  const text = responseText(response.choices?.[0]?.message?.content);
  if (!text.trim()) throw new Error("The horary interpreter returned no readable answer. Please try again.");
  return text;
}

function translateRadicalityToRealWorld(considerations: string[]): string {
  if (!considerations.length) {
    return "The circumstances surrounding your question are clearly defined and ready to be examined directly, without hidden distortions.";
  }
  return considerations.map(c => {
    if (c.includes("Moon is in the 7th house") || c.includes("7th house")) {
      return "Your thoughts and emotional energy are heavily wrapped up in what the other person is thinking or doing. Because you care so deeply about how they react, there is a real risk of second-guessing yourself or over-analyzing every move they make. Take a breath and remember where your own ground is.";
    }
    if (c.includes("Saturn is in the 7th house")) {
      return "The other party may be feeling cautious, burdened, or guarded right now. If they seem distant, slow to respond, or formal, don't take it as personal hostility—they are operating with their own heavy boundaries or pressure right now.";
    }
    if (c.includes("first 3°") || c.includes("early degrees")) {
      return "This situation is still in its early stages. People haven't put all their cards on the table yet, and key information is still emerging. Don't rush to lock in a final verdict before the pieces settle.";
    }
    if (c.includes("last 3°") || c.includes("late degrees")) {
      return "This situation is nearing the end of its current chapter. Whatever major decisions were going to be made have largely already happened behind the scenes, and pushing hard to force a different outcome now would be fighting yesterday's battle.";
    }
    if (c.includes("speed is temporarily steady") || c.includes("speed is unavailable")) {
      return "Things are temporarily suspended in a holding pattern until the next step unfolds.";
    }
    return c;
  }).join("\n\n");
}

function getRealWorldVerdictNarrative(verdict: string, topicLabel: string): string {
  switch (verdict) {
    case "LEANING YES":
      return `Things are tilting in your favor. When looking at what's actually happening behind your question regarding ${topicLabel.toLowerCase()}, the momentum is on your side. The people and conditions involved are lining up to make a connection or bring a positive development, as long as you stay engaged and follow through.`;
    case "LEANING NO":
      return `The signs point to a likely 'no' or a significant dead end for how things currently stand. The energy between the key players is pulling in opposite directions or hitting a wall. Trying to force this through right now is likely to leave you frustrated and burned out. It’s better to pause, protect your peace, and look at alternative options.`;
    case "MIXED / CONDITIONAL":
      return `This is a 'yes, but with real strings attached' or a situation that depends heavily on how both sides handle the next conversation. The door isn't locked shut, but it's definitely not swinging wide open on its own either. There are conflicting priorities or mutual hesitations that have to be brought out into the open before anything concrete can move forward.`;
    case "INSUFFICIENT TESTIMONY":
    default:
      return `Right now, the dust hasn't settled enough for a clean answer. The situation is in flux, and the key people involved haven't fully made up their minds. Making a big, irreversible move today would be premature because things are going to look different once more information comes to light.`;
  }
}

function getRealWorldDynamic(chart: HoraryChart): string {
  const primaryRuler = chart.subject === "querent" ? chart.querentRuler : chart.subjectRuler;
  const matterRuler = chart.topicRuler;
  const directAspect = chart.relevantAspects.find(
    aspect =>
      (aspect.first === primaryRuler && aspect.second === matterRuler) ||
      (aspect.first === matterRuler && aspect.second === primaryRuler)
  );

  const matterRole = `the matter at hand (governed by ${matterRuler})`;

  if (directAspect) {
    const isApplying = directAspect.phase === "applying";
    let aspectMeaning = "";
    if (directAspect.aspect === "conjunction") {
      aspectMeaning = isApplying
        ? "you and this matter are heading directly toward an unavoidable meeting of minds, agreement, or decisive encounter."
        : "a decisive meeting or climax has already happened in the recent past, and you are currently dealing with the immediate aftermath.";
    } else if (directAspect.aspect === "trine") {
      aspectMeaning = isApplying
        ? "goodwill and natural cooperation are flowing between both sides. You won't have to fight tooth and nail; a sincere, open conversation will open doors easily."
        : "a period of easy understanding or natural harmony has recently peaked, setting a supportive baseline.";
    } else if (directAspect.aspect === "sextile") {
      aspectMeaning = isApplying
        ? "an opportunity is genuinely on the table, but it won't land in your lap automatically—it requires you to reach out, follow up, and take the initiative."
        : "an opening was presented recently, and the ball remains in your court to capitalize on it.";
    } else if (directAspect.aspect === "square") {
      aspectMeaning = isApplying
        ? "there is real tension or a clash of expectations between what you want and what the other side wants. Reaching an agreement will require genuine compromise, tough conversations, or working through friction."
        : "recent friction or arguments have already strained things, and both sides are feeling a bit bruised or defensive.";
    } else if (directAspect.aspect === "opposition") {
      aspectMeaning = isApplying
        ? "both parties are pulling in opposing directions or facing an ultimatum. Even if you come together, it may carry an uneasy feeling of having to sacrifice too much."
        : "a major standoff or split has already played out, and you are feeling the distance that was created.";
    }
    return `In terms of how you and ${matterRole} connect: ${aspectMeaning} (${directAspect.first} ${directAspect.aspect} ${directAspect.second}, orb ${directAspect.orb}°, ${directAspect.phase}).`;
  }

  if (chart.traditional.perfection.some(p => p.type === "translation")) {
    return "You and the other party aren't directly connecting right now, but someone else—a mutual friend, an intermediary, a messenger, or an unexpected third party—is acting as a bridge to carry the momentum forward between you.";
  }
  if (chart.traditional.perfection.some(p => p.type === "collection")) {
    return "While you two aren't seeing eye-to-eye one-on-one, there is an overarching shared platform, mutual authority figure, or common commitment that brings both of you into the same room to work things out.";
  }

  return "Right now, you and this situation are running on parallel tracks without directly engaging. Neither side is actively pushing toward the other, which means without an outside catalyst or a conscious change in approach, things will likely remain quiet or in limbo.";
}

function getRealWorldMoonNarrative(chart: HoraryChart): string {
  const moon = chart.traditional.moonStatus;
  if (moon.voidOfCourse) {
    return "When we look at the emotional heartbeat and immediate flow of events, things are currently in a holding pattern. The anxiety or worry you might be feeling is far bigger than what is actually going to happen in reality. In everyday terms: 'much ado about nothing.' Don't exhaust yourself anticipating a crisis, because the dust is likely to blow over without anything major breaking.";
  }

  if (moon.nextApplications.length > 0) {
    const next = moon.nextApplications[0];
    const daysDesc = next.daysToPerfection < 1
      ? "over the next day or two"
      : next.daysToPerfection < 4
        ? "within the coming few days"
        : "in the coming week";

    let stepFlavor = "a fresh conversation or piece of news";
    if (next.aspect === "trine" || next.aspect === "sextile") {
      stepFlavor = "a supportive exchange, reassurance, or a helpful development";
    } else if (next.aspect === "square" || next.aspect === "opposition") {
      stepFlavor = "a moment of awkwardness, a tough conversation, or having to clarify an uncomfortable misunderstanding";
    } else if (next.aspect === "conjunction") {
      stepFlavor = "a direct confrontation, face-to-face meeting, or decisive moment";
    }

    return `The immediate next chapter unfolds ${daysDesc}: expect ${stepFlavor} (Moon applies to ${next.planet} by ${next.aspect}) that will give you your first real cue on which way this is heading. Take it one step at a time rather than trying to figure out the whole year in advance.`;
  }

  return "Events are unfolding at an everyday, steady pace. You don't need to force an artificial crisis; let the next natural conversation happen.";
}

function getRealWorldTiming(chart: HoraryChart): string {
  if (!chart.traditional.timing.length) {
    return "In terms of timing, this is not an overnight flash in the pan. Expect things to develop progressively over weeks rather than hours.";
  }
  const t = chart.traditional.timing[0];
  const units = Math.max(1, Math.round(t.degreesToPerfection));
  if (units <= 1) {
    return "Regarding timing: developments should be noticeable very soon—likely within days or the very next week.";
  } else if (units <= 4) {
    return `Regarding timing: give this situation about ${units} to ${units + 2} weeks to mature. Don't expect an immediate answer tomorrow; let the process breathe.`;
  } else {
    return `Regarding timing: this is a longer-term arc. It will likely take a few months for the full reality of this situation to play out completely.`;
  }
}

function masterHoraryFollowUp(
  chart: HoraryChart,
  _history: Array<{ role: "user" | "assistant"; content: string }>,
  question: string,
): string {
  const q = question.toLowerCase();
  const primaryRuler = chart.subject === "querent" ? chart.querentRuler : chart.subjectRuler;
  const matterRuler = chart.topicRuler;

  if (/\b(when|time|date|how long|timeline|soon|days|weeks|months)\b/.test(q)) {
    return [
      `Regarding the timing for “${chart.question}”:`,
      "",
      getRealWorldTiming(chart),
      "",
      `The Moon's movement (${chart.traditional.moonStatus.voidOfCourse ? "currently in a holding pattern" : chart.traditional.moonStatus.nextApplications[0] ? `applying to ${chart.traditional.moonStatus.nextApplications[0].planet} in approximately ${chart.traditional.moonStatus.nextApplications[0].daysToPerfection} days` : "unfolding steadily"}) reinforces that rushing things will only cause friction. Watch for the next communication or event in the coming week to see the first tangible shift.`,
    ].join("\n");
  }

  if (/\b(they|he|she|him|her|partner|boss|them|other|person|counterpart|feeling|think)\b/.test(q)) {
    const receptions = chart.traditional.receptions;
    const receptionNote = receptions.length
      ? `Interpersonally, there is goodwill: ${receptions.map(r => r.description).join("; ")}.`
      : "The other side is operating in a fairly detached, neutral mindset right now.";
    return [
      `Regarding the other party involved in this matter (governed by ${chart.subjectRuler}):`,
      "",
      receptionNote,
      "",
      "They have their own pressures, doubts, and boundaries to manage right now. If they seem hesitant or slow, it isn't necessarily hostility towards you—it is usually self-protection or feeling overwhelmed by their own obligations. Giving them some space to respond on their own terms will yield much better results than cornering them.",
    ].join("\n");
  }

  if (/\b(obstacle|complication|why|challenge|oppose|against|risk|danger|wrong|bad)\b/.test(q)) {
    return [
      `Looking at what's complicating this situation:`,
      "",
      translateRadicalityToRealWorld(chart.traditional.radicality.considerations),
      "",
      getRealWorldDynamic(chart),
      "",
      "The greatest risk here isn't failure—it's over-reacting or negotiating against yourself before you even have a direct, honest dialogue.",
    ].join("\n");
  }

  if (/\b(what should i do|what to do|next step|advice|guidance|action|recommendation)\b/.test(q)) {
    return [
      `Here is the most grounded, practical way to handle this right now:`,
      "",
      "1. **Stay in your own center:** Don't obsess over what they are doing behind the scenes. Focus on your daily priorities and keep your own foundation solid.",
      "2. **Keep communications honest and low-pressure:** When you do speak, be clear, direct, and kind, without issuing ultimatums or demanding instant decisions.",
      "3. **Let time do its work:** Don't force a resolution ahead of schedule. Let people's actions show you who they are over the coming weeks.",
    ].join("\n");
  }

  return [
    `Regarding your question: “${question}”`,
    "",
    `The core astrological reading remains anchored to ${chart.traditional.judgment.verdict}.`,
    "",
    `Between you (${primaryRuler}) and the matter (${matterRuler}), ${getRealWorldDynamic(chart)}`,
    "",
    getRealWorldMoonNarrative(chart),
    "",
    "Take this as grounded clarity: honor what you can control, let go of trying to micromanage what you cannot, and step forward with patience and discernment.",
  ].join("\n");
}

function deterministicHoraryReading(chart: HoraryChart) {
  const primaryRuler = chart.subject === "querent" ? chart.querentRuler : chart.subjectRuler;
  const judgment = chart.traditional.judgment.verdict;
  const querentPlacement = chart.placements.find(p => p.name === primaryRuler);
  const houseNum = querentPlacement?.house ?? 1;

  const natalSummary = chart.natalChart
    ? `The querent’s natal layer is present: Sun ${chart.natalChart.movingBodies.find(row => row.name === "Sun")?.display ?? "unavailable"}, Moon ${chart.natalChart.movingBodies.find(row => row.name === "Moon")?.display ?? "unavailable"}, Ascendant ${chart.natalChart.ascendant?.display ?? "unavailable"}.`
    : "No complete querent natal profile was supplied, so the reading does not infer natal background.";

  const godAgentSynthesis = chart.placements.filter(row => row.frameRelationship).map(row => row.frameRelationship?.synthesis).filter(Boolean).join(" ")
    || `Looking at the big picture (God View), this moment is calling for maturity, patience, and self-possession. On the practical ground (Agent View, through your ${ordinal(houseNum)} house), it tests your ability to handle real-world conversations without second-guessing yourself or giving your power away.`;

  return [
    "## What I hear beneath your question",
    `You are asking: “${chart.question}”`,
    `You want to know what is genuinely unfolding around ${chart.topicLabel.toLowerCase()}—not theoretical jargon, but what to expect between the people involved, whether things are moving or stalled, and what you should actually do.`,
    "",
    "## Judgment",
    `**${judgment}** — this is the calibrated verdict supported by the configured horary testimony (score: ${chart.traditional.judgment.score > 0 ? `+${chart.traditional.judgment.score}` : chart.traditional.judgment.score}).`,
    "",
    getRealWorldVerdictNarrative(judgment, chart.topicLabel),
    "",
    "## What this means for you",
    `In this chart, you are represented by ${primaryRuler}, the situation or other party by ${chart.topicRuler}, and the immediate emotional pulse by the Moon.`,
    "",
    getRealWorldDynamic(chart),
    "",
    getRealWorldMoonNarrative(chart),
    "",
    getRealWorldTiming(chart),
    "",
    "## The astrological picture",
    `Traditional testimony: ${chart.traditional.judgment.testimonies.join(" ")}`,
    `God View / Agent View synthesis from the displayed evidence box: ${godAgentSynthesis}`,
    natalSummary,
    "",
    "## What complicates it",
    translateRadicalityToRealWorld(chart.traditional.radicality.considerations),
    "",
    "## What to do with this",
    "1. **Do not over-analyze:** When you care a lot about an outcome, every quiet moment feels like a crisis. Breathe and give the other side room to breathe too.",
    "2. **Speak plainly:** Avoid subtle hints or defensive posturing. Direct, kind, and simple honesty works wonders.",
    "3. **Trust the pace:** What is real will endure a brief pause; forcing things ahead of time only breaks fragile connections.",
    "",
    "_This core judgment was produced from Firmament’s deterministic chart, traditional, and local canon layers, translated directly into grounded real-world human counsel._",
  ].join("\n");
}

export async function openHoraryQuestion(input: HoraryInput) {
  const chart = await calculateHoraryChart(input);
  // Question-time Horary judgment stays authoritative; Master methods supplement it.
  // The natal foundation belongs to the saved birth profile, never the
  // moment at which the Horary question was asked. Horary remains event-specific.
  // The Master ledger is supplemental to the traditional question judgment.
  try {
    const masterSource = chart.natalChart ?? chart.transitChart;
    const masterMode = chart.natalChart ? "combined" : "natal";
    const { synthesis, context } = await synthesizeChartForReading(masterSource, masterMode, input.question);
    chart.unifiedSynthesisContext = chart.natalChart
      ? "MASTER NATAL + QUESTION-MOMENT TRANSIT EVIDENCE:\n" + context
      : "QUESTION-MOMENT ONLY (NO SAVED NATAL FOUNDATION):\n" + context;
    chart.unifiedSynthesisSnapshotId = synthesis.snapshotId;
  } catch (error) {
    // An optional synthesis failure must not prevent a calculated Horary verdict.
    console.warn("[Horary] Supplemental Master synthesis unavailable", {
      category: error instanceof Error ? "master_error" : "unknown",
    });
    chart.unifiedSynthesisContext = "Supplemental Master synthesis unavailable; use only the calculated Horary and Canon evidence below.";
  }
  const coreReading = deterministicHoraryReading(chart);
  const reading = await synthesizeHoraryWithGroq(chart, HORARY_SYSTEM).then(
    reading => ({ reading, synthesisStatus: "ai_completed" as const }),
    error => {
      const category = error instanceof Error && /time|abort|deadline/i.test(error.message) ? "timeout" : "provider_error";
      console.warn("[Horary] Groq synthesis unavailable; deterministic fallback used", { category });
      return { reading: coreReading, synthesisStatus: "deterministic_fallback" as const };
    },
  );
  return { chart, ...reading };
}

export async function horaryFollowUp(
  chart: HoraryChart,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  question: string,
) {
  return answer([
    { role: "system", content: `${HORARY_SYSTEM}\n\nThis is a follow-up in an existing horary conversation. Keep the original chart and question fixed. Answer the specific follow-up in genuine real-world people talk, connect it to the supplied evidence and prior discussion, and do not recast the chart or silently change the original topic.` },
    { role: "user", content: `Original horary judgment evidence:\n\n${chart.judgmentEvidenceText}\n\nUnified Master method evidence:\n${chart.unifiedSynthesisContext || "Not recorded; do not claim uncalculated methods."}\n\nFull configured chart and canon evidence:\n\n${chart.evidenceText}` },
    ...withCurrentQuestion(history, question, 12),
  ], 1800).catch(() => masterHoraryFollowUp(chart, history, question));
}
