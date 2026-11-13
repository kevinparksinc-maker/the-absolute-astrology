import type { AstrologyRule, AstrologySource } from "./types";

export const ASTROLOGY_SOURCES: AstrologySource[] = [
  {
    id: "firmament-ephemeris",
    name: "Firmament local ephemeris",
    tradition: "firmament",
    authorityType: "calculation",
    status: "active",
    capabilities: ["canonical-longitude", "houses", "transits", "fixed-stars"],
  },
  {
    id: "firmament-architecture",
    name: "Firmament architecture",
    tradition: "firmament",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "5-degree-relationships",
      "god-view",
      "agent-view",
      "nakshatra-overlay",
      "manzil-overlay",
    ],
  },
  {
    id: "local-western-rules",
    name: "Firmament Western rule set",
    tradition: "western",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "planets",
      "signs",
      "houses",
      "aspects",
      "dignity",
      "transits",
    ],
  },
  {
    id: "genesis-pattern-rules",
    name: "Genesis local pattern engine",
    tradition: "firmament",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "configurable-aspects",
      "transit-to-natal-aspects",
      "stelliums",
      "grand-trines",
      "t-squares",
      "dignity",
      "house-emphasis",
      "archetypes",
      "signatures",
    ],
  },
  {
    id: "genesis-astro-engine",
    name: "Genesis Astro Engine",
    tradition: "firmament",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "placement-parser",
      "transits",
      "sade-sati",
      "moon-phase",
      "mind-soul-spirit",
      "pillar-scoring",
      "yogas",
    ],
  },
  {
    id: "genesis-pattern-engine-original",
    name: "Genesis Pattern Engine v2.0",
    tradition: "firmament",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "full-aspect-detection",
      "transit-to-natal-aspects",
      "stelliums",
      "grand-trines",
      "t-squares",
      "planetary-strength",
      "archetypes",
      "signatures",
    ],
  },
  {
    id: "firmament-behavioral-intelligence",
    name: "Firmament Human Behavior & Life-Event Pattern Intelligence",
    tradition: "firmament",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "behavioral-patterns",
      "7-channel-evidence-convergence",
      "5-level-confidence-hierarchy",
      "trigger-motivation-response-cycles",
      "behavioral-polarities",
      "life-event-signatures",
      "event-sequence-chains",
    ],
  },
  {
    id: "firmament-canon-knowledge",
    name: "Firmament Structured Traditional Knowledge Canon",
    tradition: "firmament",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "planets-canon",
      "signs-canon",
      "houses-canon",
      "egyptian-and-ptolemaic-bounds",
      "dorothean-triplicities",
      "36-decans",
      "28-manazil",
      "27-nakshatras-108-padas",
      "royal-and-fixed-stars",
      "hermetic-lots",
      "horary-mechanisms",
      "god-to-agent-translation",
    ],
  },
  {
    id: "local-vedic-rules",
    name: "Firmament Vedic rule set",
    tradition: "vedic",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "d1",
      "house-lords",
      "nakshatra",
      "drishti",
      "varga-architecture",
      "vimshottari-dasha",
      "ashtakavarga-bav-sav",
    ],
  },
  {
    id: "tvam-jyotish",
    name: "Tvam Jyotish",
    tradition: "vedic",
    authorityType: "reference",
    url: "https://apps.apple.com/us/app/tvam-jyotish-vedic-astrology/id1449579147",
    status: "reference-only",
    capabilities: [
      "planet-analysis",
      "nakshatra",
      "yoga",
      "varga",
      "dasha",
      "sade-sati",
    ],
  },
  {
    id: "local-arabic-rules",
    name: "Firmament Arabic rule set",
    tradition: "arabic",
    authorityType: "tradition",
    status: "active",
    capabilities: [
      "sect",
      "whole-sign-houses",
      "lots",
      "manazil",
      "planetary-hours",
      "twelfth-parts",
    ],
  },
  {
    id: "canopy-arabian",
    name: "Canopy: Arabian Astrology",
    tradition: "arabic",
    authorityType: "reference",
    url: "https://play.google.com/store/apps/details?id=stellarappsllc.com.canopy",
    status: "reference-only",
    capabilities: [
      "planetary-hours",
      "manazil",
      "dignity",
      "lots",
      "fixed-stars",
      "transits",
    ],
  },
  {
    id: "astrology-api",
    name: "Astrology-API.io",
    tradition: "vedic",
    authorityType: "api",
    url: "https://astrology-api.io",
    status: "reference-only",
    capabilities: ["positions", "houses", "drishti", "varga", "transits"],
  },
];

