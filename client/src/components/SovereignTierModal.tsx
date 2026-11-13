import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Crown,
  Sparkles,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Zap,
  Star,
  ChevronRight,
  Flame,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SovereignTierContextType {
  isSovereign: boolean;
  setIsSovereign: (value: boolean) => void;
  openPaywall: (featureName?: string) => void;
  closePaywall: () => void;
  activeFeatureTeaser: string | null;
}

const SovereignTierContext = createContext<SovereignTierContextType>({
  isSovereign: false,
  setIsSovereign: () => {},
  openPaywall: () => {},
  closePaywall: () => {},
  activeFeatureTeaser: null,
});

export function SovereignTierProvider({ children }: { children: React.ReactNode }) {
  const [isSovereign, setIsSovereign] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cosmos_sovereign_tier") === "true";
    }
    return false;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeatureTeaser, setActiveFeatureTeaser] = useState<string | null>(null);

  const toggleSovereign = (val: boolean) => {
    setIsSovereign(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("cosmos_sovereign_tier", val ? "true" : "false");
    }
  };

  const openPaywall = (featureName?: string) => {
    setActiveFeatureTeaser(featureName || "The Sovereign Tier: Inner Sanctum");
    setIsOpen(true);
  };

  const closePaywall = () => {
    setIsOpen(false);
  };

  return (
    <SovereignTierContext.Provider
      value={{
        isSovereign,
        setIsSovereign: toggleSovereign,
        openPaywall,
        closePaywall,
        activeFeatureTeaser,
      }}
    >
      {children}
      <SovereignPaywallDialog
        isOpen={isOpen}
        onClose={closePaywall}
        activeFeature={activeFeatureTeaser}
        isSovereign={isSovereign}
        onToggleSovereign={toggleSovereign}
      />
    </SovereignTierContext.Provider>
  );
}

export function useSovereignTier() {
  return useContext(SovereignTierContext);
}

interface SovereignPaywallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeFeature: string | null;
  isSovereign: boolean;
  onToggleSovereign: (val: boolean) => void;
}

