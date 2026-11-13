import { useMemo, useState } from "react";
import { Compass, Eye, Layers3, Orbit, Sparkles, Star, ChevronDown, BookOpen } from "lucide-react";
import type { ChartResult, ChartRow } from "../../../server/astronomy";
import { FIXED_STARS, formatLongitude, normalizeLongitude } from "../../../shared/hybrid";
import "./ChartObservatory2050.css";

type Frame = "god" | "agent";
type Layer = "nakshatra" | "manzil" | "decan" | "stars";
const symbols:Record<string,string> = {Sun:"☉",Moon:"☽",Mercury:"☿",Venus:"♀",Mars:"♂",Jupiter:"♃",Saturn:"♄",Uranus:"♅",Neptune:"♆",Pluto:"♇"};
const signs=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const point=(lon:number,r:number)=>{const a=(lon-90)*Math.PI/180;return {x:240+Math.cos(a)*r,y:240+Math.sin(a)*r}};
function activeName(chart:ChartResult,frame:Frame,row:ChartRow):string{
 const house=frame==="god"?row.godHouse??Math.floor(normalizeLongitude(row.longitude)/30)+1:row.agentHouse;
 return house ? `House ${house}` : "Not available for this chart";
}
function starDistance(a:number,b:number){const diff=Math.abs(normalizeLongitude(a)-normalizeLongitude(b));return Math.min(diff,360-diff)}
export function ChartObservatory2050({chart}:{chart:ChartResult}){
 const [frame,setFrame]=useState<Frame>(chart.worldview==="god"?"god":chart.agentViewAvailable?"agent":"god");
 const [layer,setLayer]=useState<Layer>("nakshatra");
 const [selected,setSelected]=useState("Sun");
 const selectedRow=chart.movingBodies.find(row=>row.name===selected)??chart.movingBodies[0];
 const canAgent=chart.agentViewAvailable;
 const rows=chart.movingBodies.filter(row=>Number.isFinite(row.longitude));
 const selectedStar=useMemo(()=>selectedRow?FIXED_STARS.map(([name,lon])=>({name,lon,separation:starDistance(selectedRow.longitude,lon)})).sort((a,b)=>a.separation-b.separation)[0]:undefined,[selectedRow]);
 const frames=[{value:"god" as const,label:"God View",meaning:"The permanent celestial sector grid",icon:Eye},{value:"agent" as const,label:"Agent View",meaning:"The local Ascendant and equal houses",icon:Compass}];
 const ringCount=layer==="nakshatra"?27:layer==="manzil"?28:layer==="decan"?36:12;
 const sector=selectedRow?layer==="nakshatra"?Math.floor(normalizeLongitude(selectedRow.longitude)/(360/27)):layer==="manzil"?Math.floor(normalizeLongitude(selectedRow.longitude)/(360/28)):layer==="decan"?Math.floor(normalizeLongitude(selectedRow.longitude)/10):Math.floor(normalizeLongitude(selectedRow.longitude)/30):0;
 const overlayText=selectedRow?layer==="nakshatra"?`${selectedRow.overlay.nakshatra} · Pada ${selectedRow.overlay.pada}`:layer==="manzil"?selectedRow.overlay.manzil:layer==="decan"?selectedRow.overlay.decan:selectedStar?`${selectedStar.name} · ${selectedStar.separation.toFixed(2)}° separation`:"No star catalog contact":"";
 const frameDesc=frame==="god"?"Fixed Aries-zero collective houses. The frozen stellar archive and territory lines never drift.":"Observer-centered 30° equal houses, beginning from the chart's local Ascendant. Tropical planetary longitudes are unchanged.";
 return <section className="cg2050" aria-labelledby="cg2050-title">
   <div className="cg2050-header"><div><p className="cg2050-eyebrow"><Orbit size={15}/> CELESTIAL OBSERVATORY · LIVE CHART EVIDENCE</p><h2 id="cg2050-title">The heavens, <em>made legible.</em></h2><p>Explore your actual chart placements, the permanent stellar field, and the two reference frames. This display reads the existing calculation—it never changes it.</p></div><span className="cg2050-trust"><i/> CALCULATED CHART · {chart.movingBodies.length} MOVING BODIES</span></div>
   <div className="cg2050-body">
     <div className="cg2050-visual">
       <div className="cg2050-toolbar" role="group" aria-label="Select celestial frame">{frames.map(({value,label,icon:Icon})=><button key={value} type="button" disabled={value==="agent"&&!canAgent} aria-pressed={frame===value} onClick={()=>setFrame(value)} className={frame===value?"cg2050-selected":""}><Icon size={16}/>{label}</button>)}</div>
       <div className="cg2050-wheel">
         <svg viewBox="0 0 480 480" role="img" aria-label={`Fixed stellar wheel with ${rows.length} calculated planet positions, showing ${layer} sectors`}>
           <defs><radialGradient id="cg2050-core"><stop stopColor="#243552" offset="0"/><stop stopColor="#0b1427" offset=".78"/><stop stopColor="#070e1d" offset="1"/></radialGradient><filter id="cg2050-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
           <circle cx="240" cy="240" r="219" fill="url(#cg2050-core)" stroke="#cbaa78" strokeOpacity=".56" strokeWidth="1.6"/>
           <circle cx="240" cy="240" r="205" fill="none" stroke="#a8c7e8" strokeOpacity=".22"/>
           <circle cx="240" cy="240" r="175" fill="none" stroke="#8dddee" strokeOpacity=".20"/>
           <circle cx="240" cy="240" r="137" fill="none" stroke="#af9aea" strokeOpacity=".24"/>
           {Array.from({length:ringCount},(_,i)=>{const at=i*360/ringCount;const a=point(at,175),z=point(at,219);return <line key={i} x1={a.x} y1={a.y} x2={z.x} y2={z.y} stroke={i===sector?"#e9c994":"#89acc9"} strokeOpacity={i===sector?".9":".29"} strokeWidth={i===sector?2:1}/>})}
           {Array.from({length:12},(_,i)=>{const start=normalizeLongitude((frame==="god"?0:chart.ascendant?.longitude??0)+i*30);const a=point(start,115),b=point(start,136),label=point(start+15,124);return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={frame==="god"?"#e5c694":"#93d9ed"} strokeOpacity=".65"/><text x={label.x} y={label.y} fill={frame==="god"?"#e5c694":"#93d9ed"} opacity=".92" fontSize="8.5" textAnchor="middle" dominantBaseline="middle">{i+1}</text></g>})}
           {signs.map((glyph,i)=>{const q=point(i*30+15,193);return <text key={glyph} x={q.x} y={q.y} fill="#e2d2bd" opacity=".88" fontSize="15" textAnchor="middle" dominantBaseline="middle">{glyph}</text>})}
           {FIXED_STARS.map(([name,lon])=>{const q=point(lon,213);return <g key={name}><circle cx={q.x} cy={q.y} r={layer==="stars"?3.7:2.2} fill="#f4dcab" opacity={layer==="stars"?1:.48}/><title>{name}: permanent archive {formatLongitude(lon)}</title></g>})}
           {rows.map(row=>{const q=point(row.longitude,155);const active=selectedRow?.name===row.name;return <g key={row.name} onClick={()=>setSelected(row.name)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(row.name)}}} aria-label={`Inspect ${row.name}, ${row.display}`} style={{cursor:"pointer"}}><circle cx={q.x} cy={q.y} r={active?12:9} fill={active?"#e8d0a5":"#88c8ed"} opacity={active?".2":".11"}/><circle cx={q.x} cy={q.y} r={active?6:4} fill={active?"#f6dfac":"#a6d6f2"} filter={active?"url(#cg2050-glow)":undefined}/><title>{row.name}: {row.display}</title></g>})}
           <circle cx="240" cy="240" r="116" fill="none" stroke="#d5c1a1" strokeOpacity=".12" strokeDasharray="2 8"/>
           <text x="240" y="219" textAnchor="middle" fontSize="13" fill="#c3ad83" fontFamily="Georgia,serif" letterSpacing="3">FIRMAMENT</text>
           <text x="240" y="247" textAnchor="middle" fontSize="21" fill="#f1eee9" fontFamily="Georgia,serif">{frame==="god"?"GOD VIEW":"AGENT VIEW"}</text>
           <text x="240" y="268" textAnchor="middle" fontSize="10" fill="#92a8c1">{frame==="god"?"PERMANENT FRAME":"LOCAL EQUAL HOUSES"}</text>
         </svg>
       </div>
       <div className="cg2050-frame-caption"><span><Eye size={13}/> FIXED STARS NEVER MOVE</span><span><Orbit size={13}/> TROPICAL PLANETS MOVE</span></div>
       <p className="cg2050-help">{frameDesc}</p>
     </div>
     <div className="cg2050-panel">
       <div className="cg2050-panel-kicker"><Sparkles size={16}/> INSPECT THE EVIDENCE</div>
       <h3>Choose a planet</h3>
       <div className="cg2050-planets" role="group" aria-label="Planet selection">{rows.map(row=><button key={row.name} type="button" aria-pressed={selectedRow?.name===row.name} onClick={()=>setSelected(row.name)} className={selectedRow?.name===row.name?"cg2050-planet-active":""}><span>{symbols[row.name]??"✦"}</span>{row.name}</button>)}</div>
       {selectedRow&&<div className="cg2050-focus"><div className="cg2050-focus-title"><div><span>CURRENT FOCUS</span><h4>{selectedRow.name}</h4></div><div><strong>{selectedRow.display}</strong><small>{activeName(chart,frame,selectedRow)}</small></div></div><p>This planet is at {selectedRow.display}. The same longitude is read through {frame==="god"?"the fixed collective 30° houses":"the observer's local equal houses"}.</p></div>}
       <div className="cg2050-overlay-title"><Layers3 size={17}/><div><strong>Permanent stellar territories</strong><span>Toggle a knowledge layer · 0° Aries anchored</span></div></div>
       <div className="cg2050-overlays" role="group" aria-label="Fixed celestial overlay">{([{key:"nakshatra" as const,name:"27 Nakshatras"},{key:"manzil" as const,name:"28 Manzils"},{key:"decan" as const,name:"36 Decans"},{key:"stars" as const,name:"Fixed Stars"}]).map(item=><button key={item.key} type="button" aria-pressed={layer===item.key} className={layer===item.key?"cg2050-layer-active":""} onClick={()=>setLayer(item.key)}>{item.name}</button>)}</div>
       <div className="cg2050-overlay-result"><span>SELECTED FIXED-BACKGROUND CORRESPONDENCE</span><strong>{overlayText||"Select a planet"}</strong><small>{layer==="stars"?"Nearest archived star by angular separation—not automatically a conjunction.":`Permanent ${ringCount}-sector equal-division system. Selected segment ${sector+1} of ${ringCount}.`}</small></div>
       <details className="cg2050-deep"><summary><BookOpen size={16}/> How do the two frames become one reading? <ChevronDown size={15}/></summary><p>God View and Agent View are calculated separately. The Master Interpreter weaves their house relationships, planetary testimony, and fixed-territory correspondences together—while explaining conflicts and uncertainty. The actual synthesis appears below in the reading.</p></details>
     </div>
   </div>
   <p className="cg2050-disclaimer"><Star size={13}/> Diagram positions are driven by the current calculated chart. The fixed stars and 27/28/36 boundaries are model reference coordinates; no precession drift is applied.</p>
 </section>
}
