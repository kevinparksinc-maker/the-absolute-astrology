// Plain-English interpretations for planetary transit contacts and sky atmosphere.
// Translates geometry into specific everyday behavior with distinct wording per aspect angle.

export interface AspectInterpretation {
  summary: string;
  feeling: string;
  bestFor: string;
  caution: string;
}

const PLANET_KEYWORDS: Record<string, { theme: string; manifestation: string }> = {
  Sun: { theme: "core direction, visibility, and confidence", manifestation: "your central focus and pride" },
  Moon: { theme: "daily mood, gut feelings, and home comfort", manifestation: "your emotional rhythm and gut instincts" },
  Mercury: { theme: "thinking, emails, scheduling, and wording", manifestation: "how quickly you process and speak" },
  Venus: { theme: "money, taste, affection, and social ease", manifestation: "how you connect, spend, and keep peace" },
  Mars: { theme: "action speed, grit, temper, and boundaries", manifestation: "your physical drive and directness" },
  Jupiter: { theme: "scope, optimism, timing, and risk appetite", manifestation: "your perspective and appetite for more" },
  Saturn: { theme: "deadlines, structure, workload, and reality checks", manifestation: "your discipline and practical limits" },
  Uranus: { theme: "unexpected changes, independence, and fresh shortcuts", manifestation: "your urge to break out of stale routines" },
  Neptune: { theme: "intuition, creative flow, and unclear expectations", manifestation: "your sensitivity and reading between lines" },
  Pluto: { theme: "deep focus, trust, leverage, and root changes", manifestation: "your willpower and control habits" },
  "North Node": { theme: "next-chapter growth and unfamiliar skills", manifestation: "where life is nudging you to stretch forward" },
  "South Node": { theme: "default autopilot and familiar fallback habits", manifestation: "seasoned habits you lean on without thinking" },
  Ascendant: { theme: "first impressions, body tension, and immediate reactions", manifestation: "how you walk into a room and respond fast" },
  Descendant: { theme: "one-on-one partnerships, clients, and negotiations", manifestation: "how you meet another person half-way" },
};

const ASPECT_BEHAVIOR: Record<string, { tag: string; feel: string; move: string; watch: string }> = {
  conjunction: {
    tag: "merges directly with",
    feel: "Both forces fire at the exact same moment, making this impulse immediate and unmistakable.",
    move: "Put that concentrated focus behind one deliberate task instead of scattering it.",
    watch: "Assuming everyone else feels the same urgency right this second.",
  },
  trine: {
    tag: "opens an easy lane toward",
    feel: "Timing and instinct pull in the same direction with little resistance.",
    move: "Follow through on concrete decisions while momentum cooperates.",
    watch: "Getting complacent just because today feels smooth.",
  },
  sextile: {
    tag: "creates a practical opening for",
    feel: "A light, usable boost becomes noticeable as soon as you take the first step.",
    move: "Send the message, make the pitch, or test the improvement actively.",
    watch: "Waiting passively—openings here reward a direct nudge.",
  },
  semisextile: {
    tag: "gently nudges beside",
    feel: "Two neighboring habits brush past each other and ask for a small practical tweak.",
    move: "Tighten one minor detail or handoff before moving on.",
    watch: "Brushing off small schedule or tone mismatches.",
  },
  square: {
    tag: "forces a clear decision against",
    feel: "Two competing priorities collide and push until you pick a lane or set a firm boundary.",
    move: "Turn pressure into crisp execution or say no cleanly.",
    watch: "Reacting defensively when an outside rule slows your pace.",
  },
  opposition: {
    tag: "pulls across the table from",
    feel: "You feel this tug-of-war mirrored through another person's request or opposing deadline.",
    move: "Listen carefully to the other side and negotiate a realistic middle split.",
    watch: "Locking into an all-or-nothing standoff.",
  },
  semisquare: {
    tag: "causes a small snag with",
    feel: "Minor impatience or logistical friction—like a pebble in your shoe—until fixed directly.",
    move: "Double-check timing, tone, and small numbers before hitting send.",
    watch: "Letting petty annoyance build into an unnecessary argument.",
  },
  quincunx: {
    tag: "forces an awkward pivot around",
    feel: "Your usual habit and today's situation don't line up cleanly; an adjustment is needed.",
    move: "Swap steps or rethink your assumption instead of forcing the old approach.",
    watch: "Repeating the same method harder when the context shifted.",
  },
};

export function getPlainEnglishInterpretation(
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
  isMajor: boolean
): AspectInterpretation {
  const tInfo = PLANET_KEYWORDS[transitPlanet] || { theme: transitPlanet.toLowerCase(), manifestation: `${transitPlanet.toLowerCase()} timing` };
  const nInfo = PLANET_KEYWORDS[natalPlanet] || { theme: natalPlanet.toLowerCase(), manifestation: `your ${natalPlanet.toLowerCase()} habits` };
  const aspectLower = aspect.toLowerCase();
  const behavior = ASPECT_BEHAVIOR[aspectLower];

  const weightLabel = isMajor
    ? "Full-weight driver (100% impact) shaping today's main events."
    : "Background nuance (50% impact) adding subtle adjustment to your day.";

  if (behavior) {
    return {
      summary: `Transit ${transitPlanet} ${behavior.tag} your natal ${natalPlanet}. ${weightLabel}`,
      feeling: `${behavior.feel} Specifically, ${tInfo.manifestation} connects with ${nInfo.manifestation}.`,
      bestFor: `${behavior.move} Focus on ${tInfo.theme} where it touches ${nInfo.theme}.`,
      caution: behavior.watch,
    };
  }

  return {
    summary: `Transit ${transitPlanet} connects (${aspectLower}) with your natal ${natalPlanet}. ${weightLabel}`,
    feeling: `You notice ${tInfo.manifestation} interacting with ${nInfo.manifestation}.`,
    bestFor: `Make practical adjustments around ${tInfo.theme} and ${nInfo.theme}.`,
    caution: "Pause before locking in quick assumptions until details settle.",
  };
}

export function getAtmosphereDescription(
  flowPct: number,
  moonSign?: string
): { title: string; subtitle: string; tone: "flow" | "dynamic" | "friction" } {
  if (flowPct >= 65) {
    return {
      title: "Supportive Sky Weather (Open Flow)",
      subtitle: moonSign
        ? `The broader environment is cooperative while the Moon moves through ${moonSign}. Conversations, scheduling, and routine follow-through run with less drag.`
        : "The broader environment is cooperative and steady. Conversations and routine follow-through run with less drag.",
      tone: "flow",
    };
  }
  if (flowPct <= 38) {
    return {
      title: "High-Pressure Sky Weather (Elevated Friction)",
      subtitle: moonSign
        ? `Surrounding conditions carry sharper deadlines and quick impatience with the Moon in ${moonSign}. Leave extra breathing room in conversations and traffic.`
        : "Surrounding conditions carry sharper deadlines and quick impatience. Leave extra breathing room in conversations and schedules.",
      tone: "friction",
    };
  }
  return {
    title: "Mixed Sky Weather (Balanced Movement)",
    subtitle: moonSign
      ? `Today's background mixes smooth openings with specific pushback under the ${moonSign} Moon. Progress responds directly to clear pacing.`
      : "Today's background mixes smooth openings with specific pushback. Progress responds directly to clear pacing and focus.",
    tone: "dynamic",
  };
}
