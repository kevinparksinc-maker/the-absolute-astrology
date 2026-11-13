import sweph from "sweph";
import {
  ephemerisXYZ,
  noaaSunriseUtc,
  type ChartResult,
} from "../../astronomy";
import {
  normalizeLongitude as norm,
  ZODIAC_SIGNS,
} from "../../../shared/hybrid";
import { vargaPlacement } from "./vargas";

/** Independently implemented mathematical rules; sources and selected variants are public.
 * BPHS 26 (degree Drishti), 27 (strength); Maitreya's documented calendar convention.
 * The Absolute retains its supplied XYZ projection and sunrise/equal-house geometry.
 * No tropical/sidereal re-casting, ayanamsha, J2000 wheel anchor or coordinate tilt is applied.
 */
export const STRENGTH_VERSION = "bphs-fixed-xyz-strength-v1";
export const STRENGTH_SOURCES = [
  {
    title: "Brihat Parashara Hora Shastra, chapter 26",
    url: "https://vedicpupil.in/library/books/brihat-parashara-hora-shastra/chapter-26",
  },
  {
    title: "Brihat Parashara Hora Shastra, chapter 27",
    url: "https://vedicpupil.in/library/books/brihat-parashara-hora-shastra/chapter-27",
  },
  {
    title: "Maitreya: calendar/Hora convention",
    url: "https://saravali.github.io/astrology/hora_calculation.html",
  },
  {
    title: "Swiss Ephemeris: Cartesian velocity and orbital anomalies",
    url: "https://www.astro.com/swisseph/swephprg.htm",
  },
];
export const CLASSICAL = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
] as const;
export type Graha = (typeof CLASSICAL)[number];
const IDS: Record<Graha, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 4,
  Mercury: 2,
  Jupiter: 5,
  Venus: 3,
  Saturn: 6,
};
export const REQUIRED: Record<Graha, number> = {
  Sun: 390,
  Moon: 360,
  Mars: 300,
  Mercury: 420,
  Jupiter: 390,
  Venus: 330,
  Saturn: 300,
};
const EXALT: Record<Graha, number> = {
  Sun: 10,
  Moon: 33,
  Mars: 298,
  Mercury: 165,
  Jupiter: 95,
  Venus: 357,
  Saturn: 200,
};
const LORDS: Graha[] = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
];
const MOOLA: Record<Graha, number> = {
  Sun: 4,
  Moon: 1,
  Mars: 0,
  Mercury: 5,
  Jupiter: 8,
  Venus: 6,
  Saturn: 10,
};
const FRIENDS: Record<Graha, Graha[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
};
const ENEMIES: Record<Graha, Graha[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
};
const WEEK: Graha[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];
const HORA: Graha[] = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
];
const angle = (a: number, b: number) => Math.min(norm(a - b), norm(b - a));
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const mod = (n: number, d: number) => ((n % d) + d) % d;
const sign = (n: number) => Math.floor(norm(n) / 30);
const rad = Math.PI / 180;
const assert = (ok: unknown, message: string): void => {
  if (!ok) throw new Error(`VEDIC_STRENGTH_INPUT: ${message}`);
};
export const STRENGTH_VARIANT = {
  frame:
    "The Absolute supplied equatorial XYZ longitudes; no zodiac conversion",
  houses:
    "Supplied equal-house anchors used as Bhava reference points; not Sripati cusps",
  saptavarga:
    "BPHS 45/30/20/15/10/4/2; moolatrikona by sign in each division; temporary friendship from D1",
  drekkana: "BPHS 27.6: male first, neutral second, female third",
  paksha:
    "BPHS 27.10–11: Moon/Mercury/Jupiter/Venus receive phase/3; other three receive its complement",
  drik: "BPHS degree-aspect replacements; signed quarter benefic-minus-malefic, no Western orb cutoff",
  meanMotion:
    "BPHS continuous Cheshta Kendra; osculating mean anomaly rotated in the date's heliocentric equatorial XYZ plane, not ancient mean-motion tables",
  ayana:
    "Kranti from supplied XYZ Z component; traditional 24° normalization; this does not rotate the chart",
  calendar:
    "Maitreya year/month lords; sunrise weekday; unequal seasonal day/night Horas",
  war: "BPHS 27.20: eligible nonluminary pairs within 1°, higher wrapped longitude wins; transfer absolute pre-war Kala difference, simultaneous adjustments",
  bhava:
    "BPHS 27.26–31: lord + direction + degree aspects + occupancy + rising-type time adjustment",
  twilight:
    "One-ghati (24-minute) interval either side of sunrise or sunset; explicit implementation convention",
} as const;

