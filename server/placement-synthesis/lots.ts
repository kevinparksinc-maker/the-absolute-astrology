import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const lots: PlacementAdapter = context => familyContribution(context, "lots", "Lots: Fortune, Spirit, Eros and Necessity", ["lots"]);
