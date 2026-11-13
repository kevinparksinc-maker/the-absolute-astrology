import { useState } from "react";
import { Link } from "wouter";
import { BookOpen, Sparkles, UserRound, ArrowLeft } from "lucide-react";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { LifeStoryDashboard } from "@/components/LifeStoryDashboard";
import { NatalProfileBuilder, SAMPLE_PROFILE } from "@/components/NatalProfileBuilder";
import { trpc } from "@/lib/trpc";

export default function LifeStoryPage() {
  const { profile, setProfile, chart, setChart } = useProfileSession();
  const calculate = trpc.hybrid.calculate.useMutation({ onSuccess: setChart });

  const handleLoadSample = () => {
    setProfile(SAMPLE_PROFILE);
    calculate.mutate({
      location: SAMPLE_PROFILE.location,
      latitude: SAMPLE_PROFILE.latitude,
      longitude: SAMPLE_PROFILE.longitude,
      timezone: SAMPLE_PROFILE.timezone,
      date: SAMPLE_PROFILE.date,
      time: SAMPLE_PROFILE.time,
      worldview: "agent",
      readingScope: "natal",
      birthTimeKnown: true,
    });
  };

  return (
    <div className="relative min-h-screen isolate bg-transparent text-slate-100 selection:bg-fuchsia-400/30">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(3,5,12,.15),rgba(3,5,12,.65)_60%,rgba(3,5,12,.9)),url('/assets/firmament-starfield.png')] bg-cover bg-top bg-fixed"
        aria-hidden="true"
      />

      <main className="relative z-10 mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>Back to Observatory</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/profile" className="hover:text-amber-200 transition">
              Birth Profile
            </Link>
            <span>/</span>
            <Link href="/chart" className="hover:text-cyan-200 transition">
              Diamond Chart
            </Link>
            <span>/</span>
            <span className="text-fuchsia-300 font-semibold">Life Story Mode</span>
          </div>
        </div>

        {/* If chart is available, show the complete Life Story Dashboard */}
        {chart ? (
          <LifeStoryDashboard chart={chart} />
        ) : (
          <div className="mx-auto max-w-xl rounded-3xl border border-fuchsia-400/30 bg-slate-950/80 p-8 text-center space-y-4 shadow-[0_0_40px_rgba(217,70,239,0.12)]">
            <BookOpen size={40} className="mx-auto text-fuchsia-300" />
            <h2 className="font-serif text-2xl font-bold text-white">
              Unlock Your Chronological Life Story
            </h2>
            <p className="text-xs leading-relaxed text-slate-300">
              Life Story Mode transforms your calculated birth chart into an expansive chronological
              biography. Set up your personal birth profile or load a sample chart to begin.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/profile"
                className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-amber-400/15 px-5 text-xs font-semibold text-amber-200 hover:bg-amber-400/25"
              >
                <UserRound size={14} />
                <span>Set Up My Birth Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleLoadSample}
                disabled={calculate.isPending}
                className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-fuchsia-300/40 bg-fuchsia-400/15 px-5 text-xs font-semibold text-fuchsia-200 hover:bg-fuchsia-400/25"
              >
                <Sparkles size={14} />
                <span>{calculate.isPending ? "Calculating..." : "Explore Sample Chart"}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
