import { stringifyEvidence } from "./astrologyKnowledge/synthesis/evidenceTransport";
import { buildNarrativePacket } from "./astrologyKnowledge/synthesis/narrativePacket";
import type { SynthesisResult } from "./astrologyKnowledge/synthesis/types";
import {
  aspectBetween,
  minorAspectBetween,
  type ChartResult,
  type ChartRow,
} from "./astronomy";
import { synthesizeChartForReading, synthesizeMasterSnapshot } from "./astrologyKnowledge/synthesis/readingBridge";
import { retrievePlacementDossier } from "./astrologyKnowledge/canon/retriever";
import { FIXED_STAR_CANON_RECORDS } from "./astrologyKnowledge/canon/fixedStarsAndLots";
import { describeAspectPair } from "../shared/energyInterpretation";
import { invokeLLM } from "./_core/llm";
import { MINI_SYNTHESIS_STYLE } from "./master-interpreter";

/** A short AI interpretation for a clicked contact; detailed calculated evidence stays intact. */
async function narrateFocusedContactMini(reading: FocusedReading, synthesis: SynthesisResult): Promise<string> {
  const result = await invokeLLM({
    maxTokens: 450,
    messages: [
      { role: "system", content: MINI_SYNTHESIS_STYLE + "\nReturn only one 90–130-word second-person paragraph about this exact selected placement, star or contact, using the full calculated chart as context. Explain the interaction between both bodies, one human consequence and one specific challenge or opportunity. No headings, lists, invented history or method inventory." },
      { role: "user", content: stringifyEvidence({
        ...buildNarrativePacket(synthesis, reading.title).packet,
        title: reading.title,
        moment: reading.moment,
        evidence: reading.evidence,
        sections: reading.sections,
        gaps: reading.gaps,
      }) },
    ],
  });
  if (["length", "max_tokens"].includes(result.choices[0]?.finish_reason ?? ""))
    throw new Error("FOCUSED_MINI_INCOMPLETE: AI response was truncated.");
  const content = result.choices[0]?.message?.content;
  const text = typeof content === "string" ? content.trim() :
    Array.isArray(content) ? content.filter(p => p.type === "text").map(p => (p as { text: string }).text).join("").trim() : "";
  if (text.length < 100 || text.length > 1500)
    throw new Error("FOCUSED_MINI_INVALID: The AI did not return a concise contact interpretation.");
  return text;
}


export type FocusTarget = {
  kind: "placement" | "star" | "contact";
  name: string;
  otherName?: string;
  layer: "natal" | "transit";
};
export type FocusedReading = {
  title: string;
  miniNarrative?: string;
  snapshotId: string;
  moment: string;
  sections: Array<{
    id: string;
    title: string;
    paragraphs: string[];
    sources: string[];
  }>;
  evidence: Array<{ id: string; label: string; value: string }>;
  gaps: string[];
  sourceNotes: string[];
};

