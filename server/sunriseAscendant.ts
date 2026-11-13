/**
 * The Absolute custom sunrise Sun-angle plus sidereal rotation Ascendant.
 *
 * Coordinates must be expressed in one fixed equatorial XYZ frame:
 * X=0 degrees of the wheel, Y=90 degrees, Z=north celestial pole.
 * Observer latitude determines sunrise time upstream, not an additional horizon offset.
 * No tropical longitude, ayanamsha, obliquity or precession adjustment is applied here.
 *
 * Sunrise itself must be obtained independently for the historical date/location;
 * this module does not silently substitute an approximate sunrise.
 */
export type FixedVector = { x: number; y: number; z: number };
export const ROTATION_DEGREES_PER_HOUR = 15;

export function normalizeDegrees(value: number): number {
  if (!Number.isFinite(value)) throw new Error("Angle must be finite.");
  return ((value % 360) + 360) % 360;
}
function degrees(rad: number): number { return rad * 180 / Math.PI; }

export function solarAnglesFromFixedXYZ(vector: FixedVector) {
  const { x, y, z } = vector;
  if (![x, y, z].every(Number.isFinite) || Math.hypot(x, y, z) === 0) {
    throw new Error("Sun XYZ must be a nonzero finite vector.");
  }
  return {
    longitude: normalizeDegrees(degrees(Math.atan2(y, x))),
    declination: degrees(Math.atan2(z, Math.hypot(x, y))),
  };
}

export function ascendantFromSunrise(input: {
  sunriseUtc: string;
  eventUtc: string;
  sunriseSunXYZ: FixedVector;
  latitude: number;
}) {
  if (!Number.isFinite(input.latitude) || Math.abs(input.latitude) > 90) throw new Error("Invalid observer latitude.");
  const sunriseMillis = Date.parse(input.sunriseUtc);
  const eventMillis = Date.parse(input.eventUtc);
  if (!Number.isFinite(sunriseMillis) || !Number.isFinite(eventMillis)) {
    throw new Error("Sunrise and event must be valid UTC instants.");
  }
  const elapsedHours = (eventMillis - sunriseMillis) / 3_600_000;
  // Consecutive solar sunrises can be more than 24 UTC hours apart near
  // seasonal extremes; 26 hours still rejects a stale or wrong-date anchor.
  if (elapsedHours < 0 || elapsedHours > 26) {
    throw new Error(`Sunrise anchor must precede the event by no more than 26 hours (received ${elapsedHours.toFixed(3)}).`);
  }
  // The Absolute's sole custom ASC rule: Sun equatorial XY angle at sunrise
  // plus elapsed rotation at exactly 15 degrees per hour. Do NOT substitute the geometric horizon intersection.
  const sunriseHorizon = solarAnglesFromFixedXYZ(input.sunriseSunXYZ).longitude;
  return {
    ascendant: normalizeDegrees(sunriseHorizon + elapsedHours * ROTATION_DEGREES_PER_HOUR),
    sunriseHorizon,
    elapsedRotationDegrees: elapsedHours * ROTATION_DEGREES_PER_HOUR,
    elapsedHours,
    sunriseUtc: new Date(sunriseMillis).toISOString(),
    eventUtc: new Date(eventMillis).toISOString(),
    model: "sun-equatorial-xyz-at-sunrise-plus-15-degrees-per-hour-v1" as const,
  };
}
