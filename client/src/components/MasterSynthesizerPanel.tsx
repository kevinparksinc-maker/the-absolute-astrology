import { readingProse } from "@shared/readingProse";
import { useLocation } from "wouter";
import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Flame,
  Star,
  RefreshCw,
  Search,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";
import { PlanetPersonaMatrixSpreadsheet } from "./PlanetPersonaMatrixSpreadsheet";
import { InteractiveNatalCompanion } from "./InteractiveNatalCompanion";
import { Table, MessageSquare } from "lucide-react";

export interface MasterSynthesizerPanelProps {
  chart: ChartResult;
  presentation?: "summary" | "full" | "evidence";
  initialQuestion?: string;
  mode?: "natal" | "transit" | "combined";
}

export function MasterSynthesizerPanel({
  chart,
  initialQuestion,
  presentation = "full",
  mode,
}: MasterSynthesizerPanelProps) {
  const [, navigate] = useLocation();
  const [question, setQuestion] = useState(
    initialQuestion || "What is my core life trajectory, purpose, and highest calling?"
  );
  const [activeTab, setActiveTab] = useState<"story" | "chat" | "matrix" | "evidence">("story");
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(null);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(presentation === "evidence");
  const [activeEvidenceFilter, setActiveEvidenceFilter] = useState<string | null>(null);

  const synthesizeMutation = trpc.interpretation.masterSynthesize.useMutation();
  const [result, setResult] = useState<NonNullable<typeof synthesizeMutation.data> | null>(null);
  const requestVersion = React.useRef(0);
  const selectedMode = mode ?? chart.readingScope;

  const evidencePercent = result ? Math.round(result.qualityAudit.groundedRatio * 100) : 0;

  const handleSynthesize = (qToUse?: string) => {
    const version = ++requestVersion.current;
    setResult(null);
    synthesizeMutation.mutate(
      {
        ...chart.input,
        chart,
        worldview: chart.worldview,
        mode: selectedMode,
        question: qToUse ?? question,
      },
      {
        onSuccess: data => {
          if (version === requestVersion.current) setResult(data);
        },
      }
    );
  };

  React.useEffect(() => {
    if (initialQuestion) setQuestion(initialQuestion);
    handleSynthesize(initialQuestion || question);
    return () => { requestVersion.current += 1; };
  }, [chart, initialQuestion, selectedMode]);

  return (
    <div className="space-y-6">
      {/* Question / Inquiry Input */}
      <div className="p-4 rounded-2xl border border-cyan-500/30 bg-slate-950/80 shadow-lg backdrop-blur-md">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSynthesize();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <textarea
              rows={3}
              aria-label="Question for the Master Synthesizer"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask the Master Synthesizer regarding life purpose, timing, or direction…"
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={synthesizeMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            {synthesizeMutation.isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Synthesize
          </button>
        </form>
      </div>

      {synthesizeMutation.error && <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-950/30 p-4 text-sm text-rose-200">{synthesizeMutation.error.message} Your chart is preserved; use Synthesize to try again.</p>}

      {synthesizeMutation.isPending && !result && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-md">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-cyan-100">Generating Master Synthesis…</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Weaving Hellenistic, Vedic, Babylonian, and Hermetic evidence into an integrated human reading without tradition silos.
          </p>
        </div>
      )}

      {/* View Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("story")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "story"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Story Mode Reading
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "chat"
              ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm font-bold"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Astrologer Chat (Interactive AI)
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "matrix"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          Planet Persona Matrix (Excel Spreadsheet)
        </button>
        <button
          onClick={() => setActiveTab("evidence")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "evidence"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          18 Traditions Evidence & Tensions
        </button>
      </div>

      {activeTab === "chat" && (
        <InteractiveNatalCompanion chart={chart} mode={selectedMode} />
      )}

      {activeTab === "matrix" && (
        <PlanetPersonaMatrixSpreadsheet chart={chart} />
      )}

      {result && activeTab !== "matrix" && activeTab !== "chat" && (
        <div className="space-y-6">
          {activeTab === "story" && (
            <>
              {/* Executive Dominant Conclusion */}
              <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Star className="w-36 h-36 text-cyan-400" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Story Mode Synthesis
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {result.qualityAudit.passed ? `${evidencePercent}% Evidence Traced` : `Evidence Review Required · ${evidencePercent}% Traced`}
                  </span>
                </div>

                <p className="text-sm md:text-base leading-relaxed text-slate-100 font-medium">
                  {result.dominantConclusion}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <span className="font-mono text-[11px] text-slate-400">
                    Snapshot: {result.snapshotId} • Mode: {result.mode.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setActiveTab("matrix")}
                    className="text-cyan-400 hover:text-cyan-300 font-mono text-xs underline flex items-center gap-1"
                  >
                    View in Planet Persona Excel Spreadsheet →
                  </button>
                </div>
              </div>

              {/* Story Chapters */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Full Story Chapters
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {result.narrative.sections.length} Chapters Synthesized
                  </span>
                </div>

                <div className="space-y-4">
                  {result.narrative.sections.map(section => (
                    <div
                      key={section.id}
                      className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg space-y-3 transition-all hover:border-cyan-500/30"
                    >
                      <h4 className="text-sm font-bold text-cyan-100 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        {section.title}
                      </h4>
                      <div className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                        {readingProse(section.text)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "evidence" && (
            <>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  18-Tradition Method Contributions Ledger
                </h3>
                <div className="space-y-3">
                  {result.narrative.methodContributions.map(contribution => (
                    <div key={contribution.methodId} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <h4 className="text-xs font-semibold text-cyan-100">
                        {result.methodOutcomes.find(m => m.methodId === contribution.methodId)?.methodName ?? contribution.methodId}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">{contribution.contribution}</p>
                      <p className="mt-1 text-[10px] text-slate-500 font-mono">
                        Findings: {contribution.findingIds.join(", ") || "Active calculation"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Domain Themes Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Lived Human Domains & Multi-Tradition Corroboration
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {result.themes.length} Synthesized Spheres
                  </span>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.themes.map(theme => {
                const isExpanded = expandedThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg space-y-3 transition-all hover:border-cyan-500/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {theme.domain.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{theme.humanTheme}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold capitalize ${
                          theme.convergenceAssessment.corroborationLevel === "unanimous"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : theme.convergenceAssessment.corroborationLevel === "strong-corroboration"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            : "bg-slate-900 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {theme.convergenceAssessment.corroborationLevel.replace("-", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {theme.primaryConclusion}
                    </p>

                    {/* Convergence badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {theme.convergenceAssessment.independentTraditions.map(tr => (
                        <span
                          key={tr}
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-300"
                        >
                          {tr}
                        </span>
                      ))}
                    </div>

                    {/* Expandable deeper mechanics */}
                    <button
                      onClick={() => setExpandedThemeId(isExpanded ? null : theme.id)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono pt-1"
                    >
                      {isExpanded ? (
                        <>
                          Less detail <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Why, How & Concrete Manifestations <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                        <div>
                          <strong className="text-slate-400 uppercase tracking-wider text-[10px] block">
                            Mechanism & Causal Drivers
                          </strong>
                          <p className="text-slate-300 mt-0.5 font-mono text-[11px]">{theme.whyHow}</p>
                        </div>

                        <div>
                          <strong className="text-slate-400 uppercase tracking-wider text-[10px] block">
                            Consequence
                          </strong>
                          <p className="mt-1 whitespace-pre-line text-slate-300">{theme.consequences}</p>
                        </div>

                        <div>
                          <strong className="text-slate-400 uppercase tracking-wider text-[10px] block">
                            Deeper Meaning & Character Consequence
                          </strong>
                          <p className="text-slate-300 mt-0.5">{theme.deeperMeaning}</p>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400 font-mono">
                          <span>Evidence IDs:</span>
                          <span className="text-cyan-400">{theme.evidenceIds.join(", ")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paradox & Tension Reconciliation */}
          {result.contradictionsAndTensions.length > 0 && (
            <div className="rounded-2xl border border-amber-900/40 bg-slate-950/70 p-5 shadow-xl backdrop-blur-md space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Paradox & Tension Reconciliation
              </h3>
              <p className="text-xs text-slate-400">
                The Master Synthesizer does not flatten contradictory chart influences into false consensus; it shows how opposing forces build character through dynamic balance.
              </p>
              <div className="space-y-3">
                {result.contradictionsAndTensions.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5 text-xs">
                    <span className="font-semibold text-white block">{t.polarities}</span>
                    <p className="text-slate-300 leading-relaxed">{t.reconciliation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

              {/* Expandable "How was this calculated?" Evidence Drawer */}
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">How Was This Reading Calculated?</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-lg font-bold text-white font-mono">
                      {result.methodLedgerSummary.totalEvaluated}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Total Evaluated</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {result.methodLedgerSummary.computedWithResult}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Computed Active</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {result.methodLedgerSummary.referenceOnly}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Reference-Only</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-lg font-bold text-cyan-400 font-mono">{evidencePercent}%</span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Evidence Traced</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Claim-to-Evidence Trace Map
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.entries(result.evidenceTraceMap).map(([claim, ids]) => (
                      <div
                        key={claim}
                        className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-wrap justify-between items-center text-xs gap-2"
                      >
                        <span className="font-semibold text-slate-200 capitalize font-mono text-[11px]">
                          {claim.replace("theme-", "")}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ids.map(id => (
                            <span
                              key={id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800"
                            >
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
