/** Custom equatorial RA wheel, v0.1. No ecliptic zodiac or ephemeris implied.
 * Input vectors MUST share geocentric equatorial frame, origin, epoch and units.
 * Pure deterministic calculations; do not connect to production until independently verified.
 */
export type Vector3 = Readonly<{ x:number; y:number; z:number }>;
export type Coordinates = Readonly<{ ra:number; dec:number; distance:number }>;
export const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
const rad = Math.PI / 180;
export function mod360(n:number):number {
  if (!Number.isFinite(n)) throw new RangeError("Non-finite angle");
  return ((n % 360) + 360) % 360;
}
export function xyzToEquatorial(v:Vector3):Coordinates {
  const {x,y,z}=v;
  if (![x,y,z].every(Number.isFinite)) throw new RangeError("Non-finite vector");
  const distance=Math.hypot(x,y,z);
  if (distance===0) throw new RangeError("Zero vector");
  return {ra:mod360(Math.atan2(y,x)/rad),dec:Math.atan2(z,Math.hypot(x,y))/rad,distance};
}
export function sector(angle:number) {
  const a=mod360(angle);
  const index=Math.floor(a/30);
  return {index,sign:SIGNS[index],degree:a-index*30};
}
/** Equatorial eastern-horizon intersection at declination 0, NOT ecliptic ASC. */
export function equatorialAscendantFromLast(localApparentSiderealDegrees:number):number {
  return mod360(localApparentSiderealDegrees+90);
}
/** Approximate sunrise diagnostic. h0 is the solar-center apparent altitude in degrees.
 * Requires external independently verified sunrise and Sun equatorial coordinates.
 * Returns null if the Sun never crosses the requested horizon altitude.
 * The hour angle at sunrise is NEGATIVE.
 */
export function siderealAtSunrise(sunRa:number,sunDec:number,latitude:number,h0=-0.833):number|null {
  if (![sunRa,sunDec,latitude,h0].every(Number.isFinite)||Math.abs(latitude)>90) throw new RangeError("Invalid sunrise inputs");
  const p=latitude*rad,d=sunDec*rad;
  const denom=Math.cos(p)*Math.cos(d);
  if (Math.abs(denom)<1e-12) return null;
  const c=(Math.sin(h0*rad)-Math.sin(p)*Math.sin(d))/denom;
  if (c < -1 || c > 1) return null;
  const risingHourAngle=-Math.acos(c)/rad;
  return mod360(sunRa+risingHourAngle);
}
export function equalHouseCusps(asc:number):number[] {
  return Array.from({length:12},(_,i)=>mod360(asc+30*i));
}
export function equalHouse(angle:number,asc:number):number {
  return 1+Math.floor(mod360(angle-asc)/30);
}
export function nodeAxis(northRa:number,asc:number) {
  const north=mod360(northRa),south=mod360(north+180);
  const northHouse=equalHouse(north,asc),southHouse=equalHouse(south,asc);
  if(southHouse!==1+(northHouse+5)%12) throw new Error("Nodal house invariant failed");
  return {north,south,northHouse,southHouse};
}
export function majorAspects(points:ReadonlyArray<{id:string;ra:number}>,orbLimit=5) {
  if (!Number.isFinite(orbLimit)||orbLimit<0||orbLimit>30) throw new RangeError("Invalid orb");
  const targets=[{name:"conjunction",angle:0,harmonious:true},{name:"sextile",angle:60,harmonious:true},{name:"square",angle:90,harmonious:false},{name:"trine",angle:120,harmonious:true},{name:"opposition",angle:180,harmonious:false}] as const;
  const out:Array<{a:string;b:string;aspect:string;angle:number;separation:number;orb:number;harmonious:boolean}>=[];
  for(let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++) {
    const a=points[i],b=points[j];
    if(a.id===b.id) throw new Error("Duplicate object ID");
    const diff=mod360(a.ra-b.ra),separation=Math.min(diff,360-diff);
    const best=targets.reduce((prev,t)=>Math.abs(separation-t.angle)<Math.abs(separation-prev.angle)?t:prev);
    const orb=Math.abs(separation-best.angle);
    if(orb<=orbLimit+1e-10)out.push({a:a.id,b:b.id,aspect:best.name,angle:best.angle,separation,orb,harmonious:best.harmonious});
  }
  return out;
}
export function dayLots(asc:number,sun:number,moon:number,day:boolean) {
  return {fortune:mod360(asc+(day?moon-sun:sun-moon)),spirit:mod360(asc+(day?sun-moon:moon-sun))};
}
