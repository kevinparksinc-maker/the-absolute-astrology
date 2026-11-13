import type {
  LayerRecord,
  UnifiedMasterChartSnapshot,
} from "../../masterChart/types";
import type {
  CanonRuleApplication,
  MethodOutcome,
  MethodOutcomeFinding,
} from "./types";
import { applyMethodRules } from "./methodRules";

const frameOf = (layer: LayerRecord): MethodOutcome["frame"] =>
  ["god", "agent", "transit"].includes(layer.frame)
    ? (layer.frame as MethodOutcome["frame"])
    : "shared";
function findings(layer: LayerRecord): MethodOutcomeFinding[] {
  const values = Array.isArray(layer.results)
    ? layer.results
    : layer.results == null
      ? []
      : [layer.results];
  return values.map((value, index) => ({
    evidenceId: layer.evidenceIds[index] ?? layer.evidenceIds[0] ?? layer.id,
    label: `${layer.name} finding ${index + 1}`,
    calculatedValue: typeof value === "string" ? value : JSON.stringify(value),
  }));
}
function outcome(
  layer: LayerRecord,
  snapshot: UnifiedMasterChartSnapshot,
  canon: CanonRuleApplication[]
): MethodOutcome {
  const event =
    layer.id.startsWith("transit:") ||
    layer.id === "transit-activation-layer" ||
    snapshot.inputs.chartRole === "event";
  const base = {
    methodId: layer.id,
    methodName: layer.name,
    tradition: layer.tradition,
    chartScope: event ? ("event" as const) : ("natal" as const),
    frame: frameOf(layer),
    calculatedFindings: findings(layer),
    findingJudgments: [],
    canonApplications: [],
    evidenceIds: layer.evidenceIds,
    strengthAndLimitations: layer.notes ? [layer.notes] : [],
    missingCanon: false,
  };
  if (layer.status === "reference-only")
    return {
      ...base,
      status: "reference-only",
      interpretation:
        layer.notes ??
        "Reference catalog; no executable personal placement method.",
      judgment:
        "No personal method judgment is issued from this reference-only catalog.",
      contribution: "Historical reference; excluded from interpreted themes.",
    };
  if (layer.status === "not-applicable")
    return {
      ...base,
      status: "not-applicable",
      interpretation:
        layer.notes ?? "This method's required chart scope is absent.",
      judgment: "No judgment for this scope.",
      contribution: "Not applicable; excluded from interpreted themes.",
    };
  if (layer.status === "computed-no-result")
    return {
      ...base,
      status: "no-result",
      interpretation:
        "The calculation completed and found no qualifying result.",
      judgment:
        "No positive activation was found under the method's configured conditions.",
      contribution:
        "Successful empty calculation; no personal indication inferred.",
    };
  if (layer.status !== "computed-with-result")
    return {
      ...base,
      status: "failed",
      interpretation:
        layer.notes ?? layer.errorCode ?? "The calculation is unavailable.",
      judgment: "Judgment blocked by the calculation failure.",
      contribution: "Calculation status is retained in the complete raw snapshot for AI interpretation.",
    };
  try {
    const judgments = applyMethodRules(layer, snapshot);
    if (!judgments.length)
      throw new Error(
        "METHOD_RULE_MISSING: No applicable finding judgments were produced."
      );
    const allIds = new Set(layer.evidenceIds);
    const linked = canon.filter(rule =>
      rule.calculationEvidenceIds.some(id => allIds.has(id))
    );
    // Link retrieved chart-specific doctrine to the outcome's actual judgments.
    // Detached rules remain unlinked and fail the final audit.
    for (const judgment of judgments)
      judgment.rules.push(
        ...linked.filter(rule =>
          rule.calculationEvidenceIds.some(id =>
            judgment.evidenceIds.includes(id)
          )
        )
      );
    // These producers already calculate relational/condition testimony from
    // explicit chart relationships. Admit that testimony as a judged modifier,
    // once in its owning method, rather than re-normalizing the raw snapshot.
    const owner: Record<string, string> = {
      "firmament-traditional-mechanisms": "western-planets-and-signs",
      "firmament-relational-chain": "western-houses-and-angles",
      "firmament-vedic-yogas": "genesis-behavioral-patterns",
      "firmament-arabic-persian-tradition": "arabic-hermetic-lots",
    };
    const localId = layer.id.replace(/^transit:/, "");
    const scopeIds = new Set(
      snapshot.methodExecutionLedger
        .filter(
          m => m.id.startsWith("transit:") === layer.id.startsWith("transit:")
        )
        .flatMap(m => m.evidenceIds)
    );
    for (const rule of canon.filter(
      rule =>
        owner[rule.ruleId] === localId &&
        rule.calculationEvidenceIds.some(id => scopeIds.has(id)) &&
        rule.implementationStatus !== "incomplete" &&
        rule.confidence !== "reference-only"
    )) {
      const ids = rule.calculationEvidenceIds.filter(id => scopeIds.has(id));
      const supportive = [
        "mutual-reception",
        "unilateral-reception",
        "translation-of-light",
        "collection-of-light",
        "cazimi",
      ].includes(rule.technique);
      const challenging = [
        "combustion",
        "besiegement",
        "prohibition",
        "frustration",
        "void-of-course",
      ].includes(rule.technique);
      judgments.push({
        id: `prop-method-${layer.id}-canon-${rule.canonEvidenceId}`,
        subject: rule.subject,
        domain: judgments[0].domain,
        judgment: rule.statement,
        mechanism: rule.technique,
        valence: supportive
          ? "supportive"
          : challenging
            ? "challenging"
            : "neutral",
        strength: "moderate",
        evidenceIds: ids,
        rules: [rule],
      });
    }
    const applications = Array.from(
      new Map(
        judgments
          .flatMap(j => j.rules)
          .map(rule => [rule.canonEvidenceId, rule])
      ).values()
    );
    const missingIds = layer.evidenceIds.filter(
      id => !judgments.some(j => j.evidenceIds.includes(id))
    );
    if (missingIds.length)
      throw new Error(
        `METHOD_EVIDENCE_UNINTERPRETED: ${missingIds.join(", ")}`
      );
    return {
      ...base,
      status: "interpreted",
      findingJudgments: judgments,
      canonApplications: applications,
      interpretation: judgments.map(j => j.judgment).join("\n\n"),
      judgment: judgments.map(j => j.judgment).join("\n\n"),
      contribution: `${judgments.length} finding-specific judgments contribute to ${Array.from(new Set(judgments.map(j => j.domain))).join(", ")}.`,
      strengthAndLimitations: [
        ...base.strengthAndLimitations,
        ...judgments.flatMap(j => (j.limitation ? [j.limitation] : [])),
      ],
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      ...base,
      status: "failed",
      missingCanon: reason.includes("RULE_MISSING") || reason.includes("CANON"),
      interpretation: reason,
      judgment:
        "No traditional judgment issued: this method failed rule application.",
      contribution:
        "Rule interpretation failed; calculated values remain available in the raw snapshot for AI interpretation.",
      strengthAndLimitations: [...base.strengthAndLimitations, reason],
    };
  }
}
export function buildMethodOutcomes(
  snapshot: UnifiedMasterChartSnapshot,
  canonApplications: CanonRuleApplication[]
): MethodOutcome[] {
  return snapshot.methodExecutionLedger.map(layer =>
    outcome(layer, snapshot, canonApplications)
  );
}
