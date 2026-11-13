import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";
import { Link } from "wouter";

interface Props {
 chart:ChartResult|null;
 onAskMasterInterpreter?:(question:string)=>void;
 className?:string;
}
const TYPES:Record<string,{kind:"flow"|"friction";factor:number}>={
 conjunction:{kind:"flow",factor:1},semisextile:{kind:"flow",factor:0.5},
 sextile:{kind:"flow",factor:0.5},trine:{kind:"flow",factor:1},
 semisquare:{kind:"friction",factor:0.5},square:{kind:"friction",factor:1},
 quincunx:{kind:"friction",factor:0.5},opposition:{kind:"friction",factor:1}
};
const STARS:Record<string,number>={Sun:5,Moon:5,Mars:5,Jupiter:5,Saturn:5,Pluto:5,Mercury:4,Neptune:4,Venus:3,Uranus:3};
type Contact={transit:string;natal:string;aspect:string;orb:number;kind:"flow"|"friction";weight:number};
function contactsFor(chart:ChartResult):Contact[]{
 const contacts:Contact[]=[];
 for(const t of chart.transits){
  for(const c of [...(t.natalContacts||[]),...(t.minorNatalContacts||[])]){
   const rule=TYPES[c.aspect];
   if(!rule||c.orb>5)continue;
   contacts.push({transit:t.name,natal:c.natalName,aspect:c.aspect,orb:c.orb,kind:rule.kind,
    weight:rule.factor*Math.max(1,5-Math.floor(c.orb))*(STARS[t.name]??3)*(STARS[c.natalName]??3)});
  }
 }
 return contacts.sort((a,b)=>b.weight-a.weight);
}
export function TransitWeatherTimeline({chart,onAskMasterInterpreter,className=""}:Props){
 const [selected,setSelected]=useState(0);
 const [cache,setCache]=useState<Record<string,ChartResult>>({});
 const mutation=trpc.hybrid.calculate.useMutation();
 const days=useMemo(()=>{
  const today=new Date();today.setHours(12,0,0,0);
  return Array.from({length:39},(_,i)=>{
   const d=new Date(today);d.setDate(today.getDate()+i);
   return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  });
 },[]);
 const day=days[selected];
 const key=chart ? [chart.input.location,chart.input.date,chart.input.time,chart.input.transitLocation,day].join("|") : "";
 const cached=cache[key];
 useEffect(()=>{setSelected(0);setCache({});},[chart?.input.date,chart?.input.time,chart?.input.location,chart?.input.transitLocation]);
 useEffect(()=>{
  if(!chart||!key||cached)return;
  let active=true;
  const input=chart.input;
  mutation.mutateAsync({
   location:input.location,latitude:input.latitude,longitude:input.longitude,timezone:input.timezone,
   date:input.date,time:input.time,worldview:"agent",readingScope:"combined",
   transitLocation:input.transitLocation??input.location,
   transitLatitude:input.transitLatitude??input.latitude,
   transitLongitude:input.transitLongitude??input.longitude,
   transitTimezone:input.transitTimezone??input.timezone,
   transitDate:day,transitTime:"12:00",birthTimeKnown:input.birthTimeKnown,
  }).then(result=>{if(active)setCache(old=>({...old,[key]:result}));}).catch(()=>{});
  return ()=>{active=false;};
 },[chart,key,day,cached]);
 const contacts=cached?contactsFor(cached):[];
 const flow=contacts.filter(c=>c.kind==="flow").reduce((a,c)=>a+c.weight,0);
 const friction=contacts.filter(c=>c.kind==="friction").reduce((a,c)=>a+c.weight,0);
 const total=flow+friction;
 return <section className={`space-y-4 ${className}`} aria-label="39-day calculated transit weather">
  <div className="flex flex-wrap items-center justify-between gap-2">
   <div><h2 className="font-serif text-xl text-amber-200">39-Day Transit Weather</h2>
    <p className="text-xs text-slate-400">Select a day for a real ephemeris calculation at 12:00 local transit time. No recycled forecasts.</p></div>
   <Link href="/transit-sky" className="rounded-lg border border-cyan-300/40 px-3 py-2 text-xs text-cyan-200">Independent transit chart</Link>
  </div>
  <div className="flex gap-2 overflow-x-auto pb-3 snap-x">
   {days.map((d,i)=><button key={d} type="button" onClick={()=>setSelected(i)}
    aria-pressed={selected===i}
    className={`min-w-[78px] shrink-0 snap-start rounded-xl border px-3 py-3 text-center text-xs ${selected===i?"border-amber-300 bg-amber-300/15 text-amber-100":"border-white/10 bg-slate-900 text-slate-300"}`}>
    <span className="block">{new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"})}</span>
    <strong className="block text-lg">{Number(d.slice(-2))}</strong>
    <span>{d.slice(5,7)}/{d.slice(2,4)}</span>
   </button>)}
  </div>
  {!chart?<p className="rounded-xl border border-white/10 p-4 text-sm">Load your natal chart to calculate your transit weather.</p>:
   <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
    <p className="font-semibold text-white">{day} · Personal transit contacts</p>
    {!cached ? <p role="status" className="text-sm text-slate-300">{mutation.isPending?"Calculating planetary positions…":mutation.error?"Calculation unavailable: "+mutation.error.message:"Preparing this day's calculation…"}</p>:
    <>
     <p className="text-sm text-slate-200">{contacts.length===0?"No natal-transit contacts within the configured 5° orb at this moment.":`Weighted harmony ${Math.round(100*flow/total)}% · Friction ${Math.round(100*friction/total)}% · ${contacts.length} contacts`}</p>
     <div className="space-y-2">{contacts.slice(0,12).map((c,i)=><div key={i} className="flex flex-wrap justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
      <span>{c.transit} {c.aspect} natal {c.natal}</span>
      <span className={c.kind==="flow"?"text-emerald-300":"text-amber-300"}>{c.orb.toFixed(2)}° · {c.kind} · weight {c.weight.toFixed(1)}</span>
     </div>)}</div>
     {onAskMasterInterpreter&&<button className="rounded-lg border border-amber-300/40 px-3 py-2 text-sm text-amber-200" onClick={()=>onAskMasterInterpreter(`Interpret these verified transit contacts for ${day}: ${contacts.slice(0,12).map(c=>`${c.transit} ${c.aspect} ${c.natal} orb ${c.orb.toFixed(2)}°`).join("; ")}`)}>Interpret this day</button>}
    </>}
   </div>}
  <p className="text-xs text-slate-500">This is a symbolic aspect-balance view, not a probability or guarantee. Days are calculated when selected; no invented future positions or fabricated ingress dates.</p>
 </section>;
}
