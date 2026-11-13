import { FIXED_STARS, normalizeLongitude, overlay, ZODIAC_SIGNS } from "../shared/hybrid";
import type { Lookahead, UpcomingAspectName } from "./horaryLookahead";

type PlacementLike = { name: string; longitude: number; house: number; retrograde?: boolean; speed?: number; sign?: string };
type HouseLike = { house: number; longitude: number; sign: string; ruler: string };

export type TraditionalLot = {
  name: "Fortune" | "Spirit" | "Eros" | "Necessity";
  longitude: number;
  display: string;
  sign: string;
  house: number;
  formula: string;
  meaning: string;
};
export type DignityScore = { planet: string; sign: string; house: number; essential: string[]; essentialScore: number; accidental: string[]; accidentalScore: number; debilities: string[] };
export type Reception = { from: string; to: string; by: "domicile" | "exaltation" | "triplicity" | "term" | "face"; mutual: boolean; description: string };
export type FixedStarTestimony = { star: string; planet: string; orb: number; nature: string; meaning: string };
export type Radicality = { status: "radical" | "caution"; considerations: string[]; explanation: string };
export type TraditionalTiming = { from: string; to: string; aspect: string; degreesToPerfection: number; estimatedUnits: string; method: string };
export type MoonStatus = { voidOfCourse: boolean; sign: string; nextApplications: Array<{ planet: string; aspect: string; orb: number; daysToPerfection: number }>; explanation: string };
export type PerfectionTestimony = { type: "direct" | "translation" | "collection" | "prohibition"; planets: string[]; aspect?: string; strength: "supportive" | "difficult" | "mixed"; description: string };
export type TraditionalJudgment = { verdict: "LEANING YES" | "LEANING NO" | "MIXED / CONDITIONAL" | "INSUFFICIENT TESTIMONY"; score: number; testimonies: string[]; explanation: string };
export type TraditionalHoraryEvidence = { lots: TraditionalLot[]; dignities: DignityScore[]; receptions: Reception[]; fixedStars: FixedStarTestimony[]; radicality: Radicality; timing: TraditionalTiming[]; overlays: Array<{ body: string; display: string; nakshatra: string; pada: number; manzil: string; decan: string }>; moonStatus: MoonStatus; perfection: PerfectionTestimony[]; judgment: TraditionalJudgment };

