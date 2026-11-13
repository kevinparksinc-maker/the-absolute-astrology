import { useEffect, useMemo, useState } from "react";
import type { ChartResult, ChartRow } from "../../../server/astronomy";
import { angularDistance } from "../../../server/astrologyCore";
import {
  formatLongitude,
  normalizeLongitude,
  overlay,
  ZODIAC_SIGNS,
} from "../../../shared/hybrid";

type AspectLayerFilter = "all" | "natal" | "transit" | "horary";

type TraditionalDignityRule = {
  sign: string;
  domicileRuler: string;
  exaltationRuler: string | null;
  triplicityRuler: string;
  termRuler: string;
  faceRuler: string;
  essentialDignities: string[];
  debilities: string[];
  essentialScore: number;
  accidentalState: "Angular (+5)" | "Succedent (+2)" | "Cadent (−2)";
  solarCondition: "Cazimi (Heart of Sun)" | "Combust (<8.5°)" | "Under the Beams (<17°)" | "Free of Solar Beams";
  sectStatus: string;
  horaryRole: string | null;
  ruleExplanation: string;
};

type WheelAspect = {
  id: string;
  layer: "natal" | "transit" | "horary";
  fromName: string;
  fromLon: number;
  fromRadius: number;
  toName: string;
  toLon: number;
  toRadius: number;
  aspect: "conjunction" | "sextile" | "semisquare" | "square" | "trine" | "opposition";
  orb: number;
  receptionNote: string | null;
  ruleSummary: string;
};

const DOMICILE: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const EXALTATION: Record<string, string> = {
  Aries: "Sun",
  Taurus: "Moon",
  Cancer: "Jupiter",
  Virgo: "Mercury",
  Libra: "Saturn",
  Capricorn: "Mars",
  Pisces: "Venus",
};

const DETRIMENT: Record<string, string> = {
  Aries: "Venus",
  Taurus: "Mars",
  Gemini: "Jupiter",
  Cancer: "Saturn",
  Leo: "Saturn",
  Virgo: "Jupiter",
  Libra: "Mars",
  Scorpio: "Venus",
  Sagittarius: "Mercury",
  Capricorn: "Moon",
  Aquarius: "Sun",
  Pisces: "Mercury",
};

const FALL: Record<string, string> = {
  Aries: "Saturn",
  Scorpio: "Moon",
  Capricorn: "Jupiter",
  Pisces: "Mercury",
  Libra: "Sun",
};

const TRIPLICITIES: Record<
  "Fire" | "Earth" | "Air" | "Water",
  { day: string; night: string }
> = {
  Fire: { day: "Sun", night: "Jupiter" },
  Earth: { day: "Venus", night: "Moon" },
  Air: { day: "Saturn", night: "Mercury" },
  Water: { day: "Venus", night: "Mars" },
};

const ELEMENT: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

const EGYPTIAN_TERMS: Record<string, Array<[number, string]>> = {
  Aries: [[6, "Jupiter"], [12, "Venus"], [20, "Mercury"], [25, "Mars"], [30, "Saturn"]],
  Taurus: [[8, "Venus"], [14, "Mercury"], [22, "Jupiter"], [27, "Saturn"], [30, "Mars"]],
  Gemini: [[6, "Mercury"], [12, "Jupiter"], [17, "Venus"], [24, "Mars"], [30, "Saturn"]],
  Cancer: [[7, "Mars"], [13, "Venus"], [19, "Mercury"], [26, "Jupiter"], [30, "Saturn"]],
  Leo: [[6, "Jupiter"], [11, "Venus"], [18, "Saturn"], [24, "Mercury"], [30, "Mars"]],
  Virgo: [[7, "Mercury"], [17, "Venus"], [21, "Jupiter"], [28, "Mars"], [30, "Saturn"]],
  Libra: [[6, "Saturn"], [14, "Mercury"], [21, "Jupiter"], [28, "Venus"], [30, "Mars"]],
  Scorpio: [[7, "Mars"], [11, "Venus"], [19, "Mercury"], [24, "Jupiter"], [30, "Saturn"]],
  Sagittarius: [[12, "Jupiter"], [17, "Venus"], [21, "Mercury"], [26, "Saturn"], [30, "Mars"]],
  Capricorn: [[7, "Mercury"], [14, "Jupiter"], [22, "Venus"], [26, "Saturn"], [30, "Mars"]],
  Aquarius: [[7, "Mercury"], [13, "Venus"], [20, "Jupiter"], [25, "Mars"], [30, "Saturn"]],
  Pisces: [[12, "Venus"], [16, "Jupiter"], [19, "Mercury"], [28, "Mars"], [30, "Saturn"]],
};

const FACES = [
  "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter",
  "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter",
  "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter",
  "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter",
  "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter",
  "Mars",
];

const TOPIC_HOUSES: Array<{ house: number; label: string }> = [
  { house: 1, label: "1st · Self, Vitality & Direction" },
  { house: 2, label: "2nd · Money, Substance & Livelihood" },
  { house: 3, label: "3rd · Siblings, Contracts & Local Ties" },
  { house: 4, label: "4th · Home, Property & Lineage" },
  { house: 5, label: "5th · Children, Romance & Creation" },
  { house: 6, label: "6th · Work, Service & Health" },
  { house: 7, label: "7th · Marriage, Partner & Open Counterpart" },
  { house: 8, label: "8th · Shared Debt, Inheritance & Crisis" },
  { house: 9, label: "9th · Calling, Wisdom, Law & Long Journeys" },
  { house: 10, label: "10th · Career, Authority & Reputation" },
  { house: 11, label: "11th · Allies, Community & Hopes" },
  { house: 12, label: "12th · Solitude, Hidden Matters & Retreat" },
];

const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  "North Node": "☊",
  "South Node": "☋",
  Ascendant: "ASC",
  Descendant: "DSC",
  Midheaven: "MC",
};