export async function buildFocusedReading(
  chart: ChartResult,
  target: FocusTarget,
  includeMiniNarrative = false
): Promise<FocusedReading> {
  const question = `Explain ${target.name} through its actual placement, conditions and contacts; no generic substitution.`;
  const verification = await synthesizeChartForReading(
    chart, target.layer === "transit" ? "combined" : "natal", question
  );
  const natalVerification = verification;
  const eventSnapshot = verification.snapshot.transit?.framework;
  if (target.layer === "transit" && !eventSnapshot)
    throw new Error("TRANSIT_FRAMEWORK_MISSING: Refresh the chart to calculate the current sky's method formation.");
  const { canonicalChart, synthesis } = target.layer === "transit"
    ? await synthesizeMasterSnapshot(eventSnapshot!, "natal", question)
    : verification;
  const bodies: ChartRow[] = [
    ...canonicalChart.movingBodies,
    canonicalChart.ascendant,
    canonicalChart.descendant,
    canonicalChart.northNode,
    canonicalChart.southNode,
  ].filter((row): row is ChartRow => Boolean(row));
  const reading: FocusedReading = {
    title: `${target.layer === "transit" ? "Transit" : "Natal"} ${target.name}`,
    snapshotId: synthesis.snapshotId,
    moment: canonicalChart.utc,
    sections: [],
    evidence: [],
    gaps: [],
    sourceNotes: [],
  };
  const section = (
    id: string,
    title: string,
    paragraphs: Array<string | undefined>,
    sources: Array<string | undefined>
  ) => {
    const text = Array.from(
      new Set(
        paragraphs.filter((value): value is string => Boolean(value?.trim()))
      )
    );
    if (text.length)
      reading.sections.push({
        id,
        title,
        paragraphs: text,
        sources: Array.from(
          new Set(sources.filter((value): value is string => Boolean(value)))
        ),
      });
  };
  if (target.kind === "star") {
    const star = FIXED_STAR_CANON_RECORDS.find(
      star => star.name === target.name
    );
    if (!star) throw new Error(`No catalog record exists for ${target.name}.`);
    reading.title = star.name;
    reading.evidence.push({
      id: `star-${star.name}`,
      label: "Catalog position",
      value: `${star.firmamentLockedLongitude.toFixed(4)}° · ${star.constellation}`,
    });
    if (star.ptolemaicPlanetaryNature === "Not yet source-verified")
      reading.gaps.push(
        `No sourced star-specific interpretation is available for ${star.name}.`
      );
    else {
      section(
        "star-meaning",
        "Traditional meaning",
        [star.traditionalMeaning, star.ptolemaicPlanetaryNature],
        [star.provenance.sourceTitle]
      );
      section(
        "star-strength",
        "Constructive expression",
        [star.giftWhenIntegrated],
        [star.provenance.sourceTitle]
      );
      section(
        "star-pressure",
        "Pressure or cost to recognize",
        [star.nemesisOrTest],
        [star.provenance.sourceTitle]
      );
    }
    const contacts = bodies.flatMap(body => {
      const separation = Math.abs(
        ((body.longitude - star.firmamentLockedLongitude + 540) % 360) - 180
      );
      return separation <= 5
        ? [
            `${body.name} at ${body.display}: ${separation.toFixed(2)}° from ${star.name}.`,
          ]
        : [];
    });
    section("star-contacts", "Contacts in this chart · 5° window", contacts, [
      "Canonical chart positions; fixed-star catalog",
    ]);
    if (!contacts.length)
      reading.gaps.push(
        "No selected-chart body is within the displayed 5° contact window. Catalog meaning alone is not a personal activation."
      );
    reading.sourceNotes.push(star.firmamentOrbRule.statement);
    if (includeMiniNarrative && !reading.miniNarrative)
      reading.miniNarrative = await narrateFocusedContactMini(reading, verification.synthesis);
    return reading;
  }
  const row = bodies.find(row => row.name === target.name);
  if (!row)
    throw new Error(`The canonical chart has no ${target.name} placement.`);
  if (target.kind === "contact") {
    if (!target.otherName)
      throw new Error("A second body is required for a contact reading.");
    const rootedChart =
      target.layer === "transit"
        ? natalVerification.canonicalChart
        : canonicalChart;
    const rooted = [
      ...rootedChart.movingBodies,
      rootedChart.ascendant,
      rootedChart.descendant,
      rootedChart.northNode,
      rootedChart.southNode,
    ].find(body => body?.name === target.otherName);
    if (!rooted)
      throw new Error(
        `No canonical ${target.otherName} placement exists for this contact.`
      );
    const contact =
      aspectBetween(row.longitude, rooted.longitude) ||
      minorAspectBetween(row.longitude, rooted.longitude);
    if (!contact)
      throw new Error(
        "These bodies have no supported contact within 5°. Refresh the contact ledger."
      );
    const day = (chart: ChartResult) => {
      const sun = chart.movingBodies.find(body => body.name === "Sun");
      return Boolean(sun && sun.house >= 7 && sun.house <= 12);
    };
    const movingDossier = retrievePlacementDossier(
      row,
      canonicalChart,
      day(canonicalChart)
    );
    const rootedDossier = retrievePlacementDossier(
      rooted,
      rootedChart,
      day(rootedChart)
    );
    reading.title = `${target.layer === "transit" ? "Transit" : "Natal"} ${row.name} ${contact.aspect} natal ${rooted.name}`;
    reading.evidence.push(
      {
        id: "contact-moving",
        label: `${target.layer} ${row.name}`,
        value: `${row.display} · House ${row.house}`,
      },
      {
        id: "contact-rooted",
        label: `Natal ${rooted.name}`,
        value: `${rooted.display} · House ${rooted.house}`,
      },
      {
        id: "contact-geometry",
        label: contact.aspect,
        value: `${contact.orb.toFixed(2)}° orb`,
      }
    );
    section(
      "contact-meaning",
      "What is connecting",
      [describeAspectPair(row, rooted, contact.aspect, contact.orb)],
      ["Canonical chart geometry; planet and aspect interpretation rules"]
    );
    if (movingDossier.planetDoctrine)
      section(
        "contact-moving-role",
        `${target.layer === "transit" ? "The current" : "The first"} ${row.name} expression`,
        [
          movingDossier.planetInSignSynthesis,
          movingDossier.planetInHouseSynthesis,
        ],
        [
          movingDossier.planetDoctrine.firmamentCanonNote.provenance
            .sourceTitle,
          movingDossier.signDoctrine?.provenance.sourceTitle,
        ]
      );
    if (rootedDossier.planetDoctrine)
      section(
        "contact-rooted-role",
        `What natal ${rooted.name} brings to the contact`,
        [
          rootedDossier.planetInSignSynthesis,
          rootedDossier.planetInHouseSynthesis,
        ],
        [
          rootedDossier.planetDoctrine.firmamentCanonNote.provenance
            .sourceTitle,
          rootedDossier.signDoctrine?.provenance.sourceTitle,
        ]
      );
    if (!rootedDossier.planetDoctrine)
      section(
        "contact-rooted-field",
        `Natal ${rooted.name}: the sign and house involved`,
        [
          rootedDossier.signDoctrine?.psychologicalTheme,
          rootedDossier.houseDoctrine?.psychologicalField,
        ],
        [
          rootedDossier.signDoctrine?.provenance.sourceTitle,
          rootedDossier.houseDoctrine?.agentViewDefinition.provenance
            .sourceTitle,
        ]
      );
    section(
      "contact-condition",
      "What helps or complicates the connection",
      [
        movingDossier.planetDoctrine
          ? `${row.name}: ${movingDossier.dignityAndCondition.conditionSummary}`
          : undefined,
        rootedDossier.planetDoctrine
          ? `${rooted.name}: ${rootedDossier.dignityAndCondition.conditionSummary}`
          : undefined,
      ],
      ["Calculated dignity, solar-condition and sect rules"]
    );
    const supportive = [
      "conjunction",
      "trine",
      "sextile",
      "semisextile",
    ].includes(contact.aspect);
    const debilities = [
      ...movingDossier.dignityAndCondition.essentialDebilities,
      ...rootedDossier.dignityAndCondition.essentialDebilities,
    ];
    const domain = rootedDossier.houseDoctrine?.coreTopics.join(", ");
    section(
      "contact-integration",
      "How to use this understanding",
      [
        domain
          ? `The natal life area involved is ${domain}. Read ${row.name}'s current expression against those specific needs, rather than applying the aspect to every area of life.`
          : undefined,
        supportive && debilities.length
          ? `The geometry is harmonious, while the recorded conditions include ${debilities.join("; ")}. An opening and the capacity to use it are separate questions: work with the specific constraints above.`
          : undefined,
        supportive
          ? rootedDossier.planetInHouseKnowledge?.gift
          : rootedDossier.planetInHouseKnowledge?.challenge,
      ],
      [
        rootedDossier.planetInHouseKnowledge?.sourceTitle,
        rootedDossier.houseDoctrine?.agentViewDefinition.provenance.sourceTitle,
        "Configured harmony/friction classification",
      ]
    );
    if (rootedDossier.planetInHouseKnowledge)
      reading.sourceNotes.push(
        rootedDossier.planetInHouseKnowledge.sourceCaveat,
        rootedDossier.planetInHouseKnowledge.interpretiveGuardrail
      );
    if (includeMiniNarrative)
      reading.miniNarrative = await narrateFocusedContactMini(reading, verification.synthesis);
    return reading;
  }
  const sun = canonicalChart.movingBodies.find(body => body.name === "Sun");
  const dossier = retrievePlacementDossier(
    row,
    canonicalChart,
    sun ? sun.house >= 7 && sun.house <= 12 : false
  );
  const house =
    canonicalChart.worldview === "god"
      ? (row.godHouse ?? row.house)
      : (row.agentHouse ?? row.house);
  reading.evidence.push({
    id: `placement-${row.name}`,
    label: "Calculated placement",
    value: `${row.display} · ${row.longitude.toFixed(4)}° · ${canonicalChart.worldview === "god" ? "God" : "Agent"} House ${house}`,
  });
  if (row.godHouse != null)
    reading.evidence.push({
      id: `god-house-${row.name}`,
      label: "God View",
      value: `House ${row.godHouse}`,
    });
  if (row.agentHouse != null)
    reading.evidence.push({
      id: `agent-house-${row.name}`,
      label: "Agent View",
      value: `House ${row.agentHouse}`,
    });
  const knowledge = dossier.planetInHouseKnowledge;
  const planetSource =
    dossier.planetDoctrine?.psychologicalFunctions.provenance?.sourceTitle ||
    dossier.planetDoctrine?.firmamentCanonNote.provenance.sourceTitle;
  if (dossier.planetDoctrine) {
    section(
      "meaning",
      target.layer === "transit"
        ? "What the current transit activates"
        : "What this placement means",
      [dossier.planetInSignSynthesis, dossier.planetInHouseSynthesis],
      [
        planetSource,
        dossier.signDoctrine?.provenance.sourceTitle,
        dossier.houseDoctrine?.agentViewDefinition.provenance.sourceTitle,
      ]
    );
    section(
      "motivation",
      target.layer === "transit"
        ? "The transit body’s function"
        : "The need behind the behavior",
      [
        dossier.planetDoctrine.psychologicalFunctions.coreNeed,
        dossier.planetDoctrine.psychologicalFunctions.healthyExpression,
      ],
      [planetSource]
    );
  } else {
    section(
      "field",
      "Sign and house context",
      [
        dossier.signDoctrine?.psychologicalTheme,
        dossier.houseDoctrine?.psychologicalField,
      ],
      [
        dossier.signDoctrine?.provenance.sourceTitle,
        dossier.houseDoctrine?.agentViewDefinition.provenance.sourceTitle,
      ]
    );
    reading.gaps.push(
      `No planet-specific Canon entry exists for ${row.name}; sign and house context are shown without inventing a planetary personality.`
    );
  }
  if (
    knowledge &&
    canonicalChart.worldview !== "god" &&
    target.layer === "natal"
  ) {
    section(
      "gift",
      "A strength to develop",
      [knowledge.gift],
      [knowledge.sourceTitle]
    );
    section(
      "cost",
      "A pattern to recognize and work on",
      [knowledge.challenge],
      [knowledge.sourceTitle]
    );
    section(
      "examples",
      "Possible expression in daily life",
      [knowledge.career, knowledge.relationships],
      [knowledge.sourceTitle]
    );
    reading.sourceNotes.push(
      knowledge.sourceCaveat,
      knowledge.interpretiveGuardrail
    );
  } else if (!knowledge)
    reading.gaps.push(
      `No expanded ${row.name}-in-House-${house} interpretation exists in the current library.`
    );
  if (dossier.decanRecord)
    section(
      "decan",
      `Decan · ${dossier.decanRecord.label}`,
      [dossier.decanRecord.behavioralNuance],
      [dossier.decanRecord.provenance.sourceTitle]
    );
  if (dossier.nakshatraRecord)
    section(
      "nakshatra",
      `Nakshatra · ${dossier.nakshatraRecord.name}${dossier.activePada ? `, Pada ${dossier.activePada.pada}` : ""}`,
      [
        dossier.nakshatraRecord.coreMeaning,
        dossier.nakshatraRecord.psychologicalPattern,
        dossier.activePada?.emphasis,
      ],
      [dossier.nakshatraRecord.provenance.sourceTitle]
    );
  else
    reading.gaps.push(
      "No verified Nakshatra record was retrieved; none has been substituted."
    );
  if (dossier.manzilRecord)
    section(
      "manzil",
      `Arabic mansion · ${dossier.manzilRecord.name}`,
      [dossier.manzilRecord.natalAndPsychologicalMeaning],
      [dossier.manzilRecord.provenance.sourceTitle]
    );
  else
    reading.gaps.push(
      "No Arabic mansion record was retrieved; none has been substituted."
    );
  if (dossier.planetDoctrine) section(
    "condition",
    "What strengthens or complicates the expression",
    [dossier.dignityAndCondition.conditionSummary],
    ["Calculated dignity, sect and solar-condition rules"]
  );
  const contacts = bodies
    .filter(other => other.name !== row.name)
    .flatMap(other => {
      const contact =
        aspectBetween(row.longitude, other.longitude) ||
        minorAspectBetween(row.longitude, other.longitude);
      return contact ? [{ other, ...contact }] : [];
    })
    .sort((a, b) => a.orb - b.orb);
  for (const contact of contacts) {
    section(
      `aspect-${contact.other.name}`,
      `${row.name} ${contact.aspect} ${contact.other.name}`,
      [describeAspectPair(row, contact.other, contact.aspect, contact.orb)],
      ["Canonical chart geometry; planet and aspect interpretation rules"]
    );
    reading.evidence.push({
      id: `aspect-${row.name}-${contact.other.name}`,
      label: `${contact.aspect} ${contact.other.name}`,
      value: `${contact.orb.toFixed(2)}° orb · ${contact.other.display}`,
    });
  }
  for (const contact of dossier.fixedStarContacts) {
    reading.evidence.push({
      id: `star-contact-${contact.star.name}`,
      label: contact.star.name,
      value: `${contact.orbDeg.toFixed(2)}° orb`,
    });
    if (contact.star.ptolemaicPlanetaryNature !== "Not yet source-verified")
      section(
        `star-${contact.star.name}`,
        `Fixed star · ${contact.star.name}`,
        [
          contact.star.traditionalMeaning,
          `Constructive expression: ${contact.star.giftWhenIntegrated}`,
          `Pressure to recognize: ${contact.star.nemesisOrTest}`,
        ],
        [contact.star.provenance.sourceTitle]
      );
    else
      reading.gaps.push(
        `The contact with ${contact.star.name} is calculated, but its star-specific interpretation is not source-verified.`
      );
  }
  if (target.layer === "transit") {
    const natal = natalVerification.canonicalChart;
    const targets = [
      ...natal.movingBodies,
      natal.ascendant,
      natal.descendant,
      natal.northNode,
      natal.southNode,
    ].filter((body): body is ChartRow => Boolean(body));
    for (const rooted of targets) {
      const contact =
        aspectBetween(row.longitude, rooted.longitude) ||
        minorAspectBetween(row.longitude, rooted.longitude);
      if (!contact) continue;
      section(
        `personal-contact-${rooted.name}`,
        `Transit ${row.name} ${contact.aspect} natal ${rooted.name}`,
        [describeAspectPair(row, rooted, contact.aspect, contact.orb)],
        [
          "Canonical transit and natal chart geometry; planet and aspect interpretation rules",
        ]
      );
      reading.evidence.push({
        id: `personal-contact-${rooted.name}`,
        label: `Natal ${rooted.name} ${contact.aspect}`,
        value: `${contact.orb.toFixed(2)}° orb · natal ${rooted.display}`,
      });
    }
    reading.sourceNotes.push(
      "This is the selected transit moment. Event-house meanings describe current context; natal personality and life-history claims are not inferred from a temporary transit placement."
    );
  }
  if (includeMiniNarrative)
    reading.miniNarrative = await narrateFocusedContactMini(reading, verification.synthesis);
  return reading;
}
