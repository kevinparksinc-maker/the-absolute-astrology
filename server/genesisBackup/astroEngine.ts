// ARCANA STATE — Astrology Engine
// Sidereal framework · Traditional Vedic planetary rulers · No outer planet weight

export const SIGN_ORDER = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
  Asc: "↑",
};

export const SIGN_RULERS: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

export const EXALTATIONS: Record<string, string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mercury: "Virgo",
  Venus: "Pisces",
  Mars: "Capricorn",
  Jupiter: "Cancer",
  Saturn: "Libra",
};

export const DEBILITATIONS: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mercury: "Pisces",
  Venus: "Virgo",
  Mars: "Cancer",
  Jupiter: "Capricorn",
  Saturn: "Aries",
};

export const PRIORITY: Record<string, number> = {
  Saturn: 5,
  Jupiter: 4,
  Rahu: 3.5,
  Ketu: 3.5,
  Mars: 3,
  Sun: 2,
  Venus: 2,
  Mercury: 2,
  Moon: 1.5,
};

export const HOUSE_TOPICS: Record<number, string> = {
  1: "identity, body, personal direction, self-presentation",
  2: "speech, values, money, food, stored resources",
  3: "courage, effort, siblings, communication, tactical movement",
  4: "home, emotional foundations, private life, inner security",
  5: "creativity, children, romance, intelligence, inspired output",
  6: "conflict, labor, health, debt, enemies, daily struggle",
  7: "partnerships, open rivals, contracts, mirrors",
  8: "crisis, occult depth, vulnerability, loss, transformation",
  9: "dharma, faith, higher wisdom, travel, teacher-path",
  10: "career, status, public role, visible action",
  11: "networks, gains, ambitions, alliances",
  12: "retreat, isolation, sleep, endings, spiritual release",
};

export const PLANET_CORE: Record<string, Record<string, string>> = {
  Sun: {
    mind: "will, ego-focus, sovereign decision making",
    soul: "need for recognition, dignity, identity heat",
    spirit: "life-force, dharma, purpose, radiance",
  },
  Moon: {
    mind: "habit mind, memory, emotional weather, receptivity",
    soul: "nourishment, belonging, safety, intimacy with feeling",
    spirit: "ancestral tide, intuitive flow, psychic receptivity",
  },
  Mercury: {
    mind: "analysis, language, interpretation, nervous system patterning",
    soul: "what the mind needs to feel coherent and named",
    spirit: "discernment, witness, interpretive intelligence",
  },
  Venus: {
    mind: "aesthetic judgment, relational interpretation, social preference",
    soul: "love, attachment, pleasure, harmony, self-worth",
    spirit: "devotional magnetism, receptivity to grace",
  },
  Mars: {
    mind: "urgency, aggression, focus under pressure",
    soul: "anger, desire, protection, hunger to act",
    spirit: "courage, severance, disciplined force",
  },
  Jupiter: {
    mind: "meaning-making, worldview, principle, faith reasoning",
    soul: "hope, generosity, trust, expansion",
    spirit: "blessing, wisdom, dharma, protection",
  },
  Saturn: {
    mind: "fear, structure, sobriety, realism, endurance",
    soul: "loneliness, duty, karmic pressure, boundaries",
    spirit: "maturation, pruning, karmic law, time",
  },
  Rahu: {
    mind: "obsession, amplification, unusual fixation",
    soul: "craving, hunger, restless pull toward experience",
    spirit: "disruptive appetite, worldly acceleration",
  },
  Ketu: {
    mind: "detachment, fragmentation, abstraction, psychic static",
    soul: "disinterest, release, past-life familiarity, severance",
    spirit: "liberation, negation, moksha impulse",
  },
};

export interface PlanetPlacement {
  planet: string;
  degree: number;
  sign: string;
  house: number | null;
  rx: boolean;
  combust: boolean;
  cazimi: boolean;
  absolute: number | null;
  raw: string;
  kind: "natal" | "transit";
}

export interface Activation {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  priority: number;
  transit: PlanetPlacement;
  natal: PlanetPlacement;
  summary: string;
}

export interface PillarResult {
  score: number;
  reasons: string[];
}

export interface PillarSummary {
  state: string;
  body: string;
}

export interface ReadingResult {
  mind: PillarSummary;
  soul: PillarSummary;
  spirit: PillarSummary;
  activations: Activation[];
  natal: Record<string, PlanetPlacement>;
  transits: Record<string, PlanetPlacement>;
  context: string;
}

