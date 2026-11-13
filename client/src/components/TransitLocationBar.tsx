import { useState } from "react";
import { Navigation, MapPin, Loader2, Sparkles, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { useTransitGPS } from "@/hooks/useTransitGPS";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { TransitLocationModal } from "./TransitLocationModal";

interface TransitLocationBarProps {
  className?: string;
  variant?: "banner" | "compact" | "pill";
}

export function TransitLocationBar({ className = "", variant = "banner" }: TransitLocationBarProps) {
  const { profile } = useProfileSession();
  const { isLocating, activeTransitCity, locateCurrentSky } = useTransitGPS();
  const [modalOpen, setModalOpen] = useState(false);

  const isBirthCity = profile?.location && (!profile?.transitLocation || profile.transitLocation === profile.location);

  if (variant === "pill") {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/50 px-3 py-1 text-xs text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_12px_rgba(83,244,255,0.1)] ${className}`}
          title="Click to change your current sky location or use GPS"
        >
          <Navigation className={`h-3.5 w-3.5 text-cyan-300 ${isLocating ? "animate-spin" : ""}`} />
          <span className="font-semibold text-slate-300">Sky:</span>
          <span className="truncate max-w-[120px] font-medium text-cyan-100">{activeTransitCity.split(",")[0]}</span>
          {isLocating && <span className="text-[10px] text-cyan-400">(Locating…)</span>}
        </button>
        <TransitLocationModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/25 bg-cyan-950/30 p-2.5 sm:px-3.5 ${className}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-200">
              <Navigation className={`h-3.5 w-3.5 ${isLocating ? "animate-spin" : ""}`} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Current Sky (Transits)</p>
              <p className="truncate text-xs font-semibold text-white">{activeTransitCity}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => void locateCurrentSky()}
              disabled={isLocating}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-cyan-300/40 bg-cyan-400/15 px-2.5 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-400/25 disabled:opacity-50"
            >
              {isLocating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
              <span>GPS</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Change</span>
            </button>
          </div>
        </div>
        <TransitLocationModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/70 via-slate-900/80 to-indigo-950/70 p-4 shadow-[0_0_22px_rgba(83,244,255,0.08)] ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                <Navigation className={`h-3.5 w-3.5 ${isLocating ? "animate-spin" : ""}`} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                Energy Read Location
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isBirthCity ? "border-amber-400/30 bg-amber-400/10 text-amber-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"}`}>
                {isBirthCity ? "Using Birth City" : "Physical Location Active"}
              </span>
            </div>
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-cyan-300 shrink-0" />
              <span>{activeTransitCity}</span>
            </p>
            {isBirthCity && (
              <p className="text-xs text-amber-200/90 leading-relaxed pt-0.5">
                ⚡ Not in your birth city right now? Your energy read needs your physical location for accurate planetary houses and horizon alignment.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => void locateCurrentSky()}
              disabled={isLocating}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-4 text-xs font-semibold text-white shadow-[0_0_16px_rgba(83,244,255,0.2)] transition-all disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Locating via GPS…</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 text-white" />
                  <span>Use My Current Location (GPS)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 text-xs font-medium text-slate-200 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Change City</span>
            </button>
          </div>
        </div>
      </div>
      <TransitLocationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
