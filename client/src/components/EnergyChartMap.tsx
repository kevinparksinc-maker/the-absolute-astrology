import React, { useMemo, useState } from "react";
import type { ChartResult, TransitContact, MinorTransitContact, ChartRow } from "../../../server/astronomy";
import { ENERGY_ASPECT_FLOW } from "@/lib/energyScoring";
import { getPlainEnglishInterpretation } from "@/lib/energyInterpretations";
import { getHumanDialogue } from "@/lib/humanDialogueEngine";
import { Compass, Sparkles, Zap, Shield, ArrowRight, MessageSquare, ChevronRight, Filter } from "lucide-react";

const MAJOR_ASPECTS = new Set(["conjunction", "trine", "sextile", "square", "opposition"]);

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌",
  semisextile: "⚺",
  semisquare: "∠",
  sextile: "⚹",
  square: "□",
  trine: "△",
  quincunx: "⚻",
  opposition: "☍",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  "North Node": "☊", "South Node": "☋", Ascendant: "AC", Descendant: "DC",
};

const ZODIAC_SIGNS = [
  { name: "Aries", glyph: "♈" },
  { name: "Taurus", glyph: "♉" },
  { name: "Gemini", glyph: "♊" },
  { name: "Cancer", glyph: "♋" },
  { name: "Leo", glyph: "♌" },
  { name: "Virgo", glyph: "♍" },
  { name: "Libra", glyph: "♎" },
  { name: "Scorpio", glyph: "♏" },
  { name: "Sagittarius", glyph: "♐" },
  { name: "Capricorn", glyph: "♑" },
  { name: "Aquarius", glyph: "♒" },
  { name: "Pisces", glyph: "♓" },
];

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export interface EnergyContactItem {
  id: string;
  transit: string;
  natal: string;
  aspect: TransitContact["aspect"] | MinorTransitContact["aspect"];
  orb: number;
  intensity: number;
  stars: number;
  natalStars: number;
  majorFactor: number;
  strength: number;
  flow: -1 | 0 | 1;
  transitLongitude: number;
  natalLongitude: number;
  isMajor: boolean;
}

interface EnergyChartMapProps {
  chart: ChartResult;
  contacts: any[];
  selectedContactId?: string | null;
  onSelectContact?: (id: string | null) => void;
  onAskQuestion?: (question: string) => void;
}

