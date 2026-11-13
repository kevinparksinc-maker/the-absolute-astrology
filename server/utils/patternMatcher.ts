import { normalizeLongitude, ZODIAC_SIGNS } from "../../shared/hybrid";
import {
  PatternRequestSchema,
  type DiscoveredPattern,
  type PatternAnalysis,
  type PatternRequest,
  type PlanetPlacement,
  type WesternAspect,
} from "../patterns/types";

const ASPECTS = [
  // The unified Firmament relationship layer has one maximum five-degree orb.
  // Traditional/source-specific doctrines remain separate evidence elsewhere.
  { type: "conjunction" as const, angle: 0, orb: 5, weight: 1 },
  { type: "opposition" as const, angle: 180, orb: 5, weight: 0.9 },
  { type: "trine" as const, angle: 120, orb: 5, weight: 0.75 },
  { type: "square" as const, angle: 90, orb: 5, weight: 0.85 },
  { type: "sextile" as const, angle: 60, orb: 5, weight: 0.55 },
  { type: "quincunx" as const, angle: 150, orb: 5, weight: 0.4 },
];

const ASPECT_THEMES: Record<WesternAspect["type"], string[]> = {
  conjunction: ["concentration", "fusion"],
  opposition: ["polarity", "mirroring"],
  square: ["friction", "pressure", "integration"],
  trine: ["flow", "support", "ease"],
  sextile: ["opportunity", "cooperation"],
  quincunx: ["adjustment", "misfit"],
};

function angularDistance(a: number, b: number) {
  const delta = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));
  return Math.min(delta, 360 - delta);
}

function signFor(longitude: number) {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)];
}

function canonicalPair(a: string, b: string) {
  return [a, b].sort().join("|");
}

/** Detects each pair once and always handles the 0°/360° wraparound. */
export function detectWesternAspects(
  placements: PlanetPlacement[]
): WesternAspect[] {
  const aspects: WesternAspect[] = [];
  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      const first = placements[i];
      const second = placements[j];
      const distance = angularDistance(first.longitude, second.longitude);
      const match = ASPECTS.map(aspect => ({
        definition: aspect,
        orb: Math.abs(distance - aspect.angle),
      }))
        .filter(candidate => candidate.orb <= candidate.definition.orb)
        .sort((a, b) => a.orb - b.orb)[0];
      if (!match) continue;
      const definition = match.definition;
      const strength =
        Math.max(0, Math.min(1, 1 - match.orb / definition.orb)) *
        definition.weight;
      aspects.push({
        planetA: first.planet,
        planetB: second.planet,
        type: definition.type,
        exactAngle: definition.angle,
        orb: Number(match.orb.toFixed(4)),
        strength: Number(strength.toFixed(4)),
        themes: ASPECT_THEMES[definition.type],
      });
    }
  }
  return aspects;
}

