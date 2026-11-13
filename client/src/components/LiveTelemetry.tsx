import { useEffect, useMemo, useState } from "react";
import { Activity, Gauge, Radio, RefreshCw, Signal, Waves } from "lucide-react";

const streamNames = ["Moshier ephemeris", "House solver", "Fixed-star archive", "Transit observer"];

export function LiveTelemetry() {
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => { if (!live) return; const timer = window.setInterval(() => setTick(value => value + 1), 1400); return () => window.clearInterval(timer); }, [live]);
  const metrics = useMemo(() => ({
    pulse: 98 + (tick % 3),
    latency: 18 + (tick * 7) % 16,
    signal: 92 + (tick % 5),
    jd: (2461290.5 + tick * 0.0000162).toFixed(5),
  }), [tick]);
  const bars = Array.from({ length: 18 }, (_, index) => 20 + ((index * 17 + tick * 9) % 62));
  return <section aria-label="Observatory telemetry" className="mb-8 rounded-3xl border border-emerald-200/15 bg-gradient-to-br from-emerald-300/[.07] via-cyan-300/[.045] to-white/[.025] p-4 shadow-2xl shadow-emerald-950/10 sm:p-5">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.23em] text-emerald-200"><Radio className={`h-3.5 w-3.5 ${live ? "animate-pulse" : ""}`} /> Observatory telemetry</div><p className="mt-1 text-xs text-slate-500">Simulated live stream for the observatory interface · not external astronomical data</p></div><button type="button" onClick={() => setLive(value => !value)} aria-pressed={live} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-300 hover:border-emerald-200/35 hover:text-white"><Activity className="h-3.5 w-3.5 text-emerald-300" /> {live ? "Stream live" : "Stream paused"}</button></div>
    <div className="grid gap-3 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]"><div className="relative min-h-[90px] overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between text-[10px] uppercase tracking-[.15em] text-slate-500"><span>Signal trace</span><Waves className="h-3.5 w-3.5 text-cyan-300" /></div><div className="mt-4 flex h-8 items-end gap-1">{bars.map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-400/20 to-cyan-200/75 transition-all duration-700" style={{ height: `${height}%` }} />)}</div></div><TelemetryCard icon={<Gauge className="h-3.5 w-3.5 text-violet-300" />} label="Engine pulse" value={`${metrics.pulse}%`} detail="nominal" /><TelemetryCard icon={<RefreshCw className="h-3.5 w-3.5 text-cyan-300" />} label="Frame latency" value={`${metrics.latency} ms`} detail="local loop" /><TelemetryCard icon={<Signal className="h-3.5 w-3.5 text-emerald-300" />} label="Observer signal" value={`${metrics.signal}%`} detail="stable" /><TelemetryCard icon={<Activity className="h-3.5 w-3.5 text-amber-300" />} label="Julian stream" value={metrics.jd} detail={streamNames[tick % streamNames.length]} /></div>
  </section>;
}

function TelemetryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between text-[10px] uppercase tracking-[.12em] text-slate-500"><span>{label}</span>{icon}</div><div className="mt-3 font-mono text-sm text-slate-100">{value}</div><div className="mt-1 text-[10px] text-slate-500">{detail}</div></div>; }
