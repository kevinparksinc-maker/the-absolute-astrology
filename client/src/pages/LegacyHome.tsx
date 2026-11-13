import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  MapPin,
  Sparkles,
  Sun,
  Star,
  CheckCircle2,
  Compass,
  BookmarkPlus,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { InterpretationPanel } from "@/components/InterpretationPanel";
import { AdvancedChartInstruments } from "@/components/AdvancedChartInstruments";
import { LiveTransitFeed } from "@/components/LiveTransitFeed";
import { WelcomeHost } from "@/components/WelcomeHost";
import { ObservatorySoundscape } from "@/components/ObservatorySoundscape";
import { AccountControl } from "@/components/AccountControl";
import { Guardian2050Welcome } from "@/components/Guardian2050Welcome";
import { FrameRelationshipPanel } from "@/components/FrameRelationshipPanel";
import { ChartOverview } from "@/components/ChartOverview";
import { ChartObservatory2050 } from "@/components/ChartObservatory2050";
import { MasterChartObservatory } from "@/components/MasterChartObservatory";
import { MasterSynthesizerPanel } from "@/components/MasterSynthesizerPanel";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CosmicShareCard } from "@/components/CosmicShareCard";
import { SocialLovedOnesMatrix } from "@/components/SocialLovedOnesMatrix";
import { SynastryMatrixTab } from "@/components/SynastryMatrixTab";
import { TransitWeatherTimeline } from "@/components/TransitWeatherTimeline";
import { AudioPodcastBriefing } from "@/components/AudioPodcastBriefing";
import { useSovereignTier, SovereignTeaserLock } from "@/components/SovereignTierModal";
import {
  Share2,
  Users,
  Heart,
  Calendar,
  Headphones,
  Crown,
  Layers,
  Sparkles as SparklesIcon,
  User,
} from "lucide-react";
import {
  NatalProfileBuilder,
  ActiveProfileBar,
  type UserProfileData,
  SAMPLE_PROFILE,
} from "@/components/NatalProfileBuilder";
import type { ChartResult } from "../../../server/astronomy";
import type { Worldview } from "../../../server/astrologyCore";
import { formatInZone } from "../../../shared/time";
import { Link } from "wouter";
import { startLogin } from "@/const";

