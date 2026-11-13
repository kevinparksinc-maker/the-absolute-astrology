import { PlacementMiniReading } from "./PlacementMiniReading";
import React, { useState } from "react";
import type { ChartResult, ChartRow } from "../../../server/astronomy";

type Frame = "god" | "agent";
const glyphs: Record<string, string> = {
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
  Rahu: "☊",
  Ketu: "☋",
  NorthNode: "☊",
  SouthNode: "☋",
  "North Node": "☊",
  "South Node": "☋",
};
const signs = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
];
const normalize = (value: number) => ((value % 360) + 360) % 360;

const HOUSE_GEOMETRY = [
  // H1: Top Center Diamond (Ascendant / Lagna)
  {
    house: 1,
    points: "200,0 100,100 200,200 300,100",
    labelPos: { x: 200, y: 72 },
    signPos: { x: 200, y: 35 },
    planetPos: { x: 200, y: 125 },
  },
  // H2: Top-Left Triangle
  {
    house: 2,
    points: "200,0 0,0 100,100",
    labelPos: { x: 100, y: 45 },
    signPos: { x: 145, y: 35 },
    planetPos: { x: 95, y: 72 },
  },
  // H3: Upper-Left Triangle
  {
    house: 3,
    points: "0,0 0,200 100,100",
    labelPos: { x: 45, y: 100 },
    signPos: { x: 35, y: 145 },
    planetPos: { x: 50, y: 75 },
  },
  // H4: Left Center Diamond (Nadir / Bandhu)
  {
    house: 4,
    points: "0,200 100,100 200,200 100,300",
    labelPos: { x: 100, y: 172 },
    signPos: { x: 35, y: 200 },
    planetPos: { x: 100, y: 225 },
  },
  // H5: Lower-Left Triangle
  {
    house: 5,
    points: "0,200 0,400 100,300",
    labelPos: { x: 45, y: 300 },
    signPos: { x: 35, y: 260 },
    planetPos: { x: 50, y: 335 },
  },
  // H6: Bottom-Left Triangle
  {
    house: 6,
    points: "0,400 200,400 100,300",
    labelPos: { x: 100, y: 355 },
    signPos: { x: 145, y: 375 },
    planetPos: { x: 95, y: 330 },
  },
  // H7: Bottom Center Diamond (Descendant / Jaya)
  {
    house: 7,
    points: "200,400 100,300 200,200 300,300",
    labelPos: { x: 200, y: 272 },
    signPos: { x: 200, y: 375 },
    planetPos: { x: 200, y: 325 },
  },
  // H8: Bottom-Right Triangle
  {
    house: 8,
    points: "200,400 400,400 300,300",
    labelPos: { x: 300, y: 355 },
    signPos: { x: 255, y: 375 },
    planetPos: { x: 305, y: 330 },
  },
  // H9: Lower-Right Triangle
  {
    house: 9,
    points: "400,400 400,200 300,300",
    labelPos: { x: 355, y: 300 },
    signPos: { x: 365, y: 260 },
    planetPos: { x: 350, y: 335 },
  },
  // H10: Right Center Diamond (Midheaven / Karma)
  {
    house: 10,
    points: "400,200 300,300 200,200 300,100",
    labelPos: { x: 300, y: 172 },
    signPos: { x: 365, y: 200 },
    planetPos: { x: 300, y: 225 },
  },
  // H11: Upper-Right Triangle
  {
    house: 11,
    points: "400,200 400,0 300,100",
    labelPos: { x: 355, y: 100 },
    signPos: { x: 365, y: 145 },
    planetPos: { x: 350, y: 75 },
  },
  // H12: Top-Right Triangle
  {
    house: 12,
    points: "400,0 200,0 300,100",
    labelPos: { x: 300, y: 45 },
    signPos: { x: 255, y: 35 },
    planetPos: { x: 305, y: 72 },
  },
];

const houseNames = [
  "Self & approach",
  "Resources & values",
  "Learning & communication",
  "Home & foundations",
  "Creativity & children",
  "Work & maintenance",
  "Partners & agreements",
  "Shared resources & obligations",
  "Knowledge & direction",
  "Work & visibility",
  "Alliances & aspirations",
  "Withdrawal & hidden matters",
];
const houseOf = (row: ChartRow, frame: Frame) =>
  frame === "god"
    ? (row.godHouse ?? Math.floor(normalize(row.longitude) / 30) + 1)
    : row.agentHouse;
