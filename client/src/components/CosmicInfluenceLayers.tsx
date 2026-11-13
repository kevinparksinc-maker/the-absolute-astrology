import { useMemo } from "react";
import type { ChartResult, ChartRow, TransitContact, MinorTransitContact } from "../../../server/astronomy";
import { ELEMENTAL_DECAN_SIGNS, ZODIAC_SIGNS } from "../../../shared/hybrid";

const RULERS: Record<string,string> = {Aries:"Mars",Taurus:"Venus",Gemini:"Mercury",Cancer:"Moon",Leo:"Sun",Virgo:"Mercury",Libra:"Venus",Scorpio:"Mars",Sagittarius:"Jupiter",Capricorn:"Saturn",Aquarius:"Saturn",Pisces:"Jupiter"};
type AspectName = TransitContact["aspect"] | MinorTransitContact["aspect"];
const ANGLES: Record<AspectName,number> = {conjunction:0,square:90,trine:120,opposition:180,sextile:60,semisextile:30,semisquare:45,quincunx:150};
const geometry = (a:number,b:number) => {
  const delta=Math.abs(((a-b)%360+360)%360),distance=Math.min(delta,360-delta);
  const candidates=(Object.entries(ANGLES) as [AspectName,number][]).map(([aspect,angle])=>({aspect,orb:Math.abs(distance-angle)}));
  return candidates.sort((x,y)=>x.orb-y.orb)[0];
};
const tone = (aspect:AspectName) => ["conjunction","trine","sextile","semisextile"].includes(aspect)?"Flow":"Friction";
function decanRuler(longitude:number) {
  const normalized=((longitude%360)+360)%360,sign=Math.floor(normalized/30),decan=Math.floor((normalized%30)/10);
  const family=ELEMENTAL_DECAN_SIGNS[sign][decan];
  return {name:`${ZODIAC_SIGNS[sign]} · ${decan+1} decan`,family,ruler:RULERS[family]};
}
type LayerEvent={key:string;title:string;detail:string;mode:string;orb?:number};
export function CosmicInfluenceLayers({chart}:{chart:ChartResult}) {
  const result=useMemo(()=>{
    const natal=new Map(chart.movingBodies.map(p=>[p.name,p]));
    const transit=new Map(chart.transits.map(p=>[p.name,p]));
    const moon=transit.get("Moon"),natalMoon=natal.get("Moon");
    const aspectContexts:LayerEvent[]=[];
    // Every natal-transit aspect carries the zodiac, mansion and decan context
    // of BOTH participating planets. The aspect itself is scored only once.
    for(const moving of chart.transits) for(const contact of [...moving.natalContacts, ...moving.minorNatalContacts]) {
      const natalBody = natal.get(contact.natalName);
      if(!natalBody || contact.orb>5) continue;
      const a=decanRuler(moving.longitude),d=decanRuler(natalBody.longitude);
      aspectContexts.push({
        key:`context-${moving.name}-${natalBody.name}-${contact.aspect}`,
        title:`Transit ${moving.name} ${contact.aspect} natal ${natalBody.name}`,
        detail:`Transit ${moving.name}: ${moving.display}, house ${moving.house}, Nakshatra ${moving.overlay.nakshatra}, Manzil ${moving.overlay.manzil}, elemental decan ${a.name} (ruler ${a.ruler}). Natal ${natalBody.name}: ${natalBody.display}, house ${natalBody.house}, Nakshatra ${natalBody.overlay.nakshatra}, Manzil ${natalBody.overlay.manzil}, elemental decan ${d.name} (ruler ${d.ruler}). One geometric aspect, enriched by both placements.`,
        mode:tone(contact.aspect),orb:contact.orb
      });
    }
    const lunar:LayerEvent[]=[];
    if(moon) {
      lunar.push({key:"vedic",title:"Vedic lunar mansion",detail:`Transit Moon: ${moon.overlay.nakshatra}, pada ${moon.overlay.pada}. Natal Moon: ${natalMoon?.overlay.nakshatra??"unavailable"}.`,mode:"Position"});
      lunar.push({key:"arabic",title:"Arabic lunar mansion",detail:`Transit Moon: ${moon.overlay.manzil}. Natal Moon: ${natalMoon?.overlay.manzil??"unavailable"}.`,mode:"Position"});
      for(const target of chart.movingBodies) {
        const aspect=geometry(moon.longitude,target.longitude);
        if(aspect.orb<=5) lunar.push({key:`moon-${target.name}`,title:`Moon ${aspect.aspect} natal ${target.name}`,detail:`${moon.overlay.nakshatra} / ${moon.overlay.manzil} Moon at ${moon.display}; natal ${target.name} at ${target.display}. Mansion is positional context, not a separate aspecting planet.`,mode:tone(aspect.aspect),orb:aspect.orb});
      }
    }
    const decans:LayerEvent[]=[];
    for(const p of chart.transits) {
      const d=decanRuler(p.longitude);
      decans.push({key:`decan-${p.name}`,title:`${p.name} · ${d.name}`,detail:`Elemental-family ruler: ${d.ruler} (${d.family}). ${p.display}.`,mode:"Position"});
      const rulerTransit=transit.get(d.ruler);
      if(rulerTransit) for(const natalPlanet of chart.movingBodies) {
        const aspect=geometry(rulerTransit.longitude,natalPlanet.longitude);
        if(aspect.orb<=5) decans.push({key:`ruler-${p.name}-${natalPlanet.name}`,title:`${p.name} decan ruler ${d.ruler} ${aspect.aspect} natal ${natalPlanet.name}`,detail:`${d.ruler} ${rulerTransit.display} to natal ${natalPlanet.name} ${natalPlanet.display}. The aspect belongs to the ruler, not the decan sector.`,mode:tone(aspect.aspect),orb:aspect.orb});
      }
    }
    const unique=Array.from(new Map(decans.map(x=>[x.title,x])).values());
    return {lunar,decans:unique,aspectContexts};
  },[chart]);
  const render=(title:string,items:LayerEvent[]) => <div className="rounded-xl border border-white/10 bg-white/[.035] p-3"><h4 className="font-semibold text-amber-100">{title}</h4><p className="mt-1 text-xs text-slate-400">{items.filter(x=>x.mode==="Flow").length} supportive · {items.filter(x=>x.mode==="Friction").length} challenging</p><div className="mt-3 space-y-2">{items.slice(0,6).map(item=><div key={item.key} className="border-t border-white/10 pt-2"><div className="flex justify-between gap-2 text-xs"><strong className="text-slate-100">{item.title}</strong><span className={item.mode==="Flow"?"text-emerald-200":item.mode==="Friction"?"text-rose-200":"text-violet-200"}>{item.mode}{item.orb!=null?` · ${item.orb.toFixed(2)}°`:""}</span></div><p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p></div>)}</div><details className="mt-3 text-xs text-cyan-200"><summary className="cursor-pointer">All {items.length} entries</summary><div className="mt-2 space-y-2">{items.slice(6).map(item=><p key={item.key} className="border-t border-white/10 pt-2">{item.title} — {item.detail}</p>)}</div></details></div>;
  return <section className="mt-4 rounded-2xl border border-violet-300/30 bg-[#101a31] p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-widest text-violet-200">Expanded energetic evidence</p><h3 className="mt-1 font-serif text-xl text-white">Mansions & Elemental Decans</h3><p className="mt-2 text-xs leading-5 text-slate-300">Calculated from the same natal and transit longitudes as your aspects. Flow and friction labels describe geometry; they are not independent mansion or decan scores.</p><div className="mt-4 grid gap-3 lg:grid-cols-2">{render("All planetary aspects · mansion context",result.aspectContexts)}{render("Lunar mansion influences",result.lunar)}{render("Elemental-family decan influences",result.decans)}</div><p className="mt-3 text-xs text-slate-400">Chinese mansions are not included until their specific longitude boundaries and reference frame are implemented and validated.</p></section>;
}
