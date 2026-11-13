import { useState } from "react";
import type { ChartResult } from "../../../server/astronomy";
import { trpc } from "@/lib/trpc";

const DIVISIONS = ["D1", "D2", "D3", "D9", "D10"] as const;
const HOUSE_REGIONS = [
  { n: 1, points: "200,0 100,100 200,200 300,100", x: 200, y: 95 },
  { n: 2, points: "200,0 0,0 100,100", x: 108, y: 45 },
  { n: 3, points: "0,0 0,200 100,100", x: 49, y: 105 },
  { n: 4, points: "0,200 100,100 200,200 100,300", x: 100, y: 205 },
  { n: 5, points: "0,200 0,400 100,300", x: 49, y: 302 },
  { n: 6, points: "0,400 200,400 100,300", x: 108, y: 355 },
  { n: 7, points: "200,400 100,300 200,200 300,300", x: 200, y: 305 },
  { n: 8, points: "200,400 400,400 300,300", x: 294, y: 355 },
  { n: 9, points: "400,400 400,200 300,300", x: 350, y: 302 },
  { n: 10, points: "400,200 300,300 200,200 300,100", x: 300, y: 205 },
  { n: 11, points: "400,200 400,0 300,100", x: 350, y: 105 },
  { n: 12, points: "400,0 200,0 300,100", x: 294, y: 45 },
] as const;
type HouseData = { house: number; sign: string; planets: string[] };
function VedicDiamond({ houses, division }: { houses: HouseData[]; division: string }) {
  return <svg viewBox="0 0 400 400" role="img" aria-label={`${division} North Indian diamond with 12 houses`}
    className="mx-auto w-full max-w-md rounded-xl bg-slate-950 text-amber-100">
    {HOUSE_REGIONS.map(region => {
      const house = houses.find(h => h.house === region.n);
      return <g key={region.n}>
        <polygon points={region.points} fill="transparent" stroke="#d4a54e" strokeWidth="1.5"/>
        <text x={region.x} y={region.y - 17} textAnchor="middle" fontSize="11" fill="#fbbf24">H{region.n} · {house?.sign ?? "?"}</text>
        {(house?.planets ?? []).map((planet, i) =>
          <text key={planet + i} x={region.x} y={region.y + i * 13} textAnchor="middle" fontSize="11" fill="#f8fafc">{planet}</text>)}
      </g>;
    })}
  </svg>;
}


/** Profile chart already exists. Query only projects its natal positions. */
export function VedicDivisionalCharts({ chart }: { chart: ChartResult }) {
  const [selected, setSelected] = useState<(typeof DIVISIONS)[number]>("D1");
  const { data, isLoading, error } = trpc.vedic.divisionalCharts.useQuery({ chart }, { retry: false });
  const active = data?.find(item => item.division === selected);
  return (
    <section aria-label="Vedic divisional charts" className="rounded-2xl border border-amber-400/30 bg-slate-950/70 p-4 space-y-4">
      <div>
        <h2 className="font-serif text-xl font-bold text-amber-100">Vedic Divisional Charts</h2>
        <p className="text-sm text-slate-300">All divisions are derived from your active natal chart. No second birth calculation.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select divisional chart">
        {DIVISIONS.map(division => <button type="button" key={division} aria-pressed={selected === division}
          className={`rounded-lg border px-3 py-2 text-sm ${selected === division ? "border-amber-400 bg-amber-400/20 text-amber-100" : "border-white/20 text-slate-300"}`}
          onClick={() => setSelected(division)}>{division}</button>)}
      </div>
      {isLoading && <p className="text-sm text-slate-300">Deriving divisional charts from your natal positions…</p>}
      {error && <p role="alert" className="text-sm text-rose-300">Unable to derive charts: {error.message}</p>}
      {active && <>
        <div className="space-y-1">
          <h3 className="font-semibold text-amber-100">{active.division} — {active.name}</h3>
          <p className="text-sm text-slate-300">{active.purpose}</p>
          <p className="text-xs text-slate-400">{active.formula}</p>
          <p className="text-sm">Divisional Ascendant: {active.ascendant.sign} ({active.ascendant.longitude.toFixed(3)}°)</p>
        </div>
        <VedicDiamond houses={active.houses} division={active.division} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Twelve divisional houses">
          {active.houses.map(house => <div key={house.house} className="rounded-lg border border-white/15 bg-slate-900/70 p-3">
            <p className="text-sm font-semibold text-amber-100">House {house.house} · {house.sign}</p>
            <p className="text-xs text-slate-300">{house.planets.join(", ") || "—"}</p>
          </div>)}
        </div>
        <div className="rounded-xl border border-amber-400/20 p-3 space-y-2" aria-label="Divisional chart interpretation">
          <h4 className="font-semibold text-amber-100">Chart-specific reading</h4>
          <p className="text-sm text-slate-300">{active.purpose}. The divisional Ascendant falls in {active.ascendant.sign}; the house positions below describe the projected areas of emphasis in this chart, not new astronomical observations.</p>
          {active.placements.map(planet => <p key={planet.body} className="text-sm text-slate-300">
            <strong>{planet.body}</strong> moves from natal {planet.sourceSign} to divisional {planet.sign} in House {planet.house}.
            {planet.sign === planet.sourceSign ? " The sign repeats from D1, reinforcing that natal sign emphasis in this division." : " The divisional sign differs from D1, so this technique describes a distinct context for the natal placement."}
          </p>)}
          <p className="text-xs text-slate-400">This is a deterministic placement interpretation, not a complete strength, dasha, or yoga judgment. Read alongside the unified Master Synthesizer.</p>
        </div>
        <details className="text-sm text-slate-300"><summary className="cursor-pointer">Show planetary calculations</summary>
          <div className="mt-2 space-y-2">{active.placements.map(planet => <p key={planet.body}>
            <strong>{planet.body}</strong>: {planet.sourceSign} → {planet.sign}, part {planet.divisionPart}, House {planet.house}, derived {planet.longitude.toFixed(3)}°
          </p>)}</div>
        </details>
        <p className="text-xs text-slate-400">The diamond and house ledger use the same divisional data. Long planet lists may be easier to read in the ledger.</p>
      </>}
    </section>
  );
}
