import React, { useMemo } from "react";
import type { ChartResult } from "../../../server/astronomy";
import { calculateEnergyRead, calculateIndependentEnergyRead } from "@/lib/energyScoring";
import { getAtmosphereDescription } from "@/lib/energyInterpretations";
import { Shield, Sparkles, AlertTriangle, Clock, Sun, Moon, ArrowUpRight, Flame, HeartHandshake } from "lucide-react";

interface AlignEnergyBarometerProps {
  chart: ChartResult;
  personalScore: NonNullable<ReturnType<typeof calculateEnergyRead>>;
}

export function AlignEnergyBarometer({ chart, personalScore }: AlignEnergyBarometerProps) {
  // Environmental independent sky score
  const skyScore = useMemo(() => {
    return calculateIndependentEnergyRead(chart);
  }, [chart]);

  // Current Moon position in transit
  const transitMoon = useMemo(() => {
    return chart.transits?.find(t => t.name === "Moon");
  }, [chart]);

  const skyFlowPct = skyScore ? skyScore.flowPct : 50;
  const personalFlowPct = personalScore.flowPct;

  // Major vs Minor breakdown for personal contacts
  const majorContacts = useMemo(() => {
    return personalScore.contacts.filter(c => c.majorFactor === 1);
  }, [personalScore]);

  const minorContacts = useMemo(() => {
    return personalScore.contacts.filter(c => c.majorFactor < 1);
  }, [personalScore]);

  const majorWeight = useMemo(() => {
    return majorContacts.reduce((sum, c) => sum + c.strength, 0);
  }, [majorContacts]);

  const minorWeight = useMemo(() => {
    return minorContacts.reduce((sum, c) => sum + c.strength, 0);
  }, [minorContacts]);

  const totalWeight = majorWeight + minorWeight || 1;
  const majorPctOfForce = Math.round((majorWeight / totalWeight) * 100);
  const minorPctOfForce = 100 - majorPctOfForce;

  // Align 27 style Current Status
  const currentTimingStatus = useMemo(() => {
    if (personalFlowPct >= 62) {
      return {
        label: "GOLDEN FLOW TIME",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
        ringColor: "stroke-emerald-400",
        textColor: "text-emerald-400",
        advice: "Optimal window for meaningful conversations, signing agreements, bold initiatives, and creative expression.",
        doList: ["Schedule key meetings or negotiations", "Launch new ideas or creative efforts", "Express gratitude and strengthen bonds"],
        avoidList: ["Second-guessing positive momentum", "Procrastinating on important calls"],
      };
    }
    if (personalFlowPct <= 38) {
      return {
        label: "CAUTION & REST TIME",
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/40",
        ringColor: "stroke-rose-400",
        textColor: "text-rose-400",
        advice: "Planetary tension is elevated. Step into observer mode, postpone contentious negotiations, and nurture your energy.",
        doList: ["Solo strategy, research, and deep focus", "Meditation, physical release, and hydration", "Listening carefully before speaking"],
        avoidList: ["Impulsive accusations or venting", "Rushing financial commitments", "Forcing closure on ambiguous issues"],
      };
    }
    return {
      label: "DYNAMIC TRANSITION TIME",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      ringColor: "stroke-amber-400",
      textColor: "text-amber-300",
      advice: "A well-balanced, fast-moving energy. Momentum responds to organized focus; keep communications clear and grounded.",
      doList: ["Routine execution and cleaning up backlog", "Fact-finding and drafting proposals", "Pacing your physical commitments"],
      avoidList: ["Overcommitting your calendar", "Scattering focus across too many tasks"],
    };
  }, [personalFlowPct]);

  // Resonance comparison
  const resonanceVerdict = useMemo(() => {
    if (personalFlowPct >= 60 && skyFlowPct < 45) {
      return {
        headline: "Cosmic Shield Active",
        detail: "While the collective sky is experiencing heightened friction, your personal birth chart is catching harmonious angles. You have natural inner shelter today.",
        icon: Shield,
        color: "text-teal-300",
      };
    }
    if (personalFlowPct < 45 && skyFlowPct >= 60) {
      return {
        headline: "Personal Catalyst Active",
        detail: "The collective sky is generally calm, but a specific transit is hooking into a sensitive natal nerve. Treat this as a targeted personal breakthrough rather than outside drama.",
        icon: Flame,
        color: "text-rose-300",
      };
    }
    if (personalFlowPct >= 60 && skyFlowPct >= 60) {
      return {
        headline: "Double Harmonious Flow",
        detail: "Rare synchronization: both the outer collective atmosphere and your personal natal blueprint are flowing in alignment. Excellent for maximum traction.",
        icon: Sparkles,
        color: "text-emerald-300",
      };
    }
    return {
      headline: "Reflective Reset",
      detail: "Both the atmosphere and your chart encourage quiet recalibration. A day for steady maintenance rather than aggressive expansion.",
      icon: Clock,
      color: "text-amber-300",
    };
  }, [personalFlowPct, skyFlowPct]);

  const skyAtmosphere = getAtmosphereDescription(skyFlowPct, transitMoon?.display);

  return (
    <div className="space-y-6">
      {/* Real-time Status Card (Align 27 style Good Time / Bad Time status) */}
      <section
        aria-label="Real-time Timing Status"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#070B16_0%,#0E172E_60%,#081A2D_100%)] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${currentTimingStatus.badgeColor}`}>
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                {currentTimingStatus.label}
              </span>
              <span className="text-xs text-slate-400">Right Now</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              {currentTimingStatus.advice}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Based on the real-time angular collision between today's sky and your exact birth coordinates.
            </p>
          </div>

          {/* Quick Guidance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:max-w-md w-full">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-xs">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles size={14} /> Favorable Actions (Good Times)
              </span>
              <ul className="mt-2 space-y-1 text-slate-300 text-[11px]">
                {currentTimingStatus.doList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-3.5 text-xs">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Cautionary Traps (Rest Times)
              </span>
              <ul className="mt-2 space-y-1 text-slate-300 text-[11px]">
                {currentTimingStatus.avoidList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-rose-400">⚠</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL-CHANNEL READ: Environmental Sky vs Personal Connection */}
      <section
        aria-label="Environmental vs Personal Sky Duality"
        className="rounded-3xl border border-white/10 bg-[#080B14]/90 p-6 shadow-xl sm:p-7 space-y-6"
      >
        <div className="border-b border-white/10 pb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9B66F]">
            The Duality Principle (As in Align 27)
          </span>
          <h3 className="font-serif text-2xl font-bold text-white mt-1">
            Environmental Atmosphere vs. Your Personal Connection
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            The collective sky creates the weather; your birth chart determines how you experience that weather.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Channel 1: Environmental Sky Weather */}
          <div className="rounded-2xl border border-cyan-400/25 bg-cyan-950/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-cyan-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  1. Environmental Atmosphere (Sky Weather)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-200">
                {skyFlowPct}% Ambient Harmony
              </span>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-white">{skyAtmosphere.title}</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">{skyAtmosphere.subtitle}</p>
            </div>

            {/* Atmosphere Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Sky Friction ({100 - skyFlowPct}%)</span>
                <span>Sky Flow ({skyFlowPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div style={{ width: `${100 - skyFlowPct}%` }} className="bg-rose-500/70" />
                <div style={{ width: `${skyFlowPct}%` }} className="bg-cyan-400" />
              </div>
            </div>

            {transitMoon && (
              <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-xs text-slate-300 flex items-center justify-between">
                <span>Live Lunar Transit:</span>
                <span className="font-mono font-semibold text-cyan-200">{transitMoon.display}</span>
              </div>
            )}
          </div>

          {/* Channel 2: Personal Connection */}
          <div className="rounded-2xl border border-amber-400/25 bg-amber-950/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  2. Personal Resonance (Hooked to You)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-200">
                {personalFlowPct}% Personal Flow
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <resonanceVerdict.icon className={`h-4 w-4 ${resonanceVerdict.color}`} />
                <h4 className="font-serif text-lg font-bold text-white">{resonanceVerdict.headline}</h4>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">{resonanceVerdict.detail}</p>
            </div>

            {/* Personal Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Personal Friction ({100 - personalFlowPct}%)</span>
                <span>Personal Flow ({personalFlowPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div style={{ width: `${100 - personalFlowPct}%` }} className="bg-rose-500" />
                <div style={{ width: `${personalFlowPct}%` }} className="bg-[#2DD4BF]" />
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-xs text-slate-300 flex items-center justify-between">
              <span>Personal Status:</span>
              <span className="font-mono font-semibold text-amber-200">{personalScore.signal}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAJOR ASPECTS VS MINOR ASPECTS BREAKDOWN (50% Impact Rule) */}
      <section
        aria-label="Major and Minor Aspects Calibrated Impact"
        className="rounded-3xl border border-white/10 bg-[#080B14]/90 p-6 shadow-xl sm:p-7 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2DD4BF]">
              Calibrated Aspect Hierarchy
            </span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">
              Major Aspects (100%) vs. Minor Aspects (50% Impact)
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Minor aspects provide nuanced, secondary background friction or gentle support calibrated at exactly 50% of major aspect strength so your primary planetary drivers remain clear.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Major Aspects Card */}
          <div className="rounded-2xl border border-teal-400/30 bg-teal-950/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">
                ★ Major Celestial Alignments (100% Impact)
              </span>
              <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-300">
                Factor: 1.0×
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-white tabular-nums">
                  {majorContacts.length}
                </span>
                <span className="ml-2 text-xs text-slate-400">active major contacts</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-teal-300 tabular-nums">
                  {majorWeight.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">pts ({majorPctOfForce}% of force)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Conjunction (0°), Trine (120°), Sextile (60°), Square (90°), and Opposition (180°).</strong> These are the foundational gravitational engines driving your day.
            </p>
          </div>

          {/* Minor Aspects Card */}
          <div className="rounded-2xl border border-amber-400/30 bg-amber-950/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                ✧ Minor Celestial Nuances (50% Impact)
              </span>
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                Factor: 0.5×
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-white tabular-nums">
                  {minorContacts.length}
                </span>
                <span className="ml-2 text-xs text-slate-400">active minor contacts</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold text-amber-300 tabular-nums">
                  {minorWeight.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">pts ({minorPctOfForce}% of force)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Semisextile (30°), Semisquare (45°), and Quincunx (150°).</strong> Calibrated at 50% impact to capture subtle underlying psychological friction and micro-adjustments without skewing primary direction.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
