import { normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import { vargaPlacement, type Varga } from "./vargas";

/**
 * Divisional charts are transformations of ONE natal D1 chart, never new
 * astronomical observations or independent birth times.
 *
 * D1: original longitude and original equal-house cusps.
 * D2: two 15-degree Horas, classical Sun/Leo and Moon/Cancer assignment.
 * D3: three 10-degree Drekkana sections, 1st/5th/9th signs.
 * D9: nine 3°20' sections, movable/fixed/dual starting signs.
 * D10: ten 3-degree sections, odd signs from self, even from ninth.
 *
 * The sign assignments come from vargaPlacement. A divisional degree is
 * the position within a division scaled to 30 degrees. Divisional equal
 * houses are projected from the divisional Ascendant, not reused from D1.
 * These are Guardian fixed-frame divisional projections, NOT silently
 * Lahiri-converted Jyotish charts.
 */
export type Division = "D1" | Varga;
export type NatalPoint = { name: string; longitude: number };
export type DivisionalPlacement = {
  body: string; longitude: number; sign: string; signIndex: number;
  house: number; sourceLongitude: number; sourceSign: string;
  divisionPart: number; formula: string;
};
const definitions: Record<Division, { name: string; purpose: string; formula: string }> = {
  D1: { name: "Rashi", purpose: "Natal foundation: the whole birth chart", formula: "Use the original natal longitude and Ascendant without subdivision." },
  D2: { name: "Hora", purpose: "Traditional resources and material sustenance", formula: "30° sign / 2 = 15°; odd signs: Sun Hora then Moon Hora; even signs: Moon Hora then Sun Hora; Sun = Leo, Moon = Cancer." },
  D3: { name: "Drekkana", purpose: "Siblings, initiative and courage", formula: "30° sign / 3 = 10°; map successive parts to the 1st, 5th, and 9th signs from the natal sign." },
  D9: { name: "Navamsha", purpose: "Dharma, relationships and deeper planetary condition", formula: "30° sign / 9 = 3°20′; movable signs start in themselves, fixed signs in the ninth sign, dual signs in the fifth; advance one sign per part." },
  D10: { name: "Dashamsha", purpose: "Vocation and public activity", formula: "30° sign / 10 = 3°; odd signs start in themselves, even signs in the ninth sign; advance one sign per part." },
};
const houseFrom = (longitude: number, asc: number) =>
  Math.floor(normalizeLongitude(longitude - asc) / 30) + 1;

function project(longitude: number, division: Division) {
  const original = normalizeLongitude(longitude);
  if (division === "D1") return {
    longitude: original, signIndex: Math.floor(original / 30),
    part: 1, sourceSign: ZODIAC_SIGNS[Math.floor(original / 30)],
  };
  const result = vargaPlacement(original, division);
  const partWidth = 30 / Number(division.slice(1));
  // Preserve the fractional position within the selected divisional section.
  const scaledDegree = result.degreeInPart / partWidth * 30;
  return {
    longitude: normalizeLongitude(result.signIndex * 30 + scaledDegree),
    signIndex: result.signIndex,
    part: result.part,
    sourceSign: result.sourceSign,
  };
}

export function buildDivisionalCharts(input: {
  ascendantLongitude: number;
  planets: NatalPoint[];
  d1HouseCusps?: number[];
}) {
  if (!Number.isFinite(input.ascendantLongitude) ||
      input.planets.some(p => !Number.isFinite(p.longitude))) {
    throw new Error("Divisional charts require finite natal Ascendant and planetary longitudes.");
  }
  const divisions: Division[] = ["D1", "D2", "D3", "D9", "D10"];
  return divisions.map(division => {
    const asc = project(input.ascendantLongitude, division);
    const houseCusps = division === "D1" && input.d1HouseCusps?.length === 12
      ? input.d1HouseCusps.map(normalizeLongitude)
      : Array.from({ length: 12 }, (_, i) => normalizeLongitude(asc.longitude + 30 * i));
    const placements: DivisionalPlacement[] = input.planets.map(planet => {
      const p = project(planet.longitude, division);
      return {
        body: planet.name,
        longitude: p.longitude,
        sign: ZODIAC_SIGNS[p.signIndex],
        signIndex: p.signIndex,
        house: houseFrom(p.longitude, houseCusps[0]),
        sourceLongitude: normalizeLongitude(planet.longitude),
        sourceSign: p.sourceSign,
        divisionPart: p.part,
        formula: definitions[division].formula,
      };
    });
    return {
      division,
      name: definitions[division].name,
      purpose: definitions[division].purpose,
      formula: definitions[division].formula,
      coordinateFrame: "guardian-fixed-zero-reference" as const,
      ascendant: {
        longitude: asc.longitude,
        sign: ZODIAC_SIGNS[asc.signIndex],
        signIndex: asc.signIndex,
        sourceLongitude: normalizeLongitude(input.ascendantLongitude),
        divisionPart: asc.part,
      },
      houses: houseCusps.map((cusp, i) => ({
        house: i + 1,
        cusp,
        sign: ZODIAC_SIGNS[Math.floor(cusp / 30)],
        planets: placements.filter(p => p.house === i + 1).map(p => p.body),
      })),
      placements,
      chartLayout: "north-indian-diamond" as const,
      houseSystem: "equal-house-from-divisional-ascendant" as const,
      evidence: "Derived exclusively from the authoritative natal D1 input; not a second ephemeris calculation.",
    };
  });
}
