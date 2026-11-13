import { useMemo, useState } from "react";
import { BookOpen, Compass, Eye, Layers3, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
import type { AstrologyEvidencePacket, EvidenceItem, EvidenceRelationship } from "../../../server/astrologyKnowledge/types";
import "./Interpreter2050.css";

type Lens = "human" | "relations" | "sources";
const categories: Array<{key:keyof AstrologyEvidencePacket;label:string}> = [
  {key:"westernEvidence",label:"Western"},
  {key:"vedicEvidence",label:"Vedic"},
  {key:"arabicEvidence",label:"Arabic"},
  {key:"lunarEvidence",label:"Lunar mansions"},
  {key:"fixedStarEvidence",label:"Fixed stars"},
  {key:"timingEvidence",label:"Timing"},
  {key:"patternEvidence",label:"Patterns"},
  {key:"canonEvidence",label:"Canon"},
  {key:"genesisAstroEvidence",label:"Genesis"},
  {key:"behavioralEvidence",label:"Behavioral"},
  {key:"lifeEventEvidence",label:"Life events"},
];
function relationTone(relation:string){return relation==="contradiction"||relation==="tension"?"tension":relation==="reinforcement"||relation==="amplification"?"support":"neutral"}
export function Interpreter2050({packet,hasReading,readingId="fg2050-human-reading"}:{packet?:AstrologyEvidencePacket;hasReading:boolean;readingId?:string}){
 const [lens,setLens]=useState<Lens>("human");
 const [tradition,setTradition]=useState<string>("all");
 const [selectedRelation,setSelectedRelation]=useState<string|null>(null);
 const evidence=useMemo(()=>packet?categories.flatMap(group=>(packet[group.key] as EvidenceItem[]).map(item=>({...item,group:group.label}))):[],[packet]);
 const shown=tradition==="all"?evidence:evidence.filter(e=>e.tradition===tradition);
 const relationships=packet?.relationships??[];
 const relation=relationships.find(item=>item.id===selectedRelation)??relationships[0];
 const evidenceById=useMemo(()=>new Map(evidence.map(item=>[item.id,item])),[evidence]);
 const lenses: Array<{id:Lens;step:string;title:string;description:string;icon:typeof Eye}> = [
   {id:"human",step:"01",title:"The human answer",description:"What the reading means in ordinary life",icon:Sparkles},
   {id:"relations",step:"02",title:"Celestial relationships",description:"Where the traditions meet, agree, or differ",icon:Compass},
   {id:"sources",step:"03",title:"Complete evidence",description:"What was calculated, inferred or unavailable",icon:BookOpen},
 ];
 return <section className="im2050" aria-label="Master Interpreter 2050 evidence navigator">
  <div className="im2050-heading"><div><p className="im2050-eyebrow"><Sparkles size={15}/> MASTER INTERPRETER · HUMAN UNDERSTANDING ENGINE</p><h3>Wisdom, <em>without the mystery of the method.</em></h3><p>Begin with the human meaning, then follow the reasoning to its actual celestial evidence. Every layer remains available.</p></div><span className="im2050-frame-tag"><Layers3 size={16}/> GOD VIEW + AGENT VIEW</span></div>
  <div className="im2050-tabs" role="tablist" aria-label="Interpretation depth">{lenses.map(({id,step,title,description,icon:Icon})=><button key={id} type="button" role="tab" aria-selected={lens===id} aria-controls={`im2050-panel-${id}`} id={`im2050-tab-${id}`} onClick={()=>setLens(id)} className={lens===id?"im2050-active":""}><span className="im2050-tab-icon"><Icon size={19}/></span><span className="im2050-tab-text"><small>{step} / EXPLORE</small><strong>{title}</strong><em>{description}</em></span></button>)}</div>
  {lens==="human"&&<div role="tabpanel" id="im2050-panel-human" aria-labelledby="im2050-tab-human" className="im2050-stage">
    <div className="im2050-label">BEGIN HERE · YOUR LIVED EXPERIENCE</div><h4>What does this mean for you?</h4><p>{hasReading?"Your full personalized reading appears below. Explore the explanation at your own pace, or choose another lens to inspect the evidence and relationships behind it.":"Your personal interpretation will appear after you begin the reading. The navigator will then reveal the actual chart evidence rather than a generic prediction."}</p>
    <div className="im2050-human-points"><div><strong>What is happening?</strong><span>Start with the main idea of the reading.</span></div><div><strong>Why does it matter?</strong><span>Connect the symbols to lived experience.</span></div><div><strong>Where is the proof?</strong><span>Open the computed evidence and sources.</span></div></div>
    {hasReading&&<a className="im2050-go" href={`#${readingId}`}>Read your complete interpretation <Sparkles size={15}/></a>}
  </div>}
  {lens==="relations"&&<div role="tabpanel" id="im2050-panel-relations" aria-labelledby="im2050-tab-relations" className="im2050-stage">
    <div className="im2050-label">SEPARATE TESTIMONIES · ONE INTERPRETATION</div><h4>Where the evidence meets</h4><p>Relationships come from the evidence packet, not from visual guesses. Contradictions remain visible rather than being forced into agreement.</p>
    {!packet?<div className="im2050-empty">Generate a reading to inspect its calculated cross-system relationships.</div>:<><div className="im2050-stats"><span><b>{packet.convergences.length}</b> convergences</span><span><b>{packet.contradictions.length}</b> contradictions</span><span><b>{packet.uncertainties.length}</b> uncertainties</span></div>{relationships.length?<div className="im2050-relation-layout"><div className="im2050-relation-list">{relationships.map(item=><button type="button" key={item.id} aria-pressed={relation?.id===item.id} onClick={()=>setSelectedRelation(item.id)} className={`im2050-relation-item ${relation?.id===item.id?"selected":""}`}><i className={relationTone(item.relation)}/><span><strong>{item.theme}</strong><small>{item.relation.replaceAll("-"," ")} · {item.traditions.join(" / ")}</small></span></button>)}</div>{relation&&<div className="im2050-relation-proof"><span className="im2050-label">{relation.relation.toUpperCase()}</span><h5>{relation.theme}</h5><p>{relation.explanation}</p><div className="im2050-proof-heading">Evidence referenced in this relationship</div>{relation.evidenceIds.map(id=>{const item=evidenceById.get(id);return <div key={id} className="im2050-proof-row"><strong>{item?.subject??id}</strong><span>{item?.statement??"Referenced evidence not present in this packet."}</span></div>})}</div>}</div>:<div className="im2050-empty">No relationship testimony was returned for this reading. We will not manufacture a convergence.</div>}</>}
  </div>}
  {lens==="sources"&&<div role="tabpanel" id="im2050-panel-sources" aria-labelledby="im2050-tab-sources" className="im2050-stage">
    <div className="im2050-label">TECHNICAL EVIDENCE · UNFILTERED PROVENANCE</div><h4>The knowledge behind the reading</h4><p>Calculated facts, traditional rules, references, uncertainty and incomplete methods are labeled separately. These records are the source material—not additional AI-written claims.</p>
    {!packet?<div className="im2050-empty">Generate a reading to explore individual evidence records and their provenance.</div>:<>
      <div className="im2050-source-toolbar"><span><ShieldCheck size={15}/> {evidence.length} source-backed evidence records</span><label>Tradition <select value={tradition} onChange={e=>setTradition(e.target.value)}><option value="all">All traditions</option><option value="western">Western</option><option value="vedic">Vedic</option><option value="arabic">Arabic</option><option value="firmament">Firmament</option></select></label></div>
      <div className="im2050-records">{shown.length?shown.map(item=><details key={item.id} className="im2050-record"><summary><span className="im2050-record-primary"><strong>{item.subject}</strong><small>{item.group} · {item.technique}</small></span><span className="im2050-record-category">{item.category.replaceAll("-"," ")}</span></summary><p>{item.statement}</p><div className="im2050-record-trace"><span>Source: {item.sourceTrace?.sourceTitle??item.sourceId}</span><span>Confidence: {item.sourceTrace?.confidence??"not marked"}</span><span>Tradition: {item.tradition}</span></div>{item.sourceTrace?.sourceUrl&&<a href={item.sourceTrace.sourceUrl} target="_blank" rel="noopener noreferrer">View reference ↗</a>}</details>):<p className="im2050-empty">No evidence matches the chosen tradition.</p>}</div>
      {!!packet.incomplete.length&&<details className="im2050-incomplete"><summary><AlertTriangle size={16}/> {packet.incomplete.length} incomplete or unavailable capabilities — see limitations</summary>{packet.incomplete.map((message,i)=><p key={i}>{message}</p>)}</details>}
    </>}
  </div>}
  <div className="im2050-footer"><Eye size={14}/> Calculations are not changed by these presentation lenses. Symbolic interpretations are not scientific forecasts or guarantees.</div>
 </section>;
}
