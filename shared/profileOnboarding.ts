import { knownCity } from "./profileLocations";
export type BirthCoordinates = {
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
};
type BirthIdentity = BirthCoordinates & {
  name: string;
  date: string;
  time: string;
  birthTimeUnknown: boolean;
};
type ResolvedCity = {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
};
const validCoordinates = (p: BirthCoordinates) =>
  Boolean(
    p.location.trim() &&
    p.timezone &&
    Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 90 &&
    Number.isFinite(p.longitude) &&
    Math.abs(p.longitude) <= 180
  );

/** Step one resolves and validates; saving is exclusively a step-two action. */
export async function prepareBirthStep<T extends BirthIdentity>(
  profile: T,
  typedCity: string,
  lookup: (query: string) => Promise<ResolvedCity>
): Promise<T> {
  if (!profile.name.trim())
    throw new Error("Please enter your name or cosmic moniker.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(profile.date) ||
    !Number.isFinite(Date.parse(`${profile.date}T00:00:00Z`)) ||
    new Date(`${profile.date}T00:00:00Z`).toISOString().slice(0, 10) !==
      profile.date
  )
    throw new Error("Please enter a valid birth date.");
  if (
    !profile.birthTimeUnknown &&
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(profile.time)
  )
    throw new Error("Please provide your birth time or check ‘Time unknown’.");
  const query = typedCity.trim();
  if (!query) throw new Error("Please enter your birth city.");
  if (query === profile.location.trim() && validCoordinates(profile))
    return profile;
  const preset = knownCity(query);
  const city = preset
    ? { ...preset, label: preset.label }
    : await lookup(query);
  const next = {
    ...profile,
    location: city.label,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
  if (!validCoordinates(next))
    throw new Error(
      "Could not verify this birth city. Try a more specific city or a quick preset."
    );
  return next;
}