const TRADITIONAL_HOUSE_MEANINGS: Record<number, string> = {
  1: "The Helm (Horoskopos) — Angular 1st house of life force, body, character, and personal agency.",
  2: "Gate of Hades — Succedent 2nd house of movable resources, income, and material stewardship.",
  3: "Goddess (Dea) — Cadent 3rd house of kindred, daily messages, neighbors, and practical skill.",
  4: "Subterranean Pivot (Imum Coeli) — Angular 4th house of ancestry, land, home, and private roots.",
  5: "Good Fortune (Bona Fortuna) — Succedent 5th house of joy, offspring, creative risk, and pleasure.",
  6: "Bad Fortune (Mala Fortuna) — Cadent 6th house of labor, maintenance, and physical trials.",
  7: "The Setting Pivot (Occasus) — Angular 7th house of covenants, marriage, partners, and open rivals.",
  8: "Idle Place (Epicataphora) — Succedent 8th house of shared obligations, mortality, and deep reckoning.",
  9: "God (Deus) — Cadent 9th house of philosophy, scripture, prophecy, law, and distant voyages.",
  10: "Midheaven (Medium Coeli) — Angular 10th house of public office, vocation, honor, and visible action.",
  11: "Good Spirit (Bonus Genius) — Succedent 11th house of trusted alliances, patronage, and future aims.",
  12: "Bad Spirit (Malus Genius) — Cadent 12th house of exile, hidden burdens, unseen tests, and contemplation.",
};

function signOf(longitude: number): string {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)] ?? "Aries";
}

