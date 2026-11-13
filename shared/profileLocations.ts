type LocatedProfile = {
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  transitLocation?: string;
  transitLatitude?: number;
  transitLongitude?: number;
  transitTimezone?: string;
};
export const KNOWN_CITIES = [
  {
    label: "Dallas, Texas, USA",
    shortLabel: "Dallas, TX",
    names: [
      "dallas, texas, usa",
      "dallas, tx",
      "dallas, texas",
      "dallas, texas, united states",
    ],
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
  },
  {
    label: "Las Vegas, Nevada, USA",
    shortLabel: "Las Vegas, NV",
    names: [
      "las vegas",
      "las vegas, nevada, usa",
      "las vegas, nv",
      "las vegas, nevada",
      "las vegas, nevada, united states",
    ],
    latitude: 36.1699,
    longitude: -115.1398,
    timezone: "America/Los_Angeles",
  },
];
export function knownCity(label: string) {
  return KNOWN_CITIES.find(city =>
    city.names.includes(label.trim().toLowerCase().replace(/\s+/g, " "))
  );
}

/** Repair known legacy city/coordinate mismatches; retain valid local GPS coordinates. */
export function repairProfileLocations<T extends LocatedProfile>(
  profile: T
): T {
  let next = profile;
  for (const transit of [false, true]) {
    const label = transit ? profile.transitLocation : profile.location;
    const city = knownCity(label || "");
    if (!city) continue;
    const lat = transit ? profile.transitLatitude : profile.latitude;
    const lon = transit ? profile.transitLongitude : profile.longitude;
    const timezone = transit ? profile.transitTimezone : profile.timezone;
    const nearby = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat! - city.latitude) < 1 && Math.abs(lon! - city.longitude) < 1;
    if (nearby && timezone === city.timezone && label === city.label) continue;
    next = transit
      ? { ...next, transitLocation: city.label, transitLatitude: nearby ? lat! : city.latitude, transitLongitude: nearby ? lon! : city.longitude, transitTimezone: city.timezone }
      : { ...next, location: city.label, latitude: nearby ? lat! : city.latitude, longitude: nearby ? lon! : city.longitude, timezone: city.timezone };

  }
  return next;
}
