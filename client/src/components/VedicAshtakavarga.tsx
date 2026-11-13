import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";

export function VedicAshtakavarga({ chart }: { chart: ChartResult }) {
  const { data, isLoading, error } = trpc.vedic.ashtakavargaVisual.useQuery({ chart }, { retry: false });
  return <section className="space-y-4 rounded-2xl border border-amber-400/30 bg-slate-950/70 p-4" aria-label="Ashtakavarga strength chart">
    <div><h2 className="font-serif text-xl font-bold text-amber-100">Ashtakavarga · Planetary and Sign Strength</h2>
      <p className="text-sm text-slate-300">Classical Bhinnashtakavarga (BAV) and Sarvashtakavarga (SAV) from the same verified evidence used by the reading engine.</p></div>
    {isLoading && <p role="status">Calculating bindu strengths…</p>}
    {error && <p role="alert" className="text-rose-300">Ashtakavarga error: {error.message}</p>}
    {data && !data.available && <p className="text-sm text-amber-100">Unavailable: {data.reason}</p>}
    {data?.available && <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {data.sav.map(({ sign, score }) => <div key={sign} className="rounded-lg border border-white/20 p-3">
          <div className="flex items-center justify-between text-sm"><strong>{sign}</strong><span>{score} bindus</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full bg-amber-400" style={{ width: `${Math.min(100, score / 56 * 100)}%` }} /></div>
        </div>)}
      </div>
      <p className="text-sm font-semibold text-amber-100">SAV checksum: {data.total} / 337 bindus</p>
      <div className="overflow-x-auto"><table className="min-w-full text-xs">
        <caption className="mb-2 text-left text-sm font-semibold">BAV · Seven planetary contributions across twelve signs</caption>
        <thead><tr><th className="p-2 text-left">Planet</th>{data.sav.map(x => <th key={x.sign} className="p-2" title={x.sign}>{x.sign.slice(0, 3)}</th>)}<th className="p-2">Total</th></tr></thead>
        <tbody>{data.bav.map(row => <tr key={row.planet} className="border-t border-white/15"><th className="p-2 text-left">{row.planet}</th>{row.scores.map((score, i) => <td key={i} className="p-2 text-center">{score}</td>)}<td className="p-2 text-center font-semibold">{row.total}</td></tr>)}</tbody>
      </table></div>
      <p className="text-xs text-slate-400">Evidence: {data.evidenceId}. Higher bindu totals indicate comparatively greater support within this traditional scoring system, not a guaranteed outcome.</p>
    </>}
  </section>;
}
