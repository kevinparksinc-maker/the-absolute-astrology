import { stringifyEvidence } from "./evidenceTransport";
import type { SynthesisResult } from "./types";

/** Lossless text/source interning keeps ALL judged findings within the interpreter packet. */
export function packSynthesis(synthesis: SynthesisResult) {
  const split = (text: string) => text.split(/(?<=[.!?])(?=\s)/);
  const counts = new Map<string, number>();
  for (const outcome of synthesis.methodOutcomes)
    for (const finding of outcome.findingJudgments)
      for (const part of split(finding.judgment))
        counts.set(part, (counts.get(part) ?? 0) + 1);
  const textTable = Array.from(counts.entries())
    .filter(([part, count]) => part.length >= 80 && count > 1)
    .map(([part]) => part);
  const textIndex = new Map(textTable.map((part, index) => [part, index]));
  const sources = Array.from(
    new Map(
      synthesis.canonApplications.map(rule => [
        `${rule.ruleId}:${rule.sourceTitle}`,
        {
          ruleId: rule.ruleId,
          sourceId: rule.sourceId,
          sourceTitle: rule.sourceTitle,
          confidence: rule.confidence,
        },
      ])
    ).values()
  );
  const sourceIndex = new Map(
    sources.map((rule, index) => [`${rule.ruleId}:${rule.sourceTitle}`, index])
  );
  return {
    snapshotId: synthesis.snapshotId,
    sourceSnapshot: synthesis.sourceSnapshot,
    calculatedMethodOutcomes: synthesis.sourceSnapshot?.methodExecutionLedger,
    fullMethodOutcomes: synthesis.methodOutcomes,
    fullCanonApplications: synthesis.canonApplications,
    qualityAudit: synthesis.qualityAudit,
    methodLedgerSummary: synthesis.methodLedgerSummary,
    methodOutcomeAudit: synthesis.methodOutcomeAudit,
    methodFindings: synthesis.methodFindings.map(
      ({ findings: _raw, ...metadata }) => metadata
    ),
    judgmentColumns: [
      "subject",
      "judgmentParts",
      "evidenceIds",
      "sourceRefs",
      "valence",
      "strength",
      "frame",
      "limitation",
      "findingId",
    ],
    textTable,
    methodOutcomes: synthesis.methodOutcomes.map(outcome => ({
      methodId: outcome.methodId,
      methodName: outcome.methodName,
      chartScope: outcome.chartScope,
      frame: outcome.frame,
      status: outcome.status,
      findingJudgments:
        outcome.findingJudgments.map(f => [
              f.subject,
              split(f.judgment).map(part => textIndex.get(part) ?? part),
              f.evidenceIds,
              Array.from(
                new Set(
                  f.rules.map(rule =>
                    sourceIndex.get(`${rule.ruleId}:${rule.sourceTitle}`)
                  )
                )
              ),
              f.valence,
              f.strength,
              f.frame ?? outcome.frame,
              f.limitation ?? null,
              f.id,
            ]),
      limitations: outcome.strengthAndLimitations,
    })),
    canonApplications: sources,
    themes: synthesis.themes.map(theme => ({
      id: theme.id,
      humanTheme: theme.humanTheme,
    })),
  };
}
export function formatSynthesisContext(synthesis: SynthesisResult) {
  return [
    "UNIFIED MASTER SYNTHESIS — CALCULATED METHOD FINDINGS AND CANON RULE APPLICATIONS",
    "The authoritative inputs are sourceSnapshot, calculatedMethodOutcomes, fullMethodOutcomes and fullCanonApplications. Read every supplied calculation and outcome, including findings whose rule-based interpretation failed. The compact rows below are an additional view, never a selection gate. Rows use judgmentColumns. In judgmentParts, a number means the exact textTable entry; strings are literal text. Concatenate the parts IN ORDER to read the full judgment. sourceRefs index canonApplications. ALL judgments are retained; these references only avoid repeated text. Cite the original evidence ID strings, never the numeric text/source references.",
    "Each judgment already applies its specific Canon to its actual findings. Reconcile their support, pressure and conditions using WHAT → WHY → HOW → CONSEQUENCE → MEANING. Reconcile the raw calculations and Canon directly when a rule-based judgment is incomplete. Preserve method execution statuses; do not invent a calculation that is absent.",
    "Unprefixed evidence belongs to the base chart. transit: identifies the separate event sky. chartScope identifies natal/event independently of God/Agent/shared frame. God House sectors are fixed background fields; Agent houses follow the real local horizon. Divisional and timing results seeded from an event are event-model results, never a person's natal biography.",
    "Every applicable method's judgment must be considered. Preserve disagreements and source limitations. Use each method’s recorded status and supplied Canon to distinguish calculated activations from reference material. Use the recorded Shadbala and Bhava Bala component totals, adequacy, house lord delivery and relative rankings to qualify the interpretation. Capacity is distinct from favorable outcome; preserve the supplied fixed-XYZ/Equal-House and motion/calendar variants. Never invent scores when their method status is unavailable.",
    stringifyEvidence(packSynthesis(synthesis)),
  ].join("\n");
}

