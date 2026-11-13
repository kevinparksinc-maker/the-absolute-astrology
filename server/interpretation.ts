import { narrateMasterSynthesis } from "./astrologyKnowledge/synthesis/narrative";
import { buildGenesisInquiryPrompt } from "./genesisLifeStoryInquiry";
import { invokeLLM, type Message } from "./_core/llm";
import { withCurrentQuestion } from "./_core/conversation";
import type { ChartResult, ChartRow } from "./astronomy";
import { formatInZone } from "../shared/time";
import { buildAstrologyInterpreterSystem, FULL_SYNTHESIS_STYLE } from "./master-interpreter";
import {
  buildAstrologyEvidencePacket,
  formatCompactEvidencePacket,
  type AstrologyEvidencePacket,
} from "./astrologyKnowledge";
import { runGenesisPatternPipeline } from "./genesisBackup/adapter";
import { generateReading } from "./genesisBackup/readingEngine";
import { getDecanCanonByLongitude } from "./astrologyKnowledge/canon/decans36";
import { getManzilCanonByLongitude } from "./astrologyKnowledge/canon/manazil28";
import { getNakshatraCanonByLongitude } from "./astrologyKnowledge/canon/nakshatras27";
import { overlay as canonicalOverlay } from "../shared/hybrid";
import { buildMasterPipeline, formatCompactMasterGateContext } from "./master-pipeline";


const COSMOLOGY = `Interpret the supplied chart according to the traditional meanings and calculated method findings. Give direct conclusions supported by evidence, including difficult indications and timing when available. Do not invent placements, personal history, or observed events. Do not insert cosmology explanations, belief commentary, psychological coaching, or a prescribed persona.`;

const CLARITY_FRAMEWORK = `Answer the question first. Explain WHAT the pattern indicates, WHY, HOW the methods interact, the CONSEQUENCE within the tradition, and the MEANING. Cite the actual supplied evidence and describe convergences and contradictions. Do not pad the reading with generic advice.`;

function chartFacts(chart: ChartResult, mode: ReadingMode) {
  const natalOnlyInput = {
    location: chart.input.location,
    latitude: chart.input.latitude,
    longitude: chart.input.longitude,
    timezone: chart.input.timezone,
    date: chart.input.date,
    time: chart.input.time,
  };
  return {
    input: mode === "natal" ? natalOnlyInput : chart.input,
    utc: chart.utc,
    julianDay: chart.julianDay,
    ascendant: chart.ascendant,
    descendant: chart.descendant,
    northNode: { ...chart.northNode, retrograde: undefined },
    southNode: { ...chart.southNode, retrograde: undefined },
    houses: chart.houses,
    movingBodies: chart.movingBodies,
    frozenStars: chart.frozenStars,
    validation: chart.validation,
    worldview: chart.worldview,
    readingScope: chart.readingScope,
    agentViewAvailable: chart.agentViewAvailable,
    godPlacements: chart.godPlacements,
    frameRelationships: chart.movingBodies
      .filter(row => row.frameRelationship)
      .map(row => ({
        body: row.name,
        longitude: row.longitude,
        display: row.display,
        godHouse: row.godHouse,
        agentHouse: row.agentHouse,
        relationship: row.frameRelationship,
      })),
    ...(mode === "natal"
      ? {}
      : { transitDate: chart.transitDate, transits: chart.transits }),
    ...(mode === "natal"
      ? {}
      : {
          momentPrecision: chart.momentPrecision,
          transitHouseFrame: chart.transitHouseFrame,
        }),
  };
}

function textOf(content: string | Array<{ type: string; text?: string }>) {
  return typeof content === "string"
    ? content
    : content.map(part => part.text ?? "").join("");
}

export type ReadingMode = "natal" | "transit" | "combined";
export const READING_MODES: ReadingMode[] = ["natal", "transit", "combined"];
const WORLDVIEW_GUIDANCE = `Worldview (God / Agent / God's View of the Agent) and reading scope (Natal / Transit / Natal + Transit) are independent axes; preserve all existing reading scopes. In God View, use the fixed Aries House 1 through Pisces House 12 frame and the supplied moment, never infer an Ascendant, Midheaven, horizon, or location-based house. In Agent View, use the supplied geocentric planetary longitudes with the observer-specific topocentric lunar correction only when explicitly supplied, and use the Equal House placements from the supplied Ascendant. In God's View of the Agent, explain how the calculated personal placements sit inside the calculated collective frame; use godHouse, agentHouse, frameRelationships, and Royal Star contact data only when supplied. The same canonical geocentric longitude must be treated as one astronomical fact in both frames. Use the supplied relationship type and translation as structured interpretive context; do not calculate agree/shift or a match score, and do not call differing frames contradictory merely because their houses differ. God View augments primary chart testimony; it never overrides rulers, aspects, or horary significators. If the Moon is flagged uncertain, explain the supplied date range rather than presenting one Moon degree as certain. For transit readings, respect transitHouseFrame: transit-location, natal-location, or god-fixed. If momentPrecision is date-only-reference, state that noon UTC is an intentional approximate reference and that the Moon is time-sensitive.`;

const MODE_GUIDANCE: Record<ReadingMode, string> = {
  natal:
    "Read the natal chart only. Focus on enduring temperament, life patterns, nodes, angles, and fixed stars. Do not interpret current transit rows as part of this reading. This is a comprehensive self-knowledge profile: explain what kind of person this may be, how they experience themselves from the inside, what they need, what they fear, how they protect themselves, what others may misunderstand about them, and how their patterns can mature.",
  transit:
    "Read the transit layer only. Use the natal chart only as the reference points being contacted. Focus on the selected transit moment, location, houses, transit planets, nodes, and supplied natal contacts. Give the traditional timing and predictive interpretation when supported by calculated methods; distinguish an interpreted indication from an independently verified future event.",
  combined:
    "Read natal and transit layers together, clearly separating enduring natal pattern from current transit weather. Explain how the present moment activates or develops the natal story without confusing temporary pressure with identity.",
};

async function ask(
  messages: Message[],
  maxTokens = 4000,
  thinkingBudget = 0
) {
  try {
    const response = await invokeLLM({
      model: "claude-sonnet-4-6",
      messages,
      maxTokens,
      ...(thinkingBudget > 0
        ? { thinking: { type: "enabled", budget_tokens: thinkingBudget } }
        : {}),
    });
    const firstChoice = response.choices?.[0];
    const alternate =
      (
        response as unknown as {
          output_text?: string;
          output?: Array<{ content?: Array<{ text?: string }> }>;
        }
      ).output_text ??
      (
        response as unknown as {
          output?: Array<{ content?: Array<{ text?: string }> }>;
        }
      ).output
        ?.flatMap(item => item.content ?? [])
        .map(item => item.text ?? "")
        .join("\n");
    const text = textOf(firstChoice?.message?.content || alternate || "");
    if (!text.trim())
      throw new Error("The AI provider returned no readable chapter text.");
    if (/^(max_tokens|length)$/.test(firstChoice?.finish_reason ?? ""))
      throw new Error("The reading was cut off by its length limit.");
    return text;
  } catch (error) {
    console.error("[Interpretation] LLM request failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (/usage exhausted|quota|credit|AI_RATE_LIMIT|RESOURCE_EXHAUSTED|429/i.test(message)) {
      throw new Error(
        "The chart was calculated successfully, but AI rate/token capacity was temporarily reached. Please wait ~20 seconds and try again; your chart data is still available."
      );
    }
    throw new Error(
      "The interpretation service could not complete this reading. Please try again; your chart calculation is still available."
    );
  }
}

function readerFacingIntelligence(raw: string) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    const data = JSON.parse(cleaned) as Record<string, unknown>;
    const section = (title: string, key: string) => {
      const values = Array.isArray(data[key])
        ? (data[key].filter(item => typeof item === "string") as string[])
        : [];
      return values.length
        ? `### ${title}\n${values.map(value => `- ${value}`).join("\n")}`
        : "";
    };
    return [
      "## The shape of your chart",
      "This is a concise map of the strongest patterns the calculation supports. The longer reading below turns these signals into a personal story.",
      section("What stands out", "dominantPlanets"),
      section("Life areas being emphasized", "dominantHouses"),
      section("Signs and qualities in focus", "dominantSigns"),
      section("The repeating thread", "repeatedThemes"),
      section("Strongest evidence", "strongestEvidence"),
      section("The central tensions", "tensions"),
      section("Placements to keep in view", "priorityPlacements"),
      section("What may be active now", "currentTransitThemes"),
      section("Psychological possibilities to test", "psychologicalHypotheses"),
      section("Questions for honest recognition", "disconfirmingQuestions"),
    ]
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return raw
      .replace(/[{}\[\]\"]/g, "")
      .replace(/,\s*/g, "\n")
      .trim();
  }
}

