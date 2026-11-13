import { ephemerisXYZ } from "./astronomy";
import { normalizeLongitude } from "../shared/hybrid";

// Look-ahead for the horary chart: finds when aspects between the seven classical
// planets become exact, and when planets turn retrograde or direct. Everything is
// computed from the same Moshier ephemeris flags the chart engine uses. Nothing
// here interprets timing; it only reports when a planetary contact is exact.

const BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
type Body = (typeof BODIES)[number];

export type UpcomingAspectName = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export type UpcomingAspect = {
  first: string;
  second: string;
  aspect: UpcomingAspectName;
  exactAtUtc: string;
  exactAtLocal: string;
};

export type Station = {
  planet: string;
  turns: "retrograde" | "direct";
  atUtc: string;
  atLocal: string;
};

export type Lookahead = {
  windowDays: number;
  moonWindowDays: number;
  upcomingAspects: UpcomingAspect[];
  stations: Station[];
};

// Offsets are the signed longitude differences (first minus second) at which each aspect is exact.
const ASPECT_OFFSETS: Array<[UpcomingAspectName, number[]]> = [
  ["conjunction", [0]],
  ["sextile", [60, 300]],
  ["square", [90, 270]],
  ["trine", [120, 240]],
  ["opposition", [180]],
];

function position(jd: number, bodyIndex: number) {
  // Share the chart's equatorial XYZ projection and angular velocity. Ecliptic
  // contacts can occur at different times and must not drive this judgment.
  return ephemerisXYZ(jd, bodyIndex);
}

// Signed distance in (-180, 180] from the exact-aspect offset.
function offsetFrom(lonA: number, lonB: number, offset: number) {
  let d = normalizeLongitude(lonA - lonB - offset);
  if (d > 180) d -= 360;
  return d;
}

function jdToDate(jd: number) {
  return new Date((jd - 2440587.5) * 86_400_000);
}

function formatLocal(date: Date, timezone: string, withTime: boolean) {
  const options: Intl.DateTimeFormatOptions = withTime
    ? { timeZone: timezone, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { timeZone: timezone, month: "short", day: "numeric", year: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function refineCrossing(jdLow: number, jdHigh: number, f: (jd: number) => number) {
  let low = jdLow;
  let high = jdHigh;
  let fLow = f(low);
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    const fMid = f(mid);
    if ((fLow <= 0 && fMid >= 0) || (fLow >= 0 && fMid <= 0)) {
      high = mid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }
  return (low + high) / 2;
}

export function calculateLookahead(startJd: number, timezone: string, windowDays = 90, moonWindowDays = 3): Lookahead {
  // 1-hour steps while the Moon window is open, then 6-hour steps for slower planets.
  const fineEnd = startJd + moonWindowDays;
  const end = startJd + windowDays;
  const times: number[] = [];
  for (let jd = startJd; jd < fineEnd; jd += 1 / 24) times.push(jd);
  for (let jd = fineEnd; jd <= end + 1e-9; jd += 0.25) times.push(jd);

  const samples = times.map(jd => BODIES.map((_, index) => position(jd, index)));
  const upcoming: Array<UpcomingAspect & { jd: number }> = [];
  const stations: Array<Station & { jd: number }> = [];

  for (let a = 0; a < BODIES.length; a += 1) {
    for (let b = a + 1; b < BODIES.length; b += 1) {
      const involvesMoon = BODIES[a] === "Moon" || BODIES[b] === "Moon";
      const limit = involvesMoon ? startJd + moonWindowDays : end;
      for (const [aspect, offsets] of ASPECT_OFFSETS) {
        for (const offset of offsets) {
          for (let k = 0; k < times.length - 1; k += 1) {
            if (times[k + 1] > limit + 1e-9) break;
            const d1 = offsetFrom(samples[k][a].longitude, samples[k][b].longitude, offset);
            const d2 = offsetFrom(samples[k + 1][a].longitude, samples[k + 1][b].longitude, offset);
            // Opposite signs with a small jump means a real crossing, not the +/-180 wrap.
            if (d1 === 0 || !((d1 < 0 && d2 >= 0) || (d1 > 0 && d2 <= 0)) || Math.abs(d1 - d2) > 90) continue;
            const jd = refineCrossing(times[k], times[k + 1], t =>
              offsetFrom(position(t, a).longitude, position(t, b).longitude, offset));
            const date = jdToDate(jd);
            upcoming.push({
              first: BODIES[a], second: BODIES[b], aspect, jd,
              exactAtUtc: date.toISOString(),
              exactAtLocal: formatLocal(date, timezone, involvesMoon),
            });
          }
        }
      }
    }
  }

  // Stations: the speed of Mercury through Saturn changes sign.
  for (let i = 2; i < BODIES.length; i += 1) {
    for (let k = 0; k < times.length - 1; k += 1) {
      const s1 = samples[k][i].speed;
      const s2 = samples[k + 1][i].speed;
      if (s1 === 0 || Math.sign(s1) === Math.sign(s2)) continue;
      const jd = refineCrossing(times[k], times[k + 1], t => position(t, i).speed);
      const date = jdToDate(jd);
      stations.push({
        planet: BODIES[i], jd,
        turns: s2 < 0 ? "retrograde" : "direct",
        atUtc: date.toISOString(),
        atLocal: formatLocal(date, timezone, false),
      });
    }
  }

  upcoming.sort((x, y) => x.jd - y.jd);
  stations.sort((x, y) => x.jd - y.jd);
  return {
    windowDays,
    moonWindowDays,
    upcomingAspects: upcoming.map(({ jd: _jd, ...rest }) => rest),
    stations: stations.map(({ jd: _jd, ...rest }) => rest),
  };
}
