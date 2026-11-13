import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { ChartResult } from "../../../server/astronomy";
import { trpc } from "@/lib/trpc";
import { ENERGY_ASPECT_FLOW } from "@/lib/energyScoring";
import { getHumanDialogue } from "@/lib/humanDialogueEngine";
import {
  Activity,
  ChevronRight,
  Clock,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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
  Ascendant: "AC",
  Descendant: "DC",
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌",
  semisextile: "⚺",
  semisquare: "∠",
  quincunx: "⚻",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

type ForecastResult = Awaited<
  ReturnType<typeof import("../../../server/harmonicForecast").calculateHarmonicForecast>
>;

interface D3DailyEnergyChartProps {
  chart: ChartResult;
  onAskQuestion?: (question: string) => void;
}

interface AspectLanePoint {
  time: Date;
  index: number;
  orb: number;
  intensity: number;
  strength: number;
}

interface AspectLane {
  id: string;
  transit: string;
  natal: string;
  aspect: string;
  flow: -1 | 0 | 1;
  isMajor: boolean;
  maxStrength: number;
  minOrb: number;
  peakIndex: number;
  points: AspectLanePoint[];
}

const FORECAST_CACHE_KEY = "fg:d3-harmonic-forecast:v1";

function buildForecastCacheKey(chart: ChartResult): string {
  const bucketMs = 30 * 60 * 1000;
  const parsed = Date.parse(chart.transitDate);
  const roundedBucket = Number.isFinite(parsed) ? Math.floor(parsed / bucketMs) : 0;
  return JSON.stringify([
    chart.input.date,
    chart.input.time,
    chart.input.latitude,
    chart.input.longitude,
    chart.input.transitLocation || chart.input.location,
    chart.input.transitLatitude ?? chart.input.latitude,
    chart.input.transitLongitude ?? chart.input.longitude,
    chart.worldview,
    roundedBucket,
  ]);
}

function readCachedForecast(key: string): ForecastResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FORECAST_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, { savedAt: number; data: ForecastResult }>;
    const entry = map[key];
    if (!entry || Date.now() - entry.savedAt > 60 * 60 * 1000) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCachedForecast(key: string, data: ForecastResult) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(FORECAST_CACHE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, { savedAt: number; data: ForecastResult }>) : {};
    map[key] = { savedAt: Date.now(), data };
    const entries = Object.entries(map).slice(-4);
    window.sessionStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Ignore storage quota errors cleanly.
  }
}

