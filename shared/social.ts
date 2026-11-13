import type { ChartResult } from "../server/astronomy";

export type RelationshipRole = "child" | "partner" | "parent" | "sibling" | "friend" | "mentor" | "colleague";

export interface LovedOneInput {
  id?: number;
  name: string;
  relationship: RelationshipRole;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  date: string;
  time?: string;
  notes?: string;
}

export interface LovedOneRecord extends LovedOneInput {
  id: number;
  openId: string;
  cachedChart?: ChartResult;
  createdAt: string;
  updatedAt: string;
}

export interface SystemIntersectAnalysis {
  harmonyScore: number; // 0 - 100
  dynamicTitle: string; // e.g. "Stabilizer & Catalyst", "Deep Soul Mirror", "Strategic Resonance"
  elementalBalance: {
    userPrimary: string;
    targetPrimary: string;
    synergyNote: string;
  };
  keyConnections: Array<{
    type: "support" | "friction" | "karmic";
    planets: string;
    aspectName: string;
    orb: number;
    interpretation: string;
  }>;
  houseOverlays: Array<{
    planet: string;
    houseInTarget: number;
    meaning: string;
  }>;
  currentTransitIntersect: {
    mutualPressure: "low" | "moderate" | "high";
    summary: string;
    frictionPoints: string[];
    harmoniousWindows: string[];
  };
}

export interface LovedOneCheckInStatus {
  lovedOneName: string;
  relationship: RelationshipRole;
  pressureLevel: "calm" | "moderate" | "high" | "severe";
  activeSignatures: string[];
  mechanicsSummary: string;
  actionableEmpathyPrompt: {
    whatTheyAreProcessing: string;
    howToShowUp: string;
    whatToAvoid: string;
  };
  suggestedCheckInMessage: string;
  dominantTransitBody: string;
}
