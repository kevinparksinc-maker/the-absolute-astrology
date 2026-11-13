import React, { useState, useMemo } from "react";
import type { ChartResult, ChartRow } from "../../../server/astronomy";
import { FocusedPlacementReading } from "@/components/FocusedPlacementReading";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Compass,
  Star,
  Globe,
  Flame,
  Droplets,
  Wind,
  Mountain,
  CheckCircle2,
  Info,
} from "lucide-react";

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  "North Node": "☊",
  "South Node": "☋",
  Ascendant: "AC",
  Descendant: "DC",
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const ELEMENT_MAP: Record<string, { element: "Fire" | "Earth" | "Air" | "Water"; modality: "Cardinal" | "Fixed" | "Mutable"; color: string }> = {
  Aries: { element: "Fire", modality: "Cardinal", color: "text-amber-400 bg-amber-500/10 border-amber-400/30" },
  Taurus: { element: "Earth", modality: "Fixed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30" },
  Gemini: { element: "Air", modality: "Mutable", color: "text-cyan-400 bg-cyan-500/10 border-cyan-400/30" },
  Cancer: { element: "Water", modality: "Cardinal", color: "text-blue-400 bg-blue-500/10 border-blue-400/30" },
  Leo: { element: "Fire", modality: "Fixed", color: "text-amber-400 bg-amber-500/10 border-amber-400/30" },
  Virgo: { element: "Earth", modality: "Mutable", color: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30" },
  Libra: { element: "Air", modality: "Cardinal", color: "text-cyan-400 bg-cyan-500/10 border-cyan-400/30" },
  Scorpio: { element: "Water", modality: "Fixed", color: "text-blue-400 bg-blue-500/10 border-blue-400/30" },
  Sagittarius: { element: "Fire", modality: "Mutable", color: "text-amber-400 bg-amber-500/10 border-amber-400/30" },
  Capricorn: { element: "Earth", modality: "Cardinal", color: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30" },
  Aquarius: { element: "Air", modality: "Fixed", color: "text-cyan-400 bg-cyan-500/10 border-cyan-400/30" },
  Pisces: { element: "Water", modality: "Mutable", color: "text-blue-400 bg-blue-500/10 border-blue-400/30" },
};

const HOUSE_THEMES: Record<number, string> = {
  1: "Self, Identity, Vitality & Appearance",
  2: "Wealth, Values, Material Resources & Voice",
  3: "Communication, Siblings, Curiosity & Mind",
  4: "Home, Family, Roots, Mother & Inner Peace",
  5: "Creativity, Romance, Children & Joy",
  6: "Daily Work, Health, Service & Discipline",
  7: "Partnership, Marriage, Contracts & Others",
  8: "Transformation, Depth, Shared Assets & Rebirth",
  9: "Higher Philosophy, Wisdom, Long Journeys & Dharma",
  10: "Career, Public Reputation, Purpose & Mastery",
  11: "Community, Social Circles, Long-term Goals & Hopes",
  12: "Subconscious, Spirituality, Solitude & Surrender",
};

const DIGNITY_TABLE: Record<string, { domicile: string[]; exaltation: string; fall: string; detriment: string[] }> = {
  Sun: { domicile: ["Leo"], exaltation: "Aries", fall: "Libra", detriment: ["Aquarius"] },
  Moon: { domicile: ["Cancer"], exaltation: "Taurus", fall: "Scorpio", detriment: ["Capricorn"] },
  Mercury: { domicile: ["Gemini", "Virgo"], exaltation: "Virgo", fall: "Pisces", detriment: ["Sagittarius", "Pisces"] },
  Venus: { domicile: ["Taurus", "Libra"], exaltation: "Pisces", fall: "Virgo", detriment: ["Aries", "Scorpio"] },
  Mars: { domicile: ["Aries", "Scorpio"], exaltation: "Capricorn", fall: "Cancer", detriment: ["Taurus", "Libra"] },
  Jupiter: { domicile: ["Sagittarius", "Pisces"], exaltation: "Cancer", fall: "Capricorn", detriment: ["Gemini", "Virgo"] },
  Saturn: { domicile: ["Capricorn", "Aquarius"], exaltation: "Libra", fall: "Aries", detriment: ["Cancer", "Leo"] },
};

const PLANET_DESCRIPTIONS: Record<string, string> = {
  Sun: "Your core identity, vital purpose, and conscious light in this world.",
  Moon: "Your instinctual nature, emotional safety, intuition, and bodily memory.",
  Mercury: "How your intellect processes ideas, writes, speaks, and analyzes truth.",
  Venus: "What brings you pleasure, your relationship style, aesthetic taste, and values.",
  Mars: "Your ambition, physical drive, courage to assert boundaries, and passion.",
  Jupiter: "Where wisdom expands, where luck and optimism find you, and spiritual faith.",
  Saturn: "Where life demands patience, maturity, structure, and lasting mastery.",
  Uranus: "Your capacity for innovation, sudden breakthroughs, and authentic freedom.",
  Neptune: "Your spiritual connection, poetic imagination, dreams, and subtle empathy.",
  Pluto: "Your psychological depths, resilience through crisis, and power of rebirth.",
  "North Node": "Your evolutionary growth edge and the destiny you are growing into.",
  "South Node": "Your innate masteries from the past and comfort zones to balance.",
  Ascendant: "Your personal presence, rising outlook, and the lens through which you meet life.",
  Descendant: "The qualities you meet through partners, mirrors, and intimate relationships.",
};

function getSignFromLongitude(lon: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  const norm = ((lon % 360) + 360) % 360;
  return signs[Math.floor(norm / 30)];
}

function getDignityBadge(planetName: string, sign: string): { label: string; color: string } | null {
  const dignity = DIGNITY_TABLE[planetName];
  if (!dignity) return null;

  if (dignity.domicile.includes(sign)) {
    return { label: "Domicile (Home)", color: "text-emerald-300 bg-emerald-950/80 border-emerald-400/40" };
  }
  if (dignity.exaltation === sign) {
    return { label: "Exalted (Peak)", color: "text-amber-300 bg-amber-950/80 border-amber-400/40" };
  }
  if (dignity.detriment.includes(sign)) {
    return { label: "Detriment", color: "text-rose-300 bg-rose-950/80 border-rose-400/40" };
  }
  if (dignity.fall === sign) {
    return { label: "Fall", color: "text-orange-300 bg-orange-950/80 border-orange-400/40" };
  }
  return null;
}

export function CompletePlacementsTable({ chart }: { chart: ChartResult }) {
  const [filter, setFilter] = useState<"all" | "personal" | "outer" | "angles">("all");
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  // Combine all moving bodies and cardinal points into one list
  const allRows = useMemo<ChartRow[]>(() => {
    const list: ChartRow[] = [...chart.movingBodies];
    if (chart.ascendant) list.push(chart.ascendant);
    if (chart.descendant) list.push(chart.descendant);
    if (chart.northNode) list.push(chart.northNode);
    if (chart.southNode) list.push(chart.southNode);
    return list;
  }, [chart]);

  const filteredRows = useMemo(() => {
    if (filter === "personal") {
      return allRows.filter(r => ["Sun", "Moon", "Mercury", "Venus", "Mars"].includes(r.name));
    }
    if (filter === "outer") {
      return allRows.filter(r => ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].includes(r.name));
    }
    if (filter === "angles") {
      return allRows.filter(r => ["Ascendant", "Descendant", "North Node", "South Node"].includes(r.name));
    }
    return allRows;
  }, [allRows, filter]);

  return (
    <section
      aria-label="Complete Planetary Placements Table"
      className="space-y-6 rounded-3xl border border-white/10 bg-[#080B14]/90 p-5 shadow-2xl sm:p-7"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#FBBF24]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
              Authority Astronomical Inventory
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            All Planetary Placements in Your Birth Chart
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Every celestial body anchored to your birth moment. Tap any planet row to inspect its deep meaning.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
          {[
            { id: "all", label: `All (${allRows.length})` },
            { id: "personal", label: "Personal Planets" },
            { id: "outer", label: "Outer & Social" },
            { id: "angles", label: "Angles & Nodes" },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                filter === tab.id
                  ? "bg-[#D9B66F] text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-[#070A12]/95">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-400">
              <th className="py-3.5 pl-4 pr-3 font-semibold">Planet / Point</th>
              <th className="py-3.5 px-3 font-semibold">Zodiac Sign & Degree</th>
              <th className="py-3.5 px-3 font-semibold">House Location</th>
              <th className="py-3.5 px-3 font-semibold">Element & Modality</th>
              <th className="py-3.5 px-3 font-semibold">Vedic Nakshatra</th>
              <th className="py-3.5 px-3 font-semibold">Dignity / State</th>
              <th className="py-3.5 pr-4 pl-3 text-right font-semibold">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredRows.map(row => {
              const sign = getSignFromLongitude(row.longitude);
              const signGlyph = SIGN_GLYPHS[sign] || "";
              const planetGlyph = PLANET_GLYPHS[row.name] || row.name.slice(0, 2);
              const elInfo = ELEMENT_MAP[sign];
              const dignity = getDignityBadge(row.name, sign);
              const isExpanded = expandedPlanet === row.name;

              return (
                <React.Fragment key={row.name}>
                  <tr
                    onClick={() => setExpandedPlanet(isExpanded ? null : row.name)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Planet Name + Glyph */}
                    <td className="py-3.5 pl-4 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base text-cyan-300 font-bold w-5 text-center">
                          {planetGlyph}
                        </span>
                        <div>
                          <span className="font-bold text-white text-sm block">{row.name}</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {PLANET_DESCRIPTIONS[row.name] || ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Sign & Exact Degree */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg text-[#D9B66F] font-bold">{signGlyph}</span>
                        <div>
                          <span className="font-semibold text-slate-200">{sign}</span>
                          <span className="block font-mono text-[11px] text-slate-400">{row.display}</span>
                        </div>
                      </div>
                    </td>

                    {/* House Placement */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-semibold text-white">House {row.agentHouse ?? row.house}</span>
                        <span className="block text-[10px] text-slate-400 line-clamp-1">
                          {HOUSE_THEMES[row.agentHouse ?? row.house] || ""}
                        </span>
                      </div>
                    </td>

                    {/* Element & Modality */}
                    <td className="py-3.5 px-3">
                      {elInfo && (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${elInfo.color}`}>
                          {elInfo.element} · {elInfo.modality}
                        </span>
                      )}
                    </td>

                    {/* Vedic Nakshatra */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-semibold text-amber-200">{row.overlay?.nakshatra || "—"}</span>
                        {row.overlay?.pada && (
                          <span className="block text-[10px] text-slate-400 font-mono">Pada {row.overlay.pada}</span>
                        )}
                      </div>
                    </td>

                    {/* Dignity / Motion */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {row.retrograde && (
                          <span className="rounded-md border border-rose-400/40 bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300">
                            ℞ Retrograde
                          </span>
                        )}
                        {dignity && (
                          <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${dignity.color}`}>
                            {dignity.label}
                          </span>
                        )}
                        {!row.retrograde && !dignity && (
                          <span className="text-slate-500 text-[11px]">Direct</span>
                        )}
                      </div>
                    </td>

                    {/* Expand Arrow */}
                    <td className="py-3.5 pr-4 pl-3 text-right">
                      <span className="text-cyan-300 hover:text-white font-semibold text-xs inline-flex items-center gap-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {isExpanded && (
                    <tr className="bg-white/[0.04]">
                      <td colSpan={7} className="p-4 border-t border-b border-white/10">
                        <div className="rounded-xl border border-white/10 bg-[#0B0F1C] p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#D9B66F] tracking-wider">
                                Placement Blueprint
                              </span>
                              <h4 className="font-serif text-lg font-bold text-white">
                                {row.name} in {sign} · House {row.agentHouse ?? row.house}
                              </h4>
                            </div>
                            <span className="font-mono text-xs text-slate-400">{row.display}</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {PLANET_DESCRIPTIONS[row.name] || ""} In {sign}, this energy expresses with {elInfo?.element.toLowerCase()} and {elInfo?.modality.toLowerCase()} qualities, focusing directly into your {HOUSE_THEMES[row.agentHouse ?? row.house]?.toLowerCase()}.
                          </p>

                          <FocusedPlacementReading chart={chart} name={row.name} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid gap-3 md:hidden">
        {filteredRows.map(row => {
          const sign = getSignFromLongitude(row.longitude);
          const signGlyph = SIGN_GLYPHS[sign] || "";
          const planetGlyph = PLANET_GLYPHS[row.name] || row.name.slice(0, 2);
          const elInfo = ELEMENT_MAP[sign];
          const dignity = getDignityBadge(row.name, sign);
          const isExpanded = expandedPlanet === row.name;

          return (
            <div
              key={row.name}
              onClick={() => setExpandedPlanet(isExpanded ? null : row.name)}
              className="rounded-2xl border border-white/10 bg-[#070A12]/95 p-4 space-y-3 cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl text-cyan-300 font-bold w-6 text-center">
                    {planetGlyph}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{row.name}</h3>
                    <p className="text-xs text-[#D9B66F] font-semibold">
                      {signGlyph} {sign} · {row.display}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white block">House {row.agentHouse ?? row.house}</span>
                  {row.overlay?.nakshatra && (
                    <span className="text-[10px] text-amber-200 block font-mono">{row.overlay.nakshatra}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {elInfo && (
                    <span className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold ${elInfo.color}`}>
                      {elInfo.element} · {elInfo.modality}
                    </span>
                  )}
                  {row.retrograde && (
                    <span className="rounded-md border border-rose-400/40 bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300">
                      ℞ Retrograde
                    </span>
                  )}
                  {dignity && (
                    <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${dignity.color}`}>
                      {dignity.label}
                    </span>
                  )}
                </div>

                <span className="text-xs text-cyan-300 font-semibold flex items-center gap-0.5">
                  {isExpanded ? "Close" : "Inspect"} {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </div>

              {isExpanded && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="rounded-xl border border-white/10 bg-[#0B0F1C] p-3 space-y-2.5 mt-2 animate-in fade-in duration-200"
                >
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {PLANET_DESCRIPTIONS[row.name] || ""} Governs {HOUSE_THEMES[row.agentHouse ?? row.house]?.toLowerCase()}.
                  </p>
                  <FocusedPlacementReading chart={chart} name={row.name} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
