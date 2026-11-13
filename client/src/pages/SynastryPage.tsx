import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Heart, Sparkles, Users, Compass, ShieldCheck } from "lucide-react";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { SynastryMatrixTab } from "@/components/SynastryMatrixTab";
import { CosmicShareCard } from "@/components/CosmicShareCard";

export default function SynastryPage() {
  const { chart, profile } = useProfileSession();
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 pt-2 text-slate-100">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-100 font-semibold uppercase tracking-wider"
            >
              <ArrowLeft size={13} />
              <span>Explore Directory</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Relationship Astrology</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-white sm:text-4xl flex items-center gap-3">
            <span>Synastry Studio</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
              <Heart size={18} />
            </span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Compare two celestial blueprints for romantic, business, or friendship resonance. Analyze dual-wheel aspects, house overlays, and composite harmony.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/chart"
            className="rounded-xl border border-cyan-400/30 bg-cyan-950/40 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/40 transition-colors"
          >
            My Natal Chart
          </Link>
        </div>
      </div>

      {/* Main Synastry Matrix Component */}
      <SynastryMatrixTab
        userChart={chart}
        onOpenShareModal={() => setShowShareModal(true)}
      />

      {/* Share Modal */}
      <CosmicShareCard
        open={showShareModal}
        onOpenChange={setShowShareModal}
        chart={chart}
      />
    </div>
  );
}
