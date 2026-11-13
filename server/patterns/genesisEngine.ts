import type { ChartResult, ChartRow } from "../astronomy";
import { angularDistance } from "../astrologyCore";

export type GenesisPatternConfig = {
  orbConjunction: number;
  orbOpposition: number;
  orbTrine: number;
  orbSquare: number;
  orbSextile: number;
  orbQuincunx: number;
  minimumPatternStrength: number;
};

export const GENESIS_PATTERN_CONFIG: GenesisPatternConfig = {
  orbConjunction: 8,
  orbOpposition: 8,
  orbTrine: 6,
  orbSquare: 6,
  orbSextile: 4,
  orbQuincunx: 3,
  minimumPatternStrength: 0.3,
};

export type GenesisAspect = {
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
  strength: number;
  isTransitToNatal: boolean;
};

export type GenesisDignity = {
  planet: string;
  essential: number;
  accidental: number;
  totalStrength: number;
};

export type GenesisPattern = {
  name: string;
  type: "stellium" | "grand_trine" | "t_square";
  strength: number;
  planets: string[];
  houses: number[];
  signs: string[];
  description: string;
};

export type GenesisArchetype = {
  archetype: string;
  intensity: "moderate" | "high" | "extreme";
  themes: string[];
  affectedPlanets: string[];
  affectedHouses: number[];
};

export type GenesisYoga = {
  name: string;
  message: string;
};

export type GenesisPatternAnalysis = {
  doctrine: "genesis-pattern-engine";
  config: GenesisPatternConfig;
  natalAspects: GenesisAspect[];
  transitAspects: GenesisAspect[];
  dominantPatterns: GenesisPattern[];
  archetypes: GenesisArchetype[];
  houseEmphasis: Record<
    number,
    { planetCount: number; planets: string[]; strength: number }
  >;
  planetaryStrength: Record<string, GenesisDignity>;
  vedicYogas: GenesisYoga[];
  signatures: string[];
};

const SIGN_RULERS: Record<string, string[]> = {
  Aries: ["Mars"],
  Taurus: ["Venus"],
  Gemini: ["Mercury"],
  Cancer: ["Moon"],
  Leo: ["Sun"],
  Virgo: ["Mercury"],
  Libra: ["Venus"],
  Scorpio: ["Mars"],
  Sagittarius: ["Jupiter"],
  Capricorn: ["Saturn"],
  Aquarius: ["Saturn"],
  Pisces: ["Jupiter"],
};
const EXALTATIONS: Record<string, string> = {
  Sun: "Aries",
  Moon: "Taurus",
  Mercury: "Virgo",
  Venus: "Pisces",
  Mars: "Capricorn",
  Jupiter: "Cancer",
  Saturn: "Libra",
};
const FALLS: Record<string, string> = {
  Sun: "Libra",
  Moon: "Scorpio",
  Mercury: "Pisces",
  Venus: "Virgo",
  Mars: "Cancer",
  Jupiter: "Capricorn",
  Saturn: "Aries",
};
const DETRIMENTS: Record<string, string[]> = {
  Sun: ["Aquarius"],
  Moon: ["Capricorn"],
  Mercury: ["Sagittarius", "Pisces"],
  Venus: ["Scorpio", "Aries"],
  Mars: ["Libra", "Taurus"],
  Jupiter: ["Gemini", "Virgo"],
  Saturn: ["Cancer", "Leo"],
};
const ASPECTS = [
  ["conjunction", 0, "orbConjunction", 1],
  ["opposition", 180, "orbOpposition", 0.85],
  ["trine", 120, "orbTrine", 0.6],
  ["square", 90, "orbSquare", 0.72],
  ["sextile", 60, "orbSextile", 0.45],
  ["quincunx", 150, "orbQuincunx", 0.35],
] as const;

