import { useMemo, useState } from "react";
import type { ChartResult } from "../../../server/astronomy";
import { angularDistance } from "../../../server/astrologyCore";
import { formatLongitude, overlay } from "../../../shared/hybrid";

type Layer = "natal" | "transit" | "god";

type Body = {
  name: string;
  glyph: string;
  longitude: number;
  color: string;
  detail: string;
  house?: number;
  godHouse?: number;
  agentHouse?: number;
  retrograde?: boolean;
};

const PLANET_GLYPHS: Record<string, { glyph: string; color: string }> = {
  Sun: { glyph: "☉", color: "#f59e0b" },
  Moon: { glyph: "☽", color: "#f8fafc" },
  Mercury: { glyph: "☿", color: "#38bdf8" },
  Venus: { glyph: "♀", color: "#f472b6" },
  Mars: { glyph: "♂", color: "#fb7185" },
  Jupiter: { glyph: "♃", color: "#c084fc" },
  Saturn: { glyph: "♄", color: "#94a3b8" },
  Uranus: { glyph: "♅", color: "#2dd4bf" },
  Neptune: { glyph: "♆", color: "#818cf8" },
  Pluto: { glyph: "♇", color: "#e879f9" },
  "North Node": { glyph: "☊", color: "#facc15" },
  "South Node": { glyph: "☋", color: "#a8a29e" },
};

const ROYAL_STARS = [
  { name: "Aldebaran", longitude: 45, title: "Watcher of the East · Taurus 15°00′" },
  { name: "Regulus", longitude: 135, title: "Watcher of the North · Leo 15°00′" },
  { name: "Antares", longitude: 225.0167, title: "Watcher of the West · Scorpio 15°01′" },
  { name: "Fomalhaut", longitude: 315, title: "Watcher of the South · Pisces 15°00′" },
];

const FALLBACK_LAYERS: Record<
  Layer,
  { label: string; short: string; color: string; description: string; bodies: Body[] }
> = {
  natal: {
    label: "Natal / Agent Horizon",
    short: "NATAL",
    color: "#f59e0b",
    description:
      "The person’s birth sky: local Equal House horizon, personal angles, and enduring foundation.",
    bodies: [
      { name: "Sun", glyph: "☉", longitude: 238.03, color: "#f59e0b", detail: "Scorpio 28°02′ · Agent House 11", house: 11, godHouse: 8, agentHouse: 11 },
      { name: "Moon", glyph: "☽", longitude: 103.5, color: "#f8fafc", detail: "Cancer 13°30′ · Agent House 7", house: 7, godHouse: 4, agentHouse: 7 },
      { name: "Mercury", glyph: "☿", longitude: 222.4, color: "#38bdf8", detail: "Scorpio 12°24′ · Agent House 11", house: 11, godHouse: 8, agentHouse: 11 },
      { name: "Venus", glyph: "♀", longitude: 215.5, color: "#f472b6", detail: "Scorpio 05°30′ · Agent House 10", house: 10, godHouse: 8, agentHouse: 10 },
      { name: "Mars", glyph: "♂", longitude: 326.2, color: "#fb7185", detail: "Aquarius 26°12′ · Agent House 2", house: 2, godHouse: 11, agentHouse: 2 },
      { name: "Jupiter", glyph: "♃", longitude: 343.3, color: "#c084fc", detail: "Pisces 13°18′ · Agent House 3", house: 3, godHouse: 12, agentHouse: 3 },
      { name: "Saturn", glyph: "♄", longitude: 250.4, color: "#94a3b8", detail: "Sagittarius 10°24′ · Agent House 12", house: 12, godHouse: 9, agentHouse: 12 },
    ],
  },
  transit: {
    label: "Transit / Question Moment",
    short: "TRANSIT",
    color: "#a855f7",
    description:
      "The moving sky at the selected observation moment, measured against the natal foundation.",
    bodies: [
      { name: "Sun", glyph: "☉", longitude: 198, color: "#f59e0b", detail: "Libra 18°00′ · Transit House 10" },
      { name: "Moon", glyph: "☽", longitude: 92, color: "#f8fafc", detail: "Cancer 02°00′ · Transit House 7" },
      { name: "Mercury", glyph: "☿", longitude: 204, color: "#38bdf8", detail: "Libra 24°00′ · Transit House 10" },
      { name: "Venus", glyph: "♀", longitude: 164, color: "#f472b6", detail: "Virgo 14°00′ · Transit House 9" },
      { name: "Mars", glyph: "♂", longitude: 250, color: "#fb7185", detail: "Sagittarius 10°00′ · Transit House 12" },
      { name: "Jupiter", glyph: "♃", longitude: 112, color: "#c084fc", detail: "Cancer 22°00′ · Transit House 7" },
      { name: "Saturn", glyph: "♄", longitude: 14, color: "#94a3b8", detail: "Aries 14°00′ · Transit House 4" },
    ],
  },
  god: {
    label: "God View / Geocentric Frame",
    short: "GOD VIEW",
    color: "#06b6d4",
    description:
      "The universal 0° Aries to 360° Pisces reference frame: canonical geocentric positions with fixed houses and Royal Star locks.",
    bodies: [
      { name: "Sun", glyph: "☉", longitude: 198, color: "#f59e0b", detail: "Libra 18°00′ · God House 7" },
      { name: "Moon", glyph: "☽", longitude: 92, color: "#f8fafc", detail: "Cancer 02°00′ · God House 4" },
      { name: "Mercury", glyph: "☿", longitude: 204, color: "#38bdf8", detail: "Libra 24°00′ · God House 7" },
      { name: "Venus", glyph: "♀", longitude: 164, color: "#f472b6", detail: "Virgo 14°00′ · God House 6" },
      { name: "Mars", glyph: "♂", longitude: 250, color: "#fb7185", detail: "Sagittarius 10°00′ · God House 9" },
      { name: "Jupiter", glyph: "♃", longitude: 112, color: "#c084fc", detail: "Cancer 22°00′ · God House 4" },
      { name: "Saturn", glyph: "♄", longitude: 14, color: "#94a3b8", detail: "Aries 14°00′ · God House 1" },
    ],
  },
};

