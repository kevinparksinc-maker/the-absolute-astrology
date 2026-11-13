import type { EvidenceItem, EvidenceRelationship, Tradition } from "./types";

const traditions = ["western", "vedic", "arabic"] as const;
function key(evidence: EvidenceItem) {
  const subject = evidence.subject.toLowerCase();
  const structuralSubject = [
    "sun",
    "moon",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "ascendant",
    "relationship",
    "career",
    "fortune",
    "spirit",
    "timing",
  ].find(value => subject.includes(value));
  if (structuralSubject) return structuralSubject;
  return (
    evidence.concepts
      .filter(value => !["neutral", "incomplete"].includes(value))
      .find(value =>
        /house-|moon|sun|venus|mars|jupiter|saturn|relationship|career|lunar|dignity|condition|aspect|drishti|lot|manzil/.test(
          value
        )
      ) ?? evidence.technique
  );
}
function relationFor(items: EvidenceItem[]): EvidenceRelationship | null {
  const present = Array.from(
    new Set(
      items
        .map(item => item.tradition)
        .filter((tradition): tradition is Tradition =>
          traditions.includes(tradition as (typeof traditions)[number])
        )
    )
  );
  if (present.length < 2) return null;
  const pressured = items.some(item => item.polarity === "pressured");
  const supportive = items.some(item => item.polarity === "supportive");
  const relation =
    pressured && supportive
      ? "qualification"
      : pressured
        ? "reinforcement"
        : "reinforcement";
  const theme = key(items[0]);
  return {
    id: `relationship-${theme}-${present.join("-")}`,
    relation,
    theme,
    evidenceIds: items.map(item => item.id),
    traditions: present,
    explanation:
      relation === "qualification"
        ? `The traditions describe ${theme} through different layers: some evidence supports capacity while other evidence adds pressure or work.`
        : `Independent evidence in ${present.join(", ")} describes the same structural subject, so the relationship is stronger than a shared keyword alone.`,
    strength: Number(
      Math.min(
        1,
        0.35 +
          present.length * 0.2 +
          (items.reduce((sum, item) => sum + (item.strength ?? 0), 0) /
            Math.max(1, items.length)) *
            0.3
      ).toFixed(3)
    ),
  };
}
export function resolveRelationships(evidence: EvidenceItem[]) {
  const groups = new Map<string, EvidenceItem[]>();
  for (const item of evidence) {
    const group = groups.get(key(item)) ?? [];
    group.push(item);
    groups.set(key(item), group);
  }
  const relationships = Array.from(groups.values())
    .map(relationFor)
    .filter((value): value is EvidenceRelationship => Boolean(value));
  const contradictions: EvidenceRelationship[] = [];
  for (const items of Array.from(groups.values())) {
    const polarities = new Set(
      items.map((item: EvidenceItem) => item.polarity).filter(Boolean)
    );
    if (
      polarities.has("supportive") &&
      polarities.has("pressured") &&
      items.length >= 2
    ) {
      const base = relationFor(items);
      if (base)
        contradictions.push({
          ...base,
          id: `${base.id}-contradiction`,
          relation: "contradiction",
          explanation: `Evidence does not point in one direction: supportive and pressured testimony coexist around ${base.theme}. This may describe different layers or stages rather than an error.`,
          strength: base.strength,
        });
    }
  }
  return {
    relationships,
    convergences: relationships.filter(item =>
      ["reinforcement", "amplification", "qualification"].includes(
        item.relation
      )
    ),
    contradictions,
  };
}
