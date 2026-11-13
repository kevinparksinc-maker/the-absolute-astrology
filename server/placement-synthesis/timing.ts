import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const timing: PlacementAdapter = context => familyContribution(context, "timing", "Timing and activation", ["timing", "dasha", "ashtakavarga", "planetary-hours", "life-event-signature", "event-sequence-chain"]);
