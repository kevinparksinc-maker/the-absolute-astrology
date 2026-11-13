/**
 * PATTERN ENGINE v2.0
 *
 * Converts sky state into measurable patterns and archetypes.
 * Answers: "What is strong and what does it resemble?"
 *
 * Features:
 * - Full aspect detection (conjunction, opposition, trine, square, sextile)
 * - Transit-to-natal aspect analysis
 * - Classic pattern detection (Grand Trine, T-Square, Stellium, etc.)
 * - Essential & accidental dignity for planetary strength
 * - Configurable house system (Placidus, Whole Sign, etc.)
 * - Comprehensive archetype mapping
 */

import type { PlanetPlacement } from "./astroEngine";

// ============================================================================
// CONFIGURATION
// ============================================================================

export type HouseSystem = "placidus" | "whole_sign" | "koch" | "equal";

export interface PatternConfig {
  houseSystem: HouseSystem;
  orbConjunction: number; // default 8°
  orbOpposition: number; // default 8°
  orbTrine: number; // default 6°
  orbSquare: number; // default 6°
  orbSextile: number; // default 4°
  orbQuincunx: number; // default 3°
  minimalPatternStrength: number; // minimum 0-1 to include a pattern
}

export const DEFAULT_CONFIG: PatternConfig = {
  houseSystem: "placidus",
  orbConjunction: 8,
  orbOpposition: 8,
  orbTrine: 6,
  orbSquare: 6,
  orbSextile: 4,
  orbQuincunx: 3,
  minimalPatternStrength: 0.3,
};

// ============================================================================
// TYPES
// ============================================================================

export interface Aspect {
  planet1: string;
  planet2: string;
  type:
    | "conjunction"
    | "opposition"
    | "trine"
    | "square"
    | "sextile"
    | "quincunx";
  angle: number;
  orb: number;
  strength: number; // 0-1, based on how close to exact
  isNatalToNatal: boolean;
  isTransitToNatal: boolean;
}

export interface PatternScore {
  name: string;
  strength: number; // 0-1
  planets: string[];
  houses: number[];
  signs: string[];
  description: string;
  type:
    | "aspect_cluster"
    | "stellium"
    | "grand_trine"
    | "t_square"
    | "grand_cross"
    | "yod"
    | "kite"
    | "mystic_rectangle";
}

export interface ArchetypeLabel {
  archetype: string;
  intensity: "low" | "moderate" | "high" | "extreme";
  affectedPlanets: string[];
  affectedHouses: number[];
  affectedSigns: string[];
  themes: string[];
  triggers: string[]; // what conditions trigger this archetype
}

export interface PlanetaryDignity {
  planet: string;
  essential: number; // -1 to +1 (rulership/exaltation/fall/detriment)
  accidental: number; // -0.5 to +0.5 (house, speed, angularity)
  totalStrength: number; // 0-1 normalized
}

export interface PatternAnalysis {
  timestamp: Date;
  config: PatternConfig;
  dominantPatterns: PatternScore[];
  aspects: Aspect[];
  archetypes: ArchetypeLabel[];
  houseEmphasis: Record<
    number,
    { planetCount: number; planets: string[]; strength: number }
  >;
  planetaryStrength: Record<string, PlanetaryDignity>;
  signatures: string[]; // high-level interpretive notes
}

// ============================================================================
// HELPER: ANGLE DIFFERENCE
// ============================================================================

