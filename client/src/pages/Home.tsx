import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Diamond, House, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import type { ProfileSection } from "@/config/profileNavigation";
import { trpc } from "@/lib/trpc";
import { ObservatorySoundscape } from "@/components/ObservatorySoundscape";
import { ProfileHomeScreen } from "@/components/ProfileHomeScreen";
import type { GuideTab } from "@/components/ProfileGuideScreen";
import { CosmicShareCard } from "@/components/CosmicShareCard";
import { NatalProfileBuilder, type UserProfileData, SAMPLE_PROFILE } from "@/components/NatalProfileBuilder";
import { SavedProfilePicker } from "@/components/SavedProfilePicker";
import type { Worldview } from "../../../server/astrologyCore";
import { Link, useLocation } from "wouter";
import { localDateTime } from "@/lib/transitTime";

const ProfileChartScreen = lazy(() => import("@/components/ProfileChartScreen").then(module => ({ default: module.ProfileChartScreen })));
const ProfileReadingScreen = lazy(() => import("@/components/ProfileReadingScreen").then(module => ({ default: module.ProfileReadingScreen })));
const ProfileGuideScreen = lazy(() => import("@/components/ProfileGuideScreen").then(module => ({ default: module.ProfileGuideScreen })));
const EnergyPage = lazy(() => import("@/pages/EnergyPage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));

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

function profileForm(profile: UserProfileData) {
  const hasTransit = Boolean(profile.transitLocation && profile.transitTimezone &&
    Number.isFinite(profile.transitLatitude) && Number.isFinite(profile.transitLongitude));
  return {
    location: profile.location, latitude: profile.latitude, longitude: profile.longitude,
    timezone: profile.timezone, date: profile.date, time: profile.time,
    transitLocation: hasTransit ? profile.transitLocation! : profile.location,
    transitLatitude: hasTransit ? profile.transitLatitude! : profile.latitude,
    transitLongitude: hasTransit ? profile.transitLongitude! : profile.longitude,
    transitTimezone: hasTransit ? profile.transitTimezone! : profile.timezone,
    transitDate: "", transitTime: "",
  };
}

type ReadingMode = "natal" | "transit" | "combined";
export default function Home({ section = "home" }: { section?: ProfileSection }) {
  const { profile: activeProfile, setProfile: setActiveProfile, saveEditedProfile, chart: result, setChart: setResult, energyChart, setEnergyChart, deviceProfilesCount, importDeviceProfiles } = useProfileSession();
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [worldview, setWorldview] = useState<Worldview>(result?.worldview ?? "agent");
  const [locationQuery, setLocationQuery] = useState("");
  const [transitLocationQuery, setTransitLocationQuery] = useState("");
  const [readingQuestion, setReadingQuestion] = useState("");
  const [readingMode, setReadingMode] = useState<ReadingMode>(result?.readingScope ?? "natal");
  const [showShareModal, setShowShareModal] = useState(false);
  const [, navigate] = useLocation();
  const [interpreterPrompt, setInterpreterPrompt] = useState<string | null>(() => {
    if (section !== "reading" || typeof window === "undefined") return null;
    try {
      const prompt = sessionStorage.getItem("fg:pending-interpreter-prompt");
      sessionStorage.removeItem("fg:pending-interpreter-prompt");
      return prompt;
    } catch { return null; }
  });

  const parseTab = (): GuideTab => {
    const tab = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("tab");
    return tab === "synastry" || tab === "weather" || tab === "podcast" || tab === "social" ? tab : "blueprint";
  };
  const [mainTab, setMainTab] = useState<GuideTab>(parseTab);
  useEffect(() => {
    const onSelect = (event: Event) => {
      const tab = (event as CustomEvent<{ tab: GuideTab }>).detail?.tab;
      if (["blueprint","synastry","weather","podcast","social"].includes(tab)) setMainTab(tab);
    };
    window.addEventListener("fg:select-tab", onSelect);
    return () => window.removeEventListener("fg:select-tab", onSelect);
  }, []);
  const [readingView, setReadingView] = useState<"guided" | "evidence">("guided");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleAskMasterInterpreter = (question: string) => {
    if (section !== "reading") {
      try { sessionStorage.setItem("fg:pending-interpreter-prompt", question); } catch {}
      navigate("/reading");
      return;
    }
    setInterpreterPrompt(question);
    document.getElementById("master-interpreter-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const geo = trpc.hybrid.geocode.useQuery(
    { query: locationQuery },
    { enabled: false, retry: false }
  );
  const transitGeo = trpc.hybrid.geocode.useQuery(
    { query: transitLocationQuery },
    { enabled: false, retry: false }
  );
  const currentProfile = useRef(activeProfile);
  currentProfile.current = activeProfile;
  const calculate = trpc.hybrid.calculate.useMutation({
    onSuccess: data => {
      const profile = currentProfile.current;
      if (profile && data.input.date === profile.date && data.input.time === profile.time &&
          data.input.latitude === profile.latitude && data.input.longitude === profile.longitude) setResult(data);
    },
    onError: (error) => {
      setResult(null);
      setFormError(`Chart calculation failed: ${error.message}`);
    },
  });
  const liveRequest = useRef(0);
  const liveCalculate = trpc.hybrid.calculate.useMutation();
  useEffect(() => {
    liveRequest.current += 1;
    return () => { liveRequest.current += 1; };
  }, [activeProfile]);
  const me = trpc.auth.me.useQuery();
  const saveChart = trpc.history.saveChart.useMutation();
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
    if (nextWorldview !== "god" && (!Number.isFinite(nextForm.latitude) || !Number.isFinite(nextForm.longitude) || Math.abs(nextForm.latitude) > 90 || Math.abs(nextForm.longitude) > 180)) {
      setFormError("Birth coordinates are invalid. Edit the profile and resolve the birth city again.");
      return;
    }
    if (nextForm.date && (!/^\d{4}-\d{2}-\d{2}$/.test(nextForm.date) || !Number.isFinite(Date.parse(`${nextForm.date}T00:00:00.000Z`)) || new Date(`${nextForm.date}T00:00:00.000Z`).toISOString().slice(0, 10) !== nextForm.date)) {
      setFormError("Birth date must be a valid YYYY-MM-DD date.");
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
      toast.info("Cloud chart history is paused until account sign-in is ready. Your birth profile remains saved on this device.");
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
    if (!activeProfile) return;
    const nextForm = profileForm(activeProfile);
    const transitTimezone = nextForm.transitTimezone || nextForm.timezone;
    let local;
    try { local = localDateTime(new Date(), transitTimezone); }
    catch { setFormError("The transit timezone is invalid. Resolve your current city again."); return; }
    const version = ++liveRequest.current;
    setFormError("");
    liveCalculate.mutate({
      ...nextForm,
      transitDate: local.date,
      transitTime: local.time,
      worldview,
      readingScope: "combined",
      birthTimeKnown: Boolean(nextForm.time),
    }, {
      onSuccess: data => { if (version === liveRequest.current) setEnergyChart(data); },
      onError: error => { if (version === liveRequest.current) setFormError(`Transit refresh failed: ${error.message}`); },
    });
  };
  const energyChartRef = useRef(energyChart);
  energyChartRef.current = energyChart;
  const needsLiveEnergy = section === "home" || section === "energy" || (section === "guide" && mainTab === "weather");
  useEffect(() => {
    if (!activeProfile || !needsLiveEnergy) return;
    const ENERGY_STALE_MS = 30 * 60 * 1000;
    const isStale = () => {
      const current = energyChartRef.current;
      return !current || current.worldview !== worldview || Date.now() - Date.parse(current.transitDate) >= ENERGY_STALE_MS;
    };
    if (isStale()) refreshLiveTransit();
    const id = window.setInterval(() => {
      if (isStale()) refreshLiveTransit();
    }, 5 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && isStale()) refreshLiveTransit();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [activeProfile, needsLiveEnergy, worldview]);

  const handleSaveProfile = async (newProfile: UserProfileData, previousProfile?: UserProfileData) => {
    if (previousProfile) saveEditedProfile(previousProfile, newProfile);
    else setActiveProfile(newProfile);
    const nextForm = {
      location: newProfile.location,
      latitude: newProfile.latitude,
      longitude: newProfile.longitude,
      timezone: newProfile.timezone,
      date: newProfile.date,
      time: newProfile.time,
      transitLocation: newProfile.transitLocation || newProfile.location,
      transitLatitude: newProfile.transitLatitude ?? newProfile.latitude,
      transitLongitude: newProfile.transitLongitude ?? newProfile.longitude,
      transitTimezone: newProfile.transitTimezone || newProfile.timezone,
      transitDate: "",
      transitTime: "",
    };
    setForm(nextForm);
    setLocationQuery(newProfile.location);
    setTransitLocationQuery(nextForm.transitLocation);
    // The first destination after saving a birth profile is always its natal wheel.
    setWorldview("agent-vs-god");
    setReadingMode("natal");
    navigate("/chart");
    // The profile effect calculates the saved natal chart from the new profile.
    setIsProfileModalOpen(false);
  };

  const handleEditProfile = async (updated: UserProfileData) => {
    await handleSaveProfile(updated, activeProfile ?? undefined);
  };

  const handleClearProfile = () => {
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
    setForm(exampleChart);
    setLocationQuery(exampleChart.location);
    setTransitLocationQuery(exampleChart.transitLocation);
    void calculateChart(worldview, readingMode, exampleChart);
  };

  useEffect(() => {
    if (!activeProfile) return;
    const next = profileForm(activeProfile);
    setForm(next);
    setLocationQuery(next.location);
    setTransitLocationQuery(next.transitLocation);
    if (!result) void calculateChart(worldview, "natal", next);
  }, [activeProfile]);
  return (
    <div className="relative min-h-screen isolate bg-transparent text-slate-100 selection:bg-violet-400/30">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(3,5,12,.10),rgba(3,5,12,.58)_62%,rgba(3,5,12,.86)),url('/assets/firmament-starfield.png')] bg-cover bg-top bg-fixed"
        aria-hidden="true"
      />
      <ObservatorySoundscape />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute right-[-12rem] top-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)] [background-size:64px_64px]" />
      </div>
      <main className="guardian-home-main relative z-10 mx-auto max-w-[1480px] px-5 py-6 md:px-10 md:py-10">
        <Suspense fallback={<p role="status" className="rounded-xl border border-cyan-200/20 bg-slate-950/70 p-5 text-sm text-cyan-100">Opening your celestial workspace…</p>}>
        {activeProfile && section === "chart" && (
          <ProfileChartScreen
            chart={result}
            calculating={calculate.isPending}
            worldview={worldview}
            readingMode={readingMode}
            onWorldviewChange={next => { setWorldview(next); void calculateChart(next, readingMode); }}
            onReadingModeChange={next => { setReadingMode(next); void calculateChart(worldview, next); }}
            error={formError || calculate.error?.message || ""}
          />
        )}

        {/* Core Natal Profile Building Gate - First Page Requirement */}
        {!activeProfile && (
          <>
            {deviceProfilesCount > 0 && <section className="mx-auto mb-8 max-w-2xl space-y-3 rounded-2xl border border-cyan-300/25 p-5 text-slate-200"><h2 className="font-serif text-xl">Your existing device profiles are safe</h2><p className="text-sm">Bring the profiles previously saved on this device into this account.</p><button type="button" onClick={importDeviceProfiles} className="rounded-xl border border-cyan-300/40 px-4 py-3 text-cyan-100">Import existing device profiles</button></section>}
            <NatalProfileBuilder
              mode="inline-gate"
              currentProfile={activeProfile}
              onSaveProfile={handleSaveProfile}
              onLoadSample={handleLoadSampleChart}
              isCalculating={calculate.isPending}
            />

          </>
        )}

        {/* Dedicated Profile Screen / Route (/profile) */}
        {activeProfile && section === "profile" && (
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-5 backdrop-blur-md">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-300 font-medium">Celestial Seeker Profile</p>
                <h1 className="text-2xl font-serif text-white mt-1">
                  {activeProfile.name}'s Natal Coordinates
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Born {activeProfile.date} at {activeProfile.birthTimeUnknown ? "12:00 PM (Untimed)" : activeProfile.time} in {activeProfile.location}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/chart"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-cyan-400/30 bg-cyan-950/40 text-cyan-200 hover:bg-cyan-900/40 transition-colors"
                >
                  <Diamond className="w-3.5 h-3.5 text-cyan-300" />
                  View Chart
                </Link>
                <Link
                  href="/life-story"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-violet-400/30 bg-violet-950/40 text-violet-200 hover:bg-violet-900/40 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                  Life Story
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <House className="w-3.5 h-3.5" />
                  Home
                </Link>
              </div>
            </div>

            <SavedProfilePicker onLoad={handleSaveProfile} />

            {deviceProfilesCount > 0 && <section className="mx-auto mb-8 max-w-2xl space-y-3 rounded-2xl border border-cyan-300/25 p-5 text-slate-200"><h2 className="font-serif text-xl">Your existing device profiles are safe</h2><p className="text-sm">Bring the profiles previously saved on this device into this account.</p><button type="button" onClick={importDeviceProfiles} className="rounded-xl border border-cyan-300/40 px-4 py-3 text-cyan-100">Import existing device profiles</button></section>}
            <NatalProfileBuilder
              mode="inline-gate"
              currentProfile={activeProfile}
              onSaveProfile={async (updated) => {
                await handleEditProfile(updated);
                navigate("/chart");
              }}
              onLoadSample={handleLoadSampleChart}
              isCalculating={calculate.isPending}
            />
          </div>
        )}

        {/* Modal for editing profile anytime */}
        {isProfileModalOpen && <NatalProfileBuilder
          mode="dialog"
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentProfile={activeProfile}
          onSaveProfile={handleEditProfile}
          onLoadSample={handleLoadSampleChart}
          isCalculating={calculate.isPending}
        />}

        {activeProfile && section === "home" && (
          <ProfileHomeScreen
            profile={activeProfile}
            chart={energyChart ?? result}
            calculating={calculate.isPending || liveCalculate.isPending}
            onEditProfile={() => setIsProfileModalOpen(true)}
            onSwitchProfile={handleClearProfile}
            onRefreshTransits={refreshLiveTransit}
          />
        )}
        {activeProfile && !result && (section === "reading" || section === "guide") && (
          <section role="status" className="mx-auto max-w-3xl rounded-2xl border border-cyan-200/20 bg-slate-950/75 p-6 text-slate-200">
            <h1 className="font-serif text-xl text-white">{section === "reading" ? "Preparing your personal reading" : "Preparing your celestial guide"}</h1>
            <p className="mt-3 text-sm">{calculate.isPending ? "Loading your calculated chart evidence…" : formError || calculate.error?.message || "Chart evidence is not yet available."}</p>
            <Link href="/chart" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-cyan-300/30 px-4 text-sm text-cyan-100">View chart status →</Link>
          </section>
        )}
        {result && (section === "reading" || section === "guide") && (
          <>
            {section === "reading" && (
              <ProfileReadingScreen
                chart={result}
                readingView={readingView}
                onReadingViewChange={setReadingView}
                readingMode={readingMode}
                readingQuestion={readingQuestion}
                interpreterPrompt={interpreterPrompt}
                onClearInterpreterPrompt={() => setInterpreterPrompt(null)}
                onLoadSampleChart={handleLoadSampleChart}
                onOpenProfileBuilder={() => setIsProfileModalOpen(true)}
                onReadingModeChange={setReadingMode}
              />
            )}
            {section === "guide" && (
              <ProfileGuideScreen
                result={mainTab === "weather" ? energyChart ?? result : result}
                mainTab={mainTab}
                setMainTab={setMainTab}
                worldview={worldview}
                setWorldview={setWorldview}
                readingMode={readingMode}
                setReadingMode={setReadingMode}
                calculateChart={calculateChart}
                refreshLiveTransit={refreshLiveTransit}
                saveCurrentChart={saveCurrentChart}
                savingChart={saveChart.isPending}
                calculating={calculate.isPending}
                readingView={readingView}
                hasAccount={Boolean(me.data)}
                setShowShareModal={setShowShareModal}
                handleAskMasterInterpreter={handleAskMasterInterpreter}
              />
            )}
          </>
        )}
        {activeProfile && section === "energy" && <EnergyPage onRefresh={refreshLiveTransit} calculating={liveCalculate.isPending} error={formError} />}
        {activeProfile && section === "explore" && <ExplorePage />}
        </Suspense>
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