export function EnergyChartMap({
  chart,
  contacts: rawContacts,
  selectedContactId,
  onSelectContact,
  onAskQuestion,
}: EnergyChartMapProps) {
  const [filter, setFilter] = useState<"all" | "major" | "minor" | "harmonious" | "challenging">("all");
  const [hoveredContactId, setHoveredContactId] = useState<string | null>(null);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const activeId = selectedContactId !== undefined ? selectedContactId : internalSelectedId;
  const setActiveId = (id: string | null) => {
    setInternalSelectedId(id);
    onSelectContact?.(id);
  };

  // Build lookup of natal planet longitudes
  const natalLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of chart.movingBodies) map.set(b.name, b.longitude);
    if (chart.ascendant) map.set("Ascendant", chart.ascendant.longitude);
    if (chart.northNode) map.set("North Node", chart.northNode.longitude);
    if (chart.southNode) map.set("South Node", chart.southNode.longitude);
    return map;
  }, [chart]);

  // Build lookup of transit planet longitudes
  const transitLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of chart.transits ?? []) map.set(t.name, t.longitude);
    return map;
  }, [chart]);

  // Enrich contacts with coordinates and major/minor categorization
  const enrichedContacts = useMemo<EnergyContactItem[]>(() => {
    return (rawContacts || []).map((c: any) => {
      const isMajor = MAJOR_ASPECTS.has(c.aspect);
      const transitLongitude = transitLookup.get(c.transit) ?? 0;
      const natalLongitude = natalLookup.get(c.natal) ?? 0;
      return {
        ...c,
        isMajor,
        transitLongitude,
        natalLongitude,
      };
    });
  }, [rawContacts, transitLookup, natalLookup]);

  // Counts
  const majorContacts = useMemo(() => enrichedContacts.filter(c => c.isMajor), [enrichedContacts]);
  const minorContacts = useMemo(() => enrichedContacts.filter(c => !c.isMajor), [enrichedContacts]);
  const flowContacts = useMemo(() => enrichedContacts.filter(c => c.flow === 1), [enrichedContacts]);
  const frictionContacts = useMemo(() => enrichedContacts.filter(c => c.flow === -1), [enrichedContacts]);

  // Filtered list for display
  const displayedContacts = useMemo(() => {
    if (filter === "major") return enrichedContacts.filter(c => c.isMajor);
    if (filter === "minor") return enrichedContacts.filter(c => !c.isMajor);
    if (filter === "harmonious") return enrichedContacts.filter(c => c.flow === 1);
    if (filter === "challenging") return enrichedContacts.filter(c => c.flow === -1);
    return enrichedContacts;
  }, [enrichedContacts, filter]);

  // Selected contact details
  const activeContact = useMemo(() => {
    const targetId = activeId || hoveredContactId;
    if (!targetId) return enrichedContacts[0] || null;
    return enrichedContacts.find(c => c.id === targetId) || enrichedContacts[0] || null;
  }, [enrichedContacts, activeId, hoveredContactId]);

  // SVG Geometry
  const size = 600;
  const center = size / 2;
  const outerSkyRadius = 265;
  const innerSkyRadius = 225;
  const horizonRadius = 210;
  const outerNatalRadius = 195;
  const innerNatalRadius = 150;
  const coreRadius = 80;

  // Active interpretation text
  const interpretation = useMemo(() => {
    if (!activeContact) return null;
    return getPlainEnglishInterpretation(
      activeContact.transit,
      activeContact.aspect,
      activeContact.natal,
      activeContact.isMajor
    );
  }, [activeContact]);

  // Conversational human dialogue
  const dialogue = useMemo(() => {
    if (!activeContact) return null;
    return getHumanDialogue(
      activeContact.transit,
      activeContact.aspect,
      activeContact.natal,
      activeContact.isMajor,
      activeContact.orb
    );
  }, [activeContact]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#070A12]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:p-7">
      {/* Header with Title and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#FBBF24]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
              Interactive Cosmic Energy Map
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Live Sky vs. Personal Natal Connection
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Outer ring shows live environmental sky · Inner ring shows your birth chart · Center beams show connecting aspects.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              filter === "all" ? "bg-amber-400 text-slate-950 font-bold shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            All ({enrichedContacts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("major")}
            className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              filter === "major" ? "bg-[#2DD4BF] text-slate-950 font-bold shadow-sm" : "text-teal-300/80 hover:text-white"
            }`}
            title="Major aspects exert 100% gravitational weight"
          >
            ★ Major 100% ({majorContacts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("minor")}
            className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              filter === "minor" ? "bg-amber-300 text-slate-950 font-bold shadow-sm" : "text-amber-300/80 hover:text-white"
            }`}
            title="Minor aspects exert 50% calibrated weight"
          >
            ✧ Minor 50% ({minorContacts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("harmonious")}
            className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              filter === "harmonious" ? "bg-emerald-500 text-white font-bold shadow-sm" : "text-emerald-400 hover:text-white"
            }`}
          >
            Flow ({flowContacts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("challenging")}
            className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              filter === "challenging" ? "bg-rose-500 text-white font-bold shadow-sm" : "text-rose-400 hover:text-white"
            }`}
          >
            Friction ({frictionContacts.length})
          </button>
        </div>
      </div>

      {/* Map Legend Banner */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/40 px-4 py-2.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
            <strong className="text-cyan-200">Outer Ring:</strong> Live Environmental Sky
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            <strong className="text-amber-200">Inner Ring:</strong> Your Personal Chart
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-[#2DD4BF]" />
            <span className="text-slate-300">Solid: Major (100% Impact)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 border-b border-dashed border-amber-300" />
            <span className="text-slate-300">Dashed: Minor (50% Impact)</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Stage: SVG Map + Real-time Inspector */}
      <div className="mt-6 grid items-center gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* SVG Chart Map */}
        <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F1C] p-2 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)]">
          <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full select-none overflow-visible">
            <defs>
              {/* Outer atmospheric glow */}
              <radialGradient id="skyAtmosphereGrad" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#0E1B38" stopOpacity="0.7" />
                <stop offset="90%" stopColor="#081024" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#070A12" stopOpacity="0" />
              </radialGradient>

              {/* Personal Core Matrix */}
              <radialGradient id="personalCoreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1E2A4A" stopOpacity="0.9" />
                <stop offset="80%" stopColor="#10182E" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0B0F1C" stopOpacity="0.2" />
              </radialGradient>

              {/* Glow filter for active rays */}
              <filter id="activeAspectGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background discs */}
            <circle cx={center} cy={center} r={outerSkyRadius} fill="url(#skyAtmosphereGrad)" stroke="#1E293B" strokeWidth="1.5" />
            <circle cx={center} cy={center} r={innerSkyRadius} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx={center} cy={center} r={horizonRadius} fill="none" stroke="#D9B66F" strokeOpacity="0.2" strokeWidth="1" />
            <circle cx={center} cy={center} r={outerNatalRadius} fill="url(#personalCoreGrad)" stroke="#1E293B" strokeWidth="1" />
            <circle cx={center} cy={center} r={innerNatalRadius} fill="#070A12" stroke="#334155" strokeWidth="1" />
            <circle cx={center} cy={center} r={coreRadius} fill="#090E1C" stroke="#D9B66F" strokeOpacity="0.3" strokeWidth="1.5" />

            {/* Zodiac 12-segment sector dividers & glyphs on outer sky ring */}
            {ZODIAC_SIGNS.map((sign, index) => {
              const startAngle = index * 30;
              const pOuter = polarToCartesian(center, center, outerSkyRadius, startAngle);
              const pInner = polarToCartesian(center, center, innerSkyRadius, startAngle);
              const pLabel = polarToCartesian(center, center, (outerSkyRadius + innerSkyRadius) / 2, startAngle + 15);
              return (
                <g key={sign.name}>
                  <line x1={pInner.x} y1={pInner.y} x2={pOuter.x} y2={pOuter.y} stroke="#334155" strokeWidth="0.8" strokeOpacity="0.6" />
                  <text
                    x={pLabel.x}
                    y={pLabel.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-500 font-serif text-[12px] opacity-70"
                  >
                    {sign.glyph}
                  </text>
                </g>
              );
            })}

            {/* Connecting Aspect Energy Rays (Center Beams) */}
            {displayedContacts.map(c => {
              const pTransit = polarToCartesian(center, center, (innerSkyRadius + outerSkyRadius) / 2, c.transitLongitude);
              const pNatal = polarToCartesian(center, center, (innerNatalRadius + outerNatalRadius) / 2, c.natalLongitude);

              const isSelected = activeContact?.id === c.id;
              const isFlow = c.flow === 1;
              const isFriction = c.flow === -1;

              // Color determination
              const strokeColor = isFlow ? "#2DD4BF" : isFriction ? "#FB7185" : "#FBBF24";
              const strokeWidth = isSelected ? 3.5 : c.isMajor ? 2.2 : 1.2;
              const strokeDasharray = c.isMajor ? "none" : "5 4";
              const opacity = isSelected ? 1 : activeContact ? 0.25 : c.isMajor ? 0.75 : 0.45;

              return (
                <g
                  key={c.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setActiveId(c.id)}
                  onMouseEnter={() => setHoveredContactId(c.id)}
                  onMouseLeave={() => setHoveredContactId(null)}
                >
                  {/* Invisible thicker stroke for easy touch/mouse targeting */}
                  <line x1={pTransit.x} y1={pTransit.y} x2={pNatal.x} y2={pNatal.y} stroke="transparent" strokeWidth="14" />

                  {/* Visual Laser Beam */}
                  <line
                    x1={pTransit.x}
                    y1={pTransit.y}
                    x2={pNatal.x}
                    y2={pNatal.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    opacity={opacity}
                    filter={isSelected ? "url(#activeAspectGlow)" : undefined}
                  />

                  {/* Midpoint Aspect Symbol on Selected Beam */}
                  {isSelected && (
                    <g transform={`translate(${(pTransit.x + pNatal.x) / 2}, ${(pTransit.y + pNatal.y) / 2})`}>
                      <circle r="12" fill="#0B0F1C" stroke={strokeColor} strokeWidth="1.5" />
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={strokeColor}
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {ASPECT_SYMBOLS[c.aspect] || c.aspect.slice(0, 2)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Natal Inner Ring Nodes */}
            {Array.from(natalLookup.entries()).map(([name, lon]) => {
              const p = polarToCartesian(center, center, (innerNatalRadius + outerNatalRadius) / 2, lon);
              const glyph = PLANET_GLYPHS[name] || name.slice(0, 2);
              const isConnected = activeContact?.natal === name;

              return (
                <g key={`natal-node-${name}`} className="select-none">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isConnected ? 11 : 7}
                    fill={isConnected ? "#F59E0B" : "#1E293B"}
                    stroke={isConnected ? "#FEF3C7" : "#64748B"}
                    strokeWidth={isConnected ? 2 : 1}
                    className="transition-all duration-300"
                  />
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isConnected ? "#0B0F1C" : "#E2E8F0"}
                    fontSize={isConnected ? "11" : "9"}
                    fontWeight="bold"
                  >
                    {glyph}
                  </text>
                </g>
              );
            })}

            {/* Transit Outer Ring Nodes */}
            {Array.from(transitLookup.entries()).map(([name, lon]) => {
              const p = polarToCartesian(center, center, (innerSkyRadius + outerSkyRadius) / 2, lon);
              const glyph = PLANET_GLYPHS[name] || name.slice(0, 2);
              const isConnected = activeContact?.transit === name;

              return (
                <g key={`transit-node-${name}`} className="select-none">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isConnected ? 12 : 8}
                    fill={isConnected ? "#06B6D4" : "#0F172A"}
                    stroke={isConnected ? "#A5F3FC" : "#38BDF8"}
                    strokeWidth={isConnected ? 2 : 1}
                    className="transition-all duration-300"
                  />
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isConnected ? "#080B14" : "#38BDF8"}
                    fontSize={isConnected ? "12" : "9"}
                    fontWeight="bold"
                  >
                    {glyph}
                  </text>
                </g>
              );
            })}

            {/* Central Radar Pulse Emblem */}
            <circle cx={center} cy={center} r="32" fill="#0B132B" stroke="#D9B66F" strokeWidth="1.5" />
            <text x={center} y={center - 5} textAnchor="middle" className="fill-amber-300 font-serif text-xs font-bold">
              {activeContact ? (ASPECT_SYMBOLS[activeContact.aspect] || "ALIGN") : "LIVE"}
            </text>
            <text x={center} y={center + 10} textAnchor="middle" className="fill-slate-400 font-mono text-[8px] uppercase tracking-wider">
              {activeContact ? (activeContact.isMajor ? "100% Impact" : "50% Impact") : "CHART MAP"}
            </text>
          </svg>
        </div>

        {/* Real-time Aspect Detail Inspector Card */}
        <div className="space-y-4">
          {activeContact && interpretation ? (
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1C]/90 p-5 shadow-lg">
              {/* Header with Classification Badge */}
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9B66F]">
                    {activeContact.transit} · Natal {activeContact.natal}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-white mt-0.5">
                    {dialogue?.everydayTitle || `${activeContact.transit} ${activeContact.aspect} ${activeContact.natal}`}
                  </h4>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    activeContact.isMajor
                      ? "border border-teal-400/50 bg-teal-950/80 text-[#2DD4BF]"
                      : "border border-amber-400/50 bg-amber-950/80 text-amber-300"
                  }`}
                >
                  {activeContact.isMajor ? "★ MAJOR · 100% IMPACT" : "✧ MINOR · 50% IMPACT"}
                </span>
              </div>

              {/* Conversational Life Resonance Guidance */}
              <div className="mt-3 space-y-3">
                {dialogue && (
                  <p className="text-xs font-medium italic text-cyan-200/90 leading-relaxed">
                    "{dialogue.tagline}"
                  </p>
                )}

                <div className="rounded-xl border border-white/5 bg-black/40 p-3 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <Sparkles size={13} className="text-amber-400" /> What You're Feeling Today
                  </span>
                  <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">
                    {dialogue ? dialogue.feelingInBodyAndMind : interpretation.feeling}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5">
                    <span className="font-bold text-emerald-300 text-[11px]">Best Move Today</span>
                    <p className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">
                      {dialogue ? dialogue.bestMoveToday : interpretation.bestFor}
                    </p>
                  </div>
                  <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-2.5">
                    <span className="font-bold text-rose-300 text-[11px]">Trap to Avoid</span>
                    <p className="mt-0.5 text-slate-300 text-[11px] leading-relaxed">
                      {dialogue ? dialogue.trapToAvoid : interpretation.caution}
                    </p>
                  </div>
                </div>

                {/* Subtle calculation detail (accessible, non-intrusive) */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>{activeContact.aspect} · {activeContact.orb.toFixed(2)}° orb</span>
                  <span>
                    Force: {activeContact.strength} pts ({activeContact.isMajor ? "100% full weight" : "50% calibrated impact"})
                  </span>
                </div>
              </div>

              {/* Master Interpreter CTA */}
              {onAskQuestion && (
                <button
                  type="button"
                  onClick={() =>
                    onAskQuestion(
                      `How does transit ${activeContact.transit} ${activeContact.aspect} my natal ${activeContact.natal} manifest in my life today in plain, practical terms?`
                    )
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/40 py-2.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-900/40 active:scale-98"
                >
                  <MessageSquare size={14} />
                  <span>Ask Master Interpreter about this connection →</span>
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1C]/70 p-6 text-center text-xs text-slate-400">
              <Compass className="mx-auto mb-2 h-8 w-8 text-amber-400/60" />
              <p>Click or hover over any aspect beam on the chart map to inspect its real-life personal influence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
