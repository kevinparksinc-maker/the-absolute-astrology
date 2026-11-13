import type { VedicStrength } from "../../../server/astrologyKnowledge/vedic/strength";
const fmt = (n: number) => n.toFixed(2);
export function PlanetStrengthChart({
  rows,
}: {
  rows: VedicStrength["planets"];
}) {
  if (!rows.length) return null;
  return (
    <section
      aria-label="Shadbala planetary strength chart"
      className="space-y-4"
    >
      <h4 className="font-semibold text-amber-100">
        Seven planets · Six strength components
      </h4>
      <p className="text-sm text-slate-300">
        60 virupas = 1 rupa. Each planet has its own traditional minimum.
        Capacity describes how forcefully it can act; condition and rulership
        describe what it delivers.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(p => (
          <div key={p.body} className="rounded-xl border border-white/15 p-3">
            <div className="flex justify-between gap-3">
              <strong>{p.body}</strong>
              <span
                className={
                  p.adequacyRatio >= 1 ? "text-emerald-200" : "text-amber-200"
                }
              >
                {(p.adequacyRatio * 100).toFixed(1)}% of minimum
              </span>
            </div>
            <meter
              aria-label={`${p.body} Shadbala adequacy`}
              min={0}
              max={Math.max(2, p.adequacyRatio)}
              value={Math.max(0, p.adequacyRatio)}
              className="mt-2 h-3 w-full"
            />
            <p className="mt-1 text-xs text-slate-300">
              {fmt(p.totalVirupas)} / {p.requiredVirupas} virupas ·{" "}
              {fmt(p.rupas)} rupas · Rank {p.rank}/7
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Rules H{p.ownedHouses.join(", H")} · Delivers through H{p.house}
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-xs">
          <caption className="mb-2 text-left text-sm text-amber-100">
            Component arithmetic in virupas
          </caption>
          <thead>
            <tr>
              <th className="p-2">Planet</th>
              {[
                "Sthana",
                "Dig",
                "Kala",
                "Cheshta",
                "Naisargika",
                "Drik",
                "Total",
              ].map(s => (
                <th key={s} className="p-2">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.body} className="border-t border-white/15">
                <th className="p-2">{p.body}</th>
                {[
                  p.components.sthana,
                  p.components.dig,
                  p.components.kala,
                  p.components.cheshta,
                  p.components.naisargika,
                  p.components.drik,
                  p.totalVirupas,
                ].map((value, i) => (
                  <td key={i} className="p-2 tabular-nums">
                    {fmt(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
const DOMAINS = [
  "Self and vitality",
  "Money and resources",
  "Initiative and siblings",
  "Home and roots",
  "Creativity and your creations",
  "Service and obstacles",
  "Partnerships",
  "Shared resources and change",
  "Learning and direction",
  "Work and public contribution",
  "Friends, networks and shared gains",
  "Retreat and expenditure",
];
export function HouseStrengthChart({
  rows,
}: {
  rows: VedicStrength["houses"];
}) {
  if (!rows.length) return null;
  const maximum = Math.max(1, ...rows.map(h => h.totalVirupas));
  const fifth = rows.find(h => h.house === 5),
    eleventh = rows.find(h => h.house === 11);
  return (
    <section aria-label="Bhava Bala house strength chart" className="space-y-4">
      <h4 className="font-semibold text-amber-100">
        Twelve houses · Where capacity is concentrated
      </h4>
      <p className="text-sm text-slate-300">
        House totals combine the lord’s Shadbala with directional strength,
        incoming aspects, occupancy and rising-type timing. Ranks compare houses
        within this chart.
      </p>
      <div className="space-y-3">
        {rows.map(h => (
          <div key={h.house} className="rounded-xl border border-white/15 p-3">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <strong>
                H{h.house} · {DOMAINS[h.house - 1]}
              </strong>
              <span className="text-cyan-100">
                {fmt(h.totalVirupas)} virupas · Rank {h.rank}/12
              </span>
            </div>
            <div
              role="meter"
              aria-label={`House ${h.house} Bhava Bala`}
              aria-valuemin={0}
              aria-valuemax={maximum}
              aria-valuenow={Math.max(0, h.totalVirupas)}
              className="mt-2 h-2 overflow-hidden rounded bg-slate-700"
            >
              <div
                className="h-full bg-cyan-300"
                style={{
                  width: `${(Math.max(0, h.totalVirupas) / maximum) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-300">
              {h.sign} · Lord {h.lord} · Lord capacity{" "}
              {(h.lordAdequacy * 100).toFixed(1)}% · Delivers through H
              {h.lordDeliveryHouse}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Lord {fmt(h.components.lord)} + direction{" "}
              {fmt(h.components.direction)} + aspects {fmt(h.components.aspect)}{" "}
              + occupancy {fmt(h.components.occupancy)} + timing{" "}
              {fmt(h.components.risingType)}
            </p>
          </div>
        ))}
      </div>
      {fifth && eleventh && (
        <p className="rounded-xl border border-amber-300/25 p-4 text-sm text-amber-100">
          Creative expression (H5): {fmt(fifth.totalVirupas)} virupas · Friends
          and networks (H11): {fmt(eleventh.totalVirupas)} virupas. The
          individual outcome below explains this comparison from the calculated
          scores.
        </p>
      )}
    </section>
  );
}
