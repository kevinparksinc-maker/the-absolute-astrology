import { readingCacheIdentity } from "@shared/readingIdentity";
import { trpc } from "@/lib/trpc";
import { FocusedPlacementReading } from "@/components/FocusedPlacementReading";
import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Flame,
  Info,
  Layers,
  MessageSquare,
  Orbit,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { EnergyScoringKey } from "@/components/EnergyScoringKey";
import { TransitLocationBar } from "@/components/TransitLocationBar";
import { HarmonicFlowTimeline } from "@/components/HarmonicFlowTimeline";
import { TransitWeatherTimeline } from "@/components/TransitWeatherTimeline";
import { InterpretationPanel } from "@/components/InterpretationPanel";
import { EnergyChartMap } from "@/components/EnergyChartMap";
import { AlignEnergyBarometer } from "@/components/AlignEnergyBarometer";
import { RealLifeAspectBreakdown } from "@/components/RealLifeAspectBreakdown";
import { D3DailyEnergyChart } from "@/components/D3DailyEnergyChart";
import { getHumanDialogue } from "@/lib/humanDialogueEngine";
import type { ChartResult, TransitContact, MinorTransitContact } from "../../../server/astronomy";
import { ENERGY_ASPECT_FLOW, calculateEnergyRead } from "@/lib/energyScoring";

const ENERGY_READING_CACHE_KEY = "fg:energy-reading-cache:v1";
const ENERGY_BUCKET_TTL_MS = 30 * 60 * 1000;

function energyBucketKey(chart: ChartResult): string {
  const parsed = Date.parse(chart.transitDate);
  const bucket = Number.isFinite(parsed) ? Math.floor(parsed / ENERGY_BUCKET_TTL_MS) : 0;
  return JSON.stringify([
    chart.input.date,
    chart.input.time,
    chart.input.latitude,
    chart.input.longitude,
    chart.input.transitLocation || chart.input.location,
    chart.input.transitLatitude ?? chart.input.latitude,
    chart.input.transitLongitude ?? chart.input.longitude,
    chart.worldview,
    bucket,
  ]);
}

function readCachedEnergyReading<T>(readingKey: string, bucketKey: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ENERGY_READING_CACHE_KEY);
    if (!raw) return null;
    const entries = JSON.parse(raw) as Array<{
      readingKey: string;
      bucketKey: string;
      savedAt: number;
      reading: T;
    }>;
    if (!Array.isArray(entries)) return null;
    const now = Date.now();
    const match =
      entries.find((e) => e.readingKey === readingKey && now - e.savedAt < ENERGY_BUCKET_TTL_MS * 2) ??
      entries.find((e) => e.bucketKey === bucketKey && now - e.savedAt < ENERGY_BUCKET_TTL_MS);
    return match ? match.reading : null;
  } catch {
    return null;
  }
}

function writeCachedEnergyReading<T>(readingKey: string, bucketKey: string, reading: T) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(ENERGY_READING_CACHE_KEY);
    const prev = raw
      ? (JSON.parse(raw) as Array<{ readingKey: string; bucketKey: string; savedAt: number; reading: T }>)
      : [];
    const filtered = Array.isArray(prev)
      ? prev.filter((e) => e.readingKey !== readingKey && e.bucketKey !== bucketKey)
      : [];
    const next = [{ readingKey, bucketKey, savedAt: Date.now(), reading }, ...filtered].slice(0, 6);
    window.localStorage.setItem(ENERGY_READING_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota restrictions cleanly.
  }
}

function clearCachedEnergyBucket(bucketKey: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(ENERGY_READING_CACHE_KEY);
    if (!raw) return;
    const prev = JSON.parse(raw) as Array<{ bucketKey: string }>;
    if (!Array.isArray(prev)) return;
    window.localStorage.setItem(
      ENERGY_READING_CACHE_KEY,
      JSON.stringify(prev.filter((e) => e.bucketKey !== bucketKey))
    );
  } catch {
    // Ignore storage errors.
  }
}

