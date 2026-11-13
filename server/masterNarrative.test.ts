import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { buildUnifiedMasterChart } from "./masterChart/builder";
import { synthesizeMasterSnapshot } from "./astrologyKnowledge/synthesis/readingBridge";
import { narrateMasterSynthesis } from "./astrologyKnowledge/synthesis/narrative";
import { decodeEvidence } from "./astrologyKnowledge/synthesis/evidenceTransport";
import type { SynthesisResult } from "./astrologyKnowledge/synthesis/types";
import { invokeLLM } from "./_core/llm";
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
let synthesis: SynthesisResult;
const text = "You seek a life that answers to your own judgment. Your strongest drive and the pressures around it must be understood together through this chart’s actual layers.";
const response = (content = text, finish_reason = "stop") => ({id:"test",created:0,model:"test",choices:[{index:0,finish_reason,message:{role:"assistant" as const,content}}]});
beforeAll(async () => {
  const snapshot = await buildUnifiedMasterChart({location:"Dallas",latitude:32.7767,longitude:-96.797,timezone:"America/Chicago",date:"1986-11-20",time:"10:06",mode:"combined",transitDate:"2026-11-06",transitTime:"16:22",transitLocation:"Las Vegas",transitLatitude:36.1699,transitLongitude:-115.1398,transitTimezone:"America/Los_Angeles"});
  synthesis = (await synthesizeMasterSnapshot(snapshot,"combined","Read this moment")).synthesis;
});
beforeEach(() => vi.mocked(invokeLLM).mockReset());
describe("AI master reading", () => {
  it("sends complete natal and event outcomes despite a failed deterministic theme audit", async () => {
    vi.mocked(invokeLLM).mockResolvedValue(response());
    const failedAudit = {...synthesis, qualityAudit:{...synthesis.qualityAudit,passed:false}};
    const result = await narrateMasterSynthesis(failedAudit,"Read me");
    const request = vi.mocked(invokeLLM).mock.calls[0][0];
    const wrapped = String(request.messages[1].content).replace(/^<chart_data>\n/, "").replace(/\n<\/chart_data>$/, "");
    const delivered = decodeEvidence(JSON.parse(wrapped)) as any;
    expect(JSON.stringify(delivered.methodOutcomes)).toBe(JSON.stringify(synthesis.methodOutcomes));
    expect(JSON.stringify(delivered.calculatedMethodOutcomes)).toBe(JSON.stringify(synthesis.sourceSnapshot.methodExecutionLedger));
    expect(JSON.stringify(delivered.canonApplications)).toBe(JSON.stringify(synthesis.canonApplications));
    expect(delivered.methodOutcomes.some((m:any) => m.methodId.startsWith("transit:"))).toBe(true);
    expect(result.narrative.answer).toBe(text);
    expect(result.integratedNarrative).toEqual([text]);
    expect(result.calculatedNarrative).toEqual(synthesis.integratedNarrative);
    expect(result.narrativeAudit.deliveredMethodIds).toHaveLength(synthesis.sourceSnapshot.methodExecutionLedger.length);
    expect(result.narrative.methodsReviewed).toEqual([]);
    expect(result.narrativeAudit.passed).toBeNull();
  });
  it("rejects empty or truncated AI output and allows a fresh retry", async () => {
    vi.mocked(invokeLLM).mockResolvedValueOnce(response(text,"length")).mockResolvedValueOnce(response(" ")).mockResolvedValueOnce(response());
    await expect(narrateMasterSynthesis(synthesis,"retry")).rejects.toThrow("TRUNCATED");
    await expect(narrateMasterSynthesis(synthesis,"retry")).rejects.toThrow("EMPTY");
    await expect(narrateMasterSynthesis(synthesis,"retry")).resolves.toHaveProperty("narrative.answer",text);
  });
});
