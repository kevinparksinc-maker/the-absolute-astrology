import { SystematicDeconstruction } from "./SystematicDeconstruction";
import { ChartMethodOutcomes } from "./ChartMethodOutcomes";
import { MasterSynthesizerPanel } from "./MasterSynthesizerPanel";
import React, { useState, useMemo } from "react";
import { TechniqueAuditDashboard } from "./TechniqueAuditDashboard";
import { Link } from "wouter";
import {
  BookOpen,
  ChevronDown,
  CircleDot,
  Compass,
  Diamond,
  Eye,
  Flame,
  Globe,
  Grid,
  Layers,
  Moon,
  Orbit,
  Scale,
  Sparkles,
  Star,
  Sun,
  UserRound,
  Zap,
} from "lucide-react";
import { GuardianDiamondCharts } from "@/components/GuardianDiamondCharts";
import { ChartWheel } from "@/components/ChartWheel";
import { CompletePlacementsTable } from "@/components/CompletePlacementsTable";
import { FocusedPlacementReading } from "@/components/FocusedPlacementReading";
import { FixedStarIntensityVisualizer } from "@/components/FixedStarIntensityVisualizer";
import type { ChartResult, ChartRow } from "../../../server/astronomy";
import type { ReadingScope, Worldview } from "../../../server/astrologyCore";

export type ProfileChartScreenProps = {
  chart: ChartResult | null;
  calculating: boolean;
  worldview: Worldview;
  readingMode: ReadingScope;
  onWorldviewChange: (value: Worldview) => void;
  onReadingModeChange: (value: ReadingScope) => void;
  error?: string;
};

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const ELEMENT_MAP: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

const MODALITY_MAP: Record<string, "Cardinal" | "Fixed" | "Mutable"> = {
  Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable", Cancer: "Cardinal",
  Leo: "Fixed", Virgo: "Mutable", Libra: "Cardinal", Scorpio: "Fixed",
  Sagittarius: "Mutable", Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable",
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

function signAt(lon: number | undefined): string {
  if (typeof lon !== "number" || !Number.isFinite(lon)) return "Unavailable";
  const norm = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(norm / 30)];
}