const ASPECT_SYMBOLS: Record<TransitContact["aspect"] | MinorTransitContact["aspect"], string> = {
  conjunction: "☌",
  semisextile: "⚺",
  semisquare: "∠",
  quincunx: "⚻",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  "North Node": "☊", "South Node": "☋", Ascendant: "AC",
};

export default function EnergyPage({ onRefresh, calculating = false, error = "" }: { onRefresh?: () => void; calculating?: boolean; error?: string }) {
  const [path, navigate] = useLocation();
  const page = path === "/forecast" ? "forecast" : path.endsWith("/real-life") ? "reallife" : path.endsWith("/contacts") ? "contacts" : path.endsWith("/consultation") ? "consultation" : "summary";
  const { energyChart: chart, profile } = useProfileSession();
  const [selectedPlanetFilter, setSelectedPlanetFilter] = useState<string | null>(null);
  const [aspectCategory, setAspectCategory] = useState<"all" | "major" | "minor" | "harmonious" | "challenging">("all");
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [activeInterpreterQuestion, setActiveInterpreterQuestion] = useState<string | null>(null);

  const synthesisRequest = trpc.interpretation.energyReading.useMutation();
  type Reading = NonNullable<typeof synthesisRequest.data>;
  const readingKey = chart ? readingCacheIdentity(chart, "combined", "energy-overview-v1") : "";
  const bucketKey = chart ? energyBucketKey(chart) : "";
  const [resolved, setResolved] = useState<{ key: string; reading: Reading } | null>(() => {
    if (!readingKey) return null;
    const cached = readCachedEnergyReading<Reading>(readingKey, bucketKey);
    return cached ? { key: readingKey, reading: cached } : null;
  });
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleRefreshTransits = () => {
    if (bucketKey) clearCachedEnergyBucket(bucketKey);
    setResolved(null);
    onRefresh?.();
  };

  useEffect(() => {
    let active = true;
    setFailure(null);
    if (!chart || calculating) {
      return () => { active = false; };
    }
    const cached = readCachedEnergyReading<Reading>(readingKey, bucketKey);
    if (cached && retry === 0) {
      setResolved({ key: readingKey, reading: cached });
      return () => { active = false; };
    }
    setResolved(null);
    synthesisRequest.mutateAsync({ chart }).then(reading => {
      if (!active) return;
      writeCachedEnergyReading(readingKey, bucketKey, reading);
      setResolved({ key: readingKey, reading });
    }).catch(error => {
      if (active) setFailure({ key: readingKey, message: error instanceof Error ? error.message : "Energy synthesis failed." });
    });
    return () => { active = false; };
  }, [readingKey, retry, calculating]);
  const reading = !calculating && resolved?.key === readingKey ? resolved.reading : null;
  const synthesisError = failure?.key === readingKey ? failure.message : null;
  const localEnergyData = useMemo(() => calculateEnergyRead(chart), [chart]);
  const energyData = reading?.score ?? localEnergyData;

  const isServerStarting = Boolean(
    synthesisError &&
      (synthesisError.includes("Starting Server") ||
        synthesisError.includes("Non-JSON response") ||
        synthesisError.includes("Failed to fetch") ||
        synthesisError.includes("Server starting up"))
  );

  useEffect(() => {
    if (!isServerStarting) return;
    const timer = setTimeout(() => {
      setRetry(v => v + 1);
    }, 1800);
    return () => clearTimeout(timer);
  }, [isServerStarting]);

  const isRateLimit = Boolean(
    !isServerStarting &&
      synthesisError &&
      (synthesisError.includes("429") ||
        synthesisError.includes("RESOURCE_EXHAUSTED") ||
        synthesisError.includes("quota") ||
        synthesisError.includes("Quota exceeded") ||
        synthesisError.includes("rate-limits"))
  );

  useEffect(() => {
    if (!isRateLimit || retry >= 1) {
      setCountdown(null);
      return;
    }

    const match = synthesisError?.match(/retry in ([0-9.]+)s/i);
    const initialSeconds = match && match[1] ? Math.max(Math.ceil(parseFloat(match[1])), 30) : 45;
    setCountdown(initialSeconds);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setRetry(v => v + 1);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [synthesisError, isRateLimit, retry]);

  const filteredContacts = useMemo(() => {
    if (!energyData) return [];
    let list = energyData.contacts;
    if (selectedPlanetFilter) {
      list = list.filter((c) => c.transit === selectedPlanetFilter || c.natal === selectedPlanetFilter);
    }
    if (aspectCategory === "major") {
      list = list.filter((c) => c.majorFactor === 1);
    } else if (aspectCategory === "minor") {
      list = list.filter((c) => c.majorFactor < 1);
    } else if (aspectCategory === "harmonious") {
      list = list.filter((c) => ENERGY_ASPECT_FLOW[c.aspect] === 1);
    } else if (aspectCategory === "challenging") {
      list = list.filter((c) => ENERGY_ASPECT_FLOW[c.aspect] === -1);
    }
    return list.sort((a, b) => a.orb - b.orb);
  }, [energyData, selectedPlanetFilter, aspectCategory]);

  const handleAskQuestion = (q?: string) => {
    const questionToAsk = q || customQuestion;
    if (!questionToAsk.trim()) return;
    setActiveInterpreterQuestion(questionToAsk);
    if (page !== "consultation") { navigate(`/energy/consultation?question=${encodeURIComponent(questionToAsk)}`); return; }
    document.getElementById("energy-master-interpreter")?.scrollIntoView({ behavior: "smooth" });
  };

  const currentTimeStr = chart ? new Date(chart.transitDate).toLocaleString([], { timeZone: chart.input.transitTimezone || chart.input.timezone, hour: "2-digit", minute: "2-digit", month: "short", day: "numeric", timeZoneName: "short" }) : "Awaiting calculation";

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24 pt-2 text-[#E8EDF7]">
      {/* SECTION 1: TOP TELEMETRY RIBBON & LOCATION DUALITY */}
      <section
        aria-label="Transit Location & Horizon Status"
        className="rounded-3xl border border-white/10 bg-[#080B14]/90 p-5 shadow-[0_15px_45px_rgba(0,0,0,0.5)] sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22D3EE]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                Live Planetary Telemetry
              </span>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {page === "summary" ? "Your Current Energy" : page === "contacts" ? "Energy Contact Ledger" : page === "forecast" ? "Personal Harmonic Flow Clock" : "Transit Interpretation"}
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              Read the current sky in relation to your birth chart.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/chart"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/40 px-3.5 text-xs font-semibold text-cyan-200 transition-all hover:bg-cyan-900/50 hover:border-cyan-300"
            >
              <Orbit size={15} className="text-cyan-300" />
              <span>Full Birth Chart & Wheel</span>
            </Link>
            <button
              type="button"
              disabled={calculating || !onRefresh}
              onClick={handleRefreshTransits}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D9B66F]/40 bg-[#D9B66F]/10 px-4 text-xs font-semibold text-[#D9B66F] transition-all hover:bg-[#D9B66F]/20 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={calculating ? "animate-spin" : ""} />
              <span>{calculating ? "Recalculating..." : "Refresh Sky"}</span>
            </button>
          </div>
        </div>

        {/* Dual Location Status */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9B66F]">
                Natal Birth Anchor (Fixed)
              </span>
              <Link href="/chart" className="text-[11px] font-medium text-amber-200 underline">
                Open Natal Wheel →
              </Link>
            </div>
            <p className="mt-1 font-semibold text-white">
              {profile?.location || "Birth Location"} · {profile?.date} {profile?.time}
            </p>
            <p className="text-[11px] text-slate-400">{profile?.timezone}</p>
            <Link href="/profile" className="mt-2 inline-block text-cyan-200 underline">Verify or edit birth date, time and place →</Link>
          </div>

          <div className="rounded-xl border border-cyan-400/30 bg-cyan-950/20 p-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Active Transit Horizon (GPS / Local)
            </span>
            <div className="mt-1">
              <TransitLocationBar variant="pill" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Governs local Ascendant, House cusps, and live transit angles.
            </p>
          </div>
        </div>
      </section>

      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {!chart && <p role="status">{calculating ? "Calculating current transit contacts…" : "Refresh Sky to calculate your current energy."}</p>}
      <nav aria-label="Energy pages" className="flex flex-wrap gap-2.5 text-xs sm:text-sm text-cyan-200">
        {[
          { href: "/energy", label: "Overview" },
          { href: "/energy/real-life", label: "Real-Life Breakdown" },
          { href: "/energy/contacts", label: "Contact Ledger" },
          { href: "/forecast", label: "30-min Forecast" },
          { href: "/energy/consultation", label: "Interpretation" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={path === item.href ? "page" : undefined}
            className={`rounded-xl border px-3.5 py-2.5 font-medium transition-all ${
              path === item.href
                ? "border-amber-300/60 bg-amber-400/15 font-bold text-amber-100 shadow-sm"
                : "border-white/15 bg-white/5 text-slate-300 hover:text-white hover:border-white/25"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="text-sm leading-6 text-slate-400">Personal contacts compare current transit bodies with your natal placements and angles. Independent Sky counts pairs within one event sky. The totals can differ even at the same place and time.</p>
      {chart && !reading && !synthesisError && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-4 text-cyan-200">
          <div className="h-4 w-4 shrink-0 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
          <p className="text-xs">
            Synthesizing deep AI narrative in background… Your chart map, barometer, and aspects are active below.
          </p>
        </div>
      )}
      {synthesisError && (
        <div
          role="alert"
          className="space-y-3 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 text-amber-200 backdrop-blur-md"
        >
          {isServerStarting ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Server Restarting · Connecting…</span>
              </div>
              <p className="text-xs text-slate-300">
                The server is completing its startup. Automatically resuming energy synthesis in a moment…
              </p>
              <button
                type="button"
                onClick={() => setRetry(value => value + 1)}
                className="mt-1 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Reconnect now
              </button>
            </div>
          ) : isRateLimit ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>AI Reasoning Rate Limit (250,000 tokens/min cooldown)</span>
              </div>
              <p className="text-xs text-slate-300">
                The Google Gemini API Free Tier requires a short pause before processing another energy synthesis. All your calculated planetary contacts and charts are preserved.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {countdown !== null && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-200">
                    Auto-retrying in {countdown}s…
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCountdown(null);
                    setRetry(value => value + 1);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Retry synthesis now
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-rose-300">Energy synthesis could not be completed</p>
              <p className="text-xs text-slate-300">
                {synthesisError.startsWith("{")
                  ? (() => {
                      try {
                        const parsed = JSON.parse(synthesisError);
                        return parsed.error?.message || parsed.message || synthesisError;
                      } catch {
                        return synthesisError;
                      }
                    })()
                  : synthesisError}
              </p>
              <button
                type="button"
                onClick={() => setRetry(value => value + 1)}
                className="mt-2 inline-block px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold text-xs transition-all cursor-pointer"
              >
                Retry synthesis
              </button>
            </div>
          )}
        </div>
      )}
      {reading && (
        <section aria-label="Synthesized Current Energy" className="space-y-4 rounded-3xl border border-amber-200/30 bg-[#080B14]/90 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_#FBBF24]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
              Grounded Plain-English Synthesis
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-amber-100 sm:text-3xl">{reading.headline}</h2>
          <p className="text-xs text-slate-400">Calculated sky: {currentTimeStr}</p>
          {reading.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm leading-7 text-slate-200">
              {paragraph.text}
            </p>
          ))}
          {!reading.score.contactsCount && (
            <p className="text-sm text-slate-200">
              No personal contacts fall within the configured 5° orb at this calculated moment.
            </p>
          )}
          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer text-cyan-200">Synthesis evidence</summary>
            <p className="mt-3 break-all">Snapshot: {reading.snapshotId}</p>
            <p className="mt-2">Methods reviewed: {reading.methodsReviewed.join(", ")}</p>
            {reading.paragraphs.map((paragraph, index) => (
              <p key={index} className="mt-2">
                Paragraph {index + 1}: {paragraph.contactIds.join(", ")} · {paragraph.methodIds.join(", ")} · {paragraph.evidenceIds.join(", ")}
              </p>
            ))}
          </details>
        </section>
      )}

      {/* SECTION 2: ALIGN 27 STYLE DUALITY BAROMETER & GOOD TIMES / BAD TIMES */}
      {chart && energyData && page === "summary" && (
        <AlignEnergyBarometer chart={chart} personalScore={energyData} />
      )}

      {/* SECTION 2B: D3 24-HOUR ENERGY FLUCTUATIONS & PLANETARY ASPECT PATTERNS */}
      {chart && (page === "summary" || page === "forecast") && (
        <D3DailyEnergyChart chart={chart} onAskQuestion={handleAskQuestion} />
      )}

      {/* SECTION 3: INTERACTIVE COSMIC ENERGY CHART MAP */}
      {chart && energyData && (page === "summary" || page === "contacts" || page === "reallife") && (
        <EnergyChartMap
          chart={chart}
          contacts={energyData.contacts}
          selectedContactId={expandedContactId}
          onSelectContact={setExpandedContactId}
          onAskQuestion={handleAskQuestion}
        />
      )}

      {/* SECTION 4: REAL-LIFE HUMAN BREAKDOWN (Human-to-Human Everyday Resonance) */}
      {chart && energyData && (page === "summary" || page === "reallife") && (
        <RealLifeAspectBreakdown
          chart={chart}
          contacts={energyData.contacts}
          onAskQuestion={handleAskQuestion}
        />
      )}

      {/* SECTION 4: MAIN ENERGY GAUGE — RESPONSIVE SEMICIRCULAR GAUGE */}
      {energyData && page === "summary" && (
        <section
          aria-label="Main Cosmic Energy Gauge"
          className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-[linear-gradient(135deg,#080B14_0%,#101628_60%,#092138_100%)] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] sm:p-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Semicircular SVG Gauge */}
            <div className="relative flex flex-col items-center justify-center">
              <svg viewBox="0 0 240 140" className="w-64 sm:w-80 h-auto overflow-visible">
                <defs>
                  <linearGradient id="gaugeFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#2DD4BF" />
                  </linearGradient>
                  <linearGradient id="gaugeFrictionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#FB7185" />
                  </linearGradient>
                </defs>

                {/* Background Track Arc (180 degrees) */}
                <path
                  d="M 20 125 A 100 100 0 0 1 220 125"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="18"
                  strokeLinecap="round"
                />

                {/* Harmony Arc */}
                <path
                  d="M 20 125 A 100 100 0 0 1 220 125"
                  fill="none"
                  stroke="url(#gaugeFlowGrad)"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 100}`}
                  strokeDashoffset={`${Math.PI * 100 * (1 - energyData.flowPct / 100)}`}
                  className="transition-all duration-1000 filter drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                />

                {/* Central Readout */}
                <text x="120" y="95" textAnchor="middle" className="font-serif text-3xl font-bold fill-white">
                  {energyData.flowPct}%
                </text>
                <text x="120" y="115" textAnchor="middle" className="font-mono text-[9px] uppercase tracking-wider fill-cyan-300">
                  HARMONY INDEX
                </text>
              </svg>

              <div className="mt-2 text-center">
                <span
                  className={`rounded-full px-4 py-1 text-xs font-bold ${
                    energyData.signal === "Harmonious Flow"
                      ? "bg-teal-950/70 text-[#2DD4BF] border border-teal-400/40 shadow-[0_0_12px_rgba(45,212,191,0.3)]"
                      : energyData.signal === "Dynamic Friction"
                      ? "bg-rose-950/70 text-[#FB7185] border border-rose-400/40 shadow-[0_0_12px_rgba(251,113,133,0.3)]"
                      : "bg-cyan-950/70 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                  }`}
                >
                  {energyData.signal}
                </span>
                <p className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">
                  Calculated sky: {currentTimeStr}
                </p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="w-full lg:max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-teal-400/30 bg-teal-950/20 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                    Harmonious Flow
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-white tabular-nums">
                      {energyData.flowPct}%
                    </span>
                    <span className="text-xs text-teal-300 font-mono">
                      {energyData.harmonious.length} aspects
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Conjunctions, trines, sextiles and harmonious minor contacts.
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-400/30 bg-rose-950/20 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FB7185]">
                    Growth Friction
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-white tabular-nums">
                      {energyData.frictionPct}%
                    </span>
                    <span className="text-xs text-rose-300 font-mono">
                      {energyData.challenging.length} aspects
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Squares, oppositions, semisquares and quincunxes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {energyData && <EnergyScoringKey />}

      {energyData && (page === "summary" || page === "contacts") && (
        <section aria-label="Active Planetary Aspects Ledger" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D9B66F]">
              Precise Celestial Geometry
            </span>
            <h2 className="font-serif text-2xl font-bold text-white">
              Personal Transit-to-Natal Contacts {calculating ? "· Updating…" : energyData ? `(${filteredContacts.length} of ${energyData.contactsCount})` : "· Awaiting calculation"}
            </h2>
          </div>

          {/* Filter Bar with Major and Minor Options */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
            {[
              { id: "all", label: `All (${energyData?.contactsCount ?? 0})` },
              { id: "major", label: "★ Major (100% Impact)" },
              { id: "minor", label: "✧ Minor (50% Impact)" },
              { id: "harmonious", label: "Flow" },
              { id: "challenging", label: "Friction" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAspectCategory(tab.id as any)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  aspectCategory === tab.id
                    ? "bg-[#D9B66F] text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {calculating && <p role="status" className="text-sm text-cyan-200">Calculating contacts for the selected transit time and location…</p>}
        {!calculating && energyData && filteredContacts.length === 0 && <p role="status" className="rounded-xl border border-white/10 p-4 text-sm text-slate-300">{energyData.contactsCount ? "No contacts match this filter. Select All to see the complete ledger." : "No personal transit-to-natal contacts fall within the 5° orb at this calculated moment."}</p>}
        {/* Aspects Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredContacts.map((c) => {
            const isFlow = ENERGY_ASPECT_FLOW[c.aspect] === 1;
            const isFriction = ENERGY_ASPECT_FLOW[c.aspect] === -1;
            const symbol = ASPECT_SYMBOLS[c.aspect] || c.aspect;
            const isMajor = c.majorFactor === 1;

            const isExpanded = expandedContactId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setExpandedContactId(isExpanded ? null : c.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  isExpanded
                    ? "border-[#D9B66F] bg-[#101628] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    : "border-white/10 bg-[#080B14]/80 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base text-cyan-300">
                      {PLANET_GLYPHS[c.transit] || c.transit.slice(0, 2)}
                    </span>
                    <span className="text-xs font-bold text-white">{c.transit}</span>
                    <span className="font-mono text-sm text-[#D9B66F]">{symbol}</span>
                    <span className="font-mono text-base text-[#D9B66F]">
                      {PLANET_GLYPHS[c.natal] || c.natal.slice(0, 2)}
                    </span>
                    <span className="text-xs font-bold text-white">{c.natal}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isMajor
                          ? "bg-teal-950/80 text-[#2DD4BF] border border-teal-400/40"
                          : "bg-amber-950/80 text-amber-300 border border-amber-400/40"
                      }`}
                    >
                      {isMajor ? "★ Major (100%)" : "✧ Minor (50%)"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isFlow
                          ? "bg-teal-950/70 text-[#2DD4BF] border border-teal-400/40"
                          : isFriction
                          ? "bg-rose-950/70 text-[#FB7185] border border-rose-400/40"
                          : "bg-cyan-950/70 text-cyan-300 border border-cyan-400/40"
                      }`}
                    >
                      {isFlow ? "Harmony" : isFriction ? "Friction" : "Dynamic"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Exact Orb: {c.orb.toFixed(2)}°</span>
                  <span>
                    Intensity: {c.intensity}/5 · Weight: {c.strength} pts{" "}
                    {!isMajor && <span className="text-amber-300/80">(50% impact)</span>}
                  </span>
                </div>

                {isExpanded && (() => {
                  const human = getHumanDialogue(c.transit, c.aspect, c.natal, isMajor, c.orb);
                  return (
                    <div onClick={event => event.stopPropagation()} className="mt-3 border-t border-white/10 pt-3 space-y-3 animate-in fade-in duration-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#D9B66F] tracking-wider">Everyday Meaning</span>
                        <h4 className="font-serif text-base font-bold text-white">{human.everydayTitle}</h4>
                        <p className="mt-0.5 text-xs text-cyan-200/90 italic leading-relaxed">"{human.tagline}"</p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-xs text-slate-300">
                        <strong className="text-slate-200 block text-[11px] mb-1">What you're experiencing:</strong>
                        <p className="leading-relaxed text-[11px]">{human.feelingInBodyAndMind}</p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2 text-xs">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2">
                          <strong className="text-emerald-300 text-[10px] block">Best Move Today:</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5">{human.bestMoveToday}</p>
                        </div>
                        <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-2">
                          <strong className="text-rose-300 text-[10px] block">Trap to Avoid:</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5">{human.trapToAvoid}</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/5 bg-black/30 p-2 text-[10px] font-mono text-slate-400">
                        <span>{c.transit} {c.aspect} natal {c.natal} · {c.orb.toFixed(2)}° orb · </span>
                        <span>{c.intensity} intensity × {c.stars}★ × {c.natalStars}★ × {c.majorFactor} ({isMajor ? "100% full weight" : "50% calibrated subtle impact"}) = {c.strength} pts</span>
                      </div>

                      {chart && <FocusedPlacementReading chart={chart} name={c.transit} otherName={c.natal} kind="contact" layer="transit"/>}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAskQuestion(`Tell me more about how transit ${c.transit} ${c.aspect} my natal ${c.natal} manifests today in plain terms.`);
                          }}
                          className="text-[11px] font-semibold text-cyan-300 hover:underline"
                        >
                          Ask Master Interpreter about this aspect →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {page === "forecast" && chart && <HarmonicFlowTimeline chart={chart} />}

      {/* SECTION 4: FORECAST TIMELINE */}
      <div className="flex justify-end"><Link href="/transit-sky" className="rounded-xl border border-cyan-300/40 bg-cyan-950/30 px-4 py-2 text-sm font-semibold text-cyan-200">Open Independent Transit Chart →</Link></div>
      {page === "forecast" && (
        <section aria-label="Transit Weather Timeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                Future Astronomical Projections
              </span>
              <h2 className="font-serif text-2xl font-bold text-white">
                30-Day & 90-Day Planetary Cycle Timeline
              </h2>
            </div>
          </div>

          {chart && <TransitWeatherTimeline chart={chart} />}
        </section>
      )}

      {page === "consultation" && (
        <section
          id="energy-master-interpreter"
        aria-label="Master Astrologer Consultation"
        className="scroll-mt-24 space-y-4 rounded-3xl border border-[#D9B66F]/30 bg-[#080B14]/90 p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <MessageSquare className="h-5 w-5 text-[#D9B66F]" />
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">
              Consult the Master Interpreter on Current Transits
            </h2>
            <p className="text-xs text-slate-400">
              Direct synthesis of your natal blueprint against today's live cosmic climate.
            </p>
          </div>
        </div>

        {chart && (
          <InterpretationPanel
            key={`energy-panel-${chart.input.location || "god"}`}
            chart={chart}
            initialMode="transit"
            initialQuestion={
              new URLSearchParams(window.location.search).get("question") || activeInterpreterQuestion ||
              "What is the single most important planetary transit active for me right now, and how should I align my actions today?"
            }
          />
        )}
      </section>
      )}
    </div>
  );
}
