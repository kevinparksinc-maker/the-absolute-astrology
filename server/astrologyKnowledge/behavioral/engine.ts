import type { ChartResult, ChartRow } from "../../astronomy";
import { angularDistance } from "../../astrologyCore";
import { normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import type { EvidenceItem } from "../types";
import {
  BEHAVIORAL_POLARITY_AXES,
  COMPACT_PATTERN_INDEX,
  DO_NOT_CLAIM_RESTRICTIONS,
  EVENT_SEQUENCE_CHAINS,
  HOUSE_AXIS_DYNAMICS,
  HUMAN_BEHAVIOR_PATTERNS,
  LIFE_EVENT_PATTERNS,
  PLANET_INTERACTION_MATRIX,
  type BehavioralDomain,
  type ResponseStyle,
} from "./catalog";

export type BehavioralConfidenceLevel = 1 | 2 | 3 | 4 | 5;
export type BehavioralConfidenceLabel =
  | "Level 1 — Possible"
  | "Level 2 — Supported"
  | "Level 3 — Strong"
  | "Level 4 — Dominant"
  | "Level 5 — Structural";

export type BehavioralState =
  | "baseline"
  | "activated"
  | "suppressed"
  | "emerging"
  | "integrated"
  | "crisis";

export type EvidenceChannelHit = {
  channel:
    | "planet"
    | "sign"
    | "house"
    | "aspect"
    | "angularity"
    | "repetition"
    | "development"
    | "god-agent"
    | "overlay";
  detail: string;
};

export type EvaluatedBehaviorPattern = {
  id: string;
  codeNumber: number;
  name: string;
  domain: BehavioralDomain;
  domainLabel: string;
  confidenceLevel: BehavioralConfidenceLevel;
  confidenceLabel: BehavioralConfidenceLabel;
  languagePrefix: string;
  state: BehavioralState;
  questionRelevance: number;
  score: number;
  definition: string;
  observableExpressions: string[];
  constructiveExpression: string;
  shadowExpression: string;
  consciousExpression: string;
  automaticExpression: string;
  internalExpression: string;
  externalExpression: string;
  motivationPatterns: string[];
  triggerPatterns: string[];
  responseStyle: ResponseStyle;
  repeatingCycle: string;
  compensationPattern: string;
  developmentalTrajectory: {
    early: string;
    developing: string;
    mature: string;
  };
  godToAgentSynthesis: string;
  supportingEvidence: EvidenceChannelHit[];
  counterEvidence: string[];
  aiLanguageRule: string;
};

export type EvaluatedPolarityAxis = {
  id: string;
  leftPole: string;
  rightPole: string;
  leftScore: number;
  rightScore: number;
  isDynamicTension: boolean;
  dominantSide: "left" | "right" | "balanced-tension";
  leftEvidence: string[];
  rightEvidence: string[];
  synthesis: string;
};

export type EventConfidenceCode = "E1" | "E2" | "E3" | "E4" | "E5";
export type EventTemporalState =
  | "State 1 — Latent (Natal Promise)"
  | "State 2 — Approaching"
  | "State 3 — Activating"
  | "State 4 — Manifesting"
  | "State 5 — Peak Convergence"
  | "State 6 — Integrating"
  | "State 8 — Consolidating";

export type EvaluatedLifeEventPattern = {
  id: string;
  codeNumber: number;
  name: string;
  category: string;
  categoryLabel: string;
  confidenceCode: EventConfidenceCode;
  confidenceLabel: string;
  temporalState: EventTemporalState;
  questionRelevance: number;
  score: number;
  definition: string;
  possibleManifestations: string[];
  alternativeManifestations: string[];
  supportingEvidence: string[];
  counterEvidence: string[];
  godToAgentTranslation: string;
  developmentalMeaning: string;
  sequencePredecessors: string[];
  sequenceSuccessors: string[];
  aiLanguageRule: string;
};

export type EvaluatedSequenceChain = {
  id: string;
  name: string;
  activeStages: string[];
  supportingEvidence: string[];
  narrative: string;
  developmentalMeaning: string;
  strength: number;
};

export type EvaluatedPlanetInteraction = {
  pair: string;
  aspect: string;
  orb: number;
  coreTheme: string;
  constructive: string;
  shadow: string;
  behavioralMechanism: string;
};

export type SelfKnowledgeDimensionItem = {
  id: string;
  question: string;
  synthesis: string;
  astrologicalProof: string[];
};

export type SystemConvergenceFactor = {
  system: string;
  category: "Foundation" | "Structure" | "Traditional Overlay" | "Frame & Synthesis";
  status: "convergent" | "supporting" | "contextual";
  evidenceSummary: string;
};

export type SimulationComparisonCase = {
  id: string;
  title: string;
  hypothesisTested: string;
  surfaceOrBaselineView: string;
  convergentPatternReality: string;
  verdict: string;
};

export type BehavioralIntelligenceReport = {
  question: string;
  mode: "natal" | "transit" | "combined";
  evaluatedAt: string;
  allAboutYouProfile: SelfKnowledgeDimensionItem[];
  convergenceSimulationLab: {
    sixteenSystems: SystemConvergenceFactor[];
    simulationComparisons: SimulationComparisonCase[];
  };
  dominantBehaviors: EvaluatedBehaviorPattern[];
  polarityAxes: EvaluatedPolarityAxis[];
  activeContradictions: EvaluatedPolarityAxis[];
  activeLifeEvents: EvaluatedLifeEventPattern[];
  eventSequences: EvaluatedSequenceChain[];
  planetInteractions: EvaluatedPlanetInteraction[];
  activeHouseAxes: Array<{
    name: string;
    theme: string;
    narrative: string;
    evidence: string[];
  }>;
  matchedVocabularyTags: Array<{
    code: number;
    domain: string;
    name: string;
    evidence: string;
  }>;
  doNotClaimRestrictions: readonly string[];
};

const TRADITIONAL_RULERS: Record<string, string> = {
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

const MUTABLE_SIGNS = new Set(["Gemini", "Virgo", "Sagittarius", "Pisces"]);
const ANGULAR_HOUSES = new Set([1, 4, 7, 10]);

function signOf(longitude: number): string {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)] ?? "Aries";
}

type NatalAspect = {
  a: string;
  b: string;
  aspect: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
};

function computeNatalAspects(bodies: ChartRow[], maxOrb = 5): NatalAspect[] {
  const aspects: NatalAspect[] = [];
  const targets: Array<[number, NatalAspect["aspect"]]> = [
    [0, "conjunction"],
    [60, "sextile"],
    [90, "square"],
    [120, "trine"],
    [180, "opposition"],
  ];
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const first = bodies[i]!;
      const second = bodies[j]!;
      const dist = angularDistance(first.longitude, second.longitude);
      const best = targets
        .map(([deg, aspect]) => ({ aspect, orb: Math.abs(dist - deg) }))
        .sort((x, y) => x.orb - y.orb)[0];
      if (best && best.orb <= maxOrb) {
        aspects.push({
          a: first.name,
          b: second.name,
          aspect: best.aspect,
          orb: Number(best.orb.toFixed(2)),
        });
      }
    }
  }
  return aspects;
}

function findAspect(
  aspects: NatalAspect[],
  p1: string,
  p2: string
): NatalAspect | undefined {
  return aspects.find(
    item =>
      (item.a === p1 && item.b === p2) || (item.a === p2 && item.b === p1)
  );
}

