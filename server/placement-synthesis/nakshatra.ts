import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const nakshatra: PlacementAdapter = context => familyContribution(context, "nakshatra", "Nakshatra / Pada", ["nakshatra"]);
