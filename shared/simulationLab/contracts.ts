/** Immutable, reproducible input for every Simulation Lab method. */
export type TeamSide = "asc" | "desc";
export type MethodVerdict = TeamSide | "tie" | "unavailable";
export type Evidence = Readonly<{ id: string; description: string; value?: number | string; source?: string }>;
export type GameChartSnapshot = Readonly<{
  id: string;
  generatedAt: string;
  league: "NFL" | "NBA" | "NHL";
  scheduledStart: string;
  venue: Readonly<{ name: string; latitude: number; longitude: number; timezone: string }>;
  ascTeam: string;
  descTeam: string;
  chartEvidence: readonly Evidence[];
  /** Physical observations are recorded separately from symbolic chart evidence. */
  physicalEvidence: readonly Evidence[];
  chartVersion: string;
  masterMethods?: import("../../server/masterChart/types").MasterMethodBindings;
}>;
export type MethodResult = Readonly<{
  methodId: string;
  methodName: string;
  verdict: MethodVerdict;
  ascScore: number | null;
  descScore: number | null;
  evidenceIds: readonly string[];
  what: string;
  why: string;
  consequence: string;
  limitations: readonly string[];
}>;
export type GameMethod = Readonly<{
  id: string;
  name: string;
  evaluate(snapshot: GameChartSnapshot): MethodResult;
}>;
