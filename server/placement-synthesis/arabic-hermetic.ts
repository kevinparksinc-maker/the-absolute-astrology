import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const arabicHermetic: PlacementAdapter = context => familyContribution(context, "arabic", "Arabic / Hermetic", ["arabic", "sect", "lots", "manzil", "planetary-hours", "twelfth-parts", "traditional-mechanisms"]);
