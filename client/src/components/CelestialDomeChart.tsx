import { useMemo, useState } from "react";
import type { ChartResult } from "../../../server/astronomy";
import { normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";

/** Chart-grounded hemispherical dome projection.
 * Longitude determines compass-like position around the projected dome.
 * Elevation is schematic because ChartResult does not yet supply physical altitude/azimuth.
 * Never imply this is an astronomical alt-az sky map.
 */
const symbols: Record<string,string> = {Sun:"☉",Moon:"☽",Mercury:"☿",Venus:"♀",Mars:"♂",Jupiter:"♃",Saturn:"♄",Uranus:"♅",Neptune:"♆",Pluto:"♇","North Node":"☊","South Node":"☋"};
const position=(longitude:number,ring:number,rotation:number)=>{
 const a=(normalizeLongitude(longitude-rotation)-90)*Math.PI/180;
 return {x:300+Math.cos(a)*ring,y:282+Math.sin(a)*ring*.45};
};
export function CelestialDomeChart({chart}:{chart:ChartResult}){
 const [layer,setLayer]=useState<"natal"|"transit">("natal");
 const [rotate,setRotate]=useState(0);
 const [selected,setSelected]=useState<string|null>(null);
 const bodies=useMemo(()=>layer==="transit"?chart.transits:chart.movingBodies,[chart,layer]);
 const nodes=layer==="natal"?[chart.northNode,chart.southNode]:[];
 const entries=[...bodies,...nodes];
 const frameworkPosition=(name:string,longitude:number,ring:number)=>{
   const projected=entries.find(body => body.name === name)?.xyz;
   if(!projected || !Number.isFinite(projected.x) || !Number.isFinite(projected.y)) return position(longitude,ring,rotate);
   const angle=(Math.atan2(projected.y,projected.x)-rotate*Math.PI/180);
   const distance=Math.min(210,Math.max(28,Math.hypot(projected.x,projected.y)*2.7));
   return {x:300+Math.cos(angle)*distance,y:282+Math.sin(angle)*distance*.45};
 };
 const chosen=entries.find(row=>row.name===selected);
 return <section aria-label="Three-dimensional divine dome chart" className="rounded-3xl border border-cyan-300/25 bg-gradient-to-b from-[#0a1533] via-[#080e22] to-black p-4 text-slate-100 shadow-2xl sm:p-6">
   <div className="flex flex-wrap items-start justify-between gap-3">
     <div><div className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Divine Atlas · Dome instrument</div><h2 className="mt-1 font-serif text-2xl">The Firmament Dome</h2><p className="mt-1 max-w-xl text-sm text-slate-400">A hemispherical projection of the calculated zodiac and planetary longitudes, with a curved canopy, concentric sky bands, and selectable bodies.</p></div>
     <div className="flex gap-2">{(["natal","transit"] as const).map(v=><button key={v} type="button" aria-pressed={layer===v} onClick={()=>{setLayer(v);setSelected(null)}} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${layer===v?"border-cyan-300 bg-cyan-300/20 text-cyan-100":"border-white/15 bg-white/5 text-slate-300"}`}>{v==="natal"?"Natal sky":"Transit sky"}</button>)}</div>
   </div>
   <svg viewBox="0 0 600 475" role="img" aria-label="Perspective hemisphere dome with actual zodiacal longitudes and planet markers" className="mt-4 w-full max-h-[580px]">
     <defs><radialGradient id="domeSky" cx="50%" cy="90%" r="95%"><stop offset="0" stopColor="#155e75" stopOpacity=".35"/><stop offset=".55" stopColor="#19245d" stopOpacity=".6"/><stop offset="1" stopColor="#05091d"/></radialGradient><linearGradient id="domeRim"><stop offset="0" stopColor="#16e0ee"/><stop offset=".5" stopColor="#d7bbff"/><stop offset="1" stopColor="#16e0ee"/></linearGradient></defs>
     <path d="M45 283 A255 255 0 0 1 555 283 L555 283 A255 110 0 0 1 45 283 Z" fill="url(#domeSky)" stroke="#88ddff" strokeWidth="1.4"/>
     {Array.from({length:5},(_,i)=>{const y=282-(i+1)*43;const half=Math.sqrt(Math.max(0,255*255-(y-282)*(y-282)));return <g key={i}><path d={`M${300-half} ${y} Q300 ${y+50+i*3} ${300+half} ${y}`} fill="none" stroke="#6e9bc2" strokeOpacity=".4"/><path d={`M${300-half} ${y} Q300 ${y-16} ${300+half} ${y}`} fill="none" stroke="#6e9bc2" strokeOpacity=".27"/></g>})}
     {Array.from({length:12},(_,i)=>{const angle=(i*30-90)*Math.PI/180;const endX=300+255*Math.cos(angle),endY=282+110*Math.sin(angle);return <path key={i} d={`M300 28 Q${300+(endX-300)*.64} ${140+(endY-282)*.1} ${endX} ${endY}`} fill="none" stroke="#71d8f5" strokeOpacity=".18"/>})}
     <ellipse cx="300" cy="282" rx="255" ry="110" fill="none" stroke="url(#domeRim)" strokeWidth="3"/>
     <ellipse cx="300" cy="282" rx="210" ry="90" fill="none" stroke="#8bd3f5" strokeDasharray="3 7" strokeOpacity=".5"/>
     <ellipse cx="300" cy="282" rx="138" ry="58" fill="none" stroke="#c3a2ff" strokeOpacity=".4"/>
     <text x="300" y="26" textAnchor="middle" fill="#ecf4ff" fontSize="12" letterSpacing="3">ZENITH</text>
     {ZODIAC_SIGNS.map((name,i)=>{const p=position(i*30+15,238,rotate);return <g key={name}><circle cx={p.x} cy={p.y} r="15" fill="#0b1530" stroke="#40cdec" strokeOpacity=".7"/><text x={p.x} y={p.y+4} textAnchor="middle" fill="#d5edff" fontSize="10">{name.slice(0,3)}</text></g>})}
     {entries.filter(row=>Number.isFinite(row.longitude)).map((row,i)=>{const p=frameworkPosition(row.name,row.longitude,185-(i%3)*28);return <g key={row.name} onClick={()=>setSelected(row.name)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")setSelected(row.name)}} aria-label={`${row.name}: ${row.display}`} style={{cursor:"pointer"}}><circle cx={p.x} cy={p.y} r={selected===row.name?15:12} fill="#101a40" stroke={selected===row.name?"#f3e8ff":"#55e6ff"} strokeWidth={selected===row.name?2.7:1.4}/><text x={p.x} y={p.y+5} textAnchor="middle" fontSize="18" fill="#f8f3ff">{symbols[row.name]??"✦"}</text></g>})}
     <text x="300" y="440" textAnchor="middle" fill="#b3c7e4" fontSize="12">360° ZODIAC LONGITUDE · PERSPECTIVE DOME</text>
   </svg>
   <label className="mt-2 flex flex-col gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Rotate longitude reference · {rotate}°
     <input aria-label="Rotate dome longitude reference" type="range" min="0" max="359" step="1" value={rotate} onChange={e=>setRotate(Number(e.target.value))} className="w-full accent-cyan-300"/>
   </label>
   <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200" aria-live="polite">{chosen?<><strong>{chosen.name}</strong> · {chosen.display} · House {chosen.house} · {chosen.longitude.toFixed(4)}° longitude</>:<>Select any divine body to inspect its calculated position.</>}</div>
   <p className="mt-2 text-xs text-slate-400">Lots of Fortune and Spirit are shown only when calculated by the Master Chart; this dome does not invent their positions.</p>
   <p className="mt-3 text-xs leading-5 text-amber-100/80">Projection note: The planetary longitudes are taken from the chart; the dome elevation is illustrative. Physical horizon/zenith positions require calculated local altitude and azimuth, which are not yet part of this chart data. This is not a claim about the physical shape of Earth.</p>
 </section>;
}