const exampleChart = {
  location: "Dallas, Texas, USA",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  transitLocation: "Dallas, Texas, USA",
  transitLatitude: 32.7767,
  transitLongitude: -96.797,
  transitTimezone: "America/Chicago",
  transitDate: "",
  transitTime: "",
};
const emptyForm = {
  location: "",
  latitude: 0,
  longitude: 0,
  timezone: "",
  date: "",
  time: "",
  transitLocation: "",
  transitLatitude: 0,
  transitLongitude: 0,
  transitTimezone: "",
  transitDate: "",
  transitTime: "",
};
type ReadingMode = "natal" | "transit" | "combined";
const worldviewModes: Array<{
  value: Worldview;
  title: string;
  description: string;
}> = [
  {
    value: "god",
    title: "God View",
    description:
      "The fixed collective frame: Aries through Pisces, without a horizon or location-based houses.",
  },
  {
    value: "agent",
    title: "Agent View",
    description:
      "Your local horizon: geocentric planetary positions with a separate topocentric lunar correction and 30-degree houses from your Ascendant.",
  },
  {
    value: "agent-vs-god",
    title: "God's View of the Agent",
    description:
      "See each calculated placement in both the fixed collective frame and your personal Agent houses.",
  },
];
const readingModes: Array<{
  value: ReadingMode;
  title: string;
  eyebrow: string;
  description: string;
}> = [
  {
    value: "natal",
    title: "Natal Chart",
    eyebrow: "Your foundation",
    description:
      "Read the birth chart: identity, temperament, houses, relationships, gifts, and lifelong patterns.",
  },
  {
    value: "transit",
    title: "Transit Chart",
    eyebrow: "Your present sky",
    description:
      "Read what the moving planets are activating now—or at a specific date and time.",
  },
  {
    value: "combined",
    title: "Natal Transit Reading",
    eyebrow: "The full picture",
    description:
      "See how the current sky meets your birth chart without confusing temporary weather with identity.",
  },
];
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] text-slate-300">
      {children}
    </span>
  );
}
function OverlayCell({ row }: { row: any }) {
  return (
    <div className="space-y-1.5">
      <div className="font-medium text-slate-100">
        {row.overlay.nakshatra}{" "}
        <span className="text-slate-500">Pada {row.overlay.pada}</span>
      </div>
      <div className="text-xs text-slate-400">{row.overlay.manzil}</div>
      <Chip>{row.overlay.decan}</Chip>
    </div>
  );
}
function TransitContacts({ row }: { row: any }) {
  return row.natalContacts.length ? (
    <div className="flex flex-wrap gap-1.5">
      {row.natalContacts.map((contact: any) => (
        <Chip key={`${contact.natalName}-${contact.aspect}`}>
          {contact.aspect} {contact.natalName} · {contact.orb.toFixed(1)}°
        </Chip>
      ))}
    </div>
  ) : (
    <span className="text-xs text-slate-500">
      No major natal contact within 5°
    </span>
  );
}
function CalculationReveal({
  row,
  kind,
}: {
  row: any;
  kind: "natal" | "star" | "transit";
}) {
  const label =
    kind === "star"
      ? "Frozen star"
      : kind === "transit"
        ? "Transit"
        : "Natal placement";
  const description =
    kind === "star"
      ? "A precession-locked reference point. Its degree stays fixed while the local house and overlays place it into this chart."
      : kind === "transit"
        ? "A moving body at the selected moment, calculated from the transit location and compared with the natal foundation."
        : "A moving or angular natal placement calculated from the birth moment and location. This is part of the enduring foundation.";
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="group/calc inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-left font-medium text-white outline-none transition hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <span>{row.name}</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-300/0 transition group-hover/calc:text-cyan-300 group-focus-visible/calc:text-cyan-300">
            Explore
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="w-80 border-cyan-200/20 bg-[#101827]/[0.98] p-0 text-slate-100 shadow-2xl shadow-cyan-950/30"
      >
        <div className="border-b border-cyan-200/10 bg-gradient-to-r from-cyan-300/[0.12] to-violet-300/[0.08] p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
            {label} · deeper look
          </div>
          <h3 className="mt-1 font-serif text-xl text-white">{row.name}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
        </div>
        <div className="space-y-2 p-4 text-xs">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
            <span className="text-slate-500">
              {row.uncertainty ? "Noon reference" : "Exact position"}
            </span>
            <span className="font-mono text-right text-cyan-100">
              {row.display}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
            <span className="text-slate-500">Local house</span>
            <span className="text-right text-white">House {row.house}</span>
          </div>
          {row.retrograde && (
            <div className="rounded-lg border border-rose-300/15 bg-rose-300/[0.07] px-3 py-2 text-rose-100">
              Retrograde motion: the body is moving backward against the zodiac
              from this viewpoint.
            </div>
          )}
          {row.overlay && (
            <div className="space-y-1 rounded-lg border border-white/5 bg-black/15 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-violet-200">
                Overlay coordinates
              </div>
              <div className="text-slate-300">
                {row.overlay.nakshatra} · Pada {row.overlay.pada}
              </div>
              <div className="text-slate-400">
                {row.overlay.manzil} · {row.overlay.decan}
              </div>
            </div>
          )}
          {row.uncertainty && (
            <div className="rounded-lg border border-amber-200/20 bg-amber-200/[0.06] px-3 py-2 text-amber-100">
              Unknown birth time: {row.uncertainty.label}. The noon Moon
              position is a reference, not a confirmed degree.
            </div>
          )}
          {kind === "transit" && (
            <div className="space-y-1 rounded-lg border border-rose-200/10 bg-rose-200/[0.04] p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-rose-200">
                Natal contacts
              </div>
              {row.natalContacts?.length ? (
                row.natalContacts.slice(0, 4).map((contact: any) => (
                  <div
                    key={`${contact.natalName}-${contact.aspect}`}
                    className="flex justify-between gap-3 text-slate-300"
                  >
                    <span>
                      {contact.aspect} {contact.natalName}
                    </span>
                    <span className="text-slate-500">
                      {contact.orb.toFixed(1)}°
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">
                  No major contact within 3°.
                </div>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function Home() {
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState<ChartResult | null>(null);
  const [formError, setFormError] = useState("");
  const [worldview, setWorldview] = useState<Worldview>("agent");
  const [locationQuery, setLocationQuery] = useState("");
  const [transitLocationQuery, setTransitLocationQuery] = useState("");
  const [readingQuestion, setReadingQuestion] = useState("");
  const [readingMode, setReadingMode] = useState<ReadingMode>("combined");
  const [showHelp, setShowHelp] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [interpreterPrompt, setInterpreterPrompt] = useState<string | null>(null);
  type ObservatoryTab = "blueprint" | "synastry" | "weather" | "podcast" | "social";
  const parseTab = (): ObservatoryTab => {
    const tab = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("tab");
    return tab === "synastry" || tab === "weather" || tab === "podcast" || tab === "social" ? tab : "blueprint";
  };
  const [mainTab, setMainTab] = useState<ObservatoryTab>(parseTab);
  useEffect(() => {
    const onSelect = (event: Event) => {
      const tab = (event as CustomEvent<{ tab: ObservatoryTab }>).detail?.tab;
      if (["blueprint","synastry","weather","podcast","social"].includes(tab)) setMainTab(tab);
    };
    window.addEventListener("fg:select-tab", onSelect);
    return () => window.removeEventListener("fg:select-tab", onSelect);
  }, []);
  const [readingView, setReadingView] = useState<"guided" | "evidence">("guided");
  const { isSovereign, openPaywall } = useSovereignTier();
  const [activeProfile, setActiveProfile] = useState<UserProfileData | null>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("algorithms_cosmos_profile");
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleAskMasterInterpreter = (question: string) => {
    setInterpreterPrompt(question);
    document.getElementById("master-interpreter-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const [showMap, setShowMap] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 640
  );
  const geo = trpc.hybrid.geocode.useQuery(
    { query: locationQuery },
    { enabled: false, retry: false }
  );
  const transitGeo = trpc.hybrid.geocode.useQuery(
    { query: transitLocationQuery },
    { enabled: false, retry: false }
  );
  const calculate = trpc.hybrid.calculate.useMutation({ onSuccess: setResult });
  const me = trpc.auth.me.useQuery();
  const saveChart = trpc.history.saveChart.useMutation();
  const update = (key: keyof typeof form, value: string | number) =>
    setForm(current => ({ ...current, [key]: value }));
  const useResolved = async () => {
    setFormError("");
    try {
      const res = await geo.refetch();
      if (res.data)
        setForm(current => ({
          ...current,
          location: res.data.label,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          timezone: res.data.timezone,
        }));
      else if (res.error) setFormError(res.error.message);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Location search is temporarily unavailable. Please try the pin again."
      );
    }
  };
  const useResolvedTransit = async () => {
    setFormError("");
    try {
      const res = await transitGeo.refetch();
      if (res.data)
        setForm(current => ({
          ...current,
          transitLocation: res.data.label,
          transitLatitude: res.data.latitude,
          transitLongitude: res.data.longitude,
          transitTimezone: res.data.timezone,
        }));
      else if (res.error) setFormError(res.error.message);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Transit location search is temporarily unavailable. Please try the pin again."
      );
    }
  };
  const calculateChart = async (
    nextWorldview: Worldview = worldview,
    nextReadingMode: ReadingMode = readingMode,
    formOverride?: typeof form
  ) => {
    let nextForm = { ...(formOverride ?? form) };
    setFormError("");
    if (
      nextWorldview !== "god" &&
      locationQuery.trim() &&
      !nextForm.timezone
    ) {
      const res = await geo.refetch();
      if (res.data)
        nextForm = {
          ...nextForm,
          location: res.data.label,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          timezone: res.data.timezone,
        };
      else {
        setFormError(
          res.error?.message ??
            "Location search is temporarily unavailable. Please resolve the city again."
        );
        return;
      }
    }
    if (
      nextReadingMode !== "natal" &&
      transitLocationQuery.trim() &&
      !nextForm.transitTimezone
    ) {
      const res = await transitGeo.refetch();
      if (res.data)
        nextForm = {
          ...nextForm,
          transitLocation: res.data.label,
          transitLatitude: res.data.latitude,
          transitLongitude: res.data.longitude,
          transitTimezone: res.data.timezone,
        };
      else {
        setFormError(
          res.error?.message ??
            "Transit location search is temporarily unavailable. Please resolve the city again."
        );
        return;
      }
    }
    if (
      nextWorldview !== "god" &&
      (!nextForm.location || !nextForm.timezone)
    ) {
      setFormError(
        "Resolve your birth city first, or click 'Try an example chart' below."
      );
      return;
    }
    if (
      nextWorldview !== "god" &&
      (!nextForm.date || !nextForm.time)
    ) {
      setFormError(
        "Agent View requires a birth date, birth time, and resolved birth city."
      );
      return;
    }
    if (
      nextWorldview === "god" &&
      nextReadingMode !== "transit" &&
      !nextForm.date
    ) {
      setFormError(
        "God View Natal readings require a birth date (birth time and city are optional). Enter a birth date or switch to Transit Chart."
      );
      return;
    }
    setForm(nextForm);
    calculate.mutate({
      ...nextForm,
      worldview: nextWorldview,
      readingScope: nextReadingMode,
      birthTimeKnown: Boolean(nextForm.time),
    });
  };
  const saveCurrentChart = () => {
    if (!result) return;
    if (!me.data) {
      startLogin();
      return;
    }
    saveChart.mutate({
      title: `${result.input.location || "God View"} · ${result.input.date || "current sky"}`,
      location: result.input.location || "God View",
      input: { ...form, worldview, readingScope: readingMode } as Record<
        string,
        unknown
      >,
      chart: result as unknown as Record<string, unknown>,
    });
  };
  const refreshLiveTransit = () => {
    if (!result || readingMode === "natal") return;
    const now = new Date();
    calculate.mutate({
      ...form,
      transitDate: now.toISOString().slice(0, 10),
      transitTime: now.toTimeString().slice(0, 5),
      transitLocation: form.transitLocation || form.location,
      transitLatitude: form.transitLatitude || form.latitude,
      transitLongitude: form.transitLongitude || form.longitude,
      transitTimezone: form.transitTimezone || form.timezone,
      worldview,
      readingScope: readingMode,
      birthTimeKnown: Boolean(form.time),
    });
  };
  useEffect(() => {
    if (
      !result ||
      readingMode === "natal" ||
      (form.transitDate && form.transitTime)
    )
      return;
    const id = window.setInterval(refreshLiveTransit, 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [result, readingMode, worldview, form]);
  const handleSaveProfile = async (newProfile: UserProfileData) => {
    setActiveProfile(newProfile);
    try {
      localStorage.setItem("algorithms_cosmos_profile", JSON.stringify(newProfile));
    } catch {
      // ignore
    }
    const nextForm = {
      location: newProfile.location,
      latitude: newProfile.latitude,
      longitude: newProfile.longitude,
      timezone: newProfile.timezone,
      date: newProfile.date,
      time: newProfile.time,
      transitLocation: newProfile.transitLocation || newProfile.location,
      transitLatitude: newProfile.transitLatitude || newProfile.latitude,
      transitLongitude: newProfile.transitLongitude || newProfile.longitude,
      transitTimezone: newProfile.transitTimezone || newProfile.timezone,
      transitDate: "",
      transitTime: "",
    };
    setForm(nextForm);
    setLocationQuery(newProfile.location);
    setTransitLocationQuery(nextForm.transitLocation);
    await calculateChart(worldview, readingMode, nextForm);
    setIsProfileModalOpen(false);
  };

  const handleClearProfile = () => {
    try {
      localStorage.removeItem("algorithms_cosmos_profile");
    } catch {
      // ignore
    }
    setActiveProfile(null);
    setResult(null);
    setForm(emptyForm);
    setLocationQuery("");
    setTransitLocationQuery("");
    setIsProfileModalOpen(false);
  };

  const handleLoadSampleChart = () => {
    const sample = SAMPLE_PROFILE;
    setActiveProfile(sample);
    try {
      localStorage.setItem("algorithms_cosmos_profile", JSON.stringify(sample));
    } catch {
      // ignore
    }
    setForm(exampleChart);
    setLocationQuery(exampleChart.location);
    setTransitLocationQuery(exampleChart.transitLocation);
    void calculateChart(worldview, readingMode, exampleChart);
  };

  useEffect(() => {
    if (activeProfile && !result && !calculate.isPending) {
      const nextForm = {
        location: activeProfile.location,
        latitude: activeProfile.latitude,
        longitude: activeProfile.longitude,
        timezone: activeProfile.timezone,
        date: activeProfile.date,
        time: activeProfile.time,
        transitLocation: activeProfile.transitLocation || activeProfile.location,
        transitLatitude: activeProfile.transitLatitude || activeProfile.latitude,
        transitLongitude: activeProfile.transitLongitude || activeProfile.longitude,
        transitTimezone: activeProfile.transitTimezone || activeProfile.timezone,
        transitDate: "",
        transitTime: "",
      };
      setForm(nextForm);
      setLocationQuery(activeProfile.location);
      setTransitLocationQuery(nextForm.transitLocation);
      void calculateChart(worldview, readingMode, nextForm);
    }
  }, []);
  const summary = useMemo(
    () =>
      result
        ? `${result.movingBodies.length} moving bodies · ${result.frozenStars.length} frozen stars · 12 ${result.worldview === "god" ? "fixed" : "personal"} houses`
        : "Ready for a new chart",
    [result]
  );
  const natalDisplayRows = [
    ...(result?.movingBodies ?? []),
    result?.ascendant,
    result?.descendant,
    result?.midheaven,
    result?.northNode,
    result?.southNode,
  ].filter((row): row is NonNullable<typeof row> => Boolean(row));
  return (
    <div className="relative min-h-screen isolate bg-transparent text-slate-100 selection:bg-violet-400/30">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(3,5,12,.10),rgba(3,5,12,.58)_62%,rgba(3,5,12,.86)),url('/assets/firmament-starfield.png')] bg-cover bg-top bg-fixed"
        aria-hidden="true"
      />
      <ObservatorySoundscape />
      <button
        type="button"
        onClick={() => {
          document.getElementById("master-interpreter-section")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        className="fixed bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border border-cyan-200/30 bg-slate-950/90 px-3.5 py-2 text-xs font-semibold text-cyan-100 shadow-xl shadow-cyan-950/40 backdrop-blur-xl hover:bg-slate-900 hover:border-cyan-300"
        aria-label="Jump to AI Master Interpreter"
      >
        <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
        <span>AI Master Interpreter</span>
      </button>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute right-[-12rem] top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)] [background-size:64px_64px]" />
      </div>
      <main className="guardian-home-main relative z-10 mx-auto max-w-[1480px] px-5 py-6 md:px-10 md:py-10">
        <Guardian2050Welcome />
        <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-violet-300">
              <span className="h-px w-8 bg-violet-300" /> Algorithms of the Cosmos
            </div>
            <h1 className="max-w-3xl font-serif text-3xl leading-[1.12] tracking-tight text-white md:text-5xl">
              The Algorithms of the Cosmos
            </h1>
            <p className="mt-3 max-w-3xl font-serif text-2xl leading-[1.18] tracking-tight text-cyan-200/90 md:text-4xl">
              The cosmic code of algorithms—and how they made a perfect YOU.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              <strong className="font-semibold text-cyan-300">
                Decode Your Celestial Blueprint.
              </strong>{" "}
              Built for the seeker asking <em>“Who am I, really?”</em>—translating
              deterministic orbital mechanics, ancient astrological traditions, and
              16-system algorithmic convergence into the unique, perfect code of who
              you are.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {activeProfile ? (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-2 font-semibold text-cyan-200 transition hover:bg-cyan-400/25 flex items-center gap-1.5 shadow-sm"
              >
                <Compass className="h-3.5 w-3.5 text-cyan-300" />
                <span>Profile: {activeProfile.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="rounded-full border border-cyan-400 bg-cyan-500/20 px-3.5 py-2 font-bold text-cyan-100 transition hover:bg-cyan-500/30 flex items-center gap-1.5 animate-pulse shadow-md shadow-cyan-500/20"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span>+ Build Natal Profile</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => openPaywall("The Sovereign Tier · Inner Sanctum")}
              className={`rounded-full border px-3.5 py-2 font-semibold transition flex items-center gap-1.5 shadow-sm ${
                isSovereign
                  ? "border-amber-300/50 bg-amber-400/20 text-amber-200 shadow-amber-950/20"
                  : "border-amber-400/40 bg-gradient-to-r from-amber-400/15 to-amber-500/10 text-amber-300 hover:bg-amber-400/25"
              }`}
            >
              <Crown className="h-3.5 w-3.5 text-amber-300" />
              <span>{isSovereign ? "Sovereign Active" : "Inner Sanctum"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMainTab("synastry");
                document.getElementById("main-cosmos-tabs")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-2 font-semibold text-rose-200 transition hover:bg-rose-400/20 flex items-center gap-1.5"
            >
              <Heart className="h-3.5 w-3.5 text-rose-300" />
              <span>Synastry</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMainTab("social");
                document.getElementById("main-cosmos-tabs")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-2 font-semibold text-violet-200 transition hover:bg-violet-400/20 flex items-center gap-1.5"
            >
              <Users className="h-3.5 w-3.5 text-violet-300" />
              <span>Loved Ones</span>
            </button>
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="rounded-full border border-cyan-200/30 bg-cyan-100/10 px-3 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-100/20 flex items-center gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5 text-cyan-300" />
              <span>Share Card</span>
            </button>
            <Link
              href="/sky"
              className="rounded-full border border-cyan-200/30 bg-cyan-100/10 px-3 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-100/15"
            >
              Sky Home
            </Link>
            <Link
              href="/horary"
              className="rounded-full border border-cyan-200/30 bg-cyan-100/10 px-3 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-100/15"
            >
              Horary chat
            </Link>
            <Link
              href="/history"
              className="rounded-full border border-white/10 px-3 py-2 font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Archive
            </Link>
            <AccountControl />
          </div>
        </header>

        {/* Active Profile Ribbon if profile is already loaded */}
        {activeProfile && result && (
          <ActiveProfileBar
            profile={activeProfile}
            chart={result}
            onEditProfile={() => setIsProfileModalOpen(true)}
            onSwitchProfile={handleClearProfile}
          />
        )}

        {/* Core Natal Profile Building Gate - First Page Requirement */}
        {!result && (
          <>
            <NatalProfileBuilder
              mode="inline-gate"
              currentProfile={activeProfile}
              onSaveProfile={handleSaveProfile}
              onLoadSample={handleLoadSampleChart}
              isCalculating={calculate.isPending}
            />

            {/* Unlocking Teaser: What profound insights will unlock */}
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Layers className="h-4 w-4" />
                  <span>16-System Convergence</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Swiss Ephemeris degrees mapped into 27 Vedic Nakshatras & padas, 28 Arabic Manazil, and 36 Decans.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                  <Heart className="h-4 w-4" />
                  <span>Synastry & Chemistry Hub</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Compare dual-chart orbital mechanics with loved ones, house overlays, and friction aspects.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Calendar className="h-4 w-4" />
                  <span>30/90-Day Cosmic Weather</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Track exact transiting planetary hits against your natal houses, retrograde stations, and ingress points.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Master Interpreter</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Conversational RAG agent grounded strictly in your exact celestial coordinates—zero generic fluff.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Modal for editing profile anytime */}
        <NatalProfileBuilder
          mode="dialog"
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentProfile={activeProfile}
          onSaveProfile={handleSaveProfile}
          onLoadSample={handleLoadSampleChart}
          isCalculating={calculate.isPending}
        />

        {result && (
          <>
            <ChartOverview
              chart={result}
              view={readingView}
              onViewChange={setReadingView}
            />
            {/* First Screen Hero: Big AI Master Interpreter Chatbox with RAG */}
            <div id="master-interpreter-section">
              <WelcomeHost
                chart={result}
                readingMode={readingMode}
                onLoadSampleChart={handleLoadSampleChart}
                onOpenProfileBuilder={() => setIsProfileModalOpen(true)}
                externalPrompt={interpreterPrompt}
                onClearExternalPrompt={() => setInterpreterPrompt(null)}
              />
            </div>

            {/* Primary Cosmos Navigation Tabs */}
            <div id="main-cosmos-tabs" className="fg-celestial-tabs mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMainTab("blueprint")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              mainTab === "blueprint"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>1. Celestial Blueprint & Transits</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("synastry")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              mainTab === "synastry"
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-950/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Heart className="h-4 w-4 text-rose-300" />
            <span>2. Synastry & Chemistry Hub</span>
            <span className="rounded-full bg-rose-400/20 px-1.5 py-0.2 text-[10px] text-rose-200">
              Women&apos;s Favorite
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("weather")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              mainTab === "weather"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="h-4 w-4 text-cyan-300" />
            <span>3. 30/90-Day Cosmic Weather</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("podcast")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              mainTab === "podcast"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Headphones className="h-4 w-4 text-purple-300" />
            <span>4. Daily Audio Podcast</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("social")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              mainTab === "social"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-950/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="h-4 w-4 text-violet-300" />
            <span>5. Loved Ones Social Matrix</span>
          </button>
        </div>

        {mainTab === "blueprint" && (
          <>
        <Card className="mb-8 border-cyan-200/15 bg-gradient-to-br from-cyan-100/[0.08] via-white/[0.035] to-violet-200/[0.06] text-slate-100 shadow-2xl shadow-cyan-950/20">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Step 1 · Choose your reading
                </div>
                <h2 className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                  What do you want The Algorithms of the Cosmos to read?
                </h2>
              </div>
              <p className="max-w-md text-xs leading-5 text-slate-400">
                Choose one worldview and one reading layer. They work together.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {worldviewModes.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setWorldview(item.value);
                    if (result || (item.value === "god" && (readingMode === "transit" || Boolean(form.date)))) {
                      void calculateChart(item.value, readingMode);
                    }
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all sm:p-5 ${worldview === item.value ? "border-violet-300/70 bg-violet-200/10 shadow-lg shadow-violet-950/20" : "border-white/10 bg-black/10 hover:border-white/25 hover:bg-white/[0.06]"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-semibold text-white">
                      {item.title}
                    </div>
                    {worldview === item.value && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-violet-200" />
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {readingModes.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setReadingMode(item.value);
                    if (result || (worldview === "god" && item.value === "transit")) {
                      void calculateChart(worldview, item.value);
                    }
                    if (result)
                      window.setTimeout(
                        () =>
                          document
                            .getElementById("ai-reading")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            }),
                        0
                      );
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all sm:p-5 ${readingMode === item.value ? "border-cyan-300/70 bg-cyan-200/10 shadow-lg shadow-cyan-950/20" : "border-white/10 bg-black/10 hover:border-white/25 hover:bg-white/[0.06]"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-white">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-200/70">
                        {item.eyebrow}
                      </div>
                    </div>
                    {readingMode === item.value && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-200" />
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-amber-200/15 bg-amber-100/[.05] px-4 py-3 text-xs text-amber-100">
              <span className="font-semibold">Current reading lens:</span>{" "}
              {worldviewModes.find(item => item.value === worldview)?.title} ·{" "}
              {readingModes.find(item => item.value === readingMode)?.title}. To
              read Natal + Transit + God View, select{" "}
              <span className="font-semibold">God View</span> above and{" "}
              <span className="font-semibold">Natal Transit Reading</span> here.
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <aside id="chart-setup" className="space-y-5">
            <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Compass className="h-4 w-4 text-violet-300" /> Step 2 · Chart
                  details
                </CardTitle>
                <p className="text-xs leading-5 text-slate-400">
                  Choose a worldview first. Agent views use exact personal
                  details; God View uses the scope moment and does not need a
                  horizon or location-based house input.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className={worldview === "god" ? "hidden" : "space-y-2"}>
                  <Label className="text-xs text-slate-300">
                    Birth location
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={locationQuery}
                      onChange={e => setLocationQuery(e.target.value)}
                      className="border-white/10 bg-black/20 text-slate-100"
                      placeholder="City, region, country"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={useResolved}
                      disabled={geo.isFetching}
                      className="border-white/10 bg-white/5 px-3"
                      aria-label="Resolve birth location"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {form.latitude
                      ? `${form.latitude.toFixed(4)}°, ${form.longitude.toFixed(4)}° · ${form.timezone}`
                      : "Resolve a city to set coordinates and timezone."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowMap(value => !value)}
                    className="mt-2 text-xs font-medium text-cyan-200 hover:text-white"
                  >
                    {showMap ? "Hide map" : "Show map"}
                  </button>
                  {showMap && (
                    <MapView
                      initialCenter={{
                        lat: form.latitude || 32.7767,
                        lng: form.longitude || -96.797,
                      }}
                      initialZoom={10}
                      className="mt-3 h-28 overflow-hidden rounded-xl opacity-80"
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={
                      worldview === "god" && readingMode === "transit"
                        ? "hidden"
                        : "space-y-2"
                    }
                  >
                    <Label className="text-xs text-slate-300">Birth date</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => update("date", e.target.value)}
                      className="border-white/10 bg-black/20 text-slate-100"
                    />
                  </div>
                  <div className={worldview === "god" ? "hidden" : "space-y-2"}>
                    <Label className="text-xs text-slate-300">Birth time</Label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={e => update("time", e.target.value)}
                      className="border-white/10 bg-black/20 text-slate-100"
                    />
                  </div>
                </div>
                <div
                  className={`${worldview === "god" || readingMode === "natal" ? "hidden" : "space-y-2 border-t border-cyan-200/10 pt-4"}`}
                >
                  <Label className="text-xs text-cyan-200">
                    Transit location
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={transitLocationQuery}
                      onChange={e => setTransitLocationQuery(e.target.value)}
                      className="border-cyan-200/10 bg-black/20 text-slate-100"
                      placeholder="Where are you now?"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={useResolvedTransit}
                      disabled={transitGeo.isFetching}
                      className="border-cyan-200/10 bg-cyan-100/5 px-3"
                      aria-label="Resolve transit location"
                    >
                      <MapPin className="h-4 w-4 text-cyan-300" />
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {form.transitLatitude
                      ? `${form.transitLatitude.toFixed(4)}°, ${form.transitLongitude.toFixed(4)}° · ${form.transitTimezone}`
                      : "Resolve a city to set transit coordinates and timezone."}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Transits use this location’s current houses, not the birth
                    location.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-cyan-200">
                        Transit date{" "}
                        <span className="font-normal text-slate-500">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        type="date"
                        value={form.transitDate}
                        onChange={e => update("transitDate", e.target.value)}
                        className="border-cyan-200/10 bg-black/20 text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-cyan-200">
                        Transit time{" "}
                        <span className="font-normal text-slate-500">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        type="time"
                        value={form.transitTime}
                        onChange={e => update("transitTime", e.target.value)}
                        className="border-cyan-200/10 bg-black/20 text-slate-100"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-cyan-200/70">
                    Leave both blank to use the current moment. Enter both to
                    inspect a specific past or future moment.
                  </p>
                </div>
                <div className="space-y-2 rounded-xl border border-cyan-200/15 bg-cyan-100/[.04] p-4">
                  <Label
                    htmlFor="initial-reading-question"
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200"
                  >
                    The Central Question · Who Am I?
                  </Label>
                  <Textarea
                    id="initial-reading-question"
                    value={readingQuestion}
                    onChange={event => setReadingQuestion(event.target.value)}
                    placeholder="For example: Who am I beneath the surface, and why do my relationships or life chapters keep repeating the same pattern?"
                    className="min-h-24 resize-y border-cyan-200/15 bg-black/20 text-slate-100 placeholder:text-slate-500"
                  />
                  <p className="text-[11px] leading-5 text-slate-500">
                    The First Layer is <strong>All About You</strong>. Ask a
                    serious question about yourself, or leave blank for a
                    complete self-knowledge investigation across all 16 systems.
                  </p>
                </div>
                {formError && (
                  <p className="rounded-xl border border-amber-200/20 bg-amber-200/[.06] px-3 py-2 text-xs leading-5 text-amber-100">
                    {formError}
                  </p>
                )}
                {geo.error && (
                  <p className="text-xs text-rose-300">{geo.error.message}</p>
                )}
                {calculate.error && (
                  <p className="text-xs text-rose-300">
                    {calculate.error.message}
                  </p>
                )}
                <Button
                  className="h-12 w-full bg-violet-500 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-400"
                  onClick={() => void calculateChart()}
                  disabled={calculate.isPending}
                >
                  {calculate.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Calculate Chart Data
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                  onClick={() => {
                    setForm(exampleChart);
                    setLocationQuery(exampleChart.location);
                    setTransitLocationQuery(exampleChart.transitLocation);
                    void calculateChart(worldview, readingMode, exampleChart);
                  }}
                >
                  Try an example chart
                </Button>
              </CardContent>
            </Card>
          </aside>
          <section className="min-w-0 space-y-6">
            {result && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs text-slate-400">
                <span className="font-medium text-slate-200">Chart ready</span>
                <span>
                  {new Date(result.utc)
                    .toISOString()
                    .replace("T", " ")
                    .slice(0, 16)}{" "}
                  UTC
                </span>
                <span>JD {result.julianDay.toFixed(5)}</span>
                <span className="text-emerald-300">
                  {result.validation.passed ? "Reference verified" : summary}
                </span>
              </div>
            )}
            {result ? (
              <>
                <div className="flex flex-col gap-2 border-b border-white/10 pb-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] text-violet-300">
                      Calculated field report
                    </div>
                    <h2 className="mt-2 font-serif text-3xl text-white">
                      {result.input.location}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      {result.worldview === "god"
                        ? "God View · fixed Aries–Pisces frame"
                        : result.worldview === "agent-vs-god"
                          ? "God's View of the Agent · dual houses"
                          : "Agent View · Geocentric + Equal House"}{" "}
                      · {result.houses.length} cusps
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShareModal(true)}
                      className="h-9 border-cyan-300/40 bg-gradient-to-r from-cyan-400/15 to-violet-400/15 px-3 text-cyan-200 hover:bg-cyan-400/25 gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5 text-cyan-300" />
                      <span>Export Share Card</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveCurrentChart}
                      disabled={saveChart.isPending}
                      className="h-9 border-cyan-200/25 bg-cyan-100/10 px-3 text-cyan-100 hover:bg-cyan-100/20"
                    >
                      {saveChart.isPending ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <BookmarkPlus className="mr-2 h-3.5 w-3.5" />
                      )}
                      {me.data ? "Save chart" : "Save to account"}
                    </Button>
                  </div>
                </div>
                <Card className="overflow-hidden border-cyan-300/20 bg-gradient-to-r from-cyan-300/[0.09] via-violet-300/[0.08] to-transparent text-slate-100 shadow-lg shadow-cyan-950/15">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                        <Sparkles className="h-4 w-4" /> AI chart guide
                      </div>
                      <h3 className="mt-2 font-serif text-2xl text-white">
                        Ask your natal + transit chart anything.
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Get a clear, chart-grounded answer about relationships,
                        work, timing, emotional patterns, or any placement and
                        aspect you want to understand.
                      </p>
                    </div>
                    <a
                      href="#ai-reading"
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-300/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/25"
                    >
                      Open AI guide
                    </a>
                  </CardContent>
                </Card>
                <ChartObservatory2050 chart={result} />
                <section className="space-y-5" aria-labelledby="master-chart-heading">
                  <div className="fg-module-banner">
                    <p className="fg-module-eyebrow">06 / THE MASTER LAYERS</p>
                    <h2 id="master-chart-heading" className="fg-module-title">
                      One chart, fully synthesized.
                    </h2>
                    <p className="fg-module-desc">
                      Inspect the unified God View and Agent View calculation, then ask the Master Synthesizer to turn the evidence into a coherent human reading.
                    </p>
                  </div>
                  <MasterChartObservatory chart={result} />
                  <MasterSynthesizerPanel
                    chart={result}
                    initialQuestion={readingQuestion}
                  />
                </section>
                <AdvancedChartInstruments chart={result} />
                {result.worldview === "god" && (
                  <div className="rounded-2xl border border-violet-300/25 bg-violet-950/20 p-5 text-sm text-slate-200">
                    <div className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      Universal God View Active · Fixed 0° Aries to 360° Pisces Houses
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-slate-300">
                      You are viewing the canonical geocentric frame (Aries = House 1 through Pisces = House 12) without a local horizon or Ascendant. Switch to{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setWorldview("agent-vs-god");
                          void calculateChart("agent-vs-god", readingMode);
                        }}
                        className="font-semibold text-cyan-300 underline hover:text-cyan-200"
                      >
                        God&apos;s View of the Agent
                      </button>{" "}
                      or{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setWorldview("agent");
                          void calculateChart("agent", readingMode);
                        }}
                        className="font-semibold text-cyan-300 underline hover:text-cyan-200"
                      >
                        Agent View
                      </button>{" "}
                      above to compare how these collective degrees translate into personal Equal Houses.
                    </p>
                  </div>
                )}
                <FrameRelationshipPanel rows={natalDisplayRows} />
                {result.transits.length > 0 && (
                  <FrameRelationshipPanel
                    rows={result.transits}
                    title="God's View of the Transit Agent"
                    intro="The same transit longitude is shown in the fixed collective frame and in the current observation houses. Transit Agent houses use the selected transit location."
                  />
                )}
                <LiveTransitFeed
                  chart={result}
                  onRefresh={refreshLiveTransit}
                  refreshing={calculate.isPending}
                />
                <details open={readingView === "evidence"} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-200 marker:hidden">
                    <span className="mr-2 text-cyan-300">＋</span>Detailed
                    placements and fixed stars{" "}
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      Optional technical reference
                    </span>
                  </summary>
                  <div className="mt-4 grid gap-6 2xl:grid-cols-2">
                    <Card className="overflow-hidden border-white/10 bg-white/[0.04] text-slate-100">
                      <CardHeader className="border-b border-white/10">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Sun className="h-4 w-4 text-violet-300" /> Moving
                          bodies & angles{" "}
                          <span className="ml-auto text-xs font-normal text-slate-500">
                            Tropical geocentric ·{" "}
                            <span className="text-cyan-300/70">
                              Hover a row to explore
                            </span>
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="overflow-x-auto p-0">
                        <table className="w-full min-w-[760px] text-left text-sm">
                          <thead className="bg-white/[0.035] text-[10px] uppercase tracking-[0.18em] text-slate-500">
                            <tr>
                              <th className="px-5 py-3">Body / angle</th>
                              <th className="px-5 py-3">Position</th>
                              <th className="px-5 py-3">House</th>
                              <th className="px-5 py-3">Locked overlays</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {natalDisplayRows.map(row => (
                              <tr
                                key={row.name}
                                className="transition-colors hover:bg-white/[0.035]"
                              >
                                <td className="px-3 py-3 sm:px-5 sm:py-4">
                                  <CalculationReveal row={row} kind="natal" />
                                  {row.retrograde && (
                                    <Badge className="ml-2 bg-rose-400/15 text-[10px] text-rose-200">
                                      R
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-5 py-4 font-mono text-violet-200">
                                  {row.display}
                                </td>
                                <td className="px-5 py-4">
                                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                                    {result.worldview === "god"
                                      ? `God House ${row.godHouse}`
                                      : `Agent House ${row.agentHouse ?? row.house}`}
                                  </span>
                                  {result.worldview === "agent-vs-god" && (
                                    <span className="ml-2 rounded-full bg-violet-200/10 px-2.5 py-1 text-xs text-violet-200">
                                      God {row.godHouse}
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  <OverlayCell row={row} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-amber-200/10 bg-amber-100/[0.035] text-slate-100">
                      <CardHeader className="border-b border-amber-200/10">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Star className="h-4 w-4 text-amber-300" /> Frozen
                          stars{" "}
                          <span className="ml-auto text-xs font-normal text-slate-500">
                            No precession applied ·{" "}
                            <span className="text-amber-200/70">
                              Hover a row to explore
                            </span>
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="overflow-x-auto p-0">
                        <table className="w-full min-w-[700px] text-left text-sm">
                          <thead className="bg-white/[0.035] text-[10px] uppercase tracking-[0.18em] text-slate-500">
                            <tr>
                              <th className="px-5 py-3">Star</th>
                              <th className="px-5 py-3">Immutable degree</th>
                              <th className="px-5 py-3">Local house</th>
                              <th className="px-5 py-3">
                                Star decan / overlays
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {result.frozenStars.map(row => (
                              <tr
                                key={row.name}
                                className="transition-colors hover:bg-white/[0.035]"
                              >
                                <td className="px-3 py-3 sm:px-5 sm:py-4">
                                  <CalculationReveal row={row} kind="star" />
                                </td>
                                <td className="px-5 py-4 font-mono text-amber-200">
                                  {row.display}
                                </td>
                                <td className="px-5 py-4">
                                  <span className="rounded-full bg-amber-200/10 px-2.5 py-1 text-xs">
                                    House {row.house}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <OverlayCell row={row} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-4">
                    <SovereignTeaserLock
                      title="Medieval Arabic Lots & Ptolemaic Essential Dignities"
                      description="Calculate the exact Part of Fortune, Part of Spirit, Lot of Eros, and planetary essential dignity scores (domicile, exaltation, triplicity, bounds, faces) according to traditional Hellenistic and Persian canons."
                      featureKey="arabic-lots"
                    />
                  </div>
                </details>
              </>
            ) : (
              <div className="relative flex min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-6 text-center">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60">
                  <div className="absolute h-[30rem] w-[30rem] rounded-full border border-cyan-300/10" />
                  <div className="absolute h-[22rem] w-[22rem] rounded-full border border-violet-300/10" />
                  <div className="absolute h-[14rem] w-[14rem] rounded-full border border-amber-200/10" />
                  <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent" />
                  <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-violet-200/10 to-transparent" />
                  <div className="absolute -top-4 left-8 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/30">
                    0° Aries / tropical frame
                  </div>
                  <div className="absolute bottom-6 right-8 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-200/30">
                    fixed star archive / locked
                  </div>
                </div>
                <div className="relative mb-6 rounded-full border border-violet-300/20 bg-violet-400/10 p-5">
                  <Sparkles className="h-8 w-8 text-violet-200" />
                </div>
                <h2 className="font-serif text-3xl text-white">
                  The chart is waiting for its moment.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                  Resolve a place and calculate a chart to reveal the moving
                  sky, local houses, and the immutable stars that frame it.
                </p>
              </div>
            )}
            {result && (
              <Card className="overflow-hidden border-cyan-200/10 bg-cyan-100/[0.035] text-slate-100">
                <CardHeader className="border-b border-cyan-200/10">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Compass className="h-4 w-4 text-cyan-300" /> Transit layer{" "}
                    <span className="ml-auto text-xs font-normal text-slate-500">
                      {result.input.transitDate && result.input.transitTime
                        ? "Selected moment"
                        : "Current sky"}{" "}
                      ·{" "}
                      {formatInZone(
                        result.transitDate,
                        result.input.transitTimezone ||
                          result.input.timezone ||
                          "UTC"
                      )}
                    </span>
                  </CardTitle>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-400">
                      Live moving bodies compared with this chart’s natal
                      placements. Houses use the natal cusps; contacts are major
                      aspects within a 3° orb.{" "}
                      <span className="text-cyan-300/70">
                        Hover a row to explore.
                      </span>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setReadingMode("combined");
                        document.getElementById("ai-reading")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="h-9 shrink-0 border-cyan-200/30 bg-cyan-300/10 px-3 text-xs text-cyan-100 hover:bg-cyan-300/20"
                    >
                      Open natal + transit reading
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-white/[0.035] text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Transit body</th>
                        <th className="px-5 py-3">Position</th>
                        <th className="px-5 py-3">Natal house</th>
                        <th className="px-5 py-3">Natal contacts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.transits.map(row => (
                        <tr
                          key={row.name}
                          className="transition-colors hover:bg-white/[0.035]"
                        >
                          <td className="px-3 py-3 sm:px-5 sm:py-4">
                            <CalculationReveal row={row} kind="transit" />
                            {row.retrograde && (
                              <Badge className="ml-2 bg-rose-400/15 text-[10px] text-rose-200">
                                R
                              </Badge>
                            )}
                          </td>
                          <td className="px-5 py-4 font-mono text-cyan-200">
                            {row.display}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-cyan-200/10 px-2.5 py-1 text-xs">
                              House {row.house}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <TransitContacts row={row} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
            {result && (
              <InterpretationPanel
                key={`${result.input.location || "god"}:${result.input.date || "live"}:${result.input.time || "none"}:${result.worldview}`}
                chart={result}
                initialMode={readingMode}
                initialQuestion={readingQuestion}
                onModeChange={nextMode => setReadingMode(nextMode)}
              />
            )}
          </section>
        </div>

        {/* Social Matrix & Loved Ones Intersect System */}
        <div id="social-loved-ones-section" className="mt-12 pt-8 border-t border-white/10">
          <SocialLovedOnesMatrix
            userChart={result}
            onAskMasterInterpreter={handleAskMasterInterpreter}
          />
        </div>
          </>
        )}

        {/* 2. Synastry & Chemistry Hub Tab */}
        {mainTab === "synastry" && (
          <SynastryMatrixTab
            userChart={result}
            onAskMasterInterpreter={handleAskMasterInterpreter}
            onOpenShareModal={() => setShowShareModal(true)}
          />
        )}

        {/* 3. 30/90-Day Cosmic Weather Tab */}
        {mainTab === "weather" && (
          <><div className="fg-module-banner"><p className="fg-module-eyebrow">03 / THE CELESTIAL WEATHER STATION</p><h2 className="fg-module-title">The sky in motion.</h2><p className="fg-module-desc">Follow calculated planetary movements through the same fixed-stellar and local chart framework. Current testimony and future sky positions remain distinct from guaranteed life events.</p></div>
          <TransitWeatherTimeline
            chart={result}
            onAskMasterInterpreter={handleAskMasterInterpreter}
          /></>
        )}

        {/* 4. Daily Audio Podcast Tab */}
        {mainTab === "podcast" && (
          <><div className="fg-module-banner"><p className="fg-module-eyebrow">04 / THE CELESTIAL VOICE</p><h2 className="fg-module-title">Listen to your observatory.</h2><p className="fg-module-desc">Your same evidence-first astrology becomes an audio-friendly reading without losing God View, Agent View, or the relationship between them.</p></div>
          <AudioPodcastBriefing
            chart={result}
            onAskMasterInterpreter={handleAskMasterInterpreter}
          /></>
        )}

        {/* 5. Loved Ones Social Matrix Tab */}
        {mainTab === "social" && (
          <><div className="fg-module-banner"><p className="fg-module-eyebrow">05 / THE CELESTIAL CONNECTIONS</p><h2 className="fg-module-title">The people in your orbit.</h2><p className="fg-module-desc">Consider two independent birth charts and the actual geometric connections between them. Respect individual privacy and keep symbolic readings distinct from verified human behavior.</p></div>
          <SocialLovedOnesMatrix
            userChart={result}
            onAskMasterInterpreter={handleAskMasterInterpreter}
          /></>
        )}
          </>
        )}
      </main>

      {/* 1-Tap Cosmic Share Card & Social Export Modal */}
      <CosmicShareCard
        open={showShareModal}
        onOpenChange={setShowShareModal}
        chart={result}
      />
    </div>
  );
}