function getAngleDifference(deg1: number, deg2: number): number {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// ============================================================================
// 1. ASPECT DETECTION (Natal + Transit-to-Natal)
// ============================================================================

function detectAspects(
  planetsA: Record<string, PlanetPlacement>,
  planetsB: Record<string, PlanetPlacement> | null,
  config: PatternConfig,
  isTransitToNatal: boolean
): Aspect[] {
  const aspects: Aspect[] = [];
  const targets = planetsB || planetsA;
  const aspectDefs = [
    { type: "conjunction" as const, angle: 0, orb: config.orbConjunction },
    { type: "opposition" as const, angle: 180, orb: config.orbOpposition },
    { type: "trine" as const, angle: 120, orb: config.orbTrine },
    { type: "square" as const, angle: 90, orb: config.orbSquare },
    { type: "sextile" as const, angle: 60, orb: config.orbSextile },
    { type: "quincunx" as const, angle: 150, orb: config.orbQuincunx },
  ];

  for (const [name1, p1] of Object.entries(planetsA)) {
    for (const [name2, p2] of Object.entries(targets)) {
      if (isTransitToNatal && name1 === name2) continue; // same planet transit-natal
      if (!isTransitToNatal && name1 === name2) continue; // avoid self-aspects

      const diff = getAngleDifference(p1.degree, p2.degree);

      for (const def of aspectDefs) {
        const delta = Math.abs(diff - def.angle);
        if (delta <= def.orb) {
          const strength = 1 - delta / def.orb;
          aspects.push({
            planet1: name1,
            planet2: name2,
            type: def.type,
            angle: def.angle,
            orb: delta,
            strength,
            isNatalToNatal: !isTransitToNatal && planetsB === null,
            isTransitToNatal,
          });
        }
      }
    }
  }

  return aspects;
}

// ============================================================================
// 2. PLANETARY STRENGTH (Essential + Accidental Dignity)
// ============================================================================

const SIGN_RULERS: Record<string, string[]> = {
  Aries: ["Mars"],
  Taurus: ["Venus"],
  Gemini: ["Mercury"],
  Cancer: ["Moon"],
  Leo: ["Sun"],
  Virgo: ["Mercury"],
  Libra: ["Venus"],
  Scorpio: ["Pluto", "Mars"],
  Sagittarius: ["Jupiter"],
  Capricorn: ["Saturn"],
  Aquarius: ["Uranus", "Saturn"],
  Pisces: ["Neptune", "Jupiter"],
};

const EXALTATIONS: Record<string, string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mercury: "Virgo",
  Venus: "Pisces",
  Mars: "Capricorn",
  Jupiter: "Cancer",
  Saturn: "Libra",
  Uranus: "Scorpio",
  Neptune: "Aquarius",
  Pluto: "Leo",
};

const FALLS: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mercury: "Pisces",
  Venus: "Virgo",
  Mars: "Cancer",
  Jupiter: "Capricorn",
  Saturn: "Aries",
  Uranus: "Taurus",
  Neptune: "Leo",
  Pluto: "Aquarius",
};

const DETRIMENTS: Record<string, string[]> = {
  Sun: ["Aquarius"],
  Moon: ["Capricorn"],
  Mercury: ["Sagittarius", "Pisces"],
  Venus: ["Scorpio", "Aries"],
  Mars: ["Libra", "Taurus"],
  Jupiter: ["Gemini", "Virgo"],
  Saturn: ["Cancer", "Leo"],
  Uranus: ["Leo"],
  Neptune: ["Virgo"],
  Pluto: ["Taurus"],
};

function calculateEssentialDignity(planet: string, sign: string): number {
  let score = 0;

  // Rulership (+1)
  if (SIGN_RULERS[sign]?.includes(planet)) score += 1;

  // Exaltation (+0.7)
  if (EXALTATIONS[planet] === sign) score += 0.7;

  // Fall (-0.7)
  if (FALLS[planet] === sign) score -= 0.7;

  // Detriment (-1)
  if (DETRIMENTS[planet]?.includes(sign)) score -= 1;

  return Math.max(-1, Math.min(1, score));
}

function calculateAccidentalDignity(
  planet: string,
  house: number,
  isRetrograde: boolean
): number {
  let score = 0;

  // Angular houses (+0.5)
  if ([1, 4, 7, 10].includes(house)) score += 0.5;
  // Succedent houses (+0.25)
  else if ([2, 5, 8, 11].includes(house)) score += 0.25;
  // Cadent houses (0)

  // Retrograde penalty (-0.3)
  if (isRetrograde) score -= 0.3;

  return Math.max(-0.5, Math.min(0.5, score));
}

function calculatePlanetaryStrength(
  planets: Record<string, PlanetPlacement>,
  config: PatternConfig
): Record<string, PlanetaryDignity> {
  const result: Record<string, PlanetaryDignity> = {};

  for (const [name, placement] of Object.entries(planets)) {
    const essential = calculateEssentialDignity(name, placement.sign);
    const accidental = calculateAccidentalDignity(
      name,
      placement.house || 1,
      placement.rx || false
    );

    // Normalize to 0-1 range
    const total = (essential + 0.8) * 0.6 + (accidental + 0.5) * 0.4;
    const totalStrength = Math.max(0, Math.min(1, total));

    result[name] = {
      planet: name,
      essential,
      accidental,
      totalStrength,
    };
  }

  return result;
}

