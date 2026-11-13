import { contributionFromEvidence, evidenceForBody, type PlacementAdapter } from "./types";
export const godAgent: PlacementAdapter = context => {
  const row = context.row as { godHouse?: number; agentHouse?: number; frameRelationship?: { type?: string; translation?: string; synthesis?: string } };
  const relationship = row.frameRelationship;
  const result = relationship ? [`God House ${row.godHouse ?? "unavailable"}; Agent House ${row.agentHouse ?? "unavailable"}; ${relationship.type ?? "relationship not named"}.`, relationship.translation ?? "No translation returned.", relationship.synthesis ?? "No synthesis returned."] : [`God House ${row.godHouse ?? "unavailable"}; Agent House ${row.agentHouse ?? "unavailable"}.`];
  const items = evidenceForBody(context.packet, context.body).filter(item => item.technique.includes("god") || item.statement.toLowerCase().includes("god") || item.statement.toLowerCase().includes("agent"));
  if (relationship) return {
    method: "godAgent",
    label: "God View / Agent View",
    status: "included",
    relation: "contextual",
    result,
    sourceTrace: items.map(item => `${item.sourceTrace.sourceTitle} · ${item.technique}`),
  };
  return contributionFromEvidence(context, "godAgent", "God View / Agent View", items, { reason: "The chart row did not return a dual-frame relationship object." });
};
