import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  ChevronRight,
  Compass,
  Layers3,
  Loader2,
  Map,
  MapPin,
  Orbit,
  RefreshCw,
  Sparkles,
  Stars,
  UserCheck,
} from "lucide-react";
import { Link } from "wouter";
import { ThreeLayerOrrery } from "@/components/ThreeLayerOrrery";
import { OVERLAY_MAP_SPECS } from "@/design/overlayMapSpecs";
import { ObservatorySoundscape } from "@/components/ObservatorySoundscape";
import { LiveTransitFeed } from "@/components/LiveTransitFeed";
import { BehavioralIntelligencePanel } from "@/components/BehavioralIntelligencePanel";
import { FrameRelationshipPanel } from "@/components/FrameRelationshipPanel";
import { InterpretationPanel } from "@/components/InterpretationPanel";
import { SkyObservatoryWheel } from "@/components/SkyObservatoryWheel";
import { ChartWheel } from "@/components/ChartWheel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";
import type { ReadingScope, Worldview } from "../../../server/astrologyCore";
import {
  DECANS,
  MANAZIL,
  NAKSHATRAS,
  formatLongitude,
  overlay,
  ZODIAC_SIGNS,
} from "../../../shared/hybrid";

const OVERLAY_COLORS: Record<string, string> = {
  Zodiac: "#f8fafc",
  Nakshatra: "#f59e0b",
  Manazil: "#a855f7",
  Decan: "#06b6d4",
};

const NAKSHATRA_MEANINGS: Record<string, string> = {
  Ashwini: "Beginnings, healing, speed, and the instinct to initiate.",
  Bharani: "Containment, responsibility, transformation, and carrying what must mature.",
  Krittika: "Discernment, purification, courage, and the cutting away of excess.",
  Rohini: "Growth, beauty, nourishment, creativity, and making something thrive.",
  Mrigashira: "Searching, curiosity, gentleness, and following a promising trail.",
  Ardra: "Storms, emotional release, truth-telling, and renewal after disruption.",
  Punarvasu: "Return, restoration, hope, and finding the way back to what is essential.",
  Pushya: "Nourishment, protection, teaching, and steady spiritual or practical growth.",
  Ashlesha: "Perception, entwining, psychological depth, and the power to shed an old skin.",
  Magha: "Ancestry, dignity, authority, legacy, and honoring what came before.",
  "Purva Phalguni": "Pleasure, rest, creativity, romance, and enjoying the fruits of effort.",
  "Uttara Phalguni": "Commitment, friendship, agreements, generosity, and sustaining what is worthwhile.",
  Hasta: "Skill, craftsmanship, organization, healing hands, and shaping circumstances.",
  Chitra: "Design, beauty, vision, vitality, and making an inner image visible.",
  Swati: "Independence, movement, flexibility, and learning to stand in one’s own wind.",
  Vishakha: "Focus, ambition, branching choices, and dedication toward a defining goal.",
  Anuradha: "Devotion, friendship, cooperation, and perseverance through relationship.",
  Jyeshtha: "Maturity, protection, seniority, discernment, and responsible power.",
  Mula: "Roots, investigation, uprooting, truth beneath appearances, and radical reset.",
  "Purva Ashadha": "Conviction, cleansing, confidence, and the first wave of victory.",
  "Uttara Ashadha": "Endurance, integrity, universal principles, and lasting achievement.",
  Shravana: "Listening, learning, transmission, stories, and understanding through attention.",
  Dhanishta: "Rhythm, resources, community, timing, and the ability to coordinate action.",
  Shatabhisha: "Healing, solitude, pattern recognition, and uncovering what is hidden.",
  "Purva Bhadrapada": "Intensity, ideals, sacrifice, and transforming a passionate vision.",
  "Uttara Bhadrapada": "Depth, patience, compassion, and holding steady through profound change.",
  Revati: "Guidance, safe passage, completion, nourishment, and preparing for a new cycle.",
};