function normalizedTheme(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function themeTokens(values: string[]) {
  const stopWords = new Set([
    "and",
    "the",
    "with",
    "from",
    "house",
    "planet",
    "sign",
  ]);
  return new Set(
    values.flatMap(value =>
      normalizedTheme(value)
        .split(" ")
        .filter(token => token.length > 3 && !stopWords.has(token))
    )
  );
}

function placementByPlanet(placements: PlanetPlacement[]) {
  return new Map(placements.map(placement => [placement.planet, placement]));
}

function buildCrossSystemPatterns(
  request: PatternRequest,
  aspects: WesternAspect[]
): DiscoveredPattern[] {
  const patterns: DiscoveredPattern[] = [];
  const vedicByPlanet = new Map(
    request.vedic.signals.map(signal => [signal.planet, signal])
  );
  const arabicByPlanet = new Map(
    request.arabic.signals.map(signal => [signal.planet, signal])
  );
  const placements = placementByPlanet(request.western.placements);

  for (const aspect of aspects) {
    const vedicSignals = [
      vedicByPlanet.get(aspect.planetA),
      vedicByPlanet.get(aspect.planetB),
    ].filter(Boolean);
    const arabicSignals = [
      arabicByPlanet.get(aspect.planetA),
      arabicByPlanet.get(aspect.planetB),
    ].filter(Boolean);
    const systems: DiscoveredPattern["systems"] = ["western"];
    const evidence = [
      `${aspect.planetA} ${aspect.type} ${aspect.planetB} at ${aspect.exactAngle}° (orb ${aspect.orb}°)`,
    ];
    const themes = [...ASPECT_THEMES[aspect.type]];
    if (vedicSignals.length) {
      systems.push("vedic");
      for (const signal of vedicSignals) {
        if (signal?.nakshatra) {
          evidence.push(
            `${signal.planet} in ${signal.nakshatra}${signal.pada ? ` pada ${signal.pada}` : ""}`
          );
          themes.push(signal.nakshatra);
        }
        if (signal?.dignity && signal.dignity !== "unknown") {
          evidence.push(`${signal.planet} is ${signal.dignity}`);
          themes.push(signal.dignity);
        }
        themes.push(...(signal?.themes ?? []));
      }
    }
    if (arabicSignals.length) {
      systems.push("arabic");
      for (const signal of arabicSignals) {
        if (signal?.manzil) {
          evidence.push(`${signal.planet} in ${signal.manzil}`);
          themes.push(signal.manzil);
        }
        if (signal?.hourLord) {
          evidence.push(`${signal.planet} hour lord: ${signal.hourLord}`);
          themes.push(signal.hourLord);
        }
        themes.push(...(signal?.themes ?? []));
      }
    }
    if (systems.length < 2) continue;
    const houseText = [
      placements.get(aspect.planetA)?.house,
      placements.get(aspect.planetB)?.house,
    ]
      .filter(Boolean)
      .join("/");
    const score = Math.min(1, aspect.strength * (0.55 + systems.length * 0.15));
    patterns.push({
      id: `aspect-${canonicalPair(aspect.planetA, aspect.planetB)}-${aspect.type}`.toLowerCase(),
      label: `${aspect.planetA}–${aspect.planetB} ${aspect.type} convergence`,
      score: Number(score.toFixed(4)),
      systems,
      evidence: houseText
        ? [...evidence, `Western houses ${houseText}`]
        : evidence,
      themes: Array.from(new Set(themes.map(normalizedTheme).filter(Boolean))),
      synthesis: `The ${aspect.type} between ${aspect.planetA} and ${aspect.planetB} describes a ${ASPECT_THEMES[aspect.type].join(" and ")} pattern. The Vedic and Arabic layers repeat enough of the same signal to treat it as a concrete theme for the question, not a standalone horoscope label.`,
    });
  }

  const westernTokens = themeTokens(aspects.flatMap(aspect => aspect.themes));
  const vedicTokens = themeTokens(
    request.vedic.signals.flatMap(signal => [
      ...signal.themes,
      signal.nakshatra ?? "",
      signal.dignity,
    ])
  );
  const arabicTokens = themeTokens(
    request.arabic.signals.flatMap(signal => [
      ...signal.themes,
      signal.manzil ?? "",
      signal.hourLord ?? "",
    ])
  );
  const shared = Array.from(westernTokens).filter(
    token =>
      (vedicTokens.has(token) ? 1 : 0) + (arabicTokens.has(token) ? 1 : 0) >= 1
  );
  if (shared.length) {
    patterns.push({
      id: "cross-system-theme-overlap",
      label: "Cross-system thematic overlap",
      score: Number(Math.min(1, 0.45 + shared.length * 0.08).toFixed(4)),
      systems: ["western", "vedic", "arabic"].filter(system =>
        system === "western"
          ? westernTokens.size > 0
          : system === "vedic"
            ? vedicTokens.size > 0
            : arabicTokens.size > 0
      ) as DiscoveredPattern["systems"],
      evidence: [`Shared normalized themes: ${shared.join(", ")}`],
      themes: shared,
      synthesis: `The same thematic vocabulary recurs across the supplied layers (${shared.join(", ")}). Use this as a prompt for reflection and verification rather than as a deterministic prediction.`,
    });
  }
  return patterns
    .filter(pattern => pattern.score >= request.minimumScore)
    .sort((a, b) => b.score - a.score);
}

export function synthesizeCrossSystemPatterns(
  input: PatternRequest
): PatternAnalysis {
  const request = PatternRequestSchema.parse(input);
  const aspects = request.western.aspects.length
    ? request.western.aspects
    : detectWesternAspects(request.western.placements);
  const patterns = buildCrossSystemPatterns(request, aspects);
  const signatures = patterns
    .slice(0, 5)
    .map(
      pattern => `${pattern.label}: ${pattern.themes.slice(0, 4).join(", ")}`
    );
  return {
    userQuestion: request.userQuestion,
    aspects,
    patterns,
    signatures,
    warnings: [
      "Provider data is normalized locally; no unverified third-party scraping is performed.",
      "Patterns are interpretive signals for reflection, not medical, legal, financial, or certainty claims.",
    ],
  };
}
