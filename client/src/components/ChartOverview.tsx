import { Compass, Eye, Gauge, Sparkles, Zap } from "lucide-react";
import type { ChartResult, ChartRow, TransitRow } from "../../../server/astronomy";

type ReadingView = "guided" | "evidence";

type ChartOverviewProps = {
  chart: ChartResult;
  view: ReadingView;
  onViewChange: (view: ReadingView) => void;
};

function houseLabel(chart: ChartResult, row: ChartRow) {
  if (chart.worldview === "god") return `God House ${row.godHouse ?? row.house}`;
  return `Agent House ${row.agentHouse ?? row.house}`;
}

function placementCopy(chart: ChartResult, row: ChartRow) {
  return `${row.name} is at ${row.display} in ${houseLabel(chart, row)}.`;
}

function contactCopy(contact: TransitRow["natalContacts"][number]) {
  return `${contact.aspect} ${contact.natalName} · ${contact.orb.toFixed(1)}° orb`;
}

export function ChartOverview({ chart, view, onViewChange }: ChartOverviewProps) {
  const sun = chart.movingBodies.find(row => row.name === "Sun");
  const moon = chart.movingBodies.find(row => row.name === "Moon");
  const strongestContacts = chart.transits
    .flatMap(transit =>
      transit.natalContacts.map(contact => ({ transit, contact }))
    )
    .sort((a, b) => a.contact.orb - b.contact.orb)
    .slice(0, 2);
  const frameRow = [...chart.movingBodies, ...chart.godPlacements].find(
    row => row.frameRelationship
  );

  const findings = [
    {
      icon: Compass,
      eyebrow: "Your foundation",
      title: sun ? `${sun.name} · ${houseLabel(chart, sun)}` : "Natal foundation",
      body: sun
        ? placementCopy(chart, sun)
        : "Your natal placements establish the enduring layer of this reading.",
      accent: "text-amber-200",
      border: "border-amber-200/20",
    },
    {
      icon: Sparkles,
      eyebrow: "Emotional signal",
      title: moon ? `${moon.name} · ${houseLabel(chart, moon)}` : "Lunar context",
      body: moon
        ? placementCopy(chart, moon) +
          (moon.uncertainty ? ` ${moon.uncertainty.label}.` : "")
        : "The Moon provides the immediate emotional and timing context.",
      accent: "text-cyan-200",
      border: "border-cyan-200/20",
    },
    {
      icon: Zap,
      eyebrow: strongestContacts.length ? "Closest current activation" : "Current sky",
      title: strongestContacts.length
        ? strongestContacts[0].transit.name
        : chart.transits[0]?.name ?? "Transit layer",
      body: strongestContacts.length
        ? contactCopy(strongestContacts[0].contact)
        : chart.transits[0]
          ? placementCopy(chart, chart.transits[0])
          : "The transit layer shows the selected moment against the natal foundation.",
      accent: "text-violet-200",
      border: "border-violet-200/20",
    },
  ];

  return (
    <section
      aria-labelledby="chart-overview-title"
      className="mb-8 overflow-hidden rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-cyan-100/[0.09] via-white/[0.035] to-violet-200/[0.08] shadow-2xl shadow-cyan-950/20"
    >
      <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <Gauge className="h-4 w-4" /> Start here
          </div>
          <h2 id="chart-overview-title" className="font-serif text-3xl text-white sm:text-4xl">
            Your chart, in three signals
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Begin with the clearest anchors, then open the technical evidence when you want to inspect every degree, house, overlay, and contact.
          </p>
        </div>
        <div className="flex shrink-0 rounded-xl border border-white/10 bg-black/20 p-1" aria-label="Chart presentation mode">
          <button
            type="button"
            aria-pressed={view === "guided"}
            onClick={() => onViewChange("guided")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${view === "guided" ? "bg-cyan-300 text-slate-950" : "text-slate-400 hover:text-white"}`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Guided
          </button>
          <button
            type="button"
            aria-pressed={view === "evidence"}
            onClick={() => onViewChange("evidence")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${view === "evidence" ? "bg-violet-300 text-slate-950" : "text-slate-400 hover:text-white"}`}
          >
            <Eye className="h-3.5 w-3.5" /> Evidence
          </button>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-7">
        {findings.map(finding => {
          const Icon = finding.icon;
          return (
            <article key={finding.eyebrow} className={`rounded-2xl border ${finding.border} bg-black/15 p-4`}>
              <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${finding.accent}`}>
                <Icon className="h-3.5 w-3.5" /> {finding.eyebrow}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{finding.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{finding.body}</p>
            </article>
          );
        })}
      </div>

      {strongestContacts.length > 1 && (
        <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-400 sm:px-7">
          <span className="font-semibold text-slate-200">Also active:</span>{" "}
          {strongestContacts.slice(1).map(({ transit, contact }) => `${transit.name} ${contactCopy(contact)}`).join(" · ")}
        </div>
      )}

      {frameRow?.frameRelationship && (
        <div className="border-t border-white/10 bg-violet-950/15 px-5 py-4 text-xs leading-5 text-slate-400 sm:px-7">
          <span className="font-semibold text-violet-200">Frame relationship:</span>{" "}
          {frameRow.frameRelationship.synthesis}
        </div>
      )}
    </section>
  );
}
