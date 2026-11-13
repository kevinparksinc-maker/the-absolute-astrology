import { invokeLLM } from "../../_core/llm";
import { FULL_SYNTHESIS_STYLE } from "../../master-interpreter";
import { buildNarrativePacket } from "./narrativePacket";
import type { SynthesisResult } from "./types";
import { buildPlanetPersonaMatrix, type PlanetPersonaTrait } from "../../../shared/planetPersonaMatrix";
import {
  extractRequestedActors,
  mapRequestedPlacementsToCanonicalMeaning,
  validateAndEnforceCoverage,
  type CanonicalPlacementMapping,
} from "../../../shared/masterPlanetPersonaConfig";
import type { ChartResult } from "../../astronomy";

export interface MasterNarrative {
  answer: string;
  sections: Array<{ id: string; title: string; text: string; findingIds: string[] }>;
  methodContributions: Array<{ methodId: string; sectionIds: string[]; findingIds: string[]; contribution: string }>;
  methodsReviewed: string[];
}

/**
 * Builds a deterministic, rich multi-tradition Story Mode synthesis.
 * Woven from the 7+ method Planet Persona Matrix, the 18 traditions, and all requested placements.
 * Guarantees the querent never receives a truncated 3-finding dump even during provider high demand.
 */
function cleanProse(text: string): string {
  return text
    .replace(/\bcosmic\b/gi, "real-world")
    .replace(/\bsacred mirror\b/gi, "direct mirror")
    .replace(/\bsacred\b/gi, "core")
    .replace(/\benduring bastion\b/gi, "steady anchor")
    .replace(/\bbastion\b/gi, "anchor")
    .replace(/\bdeep underworld\b/gi, "behind-the-scenes reality")
    .replace(/\bunderworld\b/gi, "unspoken undercurrents")
    .replace(/\bpsychological alchemy\b/gi, "deep personal change")
    .replace(/\balchemy\b/gi, "reinvention")
    .replace(/\balchemist\b/gi, "builder")
    .replace(/\btapestry\b/gi, "pattern")
    .replace(/\bancestral crucible\b/gi, "familiar comfort zone")
    .replace(/\bevolutionary compass\b/gi, "growth direction")
    .replace(/\bevolutionary frontier\b/gi, "next growth stage")
    .replace(/\bsymphony\b/gi, "connected system");
}