// ============================================================================
// 3. HOUSE EMPHASIS (Improved)
// ============================================================================

function analyzeHouseEmphasis(
  planets: Record<string, PlanetPlacement>,
  strengths: Record<string, PlanetaryDignity>
): Record<
  number,
  { planetCount: number; planets: string[]; strength: number }
> {
  const houseData: Record<
    number,
    { planets: string[]; totalStrength: number }
  > = {};

  for (const [name, placement] of Object.entries(planets)) {
    if (placement.house) {
      if (!houseData[placement.house]) {
        houseData[placement.house] = { planets: [], totalStrength: 0 };
      }
      houseData[placement.house].planets.push(name);
      houseData[placement.house].totalStrength +=
        strengths[name]?.totalStrength || 0.5;
    }
  }

  const result: Record<number, any> = {};
  for (const [house, data] of Object.entries(houseData)) {
    const houseNum = parseInt(house);
    result[houseNum] = {
      planetCount: data.planets.length,
      planets: data.planets,
      strength: Math.min(1, data.totalStrength / (data.planets.length * 0.7)),
    };
  }

  return result;
}

// ============================================================================
// 4. PATTERN DETECTION (Stellium, Grand Trine, T-Square, etc.)
// ============================================================================

function detectStelliums(
  aspects: Aspect[],
  planets: Record<string, PlanetPlacement>
): PatternScore[] {
  const patterns: PatternScore[] = [];
  const planetSigns: Record<string, string> = {};
  const planetHouses: Record<string, number> = {};

  for (const [name, p] of Object.entries(planets)) {
    planetSigns[name] = p.sign;
    planetHouses[name] = p.house || 0;
  }

  // Group by sign
  const bySign: Record<string, string[]> = {};
  for (const [planet, sign] of Object.entries(planetSigns)) {
    if (!bySign[sign]) bySign[sign] = [];
    bySign[sign].push(planet);
  }

  for (const [sign, planetList] of Object.entries(bySign)) {
    if (planetList.length >= 3) {
      const houses = planetList.map(p => planetHouses[p]).filter(h => h > 0);
      patterns.push({
        name: `Stellium in ${sign}`,
        strength: Math.min(1, planetList.length / 5),
        planets: planetList,
        houses: Array.from(new Set(houses)),
        signs: [sign],
        description: `${planetList.length} planets concentrated in ${sign}`,
        type: "stellium",
      });
    }
  }

  // Group by house
  const byHouse: Record<number, string[]> = {};
  for (const [planet, house] of Object.entries(planetHouses)) {
    if (house > 0) {
      if (!byHouse[house]) byHouse[house] = [];
      byHouse[house].push(planet);
    }
  }

  for (const [house, planetList] of Object.entries(byHouse)) {
    if (planetList.length >= 3) {
      patterns.push({
        name: `Stellium in House ${house}`,
        strength: Math.min(1, planetList.length / 5),
        planets: planetList,
        houses: [parseInt(house)],
        signs: planetList.map(p => planetSigns[p]),
        description: `${planetList.length} planets concentrated in House ${house}`,
        type: "stellium",
      });
    }
  }

  return patterns;
}

function detectGrandTrines(
  aspects: Aspect[],
  planets: Record<string, PlanetPlacement>
): PatternScore[] {
  const trines = aspects.filter(a => a.type === "trine" && a.strength > 0.6);
  const patterns: PatternScore[] = [];

  // Look for 3 planets forming a triangle of trines
  for (let i = 0; i < trines.length; i++) {
    for (let j = i + 1; j < trines.length; j++) {
      const a1 = trines[i];
      const a2 = trines[j];

      const planetsInvolved = new Set([
        a1.planet1,
        a1.planet2,
        a2.planet1,
        a2.planet2,
      ]);
      if (planetsInvolved.size === 3) {
        const planetList = Array.from(planetsInvolved);
        const signs = planetList.map(p => planets[p]?.sign || "");

        patterns.push({
          name: `Grand Trine`,
          strength: (a1.strength + a2.strength) / 2,
          planets: planetList,
          houses: planetList
            .map(p => planets[p]?.house || 0)
            .filter(h => h > 0),
          signs,
          description: `Three planets in harmonious trine aspect`,
          type: "grand_trine",
        });
      }
    }
  }

  return patterns;
}

