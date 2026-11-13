import type { ChartRow } from "../../../server/astronomy";
import type { FrameRelationshipType } from "../../../server/astrologyCore";

type Props = {
  rows: ChartRow[];
  title?: string;
  intro?: string;
};

const labels: Record<FrameRelationshipType, string> = {
  convergence: "Convergence",
  translation: "Translation",
  tension: "Tension",
  concealment: "Behind the scenes",
};

const tone: Record<FrameRelationshipType, string> = {
  convergence: "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-100",
  translation: "border-cyan-200/20 bg-cyan-200/[0.06] text-cyan-100",
  tension: "border-rose-200/20 bg-rose-200/[0.06] text-rose-100",
  concealment: "border-violet-200/20 bg-violet-200/[0.06] text-violet-100",
};

export function FrameRelationshipPanel({ rows, title = "God's View of the Agent", intro = "One astronomical position, read through two reference frames. The translation is interpretive context; it does not replace the primary chart testimony." }: Props) {
  const paired = rows.filter(row => row.frameRelationship && row.godHouse != null && row.agentHouse != null).slice(0, 10);
  if (!paired.length) return null;

  return <section aria-labelledby="frame-relationship-title" className="overflow-hidden rounded-2xl border border-violet-200/20 bg-gradient-to-br from-violet-200/[0.09] via-cyan-200/[0.04] to-transparent text-slate-100 shadow-lg shadow-violet-950/15">
    <div className="border-b border-white/10 px-5 py-5 sm:px-7">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200">Three-layer interpretation</div>
      <h2 id="frame-relationship-title" className="mt-2 font-serif text-2xl text-white">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{intro}</p>
      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/15 p-3"><strong className="block text-violet-100">God View</strong><span className="text-slate-500">The broader shared field</span></div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3"><strong className="block text-cyan-100">Agent View</strong><span className="text-slate-500">The local lived channel</span></div>
        <div className="rounded-xl border border-white/10 bg-black/15 p-3"><strong className="block text-amber-100">Relationship</strong><span className="text-slate-500">How the field is translated</span></div>
      </div>
    </div>
    <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
      {paired.map(row => {
        const relationship = row.frameRelationship!;
        return <article key={row.name} className="rounded-xl border border-white/10 bg-black/15 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h3 className="font-serif text-xl text-white">{row.name}</h3><p className="font-mono text-xs text-slate-400">{row.display} · one calculated longitude</p></div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${tone[relationship.type]}`}>{labels[relationship.type]}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-violet-200/10 bg-violet-200/[0.05] p-3"><div className="uppercase tracking-[0.14em] text-violet-200/70">God View</div><div className="mt-1 text-white">House {row.godHouse}</div><div className="mt-1 leading-5 text-slate-400">{relationship.godThemes.join(" · ")}</div></div>
            <div className="rounded-lg border border-cyan-200/10 bg-cyan-200/[0.05] p-3"><div className="uppercase tracking-[0.14em] text-cyan-200/70">Agent View</div><div className="mt-1 text-white">House {row.agentHouse}</div><div className="mt-1 leading-5 text-slate-400">{relationship.agentThemes.join(" · ")}</div></div>
          </div>
          <div className="mt-3 rounded-lg border border-amber-200/10 bg-amber-100/[0.04] p-3 text-xs leading-5 text-amber-50"><div className="mb-1 uppercase tracking-[0.14em] text-amber-200/70">Translation</div>{relationship.translation}</div>
          {relationship.tension && <p className="mt-3 rounded-lg border border-rose-200/10 bg-rose-200/[0.04] p-3 text-xs leading-5 text-rose-100">{relationship.tension}</p>}
          <p className="mt-3 text-xs leading-5 text-slate-400"><span className="font-semibold text-slate-200">Synthesis:</span> {relationship.synthesis}</p>
        </article>;
      })}
    </div>
    {rows.filter(row => row.frameRelationship).length > 10 && <p className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">Showing the first 10 placements. Open detailed placements for the complete evidence set.</p>}
  </section>;
}