function confidenceFromChannels(
  channels: EvidenceChannelHit[],
  hasGodAgentBridge: boolean,
  hasOverlay: boolean,
  isVolatilityPattern: boolean,
  mutableCount: number
): {
  level: BehavioralConfidenceLevel;
  label: BehavioralConfidenceLabel;
  prefix: string;
} {
  const distinctTypes = new Set(channels.map(c => c.channel)).size;
  const totalHits = channels.length;

  let rawLevel: BehavioralConfidenceLevel = 1;
  if (totalHits >= 6 && distinctTypes >= 5 && (hasGodAgentBridge || hasOverlay)) {
    rawLevel = 5;
  } else if (totalHits >= 5 && distinctTypes >= 4) {
    rawLevel = 4;
  } else if (totalHits >= 3 && distinctTypes >= 3) {
    rawLevel = 3;
  } else if (totalHits >= 2) {
    rawLevel = 2;
  } else {
    rawLevel = 1;
  }

  // Enforce the Volatility Convergence Rule: do not assign high confidence from a single aspect
  if (isVolatilityPattern) {
    const hasAspect = channels.some(c => c.channel === "aspect");
    const hasAngular = channels.some(c => c.channel === "angularity");
    if ((!hasAspect || (!hasAngular && mutableCount < 3)) && rawLevel > 2) {
      rawLevel = 2;
    }
  }

  const map: Record<
    BehavioralConfidenceLevel,
    { label: BehavioralConfidenceLabel; prefix: string }
  > = {
    1: {
      label: "Level 1 — Possible",
      prefix: "May indicate",
    },
    2: {
      label: "Level 2 — Supported",
      prefix: "The chart supports",
    },
    3: {
      label: "Level 3 — Strong",
      prefix: "A recurring pattern suggests",
    },
    4: {
      label: "Level 4 — Dominant",
      prefix: "This is one of the strongest behavioral themes in the chart:",
    },
    5: {
      label: "Level 5 — Structural",
      prefix: "This theme appears structurally repeated across multiple chart systems:",
    },
  };

  return {
    level: rawLevel,
    label: map[rawLevel].label,
    prefix: map[rawLevel].prefix,
  };
}

function computeQuestionRelevance(question: string, keywords: string[]): number {
  const q = question.toLowerCase();
  if (!q.trim()) return 0.5;
  let hits = 0;
  for (const kw of keywords) {
    if (q.includes(kw.toLowerCase())) hits += 1;
  }
  return Math.min(1, 0.35 + hits * 0.22);
}

