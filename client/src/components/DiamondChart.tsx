import { PlacementMiniReading } from "./PlacementMiniReading";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Compass, Orbit, ShieldCheck } from "lucide-react";
import type { ChartResult, ChartRow } from "../../../server/astronomy";

/**
 * A house-first diamond projection of the canonical 360-degree chart.
 * Geometry is presentation only; no longitude, house or aspect is recalculated.
 * House numbering runs counterclockwise. Transit degrees are never reversed.
 */
const normalize = (v: number) => ((v % 360) + 360) % 360;
const center = 360;
const edge = (degrees: number, radius = 305) => {
  const angle = (degrees * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const scale = radius / (Math.abs(cos) + Math.abs(sin));
  return { x: center + cos * scale, y: center + sin * scale };
};
const angleFor = (house: number, fraction = 0.5) => -90 - (house - 1 + fraction) * 30;
const fmt = (n: number) => Number(n.toFixed(1));

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  "North Node": "☊", "South Node": "☋", Ascendant: "AC", Descendant: "DC",
};

const DEGREE = (longitude: number) => {
  const normalized = normalize(longitude);
  const within = normalized % 30;
  const degrees = Math.floor(within);
  const minutes = Math.floor((within - degrees) * 60 + 0.00001);
  const signIndex = Math.floor(normalized / 30);
  return `${degrees}°${String(minutes).padStart(2, "0")}′ ${SIGN_GLYPHS[signIndex]}`;
};