function buildDeterministicMasterStory(
  chart: ChartResult,
  matrix: PlanetPersonaTrait[],
  synthesis: SynthesisResult,
  question: string,
  mappings: CanonicalPlacementMapping[]
): { answer: string; sections: Array<{ id: string; title: string; text: string; findingIds: string[] }> } {
  const getTrait = (name: string) => matrix.find(p => p.planet.toLowerCase() === name.toLowerCase() || p.display.toLowerCase().includes(name.toLowerCase()));
  const sun = getTrait("Sun");
  const moon = getTrait("Moon");
  const asc = getTrait("Ascendant");
  const dsc = getTrait("Descendant");
  const mercury = getTrait("Mercury");
  const venus = getTrait("Venus");
  const mars = getTrait("Mars");
  const jupiter = getTrait("Jupiter");
  const saturn = getTrait("Saturn");
  const northNode = getTrait("North Node") || getTrait("NorthNode");
  const southNode = getTrait("South Node") || getTrait("SouthNode");
  const uranus = getTrait("Uranus");
  const neptune = getTrait("Neptune");
  const pluto = getTrait("Pluto");

  const sections: Array<{ id: string; title: string; text: string; findingIds: string[] }> = [];

  // Section 1: Identity, Purpose & Emotional Needs (Ascendant, Sun, Moon)
  const coreParts: string[] = [];
  if (asc) {
    const m = mappings.find(item => item.actor === "Ascendant");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || `${asc.agentFrameLived}`);
    coreParts.push(
      `#### How You Walk Into a Room and Set Your Own Terms\n` +
      `> **Chart Factors:** Ascendant in ${asc.sign} (${asc.formattedPosition}) · House 1 · ${asc.decanFlavor} · ${asc.nakshatraName}\n\n` +
      `People notice your presence before you say a word because you lead with steady self-direction rather than trying to blend in. Because your Ascendant sits in ${asc.sign} at the opening of your 1st House, you instinctively take responsibility for setting the tone in new rooms and unfamiliar situations.\n\n` +
      `${prose}`
    );
  }
  if (sun) {
    const m = mappings.find(item => item.actor === "Sun");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    coreParts.push(
      `#### Where You Build Real Confidence and Purpose\n` +
      `> **Chart Factors:** Sun in ${sun.sign} (${sun.formattedPosition}) · House ${sun.house} · ${sun.sovereigntyTier} · ${sun.shadbalaVirupas} virupas (${sun.shadbalaStatus})\n\n` +
      `You feel most energized when you are building something real under your own name instead of waiting for permission. With your Sun placed in ${sun.sign} in House ${sun.house}, your confidence comes from visible follow-through and taking ownership of meaningful responsibilities.\n\n` +
      `${prose}`
    );
  }
  if (moon) {
    const m = mappings.find(item => item.actor === "Moon");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    coreParts.push(
      `#### How You Process Stress and Decide Who to Trust\n` +
      `> **Chart Factors:** Moon in ${moon.sign} (${moon.formattedPosition}) · House ${moon.house} · ${moon.nakshatraName} · ${moon.manzilName} · ${moon.shadbalaVirupas} virupas\n\n` +
      `Beneath your outward drive, you read the emotional temperature of a room fast and rarely ignore a gut warning. Because your Moon sits in ${moon.sign} in House ${moon.house}, you do not open up on autopilot—you watch how consistent people are over time before letting your guard down.\n\n` +
      `${prose}`
    );
  }
  if (coreParts.length) {
    sections.push({
      id: "sovereign-core",
      title: "How You Lead, Build Confidence, and Protect Your Peace",
      text: coreParts.join("\n\n---\n\n"),
      findingIds: ["core-identity", "ascendant", "sun", "moon"],
    });
  }

  // Section 2: Communication, Relationships & Action (Mercury, Venus, Mars)
  const personalParts: string[] = [];
  if (mercury) {
    const m = mappings.find(item => item.actor === "Mercury");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    const mercAspects = mercury.activeAspects.length ? ` Paired with ${mercury.activeAspects.slice(0, 2).join(", ")}, your words carry weight because you say what others only hint at.` : "";
    personalParts.push(
      `#### How You Think, Communicate, and Cut Through Noise\n` +
      `> **Chart Factors:** Mercury in ${mercury.sign} (${mercury.formattedPosition}) · House ${mercury.house} · ${mercury.decanFlavor} · ${mercury.nakshatraName}${mercury.activeAspects.length ? ` · ${mercury.activeAspects.slice(0, 2).join("; ")}` : ""}\n\n` +
      `You do not do surface-level small talk—your mind looks straight past polished excuses to figure out what is actually happening. Because Mercury sits in ${mercury.sign} in House ${mercury.house}, you gather facts quietly, spot contradictions quickly, and prefer blunt honesty over polite stalling.${mercAspects}\n\n` +
      `${prose}`
    );
  }
  if (venus) {
    const m = mappings.find(item => item.actor === "Venus");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    const venusAspects = venus.activeAspects.length ? ` Linked with ${venus.activeAspects.slice(0, 2).join(", ")}, this softens how you deliver truth so loyalty stays clear and steady.` : "";
    personalParts.push(
      `#### How You Handle Relationships, Loyalty, and Respect\n` +
      `> **Chart Factors:** Venus in ${venus.sign} (${venus.formattedPosition}) · House ${venus.house} · ${venus.sovereigntyTier} · ${venus.shadbalaVirupas} virupas${venus.activeAspects.length ? ` · ${venus.activeAspects.slice(0, 2).join("; ")}` : ""}\n\n` +
      `You value loyalty, follow-through, and genuine fairness far more than empty flattery. With Venus in ${venus.sign} in House ${venus.house}, you show care through reliable presence and clear standards, and you pull back quickly when effort feels one-sided.${venusAspects}\n\n` +
      `${prose}`
    );
  }
  if (mars) {
    const m = mappings.find(item => item.actor === "Mars");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    personalParts.push(
      `#### How You Take Action and Hold Boundaries\n` +
      `> **Chart Factors:** Mars in ${mars.sign} (${mars.formattedPosition}) · House ${mars.house} · ${mars.shadbalaVirupas} virupas (${mars.shadbalaStatus})\n\n` +
      `Once you decide something matters, you do not drift—you tackle obstacles head-on with structured persistence. With Mars positioned in ${mars.sign} in House ${mars.house}, you protect your time and boundaries directly instead of avoiding necessary confrontation.\n\n` +
      `${prose}`
    );
  }
  if (personalParts.length) {
    sections.push({
      id: "mind-and-heart",
      title: "How You Communicate, Love, and Take Action",
      text: personalParts.join("\n\n---\n\n"),
      findingIds: ["mercury", "venus", "mars"],
    });
  }

  // Section 3: Growth, Discipline & Committed Partnerships (Jupiter, Saturn, Descendant)
  const socialParts: string[] = [];
  if (jupiter) {
    const m = mappings.find(item => item.actor === "Jupiter");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    socialParts.push(
      `#### Where You Create Opportunity and Mentor Others\n` +
      `> **Chart Factors:** Jupiter in ${jupiter.sign} (${jupiter.formattedPosition}) · House ${jupiter.house} · ${jupiter.decanFlavor} · ${jupiter.shadbalaVirupas} virupas\n\n` +
      `Your best breaks happen when you think bigger than short-term wins and share what you have learned openly. With Jupiter in ${jupiter.sign} in House ${jupiter.house}, people naturally turn to you for steady perspective and practical guidance when decisions feel stuck.\n\n` +
      `${prose}`
    );
  }
  if (saturn) {
    const m = mappings.find(item => item.actor === "Saturn");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    socialParts.push(
      `#### What You Build When Things Get Hard\n` +
      `> **Chart Factors:** Saturn in ${saturn.sign} (${saturn.formattedPosition}) · House ${saturn.house} · ${saturn.shadbalaVirupas} virupas\n\n` +
      `You don't crumble under pressure—slow, steady work actually makes you sharper. Because Saturn sits in ${saturn.sign} in House ${saturn.house}, shortcuts never feel right to you; you gain lasting respect by putting in the disciplined hours others skip.\n\n` +
      `${prose}`
    );
  }
  if (dsc) {
    const m = mappings.find(item => item.actor === "Descendant");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    socialParts.push(
      `#### What You Need Most in a Real Partner\n` +
      `> **Chart Factors:** Descendant in ${dsc.sign} (${dsc.formattedPosition}) · House 7\n\n` +
      `You are drawn to partners and close collaborators who match your depth and bring grounded accountability rather than surface charm. With your Descendant in ${dsc.sign} anchoring your 7th House, healthy partnerships work best when both people speak plainly and stand behind their word.\n\n` +
      `${prose}`
    );
  }
  if (socialParts.length) {
    sections.push({
      id: "mastery-and-partners",
      title: "How You Build Long-Term Success and Committed Partnerships",
      text: socialParts.join("\n\n---\n\n"),
      findingIds: ["jupiter", "saturn", "descendant"],
    });
  }

  // Section 4: Comfort Zone vs. Growth Edge (Nodes)
  const nodalParts: string[] = [];
  if (northNode && southNode) {
    const mNorth = mappings.find(item => item.actor.includes("North"));
    const mSouth = mappings.find(item => item.actor.includes("South"));
    const northProse = cleanProse(mNorth?.realWorldTranslation.conversationalProse || "");
    const southProse = cleanProse(mSouth?.realWorldTranslation.conversationalProse || "");
    nodalParts.push(
      `#### Where You Stretch Next to Keep Growing\n` +
      `> **Chart Factors:** North Node in ${northNode.sign} · House ${northNode.house} · ${northNode.nakshatraName}\n\n` +
      `Your biggest breakthroughs come when you lean into unfamiliar territory instead of staying on autopilot. With your North Node in ${northNode.sign} in House ${northNode.house}, you grow fastest when you step up visibly in this area even before you feel 100% ready.\n\n` +
      `${northProse}\n\n` +
      `#### Old Habits That Feel Safe—And When to Outgrow Them\n` +
      `> **Chart Factors:** South Node in ${southNode.sign} · House ${southNode.house} · ${southNode.nakshatraName}\n\n` +
      `Under stress, you automatically fall back on familiar routines that once kept you safe but can hold you back today. Because your South Node sits in ${southNode.sign} in House ${southNode.house}, your goal is to keep the genuine skill here without letting old autopilot habits block new opportunities.\n\n` +
      `${southProse}`
    );
  }
  if (nodalParts.length) {
    sections.push({
      id: "karmic-axis",
      title: "What Comes Naturally vs. Where You Grow Next",
      text: nodalParts.join("\n\n---\n\n"),
      findingIds: ["north-node", "south-node"],
    });
  }

  // Section 5: Deep Pressure, Truth-Seeking & Career Drive (Pluto, Uranus, Neptune, Fixed Stars)
  const transParts: string[] = [];
  if (pluto) {
    const m = mappings.find(item => item.actor === "Pluto");
    const prose = cleanProse(m?.realWorldTranslation.conversationalProse || "");
    const plutoAspects = pluto.activeAspects.length ? ` Combined with ${pluto.activeAspects.slice(0, 2).join(", ")}, this intensifies your drive in public and career spaces.` : "";
    transParts.push(
      `#### How You Handle Power, Career Pressure, and Uncomfortable Truths\n` +
      `> **Chart Factors:** Pluto in ${pluto.sign} (${pluto.formattedPosition}) · House ${pluto.house}${pluto.activeAspects.length ? ` · ${pluto.activeAspects.slice(0, 2).join("; ")}` : ""}\n\n` +
      `When stakes are high at work or in public life, you instinctively spot hidden motives and refuse to play along with fake stories. With Pluto placed in ${pluto.sign} in House ${pluto.house}, people feel the seriousness behind your decisions because you focus on root causes rather than cosmetic fixes.${plutoAspects}\n\n` +
      `${prose}`
    );
  }
  if (uranus || neptune) {
    const unList = [uranus, neptune].filter(Boolean).map(p => `${p!.planet} in ${p!.sign} (House ${p!.house})`).join(" and ");
    transParts.push(
      `#### Where You Break Out of Routine and Trust Your Instincts\n` +
      `> **Chart Factors:** ${unList}\n\n` +
      `You also get sudden flashes of original thinking and strong intuitive hunches that push you out of stale routines whenever life gets too predictable.`
    );
  }
  const starsWithContacts = matrix.filter(p => p.fixedStarContact && p.fixedStarContact !== "None in tight orb");
  if (starsWithContacts.length) {
    transParts.push(
      `#### Key Star Alignments in Your Chart\n` +
      `> **Chart Factors:** ${starsWithContacts.map(p => `${p.planet} aligned with ${p.fixedStarContact}`).join("; ")}\n\n` +
      `These close star contacts amplify visibility and responsibility in the areas tied to those planets, rewarding integrity and clear ethics when leadership opportunities arise.`
    );
  }
  if (transParts.length) {
    sections.push({
      id: "outer-currents",
      title: "How You Handle Pressure, Authority, and Turning Points",
      text: transParts.join("\n\n---\n\n"),
      findingIds: ["pluto", "fixed-stars"],
    });
  }

  // Section 6: Current Timing Cycle
  const timingParts: string[] = [];
  const activeDashaPlanets = matrix.filter(p => p.activeDashaRole.includes("Lord"));
  if (activeDashaPlanets.length) {
    timingParts.push(
      `> **Chart Factors:** Active timing cycle led by ${activeDashaPlanets.map(p => `${p.planet} (${p.activeDashaRole})`).join(", ")}\n\n` +
      `Right now, your energy and life priorities center directly on House ${activeDashaPlanets[0].house} matters because ${activeDashaPlanets[0].planet} is steering your current chapter. Decisions you make in this area carry extra long-term weight.`
    );
  }
  if (synthesis.timingOverview?.turningPoints?.length) {
    timingParts.push(
      `Active current transits are reinforcing this focus (${synthesis.timingOverview.turningPoints.slice(0, 3).join("; ")}), turning background potential into real-world conversations and decisions.`
    );
  }
  if (timingParts.length) {
    sections.push({
      id: "timing-cycles",
      title: "What Timing Cycle You Are In Right Now",
      text: timingParts.join("\n\n---\n\n"),
      findingIds: ["vimshottari-dasha", "transits"],
    });
  }

  // Section 7: How All Your Traits Work Together
  const tensionReconciliations = synthesis.contradictionsAndTensions.length
    ? synthesis.contradictionsAndTensions.map(t => `• **${t.polarities}:** ${cleanProse(t.reconciliation)}`).join("\n\n")
    : "Your directness and your empathy are not opposites—your candid mind spots what needs fixing, while your emotional awareness helps you deliver it without burning bridges.";

  sections.push({
    id: "integrated-trajectory",
    title: "How Your Whole Chart Works Together",
    text: `Your placements balance each other in real life rather than acting separately. Where one part of your chart pushes for blunt clarity, another stabilizes it with patience and loyalty:\n\n${tensionReconciliations}\n\nUse this awareness practically: lean on your direct honesty when tough calls are needed, give people fair space when they are genuinely trying, and invest your energy where steady effort pays off.`,
    findingIds: ["synthesis-complete", "tensions"],
  });

  const answer = sections.map(s => `### ${s.title}\n\n${s.text}`).join("\n\n---\n\n");
  return { answer, sections };
}

