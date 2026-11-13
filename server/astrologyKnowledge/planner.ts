import type { KnowledgePlan } from "./types";

export function planKnowledge(
  question: string,
  mode: "natal" | "transit" | "combined" = "combined"
): KnowledgePlan {
  const q = question.toLowerCase();
  const relationship =
    /relationship|marriage|partner|dating|love|ex\b|belong|friend/.test(q);
  const career =
    /career|work|job|profession|purpose|business|success|money|income|wealth/.test(
      q
    );
  const home = /move|moving|home|house|relocat|family|property/.test(q);
  const emotional =
    /feel|emotion|anxious|mood|why now|healing|inner|pattern|repeat/.test(q);
  const timing =
    mode !== "natal" ||
    /when|timing|soon|next|today|current|right time|60 days|future/.test(q);
  const domains = ["western", "vedic", "arabic"];
  const subjects = new Set<string>(["Sun", "Moon", "Ascendant"]);
  const techniques = new Set<string>([
    "aspects",
    "dignity",
    "nakshatra",
    "manzil",
    "astro-engine",
    "pattern-recognition",
    "behavioral-pattern",
    "life-event-signature",
    "dasha",
    "ashtakavarga",
  ]);
  const reasons: string[] = [
    "Genesis is a mandatory core evidence layer: Astro Engine, Pattern Engine, and Yoga Detector execute and are reviewed before question-specific prioritization.",
    "The question planner controls emphasis only; it may classify Genesis findings as primary, supporting, contextual, or non-decisive, but it may not bypass or downgrade the Genesis layer itself.",
  ];
  if (relationship) {
    [
      "7th-house",
      "7th-lord",
      "Venus",
      "Moon",
      "relationship-significators",
      "D9",
    ].forEach(value => subjects.add(value));
    [
      "house-lord",
      "varga",
      "mind-soul-spirit",
      "pattern-recognition",
      "archetype",
      "vedic-yoga",
    ].forEach(value => techniques.add(value));
    reasons.push(
      "Relationship language activates the partnership axis, Venus, Moon, and relevant Vedic relationship evidence."
    );
  }
  if (career) {
    [
      "2nd-house",
      "6th-house",
      "10th-house",
      "10th-lord",
      "11th-house",
      "Saturn",
      "Jupiter",
      "D10",
    ].forEach(value => subjects.add(value));
    [
      "varga",
      "mind-soul-spirit",
      "pattern-recognition",
      "planetary-strength",
    ].forEach(value => techniques.add(value));
    reasons.push(
      "Career or money language activates livelihood houses, rulers, significators, and D10 when available."
    );
  }
  if (home) {
    ["4th-house", "4th-lord", "9th-house", "12th-house", "Moon"].forEach(
      value => subjects.add(value)
    );
    techniques.add("house-lord");
    reasons.push(
      "Home or movement language activates foundations, relocation axes, Moon, and house rulers."
    );
  }
  if (emotional) {
    ["Moon", "natal-Moon", "current-transits", "Ascendant"].forEach(value =>
      subjects.add(value)
    );
    reasons.push(
      "Emotional language prioritizes the Moon, angles, and current activation rather than the whole chart equally."
    );
    [
      "mind-soul-spirit",
      "astro-engine",
      "pattern-recognition",
      "sade-sati",
      "moon-phase",
    ].forEach(value => techniques.add(value));
  }
  if (timing) {
    techniques.add("transits");
    techniques.add("dasha");
    techniques.add("planetary-hours");
    reasons.push(
      "Timing language or a transit reading requests current activation; Dasha is also evaluated as a natal timing layer when birth-time precision permits."
    );
  }
  if (reasons.length === 2)
    reasons.push(
      "No narrow domain was detected; the gateway uses a balanced identity, Moon, angle, aspect, lunar, and cross-system scan after the mandatory Genesis evaluation."
    );
  return {
    question,
    coreLayers: [
      "genesis-astro-engine",
      "genesis-pattern-engine",
      "genesis-yoga-detector",
    ],
    genesisPolicy: "mandatory-evaluate-before-prioritization",
    domains,
    subjects: Array.from(subjects),
    techniques: Array.from(techniques),
    includeTiming: timing,
    includeDivisionalCharts: [
      relationship ? "D9" : "",
      career ? "D10" : "",
    ].filter(Boolean),
    reasons,
  };
}
