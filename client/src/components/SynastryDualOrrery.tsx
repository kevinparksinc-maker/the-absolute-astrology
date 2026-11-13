import type { ChartResult } from "../../../server/astronomy";
import { formatLongitude, normalizeLongitude } from "../../../shared/hybrid";
import "./SynastryDualOrrery.css";

const SIGNS=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const GLYPHS:Record<string,string>={Sun:"☉",Moon:"☽",Mercury:"☿",Venus:"♀",Mars:"♂",Jupiter:"♃",Saturn:"♄",Uranus:"♅",Neptune:"♆",Pluto:"♇"};
const xy=(longitude:number,r:number)=>{const angle=(normalizeLongitude(longitude)-90)*Math.PI/180;return {x:170+Math.cos(angle)*r,y:170+Math.sin(angle)*r}};
function Wheel({chart,name}:{chart:ChartResult;name:string}){
 return <article className="fg-duo-wheel">
   <div className="fg-duo-caption"><span>PERSONAL NATAL CELESTIAL FRAME</span><h3>{name}</h3><small>{chart.input.date} · {chart.input.location||"Unspecified place"}</small></div>
   <svg viewBox="0 0 340 340" role="img" aria-label={name+" natal chart wheel, using calculated planetary longitudes"} className="fg-duo-svg">
     <defs><radialGradient id={"fg-duo-core-"+name.replace(/[^a-z]/gi,"")}><stop stopColor="#ebd19d" stopOpacity=".42"/><stop offset="1" stopColor="#0c1935" stopOpacity=".02"/></radialGradient></defs>
     <circle cx="170" cy="170" r="157" fill="#091429" stroke="#e5c48a" strokeWidth="1.2"/>
     <circle cx="170" cy="170" r="133" fill="#10203c" stroke="#708cb2" strokeWidth=".5"/>
     <circle cx="170" cy="170" r="105" fill="none" stroke="#d2ab73" strokeWidth=".6"/>
     <circle cx="170" cy="170" r="70" fill="none" stroke="#93d7ea" strokeOpacity=".24"/>
     <circle cx="170" cy="170" r="42" fill={"url(#fg-duo-core-"+name.replace(/[^a-z]/gi,"")+")"} stroke="#dabd81" strokeOpacity=".45"/>
     {SIGNS.map((glyph,index)=>{const a=xy(index*30,135),t=xy(index*30+15,148);return <g key={glyph}><line x1={a.x} y1={a.y} x2={xy(index*30,157).x} y2={xy(index*30,157).y} stroke="#d8b876" strokeOpacity=".55"/><text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="#f0d296">{glyph}</text></g>})}
     {chart.ascendant&&<line x1={170} y1={170} x2={xy(chart.ascendant.longitude,126).x} y2={xy(chart.ascendant.longitude,126).y} stroke="#edc77b" strokeWidth="1.4" strokeDasharray="5 4"/>}
     {chart.movingBodies.map((row,index)=>{const angle=xy(row.longitude,92-(index%3)*11);return <g key={row.name}><circle cx={angle.x} cy={angle.y} r="12" fill="#122844" fillOpacity=".92" stroke="#5f83ae" strokeWidth=".7"/><text x={angle.x} y={angle.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="18" fill={["#f2d49b","#9fe3ee","#e2b2db","#bfc1f3"][index%4]}>{GLYPHS[row.name]||row.name.slice(0,1)}</text><title>{row.name+": "+formatLongitude(row.longitude)}</title></g>})}
     <circle cx="170" cy="170" r="10" fill="#e9ca8a" opacity=".9"/>
     <circle cx="170" cy="170" r="3" fill="#0c162a"/>
   </svg>
   <div className="fg-duo-foot"><span>{chart.ascendant?"Ascendant · "+formatLongitude(chart.ascendant.longitude):"Ascendant unavailable"}</span><span>Moving planets · Actual ephemeris</span></div>
 </article>;
}
export function SynastryDualOrrery({first,second,firstName="Person A",secondName="Person B"}:{first:ChartResult;second:ChartResult;firstName?:string;secondName?:string}){
 return <section className="fg-duo" aria-label="Two independently calculated natal chart wheels">
   <div className="fg-duo-intro"><span>DUAL NATAL OBSERVATORY · REAL CALCULATED POSITIONS</span><h3>Two celestial signatures.</h3><p>Every glyph is positioned using its corresponding chart's planetary longitude. The outer zodiac frame is shared; each birth chart retains its own local Ascendant.</p></div>
   <div className="fg-duo-grid"><Wheel chart={first} name={firstName}/><Wheel chart={second} name={secondName}/></div>
 </section>;
}
