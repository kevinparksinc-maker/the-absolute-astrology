import type { LayerRecord } from "./types";

/** Every chart evaluates this same formation; scope changes results, not membership. */
export const MASTER_METHOD_IDS = [
  "western-planets-and-signs",
  "sumerian-celestial-foundations",
  "western-houses-and-angles",
  "western-aspects-and-orbs",
  "western-essential-dignities",
  "fixed-stars-royal-watchers",
  "arabic-hermetic-lots",
  "arabic-lunar-manazil",
  "vedic-nakshatras-and-padas",
  "vedic-vargas-divisional",
  "vedic-dasha-and-ashtakavarga",
  "vedic-graha-drishti",
  "vedic-shadbala",
  "vedic-bhava-bala",
  "chinese-lunar-mansions-xiu",
  "elemental-decans",
  "kabbalah-sefer-yetzirah",
  "genesis-behavioral-patterns",
  "transit-activation-layer",
] as const;

export function registeredMethodLedger(
  layers: Record<string, LayerRecord>
): LayerRecord[] {
  const missing = MASTER_METHOD_IDS.filter(id => !layers[id]);
  const extra = Object.keys(layers).filter(
    id => !(MASTER_METHOD_IDS as readonly string[]).includes(id)
  );
  if (missing.length || extra.length)
    throw new Error(
      `MASTER_METHOD_REGISTRY_MISMATCH: missing=${missing.join(",")}; unregistered=${extra.join(",")}`
    );
  return MASTER_METHOD_IDS.map(id => layers[id]);
}
