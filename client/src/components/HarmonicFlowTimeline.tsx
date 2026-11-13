import { useEffect, useRef, useState } from "react";
import type { ChartResult } from "../../../server/astronomy";
import { trpc } from "@/lib/trpc";

export function HarmonicFlowTimeline({ chart }: { chart: ChartResult }) {
  const forecast = trpc.hybrid.harmonicForecast.useMutation();
  const [selected, setSelected] = useState(0);
  const version = useRef(0);
  const [result, setResult] = useState<typeof forecast.data>();
  useEffect(() => {
    version.current++;
    setResult(undefined);
    return () => { version.current++; };
  }, [chart]);
  const run = () => {
    const request = ++version.current;
    forecast.mutate({ chart: chart.input, start: chart.transitDate, steps: 48 }, {
      onSuccess: data => { if (request === version.current) { setResult(data); setSelected(0); } },
    });
  };
  const format = (moment: string) => new Date(moment).toLocaleString([], {
    timeZone: result?.timezone || chart.input.transitTimezone || chart.input.timezone,
    hour: "numeric", minute: "2-digit", month: "short", day: "numeric",
  });
  const point = result?.points[selected];
  return <section aria-label="30-minute harmonic forecast" className="space-y-3 rounded-2xl border border-cyan-300/25 bg-slate-950/70 p-4">
    <h3 className="font-serif text-xl text-white">Personal Harmonic Flow Clock · Next 24 hours</h3>
    <p className="text-xs text-slate-300">49 calculated snapshots, every 30 minutes. Select or hover over a time for its score and contact evidence.</p>
    <button type="button" onClick={run} disabled={forecast.isPending} className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm text-cyan-100 disabled:opacity-50">{forecast.isPending ? "Calculating 30-minute snapshots…" : "Calculate 24-hour energy"}</button>
    {forecast.error && <p role="alert" className="text-sm text-rose-300">{forecast.error.message}</p>}
    {result && <>
      <div className="flex h-28 items-end gap-1 overflow-x-auto" role="group" aria-label="Half-hour harmony scores">
        {result.points.map((p, i) => <button key={i} type="button" onClick={() => setSelected(i)} onMouseEnter={() => setSelected(i)} onFocus={() => setSelected(i)}
          aria-pressed={i === selected} aria-label={`${format(p.moment)}: ${p.score ? `${p.score.flowPct}% harmony, ${p.score.frictionPct}% friction` : p.error}`}
          title={`${format(p.moment)} · ${p.score ? `${p.score.flowPct}% harmony` : p.error}`}
          className={`min-w-3 flex-1 rounded-t border ${i === selected ? "border-amber-200" : "border-transparent"} ${p.score ? "bg-teal-400/80" : "bg-rose-400/40"}`}
          style={{ height: `${p.score ? Math.max(5, p.score.flowPct) : 5}%` }} />)}
      </div>
      <div className="flex justify-between text-xs text-slate-400"><span>{format(result.points[0].moment)}</span><span>{format(result.points[result.points.length - 1].moment)}</span></div>
      {point && <div aria-live="polite" className="space-y-2 text-sm text-slate-200">
        <p className="font-semibold text-cyan-200">{format(point.moment)} · {result.timezone}</p>
        {point.score ? <>
          <p>{point.score.signal} · Harmony {point.score.flowPct}% ({point.score.flowWeight} points) · Friction {point.score.frictionPct}% ({point.score.frictionWeight} points)</p>
          {point.score.tightest && <p>Closest contact: {point.score.tightest.transit} {point.score.tightest.aspect} natal {point.score.tightest.natal} · {point.score.tightest.orb.toFixed(2)}° orb · {point.score.tightest.strength} weighted points. Open the evidence below to compare the other contacts at this moment.</p>}
          <details><summary className="cursor-pointer text-cyan-200">Contact evidence ({point.score.contactsCount})</summary>
            <ul className="mt-2 space-y-1 text-xs">{[...point.score.contacts].sort((a,b) => a.orb - b.orb).map(c => <li key={c.id}>{c.transit} {c.aspect} natal {c.natal} · {c.orb.toFixed(2)}° · {c.intensity}/5 · {c.stars} × {c.natalStars} × {c.majorFactor} · {c.strength} points</li>)}</ul>
          </details>
        </> : <p role="alert">{point.error}</p>}
      </div>}
    </>}
  </section>;
}
