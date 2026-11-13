import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Compass, Orbit, Star } from "lucide-react";
import { placementRows } from "@shared/placementMiniReadings";
import { normalizeLongitude, overlay } from "@shared/hybrid";
import { readingProse } from "@shared/readingProse";
import {
  usePlacementMiniReadings,
  MiniReadingContent,
  PlacementMiniReading,
} from "./PlacementMiniReading";
import type { ChartResult } from "../../../server/astronomy";

const SABIAN_SYMBOLS: Record<string, string> = {
  "0": "A woman rises out of the water; a seal rises and embraces her",
  "1": "A comedian revealing human nature",
  "2": "A cameo profile of a man in the outline of his country",
  "3": "Two lovers strolling on a secluded walk",
  "4": "A triangle with golden wings",
  "5": "A square brightly lighted on one side",
  "6": "A man expressing himself successfully in two realms at once",
  "7": "A large hat with streamers flying, facing east",
  "8": "A crystal gazer concentrated on visions",
  "9": "A teacher giving new symbolic forms to traditional images",
  "10": "A flock of white geese flying high",
  "15": "An Indian weaving a ceremonial blanket",
  "20": "A pugilist entering the ring",
  "25": "A man possessed of more gifts than he can hold",
  "29": "A celestial choir singing in harmonious unison",
};

