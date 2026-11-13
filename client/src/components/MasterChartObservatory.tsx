import React, { useState } from "react";
import {
  Compass,
  Layers,
  Sparkles,
  Star,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sliders,
  Shield,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Orbit,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";
import type { UnifiedMasterChartSnapshot } from "../../../server/masterChart/types";

export interface MasterChartObservatoryProps {
  chart: ChartResult;
  onSelectBody?: (bodyName: string) => void;
}

export function MasterChartObservatory({ chart, onSelectBody }: MasterChartObservatoryProps) {
  const [viewMode, setViewMode] = useState<"agent" | "god" | "dual">("dual");
  const [activeTradition, setActiveTradition] = useState<
    "all" | "vedic" | "hellenistic" | "stars" | "arabic" | "decans" | "chinese" | "kabbalah"
  >("all");
  const [showLedger, setShowLedger] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const masterChartQuery = trpc.hybrid.masterChart.useMutation();

  const [snapshot, setSnapshot] = useState<UnifiedMasterChartSnapshot | null>(null);

  React.useEffect(() => {
    masterChartQuery.mutate(
      {
        location: chart.input.location,
        latitude: chart.input.latitude,
        longitude: chart.input.longitude,
        timezone: chart.input.timezone,
        date: chart.input.date,
        time: chart.input.time,
        transitDate: chart.transitDate,
        mode: chart.readingScope === "transit" ? "transit" : chart.readingScope === "combined" ? "combined" : "natal",
      },
      {
        onSuccess: data => {
          setSnapshot(data as unknown as UnifiedMasterChartSnapshot);
        },
      }
    );
  }, [chart.input.date, chart.input.time, chart.input.location, chart.readingScope]);

  if (masterChartQuery.isPending && !snapshot) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-md">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-cyan-100">Compiling Unified Master Chart Snapshot…</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Executing 16 canonical method layers across Hellenistic, Vedic Jyotish, Babylonian Fixed Stars, Hermetic Lots, Arabic Manazil, and Sefer Yetzirah.
        </p>
      </div>
    );
  }

  const snap = snapshot;
  if (!snap) return null;

  const planets = snap.baseCelestialState.planets;
  const filteredLedger = snap.methodExecutionLedger.filter(
    l =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.technique.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tradition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Provenance Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Authoritative Master Chart
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/50">
                ID: {snap.snapshotId}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
              {snap.inputs.locationContext.location}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              Event UTC: {snap.baseCelestialState.utc} • Equal House Ascendant Anchor: {snap.agentView.ascendantAnchor}
            </p>
          </div>

          {/* Frame View Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => setViewMode("dual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "dual"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Dual Frame
            </button>
            <button
              onClick={() => setViewMode("agent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "agent"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Agent View
            </button>
            <button
              onClick={() => setViewMode("god")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "god"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              God View
            </button>
          </div>
        </div>

        {/* Validation summary bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {snap.validation.computedWithResultCount} Executed Layers
            </span>
            <span className="text-slate-500">•</span>
            <span>1 Reference-Only (Chinese 28 Xiu)</span>
            <span className="text-slate-500">•</span>
            <span>Zero Omitted Methods</span>
          </div>
          <button
            onClick={() => setShowLedger(!showLedger)}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline flex items-center gap-1"
          >
            {showLedger ? "Hide Method Execution Ledger" : "Inspect Method Execution Ledger (16 Layers)"}
          </button>
        </div>
      </div>

      {/* Expandable Method Execution Ledger */}
      {showLedger && (
        <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/90 p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Full Method Execution Ledger</h3>
            </div>
            <input
              type="text"
              placeholder="Filter by method or tradition…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="p-2.5">Method Layer</th>
                  <th className="p-2.5">Tradition</th>
                  <th className="p-2.5">Frame</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Evidence Count</th>
                  <th className="p-2.5">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                {filteredLedger.map(layer => (
                  <tr key={layer.id} className="hover:bg-slate-900/50">
                    <td className="p-2.5 text-white font-sans font-medium">{layer.name}</td>
                    <td className="p-2.5 capitalize">{layer.tradition}</td>
                    <td className="p-2.5 uppercase text-[10px] text-slate-400">{layer.frame}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          layer.status === "computed-with-result"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : layer.status === "reference-only"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {layer.status}
                      </span>
                    </td>
                    <td className="p-2.5">{layer.evidenceIds.length}</td>
                    <td className="p-2.5 text-slate-500">{layer.calculationVersion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Planetary Placements Table across Frames */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Authoritative Planetary Placements</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {viewMode === "dual"
              ? "God View (Universal 1-12) vs. Agent View (Rising Equal House)"
              : viewMode === "god"
              ? "God View Cosmic Perspective"
              : "Agent View Local Experience"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Body</th>
                <th className="p-3">Longitude</th>
                {viewMode !== "god" && <th className="p-3">Agent House</th>}
                {viewMode !== "agent" && <th className="p-3">God House</th>}
                {viewMode === "dual" && <th className="p-3">Frame Relationship</th>}
                <th className="p-3">Motion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {planets.map(p => {
                const godPlacement = snap.godView.placements.find(g => g.body === p.name);
                const agentPlacement = snap.agentView.placements.find(a => a.body === p.name);
                const relationship = snap.agentView.frameRelationships.find(r => r.body === p.name);

                return (
                  <tr
                    key={p.name}
                    onClick={() => onSelectBody?.(p.name)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {p.name}
                    </td>
                    <td className="p-3 font-mono text-cyan-300">{p.display}</td>
                    {viewMode !== "god" && (
                      <td className="p-3 font-mono text-slate-300">House {agentPlacement?.agentHouse ?? p.house}</td>
                    )}
                    {viewMode !== "agent" && (
                      <td className="p-3 font-mono text-indigo-300">House {godPlacement?.godHouse ?? p.godHouse}</td>
                    )}
                    {viewMode === "dual" && (
                      <td className="p-3 text-[11px] text-slate-400 font-mono">
                        {relationship ? relationship.relationship : "Direct Alignment"}
                      </td>
                    )}
                    <td className="p-3">
                      {p.retrograde ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                          Retrograde
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400">
                          Direct
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Tradition Tabs Explorer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Traditions & Overlay Dimensions
          </h3>
          <div className="flex flex-wrap gap-1">
            {[
              { id: "all", label: "All Layers" },
              { id: "vedic", label: "Vedic Jyotish" },
              { id: "hellenistic", label: "Hellenistic" },
              { id: "stars", label: "Fixed Stars" },
              { id: "arabic", label: "Arabic Lots & Manazil" },
              { id: "decans", label: "Decans" },
              { id: "chinese", label: "Chinese 28 Xiu" },
              { id: "kabbalah", label: "Kabbalah" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTradition(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTradition === tab.id
                    ? "bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vedic Nakshatras & Vargas */}
          {(activeTradition === "all" || activeTradition === "vedic") && (
            <div className="p-4 rounded-xl border border-indigo-950 bg-slate-900/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                Vedic Nakshatras (27 Mansions) & Vargas
              </h4>
              <div className="space-y-2 text-xs">
                {(snap.layers["vedic-nakshatras-and-padas"]?.results as any[])?.slice(0, 4).map((n: any) => (
                  <div key={n.body} className="p-2 rounded bg-slate-950/70 border border-slate-800 flex justify-between">
                    <div>
                      <span className="font-semibold text-white">{n.body}</span> in{" "}
                      <span className="text-indigo-300 font-medium">{n.name}</span> (Pada {n.pada})
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">Lord: {n.planetaryLord}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arabic Hermetic Lots */}
          {(activeTradition === "all" || activeTradition === "arabic") && (
            <div className="p-4 rounded-xl border border-amber-950 bg-slate-900/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Hermetic & Arabic Lots
              </h4>
              <div className="space-y-2 text-xs">
                {(snap.layers["arabic-hermetic-lots"]?.results as any[])?.slice(0, 4).map((l: any) => (
                  <div key={l.key} className="p-2 rounded bg-slate-950/70 border border-slate-800 flex justify-between">
                    <div>
                      <span className="font-semibold text-white">{l.name}</span>
                    </div>
                    <span className="text-amber-300 font-mono text-[11px]">{l.display} (H{l.house})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixed Stars & Royal Watchers */}
          {(activeTradition === "all" || activeTradition === "stars") && (
            <div className="p-4 rounded-xl border border-cyan-950 bg-slate-900/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                Polaris Axis & Royal Watchers of Persia
              </h4>
              <div className="space-y-2 text-xs">
                {(snap.layers["fixed-stars-royal-watchers"]?.results as any[])?.slice(0, 4).map((s: any) => (
                  <div key={s.name} className="p-2 rounded bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-white">{s.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">({s.display})</span>
                    </div>
                    <span className="text-xs text-cyan-300 font-mono">
                      {s.contacts.length > 0
                        ? `Conjunction: ${s.contacts.map((c: any) => `${c.body} (${c.orb} deg)`).join(", ")}`
                        : "No Direct Orb Contact"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sefer Yetzirah / Kabbalah */}
          {(activeTradition === "all" || activeTradition === "kabbalah") && (
            <div className="p-4 rounded-xl border border-purple-950 bg-slate-900/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Sefer Yetzirah 7 Double Letters & Contraries
              </h4>
              <p className="text-xs text-slate-300">
                Planets as living gates holding contrary pairs (wisdom/folly, wealth/poverty, peace/war, beauty/disrepute, power/servitude).
              </p>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 font-mono">
                32 Paths Architecture: 10 Sefirot + 22 Hebrew Letters (3 Mothers, 7 Doubles, 12 Simples)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
