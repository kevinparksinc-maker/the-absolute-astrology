import { useState } from "react";
import type { ChartResult } from "../../../server/astronomy";
import { trpc } from "@/lib/trpc";

const STATUS_LABELS: Record<string, string> = {
  "computed-with-result": "Working · result",
  "computed-no-result": "Working · no finding",
  "not-applicable": "Not applicable",
  "not-implemented": "Not implemented",
  "reference-only": "Reference only",
  "failed": "Calculation failed",
};
const formatResult = (value: unknown) => {
  if (value === null || value === undefined) return "No result payload";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
};
export function TechniqueAuditDashboard({ chart }: { chart: ChartResult }) {
  const [tradition, setTradition] = useState("all");
  const { data, error, isLoading } = trpc.techniqueAudit.natal.useQuery({
    location: chart.input.location,
    latitude: chart.input.latitude,
    longitude: chart.input.longitude,
    timezone: chart.input.timezone,
    date: chart.input.date,
    time: chart.input.time,
    worldview: "agent-vs-god",
    readingScope: "natal",
    birthTimeKnown: chart.input.birthTimeKnown,
    sunriseAnchor: chart.input.sunriseAnchor,
    xyzPositions: chart.input.xyzPositions,
  }, { retry: false });
  const layers = data?.layers ?? [];
  const traditions = ["all", ...Array.from(new Set(layers.map(layer => layer.tradition)))];
  const filtered = layers.filter(layer => tradition === "all" || layer.tradition === tradition);
  const working = layers.filter(layer => layer.status === "computed-with-result" || layer.status === "computed-no-result").length;
  const incomplete = layers.filter(layer => layer.status === "reference-only" || layer.status === "not-implemented").length;
  const failed = layers.filter(layer => layer.status === "failed").length;
  return <section className="space-y-4 rounded-2xl border border-amber-400/30 bg-slate-950/70 p-4" aria-label="Master Chart technique evidence dashboard">
    <header><h2 className="font-serif text-xl font-bold text-amber-100">Knowledge Observatory · Technique Verification</h2>
      <p className="text-sm text-slate-300">Every method from the Master Chart execution ledger. Open a technique to inspect its real calculation output and evidence IDs.</p>
      {data && <p className="break-all text-xs text-slate-400">Master snapshot: {data.snapshotId}</p>}
    </header>
    {isLoading && <p role="status">Loading Master Chart calculation evidence…</p>}
    {error && <p role="alert" className="text-rose-300">Master Chart evidence unavailable: {error.message}. No results are being fabricated.</p>}
    {data && <>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-white/20 p-3"><strong className="block text-xl">{working}</strong><span className="text-xs">Calculated</span></div>
        <div className="rounded-lg border border-white/20 p-3"><strong className="block text-xl">{incomplete}</strong><span className="text-xs">Incomplete</span></div>
        <div className="rounded-lg border border-white/20 p-3"><strong className="block text-xl">{failed}</strong><span className="text-xs">Failed</span></div>
      </div>
      {!data.validation.complete && <p role="alert" className="text-rose-300">Master validation incomplete: {data.validation.errors.join("; ")}</p>}
      <label className="block text-sm">Filter by tradition
        <select value={tradition} onChange={e => setTradition(e.target.value)} className="mt-1 block w-full rounded-lg border border-white/30 bg-slate-900 p-2">
          {traditions.map(t => <option key={t} value={t}>{t === "all" ? "All traditions" : t}</option>)}
        </select>
      </label>
      <div className="space-y-2">{filtered.map(layer => <details key={layer.id} className="rounded-xl border border-white/20 bg-slate-900/70 p-3">
        <summary className="cursor-pointer text-sm"><strong className="text-amber-100">{layer.name}</strong>
          <span className="block text-xs text-slate-300">{layer.tradition} · {STATUS_LABELS[layer.status] ?? layer.status} · {layer.frame}</span>
        </summary>
        <div className="mt-3 space-y-2 text-xs text-slate-300">
          <p>Technique: {layer.technique}</p>
          <p>Evidence: {layer.evidenceIds.length ? layer.evidenceIds.join(", ") : "None"}</p>
          {layer.errorCode && <p className="text-rose-300">Error: {layer.errorCode}</p>}
          {layer.notes && <p>{layer.notes}</p>}
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3">{formatResult(layer.results)}</pre>
        </div>
      </details>)}</div>
    </>}
  </section>;
}