type HouseFocus = { frame: Frame; house: number };
function GuardianDiamond({
  chart,
  frame,
  selected,
  focus,
  onSelect,
  onHouse,
}: {
  chart: ChartResult;
  frame: Frame;
  selected: string | null;
  focus: HouseFocus | null;
  onSelect: (name: string) => void;
  onHouse: (focus: HouseFocus) => void;
}) {
  const all = [...chart.movingBodies, chart.northNode, chart.southNode].filter(
    (body): body is ChartRow =>
      Boolean(body) && Number.isFinite(body!.longitude)
  );
  const anchor = frame === "god" ? 0 : chart.ascendant?.longitude;
  const current = all.find(row => row.name === selected);
  const active =
    focus?.frame === frame
      ? focus.house
      : current
        ? houseOf(current, frame)
        : undefined;
  const color = frame === "god" ? "#fbbf24" : "#22d3ee";
  return (
    <div className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#0a1120,#080c16)] p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="text-xs uppercase tracking-wider" style={{ color }}>
            {frame === "god" ? "Chart I · God View" : "Chart II · Agent View"}
          </p>
          <h3 className="mt-2 font-serif text-xl text-white">
            {frame === "god"
              ? "House 1 = 0° Aries"
              : anchor != null
                ? `House 1 = ${anchor.toFixed(2)}°`
                : "Local horizon unavailable"}
          </h3>
        </div>
        {active && (
          <p className="text-right text-xs" style={{ color }}>
            Active focus
            <br />
            <strong className="text-sm">House {active}</strong>
          </p>
        )}
      </header>
      <svg
        viewBox="-4 -4 408 408"
        className="mx-auto block w-full max-w-[600px]"
        role="group"
        aria-label={`${frame} North Indian diamond chart with twelve houses and calculated planetary placements`}
      >
        <rect
          x="0"
          y="0"
          width="400"
          height="400"
          rx="2"
          fill="#070d19"
          stroke={color}
          strokeWidth="1.5"
        />
        {HOUSE_GEOMETRY.map(area => {
          const members = all.filter(row => houseOf(row, frame) === area.house);
          const cusp =
            frame === "god"
              ? (area.house - 1) * 30
              : chart.houses[area.house - 1];
          const signIndex =
            typeof cusp === "number" ? Math.floor(normalize(cusp) / 30) : null;
          return (
            <g key={area.house}>
              <polygon
                points={area.points}
                fill={
                  active === area.house
                    ? frame === "god"
                      ? "#44320d"
                      : "#06394c"
                    : "transparent"
                }
                stroke={active === area.house ? color : "#ad913e"}
                strokeWidth={active === area.house ? 2 : 0.8}
                role="button"
                tabIndex={0}
                aria-label={`${frame === "god" ? "God" : "Agent"} House ${area.house}`}
                aria-pressed={active === area.house}
                onClick={() => onHouse({ frame, house: area.house })}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onHouse({ frame, house: area.house });
                  }
                }}
                className="cursor-pointer outline-none focus:stroke-white"
              />
              <g pointerEvents="none">
                <text
                  x={area.labelPos.x}
                  y={area.labelPos.y}
                  fill={active === area.house ? color : "#b8c3d3"}
                  textAnchor="middle"
                  fontSize="11"
                >
                  H{area.house}
                </text>
                {signIndex != null && (
                  <text
                    x={area.signPos.x}
                    y={area.signPos.y}
                    fill={color}
                    textAnchor="middle"
                    fontSize="15"
                  >
                    {signs[signIndex]}
                  </text>
                )}
                {members.slice(0, 5).map((row, i) => (
                  <text
                    key={row.name}
                    x={area.planetPos.x}
                    y={
                      area.planetPos.y +
                      (i - (Math.min(members.length, 5) - 1) / 2) * 13
                    }
                    fill={row.name === selected ? color : "#e5edf9"}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight={row.name === selected ? "bold" : "normal"}
                  >
                    {glyphs[row.name] ?? row.name.slice(0, 3)}
                    {row.retrograde ? " ℞" : ""}
                  </text>
                ))}
                {members.length > 5 && (
                  <text
                    x={area.planetPos.x + 26}
                    y={area.planetPos.y + 30}
                    fill={color}
                    fontSize="10"
                  >
                    +{members.length - 5}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </svg>
      <footer className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-400">
        <span>
          {frame === "god"
            ? "Fixed firmament sectors"
            : "Sunrise Ascendant · Equal Houses"}
        </span>
        {active && anchor != null && (
          <span style={{ color }}>
            Arc {normalize(anchor + (active - 1) * 30).toFixed(2)}° →{" "}
            {normalize(anchor + active * 30).toFixed(2)}°
          </span>
        )}
      </footer>
    </div>
  );
}
export function GuardianDiamondCharts({ chart }: { chart: ChartResult }) {
  const [selected, setSelected] = useState<string | null>("Sun");
  const [focus, setFocus] = useState<HouseFocus | null>(null);
  const available =
    chart.agentViewAvailable &&
    chart.ascendant != null &&
    chart.movingBodies.some(row => row.agentHouse != null);
  const all = [...chart.movingBodies, chart.northNode, chart.southNode].filter(
    (row): row is ChartRow => Boolean(row)
  );
  const current = all.find(row => row.name === selected);
  const select = (name: string) => {
    setSelected(name);
    setFocus(null);
  };
  const house =
    focus?.house ??
    (current ? (current.agentHouse ?? current.godHouse) : undefined);
  const frame = focus?.frame ?? (available ? "agent" : "god");
  const residents = house
    ? all.filter(row => houseOf(row, frame) === house)
    : [];
  return (
    <section
      className="space-y-5 rounded-2xl border border-cyan-200/15 bg-[#050b16]/85 p-4 sm:p-5"
      aria-label="Visual diamond chart comparison"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-300">
            Comparative chart map · North Indian diamonds
          </p>
          <h2 className="mt-2 font-serif text-2xl text-white sm:text-3xl">
            House matrix & planetary projection
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            One calculated sky, two reference frames. Tap a house or select a
            planet to trace its position.
          </p>
        </div>
        <span className="rounded-full border border-cyan-200/20 px-3 py-1 text-xs text-cyan-200">
          Astronomical XYZ · fixed firmament
        </span>
      </header>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Select chart house"
      >
        {HOUSE_GEOMETRY.map(area => (
          <button
            type="button"
            key={area.house}
            onClick={() => {
              setSelected(null);
              setFocus({
                frame: available ? "agent" : "god",
                house: area.house,
              });
            }}
            aria-pressed={house === area.house}
            className={`rounded-lg border px-2.5 py-1.5 text-xs ${house === area.house ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100" : "border-white/10 text-slate-400"}`}
          >
            H{area.house}
          </button>
        ))}
      </div>
      <div className={available ? "grid gap-5 xl:grid-cols-2" : "grid gap-5"}>
        <GuardianDiamond
          chart={chart}
          frame="god"
          selected={selected}
          focus={focus}
          onSelect={select}
          onHouse={value => {
            setSelected(null);
            setFocus(value);
          }}
        />
        {available && (
          <GuardianDiamond
            chart={chart}
            frame="agent"
            selected={selected}
            focus={focus}
            onSelect={select}
            onHouse={value => {
              setSelected(null);
              setFocus(value);
            }}
          />
        )}
      </div>
      {!available && (
        <p className="text-xs text-slate-400">
          A verified local Ascendant is required for the Agent chart.
        </p>
      )}
      <div
        className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-3"
        aria-label="Select a planet to inspect"
      >
        {all.map(row => (
          <button
            type="button"
            key={row.name}
            onClick={() => select(row.name)}
            aria-pressed={selected === row.name}
            className={`rounded-full border px-3 py-1.5 text-xs ${selected === row.name ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-300"}`}
          >
            {glyphs[row.name]} {row.name}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-wide text-cyan-300">
            Active house dossier
          </p>
          <h3 className="mt-3 font-serif text-xl text-white">
            {house
              ? `House ${house} · ${houseNames[house - 1]}`
              : "Select a house"}
          </h3>
          <p className="mt-2 text-xs text-slate-400">
            {frame === "god"
              ? "God View fixed sector"
              : "Agent View local house"}
          </p>
          <div className="mt-4 space-y-2">
            {residents.map(row => (
              <button
                type="button"
                key={row.name}
                onClick={() => select(row.name)}
                className="block text-left text-sm text-cyan-100"
              >
                {glyphs[row.name]} {row.name} · {row.display}
              </button>
            ))}
            {house && !residents.length && (
              <p className="text-sm text-slate-400">
                No moving body occupies this house.
              </p>
            )}
          </div>
        </article>
        <article className="rounded-xl border border-white/10 bg-slate-950/70 p-4 lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-amber-300">
            Across both frames
          </p>
          {current ? (
            <>
              <h3 className="mt-3 font-serif text-xl text-white">
                {current.name} · {current.display}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                God H{houseOf(current, "god")}
                {current.agentHouse != null
                  ? ` → Agent H${current.agentHouse}`
                  : " · Local house unavailable"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Longitude {current.longitude.toFixed(6)}° ·{" "}
                {current.coordinateSource ?? "calculated chart"}. The position
                stays the same while its house context changes.
              </p>
              <PlacementMiniReading
                key={current.name}
                chart={chart}
                name={current.name}
                autoGenerate={false}
              />
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              Select a body to inspect its exact longitude and house mapping.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