function buildChartMap(chart: ChartResult, mode: ReadingMode) {
  const body = chart.movingBodies;
  const placements = body
    .map(
      row => {
        const lunarOverlay = row.overlay ?? canonicalOverlay(row.longitude);
        return `- **${row.name}** — ${row.display}, displayed house ${row.house}, God House ${row.godHouse ?? "not supplied"}${row.agentHouse == null ? "" : `, Agent House ${row.agentHouse}`}; Nakshatra ${lunarOverlay.nakshatra} Pada ${lunarOverlay.pada} (ruler ${lunarOverlay.nakshatraRuler}); Arabic Manzil ${lunarOverlay.manzil}; Chinese Xiu ${lunarOverlay.chineseMansion} (determinative ${lunarOverlay.chineseDeterminativeStar}, ${lunarOverlay.chineseBoundaryModel})${row.retrograde ? ", retrograde" : ""}${row.uncertainty ? `; Moon uncertainty: ${row.uncertainty.label}` : ""}`;
      }
    )
    .join("\n");
  const includeTransit = mode !== "natal";
  const contacts = chart.transits
    .filter(row => row.natalContacts.length)
    .slice(0, 8)
    .map(
      row =>
        `- **${row.name}** in ${row.display}: ${row.natalContacts.map(contact => `${contact.aspect} ${contact.natalName} (orb ${contact.orb.toFixed(1)}°)`).join(", ")}`
    )
    .join("\n");
  const transitTimezone =
    chart.input.transitTimezone || chart.input.timezone || "UTC";
  const transitMoment = formatInZone(chart.transitDate, transitTimezone);
  return [
    "## Your chart map",
    "This is the factual foundation of your reading, calculated directly from the chart. The deeper personal chapters are generated separately so one unavailable AI request does not hide the chart itself.",
    `### Worldview and scope`,
    `- **Worldview:** ${chart.worldview}. **Reading scope:** ${chart.readingScope}.`,
    chart.agentViewAvailable
      ? `- **Agent layer:** available; placements include personal Equal House positions.`
      : `- **Agent layer:** unavailable because the chart has no exact birth time/location; do not infer an Ascendant or Midheaven.`,
    `- **God layer:** every supplied placement includes a fixed Aries-to-Pisces godHouse and calculated Royal Star contact distances.`,
    `### The angles`,
    chart.ascendant
      ? `- **Ascendant:** ${chart.ascendant.display}`
      : "- **Ascendant:** not calculated in God View.",
    chart.descendant
      ? `- **Descendant:** ${chart.descendant.display}`
      : "- **Descendant:** not calculated in God View.",
    `- **North Node:** ${chart.northNode.display}, house ${chart.northNode.house}`,
    `- **South Node:** ${chart.southNode.display}, house ${chart.southNode.house}`,
    `### Natal placements`,
    placements,
    mode === "natal"
      ? "### Reading layer\nThis map is prepared for a natal reading: the enduring foundation of the birth chart."
      : "### Reading layer\nThis map is prepared for the selected layer; the deeper chapters will keep natal patterns and present-moment activation distinct.",
    includeTransit
      ? `### Selected transit moment\n${transitMoment} at ${chart.input.transitLocation ?? chart.input.location} (${new Date(chart.transitDate).toISOString()}).`
      : "",
    includeTransit
      ? contacts
        ? `### Supplied natal contacts\n${contacts}`
        : "### Supplied natal contacts\nNo close contacts were found within the calculation's configured orb."
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export const READING_CHAPTERS = [
  {
    id: "identity",
    title: "Core Identity",
    subtitle: "The person you are becoming",
    focus:
      "identity, temperament, first impressions, self-image, core needs, gifts, and the tension between who you are privately and publicly",
  },
  {
    id: "mind-heart",
    title: "Mind & Emotional Life",
    subtitle: "How you think, feel, and protect your inner world",
    focus:
      "mental habits, communication, emotional needs, vulnerability, fear, anger, shame, regulation, and the protective strategies behind reactions",
  },
  {
    id: "relationships",
    title: "Relationships & Belonging",
    subtitle: "How you give, receive, trust, and set boundaries",
    focus:
      "attachment, intimacy, friendship, family patterns, conflict, attraction, reciprocity, boundaries, and how others may experience you",
  },
  {
    id: "work-purpose",
    title: "Work, Gifts & Self-Worth",
    subtitle: "What you build and what you believe you deserve",
    focus:
      "career, money, ambition, leadership, creativity, discipline, recognition, responsibility, self-worth, and practical strengths",
  },
  {
    id: "destiny",
    title: "Growth & Life Arc",
    subtitle: "The old self, the emerging self, and the road between them",
    focus:
      "North Node/South Node, Ascendant/Descendant, fixed stars, spiritual meaning, recurring lessons, shadow, maturity, and the person you can choose to become",
  },
  {
    id: "mirror",
    title: "The Mirror",
    subtitle: "The truth worth carrying forward",
    focus:
      "a connected synthesis of repeating patterns, gifts, blind spots, defenses, relationship loops, concrete recognition moments, and compassionate but honest next steps",
  },
] as const;
export type ReadingChapterId = (typeof READING_CHAPTERS)[number]["id"];

const NODE_NAME = /node/i;

function rowLine(row: ChartRow, label = row.name) {
  const lunarOverlay = Number.isFinite(row.longitude)
    ? row.overlay ?? canonicalOverlay(row.longitude)
    : null;
  const parts = [
    `${label} — ${row.display}`,
    `displayed house ${row.house}`,
    lunarOverlay
      ? `Nakshatra ${lunarOverlay.nakshatra} Pada ${lunarOverlay.pada} (ruler ${lunarOverlay.nakshatraRuler})`
      : "Lunar overlays unavailable because canonical longitude was not supplied",
    ...(lunarOverlay ? [
      `Arabic Manzil ${lunarOverlay.manzil}`,
      `Chinese Xiu ${lunarOverlay.chineseMansion} (determinative ${lunarOverlay.chineseDeterminativeStar}; ${lunarOverlay.chineseBoundaryModel})`,
    ] : []),
  ];
  if (row.godHouse != null) parts.push(`God House ${row.godHouse}`);
  if (row.agentHouse != null) parts.push(`Agent House ${row.agentHouse}`);
  if (row.retrograde && !NODE_NAME.test(row.name)) parts.push("retrograde");
  if (row.uncertainty) parts.push(`Moon uncertainty: ${row.uncertainty.label}`);
  const stars = row.royalStarContacts as unknown;
  if (Array.isArray(stars) && stars.length)
    parts.push(`Royal Star contacts: ${JSON.stringify(stars)}`);
  return `- ${parts.join("; ")}`;
}

function buildEvidenceSheet(chart: ChartResult, mode: ReadingMode) {
  const input = chart.input;
  const lines: string[] = [
    "CHART EVIDENCE SHEET (the only source of chart facts)",
    `Birth: ${input.location}, ${input.date} ${input.time ?? ""} (${input.timezone})`,
    `Frame: worldview ${chart.worldview}; scope ${chart.readingScope}; ${chart.agentViewAvailable ? "personal (Agent) houses available" : "no Ascendant or Midheaven, because birth time/location is not exact"}`,
    "",
    "Angles:",
    chart.ascendant ? rowLine(chart.ascendant) : "- Ascendant: not calculated",
    chart.descendant
      ? rowLine(chart.descendant)
      : "- Descendant: not calculated",
    ...(chart.midheaven ? [rowLine(chart.midheaven)] : []),
    "",
    "Lunar nodes (mean nodes are always retrograde, so that carries no meaning):",
    rowLine(chart.northNode),
    rowLine(chart.southNode),
    "",
    "Planets:",
    ...chart.movingBodies.map(row => rowLine(row)),
    "",
    `Fixed stars (backdrop positions): ${chart.frozenStars.map(star => `${star.name} ${star.display}`).join("; ")}`,
    "",
    "No aspects between natal planets were calculated. Do not state any.",
  ];
  if (mode !== "natal") {
    const zone = input.transitTimezone || input.timezone || "UTC";
    const contacts = chart.transits
      .filter(row => row.natalContacts.length)
      .map(
        row =>
          `- Transit ${row.name}: ${row.natalContacts.map(c => `${c.aspect} natal ${c.natalName} (orb ${c.orb.toFixed(1)}°)`).join(", ")}`
      );
    lines.push(
      "",
      `Transit moment: ${formatInZone(chart.transitDate, zone)}`,
      "Transit planets:",
      ...chart.transits.map(row => rowLine(row, `Transit ${row.name}`)),
      "",
      "Transit contacts to natal points:",
      ...(contacts.length ? contacts : ["- none within the calculation's orb"])
    );
  }
  return lines.join("\n");
}

function knownPoints(chart: ChartResult) {
  const known = new Map<string, string>();
  const natal = [
    ...chart.movingBodies,
    chart.ascendant,
    chart.descendant,
    chart.midheaven,
    chart.northNode,
    chart.southNode,
    ...chart.frozenStars,
  ].filter((row): row is ChartRow => Boolean(row));
  for (const row of natal)
    known.set(
      row.name.toLowerCase(),
      `${row.name} — ${row.display} (house ${row.house})`
    );
  for (const row of chart.transits)
    known.set(
      `transit ${row.name.toLowerCase()}`,
      `Transit ${row.name} — ${row.display} (house ${row.house})`
    );
  return known;
}

// Maps a model-written evidence entry onto a real chart point, and rewrites it from the chart data so facts cannot drift.
function resolvePoint(entry: unknown, known: Map<string, string>) {
  if (typeof entry !== "string") return null;
  const text = entry.trim().toLowerCase();
  let best = "";
  for (const key of Array.from(known.keys())) {
    if (
      text.startsWith(key) &&
      key.length > best.length &&
      !/[a-z]/.test(text.charAt(key.length))
    )
      best = key;
  }
  return best ? known.get(best)! : null;
}

function evidenceAnchors(packet: AstrologyEvidencePacket) {
  const anchors = new Map<string, string>();
  const items = [
    ...packet.genesisAstroEvidence,
    ...packet.patternEvidence,
    ...packet.behavioralEvidence,
    ...packet.lifeEventEvidence,
    ...packet.westernEvidence,
    ...packet.vedicEvidence,
    ...packet.arabicEvidence,
    ...packet.timingEvidence,
    ...packet.fixedStarEvidence,
  ];
  const subjectCounts = new Map<string, number>();
  for (const item of items) {
    const subject = item.subject.trim().toLowerCase();
    subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
  }
  for (const item of items) {
    const subject = item.subject.trim().toLowerCase();
    // A subject can name multiple independent testimonies: never silently pick one.
    if (subjectCounts.get(subject) === 1) anchors.set(subject, item.statement);
    anchors.set(item.id.trim().toLowerCase(), item.statement);
    anchors.set(item.statement.trim().toLowerCase(), item.statement);
  }
  return anchors;
}

function resolveSemanticEvidence(entry: string, semantic: Map<string, string>) {
  const text = entry.trim().toLowerCase();
  const exact = semantic.get(text);
  if (exact) return exact;
  const tokens = text
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(token => token && token !== "in" && token !== "the");
  if (!tokens.length) return null;
  for (const [key, value] of Array.from(semantic.entries())) {
    const keyTokens = key
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter(token => token && token !== "in" && token !== "the");
    if (
      keyTokens.length === tokens.length &&
      keyTokens.every(token => tokens.includes(token))
    )
      return value;
  }
  return null;
}

type ReadingPlan = {
  threads: Array<{
    title: string;
    insight: string;
    evidence: string[];
    chapters: string[];
  }>;
  tensions: Array<{ between: string; insight: string; evidence: string[] }>;
  chapters: Record<string, { angle: string; evidence: string[] }>;
};

function validatePlan(
  raw: string,
  known: Map<string, string>,
  semantic: Map<string, string>
): ReadingPlan | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let data: any;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  const chapterIds = new Set<string>(
    READING_CHAPTERS.map(chapter => chapter.id)
  );
  const clean = (list: unknown) => {
    const out = new Set<string>();
    for (const entry of Array.isArray(list) ? list : []) {
      const hit = resolvePoint(entry, known);
      if (hit) out.add(hit);
      else if (typeof entry === "string") {
        const semanticHit = resolveSemanticEvidence(entry, semantic);
        if (semanticHit) out.add(semanticHit);
      }
      // Unknown evidence is not a chart fact: never carry it into the validated plan.
    }
    return Array.from(out);
  };
  const text = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  const threads = (Array.isArray(data.threads) ? data.threads : [])
    .map((thread: any) => ({
      title: text(thread?.title),
      insight: text(thread?.insight),
      evidence: clean(thread?.evidence),
      chapters: (Array.isArray(thread?.chapters) ? thread.chapters : []).filter(
        (id: unknown) => typeof id === "string" && chapterIds.has(id)
      ) as string[],
    }))
    .filter(
      (thread: { title: string; insight: string; evidence: string[] }) =>
        thread.title && thread.insight && thread.evidence.length
    );
  const tensions = (Array.isArray(data.tensions) ? data.tensions : [])
    .map((tension: any) => ({
      between: text(tension?.between),
      insight: text(tension?.insight),
      evidence: clean(tension?.evidence),
    }))
    .filter(
      (tension: { between: string; insight: string; evidence: string[] }) =>
        tension.between && tension.insight && tension.evidence.length
    );
  const chapters: ReadingPlan["chapters"] = {};
  for (const id of Array.from(chapterIds)) {
    const item = data.chapters?.[id];
    const evidence = clean(item?.evidence);
    if (item && evidence.length)
      chapters[id] = { angle: text(item.angle), evidence };
  }
  if (threads.length < 2 || Object.keys(chapters).length < 4) return null;
  return { threads, tensions, chapters };
}

function chapterPlan(analysis: string, chapterId: string) {
  if (!analysis) return "";
  let plan: ReadingPlan;
  try {
    plan = JSON.parse(analysis) as ReadingPlan;
  } catch {
    return "";
  }
  const isMirror = chapterId === "mirror";
  const threads = isMirror
    ? plan.threads
    : plan.threads.filter(thread => thread.chapters.includes(chapterId));
  const mine = plan.chapters[chapterId];
  const out = [
    "READING PLAN (decided after reading the whole chart; follow it)",
  ];
  if (threads.length)
    out.push(
      isMirror
        ? "All threads to weave together:"
        : "Threads this chapter carries:",
      ...threads.map(
        thread =>
          `- ${thread.title}: ${thread.insight} Evidence: ${thread.evidence.join("; ")}.`
      )
    );
  if (plan.tensions.length)
    out.push(
      "Tensions in the chart:",
      ...plan.tensions.map(
        tension =>
          `- ${tension.between}: ${tension.insight} Evidence: ${tension.evidence.join("; ")}.`
      )
    );
  if (mine && !isMirror)
    out.push(
      `Evidence that is the main subject of THIS chapter: ${mine.evidence.join("; ")}.`,
      `Angle for this chapter: ${mine.angle}`,
      "Other chapters own the remaining placements. Mention one of them here only briefly, to connect threads."
    );
  if (isMirror)
    out.push(
      "The Mirror owns no placements of its own. It names the few threads that actually connect the chapters, the gifts, blind spots, and loops they create together, and one honest next step."
    );
  return out.join("\n");
}

const ANALYSIS_SYSTEM = `You are the silent first reader of a calculated astrology chart. No one will see your output. It is a reading plan that chapter writers will follow, so make it exact and useful.

Read the whole evidence sheet before deciding anything. Genesis is a mandatory core evidence layer, not an optional tradition: the Genesis Astro Engine, Genesis Pattern Engine, and Genesis Yoga Detector must be evaluated on every applicable astrology reading before you prioritize the narrative. Never omit, bypass, or downgrade Genesis because the question appears focused on another tradition. The Question Planner controls emphasis only after Genesis has been evaluated; it may classify a Genesis finding as primary, supporting, contextual, or non-decisive, but it may not declare the Genesis layer irrelevant. Find the 4 to 6 main threads of this chart: evidence that repeats, angular emphasis, the nodal axis, close star contacts, Genesis patterns and activations, yogas, and in transit modes the strongest contacts. Find 2 to 4 real tensions: places where two parts of the chart pull against each other. Then assign evidence to chapters so the chapters do not overlap: each placement is the main subject of at most one chapter. The Mirror chapter gets no evidence of its own, only synthesis.

Rules: use only what the sheet states. Never invent an aspect, house, sign, or star contact; no natal-to-natal aspects were calculated. Evidence entries may reference exact chart points from the sheet, such as "Sun", "Moon", "Ascendant", "North Node", "Regulus", or "Transit Saturn", or any calculated evidence label explicitly stated in the Astrology Evidence Packet, such as a Genesis pattern, activation, archetype, yoga, or cross-system convergence. Preserve the selected evidence label; do not discard it merely because it is not a single point name. Write insights as hypotheses about how a person may experience the pattern, in plain language.

Return ONLY valid JSON, no markdown fence, in this shape:
{"threads":[{"title":"","insight":"","evidence":["Sun"],"chapters":["identity"]}],"tensions":[{"between":"","insight":"","evidence":["Moon"]}],"chapters":{"identity":{"angle":"what this chapter should uniquely say","evidence":["Sun"]},"mind-heart":{"angle":"","evidence":[]},"relationships":{"angle":"","evidence":[]},"work-purpose":{"angle":"","evidence":[]},"destiny":{"angle":"","evidence":[]}}}`;

function buildFallbackPlan(
  chart: ChartResult,
  evidencePacket: AstrologyEvidencePacket
): ReadingPlan {
  const byName = (name: string) =>
    chart.movingBodies.find(b => b.name === name);
  const fmt = (row?: ChartRow | null) =>
    row ? `${row.name} — ${row.display} (house ${row.house})` : null;

  const sun = fmt(byName("Sun"));
  const moon = fmt(byName("Moon"));
  const mercury = fmt(byName("Mercury"));
  const venus = fmt(byName("Venus"));
  const mars = fmt(byName("Mars"));
  const jupiter = fmt(byName("Jupiter"));
  const saturn = fmt(byName("Saturn"));
  const asc = fmt(chart.ascendant);
  const dsc = fmt(chart.descendant);
  const nn = fmt(chart.northNode);
  const sn = fmt(chart.southNode);

  const topPattern =
    evidencePacket.patternEvidence[0]?.statement ??
    sun ??
    "Core chart configuration";
  const topBehavior =
    evidencePacket.behavioralEvidence[0]?.statement ??
    moon ??
    "Emotional regulation pattern";

  return {
    threads: [
      {
        title: "Core Identity & Self-Presence",
        insight:
          "How your solar center and horizon shape how you meet the world versus what you protect privately.",
        evidence: [sun, asc, topPattern].filter((x): x is string => Boolean(x)),
        chapters: ["identity", "work-purpose"],
      },
      {
        title: "Inner Emotional & Mental Processing",
        insight:
          "How your lunar needs and mental habits interpret pressure, safety, and unspoken signals.",
        evidence: [moon, mercury, topBehavior].filter((x): x is string =>
          Boolean(x)
        ),
        chapters: ["mind-heart", "relationships"],
      },
      {
        title: "Relational Reciprocity & Boundaries",
        insight:
          "How attraction, loyalty, and protective strategies operate when closeness feels vulnerable.",
        evidence: [venus, dsc, mars].filter((x): x is string => Boolean(x)),
        chapters: ["relationships", "destiny"],
      },
    ],
    tensions: [
      {
        between: "Self-Protection and Open Connection",
        insight:
          "Balancing the need for autonomy and composure against the deeper hunger to be genuinely known.",
        evidence: [saturn, moon, venus].filter((x): x is string => Boolean(x)),
      },
    ],
    chapters: {
      identity: {
        angle:
          "Establish the core temperament, self-image, and the contrast between outer presentation and inner reality.",
        evidence: [sun, asc, topPattern].filter((x): x is string => Boolean(x)),
      },
      "mind-heart": {
        angle:
          "Unpack how thought and emotion interact under stress, and the protective strategies used to stay safe.",
        evidence: [moon, mercury, topBehavior].filter((x): x is string =>
          Boolean(x)
        ),
      },
      relationships: {
        angle:
          "Examine attachment, trust, reciprocity, and how boundaries are set or tested with others.",
        evidence: [venus, dsc, mars].filter((x): x is string => Boolean(x)),
      },
      "work-purpose": {
        angle:
          "Explore vocation, discipline, self-worth, and how talent turns into enduring structure.",
        evidence: [saturn, jupiter, mars, sun].filter((x): x is string =>
          Boolean(x)
        ),
      },
      destiny: {
        angle:
          "Trace the developmental arc from familiar habits toward conscious integration and life direction.",
        evidence: [nn, sn, jupiter].filter((x): x is string => Boolean(x)),
      },
    },
  };
}

async function analyzeChart(
  chart: ChartResult,
  mode: ReadingMode,
  evidencePacket: AstrologyEvidencePacket,
  synthesisContext = ""
) {
  const known = knownPoints(chart);
  const semantic = evidenceAnchors(evidencePacket);
  const messages: Message[] = [
    {
      role: "system",
      content: buildAstrologyInterpreterSystem(ANALYSIS_SYSTEM),
    },
    {
      role: "user",
      content: `${MODE_GUIDANCE[mode]}\n\nChapters:\n${READING_CHAPTERS.map(chapter => `${chapter.id}: ${chapter.title}. ${chapter.focus}`).join("\n")}\n\n${buildEvidenceSheet(chart, mode)}\n\n${formatCompactEvidencePacket(evidencePacket)}\n\n${synthesisContext}\n\nWrite the reading plan JSON now.`,
    },
  ];
  try {
    const plan = validatePlan(
      await ask(messages, 2400, 1024),
      known,
      semantic
    );
    if (plan) return JSON.stringify(plan);
    throw new Error("READING_PLAN_INVALID: AI reading plan failed evidence validation.");
  } catch (error) {
    console.error("[READING_PLAN_FAILED] AI reading plan unavailable:", error);
    throw new Error("READING_PLAN_FAILED: The AI reading plan could not be completed or validated.");
  }
}

function chapterSystem(
  mode: ReadingMode,
  chapter: { title: string; subtitle: string; focus: string }
) {
  return buildAstrologyInterpreterSystem(
    FULL_SYNTHESIS_STYLE,
    [
      `You write one chapter of a private self-knowledge reading from a calculated astrology chart. Chapter: ${chapter.title}, ${chapter.subtitle}. Focus: ${chapter.focus}.`,
      `FACTS
- The evidence sheet is the only source of chart facts. Never recalculate or invent a placement, house, sign, aspect, star contact, or any biography. If it is not on the sheet, it does not exist for this reading.
- Genesis is a mandatory core evidence layer already evaluated for this reading. Use Genesis Astro Engine activations, Pattern Engine configurations, archetypes, signatures, strength findings, and Yoga Detector findings whenever they are assigned by the reading plan or materially illuminate the chapter. Do not omit them merely because they are not single chart-point labels; distinguish "not central" from "not evaluated."
- Use each placement exactly as the sheet states it. Never call the lunar nodes retrograde.
- Stay consistent with every fact in earlier chapters.
- God View uses fixed Aries-to-Pisces houses and never an Ascendant. Agent View uses the personal Equal House placements. If the Moon is flagged uncertain, give the supplied date range, not one degree.
- ${MODE_GUIDANCE[mode]}`,
      `METHOD
- Follow the reading plan: write the threads and evidence assigned to this chapter. Weigh repeated evidence over isolated details. Name contradictions instead of smoothing them.
- Explain each pattern as a chain in flowing prose: what the chart shows, the need beneath it, the protective habit, its gift and its cost, an ordinary scene, how it lands on other people, a mature choice, and how the reader could test it. Say what would make it not fit.
- Render the human meaning visibly, not only internally. Begin the opening identity chapter with "What this chart may be helping you understand" and "How this may meet your life"; in every other chapter include a plainly labeled "What this means for you" synthesis before extended technical explanation.
- State the traditional interpretation of the calculated pattern directly. Do not substitute psychological labels or invent personal biography as observed fact.
- Never repeat what earlier chapters already said: no placement meaning, scene, or advice twice. Advance the story with new evidence and new weight.
- Markdown with a few headings at most. No bullet lists of evidence, no layer labels, no summary of the whole chart, no mention of AI, tokens, or these instructions. Finish your last sentence.
- CRITICAL LIFE-STORYTELLING MANDATE: Never write short dismissive summaries, fragmented bullet checklists, or one-liners. Write expansive, flowing, deeply resonant prose that reads like an intimate, wise biography of the soul translated into real-world 2026 living.`,
      `VOICE (this governs how everything above sounds)
You are a warm, wise elder speaking to someone you want to see do well: protective but not possessive, honest without harshness, practical rather than sentimental. Speak to "you" in plain, concrete language, and define a technical term in half a sentence when you must use one. Name a hard truth plainly, then offer one proportionate next step. Never shame, frighten, flatter, or imply the reader needs you. Astrology is a symbolic tradition, not proof; invite the reader to test it against their own life.`,
    ].join("\n\n")
  );
}

export function buildLifeStoryExecutiveOverview(
  chart: ChartResult,
  mode: ReadingMode,
  evidencePacket: AstrologyEvidencePacket
): string {
  const report = evidencePacket.behavioralReport;
  const canon = evidencePacket.canonDossier;
  const sun = chart.movingBodies.find(b => b.name === "Sun");
  const moon = chart.movingBodies.find(b => b.name === "Moon");
  const merc = chart.movingBodies.find(b => b.name === "Mercury");
  const venus = chart.movingBodies.find(b => b.name === "Venus");
  const mars = chart.movingBodies.find(b => b.name === "Mars");
  const jupiter = chart.movingBodies.find(b => b.name === "Jupiter");
  const saturn = chart.movingBodies.find(b => b.name === "Saturn");
  const asc = chart.ascendant;
  const mc = chart.midheaven;
  const northNode = chart.northNode;

  // Exact Canon Layer Extractions
  const sunDecan = sun ? getDecanCanonByLongitude(sun.longitude) : null;
  const moonNak = moon ? getNakshatraCanonByLongitude(moon.longitude) : null;
  const moonManzil = moon ? getManzilCanonByLongitude(moon.longitude) : null;
  const mercDecan = merc ? getDecanCanonByLongitude(merc.longitude) : null;

  const sect = canon?.sect ?? (sun && sun.house && sun.house >= 7 && sun.house <= 12 ? "day" : "night");
  const sectText = sect === "day"
    ? "You were born into a Diurnal (Day) Sky: your life is fueled by solar deliberate agency, visible stewardship, and conscious authorship. You uncover your true strength by building in the open."
    : "You were born into a Nocturnal (Night) Sky: your life is guided by lunar intuitive radar, profound emotional depth, and silent perception. You uncover your true strength in private sanctuary and deep reflection.";

  const lots = canon?.arabicLotsSummary ?? [];
  const lotFortune = lots.find(l => l.lot.id === "fortune" || l.lot.name.includes("Fortune"));
  const lotSpirit = lots.find(l => l.lot.id === "spirit" || l.lot.name.includes("Spirit"));
  const lotEros = lots.find(l => l.lot.id === "eros" || l.lot.name.includes("Eros"));
  const lotNecessity = lots.find(l => l.lot.id === "necessity" || l.lot.name.includes("Necessity"));

  const fixedStarContacts = (canon?.placements.flatMap(p => p.fixedStarContacts) ?? []).filter(c => c && c.star);
  const royalStarContacts = fixedStarContacts.filter(c => c.star.isRoyalStar);

  const dominantBehaviors = report?.dominantBehaviors ?? [];
  const primaryBehavior = dominantBehaviors[0];
  const secondaryBehavior = dominantBehaviors[1];
  const polarity = report?.polarityAxes?.[0];

  let genesisRoots = "";
  let genesisAdulthood = "";
  let genesisPhase = "GROWING";
  let genesisGifts: Array<{ source: string; description: string; howToUse: string }> = [];
  let genesisTensions: Array<{ between: string[]; description: string; resolutionPath: string }> = [];

  try {
    const pipeline = runGenesisPatternPipeline(chart);
    const genesisReading = generateReading(
      pipeline.analysis,
      {
        question: "Who am I from childhood into adulthood?",
        focusArea: "general",
        preferredTone: "direct",
      },
      chart.input.location || "Observatory",
      chart.input.time || "12:00",
      chart.input.date || new Date().toISOString().split("T")[0]
    );
    genesisRoots = genesisReading.childhoodRoots;
    genesisAdulthood = genesisReading.adulthoodArc;
    genesisPhase = genesisReading.developmentalPhase.toUpperCase();
    genesisGifts = genesisReading.gifts;
    genesisTensions = genesisReading.tensions;
  } catch (err) {
    console.warn("[buildLifeStoryExecutiveOverview] Genesis pipeline fallback:", err);
  }

  const signatureItems = [
    sun ? `**Sun** in ${sun.display} (House ${sun.house})` : null,
    moon ? `**Moon** in ${moon.display} (House ${moon.house})` : null,
    asc ? `**Ascendant** at ${asc.display}` : null,
    sunDecan ? `Face: *${sunDecan.traditionalTitle}*` : null,
    moonNak ? `Nakshatra: *${moonNak.nakshatra.name}*` : null,
  ].filter(Boolean);

  const signatureLine = signatureItems.length
    ? `> **Celestial Architecture:** ${signatureItems.join(" · ")} · **Active Phase:** \`${genesisPhase}\`\n`
    : "";

  // Dynamic Lots Section
  const lotsBlock: string[] = [];
  if (lots.length > 0) {
    lotsBlock.push(`### Chapter IV: The Sacred Geometry of Destiny — Hermetic Lots`);
    lotsBlock.push(
      `Long before modern psychology reduced human life to isolated traits, ancient masters calculated the Arabic and Hermetic Lots to illuminate where external fortune lands and where conscious soul-direction steers:`
    );
    if (lotFortune) {
      lotsBlock.push(
        `- **Lot of Fortune (${lotFortune.display} in House ${lotFortune.house}):** Where your bodily vitality, instinctual luck, and tangible material flow crystallize. In 2026, Fortune rewards you when you trust your somatic gut-instincts rather than overthinking every move. Circumstances open up when you care for your physical foundation and cultivate real-world craft.`
      );
    }
    if (lotSpirit) {
      lotsBlock.push(
        `- **Lot of Spirit (${lotSpirit.display} in House ${lotSpirit.house}):** Where your conscious intellect, deliberate willpower, and purposeful vocation leave their mark. While Fortune is what the world gives to you, Spirit is what you consciously author. In modern career terms, this is your zone of sovereign initiative—where you must lead, create, and build on your own terms.`
      );
    }
    if (lotEros) {
      lotsBlock.push(
        `- **Lot of Eros (${lotEros.display} in House ${lotEros.house}):** Where your heart’s magnetic longing and true creative appetite live. This placement reveals that you cannot be satisfied with superficial connections or transactional dating; you need a bond that electrifies both your mind and your spirit.`
      );
    }
    if (lotNecessity) {
      lotsBlock.push(
        `- **Lot of Necessity (${lotNecessity.display} in House ${lotNecessity.house}):** Where life demands endurance, duty, and non-negotiable boundaries. It is here that you learn patience: when trials emerge in this arena, they are not punishments, but character-building crucibles that make you unbreakable.`
      );
    }
    lotsBlock.push("");
  }

  // Dynamic Fixed Stars Section
  const starsBlock: string[] = [];
  if (fixedStarContacts.length > 0) {
    starsBlock.push(`### Chapter V: The Ancient Star Watchers & Royal Alliances`);
    starsBlock.push(
      `Your birth chart is anchored against the permanent backdrop of the starry firmament. You carry direct contacts to primary stellar beacons:`
    );
    for (const contact of fixedStarContacts.slice(0, 3)) {
      const isRoyal = contact.star.isRoyalStar;
      starsBlock.push(
        `- **${contact.star.name}${isRoyal ? ` (${contact.star.watcherDirection} Royal Star)` : ""} within ${contact.orbDeg.toFixed(2)}° orb:** ${contact.star.traditionalMeaning}`
      );
      starsBlock.push(
        `  *The 2026 Gift & Test:* ${contact.star.giftWhenIntegrated} Beware the test: ${contact.star.nemesisOrTest}`
      );
    }
    starsBlock.push("");
  }

  // Dynamic Gifts & Superpowers
  const giftsBlock = genesisGifts.length > 0
    ? [
        `### Chapter VI: Inborn Gifts & Superpowers`,
        ...genesisGifts.map(
          g => `- **${g.source}:** ${g.description}\n  *Actionable Practice in 2026:* ${g.howToUse}`
        ),
        "",
      ]
    : [];

  // Dynamic Tensions Block
  const tensionsBlock = genesisTensions.length > 0
    ? [
        `### Chapter VII: Active Celestial Tensions & Resolution Paths`,
        ...genesisTensions.map(
          t => `- **Between ${t.between.join(" & ")}:** ${t.description}\n  *Resolution Path:* ${t.resolutionPath}`
        ),
        "",
      ]
    : [];

  return [
    `# Your Life Story: The Living Narrative of Your Core Blueprint`,
    `*A continuous, deeply personal life-story reading spoken as a lifelong guardian angel who has known your trials, your silences, and your true inborn power—grounded in your exact celestial architecture and translated into real-world 2026 living.*`,
    "",
    signatureLine,
    `### Prologue: Who You Came Here to Be (The Sovereign Core)`,
    `The chart cannot tell us exactly what happened in your childhood or what you kept private. It can offer symbolic themes to compare with your lived experience. Consider whether the needs and patterns suggested by the placements below fit your history; if they do not, leave them aside rather than forcing your life to match the chart.`,
    "",
    `In real-world 2026 terms, your life story begins with a profound refusal to live on the surface. Guided by your ${sun ? `**Sun in ${sun.display} (House ${sun.house})**` : "core solar placement"}${sunDecan ? ` under the sacred Egyptian Decan of ***${sunDecan.traditionalTitle}*** (ruled by ${sunDecan.chaldeanFaceRuler})` : ""}, you are not built for performative networking, crowd conformity, or hollow external validation. ${sunDecan ? `This decanic signature brings a specialized energetic nuance: *${sunDecan.behavioralNuance}*` : ""} Coupled with your ${asc ? `**Ascendant at ${asc.display}**` : "personal horizon"}, your fundamental identity is shaped by selective sovereignty—preferring an inner circle of high-trust allies bound by shared purpose over superficial crowd belonging.`,
    "",
    `*${sectText}*`,
    "",
    `In an era characterized by digital noise, influencer vanity, and transactional connections, your presence operates like a grounding anchor. Where others get swept away by fleeting trends, your instinct is to pause, look underneath the social facade, and demand authentic substance. You are the person people turn to when they need real discernment, steady competence, and someone who refuses to compromise core integrity.`,
    "",
    `### Chapter I: The Interior Sanctuary — Mind, Heart, and Sacred Lunar Mansions`,
    `Your mind and your emotional heart form an intricate, high-fidelity navigational system. With ${merc ? `**Mercury in ${merc.display} (House ${merc.house})**` : "your Mercury placement"}${mercDecan ? ` in the decan of *${mercDecan.traditionalTitle}*` : ""}, your cognitive processing is not linear data entry; it is holographic, intuitive pattern perception. You read between the lines, registering unspoken motives, shifts in emotional temperature, and hidden structural risks in projects before others even notice them. In today's workplace, this allows you to rapidly cut through corporate jargon, identify strategic pitfalls, and synthesize connections that purely analytical minds miss.`,
    "",
    `Beneath your composed exterior lies a rich, continuous emotional radar. Guided by ${moon ? `**Moon in ${moon.display} (House ${moon.house})**` : "your Moon"}${moonNak ? ` under Vedic Nakshatra **${moonNak.nakshatra.name}** (Deity: ${moonNak.nakshatra.deity}, Symbol: ${moonNak.nakshatra.symbol}, Pada ${moonNak.pada.pada} in ${moonNak.pada.navamshaSign} / ${moonNak.pada.navamshaRuler})` : ""}, you experience life with profound sensitivity. ${moonNak ? `In Vedic Jyotish canon, this lunar sanctuary carries the shakti of *${moonNak.nakshatra.shakti}*, emphasizing: *${moonNak.pada.emphasis}*` : ""} ${moonManzil ? `Furthermore, your Moon rests in the Arabic Lunar Mansion **${moonManzil.name}** (*${moonManzil.englishTranslation}*), granting: *${moonManzil.natalAndPsychologicalMeaning}*` : ""} You require genuine psychological safety to open your heart; when environments feel chaotic or disingenuous, your instinctive rhythm is to retreat into your private sanctuary to recalibrate. Solitude is not an act of coldness—it is essential maintenance for your emotional vitality.`,
    "",
    `### Chapter II: The Developmental Arc — From Childhood Roots to Adulthood Sovereignty`,
    genesisRoots || "The chart alone cannot establish a specific childhood story. The developmental themes below are possibilities to test against your own memories, not claims about events that must have happened.",
    "",
    genesisAdulthood || "If these themes match your experience, consider how they may have changed as you grew older. If they do not match, the chart does not override what you know about your own life.",
    "",
    `### Chapter III: The Modern Crucible — Autonomy, Deep Longing & Defense Habits`,
    `Every compelling life narrative has its central conflict. In yours, the great modern crucible is the dynamic pull between **fierce personal independence and a profound hunger for loyal, intimate connection**${polarity ? ` (${polarity.leftPole} vs. ${polarity.rightPole})` : ""}. One half of you insists on self-command, carrying the entire load alone and refusing to be beholden to anyone; the other half yearns for an intimate partner with whom you can drop your armor completely and share unwavering trust.`,
    "",
    `When pressure mounts, one possible response to explore is whether you tighten your boundaries, hold back vulnerability, or try to resolve things alone${primaryBehavior ? ` (${primaryBehavior.name})` : ""}. ${primaryBehavior ? `Your specific behavioral trigger patterns include: *${primaryBehavior.triggerPatterns?.join(", ") || "feeling pressured or exposed"}*. Under threat, your automatic reflex is: *"${primaryBehavior.automaticExpression}"*. Yet the hidden shadow cost is: *"${primaryBehavior.shadowExpression}"*—often falling into the trap of *"${primaryBehavior.compensationPattern}"*.` : ""} In 2026, the hidden cost of this defense is that partners and close friends may feel kept behind a wall, even when you love them deeply. Your breakthrough comes not from erasing your boundaries, but from learning to speak your needs early—naming when you need space, asking for help before exhaustion strikes, and trusting that the right allies will respect your truth without taking your freedom.`,
    "",
    venus && mars ? `In your relational chemistry, **Venus in ${venus.display} (House ${venus.house})** meets **Mars in ${mars.display} (House ${mars.house})**. You do not fall in love lightly or carelessly. For you, intimacy requires total fidelity, intellectual resonance, and shared standards. When you give your loyalty, it is enduring; but when trust is broken through deceit or disrespect, you withdraw completely without making a scene.` : "",
    "",
    ...lotsBlock,
    ...starsBlock,
    ...giftsBlock,
    ...tensionsBlock,
    `### Chapter VIII: Navigating 2026 Reality — Guardian Counsel & Sovereign Power`,
    `When your blueprint is consciously integrated, it becomes a formidable modern superpower. In your work and creative calling, you thrive in high-autonomy environments where competence, discernment, and strategic depth are prized over busywork. You are built to lead transformations, anchor complex projects, and build enduring structures that outlast digital noise.`,
    "",
    `To walk this path with sustainable power in everyday life:`,
    `- **Guard Your Deep Work:** Treat your focused blocks of craft and reflection as sacred. Say no to performative meetings and protect uninterrupted time for real substance.`,
    `- **Communicate with Vulnerable Authority:** When friction arises in love or partnership, resist the impulse to silently retreat. Express your truth once, calmly and neutrally, leaving room for reciprocal understanding.`,
    `- **Honor the Private Sanctuary:** Establish non-negotiable daily decompression away from screens and alerts. Your sharpest intuitive wisdom returns whenever you allow yourself quiet space.`,
    "",
    `You are moving through an evolutionary journey from defensive self-reliance toward grounded, generative sovereignty. Walk forward with courage: you were never alone, you were never forgotten, and your blueprint was built for this exact time.`,
  ].filter(line => line !== "").join("\n\n");
}

export async function generateInterpretation(
  chart: ChartResult,
  mode: ReadingMode = "combined",
  question = "What should I understand from this chart?",
  synthesisContext = ""
) {
  const master = await buildMasterPipeline(chart, mode, question);
  const masterContext = formatCompactMasterGateContext(master);
  const evidencePacket = buildAstrologyEvidencePacket(chart, question, mode);
  const intelligence = `${masterContext}\n\n${buildChartMap(chart, mode)}\n\n${formatCompactEvidencePacket(evidencePacket)}\n\n${synthesisContext}`;
  const analysis = await analyzeChart(chart, mode, evidencePacket, `${masterContext}\n\n${synthesisContext}`);
  const narrated = await narrateMasterSynthesis(master.synthesis, question);
  const reading = [narrated.dominantConclusion, ...narrated.integratedNarrative].join("\n\n");
  return {
    masterSnapshot: master.snapshot,
    masterSynthesis: narrated,
    intelligence,
    evidencePacket,
    behavioralReport: evidencePacket.behavioralReport,
    analysis,
    reading,
    generatedAt: new Date().toISOString(),
    chapters: READING_CHAPTERS.map(chapter => ({
      ...chapter,
      status: "pending" as const,
    })),
  };
}
function buildLifeStoryChapterFallback(
  chart: ChartResult,
  mode: ReadingMode,
  evidencePacket: AstrologyEvidencePacket,
  chapterId: ReadingChapterId,
  chapter: { title: string; subtitle: string; focus: string }
): string {
  const sun = chart.movingBodies.find(b => b.name === "Sun");
  const moon = chart.movingBodies.find(b => b.name === "Moon");
  const merc = chart.movingBodies.find(b => b.name === "Mercury");
  const venus = chart.movingBodies.find(b => b.name === "Venus");
  const mars = chart.movingBodies.find(b => b.name === "Mars");
  const jup = chart.movingBodies.find(b => b.name === "Jupiter");
  const saturn = chart.movingBodies.find(b => b.name === "Saturn");
  const asc = chart.ascendant;
  const dsc = chart.descendant;
  const report = evidencePacket.behavioralReport;
  const primaryBehavior = report?.dominantBehaviors?.[0];
  const polarity = report?.polarityAxes?.[0];

  switch (chapterId) {
    case "identity":
      return [
        `## ${chapter.title}: ${chapter.subtitle}`,
        `*Grounded in your exact natal sky (${sun ? `Sun in ${sun.display}` : "Core Sun"}, ${asc ? `Ascendant at ${asc.display}` : "Horizon"}) and translated into modern 2026 living.*`,
        "",
        `### What this chart may be helping you understand`,
        `In real-world 2026 terms, your life story begins with a fundamental refusal to live on the surface. Guided by your ${sun ? `**Sun in ${sun.display} (House ${sun.house})**` : "Sun"} and personal horizon, you are not built for performative networking, crowd conformity, or hollow external validation. Your fundamental identity is shaped by selective sovereignty: preferring an inner circle of high-trust allies bound by shared purpose over superficial crowd belonging.`,
        "",
        `### How this may meet your life`,
        `In an era characterized by digital noise, influencer vanity, and transactional connections, your presence operates like a grounding anchor. Where others get swept away by fleeting trends, your instinct is to pause, look underneath the social facade, and demand authentic substance. You are the person people turn to when they need real discernment, steady competence, and someone who refuses to compromise core integrity.`,
        "",
        `### What this means for you in 2026`,
        `When pressure mounts in modern life, your greatest asset is knowing who you are without needing an audience to applaud. Protect your quiet morning hours, establish your personal non-negotiables, and remember that being selective with your time is not coldness—it is the prerequisite for building work and relationships that truly endure.`
      ].join("\n");

    case "mind-heart":
      return [
        `## ${chapter.title}: ${chapter.subtitle}`,
        `*A deep examination of how you perceive, communicate, process emotion, and protect your nervous system.*`,
        "",
        `### The Architecture of Your Cognitive Compass`,
        `Your mind and your emotional heart form an intricate, high-fidelity navigational system. With ${merc ? `**Mercury in ${merc.display} (House ${merc.house})**` : "Mercury in your chart"}, your cognitive processing is not linear data entry; it is holographic, intuitive pattern perception. You read between the lines, registering unspoken motives, shifts in emotional temperature, and hidden structural risks in projects before others even notice them. In today's digital workplace and information-saturated landscape, this allows you to rapidly cut through corporate jargon, identify strategic pitfalls, and synthesize connections that purely analytical minds miss.`,
        "",
        `### The Emotional Sanctuary Beneath the Composure`,
        `Beneath your composed exterior lies a rich, continuous emotional radar. Guided by ${moon ? `**Moon in ${moon.display} (House ${moon.house})**` : "your Moon"}${moon?.overlay?.nakshatra ? ` under Lunar Nakshatra **${moon.overlay.nakshatra}**` : ""}, you experience life with profound sensitivity. You require genuine psychological safety to open your heart; when environments feel chaotic or disingenuous, your instinctive rhythm is to retreat into your private sanctuary to recalibrate. Solitude is not an act of coldness—it is essential maintenance for your emotional vitality.`,
        "",
        `### What this means for you in 2026 daily reality`,
        `Watch for the modern temptation to process everything in silence until you hit mental exhaustion${primaryBehavior ? ` (${primaryBehavior.name})` : ""}. Speak your needs early to safe counterparts, honor your need for quiet sensory resets away from screens, and trust that your intuitive radar is a superpower, not an over-reaction.`
      ].join("\n");

    case "relationships":
      return [
        `## ${chapter.title}: ${chapter.subtitle}`,
        `*Attachment patterns, relational mirrors, boundaries, and modern intimacy in 2026.*`,
        "",
        `### How You Connect & What You Demand in Love`,
        `In relationships, you are an all-in or all-out presence. With ${venus ? `**Venus at ${venus.display} (House ${venus.house})**` : "Venus in your chart"}${dsc ? ` and Descendant at **${dsc.display}**` : ""}, you have no patience for casual games, performative pleasantries, or half-hearted commitments. In both romance and close alliances, you look for emotional courage, demonstrated reciprocity, and unwavering loyalty over time. When someone earns your trust, your loyalty is protective, steadfast, and deeply transformative.`,
        "",
        `### The Modern Crucible: Autonomy vs. Intimacy`,
        `Every compelling life narrative has its central conflict. In yours, the great modern crucible is the dynamic pull between **fierce personal independence and a profound hunger for loyal, intimate connection**${polarity ? ` (${polarity.leftPole} vs. ${polarity.rightPole})` : ""}. One half of you insists on self-command, carrying the entire load alone and refusing to be beholden to anyone; the other half yearns for an intimate partner with whom you can drop your armor completely and share unwavering trust.`,
        "",
        `### What this means for you in 2026`,
        `Your breakthrough in modern relationships comes not from erasing your boundaries, but from learning to speak your needs early—naming when you need space, asking for help before exhaustion strikes, and trusting that the right allies will respect your truth without taking your freedom.`
      ].join("\n");

    case "work-purpose":
      return [
        `## ${chapter.title}: ${chapter.subtitle}`,
        `*Vocation, ambition, craft mastery, and building enduring structures in 2026.*`,
        "",
        `### Your Vocational Calling & Real-World Impact`,
        `When your blueprint is consciously integrated, it becomes a formidable modern superpower. In your work and creative calling, you thrive in high-autonomy environments where competence, discernment, and strategic depth are prized over busywork. Anchored by ${saturn ? `**Saturn at ${saturn.display} (House ${saturn.house})**` : "Saturn"}${jup ? ` and **Jupiter at ${jup.display}**` : ""}, you are built to lead transformations, anchor complex projects, and build enduring structures that outlast digital noise.`,
        "",
        `### Cutting Through Modern 2026 Distractions`,
        `In an economy saturated with vanity metrics and hollow hype, your greatest competitive advantage is depth of craft. You are allergic to micromanagement; you do your best work when given a clear objective, trusted with autonomy, and allowed to focus uninterrupted for sustained periods.`,
        "",
        `### Actionable 2026 Sovereignty Principles`,
        `- **Guard Your Deep Work:** Treat your focused blocks of craft and reflection as sacred. Say no to performative meetings and protect uninterrupted time for real substance.\n- **Communicate with Vulnerable Authority:** When friction arises in collaboration, state the structural reality calmly and neutrally, offering one clear path forward.\n- **Build What Endures:** Invest your energy into skills, assets, and relationships that appreciate over years rather than chasing fleeting viral moments.`
      ].join("\n");

    case "destiny":
      return [
        `## ${chapter.title}: ${chapter.subtitle}`,
        `*The evolutionary arc from familiar childhood coping to mature adult sovereignty.*`,
        "",
        `### The Evolutionary Crossroads`,
        `Your chart traces a heroic developmental journey. Anchored by ${chart.northNode ? `**North Node at ${chart.northNode.display} (House ${chart.northNode.house})**` : "your nodal purpose axis"}, your life story calls you out of familiar, reactive safety habits and invites you into conscious, generative leadership. What began in youth as a necessity to protect yourself gradually matures into an unshakeable gift of wisdom for your community.`,
        "",
        `### Releasing the Outgrown Armor`,
        `The habits of your South Node served their purpose in earlier chapters: they kept you safe, taught you self-reliance, and ensured your survival. But in 2026, those same habits can become an isolating cage if held too tightly. Releasing the fear that other people will let you down allows you to step into collaborative greatness.`,
        "",
        `### What this means for your next chapter`,
        `You are stepping into a chapter where your authority is quiet, your boundaries are natural, and your heart remains open. You no longer have to prove yourself to anyone; you are here to build what truly matters and walk in peace.`
      ].join("\n");

    case "mirror":
    default:
      return [
        `## ${chapter.title}: ${chapter.subtitle}`,
        `*The complete synthesis: how all threads of your celestial blueprint unite into one coherent destiny.*`,
        "",
        `### The Unified Life Story`,
        `Stepping back to view the complete architecture of your sky, one central truth emerges: you are a person built for depth, fidelity, and sovereign craft. Across your core identity (${sun ? `Sun in ${sun.display}` : "Sun"}), your emotional navigational system (${moon ? `Moon in ${moon.display}` : "Moon"}), and your public calling (${asc ? `Ascendant at ${asc.display}` : "Ascendant"}), the repeating pattern is unshakeable integrity.`,
        "",
        `### Navigating 2026 Reality with Grounded Authority`,
        `The modern world will continually attempt to rush you, distract you, or seduce you into superficial conformity. Your greatest power is your ability to stand rooted like an ancient cedar—discerning what is real, offering loyalty where it is reciprocated, and refusing to compromise your inner compass.`,
        "",
        `### Final Benediction`,
        `You are moving through an evolutionary journey from defensive self-reliance toward grounded, generative sovereignty—a sanctuary of wisdom and strength in a modern world that deeply needs both. Trust your timing, honor your rhythm, and step forward with confidence.`
      ].join("\n");
  }
}

export async function generateChapter(
  chart: ChartResult,
  mode: ReadingMode,
  intelligence: string,
  chapterId: ReadingChapterId,
  completedChapters: string[] = [],
  analysis = "",
  question = "",
  synthesisContext = ""
) {
  const chapter = READING_CHAPTERS.find(item => item.id === chapterId);
  if (!chapter) throw new Error("That reading chapter is not available.");
  const master = await buildMasterPipeline(chart, mode, question || chapter.title);
  const masterContext = formatCompactMasterGateContext(master);
  const evidencePacket = buildAstrologyEvidencePacket(
    chart,
    `${question ? `User question: ${question}\n\n` : ""}Chapter focus: ${chapter.title}. ${chapter.focus}`,
    mode
  );
  const facts = `${masterContext}\n\n${buildEvidenceSheet(chart, mode)}\n\n${formatCompactEvidencePacket(evidencePacket)}\n\n${synthesisContext}`;
  const condensedChapters = completedChapters.map((c, idx) =>
    idx < completedChapters.length - 2 && c.length > 1600
      ? c.slice(0, 1500) + "…"
      : c
  );
  const context = condensedChapters.length
    ? `Already written chapters, below. Do not repeat any point, placement meaning, scene, or advice already made in them. Stay consistent with every fact they state, and put new weight on evidence they left untouched.${chapterId === "mirror" ? " This is the Mirror: synthesize across all chapters into the few threads that actually connect them. Do not re-list evidence." : ""}\n\n${condensedChapters.join("\n\n---\n\n")}`
    : "This is the opening chapter; establish the emotional and narrative foundation.";

  try {
    const text = await ask(
      [
        { role: "system", content: chapterSystem(mode, chapter) },
        {
          role: "user",
          content: `${facts}\n\n${chapterPlan(analysis, chapterId)}\n\n${context}\n\nWrite the complete ${chapter.title} chapter now.`,
        },
      ],
      3800,
      1500
    );
    if (text && text.trim().length > 200) {
      return text;
    }
  } catch (err) {
    console.error(`[generateChapter] Synthesized chapter unavailable for ${chapterId}:`, err);
  }

  throw new Error("The synthesized chapter could not be completed. Please retry; the calculated chart remains available.");
}
export async function followUp(
  chart: ChartResult,
  interpretation: { intelligence: string; reading: string },
  history: Array<{ role: "user" | "assistant"; content: string }>,
  question: string,
  mode: ReadingMode = "combined"
) {
  const master = await buildMasterPipeline(chart, mode, question);
  const masterContext = formatCompactMasterGateContext(master);
  const evidencePacket = buildAstrologyEvidencePacket(chart, question, mode);
  const trimmedIntelligence =
    interpretation.intelligence.length > 16000
      ? interpretation.intelligence.slice(0, 16000) + "…"
      : interpretation.intelligence;
  const trimmedReading =
    interpretation.reading.length > 12000
      ? interpretation.reading.slice(0, 12000) + "…"
      : interpretation.reading;
  const messages: Message[] = [
    {
      role: "system",
      content: buildAstrologyInterpreterSystem(
        `${COSMOLOGY}\n${WORLDVIEW_GUIDANCE}\n${MODE_GUIDANCE[mode]}\n${CLARITY_FRAMEWORK}\nAnswer follow-up questions in the same life-story voice as the reading. Be a direct interpreter of the user's calculated traditional chart: listen for the fear or need beneath the question, respond with care, and then give the clearest honest answer the evidence supports. If the question concerns a transit, treat it as a full present-tense life chapter: connect the supplied transit planet to the supplied natal factor, describe the psychological pressure and protective strategy it may activate, show how that could replay in an ordinary scene, and offer a mature response plus brief fatherly counsel. Do not turn transits into deterministic forecasts. Do not produce a checklist unless the user explicitly asks for one. Place the answer inside a small narrative: what may have happened internally, how the pattern learned to protect itself, how it tends to replay in present life, and what a different choice could look like in an actual scene. Expose the chain chart factor → symbolism → inner dynamic → protective strategy → trigger/reaction/payoff/cost → behavior → example → recognition moment through flowing prose. If the user asks “why,” explain the psychological mechanism without clinical labels. Offer one practical observation or experiment, not a prescription. Include what evidence would contradict the interpretation. Use only the supplied chart and reading. If a factor was not supplied, say: “That factor was not supplied by the calculation engine, so I cannot use it reliably.” Never imply the user needs the AI in order to be safe, whole, or guided.`
      ),
    },
    {
      role: "user",
      content: `${masterContext}\n\nChart facts:\n${JSON.stringify(chartFacts(chart, mode))}\n\n${formatCompactEvidencePacket(evidencePacket)}\n\nChart Intelligence:\n${trimmedIntelligence}\n\nGenerated reading:\n${trimmedReading}`,
    },
    ...withCurrentQuestion(history, question, 12),
  ];
  return ask(messages, 5000, 1800);
}
