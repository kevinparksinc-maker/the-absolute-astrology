import { useEffect, useMemo, useState } from "react";
import type { ChartResult, ChartRow } from "../../../server/astronomy";
import { FocusedPlacementReading } from "./FocusedPlacementReading";
interface InfiniteDiscoveryProps {
  chart: ChartResult;
  onSelectDrawer?: (drawerOrderOrId: number | string) => void;
  className?: string;
  compact?: boolean;
}
/** Selection opens source-backed chart interpretation; cards contain calculated facts only. */
export function InfiniteDiscoveryEngine({
  chart,
  onSelectDrawer,
  className = "",
  compact = false,
}: InfiniteDiscoveryProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const bodies = useMemo(
    () =>
      [
        ...chart.movingBodies,
        chart.ascendant,
        chart.descendant,
        chart.northNode,
        chart.southNode,
      ].filter((body): body is ChartRow =>
        Boolean(body && Number.isFinite(body.longitude))
      ),
    [chart]
  );
  useEffect(() => {
    setSelected(null);
  }, [chart]);
  const shown = bodies.filter(body =>
    `${body.name} ${body.display} ${body.overlay?.nakshatra || ""} ${body.overlay?.manzil || ""}`
      .toLowerCase()
      .includes(query.toLowerCase().trim())
  );
  return (
    <section
      className={`space-y-6 ${className}`}
      aria-label="Explore your calculated placements"
    >
      <header className="space-y-2">
        <h2 className="font-serif text-2xl text-amber-100">
          Understand a placement
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Select a body to explore its actual sign, house, condition, mansions
          and contacts through the recorded Canon. Missing information is
          identified explicitly.
        </p>
      </header>
      {!compact && (
        <label className="block text-sm text-slate-400">
          Find a placement
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search a planet, sign or mansion…"
            className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/60 p-3 text-white"
          />
        </label>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(body => (
          <button
            key={body.name}
            type="button"
            aria-pressed={selected === body.name}
            onClick={() => setSelected(body.name)}
            className={`space-y-2 rounded-2xl border p-4 text-left ${selected === body.name ? "border-amber-200/50 bg-amber-200/10" : "border-white/10 bg-slate-950/50 hover:border-cyan-200/30"}`}
          >
            <span className="block font-semibold text-white">{body.name}</span>
            <span className="block text-sm text-slate-300">{body.display}</span>
            <span className="block text-xs text-slate-400">
              {chart.worldview === "god" ? "God" : "Agent"} House{" "}
              {chart.worldview === "god"
                ? (body.godHouse ?? body.house)
                : (body.agentHouse ?? body.house)}
            </span>
          </button>
        ))}
      </div>
      {!shown.length && (
        <p role="status" className="text-sm text-slate-400">
          No calculated placement matches this search.
        </p>
      )}
      {selected && (
        <div className="rounded-2xl border border-white/15 bg-slate-950/70 p-5">
          <FocusedPlacementReading chart={chart} name={selected} />
          {onSelectDrawer && (
            <button
              type="button"
              onClick={() =>
                onSelectDrawer(
                  ["Sun", "Moon", "Ascendant"].includes(selected) ? 1 : 2
                )
              }
              className="mt-5 text-sm text-cyan-200 underline"
            >
              Inspect this placement in the calculation drawers
            </button>
          )}
        </div>
      )}
    </section>
  );
}
