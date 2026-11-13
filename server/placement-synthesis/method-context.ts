import { contributionFromEvidence, evidenceForBody, type PlacementAdapterContext } from "./types";

export function familyEvidence(context: PlacementAdapterContext, methods: string[]) {
  const bodyEvidence = evidenceForBody(context.packet, context.body);
  return bodyEvidence.filter(item => methods.includes(item.technique) || methods.includes(item.tradition));
}

export function familyContribution(
  context: PlacementAdapterContext,
  method: string,
  label: string,
  techniques: string[],
  reason?: string,
) {
  return contributionFromEvidence(context, method, label, familyEvidence(context, techniques), { reason });
}
