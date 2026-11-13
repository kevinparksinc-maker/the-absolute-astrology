/** Approximate astronomical sunrise solver using solar declination and equation of time.
 * Intended for integration validation, NOT a historical sunrise certificate.
 * Date is local civil date; caller must supply local noon as an absolute UTC Date.
 * Longitude east-positive, latitude north-positive.
 */
export function approximateSunriseUtc(localNoonUtc: Date, latitude: number, longitude: number): Date {
  if (![localNoonUtc.getTime(),latitude,longitude].every(Number.isFinite) || Math.abs(latitude)>90 || Math.abs(longitude)>180) throw new Error("Invalid sunrise inputs");
  const rad=Math.PI/180;
  const jd=localNoonUtc.getTime()/86400000+2440587.5;
  const t=(jd-2451545)/36525;
  const L=(280.46646+t*(36000.76983+t*0.0003032))%360;
  const M=(357.52911+t*(35999.05029-0.0001537*t))*rad;
  const e=0.016708634-t*(0.000042037+0.0000001267*t);
  const C=(1.914602-t*(0.004817+0.000014*t))*Math.sin(M)+(0.019993-0.000101*t)*Math.sin(2*M)+0.000289*Math.sin(3*M);
  const lambda=(L+C-0.00569-0.00478*Math.sin((125.04-1934.136*t)*rad))*rad;
  const epsilon=(23.439291-0.0130042*t+0.00256*Math.cos((125.04-1934.136*t)*rad))*rad;
  const decl=Math.asin(Math.sin(epsilon)*Math.sin(lambda));
  const y=Math.tan(epsilon/2)**2;
  const eq=4/rad*(y*Math.sin(2*L*rad)-2*e*Math.sin(M)+4*e*y*Math.sin(M)*Math.cos(2*L*rad)-0.5*y*y*Math.sin(4*L*rad)-1.25*e*e*Math.sin(2*M));
  const cosH=(Math.cos(90.833*rad)/(Math.cos(latitude*rad)*Math.cos(decl)))-Math.tan(latitude*rad)*Math.tan(decl);
  if (cosH < -1 || cosH > 1) throw new Error("No sunrise on this date at this latitude");
  const hourAngle=Math.acos(cosH)/rad;
  const minutesUtc=720-4*(longitude+hourAngle)-eq;
  const utcMidnight=Date.UTC(localNoonUtc.getUTCFullYear(),localNoonUtc.getUTCMonth(),localNoonUtc.getUTCDate());
  return new Date(utcMidnight+minutesUtc*60000);
}