const MANZIL_MEANINGS: Record<string, string> = {
  "Al-Sharatain": "The Two Signals — decisive beginnings, movement, and opening a new path.",
  "Al-Butain": "The Little Belly — quiet gathering of resources, inner warmth, and hidden preparation.",
  "Al-Thurayya": "The Pleiades — abundance, synthesis, craft, and luminous assembly.",
  "Al-Dabaran": "The Follower (Aldebaran) — steady pursuit, endurance, and testing integrity.",
  "Al-Haq'ah": "The White Spot — clarity of mind, study, and returning to core truth.",
  "Al-Han'ah": "The Brand — partnership, mark of commitment, and mutual reliance.",
  "Al-Dhira": "The Forearm — reach, practical aid, and earned breakthrough.",
  "Al-Nathrah": "The Crib — shelter, family loyalty, nourishment, and deep belonging.",
  "Al-Tarf": "The Glance — vigilance, boundary awareness, and selective trust.",
  "Al-Jabhah": "The Forehead (Regulus) — sovereignty, heart courage, and leadership under pressure.",
  "Al-Zubrah": "The Mane — strength, noble bearing, and consolidation of effort.",
  "Al-Sarfah": "The Changer of Weather — turning points, seasonal transition, and adaptation.",
  "Al-Awwa": "The Barker — articulate counsel, diplomacy, and protective alert.",
  "Al-Simak": "The Unarmed (Spica) — grace, harvest, skill, and refined gift.",
  "Al-Ghafr": "The Covering — veiled wisdom, private inquiry, and quiet reconciliation.",
  "Al-Zubana": "The Claws — weighing value, restitution, and decisive balance.",
  "Al-Iklil": "The Crown — honor earned through trial, focus, and loyalty.",
  "Al-Qalb": "The Heart of the Scorpion (Antares) — fearless depth, crisis mastery, and core truth.",
  "Al-Shaulah": "The Raised Tail — incisive action, release of poison, and breakthrough.",
  "Al-Na'am": "The Ostriches — long-range stride, philosophical reach, and resilience.",
  "Al-Baldah": "The City — quiet desert sanctuary, self-sufficiency, and contemplation.",
  "Sa'd al-Dhabih": "The Lucky One of the Sacrificer — disciplined release for a higher aim.",
  "Sa'd Bula": "The Lucky One of the Swallower — assimilation of experience and quiet recovery.",
  "Sa'd al-Su'ud": "The Luck of Lucks — vital renewal, flowing favor, and emerging hope.",
  "Sa'd al-Akhbiyah": "The Lucky Stars of the Tents — hidden germination and protected shelter.",
  "Al-Fargh al-Muqaddam": "The First Spout — pouring forth vision, generosity, and creative flow.",
  "Al-Fargh al-Mu'akhkhar": "The Second Spout — completing the vessel, endurance, and synthesis.",
  "Batn al-Hut": "The Belly of the Fish — safe harbor, spiritual completion, and return to origin.",
};

const DECAN_RULER_MEANINGS: Record<string, string> = {
  Mars: "Mars emphasizes initiative, heat, courage, competition, and direct action.",
  Sun: "The Sun emphasizes vitality, visibility, confidence, leadership, and creative expression.",
  Venus: "Venus emphasizes attraction, pleasure, harmony, aesthetics, and relationship.",
  Mercury: "Mercury emphasizes language, learning, trade, analysis, and adaptable intelligence.",
  Moon: "The Moon emphasizes feeling, memory, nourishment, instinct, and changing conditions.",
  Saturn: "Saturn emphasizes structure, patience, boundaries, responsibility, and long-term work.",
  Jupiter: "Jupiter emphasizes growth, meaning, generosity, wisdom, and expanded perspective.",
};

const PLANET_MARKERS: Record<string, { glyph: string; color: string }> = {
  Moon: { glyph: "☽", color: "#f8fafc" },
  Sun: { glyph: "☉", color: "#f59e0b" },
  Mercury: { glyph: "☿", color: "#38bdf8" },
  Venus: { glyph: "♀", color: "#f472b6" },
  Mars: { glyph: "♂", color: "#fb7185" },
  Jupiter: { glyph: "♃", color: "#c084fc" },
  Saturn: { glyph: "♄", color: "#94a3b8" },
};

const DEFAULT_PROFILE = {
  location: "Dallas, Texas, USA",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
};

