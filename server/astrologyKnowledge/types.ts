import type { ChartResult } from "../astronomy";
import type { BehavioralIntelligenceReport } from "./behavioral";
import type { ChartCanonDossier } from "./canon/types";

export type Tradition = "western" | "vedic" | "arabic" | "firmament";
export type KnowledgeKind = "deterministic-rule" | "source-correspondence";
export type RuleStatus = "implemented" | "incomplete";
export type EvidenceRelation =
  | "reinforcement"
  | "amplification"
  | "qualification"
  | "contradiction"
  | "tension"
  | "different-layer"
  | "timing-difference";

export type AstrologySource = {
  id: string;
  name: string;
  tradition: Tradition;
  authorityType: "calculation" | "tradition" | "reference" | "api";
  url?: string;
  status: "active" | "reference-only" | "disabled";
  capabilities: string[];
};

export type AstrologyRule = {
  id: string;
  tradition: Tradition;
  technique: string;
  subject: string;
  kind: KnowledgeKind;
  sourceId: string;
  status: RuleStatus;
  statement: string;
  doctrine?: string;
};

export type KnowledgePlan = {
  question: string;
  coreLayers: [
    "genesis-astro-engine",
    "genesis-pattern-engine",
    "genesis-yoga-detector",
  ];
  genesisPolicy: "mandatory-evaluate-before-prioritization";
  domains: string[];
  subjects: string[];
  techniques: string[];
  includeTiming: boolean;
  includeDivisionalCharts: string[];
  reasons: string[];
};

export type EvidenceItem = {
  id: string;
  tradition: Tradition;
  category:
    | "calculated-fact"
    | "deterministic-rule"
    | "source-correspondence"
    | "uncertainty";
  technique: string;
  subject: string;
  statement: string;
  concepts: string[];
  polarity?: "supportive" | "pressured" | "mixed" | "neutral";
  strength?: number;
  ruleId?: string;
  sourceId: string;
  sourceTrace: SourceTrace;
};

export type SourceTrace = {
  sourceId: string;
  tradition: Tradition;
  technique: string;
  sourceUrl?: string;
  sourceTitle: string;
  retrievedAt: string;
  ruleId?: string;
  confidence: "high" | "moderate" | "low" | "reference-only";
  provider?: string;
  calculationSettings?: Record<string, unknown>;
  implementationStatus?: RuleStatus;
};

export type EvidenceRelationship = {
  id: string;
  relation: EvidenceRelation;
  theme: string;
  evidenceIds: string[];
  traditions: Tradition[];
  explanation: string;
  strength: number;
};

export type AstrologyEvidencePacket = {
  question: string;
  plan: KnowledgePlan;
  chartFacts: {
    worldview: ChartResult["worldview"];
    readingScope: ChartResult["readingScope"];
    utc: string;
    agentViewAvailable: boolean;
    placements: Array<{
      name: string;
      longitude: number;
      display: string;
      house: number;
      godHouse?: number;
      agentHouse?: number;
    }>;
  };
  westernEvidence: EvidenceItem[];
  patternEvidence: EvidenceItem[];
  genesisAstroEvidence: EvidenceItem[];
  behavioralEvidence: EvidenceItem[];
  lifeEventEvidence: EvidenceItem[];
  behavioralReport: BehavioralIntelligenceReport;
  canonEvidence: EvidenceItem[];
  canonDossier: ChartCanonDossier;
  vedicEvidence: EvidenceItem[];
  arabicEvidence: EvidenceItem[];
  lunarEvidence: EvidenceItem[];
  fixedStarEvidence: EvidenceItem[];
  timingEvidence: EvidenceItem[];
  relationships: EvidenceRelationship[];
  convergences: EvidenceRelationship[];
  contradictions: EvidenceRelationship[];
  uncertainties: EvidenceItem[];
  incomplete: string[];
  sourceTrace: SourceTrace[];
  doctrine: {
    genesis: Record<string, unknown>;
    western: Record<string, unknown>;
    vedic: Record<string, unknown>;
    arabic: Record<string, unknown>;
  };
};
