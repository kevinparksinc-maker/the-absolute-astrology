import type { TeamSide } from "./contracts";

/** The Absolute Simulation Lab's explicit contest-house assignment.
 * This is a custom sports framework, not a claim of universal traditional practice.
 */
export const ASC_TEAM_HOUSES = [1, 2, 3, 6, 10, 11] as const;
export const DESC_TEAM_HOUSES = [7, 8, 9, 12, 4, 5] as const;

export function teamSideForHouse(house: number): TeamSide {
  if (!Number.isInteger(house) || house < 1 || house > 12) {
    throw new RangeError(`Invalid house: ${house}`);
  }
  return (ASC_TEAM_HOUSES as readonly number[]).includes(house) ? "asc" : "desc";
}

export function oppositeHouse(house: number): number {
  if (!Number.isInteger(house) || house < 1 || house > 12) {
    throw new RangeError(`Invalid house: ${house}`);
  }
  return ((house + 5) % 12) + 1;
}

/** Checks both teams own six distinct houses and oppositions reverse sides. */
export function validateTeamHouseMapping(): boolean {
  const all = [...ASC_TEAM_HOUSES, ...DESC_TEAM_HOUSES];
  return new Set(all).size === 12 &&
    all.every(h => h >= 1 && h <= 12 && teamSideForHouse(h) !== teamSideForHouse(oppositeHouse(h)));
}
