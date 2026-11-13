import type { HumanDomain, InterpretedProposition, SynthesizedTheme } from "./types";

/**
 * Evidence-first synthesis. Every computed proposition is retained, while
 * meaningful interactions receive explicit support, tension, and weighting.
 * These are traditional chart interpretations, not assertions of life events.
 */
const DOMAIN_TITLES: Record<HumanDomain, string> = {
  identity: "Identity, Temperament & Self-Knowledge",
  purpose_work: "Purpose, Vocation & Gifts",
  relationships: "Relationships & Alliances",
  resources_wealth: "Resources, Wealth & Material Life",
  family_home: "Family, Roots & Home",
  autonomy_power: "Will, Courage & Power",
  energy_wellbeing: "Vitality, Habits & Wellbeing",
  choices_obstacles: "Challenges, Choices & Character",
  timing: "Timing, Transits & Turning Points",
};

const STRENGTH: Record<InterpretedProposition["strength"], number> = {
  dominant: 4, strong: 3, moderate: 2, subtle: 1,
};

const unique = (items: string[]): string[] => Array.from(new Set(items));
const evidence = (items: InterpretedProposition[]): string[] =>
  unique(items.flatMap(item => item.supportingEvidenceIds));

function weight(item: InterpretedProposition): number {
  return STRENGTH[item.strength] + Math.min(item.supportingEvidenceIds.length, 5) * 0.2;
}

function describe(item: InterpretedProposition): string {
  return `[${item.tradition}; ${item.frame}; ${item.strength}; ${item.valence}] ${item.themeTitle}: ${item.plainLanguageMeaning} Traditional mechanism: ${item.causalMechanism}. Evidence: ${item.supportingEvidenceIds.join(", ") || "not identified"}.`;
}

export function clusterPropositionsIntoThemes(
  propositions: InterpretedProposition[]
): {
  themes: SynthesizedTheme[];
  tensions: Array<{ polarities: string; reconciliation: string; evidenceIds: string[] }>;
} {
  const groups = new Map<HumanDomain, InterpretedProposition[]>();
  for (const proposition of propositions) {
    const group = groups.get(proposition.domain) ?? [];
    group.push(proposition);
    groups.set(proposition.domain, group);
  }

  const themes: SynthesizedTheme[] = [];
  const tensions: Array<{ polarities: string; reconciliation: string; evidenceIds: string[] }> = [];

  for (const [domain, group] of Array.from(groups.entries())) {
    if (!group.length) continue;
    const ordered = [...group].sort((a, b) => weight(b) - weight(a));
    const leading = ordered[0];
    const supportive = ordered.filter(p => p.valence === "supportive");
    const difficult = ordered.filter(p => p.valence === "challenging" || p.valence === "transformative");
    const traditions = unique(ordered.map(p => p.tradition));
    const allEvidence = evidence(ordered);
    const combined = ordered.map(describe);
    const strengths = supportive.map(p => `${p.themeTitle} (${p.causalMechanism})`);
    const challenges = difficult.map(p => `${p.themeTitle} (${p.causalMechanism})`);

    // Distinct techniques are presented as separate witnesses, not assumed
    // to independently validate one another simply by sharing a domain.
    const corroborationLevel: SynthesizedTheme["convergenceAssessment"]["corroborationLevel"] =
      traditions.length >= 2 ? "strong-corroboration"
      : ordered.length >= 2 ? "moderate-reinforcement" : "singular";

    // Group shared evidence once instead of repeating every pair of witnesses.
    const witnesses = new Map<string, InterpretedProposition[]>();
    for (const item of ordered) for (const id of item.supportingEvidenceIds) {
      const entries = witnesses.get(id) ?? [];
      entries.push(item);
      witnesses.set(id, entries);
    }
    const relationships = Array.from(witnesses.entries())
      .filter(([, items]) => items.length > 1)
      .map(([id, items]) => `${id} links ${unique(items.map(item => item.themeTitle)).join("; ")}. These share one calculated condition and are not independent confirmations.`);

    const opposing = supportive.length && difficult.length;
    const reconciliation = opposing
      ? `The favorable testimony (${strengths.join("; ")}) and the challenging testimony (${challenges.join("; ")}) coexist. Read their specific mechanisms together: favorable indications describe available strengths; challenging indications describe pressures, costs, or vulnerabilities. The relative strength and evidence of each finding determine its emphasis.`
      : ordered.length > 1
        ? `The contributing techniques describe different facets of ${DOMAIN_TITLES[domain]}. Their specific meanings and evidence are shown together below.`
        : `The principal traditional indication is ${leading.themeTitle}, supported by ${leading.causalMechanism}.`;

    if (opposing) {
      tensions.push({
        polarities: `${strengths.join("; ")} | ${challenges.join("; ")}`,
        reconciliation,
        evidenceIds: evidence([...supportive, ...difficult]),
      });
    }

    const consequenceParts = [
      ...supportive.map(p => `Available strength — ${p.themeTitle}; expressed through ${p.causalMechanism}. Evidence: ${p.supportingEvidenceIds.join(", ")}`),
      ...difficult.map(p => `Pressure to manage — ${p.themeTitle}; the relevant condition is ${p.causalMechanism}. Evidence: ${p.supportingEvidenceIds.join(", ")}`),
    ];
    if (!consequenceParts.length) consequenceParts.push(...ordered.map(p => `${p.plainLanguageMeaning} Evidence: ${p.supportingEvidenceIds.join(", ")}`));

    themes.push({
      id: `theme-${domain}`,
      humanTheme: DOMAIN_TITLES[domain],
      domain,
      primaryConclusion: `${leading.themeTitle}: ${leading.plainLanguageMeaning}`,
      whyHow: [
        `Primary traditional mechanism: ${leading.causalMechanism}.`,
        ...combined,
        ...relationships.map(r => `CROSS-METHOD CONNECTION: ${r}`),
      ].join("\n"),
      concreteManifestations: ordered.slice(0, 4).map(p =>
        `${p.themeTitle}: ${p.plainLanguageMeaning} The relevant chart condition is ${p.causalMechanism}; consider how this traditional expression may appear in the life area being examined. Evidence: ${p.supportingEvidenceIds.join(", ")}`
      ),
      consequences: consequenceParts.join("\n"),
      deeperMeaning: `Symbolic interpretation of the combined pattern in ${DOMAIN_TITLES[domain]}: ${ordered.map(p => p.themeTitle).join("; ")}. ${reconciliation} Each factor modifies the full interpretation through its recorded strength, condition, frame, and traditional meaning.`,
      convergenceAssessment: {
        independentTraditions: traditions,
        corroborationLevel,
        tensions: opposing ? [reconciliation] : [],
        reconciliation,
      },
      linkedPropositionIds: ordered.map(p => p.id),
      evidenceIds: allEvidence,
    });
  }

  const order: HumanDomain[] = [
    "identity", "purpose_work", "autonomy_power", "resources_wealth",
    "relationships", "choices_obstacles", "family_home", "energy_wellbeing", "timing",
  ];
  themes.sort((a, b) => order.indexOf(a.domain) - order.indexOf(b.domain));
  return { themes, tensions };
}