export const ASTROLOGY_RULES: AstrologyRule[] = [
  {
    id: "western-5-degree-geometry",
    tradition: "western",
    technique: "aspects",
    subject: "planetary-relationship",
    kind: "deterministic-rule",
    sourceId: "firmament-architecture",
    status: "implemented",
    statement:
      "Unified Firmament relationships use a maximum five-degree orb with proximity weighting.",
  },
  {
    id: "western-dignity-basic",
    tradition: "western",
    technique: "dignity",
    subject: "planet",
    kind: "deterministic-rule",
    sourceId: "local-western-rules",
    status: "implemented",
    statement:
      "Basic domicile, exaltation, fall, and detriment conditions are resolved from the supplied sign.",
  },
  {
    id: "genesis-pattern-engine",
    tradition: "firmament",
    technique: "pattern-recognition",
    subject: "chart",
    kind: "deterministic-rule",
    sourceId: "genesis-pattern-rules",
    status: "implemented",
    doctrine:
      "Genesis v2 pattern engine adapted to Firmament chart rows and house frame",
    statement:
      "Genesis detects configurable aspects, transit-to-natal activations, stelliums, Grand Trines, T-Squares, dignity, house emphasis, archetypes, and high-level signatures.",
  },
  {
    id: "genesis-astro-engine",
    tradition: "firmament",
    technique: "astro-engine",
    subject: "reading",
    kind: "deterministic-rule",
    sourceId: "genesis-astro-engine",
    status: "implemented",
    doctrine:
      "Original Genesis Astro Engine actively run over Firmament chart calculations",
    statement:
      "Genesis Astro Engine parses placements, detects transit activations, scores Mind/Soul/Spirit, detects Sade Sati and Moon phase, and emits readable chart summaries.",
  },
  {
    id: "genesis-pattern-engine-original",
    tradition: "firmament",
    technique: "pattern-engine-original",
    subject: "chart",
    kind: "deterministic-rule",
    sourceId: "genesis-pattern-engine-original",
    status: "implemented",
    doctrine:
      "Original Genesis Pattern Engine v2.0 actively run over Firmament chart rows",
    statement:
      "The original Genesis Pattern Engine runs its configured aspects, planetary strength, classic configurations, archetypes, and signatures as a live reading stage.",
  },
  {
    id: "firmament-behavioral-pattern-engine",
    tradition: "firmament",
    technique: "behavioral-pattern",
    subject: "human-behavior",
    kind: "deterministic-rule",
    sourceId: "firmament-behavioral-intelligence",
    status: "implemented",
    doctrine:
      "7-channel behavioral convergence, 5-level confidence hierarchy, 12 polarity axes, and Trigger-Motivation-Response-Cycle synthesis",
    statement:
      "Evaluates observable human behavioral patterns, motivations, triggers, response styles, constructive/shadow expressions, counter-indicators, and dynamic polarities without clinical diagnosis.",
  },
  {
    id: "firmament-life-event-engine",
    tradition: "firmament",
    technique: "life-event-signature",
    subject: "life-situation",
    kind: "deterministic-rule",
    sourceId: "firmament-behavioral-intelligence",
    status: "implemented",
    doctrine:
      "E1-E5 life-event convergence, State 1-9 temporal activation, and cross-domain event sequence chains",
    statement:
      "Evaluates life-situation signatures across natal promise, house rulers, transits, God/Agent translation, and multi-stage event sequences without claiming deterministic certainty.",
  },
  {
    id: "vedic-nakshatra-27",
    tradition: "vedic",
    technique: "nakshatra",
    subject: "planet",
    kind: "deterministic-rule",
    sourceId: "firmament-architecture",
    status: "implemented",
    statement:
      "The fixed 360-degree spine is divided into 27 equal 13°20′ lunar mansions and four padas per mansion.",
  },
  {
    id: "vedic-house-lords",
    tradition: "vedic",
    technique: "house-lord",
    subject: "house",
    kind: "deterministic-rule",
    sourceId: "local-vedic-rules",
    status: "implemented",
    statement:
      "Classical sign rulers are mapped to the supplied Agent Ascendant and house placements.",
  },
  {
    id: "vedic-graha-drishti",
    tradition: "vedic",
    technique: "drishti",
    subject: "planet",
    kind: "deterministic-rule",
    sourceId: "local-vedic-rules",
    status: "implemented",
    statement:
      "Traditional whole-house planetary aspects are resolved for Mars, Jupiter, Saturn, and the seventh aspect.",
  },
  {
    id: "vedic-varga-architecture",
    tradition: "vedic",
    technique: "varga",
    subject: "divisional-chart",
    kind: "deterministic-rule",
    sourceId: "local-vedic-rules",
    status: "incomplete",
    statement:
      "D2, D3, D9, and D10 contracts are reserved; chart-specific varga calculation is not yet enabled.",
  },
  {
    id: "vedic-ashtakavarga-classical",
    tradition: "vedic",
    technique: "ashtakavarga",
    subject: "sign-strength",
    kind: "deterministic-rule",
    sourceId: "local-vedic-rules",
    status: "implemented",
    statement:
      "Classical Parashari Bhinnashtakavarga and unreduced Sarvashtakavarga are calculated from Lahiri sidereal D1 positions, with per-planet and 337-total checksums; Trikona and Ekadhipatya reductions are not included.",
  },
  {
    id: "vedic-dasha-architecture",
    tradition: "vedic",
    technique: "dasha",
    subject: "timing",
    kind: "deterministic-rule",
    sourceId: "local-vedic-rules",
    status: "implemented",
    statement:
      "Vimshottari Mahadasha, Antardasha, and Pratyantardasha are calculated from the natal Moon using Swiss Ephemeris Lahiri/Chitrapaksha ayanamsa; date-only or unknown birth times are explicitly marked uncertain.",
  },
  {
    id: "arabic-day-sect",
    tradition: "arabic",
    technique: "sect",
    subject: "chart",
    kind: "deterministic-rule",
    sourceId: "local-arabic-rules",
    status: "implemented",
    statement:
      "Day/night sect is resolved from whether the Sun is in houses 7–12 or 1–6 in Agent View.",
  },
  {
    id: "arabic-lots",
    tradition: "arabic",
    technique: "lots",
    subject: "fortune-spirit",
    kind: "deterministic-rule",
    sourceId: "local-arabic-rules",
    status: "implemented",
    statement:
      "Fortune and Spirit use sect-sensitive luminary formulas; results are normalized to 0–360 degrees.",
  },
  {
    id: "arabic-manazil-28",
    tradition: "arabic",
    technique: "manzil",
    subject: "moon",
    kind: "deterministic-rule",
    sourceId: "firmament-architecture",
    status: "implemented",
    statement:
      "The fixed 360-degree spine is divided into 28 equal Manzil sectors with explicit boundaries.",
  },
  {
    id: "arabic-planetary-hours",
    tradition: "arabic",
    technique: "planetary-hours",
    subject: "timing",
    kind: "deterministic-rule",
    sourceId: "canopy-arabian",
    status: "incomplete",
    statement:
      "Planetary-hour calculation requires local sunrise and sunset data and is not inferred without those inputs.",
  },
  {
    id: "arabic-twelfth-parts",
    tradition: "arabic",
    technique: "twelfth-parts",
    subject: "planet",
    kind: "deterministic-rule",
    sourceId: "canopy-arabian",
    status: "incomplete",
    statement:
      "Twelfth-parts methodology is reserved pending an explicit house/sign doctrine setting.",
  },
  {
    id: "firmament-canon-dossier",
    tradition: "firmament",
    technique: "canon-placement-dossier",
    subject: "placement",
    kind: "deterministic-rule",
    sourceId: "firmament-canon-knowledge",
    status: "implemented",
    doctrine:
      "Epistemically categorized (FACT / TRADITION / FIRMAMENT_CANON) retrieval of Planet + Sign + House + Dignities + Bounds + 36 Decans + 28 Manazil + 27 Nakshatras/Padas + Fixed Stars + God→Agent translation",
    statement:
      "Retrieves complete deterministic traditional and Firmament Canon placement dossiers locally before Master AI synthesis.",
  },
  {
    id: "firmament-traditional-mechanisms",
    tradition: "arabic",
    technique: "traditional-mechanisms",
    subject: "chart",
    kind: "deterministic-rule",
    sourceId: "firmament-canon-knowledge",
    status: "implemented",
    doctrine:
      "Applying/Separating Aspects, Mutual/Unilateral Receptions, Translation of Light, Collection of Light, Prohibition, Refranation, Cazimi, Combustion, Under the Beams, Retrograde",
    statement:
      "Detects traditional horary and natal relational mechanisms deterministically with source provenance.",
  },
];

export function sourceById(id: string) {
  return ASTROLOGY_SOURCES.find(source => source.id === id);
}
export function rulesFor(plan: { domains: string[]; techniques: string[] }) {
  return ASTROLOGY_RULES.filter(
    rule =>
      plan.domains.includes(rule.tradition) &&
      plan.techniques.includes(rule.technique)
  );
}
