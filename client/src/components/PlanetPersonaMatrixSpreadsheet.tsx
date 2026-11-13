import React, { useState, useMemo } from "react";
import {
  Table,
  Download,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Info,
  Flame,
  Star,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";
import type { PlanetPersonaTrait } from "../../../shared/planetPersonaMatrix";
import { buildRealWorldTranslation } from "../../../shared/peopleTalkTranslation";

export interface PlanetPersonaMatrixSpreadsheetProps {
  chart: ChartResult;
  onSelectPlanet?: (planetName: string) => void;
}

const PLANET_SYMBOLS: Record<string, string> = {
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
  Ascendant: "AC",
  Descendant: "DC",
  "North Node": "☊",
  NorthNode: "☊",
  "South Node": "☋",
  SouthNode: "☋",
};

export function PlanetPersonaMatrixSpreadsheet({ chart }: PlanetPersonaMatrixSpreadsheetProps) {
  const { data: matrixData, isLoading } = trpc.interpretation.personaMatrix.useQuery({ chart });
  const [filterText, setFilterText] = useState("");
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPersonaTrait | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards" | "people-talk">("table");

  const matrix = useMemo(() => {
    return (matrixData as PlanetPersonaTrait[]) || [];
  }, [matrixData]);

  const filteredMatrix = useMemo(() => {
    if (!filterText.trim()) return matrix;
    const q = filterText.toLowerCase();
    return matrix.filter(
      p =>
        p.planet.toLowerCase().includes(q) ||
        p.display.toLowerCase().includes(q) ||
        p.sign.toLowerCase().includes(q) ||
        p.nakshatraName.toLowerCase().includes(q) ||
        p.manzilName.toLowerCase().includes(q) ||
        p.personaArchetype.toLowerCase().includes(q) ||
        p.houseArena.toLowerCase().includes(q)
    );
  }, [matrix, filterText]);

  const downloadCSV = () => {
    if (!matrix.length) return;
    const headers = [
      "Planet",
      "Position",
      "Sign",
      "House",
      "House Arena (Life Theme)",
      "Decan Flavor",
      "Chaldean Face",
      "Nakshatra",
      "Nakshatra Pada",
      "Nakshatra Deity",
      "Nakshatra Shakti (Expression)",
      "Arabic Manzil",
      "Manzil Translation",
      "Manzil Station Role",
      "Sovereignty Tier",
      "Essential Dignities",
      "Egyptian Bounds",
      "Shadbala Virupas",
      "Shadbala Status",
      "House Strength Virupas",
      "House Support Tier",
      "Navamsha D9",
      "Active Aspects",
      "Dasha Timing Role",
      "Fixed Star Contact",
      "Charisma Archetype",
      "Charisma Profile",
    ];

    const rows = matrix.map(p => [
      `"${p.planet}"`,
      `"${p.formattedPosition}"`,
      `"${p.sign}"`,
      p.house,
      `"${p.houseArena.replace(/"/g, '""')}"`,
      `"${p.decanFlavor.replace(/"/g, '""')}"`,
      `"${p.chaldeanFaceRuler}"`,
      `"${p.nakshatraName}"`,
      p.nakshatraPada,
      `"${p.nakshatraDeity}"`,
      `"${p.nakshatraShakti.replace(/"/g, '""')}"`,
      `"${p.manzilName}"`,
      `"${p.manzilEnglish}"`,
      `"${p.manzilStationRole.replace(/"/g, '""')}"`,
      `"${p.sovereigntyTier}"`,
      `"${p.essentialDignities.join(", ")}"`,
      `"${p.boundsEgyptian}"`,
      p.shadbalaVirupas,
      `"${p.shadbalaStatus}"`,
      p.houseStrengthVirupas,
      `"${p.houseSupportTier}"`,
      `"${p.navamshaD9}"`,
      `"${p.activeAspects.join("; ").replace(/"/g, '""')}"`,
      `"${p.activeDashaRole}"`,
      `"${(p.fixedStarContact ?? "").replace(/"/g, '""')}"`,
      `"${p.personaArchetype}"`,
      `"${p.charismaProfile.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Master_Planet_Persona_Matrix_${chart.readingScope}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Master Planet Persona Matrix
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              Excel Spreadsheet View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every celestial body aligned in rows with each canon method across columns, defining exact charisma, vitality, and lived expression.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Search planet, sign, method…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs ${viewMode === "table" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
              title="Table View (Excel Grid)"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs ${viewMode === "cards" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
              title="Persona Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("people-talk")}
              className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 ${viewMode === "people-talk" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-white"}`}
              title="Real-World People Talk View"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">People Talk</span>
            </button>
          </div>

          <button
            onClick={downloadCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
            title="Download Excel / CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-950/60">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mb-2" />
          <p className="text-xs text-slate-400 font-mono">Assembling Canonical Persona Matrix…</p>
        </div>
      ) : viewMode === "table" ? (
        /* Excel Table View */
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900/90 sticky top-0 z-10 border-b border-slate-800 text-[11px] font-mono text-cyan-300 uppercase tracking-wider backdrop-blur-md">
                <tr>
                  <th className="py-3 px-3 sticky left-0 bg-slate-900/95 z-20 border-r border-slate-800 min-w-[130px]">
                    Planet & Sign
                  </th>
                  <th className="py-3 px-3 min-w-[180px]">House System & Arena</th>
                  <th className="py-3 px-3 min-w-[160px]">Decan Flavor & Face</th>
                  <th className="py-3 px-3 min-w-[200px]">Nakshatra Shakti (Expression)</th>
                  <th className="py-3 px-3 min-w-[180px]">Arabic Manzil Station</th>
                  <th className="py-3 px-3 min-w-[160px]">Dignity & Bounds</th>
                  <th className="py-3 px-3 min-w-[130px]">Shadbala Capacity</th>
                  <th className="py-3 px-3 min-w-[130px]">Bhava Bala Support</th>
                  <th className="py-3 px-3 min-w-[120px]">D9 Navamsha</th>
                  <th className="py-3 px-3 min-w-[150px]">Aspects & Geometry</th>
                  <th className="py-3 px-3 min-w-[240px]">Charisma Archetype & Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredMatrix.map(trait => {
                  const symbol = PLANET_SYMBOLS[trait.planet] || "✦";
                  return (
                    <tr
                      key={trait.planet}
                      onClick={() => setSelectedPlanet(trait)}
                      className="hover:bg-cyan-950/20 cursor-pointer transition-colors group"
                    >
                      {/* Planet & Sign (Sticky Column) */}
                      <td className="py-2.5 px-3 sticky left-0 bg-slate-950/95 group-hover:bg-slate-900/95 z-10 border-r border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                            {symbol}
                          </span>
                          <div>
                            <span className="font-bold text-white block text-xs">{trait.planet}</span>
                            <span className="text-[10px] text-cyan-400 font-mono block">
                              {trait.formattedPosition}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* House Arena */}
                      <td className="py-2.5 px-3 text-slate-300">
                        <span className="font-semibold text-white block">House {trait.house}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-2">{trait.houseArena}</span>
                      </td>

                      {/* Decan Flavor */}
                      <td className="py-2.5 px-3 text-slate-300">
                        <span className="text-[11px] font-medium text-amber-200 block">{trait.decanFlavor}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Face: {trait.chaldeanFaceRuler}</span>
                      </td>

                      {/* Nakshatra Expression */}
                      <td className="py-2.5 px-3 text-slate-300">
                        <span className="font-semibold text-cyan-200 block">
                          {trait.nakshatraName} (P{trait.nakshatraPada})
                        </span>
                        <span className="text-[10px] text-slate-400 block">Deity: {trait.nakshatraDeity}</span>
                        <span className="text-[10px] text-slate-300 italic line-clamp-1">Shakti: {trait.nakshatraShakti}</span>
                      </td>

                      {/* Arabic Manzil Station */}
                      <td className="py-2.5 px-3 text-slate-300">
                        <span className="font-semibold text-indigo-300 block">{trait.manzilName}</span>
                        <span className="text-[10px] text-slate-400 italic block">{trait.manzilEnglish}</span>
                        <span className="text-[10px] text-slate-300 line-clamp-1">{trait.manzilStationRole}</span>
                      </td>

                      {/* Dignity & Bounds */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold block w-fit mb-1 ${
                            trait.sovereigntyTier.startsWith("High")
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : trait.sovereigntyTier.startsWith("Friction")
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-slate-900 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {trait.sovereigntyTier.split("/")[0].trim()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {trait.boundsEgyptian}
                        </span>
                      </td>

                      {/* Shadbala */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs font-bold text-slate-100 block">
                          {trait.shadbalaVirupas} virupas
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            trait.shadbalaStatus.startsWith("Robust") ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {trait.shadbalaStatus} ({(trait.shadbalaAdequacyRatio * 100).toFixed(0)}%)
                        </span>
                      </td>

                      {/* House Strength */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs text-slate-200 block">
                          {trait.houseStrengthVirupas} virupas
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono capitalize">
                          {trait.houseSupportTier.replace(/-/g, " ")}
                        </span>
                      </td>

                      {/* Navamsha D9 */}
                      <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                        {trait.navamshaD9}
                      </td>

                      {/* Aspects */}
                      <td className="py-2.5 px-3 text-slate-300">
                        {trait.activeAspects.length ? (
                          <div className="space-y-0.5">
                            {trait.activeAspects.slice(0, 2).map((a, idx) => (
                              <span key={idx} className="block text-[10px] font-mono text-cyan-300">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Independent</span>
                        )}
                      </td>

                      {/* Charisma Archetype & Profile */}
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-white text-xs block mb-0.5">
                          {trait.personaArchetype}
                        </span>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {trait.charismaProfile}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === "cards" ? (
        /* Persona Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatrix.map(trait => {
            const symbol = PLANET_SYMBOLS[trait.planet] || "✦";
            return (
              <div
                key={trait.planet}
                onClick={() => setSelectedPlanet(trait)}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/40 cursor-pointer transition-all shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-base flex items-center justify-center font-bold">
                      {symbol}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{trait.planet} — {trait.personaArchetype}</h4>
                      <span className="text-xs text-cyan-400 font-mono">
                        {trait.formattedPosition} · House {trait.house}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      trait.sovereigntyTier.startsWith("High")
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-slate-900 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {trait.shadbalaVirupas}v
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {trait.charismaProfile}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase">Decan & Face</span>
                    <span className="text-amber-300 truncate block">{trait.decanFlavor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Nakshatra & Deity</span>
                    <span className="text-cyan-300 truncate block">{trait.nakshatraName} ({trait.nakshatraDeity})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Manzil Station</span>
                    <span className="text-indigo-300 truncate block">{trait.manzilName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Navamsha D9</span>
                    <span className="text-slate-300 truncate block">{trait.navamshaD9}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "people-talk" ? (
        /* Real-World People Talk View */
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs text-cyan-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">The Calculations Go On In The Background</p>
              <p className="text-slate-300 mt-0.5">
                The spreadsheet has all the raw math—degrees, virupas, bounds, and Mansions. Here is the astrologer's job done with care: translating every placement into what it actually means for your life, relationships, strengths, and practical decisions in plain English.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatrix.map(trait => {
              const symbol = PLANET_SYMBOLS[trait.planet] || "✦";
              const realWorld = buildRealWorldTranslation(trait);
              return (
                <div
                  key={trait.planet}
                  onClick={() => setSelectedPlanet(trait)}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-cyan-500/40 cursor-pointer transition-all shadow-lg space-y-3.5 group"
                >
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-base flex items-center justify-center font-bold">
                        {symbol}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {trait.planet} — {trait.personaArchetype}
                        </h4>
                        <span className="text-xs text-cyan-400 font-mono">
                          {trait.formattedPosition} · House {trait.house} ({trait.sign})
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed italic border-l-2 border-cyan-500/50 pl-3">
                    "{realWorld.conversationalProse}"
                  </p>

                  <div className="space-y-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                        ✦ Your Real-World Superpower
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        {realWorld.strengthAndPower}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                        ⚠ The Trap / Shadow To Watch For
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        {realWorld.humanChallenge}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                        ★ Grounded Next Step
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                        {realWorld.growthAction}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Selected Planet Detail Modal / Drawer */}
      {selectedPlanet && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xl flex items-center justify-center font-bold">
                  {PLANET_SYMBOLS[selectedPlanet.planet] || "✦"}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedPlanet.planet} · {selectedPlanet.personaArchetype}
                  </h3>
                  <p className="text-xs text-cyan-400 font-mono">
                    {selectedPlanet.formattedPosition} · House {selectedPlanet.house} ({selectedPlanet.houseArena})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                Close
              </button>
            </div>

            {/* Charisma Narrative */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                Integrated Charismatic Persona
              </span>
              <p className="text-sm text-slate-100 leading-relaxed font-medium">
                {selectedPlanet.charismaProfile}
              </p>
            </div>

            {/* Methods Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  House System Arena
                </span>
                <span className="font-semibold text-white">House {selectedPlanet.house}</span>
                <p className="text-[11px] text-slate-300">{selectedPlanet.houseArena}</p>
                <span className="text-[10px] text-cyan-400 font-mono block">
                  Support: {selectedPlanet.houseStrengthVirupas}v ({selectedPlanet.houseSupportTier})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Decan Flavor & Chaldean Face
                </span>
                <span className="font-semibold text-amber-200">{selectedPlanet.decanFlavor}</span>
                <p className="text-[11px] text-slate-300">Chaldean Face: {selectedPlanet.chaldeanFaceRuler}</p>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Terms: {selectedPlanet.boundsEgyptian}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Nakshatra Shakti & Expression
                </span>
                <span className="font-semibold text-cyan-200">
                  {selectedPlanet.nakshatraName} (Pada {selectedPlanet.nakshatraPada})
                </span>
                <p className="text-[11px] text-slate-300">Deity: {selectedPlanet.nakshatraDeity}</p>
                <p className="text-[11px] text-slate-300 italic">Shakti: {selectedPlanet.nakshatraShakti}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Arabic Manzil Station
                </span>
                <span className="font-semibold text-indigo-200">{selectedPlanet.manzilName}</span>
                <p className="text-[11px] text-slate-400 italic">"{selectedPlanet.manzilEnglish}"</p>
                <p className="text-[11px] text-slate-300">{selectedPlanet.manzilStationRole}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Sovereignty & Dignity
                </span>
                <span className="font-semibold text-emerald-300">{selectedPlanet.sovereigntyTier}</span>
                <p className="text-[11px] text-slate-300">
                  Dignities: {selectedPlanet.essentialDignities.join(", ") || "None"}
                </p>
                <p className="text-[11px] text-slate-300">
                  Debilities: {selectedPlanet.essentialDebilities.join(", ") || "None"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Shadbala Planetary Strength
                </span>
                <span className="font-semibold text-cyan-300 font-mono">
                  {selectedPlanet.shadbalaVirupas} virupas
                </span>
                <p className="text-[11px] text-slate-300">
                  Status: {selectedPlanet.shadbalaStatus} ({(selectedPlanet.shadbalaAdequacyRatio * 100).toFixed(0)}% adequacy)
                </p>
                <span className="text-[10px] text-slate-400 font-mono block">
                  D9: {selectedPlanet.navamshaD9}
                </span>
              </div>
            </div>

            {/* Aspects & Timing */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1 text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Active Dialogue & Timing Window
              </span>
              <p className="text-slate-300 font-mono text-[11px]">
                {selectedPlanet.activeAspects.length ? selectedPlanet.activeAspects.join(" • ") : "Independent placement with no major Ptolemaic aspects in tight orb."}
              </p>
              <p className="text-cyan-400 font-mono text-[11px] pt-1">
                Vimshottari Role: {selectedPlanet.activeDashaRole}
              </p>
              {selectedPlanet.fixedStarContact && (
                <p className="text-amber-300 font-mono text-[11px]">
                  Fixed Star: {selectedPlanet.fixedStarContact}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
