import type { ChartResult, ChartRow } from "../astronomy";

export type LayerStatus =
  | "computed-with-result"
  | "computed-no-result"
  | "not-applicable"
  | "not-implemented"
  | "reference-only"
  | "failed";

export type ProjectionFrame =
  | "god"
  | "agent"
  | "shared"
  | "natal"
  | "transit"
  | "cross-chart";

export interface LayerRecord<T = unknown> {
  id: string;
  tradition:
    | "hellenistic"
    | "vedic"
    | "babylonian"
    | "sumerian"
    | "arabic-persian"
    | "chinese"
    | "kabbalah"
    | "genesis"
    | "firmament";
  technique: string;
  name: string;
  status: LayerStatus;
  frame: ProjectionFrame;
  results?: T;
  evidenceIds: string[];
  sourceIds: string[];
  prerequisites: string[];
  calculationVersion: string;
  errorCode?: string;
  notes?: string;
}

export interface MasterChartInput {
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  date: string;
  time: string;
  transitLocation?: string;
  transitLatitude?: number;
  transitLongitude?: number;
  transitTimezone?: string;
  transitDate?: string;
  transitTime?: string;
  transitInstantUtc?: string;
  instantUtc?: string;
  birthTimeKnown?: boolean;
  chartRole?: "natal" | "event";
  elevation?: number;
  mode?: "natal" | "transit" | "combined";
  worldview?: "god" | "agent" | "agent-vs-god";
  sunriseAnchor?: { sunriseUtc: string; sunriseSunXYZ: { x: number; y: number; z: number } };
  transitSunriseAnchor?: { sunriseUtc: string; sunriseSunXYZ: { x: number; y: number; z: number } };
  xyzPositions?: Record<string, { x: number; y: number; z: number }>;
  transitXYZPositions?: Record<string, { x: number; y: number; z: number }>;
}

export interface UnifiedMasterChartSnapshot {
  snapshotId: string;
  schemaVersion: "1.0.0";
  createdAtUtc: string;
  inputs: {
    profileIds: string[];
    eventInstantUtc: string;
    timezone: string;
    locationContext: {
      location: string;
      latitude: number;
      longitude: number;
    };
    mode: "natal" | "transit" | "combined";
    chartRole?: "natal" | "event";
  };
  frameConfig: {
    zodiacMode: "fixed-cartesian-xyz";
    firmamentAnchorVersion: "sunrise-xyz-15deg-hour-v1";
    firmamentCenter: "polaris-centered-firmament-dome";
    obliquityMode: "zero-tilt-xy-projection";
    precessionMode: "none-user-frame-fixed-anchor";
    houseSystem: "topocentric-equal-house-ascendant";
    engineVersion: "firmament-master-2026.3";
  };
  baseCelestialState: {
    julianDay: number;
    utc: string;
    ascendant: ChartRow | null;
    midheaven?: ChartRow | null;
    descendant?: ChartRow | null;
    northNode: ChartRow;
    southNode: ChartRow;
    planets: ChartRow[];
    houses: Array<{ house: number; sign: string; cusp: number; degreeDisplay: string }>;
  };
  godView: {
    description: string;
    cosmicFrame: "fixed-aries-1-to-pisces-12";
    polarisCenter: true;
    placements: Array<{
      body: string;
      longitude: number;
      display: string;
      godHouse: number;
      sign: string;
    }>;
  };
  agentView: {
    description: string;
    ascendantAnchor: string;
    houseSystem: "topocentric-equal-house-from-ascendant";
    placements: Array<{
      body: string;
      longitude: number;
      display: string;
      agentHouse: number;
      sign: string;
    }>;
    frameRelationships: Array<{
      body: string;
      longitude: number;
      display: string;
      godHouse: number;
      agentHouse: number;
      relationship: string;
    }>;
  };
  natal?: ChartResult;
  transit?: {
    transitInstantUtc: string;
    planets: ChartRow[];
    /** Same registered methods evaluated independently for the event sky. */
    framework?: UnifiedMasterChartSnapshot;
    aspectsToNatal: Array<{
      transitBody: string;
      natalBody: string;
      aspect: string;
      orb: number;
      nature: "harmonic" | "friction" | "dynamic";
    }>;
  };
  layers: Record<string, LayerRecord>;
  methodExecutionLedger: LayerRecord[];
  validation: {
    complete: boolean;
    errors: string[];
    warnings: string[];
    totalMethods: number;
    computedWithResultCount: number;
  };
}

export function getLayer<T = unknown>(
  snapshot: UnifiedMasterChartSnapshot,
  layerId: string
): LayerRecord<T> | undefined {
  return snapshot.layers[layerId] as LayerRecord<T> | undefined;
}

export function getEvidence(
  snapshot: UnifiedMasterChartSnapshot,
  evidenceId: string
): LayerRecord | undefined {
  return snapshot.methodExecutionLedger.find(l =>
    l.evidenceIds.includes(evidenceId)
  );
}

export function getModeView(
  snapshot: UnifiedMasterChartSnapshot,
  mode: "god" | "agent" | "shared"
) {
  if (mode === "god") return snapshot.godView;
  if (mode === "agent") return snapshot.agentView;
  return { godView: snapshot.godView, agentView: snapshot.agentView };
}

/** Calculated results travel with every published chart; no recursive ChartResult copies. */
export interface MasterMethodBindings {
  snapshotId: string;
  base: LayerRecord[];
  transit: LayerRecord[];
  synthesisAudit: { passed: boolean; groundedRatio: number; canonApplicationCount: number };
}