export function DiamondChart({
  chart,
  compact = false,
}: {
  chart: ChartResult;
  compact?: boolean;
}) {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{ kind: "natal" | "transit"; row: ChartRow } | null>(null);
  const [showTransits, setShowTransits] = useState(true);

  const houses = chart?.houses?.slice(0, 12) ?? [];
  const natalRows = useMemo(
    () =>
      [...(chart?.movingBodies || []), chart?.ascendant, chart?.descendant, chart?.northNode, chart?.southNode].filter(
        (row): row is ChartRow => Boolean(row)
      ),
    [chart]
  );

  const transitRows = useMemo(
    () =>
      (chart?.transits || []).filter(row =>
        [
          "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter",
          "Saturn", "Uranus", "Neptune", "Pluto", "North Node", "South Node",
        ].includes(row.name)
      ),
    [chart]
  );

  const angleOf = (row: ChartRow) => {
    const house = Math.max(1, Math.min(12, row.house));
    const start = houses[house - 1] ?? 0;
    const span = normalize((houses[house % 12] ?? start + 30) - start) || 30;
    const fraction = Math.min(0.999, Math.max(0, normalize(row.longitude - start) / span));
    return angleFor(house, fraction);
  };

  const plotted = [
    ...natalRows.map((row, i) => ({ row, kind: "natal" as const, i })),
    ...(showTransits ? transitRows.map((row, i) => ({ row, kind: "transit" as const, i })) : []),
  ];

  useEffect(() => { setSelectedPoint(null); setSelectedHouse(null); }, [chart]);
  const currentHouse = selectedHouse == null ? null : houses[selectedHouse - 1];

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-[#D9B66F]/30 bg-[linear-gradient(145deg,rgba(8,11,20,0.96),rgba(16,22,40,0.92))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-6"
      aria-label="Primary Diamond Astrology Chart"
    >
      {/* Chart Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D9B66F]">
              Vedic & Equal House Geometry
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
            North Indian Diamond Observatory
          </h3>
          <p className="text-xs text-slate-400">
            Houses 1–12 counterclockwise · Houses 1, 4, 7, 10 Anchor Angles (Kendra)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-200 cursor-pointer hover:bg-cyan-950/50 transition-colors">
            <input
              type="checkbox"
              checked={showTransits}
              onChange={e => setShowTransits(e.target.checked)}
              className="rounded border-cyan-400/50 bg-black/50 text-cyan-400 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
              Show Transits
            </span>
          </label>
        </div>
      </div>

      <div className={`grid gap-6 ${compact ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_280px]"}`}>
        {/* SVG Diamond Chart */}
        <div className="relative flex items-center justify-center p-2">
          <svg
            className="mx-auto h-auto w-full max-w-[620px] filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
            viewBox="0 0 720 720"
            role="group"
            aria-label="Twelve counterclockwise houses inside a diamond chart"
          >
            <defs>
              <linearGradient id="diamondBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B101E" />
                <stop offset="50%" stopColor="#080B14" />
                <stop offset="100%" stopColor="#121829" />
              </linearGradient>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(217,182,111,0.22)" />
                <stop offset="60%" stopColor="rgba(139,92,246,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Diamond Outer Boundary */}
            <path
              d="M 360 45 L 675 360 L 360 675 L 45 360 Z"
              fill="url(#diamondBgGrad)"
              stroke="#D9B66F"
              strokeWidth="2.5"
            />

            {/* Inner Diagonal Cross Lines */}
            <line x1="45" y1="360" x2="675" y2="360" stroke="rgba(217,182,111,0.25)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="360" y1="45" x2="360" y2="675" stroke="rgba(217,182,111,0.25)" strokeWidth="1" strokeDasharray="3 3" />

            {/* 12 House Triangles */}
            {Array.from({ length: 12 }, (_, i) => {
              const house = i + 1;
              const start = edge(angleFor(house, 0));
              const end = edge(angleFor(house, 1));
              const mid = edge(angleFor(house), 235);
              const active = selectedHouse === house;
              const isKendra = [1, 4, 7, 10].includes(house);
              const isTrikona = [5, 9].includes(house);

              return (
                <g
                  key={house}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedHouse(house);
                    setSelectedPoint(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedHouse(house);
                      setSelectedPoint(null);
                    }
                  }}
                  aria-label={`Select house ${house}`}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <path
                    d={`M 360 360 L ${fmt(start.x)} ${fmt(start.y)} L ${fmt(end.x)} ${fmt(end.y)} Z`}
                    fill={
                      active
                        ? "rgba(34, 211, 238, 0.22)"
                        : isKendra
                        ? "rgba(217, 182, 111, 0.055)"
                        : isTrikona
                        ? "rgba(139, 92, 246, 0.05)"
                        : house % 2 === 0
                        ? "rgba(255, 255, 255, 0.015)"
                        : "transparent"
                    }
                    stroke={active ? "#22D3EE" : isKendra ? "rgba(217, 182, 111, 0.55)" : "rgba(232, 237, 247, 0.16)"}
                    strokeWidth={active ? "2" : isKendra ? "1.5" : "1"}
                  />
                  {/* House Number Marker */}
                  <circle
                    cx={mid.x}
                    cy={mid.y}
                    r={active ? 14 : 11}
                    fill={active ? "#22D3EE" : "#101628"}
                    stroke={active ? "#FFFFFF" : isKendra ? "#D9B66F" : "rgba(232, 237, 247, 0.3)"}
                    strokeWidth="1.2"
                  />
                  <text
                    x={mid.x}
                    y={mid.y + 0.5}
                    fill={active ? "#080B14" : isKendra ? "#D9B66F" : "#E8EDF7"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={active ? "12" : "10"}
                    fontWeight="bold"
                    className="font-mono select-none"
                  >
                    {house}
                  </text>
                </g>
              );
            })}

            {/* Central Firmament Hub */}
            <circle cx="360" cy="360" r="54" fill="url(#centerGlow)" />
            <circle cx="360" cy="360" r="48" fill="#080B14" stroke="#D9B66F" strokeWidth="2" filter="url(#goldGlow)" />
            <text x="360" y="352" fontSize="13" fill="#D9B66F" textAnchor="middle" fontWeight="bold" className="font-serif">
              THE ABSOLUTE
            </text>
            <text x="360" y="370" fontSize="9" fill="#22D3EE" textAnchor="middle" letterSpacing="1" className="font-mono">
              360° HARMONY
            </text>

            {/* Plotted Celestial Bodies */}
            {plotted.map(({ row, kind, i }) => {
              const theta = angleOf(row);
              const radius = kind === "natal" ? 165 + (i % 3) * 18 : 105 + (i % 3) * 15;
              const radians = (theta * Math.PI) / 180;
              const x = center + Math.cos(radians) * radius;
              const y = center + Math.sin(radians) * radius;
              const active = selectedPoint?.kind === kind && selectedPoint.row.name === row.name;
              const isAsc = row.name === "Ascendant";

              return (
                <g
                  key={`${kind}-${row.name}-${i}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedPoint({ kind, row });
                    setSelectedHouse(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPoint({ kind, row });
                      setSelectedHouse(null);
                    }
                  }}
                  className="cursor-pointer group"
                  aria-label={`${kind} ${row.name}, ${row.display}, house ${row.house}`}
                >
                  {/* Outer pulse ring for active or Ascendant */}
                  {(active || isAsc) && (
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 22 : 18}
                      fill="none"
                      stroke={kind === "natal" ? "#D9B66F" : "#22D3EE"}
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      className="animate-spin"
                      style={{ animationDuration: "8s" }}
                    />
                  )}

                  {/* Planet Marker Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 16 : isAsc ? 15 : 13}
                    fill={kind === "natal" ? (isAsc ? "#D9B66F" : "#1A1528") : "#082B38"}
                    stroke={kind === "natal" ? "#D9B66F" : "#22D3EE"}
                    strokeWidth={active ? 2.5 : 1.8}
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Glyph / Symbol */}
                  <text
                    x={x}
                    y={y + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={kind === "natal" ? (isAsc ? "#080B14" : "#D9B66F") : "#22D3EE"}
                    fontSize={isAsc ? "10" : "11"}
                    fontWeight="bold"
                    className="select-none"
                  >
                    {PLANET_GLYPHS[row.name] || row.name.slice(0, 2)}
                  </text>

                  {/* Degree Subtext in SVG for clarity */}
                  <text
                    x={x}
                    y={y + (active ? 24 : 20)}
                    textAnchor="middle"
                    fill="#E8EDF7"
                    fontSize="8.5"
                    fontWeight="bold"
                    className="font-mono select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                  >
                    {Math.floor(normalize(row.longitude) % 30)}°
                  </text>
                  <title>
                    {kind === "natal" ? "Natal" : "Transit"} {row.name}: {row.display} (House {row.house})
                  </title>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Precision Inspection HUD Panel */}
        <aside className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#080B14]/85 p-5 text-sm text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9B66F]">
                Precision Coordinates
              </span>
              <span className="text-[10px] font-mono text-cyan-300">Aldebaran Fixed Frame</span>
            </div>

            {selectedPoint ? (
              <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      selectedPoint.kind === "natal" ? "bg-[#D9B66F]" : "bg-[#22D3EE]"
                    }`}
                  />
                  <h4 className="font-serif text-lg font-bold text-white">
                    {selectedPoint.kind === "natal" ? "Natal" : "Transit"} {selectedPoint.row.name}
                  </h4>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Position</span>
                    <span className="font-bold text-[#E8EDF7]">{selectedPoint.row.display}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Absolute Longitude</span>
                    <span className="text-cyan-200">{selectedPoint.row.longitude.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Equal House</span>
                    <span className="text-[#D9B66F]">House {selectedPoint.row.house}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Speed / Direction</span>
                    <span className="text-emerald-300">
                      {selectedPoint.row.name === "North Node" || selectedPoint.row.name === "South Node"
                        ? "Retrograde (Mean)"
                        : selectedPoint.row.retrograde ? "Retrograde" : selectedPoint.row.speed != null ? "Direct" : "Direction not supplied"}
                    </span>
                  </div>
                </div>

                <PlacementMiniReading chart={chart} name={selectedPoint.row.name} layer={selectedPoint.kind}/>
              </div>
            ) : selectedHouse != null ? (
              <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-cyan-400" />
                  <h4 className="font-serif text-lg font-bold text-white">House {selectedHouse}</h4>
                  <span className="text-[10px] text-cyan-200 uppercase font-mono">
                    {[1, 4, 7, 10].includes(selectedHouse) ? "Kendra (Pillar)" : [5, 9].includes(selectedHouse) ? "Trikona (Grace)" : "Upachaya / Dusthana"}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cusp Longitude</span>
                    <span className="font-bold text-cyan-200">{currentHouse?.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Span</span>
                    <span className="text-slate-300">30° Equal Horizon</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-semibold text-[#D9B66F]">Occupying Placements:</span>
                  {natalRows.filter(r => r.house === selectedHouse).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No natal planets in this house.</p>
                  ) : (
                    natalRows
                      .filter(r => r.house === selectedHouse)
                      .map(r => (
                        <div key={r.name} className="flex items-center justify-between text-xs text-slate-200 bg-white/5 px-2.5 py-1.5 rounded-lg">
                          <span className="font-bold">{r.name}</span>
                          <span className="font-mono text-[#D9B66F]">{r.display}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-[#D9B66F]">
                  <Compass size={18} />
                  <span className="font-bold text-xs uppercase tracking-wider">Interactive Legend</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D9B66F] shrink-0" />
                    <span><strong>Gold Markers</strong>: Natal birth placements</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#22D3EE] shrink-0" />
                    <span><strong>Cyan Markers</strong>: Real-time planetary transits</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shrink-0" />
                    <span><strong>Diamonds 1, 4, 7, 10</strong>: Kendra pillars of power</span>
                  </p>
                </div>
                <p className="pt-2 text-[11px] text-slate-400 border-t border-white/10">
                  Tap any planet or house triangle to reveal its exact angular coordinates and cosmic signatures.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Ascendant: {chart.agentViewAvailable && chart.ascendant ? chart.ascendant.display : "Aligned"}</span>
            <span>Houses: Equal (30°)</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
