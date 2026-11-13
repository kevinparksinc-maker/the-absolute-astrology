import { invokeLLM, type Message } from "./_core/llm";
import { withCurrentQuestion } from "./_core/conversation";
import { buildAstrologyInterpreterSystem } from "./master-interpreter";
import {
  buildAstrologyEvidencePacket,
  formatCompactEvidencePacket,
} from "./astrologyKnowledge";
import type { ChartResult } from "./astronomy";
import {
  buildMasterPipeline,
  formatCompactMasterGateContext,
} from "./master-pipeline";

const HOST_SYSTEM = `You are The Absolute's Host Interpreter and conversational guide. Help with general questions, app navigation, and symbolic reflection naturally. For personal astrology questions, answer through the supplied chart evidence and the traditional meanings of its calculated methods. Interpret the strongest patterns directly, explain why the evidence supports the conclusion, and address contradictions. Do not impose a fixed personality, emotional narrative, cosmology lecture, or modern-life topic list. Do not invent chart facts or observed events.`;

export async function askHost(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  question: string,
  chart?: ChartResult | any,
  mode: "natal" | "transit" | "combined" = "combined",
  synthesisContext = ""
) {
  let ragContext = "";

  if (chart && typeof chart === "object" && Array.isArray(chart.movingBodies)) {
    try {
      const master = await buildMasterPipeline(chart, mode, question);
      const masterContext = formatCompactMasterGateContext(master);
      // 1. Build and format compact multi-system Evidence Packet (Vedic, Arabic, Western, Behavioral)
      const packet = buildAstrologyEvidencePacket(chart, question, mode);
      const formattedPacket = formatCompactEvidencePacket(packet);

      // 2. Synthesize concise high-impact chart highlights
      const birthLoc = chart.input?.location || "Unknown Location";
      const birthDate = chart.input?.date || "";
      const birthTime = chart.input?.time || "";
      const worldview = chart.worldview || "agent";

      const keyBodies = (chart.movingBodies || [])
        .map(
          (b: any) =>
            `- ${b.name}: ${b.display} in House ${b.house}` +
            (b.overlay?.nakshatra ? ` | Nakshatra: ${b.overlay.nakshatra} (Pada ${b.overlay.pada})` : "") +
            (b.overlay?.manzil ? ` | Manzil: ${b.overlay.manzil}` : "") +
            (b.overlay?.decan ? ` | Decan: ${b.overlay.decan}` : "") +
            (b.retrograde ? " [Retrograde]" : "")
        )
        .join("\n");

      const transitHighlights = Array.isArray(chart.transits)
        ? chart.transits
            .filter((t: any) => t.natalContacts && t.natalContacts.length > 0)
            .slice(0, 8)
            .map(
              (t: any) =>
                `- Transit ${t.name} (${t.display}) in Natal House ${t.house} contacting: ${t.natalContacts
                  .slice(0, 5)
                  .map((c: any) => `${c.natalName} (${c.aspect}, orb ${c.orb.toFixed(1)}°)`)
                  .join(", ")}`
            )
            .join("\n")
        : "";

      ragContext = `
${masterContext}

=== RETRIEVED USER CHART EVIDENCE (RAG CONTEXT) ===
CHART IDENTIFIERS:
- Birth Location: ${birthLoc}
- Birth Date & Time: ${birthDate} ${birthTime} (${chart.input?.timezone || "UTC"})
- Active Worldview: ${worldview}
- Reading Mode: ${mode}
${chart.ascendant ? `- Ascendant: ${chart.ascendant.display}` : ""}
${chart.midheaven ? `- Midheaven: ${chart.midheaven.display}` : ""}

NATAL PLACEMENTS & TRADITIONAL OVERLAYS:
${keyBodies}

${transitHighlights ? `ACTIVE TRANSIT CONTACTS:\n${transitHighlights}\n` : ""}

SYNTHESIZED MULTI-SYSTEM EVIDENCE DOSSIER:
${formattedPacket}
===================================================
`;
    } catch (error) {
      console.error("[HOST_EVIDENCE_FAILED] Full chart evidence retrieval failed:", error);
      throw new Error("HOST_EVIDENCE_FAILED: Full chart evidence is unavailable; refusing a summary-only reading.");

    }
  }

  if (synthesisContext) ragContext += `\n\nUNIFIED MASTER SYNTHESIS — COMPLETE METHOD EVIDENCE:\n${synthesisContext}`;

  const systemInstructions = [HOST_SYSTEM, ragContext].filter(Boolean);

  const messages: Message[] = [
    { role: "system", content: buildAstrologyInterpreterSystem(...systemInstructions) },
    ...withCurrentQuestion(history, question, 6),
  ];

  // Provider routing is resolved centrally by invokeLLM.
  const model = "claude-sonnet-4-6";
  const response = await invokeLLM({ model, messages, maxTokens: 1800 });
  const content = response.choices[0]?.message?.content;
  const reading = typeof content === "string" ? content.trim() : "";
  if (!reading) {
    throw new Error("HOST_AI_EMPTY_RESPONSE: AI provider returned no readable interpretation.");
  }
  return reading;
}
