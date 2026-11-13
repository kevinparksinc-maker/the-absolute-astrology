import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const fixedStars: PlacementAdapter = context => familyContribution(context, "fixedStars", "Fixed stars", ["fixed-star-aspects", "fixed-star-position-and-meaning"]);