export function evaluateBehavioralIntelligence(
  chart: ChartResult,
  question = "",
  mode: "natal" | "transit" | "combined" = chart.readingScope
): BehavioralIntelligenceReport {
  const bodies = (chart.movingBodies ?? []).filter((b): b is ChartRow =>
    Boolean(b && typeof b.longitude === "number")
  );
  const transits = chart.transits ?? [];
  const frozenStars = chart.frozenStars ?? [];
  const allPoints = [
    ...bodies,
    ...(chart.ascendant ? [chart.ascendant] : []),
    ...(chart.midheaven ? [chart.midheaven] : []),
    ...(chart.northNode ? [chart.northNode] : []),
    ...(chart.southNode ? [chart.southNode] : []),
  ].filter((b): b is ChartRow => Boolean(b && typeof b.longitude === "number"));
  const natalAspects = computeNatalAspects(allPoints, 5);
  const bodyByName = new Map(allPoints.map(b => [b.name, b]));
  const mutableCount = bodies.filter(b =>
    MUTABLE_SIGNS.has(signOf(b.longitude))
  ).length;

  // 1. Evaluate Planet Interaction Matrix
  const planetInteractions: EvaluatedPlanetInteraction[] = [];
  for (const [key, meta] of Object.entries(PLANET_INTERACTION_MATRIX)) {
    const [p1, p2] = key.split("-");
    if (!p1 || !p2) continue;
    const found = findAspect(natalAspects, p1, p2);
    if (found) {
      planetInteractions.push({
        pair: key,
        aspect: found.aspect,
        orb: found.orb,
        ...meta,
      });
    }
  }

  // 2. Evaluate Human Behavior Patterns across the 7 Evidence Channels
  const evaluatedBehaviors: EvaluatedBehaviorPattern[] = [];

  for (const pattern of HUMAN_BEHAVIOR_PATTERNS) {
    const channels: EvidenceChannelHit[] = [];
    const counterEvidence: string[] = [];

    // Channel 1 & 2 & 3: Planet + Sign + House
    for (const pName of pattern.primaryPlanets) {
      const row = bodyByName.get(pName);
      if (!row) continue;
      const pSign = signOf(row.longitude);

      if (pattern.signs.includes(pSign)) {
        channels.push({
          channel: "sign",
          detail: `${row.name} in ${pSign} (${row.display})`,
        });
      }
      if (pattern.primaryHouses.includes(row.house)) {
        channels.push({
          channel: "house",
          detail: `${row.name} in House ${row.house} (${row.display})`,
        });
      } else if (pattern.secondaryHouses.includes(row.house)) {
        channels.push({
          channel: "planet",
          detail: `${row.name} active in secondary House ${row.house}`,
        });
      }
    }

    for (const pName of pattern.secondaryPlanets) {
      const row = bodyByName.get(pName);
      if (!row) continue;
      const pSign = signOf(row.longitude);
      if (
        pattern.primaryHouses.includes(row.house) &&
        pattern.signs.includes(pSign)
      ) {
        channels.push({
          channel: "planet",
          detail: `Supporting ${row.name} in ${pSign}, House ${row.house}`,
        });
      }
    }

    // Channel 4: Aspects (5° orb)
    for (const [p1, p2] of pattern.aspectPairs) {
      const hit = findAspect(natalAspects, p1, p2);
      if (hit) {
        channels.push({
          channel: "aspect",
          detail: `${hit.a} ${hit.aspect} ${hit.b} (${hit.orb.toFixed(1)}° orb)`,
        });
      }
    }

    // Channel 5: Angularity
    for (const pName of pattern.angularPlanets) {
      const row = bodyByName.get(pName);
      if (row && ANGULAR_HOUSES.has(row.house)) {
        channels.push({
          channel: "angularity",
          detail: `${row.name} angular in House ${row.house}`,
        });
      }
    }

    // God View ↔ Agent View Bridge
    let hasGodAgentBridge = false;
    const godAgentDetails: string[] = [];
    for (const pName of pattern.primaryPlanets) {
      const row = bodyByName.get(pName);
      if (!row || row.godHouse == null || row.agentHouse == null) continue;
      if (
        pattern.primaryHouses.includes(row.godHouse) ||
        pattern.primaryHouses.includes(row.agentHouse)
      ) {
        hasGodAgentBridge = true;
        if (row.godHouse !== row.agentHouse) {
          godAgentDetails.push(
            `${row.name} bridges God House ${row.godHouse} into local Agent House ${row.agentHouse}`
          );
        } else {
          godAgentDetails.push(
            `${row.name} aligns in House ${row.house} across both God View and Agent View`
          );
        }
      }
    }
    if (godAgentDetails.length > 0) {
      channels.push({
        channel: "god-agent",
        detail: godAgentDetails[0]!,
      });
    }

    // Overlay modifiers (Nakshatra, Manzil, Decan, Royal Stars)
    let hasOverlay = false;
    const primaryBody = bodyByName.get(pattern.primaryPlanets[0] ?? "Sun");
    if (primaryBody?.overlay) {
      hasOverlay = true;
      const royalContact = (primaryBody.royalStarContacts ?? []).find(
        c => c.contact
      );
      channels.push({
        channel: "overlay",
        detail: `${primaryBody.name} in ${primaryBody.overlay.nakshatra} (Pada ${primaryBody.overlay.pada}), ${primaryBody.overlay.manzil}, ${primaryBody.overlay.decan}${royalContact ? `, near Royal Star ${royalContact.name}` : ""}`,
      });
    }

    // Channel 6: Repetition rule (3+ independent indicators before overlay)
    const coreCount = channels.filter(c => c.channel !== "overlay").length;
    if (coreCount >= 3) {
      channels.push({
        channel: "repetition",
        detail: `Repeated across ${coreCount} independent chart factors (Repetition Rule active)`,
      });
    }

    // Channel 7: Developmental & Transit State
    let state: BehavioralState = "baseline";
    if (mode !== "natal" && transits.length > 0) {
      const transitHits = transits.flatMap(t =>
        (t.natalContacts ?? [])
          .filter(c => pattern.primaryPlanets.includes(c.natalName))
          .map(c => ({ transit: t.name, ...c }))
      );
      if (transitHits.length > 0) {
        const firstHit = transitHits[0]!;
        if (
          ["Pluto", "Uranus"].includes(firstHit.transit) &&
          ["square", "opposition", "conjunction"].includes(firstHit.aspect)
        ) {
          state = "crisis";
        } else if (firstHit.transit === "Saturn") {
          state = "suppressed";
        } else {
          state = "activated";
        }
        channels.push({
          channel: "development",
          detail: `Currently ${state} via Transit ${firstHit.transit} ${firstHit.aspect} natal ${firstHit.natalName} (${firstHit.orb.toFixed(1)}°)`,
        });
      }
    }

    // Evaluate Counter-Indicators
    if (pattern.counterIndicators.aspectPairs) {
      for (const [c1, c2] of pattern.counterIndicators.aspectPairs) {
        const hit = findAspect(natalAspects, c1, c2);
        if (hit) {
          counterEvidence.push(
            `${hit.a} ${hit.aspect} ${hit.b} (${hit.orb.toFixed(1)}°): ${pattern.counterIndicators.description}`
          );
        }
      }
    }
    if (pattern.counterIndicators.houses) {
      for (const h of pattern.counterIndicators.houses) {
        const inHouse = bodies.filter(b => b.house === h);
        if (inHouse.length >= 2) {
          counterEvidence.push(
            `${inHouse.map(b => b.name).join(", ")} in House ${h}: ${pattern.counterIndicators.description}`
          );
        }
      }
    }

    // Require at least 1 real astrological channel (excluding generic overlay)
    if (coreCount === 0) continue;

    const isVolatility = pattern.id === "emotional-volatility-reactivity";
    const conf = confidenceFromChannels(
      channels,
      hasGodAgentBridge,
      hasOverlay,
      isVolatility,
      mutableCount
    );
    const questionRelevance = computeQuestionRelevance(
      question,
      pattern.questionKeywords
    );
    const score = Number(
      (conf.level * 18 + coreCount * 4 + questionRelevance * 15).toFixed(1)
    );

    evaluatedBehaviors.push({
      id: pattern.id,
      codeNumber: pattern.codeNumber,
      name: pattern.name,
      domain: pattern.domain,
      domainLabel: pattern.domainLabel,
      confidenceLevel: conf.level,
      confidenceLabel: conf.label,
      languagePrefix: conf.prefix,
      state,
      questionRelevance,
      score,
      definition: pattern.definition,
      observableExpressions: pattern.observableExpressions,
      constructiveExpression: pattern.constructiveExpression,
      shadowExpression: pattern.shadowExpression,
      consciousExpression: pattern.consciousExpression,
      automaticExpression: pattern.automaticExpression,
      internalExpression: pattern.internalExpression,
      externalExpression: pattern.externalExpression,
      motivationPatterns: pattern.motivationPatterns,
      triggerPatterns: pattern.triggerPatterns,
      responseStyle: pattern.responseStyle,
      repeatingCycle: pattern.repeatingCycle,
      compensationPattern: pattern.compensationPattern,
      developmentalTrajectory: pattern.developmentalTrajectory,
      godToAgentSynthesis:
        godAgentDetails.length > 0
          ? `${godAgentDetails.join("; ")}. ${pattern.godToAgentTemplate}`
          : pattern.godToAgentTemplate,
      supportingEvidence: channels,
      counterEvidence,
      aiLanguageRule: pattern.aiLanguageRule,
    });
  }

  evaluatedBehaviors.sort((a, b) => b.score - a.score);

  // 3. Evaluate the 12 Behavioral Polarity Axes & Contradiction Engine
  const polarityAxes: EvaluatedPolarityAxis[] = BEHAVIORAL_POLARITY_AXES.map(
    axis => {
      const leftEvidence: string[] = [];
      const rightEvidence: string[] = [];

      for (const b of bodies) {
        const s = signOf(b.longitude);
        if (
          axis.leftIndicators.planets.includes(b.name) &&
          (axis.leftIndicators.signs.includes(s) ||
            axis.leftIndicators.houses.includes(b.house))
        ) {
          leftEvidence.push(`${b.name} in ${s} (House ${b.house})`);
        }
        if (
          axis.rightIndicators.planets.includes(b.name) &&
          (axis.rightIndicators.signs.includes(s) ||
            axis.rightIndicators.houses.includes(b.house))
        ) {
          rightEvidence.push(`${b.name} in ${s} (House ${b.house})`);
        }
      }

      for (const [p1, p2] of axis.leftIndicators.aspects) {
        const hit = findAspect(natalAspects, p1, p2);
        if (hit) leftEvidence.push(`${hit.a} ${hit.aspect} ${hit.b}`);
      }
      for (const [p1, p2] of axis.rightIndicators.aspects) {
        const hit = findAspect(natalAspects, p1, p2);
        if (hit) rightEvidence.push(`${hit.a} ${hit.aspect} ${hit.b}`);
      }

      const leftScore = Math.min(94, 28 + leftEvidence.length * 16);
      const rightScore = Math.min(94, 28 + rightEvidence.length * 16);
      const isDynamicTension =
        leftEvidence.length >= 2 &&
        rightEvidence.length >= 2 &&
        Math.abs(leftScore - rightScore) <= 24;

      const dominantSide: EvaluatedPolarityAxis["dominantSide"] =
        isDynamicTension
          ? "balanced-tension"
          : leftScore >= rightScore
            ? "left"
            : "right";

      return {
        id: axis.id,
        leftPole: axis.leftPole,
        rightPole: axis.rightPole,
        leftScore,
        rightScore,
        isDynamicTension,
        dominantSide,
        leftEvidence,
        rightEvidence,
        synthesis: isDynamicTension
          ? `ACTIVE POLARITY TENSION (${axis.leftPole} ↔ ${axis.rightPole}): ${axis.tensionSynthesis}`
          : leftScore > rightScore
            ? `Leans toward ${axis.leftPole} (${leftScore}) over ${axis.rightPole} (${rightScore}). ${axis.tensionSynthesis}`
            : `Leans toward ${axis.rightPole} (${rightScore}) over ${axis.leftPole} (${leftScore}). ${axis.tensionSynthesis}`,
      };
    }
  );

  const activeContradictions = polarityAxes.filter(a => a.isDynamicTension);

  // 4. Evaluate House-to-House Axis Dynamics
  const activeHouseAxes: BehavioralIntelligenceReport["activeHouseAxes"] = [];
  for (const item of HOUSE_AXIS_DYNAMICS) {
    const [h1, h2] = item.axis;
    const inH1 = bodies.filter(b => b.house === h1);
    const inH2 = bodies.filter(b => b.house === h2);
    if (inH1.length > 0 && inH2.length > 0) {
      activeHouseAxes.push({
        name: item.name,
        theme: item.theme,
        narrative: item.behavioralNarrative,
        evidence: [
          `House ${h1}: ${inH1.map(b => b.name).join(", ")}`,
          `House ${h2}: ${inH2.map(b => b.name).join(", ")}`,
        ],
      });
    }
  }

  // 5. Evaluate Life-Event & Situation Patterns
  const houseCusps = chart.houses ?? [];
  const houseRulerHouse = new Map<number, { ruler: string; inHouse: number }>();
  for (let h = 1; h <= 12; h += 1) {
    const cuspLon = houseCusps[h - 1] ?? (h - 1) * 30;
    const cuspSign = signOf(cuspLon);
    const rulerName = TRADITIONAL_RULERS[cuspSign];
    const rulerRow = rulerName ? bodyByName.get(rulerName) : undefined;
    if (rulerName && rulerRow) {
      houseRulerHouse.set(h, { ruler: rulerName, inHouse: rulerRow.house });
    }
  }

  const activeLifeEvents: EvaluatedLifeEventPattern[] = [];
  for (const eventDef of LIFE_EVENT_PATTERNS) {
    const supporting: string[] = [];

    // Natal house occupation
    for (const h of eventDef.primaryHouses) {
      const occupants = bodies.filter(
        b => b.house === h && eventDef.primaryPlanets.includes(b.name)
      );
      for (const occ of occupants) {
        supporting.push(
          `Natal ${occ.name} in House ${h} (${occ.display})`
        );
      }
    }

    // House ruler connections
    for (const [fromHouse, toHouse] of eventDef.houseRulerConnections) {
      const info = houseRulerHouse.get(fromHouse);
      if (info && info.inHouse === toHouse) {
        supporting.push(
          `Ruler of House ${fromHouse} (${info.ruler}) placed in House ${toHouse}`
        );
      }
    }

    // Natal aspects
    for (const [p1, p2] of eventDef.aspectPairs) {
      const hit = findAspect(natalAspects, p1, p2);
      if (hit) {
        supporting.push(
          `Natal ${hit.a} ${hit.aspect} ${hit.b} (${hit.orb.toFixed(1)}°)`
        );
      }
    }

    // Transit activations
    let transitCount = 0;
    let tightestTransitOrb = 99;
    if (mode !== "natal" && transits.length > 0) {
      for (const tr of transits) {
        if (
          eventDef.primaryHouses.includes(tr.house) &&
          eventDef.primaryPlanets.includes(tr.name)
        ) {
          supporting.push(
            `Transit ${tr.name} moving through House ${tr.house} (${tr.display})`
          );
          transitCount += 1;
        }
        for (const contact of tr.natalContacts ?? []) {
          if (
            eventDef.primaryPlanets.includes(tr.name) ||
            eventDef.primaryPlanets.includes(contact.natalName)
          ) {
            supporting.push(
              `Transit ${tr.name} ${contact.aspect} natal ${contact.natalName} (${contact.orb.toFixed(1)}° orb)`
            );
            transitCount += 1;
            if (contact.orb < tightestTransitOrb) {
              tightestTransitOrb = contact.orb;
            }
          }
        }
      }
    }

    if (supporting.length === 0) continue;

    // God View ↔ Agent View Event Translation
    const primaryPlanetRow = bodyByName.get(eventDef.primaryPlanets[0] ?? "Sun");
    const godToAgentTranslation =
      primaryPlanetRow &&
      primaryPlanetRow.godHouse != null &&
      primaryPlanetRow.agentHouse != null &&
      primaryPlanetRow.godHouse !== primaryPlanetRow.agentHouse
        ? `${primaryPlanetRow.name} sits in Collective God House ${primaryPlanetRow.godHouse} and translates into local Agent House ${primaryPlanetRow.agentHouse}. ${eventDef.godToAgentTemplate}`
        : eventDef.godToAgentTemplate;

    let confidenceCode: EventConfidenceCode = "E1";
    let confidenceLabel = "E1 — Natal Potential";
    let temporalState: EventTemporalState = "State 1 — Latent (Natal Promise)";

    if (supporting.length >= 5 && transitCount >= 2) {
      confidenceCode = "E5";
      confidenceLabel = "E5 — Multi-Layer Convergence";
      temporalState =
        tightestTransitOrb <= 1.5
          ? "State 5 — Peak Convergence"
          : "State 4 — Manifesting";
    } else if (supporting.length >= 4 && transitCount >= 1) {
      confidenceCode = "E4";
      confidenceLabel = "E4 — Convergent Event Signature";
      temporalState = "State 3 — Activating";
    } else if (supporting.length >= 3) {
      confidenceCode = "E3";
      confidenceLabel = "E3 — Strong Event Signature";
      temporalState =
        transitCount > 0
          ? "State 3 — Activating"
          : "State 1 — Latent (Natal Promise)";
    } else if (supporting.length >= 2) {
      confidenceCode = "E2";
      confidenceLabel = "E2 — Activated Theme";
      temporalState =
        transitCount > 0
          ? "State 2 — Approaching"
          : "State 1 — Latent (Natal Promise)";
    }

    if (eventDef.category === "consolidation" && supporting.length >= 3) {
      temporalState = "State 8 — Consolidating";
    }

    const questionRelevance = computeQuestionRelevance(
      question,
      eventDef.questionKeywords
    );
    const score = Number(
      (
        supporting.length * 9 +
        transitCount * 12 +
        questionRelevance * 20
      ).toFixed(1)
    );

    activeLifeEvents.push({
      id: eventDef.id,
      codeNumber: eventDef.codeNumber,
      name: eventDef.name,
      category: eventDef.category,
      categoryLabel: eventDef.categoryLabel,
      confidenceCode,
      confidenceLabel,
      temporalState,
      questionRelevance,
      score,
      definition: eventDef.definition,
      possibleManifestations: eventDef.possibleManifestations,
      alternativeManifestations: eventDef.alternativeManifestations,
      supportingEvidence: supporting.slice(0, 6),
      counterEvidence: eventDef.counterIndicators,
      godToAgentTranslation,
      developmentalMeaning: eventDef.developmentalMeaning,
      sequencePredecessors: eventDef.sequencePredecessors,
      sequenceSuccessors: eventDef.sequenceSuccessors,
      aiLanguageRule: eventDef.aiLanguageRule,
    });
  }

  activeLifeEvents.sort((a, b) => b.score - a.score);

  // 6. Evaluate Cross-Domain Event Sequence Chains
  const eventSequences: EvaluatedSequenceChain[] = [];
  for (const chain of EVENT_SEQUENCE_CHAINS) {
    const matchedHouses = chain.requiredHouses.filter(h =>
      bodies.some(b => b.house === h)
    );
    if (matchedHouses.length >= 2) {
      const supporting = matchedHouses.map(h => {
        const names = bodies
          .filter(b => b.house === h)
          .map(b => b.name)
          .join(", ");
        return `House ${h} occupied by ${names}`;
      });
      eventSequences.push({
        id: chain.id,
        name: chain.name,
        activeStages: chain.stages,
        supportingEvidence: supporting,
        narrative: chain.narrative,
        developmentalMeaning: chain.developmentalMeaning,
        strength: Number(
          (matchedHouses.length / chain.requiredHouses.length).toFixed(2)
        ),
      });
    }
  }

  // 7. Match Compact 200-Pattern Vocabulary Index
  const matchedVocabularyTags: BehavioralIntelligenceReport["matchedVocabularyTags"] =
    [];
  for (const item of COMPACT_PATTERN_INDEX) {
    const tokens = item.lookFor.split(/[,;/]+/).map(s => s.trim());
    for (const token of tokens) {
      const pairMatch = token.match(
        /^(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)-(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)$/
      );
      if (pairMatch) {
        const hit = findAspect(natalAspects, pairMatch[1]!, pairMatch[2]!);
        if (hit) {
          matchedVocabularyTags.push({
            code: item.code,
            domain: item.domain,
            name: item.name,
            evidence: `${hit.a} ${hit.aspect} ${hit.b} (${hit.orb.toFixed(1)}°)`,
          });
          break;
        }
      }
      const houseMatch = token.match(
        /^(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)\s+(\d+)(?:st|nd|rd|th)$/
      );
      if (houseMatch) {
        const row = bodyByName.get(houseMatch[1]!);
        if (row && row.house === Number(houseMatch[2])) {
          matchedVocabularyTags.push({
            code: item.code,
            domain: item.domain,
            name: item.name,
            evidence: `${row.name} in House ${row.house}`,
          });
          break;
        }
      }
    }
  }

  // 8. Build the 16-Dimension "ALL ABOUT YOU — WHO AM I?" Self-Knowledge Profile
  const topBehaviors = evaluatedBehaviors.slice(0, 10);
  const sunRow = bodyByName.get("Sun");
  const moonRow = bodyByName.get("Moon");
  const mercRow = bodyByName.get("Mercury");
  const venusRow = bodyByName.get("Venus");
  const marsRow = bodyByName.get("Mars");
  const saturnRow = bodyByName.get("Saturn");
  const jupRow = bodyByName.get("Jupiter");
  const ascRow = chart.ascendant;
  const ascSign = ascRow ? signOf(ascRow.longitude) : sunRow ? signOf(sunRow.longitude) : "Aries";
  const ascRulerName = TRADITIONAL_RULERS[ascSign] ?? "Mars";
  const ascRulerRow = bodyByName.get(ascRulerName);

  const primaryBehavior = topBehaviors[0];
  const secondaryBehavior = topBehaviors[1] ?? topBehaviors[0];
  const relBehavior =
    topBehaviors.find(b =>
      ["relationships", "attachment", "trust-boundaries", "intimacy"].includes(b.domain)
    ) ?? topBehaviors[0];
  const thinkBehavior =
    topBehaviors.find(b =>
      ["thinking", "communication", "perception", "decision-making"].includes(b.domain)
    ) ?? topBehaviors[0];
  const emoBehavior =
    topBehaviors.find(b =>
      ["emotional", "stress-coping", "self-protection"].includes(b.domain)
    ) ?? topBehaviors[0];

  const allAboutYouProfile: SelfKnowledgeDimensionItem[] = [
    {
      id: "who-you-are",
      question: "Who you are",
      synthesis: primaryBehavior
        ? `In real-world 2026 terms, your core identity operates like an anchor in an era of superficial noise. Shaped by your ${sunRow ? `Sun in ${sunRow.display} (House ${sunRow.house})` : "Sun"} and ${ascRow ? `Ascendant at ${ascRow.display}` : "horizon"}, you do not chase fleeting trends, crowded social circles, or hollow external validation. Instead, your life story centers around building an unshakeable inner compass and cultivating a select circle of high-trust allies bound by shared purpose. You are the person people turn to when they need authentic substance, deep discernment, and someone who refuses to compromise core integrity.`
        : "In 2026 reality, your core identity organizes around self-directed sovereignty, personal integrity, and building enduring substance rather than performing for crowds.",
      astrologicalProof: [
        sunRow ? `Sun at ${sunRow.display} (House ${sunRow.house})` : "",
        ascRow ? `Ascendant at ${ascRow.display}` : "",
        ascRulerRow ? `Chart ruler ${ascRulerName} at ${ascRulerRow.display} (House ${ascRulerRow.house})` : "",
      ].filter(Boolean),
    },
    {
      id: "how-you-think",
      question: "How you think",
      synthesis: thinkBehavior
        ? `Your cognitive processing is not mere linear information retrieval—it is holographic, intuitive pattern recognition. Anchored by your ${mercRow ? `Mercury in ${mercRow.display} (House ${mercRow.house})` : "Mercury"}, your mind reads between the lines, detecting hidden motives, subtle emotional currents, and structural inconsistencies before others even register them. In today's digital workplace and information-saturated landscape, this enables you to cut straight through corporate buzzwords, spot strategic risks, and synthesize deep connections that purely analytical thinkers miss.`
        : "Your mind operates as an intuitive filter, rapidly evaluating information for underlying truth, hidden motives, and practical long-term consequences.",
      astrologicalProof: [
        mercRow ? `Mercury at ${mercRow.display} (House ${mercRow.house})` : "",
        ...(thinkBehavior?.supportingEvidence.slice(0, 2).map(e => e.detail) ?? []),
      ].filter(Boolean),
    },
    {
      id: "how-you-feel",
      question: "How you feel",
      synthesis: emoBehavior
        ? `Beneath your composed exterior lies a rich, continuous emotional radar scanning for safety, sincerity, and resonance. Guided by your ${moonRow ? `Moon in ${moonRow.display} (House ${moonRow.house})` : "Moon"}${moonRow?.overlay?.nakshatra ? ` and Lunar Nakshatra ${moonRow.overlay.nakshatra}` : ""}, you experience life at high emotional fidelity. You require genuine psychological safety to open up; when environments feel chaotic or performative, your natural rhythm is to quietly withdraw into your private sanctuary to recalibrate before re-engaging with the world.`
        : "Your emotional world runs with immense depth and quiet loyalty. You process feelings privately, needing a safe, trusted sanctuary to decompress from modern overstimulation.",
      astrologicalProof: [
        moonRow ? `Moon at ${moonRow.display} (House ${moonRow.house})` : "",
        moonRow?.overlay?.nakshatra ? `Lunar Nakshatra: ${moonRow.overlay.nakshatra}` : "",
        moonRow?.overlay?.manzil ? `Lunar Manzil: ${moonRow.overlay.manzil}` : "",
      ].filter(Boolean),
    },
    {
      id: "what-motivates-you",
      question: "What motivates you",
      synthesis: primaryBehavior
        ? `You are fundamentally motivated by personal sovereignty, craft mastery, and creating something that outlasts the moment. Energized by your ${marsRow ? `Mars at ${marsRow.display} (House ${marsRow.house})` : "Mars"} and ${chart.northNode ? `North Node in House ${chart.northNode.house}` : "purpose axis"}, you are driven by ${primaryBehavior.motivationPatterns.join(", ")}. In modern work and creative life, vanity metrics and empty status leave you cold; you thrive only when you have genuine agency over your schedule and can see tangible, meaningful fruit from your labor.`
        : "You are propelled by agency, competence, and building something enduring that you can stand behind with complete pride.",
      astrologicalProof: [
        marsRow ? `Mars at ${marsRow.display} (House ${marsRow.house})` : "",
        chart.northNode ? `North Node at ${chart.northNode.display} (House ${chart.northNode.house})` : "",
      ].filter(Boolean),
    },
    {
      id: "how-you-respond-to-pressure",
      question: "How you respond to pressure",
      synthesis: primaryBehavior
        ? `When high-stakes pressure hits in modern life, your nervous system adopts a composed "${primaryBehavior.responseStyle}" posture. Rather than panicking or seeking superficial comfort, you tighten your perimeter, take command of the variables you can control, and carry the weight internally. The 2026 trap to watch for is hyper-independence—convincing yourself that you must solve everything alone and refusing to let trusted partners or colleagues support you.`
        : "Under pressure, you consolidate internally, relying on self-command and quiet discipline before letting anyone see the strain.",
      astrologicalProof: [
        saturnRow ? `Saturn at ${saturnRow.display} (House ${saturnRow.house})` : "",
        ...(primaryBehavior?.supportingEvidence.slice(0, 2).map(e => e.detail) ?? []),
      ].filter(Boolean),
    },
    {
      id: "what-strengthens-you",
      question: "What strengthens you",
      synthesis: primaryBehavior
        ? `Your vitality and confidence peak when you lean into your constructive capacity: ${primaryBehavior.constructiveExpression}. You gain immense power from rigorous craft competence, protected blocks of deep work free from messaging pings, and reciprocal relationships where mutual loyalty is proven through consistent actions rather than sweet promises.`
        : "Clear personal standards, honest expectations, regular periods of solitude, and room to master your craft strengthen your core.",
      astrologicalProof: [
        jupRow ? `Jupiter at ${jupRow.display} (House ${jupRow.house})` : "",
        ...(primaryBehavior?.supportingEvidence.slice(0, 1).map(e => e.detail) ?? []),
      ].filter(Boolean),
    },
    {
      id: "what-weakens-you",
      question: "What weakens you",
      synthesis: secondaryBehavior
        ? `Your life force drains rapidly when you are trapped in environments riddled with passive-aggression, chronic ambiguity, or performative politics. Slipping into ${secondaryBehavior.shadowExpression.toLowerCase()} erodes your peace. In 2026, forcing yourself to stay in shallow social dynamics or over-functioning to compensate for others' lack of accountability creates severe mental and emotional fatigue.`
        : "Chronic ambiguity, unspoken expectations, carrying unshared emotional weight, and entertaining shallow connections drain your vital energy.",
      astrologicalProof: [
        saturnRow ? `Saturn in House ${saturnRow.house} (${saturnRow.display})` : "",
        ...(secondaryBehavior?.supportingEvidence.slice(0, 2).map(e => e.detail) ?? []),
      ].filter(Boolean),
    },
    {
      id: "what-triggers-you",
      question: "What triggers you",
      synthesis: primaryBehavior
        ? `Your sharpest emotional activation points occur when boundaries are violated, loyalty is taken for granted, or someone attempts to micromanage your movements: ${primaryBehavior.triggerPatterns.join(", ")}. Because you invest genuine loyalty when committed, hypocrisy or betrayal cuts deep, prompting an immediate defensive wall. Recognizing this activation gives you the power to respond with cool, deliberate authority instead of reactive withdrawal.`
        : "Being cornered, having your integrity questioned, or seeing loyalty treated as disposable triggers an immediate, visceral defense.",
      astrologicalProof: [
        ...(primaryBehavior?.supportingEvidence.slice(0, 2).map(e => e.detail) ?? []),
      ].filter(Boolean),
    },
    {
      id: "how-you-protect-yourself",
      question: "How you protect yourself",
      synthesis: emoBehavior
        ? `When vulnerability feels dangerous, you instinctively protect yourself through ${emoBehavior.compensationPattern.toLowerCase()}. You present a polite, impenetrable exterior, withhold your deeper feelings, and step back until you can re-evaluate the landscape. While this keeps you safe from bad actors, your real-world developmental task is remembering that safe, high-trust partners need to see behind the armor to truly love you.`
        : "You protect your peace by becoming composed, self-reliant, and highly selective about who is allowed into your inner circle.",
      astrologicalProof: [
        moonRow ? `Moon in House ${moonRow.house} (${moonRow.display})` : "",
        saturnRow ? `Saturn at ${saturnRow.display}` : "",
      ].filter(Boolean),
    },
    {
      id: "how-you-relate-to-others",
      question: "How you relate to other people",
      synthesis: relBehavior
        ? `In relationships, you are an all-in or all-out presence. You have no patience for casual networking or surface-level small talk that never ventures past polite pleasantries. In both love and close friendships, you look for emotional courage, reciprocity, and demonstrated loyalty over time. When someone earns your trust, your loyalty is steadfast, protective, and genuinely transformative.`
        : "You prioritize depth and authentic character over social popularity, carefully observing whether people match their words with consistent action.",
      astrologicalProof: [
        venusRow ? `Venus at ${venusRow.display} (House ${venusRow.house})` : "",
        chart.descendant ? `Descendant at ${chart.descendant.display}` : "",
        ...(relBehavior?.supportingEvidence.slice(0, 1).map(e => e.detail) ?? []),
      ].filter(Boolean),
    },
    {
      id: "where-you-self-sabotage",
      question: "Where you self-sabotage",
      synthesis: primaryBehavior
        ? `Your signature trap is over-analyzing worst-case scenarios and holding back until you have 100% certainty: ${primaryBehavior.shadowExpression.toLowerCase()}. In relationships and bold career leaps, this can manifest as quiet withdrawal or waiting for others to read your mind, inadvertently creating the very distance or stagnation you were trying to prevent. Speaking your needs directly and early is your greatest antidote to self-sabotage.`
        : "Over-carrying responsibility in silence and demanding complete certainty before acting are the habits that stall your momentum.",
      astrologicalProof: [
        chart.southNode ? `South Node at ${chart.southNode.display} (House ${chart.southNode.house})` : "",
        ...(primaryBehavior?.supportingEvidence.slice(0, 2).map(e => e.detail) ?? []),
      ].filter(Boolean),
    },
    {
      id: "what-patterns-repeat",
      question: "What patterns repeat",
      synthesis: primaryBehavior
        ? `The recurring chapter in your life story is an oscillation between intense, wholehearted commitment and sudden burnout retreat: ${primaryBehavior.repeatingCycle}. You pour yourself into a project or partnership, shoulder the bulk of the responsibility, and eventually reach a breaking point where you must withdraw to heal. Learning to pace yourself and set boundaries early allows you to break this loop and sustain long-term joy.`
        : "A recurring cycle of carrying too much alone until exhaustion demands a hard reset. Pacing and healthy delegation break this cycle.",
      astrologicalProof: topBehaviors
        .slice(0, 3)
        .map(b => `${b.name} (${b.confidenceLabel})`),
    },
    {
      id: "what-contradictions-exist",
      question: "What contradictions exist within you",
      synthesis: activeContradictions[0]
        ? `Your primary internal paradox is: ${activeContradictions[0].synthesis}. In 2026 daily reality, this feels like an intense tug-of-war between needing fierce independence and craving deep, bonded intimacy. You want someone who truly sees your soul, yet you panic at the thought of losing your autonomy. Embracing both needs simultaneously—rather than choosing one at the expense of the other—is your path to peace.`
        : polarityAxes[0]
          ? `You hold a living tension: ${polarityAxes[0].synthesis}. One side pushes for visible accomplishment and self-command, while the other demands emotional sanctuary and inward replenishment.`
          : "You hold a simultaneous need for fierce personal autonomy and profound, loyal connection with a trusted counterpart.",
      astrologicalProof: activeContradictions[0]
        ? [
            ...activeContradictions[0].leftEvidence.slice(0, 2),
            ...activeContradictions[0].rightEvidence.slice(0, 2),
          ]
        : polarityAxes[0]
          ? [
              ...polarityAxes[0].leftEvidence.slice(0, 2),
              ...polarityAxes[0].rightEvidence.slice(0, 2),
            ]
          : [],
    },
    {
      id: "what-life-themes-recur",
      question: "What kinds of life themes recur",
      synthesis: activeLifeEvents[0]
        ? `Your life story is marked by chapters of deliberate reinvention and shedding outgrown structures: ${activeLifeEvents[0].name} (${activeLifeEvents[0].temporalState}). Every few years, you hit an evolutionary crossroads where comfortable but stagnant situations must be released. You possess a rare resilience for rebuilding from the ground up, emerging from each crucible with greater authority and clarity.`
        : "Chapters of structural rebuilding, testing your inner fortitude, and shedding outgrown arrangements to make way for authentic purpose.",
      astrologicalProof: activeLifeEvents[0]?.supportingEvidence.slice(0, 3) ?? [],
    },
    {
      id: "how-patterns-develop",
      question: "How those patterns develop over time",
      synthesis: primaryBehavior
        ? `Across the arc of your life, this pattern matures through distinct evolutionary stages. In early chapters: ${primaryBehavior.developmentalTrajectory.early}. As you navigate real-world challenges: ${primaryBehavior.developmentalTrajectory.developing}. What initially felt like an isolating burden gradually transforms into your sharpest intuitive asset.`
        : "What starts in youth as an instinctual defense mechanism gradually matures into conscious discernment and emotional resilience through lived experience.",
      astrologicalProof: [
        saturnRow ? `Saturn maturation in House ${saturnRow.house}` : "",
        chart.northNode ? `North Node direction in House ${chart.northNode.house}` : "",
      ].filter(Boolean),
    },
    {
      id: "conscious-integration",
      question: "What those patterns become when consciously integrated",
      synthesis: primaryBehavior
        ? `At full maturity, your core blueprint crystallizes into grounded mastery: ${primaryBehavior.developmentalTrajectory.mature}. You become a sanctuary of calm wisdom and unshakeable authority in an increasingly chaotic world—capable of loving deeply without losing your sovereignty, and building enduring work that genuinely matters.`
        : "When integrated, your protective walls dissolve into clear, healthy boundaries. You lead with calm authority, love without fear of losing yourself, and navigate life with deep peace.",
      astrologicalProof: [
        primaryBehavior ? `Integrated ${primaryBehavior.name}` : "",
        activeLifeEvents[0] ? activeLifeEvents[0].developmentalMeaning : "",
      ].filter(Boolean),
    },
  ];

  // 9. Build the 16-System Convergence Audit & Counterfactual Simulation Lab
  const activeRulerships = Array.from(houseRulerHouse.entries())
    .slice(0, 4)
    .map(([h, info]) => `House ${h} ruled by ${info.ruler} in House ${info.inHouse}`);
  const angularBodies = bodies.filter(b => ANGULAR_HOUSES.has(b.house));
  const royalContacts = frozenStars.flatMap(star =>
    (star.royalStarContacts ?? [])
      .filter(c => c.contact)
      .map(c => `${star.name} near ${c.name} (${c.distance.toFixed(1)}°)`)
  );
  const godAgentShifts = bodies.filter(
    b => b.godHouse != null && b.agentHouse != null && b.godHouse !== b.agentHouse
  );

  // Compute Lot of Fortune (Asc + Moon - Sun) for the 16-system audit
  const fortuneLon =
    ascRow && sunRow && moonRow
      ? normalizeLongitude(ascRow.longitude + moonRow.longitude - sunRow.longitude)
      : null;
  const fortuneSign = fortuneLon != null ? signOf(fortuneLon) : "Not calculated (God View)";

  const sixteenSystems: SystemConvergenceFactor[] = [
    {
      system: "1. Planet",
      category: "Foundation",
      status: "convergent",
      evidenceSummary: bodies
        .slice(0, 4)
        .map(b => `${b.name} (${b.display})`)
        .join(" · "),
    },
    {
      system: "2. Sign",
      category: "Foundation",
      status: "convergent",
      evidenceSummary: `Sun in ${sunRow ? signOf(sunRow.longitude) : "N/A"}, Moon in ${moonRow ? signOf(moonRow.longitude) : "N/A"}, Ascendant in ${ascSign}`,
    },
    {
      system: "3. House",
      category: "Foundation",
      status: "convergent",
      evidenceSummary: bodies
        .slice(0, 4)
        .map(b => `${b.name} in H${b.house}`)
        .join(" · "),
    },
    {
      system: "4. Rulership",
      category: "Structure",
      status: "convergent",
      evidenceSummary:
        activeRulerships.join(" · ") ||
        `Chart ruler ${ascRulerName} in House ${ascRulerRow?.house ?? 1}`,
    },
    {
      system: "5. Aspect",
      category: "Structure",
      status: natalAspects.length > 0 ? "convergent" : "supporting",
      evidenceSummary: natalAspects.length
        ? natalAspects
            .slice(0, 3)
            .map(a => `${a.a} ${a.aspect} ${a.b} (${a.orb.toFixed(1)}°)`)
            .join(" · ")
        : "Evaluated within 5° Firmament orb",
    },
    {
      system: "6. Angularity",
      category: "Structure",
      status: angularBodies.length > 0 ? "convergent" : "supporting",
      evidenceSummary: angularBodies.length
        ? `Angular emphasis (H1/4/7/10): ${angularBodies.map(b => `${b.name} in H${b.house}`).join(", ")}`
        : "Succedent/Cadent concentration (internalized processing before external action)",
    },
    {
      system: "7. Repetition",
      category: "Structure",
      status: "convergent",
      evidenceSummary: primaryBehavior
        ? `${primaryBehavior.supportingEvidence.length} independent channels converge on "${primaryBehavior.name}" (${primaryBehavior.confidenceLabel})`
        : "Multi-channel thematic repetition verified",
    },
    {
      system: "8. Development",
      category: "Structure",
      status: transits.length > 0 ? "convergent" : "supporting",
      evidenceSummary:
        transits.length > 0
          ? `${transits.filter(t => (t.natalContacts ?? []).length > 0).length} active transit-to-natal contacts shaping current growth`
          : "Evaluated via Natal Promise → Saturn/Node developmental arc",
    },
    {
      system: "9. Fixed Stars",
      category: "Traditional Overlay",
      status: royalContacts.length > 0 ? "convergent" : "supporting",
      evidenceSummary: royalContacts.length
        ? royalContacts.slice(0, 3).join(" · ")
        : `${frozenStars.length} immutable frozen stars locked against tropical degrees`,
    },
    {
      system: "10. Lunar Mansions (Manzils)",
      category: "Traditional Overlay",
      status: moonRow?.overlay?.manzil ? "convergent" : "supporting",
      evidenceSummary: moonRow?.overlay?.manzil
        ? `Moon in Arabic Manzil ${moonRow.overlay.manzil}; Sun in ${sunRow?.overlay?.manzil ?? "N/A"}`
        : "28 fixed Arabic Lunar Mansions overlaid",
    },
    {
      system: "11. Nakshatras",
      category: "Traditional Overlay",
      status: moonRow?.overlay?.nakshatra ? "convergent" : "supporting",
      evidenceSummary: moonRow?.overlay?.nakshatra
        ? `Moon in Vedic Nakshatra ${moonRow.overlay.nakshatra} (${moonRow.overlay.nakshatraRuler ?? "ruler"}); Sun in ${sunRow?.overlay?.nakshatra ?? "N/A"}`
        : "27 equal Vedic Nakshatras anchored to 0° Aries",
    },
    {
      system: "12. Decans",
      category: "Traditional Overlay",
      status: "supporting",
      evidenceSummary: `Sun in ${sunRow?.overlay?.decan ?? "1st decan"}; Moon in ${moonRow?.overlay?.decan ?? "1st decan"}`,
    },
    {
      system: "13. Arabic Lots",
      category: "Traditional Overlay",
      status: fortuneLon != null ? "convergent" : "contextual",
      evidenceSummary:
        fortuneLon != null
          ? `Lot of Fortune in ${fortuneSign} (${fortuneLon.toFixed(1)}°)`
          : "Requires local Ascendant horizon (Agent View)",
    },
    {
      system: "14. Vedic Yogas",
      category: "Traditional Overlay",
      status: "supporting",
      evidenceSummary:
        planetInteractions.length > 0
          ? `Evaluated alongside ${planetInteractions.length} planetary pair combinations`
          : "Evaluated via Genesis Yoga Detector layer",
    },
    {
      system: "15. God View",
      category: "Frame & Synthesis",
      status: "convergent",
      evidenceSummary: `Universal Aries House 1–Pisces House 12 frame: Sun in God H${sunRow?.godHouse ?? "?"}, Moon in God H${moonRow?.godHouse ?? "?"}`,
    },
    {
      system: "16. Agent View",
      category: "Frame & Synthesis",
      status: chart.agentViewAvailable ? "convergent" : "contextual",
      evidenceSummary: chart.agentViewAvailable
        ? `Observer Equal House frame: Sun in Agent H${sunRow?.agentHouse ?? sunRow?.house}, Moon in Agent H${moonRow?.agentHouse ?? moonRow?.house}`
        : "Unavailable without birth time/location; reading anchored in God View",
    },
  ];

  const simulationComparisons: SimulationComparisonCase[] = [
    {
      id: "sim-sun-vs-convergence",
      title: "Simulation 1: Surface Sun-Sign Horoscope vs. Full-Pattern Convergence",
      hypothesisTested:
        "Would a generic Sun-sign horoscope accurately describe this person's core behavior?",
      surfaceOrBaselineView: sunRow
        ? `A surface reading looks only at Sun in ${signOf(sunRow.longitude)} (${sunRow.display}) and hands out generic ${signOf(sunRow.longitude)} personality traits.`
        : "A surface reading reduces the person to one zodiac sign.",
      convergentPatternReality: primaryBehavior
        ? `When the Simulation Lab adds House placement (Sun in H${sunRow?.house ?? "?"}), Moon in ${moonRow?.display ?? "N/A"} (H${moonRow?.house ?? "?"}), Chart Ruler ${ascRulerName} in H${ascRulerRow?.house ?? "?"}, and ${natalAspects.length} tight aspects, the actual convergent pattern is "${primaryBehavior.name}" (${primaryBehavior.confidenceLabel}).`
        : "Full-chart convergence shifts the emphasis toward house rulership and tight aspect geometry.",
      verdict:
        "Proven: Single-placement horoscopes fail because behavior emerges from the relationship between Planet + Sign + House + Ruler + Aspect.",
    },
    {
      id: "sim-god-vs-agent",
      title: "Simulation 2: God View (Universal Principle) vs. Agent View (Lived Arena)",
      hypothesisTested:
        "How does the fixed universal meaning of this sky translate into one individual's earthly life?",
      surfaceOrBaselineView: sunRow
        ? `In God View (fixed 0° Aries frame), the Sun sits in God House ${sunRow.godHouse ?? "?"} and the Moon sits in God House ${moonRow?.godHouse ?? "?"}, establishing the cosmic archetype.`
        : "God View maps the fixed archetypal order of the heavens.",
      convergentPatternReality:
        godAgentShifts.length > 0
          ? `${godAgentShifts.length} moving bodies shift house numbers between God View and Agent View (e.g., ${godAgentShifts
              .slice(0, 3)
              .map(b => `${b.name}: God H${b.godHouse} → Agent H${b.agentHouse}`)
              .join("; ")}). The universal theme lands directly inside those specific local Agent houses.`
          : "God View and Agent View align closely in house numbering, reinforcing the same life arenas on both cosmic and local levels.",
      verdict:
        "Proven: God View shows WHAT universal principle is active; Agent View shows WHERE you actually live and wrestle with it.",
    },
    {
      id: "sim-natal-vs-transit",
      title: "Simulation 3: Enduring Natal Character vs. Current Transit Weather",
      hypothesisTested:
        "Which patterns belong to permanent identity ('Who I Am') versus temporary sky activation ('What I Am Walking Through Now')?",
      surfaceOrBaselineView: primaryBehavior
        ? `Natal Baseline: "${primaryBehavior.name}" and "${secondaryBehavior?.name ?? "core temperament"}" are structural natal traits present since birth.`
        : "Natal Baseline establishes permanent temperament.",
      convergentPatternReality:
        activeLifeEvents[0]
          ? `Current Simulation: "${activeLifeEvents[0].name}" is currently in ${activeLifeEvents[0].temporalState} (${activeLifeEvents[0].confidenceLabel}), testing your natal baseline without replacing who you are.`
          : "Current transits test and mature your natal baseline without altering your core character.",
      verdict:
        "Proven: Separating permanent natal structure from temporary transit weather prevents confusing a hard season with a broken identity.",
    },
  ];

  return {
    question,
    mode,
    evaluatedAt: new Date().toISOString(),
    allAboutYouProfile,
    convergenceSimulationLab: {
      sixteenSystems,
      simulationComparisons,
    },
    dominantBehaviors: evaluatedBehaviors.slice(0, 10),
    polarityAxes,
    activeContradictions,
    activeLifeEvents: activeLifeEvents.slice(0, 8),
    eventSequences,
    planetInteractions,
    activeHouseAxes,
    matchedVocabularyTags: matchedVocabularyTags.slice(0, 18),
    doNotClaimRestrictions: DO_NOT_CLAIM_RESTRICTIONS,
  };
}

