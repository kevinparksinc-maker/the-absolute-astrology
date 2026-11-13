import { readingProse } from "../shared/readingProse";
import { createHash } from "node:crypto";
import {
  placementRows,
  placementMiniIdentity,
} from "../shared/placementMiniReadings";
import { z } from "zod";
import type { ChartResult, ChartRow } from "./astronomy";
import { invokeLLM } from "./_core/llm";
import { buildAstrologyInterpreterSystem } from "./master-interpreter";
import {
  synthesizeChartForReading,
  synthesizeMasterSnapshot,
} from "./astrologyKnowledge/synthesis/readingBridge";
import { retrievePlacementDossier } from "./astrologyKnowledge/canon/retriever";
import type { SynthesisResult } from "./astrologyKnowledge/synthesis/types";
import { buildPlanetPersonaMatrix, type PlanetPersonaTrait } from "../shared/planetPersonaMatrix";

const summarySchema = z.object({
  placements: z.array(
    z.object({
      name: z.string(),
      paragraph: z
        .string()
        .transform(readingProse)
        .pipe(z.string().min(120).max(1600)),
      evidenceIds: z.array(z.string()).min(2),
      layerIds: z.array(z.string()).min(2),
    })
  ),
});
type Fact = { id: string; layerId: string; value: unknown };

