import { decodeEvidence } from "./astrologyKnowledge/synthesis/evidenceTransport";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChartResult } from "./astronomy";
import {
  generateEnergyReading as buildEnergyReading,
  buildEnergyReading as cachedEnergyReading,
} from "./energyReading";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import { invokeLLM } from "./_core/llm";
vi.mock("./astrologyKnowledge/synthesis/readingBridge", () => ({
  synthesizeChartForReading: vi.fn(),
}));
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
const chart = {
  readingScope: "combined",
  transitDate: "2026-11-06T19:06:00Z",
  input: { location: "Dallas", transitLocation: "Las Vegas" },
  movingBodies: [],
  ascendant: null,
  transits: [
    {
      name: "Moon",
      natalContacts: [
        { natalName: "Saturn", aspect: "trine", orb: 0.1 },
        { natalName: "Ascendant", aspect: "square", orb: 0.9 },
      ],
    },
  ],
} as unknown as ChartResult;
const bridge = {
  canonicalChart: chart,
  context: "All method findings and Canon rule applications",
  synthesis: {
    snapshotId: "verified-snapshot",
    methodOutcomes: [],
    contradictionsAndTensions: [],
    themes: [],
    canonApplications: [{ ruleId: "test-canon" }],
    methodFindings: [
      {
        id: "transit-activation-layer",
        findings: [],
        evidenceIds: ["transit-test"],
      },
      { id: "elemental-decans", findings: [], evidenceIds: ["natal-test"] },
    ],
  },
};
const output = () => ({
  headline: "Current pressure meets a specific source of support",
  paragraphs: Array.from({ length: 3 }, () => ({
    text: "This connected interpretation explains the supplied personal contact through its actual method findings and consequences.",
    contactIds: ["Moon-trine-Saturn", "Moon-square-Ascendant"],
    methodIds: ["transit-activation-layer"],
    evidenceIds: ["natal-test", "transit-test"],
  })),
  methodsReviewed: ["transit-activation-layer", "elemental-decans"],
});
function respond(raw = output(), finish_reason = "stop") {
  vi.mocked(invokeLLM).mockResolvedValue({
    choices: [{ message: { content: JSON.stringify(raw) }, finish_reason }],
  } as never);
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(synthesizeChartForReading).mockResolvedValue(bridge as never);
  respond();
});
describe("Energy synthesis output pipeline", () => {
  it("runs verified synthesis and Canon before narration and scores the canonical contacts", async () => {
    const result = await buildEnergyReading({ ...chart, transits: [] });
    expect(synthesizeChartForReading).toHaveBeenCalledWith(
      expect.anything(),
      "combined",
      expect.any(String)
    );
    expect(
      vi.mocked(synthesizeChartForReading).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(invokeLLM).mock.invocationCallOrder[0]);
    const payload = decodeEvidence(JSON.parse(
      vi.mocked(invokeLLM).mock.calls[0][0].messages[1].content as string
    )) as any;
    expect(payload.synthesis.methodFindings.map((m: {id:string})=>m.id)).toEqual(bridge.synthesis.methodFindings.map(m=>m.id));
    expect(payload.synthesis.canonApplications[0].ruleId).toBe("test-canon");
    expect(payload.score.contacts).toHaveLength(2);
    expect(result.score.contactsCount).toBe(2);
    expect(result.snapshotId).toBe("verified-snapshot");
  });
  it("stops before narration when synthesis fails, without template output", async () => {
    vi.mocked(synthesizeChartForReading).mockRejectedValue(
      new Error("CANON_RETRIEVAL_FAILED")
    );
    await expect(buildEnergyReading(chart)).rejects.toThrow(
      "CANON_RETRIEVAL_FAILED"
    );
    expect(invokeLLM).not.toHaveBeenCalled();
  });
  it("propagates provider failure without a generic fallback", async () => {
    vi.mocked(invokeLLM).mockRejectedValue(new Error("Provider unavailable"));
    await expect(buildEnergyReading(chart)).rejects.toThrow(
      "Provider unavailable"
    );
  });
  it("rejects unknown evidence, missing method coverage and truncated prose", async () => {
    const unknown = output();
    unknown.paragraphs[0].contactIds = ["invented"];
    respond(unknown);
    await expect(buildEnergyReading(chart)).rejects.toThrow("UNGROUNDED");
    const incomplete = output();
    incomplete.methodsReviewed.pop();
    respond(incomplete);
    await expect(buildEnergyReading(chart)).rejects.toThrow("Every method");
    respond(output(), "length");
    await expect(buildEnergyReading(chart)).rejects.toThrow("truncated");
  });
  it("rejects a reviewed-method inventory when the actual reading omits the depth layers", async () => {
    vi.mocked(synthesizeChartForReading).mockResolvedValue({
      ...bridge,
      synthesis: {
        ...bridge.synthesis,
        methodFindings: [
          ...bridge.synthesis.methodFindings,
          {
            id: "vedic-nakshatras-and-padas",
            status: "computed-with-result",
            findings: [],
            evidenceIds: ["nakshatra-test"],
          },
        ],
      },
    } as never);
    const shallow = output();
    shallow.methodsReviewed.push("vedic-nakshatras-and-padas");
    respond(shallow);
    await expect(buildEnergyReading(chart)).rejects.toThrow(
      "ENERGY_SYNTHESIS_SHALLOW"
    );
  });

  it("does not narrate nonexistent pressure or support for an empty scored sky", async () => {
    vi.mocked(synthesizeChartForReading).mockResolvedValue({
      ...bridge,
      canonicalChart: { ...chart, transits: [] },
    } as never);
    const result = await buildEnergyReading(chart);
    expect(result.score.contactsCount).toBe(0);
    expect(result.paragraphs).toEqual([]);
    expect(invokeLLM).not.toHaveBeenCalled();
  });
});

describe("Energy request reuse", () => {
  it("shares identical in-flight snapshots across tabs", async () => {
    const unique = { ...chart, transitDate: "2026-11-06T19:07:00Z" };
    await Promise.all([
      cachedEnergyReading(unique),
      cachedEnergyReading(unique),
    ]);
    expect(invokeLLM).toHaveBeenCalledTimes(1);
  });
  it("evicts failures so a retry can succeed", async () => {
    const unique = { ...chart, transitDate: "2026-11-06T19:08:00Z" };
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("Temporary failure"));
    await expect(cachedEnergyReading(unique)).rejects.toThrow(
      "Temporary failure"
    );
    await expect(cachedEnergyReading(unique)).resolves.toHaveProperty(
      "snapshotId",
      "verified-snapshot"
    );
    expect(invokeLLM).toHaveBeenCalledTimes(2);
  });
});
