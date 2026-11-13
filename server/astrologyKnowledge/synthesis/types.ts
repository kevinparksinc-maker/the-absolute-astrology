import type { UnifiedMasterChartSnapshot } from "../../masterChart/types";

export interface CanonRuleApplication {
  canonEvidenceId: string;
  ruleId: string;
  sourceId: string;
  sourceTitle: string;
  technique: string;
  subject: string;
  statement: string;
  calculationEvidenceIds: string[];
  confidence: "high" | "moderate" | "low" | "reference-only";
  implementationStatus?: "implemented" | "incomplete";
}

export type HumanDomain =
  | "identity"
  | "purpose_work"
  | "relationships"
  | "resources_wealth"
  | "family_home"
  | "autonomy_power"
  | "energy_wellbeing"
  | "choices_obstacles"
  | "timing";

export interface SynthesisInput {
  snapshot: UnifiedMasterChartSnapshot;
  readingMode: "natal" | "transit" | "combined";
  userQuestion?: string;
  canonApplications?: CanonRuleApplication[];
}

export type MethodOutcomeStatus =
  | "interpreted"
  | "reference-only"
  | "not-applicable"
  | "failed"
  | "no-result";

export interface MethodOutcomeFinding {
  evidenceId: string;
  label: string;
  calculatedValue: string;
}

export interface FindingJudgment {
  frame?: "god" | "agent" | "shared" | "transit";
  id: string;
  subject: string;
  domain: HumanDomain;
  judgment: string;
  mechanism: string;
  valence: InterpretedProposition["valence"];
  strength: InterpretedProposition["strength"];
  evidenceIds: string[];
  rules: CanonRuleApplication[];
  limitation?: string;
}

export interface MethodOutcome {
  methodId: string;
  methodName: string;
  tradition: string;
  chartScope: "natal" | "event";
  frame: "god" | "agent" | "shared" | "transit";
  status: MethodOutcomeStatus;
  calculatedFindings: MethodOutcomeFinding[];
  findingJudgments: FindingJudgment[];
  canonApplications: CanonRuleApplication[];
  interpretation: string;
  judgment: string;
  contribution: string;
  evidenceIds: string[];
  strengthAndLimitations: string[];
  missingCanon: boolean;
}

export interface InterpretedProposition {
  id: string;
  themeTitle: string;
  plainLanguageMeaning: string;
  domain: HumanDomain;
  causalMechanism: string; // e.g., "Mars in 10th House trine Sun"
  valence: "supportive" | "challenging" | "transformative" | "neutral";
  strength: "dominant" | "strong" | "moderate" | "subtle";
  tradition: string; // "Hellenistic", "Vedic Jyotish", "Babylonian Fixed Stars", "Arabic Lots", "Kabbalah", etc.
  frame: "god" | "agent" | "shared" | "transit";
  supportingEvidenceIds: string[];
  opposingEvidenceIds: string[];
  sourceDoctrineIds: string[];
  canonRuleIds?: string[];
  canonApplications?: Array<Pick<CanonRuleApplication, "canonEvidenceId" | "ruleId" | "sourceTitle" | "statement">>;
}

export interface SynthesizedTheme {
  id: string;
  humanTheme: string;
  domain: HumanDomain;
  primaryConclusion: string;
  whyHow: string;
  concreteManifestations: string[];
  consequences: string;
  deeperMeaning: string;
  timing?: {
    onset?: string;
    peak?: string;
    easing?: string;
    notes?: string;
  };
  convergenceAssessment: {
    independentTraditions: string[];
    corroborationLevel:
      | "unanimous"
      | "strong-corroboration"
      | "moderate-reinforcement"
      | "singular";
    tensions: string[];
    reconciliation: string;
  };
  linkedPropositionIds: string[];
  evidenceIds: string[];
}

export interface SynthesisResult {
  /** Complete calculation snapshot for the AI evidence packet. */
  sourceSnapshot: UnifiedMasterChartSnapshot;
  snapshotId: string;
  mode: "natal" | "transit" | "combined";
  dominantConclusion: string;
  integratedNarrative: string[];
  methodFindings: Array<{ id: string; name: string; tradition: string; status: string; frame: string; evidenceIds: string[]; sourceIds: string[]; resultCount: number; findings: Array<{ label: string; details: string }>; notes?: string }>;
  methodOutcomes: MethodOutcome[];
  themes: SynthesizedTheme[];
  contradictionsAndTensions: Array<{
    polarities: string;
    reconciliation: string;
    evidenceIds: string[];
  }>;
  timingOverview?: {
    activeWindow: string;
    turningPoints: string[];
  };
  methodLedgerSummary: {
    totalEvaluated: number;
    computedWithResult: number;
    referenceOnly: number;
    notApplicable: number;
    failed: number;
  };
  evidenceTraceMap: Record<string, string[]>;
  canonApplications: CanonRuleApplication[];
  methodOutcomeAudit: {
    complete: boolean;
    incompleteMethodIds: string[];
  };
  qualityAudit: {
    groundedRatio: number; // 1.0 (100% of claims grounded in evidence IDs)
    unsupportedClaims: string[];
    passed: boolean;
  };
}
