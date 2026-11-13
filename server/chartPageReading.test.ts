import { decodeEvidence } from "./astrologyKnowledge/synthesis/evidenceTransport";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  buildPlacementPackets,
  packPlacementMiniPrompt,
  validatePlacementSummaries,
  buildChartPageReading,
} from "./chartPageReading";
import { calculateChart, type ChartResult } from "./astronomy";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import { invokeLLM } from "./_core/llm";
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
let chart: ChartResult;
let packets: ReturnType<typeof buildPlacementPackets>;
beforeAll(async () => {
  chart = await calculateChart({
    location: "Dallas, TX",
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
    date: "1986-11-20",
    time: "10:06",
    worldview: "agent-vs-god",
    readingScope: "natal",
  });
  const { synthesis, canonicalChart } = await synthesizeChartForReading(
    chart,
    "natal",
    "Placement summaries"
  );
  packets = buildPlacementPackets(canonicalChart, synthesis);
});
const response = (selected = packets) => ({
  placements: selected.map(p => ({
    name: p.name,
    paragraph:
      "A compact interpretation that connects this planet’s own calculated mansion, pada, manzil and supporting conditions to a specific drive, strength and challenge in everyday life.",
    evidenceIds: p.facts.map(f => f.id),
    layerIds: Array.from(new Set(p.facts.map(f => f.layerId))),
  })),
});
describe("Compact Chart page placement summaries", () => {
  it("preserves Sun and Moon mansion evidence and vargas", () => {
    const sun = packets.find(p => p.name === "Sun")!;
    const moon = packets.find(p => p.name === "Moon")!;
    expect(sun.canon.nakshatra.name).toBe("Jyeshtha");
    expect(moon.canon.nakshatra.name).toBe("Pushya");
    expect(moon.canon.manzil.name).toBe("Al-Tarf");
    expect(moon.facts.some(f => f.layerId === "vedic-vargas-divisional")).toBe(
      true
    );
    expect(
      JSON.stringify(packPlacementMiniPrompt(packets)).length
    ).toBeLessThan(170_000);
  });
  it("keeps actual judgments for Nodes and angles, excluding failed or unrelated methods", () => {
    for (const name of [
      "Ascendant",
      "Descendant",
      "North Node",
      "South Node",
    ]) {
      const p = packets.find(p => p.name === name)!;
      expect(p.judgments.length).toBeGreaterThan(0);
      expect(
        p.judgments.some(j => j.methodId === "vedic-nakshatras-and-padas")
      ).toBe(true);
      expect(p.judgments.every(j => j.sources.length > 0)).toBe(true);
    }
    expect(
      packets
        .flatMap(p => p.judgments)
        .some(j => j.methodId.startsWith("transit:"))
    ).toBe(false);
  });
  it("losslessly retains all method judgments in the compact AI packet", () => {
    const packed = packPlacementMiniPrompt(packets);
    packets.forEach((p, index) =>
      p.judgments.forEach((j, jIndex) => {
        const row =
          packed.findings[packed.placements[index].findingRefs[jIndex]!];
        const restored = (row[0] as Array<string | number>)
          .map(part =>
            typeof part === "number" ? packed.textTable[part] : part
          )
          .join("");
        expect(restored).toBe(j.judgment);
        expect(row[2]).toEqual(j.evidenceIds);
      })
    );
  });
  it("requires every displayed planet, including the Sun, and rejects duplicates", () => {
    expect(
      validatePlacementSummaries(response(), packets).placements.length
    ).toBe(chart.movingBodies.length + 4);
    const missingSun = response();
    missingSun.placements = missingSun.placements.filter(p => p.name !== "Sun");
    expect(() => validatePlacementSummaries(missingSun, packets)).toThrow(
      "INCOMPLETE"
    );
    const duplicate = response();
    duplicate.placements[0] = duplicate.placements[1];
    expect(() => validatePlacementSummaries(duplicate, packets)).toThrow(
      "INCOMPLETE"
    );
  });
  it("rejects sign-only summaries and invented evidence", () => {
    const shallow = response();
    shallow.placements[0].layerIds = [
      "western-planets-and-signs",
      "elemental-decans",
    ];
    expect(() => validatePlacementSummaries(shallow, packets)).toThrow(
      "SHALLOW"
    );
    const invented = response();
    invented.placements[0].evidenceIds.push("invented-shadbala");
    expect(() => validatePlacementSummaries(invented, packets)).toThrow(
      "UNGROUNDED"
    );
  });
  it("sends all raw calculations, full outcomes and Canon while requesting concise placement prose", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [
        {
          message: {
            role: "assistant",
            content: JSON.stringify(
              response(packets.filter(p => ["Sun", "Moon"].includes(p.name)))
            ),
          },
          index: 0,
          finish_reason: "stop",
        },
      ],
      id: "test",
      created: 0,
      model: "test",
    });
    const result = await buildChartPageReading(chart, "natal");
    expect(result.placements[0].name).toBe("Sun");
    const call = vi.mocked(invokeLLM).mock.calls[0][0];
    expect(call.max_tokens).toBe(2000);
    expect(call.timeoutMs).toBe(180000);
    expect(call.response_format).toMatchObject({
      type: "json_schema",
      json_schema: { strict: true },
    });
    expect(call.messages[0].content).toContain(
      "THE ABSOLUTE — INTERPRETATION ENGINE"
    );
    expect(call.messages[0].content).toContain("70–110 words");
    const delivered = (decodeEvidence(JSON.parse(String(call.messages[1].content))) as any);
    expect(delivered.methodOutcomes).toHaveLength(delivered.calculatedMethodOutcomes.length);
    expect(delivered.snapshot.methodExecutionLedger).toEqual(delivered.calculatedMethodOutcomes);
    expect(delivered.canonApplications.length).toBeGreaterThan(0);
    expect(
      (decodeEvidence(JSON.parse(String(call.messages[1].content))) as any).placements
    ).toHaveLength(2);
    expect(call.messages[0].content).toContain("story-like");
    expect(call.messages[1].content).not.toContain("UNIFIED MASTER SYNTHESIS");
    await buildChartPageReading(chart, "natal");
    expect(invokeLLM).toHaveBeenCalledTimes(1);
  });
  it("generates transit minis from the independent event sky, not the natal packets", async () => {
    vi.mocked(invokeLLM).mockClear();
    const eventChart = await calculateChart({
      ...chart.input,
      readingScope: "combined",
      transitLocation: "Las Vegas",
      transitLatitude: 36.1699,
      transitLongitude: -115.1398,
      transitTimezone: "America/Los_Angeles",
      transitDate: "2026-11-07",
      transitTime: "09:00",
    });
    vi.mocked(invokeLLM).mockImplementation(async request => {
      const input = (decodeEvidence(JSON.parse(String(request.messages[1].content))) as any);
      expect(input.chartScope).toBe("event");
      if (input.placements.some((p: any) => p.name === "Sun"))
        expect(
          input.placements.find((p: any) => p.name === "Sun").facts[0].value.display
        ).not.toBe(chart.movingBodies.find(p => p.name === "Sun")!.display);
      expect(input.snapshot).toBeDefined();
      expect(input.methodOutcomes.length).toBeGreaterThan(0);
      return {
        id: "event",
        created: 0,
        model: "test",
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: JSON.stringify({
                placements: input.placements.map((p: any) => ({
                  name: p.name,
                  paragraph: `${p.name} describes the selected event sky, with its calculated mansion, elemental-family ruler and supporting conditions shaping a specific expression in this event rather than a birth biography.`,
                  evidenceIds: [
                    p.placementEvidenceId,
                    ...p.judgments.flatMap((m: any) => m.evidenceIds),
                  ],
                  layerIds: Array.from(
                    new Set([
                      "western-planets-and-signs",
                      ...p.judgments.map((m: any) => m.methodId),
                    ])
                  ),
                })),
              }),
            },
          },
        ],
      };
    });
    const result = await buildChartPageReading(eventChart, "transit");
    expect(result.placements.length).toBe(2);
    expect(vi.mocked(invokeLLM).mock.calls.length).toBeLessThanOrEqual(2);
  });
});