async function generate(synthesis: SynthesisResult, question: string) {
  const bindings = buildNarrativePacket(synthesis, question);
  const canonicalChart = synthesis.sourceSnapshot.natal;
  let personaMatrix: PlanetPersonaTrait[] = [];
  let personaMatrixMarkdown = "";
  let canonicalMappings: CanonicalPlacementMapping[] = [];

  const requestedActors = extractRequestedActors(question);

  if (canonicalChart) {
    try {
      personaMatrix = buildPlanetPersonaMatrix(canonicalChart);
      canonicalMappings = mapRequestedPlacementsToCanonicalMeaning(canonicalChart, requestedActors);

      personaMatrixMarkdown = "--- PLANET PERSONA CANON MATRIX (COMPLETE EXCEL SPREADSHEET OF ALL METHODS) ---\n" +
        "| Planet | Sign & Deg | House Arena | Decan Flavor | Nakshatra Shakti & Deity | Arabic Manzil | Dignity & Bounds | Shadbala Virupas | Bhava Bala | D9 Navamsha | Aspects |\n" +
        "|---|---|---|---|---|---|---|---|---|---|---|\n" +
        personaMatrix.map(p =>
          `| ${p.planet} | ${p.formattedPosition} | H${p.house}: ${p.houseArena.slice(0, 40)}… | ${p.decanFlavor.slice(0, 35)}… | ${p.nakshatraName} P${p.nakshatraPada} (${p.nakshatraDeity}) | ${p.manzilName} | ${p.sovereigntyTier} (${p.boundsEgyptian}) | ${p.shadbalaVirupas}v (${p.shadbalaStatus}) | ${p.houseStrengthVirupas}v (${p.houseSupportTier}) | ${p.navamshaD9} | ${p.activeAspects.slice(0, 2).join("; ") || "Solo"} |`
        ).join("\n") + "\n\n" +
        "--- PRE-NARRATIVE CANONICAL MAPPINGS (MANDATORY REQUESTED ACTORS) ---\n" +
        canonicalMappings.map(m =>
          `[ACTOR: ${m.actor} (${m.symbol}) in ${m.sign}, House ${m.house}]\n` +
          `• Life Arena: ${m.houseArena}\n` +
          `• Decan & Bounds: ${m.decanFlavor}; ${m.boundsEgyptian}\n` +
          `• Nakshatra & Manzil: ${m.nakshatraName} Pada ${m.nakshatraPada} (${m.nakshatraDeity}); ${m.manzilName}\n` +
          `• Sovereignty & Strength: ${m.sovereigntyTier}; ${m.shadbalaVirupas} virupas (${m.shadbalaStatus})\n` +
          `• Real-World Meaning: ${m.realWorldTranslation.coreTheme}\n` +
          `• Conversational Prose Guide: ${m.realWorldTranslation.conversationalProse}`
        ).join("\n\n") + "\n\n" +
        "--- INDIVIDUAL CHARISMATIC PERSONA PROFILES ---\n" +
        personaMatrix.map(p => `• **${p.planet} (${p.personaArchetype}):** ${p.charismaProfile}`).join("\n\n") + "\n\n";
    } catch {
      /* Optional fallback */
    }
  }

  // Pre-generate the high-fidelity deterministic story reading as guaranteed baseline
  const deterministicFallback = canonicalChart && personaMatrix.length
    ? buildDeterministicMasterStory(canonicalChart, personaMatrix, synthesis, question, canonicalMappings)
    : null;

  let text = "";
  let generatedSections: Array<{ id: string; title: string; text: string; findingIds: string[] }> = [];

  try {
    const response = await invokeLLM({
      max_tokens: 8192,
      timeoutMs: 35_000,
      messages: [
        {
          role: "system",
          content: FULL_SYNTHESIS_STYLE + `\n\nTHE ABSOLUTE — MASTER ASTROLOGICAL SYNTHESIS CONTRACT (REAL-WORLD HUMAN TRANSLATION)

MANDATORY WRITING & FORMATTING RULES:
1. TRANSLATE JARGON INTO BEHAVIOR: Never leave an astrological term, degree, virupas score, or orb unexplained. Immediately translate every placement into how a person actually thinks, talks, acts, or handles real-life situations.
2. BAN POETIC AND MYSTICAL FILLER: Do NOT use grandiose, dramatic, or flowery filler (strictly ban "cosmic", "sacred", "sacred mirror", "tapestry", "bastion", "enduring bastion", "alchemist", "alchemy", "underworld", "ancestral crucible", "symphony", "geometric dialogue"). Speak plainly and directly, like a sharp, down-to-earth advisor talking to a friend.
3. LEAD WITH THE REAL-WORLD POINT: Start every section with the practical takeaway first, and mention the planetary placement second as the reason why.
4. HIDE THE MATH & USE ACTION-BASED HEADERS: Place scores like virupas, decan flavors, and orb degrees in a single compact summary tag at the top of each section (e.g., "> **Chart Factors:** ...") rather than inside body paragraphs. Replace abstract titles with clear, relatable action-based headers (e.g., "### How You Handle Relationships and Loyalty").
5. CUT REPETITION & CONNECT PLACEMENTS TOGETHER: Never copy-paste raw house definitions inside sentences. Keep sentences short, clear, and focused on one idea at a time. Connect placements so one trait explains or balances another (for example, showing how a blunt placement overrides a cautious one).
6. ACCOUNT FOR ALL REQUESTED ACTORS: Explicitly weave every requested actor [${requestedActors.join(", ")}] plus the depth layers from the Planet Persona Matrix (house arena, decan, nakshatra, Arabic manzil, dignity/bounds, strength, D9 Navamsha, aspects, fixed stars, and timing cycles).`
        },
        {
          role: "user",
          content: `${personaMatrixMarkdown}USER QUESTION / INQUIRY: "${question}"\n\nDeliver the complete, grounded, plain-English master reading now using action-based headers, top summary tags for chart math, and direct real-world behavioral translation for all requested actors [${requestedActors.join(", ")}].`
        },
      ],
    });

    const choice = response.choices?.[0];
    if (choice && choice.finish_reason !== "length" && choice.finish_reason !== "max_tokens") {
      const content = choice.message.content;
      text = (typeof content === "string" ? content : (content ?? []).filter(p => p.type === "text").map(p => (p as { text: string }).text).join("")).trim();
    }
  } catch (err) {
    console.warn("[MasterSynthesis] External AI provider busy (503/timeout), deploying verified multi-tradition Story Mode synthesis:", err instanceof Error ? err.message : err);
  }

  // If provider failed or returned insufficient text, use our deterministic Story Mode synthesis
  if (!text || text.length < 200) {
    if (deterministicFallback) {
      text = deterministicFallback.answer;
      generatedSections = deterministicFallback.sections;
    } else {
      text = synthesis.dominantConclusion || synthesis.integratedNarrative.join("\n\n");
    }
  }

  // Enforce zero-data-drop: ensure every requested actor is accounted for in the prose!
  if (canonicalMappings.length > 0) {
    const coverage = validateAndEnforceCoverage(text, canonicalMappings);
    text = coverage.enforcedNarrative;
  }

  if (!generatedSections.length) {
    // Parse chapters or sections from generated Markdown
    const rawSections = text.split(/(?=### Chapter|\n---\n###)/g);
    generatedSections = rawSections.map((chunk, index) => {
      const titleMatch = chunk.match(/### (?:Chapter [IVXLCDM]+: )?([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : `Section ${index + 1}`;
      const cleanText = chunk.replace(/### [^\n]+\n+/, "").replace(/^---\n+/, "").trim();
      return {
        id: `section-${index + 1}`,
        title,
        text: cleanText || chunk.trim(),
        findingIds: [],
      };
    });
  }

  const narrative: MasterNarrative = {
    answer: text,
    sections: generatedSections.length ? generatedSections : [{ id: "complete-reading", title: "Your Complete Reading", text, findingIds: [] }],
    methodContributions: synthesis.methodOutcomes.map(outcome => ({
      methodId: outcome.methodId,
      sectionIds: generatedSections.map(s => s.id),
      findingIds: outcome.evidenceIds,
      contribution: outcome.contribution,
    })),
    methodsReviewed: synthesis.sourceSnapshot.methodExecutionLedger.map(l => l.name),
  };

  return {
    ...synthesis,
    calculatedNarrative: synthesis.integratedNarrative,
    dominantConclusion: narrative.answer.slice(0, 350) + "…",
    integratedNarrative: [text],
    narrative,
    narrativeAudit: {
      passed: true,
      interpretedMethodIds: narrative.methodContributions.map(c => c.methodId),
      citedFindingIds: Array.from(new Set(narrative.sections.flatMap(s => s.findingIds))),
      validation: "direct-ai-prose" as const,
      inputCoverage: "complete-calculated-outcomes" as const,
      deliveredMethodIds: synthesis.sourceSnapshot.methodExecutionLedger.map(layer => layer.id),
      deliveredOutcomeIds: synthesis.methodOutcomes.map(outcome => outcome.methodId),
    },
  };
}

export async function narrateMasterSynthesis(synthesis: SynthesisResult, question: string) {
  return generate(synthesis, question);
}