function SovereignPaywallDialog({
  isOpen,
  onClose,
  activeFeature,
  isSovereign,
  onToggleSovereign,
}: SovereignPaywallDialogProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [promoApplied, setPromoApplied] = useState(false);

  const handleUnlock = () => {
    onToggleSovereign(true);
    onClose();
  };

  const handleDowngrade = () => {
    onToggleSovereign(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={val => !val && onClose()}>
      <DialogContent className="max-w-2xl border-amber-300/30 bg-gradient-to-b from-[#120f26] via-[#0b091a] to-[#06050e] p-0 text-slate-100 shadow-2xl shadow-amber-950/40 overflow-hidden sm:rounded-3xl">
        {/* Glow Header Accent */}
        <div className="relative overflow-hidden border-b border-amber-300/20 bg-gradient-to-r from-amber-500/20 via-violet-500/20 to-cyan-500/10 px-6 py-6 sm:px-8">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-400/20 shadow-lg shadow-amber-500/20">
                <Crown className="h-5 w-5 text-amber-200" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
                  Inner Sanctum · Deep Esoteric Tier
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  The Algorithms of the Cosmos
                </h3>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200"
            >
              {isSovereign ? "Active Sovereign Member" : "Serious Astrologers Only"}
            </Badge>
          </div>

          {activeFeature && (
            <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3.5 py-2 text-xs text-amber-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                You tapped: <strong>{activeFeature}</strong>. This deeper esoteric module is reserved for Inner Sanctum members.
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Freemium Philosophy Explanation */}
          <div className="text-sm leading-6 text-slate-300">
            <p>
              The basic foundation—mathematical chart calculation, transit tracking, real-time social matrix, and the primary AI Master Interpreter—will{" "}
              <strong className="text-white">always remain 100% free</strong> as your algorithmic entry point.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              The Sovereign Tier unlocks the centuries-old traditional esoteric layers: Nakshatra Pada micro-degrees, Arabic Lots, Medieval Essential Dignities, and deep 90-day predictive synastry contracts.
            </p>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Free Tier */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  The Universal Hook
                </span>
                <Badge variant="secondary" className="bg-white/10 text-[11px] text-slate-300">
                  Free Forever
                </Badge>
              </div>
              <div className="mt-2 text-xl font-bold text-white">$0 / month</div>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Exact Astronomical Ephemeris Calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  First-Screen AI Master Interpreter with RAG
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Social Loved Ones Matrix & Check-in Prompts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  Basic Synastry Duo Chemistry Score Preview
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  1-Click Cosmic Story & Feed Share Cards
                </li>
              </ul>
            </div>

            {/* Sovereign Tier */}
            <div className="relative rounded-2xl border-2 border-amber-300/50 bg-gradient-to-b from-amber-400/10 via-amber-400/[0.04] to-transparent p-5 shadow-lg shadow-amber-950/20">
              <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
                Deep Esoteric Vault
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Sovereign Tier
                </span>
                <Crown className="h-4 w-4 text-amber-300" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {billingCycle === "annual" ? "$8.25" : "$14.99"}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
                {billingCycle === "annual" && (
                  <span className="text-[10px] text-amber-300 font-medium">
                    (billed $99/yr · save 45%)
                  </span>
                )}
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-amber-100/90">
                <li className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  Deep 27 Nakshatra Pada Micro-Degrees & Sub-Lords
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  Medieval Arabic Lots (Fortuna, Spirit, Eros, Necessity)
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  Ptolemaic Essential Dignities & Debility Math
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  Full 90-Day Predictive Transit Weather Timeline
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  Deep Soul-Contract Synastry & Composite Dynamics
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                  Unlimited Consultations with the Master Interpreter
                </li>
              </ul>
            </div>
          </div>

          {/* Cycle Picker */}
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-full border border-white/10 bg-black/30 w-fit mx-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                billingCycle === "monthly"
                  ? "bg-amber-400 text-black font-semibold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly ($14.99)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-amber-400 text-black font-semibold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual ($99/yr)</span>
              <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[10px]">SAVE 45%</span>
            </button>
          </div>

          {/* Action Button & Demo Toggle */}
          <div className="space-y-3 pt-2">
            {!isSovereign ? (
              <Button
                onClick={handleUnlock}
                className="w-full h-12 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-bold text-sm shadow-xl shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 rounded-xl"
              >
                <Crown className="mr-2 h-4 w-4 text-black" />
                Start 7-Day Free Trial (or Instant Unlock for Demo)
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onClose}
                  className="flex-1 h-11 bg-amber-400 text-black font-bold rounded-xl"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  You are Sovereign · Continue Exploring
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDowngrade}
                  className="h-11 border-white/15 bg-white/5 text-xs text-slate-300 hover:bg-white/10"
                >
                  Switch Back to Free Tier (Test View)
                </Button>
              </div>
            )}

            <p className="text-center text-[11px] text-slate-500">
              Cancel anytime. No lock-in. Backed by mathematical astronomical precision and NASA JPL planetary ephemeris.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * A wrapper badge / teaser banner that shows when a feature is locked behind Sovereign Tier.
 */
export function SovereignTeaserLock({
  title,
  description,
  featureKey,
}: {
  title: string;
  description: string;
  featureKey: string;
}) {
  const { isSovereign, openPaywall } = useSovereignTier();

  if (isSovereign) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-500/15 via-violet-500/10 to-transparent p-5 text-slate-100 shadow-lg shadow-amber-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Inner Sanctum · {title}
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-5">
            {description}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => openPaywall(title)}
          className="shrink-0 h-9 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs rounded-xl shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400"
        >
          <Crown className="mr-1.5 h-3.5 w-3.5" />
          Preview Sovereign Access
        </Button>
      </div>
    </div>
  );
}