/** Degree aspect strength, BPHS 26.6–12. No Western square/trine polarity is used. */
export function sphutaDrishti(source: Graha, from: number, to: number): number {
  const d = norm(to - from),
    r = d % 30,
    band = Math.floor(d / 30);
  if (source === "Saturn") {
    if (band === 1) return 2 * r;
    if (band === 2) return 60 - r / 2;
    if (band === 8) return 30 + r;
    if (band === 9) return 60 - 2 * r;
  }
  if (source === "Mars") {
    if (band === 2) return 15 + 1.5 * r;
    if (band === 3 || band === 7) return 60 - r;
    if (band === 6) return 60;
  }
  if (source === "Jupiter") {
    if (band === 3 || band === 7) return 45 + r / 2;
    if (band === 4 || band === 8) return 60 - 2 * r;
  }
  if (d < 30 || d >= 300) return 0;
  if (d < 60) return (d - 30) / 2;
  if (d < 90) return d - 45;
  if (d < 120) return (120 - d) / 2 + 30;
  if (d < 150) return 150 - d;
  if (d < 180) return 2 * (d - 150);
  return (300 - d) / 2;
}
export function uchchaBala(body: Graha, longitude: number) {
  return angle(longitude, norm(EXALT[body] + 180)) / 3;
}
export function digBala(body: Graha, longitude: number, houses: number[]) {
  const weak: Record<Graha, number> = {
    Sun: 4,
    Mars: 4,
    Moon: 10,
    Venus: 10,
    Mercury: 7,
    Jupiter: 7,
    Saturn: 1,
  };
  return angle(longitude, houses[weak[body] - 1]) / 3;
}
/** The three missing Saptavarga projections are local derivatives, not new skies. */
export function strengthVargaSign(longitude: number, division: number): number {
  const s = sign(longitude),
    degree = norm(longitude) % 30;
  if (division === 1) return s;
  if (division === 2 || division === 3 || division === 9)
    return vargaPlacement(longitude, `D${division}` as "D2" | "D3" | "D9")
      .signIndex;
  if (division === 7)
    return (s + (s % 2 === 0 ? 0 : 6) + Math.floor(degree / (30 / 7))) % 12;
  if (division === 12) return (s + Math.floor(degree / 2.5)) % 12;
  if (division === 30) {
    const bounds = s % 2 === 0 ? [5, 10, 18, 25, 30] : [5, 12, 20, 25, 30];
    const signs = s % 2 === 0 ? [0, 10, 8, 2, 6] : [1, 5, 11, 9, 7];
    return signs[bounds.findIndex(end => degree < end)];
  }
  throw new Error(`Unsupported strength division D${division}`);
}
export function saptavargajaBala(
  body: Graha,
  positions: Record<Graha, number>
) {
  return [1, 2, 3, 7, 9, 12, 30].map(division => {
    const s = strengthVargaSign(positions[body], division),
      lord = LORDS[s];
    let relation = "",
      value: number;
    if (s === MOOLA[body]) {
      value = 45;
      relation = "moolatrikona";
    } else if (lord === body) {
      value = 30;
      relation = "own sign";
    } else {
      const natural = FRIENDS[body].includes(lord)
        ? 1
        : ENEMIES[body].includes(lord)
          ? -1
          : 0;
      const offset = mod(sign(positions[lord]) - sign(positions[body]), 12) + 1;
      const temporary = [2, 3, 4, 10, 11, 12].includes(offset) ? 1 : -1;
      const compound = natural + temporary;
      value = (
        { "2": 20, "1": 15, "0": 10, "-1": 4, "-2": 2 } as Record<
          string,
          number
        >
      )[String(compound)];
      relation = (
        {
          "2": "great friend",
          "1": "friend",
          "0": "neutral",
          "-1": "enemy",
          "-2": "great enemy",
        } as Record<string, string>
      )[String(compound)];
    }
    return {
      division: `D${division}`,
      sign: ZODIAC_SIGNS[s],
      lord,
      relation,
      virupas: value,
    };
  });
}
export function ayanaBala(body: Graha, declination: number) {
  // Classical declination approximation has a 24° normalizing amplitude.
  const signed =
    body === "Mercury"
      ? Math.abs(declination)
      : ["Moon", "Saturn"].includes(body)
        ? -declination
        : declination;
  return (30 * (24 + signed)) / 24;
}
function temporal(chart: ChartResult) {
  const t = Date.parse(chart.utc),
    latitude = chart.input.latitude,
    longitude = chart.input.longitude;
  assert(
    Number.isFinite(t) &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude),
    "Resolved instant and observer coordinates required."
  );
  const base = Date.UTC(
    new Date(t).getUTCFullYear(),
    new Date(t).getUTCMonth(),
    new Date(t).getUTCDate()
  );
  const candidates = [-2, -1, 0, 1, 2]
    .map(offset => {
      const date = new Date(base + offset * 86400000)
        .toISOString()
        .slice(0, 10);
      return {
        rise: noaaSunriseUtc(date, latitude, longitude).getTime(),
        set: noaaSunriseUtc(date, latitude, longitude, true).getTime(),
      };
    })
    .sort((a, b) => a.rise - b.rise);
  const index = candidates.findIndex(
    (v, i) => v.rise <= t && candidates[i + 1]?.rise > t
  );
  assert(index >= 0, "Sunrise interval unavailable.");
  const current = candidates[index],
    next = candidates[index + 1];
  const day = t < current.set,
    phase = day
      ? (t - current.rise) / (current.set - current.rise)
      : (t - current.set) / (next.rise - current.set);
  const third = Math.min(2, Math.floor(phase * 3));
  const thirdLord: Graha = (
    day ? ["Mercury", "Sun", "Saturn"] : ["Moon", "Venus", "Mars"]
  )[third] as Graha;
  const dateParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: chart.input.timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
      .formatToParts(new Date(current.rise))
      .map(p => [p.type, p.value])
  );
  const year = Number(dateParts.year),
    month = Number(dateParts.month),
    date = Number(dateParts.day);
  const weekday = new Date(Date.UTC(year, month - 1, date)).getUTCDay(),
    dayLord = WEEK[weekday];
  const horaIndex = (day ? 0 : 12) + Math.min(11, Math.floor(phase * 12));
  const horaLord = HORA[(HORA.indexOf(dayLord) + horaIndex) % 7];
  const noon = (current.rise + current.set) / 2;
  const solarHours = mod(12 + (t - noon) / 3600000, 24);
  return {
    sunriseUtc: new Date(current.rise).toISOString(),
    sunsetUtc: new Date(current.set).toISOString(),
    nextSunriseUtc: new Date(next.rise).toISOString(),
    day,
    third: third + 1,
    thirdLord,
    dayLord,
    horaLord,
    hora: horaIndex + 1,
    yearLord: WEEK[mod((year + 3) * 3, 7)],
    monthLord: WEEK[mod((12 * year + month + 6) * 2, 7)],
    solarHours,
    twilight:
      Math.min(
        Math.abs(t - current.rise),
        Math.abs(t - current.set),
        Math.abs(t - next.rise)
      ) <=
      24 * 60000,
  };
}

