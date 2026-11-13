import type { HoraryChart } from "../../../server/horary";

type Props = { chart: HoraryChart };

export function HoraryLookaheadEvidence({ chart }: Props) {
  const primaryNames = new Set([chart.querentRuler, chart.subjectRuler, chart.topicRuler, "Moon"]);
  const isPrimaryContact = (first: string, second: string) => primaryNames.has(first) || primaryNames.has(second);

  return (
    <div className="mt-5 grid gap-6 border-t border-white/10 pt-5 xl:grid-cols-2">
      <section className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[.16em] text-slate-500">Additional close contacts · 5° orb</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">These are supplementary planetary contacts, not new significators.</p>
        </div>
        {chart.otherCloseAspects.length ? (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 text-xs">
            {chart.otherCloseAspects.map((aspect, index) => {
              const primary = isPrimaryContact(aspect.first, aspect.second);
              return (
                <li key={`${aspect.first}-${aspect.second}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                  <span className="text-slate-200">{aspect.first} {aspect.aspect} {aspect.second} · {aspect.orb}° · {aspect.phase}</span>
                  <span className={primary ? "text-cyan-200" : "text-slate-500"}>{primary ? "Touches a significator / Moon" : "Background only"}</span>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-xs text-slate-500">No additional close major contacts were calculated.</p>}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[.16em] text-slate-500">Upcoming exact planetary contacts</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">Moon contacts are checked for {chart.lookahead.moonWindowDays} days; other contacts for {chart.lookahead.windowDays} days. A listed local date or time marks an exact sky contact, not a prediction of an event.</p>
        </div>
        {chart.lookahead.upcomingAspects.length ? (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 text-xs">
            {chart.lookahead.upcomingAspects.map((aspect, index) => {
              const primary = isPrimaryContact(aspect.first, aspect.second);
              return (
                <li key={`${aspect.first}-${aspect.second}-${aspect.aspect}-${aspect.exactAtUtc}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                  <span className="text-slate-200">{aspect.first} {aspect.aspect} {aspect.second}</span>
                  <span className="font-mono text-cyan-100">{aspect.exactAtLocal}</span>
                  <span className={primary ? "text-cyan-200" : "text-slate-500"}>{primary ? "Touches a significator / Moon" : "Background only"}</span>
                </li>
              );
            })}
          </ul>
        ) : <p className="text-xs text-slate-500">No upcoming exact contacts were found in the configured windows.</p>}

        <div>
          <p className="text-xs uppercase tracking-[.16em] text-slate-500">Planetary stations · {chart.lookahead.windowDays}-day window</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">These dates mark a change in apparent planetary direction; they do not date a real-world event.</p>
          {chart.lookahead.stations.length ? (
            <ul className="mt-2 space-y-2 text-xs">
              {chart.lookahead.stations.map((station, index) => (
                <li key={`${station.planet}-${station.atUtc}-${index}`} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-slate-200">{station.planet} turns {station.turns} · {station.atLocal} local date</li>
              ))}
            </ul>
          ) : <p className="mt-2 text-xs text-slate-500">No planetary stations were found in this window.</p>}
        </div>
      </section>
    </div>
  );
}