export type CompactSynthesisOptions = {
  maxJudgmentChars?: number;
  maxVargaRows?: number;
  maxTransitRows?: number;
  maxHouseRows?: number;
  maxOtherRows?: number;
  /** Keep all methodFindings metadata & canonApplications (used by energyReading). */
  preserveFullMethodRegistry?: boolean;
};

function truncateSentence(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const slice = clean.slice(0, maxChars - 1);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "), slice.lastIndexOf(" "));
  return (lastStop > maxChars * 0.55 ? slice.slice(0, lastStop) : slice).trim() + "…";
}

function strengthRank(strength: string | number | undefined): number {
  if (typeof strength === "number") return strength;
  switch (strength) {
    case "dominant": return 4;
    case "strong": return 3;
    case "moderate": return 2;
    case "subtle": return 1;
    default: return 0;
  }
}

function selectRepresentativeFindings<T extends { subject: string; strength?: string | number }>(
  methodId: string,
  findings: T[],
  opts: Required<Omit<CompactSynthesisOptions, "preserveFullMethodRegistry">>
): T[] {
  const baseId = methodId.replace(/^transit:/, "");
  let limit = opts.maxOtherRows;
  if (baseId === "vedic-vargas-divisional") limit = opts.maxVargaRows;
  else if (baseId === "transit-activation-layer") limit = opts.maxTransitRows;
  else if (baseId === "western-houses-and-angles") limit = opts.maxHouseRows;

  if (findings.length <= limit) return findings;

  // Keep highest-strength and core luminary/angle subjects first.
  const priorityRe = /\b(Sun|Moon|Ascendant|Midheaven|North Node|Mercury|Venus|Mars|Jupiter|Saturn|D9|D10|Lagna)\b/i;
  const sorted = [...findings].sort((a, b) => {
    const aPri = priorityRe.test(a.subject) ? 1 : 0;
    const bPri = priorityRe.test(b.subject) ? 1 : 0;
    if (bPri !== aPri) return bPri - aPri;
    return strengthRank(b.strength) - strengthRank(a.strength);
  });
  return sorted.slice(0, limit);
}

/**
 * Compact LLM packet (~12k-20k tokens vs ~555k tokens in packSynthesis).
 * Drops duplicate fullMethodOutcomes/sourceSnapshot/audit blobs and bounds high-cardinality
 * tables (D2-D60 vargas, 57 transit essays) while preserving method IDs, evidence IDs, and Canon rules.
 */
