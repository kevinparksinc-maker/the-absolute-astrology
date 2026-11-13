import type { HoraryChart } from "../../../server/horary";

type Props = { chart: HoraryChart };

export function TraditionalHoraryEvidence({ chart }: Props) {
  const traditional = chart.traditional;
  return (
    <details className="group rounded-xl border border-amber-200/15 bg-amber-100/[0.035] p-4">
      <summary className="cursor-pointer text-sm font-medium text-amber-100">Traditional judgment layers: Lots, dignity, reception, stars, timing, and lunar divisions</summary>
      <div className="mt-4 grid gap-5 xl:grid-cols-2">
        <section>
          <p className="mb-2 text-xs uppercase tracking-[.16em] text-amber-200">Arabic Parts / Lots</p>
          <div className="grid gap-2 sm:grid-cols-2">{traditional.lots.map(lot => <div key={lot.name} className="rounded-lg border border-white/[0.06] bg-black/15 p-3"><p className="font-medium text-white">{lot.name} · {lot.display}</p><p className="mt-1 text-[11px] text-slate-500">House {lot.house} · {lot.formula}</p><p className="mt-2 text-xs leading-5 text-slate-300">{lot.meaning}</p></div>)}</div>
        </section>
        <section>
          <p className="mb-2 text-xs uppercase tracking-[.16em] text-amber-200">Radicality / considerations before judgment</p>
          <div className="rounded-lg border border-white/[0.06] bg-black/15 p-3"><p className={traditional.radicality.status === "radical" ? "text-emerald-200" : "text-amber-200"}>{traditional.radicality.status === "radical" ? "No configured caution triggered" : "Caution before judgment"}</p><p className="mt-2 text-xs leading-5 text-slate-400">{traditional.radicality.explanation}</p>{traditional.radicality.considerations.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">{traditional.radicality.considerations.map(item => <li key={item}>{item}</li>)}</ul>}</div>
        </section>
        <section>
          <p className="mb-2 text-xs uppercase tracking-[.16em] text-amber-200">Essential / accidental dignity and debility</p>
          <div className="max-h-72 space-y-2 overflow-y-auto">{traditional.dignities.map(row => <div key={row.planet} className="rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2 text-xs"><div className="flex justify-between gap-3"><span className="font-medium text-white">{row.planet} · {row.sign}</span><span className="text-slate-500">House {row.house}</span></div><p className="mt-1 text-slate-300">Essential: {row.essential.length ? row.essential.join(", ") : "none"} · Accidental: {row.accidental.join(", ")}</p><p className="mt-1 text-rose-200/80">Debility: {row.debilities.length ? row.debilities.join(", ") : "none detected"}</p></div>)}</div>
        </section>
        <section>
          <p className="mb-2 text-xs uppercase tracking-[.16em] text-amber-200">Reception / mutual reception</p>
          {traditional.receptions.length ? <ul className="space-y-2 text-xs">{traditional.receptions.map((row, index) => <li key={`${row.from}-${row.to}-${index}`} className="rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2 text-slate-300">{row.description}</li>)}</ul> : <p className="text-xs text-slate-500">No configured reception was found among the classical planets.</p>}
        </section>
        <section>
          <p className="mb-2 text-xs uppercase tracking-[.16em] text-amber-200">Fixed-star testimony</p>
          {traditional.fixedStars.length ? <ul className="space-y-2 text-xs">{traditional.fixedStars.map((row, index) => <li key={`${row.star}-${row.planet}-${index}`} className="rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2 text-slate-300"><strong className="text-white">{row.planet} conjunct {row.star}</strong> · {row.orb}° · {row.nature}<br/><span className="text-slate-400">{row.meaning}</span></li>)}</ul> : <p className="text-xs text-slate-500">No planet or Ascendant is within the configured 1° fixed-star orb.</p>}
        </section>
        <section>
          <p className="mb-2 text-xs uppercase tracking-[.16em] text-amber-200">Traditional timing aid</p>
          {traditional.timing.length ? <ul className="space-y-2 text-xs">{traditional.timing.map((row, index) => <li key={`${row.from}-${row.to}-${index}`} className="rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2 text-slate-300"><strong className="text-white">{row.from} {row.aspect} {row.to}</strong> · {row.degreesToPerfection}° to perfection<br/><span className="text-slate-400">{row.estimatedUnits}</span></li>)}</ul> : <p className="text-xs text-slate-500">No configured key-significator perfection estimate was available.</p>}
        </section>
        <section className="xl:col-span-2">
          <p className="mb-2 text-xs uppercase tracking-[.16em] text-amber-200">Lunar mansions, Manzils, and Decans</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{traditional.overlays.map(row => <div key={row.body} className="rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2 text-xs"><p className="font-medium text-white">{row.body} · {row.display}</p><p className="mt-1 text-amber-100">{row.nakshatra} · Pada {row.pada}</p><p className="text-violet-200">{row.manzil}</p><p className="text-cyan-200">{row.decan}</p></div>)}</div>
        </section>
      </div>
      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-slate-500">These are traditional symbolic judgment aids. They qualify interpretation; they do not guarantee an event, replace professional advice, or constitute scientific prediction.</p>
    </details>
  );
}
