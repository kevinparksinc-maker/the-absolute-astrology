import sweph from "sweph";
import type { MotionVector } from "../core/astrology/InvariantVectorEngine";

/** Raw Earth-centered equatorial Cartesian state, position AU, velocity AU/day.
 * J2000/ICRS is an upstream inertial axis convention, NOT the zodiac anchor.
 * No sidereal/ayanamsha, heliocentric or barycentric flags are used.
 */
export const GEOCENTRIC_ICRS_XYZ_FLAGS = 4 | 256 | 4096 | 2048 | 32 | 131072;

export function getGeocentricIcrsState(jdUt: number, planet: number): MotionVector {
  if (!Number.isFinite(jdUt) || !Number.isInteger(planet)) throw new Error("Invalid ephemeris input");
  const response: any = (sweph as any).calc_ut(jdUt, planet, GEOCENTRIC_ICRS_XYZ_FLAGS);
  const values = response?.data ?? response;
  if (!Array.isArray(values) || values.length < 6 || !values.slice(0, 6).every((v: unknown) => typeof v === "number" && Number.isFinite(v))) {
    throw new Error("Swiss Ephemeris XYZ state unavailable or invalid");
  }
  return {
    pos: { x: values[0], y: values[1], z: values[2] },
    vel: { x: values[3], y: values[4], z: values[5] },
  };
}