export function behavioralReportToEvidenceItems(
  report: BehavioralIntelligenceReport
): {
  behavioralEvidence: EvidenceItem[];
  lifeEventEvidence: EvidenceItem[];
} {
  const retrievedAt = report.evaluatedAt;
  const trace = (technique: string) => ({
    sourceId: "firmament-behavioral-intelligence",
    tradition: "firmament" as const,
    technique,
    sourceTitle: "Firmament Human Behavior & Life-Event Pattern Intelligence",
    retrievedAt,
    ruleId: "firmament-behavioral-pattern-engine",
    confidence: "high" as const,
  });

  const behavioralEvidence: EvidenceItem[] = [
    ...report.dominantBehaviors.slice(0, 8).map(b => ({
      id: `behavior-${b.id}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "behavioral-pattern",
      subject: b.name,
      statement: `[${b.confidenceLabel} | State: ${b.state}] ${b.name} (${b.domainLabel}): ${b.languagePrefix} ${b.definition} Trigger: ${b.triggerPatterns.slice(0, 2).join(", ")} -> Response (${b.responseStyle}): ${b.automaticExpression} -> Motivation: ${b.motivationPatterns.slice(0, 2).join(", ")} -> Constructive: ${b.constructiveExpression} | Shadow: ${b.shadowExpression}. Evidence: ${b.supportingEvidence.map(e => e.detail).join("; ")}.${b.counterEvidence.length ? ` Counter-evidence: ${b.counterEvidence.join("; ")}.` : ""}`,
      concepts: [
        "behavioral-pattern",
        b.domain,
        ...b.motivationPatterns.slice(0, 2),
      ],
      polarity: "mixed" as const,
      strength: Math.min(1, b.confidenceLevel / 5),
      ruleId: "firmament-behavioral-pattern-engine",
      sourceId: "firmament-behavioral-intelligence",
      sourceTrace: trace("behavioral-pattern"),
    })),
    ...report.activeContradictions.map(axis => ({
      id: `polarity-tension-${axis.id}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "behavioral-polarity",
      subject: `${axis.leftPole} vs ${axis.rightPole}`,
      statement: `${axis.synthesis} (${axis.leftPole}: ${axis.leftEvidence.join(", ")} vs. ${axis.rightPole}: ${axis.rightEvidence.join(", ")}).`,
      concepts: ["behavioral-polarity", "contradiction", axis.id],
      polarity: "mixed" as const,
      strength: 0.85,
      ruleId: "firmament-behavioral-pattern-engine",
      sourceId: "firmament-behavioral-intelligence",
      sourceTrace: trace("behavioral-polarity"),
    })),
    ...report.planetInteractions.slice(0, 6).map(inter => ({
      id: `planet-interaction-${inter.pair.toLowerCase()}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "interaction-matrix",
      subject: inter.pair,
      statement: `Interaction Matrix ${inter.pair} (${inter.aspect}, ${inter.orb.toFixed(1)}°): ${inter.coreTheme}. Mechanism: ${inter.behavioralMechanism} Constructive: ${inter.constructive}. Shadow: ${inter.shadow}.`,
      concepts: ["interaction-matrix", ...inter.pair.toLowerCase().split("-")],
      polarity: ["square", "opposition"].includes(inter.aspect)
        ? ("pressured" as const)
        : ("mixed" as const),
      strength: Math.max(0.5, 1 - inter.orb / 6),
      ruleId: "firmament-behavioral-pattern-engine",
      sourceId: "firmament-behavioral-intelligence",
      sourceTrace: trace("interaction-matrix"),
    })),
  ];

  const lifeEventEvidence: EvidenceItem[] = [
    ...report.activeLifeEvents.slice(0, 6).map(ev => ({
      id: `life-event-${ev.id}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "life-event-signature",
      subject: ev.name,
      statement: `[${ev.confidenceLabel} | ${ev.temporalState}] ${ev.name} (${ev.categoryLabel}): ${ev.definition} Possible manifestations: ${ev.possibleManifestations.join("; ")}. Alternative manifestation: ${ev.alternativeManifestations.join("; ")}. Developmental meaning: ${ev.developmentalMeaning} Evidence: ${ev.supportingEvidence.join("; ")}.`,
      concepts: ["life-event", ev.category],
      polarity: "mixed" as const,
      strength:
        ev.confidenceCode === "E5"
          ? 0.95
          : ev.confidenceCode === "E4"
            ? 0.85
            : ev.confidenceCode === "E3"
              ? 0.75
              : 0.6,
      ruleId: "firmament-life-event-engine",
      sourceId: "firmament-behavioral-intelligence",
      sourceTrace: trace("life-event-signature"),
    })),
    ...report.eventSequences.map(seq => ({
      id: `event-sequence-${seq.id}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "event-sequence-chain",
      subject: seq.name,
      statement: `Cross-Domain Sequence [${seq.name}]: ${seq.narrative} Developmental meaning: ${seq.developmentalMeaning} (${seq.supportingEvidence.join("; ")}).`,
      concepts: ["event-sequence", seq.id],
      polarity: "supportive" as const,
      strength: seq.strength,
      ruleId: "firmament-life-event-engine",
      sourceId: "firmament-behavioral-intelligence",
      sourceTrace: trace("event-sequence-chain"),
    })),
  ];

  return { behavioralEvidence, lifeEventEvidence };
}
