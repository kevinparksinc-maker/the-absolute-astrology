import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const vedic: PlacementAdapter = context => familyContribution(context, "vedic", "Vedic / Jyotish", ["vedic", "nakshatra", "drishti", "varga", "dasha", "ashtakavarga", "house-lord"]);
