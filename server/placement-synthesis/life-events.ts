import { familyContribution } from "./method-context";
import type { PlacementAdapter } from "./types";
export const lifeEvents: PlacementAdapter = context => familyContribution(context, "lifeEvents", "Life events and sequences", ["lifeEvents", "life-event-signature", "event-sequence-chain"]);
