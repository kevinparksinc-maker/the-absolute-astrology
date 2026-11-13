/**
 * Fixed-frame lunar mansion utilities for Firmament Guardian.
 *
 * All inputs MUST be canonical Aldebaran-anchored longitude (Swiss mode 14).
 * This module never applies an ayanamsha or modifies the planetary longitude.
 *
 * Historical Chinese xiu are equatorial/right-ascension zones defined from
 * determinative-star meridians. The Han-era source widths below are retained
 * as historical source data. Because that table sums to 367 traditional du,
 * the app's ecliptic projection is explicitly labeled as a custom Firmament
 * adaptation rather than presented as a literal historical ecliptic table.
 */
export const CHINESE_MANSIONS = [
  "Jiao (Horn)", "Kang (Neck)", "Di (Root)", "Fang (Room)",
  "Xin (Heart)", "Wei (Tail)", "Ji (Winnowing Basket)",
  "Dou (Dipper)", "Niu (Ox)", "Nu (Girl)", "Xu (Emptiness)",
  "Wei (Rooftop)", "Shi (Encampment)", "Bi (Wall)",
  "Kui (Legs)", "Lou (Bond)", "Wei (Stomach)", "Mao (Hairy Head)",
  "Bi (Net)", "Zi (Turtle Beak)", "Shen (Three Stars)",
  "Jing (Well)", "Gui (Ghosts)", "Liu (Willow)",
  "Xing (Star)", "Zhang (Extended Net)", "Yi (Wings)", "Zhen (Chariot)",
] as const;

/** Classical determinative stars listed in the Han-era reference table. */
export const CHINESE_HAN_DETERMINATIVE_STARS = [
  "α Virginis", "κ Virginis", "α Librae", "π Scorpii", "σ Scorpii", "μ Scorpii",
  "γ Sagittarii", "φ Sagittarii", "β Capricorni", "ε Aquarii", "β Aquarii", "α Aquarii",
  "α Pegasi", "γ Pegasi", "ζ Andromedae", "β Arietis", "35 Arietis", "17 Tauri",
  "ε Tauri", "φ′ Orionis", "δ Orionis", "μ Geminorum", "θ Cancri", "δ Hydrae",
  "α Hydrae", "υ Hydrae", "α Crateris", "γ Corvi",
] as const;

/**
 * Computed Han-dynasty angular extents from the historical table reproduced
 * in Needham's History of Science and Technology in China, Table 13.1.
 * These are traditional equatorial extents, not modern ecliptic degrees.
 */
export const CHINESE_HAN_ANGULAR_EXTENTS = [
  12, 9, 15, 5, 5, 19, 11, 27, 8, 12, 10, 17, 17, 9,
  16, 11, 15, 11, 18, 1, 8, 33, 4, 15, 7, 17, 18, 17,
] as const;
export const CHINESE_HAN_TOTAL_EXTENT = CHINESE_HAN_ANGULAR_EXTENTS.reduce((sum, value) => sum + value, 0);

export type ChineseMansion = (typeof CHINESE_MANSIONS)[number];
export type ChineseBoundaryModel = "historical-han-width-proportional-firmament-adaptation";
export type ChineseBoundary = {
  /** Canonical Aldebaran-anchored zodiac longitude of mansion start. */
  start: number;
  /** Index into CHINESE_MANSIONS. */
  mansionIndex: number;
};
export type ChineseMansionResult = {
  mansion: ChineseMansion;
  mansionIndex: number;
  determinativeStar: string;
  referenceFrame: "firmament-aldebaran-15-taurus";
  boundaryModel: ChineseBoundaryModel;
};

export const NAKSHATRA_RULERS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter",
  "Saturn", "Mercury", "Ketu", "Venus", "Sun", "Moon", "Mars",
  "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus",
  "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
] as const;

export function normalizeMansionLongitude(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError("Longitude must be finite");
  return ((value % 360) + 360) % 360;
}