function detectTSquares(
  aspects: Aspect[],
  planets: Record<string, PlanetPlacement>
): PatternScore[] {
  const squares = aspects.filter(a => a.type === "square" && a.strength > 0.5);
  const oppositions = aspects.filter(
    a => a.type === "opposition" && a.strength > 0.5
  );
  const patterns: PatternScore[] = [];

  for (const opposition of oppositions) {
    const p1 = opposition.planet1;
    const p2 = opposition.planet2;

    const squaresToP1 = squares.filter(
      s =>
        (s.planet1 === p1 || s.planet2 === p1) &&
        s.planet1 !== p2 &&
        s.planet2 !== p2
    );

    const squaresToP2 = squares.filter(
      s =>
        (s.planet1 === p2 || s.planet2 === p2) &&
        s.planet1 !== p1 &&
        s.planet2 !== p1
    );

    // T-Square requires an opposition and two squares to the same third planet
    for (const sq1 of squaresToP1) {
      for (const sq2 of squaresToP2) {
        const thirdPlanet = sq1.planet1 === p1 ? sq1.planet2 : sq1.planet1;
        const thirdPlanetFromSq2 =
          sq2.planet1 === p2 ? sq2.planet2 : sq2.planet1;

        if (thirdPlanet === thirdPlanetFromSq2) {
          patterns.push({
            name: `T-Square involving ${p1}-${p2} opposition`,
            strength: (opposition.strength + sq1.strength + sq2.strength) / 3,
            planets: [p1, p2, thirdPlanet],
            houses: [p1, p2, thirdPlanet]
              .map(p => planets[p]?.house || 0)
              .filter(h => h > 0),
            signs: [p1, p2, thirdPlanet].map(p => planets[p]?.sign || ""),
            description: `Dynamic tension pattern: opposition with square aspects`,
            type: "t_square",
          });
        }
      }
    }
  }

  return patterns;
}

function detectAllPatterns(
  aspects: Aspect[],
  planets: Record<string, PlanetPlacement>,
  config: PatternConfig
): PatternScore[] {
  const patterns: PatternScore[] = [];

  patterns.push(...detectStelliums(aspects, planets));
  patterns.push(...detectGrandTrines(aspects, planets));
  patterns.push(...detectTSquares(aspects, planets));

  // Filter by minimal strength
  return patterns
    .filter(p => p.strength >= config.minimalPatternStrength)
    .sort((a, b) => b.strength - a.strength);
}

// ============================================================================
// 5. ARCHETYPE MAPPING (Comprehensive)
// ============================================================================

const ARCHETYPE_TRIGGERS: Record<
  string,
  (
    analysis: PartialPatternAnalysis
  ) => { intensity: string; themes: string[] } | null
