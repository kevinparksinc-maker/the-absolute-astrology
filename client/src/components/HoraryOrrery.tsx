import React, { useState } from "react";
import type { ChartResult, ChartRow, TransitRow } from "../../../server/astronomy";
import { formatLongitude, ZODIAC_SIGNS } from "@shared/hybrid";
import { threeChartLayers, type WheelLayerId } from "@shared/threeChartWheel";

type Props = {
  natal?: ChartResult;
  transit: ChartResult;
  god: ChartResult;
  questionHouses: Array<{ house: number; longitude: number }>;
};
const glyphs: Record<string, string> = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇", "North Node": "☊", "South Node": "☋" };
const point = (longitude: number, radius: number) => {
  const angle = (longitude - 90) * Math.PI / 180;
  return { x: 330 + Math.cos(angle) * radius, y: 330 + Math.sin(angle) * radius };
};
const distance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
const moment = (utc?: string) => utc ? new Date(utc).toLocaleString(undefined, { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC" : "Birth profile not included";

function Houses({ houses, inner, outer, color, prefix }: { houses: Array<{ house: number; longitude: number }>; inner: number; outer: number; color: string; prefix: string }) {
  return <g>{houses.map(house => {
    const a = point(house.longitude, inner), b = point(house.longitude, outer), label = point(house.longitude + 15, inner + 10);
    return <g key={house.house}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeOpacity=".3" /><text x={label.x} y={label.y} fill={color} fontSize="9" textAnchor="middle">{prefix}{house.house}</text></g>;
  })}</g>;
}

export function HoraryOrrery({ natal, transit, god, questionHouses }: Props) {
  const layers = threeChartLayers(natal, transit, god);
  const [visible, setVisible] = useState<Record<WheelLayerId, boolean>>({ god: true, transit: true, natal: true });
  const [selection, setSelection] = useState<{ layer: WheelLayerId; name: string }>({ layer: "transit", name: "Moon" });
  const [showHouses, setShowHouses] = useState(true);
  const [showStars, setShowStars] = useState(false);
  const [zoom, setZoom] = useState(false);
  const layer = layers.find(item => item.id === selection.layer)!;
  const selected = visible[layer.id] ? layer.rows.find(row => row.name === selection.name) : undefined;
  const contacts = selected && layer.id === "transit"
    ? [...(selected as TransitRow).natalContacts, ...(selected as TransitRow).minorNatalContacts]
    : [];
  const select = (id: WheelLayerId, row: ChartRow) => setSelection({ layer: id, name: row.name });

  return <section className="rounded-2xl border border-cyan-200/20 bg-[#0b1322] p-4 shadow-2xl shadow-black/20 sm:p-6" aria-label="God View, transit and natal chart wheel">
    <p className="text-[10px] uppercase tracking-[.24em] text-cyan-200">The Absolute · Three-chart wheel</p>
    <h2 className="mt-2 font-serif text-2xl text-white">God View · Transits · Natal</h2>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">One fixed coordinate frame, three distinct layers. Gold preserves the birth sky. Violet shows the question-time sky and its local houses. Cyan shows that same question-time sky against the fixed celestial sectors.</p>
    <div className="my-5 flex flex-wrap items-center gap-2" aria-label="Visible chart layers">
      {layers.map(item => <button key={item.id} type="button" aria-pressed={visible[item.id]} disabled={!item.rows.length} onClick={() => setVisible(current => ({ ...current, [item.id]: !current[item.id] }))} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40" style={{ color: item.color, borderColor: visible[item.id] ? item.color : "#334155", background: visible[item.id] ? `${item.color}14` : "transparent" }}>{visible[item.id] && item.rows.length ? "●" : "○"} {item.label}{!item.rows.length ? " · unavailable" : ""}</button>)}
      <button type="button" aria-pressed={zoom} onClick={() => setZoom(value => !value)} className="rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200">{zoom ? "Fit wheel" : "Enlarge wheel"}</button>
    </div>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-white/10 bg-[#070c16]">
        <svg viewBox="0 0 660 660" className={zoom ? "h-auto w-[900px] max-w-none" : "h-auto w-full"} role="group" aria-label="Interactive chart wheel. Select a planet here or in the placement list below.">
          <circle cx="330" cy="330" r="307" fill="#0b1424" stroke="#334155" />
          {Array.from({ length: 12 }, (_, index) => { const p = point(index * 30 + 15, 319); return <text key={index} x={p.x} y={p.y} fill="#a9b9cc" fontSize="10" textAnchor="middle" dominantBaseline="middle">{ZODIAC_SIGNS[index].slice(0, 3).toUpperCase()}</text>; })}
          {visible.god && <Houses houses={Array.from({ length: 12 }, (_, i) => ({ house: i + 1, longitude: i * 30 }))} inner={244} outer={301} color="#67e8f9" prefix="S" />}
          {showHouses && visible.transit && <Houses houses={questionHouses} inner={177} outer={236} color="#c4b5fd" prefix="H" />}
          {showHouses && visible.natal && natal && <Houses houses={natal.houses.map((longitude, i) => ({ house: i + 1, longitude }))} inner={111} outer={171} color="#f4c95d" prefix="H" />}
          {showHouses && [{ id: "natal" as const, longitude: natal?.ascendant?.longitude, radius: 173, color: "#f4c95d" }, { id: "transit" as const, longitude: questionHouses[0]?.longitude, radius: 238, color: "#c4b5fd" }].filter(angle => visible[angle.id] && angle.longitude != null).map(angle => <g key={angle.id}>{[[angle.longitude!, "ASC"], [angle.longitude! + 180, "DSC"]].map(([longitude, label]) => { const p = point(Number(longitude), angle.radius); return <text key={label} x={p.x} y={p.y} fontSize="9" textAnchor="middle" fill={angle.color}>{label}</text>; })}</g>)}
          {showStars && god.frozenStars.map(star => { const p = point(star.longitude, 298); return <g key={star.name}><text x={p.x} y={p.y} fill="#fef3c7" fontSize="12" textAnchor="middle">✦</text><title>{`${star.name} · ${star.display}`}</title></g>; })}
          {visible.natal && visible.transit && selected && contacts.map(contact => {
            const natalBody = natal?.movingBodies.find(row => row.name === contact.natalName);
            if (!natalBody) return null;
            const a = point(selected.longitude, 205), b = point(natalBody.longitude, 140);
            return <line key={`${contact.natalName}-${contact.aspect}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#f4c95d" strokeOpacity=".65" strokeDasharray="4 4"><title>{`${selected.name} ${contact.aspect} natal ${contact.natalName} · ${contact.orb}° orb`}</title></line>;
          })}
          {layers.filter(item => visible[item.id]).map(item => <g key={item.id}>
            <circle cx="330" cy="330" r={item.radius} fill="none" stroke={item.color} strokeOpacity=".5" />
            {item.rows.map((row, index) => {
              const neighbors = item.rows.slice(0, index).filter(other => distance(other.longitude, row.longitude) < 7).length;
              const radius = item.radius + (neighbors % 3 - 1) * 10;
              const p = point(row.longitude, radius), label = point(row.longitude, radius + 15);
              const active = selection.layer === item.id && selection.name === row.name;
              return <g key={row.name} role="button" tabIndex={0} aria-pressed={active} aria-label={`${item.label}: ${row.name}, ${row.display}`} onClick={() => select(item.id, row)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(item.id, row); } }} className="cursor-pointer outline-none focus:opacity-60">
                <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                <circle cx={p.x} cy={p.y} r={active ? 8 : 5} fill={item.color} stroke={active ? "white" : "#07111f"} strokeWidth="2" />
                <text x={label.x} y={label.y} fill={item.color} fontSize="13" textAnchor="middle" dominantBaseline="middle">{glyphs[row.name] ?? row.name.slice(0, 2)}</text>
                <title>{`${item.label} · ${row.name} · ${row.display}`}</title>
              </g>;
            })}
          </g>)}
          <circle cx="330" cy="330" r="90" fill="#101a2c" stroke="#67e8f9" strokeOpacity=".3" />
          <text x="330" y="321" textAnchor="middle" fill="#f8fafc" fontFamily="Georgia, serif" fontSize="17">POLARIS</text>
          <text x="330" y="345" textAnchor="middle" fill="#94a3b8" fontSize="10">Fixed firmament axis</text>
        </svg>
      </div>
      <aside className="space-y-4 rounded-xl border border-white/10 bg-white/[.03] p-4" aria-live="polite">
        <h3 className="text-sm font-semibold text-white">Selected placement</h3>
        {selected ? <><p className="text-xs uppercase tracking-wider" style={{ color: layer.color }}>{layer.label}</p><p className="text-xl text-white">{selected.name} {selected.retrograde ? "℞" : ""}</p><p className="font-mono text-sm text-slate-200">{formatLongitude(selected.longitude)}</p><p className="text-xs leading-5 text-slate-400">{moment(layer.utc)}<br />{layer.id === "god" ? `Fixed celestial sector ${selected.godHouse ?? selected.house}; no local Ascendant.` : `${layer.id === "natal" ? "Birth" : "Question-time"} local House ${selected.agentHouse ?? selected.house}.`}</p><p className="text-xs leading-5 text-slate-400">Source: {selected.coordinateSource === "external-xyz" ? "supplied Cartesian XYZ" : selected.coordinateSource === "swiss-ephemeris" ? "Swiss Ephemeris equatorial XYZ" : "calculated chart record"}.</p>
        {layer.id === "transit" && <div className="border-t border-white/10 pt-3"><p className="mb-2 text-xs text-amber-100">Contacts to natal placements</p>{contacts.length ? contacts.map(contact => <p key={`${contact.natalName}-${contact.aspect}`} className="text-xs leading-6 text-slate-300">{contact.aspect} natal {contact.natalName} · {contact.orb}° orb</p>) : <p className="text-xs leading-5 text-slate-400">{natal ? "No contact returned within the active orb." : "Include a complete natal profile to calculate personal contacts."}</p>}</div>}</> : <p className="text-sm leading-6 text-slate-400">Select a planet from a visible layer.</p>}
        <div className="space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300"><label className="flex items-center gap-2"><input type="checkbox" checked={showHouses} onChange={event => setShowHouses(event.target.checked)} />Local house divisions</label><label className="flex items-center gap-2"><input type="checkbox" checked={showStars} onChange={event => setShowStars(event.target.checked)} />Calculated fixed-star positions</label></div>
        {!natal && <p className="text-xs leading-5 text-amber-100">The natal ring is empty until you enable a complete birth profile and cast again.</p>}
      </aside>
    </div>
    <div className="mt-5 grid gap-4 md:grid-cols-3">{layers.filter(item => visible[item.id]).map(item => <div key={item.id} className="rounded-xl border border-white/10 p-3"><h3 className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</h3><p className="my-2 text-[11px] text-slate-400">{moment(item.utc)}</p><div className="flex flex-wrap gap-2">{item.rows.map(row => <button key={row.name} type="button" onClick={() => select(item.id, row)} aria-pressed={selection.layer === item.id && selection.name === row.name} className="rounded-lg border border-white/15 px-2 py-2 text-xs text-slate-200 aria-pressed:bg-white/15">{glyphs[row.name]} {row.name}</button>)}</div></div>)}</div>
    <p className="mt-4 text-xs leading-5 text-slate-400">God View and transit planets share the question moment and exact planetary angles. Their rings distinguish fixed celestial sectors from local houses. Gold dashed lines show the selected transit planet’s calculated contacts to natal placements. Polaris marks the model’s central axis.</p>
  </section>;
}
