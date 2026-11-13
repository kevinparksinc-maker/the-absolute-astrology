import { describe, it, expect } from "vitest";
import { buildUnifiedMasterChart } from "./masterChart/builder";
import { synthesizeMasterSnapshot } from "./astrologyKnowledge/synthesis/readingBridge";
import { buildNarrativePacket } from "./astrologyKnowledge/synthesis/narrativePacket";
import { encodeEvidence, decodeEvidence } from "./astrologyKnowledge/synthesis/evidenceTransport";

const input = {location:"Dallas",latitude:32.7767,longitude:-96.797,timezone:"America/Chicago",date:"1986-11-20",time:"10:06",mode:"natal" as const};
describe("Complete AI evidence delivery", () => {
  it("retains the raw chart, every method outcome, every judgment and full Canon without clipping", async () => {
    const snapshot = await buildUnifiedMasterChart(input);
    const { synthesis } = await synthesizeMasterSnapshot(snapshot, "natal", "purpose");
    const before = JSON.stringify(synthesis);
    const { packet } = buildNarrativePacket(synthesis, "purpose");
    expect(packet.snapshot).toBe(synthesis.sourceSnapshot);
    expect(packet.calculatedMethodOutcomes).toEqual(snapshot.methodExecutionLedger);
    expect(packet.methodOutcomes).toBe(synthesis.methodOutcomes);
    expect(packet.canonApplications).toBe(synthesis.canonApplications);
    const encoded = encodeEvidence(packet);
    expect(JSON.stringify(decodeEvidence(JSON.parse(JSON.stringify(encoded))))).toBe(JSON.stringify(packet));
    expect(JSON.stringify(encoded).length).toBeLessThan(JSON.stringify(packet).length);
    expect(JSON.stringify(synthesis)).toBe(before);
  });
  it("does not block all results when one method execution or rule interpretation failed", async () => {
    const snapshot = await buildUnifiedMasterChart(input);
    snapshot.methodExecutionLedger[0] = {...snapshot.methodExecutionLedger[0], status:"failed", errorCode:"TEST_PARTIAL_FAILURE"};
    const { synthesis } = await synthesizeMasterSnapshot(snapshot, "natal", "purpose");
    const { packet } = buildNarrativePacket(synthesis, "purpose");
    expect(packet.calculatedMethodOutcomes[0].status).toBe("failed");
    expect(packet.calculatedMethodOutcomes).toHaveLength(snapshot.methodExecutionLedger.length);
    expect(packet.methodOutcomes).toHaveLength(snapshot.methodExecutionLedger.length);
  });
  it("round-trips repeated text, nested JSON strings, arrays and statuses exactly", () => {
    const rule = "This is a complete rule with a mechanism, consequence and condition that is deliberately long enough to intern. ";
    const node = {text:rule+rule, status:"failed", values:[1,2,3]};
    const source = {one:node, two:node, string:JSON.stringify(node), sentences:[rule+"First ending.",rule+"Second ending."]};
    expect(decodeEvidence(encodeEvidence(source))).toEqual(source);
  });
});
