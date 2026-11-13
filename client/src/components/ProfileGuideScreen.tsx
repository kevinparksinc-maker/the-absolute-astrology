import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BookmarkPlus, Calendar, Compass, Headphones, Heart, Layers, Loader2, Share2, Sparkles, Star, Sun, Users } from "lucide-react";
import { PersonalDiscoveryCarousel } from "@/components/PersonalDiscoveryCarousel";
import { AdvancedChartInstruments } from "@/components/AdvancedChartInstruments";
import { LiveTransitFeed } from "@/components/LiveTransitFeed";
import { FrameRelationshipPanel } from "@/components/FrameRelationshipPanel";
import { SocialLovedOnesMatrix } from "@/components/SocialLovedOnesMatrix";
import { SynastryMatrixTab } from "@/components/SynastryMatrixTab";
import { TransitWeatherTimeline } from "@/components/TransitWeatherTimeline";
import { AudioPodcastBriefing } from "@/components/AudioPodcastBriefing";
import { SovereignTeaserLock } from "@/components/SovereignTierModal";
import { formatInZone } from "../../../shared/time";
import { MAJOR_ASPECT_ORB_DEGREES } from "../../../shared/chartRules";
import type { ChartResult } from "../../../server/astronomy";
import type { ReadingScope, Worldview } from "../../../server/astrologyCore";

export type GuideTab = "blueprint" | "synastry" | "weather" | "podcast" | "social";

type Props = {
  result: ChartResult;
  mainTab: GuideTab;
  setMainTab: (tab: GuideTab) => void;
  worldview: Worldview;
  setWorldview: (frame: Worldview) => void;
  readingMode: ReadingScope;
  setReadingMode: (mode: ReadingScope) => void;
  calculateChart: (frame: Worldview, mode: ReadingScope) => void;
  refreshLiveTransit: () => void;
  saveCurrentChart: () => void;
  savingChart: boolean;
  calculating: boolean;
  readingView: "guided" | "evidence";
  hasAccount: boolean;
  setShowShareModal: (open: boolean) => void;
  handleAskMasterInterpreter: (question: string) => void;
};

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
      No major natal contact within {MAJOR_ASPECT_ORB_DEGREES}°
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
                  No major contact within {MAJOR_ASPECT_ORB_DEGREES}°.
                </div>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function ProfileGuideScreen({ result, mainTab, setMainTab, worldview, setWorldview,
  readingMode, setReadingMode, calculateChart, refreshLiveTransit, saveCurrentChart,
  savingChart, calculating, readingView, hasAccount, setShowShareModal, handleAskMasterInterpreter }: Props) {
  const summary = `${result.movingBodies.length} moving bodies · ${result.frozenStars.length} frozen stars · 12 ${result.worldview === "god" ? "fixed" : "personal"} houses`;
  const natalDisplayRows = [
    ...result.movingBodies,
    result.ascendant,
    result.descendant,
    result.midheaven,
    result.northNode,
    result.southNode,
  ].filter((row): row is NonNullable<typeof row> => Boolean(row));
  return <>

            <header className="mb-6 rounded-2xl border border-white/10 bg-black/30 p-5"><h1 className="font-serif text-2xl text-white">12 Gates of the Firmament</h1><p className="mt-2 text-sm text-slate-300">Explore celestial discoveries and the traditional evidence behind your chart.</p></header>
            {/* Primary Cosmos Navigation Tabs */}
            <div id="main-cosmos-tabs" className="fg-celestial-tabs mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => { setMainTab("blueprint"); document.getElementById("main-cosmos-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
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
            onClick={() => { setMainTab("synastry"); document.getElementById("main-cosmos-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
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
            onClick={() => { setMainTab("weather"); document.getElementById("main-cosmos-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              mainTab === "weather"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calendar className="h-4 w-4 text-cyan-300" />
            <span>3. Immediate Cosmic Weather (Now–7 Days)</span>
          </button>

          <button
            type="button"
            onClick={() => { setMainTab("podcast"); document.getElementById("main-cosmos-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
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
            onClick={() => { setMainTab("social"); document.getElementById("main-cosmos-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
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
            <section aria-label="Personal celestial discoveries" className="mb-8">
              <PersonalDiscoveryCarousel chart={result} />
            </section>

        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">

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
                      disabled={savingChart}
                      className="h-9 border-cyan-200/25 bg-cyan-100/10 px-3 text-cyan-100 hover:bg-cyan-100/20"
                    >
                      {savingChart ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <BookmarkPlus className="mr-2 h-3.5 w-3.5" />
                      )}
                      {hasAccount ? "Save chart" : "Save to account"}
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
                  refreshing={calculating}
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
                      aspects within a {MAJOR_ASPECT_ORB_DEGREES}° orb.{" "}
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

          </section>
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

        {/* 3. Immediate Cosmic Weather (Now–7 Days) Tab */}
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

  </>;
}
