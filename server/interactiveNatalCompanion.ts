import { invokeLLM, type Message } from "./_core/llm";
import type { ChartResult } from "./astronomy";
import {
  mapRequestedPlacementsToCanonicalMeaning,
  extractRequestedActors,
  FULL_CELESTIAL_ENSEMBLE,
  type CanonicalPlacementMapping,
} from "../shared/masterPlanetPersonaConfig";

export interface CompanionChatResponse {
  answer: string;
  suggestedFollowUps: string[];
  focusedPlacements: string[];
}

const COMPANION_CONSTITUTION = `You are "The Absolute Companion"—an intelligent, deeply perceptive, and empathetic master astrologer walking through the user's personal natal chart in interactive conversation.

YOUR CORE PHILOSOPHY & VOICE:
1. THE CALCULATIONS GO ON IN THE BACKGROUND:
   - The user's chart has been mathematically calculated with high precision (degrees, virupas, Egyptian bounds, Nakshatras, Manzils, house rulerships, and timing periods).
   - Use these calculations internally to ground your reasoning with pinpoint accuracy.
   - BUT NEVER dump technical calculations, orbs, virupas, bounds, degrees, or textbook dictionary records on the user.
   - Speak in warm, charismatic, grounded, plain-English "real-world people talk" (like a wise mentor, counselor, or lifelong friend having a deep conversation over coffee).

2. DEPTH, NUANCE & REAL-WORLD BEHAVIOR:
   - Go straight into what these placements mean for their everyday reality: their emotional instincts, career fulfillment, partnership dynamics, subconscious fears, self-sabotaging traps, and greatest natural superpowers.
   - Don't give generic horoscope horoscopes or surface clichés ("You are ambitious and loyal"). Instead, explain the specific psychological mechanism: why they feel a tug-of-war between their urge to protect themselves and their hunger to build something lasting.

3. DIALOGUE & INTERACTIVE CARE:
   - You are in a dynamic conversation with this person. Address them directly ("you / your life").
   - Acknowledge their question with emotional intelligence and care.
   - Keep responses focused, punchy, and vivid (usually 2 to 4 structured, rich paragraphs).
   - ALWAYS conclude with a thoughtful, reflective question that invites the user to reflect on their real-world experience (e.g., "Does that tension show up more when you're under pressure at work, or in how you handle boundaries with close friends?").

4. DO NOT DROP DATA:
   - When the user asks about specific planets, houses, or life themes, interpret them directly and show how they interact with each other.`;

/**
 * Builds the background astrological context dossier for the AI reasoning engine.
 */
function buildCompanionBackgroundDossier(
  chart: ChartResult,
  question: string,
  mode: "natal" | "transit" | "combined"
): { contextText: string; focusedPlacements: string[] } {
  const requestedActors = extractRequestedActors(question);
  const actorsToInclude = requestedActors.length > 0 ? requestedActors : [...FULL_CELESTIAL_ENSEMBLE];

  const mappings = mapRequestedPlacementsToCanonicalMeaning(chart, actorsToInclude);

  const birthLoc = chart.input?.location || "Unknown Location";
  const birthDate = chart.input?.date || "Unknown Date";
  const birthTime = chart.input?.time || "Unknown Time";

  const placementsSummary = mappings
    .map((m: CanonicalPlacementMapping) => {
      return `[${m.actor.toUpperCase()}]
- Location: ${m.sign} in House ${m.house} (${m.houseArena})
- Character Archetype: ${m.personaArchetype}
- Real-World Core Theme: ${m.realWorldTranslation.coreTheme}
- Real-World Superpower: ${m.realWorldTranslation.strengthAndPower}
- The Trap / Shadow: ${m.realWorldTranslation.humanChallenge}
- Grounded Growth Action: ${m.realWorldTranslation.growthAction}
- Natural Voice: "${m.realWorldTranslation.conversationalProse}"`;
    })
    .join("\n\n");

  const transitsSummary =
    mode !== "natal" && Array.isArray(chart.transits) && chart.transits.length > 0
      ? `CURRENT TRANSIT CONTACTS:\n` +
        chart.transits
          .slice(0, 6)
          .map((t: any) => `- Transit ${t.name} in House ${t.house} (${t.display})`)
          .join("\n")
      : "";

  const contextText = `=== BACKGROUND CHART REASONING DOSSIER (INTERNAL CONTEXT ONLY) ===
User Chart: Born in ${birthLoc} on ${birthDate} at ${birthTime}.
Mode: ${mode}

CANONICAL PLANET PERSONA MAPPINGS:
${placementsSummary}

${transitsSummary}
===================================================================`;

  return {
    contextText,
    focusedPlacements: mappings.map((m: CanonicalPlacementMapping) => m.actor),
  };
}

/**
 * Generates context-aware suggested follow-up questions based on the question and chart.
 */