export function packCompactSynthesisForLLM(
  synthesis: SynthesisResult,
  options: CompactSynthesisOptions = {}
) {
  const opts = {
    maxJudgmentChars: options.maxJudgmentChars ?? 135,
    maxVargaRows: options.maxVargaRows ?? 4,
    maxTransitRows: options.maxTransitRows ?? 12,
    maxHouseRows: options.maxHouseRows ?? 8,
    maxOtherRows: options.maxOtherRows ?? 6,
  };
  const preserveFullMethodRegistry = options.preserveFullMethodRegistry ?? false;

  const allSources = Array.from(
    new Map(
      (synthesis.canonApplications ?? []).map(rule => [
        `${rule.ruleId}:${rule.sourceTitle ?? ""}`,
        {
          ruleId: rule.ruleId,
          ...(rule.sourceId ? { sourceId: rule.sourceId } : {}),
          ...(rule.sourceTitle ? { sourceTitle: rule.sourceTitle } : {}),
          ...(rule.confidence ? { confidence: rule.confidence } : {}),
        },
      ])
    ).values()
  );
  const fullSourceIndex = new Map(
    allSources.map((rule, index) => [`${rule.ruleId}:${rule.sourceTitle ?? ""}`, index])
  );

  const usedSourceKeys = new Set<string>();
  const rawOutcomes = (synthesis.methodOutcomes ?? []).map(outcome => {
    const selected = selectRepresentativeFindings(
      outcome.methodId,
      outcome.findingJudgments ?? [],
      opts
    );
    for (const f of selected) {
      for (const rule of f.rules ?? []) {
        usedSourceKeys.add(`${rule.ruleId}:${rule.sourceTitle ?? ""}`);
      }
    }
    return { outcome, selected };
  });

  const sources = preserveFullMethodRegistry
    ? allSources
    : allSources.filter(s => usedSourceKeys.has(`${s.ruleId}:${s.sourceTitle ?? ""}`));
  const activeSourceIndex = preserveFullMethodRegistry
    ? fullSourceIndex
    : new Map(sources.map((rule, index) => [`${rule.ruleId}:${rule.sourceTitle ?? ""}`, index]));

  return {
    snapshotId: synthesis.snapshotId,
    methodFindings: (synthesis.methodFindings ?? []).map(({ findings: _raw, ...metadata }) => {
      if (preserveFullMethodRegistry) {
        return {
          ...metadata,
          evidenceIds: (metadata.evidenceIds ?? []).slice(0, 16),
        };
      }
      return {
        id: metadata.id,
        status: metadata.status,
        frame: metadata.frame,
      };
    }),
    judgmentColumns: [
      "subject",
      "judgment",
      "evidenceIds",
      "sourceRefs",
      "valence",
      "strength",
      "frame",
    ],
    methodOutcomes: rawOutcomes.map(({ outcome, selected }) => ({
      methodId: outcome.methodId,
      methodName: outcome.methodName,
      chartScope: outcome.chartScope,
      frame: outcome.frame,
      status: outcome.status,
      findingCountTotal: outcome.findingJudgments?.length ?? 0,
      findingJudgments: selected.map(f => [
        f.subject,
        truncateSentence(f.judgment ?? "", opts.maxJudgmentChars),
        (f.evidenceIds ?? []).slice(0, 3),
        Array.from(
          new Set(
            (f.rules ?? []).map(rule =>
              activeSourceIndex.get(`${rule.ruleId}:${rule.sourceTitle ?? ""}`)
            )
          )
        ).filter((idx): idx is number => typeof idx === "number"),
        f.valence,
        f.strength,
        f.frame ?? outcome.frame,
      ]),
    })),
    canonApplications: sources,
    contradictionsAndTensions: (synthesis.contradictionsAndTensions ?? []).slice(0, 6),
    themes: (synthesis.themes ?? []).slice(0, 10).map(theme => ({
      id: theme.id,
      humanTheme: truncateSentence(theme.humanTheme, 160),
    })),
    ...(synthesis.timingOverview ? { timingOverview: synthesis.timingOverview } : {}),
  };
}

export function formatCompactSynthesisContext(
  synthesis: SynthesisResult,
  options?: CompactSynthesisOptions
) {
  return [
    "UNIFIED MASTER SYNTHESIS — COMPACT METHOD FINDINGS AND CANON APPLICATIONS",
    "Rows use judgmentColumns ([subject, judgment, evidenceIds, sourceRefs, valence, strength, frame]). sourceRefs index canonApplications. Preserve method execution statuses, separate natal (unprefixed) from event (transit:), and separate God House sectors from Agent local horizon houses. Cite original evidence ID strings, never sourceRef integers.",
    JSON.stringify(packCompactSynthesisForLLM(synthesis, options)),
  ].join("\n");
}