/** Pure continuous Cheshta formula. Use a circular midpoint across the 0° seam. */
export function cheshtaKendra(
  body: Graha,
  trueLongitude: number,
  meanLongitude: number,
  sunMean: number
) {
  const inner = body === "Mercury" || body === "Venus";
  const mean = inner ? sunMean : meanLongitude,
    apex = inner ? meanLongitude : sunMean;
  const midpoint = norm(mean + (norm(trueLongitude - mean + 180) - 180) / 2);
  return angle(apex, midpoint) / 3;
}
function meanOrbitalLongitude(jd: number, id: number) {
  // M and true anomaly are scalar angles in the orbital plane; none of the
  // orbital-element ecliptic longitudes are used as chart coordinates.
  const orbit = sweph.get_orbital_elements(jd + sweph.deltat(jd), id, 4);
  assert(
    orbit.flag >= 0 && orbit.data?.slice(6, 8).every(Number.isFinite),
    `Orbital anomalies missing for ${id}.`
  );
  const { xyz, velocity } = ephemerisXYZ(jd, id, 8 | 16);
  const r = [xyz.x, xyz.y, xyz.z],
    v = velocity;
  const h = [
    r[1] * v[2] - r[2] * v[1],
    r[2] * v[0] - r[0] * v[2],
    r[0] * v[1] - r[1] * v[0],
  ];
  const length = Math.hypot(...h);
  assert(length > 0, "Orbital normal cannot be zero.");
  const n = h.map(x => x / length),
    d = (orbit.data[6] - orbit.data[7]) * rad;
  const cross = [
      n[1] * r[2] - n[2] * r[1],
      n[2] * r[0] - n[0] * r[2],
      n[0] * r[1] - n[1] * r[0],
    ],
    dot = sum(n.map((x, i) => x * r[i]));
  const rotated = r.map(
    (x, i) =>
      x * Math.cos(d) + cross[i] * Math.sin(d) + n[i] * dot * (1 - Math.cos(d))
  );
  return norm(Math.atan2(rotated[1], rotated[0]) / rad);
}
export function calculateVedicStrength(chart: ChartResult) {
  assert(
    chart.ascendant &&
      chart.houses.length === 12 &&
      chart.houses.every(Number.isFinite),
    "A known local Ascendant and 12 Equal Houses are required."
  );
  assert(
    chart.input.birthTimeKnown !== false,
    "Verified birth time required for strengths."
  );
  const rows = Object.fromEntries(
    CLASSICAL.map(body => [body, chart.movingBodies.find(p => p.name === body)])
  );
  for (const body of CLASSICAL)
    assert(
      rows[body] && Number.isFinite(rows[body]!.longitude) && rows[body]!.xyz,
      `${body} position/XYZ missing.`
    );
  const positions = Object.fromEntries(
    CLASSICAL.map(p => [p, rows[p]!.longitude])
  ) as Record<Graha, number>;
  const time = temporal(chart),
    phase = angle(positions.Moon, positions.Sun) / 3;
  const waxing = norm(positions.Moon - positions.Sun) <= 180;
  const mercuryMalefic = chart.movingBodies
    .concat([chart.northNode, chart.southNode])
    .some(
      p =>
        ["Sun", "Mars", "Saturn", "North Node", "South Node"].includes(
          p.name
        ) && sign(p.longitude) === sign(positions.Mercury)
    );
  const benefic = (p: Graha) =>
    ["Jupiter", "Venus"].includes(p) ||
    (p === "Moon" && waxing) ||
    (p === "Mercury" && !mercuryMalefic);
  const sunMean = norm(meanOrbitalLongitude(chart.julianDay, 14) + 180);
  const records = CLASSICAL.map(body => {
    const row = rows[body]!,
      house = row.agentHouse ?? row.house,
      longitude = row.longitude;
    const xyz = row.xyz!,
      declination = Math.atan2(xyz.z, Math.hypot(xyz.x, xyz.y)) / rad;
    const vargas = saptavargajaBala(body, positions),
      uccha = uchchaBala(body, longitude);
    const parity = (s: number) =>
      ["Moon", "Venus"].includes(body) ? s % 2 === 1 : s % 2 === 0;
    const ojayugma =
      (parity(sign(longitude)) ? 15 : 0) +
      (parity(strengthVargaSign(longitude, 9)) ? 15 : 0);
    const kendra = [1, 4, 7, 10].includes(house)
      ? 60
      : [2, 5, 8, 11].includes(house)
        ? 30
        : 15;
    const decan = Math.floor((norm(longitude) % 30) / 10),
      gender = ["Sun", "Mars", "Jupiter"].includes(body)
        ? 0
        : ["Mercury", "Saturn"].includes(body)
          ? 1
          : 2;
    const drekkana = decan === gender ? 15 : 0,
      sthana =
        uccha + sum(vargas.map(v => v.virupas)) + ojayugma + kendra + drekkana;
    const dig = digBala(body, longitude, chart.houses),
      ayana = ayanaBala(body, declination);
    const dayStrength = 60 - Math.abs(time.solarHours - 12) * 5;
    const nathonnata =
      body === "Mercury"
        ? 60
        : ["Sun", "Jupiter", "Venus"].includes(body)
          ? dayStrength
          : 60 - dayStrength;
    const paksha = ["Moon", "Mercury", "Jupiter", "Venus"].includes(body)
      ? phase
      : 60 - phase;
    const kalaParts = {
      nathonnata,
      paksha,
      tribhaga: body === "Jupiter" || body === time.thirdLord ? 60 : 0,
      varsha: body === time.yearLord ? 15 : 0,
      masa: body === time.monthLord ? 30 : 0,
      dina: body === time.dayLord ? 45 : 0,
      hora: body === time.horaLord ? 60 : 0,
      ayana,
      yuddha: 0,
    };
    const aspectContributions = CLASSICAL.filter(p => p !== body).map(
      source => {
        const raw = sphutaDrishti(source, positions[source], longitude);
        return {
          source,
          rawVirupas: raw,
          benefic: benefic(source),
          signedVirupas: ((benefic(source) ? 1 : -1) * raw) / 4,
        };
      }
    );
    const mean = ["Sun", "Moon"].includes(body)
      ? null
      : meanOrbitalLongitude(chart.julianDay, IDS[body]);
    const cheshta =
      body === "Sun"
        ? ayana
        : body === "Moon"
          ? paksha
          : cheshtaKendra(body, longitude, mean!, sunMean);
    const naisargika =
      ((8 -
        [
          "Sun",
          "Moon",
          "Venus",
          "Jupiter",
          "Mercury",
          "Mars",
          "Saturn",
        ].indexOf(body) -
        1) *
        60) /
      7;
    return {
      body,
      longitude,
      sign: ZODIAC_SIGNS[sign(longitude)],
      house,
      declination,
      components: {
        sthana,
        dig,
        kala: sum(Object.values(kalaParts)),
        cheshta,
        naisargika,
        drik: sum(aspectContributions.map(a => a.signedVirupas)),
      },
      sthanaParts: {
        uccha,
        saptavargaja: sum(vargas.map(v => v.virupas)),
        ojayugma,
        kendra,
        drekkana,
      },
      vargas,
      kalaParts,
      aspectContributions,
      motionInputs: {
        trueLongitude: longitude,
        meanLongitude: mean,
        sunMeanLongitude: sunMean,
      },
      war: [] as Array<{ other: Graha; winner: Graha; adjustment: number }>,
      totalVirupas: 0,
      rupas: 0,
      requiredVirupas: REQUIRED[body],
      adequacyRatio: 0,
      rank: 0,
      ownedHouses: chart.houses.flatMap((cusp, i) =>
        LORDS[sign(cusp)] === body ? [i + 1] : []
      ),
    };
  });
  // Compute every pair from immutable pre-war values; preserve zero-sum transfer.
  const prewar = new Map(records.map(p => [p.body, p.components.kala]));
  for (let i = 2; i < records.length; i++)
    for (let j = i + 1; j < records.length; j++) {
      const a = records[i],
        b = records[j],
        separation = angle(a.longitude, b.longitude);
      if (separation >= 1) continue;
      const forward = norm(b.longitude - a.longitude),
        winner = forward < 180 ? b : a,
        loser = winner === a ? b : a;
      const transfer = Math.abs(prewar.get(a.body)! - prewar.get(b.body)!);
      winner.kalaParts.yuddha += transfer;
      loser.kalaParts.yuddha -= transfer;
      winner.war.push({
        other: loser.body,
        winner: winner.body,
        adjustment: transfer,
      });
      loser.war.push({
        other: winner.body,
        winner: winner.body,
        adjustment: -transfer,
      });
    }
  for (const p of records) {
    p.components.kala = sum(Object.values(p.kalaParts));
    p.totalVirupas = sum(Object.values(p.components));
    p.rupas = p.totalVirupas / 60;
    p.adequacyRatio = p.totalVirupas / p.requiredVirupas;
    assert(Number.isFinite(p.totalVirupas), `${p.body} total is invalid.`);
  }
  const ranked = [...records].sort((a, b) => b.adequacyRatio - a.adequacyRatio);
  records.forEach(p => (p.rank = ranked.findIndex(r => r.body === p.body) + 1));
  const byBody = new Map(records.map(p => [p.body, p]));
  const bhavas = chart.houses.map((cusp, i) => {
    const house = i + 1,
      s = sign(cusp),
      degree = norm(cusp) % 30,
      lord = LORDS[s],
      lordRecord = byBody.get(lord)!;
    const human = [2, 5, 6, 10].includes(s) || (s === 8 && degree < 15);
    const quadruped =
      [0, 1, 4].includes(s) ||
      (s === 8 && degree >= 15) ||
      (s === 9 && degree < 15);
    const weakHouse = human ? 7 : quadruped ? 4 : [3, 7].includes(s) ? 1 : 10;
    const direction = angle(cusp, chart.houses[weakHouse - 1]) / 3;
    const aspectContributions = CLASSICAL.map(source => {
      const raw = sphutaDrishti(source, positions[source], cusp);
      const scale = ["Mercury", "Jupiter"].includes(source) ? 1 : 0.25;
      return {
        source,
        rawVirupas: raw,
        benefic: benefic(source),
        signedVirupas: (benefic(source) ? 1 : -1) * raw * scale,
      };
    });
    const occupants = records.filter(p => p.house === house).map(p => p.body);
    const occupancy =
      (occupants.some(p => ["Mercury", "Jupiter"].includes(p)) ? 60 : 0) -
      (occupants.some(p => ["Sun", "Mars", "Saturn"].includes(p)) ? 60 : 0);
    const head = [2, 4, 5, 6, 7, 10].includes(s),
      both = s === 11;
    const risingType =
      (both && time.twilight) || (!both && !time.twilight && head === time.day)
        ? 15
        : 0;
    const components = {
      lord: lordRecord.totalVirupas,
      direction,
      aspect: sum(aspectContributions.map(a => a.signedVirupas)),
      occupancy,
      risingType,
    };
    const totalVirupas = sum(Object.values(components));
    assert(Number.isFinite(totalVirupas), `House ${house} total invalid.`);
    return {
      house,
      cusp,
      sign: ZODIAC_SIGNS[s],
      lord,
      lordAdequacy: lordRecord.adequacyRatio,
      lordDeliveryHouse: lordRecord.house,
      components,
      totalVirupas,
      rupas: totalVirupas / 60,
      rank: 0,
      relativeSupport: "" as
        "above-chart-average" | "below-chart-average" | "at-chart-average" | "",
      occupants,
      aspectContributions,
    };
  });
  const average = sum(bhavas.map(h => h.totalVirupas)) / 12,
    houseRank = [...bhavas].sort((a, b) => b.totalVirupas - a.totalVirupas);
  bhavas.forEach(h => {
    h.rank = houseRank.findIndex(v => v.house === h.house) + 1;
    h.relativeSupport =
      h.totalVirupas > average
        ? "above-chart-average"
        : h.totalVirupas < average
          ? "below-chart-average"
          : "at-chart-average";
  });
  return {
    version: STRENGTH_VERSION,
    coordinateVariant: STRENGTH_VARIANT,
    sources: STRENGTH_SOURCES,
    units: "virupas; 60 virupas = 1 rupa",
    instantUtc: chart.utc,
    temporal: time,
    planets: records,
    houses: bhavas,
    houseAverageVirupas: average,
  };
}
export type VedicStrength = ReturnType<typeof calculateVedicStrength>;