function generateSuggestedFollowUps(question: string, focusedActors: string[]): string[] {
  const q = question.toLowerCase();

  if (q.includes("career") || q.includes("work") || q.includes("money") || q.includes("purpose")) {
    return [
      "What kind of work environment gives me energy versus burns me out?",
      "How do my finances and earning power connect to my chart?",
      "What is my biggest professional blind spot when dealing with leadership?",
    ];
  }

  if (q.includes("relationship") || q.includes("love") || q.includes("partner") || q.includes("marriage")) {
    return [
      "What repeating pattern in relationships am I ready to break?",
      "What kind of partner genuinely balances my emotional temperament?",
      "How do I show love versus what I secretly need in return?",
    ];
  }

  if (q.includes("moon") || q.includes("emotion") || q.includes("security") || q.includes("fear")) {
    return [
      "What does my Moon need when I feel overwhelmed or misunderstood?",
      "How do my Sun and Moon work together or create tension inside me?",
      "What is my instinctual coping mechanism when stressed?",
    ];
  }

  if (q.includes("node") || q.includes("rahu") || q.includes("ketu") || q.includes("destiny")) {
    return [
      "What old comfort zone from my South Node is holding me back?",
      "What is the practical first step to leaning into my North Node?",
      "How does my life purpose unfold over the next few years?",
    ];
  }

  const actor = focusedActors[0] || "Sun";
  return [
    `How does my ${actor} interact with the rest of my core chart?`,
    "What is the biggest personal challenge I came into this life to master?",
    "Walk me through what my chart says about my personal timing right now.",
  ];
}

/**
 * Deterministic fallback if LLM is temporarily offline or rate-limited.
 */
function buildDeterministicCompanionAnswer(
  chart: ChartResult,
  question: string,
  mappings: CanonicalPlacementMapping[]
): string {
  const primary = mappings[0] || mappings.find((m: CanonicalPlacementMapping) => m.actor === "Sun");
  if (!primary) {
    return `Looking across your chart, the celestial geometry points toward a continuous dialogue between your natural instinct for self-reliance and your need for authentic emotional security. What area of your life—career, relationships, or personal timing—feels like it needs the most attention right now?`;
  }

  const secondary = mappings[1] || mappings.find((m: CanonicalPlacementMapping) => m.actor === "Moon") || primary;

  return `When we look closely at your question through your chart, the core pattern centers on your **${primary.actor} in ${primary.sign} (House ${primary.house})** and its connection to your **${secondary.actor} in ${secondary.sign}**.

${primary.realWorldTranslation.conversationalProse}

In your daily life, your superpower here is ${primary.realWorldTranslation.strengthAndPower.toLowerCase()} But the trap you have to watch out for is ${primary.realWorldTranslation.humanChallenge.toLowerCase()}

Meanwhile, your ${secondary.actor} brings another crucial dimension: ${secondary.realWorldTranslation.coreTheme}

Together, these placements show that your real growth comes when you stop feeling you have to compromise one side of yourself to satisfy the other. How does this dynamic currently play out in what you're dealing with?`;
}

/**
 * Main entry point for the Interactive Natal Chart Reasoning AI.
 */
export async function interactiveNatalChat(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  question: string,
  chart: ChartResult,
  mode: "natal" | "transit" | "combined" = "natal"
): Promise<CompanionChatResponse> {
  const { contextText, focusedPlacements } = buildCompanionBackgroundDossier(chart, question, mode);
  const mappings = mapRequestedPlacementsToCanonicalMeaning(chart, focusedPlacements);

  const messages: Message[] = [
    {
      role: "system",
      content: `${COMPANION_CONSTITUTION}\n\n${contextText}`,
    },
  ];

  // Append recent conversational turns (up to last 8 turns)
  const recentHistory = history.slice(-8);
  for (const h of recentHistory) {
    messages.push({
      role: h.role,
      content: h.content,
    });
  }

  // Append current user question
  messages.push({
    role: "user",
    content: question,
  });

  let answer = "";
  try {
    const response = await invokeLLM({
      model: "gemini-3.8-flash",
      messages,
      maxTokens: 1800,
    });

    const choice = response.choices[0]?.message?.content;
    if (typeof choice === "string" && choice.trim().length > 0) {
      answer = choice.trim();
    } else if (Array.isArray(choice)) {
      answer = choice
        .map((p: any) => (typeof p === "string" ? p : p.text || ""))
        .join("\n")
        .trim();
    }
  } catch (error) {
    console.warn("[InteractiveNatalCompanion] LLM invocation failed, using deterministic real-world answer:", error);
  }

  if (!answer || answer.trim().length === 0) {
    answer = buildDeterministicCompanionAnswer(chart, question, mappings);
  }

  const suggestedFollowUps = generateSuggestedFollowUps(question, focusedPlacements);

  return {
    answer,
    suggestedFollowUps,
    focusedPlacements,
  };
}
