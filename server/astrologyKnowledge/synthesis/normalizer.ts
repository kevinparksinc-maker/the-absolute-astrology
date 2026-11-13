import type { UnifiedMasterChartSnapshot } from "../../masterChart/types";
import type {
  CanonRuleApplication,
  InterpretedProposition,
  MethodOutcome,
} from "./types";
import { buildMethodOutcomes } from "./methodOutcomes";

/** Retained for diagnostic callers; never used as a substitute for interpretation. */
export function describeComputedFinding(value: unknown): string {
  if (value == null) return "No finding value supplied";
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value))
    return value.map(describeComputedFinding).join("; ");
  return Object.entries(value)
    .filter(([, v]) => v != null)
    .map(
      ([k, v]) =>
        `${k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ")}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`
    )
    .join("; ");
}

/** The only interpretation input to clustering is a successfully applied method judgment. */
export function extractPropositionsFromMethodOutcomes(
  outcomes: MethodOutcome[]
): InterpretedProposition[] {
  return outcomes
    .filter(outcome => outcome.status === "interpreted")
    .flatMap(outcome =>
      outcome.findingJudgments.map(finding => ({
        id: finding.id,
        themeTitle: `${outcome.chartScope === "event" ? "Event · " : ""}${finding.subject} · ${outcome.methodName}`,
        plainLanguageMeaning: finding.judgment,
        domain: finding.domain,
        causalMechanism: finding.mechanism,
        valence: finding.valence,
        strength: finding.strength,
        tradition: outcome.tradition,
        frame: finding.frame ?? outcome.frame,
        supportingEvidenceIds: finding.evidenceIds,
        opposingEvidenceIds: [],
        sourceDoctrineIds: Array.from(
          new Set(finding.rules.map(rule => rule.sourceId))
        ),
        canonRuleIds: Array.from(
          new Set(finding.rules.map(rule => rule.ruleId))
        ),
        canonApplications: finding.rules.map(rule => ({
          canonEvidenceId: rule.canonEvidenceId,
          ruleId: rule.ruleId,
          sourceTitle: rule.sourceTitle,
          statement: rule.statement,
        })),
      }))
    );
}

/** Compatibility entry point, routed through the same handlers rather than raw normalization. */
export function extractPropositionsFromSnapshot(
  snapshot: UnifiedMasterChartSnapshot,
  canonApplications: CanonRuleApplication[] = []
): InterpretedProposition[] {
  return extractPropositionsFromMethodOutcomes(
    buildMethodOutcomes(snapshot, canonApplications)
  );
}