function OverlayMap({
  moonLongitude,
  chart,
}: {
  moonLongitude: number;
  chart: ChartResult | null;
}) {
  const [active, setActive] = useState<"Zodiac" | "Nakshatra" | "Manazil" | "Decan">("Nakshatra");
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [focusedBody, setFocusedBody] = useState<string>("Moon");

  const bodies = useMemo(() => {
    const source =
      chart?.transits && chart.transits.length > 0
        ? chart.transits
        : chart?.movingBodies ?? [];
    return source.filter(b => PLANET_MARKERS[b.name]);
  }, [chart]);

  const activeBodyRow =
    bodies.find(b => b.name === focusedBody) ??
    bodies.find(b => b.name === "Moon");
  const cursorLongitude = activeBodyRow?.longitude ?? moonLongitude;

  const spec =
    OVERLAY_MAP_SPECS.find(item => item.name === active) ??
    OVERLAY_MAP_SPECS[0];
  const segments = spec.segmentCount;
  const liveSegment = Math.min(
    segments - 1,
    Math.floor(cursorLongitude / spec.unitWidthDegrees)
  );
  const inspectedSegment = selectedSegment ?? liveSegment;
  const segmentStart = inspectedSegment * spec.unitWidthDegrees;
  const segmentEnd = segmentStart + spec.unitWidthDegrees;
  const zodiacSign = ZODIAC_SIGNS[Math.floor(cursorLongitude / 30) % 12];
  const cursorOverlay = overlay(cursorLongitude);

  const selectedName =
    active === "Nakshatra"
      ? (NAKSHATRAS[inspectedSegment] ?? "Nakshatra")
      : active === "Manazil"
        ? (MANAZIL[inspectedSegment] ?? "Manzil")
        : active === "Decan"
          ? (DECANS[inspectedSegment] ?? "Decan")
          : (ZODIAC_SIGNS[inspectedSegment] ?? "Zodiac sign");

  const decanRuler = selectedName.split(" ")[0] ?? "Mars";
  const selectedMeaning =
    active === "Nakshatra"
      ? (NAKSHATRA_MEANINGS[selectedName] ??
        "A named 13°20′ lunar mansion in the 27-part Vedic Nakshatra cycle.")
      : active === "Manazil"
        ? (MANZIL_MEANINGS[selectedName] ??
          "A traditional Arabic lunar station (12°51′) used to track the Moon’s passage through the fixed sky.")
        : active === "Decan"
          ? `${DECAN_RULER_MEANINGS[decanRuler] ?? "A traditional planetary ruler marks the tone of this section."} This is the ${selectedName.replace(`${decanRuler} `, "")} decan: one of three 10° faces within its zodiac sign.`
          : "A 30° tropical zodiac sign: the shared geocentric reference band anchoring all four overlay traditions.";

  const bodiesInSelectedSegment = bodies.filter(
    b =>
      b.longitude >= segmentStart &&
      b.longitude < (segmentEnd > 360 ? 360 : segmentEnd)
  );

  return (
    <section className="space-y-5" id="overlay-map">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Synchronized 360° Celestial Atlas
          </div>
          <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl">
            Multi-Tradition Sky Overlay Maps
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">
            Inspect how the exact same astronomical degree simultaneously
            activates the 12 Tropical Signs, 27 Vedic Nakshatras, 28 Arabic
            Manazil, and 36 Hellenistic Decans.
          </p>
        </div>

        {/* Interactive Tradition Selector */}
        <div className="flex gap-1.5 rounded-xl border border-slate-800 bg-[#0b101b] p-1">
          {OVERLAY_MAP_SPECS.map(item => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setActive(item.name);
                setSelectedSegment(null);
              }}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                item.name === active
                  ? "text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              style={
                item.name === active
                  ? { backgroundColor: OVERLAY_COLORS[item.name] }
                  : undefined
              }
            >
              {item.name} ({item.segmentCount})
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#070b14] p-4 sm:p-6">
        {/* Tracked Body Selector Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-2 text-xs font-medium text-slate-400">
              Lock Cursor to Body:
            </span>
            {bodies.map(b => {
              const meta = PLANET_MARKERS[b.name]!;
              const isFocused = (activeBodyRow?.name ?? "Moon") === b.name;
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => {
                    setFocusedBody(b.name);
                    setSelectedSegment(null);
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    isFocused
                      ? "border-cyan-400/60 bg-cyan-950/40 text-white"
                      : "border-slate-800 bg-[#0b101b] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span style={{ color: meta.color }}>{meta.glyph}</span>
                  <span>{b.name}</span>
                  <span className="font-mono text-[10px] tabular-nums text-slate-400">
                    {b.longitude.toFixed(1)}°
                  </span>
                </button>
              );
            })}
          </div>
          <span className="font-mono text-xs tabular-nums text-cyan-300">
            {activeBodyRow?.name ?? "Moon"} at {formatLongitude(cursorLongitude)}
          </span>
        </div>

        {/* Synchronized 4-Band Spectrographic Celestial Ribbon */}
        <div className="space-y-2">
          {OVERLAY_MAP_SPECS.map(bandSpec => {
            const isSelectedBand = bandSpec.name === active;
            const bandColor = OVERLAY_COLORS[bandSpec.name];
            const bandLiveIdx = Math.min(
              bandSpec.segmentCount - 1,
              Math.floor(cursorLongitude / bandSpec.unitWidthDegrees)
            );
            return (
              <div
                key={bandSpec.name}
                className={`relative rounded-xl border transition ${
                  isSelectedBand
                    ? "border-slate-700 bg-[#0d1424]"
                    : "border-slate-800/60 bg-[#090d18] opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between px-3 py-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setActive(bandSpec.name);
                      setSelectedSegment(null);
                    }}
                    className="flex items-center gap-2 font-semibold text-slate-200 hover:text-white"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: bandColor }}
                    />
                    <span>{bandSpec.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {bandSpec.segmentCount} divisions · {bandSpec.sourceLabel}
                    </span>
                  </button>
                  <span className="font-mono text-[11px] tabular-nums text-slate-300">
                    {bandSpec.name === "Nakshatra"
                      ? `${cursorOverlay.nakshatra} (Pada ${cursorOverlay.pada})`
                      : bandSpec.name === "Manazil"
                        ? cursorOverlay.manzil
                        : bandSpec.name === "Decan"
                          ? cursorOverlay.decan
                          : zodiacSign}
                  </span>
                </div>

                <div
                  className={`relative w-full overflow-hidden border-t border-slate-800/80 ${
                    isSelectedBand ? "h-14" : "h-8"
                  }`}
                >
                  {Array.from({ length: bandSpec.segmentCount }).map(
                    (_, index) => {
                      const isInspected =
                        isSelectedBand && index === inspectedSegment;
                      const isLiveHere = index === bandLiveIdx;
                      return (
                        <button
                          key={index}
                          type="button"
                          aria-label={`Inspect ${bandSpec.name} segment ${index + 1}`}
                          onClick={() => {
                            setActive(bandSpec.name);
                            setSelectedSegment(index);
                          }}
                          className={`absolute inset-y-0 border-r border-slate-800/80 transition ${
                            isInspected
                              ? "bg-white/[0.16]"
                              : isLiveHere
                                ? "bg-white/[0.08]"
                                : "hover:bg-white/[0.06]"
                          }`}
                          style={{
                            left: `${(index / bandSpec.segmentCount) * 100}%`,
                            width: `${100 / bandSpec.segmentCount}%`,
                          }}
                        >
                          <span
                            className="absolute left-0 top-1/2 h-4 w-px -translate-y-1/2"
                            style={{
                              backgroundColor: bandColor,
                              opacity:
                                isInspected || isLiveHere
                                  ? 1
                                  : index % 3 === 0
                                    ? 0.65
                                    : 0.25,
                            }}
                          />
                        </button>
                      );
                    }
                  )}

                  {/* All Planetary Cursors on Active Band */}
                  {bodies.map(b => {
                    const meta = PLANET_MARKERS[b.name]!;
                    const isPrimary =
                      (activeBodyRow?.name ?? "Moon") === b.name;
                    return (
                      <div
                        key={b.name}
                        className="pointer-events-none absolute bottom-0 top-0"
                        style={{ left: `${(b.longitude / 360) * 100}%` }}
                      >
                        <div
                          className="h-full w-px"
                          style={{
                            backgroundColor: isPrimary ? "#ffffff" : meta.color,
                            opacity: isPrimary ? 1 : 0.45,
                          }}
                        />
                        {isSelectedBand && (
                          <span
                            className="absolute top-1 -translate-x-1/2 rounded px-1 py-0.5 font-mono text-[9px] font-bold leading-none"
                            style={{
                              backgroundColor: isPrimary
                                ? bandColor
                                : "#0b101b",
                              color: isPrimary ? "#020617" : meta.color,
                              border: isPrimary
                                ? "none"
                                : `1px solid ${meta.color}`,
                            }}
                          >
                            {meta.glyph}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Degree Ruler Footer */}
        <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-slate-500">
          <span>0° Aries</span>
          <span>90° Cancer</span>
          <span>180° Libra</span>
          <span>270° Capricorn</span>
          <span>360° Pisces</span>
        </div>

        {/* Detailed Segment Telemetry Card */}
        <div className="mt-5 grid gap-4 rounded-xl border border-slate-800 bg-[#0b101b] p-4 sm:grid-cols-[minmax(0,1fr)_280px] sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: OVERLAY_COLORS[active] }}
              />
              <span className="font-semibold text-white">{spec.name}</span>
              <span>·</span>
              <span className="font-mono tabular-nums text-cyan-300">
                Division {inspectedSegment + 1} of {spec.segmentCount}
              </span>
              <span>·</span>
              <span className="font-mono tabular-nums text-slate-400">
                {formatLongitude(segmentStart)} –{" "}
                {formatLongitude(segmentEnd % 360)}
              </span>
            </div>

            <h3 className="mt-2 font-serif text-2xl text-white">
              {selectedName}
              {active === "Nakshatra" && inspectedSegment === liveSegment
                ? ` · Pada ${cursorOverlay.pada}`
                : ""}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {selectedMeaning}
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#070b14] p-3.5 text-xs">
            <div>
              <div className="font-semibold text-slate-300">
                Active Occupants in This Division
              </div>
              {bodiesInSelectedSegment.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {bodiesInSelectedSegment.map(b => (
                    <li
                      key={b.name}
                      className="flex items-center justify-between font-mono text-slate-200"
                    >
                      <span>
                        {PLANET_MARKERS[b.name]?.glyph} {b.name}
                      </span>
                      <span className="tabular-nums text-cyan-300">
                        {b.display}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-slate-500">
                  No major planets currently occupy this segment. Tap the
                  highlighted cursor division to follow{" "}
                  {activeBodyRow?.name ?? "the Moon"}.
                </p>
              )}
            </div>
            {selectedSegment !== null && selectedSegment !== liveSegment && (
              <button
                type="button"
                onClick={() => setSelectedSegment(null)}
                className="mt-3 w-full rounded-lg border border-cyan-400/30 bg-cyan-950/30 py-1.5 text-center font-medium text-cyan-200 hover:bg-cyan-950/50"
              >
                Re-center on {activeBodyRow?.name ?? "Moon"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SkyHomePrototype() {
  const [screen, setScreen] = useState<"home" | "orrery" | "maps" | "guide">(
    "home"
  );
  const [worldview, setWorldview] = useState<Worldview>("agent-vs-god");
  const [readingScope, setReadingScope] = useState<ReadingScope>("combined");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [locationInput, setLocationInput] = useState(DEFAULT_PROFILE.location);
  const [guideQuestion, setGuideQuestion] = useState(
    "Who am I beneath the surface, and how does the current sky interact with my core patterns?"
  );
  const [activeChart, setActiveChart] = useState<ChartResult | null>(null);
  const [xyzText, setXyzText] = useState("");
  const [xyzPositions, setXyzPositions] = useState<Record<string, { x: number; y: number; z: number }> | undefined>();
  const [xyzError, setXyzError] = useState("");
  const applyXYZ = () => {
    try {
      if (!xyzText.trim()) {
        setXyzPositions(undefined);
        setXyzError("");
        loadSky(worldview, readingScope, profile, null);
        return;
      }
      const value: unknown = JSON.parse(xyzText);
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Enter an object keyed by planet name.");
      const parsed: Record<string, { x: number; y: number; z: number }> = {};
      for (const [name, vector] of Object.entries(value)) {
        if (!["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"].includes(name)) throw new Error(`Unknown planet: ${name}`);
        if (!vector || typeof vector !== "object" || Array.isArray(vector)) throw new Error(`Invalid vector for ${name}`);
        const v = vector as Record<string, unknown>;
        if (![v.x, v.y, v.z].every(n => typeof n === "number" && Number.isFinite(n)) || Math.hypot(v.x as number, v.y as number) === 0) throw new Error(`Invalid XYZ for ${name}`);
        parsed[name] = { x: v.x as number, y: v.y as number, z: v.z as number };
      }
      if (!Object.keys(parsed).length) throw new Error("At least one planetary vector is required.");
      setXyzPositions(parsed);
      setXyzError("");
      loadSky(worldview, readingScope, profile, parsed);
    } catch (error) {
      setXyzError(error instanceof Error ? error.message : "Invalid XYZ JSON");
    }
  };

  const geo = trpc.hybrid.geocode.useQuery(
    { query: locationInput },
    { enabled: false, retry: false }
  );
  const calculateMutation = trpc.hybrid.calculate.useMutation({
    onSuccess: setActiveChart,
  });

  const loadSky = (
    nextWorldview: Worldview = worldview,
    nextScope: ReadingScope = readingScope,
    nextProfile = profile,
    nextXYZ: typeof xyzPositions | null = xyzPositions
  ) => {
    const now = new Date();
    const transitDate = now.toISOString().slice(0, 10);
    const transitTime = now.toISOString().slice(11, 16);

    if (nextWorldview === "god") {
      calculateMutation.mutate({
        location: nextProfile.location || "God View",
        latitude: 0,
        longitude: 0,
        timezone: "UTC",
        date: nextProfile.date || "1986-11-20",
        time: nextProfile.time || "",
        transitLocation: "God View",
        transitLatitude: 0,
        transitLongitude: 0,
        transitTimezone: "UTC",
        transitDate,
        transitTime,
        worldview: "god",
        readingScope: nextScope,
        ...(nextXYZ ? { xyzPositions: nextXYZ } : {}),
        birthTimeKnown: Boolean(nextProfile.time),
      });
    } else {
      calculateMutation.mutate({
        ...nextProfile,
        transitLocation: nextProfile.location,
        transitLatitude: nextProfile.latitude,
        transitLongitude: nextProfile.longitude,
        transitTimezone: nextProfile.timezone,
        transitDate,
        transitTime,
        worldview: nextWorldview,
        readingScope: nextScope,
        ...(nextXYZ ? { xyzPositions: nextXYZ } : {}),
        birthTimeKnown: Boolean(nextProfile.time),
      });
    }
  };

  useEffect(() => {
    loadSky("agent-vs-god", "combined", DEFAULT_PROFILE);
  }, []);

  useEffect(() => {
    if (readingScope === "natal" || screen === "guide") return;
    const id = window.setInterval(
      () => loadSky(worldview, readingScope, profile),
      5 * 60 * 1000
    );
    return () => window.clearInterval(id);
  }, [worldview, readingScope, profile, screen]);

  const resolveAndLoadPersonalSky = async () => {
    let next = { ...profile };
    if (locationInput.trim() && locationInput !== profile.location) {
      const res = await geo.refetch();
      if (res.data) {
        next = {
          ...next,
          location: res.data.label,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          timezone: res.data.timezone,
        };
        setProfile(next);
      }
    }
    loadSky(worldview, readingScope, next);
  };

  const moonLongitude =
    activeChart?.transits.find(row => row.name === "Moon")?.longitude ??
    activeChart?.movingBodies.find(row => row.name === "Moon")?.longitude ??
    0;

  const nav = [
    { key: "home" as const, label: "Living Sky", icon: Stars },
    { key: "orrery" as const, label: "Three-Layer Orrery", icon: Orbit },
    { key: "maps" as const, label: "Celestial Atlas", icon: Map },
    { key: "guide" as const, label: "Guide & Self-Knowledge", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-400/25">
      <ObservatorySoundscape />

      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/90 bg-[#07090e]/95 px-5 py-3.5 backdrop-blur-md md:px-10">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-white"
        >
          Bible Believers Astrology
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex"
          aria-label="Sky observatory views"
        >
          {nav.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setScreen(item.key)}
              className={`whitespace-nowrap border-b-2 py-1 transition-colors ${
                screen === item.key
                  ? "border-cyan-400 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setScreen("guide")}
            className="whitespace-nowrap rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open Guide & Patterns
          </button>
          <Link
            href="/"
            className="whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Chart Studio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-24 pt-6 sm:px-6 md:px-10 md:pb-16">
        {/* Observatory Calibration & Personal Profile Bar */}
        <section className="rounded-2xl border border-slate-800 bg-[#0b101b] p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-cyan-300">
                  THE FIRMAMENT · Know Yourself Through the Patterns
                </span>
                <span>·</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {activeChart
                    ? `${activeChart.input.location || "God View"} · JD ${activeChart.julianDay.toFixed(4)}`
                    : "Calibrating Ephemeris…"}
                </span>
              </div>
              <h1 className="mt-2 max-w-2xl font-serif text-3xl text-white sm:text-4xl">
                The Living Sky & Self-Knowledge Observatory
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Inspect your natal foundation, present transit sky, and the
                universal God View side by side—then open the{" "}
                <strong className="text-slate-200">
                  All About You · Pattern Intelligence
                </strong>{" "}
                and <strong className="text-slate-200">Master Guide</strong>{" "}
                built directly around your chart.
              </p>
            </div>

            {/* Frame Switcher (Worldview + Scope) + Quick Birth Profile Controls */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-[#070b14] p-4 sm:min-w-[480px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Worldview Selector: Agent View / God View / God+Agent */}
                <div
                  className="flex gap-1 rounded-lg border border-slate-800 bg-[#0b101b] p-1"
                  role="tablist"
                  aria-label="Worldview frame selector"
                >
                  {(
                    [
                      { value: "agent", label: "Agent View" },
                      { value: "god", label: "God View" },
                      { value: "agent-vs-god", label: "God + Agent View" },
                    ] as const
                  ).map(item => (
                    <button
                      key={item.value}
                      type="button"
                      role="tab"
                      aria-selected={worldview === item.value}
                      onClick={() => {
                        setWorldview(item.value);
                        loadSky(item.value, readingScope, profile);
                      }}
                      className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                        worldview === item.value
                          ? "bg-violet-500 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Reading Scope Selector: Natal / Natal + Transit / Transit */}
                <div
                  className="flex gap-1 rounded-lg border border-slate-800 bg-[#0b101b] p-1"
                  role="tablist"
                  aria-label="Reading scope selector"
                >
                  {(
                    [
                      { value: "natal", label: "Natal" },
                      { value: "combined", label: "Natal + Transit" },
                      { value: "transit", label: "Transit" },
                    ] as const
                  ).map(item => (
                    <button
                      key={item.value}
                      type="button"
                      role="tab"
                      aria-selected={readingScope === item.value}
                      onClick={() => {
                        setReadingScope(item.value);
                        loadSky(worldview, item.value, profile);
                      }}
                      className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                        readingScope === item.value
                          ? "bg-cyan-400 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadSky(worldview, readingScope, profile)}
                  disabled={calculateMutation.isPending}
                  className="border-slate-700 bg-slate-900 text-xs text-slate-200 hover:bg-slate-800"
                >
                  {calculateMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_130px_96px_auto]">
                <Input
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  placeholder="Birth city (e.g. Dallas, TX)"
                  disabled={worldview === "god"}
                  className="h-9 border-slate-800 bg-[#0b101b] text-xs text-slate-100 disabled:opacity-50"
                />
                <Input
                  type="date"
                  value={profile.date}
                  onChange={e =>
                    setProfile(p => ({ ...p, date: e.target.value }))
                  }
                  className="h-9 border-slate-800 bg-[#0b101b] font-mono text-xs text-slate-100"
                />
                <Input
                  type="time"
                  value={profile.time}
                  onChange={e =>
                    setProfile(p => ({ ...p, time: e.target.value }))
                  }
                  disabled={worldview === "god"}
                  className="h-9 border-slate-800 bg-[#0b101b] font-mono text-xs text-slate-100 disabled:opacity-50"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={resolveAndLoadPersonalSky}
                  disabled={calculateMutation.isPending || geo.isFetching}
                  className="h-9 whitespace-nowrap bg-violet-500 px-3 text-xs font-semibold text-white hover:bg-violet-400"
                >
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* VIEW 1: LIVING SKY OVERVIEW (Orrery + Atlas + Quick Access to Guide) */}
        {screen === "home" && (
          <div className="space-y-8">
            {/* Quick Action Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setScreen("orrery")}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0b101b] p-5 text-left transition hover:border-cyan-400/50"
              >
                <div>
                  <div className="text-xs font-semibold text-cyan-300">
                    01. Coordinate Instrument
                  </div>
                  <h3 className="mt-1 font-serif text-2xl text-white">
                    Three-Layer Orrery
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Compare your inner Natal horizon, middle Transit ring, and
                    outer Universal God View with 5° aspect chords and Royal
                    Star locks.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-cyan-300">
                  <span>Open full instrument</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScreen("maps")}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0b101b] p-5 text-left transition hover:border-amber-400/50"
              >
                <div>
                  <div className="text-xs font-semibold text-amber-300">
                    02. Multi-Tradition Atlas
                  </div>
                  <h3 className="mt-1 font-serif text-2xl text-white">
                    360° Celestial Overlay Maps
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Track the Moon and planets across all 27 Vedic Nakshatras,
                    28 Arabic Manazil, 36 Hellenistic Decans, and 12 Tropical
                    Signs simultaneously.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-amber-300">
                  <span>Inspect 4-band atlas</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScreen("guide")}
                className="flex flex-col justify-between rounded-2xl border border-cyan-400/35 bg-gradient-to-br from-cyan-950/35 via-[#0b101b] to-violet-950/30 p-5 text-left transition hover:border-cyan-300"
              >
                <div>
                  <div className="text-xs font-semibold text-emerald-300">
                    03. All About You · Who Am I?
                  </div>
                  <h3 className="mt-1 font-serif text-2xl text-white">
                    Pattern Intelligence & Guide
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Explore your 16 Self-Knowledge Dimensions, 7-channel
                    Behavioral Patterns, Simulation Lab, and personal Master
                    Interpreter chapters.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-cyan-200">
                  <span>Open Guide & Pattern Matrix</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </button>
            </div>

            {/* High-Fidelity Traditional SVG Chart Wheel (Natal + Transit + Horary Aspects) */}
            <section className="rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-4" aria-label="External XYZ coordinate input">
              <h3 className="font-semibold text-cyan-100">XYZ → 360° fixed wheel</h3>
              <p className="mt-1 text-xs text-slate-400">Paste externally calculated Cartesian vectors, keyed by planet. X points to 0° Aries; Y points to 90° Cancer in the same fixed zodiac plane. Longitude = atan2(Y, X). Z is retained for audit, not used to determine longitude. This does not calculate the sunrise Ascendant. Bodies without supplied vectors continue using Swiss Ephemeris.</p>
              <textarea aria-label="Planet XYZ vectors JSON" value={xyzText} onChange={event => setXyzText(event.target.value)} rows={3} spellCheck={false} placeholder={'{"Mars":{"x":1,"y":1,"z":0.1}}'} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-xs text-white" />
              <div className="mt-2 flex flex-wrap items-center gap-3"><button type="button" onClick={applyXYZ} className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950">Apply XYZ vectors</button><button type="button" onClick={() => loadSky()} className="rounded-lg border border-slate-600 px-4 py-2 text-xs text-white">Recalculate chart</button><span className="text-xs text-slate-400">{xyzPositions ? `${Object.keys(xyzPositions).length} external vector(s) applied to next calculation` : "Ephemeris fallback active"}</span></div>
              {xyzError && <p role="alert" className="mt-2 text-xs text-rose-300">{xyzError}</p>}
              {activeChart && <div className="mt-3 grid gap-1 text-xs text-slate-300">{activeChart.movingBodies.filter(body => body.xyz).map(body => <p key={body.name}>{body.name}: X {body.xyz!.x}, Y {body.xyz!.y}, Z {body.xyz!.z} → {body.display} (external XYZ)</p>)}</div>}
            </section>
            {activeChart && <SkyObservatoryWheel chart={activeChart} />}

            {/* God View vs. Agent View Frame Relationship Panel */}
            {activeChart && activeChart.worldview !== "god" && (
              <FrameRelationshipPanel rows={activeChart.movingBodies} />
            )}

            {/* Embedded Three-Layer Orrery */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Live Astronomical Instrument
                  </div>
                  <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl">
                    Three-Layer Coordinate Orrery
                  </h2>
                </div>
              </div>
              <ThreeLayerOrrery chart={activeChart} />
            </section>

            {/* Synchronized 4-Band Overlay Map */}
            <OverlayMap moonLongitude={moonLongitude} chart={activeChart} />

            {/* Live Transit Feed */}
            {activeChart && readingScope !== "natal" && (
              <LiveTransitFeed
                chart={activeChart}
                onRefresh={() => loadSky(worldview, readingScope, profile)}
                refreshing={calculateMutation.isPending}
              />
            )}

            {/* Direct Preview of All About You / Pattern Intelligence */}
            {activeChart && (
              <section id="sky-pattern-intelligence" className="space-y-4 pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      Connected Pattern Recognition Backbone
                    </div>
                    <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl">
                      All About You · Pattern Intelligence & Master Guide
                    </h2>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setScreen("guide")}
                    className="bg-cyan-400 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
                  >
                    Open Full Reading & Guide View
                  </Button>
                </div>
                <BehavioralIntelligencePanel
                  chart={activeChart}
                  mode={readingScope}
                  question={guideQuestion}
                  onSelectPrompt={prompt => {
                    setGuideQuestion(prompt);
                    setScreen("guide");
                  }}
                />
              </section>
            )}
          </div>
        )}

        {/* VIEW 2: DEDICATED THREE-LAYER ORRERY & CHART WHEEL */}
        {screen === "orrery" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Instrument View
                </div>
                <h2 className="mt-1 font-serif text-3xl text-white">
                  Three-Layer Orrery & Full Chart Wheel
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Switch between the Universal God View, Present Transit sky,
                  and Personal Natal horizon.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScreen("guide")}
                className="border-cyan-400/40 bg-cyan-950/30 text-xs text-cyan-100 hover:bg-cyan-950/50"
              >
                Interpret These Positions in Guide →
              </Button>
            </div>

            {activeChart && <SkyObservatoryWheel chart={activeChart} />}

            <ThreeLayerOrrery chart={activeChart} />

            {activeChart && <ChartWheel chart={activeChart} />}
          </div>
        )}

        {/* VIEW 3: DEDICATED CELESTIAL ATLAS & OVERLAY MAPS */}
        {screen === "maps" && (
          <div className="space-y-8">
            <OverlayMap moonLongitude={moonLongitude} chart={activeChart} />
            {activeChart && (
              <LiveTransitFeed
                chart={activeChart}
                onRefresh={() => loadSky(worldview, readingScope, profile)}
                refreshing={calculateMutation.isPending}
              />
            )}
          </div>
        )}

        {/* VIEW 4: GUIDE & ALL ABOUT YOU / PATTERN INTELLIGENCE */}
        <div className={screen === "guide" ? "space-y-8" : "hidden"}>
          {activeChart ? (
            <InterpretationPanel
              key={`${activeChart.input.location || "god"}:${activeChart.input.date || "live"}:${activeChart.input.time || "none"}:${worldview}`}
              chart={activeChart}
              initialMode={readingScope}
              initialQuestion={guideQuestion}
              onModeChange={nextMode => setReadingScope(nextMode)}
            />
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#0b101b] p-8 text-center text-sm text-slate-400">
              Calculating ephemeris and pattern intelligence for your guide…
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (<= 15% viewport height) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-slate-800 bg-[#07090e]/95 px-2 py-2 backdrop-blur-xl md:hidden"
        aria-label="Mobile sky navigation"
      >
        {nav.map(item => {
          const Icon = item.icon;
          const selected = screen === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setScreen(item.key)}
              className={`flex min-w-[68px] flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition ${
                selected ? "text-cyan-300" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
