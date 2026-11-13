import { ENV } from "../_core/env";
import { invokeLLM, type Message } from "../_core/llm";
import type { HoraryChart } from "../horary";

export type GroqHoraryRequest = {
  question: string;
  verdict: string;
  score: number;
  significators: {
    querent: string;
    matter: string;
    moon: {
      sign: string;
      house: number;
      voidOfCourse: boolean;
      status: string;
    };
  };
  threeWheels: {
    godView: {
      summary: string;
      placementsCount: number;
      dominantCondition: string;
    };
    transitMoment: {
      location: string;
      askedAt: string;
      ascendant: string;
      applyingAspects: Array<{ aspect: string; orb: number; phase: string }>;
      perfection: string[];
    };
    natalFoundation?: {
      present: boolean;
      sun?: string;
      moon?: string;
      ascendant?: string;
      contacts: string[];
    };
  };
  technicalEvidence: string;
};

/**
 * Translates the 3-wheel HoraryChart structure (God View, Transit Moment, Natal Foundation)
 * into a structured high-speed prompt formatted specifically for Groq LLM inference.
 */
export function translateHoraryToGroqRequest(chart: HoraryChart): GroqHoraryRequest {
  const primaryRuler = chart.subject === "querent" ? chart.querentRuler : chart.subjectRuler;
  const directAspect = chart.relevantAspects.find(
    aspect =>
      (aspect.first === primaryRuler && aspect.second === chart.topicRuler) ||
      (aspect.first === chart.topicRuler && aspect.second === primaryRuler)
  );

  const godPlacements = chart.godChart.movingBodies;
  const godSummary = `God View encompasses ${godPlacements.length} celestial bodies in the universal geocentric coordinate frame without horizon distortion.`;

  const applyingAspects = chart.relevantAspects
    .filter(a => a.phase === "applying")
    .map(a => ({ aspect: `${a.first} ${a.aspect} ${a.second}`, orb: a.orb, phase: a.phase }));

  const perfectionDesc = chart.traditional.perfection.map(p => p.description);

  const natalFoundation = chart.natalChart
    ? {
        present: true,
        sun: chart.natalChart.movingBodies.find(b => b.name === "Sun")?.display,
        moon: chart.natalChart.movingBodies.find(b => b.name === "Moon")?.display,
        ascendant: chart.natalChart.ascendant?.display,
        contacts: chart.transitChart.transits
          .flatMap(row => row.natalContacts.map(c => `${row.name} ${c.aspect} natal ${c.natalName} (${c.orb}°)`))
          .slice(0, 6),
      }
    : {
        present: false,
        contacts: [],
      };

  return {
    question: chart.question,
    verdict: chart.traditional.judgment.verdict,
    score: chart.traditional.judgment.score,
    significators: {
      querent: primaryRuler,
      matter: chart.topicRuler,
      moon: {
        sign: chart.moon.sign,
        house: chart.moon.house,
        voidOfCourse: chart.traditional.moonStatus.voidOfCourse,
        status: chart.traditional.moonStatus.explanation,
      },
    },
    threeWheels: {
      godView: {
        summary: godSummary,
        placementsCount: godPlacements.length,
        dominantCondition: directAspect ? `${directAspect.first} ${directAspect.aspect} ${directAspect.second}` : "No direct major aspect",
      },
      transitMoment: {
        location: chart.location,
        askedAt: chart.askedAt,
        ascendant: `${chart.ascendant.sign} (${chart.ascendant.display})`,
        applyingAspects,
        perfection: perfectionDesc,
      },
      natalFoundation,
    },
    technicalEvidence: chart.evidenceText,
  };
}

/**
 * Service function that calls Groq directly using the 3-wheel translated request.
 * Completely replaces NVIDIA for Horary inference with sub-2-second response latency.
 */
export async function synthesizeHoraryWithGroq(
  chart: HoraryChart,
  systemPrompt: string,
  timeoutMs = 25_000
): Promise<string> {
  const translated = translateHoraryToGroqRequest(chart);

  const promptContent = [
    `ACTUAL QUESTION: "${translated.question}"`,
    `CALCULATED VERDICT: ${translated.verdict} (score: ${translated.score})`,
    "",
    "--- 3-WHEEL CONCENTRIC REASONING STRUCTURE ---",
    `RING 1 (GOD VIEW - UNIVERSAL SKY):`,
    `• ${translated.threeWheels.godView.summary}`,
    `• Universal alignment: ${translated.threeWheels.godView.dominantCondition}`,
    "",
    `RING 2 (TRANSIT MOMENT - HOW THE MATTER UNFOLDS):`,
    `• Question Time & Place: ${translated.threeWheels.transitMoment.askedAt} in ${translated.threeWheels.transitMoment.location}`,
    `• Ascendant (Agent Horizon): ${translated.threeWheels.transitMoment.ascendant}`,
    `• Querent Lord: ${translated.significators.querent} | Matter Lord: ${translated.significators.matter}`,
    `• Moon: ${translated.significators.moon.sign} in House ${translated.significators.moon.house} (Void of Course: ${translated.significators.moon.voidOfCourse})`,
    `• Unfolding Perfection: ${translated.threeWheels.transitMoment.perfection.join("; ") || "None"}`,
    "",
    `RING 3 (NATAL FOUNDATION - WHO EXPERIENCES THE PATTERN):`,
    translated.threeWheels.natalFoundation?.present
      ? `• Querent Natal: Sun ${translated.threeWheels.natalFoundation.sun}, Moon ${translated.threeWheels.natalFoundation.moon}, Ascendant ${translated.threeWheels.natalFoundation.ascendant}\n• Active Transit-to-Natal Contacts: ${translated.threeWheels.natalFoundation.contacts.join("; ") || "None in orb"}`
      : `• No natal birth chart supplied. Reading evaluates universal and question-moment layers without inventing natal biography.`,
    "",
    "--- COMPACT JUDGMENT EVIDENCE ---",
    chart.judgmentEvidenceText,
    "",
    "--- FULL TECHNICAL EVIDENCE & CALCULATIONS ---",
    translated.technicalEvidence,
    "",
    "TONE AND LANGUAGE MANDATE: Speak in genuine real-world people talk! Do NOT output raw planetary degrees, minutes, speed decimals, or archaic astrology textbook jargon (such as 'the astrologer/reader relationship deserves care'). Translate every astronomical factor into what it actually means for real human people, their feelings, their relationships, and their practical decisions. Speak directly to the querent with clarity, warmth, and grounded wisdom.",
    "Synthesize the answer now directly to the querent using the 3-wheel framework."
  ].join("\n");

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: promptContent },
  ];

  const result = await invokeLLM({
    model: ENV.groqModel || "llama-3.3-70b-versatile",
    messages,
    maxTokens: 3200,
    timeoutMs,
  });

  const content = result.choices?.[0]?.message?.content;
  const text = typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content.map(part => typeof part === "string" ? part : part.type === "text" ? part.text : "").join("\n")
      : "";

  if (!text.trim()) {
    throw new Error("GROQ_EMPTY_HORARY_RESPONSE: Groq returned no readable text for this horary chart.");
  }

  return text;
}
