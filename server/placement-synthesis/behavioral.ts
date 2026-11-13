import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const behavioral: PlacementAdapter = context => familyContribution(context, "behavior", "Human behavioral intelligence", ["behavior", "behavioral-pattern", "behavioral-polarity", "interaction-matrix"]);