function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function signIndex(sign: string): number {
  return SIGN_ORDER.indexOf(sign);
}

function zodiacDegree(sign: string, degree: number): number | null {
  const i = signIndex(sign);
  if (i < 0 || Number.isNaN(degree)) return null;
  return i * 30 + degree;
}

function normalizePlanet(raw: string): string {
  const clean = raw
    .trim()
    .replace(/^Transit\s+/i, "")
    .replace(/\s+Rx$/i, "")
    .replace(/\s+S$/i, "") // stationary suffix
    .replace(/\s+/g, " ");
  const lower = clean.toLowerCase();
  const map: Record<string, string> = {
    sun: "Sun",
    moon: "Moon",
    mercury: "Mercury",
    venus: "Venus",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    rahu: "Rahu",
    ketu: "Ketu",
    asc: "Asc",
    ascendant: "Asc",
    ac: "Asc",
    rising: "Asc",
    dsc: "Dsc",
    descendant: "Dsc",
    dc: "Dsc",
    mc: "MC",
    midheaven: "MC",
    "medium coeli": "MC",
    ic: "IC",
    "imum coeli": "IC",
    // Outer planets — accepted and passed through
    uranus: "Uranus",
    neptune: "Neptune",
    pluto: "Pluto",
    // Aliases from astrology apps
    "north node": "Rahu",
    "north node (true)": "Rahu",
    "true north node": "Rahu",
    "south node": "Ketu",
    "south node (true)": "Ketu",
    "true south node": "Ketu",
    "mean north node": "Rahu",
    "mean south node": "Ketu",
    "ascending node": "Rahu",
    "descending node": "Ketu",
  };
  return map[lower] || titleCase(clean);
}

export function parseInput(
  text: string,
  kind: "natal" | "transit"
): { parsed: Record<string, PlanetPlacement>; rawLines: string[] } {
  const lines = text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean);
  const parsed: Record<string, PlanetPlacement> = {};
  const rawLines: string[] = [];

  for (const line of lines) {
    rawLines.push(line);
    // Support formats:
    // "Sun: 3° Scorpio, 12th house"  (whole degrees)
    // "Sun: 03° 27' Scorpio 12"       (degrees + arcminutes, astrology app format)
    // "Sun Scorpio 03° 27' 12"        (column-style from app tables)
    const match = line.match(
      /^(Transit\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)?)(?:\s+(?:Rx|S))?\s*:?\s*(\d{1,3}(?:\.\d+)?)\s*°\s*(?:(\d{1,2})')?\s*([A-Za-z]+)(?:\s*,?\s*(\d{1,2})(?:st|nd|rd|th)?\s*house)?(.*)$/i
    );
    if (!match) continue;

    const planet = normalizePlanet(match[2]);
    // Convert degrees + arcminutes to decimal degrees
    const deg = parseFloat(match[3]);
    const mins = match[4] ? parseFloat(match[4]) / 60 : 0;
    const degree = deg + mins;
    const sign = titleCase(match[5]);
    const house = match[6] ? parseInt(match[6], 10) : null;
    const rx = /\bRx\b|retrograde/i.test(line);
    const combust = /combust/i.test(line);
    const cazimi = /cazimi/i.test(line);
    const absolute = zodiacDegree(sign, degree);

    parsed[planet] = {
      planet,
      degree,
      sign,
      house,
      rx,
      combust,
      cazimi,
      absolute,
      raw: line,
      kind,
    };
  }

  return { parsed, rawLines };
}

