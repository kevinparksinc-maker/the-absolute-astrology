import { normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import type { ChartResult } from "../../astronomy";
import type { EvidenceItem } from "../types";

/** Explicit traditional Parashari variants, applied to supplied fixed-frame longitude.
 * These are NOT automatically Lahiri-sidereal vargas; the underlying chart supplies
 * tropical/geocentric longitudes in Guardian's fixed-zero reference.
 * A sidereal conversion needs to be made upstream if genuine Jyotish D charts are desired.
 */
export type Varga = "D2"|"D3"|"D9"|"D10";
export function vargaPlacement(longitude:number, division:Varga) {
 const lon=normalizeLongitude(longitude), sign=Math.floor(lon/30), degree=lon%30;
 const n=Number(division.slice(1)), part=Math.min(n-1,Math.floor(degree/(30/n)));
 let result:number;
 if(division==="D2"){ // classical Parashari Sun/Moon Hora: odd signs Sun first
  const sunHora=(sign%2===0)===(part===0);
  result=sunHora?4:3; // Leo/Cancer
 }else if(division==="D3"){
  result=(sign+4*part)%12; // 1st, 5th, 9th from sign
 }else if(division==="D9"){
  // Movable: same sign, fixed: ninth sign, dual: fifth sign.
  const start=sign%3===0?sign:sign%3===1?(sign+8)%12:(sign+4)%12;
  result=(start+part)%12;
 }else{
  // D10: odd signs from own sign; even signs from ninth.
  result=((sign%2===0?sign:(sign+8)%12)+part)%12;
 }
 return {division,part:part+1,sourceSign:ZODIAC_SIGNS[sign],sign:ZODIAC_SIGNS[result],signIndex:result,degreeInPart:degree-part*(30/n),coordinateFrame:"guardian-fixed-zero-reference" as const};
}
export function resolveVargaEvidence(chart:ChartResult):EvidenceItem[]{
 const coordinateFrame="guardian-fixed-zero-reference" as const;
 const rows=[...chart.movingBodies,chart.ascendant,chart.northNode,chart.southNode].filter((r):r is NonNullable<typeof r>=>r !== null && r !== undefined && Number.isFinite(r.longitude));
 const trace=(division:Varga)=>({sourceId:"local-vedic-rules",tradition:"vedic" as const,technique:"varga",sourceTitle:"Parashari varga mapping (explicit variant); Guardian fixed-background coordinates, not Lahiri sidereal",retrievedAt:new Date().toISOString(),ruleId:"vedic-varga-architecture",confidence:"moderate" as const,calculationSettings:{division,coordinateFrame,ayanamsaDegrees:0,siderealConversionApplied:false}});
 return (["D2","D3","D9","D10"] as const).flatMap(division=>rows.map(row=>{
  const v=vargaPlacement(row.longitude,division);
  return {id:`vedic-varga-${division}-${row.name.toLowerCase().replace(/\s+/g,"-")}`,tradition:"vedic" as const,category:"deterministic-rule" as const,technique:"varga",subject:row.name,
   statement:`[${division} · ${coordinateFrame}] ${row.name} at ${row.display}: fixed-frame longitude ${normalizeLongitude(row.longitude).toFixed(5)}°, source sign ${v.sourceSign}, division ${v.part}/${Number(division.slice(1))}, derived ${v.sign}. No Lahiri offset applied.`, 
   concepts:["varga",division.toLowerCase(),row.name.toLowerCase(),v.sign.toLowerCase()],polarity:"neutral" as const,sourceId:"local-vedic-rules",sourceTrace:trace(division)};
 }));
}