> = {
  // Saturn archetypes
  saturn_heavy: a => {
    const saturnStrength = a.planetaryStrength?.["Saturn"]?.totalStrength || 0;
    const saturnAspects =
      a.aspects?.filter(
        as => as.planet1 === "Saturn" || as.planet2 === "Saturn"
      ) || [];
    if (saturnStrength > 0.7 || saturnAspects.length > 2) {
      return {
        intensity: saturnStrength > 0.8 ? "high" : "moderate",
        themes: [
          "discipline",
          "responsibility",
          "limitation",
          "mastery",
          "time",
          "structure",
        ],
      };
    }
    return null;
  },

  // Jupiter archetypes
  jupiter_heavy: a => {
    const jupiterStrength =
      a.planetaryStrength?.["Jupiter"]?.totalStrength || 0;
    if (jupiterStrength > 0.7) {
      return {
        intensity: jupiterStrength > 0.8 ? "high" : "moderate",
        themes: [
          "expansion",
          "optimism",
          "abundance",
          "growth",
          "wisdom",
          "opportunity",
        ],
      };
    }
    return null;
  },

  // Pluto archetypes
  pluto_heavy: a => {
    const plutoStrength = a.planetaryStrength?.["Pluto"]?.totalStrength || 0;
    const plutoAspects =
      a.aspects?.filter(
        as => as.planet1 === "Pluto" || as.planet2 === "Pluto"
      ) || [];
    if (
      plutoStrength > 0.6 ||
      plutoAspects.some(
        as => as.type === "conjunction" || as.type === "opposition"
      )
    ) {
      return {
        intensity: plutoStrength > 0.8 ? "extreme" : "high",
        themes: [
          "transformation",
          "power",
          "death/rebirth",
          "shadow work",
          "intensity",
          "regeneration",
        ],
      };
    }
    return null;
  },

  // Uranus archetypes
  uranus_heavy: a => {
    const uranusStrength = a.planetaryStrength?.["Uranus"]?.totalStrength || 0;
    if (uranusStrength > 0.7) {
      return {
        intensity: uranusStrength > 0.8 ? "high" : "moderate",
        themes: [
          "awakening",
          "rebellion",
          "innovation",
          "sudden change",
          "freedom",
          "uniqueness",
        ],
      };
    }
    return null;
  },

  // Neptune archetypes
  neptune_heavy: a => {
    const neptuneStrength =
      a.planetaryStrength?.["Neptune"]?.totalStrength || 0;
    if (neptuneStrength > 0.7) {
      return {
        intensity: neptuneStrength > 0.8 ? "high" : "moderate",
        themes: [
          "dreams",
          "illusion",
          "spirituality",
          "compassion",
          "dissolution",
          "inspiration",
        ],
      };
    }
    return null;
  },

  // Venus-Mars conjunction (passion)
  venus_mars_passion: a => {
    const venusMarsAspect = a.aspects?.find(
      as =>
        (as.planet1 === "Venus" && as.planet2 === "Mars") ||
        (as.planet1 === "Mars" && as.planet2 === "Venus")
    );
    if (venusMarsAspect && venusMarsAspect.strength > 0.6) {
      return {
        intensity: venusMarsAspect.strength > 0.8 ? "high" : "moderate",
        themes: [
          "passion",
          "creative fire",
          "romantic tension",
          "action in love",
          "desire",
        ],
      };
    }
    return null;
  },

  // Grand Trine (effortless flow)
  grand_trine: a => {
    const gt = a.dominantPatterns?.find(p => p.type === "grand_trine");
    if (gt) {
      return {
        intensity: gt.strength > 0.7 ? "high" : "moderate",
        themes: [
          "flow",
          "ease",
          "natural talent",
          "harmony",
          "gift",
          "synchronicity",
        ],
      };
    }
    return null;
  },

  // T-Square (tension to action)
  t_square: a => {
    const ts = a.dominantPatterns?.find(p => p.type === "t_square");
    if (ts) {
      return {
        intensity: "high",
        themes: [
          "tension",
          "pressure",
          "motivation",
          "crisis as catalyst",
          "resolution required",
        ],
      };
    }
    return null;
  },

  // Stellium (focus)
  stellium: a => {
    const stellium = a.dominantPatterns?.find(p => p.type === "stellium");
    if (stellium) {
      const intensity =
        stellium.planets.length >= 5
          ? "extreme"
          : stellium.planets.length >= 4
            ? "high"
            : "moderate";
      return {
        intensity,
        themes: [
          "intense focus",
          "concentration of energy",
          "specialization",
          "obsession",
          "power",
        ],
      };
    }
    return null;
  },

  // House emphasis archetypes
  tenth_house_emphasis: a => {
    const house10 = a.houseEmphasis?.[10];
    if (house10 && house10.strength > 0.6) {
      return {
        intensity: house10.strength > 0.8 ? "high" : "moderate",
        themes: [
          "career",
          "public life",
          "legacy",
          "ambition",
          "reputation",
          "calling",
        ],
      };
    }
    return null;
  },

  seventh_house_emphasis: a => {
    const house7 = a.houseEmphasis?.[7];
    if (house7 && house7.strength > 0.6) {
      return {
        intensity: house7.strength > 0.8 ? "high" : "moderate",
        themes: [
          "partnerships",
          "marriage",
          "contracts",
          "mirroring",
          "diplomacy",
          "others",
        ],
      };
    }
    return null;
  },

  fourth_house_emphasis: a => {
    const house4 = a.houseEmphasis?.[4];
    if (house4 && house4.strength > 0.6) {
      return {
        intensity: house4.strength > 0.8 ? "high" : "moderate",
        themes: [
          "home",
          "family",
          "roots",
          "emotional security",
          "ancestry",
          "inner world",
        ],
      };
    }
    return null;
  },
};

interface PartialPatternAnalysis {
  aspects?: Aspect[];
  dominantPatterns?: PatternScore[];
  houseEmphasis?: Record<number, any>;
  planetaryStrength?: Record<string, PlanetaryDignity>;
}

