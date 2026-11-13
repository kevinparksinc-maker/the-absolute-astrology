import { z } from "zod";

export const PlanetPlacementSchema = z.object({
  planet: z.string().min(1),
  longitude: z.number().finite().min(0).lt(360),
  sign: z.string().optional(),
  house: z.number().int().min(1).max(12).optional(),
  retrograde: z.boolean().optional(),
  speed: z.number().finite().optional(),
  source: z.string().optional(),
});
export type PlanetPlacement = z.infer<typeof PlanetPlacementSchema>;

export const WesternAspectSchema = z.object({
  planetA: z.string().min(1),
  planetB: z.string().min(1),
  type: z.enum([
    "conjunction",
    "sextile",
    "square",
    "trine",
    "opposition",
    "quincunx",
  ]),
  exactAngle: z.number().finite(),
  orb: z.number().finite().nonnegative(),
  strength: z.number().min(0).max(1),
  themes: z.array(z.string()).default([]),
});
export type WesternAspect = z.infer<typeof WesternAspectSchema>;

export const WesternSnapshotSchema = z.object({
  placements: z.array(PlanetPlacementSchema),
  aspects: z.array(WesternAspectSchema).default([]),
  provider: z.string().default("local-western"),
});
export type WesternSnapshot = z.infer<typeof WesternSnapshotSchema>;

export const VedicSignalSchema = z.object({
  planet: z.string().min(1),
  longitude: z.number().finite().min(0).lt(360).optional(),
  sign: z.string().optional(),
  house: z.number().int().min(1).max(12).optional(),
  nakshatra: z.string().optional(),
  pada: z.number().int().min(1).max(4).optional(),
  dignity: z
    .enum(["exalted", "own-sign", "neutral", "debilitated", "unknown"])
    .default("unknown"),
  themes: z.array(z.string()).default([]),
  raw: z.record(z.string(), z.unknown()).optional(),
});
export type VedicSignal = z.infer<typeof VedicSignalSchema>;

export const VedicSnapshotSchema = z.object({
  signals: z.array(VedicSignalSchema),
  provider: z.string().default("mock-tvam"),
});
export type VedicSnapshot = z.infer<typeof VedicSnapshotSchema>;

export const ArabicSignalSchema = z.object({
  planet: z.string().min(1),
  longitude: z.number().finite().min(0).lt(360).optional(),
  manzil: z.string().optional(),
  hourLord: z.string().optional(),
  lot: z.string().optional(),
  themes: z.array(z.string()).default([]),
  raw: z.record(z.string(), z.unknown()).optional(),
});
export type ArabicSignal = z.infer<typeof ArabicSignalSchema>;

export const ArabicSnapshotSchema = z.object({
  signals: z.array(ArabicSignalSchema),
  lots: z.record(z.string(), z.number().finite().min(0).lt(360)).default({}),
  provider: z.string().default("mock-canopy"),
});
export type ArabicSnapshot = z.infer<typeof ArabicSnapshotSchema>;

export const PatternRequestSchema = z.object({
  userQuestion: z.string().trim().min(1).max(4000),
  western: WesternSnapshotSchema,
  vedic: VedicSnapshotSchema,
  arabic: ArabicSnapshotSchema,
  minimumScore: z.number().min(0).max(1).default(0.35),
});
export type PatternRequest = z.infer<typeof PatternRequestSchema>;

export const DiscoveredPatternSchema = z.object({
  id: z.string(),
  label: z.string(),
  score: z.number().min(0).max(1),
  systems: z.array(z.enum(["western", "vedic", "arabic"])),
  evidence: z.array(z.string()),
  themes: z.array(z.string()),
  synthesis: z.string(),
});
export type DiscoveredPattern = z.infer<typeof DiscoveredPatternSchema>;

export const PatternAnalysisSchema = z.object({
  userQuestion: z.string(),
  aspects: z.array(WesternAspectSchema),
  patterns: z.array(DiscoveredPatternSchema),
  signatures: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type PatternAnalysis = z.infer<typeof PatternAnalysisSchema>;
