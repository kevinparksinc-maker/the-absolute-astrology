import type { ChartResult, ChartRow } from "../server/astronomy";
import type { calculateEnergyRead } from "./energyScoring";
import { describeAspectPair } from "./energyInterpretation";

type Score = NonNullable<ReturnType<typeof calculateEnergyRead>>;
type Contact = Score["contacts"][number];
const responses: Record<string, { risk: string; use: string }> = {
  Sun: {
    risk: "making a disagreement a test of your worth",
    use: "choose a priority you can stand behind without needing immediate approval",
  },
  Moon: {
    risk: "letting an immediate feeling decide a longer-term commitment",
    use: "stabilize your daily rhythm and name what you need before responding",
  },
  Mercury: {
    risk: "answering before checking the details",
    use: "write the terms down, verify the facts and make one clear request",
  },
  Venus: {
    risk: "buying comfort or agreeing just to preserve approval",
    use: "make values, costs and relationship expectations explicit",
  },
  Mars: {
    risk: "forcing an outcome or turning urgency into confrontation",
    use: "give the pressure a defined task, a time limit and a firm boundary",
  },
  Jupiter: {
    risk: "promising more than your time or resources can support",
    use: "test the opportunity against your actual capacity before expanding",
  },
  Saturn: {
    risk: "treating a delay as defeat or carrying a responsibility that is not yours",
    use: "define the obligation, reduce the scope and finish the next concrete step",
  },
  Uranus: {
    risk: "breaking a useful commitment simply to escape restriction",
    use: "try a reversible change before making a permanent break",
  },
  Neptune: {
    risk: "mistaking an attractive possibility for an agreed reality",
    use: "separate what is known, what is hoped for and what still needs confirmation",
  },
  Pluto: {
    risk: "escalating a control struggle to avoid feeling exposed",
    use: "identify who controls the decision and state what you will and will not accept",
  },
  "North Node": {
    risk: "chasing a new direction without a concrete next step",
    use: "take one deliberate step toward the unfamiliar task instead of demanding certainty",
  },
  "South Node": {
    risk: "repeating a familiar response after its usefulness has ended",
    use: "keep the skill from the old pattern while changing the automatic response",
  },
  Ascendant: {
    risk: "reacting defensively before choosing how to present yourself",
    use: "set your pace and decide how you want to enter the situation",
  },
  Descendant: {
    risk: "letting the other person's reaction set every term",
    use: "ask for a specific agreement and keep your own boundary visible",
  },
};

function body(
  chart: ChartResult,
  name: string,
  transit: boolean
): ChartRow | undefined {
  return (
    (transit
      ? chart.transits
      : [
          ...chart.movingBodies,
          chart.northNode,
          chart.southNode,
          chart.ascendant,
          chart.descendant,
        ]
    ).find(row => row?.name === name) ?? undefined
  );
}
function explain(chart: ChartResult, contact: Contact) {
  const first = body(chart, contact.transit, true);
  const second = body(chart, contact.natal, false);
  if (
    !first ||
    !second ||
    !responses[contact.transit] ||
    !responses[contact.natal]
  ) {
    return `${contact.transit} ${contact.aspect} natal ${contact.natal}: interpretation unavailable because the required placement or planet rule is missing. Refresh the chart to verify this contact.`;
  }
  const weight = `${contact.strength.toFixed(1)} weighted points; intensity ${contact.intensity}/5${contact.majorFactor === 0.5 ? "; minor aspect at half weight" : ""}`;
  const meaning = describeAspectPair(
    first,
    second,
    contact.aspect,
    contact.orb
  );
  const expression =
    contact.flow === -1
      ? `The pressure can show up as ${responses[contact.transit].risk}, especially when the situation touches your natal ${contact.natal} needs. In practice, ${responses[contact.natal].use}.`
      : `Use this cooperation deliberately: ${responses[contact.transit].use}; let that support your natal ${contact.natal} by making room to ${responses[contact.natal].use}.`;
  return `Transit ${meaning} ${weight}. ${expression}`;
}

/** The assessment consumes the exact deduplicated ledger that produces the gauge. */
export function buildEnergyAssessment(chart: ChartResult, score: Score) {
  if (!score.contactsCount)
    return {
      headline: "No contacts within 5°",
      paragraphs: [
        "No personal contacts fall within the configured 5° orb at this calculated moment. There is no scored support or pressure to interpret; choose another time to compare.",
      ],
    };
  const ranked = (contacts: Contact[]) =>
    [...contacts].sort(
      (a, b) =>
        b.strength - a.strength || a.orb - b.orb || a.id.localeCompare(b.id)
    );
  const pressure = ranked(score.challenging).slice(0, 2);
  const support = ranked(score.harmonious).slice(0, 2);
  const total = score.flowWeight + score.frictionWeight;
  const difference = score.frictionWeight - score.flowWeight;
  const headline =
    difference === 0
      ? "Equal weighted support and pressure"
      : difference > 0
        ? `Friction leads by ${score.frictionPct - score.flowPct} percentage points`
        : `Flow leads by ${score.flowPct - score.frictionPct} percentage points`;
  const overview = `${score.contactsCount} personal contacts contribute ${total.toFixed(1)} weighted points: ${score.harmonious.length} flow contacts supply ${score.flowWeight.toFixed(1)} (${score.flowPct}%), while ${score.challenging.length} friction contacts supply ${score.frictionWeight.toFixed(1)} (${score.frictionPct}%). ${difference === 0 ? "Neither side outweighs the other; the specific contacts decide where action is easier and where adjustment is needed." : `${difference > 0 ? "Friction" : "Flow"} has the greater weight. ${Math.abs(score.frictionPct - score.flowPct) < 15 ? "The margin is narrow, so the leading side does not describe every area of life." : "Direct your attention first to the leading contacts below."}`} Percentages describe this model's weighted contacts, not the probability that an event succeeds.`;
  const paragraphs = [overview];
  for (const contact of pressure)
    paragraphs.push(`Pressure — ${explain(chart, contact)}`);
  for (const contact of support)
    paragraphs.push(`Support — ${explain(chart, contact)}`);
  if (pressure[0] && support[0]) {
    paragraphs.push(
      `How to work with this: ${support[0].transit} ${support[0].aspect} natal ${support[0].natal} provides a route through the ${pressure[0].transit} ${pressure[0].aspect} natal ${pressure[0].natal} pressure. First, ${responses[support[0].transit]?.use ?? "review the support contact's placement"}. Then ${responses[pressure[0].natal]?.use ?? "review the pressured natal placement"}. Support does not erase the competing demand: progress comes from using the available cooperation to address that specific pressure. These are the strongest contributors by weight; the full contact ledger contains the remaining ${Math.max(0, score.contactsCount - pressure.length - support.length)} contacts. A single snapshot cannot establish when the pressure eases; use the calculated 30-minute forecast for timing.`
    );
  }
  return { headline, paragraphs };
}