export function SystematicDeconstruction({
  chart,
  mode = "natal",
  onInterpretBody,
}: {
  chart: ChartResult;
  mode?: "natal" | "transit" | "combined";
  onInterpretBody?: (name: string) => void;
}) {
  const result = usePlacementMiniReadings(chart);
  const completeReading =
    result.data && "methodOutcomes" in result.data ? result.data : undefined;
  const [filter, setFilter] = useState("All");
  const rows = placementRows(chart).filter(
    row =>
      filter === "All" ||
      (filter === "Luminaries"
        ? ["Sun", "Moon"].includes(row.name)
        : filter === "Nodes"
          ? row.name.endsWith("Node")
          : ["Ascendant", "Descendant"].includes(row.name))
  );

  return (
    <section aria-label="Planetary placement meanings" className="space-y-5">
      <header>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
            Multi-Tradition Synthesis
          </span>
        </div>
        <h2 className="mt-1 font-serif text-2xl font-bold text-white">
          Your placement mini readings
        </h2>
        <p className="mt-1.5 text-sm text-slate-300">
          One connected reading for each placement, weaving together its house, Vedic Nakshatra, Arabic Manzil, elemental decan, and dignity.
        </p>
      </header>

      {result.isPending && (
        <p role="status" className="text-sm text-cyan-200">
          Synthesizing your placement summaries…
        </p>
      )}

      {result.error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/40 p-4 text-rose-200"
        >
          <p>Placement summaries could not be completed.</p>
          <p className="mt-2 break-words text-sm">{result.error.message}</p>
          <button
            type="button"
            onClick={() => result.refetch()}
            className="mt-3 rounded-lg border border-rose-300/40 px-3 py-2 text-sm hover:bg-rose-900/30"
          >
            Retry summaries
          </button>
        </div>
      )}

      {completeReading && (
        <section
          aria-label="Complete method synthesis"
          className="space-y-4 rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-slate-950 via-[#0a1120] to-indigo-950/40 p-4 sm:p-5 shadow-lg"
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Unified Astrological Synthesis
              </p>
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-white">
              Executive Blueprint Interpretation
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              Cross-traditional synthesis weaving 16+ calculation methods across ancient civilizations into your dominant life trajectory.
            </p>
          </div>

          <p className="rounded-xl border border-cyan-500/25 bg-slate-900/60 p-4 text-sm leading-relaxed text-slate-100 font-medium">
            {readingProse(completeReading.dominantConclusion)}
          </p>

          <details className="group rounded-xl border border-white/10 bg-black/25 p-3.5 transition-all">
            <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold uppercase tracking-wider text-cyan-200 hover:text-cyan-100">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  Inspect 16+ Method Ledger & Calculation Proofs ({completeReading.methodOutcomes.length} Layers Evaluated)
                </span>
              </span>
              <span className="text-[11px] font-normal text-slate-400 group-open:hidden">
                View Ledger
              </span>
              <span className="text-[11px] font-normal text-slate-400 hidden group-open:inline">
                Hide Ledger
              </span>
            </summary>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-400 leading-5">
                The planetary cards below provide your synthesized placement readings. This technical ledger records the underlying calculation proofs, traditional mechanisms, and evidence IDs for each evaluated method layer.
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                {completeReading.methodOutcomes.map(outcome => (
                  <article
                    key={outcome.methodId}
                    className="rounded-xl border border-white/10 bg-black/35 p-3.5 space-y-2"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-white text-sm">
                          {outcome.methodName}
                        </h4>
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-cyan-200/75">
                          {outcome.tradition} · {outcome.chartScope} · {outcome.frame}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                          outcome.status === "interpreted"
                            ? "border-emerald-300/30 text-emerald-200"
                            : "border-amber-300/30 text-amber-200"
                        }`}
                      >
                        {outcome.status}
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-slate-200 whitespace-pre-line">
                      {readingProse(outcome.judgment)}
                    </p>
                    <p className="text-[11px] leading-4 text-slate-400">
                      <span className="font-semibold text-slate-300">Contribution:</span>{" "}
                      {readingProse(outcome.contribution)}
                    </p>
                    {outcome.strengthAndLimitations.length > 0 && (
                      <p className="text-[11px] leading-4 text-slate-500">
                        <span className="font-semibold text-slate-400">Limits:</span>{" "}
                        {outcome.strengthAndLimitations.join(" · ")}
                      </p>
                    )}
                    <p className="text-[10px] leading-3 text-slate-600 font-mono">
                      Evidence: {outcome.evidenceIds.join(", ") || "none"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </details>
        </section>
      )}

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter placements"
      >
        {["All", "Luminaries", "Angles", "Nodes"].map(value => (
          <button
            type="button"
            key={value}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
              filter === value
                ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-amber-300/10 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                : "border-white/10 bg-[#070c18]/80 text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <motion.div 
        layout
        className="grid gap-4 md:grid-cols-2"
      >
        <AnimatePresence mode="popLayout">
          {rows.map((body, index) => {
            const summary = result.data?.placements.find(
              p => p.name === body.name
            );
            const L = normalizeLongitude(body.longitude);
            const ov = overlay(L);
            const degInSign = Math.floor(L % 30);
            const sabianDegree = degInSign + 1;
            const sabianText = SABIAN_SYMBOLS[String(degInSign)] || `Degree ${sabianDegree} archetypal symbol`;

            return (
              <motion.article
                key={body.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
                className="group relative space-y-3.5 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b1325]/90 via-[#070c18]/95 to-[#040812] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:border-amber-400/30 hover:shadow-[0_12px_40px_rgba(251,191,36,0.08)]"
              >
                {/* Subtle top ambient sheen */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent" />

                <header className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/5 text-amber-300 text-xs font-serif font-bold shadow-inner">
                        {body.name.slice(0, 2)}
                      </span>
                      <h3 className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-amber-100 transition-colors">
                        {body.name} · {body.display}
                      </h3>
                    </div>
                    {body.retrograde && (
                      <span className="rounded-full border border-rose-400/30 bg-rose-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                        Retrograde
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-amber-300/80">
                    House {body.house}
                    {body.agentHouse != null && body.godHouse != null
                      ? ` · Agent H${body.agentHouse} / God H${body.godHouse}`
                      : ""}
                  </p>

                  {/* Multi-tradition badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-md border border-violet-400/20 bg-violet-950/30 px-2 py-0.5 text-[10px] font-medium text-violet-200 shadow-sm">
                      Nakshatra: {ov.nakshatra} (P{ov.pada} · {ov.nakshatraRuler})
                    </span>
                    <span className="rounded-md border border-amber-400/20 bg-amber-950/30 px-2 py-0.5 text-[10px] font-medium text-amber-200 shadow-sm">
                      Manzil: {ov.manzil}
                    </span>
                    <span className="rounded-md border border-cyan-400/20 bg-cyan-950/30 px-2 py-0.5 text-[10px] font-medium text-cyan-200 shadow-sm">
                      Decan: {ov.decan}
                    </span>
                    <span
                      className="rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                      title={sabianText}
                    >
                      Sabian {sabianDegree}°
                    </span>
                  </div>
                </header>

                {summary ? (
                  <MiniReadingContent summary={summary} />
                ) : ["Sun", "Moon"].includes(body.name) ? (
                  !result.error && (
                    <p role="status" className="text-xs text-amber-200/80 flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      Weaving {body.name}’s soul reading…
                    </p>
                  )
                ) : (
                  <PlacementMiniReading
                    chart={chart}
                    name={body.name}
                    autoGenerate={false}
                  />
                )}

                {onInterpretBody && (
                  <button
                    type="button"
                    onClick={() => onInterpretBody(body.name)}
                    className="pt-1 text-xs font-semibold text-cyan-300/80 underline decoration-cyan-400/30 underline-offset-4 hover:text-cyan-200 transition-colors"
                  >
                    Inspect {body.name} calculations
                  </button>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