function sign(row: ChartRow) {
  return row.display.split(" ")[0];
}
function strength(orb: number, limit: number, weight: number) {
  return Number(
    (Math.max(0, Math.min(1, 1 - orb / limit)) * weight).toFixed(4)
  );
}
function detectAspects(
  a: ChartRow[],
  b: ChartRow[] | null,
  config: GenesisPatternConfig,
  transit: boolean
) {
  const result: GenesisAspect[] = [];
  const targets = b ?? a;
  for (let firstIndex = 0; firstIndex < a.length; firstIndex += 1) {
    const first = a[firstIndex];
    for (let secondIndex = 0; secondIndex < targets.length; secondIndex += 1) {
      if (!transit && secondIndex <= firstIndex) continue;
      const second = targets[secondIndex];
      if (first.name === second.name) continue;
      const distance = angularDistance(first.longitude, second.longitude);
      const matches = ASPECTS.map(([type, angle, key, weight]) => ({
        type,
        angle,
        orb: Math.abs(distance - angle),
        limit: config[key],
        weight,
      }))
        .filter(item => item.orb <= item.limit)
        .sort((x, y) => x.orb - y.orb);
      const best = matches[0];
      if (!best) continue;
      result.push({
        planet1: first.name,
        planet2: second.name,
        type: best.type,
        angle: best.angle,
        orb: Number(best.orb.toFixed(4)),
        strength: strength(best.orb, best.limit, best.weight),
        isTransitToNatal: transit,
      });
    }
  }
  return result;
}
function dignity(row: ChartRow): GenesisDignity {
  const rowSign = sign(row);
  let essential = 0;
  if (SIGN_RULERS[rowSign]?.includes(row.name)) essential += 1;
  if (EXALTATIONS[row.name] === rowSign) essential += 0.7;
  if (FALLS[row.name] === rowSign) essential -= 0.7;
  if (DETRIMENTS[row.name]?.includes(rowSign)) essential -= 1;
  essential = Math.max(-1, Math.min(1, essential));
  const accidental = [1, 4, 7, 10].includes(row.house)
    ? 0.5
    : [2, 5, 8, 11].includes(row.house)
      ? 0.25
      : 0;
  const retrogradePenalty = row.retrograde ? -0.3 : 0;
  const actualAccidental = Math.max(
    -0.5,
    Math.min(0.5, accidental + retrogradePenalty)
  );
  return {
    planet: row.name,
    essential,
    accidental: actualAccidental,
    totalStrength: Number(
      Math.max(
        0,
        Math.min(1, (essential + 0.8) * 0.6 + (actualAccidental + 0.5) * 0.4)
      ).toFixed(4)
    ),
  };
}
function patternStrength(aspects: GenesisAspect[]) {
  return Number(
    (
      aspects.reduce((sum, item) => sum + item.strength, 0) /
      Math.max(1, aspects.length)
    ).toFixed(4)
  );
}
function detectPatterns(
  rows: ChartRow[],
  aspects: GenesisAspect[],
  config: GenesisPatternConfig
): GenesisPattern[] {
  const patterns: GenesisPattern[] = [];
  const bySign = new Map<string, ChartRow[]>();
  const byHouse = new Map<number, ChartRow[]>();
  for (const row of rows) {
    const rowSign = sign(row);
    bySign.set(rowSign, [...(bySign.get(rowSign) ?? []), row]);
    byHouse.set(row.house, [...(byHouse.get(row.house) ?? []), row]);
  }
  for (const [rowSign, members] of Array.from(bySign.entries()))
    if (members.length >= 3)
      patterns.push({
        name: `Stellium in ${rowSign}`,
        type: "stellium",
        strength: Math.min(1, members.length / 5),
        planets: members.map(row => row.name),
        houses: members.map(row => row.house),
        signs: [rowSign],
        description: `${members.length} planets concentrated in ${rowSign}.`,
      });
  for (const [house, members] of Array.from(byHouse.entries()))
    if (members.length >= 3)
      patterns.push({
        name: `Stellium in House ${house}`,
        type: "stellium",
        strength: Math.min(1, members.length / 5),
        planets: members.map(row => row.name),
        houses: [house],
        signs: members.map(sign),
        description: `${members.length} planets concentrated in House ${house}.`,
      });
  const trines = aspects.filter(
    item =>
      item.type === "trine" && item.strength > 0.6 && !item.isTransitToNatal
  );
  for (let i = 0; i < trines.length; i++)
    for (let j = i + 1; j < trines.length; j++) {
      const planets = Array.from(
        new Set([
          trines[i].planet1,
          trines[i].planet2,
          trines[j].planet1,
          trines[j].planet2,
        ])
      );
      if (planets.length === 3) {
        const members = rows.filter(row => planets.includes(row.name));
        patterns.push({
          name: "Grand Trine",
          type: "grand_trine",
          strength: patternStrength([trines[i], trines[j]]),
          planets,
          houses: members.map(row => row.house),
          signs: members.map(sign),
          description: "Three planets form a harmonious trine configuration.",
        });
      }
    }
  const oppositions = aspects.filter(
    item =>
      item.type === "opposition" &&
      item.strength > 0.5 &&
      !item.isTransitToNatal
  );
  const squares = aspects.filter(
    item =>
      item.type === "square" && item.strength > 0.5 && !item.isTransitToNatal
  );
  for (const opposition of oppositions) {
    const ends = new Set([opposition.planet1, opposition.planet2]);
    const candidates = rows.filter(row => !ends.has(row.name));
    for (const candidate of candidates) {
      const links = squares.filter(
        square =>
          [square.planet1, square.planet2].includes(candidate.name) &&
          [square.planet1, square.planet2].some(name => ends.has(name))
      );
      if (links.length >= 2)
        patterns.push({
          name: `T-Square involving ${opposition.planet1}-${opposition.planet2} opposition`,
          type: "t_square",
          strength: patternStrength([opposition, ...links.slice(0, 2)]),
          planets: [opposition.planet1, opposition.planet2, candidate.name],
          houses: rows
            .filter(row =>
              [opposition.planet1, opposition.planet2, candidate.name].includes(
                row.name
              )
            )
            .map(row => row.house),
          signs: rows
            .filter(row =>
              [opposition.planet1, opposition.planet2, candidate.name].includes(
                row.name
              )
            )
            .map(sign),
          description:
            "An opposition with two squares creates dynamic pressure requiring integration.",
        });
    }
  }
  return patterns
    .filter(pattern => pattern.strength >= config.minimumPatternStrength)
    .sort((a, b) => b.strength - a.strength);
}
function archetypes(
  patterns: GenesisPattern[],
  aspects: GenesisAspect[],
  strengths: Record<string, GenesisDignity>,
  houses: Record<
    number,
    { planetCount: number; planets: string[]; strength: number }
  >
): GenesisArchetype[] {
  const result: GenesisArchetype[] = [];
  const add = (
    archetype: string,
    intensity: GenesisArchetype["intensity"],
    themes: string[],
    affectedPlanets: string[] = [],
    affectedHouses: number[] = []
  ) =>
    result.push({
      archetype,
      intensity,
      themes,
      affectedPlanets,
      affectedHouses,
    });
  const saturn = strengths.Saturn?.totalStrength ?? 0;
  if (
    saturn > 0.7 ||
    aspects.filter(item => [item.planet1, item.planet2].includes("Saturn"))
      .length > 2
  )
    add(
      "Saturn Heavy",
      saturn > 0.8 ? "high" : "moderate",
      [
        "discipline",
        "responsibility",
        "limitation",
        "mastery",
        "time",
        "structure",
      ],
      ["Saturn"]
    );
  const jupiter = strengths.Jupiter?.totalStrength ?? 0;
  if (jupiter > 0.7)
    add(
      "Jupiter Heavy",
      jupiter > 0.8 ? "high" : "moderate",
      ["expansion", "optimism", "abundance", "growth", "wisdom", "opportunity"],
      ["Jupiter"]
    );
  const plutoAspects = aspects.filter(item =>
    [item.planet1, item.planet2].includes("Pluto")
  );
  if (
    plutoAspects.some(item => ["conjunction", "opposition"].includes(item.type))
  )
    add(
      "Pluto Heavy",
      "high",
      ["transformation", "power", "shadow work", "regeneration"],
      ["Pluto"]
    );
  const venusMars = aspects.find(
    item =>
      new Set([item.planet1, item.planet2]).size === 2 &&
      [item.planet1, item.planet2].includes("Venus") &&
      [item.planet1, item.planet2].includes("Mars")
  );
  if (venusMars && venusMars.strength > 0.6)
    add(
      "Venus Mars Passion",
      venusMars.strength > 0.8 ? "high" : "moderate",
      ["passion", "creative fire", "romantic tension", "desire"],
      ["Venus", "Mars"]
    );
  const grandTrine = patterns.find(item => item.type === "grand_trine");
  if (grandTrine)
    add(
      "Grand Trine",
      grandTrine.strength > 0.7 ? "high" : "moderate",
      ["flow", "ease", "natural talent", "harmony"],
      grandTrine.planets,
      grandTrine.houses
    );
  const tSquare = patterns.find(item => item.type === "t_square");
  if (tSquare)
    add(
      "T Square",
      "high",
      ["tension", "pressure", "motivation", "resolution required"],
      tSquare.planets,
      tSquare.houses
    );
  const stellium = patterns.find(item => item.type === "stellium");
  if (stellium)
    add(
      "Stellium",
      stellium.planets.length >= 5
        ? "extreme"
        : stellium.planets.length >= 4
          ? "high"
          : "moderate",
      [
        "intense focus",
        "concentration of energy",
        "specialization",
        "obsession",
      ],
      stellium.planets,
      stellium.houses
    );
  for (const [house, data] of Object.entries(houses))
    if (data.strength > 0.6 && [4, 7, 10].includes(Number(house)))
      add(
        `House ${house} Emphasis`,
        data.strength > 0.8 ? "high" : "moderate",
        house === "7"
          ? ["partnerships", "marriage", "contracts", "mirroring"]
          : house === "10"
            ? ["career", "public life", "legacy", "ambition"]
            : ["home", "family", "roots", "emotional security"],
        data.planets,
        [Number(house)]
      );
  return result;
}

