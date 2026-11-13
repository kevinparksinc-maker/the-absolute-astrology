import { useState } from "react";
import type { ChartResult } from "../../../server/astronomy";
import { trpc } from "@/lib/trpc";

export function VedicDashaTimeline({ chart }: { chart: ChartResult }) {
  const { data, isLoading, error } = trpc.vedic.dashaTimeline.useQuery({ chart }, { retry: false });
  const [selected, setSelected] = useState<number | null>(null);
  const [antar, setAntar] = useState<number | null>(null);
  if (isLoading) return <section className="rounded-xl border border-amber-400/20 p-4">Calculating Dasha timeline…</section>;
  if (error) return <p role="alert">Dasha timeline unavailable: {error.message}</p>;
  if (!data) return null;
  if (!data.available) return <section className="rounded-xl border border-amber-400/20 p-4"><h2 className="font-semibold">Vimshottari Dasha</h2><p>{data.reason}</p></section>;
  const index = selected ?? Math.max(0, data.periods.findIndex(period => period.active));
  const period = data.periods[index];
  const antarIndex = antar ?? Math.max(0, period.antardashas.findIndex(item => item.active));
  const sub = period.antardashas[antarIndex];
  return <section className="space-y-4 rounded-2xl border border-amber-400/30 bg-slate-950/70 p-4" aria-label="Vimshottari Dasha timeline">
    <div><h2 className="font-serif text-xl font-bold text-amber-100">Vimshottari Dasha · Life Timeline</h2>
      <p className="text-sm text-slate-300">Natal Moon {data.moonLongitude.toFixed(3)}° · Nakshatra {data.birthNakshatra} · Starting lord {data.startingLord} · Birth balance {data.balanceYears.toFixed(2)} years</p>
      <p className="text-xs text-slate-400">Guardian fixed-frame Moon; 365.25-day years. These are symbolic timing periods, not verified predictions.</p></div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Select Mahadasha">
      {data.periods.map((p, i) => <button type="button" key={i} onClick={() => {setSelected(i);setAntar(null);}} aria-pressed={index === i}
        className={`rounded-lg border p-2 text-left text-sm ${index === i ? "border-amber-400 bg-amber-400/20" : "border-white/20"}`}>
        <strong>{p.lord}</strong>{p.active ? " · Current" : ""}<span className="block text-xs">{p.start} – {p.end}</span>
      </button>)}
    </div>
    <div className="space-y-2"><h3 className="font-semibold text-amber-100">{period.lord} Mahadasha · {period.start} to {period.end}</h3>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select Antardasha">
        {period.antardashas.map((p, i) => <button type="button" key={i} onClick={() => setAntar(i)} aria-pressed={antarIndex === i}
          className={`rounded-md border px-3 py-2 text-sm ${antarIndex === i ? "border-amber-400 bg-amber-400/20" : "border-white/20"}`}>{p.lord}{p.active ? " · Now" : ""}</button>)}
      </div>
      <h4 className="text-sm font-semibold">{period.lord} / {sub.lord} Antardasha · {sub.start} to {sub.end}</h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Pratyantardasha periods">
        {sub.pratyantardashas.map((p, i) => <div key={i} className={`rounded-md border p-2 text-xs ${p.active ? "border-amber-400 bg-amber-400/20" : "border-white/15"}`}>
          <strong>{p.lord}{p.active ? " · Current" : ""}</strong><span className="block">{p.start} – {p.end}</span>
        </div>)}
      </div>
    </div>
  </section>;
}