/**
 * Validate a full set of 28 non-overlapping circular sectors.
 * Starts are sorted by zodiac longitude; mansion indices are unique.
 * A caller must supply a vetted table: no equal-sector fallback exists.
 */
export function validateChineseBoundaries(
  boundaries: readonly ChineseBoundary[],
): ChineseBoundary[] {
  if (boundaries.length !== 28) {
    throw new Error("Exactly 28 calibrated Chinese mansion boundaries are required");
  }
  const sorted = boundaries.map(({ start, mansionIndex }) => {
    if (!Number.isFinite(start) || start < 0 || start >= 360) {
      throw new RangeError("Boundary starts must be within [0, 360)");
    }
    if (!Number.isInteger(mansionIndex) || mansionIndex < 0 || mansionIndex >= 28) {
      throw new Error("Invalid Chinese mansion index");
    }
    return { start, mansionIndex };
  }).sort((a, b) => a.start - b.start);
  if (new Set(sorted.map(b => b.start)).size !== 28 ||
      new Set(sorted.map(b => b.mansionIndex)).size !== 28) {
    throw new Error("Chinese mansion boundaries and indices must be unique");
  }
  return sorted;
}

/**
 * Derive a transparent custom ecliptic adaptation from the historical Han
 * widths. The source widths are preserved proportionally, then normalized
 * from 367 traditional du to one 360-degree Firmament revolution. Mansion
 * Bi (Net), whose determinative star is ε Tauri near Aldebaran, is anchored
 * at the app's canonical Aldebaran longitude of 45°. This is not claimed as
 * the original historical Chinese ecliptic convention.
 */
export function buildFirmamentChineseBoundaries(
  anchorLongitude = 45,
  anchorMansionIndex = 18,
): ChineseBoundary[] {
  const scale = 360 / CHINESE_HAN_TOTAL_EXTENT;
  const cumulativeBefore = CHINESE_HAN_ANGULAR_EXTENTS.slice(0, anchorMansionIndex)
    .reduce((sum, value) => sum + value, 0);
  return CHINESE_HAN_ANGULAR_EXTENTS.map((_, mansionIndex) => ({
    start: normalizeMansionLongitude(
      anchorLongitude +
      (CHINESE_HAN_ANGULAR_EXTENTS.slice(0, mansionIndex).reduce((sum, value) => sum + value, 0) - cumulativeBefore) * scale,
    ),
    mansionIndex,
  }));
}

export const FIRMAMENT_CHINESE_BOUNDARIES = buildFirmamentChineseBoundaries();

/**
 * Map a canonical longitude to a Chinese mansion using vetted boundaries.
 * No house, ASC, obliquity, or additional sidereal offset is applied.
 */
export function chineseMansionAtLongitude(
  canonicalLongitude: number,
  calibratedBoundaries: readonly ChineseBoundary[] = FIRMAMENT_CHINESE_BOUNDARIES,
): ChineseMansionResult {
  const longitude = normalizeMansionLongitude(canonicalLongitude);
  const sorted = validateChineseBoundaries(calibratedBoundaries);
  let chosen = sorted[sorted.length - 1];
  for (const boundary of sorted) {
    if (longitude >= boundary.start) chosen = boundary;
    else break;
  }
  return {
    mansion: CHINESE_MANSIONS[chosen.mansionIndex],
    mansionIndex: chosen.mansionIndex,
    determinativeStar: CHINESE_HAN_DETERMINATIVE_STARS[chosen.mansionIndex],
    referenceFrame: "firmament-aldebaran-15-taurus",
    boundaryModel: "historical-han-width-proportional-firmament-adaptation",
  };
}

/** Classical Vimshottari lord of the 27 equal nakshatra sectors. */
export function nakshatraRulerAtLongitude(canonicalLongitude: number): string {
  const longitude = normalizeMansionLongitude(canonicalLongitude);
  return NAKSHATRA_RULERS[Math.floor(longitude / (360 / 27)) % 27];
}