const DOMICILE: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
const EXALTATION: Record<string, string> = { Aries: "Sun", Taurus: "Moon", Cancer: "Jupiter", Virgo: "Mercury", Libra: "Saturn", Capricorn: "Mars", Pisces: "Venus" };
const DETRIMENT: Record<string, string> = { Aries: "Venus", Taurus: "Mars", Gemini: "Jupiter", Cancer: "Saturn", Leo: "Saturn", Virgo: "Jupiter", Libra: "Mars", Scorpio: "Venus", Sagittarius: "Mercury", Capricorn: "Moon", Aquarius: "Sun", Pisces: "Mercury" };
const FALL: Record<string, string> = { Aries: "Saturn", Scorpio: "Moon", Capricorn: "Jupiter", Pisces: "Mercury", Libra: "Sun" };
const TRIPLICITIES: Record<string, { day: string; night: string; participating: string }> = {
  Fire: { day: "Sun", night: "Jupiter", participating: "Saturn" }, Earth: { day: "Venus", night: "Moon", participating: "Mars" }, Air: { day: "Saturn", night: "Mercury", participating: "Jupiter" }, Water: { day: "Venus", night: "Mars", participating: "Moon" },
};
const ELEMENT: Record<string, keyof typeof TRIPLICITIES> = { Aries: "Fire", Leo: "Fire", Sagittarius: "Fire", Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth", Gemini: "Air", Libra: "Air", Aquarius: "Air", Cancer: "Water", Scorpio: "Water", Pisces: "Water" };
const EGYPTIAN_TERMS: Record<string, Array<[number, string]>> = {
  Aries: [[6, "Jupiter"], [12, "Venus"], [20, "Mercury"], [25, "Mars"], [30, "Saturn"]], Taurus: [[8, "Venus"], [14, "Mercury"], [22, "Jupiter"], [27, "Saturn"], [30, "Mars"]], Gemini: [[6, "Mercury"], [12, "Jupiter"], [17, "Venus"], [24, "Mars"], [30, "Saturn"]], Cancer: [[7, "Mars"], [13, "Venus"], [19, "Mercury"], [26, "Jupiter"], [30, "Saturn"]], Leo: [[6, "Jupiter"], [11, "Venus"], [18, "Saturn"], [24, "Mercury"], [30, "Mars"]], Virgo: [[7, "Mercury"], [17, "Venus"], [21, "Jupiter"], [28, "Mars"], [30, "Saturn"]], Libra: [[6, "Saturn"], [14, "Mercury"], [21, "Jupiter"], [28, "Venus"], [30, "Mars"]], Scorpio: [[7, "Mars"], [11, "Venus"], [19, "Mercury"], [24, "Jupiter"], [30, "Saturn"]], Sagittarius: [[12, "Jupiter"], [17, "Venus"], [21, "Mercury"], [26, "Saturn"], [30, "Mars"]], Capricorn: [[7, "Mercury"], [14, "Jupiter"], [22, "Venus"], [26, "Saturn"], [30, "Mars"]], Aquarius: [[7, "Mercury"], [13, "Venus"], [20, "Jupiter"], [25, "Mars"], [30, "Saturn"]], Pisces: [[12, "Venus"], [16, "Jupiter"], [19, "Mercury"], [28, "Mars"], [30, "Saturn"]],
};
const FACES = ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
const STAR_NATURE: Record<string, string> = { Aldebaran: "Mars / Venus", Regulus: "Mars / Jupiter", Antares: "Mars / Jupiter", Fomalhaut: "Venus / Mercury", Sirius: "Jupiter / Mars", Spica: "Venus / Jupiter", Polaris: "Saturn / Venus", Hamal: "Mars / Saturn", Algol: "Saturn / Jupiter", Rigel: "Jupiter / Saturn" };
const STAR_MEANING: Record<string, string> = { Aldebaran: "prominence with a requirement for integrity", Regulus: "visibility, authority, and the need to avoid revenge", Antares: "intensity, contest, and strong conviction", Fomalhaut: "vision, idealism, and unusual inspiration", Sirius: "force, prominence, and strong drive", Spica: "protection, talent, and fortunate support", Polaris: "orientation, endurance, and a fixed point", Hamal: "initiative, pressure, and assertion", Algol: "extreme pressure and the need for careful handling", Rigel: "skill, ambition, and advancement" };

function lon(v: number) { return normalizeLongitude(v); }
function sign(v: number) { return ZODIAC_SIGNS[Math.floor(lon(v) / 30)]; }
function display(v: number) { const d = lon(v); const deg = d % 30; const whole = Math.floor(deg); return `${sign(v)} ${String(whole).padStart(2, "0")}°${String(Math.round((deg - whole) * 60) % 60).padStart(2, "0")}′`; }
function distance(a: number, b: number) { const d = Math.abs(lon(a - b)); return Math.min(d, 360 - d); }
function houseFor(v: number, houses: HouseLike[]) { for (const h of houses) { const next = houses.find(candidate => candidate.house === (h.house % 12) + 1); if (next && lon(v - h.longitude) < lon(next.longitude - h.longitude)) return h.house; } return 12; }
function rulerAt(longitude: number, day: boolean) {
  const s = sign(longitude); const deg = lon(longitude) % 30; const element = ELEMENT[s]; const term = EGYPTIAN_TERMS[s].find(([end]) => deg < end)?.[1];
  return { domicile: DOMICILE[s], exaltation: EXALTATION[s], triplicity: TRIPLICITIES[element][day ? "day" : "night"], term, face: FACES[Math.min(35, Math.floor(lon(longitude) / 10))] };
}
function addMod(a: number, b: number, c: number) { return lon(a + b - c); }
function futureAspectTime(a: PlacementLike, b: PlacementLike, orbLimit = 180) {
  const aspects: Array<[number, string]> = [[0, "conjunction"], [60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"], [240, "trine"], [270, "square"], [300, "sextile"]];
  const relative = lon(b.longitude - a.longitude);
  const relativeSpeed = (b.speed ?? 0) - (a.speed ?? 0);
  if (Math.abs(relativeSpeed) < 0.00001) return null;
  const candidates: Array<{ days: number; aspect: string; orb: number; target: number }> = [];
  for (const [target, aspect] of aspects) {
    const orb = Math.abs(((relative - target + 540) % 360) - 180);
    for (let k = -2; k <= 2; k++) {
      const days = (target + 360 * k - relative) / relativeSpeed;
      if (days > 0.0001 && days < 365) candidates.push({ days, aspect, orb, target });
    }
  }
  candidates.sort((x, y) => x.days - y.days);
  const next = candidates[0];
  if (!next || next.orb > orbLimit) return null;
  return next;
}
function exactFutureAspectTime(a: PlacementLike, b: PlacementLike, lookahead?: Lookahead, referenceUtc?: string) {
  if (!lookahead || !referenceUtc) return null;
  const start = Date.parse(referenceUtc);
  if (!Number.isFinite(start)) return null;
  const aspectTargets: Record<UpcomingAspectName, number> = {
    conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
  };
  const match = lookahead.upcomingAspects
    .filter(event =>
      ((event.first === a.name && event.second === b.name) || (event.first === b.name && event.second === a.name)) &&
      Date.parse(event.exactAtUtc) > start
    )
    .map(event => ({
      days: (Date.parse(event.exactAtUtc) - start) / 86_400_000,
      aspect: event.aspect,
      target: aspectTargets[event.aspect],
      orb: Math.abs(distance(a.longitude, b.longitude) - aspectTargets[event.aspect]),
    }))
    .sort((left, right) => left.days - right.days)[0];
  return match ?? null;
}

function isApplying(a: PlacementLike, b: PlacementLike) {
  const relative = lon(b.longitude - a.longitude);
  const targets = [0, 60, 90, 120, 180, 240, 270, 300];
  const nearest = targets.map(target => {
    const delta = ((relative - target + 540) % 360) - 180;
    return { delta, orb: Math.abs(delta) };
  }).sort((x, y) => x.orb - y.orb)[0];
  const relativeSpeed = (b.speed ?? 0) - (a.speed ?? 0);
  return Math.abs(relativeSpeed) > 0.00001 && nearest.delta * relativeSpeed < 0;
}
function isSeparating(a: PlacementLike, b: PlacementLike) {
  const relative = lon(b.longitude - a.longitude);
  const targets = [0, 60, 90, 120, 180, 240, 270, 300];
  const nearest = targets.map(target => {
    const delta = ((relative - target + 540) % 360) - 180;
    return { delta, orb: Math.abs(delta) };
  }).sort((x, y) => x.orb - y.orb)[0];
  const relativeSpeed = (b.speed ?? 0) - (a.speed ?? 0);
  return Math.abs(relativeSpeed) > 0.00001 && nearest.delta * relativeSpeed > 0;
}
function aspectDistance(a: number, b: number) {
  const d = lon(b - a);
  return Math.min(d, 360 - d);
}
function signBoundaryDays(p: PlacementLike) {
  const speed = p.speed ?? 0;
  if (speed <= 0) return Infinity;
  return (30 - (lon(p.longitude) % 30)) / speed;
}
function traditionalAspectName(a: number, b: number) {
  const sep = aspectDistance(a, b);
  const list: Array<[number, string]> = [[0, "conjunction"], [60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"]];
  return list.map(([angle, name]) => ({ name, orb: Math.abs(sep - angle) })).sort((x, y) => x.orb - y.orb)[0];
}


export function calculateTraditionalHorary(input: { ascendant: PlacementLike; houses: HouseLike[]; placements: PlacementLike[]; topicRuler: string; subjectRuler: string; querentRuler: string; questionRuler: string; lookahead?: Lookahead; referenceUtc?: string }): TraditionalHoraryEvidence {
  const sun = input.placements.find(p => p.name === "Sun")!; const moon = input.placements.find(p => p.name === "Moon")!; const day = sun.house >= 7 && sun.house <= 12;
  const lotDefs: Array<[TraditionalLot["name"], number, number, string, string]> = [
    ["Fortune", day ? input.ascendant.longitude : input.ascendant.longitude, day ? moon.longitude : sun.longitude, day ? sun.name : moon.name, "material circumstances, body, and what comes through the world's conditions"],
    ["Spirit", input.ascendant.longitude, day ? sun.longitude : moon.longitude, day ? moon.name : sun.name, "intention, agency, and what comes through directed choice"],
  ];
  const fortune = day ? addMod(input.ascendant.longitude, moon.longitude, sun.longitude) : addMod(input.ascendant.longitude, sun.longitude, moon.longitude);
  const spirit = day ? addMod(input.ascendant.longitude, sun.longitude, moon.longitude) : addMod(input.ascendant.longitude, moon.longitude, sun.longitude);
  const eros = addMod(input.ascendant.longitude, input.placements.find(p => p.name === "Venus")!.longitude, fortune);
  const necessity = addMod(input.ascendant.longitude, fortune, spirit);
  const lots: TraditionalLot[] = [
    { name: "Fortune", longitude: fortune, display: display(fortune), sign: sign(fortune), house: houseFor(fortune, input.houses), formula: day ? "Ascendant + Moon − Sun (day sect)" : "Ascendant + Sun − Moon (night sect)", meaning: lotDefs[0][4] },
    { name: "Spirit", longitude: spirit, display: display(spirit), sign: sign(spirit), house: houseFor(spirit, input.houses), formula: day ? "Ascendant + Sun − Moon (day sect)" : "Ascendant + Moon − Sun (night sect)", meaning: lotDefs[1][4] },
    { name: "Eros", longitude: eros, display: display(eros), sign: sign(eros), house: houseFor(eros, input.houses), formula: "Ascendant + Venus − Fortune", meaning: "desire, attraction, pleasure, and the pull toward union" },
    { name: "Necessity", longitude: necessity, display: display(necessity), sign: sign(necessity), house: houseFor(necessity, input.houses), formula: "Ascendant + Fortune − Spirit", meaning: "constraint, obligation, and what circumstances require" },
  ];
  const dignities: DignityScore[] = input.placements.filter(p => ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(p.name)).map(p => {
    const s = p.sign ?? sign(p.longitude); const r = rulerAt(p.longitude, day); const essential: string[] = []; const debilities: string[] = []; let essentialScore = 0;
    if (r.domicile === p.name) { essential.push("domicile"); essentialScore += 5; } if (r.exaltation === p.name) { essential.push("exaltation"); essentialScore += 4; } if (r.triplicity === p.name) { essential.push("triplicity ruler"); essentialScore += 3; } if (r.term === p.name) { essential.push("Egyptian term"); essentialScore += 2; } if (r.face === p.name) { essential.push("face"); essentialScore += 1; }
    if (DETRIMENT[s] === p.name) debilities.push("detriment"); if (FALL[s] === p.name) debilities.push("fall"); if (p.retrograde) debilities.push("retrograde"); if (p.house >= 6 && p.house <= 12 && ![7, 10].includes(p.house)) debilities.push("cadent house");
    const accidental: string[] = []; let accidentalScore = 0; if ([1, 4, 7, 10].includes(p.house)) { accidental.push("angular"); accidentalScore += 5; } else if ([2, 5, 8, 11].includes(p.house)) { accidental.push("succedent"); accidentalScore += 2; } else { accidental.push("cadent"); accidentalScore -= 2; }
    const sunDistance = distance(p.longitude, input.placements.find(x => x.name === "Sun")!.longitude); if (p.name !== "Sun" && sunDistance < 8.5) debilities.push("combust"); else if (p.name !== "Sun" && sunDistance < 17) debilities.push("under the beams");
    return { planet: p.name, sign: s, house: p.house, essential, essentialScore, accidental, accidentalScore, debilities };
  });
  const receptions: Reception[] = []; const planets = dignities.map(d => input.placements.find(p => p.name === d.planet)!).filter(Boolean);
  for (const guest of planets) for (const host of planets) if (guest.name !== host.name) { const r = rulerAt(guest.longitude, day); const by = r.domicile === host.name ? "domicile" : r.exaltation === host.name ? "exaltation" : r.triplicity === host.name ? "triplicity" : r.term === host.name ? "term" : r.face === host.name ? "face" : null; if (by) { const reverse = rulerAt(host.longitude, day); const mutual = reverse.domicile === guest.name || reverse.exaltation === guest.name || reverse.triplicity === guest.name || reverse.term === guest.name || reverse.face === guest.name; receptions.push({ from: host.name, to: guest.name, by, mutual, description: `${host.name} receives ${guest.name} by ${by}${mutual ? "; the reception is mutual" : ""}.` }); } }
  const fixedStars: FixedStarTestimony[] = []; for (const p of [...planets, input.ascendant]) for (const [star, starLon] of FIXED_STARS) { const orb = distance(p.longitude, starLon); if (orb <= 1) fixedStars.push({ star, planet: p.name, orb: Number(orb.toFixed(2)), nature: STAR_NATURE[star] ?? "traditional fixed-star nature", meaning: STAR_MEANING[star] ?? "a fixed-star emphasis requiring contextual interpretation" }); }
  const considerations: string[] = []; const ascDeg = lon(input.ascendant.longitude) % 30; if (ascDeg < 3) considerations.push("Ascendant is in early degrees (first 3°): this situation is newly forming and essential factors have not yet surfaced."); if (ascDeg > 27) considerations.push("Ascendant is in late degrees (last 3°): this chapter is wrapping up and events are already largely set in motion."); if (input.placements.find(p => p.name === "Moon")?.house === 7) considerations.push("Moon is in the 7th house: your emotional focus is heavily concentrated on the other person, creating a risk of over-interpreting their reactions."); if (input.placements.find(p => p.name === "Saturn")?.house === 7) considerations.push("Saturn is in the 7th house: the other party is cautious, guarded, or navigating their own heavy responsibilities."); if (input.placements.find(p => p.name === "Moon")?.speed === 0) considerations.push("Moon speed is temporarily steady; events are holding their current pattern."); const radicality: Radicality = { status: considerations.length ? "caution" : "radical", considerations, explanation: considerations.length ? "These are practical cautions to keep in mind. They highlight human nuances rather than shutting down the reading." : "No configured traditional caution was triggered. The situation is clear for direct examination." };
  const timing: TraditionalTiming[] = []; const key = new Set([input.querentRuler, input.subjectRuler, input.topicRuler, "Moon"]); const aspectTargets: Array<[number, string]> = [[0, "conjunction"], [60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"]]; for (const a of planets) for (const b of planets) if (a.name < b.name && key.has(a.name) && key.has(b.name)) { const sep = distance(a.longitude, b.longitude); const best = aspectTargets.map(([target, aspect]) => ({ target, aspect, orb: Math.abs(sep - target) })).sort((x, y) => x.orb - y.orb)[0]; const relativeSpeed = Math.abs((a.speed ?? 0) - (b.speed ?? 0)); if (best.orb <= 5 && relativeSpeed > 0 && (a.speed ?? 0) * (b.speed ?? 0) !== 0) { const degrees = Number(best.orb.toFixed(2)); const signMode = ["Aries", "Cancer", "Libra", "Capricorn"].includes(sign(a.longitude)) ? "cardinal" : ["Taurus", "Leo", "Scorpio", "Aquarius"].includes(sign(a.longitude)) ? "fixed" : "mutable"; timing.push({ from: a.name, to: b.name, aspect: best.aspect, degreesToPerfection: degrees, estimatedUnits: `${degrees} ${signMode === "cardinal" ? "short" : signMode === "fixed" ? "long" : "variable"} time units (traditional estimate; not a guaranteed event date)`, method: `Applying/separating perfection estimate using current orb, relative speed, sign modality (${signMode}), and house condition.` }); } }
  const overlays = [...planets, input.ascendant].map(p => { const o = overlay(p.longitude); return { body: p.name, display: display(p.longitude), ...o }; });

  // Horary judgment uses exact future contact order, not a single current aspect.
  const moonStatus: MoonStatus = (() => {
    const moon = input.placements.find(p => p.name === "Moon")!;
    const boundaryDays = signBoundaryDays(moon);
    const nextApplications = input.placements
      .filter(p => p.name !== "Moon" && ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(p.name))
      .map(p => {
        const next = exactFutureAspectTime(moon, p, input.lookahead, input.referenceUtc);
        return next && next.days <= boundaryDays
          ? { planet: p.name, aspect: next.aspect, orb: Number(next.orb.toFixed(2)), daysToPerfection: Number(next.days.toFixed(3)) }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.daysToPerfection - b.daysToPerfection);
    const voidOfCourse = nextApplications.length === 0;
    const mitigation = ["Taurus", "Cancer", "Sagittarius", "Pisces"].includes(sign(moon.longitude));
    return { voidOfCourse, sign: sign(moon.longitude), nextApplications, explanation: voidOfCourse
      ? `Moon is void of course: no exact major aspect to a classical planet is projected before sign change.${mitigation ? " Traditional dignity-based mitigation applies in this sign; treat VOC as softened testimony, not an automatic denial." : " Treat this as testimony for delay, drift, or lack of development—not an automatic verdict."}`
      : `Moon next applies to ${nextApplications[0].planet} by ${nextApplications[0].aspect} in about ${nextApplications[0].daysToPerfection} days before leaving ${sign(moon.longitude)}.` };
  })();

  const perfection: PerfectionTestimony[] = [];
  const q = input.placements.find(p => p.name === input.questionRuler);
  const matter = input.placements.find(p => p.name === input.topicRuler);
  if (q && matter && q.name !== matter.name) {
    const direct = exactFutureAspectTime(q, matter, input.lookahead, input.referenceUtc);
    if (direct) {
      const easy = ["conjunction", "sextile", "trine"].includes(direct.aspect);
      perfection.push({ type: "direct", planets: [q.name, matter.name], aspect: direct.aspect, strength: easy ? "supportive" : "difficult", description: `The primary significators have a future ${direct.aspect} perfection in approximately ${direct.days.toFixed(2)} days; ${easy ? "this supports contact or development, subject to condition and reception" : "this indicates contact through strain, conflict, or a costly adjustment"}.` });
      for (const third of planets.filter(p => p.name !== q.name && p.name !== matter.name)) {
        const toQ = exactFutureAspectTime(third, q, input.lookahead, input.referenceUtc);
        const toMatter = exactFutureAspectTime(third, matter, input.lookahead, input.referenceUtc);
        if (toQ && toMatter && toQ.days < direct.days && toMatter.days < direct.days && Math.abs(third.speed ?? 0) < Math.min(Math.abs(q.speed ?? 0), Math.abs(matter.speed ?? 0))) {
          perfection.push({ type: "collection", planets: [q.name, third.name, matter.name], strength: "supportive", description: `${third.name} may collect the light of both significators before their direct perfection; check the planet's condition and reception before treating this as assistance.` });
        }
      }
      for (const third of planets.filter(p => p.name !== q.name && p.name !== matter.name)) {
        const firstContact = exactFutureAspectTime(third, q, input.lookahead, input.referenceUtc);
        if (firstContact && firstContact.days < direct.days) {
          perfection.push({ type: "prohibition", planets: [q.name, third.name, matter.name], aspect: firstContact.aspect, strength: "difficult", description: `${third.name} perfects a contact with ${q.name} before the principal significators meet, a possible prohibition requiring judgment of the intervening planet and its reception.` });
          break;
        }
      }
    }
    // Translation: a faster third planet has just separated from one significator and applies to the other.
    for (const third of planets.filter(p => p.name !== q.name && p.name !== matter.name)) {
      const dQ = traditionalAspectName(third.longitude, q.longitude);
      const dM = traditionalAspectName(third.longitude, matter.longitude);
      const separatingFromQ = dQ.orb <= 5 && isSeparating(third, q) && Math.abs(third.speed ?? 0) > Math.abs(q.speed ?? 0) && Math.abs(third.speed ?? 0) > Math.abs(matter.speed ?? 0);
      const applyingToMatter = exactFutureAspectTime(third, matter, input.lookahead, input.referenceUtc);
      if (separatingFromQ && applyingToMatter) {
        perfection.push({ type: "translation", planets: [q.name, third.name, matter.name], aspect: applyingToMatter.aspect, strength: "supportive", description: `${third.name} appears to carry light from ${q.name} toward ${matter.name}; confirm the actual separating/applying sequence and receptions before relying on this testimony.` });
        break;
      }
      const separatingFromMatter = dM.orb <= 5 && isSeparating(third, matter) && Math.abs(third.speed ?? 0) > Math.abs(matter.speed ?? 0) && Math.abs(third.speed ?? 0) > Math.abs(q.speed ?? 0);
      const applyingToQ = exactFutureAspectTime(third, q, input.lookahead, input.referenceUtc);
      if (separatingFromMatter && applyingToQ) {
        perfection.push({ type: "translation", planets: [matter.name, third.name, q.name], aspect: applyingToQ.aspect, strength: "supportive", description: `${third.name} appears to carry light from ${matter.name} toward ${q.name}; confirm the actual separating/applying sequence and receptions before relying on this testimony.` });
        break;
      }
    }
  }
  const keyReceptions = receptions.filter(r => [input.questionRuler, input.topicRuler].includes(r.from) && [input.questionRuler, input.topicRuler].includes(r.to));
  const direct = perfection.find(p => p.type === "direct" && p.planets.includes(input.questionRuler) && p.planets.includes(input.topicRuler));
  const translation = perfection.some(p => p.type === "translation");
  const collection = perfection.some(p => p.type === "collection");
  const prohibition = perfection.some(p => p.type === "prohibition");
  const hasPerfection = Boolean(direct || translation || collection);
  const receptionSupports = keyReceptions.length > 0;
  const moonMitigated = ["Taurus", "Cancer", "Sagittarius", "Pisces"].includes(moonStatus.sign);
  // Hierarchical synthesis: perfection establishes connection; reception describes willingness/ability;
  // prohibition can interrupt it; VOC modifies momentum. Reception alone is not perfection.
  let verdict: TraditionalJudgment["verdict"];
  if (prohibition && !translation && !collection) verdict = "LEANING NO";
  else if (translation || collection) verdict = prohibition ? "MIXED / CONDITIONAL" : "LEANING YES";
  else if (direct) {
    if (direct.strength === "supportive" && receptionSupports) verdict = "LEANING YES";
    else if (direct.strength === "supportive") verdict = "MIXED / CONDITIONAL";
    else verdict = receptionSupports ? "MIXED / CONDITIONAL" : "LEANING NO";
  } else if (moonStatus.voidOfCourse && !moonMitigated) verdict = "LEANING NO";
  else verdict = "INSUFFICIENT TESTIMONY";
  if (moonStatus.voidOfCourse && moonMitigated && !direct && !translation && !collection) verdict = "INSUFFICIENT TESTIMONY";
  const score = (direct ? (direct.strength === "supportive" ? 2 : -1) : 0) + (translation || collection ? 1 : 0) + (receptionSupports ? 1 : 0) - (prohibition ? 2 : 0) - (moonStatus.voidOfCourse ? (moonMitigated ? 0.5 : 1.5) : 0);
  const testimonyText = perfection.map(p => p.description).concat(keyReceptions.map(r => r.description), moonStatus.explanation);
  const judgment: TraditionalJudgment = { verdict, score, testimonies: testimonyText, explanation: `Provisional synthesis: ${verdict}. Direct or mediated perfection is judged first; reception modifies how readily the matter can proceed; prohibition can block it; and the Moon's course modifies momentum. A void Moon is testimony, not an automatic veto. This is a configured traditional-rule synthesis, not a substitute for reviewing the full chart and question.` };
  return { lots, dignities, receptions, fixedStars, radicality, timing, overlays, moonStatus, perfection, judgment };
}