export function D3DailyEnergyChart({ chart, onAskQuestion }: D3DailyEnergyChartProps) {
  const forecast = trpc.hybrid.harmonicForecast.useMutation();
  const cacheKey = useMemo(() => buildForecastCacheKey(chart), [chart]);
  const [data, setData] = useState<ForecastResult | null>(() => readCachedForecast(cacheKey));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [patternFilter, setPatternFilter] = useState<"all" | "major" | "minor" | "flow" | "friction">("all");
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(860);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const waveSvgRef = useRef<SVGSVGElement | null>(null);
  const lanesSvgRef = useRef<SVGSVGElement | null>(null);
  const activeRequest = useRef(0);

  // Measure container width smoothly for crisp D3 responsiveness
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const updateWidth = () => {
      const next = Math.max(320, Math.floor(el.clientWidth));
      setContainerWidth(next);
    };
    updateWidth();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fetchForecast = (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = readCachedForecast(cacheKey);
      if (cached) {
        setData(cached);
        setSelectedIndex(0);
        return;
      }
    }
    const reqId = ++activeRequest.current;
    forecast.mutate(
      { chart: chart.input, start: chart.transitDate, steps: 48 },
      {
        onSuccess: (res) => {
          if (reqId !== activeRequest.current) return;
          writeCachedForecast(cacheKey, res);
          setData(res);
          setSelectedIndex(0);
        },
      }
    );
  };

  // Auto-load zero-token astronomical forecast once per cacheKey
  useEffect(() => {
    const cached = readCachedForecast(cacheKey);
    if (cached) {
      setData(cached);
      setSelectedIndex(0);
      return;
    }
    fetchForecast(false);
    return () => {
      activeRequest.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const timezone = data?.timezone || chart.input.transitTimezone || chart.input.timezone;

  const formatClock = (isoOrDate: string | Date) => {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    return d.toLocaleTimeString([], {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString([], {
      timeZone: timezone,
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  // Normalize valid points for D3
  const validPoints = useMemo(() => {
    if (!data?.points) return [];
    return data.points
      .map((p, index) => ({
        index,
        date: new Date(p.moment),
        moment: p.moment,
        flowPct: p.score ? p.score.flowPct : null,
        frictionPct: p.score ? p.score.frictionPct : null,
        flowWeight: p.score ? p.score.flowWeight : 0,
        frictionWeight: p.score ? p.score.frictionWeight : 0,
        signal: p.score?.signal ?? "Unavailable",
        contactsCount: p.score?.contactsCount ?? 0,
        score: p.score,
      }))
      .filter((p) => Number.isFinite(p.date.getTime()));
  }, [data]);

  // Extract planetary aspect pattern swimlanes across all 49 snapshots
  const allAspectLanes = useMemo<AspectLane[]>(() => {
    if (!validPoints.length) return [];
    const laneMap = new Map<string, AspectLane>();

    validPoints.forEach((pt) => {
      if (!pt.score?.contacts) return;
      for (const c of pt.score.contacts) {
        const key = c.id;
        let lane = laneMap.get(key);
        if (!lane) {
          const isMajor = c.majorFactor === 1;
          const flow = (ENERGY_ASPECT_FLOW as Record<string, -1 | 0 | 1>)[c.aspect] ?? c.flow ?? 0;
          lane = {
            id: key,
            transit: c.transit,
            natal: c.natal,
            aspect: c.aspect,
            flow,
            isMajor,
            maxStrength: c.strength,
            minOrb: c.orb,
            peakIndex: pt.index,
            points: [],
          };
          laneMap.set(key, lane);
        }
        if (c.strength > lane.maxStrength) {
          lane.maxStrength = c.strength;
        }
        if (c.orb < lane.minOrb) {
          lane.minOrb = c.orb;
          lane.peakIndex = pt.index;
        }
        lane.points.push({
          time: pt.date,
          index: pt.index,
          orb: c.orb,
          intensity: c.intensity,
          strength: c.strength,
        });
      }
    });

    return Array.from(laneMap.values()).sort((a, b) => {
      if (b.isMajor !== a.isMajor) return b.isMajor ? 1 : -1;
      if (b.maxStrength !== a.maxStrength) return b.maxStrength - a.maxStrength;
      return a.minOrb - b.minOrb;
    });
  }, [validPoints]);

  const filteredLanes = useMemo(() => {
    let list = allAspectLanes;
    if (patternFilter === "major") list = list.filter((l) => l.isMajor);
    else if (patternFilter === "minor") list = list.filter((l) => !l.isMajor);
    else if (patternFilter === "flow") list = list.filter((l) => l.flow === 1);
    else if (patternFilter === "friction") list = list.filter((l) => l.flow === -1);
    return list.slice(0, 12);
  }, [allAspectLanes, patternFilter]);

  const selectedPoint = validPoints[selectedIndex] ?? validPoints[0] ?? null;

  const peakFlowPoint = useMemo(() => {
    const scored = validPoints.filter((p) => p.flowPct !== null);
    return scored.length ? d3.greatest(scored, (p) => p.flowPct ?? -1) ?? null : null;
  }, [validPoints]);

  const peakFrictionPoint = useMemo(() => {
    const scored = validPoints.filter((p) => p.frictionPct !== null);
    return scored.length ? d3.greatest(scored, (p) => p.frictionPct ?? -1) ?? null : null;
  }, [validPoints]);

  // -------------------------------------------------------------------------
  // D3 CHART 1: 24-Hour Energy Fluctuations (Area + Dual Splines + Crosshair)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const svgEl = waveSvgRef.current;
    if (!svgEl || validPoints.length < 2) return;

    const width = containerWidth;
    const height = 240;
    const margin = { top: 24, right: 20, bottom: 32, left: 42 };
    const innerWidth = Math.max(120, width - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Definitions for glowing area fills
    const defs = svg.append("defs");
    const flowGrad = defs
      .append("linearGradient")
      .attr("id", "d3-flow-area")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    flowGrad.append("stop").attr("offset", "0%").attr("stop-color", "#2DD4BF").attr("stop-opacity", 0.38);
    flowGrad.append("stop").attr("offset", "100%").attr("stop-color", "#2DD4BF").attr("stop-opacity", 0.02);

    const frictionGrad = defs
      .append("linearGradient")
      .attr("id", "d3-friction-area")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    frictionGrad.append("stop").attr("offset", "0%").attr("stop-color", "#FB7185").attr("stop-opacity", 0.22);
    frictionGrad.append("stop").attr("offset", "100%").attr("stop-color", "#FB7185").attr("stop-opacity", 0.01);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(validPoints, (d) => d.date) as [Date, Date];
    const x = d3.scaleTime().domain(xExtent).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    // Gridlines
    const yTicks = [0, 25, 50, 75, 100];
    g.selectAll("line.y-grid")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", (d) => (d === 50 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"))
      .attr("stroke-dasharray", (d) => (d === 50 ? "4,4" : "2,4"));

    // Axes
    const tickCount = width < 520 ? 4 : 7;
    const xAxis = d3
      .axisBottom<Date>(x)
      .ticks(tickCount)
      .tickFormat((d) => formatClock(d));

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((axis) => axis.select(".domain").attr("stroke", "rgba(255,255,255,0.12)"))
      .call((axis) => axis.selectAll("line").attr("stroke", "rgba(255,255,255,0.12)"))
      .call((axis) =>
        axis.selectAll("text").attr("fill", "#94A3B8").attr("font-size", "10px").attr("font-family", "monospace")
      );

    const yAxis = d3
      .axisLeft<number>(y)
      .tickValues([0, 50, 100])
      .tickFormat((d) => `${d}%`);

    g.append("g")
      .call(yAxis)
      .call((axis) => axis.select(".domain").remove())
      .call((axis) => axis.selectAll("line").remove())
      .call((axis) =>
        axis.selectAll("text").attr("fill", "#94A3B8").attr("font-size", "10px").attr("font-family", "monospace")
      );

    // Areas & Lines
    const flowArea = d3
      .area<(typeof validPoints)[number]>()
      .defined((d) => d.flowPct !== null)
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.flowPct ?? 0))
      .curve(d3.curveMonotoneX);

    const frictionArea = d3
      .area<(typeof validPoints)[number]>()
      .defined((d) => d.frictionPct !== null)
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.frictionPct ?? 0))
      .curve(d3.curveMonotoneX);

    const flowLine = d3
      .line<(typeof validPoints)[number]>()
      .defined((d) => d.flowPct !== null)
      .x((d) => x(d.date))
      .y((d) => y(d.flowPct ?? 0))
      .curve(d3.curveMonotoneX);

    const frictionLine = d3
      .line<(typeof validPoints)[number]>()
      .defined((d) => d.frictionPct !== null)
      .x((d) => x(d.date))
      .y((d) => y(d.frictionPct ?? 0))
      .curve(d3.curveMonotoneX);

    g.append("path").datum(validPoints).attr("fill", "url(#d3-friction-area)").attr("d", frictionArea);
    g.append("path").datum(validPoints).attr("fill", "url(#d3-flow-area)").attr("d", flowArea);

    g.append("path")
      .datum(validPoints)
      .attr("fill", "none")
      .attr("stroke", "#FB7185")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3")
      .attr("d", frictionLine);

    g.append("path")
      .datum(validPoints)
      .attr("fill", "none")
      .attr("stroke", "#2DD4BF")
      .attr("stroke-width", 2.75)
      .attr("d", flowLine);

    // Peak markers
    if (peakFlowPoint && peakFlowPoint.flowPct !== null) {
      const px = x(peakFlowPoint.date);
      const py = y(peakFlowPoint.flowPct);
      g.append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 4.5)
        .attr("fill", "#2DD4BF")
        .attr("stroke", "#080B14")
        .attr("stroke-width", 1.5);
      g.append("text")
        .attr("x", Math.min(innerWidth - 48, Math.max(48, px)))
        .attr("y", Math.max(12, py - 8))
        .attr("text-anchor", "middle")
        .attr("fill", "#5EEAD4")
        .attr("font-size", "9px")
        .attr("font-weight", "700")
        .text(`Peak Flow ${peakFlowPoint.flowPct}%`);
    }

    if (peakFrictionPoint && peakFrictionPoint.frictionPct !== null) {
      const fx = x(peakFrictionPoint.date);
      const fy = y(peakFrictionPoint.frictionPct);
      g.append("circle")
        .attr("cx", fx)
        .attr("cy", fy)
        .attr("r", 4)
        .attr("fill", "#FB7185")
        .attr("stroke", "#080B14")
        .attr("stroke-width", 1.5);
    }

    // Selected moment crosshair
    const activePt = validPoints[selectedIndex] ?? validPoints[0];
    if (activePt) {
      const sx = x(activePt.date);
      g.append("line")
        .attr("x1", sx)
        .attr("x2", sx)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#FBBF24")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3");

      if (activePt.flowPct !== null) {
        g.append("circle")
          .attr("cx", sx)
          .attr("cy", y(activePt.flowPct))
          .attr("r", 5.5)
          .attr("fill", "#2DD4BF")
          .attr("stroke", "#FBBF24")
          .attr("stroke-width", 2);
      }
      if (activePt.frictionPct !== null) {
        g.append("circle")
          .attr("cx", sx)
          .attr("cy", y(activePt.frictionPct))
          .attr("r", 5)
          .attr("fill", "#FB7185")
          .attr("stroke", "#FBBF24")
          .attr("stroke-width", 2);
      }
    }

    // Interactive bisector scrubbing overlay
    const bisect = d3.bisector<(typeof validPoints)[number], Date>((d) => d.date).center;
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove click touchstart", function (event) {
        const [mx] = d3.pointer(event, this);
        const hoveredDate = x.invert(mx);
        const idx = bisect(validPoints, hoveredDate);
        if (idx >= 0 && idx < validPoints.length) {
          setSelectedIndex(idx);
        }
      });
  }, [validPoints, selectedIndex, containerWidth, peakFlowPoint, peakFrictionPoint, timezone]);

  // -------------------------------------------------------------------------
  // D3 CHART 2: Planetary Aspect Patterns Swimlanes (Synchronized Time X-Axis)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const svgEl = lanesSvgRef.current;
    if (!svgEl || validPoints.length < 2 || !filteredLanes.length) return;

    const width = containerWidth;
    const rowHeight = 32;
    const labelWidth = width < 560 ? 118 : 168;
    const margin = { top: 14, right: 20, bottom: 26, left: labelWidth };
    const innerWidth = Math.max(120, width - margin.left - margin.right);
    const innerHeight = filteredLanes.length * rowHeight;
    const height = innerHeight + margin.top + margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(validPoints, (d) => d.date) as [Date, Date];
    const x = d3.scaleTime().domain(xExtent).range([0, innerWidth]);
    const yBand = d3
      .scaleBand<string>()
      .domain(filteredLanes.map((l) => l.id))
      .range([0, innerHeight])
      .padding(0.2);

    // Subtle vertical time guide lines matching top chart
    const tickDates = x.ticks(width < 520 ? 4 : 7);
    g.selectAll("line.x-guide")
      .data(tickDates)
      .enter()
      .append("line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "rgba(255,255,255,0.05)");

    // Bottom time axis
    const xAxis = d3
      .axisBottom<Date>(x)
      .ticks(width < 520 ? 4 : 7)
      .tickFormat((d) => formatClock(d));

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((axis) => axis.select(".domain").attr("stroke", "rgba(255,255,255,0.12)"))
      .call((axis) => axis.selectAll("line").attr("stroke", "rgba(255,255,255,0.12)"))
      .call((axis) =>
        axis.selectAll("text").attr("fill", "#94A3B8").attr("font-size", "10px").attr("font-family", "monospace")
      );

    // Draw each aspect pattern swimlane
    filteredLanes.forEach((lane) => {
      const yTop = yBand(lane.id) ?? 0;
      const bandH = yBand.bandwidth();
      const yMid = yTop + bandH / 2;
      const isSelected = selectedLaneId === lane.id;
      const baseColor = lane.flow === 1 ? "#2DD4BF" : lane.flow === -1 ? "#FB7185" : "#38BDF8";

      const rowGroup = g
        .append("g")
        .style("cursor", "pointer")
        .on("click", () => setSelectedLaneId(isSelected ? null : lane.id));

      // Row background
      rowGroup
        .append("rect")
        .attr("x", -margin.left)
        .attr("y", yTop)
        .attr("width", width - margin.right)
        .attr("height", bandH)
        .attr("rx", 6)
        .attr("fill", isSelected ? "rgba(217,182,111,0.14)" : "rgba(255,255,255,0.02)")
        .attr("stroke", isSelected ? "rgba(217,182,111,0.5)" : "transparent");

      // Left label (Aspect Pair + Major/Minor badge)
      const tGlyph = PLANET_GLYPHS[lane.transit] || lane.transit.slice(0, 2);
      const nGlyph = PLANET_GLYPHS[lane.natal] || lane.natal.slice(0, 2);
      const aGlyph = ASPECT_SYMBOLS[lane.aspect] || "•";

      const labelText = width < 560
        ? `${tGlyph} ${aGlyph} ${nGlyph} ${lane.isMajor ? "★" : "✧"}`
        : `${tGlyph} ${lane.transit} ${aGlyph} ${nGlyph} ${lane.natal} ${lane.isMajor ? "★" : "✧50%"}`;

      rowGroup
        .append("text")
        .attr("x", -10)
        .attr("y", yMid + 4)
        .attr("text-anchor", "end")
        .attr("fill", isSelected ? "#FDE68A" : lane.isMajor ? "#F1F5F9" : "#94A3B8")
        .attr("font-size", width < 560 ? "10px" : "11px")
        .attr("font-weight", lane.isMajor ? "700" : "500")
        .text(labelText);

      // Continuous D3 intensity nodes across the 24-hour lane
      const stepWidth = Math.max(4, innerWidth / Math.max(1, validPoints.length));
      lane.points.forEach((pt) => {
        const cx = x(pt.time);
        const tightness = Math.max(0.25, 1 - pt.orb / 5);
        const opacity = (lane.isMajor ? 0.35 : 0.2) + tightness * (lane.isMajor ? 0.65 : 0.45);
        const barH = Math.max(4, bandH * (lane.isMajor ? 0.65 : 0.4) * (0.45 + 0.55 * tightness));

        rowGroup
          .append("rect")
          .attr("x", cx - stepWidth * 0.42)
          .attr("y", yMid - barH / 2)
          .attr("width", Math.max(3, stepWidth * 0.84))
          .attr("height", barH)
          .attr("rx", 2)
          .attr("fill", baseColor)
          .attr("fill-opacity", opacity);

        // Peak exactness diamond indicator (< 1.0 deg orb)
        if (pt.index === lane.peakIndex && pt.orb <= 1.5) {
          rowGroup
            .append("path")
            .attr("d", d3.symbol().type(d3.symbolDiamond).size(lane.isMajor ? 56 : 36)())
            .attr("transform", `translate(${cx},${yMid})`)
            .attr("fill", "#FDE68A")
            .attr("stroke", "#080B14")
            .attr("stroke-width", 1);
        }
      });
    });

    // Synchronized crosshair from selectedIndex
    const activePt = validPoints[selectedIndex];
    if (activePt) {
      const sx = x(activePt.date);
      g.append("line")
        .attr("x1", sx)
        .attr("x2", sx)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#FBBF24")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3")
        .style("pointer-events", "none");
    }
  }, [validPoints, filteredLanes, selectedIndex, selectedLaneId, containerWidth, timezone]);

  const activeLane = useMemo(
    () => filteredLanes.find((l) => l.id === selectedLaneId) ?? null,
    [filteredLanes, selectedLaneId]
  );

  return (
    <section
      ref={wrapperRef}
      aria-label="D3 Daily Energy Fluctuations and Aspect Patterns"
      className="space-y-5 rounded-3xl border border-cyan-400/25 bg-[linear-gradient(145deg,#080B14_0%,#0E1526_100%)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] sm:p-7"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
              D3 Astronomical Wave · Zero-Token Live Calculation
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            24-Hour Energy Fluctuations & Planetary Aspect Patterns
          </h2>
          <p className="mt-0.5 text-xs text-slate-300">
            Scrub or tap anywhere across the next 24 hours to inspect real Swiss Ephemeris harmony vs. friction waves and when each planetary aspect peaks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchForecast(true)}
          disabled={forecast.isPending}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-950/30 px-3.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-900/40 disabled:opacity-50"
        >
          <RefreshCw size={13} className={forecast.isPending ? "animate-spin" : ""} />
          <span>{forecast.isPending ? "Mapping 24h Sky…" : "Recalculate 24h Curve"}</span>
        </button>
      </div>

      {forecast.error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200">
          Could not compute 24-hour curve: {forecast.error.message}
        </p>
      )}

      {!data && forecast.isPending && (
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-black/30 p-6 text-sm text-cyan-200">
          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
          <span>Computing 49 half-hour planetary snapshots across the next 24 hours…</span>
        </div>
      )}

      {data && validPoints.length > 0 && (
        <>
          {/* Live Interactive Scrubber Inspector Strip */}
          {selectedPoint && (
            <div className="grid gap-3 rounded-2xl border border-amber-300/25 bg-black/40 p-4 sm:grid-cols-4">
              <div>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  <Clock size={11} /> Selected Time
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-white">
                  {formatDateTime(selectedPoint.moment)}
                </p>
                <p className="text-[11px] text-slate-400">{selectedPoint.signal}</p>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                  <TrendingUp size={11} /> Harmony Flow
                </span>
                <p className="mt-1 font-serif text-2xl font-bold text-[#2DD4BF] tabular-nums">
                  {selectedPoint.flowPct !== null ? `${selectedPoint.flowPct}%` : "—"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {Math.round(selectedPoint.flowWeight)} weighted pts
                </p>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#FB7185]">
                  <TrendingDown size={11} /> Growth Friction
                </span>
                <p className="mt-1 font-serif text-2xl font-bold text-[#FB7185] tabular-nums">
                  {selectedPoint.frictionPct !== null ? `${selectedPoint.frictionPct}%` : "—"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {Math.round(selectedPoint.frictionWeight)} weighted pts
                </p>
              </div>

              <div>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <Sparkles size={11} /> Tightest Contact
                </span>
                {selectedPoint.score?.tightest ? (
                  <>
                    <p className="mt-1 text-xs font-bold text-white">
                      {selectedPoint.score.tightest.transit} {ASPECT_SYMBOLS[selectedPoint.score.tightest.aspect] || selectedPoint.score.tightest.aspect} {selectedPoint.score.tightest.natal}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {selectedPoint.score.tightest.orb.toFixed(2)}° orb · {selectedPoint.contactsCount} total active
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">No contacts within 5°</p>
                )}
              </div>
            </div>
          )}

          {/* Legend & Peak Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-5 rounded-sm bg-[#2DD4BF]" />
                Harmony Flow (%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-5 border-t-2 border-dashed border-[#FB7185]" />
                Growth Friction (%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-0.5 bg-[#FBBF24]" />
                Selected Moment
              </span>
            </div>
            {peakFlowPoint && (
              <span className="font-mono text-[11px] text-teal-300">
                Best window: {formatClock(peakFlowPoint.date)} ({peakFlowPoint.flowPct}% flow)
              </span>
            )}
          </div>

          {/* D3 Wave Chart Container */}
          <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#060912] p-2">
            <svg ref={waveSvgRef} className="block w-full h-auto select-none" />
          </div>

          {/* D3 Planetary Aspect Patterns Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Planetary Aspect Patterns Across 24 Hours
                </h3>
                <p className="text-xs text-slate-400">
                  Major aspects carry 100% weight (★); minor aspects carry 50% subtle nuance (✧). Gold diamonds mark exactness peaks. Click any row for plain-English insight.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-[11px]">
                {[
                  { id: "all", label: `All (${allAspectLanes.length})` },
                  { id: "major", label: "★ Major 100%" },
                  { id: "minor", label: "✧ Minor 50%" },
                  { id: "flow", label: "Flow" },
                  { id: "friction", label: "Friction" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPatternFilter(f.id as any)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      patternFilter === f.id
                        ? "bg-[#D9B66F] text-black"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredLanes.length > 0 ? (
              <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#060912] p-2">
                <svg ref={lanesSvgRef} className="block w-full h-auto select-none" />
              </div>
            ) : (
              <p className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400">
                No planetary aspect patterns match this filter during the 24-hour window.
              </p>
            )}

            {/* Selected Aspect Pattern Everyday Human Explanation */}
            {activeLane && (() => {
              const human = getHumanDialogue(
                activeLane.transit,
                activeLane.aspect,
                activeLane.natal,
                activeLane.isMajor,
                activeLane.minOrb
              );
              const peakTime = validPoints[activeLane.peakIndex]?.moment;
              return (
                <div className="rounded-2xl border border-[#D9B66F]/40 bg-[#101628]/90 p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9B66F]">
                        {activeLane.isMajor ? "★ Major Pattern (100% Impact)" : "✧ Minor Pattern (50% Subtle Nuance)"} · Tightest orb {activeLane.minOrb.toFixed(2)}°
                        {peakTime ? ` around ${formatClock(peakTime)}` : ""}
                      </span>
                      <h4 className="mt-0.5 font-serif text-lg font-bold text-white">
                        {activeLane.transit} {activeLane.aspect} natal {activeLane.natal} — {human.everydayTitle}
                      </h4>
                      <p className="text-xs italic text-cyan-200/90">"{human.tagline}"</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLaneId(null)}
                      className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-200">
                    {human.feelingInBodyAndMind}
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-3">
                      <strong className="block text-[10px] uppercase tracking-wider text-emerald-300">
                        Best Move
                      </strong>
                      <p className="mt-1 text-slate-200">{human.bestMoveToday}</p>
                    </div>
                    <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-3">
                      <strong className="block text-[10px] uppercase tracking-wider text-rose-300">
                        Trap to Avoid
                      </strong>
                      <p className="mt-1 text-slate-200">{human.trapToAvoid}</p>
                    </div>
                  </div>

                  {onAskQuestion && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          onAskQuestion(
                            `Explain how today's ${activeLane.transit} ${activeLane.aspect} my natal ${activeLane.natal} pattern unfolds in real life.`
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline"
                      >
                        <span>Ask Master Interpreter about this pattern</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </>
      )}
    </section>
  );
}