function detectVedicYogas(rows: ChartRow[]): GenesisYoga[] {
  const jupiter = rows.find(row => row.name === "Jupiter");
  if (!jupiter || ![1, 4, 7, 10].includes(jupiter.house)) return [];
  const rowSign = sign(jupiter);
  if (!["Pisces", "Sagittarius"].includes(rowSign)) return [];
  return [
    {
      name: "Hamsa Yoga",
      message: `Hamsa Yoga: Jupiter is angular in ${rowSign}, a Genesis Vedic signature of wisdom, protection, and principled authority.`,
    },
  ];
}

export function analyzeGenesisPatterns(
  chart: ChartResult
): GenesisPatternAnalysis {
  const config = GENESIS_PATTERN_CONFIG;
  const natal = chart.movingBodies;
  const transit = chart.readingScope === "natal" ? [] : chart.transits;
  const natalAspects = detectAspects(natal, null, config, false);
  const transitAspects = detectAspects(transit, natal, config, true);
  const strengths = Object.fromEntries(
    natal.map(row => [row.name, dignity(row)])
  );
  const houseData = new Map<number, ChartRow[]>();
  for (const row of natal)
    houseData.set(row.house, [...(houseData.get(row.house) ?? []), row]);
  const houseEmphasis = Object.fromEntries(
    Array.from(houseData.entries()).map(([house, members]) => [
      house,
      {
        planetCount: members.length,
        planets: members.map(row => row.name),
        strength: Number(
          Math.min(
            1,
            members.reduce(
              (sum, row) => sum + (strengths[row.name]?.totalStrength ?? 0.5),
              0
            ) / Math.max(1, members.length * 0.7)
          ).toFixed(4)
        ),
      },
    ])
  );
  const dominantPatterns = detectPatterns(natal, natalAspects, config);
  const vedicYogas = detectVedicYogas(natal);
  const allAspects = [...natalAspects, ...transitAspects];
  const signatures = [
    ...(dominantPatterns.some(item => item.type === "grand_trine")
      ? [
          "Effortless flow: Grand Trine indicates natural talents and synchronicity.",
        ]
      : []),
    ...(dominantPatterns.some(item => item.type === "t_square")
      ? [
          "Dynamic tension: T-Square creates pressure that demands action and resolution.",
        ]
      : []),
    ...(dominantPatterns.some(
      item => item.type === "stellium" && item.planets.length >= 4
    )
      ? [
          "Powerful focus: a major stellium concentrates energy in one area of life.",
        ]
      : []),
    ...Object.values(strengths)
      .filter(item => item.totalStrength > 0.85)
      .map(
        item =>
          `${item.planet} is exceptionally strong and may become a dominant voice in the chart.`
      ),
  ];
  return {
    doctrine: "genesis-pattern-engine",
    config,
    natalAspects,
    transitAspects,
    dominantPatterns,
    archetypes: archetypes(
      dominantPatterns,
      allAspects,
      strengths,
      houseEmphasis
    ),
    houseEmphasis,
    planetaryStrength: strengths,
    vedicYogas,
    signatures,
  };
}