function mapArchetypes(partial: PartialPatternAnalysis): ArchetypeLabel[] {
  const archetypes: ArchetypeLabel[] = [];

  for (const [key, detector] of Object.entries(ARCHETYPE_TRIGGERS)) {
    const result = detector(partial);
    if (result) {
      archetypes.push({
        archetype: key
          .replace(/_/g, " ")
          .replace(/\b\w/g, l => l.toUpperCase()),
        intensity: result.intensity as any,
        affectedPlanets: [],
        affectedHouses: [],
        affectedSigns: [],
        themes: result.themes,
        triggers: [key],
      });
    }
  }

  return archetypes;
}

// ============================================================================
// 6. HIGH-LEVEL SIGNATURES
// ============================================================================

function generateSignatures(analysis: PatternAnalysis): string[] {
  const signatures: string[] = [];

  // Check for major configurations
  if (analysis.dominantPatterns.some(p => p.type === "grand_trine")) {
    signatures.push(
      "Effortless flow: Grand Trine indicates natural talents and synchronicity."
    );
  }

  if (analysis.dominantPatterns.some(p => p.type === "t_square")) {
    signatures.push(
      "Dynamic tension: T-Square creates pressure that demands action and resolution."
    );
  }

  if (
    analysis.dominantPatterns.some(
      p => p.type === "stellium" && p.planets.length >= 4
    )
  ) {
    signatures.push(
      "Powerful focus: Major stellium concentrates energy in one area of life."
    );
  }

  // Strong planetary signatures
  for (const [planet, dignity] of Object.entries(analysis.planetaryStrength)) {
    if (dignity.totalStrength > 0.85) {
      signatures.push(
        `${planet} is exceptionally strong and will be a dominant voice in the chart.`
      );
    }
  }

  return signatures;
}

// ============================================================================
// 7. MAIN EXPORTED FUNCTION
// ============================================================================

export function analyzePatterns(
  natal: Record<string, PlanetPlacement>,
  transit: Record<string, PlanetPlacement>,
  userConfig: Partial<PatternConfig> = {}
): PatternAnalysis {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // 1. Detect all aspects
  const natalAspects = detectAspects(natal, null, config, false);
  const transitToNatalAspects = detectAspects(transit, natal, config, true);
  const allAspects = [...natalAspects, ...transitToNatalAspects];

  // A natal-only analysis evaluates natal strength/geometry directly.
  // It never creates transit-to-natal contacts by copying the natal sky.
  const primary = Object.keys(transit).length ? transit : natal;
  const planetaryStrength = calculatePlanetaryStrength(primary, config);

  // 3. Analyze house emphasis
  const houseEmphasis = analyzeHouseEmphasis(primary, planetaryStrength);

  // 4. Detect patterns
  const patterns = detectAllPatterns(allAspects, primary, config);

  // 5. Map archetypes
  const partialAnalysis = {
    aspects: allAspects,
    dominantPatterns: patterns,
    houseEmphasis,
    planetaryStrength,
  };
  const archetypes = mapArchetypes(partialAnalysis);

  // 6. Build final analysis
  const analysis: PatternAnalysis = {
    timestamp: new Date(),
    config,
    dominantPatterns: patterns.slice(0, 5),
    aspects: allAspects,
    archetypes,
    houseEmphasis,
    planetaryStrength,
    signatures: [],
  };

  analysis.signatures = generateSignatures(analysis);

  return analysis;
}

// ============================================================================
// 8. UTILITY EXPORTS
// ============================================================================

export function getTopArchetypes(
  analysis: PatternAnalysis,
  limit: number = 3
): ArchetypeLabel[] {
  const intensityMap = { extreme: 4, high: 3, moderate: 2, low: 1 };
  return analysis.archetypes
    .sort((a, b) => intensityMap[b.intensity] - intensityMap[a.intensity])
    .slice(0, limit);
}

export function getStrongestPlanets(
  analysis: PatternAnalysis,
  limit: number = 3
): string[] {
  return Object.entries(analysis.planetaryStrength)
    .sort((a, b) => b[1].totalStrength - a[1].totalStrength)
    .slice(0, limit)
    .map(([name]) => name);
}

export function getAspectSummary(analysis: PatternAnalysis): string {
  const strongAspects = analysis.aspects.filter(a => a.strength > 0.7);
  if (strongAspects.length === 0) return "No strong aspects active.";
  return strongAspects
    .map(
      a =>
        `${a.planet1} ${a.type} ${a.planet2} (${Math.round(a.strength * 100)}% strength)`
    )
    .join(", ");
}