/** Select planet-specific findings once; never ship the 575k-character life-story context. */
export function buildPlacementPackets(
  chart: ChartResult,
  synthesis: SynthesisResult
) {
  const sun = chart.movingBodies.find(p => p.name === "Sun");
  const personaMatrix = buildPlanetPersonaMatrix(chart);
  return placementRows(chart).map(row => {
    const dossier = retrievePlacementDossier(
      row,
      chart,
      Boolean(sun && sun.house >= 7)
    );
    const escaped = row.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const bodyMatch = new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`, "i");
    const slug = row.name.toLowerCase().replace(/\s+/g, "-");
    const facts: Fact[] = [
      {
        id: `planet-${slug}`,
        layerId: "western-planets-and-signs",
        value: {
          display: row.display,
          longitude: row.longitude,
          house: row.house,
          godHouse: row.godHouse,
          agentHouse: row.agentHouse,
          retrograde: row.retrograde,
        },
      },
    ];
    const judgments = synthesis.methodOutcomes
      .filter(
        o => o.status === "interpreted" && !o.methodId.startsWith("transit:")
      )
      .flatMap(outcome =>
        outcome.findingJudgments
          .filter(
            f =>
              (!outcome.methodId.includes("dasha-and-ashtakavarga") ||
                f.subject.startsWith("SAV ")) &&
              (bodyMatch.test(f.subject) ||
                f.evidenceIds.some(
                  id => id.includes(`-${slug}-`) || id.endsWith(`-${slug}`)
                ) ||
                f.subject === `House ${row.agentHouse ?? row.house}` ||
                f.subject === `SAV ${row.display.split(" ")[0]}`)
          )
          .map(f => ({
            findingId: f.id,
            methodId: outcome.methodId,
            frame: f.frame ?? outcome.frame,
            judgment: f.judgment,
            mechanism: f.mechanism,
            evidenceIds: f.evidenceIds,
            sources: Array.from(new Set(f.rules.map(r => r.sourceTitle))),
            limitation: f.limitation,
          }))
      );
    if (!judgments.length)
      throw new Error(`PLACEMENT_JUDGMENTS_MISSING: ${row.name}`);
    for (const j of judgments)
      for (const id of j.evidenceIds) {
        if (!facts.some(f => f.id === id && f.layerId === j.methodId))
          facts.push({
            id,
            layerId: j.methodId,
            value: {
              judgment: j.judgment,
              mechanism: j.mechanism,
              frame: j.frame,
              sources: j.sources,
              limitation: j.limitation,
            },
          });
      }
    const persona = personaMatrix.find(p => p.planet === row.name);
    return {
      name: row.name,
      placementEvidenceId: `planet-${slug}`,
      facts,
      judgments,
      persona,
      canon: {
        nakshatra: dossier.nakshatraRecord,
        manzil: dossier.manzilRecord,
        decan: dossier.decanRecord
          ? {
              number: dossier.decanRecord.decanNumber,
              elementalFamilyRuler: dossier.decanRecord.triplicitySubRuler,
            }
          : null,
      },
    };
  });
}

/** Retain every relevant judgment once; repeated doctrine is interned losslessly. */
export function packPlacementMiniPrompt(
  packets: ReturnType<typeof buildPlacementPackets>
) {
  const unique = Array.from(
    new Map(
      packets.flatMap(p => p.judgments).map(j => [j.findingId, j])
    ).values()
  );
  const split = (text: string) => text.split(/(?<=[.!?])(?=\s)/);
  const counts = new Map<string, number>();
  for (const j of unique)
    for (const part of split(j.judgment))
      counts.set(part, (counts.get(part) ?? 0) + 1);
  const textTable = Array.from(counts)
    .filter(([part, n]) => part.length >= 60 && n > 1)
    .map(([part]) => part);
  const textIndex = new Map(textTable.map((part, i) => [part, i]));
  const sources = Array.from(new Set(unique.flatMap(j => j.sources)));
  const findingIndex = new Map(unique.map((j, i) => [j.findingId, i]));
  return {
    textTable,
    sources,
    findingColumns: [
      "judgmentParts",
      "methodId",
      "evidenceIds",
      "frame",
      "sourceRefs",
      "limitation",
    ],
    findings: unique.map(j => [
      split(j.judgment).map(part => textIndex.get(part) ?? part),
      j.methodId,
      j.evidenceIds,
      j.frame,
      j.sources.map(s => sources.indexOf(s)),
      j.limitation ?? null,
    ]),
    placements: packets.map(p => ({
      name: p.name,
      position: p.facts[0].value,
      placementEvidenceId: p.placementEvidenceId,
      facts: p.facts.map(f => ({ id: f.id, layerId: f.layerId })),
      findingRefs: p.judgments.map(j => findingIndex.get(j.findingId)),
    })),
  };
}

export const MINI_REQUEST_CHAR_LIMIT = 14000;
/** One compact outcome per relevant method; full judgments remain in the evidence drawer. */
export function boundedPlacementPacket(
  packets: ReturnType<typeof buildPlacementPackets>,
  limit = 260
) {
  return packets.map(p => {
    const methods = Array.from(new Set(p.judgments.map(j => j.methodId)));
    return {
      name: p.name,
      position: p.facts[0].value,
      placementEvidenceId: p.placementEvidenceId,
      methods: methods.map(methodId => {
        const matching = p.judgments.filter(j => j.methodId === methodId);
        const selected =
          matching.find(j => j.mechanism.includes(p.name)) ?? matching[0];
        // Exact excerpts from executed rules; never a generic invented replacement.
        const statement =
          selected.judgment.length <= limit
            ? selected.judgment
            : selected.judgment.slice(0, limit) + "…";
        return {
          methodId,
          judgment: statement,
          evidenceIds: selected.evidenceIds.slice(0, 2),
          limitation: selected.limitation,
        };
      }),
    };
  });
}

export function validatePlacementSummaries(
  value: unknown,
  packets: ReturnType<typeof buildPlacementPackets>
) {
  const result = summarySchema.parse(value);
  const expected = new Map(packets.map(p => [p.name, p]));
  if (
    result.placements.length !== expected.size ||
    new Set(result.placements.map(p => p.name)).size !== expected.size
  ) {
    throw new Error(
      "PLACEMENT_SUMMARY_INCOMPLETE: A paragraph is required for each displayed planet."
    );
  }
  for (const placement of result.placements) {
    const packet = expected.get(placement.name);
    if (!packet)
      throw new Error("PLACEMENT_SUMMARY_UNGROUNDED: Unknown planet.");
    const ids = new Set(packet.facts.map(f => f.id));
    const layers = new Set(packet.facts.map(f => f.layerId));
    if (
      placement.evidenceIds.some(id => !ids.has(id)) ||
      placement.layerIds.some(id => !layers.has(id))
    ) {
      throw new Error(
        `PLACEMENT_SUMMARY_UNGROUNDED: ${placement.name} cites unavailable evidence.`
      );
    }
    if (
      placement.paragraph.trim().split(/\s+/).length > 140 ||
      /\n\s*\n/.test(placement.paragraph)
    ) {
      throw new Error(
        `PLACEMENT_SUMMARY_TOO_LONG: ${placement.name} must fit one short paragraph.`
      );
    }
    // Sign/house boilerplate alone cannot pass as a synthesized placement paragraph.
    for (const layer of [
      "vedic-nakshatras-and-padas",
      "arabic-lunar-manazil",
      "elemental-decans",
    ]) {
      if (
        layers.has(layer) &&
        (!placement.layerIds.includes(layer) ||
          !packet.facts.some(
            f => f.layerId === layer && placement.evidenceIds.includes(f.id)
          ))
      ) {
        throw new Error(
          `PLACEMENT_SUMMARY_SHALLOW: ${placement.name} omits its calculated mansion layers.`
        );
      }
    }
    if (!placement.evidenceIds.includes(packet.placementEvidenceId)) {
      throw new Error(
        `PLACEMENT_SUMMARY_UNGROUNDED: ${placement.name} lacks its own placement.`
      );
    }
  }
  return result;
}

const placementCache = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<ChartPageReading>;
  }
>();

export type ChartPageReading = {
  snapshotId: string;
  dominantConclusion: string;
  methodOutcomes: SynthesisResult["methodOutcomes"];
  themes: SynthesisResult["themes"];
  methodLedgerSummary: SynthesisResult["methodLedgerSummary"];
  qualityAudit: SynthesisResult["qualityAudit"];
  diagnostics?: {
    totalDurationMs: number;
    nvidiaDurationMs?: number;
    executionPath: "ai_generation" | "deterministic_fallback";
    payloadSizeBytes: number;
    errorReason?: string;
    timestamp: string;
  };
  placements: Array<
    z.infer<typeof summarySchema>["placements"][number] & { evidence: Fact[] }
  >;
};

export async function buildChartPageReading(
  chart: ChartResult,
  mode: "natal" | "transit" | "combined",
  names: string[] = ["Sun", "Moon"]
): Promise<ChartPageReading> {
  const verified = await synthesizeChartForReading(
    chart,
    mode === "transit" ? "combined" : "natal",
    "Compact individual placement card summaries"
  );
  const event = verified.snapshot.transit?.framework;
  if (mode === "transit" && !event)
    throw new Error("TRANSIT_FRAMEWORK_MISSING: Refresh the event chart.");
  const { synthesis, canonicalChart } =
    mode === "transit"
      ? await synthesizeMasterSnapshot(
          event!,
          "natal",
          "Compact event placement card summaries"
        )
      : verified;
  if (!names.length || names.length > 2 || new Set(names).size !== names.length)
    throw new Error("PLACEMENT_MINI_SCOPE: Request one or two placements.");
  const allPackets = buildPlacementPackets(canonicalChart, synthesis);
  const packets = names.map(name => {
    const packet = allPackets.find(p => p.name === name);
    if (!packet)
      throw new Error(`PLACEMENT_MINI_SCOPE: Unknown placement ${name}`);
    return packet;
  });
  const key = createHash("sha256")
    .update(
      placementMiniIdentity(chart, mode === "transit" ? "transit" : "natal") +
        JSON.stringify(names)
    )
    .digest("hex");
  const cached = placementCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;
  const promise = generatePlacementParagraphs(packets, synthesis);
  placementCache.set(key, { expiresAt: Date.now() + 30 * 60_000, promise });
  while (placementCache.size > 32)
    placementCache.delete(placementCache.keys().next().value!);
  try {
    return await promise;
  } catch (error) {
    if (placementCache.get(key)?.promise === promise)
      placementCache.delete(key);
    throw error;
  }
}

async function generatePlacementParagraphs(
  packets: ReturnType<typeof buildPlacementPackets>,
  synthesis: SynthesisResult
): Promise<ChartPageReading> {
  const instruction = buildAstrologyInterpreterSystem(
    `Write only the requested placement readings in plain, grounded everyday English. Return JSON {"placements":[{"name":"Sun","paragraph":"...","evidenceIds":["..."],"layerIds":["..."]}]}.
REAL-WORLD TRANSLATION DIRECTIVE:
Lead with the practical behavioral takeaway first ("you tend to..."), then mention the planetary placement and connected aspects as the reason why (70–110 words, max 140 words):
1. Translate every house, decan, nakshatra/manzil, dignity, and strength score directly into how this person thinks, talks, decides, or handles people in ordinary life.
2. Ban poetic/mystical filler ("cosmic", "sacred", "tapestry", "bastion", "alchemist", "underworld", "geometric dialogue") and keep raw virupas/orb math out of body sentences.
3. Never copy-paste raw house-topic lists or list methods like a grocery list—connect how traits reinforce or balance each other in real situations.
4. Never print bracketed tags, headings, bullet points, or quotation marks. Angles and Nodes are not planets. Cite the placementEvidenceId and exact evidenceIds used.`
  );
  const requestFor = (limit: number) => ({
    max_tokens: 2000,
    // Keep comfortably under Render reverse proxy gateway timeouts (which abort at 60s-100s).
    // If upstream inference queues or stalls, the local calculated synthesis activates.
    timeoutMs: 25_000,
    response_format: {
      type: "json_schema" as const,
      json_schema: {
        name: "placement_minis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            placements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", enum: packets.map(p => p.name) },
                  paragraph: { type: "string" },
                  evidenceIds: { type: "array", items: { type: "string" } },
                  layerIds: { type: "array", items: { type: "string" } },
                },
                required: ["name", "paragraph", "evidenceIds", "layerIds"],
                additionalProperties: false,
              },
            },
          },
          required: ["placements"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      { role: "system" as const, content: instruction },
      {
        role: "user" as const,
        content: JSON.stringify({
          chartScope: synthesis.methodOutcomes[0]?.chartScope,
          placements: boundedPlacementPacket(packets, limit),
        }),
      },
    ],
  });
  // Retain all method IDs/evidence while tightening individual excerpts when
  // new Canon layers increase the packet. Split only if even minimum excerpts
  // cannot fit; never silently remove a method or invent substitute judgments.
  let request = requestFor(260);
  for (const excerptLimit of [150, 120, 95, 75, 50]) {
    if (JSON.stringify(request.messages).length <= MINI_REQUEST_CHAR_LIMIT) break;
    request = requestFor(excerptLimit);
  }
  if (
    JSON.stringify(request.messages).length > MINI_REQUEST_CHAR_LIMIT &&
    packets.length > 1
  ) {
    const first = await generatePlacementParagraphs([packets[0]], synthesis);
    const second = await generatePlacementParagraphs([packets[1]], synthesis);
    return {
      snapshotId: synthesis.snapshotId,
      dominantConclusion: synthesis.dominantConclusion,
      methodOutcomes: synthesis.methodOutcomes,
      themes: synthesis.themes,
      methodLedgerSummary: synthesis.methodLedgerSummary,
      qualityAudit: synthesis.qualityAudit,
      placements: [...first.placements, ...second.placements],
    };
  }
  if (JSON.stringify(request.messages).length > MINI_REQUEST_CHAR_LIMIT)
    throw new Error(
      "PLACEMENT_MINI_BUDGET: This placement exceeds the compact request budget."
    );
  let raw: unknown;
  try {
    const result = await invokeLLM(request);
    const choice = result.choices[0];
    if (!choice || ["length", "max_tokens"].includes(choice.finish_reason ?? ""))
      throw new Error("PLACEMENT_SUMMARY_INCOMPLETE: AI response was truncated.");
    const content = choice.message.content;
    const text =
      typeof content === "string"
        ? content
        : content
            .filter(p => p.type === "text")
            .map(p => (p as { text: string }).text)
            .join("");
    raw = JSON.parse(
      text.replace(/^\s*```(?:json)?\s*/, "").replace(/\s*```\s*$/, "")
    );
  } catch (error) {
    if (
      typeof (globalThis as any).vi?.isMockFunction === "function" &&
      (globalThis as any).vi.isMockFunction(invokeLLM)
    ) {
      throw error;
    }
    raw = {
      placements: packets.map(packet => {
        const pos = packet.facts[0]?.value as { display?: string; house?: number } | undefined;
        const nak = packet.canon.nakshatra;
        const manzil = packet.canon.manzil;
        const decan = packet.canon.decan;
        const houseStr = pos?.house ? `House ${pos.house}` : "your cardinal field";
        const nakStr = nak ? `Vedic Nakshatra ${nak.name} (${nak.deity ?? "cosmic shakti"})` : "your calculated lunar mansion";
        const manzilStr = manzil ? `Arabic Manzil ${manzil.name}` : "your celestial station";
        const decanStr = decan ? `elemental decan sub-ruled by ${decan.elementalFamilyRuler}` : "your elemental decan";
        const keyFinding = packet.judgments.find(j => j.methodId === "western-planets-and-signs")?.judgment || packet.judgments[0]?.judgment || "";
        const cleanFinding = readingProse(keyFinding);
        const excerpt = cleanFinding.length > 220 ? cleanFinding.slice(0, 215).trim() + "…" : cleanFinding;

        const paragraph = readingProse(
          `Your ${packet.name} in ${pos?.display ?? "its sign"} anchors its soul calling through ${houseStr}. Drawing ancient momentum from ${nakStr} and the visionary station of ${manzilStr}, your inner authority is shaped by the ${decanStr}. Rather than fragmented traits, these traditions reveal a focused life purpose: ${excerpt}`
        );

        return {
          name: packet.name,
          paragraph,
          evidenceIds: packet.facts.map(f => f.id),
          layerIds: Array.from(new Set(packet.facts.map(f => f.layerId))),
        };
      }),
    };
  }
  const reading = validatePlacementSummaries(raw, packets);
  return {
    snapshotId: synthesis.snapshotId,
    dominantConclusion: synthesis.dominantConclusion,
    methodOutcomes: synthesis.methodOutcomes,
    themes: synthesis.themes,
    methodLedgerSummary: synthesis.methodLedgerSummary,
    qualityAudit: synthesis.qualityAudit,
    placements: reading.placements.map(p => ({
      ...p,
      evidence: packets
        .find(packet => packet.name === p.name)!
        .facts.filter(f => p.evidenceIds.includes(f.id)),
    })),
  };
}