function angularDifference(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function findAspect(diff: number): {
  name: string;
  angle: number;
  orb: number;
  weight: number;
  delta: number;
} | null {
  const aspects = [
    { name: "conjunction", angle: 0, orb: 6, weight: 1.0 },
    { name: "opposition", angle: 180, orb: 6, weight: 0.85 },
    { name: "trine", angle: 120, orb: 5, weight: 0.6 },
    { name: "square", angle: 90, orb: 5, weight: 0.72 },
    { name: "sextile", angle: 60, orb: 4, weight: 0.45 },
  ];
  let best: ((typeof aspects)[0] & { delta: number }) | null = null;
  for (const aspect of aspects) {
    const delta = Math.abs(diff - aspect.angle);
    if (delta <= aspect.orb && (!best || delta < best.delta)) {
      best = { ...aspect, delta };
    }
  }
  return best;
}

function dignityLabel(planet: string, sign: string, rx = false): string[] {
  const parts: string[] = [];
  if (EXALTATIONS[planet] === sign) parts.push("exalted");
  if (DEBILITATIONS[planet] === sign) parts.push("debilitated");
  if (SIGN_RULERS[sign] === planet) parts.push("in own sign");
  if (rx) parts.push("retrograde");
  return parts;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function signFlavor(sign: string): string {
  const element: Record<string, string> = {
    Aries: "fire",
    Leo: "fire",
    Sagittarius: "fire",
    Taurus: "earth",
    Virgo: "earth",
    Capricorn: "earth",
    Gemini: "air",
    Libra: "air",
    Aquarius: "air",
    Cancer: "water",
    Scorpio: "water",
    Pisces: "water",
  };
  const ruler = SIGN_RULERS[sign];
  const templates: Record<string, string> = {
    fire: "directness, ignition, urgency, expressive force",
    earth: "practicality, containment, realism, measurable grounding",
    air: "mobility, concept-making, social abstraction, mental spread",
    water: "impressionability, feeling-intelligence, depth, permeability",
  };
  const el = element[sign] || "mixed";
  return `${el}-coded expression under ${ruler}'s rulership — ${templates[el] || "complex, layered expression"}`;
}

function planetTone(
  planet: string,
  placement: PlanetPlacement | undefined,
  pillar: string
): string[] {
  const parts: string[] = [];
  if (!placement) return parts;
  const core = PLANET_CORE[planet]?.[pillar] || "";
  if (core) parts.push(`${planet} governs ${core}.`);
  parts.push(
    `${planet} in ${placement.sign} colors this through ${signFlavor(placement.sign)}.`
  );
  if (placement.house && HOUSE_TOPICS[placement.house]) {
    parts.push(
      `This lands through the ${ordinal(placement.house)} house: ${HOUSE_TOPICS[placement.house]}.`
    );
  }
  const dignities = dignityLabel(planet, placement.sign, placement.rx);
  if (dignities.length) parts.push(`Condition: ${dignities.join(", ")}.`);
  if (placement.combust)
    parts.push(
      "Combustion suggests this principle is too close to solar heat, reducing clean objectivity."
    );
  if (placement.cazimi)
    parts.push(
      "Cazimi suggests rare interior clarity and concentrated intelligence."
    );
  return parts;
}

function describeActivation(
  tPlanet: string,
  nPlanet: string,
  aspect: string,
  tPlacement: PlanetPlacement,
  nPlacement: PlanetPlacement
): string {
  const aspectText: Record<string, string> = {
    conjunction: "directly merges with",
    opposition: "faces and polarizes",
    square: "pressurizes and challenges",
    trine: "supports and opens",
    sextile: "offers a smaller but usable opening to",
  };
  const houseText =
    nPlacement.house && HOUSE_TOPICS[nPlacement.house]
      ? ` through the ${ordinal(nPlacement.house)} house themes of ${HOUSE_TOPICS[nPlacement.house]}`
      : "";
  const tone =
    PLANET_CORE[tPlanet]?.spirit || PLANET_CORE[tPlanet]?.mind || "activation";
  return `${tPlanet} ${aspectText[aspect] || "contacts"} natal ${nPlanet}, stirring ${tone}${houseText}.`;
}

export function detectTransits(
  natal: Record<string, PlanetPlacement>,
  transits: Record<string, PlanetPlacement>
): Activation[] {
  const activations: Activation[] = [];

  for (const [tPlanet, tPlacement] of Object.entries(transits)) {
    for (const [nPlanet, nPlacement] of Object.entries(natal)) {
      if (tPlacement.absolute == null || nPlacement.absolute == null) continue;
      const diff = angularDifference(tPlacement.absolute, nPlacement.absolute);
      const aspect = findAspect(diff);
      if (!aspect) continue;
      const priority = (PRIORITY[tPlanet] || 1) * aspect.weight;
      activations.push({
        transitPlanet: tPlanet,
        natalPlanet: nPlanet,
        aspect: aspect.name,
        orb: Number(aspect.delta.toFixed(2)),
        priority,
        transit: tPlacement,
        natal: nPlacement,
        summary: describeActivation(
          tPlanet,
          nPlanet,
          aspect.name,
          tPlacement,
          nPlacement
        ),
      });
    }
  }

  activations.sort((a, b) => b.priority - a.priority || a.orb - b.orb);
  return activations;
}

export function detectSadeSati(
  natal: Record<string, PlanetPlacement>,
  transits: Record<string, PlanetPlacement>
): string | null {
  const natalMoon = natal.Moon;
  const transitSaturn = transits.Saturn;
  if (!natalMoon || !transitSaturn) return null;

  const moonIndex = signIndex(natalMoon.sign);
  const saturnIndex = signIndex(transitSaturn.sign);
  if (moonIndex < 0 || saturnIndex < 0) return null;

  const prev = (moonIndex + 11) % 12;
  const same = moonIndex;
  const next = (moonIndex + 1) % 12;

  if ([prev, same, next].includes(saturnIndex)) {
    const phase =
      saturnIndex === prev
        ? "entering"
        : saturnIndex === same
          ? "peak"
          : "exiting";
    return `Sade Sati is ${phase}: transiting Saturn is in ${transitSaturn.sign} relative to the natal Moon in ${natalMoon.sign}. Emotional weight, karmic pruning, responsibility, and interior hardening are emphasized.`;
  }
  return null;
}

export function detectMoonPhase(
  transits: Record<string, PlanetPlacement>
): string | null {
  const sun = transits.Sun;
  const moon = transits.Moon;
  if (!sun || !moon || sun.absolute == null || moon.absolute == null)
    return null;
  const diff = (moon.absolute - sun.absolute + 360) % 360;
  if (diff < 12 || diff > 348)
    return "New Moon tone — inward, seeded, lower external output.";
  if (Math.abs(diff - 180) < 12)
    return "Full Moon tone — culmination, revelation, emotional amplification.";
  if (diff < 180)
    return "Waxing Moon tone — building force, growth, outward movement.";
  return "Waning Moon tone — release, digestion, retreat, and consolidation.";
}

export function scorePillar(
  name: "mind" | "soul" | "spirit",
  natal: Record<string, PlanetPlacement>,
  transits: Record<string, PlanetPlacement>,
  activations: Activation[]
): PillarResult {
  const dependencies: Record<string, string[]> = {
    mind: ["Mercury", "Moon"],
    soul: ["Moon", "Venus"],
    spirit: ["Sun", "Jupiter"],
  };
  const deps = dependencies[name];
  let score = 50;
  const reasons: string[] = [];

  for (const planet of deps) {
    const nat = natal[planet];
    if (!nat) continue;
    if (EXALTATIONS[planet] === nat.sign) {
      score += 10;
      reasons.push(`${planet} is exalted natally.`);
    }
    if (DEBILITATIONS[planet] === nat.sign) {
      score -= 10;
      reasons.push(`${planet} is debilitated natally.`);
    }
    if (SIGN_RULERS[nat.sign] === planet) {
      score += 6;
      reasons.push(`${planet} is in its own sign.`);
    }
    if (
      nat.rx &&
      ["Mercury", "Venus", "Jupiter", "Saturn", "Mars"].includes(planet)
    ) {
      score -= 2;
      reasons.push(
        `${planet} retrograde makes this pillar more interiorized and less straightforward.`
      );
    }
    if (nat.combust) {
      score -= 5;
      reasons.push(`${planet} combust adds heat and compression.`);
    }
    if (nat.cazimi) {
      score += 6;
      reasons.push(`${planet} cazimi adds rare precision.`);
    }
  }

  const targetSet = new Set(deps);
  for (const act of activations.slice(0, 18)) {
    if (!targetSet.has(act.natalPlanet)) continue;
    const p = act.transitPlanet;
    const hard = act.aspect === "square" || act.aspect === "opposition";
    const conj = act.aspect === "conjunction";

    if (p === "Saturn") {
      score += hard ? -12 : conj ? -9 : -6;
      reasons.push(
        `Transit Saturn is weighing on natal ${act.natalPlanet} by ${act.aspect}.`
      );
    } else if (p === "Jupiter") {
      score += hard ? 3 : conj ? 10 : 7;
      reasons.push(
        `Transit Jupiter is opening natal ${act.natalPlanet} by ${act.aspect}.`
      );
    } else if (p === "Rahu") {
      score += conj ? 4 : hard ? -4 : 1;
      reasons.push(
        `Transit Rahu is amplifying natal ${act.natalPlanet} by ${act.aspect}.`
      );
    } else if (p === "Ketu") {
      score += conj ? -7 : hard ? -5 : -2;
      reasons.push(
        `Transit Ketu is reducing attachment around natal ${act.natalPlanet} by ${act.aspect}.`
      );
    } else if (p === "Mars") {
      score += hard ? -8 : conj ? -5 : 2;
      reasons.push(
        `Transit Mars is heating natal ${act.natalPlanet} by ${act.aspect}.`
      );
    } else if (p === "Sun") {
      score += hard ? -2 : conj ? 3 : 1;
      reasons.push(
        `Transit Sun temporarily spotlights natal ${act.natalPlanet}.`
      );
    } else if (p === "Venus") {
      score += hard ? -1 : conj ? 4 : 2;
      reasons.push(
        `Transit Venus modifies tone around natal ${act.natalPlanet}.`
      );
    } else if (p === "Mercury") {
      score += hard ? -1 : conj ? 3 : 1;
      reasons.push(
        `Transit Mercury is activating cognition around natal ${act.natalPlanet}.`
      );
    } else if (p === "Moon") {
      score += hard ? -1 : 1;
      reasons.push(
        `Transit Moon is coloring the day around natal ${act.natalPlanet}.`
      );
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, reasons };
}

export function stateFromScore(score: number): {
  band: "high" | "mid" | "low";
  label: string;
} {
  if (score >= 70) return { band: "high", label: "Open and coherent" };
  if (score >= 45) return { band: "mid", label: "Mixed and shifting" };
  return { band: "low", label: "Under pressure" };
}

export function summarizePillar(
  name: "mind" | "soul" | "spirit",
  result: PillarResult,
  natal: Record<string, PlanetPlacement>,
  activations: Activation[]
): PillarSummary {
  const deps: Record<string, string[]> = {
    mind: ["Mercury", "Moon"],
    soul: ["Moon", "Venus"],
    spirit: ["Sun", "Jupiter"],
  };
  const depList = deps[name];
  const state = stateFromScore(result.score);

  const lead = depList
    .map(p => natal[p])
    .filter(Boolean)
    .map(
      p =>
        `${p!.planet} in ${p!.sign}${p!.house ? ` (${ordinal(p!.house)} house)` : ""}`
    )
    .join(" · ");

  const relevantActs = activations
    .filter(a => depList.includes(a.natalPlanet))
    .slice(0, 2);
  const actText = relevantActs.length
    ? relevantActs
        .map(a => `${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`)
        .join("; ")
    : "No major transit pressure is dominating this pillar right now.";

  const reason = result.reasons.slice(0, 2).join(" ");

  return {
    state: `${state.label} · ${result.score}/100`,
    body: `${name.charAt(0).toUpperCase() + name.slice(1)} is reading ${
      state.band === "high"
        ? "strong"
        : state.band === "mid"
          ? "mixed"
          : "strained"
    } right now. Natal base: ${lead || "insufficient natal data."} Active contacts: ${actText} ${reason}`.trim(),
  };
}

export type ReadingMode = "natal-only" | "transit-only" | "full";

export function runAstroReading(
  natalText: string,
  transitText: string,
  context: string
): { result: ReadingResult | null; error: string | null; mode: ReadingMode } {
  const { parsed: natal } = parseInput(natalText, "natal");
  const { parsed: transits } = parseInput(transitText, "transit");

  const hasNatal = Object.keys(natal).length >= 3;
  const hasTransits = Object.keys(transits).length >= 3;

  // Need at least one to proceed
  if (!hasNatal && !hasTransits) {
    return {
      result: null,
      error:
        "Please enter at least your natal chart OR current transits to generate a reading.",
      mode: "full",
    };
  }

  const mode: ReadingMode =
    hasNatal && hasTransits ? "full" : hasNatal ? "natal-only" : "transit-only";

  // For transit-only: treat transits as the reference chart
  const effectiveNatal = hasNatal ? natal : transits;
  const effectiveTransits = hasTransits ? transits : {};

  const activations =
    hasNatal && hasTransits ? detectTransits(natal, transits) : [];

  const mindResult = scorePillar(
    "mind",
    effectiveNatal,
    effectiveTransits,
    activations
  );
  const soulResult = scorePillar(
    "soul",
    effectiveNatal,
    effectiveTransits,
    activations
  );
  const spiritResult = scorePillar(
    "spirit",
    effectiveNatal,
    effectiveTransits,
    activations
  );

  return {
    result: {
      mind: summarizePillar("mind", mindResult, effectiveNatal, activations),
      soul: summarizePillar("soul", soulResult, effectiveNatal, activations),
      spirit: summarizePillar(
        "spirit",
        spiritResult,
        effectiveNatal,
        activations
      ),
      activations,
      natal: effectiveNatal,
      transits: effectiveTransits,
      context,
    },
    error: null,
    mode,
  };
}

export function ordinalExport(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export { ordinal, planetTone, signFlavor };
