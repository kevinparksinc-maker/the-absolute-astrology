import { contributionFromEvidence, evidenceForBody, type PlacementAdapter } from "./types";
export const transits: PlacementAdapter = context => {
  if (context.chart.readingScope === "natal" || !context.chart.transits.length) return { method: "transits", label: "Transits to natal", status: "not-applicable", relation: "unavailable", result: [], sourceTrace: [], reason: "This chart has no transit-to-natal comparison in the current reading scope." };
  return contributionFromEvidence(context, "transits", "Transits to natal", evidenceForBody(context.packet, context.body).filter(item => item.technique.includes("transit") || item.tradition === "firmament"), { reason: "No placement-specific transit contact was returned." });
};