function degreeFmt(lon: number): string {
  const norm = ((lon % 360) + 360) % 360;
  const within = norm % 30;
  const deg = Math.floor(within);
  const min = Math.floor((within - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

export function ProfileChartScreen({
  chart,
  calculating,
  worldview,
  readingMode,
  onWorldviewChange,
  onReadingModeChange,
  error,
}: ProfileChartScreenProps) {
  // Toggle between Circular Wheel (Default) and North Indian Diamond
  const [chartViewMode, setChartViewMode] = useState<"wheel" | "diamond">("wheel");
  const [interpretBody, setInterpretBody] = useState<string | null>(null);

  const sun = chart?.movingBodies.find(b => b.name === "Sun");
  const moon = chart?.movingBodies.find(b => b.name === "Moon");
  const asc = chart?.ascendant;

  // Elemental & Modality counts
  const balance = useMemo(() => {
    if (!chart) return null;
    const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const modalities = { Cardinal: 0, Fixed: 0, Mutable: 0 };
    chart.movingBodies.forEach(b => {
      if (!b) return;
      const sign = signAt(b.longitude);
      const el = ELEMENT_MAP[sign];
      const mod = MODALITY_MAP[sign];
      if (el) elements[el]++;
      if (mod) modalities[mod]++;
    });
    return { elements, modalities };
  }, [chart]);

  if (!chart) {
    return (
      <section role="status" className="mx-auto max-w-4xl rounded-2xl border border-amber-300/30 bg-slate-950/80 p-8 text-center text-amber-100">
        <h1 className="font-serif text-2xl font-bold">Your Calculated Diamond Chart</h1>
        <p className="mt-2 text-sm text-slate-300">
          {calculating ? "Calculating exact Swiss Ephemeris astronomical positions…" : "Chart data currently unavailable."}
        </p>
        {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 pt-2 text-slate-100">
      {/* Header & Controls */}
      <section aria-label="Chart Controls" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Orbit className="h-4 w-4 text-cyan-300" />
              <span className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-300">
                Natal Celestial Observatory
              </span>
            </div>
            <h1 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
              Birth Chart & Planetary Map
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Precise 360° celestial geometry anchored to your birth moment with complete planetary placements below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-400/10 px-3.5 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/20"
            >
              <UserRound size={14} />
              <span>Edit Birth Data</span>
            </Link>
            <Link
              href="/energy"
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/15 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/25"
            >
              <Zap size={14} />
              <span>Live Energy Read</span>
            </Link>
            <Link
              href="/reading"
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/40 bg-violet-400/15 px-3.5 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-400/25"
            >
              <BookOpen size={14} />
              <span>Full Reading</span>
            </Link>
          </div>
        </div>

        {/* View Switchers: Wheel vs Diamond & God vs Agent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#080B14]/90 p-3 shadow-md">
          {/* Chart Wheel Projection Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#101628] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setChartViewMode("wheel")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                chartViewMode === "wheel"
                  ? "bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Orbit size={15} />
              <span>Circular Wheel & Map (Default)</span>
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode("diamond")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                chartViewMode === "diamond"
                  ? "bg-[#D9B66F]/20 text-[#D9B66F] border border-[#D9B66F]/40 shadow-[0_0_12px_rgba(217,182,111,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Diamond size={15} />
              <span>North Indian Diamond</span>
            </button>
          </div>

          {/* God View vs Agent View Toggle */}
          <div className="flex items-center gap-1 bg-[#101628] p-1 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 font-mono">Frame:</span>
            <button
              type="button"
              onClick={() => onWorldviewChange("agent")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                worldview === "agent"
                  ? "bg-indigo-500/25 text-indigo-200 border border-indigo-400/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Agent View (Ascendant Houses)
            </button>
            <button
              type="button"
              onClick={() => onWorldviewChange("god")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                worldview === "god"
                  ? "bg-[#D9B66F]/25 text-[#D9B66F] border border-[#D9B66F]/40 shadow-[0_0_12px_rgba(217,182,111,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              God View (Cosmic Invariant)
            </button>
          </div>
        </div>
      </section>

      {/* Main Chart Graphic Display */}
      <section aria-label="Main Chart Visualizer">
        {chartViewMode === "wheel" ? (
          <ChartWheel chart={chart} />
        ) : (
          <GuardianDiamondCharts chart={chart} />
        )}
      </section>

      {/* Complete Planetary Placements Table Directly Underneath */}
      <CompletePlacementsTable chart={chart} />

      <SystematicDeconstruction chart={chart} mode="natal" onInterpretBody={setInterpretBody} />

      {/* Expanded placement evidence */}
      {interpretBody && (
        <section className="rounded-2xl border border-violet-400/40 bg-slate-950/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-violet-100">{interpretBody} — Master Interpretation</h2>
              <p className="text-xs text-slate-400">Deep esoteric synthesis across both reference frames</p>
            </div>
            <button
              type="button"
              onClick={() => setInterpretBody(null)}
              className="rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-300 hover:text-white"
            >
              Close
            </button>
          </div>
          <FocusedPlacementReading chart={chart} name={interpretBody} />
        </section>
      )}

      <ChartMethodOutcomes chart={chart} mode={readingMode} />
      <section aria-label="Whole-chart synthesis" className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-white">Your whole-chart synthesis</h2>
        <p className="text-sm text-slate-300">The individual outcomes above now come together in one connected reading.</p>
        <MasterSynthesizerPanel chart={chart} mode={readingMode} />
      </section>
      <TechniqueAuditDashboard chart={chart} />
      {/* Fixed Star Intensity Visualizer */}
      <section aria-label="Fixed Star Visualizer">
        <FixedStarIntensityVisualizer chart={chart} />
      </section>
    </div>
  );
}
