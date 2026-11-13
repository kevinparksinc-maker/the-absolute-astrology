import type { ChartResult } from "../../../server/astronomy";
import { InfiniteDiscoveryEngine } from "./InfiniteDiscoveryEngine";

interface PersonalDiscoveryCarouselProps {
  chart: ChartResult;
  compact?: boolean;
  onSelectDrawer?: (drawerOrderOrId: number | string) => void;
}

/** Calculated placements open a shared, source-backed interpretation panel. */
export function PersonalDiscoveryCarousel({
  chart,
  compact = false,
  onSelectDrawer,
}: PersonalDiscoveryCarouselProps) {
  return (
    <InfiniteDiscoveryEngine
      chart={chart}
      compact={compact}
      onSelectDrawer={onSelectDrawer}
    />
  );
}