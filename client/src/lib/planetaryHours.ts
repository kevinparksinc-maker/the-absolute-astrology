/**
 * Traditional unequal planetary hours. All times are absolute UTC instants;
 * the consumer formats them in the transit location's IANA timezone.
 * Sunrise/sunset use a solar altitude of -0.833 degrees (refraction + solar disc).
 */
export const CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"] as const;
export type PlanetaryRuler = typeof CHALDEAN_ORDER[number];
export type PlanetaryHour = { ruler: PlanetaryRuler; start: string; end: string; number: number; period: "day" | "night"; durationMinutes: number };
const RAD = Math.PI / 180;
const DAY = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const toJulian = (ms: number) => ms / DAY - 0.5 + J1970;
const fromJulian = (j: number) => (j + 0.5 - J1970) * DAY;
const solarMeanAnomaly = (d: number) => RAD * (357.5291 + 0.98560028 * d);
const eclipticLongitude = (m: number) => m + RAD * (1.9148 * Math.sin(m) + 0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m) + 102.9372 + 180);
function solarEvents(utcDay: Date, lat: number, lon: number): { sunrise: number; sunset: number } | null {
  const noon = Date.UTC(utcDay.getUTCFullYear(), utcDay.getUTCMonth(), utcDay.getUTCDate(), 12);
  const lw = -lon * RAD, phi = lat * RAD;
  const d = toJulian(noon) - J2000;
  const n = Math.round(d - 0.0009 - lw / (2 * Math.PI));
  const ds = 0.0009 + lw / (2 * Math.PI) + n;
  const m = solarMeanAnomaly(ds);
  const l = eclipticLongitude(m);
  const dec = Math.asin(Math.sin(l) * Math.sin(23.4397 * RAD));
  const transit = J2000 + ds + 0.0053 * Math.sin(m) - 0.0069 * Math.sin(2 * l);
  const cosHour = (Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  if (!Number.isFinite(cosHour) || Math.abs(cosHour) > 1) return null;
  const delta = Math.acos(cosHour) / (2 * Math.PI);
  return { sunrise: fromJulian(transit - delta), sunset: fromJulian(transit + delta) };
}
export function calculatePlanetaryHours(at: Date, latitude: number, longitude: number, timeZone?: string): { current: PlanetaryHour; next: PlanetaryHour; upcoming: PlanetaryHour[] } | null {
  if (!Number.isFinite(at.getTime()) || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  // Build surrounding solar days in UTC to cover local dawns near the date line.
  const midnight = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate());
  const events = Array.from({ length: 7 }, (_, i) => solarEvents(new Date(midnight + (i - 3) * DAY), latitude, longitude))
    .filter((x): x is { sunrise: number; sunset: number } => !!x).sort((a,b) => a.sunrise - b.sunrise);
  const hours: PlanetaryHour[] = [];
  for (let i=0; i<events.length-1; i++) {
    const a=events[i], b=events[i+1];
    if (!(a.sunrise<a.sunset && a.sunset<b.sunrise)) continue;
    // Sunday 0 -> Sun, Monday 1 -> Moon, etc.
    // Use the transit location timezone for the weekday at sunrise.
    const localDate = timeZone ? new Intl.DateTimeFormat("en-US", {weekday:"short", timeZone}).format(new Date(a.sunrise)) : null;
    const localWeekday = localDate ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(localDate) : new Date(a.sunrise + longitude / 15 * 3600000).getUTCDay();
    const dayRuler: PlanetaryRuler = (["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"] as const)[localWeekday];
    const startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
    const add = (start:number,end:number,index:number,period:"day"|"night") => {
      if (!(end>start)) return;
      const width=(end-start)/12;
      for(let h=0;h<12;h++) {
        const begin=start+h*width, finish=start+(h+1)*width;
        hours.push({ruler:CHALDEAN_ORDER[(startIndex+index+h)%7],start:new Date(begin).toISOString(),end:new Date(finish).toISOString(),number:index+h+1,period,durationMinutes:width/60000});
      }
    };
    add(a.sunrise,a.sunset,0,"day");
    add(a.sunset,b.sunrise,12,"night");
  }
  const now=at.getTime();
  const index=hours.findIndex(h=>Date.parse(h.start)<=now && now<Date.parse(h.end));
  if(index<0 || !hours[index+1]) return null;
  return {current:hours[index],next:hours[index+1],upcoming:hours.slice(index,index+5)};
}