function polar(longitude: number, radius: number, center: number) {
  const angle = ((longitude - 90) * Math.PI) / 180;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function evaluateTraditionalPlacementRule(
  row: ChartRow,
  sunLongitude: number,
  isDayChart: boolean,
  querentRuler: string,
  quesitedRuler: string,
  topicHouse: number
): TraditionalDignityRule {
  const sign = signOf(row.longitude);
  const degInSign = normalizeLongitude(row.longitude) % 30;
  const element = ELEMENT[sign] ?? "Fire";
  const domicileRuler = DOMICILE[sign] ?? "Mars";
  const exaltationRuler = EXALTATION[sign] ?? null;
  const triplicityRuler = TRIPLICITIES[element][isDayChart ? "day" : "night"];
  const termRuler =
    EGYPTIAN_TERMS[sign]?.find(([end]) => degInSign < end)?.[1] ?? "Saturn";
  const faceRuler =
    FACES[Math.min(35, Math.floor(normalizeLongitude(row.longitude) / 10))] ??
    "Mars";

  const essentialDignities: string[] = [];
  const debilities: string[] = [];
  let essentialScore = 0;

  if (domicileRuler === row.name) {
    essentialDignities.push("Domicile (+5)");
    essentialScore += 5;
  }
  if (exaltationRuler === row.name) {
    essentialDignities.push("Exaltation (+4)");
    essentialScore += 4;
  }
  if (triplicityRuler === row.name) {
    essentialDignities.push(`Triplicity Ruler (+3)`);
    essentialScore += 3;
  }
  if (termRuler === row.name) {
    essentialDignities.push("Egyptian Bounds/Term (+2)");
    essentialScore += 2;
  }
  if (faceRuler === row.name) {
    essentialDignities.push("Decan/Face (+1)");
    essentialScore += 1;
  }

  if (DETRIMENT[sign] === row.name) {
    debilities.push("Detriment (−5)");
    essentialScore -= 5;
  }
  if (FALL[sign] === row.name) {
    debilities.push("Fall (−4)");
    essentialScore -= 4;
  }
  if (row.retrograde) {
    debilities.push("Retrograde motion");
  }

  if (essentialDignities.length === 0 && debilities.length === 0) {
    essentialDignities.push("Peregrine (wandering without essential dignity)");
  }

  const accidentalState = [1, 4, 7, 10].includes(row.house)
    ? "Angular (+5)"
    : [2, 5, 8, 11].includes(row.house)
      ? "Succedent (+2)"
      : "Cadent (−2)";

  const sunDist = angularDistance(row.longitude, sunLongitude);
  const solarCondition =
    row.name === "Sun"
      ? "Free of Solar Beams"
      : sunDist <= 0.28
        ? "Cazimi (Heart of Sun)"
        : sunDist <= 8.5
          ? "Combust (<8.5°)"
          : sunDist <= 17
            ? "Under the Beams (<17°)"
            : "Free of Solar Beams";

  const diurnalPlanets = new Set(["Sun", "Jupiter", "Saturn"]);
  const nocturnalPlanets = new Set(["Moon", "Venus", "Mars"]);
  const sectStatus = diurnalPlanets.has(row.name)
    ? isDayChart
      ? "In Sect (Diurnal planet in Day Chart)"
      : "Out of Sect (Diurnal planet in Night Chart)"
    : nocturnalPlanets.has(row.name)
      ? !isDayChart
        ? "In Sect (Nocturnal planet in Night Chart)"
        : "Out of Sect (Nocturnal planet in Day Chart)"
      : "Mercury (Variable Sect)";

  let horaryRole: string | null = null;
  if (row.name === querentRuler && row.name === quesitedRuler) {
    horaryRole = `Dual Significator (Lord of 1st & House ${topicHouse})`;
  } else if (row.name === querentRuler) {
    horaryRole = "Querent Primary Significator (Lord of House 1)";
  } else if (row.name === quesitedRuler) {
    horaryRole = `Quesited Primary Significator (Lord of House ${topicHouse})`;
  } else if (row.name === "Moon") {
    horaryRole = "Horary Co-Significator of the Querent & Matter's Flow";
  }

  const ruleExplanation = `${row.name} in ${sign} (House ${row.house}) is governed by ${domicileRuler} (Domicile)${exaltationRuler ? ` and ${exaltationRuler} (Exaltation)` : ""}. It operates with ${accidentalState} accidental force, ${essentialDignities.join(", ")}${debilities.length ? `, modified by ${debilities.join(", ")}` : ""}, and is ${solarCondition.toLowerCase()}.`;

  return {
    sign,
    domicileRuler,
    exaltationRuler,
    triplicityRuler,
    termRuler,
    faceRuler,
    essentialDignities,
    debilities,
    essentialScore,
    accidentalState,
    solarCondition,
    sectStatus,
    horaryRole,
    ruleExplanation,
  };
}

interface SkyObservatoryWheelProps {
  chart: ChartResult;
}

export function SkyObservatoryWheel({ chart }: SkyObservatoryWheelProps) {
  const [aspectFilter, setAspectFilter] = useState<AspectLayerFilter>(
    chart.readingScope === "natal"
      ? "natal"
      : chart.readingScope === "transit"
        ? "transit"
        : "all"
  );
  const [topicHouse, setTopicHouse] = useState<number>(7);

  useEffect(() => {
    setAspectFilter(
      chart.readingScope === "natal"
        ? "natal"
        : chart.readingScope === "transit"
          ? "transit"
          : "all"
    );
  }, [chart.readingScope]);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<{
    layer: "natal" | "transit";
    row: ChartRow;
  } | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<WheelAspect | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    title: string;
    subtitle: string;
    ruleBadge: string;
    ruleDetail: string;
    x: number;
    y: number;
  } | null>(null);

  const size = 760;
  const center = size / 2;
  const outerZodiacRadius = 342;
  const innerZodiacRadius = 304;
  const transitRingRadius = 266;
  const natalRingRadius = 212;
  const aspectHubRadius = 152;

  const houses = useMemo(
    () =>
      chart.houses.length >= 12
        ? chart.houses.slice(0, 12)
        : Array.from({ length: 12 }, (_, i) => i * 30),
    [chart.houses]
  );

  const natalRows = useMemo(
    () =>
      [
        ...chart.movingBodies,
        chart.ascendant,
        chart.descendant,
        chart.midheaven,
        chart.northNode,
        chart.southNode,
      ].filter((r): r is ChartRow => Boolean(r)),
    [chart]
  );

  const transitRows = useMemo(
    () =>
      (chart.transits.length > 0 ? chart.transits : chart.movingBodies).filter(
        r =>
          [
            "Sun",
            "Moon",
            "Mercury",
            "Venus",
            "Mars",
            "Jupiter",
            "Saturn",
            "Uranus",
            "Neptune",
            "Pluto",
            "North Node",
            "South Node",
          ].includes(r.name)
      ),
    [chart]
  );

  const sunRow =
    transitRows.find(r => r.name === "Sun") ??
    natalRows.find(r => r.name === "Sun");
  const sunLon = sunRow?.longitude ?? 0;
  const isDayChart = (sunRow?.house ?? 7) >= 7 && (sunRow?.house ?? 7) <= 12;

  // Horary Significators from Ascendant (House 1) and selected Topic House
  const ascSign = signOf(houses[0] ?? 0);
  const topicCuspSign = signOf(houses[topicHouse - 1] ?? (topicHouse - 1) * 30);
  const querentRuler = DOMICILE[ascSign] ?? "Mars";
  const quesitedRuler = DOMICILE[topicCuspSign] ?? "Venus";

  // Build All 3 Aspect Layers: Natal, Transit-to-Natal, and Horary Significator Contacts
  const allAspects = useMemo(() => {
    const list: WheelAspect[] = [];
    const targets: Array<
      [number, WheelAspect["aspect"], string]
    > = [
      [0, "conjunction", "Conjunction (0°): Direct union and blending of planetary forces."],
      [60, "sextile", "Sextile (60° · Nature of Venus): Cooperative opportunity and supportive communication."],
      [90, "square", "Square (90° · Nature of Mars): Dynamic friction, structural test, and decisive action."],
      [120, "trine", "Trine (120° · Nature of Jupiter): Harmonious flow, natural reception, and ease of integration."],
      [180, "opposition", "Opposition (180° · Nature of Saturn): Polarity confrontation, mirror awareness, and negotiation."],
    ];

    // 1. Natal-to-Natal Aspects (<= 5° Firmament Rule)
    const coreNatal = chart.movingBodies;
    for (let i = 0; i < coreNatal.length; i += 1) {
      for (let j = i + 1; j < coreNatal.length; j += 1) {
        const a = coreNatal[i]!;
        const b = coreNatal[j]!;
        const dist = angularDistance(a.longitude, b.longitude);
        for (const [deg, type, doctrine] of targets) {
          const orb = Math.abs(dist - deg);
          if (orb <= 5) {
            const signA = signOf(a.longitude);
            const signB = signOf(b.longitude);
            const recA = DOMICILE[signA] === b.name || EXALTATION[signA] === b.name;
            const recB = DOMICILE[signB] === a.name || EXALTATION[signB] === a.name;
            const receptionNote =
              recA && recB
                ? `Mutual Reception between ${a.name} (${signA}) and ${b.name} (${signB})`
                : recA
                  ? `${a.name} receives ${b.name} in ${signA}`
                  : recB
                    ? `${b.name} receives ${a.name} in ${signB}`
                    : null;

            list.push({
              id: `natal-${a.name}-${b.name}-${type}`,
              layer: "natal",
              fromName: a.name,
              fromLon: a.longitude,
              fromRadius: aspectHubRadius,
              toName: b.name,
              toLon: b.longitude,
              toRadius: aspectHubRadius,
              aspect: type,
              orb,
              receptionNote,
              ruleSummary: `Traditional 5° Natal Rule — ${doctrine}${receptionNote ? ` Strengthened by ${receptionNote}.` : ""}`,
            });
            break;
          }
        }
      }
    }

    // 2. Transit-to-Natal Aspects
    const natalMap = new Map(natalRows.map(r => [r.name, r]));
    for (const tr of chart.transits) {
      for (const contact of tr.natalContacts) {
        const nat = natalMap.get(contact.natalName);
        if (!nat) continue;
        const targetInfo = targets.find(t => t[1] === contact.aspect);
        list.push({
          id: `transit-${tr.name}-${nat.name}-${contact.aspect}`,
          layer: "transit",
          fromName: `Transit ${tr.name}`,
          fromLon: tr.longitude,
          fromRadius: transitRingRadius,
          toName: `Natal ${nat.name}`,
          toLon: nat.longitude,
          toRadius: natalRingRadius,
          aspect: contact.aspect,
          orb: contact.orb,
          receptionNote: `Transit House ${tr.house} activating Natal House ${nat.house}`,
          ruleSummary: `Transit Activation Rule — Moving ${tr.name} (${tr.display}) contacts natal ${nat.name} (${nat.display}) within ${contact.orb.toFixed(1)}°. ${targetInfo?.[2] ?? ""}`,
        });
      }
    }

    // 3. Horary Significator Aspects (Querent Ruler, Quesited Ruler, and Moon)
    const horarySet = new Set([querentRuler, quesitedRuler, "Moon", "Sun"]);
    const horaryBodies = transitRows.filter(r => horarySet.has(r.name));
    for (let i = 0; i < horaryBodies.length; i += 1) {
      for (let j = i + 1; j < horaryBodies.length; j += 1) {
        const a = horaryBodies[i]!;
        const b = horaryBodies[j]!;
        const dist = angularDistance(a.longitude, b.longitude);
        for (const [deg, type, doctrine] of targets) {
          const orb = Math.abs(dist - deg);
          if (orb <= 6) {
            const signA = signOf(a.longitude);
            const signB = signOf(b.longitude);
            const recA = DOMICILE[signA] === b.name || EXALTATION[signA] === b.name;
            const recB = DOMICILE[signB] === a.name || EXALTATION[signB] === a.name;
            const receptionNote =
              recA && recB
                ? `Mutual Reception (${a.name} ↔ ${b.name})`
                : recA
                  ? `${a.name} receives ${b.name} by dignity`
                  : recB
                    ? `${b.name} receives ${a.name} by dignity`
                    : "No primary dignity reception";

            list.push({
              id: `horary-${a.name}-${b.name}-${type}`,
              layer: "horary",
              fromName: a.name,
              fromLon: a.longitude,
              fromRadius: transitRingRadius,
              toName: b.name,
              toLon: b.longitude,
              toRadius: transitRingRadius,
              aspect: type,
              orb,
              receptionNote,
              ruleSummary: `Horary Perfection Rule (House 1 ${querentRuler} ↔ House ${topicHouse} ${quesitedRuler} / Moon) — ${a.name} ${type} ${b.name} (${orb.toFixed(1)}° orb). ${receptionNote}. ${doctrine}`,
            });
            break;
          }
        }
      }
    }

    return list;
  }, [chart, natalRows, transitRows, querentRuler, quesitedRuler, topicHouse]);

  const visibleAspects = useMemo(
    () =>
      aspectFilter === "all"
        ? allAspects
        : allAspects.filter(a => a.layer === aspectFilter),
    [allAspects, aspectFilter]
  );

  // Compute detailed rules for the currently selected placement
  const activePlacementRule = useMemo(() => {
    const target =
      selectedNode?.row ??
      natalRows.find(r => r.name === "Sun") ??
      natalRows[0];
    if (!target) return null;
    const rule = evaluateTraditionalPlacementRule(
      target,
      sunLon,
      isDayChart,
      querentRuler,
      quesitedRuler,
      topicHouse
    );
    const ov = overlay(target.longitude);
    return {
      layer: selectedNode?.layer ?? "natal",
      row: target,
      rule,
      overlay: ov,
    };
  }, [selectedNode, natalRows, sunLon, isDayChart, querentRuler, quesitedRuler, topicHouse]);

  const aspectColor = (layer: WheelAspect["layer"], aspect: WheelAspect["aspect"]) => {
    if (layer === "horary") return "#f59e0b"; // Golden amber for Horary Significator links
    if (layer === "transit") {
      return aspect === "square" || aspect === "opposition"
        ? "#e879f9" // Violet-magenta glow for high-tension transit contacts
        : "#c084fc"; // Soft violet for harmonic transit contacts
    }
    return aspect === "square" || aspect === "opposition"
      ? "#38bdf8"
      : "#22d3ee"; // Cyan glow for natal foundation geometry
  };

  return (
    <section className="rounded-2xl border border-cyan-300/20 bg-[#070b14] p-4 shadow-2xl shadow-cyan-950/30 sm:p-6">
      {/* Header & Aspect Layer Controls */}
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-800/90 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
            <span>High-Fidelity Traditional Observatory Wheel</span>
            <span className="text-slate-600">·</span>
            <span className="text-violet-300">
              {chart.worldview === "god"
                ? "God View (Fixed 0° Aries Houses)"
                : chart.worldview === "agent-vs-god"
                  ? "God's View of the Agent (Dual Houses)"
                  : "Agent View (Local Equal Houses)"}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-300">
              {chart.readingScope === "natal"
                ? "Natal Layer"
                : chart.readingScope === "transit"
                  ? "Transit Layer"
                  : "Natal + Transit Layer"}
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl">
            Natal, Transit & Horary Aspect Geometry
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">
            Hover or click any planet, house cusp, or aspect chord to inspect
            the exact traditional astrological rules—Essential Dignity,
            Accidental House Force, Solar Condition, Sect, Reception, and Horary
            Significators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Aspect Layer Filter Buttons */}
          <div
            className="flex gap-1 rounded-xl border border-slate-800 bg-[#0b101b] p-1"
            role="tablist"
            aria-label="Aspect layer filter"
          >
            {(
              [
                { key: "all", label: `All Aspects (${allAspects.length})` },
                {
                  key: "natal",
                  label: `Natal (${allAspects.filter(a => a.layer === "natal").length})`,
                },
                {
                  key: "transit",
                  label: `Transit (${allAspects.filter(a => a.layer === "transit").length})`,
                },
                {
                  key: "horary",
                  label: `Horary (${allAspects.filter(a => a.layer === "horary").length})`,
                },
              ] as const
            ).map(tab => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={aspectFilter === tab.key}
                onClick={() => setAspectFilter(tab.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  aspectFilter === tab.key
                    ? "bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Horary Quesited Topic House Selector */}
          <select
            aria-label="Select Horary Topic House"
            value={topicHouse}
            onChange={e => setTopicHouse(Number(e.target.value))}
            className="rounded-xl border border-violet-400/30 bg-[#0b101b] px-3 py-2 text-xs font-medium text-violet-200 outline-none focus:border-cyan-400"
          >
            {TOPIC_HOUSES.map(h => (
              <option key={h.house} value={h.house} className="bg-[#0b101b]">
                Horary Topic: {h.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Grid: High-Fidelity SVG Wheel + Traditional Rule Inspector */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left: SVG Wheel */}
        <div className="relative mx-auto w-full max-w-[740px] overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#050811] p-2 sm:p-4">
          {/* Interactive Floating Rule Tooltip Banner */}
          <div className="mb-3 flex min-h-[54px] flex-col justify-center rounded-xl border border-cyan-300/20 bg-gradient-to-r from-cyan-950/45 via-violet-950/35 to-[#070b14] px-4 py-2.5">
            {hoveredTooltip ? (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-serif text-sm font-semibold text-white">
                    {hoveredTooltip.title}
                  </span>
                  <span className="font-mono text-[11px] text-cyan-300">
                    {hoveredTooltip.ruleBadge}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-5 text-slate-300">
                  {hoveredTooltip.ruleDetail}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span>
                  <strong className="text-cyan-300">Interactive Rule Probe:</strong>{" "}
                  Hover any planet, house sector, or aspect line to inspect its
                  traditional astrological rule.
                </span>
                <span className="font-mono text-[11px] text-violet-300">
                  Querent (H1): {querentRuler} · Quesited (H{topicHouse}):{" "}
                  {quesitedRuler}
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="h-auto w-full select-none"
              role="img"
              aria-label="High-fidelity SVG chart wheel with natal, transit, and horary aspects"
            >
            <defs>
              <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="violetGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="firmamentWheelBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="65%" stopColor="#070b14" />
                <stop offset="100%" stopColor="#03060c" />
              </radialGradient>
              <radialGradient id="aspectHubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
                <stop offset="55%" stopColor="#a855f7" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#050811" stopOpacity="0.95" />
              </radialGradient>
            </defs>

            {/* Outer Concentric Rings */}
            <circle
              cx={center}
              cy={center}
              r={outerZodiacRadius}
              fill="url(#firmamentWheelBg)"
              stroke="#22d3ee"
              strokeOpacity="0.45"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r={innerZodiacRadius}
              fill="none"
              stroke="#a855f7"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />

            {/* 36 Decan (10°) & 72 Five-Degree Ticks */}
            {Array.from({ length: 72 }).map((_, idx) => {
              const deg = idx * 5;
              const isSign = deg % 30 === 0;
              const isDecan = deg % 10 === 0;
              const r1 = isSign
                ? innerZodiacRadius
                : isDecan
                  ? outerZodiacRadius - 12
                  : outerZodiacRadius - 6;
              const p1 = polar(deg, r1, center);
              const p2 = polar(deg, outerZodiacRadius, center);
              return (
                <line
                  key={`tick-${deg}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isSign ? "#67e8f9" : isDecan ? "#c084fc" : "#334155"}
                  strokeOpacity={isSign ? 0.7 : 0.45}
                  strokeWidth={isSign ? "1.5" : "0.85"}
                />
              );
            })}

            {/* 12 Zodiac Sign Glyphs & Domicile Ruler Labels */}
            {ZODIAC_SIGNS.map((signName, idx) => {
              const midDeg = idx * 30 + 15;
              const pGlyph = polar(midDeg, 323, center);
              const ruler = DOMICILE[signName] ?? "Mars";
              return (
                <g
                  key={signName}
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredTooltip({
                      title: `${signName} (${idx * 30}°–${(idx + 1) * 30}°) · ${ELEMENT[signName]} Sign`,
                      subtitle: `Domicile Ruler: ${ruler}`,
                      ruleBadge: `Domicile: ${ruler}${EXALTATION[signName] ? ` · Exaltation: ${EXALTATION[signName]}` : ""}`,
                      ruleDetail: `Traditional Sign Rule: Planets placed in ${signName} answer to ${ruler} as their domicile lord and dispositor.`,
                      x: pGlyph.x,
                      y: pGlyph.y,
                    })
                  }
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <text
                    x={pGlyph.x}
                    y={pGlyph.y}
                    fill={idx % 2 === 0 ? "#67e8f9" : "#d8b4fe"}
                    fontSize="19"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {ZODIAC_GLYPHS[idx]}
                  </text>
                </g>
              );
            })}

            {/* Transit Ring & Natal Ring Tracks */}
            <circle
              cx={center}
              cy={center}
              r={transitRingRadius}
              fill="none"
              stroke="#c084fc"
              strokeOpacity="0.45"
              strokeWidth="1.25"
              strokeDasharray="3 6"
            />
            <circle
              cx={center}
              cy={center}
              r={natalRingRadius}
              fill="none"
              stroke="#22d3ee"
              strokeOpacity="0.55"
              strokeWidth="1.5"
            />
            <circle
              cx={center}
              cy={center}
              r={aspectHubRadius}
              fill="url(#aspectHubGlow)"
              stroke="#38bdf8"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />

            {/* 12 House Cusps & Interactive House Sectors */}
            {houses.map((cuspLon, idx) => {
              const houseNum = idx + 1;
              const nextLon = houses[(idx + 1) % 12] ?? ((idx + 1) * 30) % 360;
              const a = polar(cuspLon, aspectHubRadius, center);
              const b = polar(cuspLon, innerZodiacRadius, center);
              const midSpan = normalizeLongitude(
                cuspLon + ((normalizeLongitude(nextLon - cuspLon) || 30) / 2)
              );
              const labelPos = polar(midSpan, 174, center);
              const isAngular = [1, 4, 7, 10].includes(houseNum);
              const isHoraryTopic = houseNum === topicHouse || houseNum === 1;
              const isSelected = selectedHouse === houseNum;
              const cuspSign = signOf(cuspLon);
              const cuspRuler = DOMICILE[cuspSign] ?? "Mars";

              return (
                <g
                  key={`house-${houseNum}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedHouse(houseNum);
                    setSelectedNode(null);
                    setSelectedAspect(null);
                  }}
                  onMouseEnter={() =>
                    setHoveredTooltip({
                      title: `House ${houseNum} (${formatLongitude(cuspLon)}) · Ruled by ${cuspRuler}`,
                      subtitle: TRADITIONAL_HOUSE_MEANINGS[houseNum] ?? "",
                      ruleBadge: isAngular
                        ? "Angular Pivot (+5 Accidental Dignity)"
                        : [2, 5, 8, 11].includes(houseNum)
                          ? "Succedent House (+2 Accidental Dignity)"
                          : "Cadent House (−2 Accidental Dignity)",
                      ruleDetail: `${TRADITIONAL_HOUSE_MEANINGS[houseNum]} Sign on cusp: ${cuspSign} (Lord: ${cuspRuler}).`,
                      x: labelPos.x,
                      y: labelPos.y,
                    })
                  }
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={
                      isSelected
                        ? "#22d3ee"
                        : isHoraryTopic
                          ? "#f59e0b"
                          : isAngular
                            ? "#c084fc"
                            : "#334155"
                    }
                    strokeOpacity={
                      isSelected || isHoraryTopic ? 0.95 : isAngular ? 0.75 : 0.45
                    }
                    strokeWidth={
                      isSelected || isHoraryTopic ? "2.2" : isAngular ? "1.6" : "1"
                    }
                  />
                  <circle
                    cx={labelPos.x}
                    cy={labelPos.y}
                    r="11"
                    fill={
                      isSelected
                        ? "#06b6d4"
                        : isHoraryTopic
                          ? "rgba(245,158,11,0.2)"
                          : "rgba(15,23,42,0.85)"
                    }
                    stroke={
                      isSelected
                        ? "#67e8f9"
                        : isHoraryTopic
                          ? "#f59e0b"
                          : "#334155"
                    }
                    strokeWidth="1"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 3.5}
                    fill={
                      isSelected
                        ? "#020617"
                        : isHoraryTopic
                          ? "#fde68a"
                          : "#94a3b8"
                    }
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {houseNum}
                  </text>
                </g>
              );
            })}

            {/* Aspect Chords (Natal, Transit, Horary) */}
            {visibleAspects.map(asp => {
              const p1 = polar(asp.fromLon, asp.fromRadius, center);
              const p2 = polar(asp.toLon, asp.toRadius, center);
              const stroke = aspectColor(asp.layer, asp.aspect);
              const isSelected = selectedAspect?.id === asp.id;
              const isConnectedToSelectedNode =
                selectedNode &&
                (asp.fromName.includes(selectedNode.row.name) ||
                  asp.toName.includes(selectedNode.row.name));

              return (
                <g
                  key={asp.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedAspect(asp);
                    setSelectedNode(null);
                    setSelectedHouse(null);
                  }}
                  onMouseEnter={() =>
                    setHoveredTooltip({
                      title: `${asp.fromName} ${asp.aspect.toUpperCase()} ${asp.toName} (${asp.orb.toFixed(1)}° orb)`,
                      subtitle: `${asp.layer.toUpperCase()} ASPECT LAYER`,
                      ruleBadge: asp.receptionNote ?? `${asp.layer.toUpperCase()} 5° DOCTRINE`,
                      ruleDetail: asp.ruleSummary,
                      x: (p1.x + p2.x) / 2,
                      y: (p1.y + p2.y) / 2,
                    })
                  }
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  {/* Wide invisible hit target */}
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={stroke}
                    strokeOpacity="0.01"
                    strokeWidth="10"
                  />
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={stroke}
                    strokeOpacity={
                      isSelected || isConnectedToSelectedNode
                        ? 0.95
                        : asp.layer === "horary"
                          ? 0.85
                          : 0.48
                    }
                    strokeWidth={
                      isSelected || isConnectedToSelectedNode
                        ? "2.6"
                        : asp.layer === "horary"
                          ? "2"
                          : "1.35"
                    }
                    strokeDasharray={
                      asp.layer === "horary"
                        ? "6 3"
                        : asp.aspect === "square" || asp.aspect === "opposition"
                          ? "3 4"
                          : undefined
                    }
                    filter={
                      isSelected || asp.layer === "horary"
                        ? "url(#cyanGlow)"
                        : undefined
                    }
                  />
                </g>
              );
            })}

            {/* Inner Ring: Natal Placements (Cyan Glow) */}
            {natalRows.map(row => {
              const p = polar(row.longitude, natalRingRadius, center);
              const hubAnchor = polar(row.longitude, aspectHubRadius, center);
              const isSelected =
                selectedNode?.layer === "natal" &&
                selectedNode.row.name === row.name;
              const rule = evaluateTraditionalPlacementRule(
                row,
                sunLon,
                isDayChart,
                querentRuler,
                quesitedRuler,
                topicHouse
              );

              return (
                <g
                  key={`natal-node-${row.name}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNode({ layer: "natal", row });
                    setSelectedAspect(null);
                    setSelectedHouse(null);
                  }}
                  onMouseEnter={() =>
                    setHoveredTooltip({
                      title: `Natal ${row.name} · ${row.display} (House ${row.house})`,
                      subtitle: rule.sectStatus,
                      ruleBadge: `${rule.essentialDignities[0]} · ${rule.accidentalState}`,
                      ruleDetail: rule.ruleExplanation,
                      x: p.x,
                      y: p.y,
                    })
                  }
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <line
                    x1={hubAnchor.x}
                    y1={hubAnchor.y}
                    x2={p.x}
                    y2={p.y}
                    stroke="#22d3ee"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? "13" : "10.5"}
                    fill="#04101c"
                    stroke={isSelected ? "#ffffff" : "#22d3ee"}
                    strokeWidth={isSelected ? "2.4" : "1.8"}
                    filter="url(#cyanGlow)"
                  />
                  <text
                    x={p.x}
                    y={p.y + 3.5}
                    textAnchor="middle"
                    fill="#67e8f9"
                    fontSize={row.name.length > 7 ? "7.5" : "11"}
                    fontWeight="700"
                  >
                    {PLANET_GLYPHS[row.name] ?? row.name.slice(0, 2)}
                  </text>
                </g>
              );
            })}

            {/* Outer Ring: Transit & Horary Placements (Violet / Amber Glow) */}
            {transitRows.map(row => {
              const p = polar(row.longitude, transitRingRadius, center);
              const isSelected =
                selectedNode?.layer === "transit" &&
                selectedNode.row.name === row.name;
              const isHorarySignificator =
                row.name === querentRuler ||
                row.name === quesitedRuler ||
                row.name === "Moon";
              const rule = evaluateTraditionalPlacementRule(
                row,
                sunLon,
                isDayChart,
                querentRuler,
                quesitedRuler,
                topicHouse
              );

              return (
                <g
                  key={`transit-node-${row.name}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNode({ layer: "transit", row });
                    setSelectedAspect(null);
                    setSelectedHouse(null);
                  }}
                  onMouseEnter={() =>
                    setHoveredTooltip({
                      title: `Transit / Horary ${row.name} · ${row.display} (House ${row.house})`,
                      subtitle: rule.horaryRole ?? rule.sectStatus,
                      ruleBadge: rule.horaryRole
                        ? `${rule.horaryRole} · ${rule.essentialDignities[0]}`
                        : `${rule.essentialDignities[0]} · ${rule.accidentalState}`,
                      ruleDetail: rule.ruleExplanation,
                      x: p.x,
                      y: p.y,
                    })
                  }
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? "13" : isHorarySignificator ? "11.5" : "10"}
                    fill="#120722"
                    stroke={
                      isSelected
                        ? "#ffffff"
                        : isHorarySignificator
                          ? "#f59e0b"
                          : "#c084fc"
                    }
                    strokeWidth={
                      isSelected || isHorarySignificator ? "2.2" : "1.6"
                    }
                    filter="url(#violetGlow)"
                  />
                  <text
                    x={p.x}
                    y={p.y + 3.5}
                    textAnchor="middle"
                    fill={isHorarySignificator ? "#fde68a" : "#e9d5ff"}
                    fontSize={row.name.length > 7 ? "7.5" : "11"}
                    fontWeight="700"
                  >
                    {PLANET_GLYPHS[row.name] ?? row.name.slice(0, 2)}
                  </text>
                </g>
              );
            })}

            {/* Center Emblem */}
            <circle
              cx={center}
              cy={center}
              r="46"
              fill="#050811"
              stroke="#22d3ee"
              strokeOpacity="0.4"
              strokeWidth="1.2"
            />
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="10"
              fontWeight="600"
              fontFamily="IBM Plex Mono, monospace"
            >
              THE FIRMAMENT
            </text>
            <text
              x={center}
              y={center + 10}
              textAnchor="middle"
              fill="#67e8f9"
              fontSize="8"
              fontFamily="IBM Plex Mono, monospace"
            >
              {isDayChart ? "DIURNAL SECT" : "NOCTURNAL SECT"}
            </text>
          </svg>

            {hoveredTooltip && (
              <div
                role="tooltip"
                className="pointer-events-none absolute z-20 max-w-xs rounded-xl border border-cyan-400/50 bg-[#050811]/95 p-3 text-xs shadow-[0_0_25px_rgba(34,211,238,0.28)] backdrop-blur-md"
                style={{
                  left: `${Math.min(72, Math.max(6, (hoveredTooltip.x / size) * 100))}%`,
                  top: `${Math.min(76, Math.max(6, (hoveredTooltip.y / size) * 100))}%`,
                }}
              >
                <div className="font-serif text-sm font-semibold text-white">
                  {hoveredTooltip.title}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-cyan-300">
                  {hoveredTooltip.ruleBadge}
                </div>
                <p className="mt-1 text-[11px] leading-4 text-slate-300">
                  {hoveredTooltip.ruleDetail}
                </p>
              </div>
            )}
          </div>

          {/* Visual Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <span>Inner Ring: Natal Foundation</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                <span>Outer Ring: Transit Sky</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <span>Amber Halo: Horary Significators</span>
              </span>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-slate-400">
              {visibleAspects.length} active aspect chords rendered
            </span>
          </div>
        </div>

        {/* Right Column: Traditional Astrological Rule & Testimony Inspector */}
        <aside className="space-y-4 rounded-2xl border border-slate-800 bg-[#0b101b] p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                Traditional Rule Inspector
              </div>
              <h3 className="mt-0.5 font-serif text-xl text-white">
                {selectedAspect
                  ? `${selectedAspect.fromName} ↔ ${selectedAspect.toName}`
                  : selectedHouse
                    ? `House ${selectedHouse} Traditional Doctrine`
                    : activePlacementRule
                      ? `${activePlacementRule.layer === "transit" ? "Transit" : "Natal"} ${activePlacementRule.row.name}`
                      : "Select a Factor"}
              </h3>
            </div>
            {(selectedAspect || selectedHouse || selectedNode) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAspect(null);
                  setSelectedHouse(null);
                  setSelectedNode(null);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>

          {/* CASE 1: Selected Aspect Rule */}
          {selectedAspect && (
            <div className="space-y-3 rounded-xl border border-violet-400/25 bg-[#070b14] p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-violet-300">
                  {selectedAspect.layer} Aspect Rule
                </span>
                <span className="font-mono tabular-nums text-cyan-300">
                  {selectedAspect.aspect.toUpperCase()} ·{" "}
                  {selectedAspect.orb.toFixed(2)}° orb
                </span>
              </div>
              <p className="leading-5 text-slate-200">
                {selectedAspect.ruleSummary}
              </p>
              {selectedAspect.receptionNote && (
                <div className="rounded-lg border border-slate-800 bg-[#0b101b] p-2.5 text-amber-200">
                  <strong>Reception & Context:</strong>{" "}
                  {selectedAspect.receptionNote}
                </div>
              )}
            </div>
          )}

          {/* CASE 2: Selected House Rule */}
          {selectedHouse && (
            <div className="space-y-3 rounded-xl border border-cyan-400/25 bg-[#070b14] p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-cyan-300">
                  House {selectedHouse} Cusp
                </span>
                <span className="font-mono tabular-nums text-slate-200">
                  {formatLongitude(houses[selectedHouse - 1] ?? 0)}
                </span>
              </div>
              <p className="leading-5 text-slate-300">
                {TRADITIONAL_HOUSE_MEANINGS[selectedHouse]}
              </p>
              <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sign on Cusp:</span>
                  <span className="text-slate-200">
                    {signOf(houses[selectedHouse - 1] ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Traditional House Lord:</span>
                  <span className="font-semibold text-cyan-300">
                    {DOMICILE[signOf(houses[selectedHouse - 1] ?? 0)]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accidental Force:</span>
                  <span className="text-violet-200">
                    {[1, 4, 7, 10].includes(selectedHouse)
                      ? "Angular (+5 · Maximum Action)"
                      : [2, 5, 8, 11].includes(selectedHouse)
                        ? "Succedent (+2 · Consolidating)"
                        : "Cadent (−2 · Reflective / Preparatory)"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: Selected Planet / Placement Traditional Rules */}
          {!selectedAspect && !selectedHouse && activePlacementRule && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-slate-800 bg-[#070b14] p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold tabular-nums text-cyan-300">
                    {activePlacementRule.row.display}
                  </span>
                  <span className="font-mono text-slate-300">
                    House {activePlacementRule.row.house} (God H
                    {activePlacementRule.row.godHouse ?? "?"})
                  </span>
                </div>
                <p className="mt-2 leading-5 text-slate-300">
                  {activePlacementRule.rule.ruleExplanation}
                </p>

                {activePlacementRule.rule.horaryRole && (
                  <div className="mt-2.5 rounded-lg border border-amber-400/30 bg-amber-950/25 px-3 py-2 text-amber-200">
                    <strong>Horary Role:</strong>{" "}
                    {activePlacementRule.rule.horaryRole}
                  </div>
                )}

                <div className="mt-3.5 space-y-1.5 border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Domicile Lord:</span>
                    <span className="font-medium text-slate-200">
                      {activePlacementRule.rule.domicileRuler}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exaltation Lord:</span>
                    <span className="font-medium text-slate-200">
                      {activePlacementRule.rule.exaltationRuler ?? "None in this sign"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Triplicity / Bounds / Face:</span>
                    <span className="font-mono text-slate-200">
                      {activePlacementRule.rule.triplicityRuler} ·{" "}
                      {activePlacementRule.rule.termRuler} ·{" "}
                      {activePlacementRule.rule.faceRuler}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Essential Dignity:</span>
                    <span className="font-medium text-cyan-300">
                      {activePlacementRule.rule.essentialDignities.join(", ")}
                    </span>
                  </div>
                  {activePlacementRule.rule.debilities.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Traditional Debility:</span>
                      <span className="font-medium text-rose-300">
                        {activePlacementRule.rule.debilities.join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accidental House Force:</span>
                    <span className="font-medium text-violet-300">
                      {activePlacementRule.rule.accidentalState}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Solar Relationship:</span>
                    <span className="text-slate-200">
                      {activePlacementRule.rule.solarCondition}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sect Alignment:</span>
                    <span className="text-slate-200">
                      {activePlacementRule.rule.sectStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nakshatra & Manzil:</span>
                    <span className="font-mono text-amber-200">
                      {activePlacementRule.overlay.nakshatra} (P
                      {activePlacementRule.overlay.pada}) ·{" "}
                      {activePlacementRule.overlay.manzil}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Aspect List for Quick Inspection */}
          <div className="border-t border-slate-800 pt-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Active Aspect Chords ({visibleAspects.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Click any chord to inspect rule
              </span>
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {visibleAspects.slice(0, 14).map(asp => {
                const isSelected = selectedAspect?.id === asp.id;
                return (
                  <button
                    key={asp.id}
                    type="button"
                    onClick={() => {
                      setSelectedAspect(asp);
                      setSelectedNode(null);
                      setSelectedHouse(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? "border-cyan-400/60 bg-cyan-950/35 text-white"
                        : "border-slate-800/90 bg-[#070b14] text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="truncate">
                      <span
                        className="mr-1.5 font-mono text-[10px] uppercase"
                        style={{ color: aspectColor(asp.layer, asp.aspect) }}
                      >
                        [{asp.layer}]
                      </span>
                      {asp.fromName} {asp.aspect} {asp.toName}
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
                      {asp.orb.toFixed(1)}°
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
