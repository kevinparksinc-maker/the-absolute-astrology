import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  Sparkles,
  Star,
  Compass,
  Eye,
  SlidersHorizontal,
  Flame,
  Award,
  Info,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { ChartResult } from "../../../server/astronomy";
import { formatLongitude, normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";

export interface FixedStarAstronomicalData {
  id: string;
  name: string;
  bayer: string;
  constellation: string;
  longitude: number; // Babylonian sidereal anchor
  apparentMagnitude: number; // mv (lower = brighter)
  luminousIntensity: number; // 0 - 100% normalized flux
  distanceLy: number; // distance in light-years
  spectralClass: string; // e.g. "K5III", "A1V"
  colorHex: string;
  isRoyalStar: boolean;
  watcherDirection?: "East" | "North" | "West" | "South";
  planetaryNature: string;
  esotericMeaning: string;
  giftWhenIntegrated: string;
  nemesisOrTest: string;
}

export const ASTRONOMICAL_FIXED_STARS: FixedStarAstronomicalData[] = [
  {
    id: "sirius",
    name: "Sirius",
    bayer: "α Canis Majoris",
    constellation: "Canis Major (The Greater Dog)",
    longitude: 79.35,
    apparentMagnitude: -1.46,
    luminousIntensity: 100,
    distanceLy: 8.6,
    spectralClass: "A1V (Blue-White Main Sequence)",
    colorHex: "#a5f3fc",
    isRoyalStar: false,
    planetaryNature: "Jupiter & Mars",
    esotericMeaning: "The Blazing Star: High spiritual luminescence, divine inspiration, fame, and sovereign protection.",
    giftWhenIntegrated: "Brilliant creative genius, spiritual illumination, and unwavering devotion to truth.",
    nemesisOrTest: "Egoic hubris, consuming ambition, and spiritual vanity.",
  },
  {
    id: "canopus",
    name: "Canopus",
    bayer: "α Carinae",
    constellation: "Carina (The Keel of the Ship Argo)",
    longitude: 104.98,
    apparentMagnitude: -0.74,
    luminousIntensity: 78,
    distanceLy: 310,
    spectralClass: "F0II (Yellow-White Supergiant)",
    colorHex: "#fef08a",
    isRoyalStar: false,
    planetaryNature: "Saturn & Jupiter",
    esotericMeaning: "Navigator of the Soul: Deep inner guidance, moral authority, pilgrimage, and oceanic wisdom.",
    giftWhenIntegrated: "Profound directional clarity in crisis, wise mentorship, and steadfast inner calm.",
    nemesisOrTest: "Dogmatic isolation and detachment from human warmth.",
  },
  {
    id: "arcturus",
    name: "Arcturus",
    bayer: "α Boötis",
    constellation: "Boötes (The Herdsman / Bear Watcher)",
    longitude: 204.14,
    apparentMagnitude: -0.05,
    luminousIntensity: 72,
    distanceLy: 36.7,
    spectralClass: "K1.5III (Golden-Red Giant)",
    colorHex: "#fed7aa",
    isRoyalStar: false,
    planetaryNature: "Mars & Jupiter",
    esotericMeaning: "Pathfinder of Civilization: Justice, stewardship, visionary leadership, and protective shielding.",
    giftWhenIntegrated: "Pioneering new cultural or technological frontiers while upholding enduring ethical truth.",
    nemesisOrTest: "Impatience with slower minds; reckless crusades without grounded support.",
  },
  {
    id: "vega",
    name: "Vega",
    bayer: "α Lyrae",
    constellation: "Lyra (The Celestial Harp)",
    longitude: 285.19,
    apparentMagnitude: 0.03,
    luminousIntensity: 69,
    distanceLy: 25.0,
    spectralClass: "A0V (Blue-White Photometric Standard)",
    colorHex: "#67e8f9",
    isRoyalStar: false,
    planetaryNature: "Venus & Mercury",
    esotericMeaning: "Harmonic Master: Eloquence, musical enchantment, charismatic appeal, and poetic genius.",
    giftWhenIntegrated: "Harmonizing discord through art, elevated aesthetics, and irresistible magnetic presence.",
    nemesisOrTest: "Seductive illusions, superficial glamour, and dissipation of creative discipline.",
  },
  {
    id: "rigel",
    name: "Rigel",
    bayer: "β Orionis",
    constellation: "Orion (Left Foot of the Hunter)",
    longitude: 52.1,
    apparentMagnitude: 0.13,
    luminousIntensity: 65,
    distanceLy: 860,
    spectralClass: "B8Ia (Luminous Blue Supergiant)",
    colorHex: "#7dd3fc",
    isRoyalStar: false,
    planetaryNature: "Jupiter & Mars",
    esotericMeaning: "The Pioneer's Footstep: High mechanical and scientific invention, honors, and boundless enterprise.",
    giftWhenIntegrated: "Rapid ascent to prominence through hard work, technical mastery, and courageous venture.",
    nemesisOrTest: "Impulsiveness and overextension that undermines established gains.",
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    bayer: "α Orionis",
    constellation: "Orion (Right Shoulder of the Giant)",
    longitude: 88.45,
    apparentMagnitude: 0.5,
    luminousIntensity: 60,
    distanceLy: 640,
    spectralClass: "M1-2Ia-ab (Pulsating Red Supergiant)",
    colorHex: "#f87171",
    isRoyalStar: false,
    planetaryNature: "Mars & Mercury",
    esotericMeaning: "Martial Glory: Splendor, sudden breakthrough, martial triumph, and dramatic renown.",
    giftWhenIntegrated: "Electrifying drive that accomplishes decades of progress in brief concentrated bursts.",
    nemesisOrTest: "Volatile temper, combustion of vital energy, and catastrophic boom-bust cycles.",
  },
  {
    id: "aldebaran",
    name: "Aldebaran",
    bayer: "α Tauri",
    constellation: "Taurus (The Bull's Fiery Eye)",
    longitude: 45.0,
    apparentMagnitude: 0.85,
    luminousIntensity: 56,
    distanceLy: 65.3,
    spectralClass: "K5III (Orange-Red Giant)",
    colorHex: "#fb923c",
    isRoyalStar: true,
    watcherDirection: "East",
    planetaryNature: "Mars & Venus",
    esotericMeaning: "Royal Star of the East (Babylonian Anchor): Executive courage, pioneering authority, and integrity.",
    giftWhenIntegrated: "Incorruptible moral courage, unshakeable stamina under fire, and sovereign guardianship.",
    nemesisOrTest: "Cutting ethical corners for swift gain; precipitous fall if personal truth is compromised.",
  },
  {
    id: "spica",
    name: "Spica",
    bayer: "α Virginis",
    constellation: "Virgo (The Maiden's Sheaf of Wheat)",
    longitude: 179.1,
    apparentMagnitude: 0.98,
    luminousIntensity: 52,
    distanceLy: 250,
    spectralClass: "B1III (Blue-White Subgiant / Giant)",
    colorHex: "#38bdf8",
    isRoyalStar: false,
    planetaryNature: "Venus & Mars",
    esotericMeaning: "The Virgin's Ear of Grain: Fruitful harvest, spiritual immunity, refined culture, and lasting bounty.",
    giftWhenIntegrated: "Exceptional creative harvest, genuine benefic luck, and protection against slander.",
    nemesisOrTest: "Indolence, taking divine gifts for granted, and squandering resources in idle luxury.",
  },
  {
    id: "antares",
    name: "Antares",
    bayer: "α Scorpii",
    constellation: "Scorpius (Heart of the Scorpion / Cor Scorpii)",
    longitude: 225.02,
    apparentMagnitude: 1.06,
    luminousIntensity: 50,
    distanceLy: 550,
    spectralClass: "M1.5Iab (Colossal Red Supergiant)",
    colorHex: "#ef4444",
    isRoyalStar: true,
    watcherDirection: "West",
    planetaryNature: "Mars & Jupiter",
    esotericMeaning: "Royal Star of the West (The Rival of Mars): Strategic courage, profound transformation, and psychic depth.",
    giftWhenIntegrated: "Fearless willingness to confront shadow, alchemize suffering into power, and lead revolutions.",
    nemesisOrTest: "Self-destructive vengeance, ruthless obsession, and scorched-earth conflict.",
  },
  {
    id: "fomalhaut",
    name: "Fomalhaut",
    bayer: "α Piscis Austrini",
    constellation: "Piscis Austrinus (Mouth of the Southern Fish)",
    longitude: 315.0,
    apparentMagnitude: 1.16,
    luminousIntensity: 47,
    distanceLy: 25.1,
    spectralClass: "A3V (Sparkling White Main Sequence)",
    colorHex: "#e0e7ff",
    isRoyalStar: true,
    watcherDirection: "South",
    planetaryNature: "Venus & Mercury",
    esotericMeaning: "Royal Star of the South: Lofty spiritual vision, esoteric synthesis, and magical idealism.",
    giftWhenIntegrated: "Translating transcendent spiritual revelations into concrete worldly masterpieces.",
    nemesisOrTest: "Escapist daydreaming, impractical messianism, and disillusionment with material reality.",
  },
  {
    id: "regulus",
    name: "Regulus",
    bayer: "α Leonis",
    constellation: "Leo (Heart of the Lion / Cor Leonis)",
    longitude: 135.0,
    apparentMagnitude: 1.36,
    luminousIntensity: 43,
    distanceLy: 79.3,
    spectralClass: "B8IV (Blue-White Rapid Rotator)",
    colorHex: "#818cf8",
    isRoyalStar: true,
    watcherDirection: "North",
    planetaryNature: "Mars & Jupiter",
    esotericMeaning: "Royal Star of the North (The Little King): Sovereign dignity, magnanimity, nobility, and command.",
    giftWhenIntegrated: "Generous, lionhearted leadership that inspires fierce loyalty and elevates all subordinates.",
    nemesisOrTest: "Despotism, petty revenge, and downfall triggered by pride or vengeance.",
  },
  {
    id: "polaris",
    name: "Polaris",
    bayer: "α Ursae Minoris",
    constellation: "Ursa Minor (The North Celestial Pivot)",
    longitude: 63.83,
    apparentMagnitude: 1.98,
    luminousIntensity: 34,
    distanceLy: 433,
    spectralClass: "F7Ib (Yellow-White Classical Cepheid)",
    colorHex: "#fef9c3",
    isRoyalStar: false,
    planetaryNature: "Saturn & Venus",
    esotericMeaning: "The Axis Mundi: Unwavering moral compass, spiritual steadfastness, and foundational stability.",
    giftWhenIntegrated: "Serving as an unshakeable emotional and spiritual anchor for organizations and families.",
    nemesisOrTest: "Rigid immobility, refusal to adapt to evolving times, and dogmatic stagnation.",
  },
  {
    id: "hamal",
    name: "Hamal",
    bayer: "α Arietis",
    constellation: "Aries (Head of the Ram)",
    longitude: 12.93,
    apparentMagnitude: 2.01,
    luminousIntensity: 33,
    distanceLy: 65.8,
    spectralClass: "K2III (Orange Giant)",
    colorHex: "#f97316",
    isRoyalStar: false,
    planetaryNature: "Mars & Saturn",
    esotericMeaning: "The Initiator's Crown: Headstrong leadership, bold initiative, martial willpower, and pioneering courage.",
    giftWhenIntegrated: "Carving new paths through stubborn obstacles through sheer focus and relentless exertion.",
    nemesisOrTest: "Headstrong recklessness, blunt insensitivity, and physical burnout.",
  },
  {
    id: "algol",
    name: "Algol",
    bayer: "β Persei",
    constellation: "Perseus (The Gorgon's Head / Caput Medusae)",
    longitude: 31.43,
    apparentMagnitude: 2.12,
    luminousIntensity: 30,
    distanceLy: 92.8,
    spectralClass: "B8V + K0IV (Eclipsing Binary Variable)",
    colorHex: "#c084fc",
    isRoyalStar: false,
    planetaryNature: "Saturn & Jupiter",
    esotericMeaning: "The Gorgon's Gaze: Fierce primal power, occult awareness, confronting shadow, and indestructible force.",
    giftWhenIntegrated: "Channeling raw, fierce protective fury into noble defense of the vulnerable; mastery over terror.",
    nemesisOrTest: "Losing one's head in blind rage; toxic obsession with destructive enemies.",
  },
];

export type ChartContact = {
  planetName: string;
  planetLongitude: number;
  planetHouse: number;
  orb: number; // in degrees
  isExact: boolean; // orb < 1.0 deg
  resonanceScore: number; // 0 - 100
};

export type EnrichedStar = FixedStarAstronomicalData & {
  zodiacLabel: string;
  sign: string;
  contacts: ChartContact[];
  peakContact: ChartContact | null;
  chartResonanceScore: number; // computed from intensity + closest orb
  isInChartAspect: boolean;
};

interface FixedStarIntensityVisualizerProps {
  chart: ChartResult;
  className?: string;
}

export function FixedStarIntensityVisualizer({
  chart,
  className = "",
}: FixedStarIntensityVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"spectrum" | "radar" | "matrix">("spectrum");
  const [filterMode, setFilterMode] = useState<"all" | "royal" | "contacts" | "bright">("all");
  const [selectedStarId, setSelectedStarId] = useState<string>("aldebaran");
  const [sortBy, setSortBy] = useState<"intensity" | "resonance" | "longitude">("intensity");
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract all chart moving bodies and angles for orb calculation
  const chartPlacements = useMemo(() => {
    const list: Array<{ name: string; longitude: number; house: number }> = [];
    if (chart.movingBodies) {
      for (const mb of chart.movingBodies) {
        list.push({ name: mb.name, longitude: mb.longitude, house: mb.house });
      }
    }
    if (chart.ascendant) {
      list.push({ name: "Ascendant", longitude: chart.ascendant.longitude, house: 1 });
    }
    if (chart.midheaven) {
      list.push({ name: "Midheaven", longitude: chart.midheaven.longitude, house: chart.midheaven.house });
    }
    if (chart.northNode) {
      list.push({ name: "North Node", longitude: chart.northNode.longitude, house: chart.northNode.house });
    }
    return list;
  }, [chart]);

  // Compute contacts and resonance score for each fixed star
  const enrichedStars: EnrichedStar[] = useMemo(() => {
    return ASTRONOMICAL_FIXED_STARS.map(star => {
      const contacts: ChartContact[] = [];

      for (const p of chartPlacements) {
        const diff = Math.abs(normalizeLongitude(p.longitude) - normalizeLongitude(star.longitude));
        const orb = Math.min(diff, 360 - diff);
        const maxOrb = star.isRoyalStar ? 5.0 : 3.5;

        if (orb <= maxOrb) {
          const proximityRatio = Math.max(0, 1 - orb / maxOrb);
          const angularBoost = p.house === 1 || p.house === 10 || p.house === 7 || p.house === 4 ? 1.25 : 1.0;
          const resonanceScore = Math.min(100, Math.round(star.luminousIntensity * 0.5 + proximityRatio * 50 * angularBoost));

          contacts.push({
            planetName: p.name,
            planetLongitude: p.longitude,
            planetHouse: p.house,
            orb: Number(orb.toFixed(2)),
            isExact: orb <= 1.0,
            resonanceScore,
          });
        }
      }

      contacts.sort((a, b) => a.orb - b.orb);
      const peakContact = contacts[0] || null;

      // Base resonance score from intrinsic intensity plus contact amplification
      let chartResonanceScore = Math.round(star.luminousIntensity * 0.4);
      if (peakContact) {
        chartResonanceScore = Math.max(chartResonanceScore, peakContact.resonanceScore);
      }

      const signIndex = Math.floor(star.longitude / 30);
      const sign = ZODIAC_SIGNS[signIndex];
      const zodiacLabel = formatLongitude(star.longitude);

      return {
        ...star,
        zodiacLabel,
        sign,
        contacts,
        peakContact,
        chartResonanceScore,
        isInChartAspect: contacts.length > 0,
      };
    });
  }, [chartPlacements]);

  // Filtered and sorted stars
  const displayStars = useMemo(() => {
    let result = enrichedStars;

    if (filterMode === "royal") {
      result = result.filter(s => s.isRoyalStar);
    } else if (filterMode === "contacts") {
      result = result.filter(s => s.isInChartAspect);
    } else if (filterMode === "bright") {
      result = result.filter(s => s.apparentMagnitude <= 1.0);
    }

    return [...result].sort((a, b) => {
      if (sortBy === "intensity") return b.luminousIntensity - a.luminousIntensity;
      if (sortBy === "resonance") return b.chartResonanceScore - a.chartResonanceScore;
      return a.longitude - b.longitude;
    });
  }, [enrichedStars, filterMode, sortBy]);

  // Selected star details
  const selectedStar = useMemo(() => {
    return enrichedStars.find(s => s.id === selectedStarId) || enrichedStars[0];
  }, [enrichedStars, selectedStarId]);

  // Radar data across 12 signs
  const radarData = useMemo(() => {
    return ZODIAC_SIGNS.map((sign, index) => {
      const startDeg = index * 30;
      const endDeg = (index + 1) * 30;
      const starsInSign = enrichedStars.filter(s => s.longitude >= startDeg && s.longitude < endDeg);
      const planetsInSign = chartPlacements.filter(p => p.longitude >= startDeg && p.longitude < endDeg);

      const maxStarIntensity = starsInSign.length > 0 ? Math.max(...starsInSign.map(s => s.luminousIntensity)) : 0;
      const avgResonance = starsInSign.length > 0 ? Math.round(starsInSign.reduce((acc, s) => acc + s.chartResonanceScore, 0) / starsInSign.length) : 0;

      return {
        sign,
        starsCount: starsInSign.length,
        starNames: starsInSign.map(s => s.name).join(", "),
        planetsCount: planetsInSign.length,
        planetNames: planetsInSign.map(p => p.name).join(", "),
        starIntensity: maxStarIntensity,
        chartResonance: avgResonance,
      };
    });
  }, [enrichedStars, chartPlacements]);

  // Scatter matrix data (Longitude vs Resonance vs Intensity)
  const scatterData = useMemo(() => {
    return enrichedStars.map(s => ({
      x: Math.round(s.longitude),
      y: s.chartResonanceScore,
      z: s.luminousIntensity,
      name: s.name,
      sign: s.sign,
      mag: s.apparentMagnitude,
      isRoyal: s.isRoyalStar,
      color: s.colorHex,
      hasContact: s.isInChartAspect,
      contactSummary: s.peakContact ? `${s.peakContact.planetName} (${s.peakContact.orb}°)` : "None",
    }));
  }, [enrichedStars]);

  return (
    <div
      className={`rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-[#070b18]/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        isExpanded ? "fixed inset-3 sm:inset-6 z-50 overflow-y-auto" : ""
      } ${className}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/30 border border-cyan-400/40 text-cyan-300 shadow-md shadow-cyan-950/50">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Fixed Star Intensity & Luminous Flux</span>
                <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-300 border border-cyan-400/30">
                  Babylonian Frame ✦
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Photometric magnitude, luminous flux, and harmonic resonant coupling to your chart
              </p>
            </div>
          </div>
        </div>

        {/* View Tabs & Expand */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex rounded-xl border border-white/10 bg-black/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("spectrum")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "spectrum"
                  ? "bg-cyan-500/20 text-cyan-200 shadow-sm border border-cyan-400/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart className="h-3.5 w-3.5" />
              <span>Spectrum</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "radar"
                  ? "bg-cyan-500/20 text-cyan-200 shadow-sm border border-cyan-400/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Zodiac Radar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "matrix"
                  ? "bg-cyan-500/20 text-cyan-200 shadow-sm border border-cyan-400/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Resonance Matrix</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse View" : "Full Observatory View"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3 text-cyan-400" />
            <span>Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`rounded-lg px-2.5 py-1 transition ${
              filterMode === "all"
                ? "bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 font-semibold"
                : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            All Stars ({enrichedStars.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("royal")}
            className={`rounded-lg px-2.5 py-1 flex items-center gap-1 transition ${
              filterMode === "royal"
                ? "bg-amber-400/20 text-amber-200 border border-amber-400/40 font-semibold"
                : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Award className="h-3 w-3 text-amber-400" />
            <span>4 Royal Watchers</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("contacts")}
            className={`rounded-lg px-2.5 py-1 flex items-center gap-1 transition ${
              filterMode === "contacts"
                ? "bg-violet-400/20 text-violet-200 border border-violet-400/40 font-semibold"
                : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Flame className="h-3 w-3 text-violet-400" />
            <span>Active Chart Alignments ({enrichedStars.filter(s => s.isInChartAspect).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("bright")}
            className={`rounded-lg px-2.5 py-1 transition ${
              filterMode === "bright"
                ? "bg-blue-400/20 text-blue-200 border border-blue-400/40 font-semibold"
                : "border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            1st Magnitude Only (mv ≤ 1.0)
          </button>
        </div>

        {activeTab === "spectrum" && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none"
            >
              <option value="intensity">Luminous Intensity</option>
              <option value="resonance">Chart Resonance</option>
              <option value="longitude">Zodiac Order (0°–360°)</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Visualizer Body Grid */}
      <div className="mt-5 grid gap-6 lg:grid-cols-12 items-start">
        {/* Left / Center Graph Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 shadow-inner min-h-[360px] flex flex-col justify-center">
            {/* VIEW 1: SPECTRUM BAR CHART */}
            {activeTab === "spectrum" && (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayStars} margin={{ top: 20, right: 10, left: -20, bottom: 45 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      domain={[0, 100]}
                      label={{ value: "Luminous Intensity (%)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const star = payload[0].payload as EnrichedStar;
                          return (
                            <div className="rounded-xl border border-cyan-400/40 bg-slate-950/95 p-3 text-xs text-slate-100 shadow-xl backdrop-blur-md space-y-1">
                              <div className="flex items-center justify-between gap-3 font-bold text-cyan-300">
                                <span>{star.name} ({star.bayer})</span>
                                <span>mv {star.apparentMagnitude.toFixed(2)}</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {star.zodiacLabel} · {star.constellation}
                              </div>
                              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                                <span className="text-cyan-400">Intensity: {star.luminousIntensity}%</span>
                                <span>·</span>
                                <span className="text-violet-300">Chart Resonance: {star.chartResonanceScore}%</span>
                              </div>
                              {star.peakContact && (
                                <div className="mt-1 rounded bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-200">
                                  ✦ Alignment: {star.peakContact.planetName} (Orb {star.peakContact.orb}°)
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="luminousIntensity"
                      radius={[6, 6, 0, 0]}
                      onClick={(data: any) => setSelectedStarId(data.id)}
                      className="cursor-pointer"
                    >
                      {displayStars.map(entry => (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={entry.id === selectedStarId ? "#38bdf8" : entry.colorHex}
                          opacity={entry.id === selectedStarId ? 1 : 0.75}
                          stroke={entry.isRoyalStar ? "#fbbf24" : "transparent"}
                          strokeWidth={entry.isRoyalStar ? 2 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* VIEW 2: RADAR CELESTIAL WHEEL */}
            {activeTab === "radar" && (
              <div className="h-[340px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="sign" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={9} />
                    <Radar
                      name="Fixed Star Intensity"
                      dataKey="starIntensity"
                      stroke="#38bdf8"
                      fill="#38bdf8"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Chart Resonance"
                      dataKey="chartResonance"
                      stroke="#c084fc"
                      fill="#c084fc"
                      fillOpacity={0.3}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-cyan-400/40 bg-slate-950/95 p-3 text-xs text-slate-100 shadow-xl backdrop-blur-md">
                              <div className="font-bold text-cyan-300">{data.sign} Sector</div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Stars ({data.starsCount}): {data.starNames || "None anchored"}
                              </div>
                              <div className="text-[11px] text-violet-300 mt-0.5">
                                Native Planets ({data.planetsCount}): {data.planetNames || "None"}
                              </div>
                              <div className="mt-1 pt-1 border-t border-white/10 flex gap-3 text-[11px]">
                                <span>Max Star Flux: {data.starIntensity}%</span>
                                <span>Resonance: {data.chartResonance}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* VIEW 3: RESONANCE MATRIX SCATTER */}
            {activeTab === "matrix" && (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Ecliptic Longitude"
                      domain={[0, 360]}
                      stroke="#94a3b8"
                      fontSize={10}
                      tickCount={13}
                      tickFormatter={val => `${val}°`}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Chart Resonance"
                      domain={[0, 100]}
                      stroke="#94a3b8"
                      fontSize={10}
                      label={{ value: "Chart Resonance (%)", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
                    />
                    <ZAxis type="number" dataKey="z" range={[80, 450]} name="Photometric Flux" />
                    <RechartsTooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-cyan-400/40 bg-slate-950/95 p-3 text-xs text-slate-100 shadow-xl backdrop-blur-md">
                              <div className="font-bold text-cyan-300 flex items-center justify-between gap-2">
                                <span>{item.name}</span>
                                <span>{item.x}° ({item.sign})</span>
                              </div>
                              <div className="text-[11px] text-slate-300 mt-1">
                                <div>Chart Resonance: <strong>{item.y}%</strong></div>
                                <div>Luminous Flux: <strong>{item.z}%</strong> (mv {item.mag})</div>
                                <div className="text-violet-300">Contact: {item.contactSummary}</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      data={scatterData}
                      onClick={(entry: any) => {
                        const found = enrichedStars.find(s => s.name === entry.name);
                        if (found) setSelectedStarId(found.id);
                      }}
                      className="cursor-pointer"
                    >
                      {scatterData.map((entry, index) => (
                        <Cell
                          key={`scatter-${index}`}
                          fill={entry.isRoyal ? "#fbbf24" : entry.color}
                          stroke={entry.hasContact ? "#38bdf8" : "rgba(255,255,255,0.4)"}
                          strokeWidth={entry.hasContact ? 2.5 : 1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Select Star Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {displayStars.map(star => {
              const isSelected = star.id === selectedStarId;
              return (
                <button
                  key={star.id}
                  type="button"
                  onClick={() => setSelectedStarId(star.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-400/20 text-cyan-100 font-semibold shadow-md shadow-cyan-950/40"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: star.colorHex }}
                  />
                  <span>{star.name}</span>
                  {star.isRoyalStar && <Award className="h-3 w-3 text-amber-400 shrink-0" />}
                  {star.isInChartAspect && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Card: Astronomical & Esoteric Reading */}
        <div className="lg:col-span-4 rounded-xl border border-cyan-400/30 bg-black/60 p-5 shadow-xl space-y-4">
          <div className="flex items-start justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-lg font-bold text-cyan-200">
                  {selectedStar.name}
                </h4>
                {selectedStar.isRoyalStar && (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/40">
                    Royal Watcher {selectedStar.watcherDirection}
                  </span>
                )}
              </div>
              <div className="font-mono text-xs text-slate-400">
                {selectedStar.bayer} · {selectedStar.constellation}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-cyan-300">
                mv {selectedStar.apparentMagnitude.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">
                {selectedStar.distanceLy} ly
              </div>
            </div>
          </div>

          {/* Coordinates & Physical Properties */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-white/5 bg-white/5 p-2.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Babylonian Longitude</div>
              <div className="font-mono font-bold text-slate-200 mt-0.5">{selectedStar.zodiacLabel}</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-2.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Luminous Intensity</div>
              <div className="font-mono font-bold text-cyan-300 mt-0.5">{selectedStar.luminousIntensity}% Flux</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-2.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Spectral Type</div>
              <div className="font-mono text-[11px] text-slate-200 mt-0.5">{selectedStar.spectralClass.split(" ")[0]}</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-2.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Planetary Nature</div>
              <div className="font-bold text-amber-300 text-[11px] mt-0.5">{selectedStar.planetaryNature}</div>
            </div>
          </div>

          {/* Active Chart Contacts */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-violet-400" />
                <span>Chart Contacts in Native Sphere</span>
              </span>
              <span className="font-mono text-cyan-400 text-[11px]">
                {selectedStar.contacts.length} Alignments
              </span>
            </div>

            {selectedStar.contacts.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-white/5 p-2.5 text-xs text-slate-400 italic">
                No major planetary bodies within the active orb threshold (3.5°–5.0°). Star exerts ambient archetypal influence.
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedStar.contacts.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-violet-400/30 bg-violet-500/10 p-2 text-xs text-slate-200"
                  >
                    <div>
                      <div className="font-semibold text-violet-200 flex items-center gap-1">
                        <span>{c.planetName}</span>
                        {c.isExact && (
                          <span className="rounded bg-cyan-400/20 px-1 text-[9px] font-bold text-cyan-300">
                            Exact Conjunction
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        House {c.planetHouse} · Orb: {c.orb}°
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-300 text-[11px]">{c.resonanceScore}%</div>
                      <div className="text-[9px] text-slate-400">Resonance</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Astrological Reading & Wisdom */}
          <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
            <div>
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-cyan-400" />
                <span>Archetypal Interpretation</span>
              </div>
              <p className="mt-1 leading-relaxed text-slate-400 text-[11px]">
                {selectedStar.esotericMeaning}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5">
              <div className="font-bold text-emerald-300 text-[11px]">✦ Gift When Integrated:</div>
              <p className="mt-0.5 text-[11px] text-emerald-200/90 leading-relaxed">
                {selectedStar.giftWhenIntegrated}
              </p>
            </div>

            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5">
              <div className="font-bold text-rose-300 text-[11px]">⚠ The Nemesis / Soul Test:</div>
              <p className="mt-0.5 text-[11px] text-rose-200/90 leading-relaxed">
                {selectedStar.nemesisOrTest}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