const ZODIAC_ABBR = [
  "ARI",
  "TAU",
  "GEM",
  "CAN",
  "LEO",
  "VIR",
  "LIB",
  "SCO",
  "SAG",
  "CAP",
  "AQU",
  "PIS",
];

const polar = (longitude: number, radius: number, center = 220) => {
  const angle = ((longitude - 90) * Math.PI) / 180;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
};

interface ThreeLayerOrreryProps {
  chart?: ChartResult | null;
}

export function ThreeLayerOrrery({ chart }: ThreeLayerOrreryProps) {
  const [layer, setLayer] = useState<Layer>("god");
  const [selectedBodyName, setSelectedBodyName] = useState<string>("Moon");
  const [showAllRings, setShowAllRings] = useState<boolean>(true);

  const computedLayers = useMemo(() => {
    if (!chart) return FALLBACK_LAYERS;

    const mapRow = (
      row: ChartResult["movingBodies"][number],
      mode: Layer
    ): Body => {
      const meta = PLANET_GLYPHS[row.name] ?? { glyph: "•", color: "#38bdf8" };
      const houseLabel =
        mode === "god"
          ? `God House ${row.godHouse ?? Math.floor(row.longitude / 30) + 1}`
          : mode === "natal"
            ? `Agent House ${row.agentHouse ?? row.house}`
            : `House ${row.house}`;
      return {
        name: row.name,
        glyph: meta.glyph,
        longitude: row.longitude,
        color: meta.color,
        detail: `${row.display} · ${houseLabel}${row.retrograde ? " · Retrograde" : ""}`,
        house: row.house,
        godHouse: row.godHouse,
        agentHouse: row.agentHouse,
        retrograde: row.retrograde,
      };
    };

    const natalBodies = chart.movingBodies.map(r => mapRow(r, "natal"));
    const transitSource =
      chart.transits.length > 0 ? chart.transits : chart.movingBodies;
    const transitBodies = transitSource.map(r => mapRow(r, "transit"));
    const godBodies = transitSource.map(r => mapRow(r, "god"));

    return {
      natal: {
        ...FALLBACK_LAYERS.natal,
        bodies: natalBodies.length > 0 ? natalBodies : FALLBACK_LAYERS.natal.bodies,
      },
      transit: {
        ...FALLBACK_LAYERS.transit,
        bodies:
          transitBodies.length > 0
            ? transitBodies
            : FALLBACK_LAYERS.transit.bodies,
      },
      god: {
        ...FALLBACK_LAYERS.god,
        bodies: godBodies.length > 0 ? godBodies : FALLBACK_LAYERS.god.bodies,
      },
    };
  }, [chart]);

  const selected = computedLayers[layer];
  const activeBodies = selected.bodies;
  const inspectedBody =
    activeBodies.find(b => b.name === selectedBodyName) ?? activeBodies[0];

  const inspectedOverlay = useMemo(
    () => (inspectedBody ? overlay(inspectedBody.longitude) : null),
    [inspectedBody]
  );

  // Calculate tight geometric aspects (<= 5° orb) within the active layer
  const aspectChords = useMemo(() => {
    const chords: Array<{
      a: Body;
      b: Body;
      type: string;
      orb: number;
      color: string;
    }> = [];
    const targets: Array<[number, string, string]> = [
      [0, "Conjunction", "#facc15"],
      [60, "Sextile", "#38bdf8"],
      [90, "Square", "#fb7185"],
      [120, "Trine", "#34d399"],
      [180, "Opposition", "#c084fc"],
    ];
    for (let i = 0; i < activeBodies.length; i += 1) {
      for (let j = i + 1; j < activeBodies.length; j += 1) {
        const first = activeBodies[i]!;
        const second = activeBodies[j]!;
        const dist = angularDistance(first.longitude, second.longitude);
        for (const [deg, label, color] of targets) {
          const orb = Math.abs(dist - deg);
          if (orb <= 5) {
            chords.push({ a: first, b: second, type: label, orb, color });
            break;
          }
        }
      }
    }
    return chords;
  }, [activeBodies]);

  const activeRadius = layer === "god" ? 162 : layer === "transit" ? 128 : 94;

  return (
    <div className="space-y-5">
      {/* Segmented Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-1 gap-1.5 rounded-xl border border-slate-800 bg-[#0b101b] p-1"
          role="tablist"
          aria-label="Orrery layers"
        >
          {(Object.keys(computedLayers) as Layer[]).map(key => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={key === layer}
              onClick={() => setLayer(key)}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold tracking-wider transition ${
                key === layer
                  ? "text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-100"
              }`}
              style={
                key === layer
                  ? { backgroundColor: computedLayers[key].color }
                  : undefined
              }
            >
              {computedLayers[key].short}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAllRings(v => !v)}
          className="whitespace-nowrap rounded-xl border border-slate-800 bg-[#0b101b] px-3.5 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
        >
          {showAllRings ? "Showing All 3 Rings" : "Showing Active Ring Only"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Precision SVG Astronomical Orrery */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070b14] p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: selected.color }}
              />
              <span className="font-semibold text-slate-200">
                {selected.label}
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums text-slate-400">
                {activeBodies.length} bodies
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums text-cyan-300">
                {aspectChords.length} aspects ≤ 5°
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              0° ARI TOP · POLARIS STILL CENTER
            </span>
          </div>

          <svg
            viewBox="0 0 440 440"
            className="mx-auto aspect-square w-full max-w-[500px] select-none"
            role="img"
            aria-label={`${selected.label} three-layer orrery`}
          >
            <defs>
              <radialGradient id="orreryCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={selected.color} stopOpacity="0.16" />
                <stop offset="65%" stopColor="#070b14" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="220" cy="220" r="206" fill="url(#orreryCoreGlow)" />

            {/* Outer Degree Scale & Zodiac Ring */}
            <circle
              cx="220"
              cy="220"
              r="204"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <circle
              cx="220"
              cy="220"
              r="184"
              fill="none"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* 36 Decan (10°) & 12 Sign (30°) Graduation Ticks */}
            {Array.from({ length: 72 }).map((_, idx) => {
              const deg = idx * 5;
              const isSignBoundary = deg % 30 === 0;
              const isDecanBoundary = deg % 10 === 0;
              const innerR = isSignBoundary ? 184 : isDecanBoundary ? 196 : 200;
              const p1 = polar(deg, innerR, 220);
              const p2 = polar(deg, 204, 220);
              return (
                <line
                  key={deg}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isSignBoundary ? "#64748b" : "#334155"}
                  strokeWidth={isSignBoundary ? "1.2" : "0.75"}
                />
              );
            })}

            {/* 12 Zodiac Sign Labels */}
            {ZODIAC_ABBR.map((sign, index) => {
              const p = polar(index * 30 + 15, 194, 220);
              return (
                <text
                  key={sign}
                  x={p.x}
                  y={p.y}
                  fill="#94a3b8"
                  fontSize="8"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {sign}
                </text>
              );
            })}

            {/* 4 Royal Star Fixed Beacons on Outer Ring */}
            {ROYAL_STARS.map(star => {
              const p = polar(star.longitude, 176, 220);
              return (
                <g key={star.name}>
                  <polygon
                    points={`${p.x},${p.y - 4} ${p.x + 4},${p.y} ${p.x},${p.y + 4} ${p.x - 4},${p.y}`}
                    fill="#fbbf24"
                    fillOpacity="0.85"
                  />
                  <title>{`${star.name} · ${star.title}`}</title>
                </g>
              );
            })}

            {/* Three Concentric Coordinate Tracks */}
            <circle
              cx="220"
              cy="220"
              r="162"
              fill="none"
              stroke="#06b6d4"
              strokeOpacity={layer === "god" ? 0.75 : 0.25}
              strokeWidth={layer === "god" ? "1.75" : "1"}
              strokeDasharray="3 6"
            />
            <circle
              cx="220"
              cy="220"
              r="128"
              fill="none"
              stroke="#a855f7"
              strokeOpacity={layer === "transit" ? 0.75 : 0.25}
              strokeWidth={layer === "transit" ? "1.75" : "1"}
            />
            <circle
              cx="220"
              cy="220"
              r="94"
              fill="none"
              stroke="#f59e0b"
              strokeOpacity={layer === "natal" ? 0.75 : 0.25}
              strokeWidth={layer === "natal" ? "1.75" : "1"}
            />

            {/* Crosshair Cardinal Axes */}
            <line
              x1="36"
              y1="220"
              x2="404"
              y2="220"
              stroke="#1e293b"
              strokeWidth="1"
            />
            <line
              x1="220"
              y1="36"
              x2="220"
              y2="404"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* 5° Geometric Aspect Chords */}
            {aspectChords.map((chord, idx) => {
              const p1 = polar(chord.a.longitude, activeRadius, 220);
              const p2 = polar(chord.b.longitude, activeRadius, 220);
              const isHighlighted =
                inspectedBody &&
                (chord.a.name === inspectedBody.name ||
                  chord.b.name === inspectedBody.name);
              return (
                <line
                  key={`${chord.a.name}-${chord.b.name}-${idx}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={chord.color}
                  strokeOpacity={isHighlighted ? 0.85 : 0.22}
                  strokeWidth={isHighlighted ? "1.75" : "1"}
                />
              );
            })}

            {/* Background Ring Markers when showAllRings is enabled */}
            {showAllRings &&
              (Object.keys(computedLayers) as Layer[])
                .filter(k => k !== layer)
                .map(otherLayer => {
                  const r =
                    otherLayer === "god"
                      ? 162
                      : otherLayer === "transit"
                        ? 128
                        : 94;
                  return computedLayers[otherLayer].bodies.map(b => {
                    const p = polar(b.longitude, r, 220);
                    return (
                      <circle
                        key={`${otherLayer}-${b.name}`}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill={computedLayers[otherLayer].color}
                        fillOpacity="0.45"
                      >
                        <title>{`${computedLayers[otherLayer].short}: ${b.name} (${b.detail})`}</title>
                      </circle>
                    );
                  });
                })}

            {/* Active Layer Interactive Planet Nodes */}
            {activeBodies.map(body => {
              const p = polar(body.longitude, activeRadius, 220);
              const isSelected = inspectedBody?.name === body.name;
              return (
                <g
                  key={body.name}
                  onClick={() => setSelectedBodyName(body.name)}
                  className="cursor-pointer"
                >
                  {isSelected && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="15"
                      fill="none"
                      stroke={body.color}
                      strokeOpacity="0.6"
                      strokeWidth="1.5"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? "11" : "9.5"}
                    fill="#070b14"
                    stroke={body.color}
                    strokeWidth={isSelected ? "2.2" : "1.6"}
                  />
                  <text
                    x={p.x}
                    y={p.y + 3.5}
                    textAnchor="middle"
                    fill={body.color}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {body.glyph}
                  </text>
                  <title>{`${body.name} · ${body.detail}`}</title>
                </g>
              );
            })}

            {/* Polaris Still Center */}
            <circle
              cx="220"
              cy="220"
              r="42"
              fill="#0b1120"
              stroke={selected.color}
              strokeOpacity="0.65"
              strokeWidth="1.5"
            />
            <circle cx="220" cy="220" r="3" fill="#f8fafc" />
            <text
              x="220"
              y="211"
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="9"
              fontWeight="600"
              fontFamily="IBM Plex Mono, monospace"
            >
              POLARIS
            </text>
            <text
              x="220"
              y="228"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="7.5"
              fontFamily="IBM Plex Mono, monospace"
            >
              {selected.short}
            </text>
          </svg>

          {/* Ring Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span>Outer: God View (Fixed 0° Aries)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>Middle: Transit Sky</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Inner: Natal / Agent</span>
              </span>
            </div>
            <span className="text-[11px] text-amber-300/90">
              ◆ 4 Royal Watchers Locked
            </span>
          </div>
        </div>

        {/* Right Telemetry & Body Inspector Column */}
        <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-800 bg-[#0b101b] p-5">
          <div className="space-y-4">
            <div>
              <div
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: selected.color }}
              >
                Active Coordinate Frame
              </div>
              <h3 className="mt-1 font-serif text-2xl text-white">
                {selected.label}
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                {selected.description}
              </p>
            </div>

            {/* Selected Body Telemetry Inspector */}
            {inspectedBody && inspectedOverlay && (
              <div className="rounded-xl border border-slate-800 bg-[#070b14] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-2xl leading-none"
                      style={{ color: inspectedBody.color }}
                    >
                      {inspectedBody.glyph}
                    </span>
                    <div>
                      <div className="text-base font-semibold text-white">
                        {inspectedBody.name}
                      </div>
                      <div className="font-mono text-xs tabular-nums text-cyan-300">
                        {formatLongitude(inspectedBody.longitude)} (
                        {inspectedBody.longitude.toFixed(2)}°)
                      </div>
                    </div>
                  </div>
                  {inspectedBody.retrograde && (
                    <span className="font-mono text-xs font-semibold text-rose-300">
                      RETROGRADE
                    </span>
                  )}
                </div>

                <div className="mt-3.5 space-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Frame Position:</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {inspectedBody.detail.split("·")[1]?.trim() ?? "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vedic Nakshatra:</span>
                    <span className="font-mono text-amber-200">
                      {inspectedOverlay.nakshatra} · Pada {inspectedOverlay.pada}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arabic Manzil:</span>
                    <span className="font-mono text-violet-200">
                      {inspectedOverlay.manzil}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hellenistic Decan:</span>
                    <span className="font-mono text-cyan-200">
                      {inspectedOverlay.decan}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Body Selector Grid */}
            <div>
              <div className="mb-2 text-xs font-semibold text-slate-400">
                Select a Body to Inspect Coordinates & Overlays
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-2">
                {activeBodies.map(body => {
                  const active = inspectedBody?.name === body.name;
                  return (
                    <button
                      key={body.name}
                      type="button"
                      onClick={() => setSelectedBodyName(body.name)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                        active
                          ? "border-cyan-400/50 bg-cyan-950/30 text-white"
                          : "border-slate-800/90 bg-[#070b14]/70 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate text-xs font-medium">
                        <span
                          style={{ color: body.color }}
                          className="text-sm leading-none"
                        >
                          {body.glyph}
                        </span>
                        <span className="truncate">{body.name}</span>
                      </span>
                      <span className="ml-1 font-mono text-[10px] tabular-nums text-slate-400">
                        {Math.floor(body.longitude)}°
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Aspect Chords Summary */}
          <div className="border-t border-slate-800 pt-3">
            <div className="text-xs font-semibold text-slate-400">
              Tight 5° Geometric Contacts ({aspectChords.length})
            </div>
            {aspectChords.length > 0 ? (
              <div className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1 text-xs text-slate-300">
                {aspectChords.slice(0, 6).map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between font-mono text-[11px] tabular-nums"
                  >
                    <span>
                      {c.a.name} {c.type.toLowerCase()} {c.b.name}
                    </span>
                    <span className="text-slate-400">{c.orb.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                No contacts within 5° in this layer.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
