import { useState } from "react";
import { Link } from "wouter";
import { Compass, Eye, MoonStar, Orbit, Sparkles, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { ZODIAC_SIGNS, formatLongitude } from "../../../shared/hybrid";
import { SIGN_RULERS, SIGN_SYMBOLS, type ZodiacSign } from "../../../shared/zodiacSigns";
import "./ZodiacHoraryPage.css";

function todayUtc() {
  const now = new Date();
  return { date: now.toISOString().slice(0, 10), time: "12:00" };
}

export default function ZodiacHoraryPage() {
  const [sign, setSign] = useState<ZodiacSign>("Aries");
  const [when, setWhen] = useState(todayUtc);
  const [question, setQuestion] = useState("");
  const [tab, setTab] = useState<"human" | "agent" | "god" | "evidence">("human");
  const reading = trpc.zodiacHorary.read.useMutation();
  const selected = reading.data?.evidence;
  const run = () => {
    reading.reset();
    setTab("human");
    reading.mutate({ sign, ...when, ...(question.trim() ? { question: question.trim() } : {}) });
  };

  return <main className="zh2050 min-h-screen px-4 py-8 text-slate-100 sm:px-7 md:py-12">
    <div className="mx-auto max-w-7xl">
      <Link href="/horary" className="zh2050-back"><ArrowLeft size={16}/> Traditional Horary</Link>
      <header className="zh2050-hero">
        <p className="zh2050-kicker"><Orbit size={17}/> FIRMAMENT GUARDIAN · THE TWELVE CELESTIAL GATES</p>
        <h1>One heaven. <em>Twelve personal lenses.</em></h1>
        <p>A second, dedicated zodiac-reading engine. Choose your sign and its traditional ruling planet becomes the exact <strong>Agent House 1 anchor</strong>. God's permanent zodiac framework remains unchanged.</p>
        <div className="zh2050-distinction"><ShieldCheck size={19}/><span>This is a symbolic sign-wide celestial reading, not your birth Ascendant and not a traditional question-time Horary verdict. All moving positions come from the same Firmament ephemeris.</span></div>
      </header>

      <section className="zh2050-panel" aria-label="Sign reading configuration">
        <div className="zh2050-panel-title"><span>01 / CHOOSE YOUR CELESTIAL GATE</span><strong>{sign} · Ruler {SIGN_RULERS[sign]}</strong></div>
        <div className="zh2050-signs">
          {ZODIAC_SIGNS.map((item, index) => <button key={item} type="button" aria-pressed={sign === item}
            onClick={() => { setSign(item); reading.reset(); }} className={sign === item ? "selected" : ""}>
            <span aria-hidden="true">{SIGN_SYMBOLS[index]}</span><strong>{item}</strong><small>{SIGN_RULERS[item]}</small>
          </button>)}
        </div>
        <div className="zh2050-inputs">
          <label>UTC date<input type="date" value={when.date} onChange={event => { setWhen(prev => ({ ...prev, date: event.target.value })); reading.reset(); }}/></label>
          <label>UTC snapshot time<input type="time" value={when.time} onChange={event => { setWhen(prev => ({ ...prev, time: event.target.value })); reading.reset(); }}/></label>
          <label className="zh2050-question">Your question (optional)<textarea maxLength={700} rows={2} value={question} onChange={event => { setQuestion(event.target.value); reading.reset(); }} placeholder="What should this sign understand about work, relationships, direction, or change?"/></label>
        </div>
        <p className="zh2050-help">The time is explicitly UTC because this ruler-anchored method has no observer location. It deliberately does not invent a local Ascendant.</p>
        <button className="zh2050-submit" type="button" disabled={reading.isPending || !when.date || !when.time} onClick={run}>
          {reading.isPending ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
          {reading.isPending ? "Examining the sky…" : `Read ${sign}'s celestial conditions`}
        </button>
        {reading.isError && <p role="alert" className="zh2050-error">The sky could not be calculated: {reading.error.message}. Please check your date and try again.</p>}
      </section>

      {selected && <section className="zh2050-results" aria-label="Calculated zodiac sign reading">
        <div className="zh2050-result-head"><div><p className="zh2050-kicker"><MoonStar size={16}/> {selected.sign.toUpperCase()} · TWO FRAMES, ONE SKY</p><h2>{selected.symbol} {selected.sign} under the heavens</h2><p>{selected.utc} · Traditional ruler {selected.ruler} · {selected.anchorDisplay}</p></div>
        <span className="zh2050-badge">{reading.data?.generatedBy === "master-interpreter" ? "MASTER INTERPRETER" : "CALCULATED EVIDENCE READING"}</span></div>
        <div className="mb-5 rounded-xl border border-amber-200/25 bg-amber-100/[0.07] p-4 text-sm leading-7 text-slate-200"><strong className="text-amber-100">Distinct {selected.sign} territory · {selected.signTerritory.from}°–{selected.signTerritory.to}°:</strong> {selected.signTerritory.themes}. Moving planets in this zodiac sign: <span className="text-cyan-200">{selected.signTerritory.planets.join(", ") || "none"}</span>. Signs sharing the same ruler retain their own zodiac territory even though their ruler-centered Agent grids coincide.</div>
        <div className="zh2050-frame-cards">
          <div><p><Compass size={17}/> AGENT VIEW — YOUR SIGN</p><h3>House 1: {selected.ruler}</h3><strong>{selected.anchorDisplay}</strong><small>Ruler's exact moving longitude · 30° equal houses</small></div>
          <div><p><Eye size={17}/> GOD VIEW — PERMANENT SKY</p><h3>House 1: 0° Aries</h3><strong>Unmoved for every sign</strong><small>The same fixed sectors, regardless of the chosen ruler</small></div>
        </div>
        <div className="zh2050-tabs" role="group" aria-label="Reading sections">
          {([{id:"human",label:"Your reading"},{id:"agent",label:"Agent territory"},{id:"god",label:"God View"},{id:"evidence",label:"Complete evidence"}] as const).map(x=><button key={x.id} aria-pressed={tab===x.id} className={tab===x.id?"active":""} type="button" onClick={()=>setTab(x.id)}>{x.label}</button>)}
        </div>
        {tab === "human" && <article className="zh2050-reading"><Streamdown>{reading.data!.reading}</Streamdown></article>}
        {(tab === "agent" || tab === "god") && (() => {
          const frame = tab === "agent" ? selected.agent : selected.god;
          const houses = tab === "agent" ? selected.agentHouses : selected.godHouses;
          return <div className="zh2050-panel space-y-6">
            <h3 className="text-2xl font-serif text-amber-100">{tab === "agent" ? "Ruler-centered, moving house territory" : "Permanent 0° Aries house territory"}</h3>
            <p className="text-sm leading-7 text-slate-300">Flow and friction include every calculated major contact within 5°. Each participating planet contributes one contact to its occupied house; totals are symbolic, not measured success probabilities.</p>
            <div className="zh2050-summary"><div><strong>1 · 2 · 3 · 6 · 10 · 11</strong><span>Flow {frame.asc.flow} / Friction {frame.asc.friction}</span><small>{frame.asc.occupied.join(" · ") || "No moving planets"}</small></div><div><strong>4 · 5 · 7 · 8 · 9 · 12</strong><span>Flow {frame.dsc.flow} / Friction {frame.dsc.friction}</span><small>{frame.dsc.occupied.join(" · ") || "No moving planets"}</small></div></div>
            <div className="zh2050-houses">{houses.map((cusp,i)=><div key={i}><span>HOUSE {i+1}</span><strong>{formatLongitude(cusp)}</strong><small>{selected.placements.filter(x=>tab==="agent"?x.agentHouse===i+1:x.godHouse===i+1).map(x=>x.name).join(", ")||"—"}</small></div>)}</div>
          </div>;
        })()}
        {tab === "evidence" && <div className="zh2050-panel">
          <h3 className="font-serif text-2xl text-amber-100">Calculated proof ledger</h3>
          <p className="my-4 text-sm text-slate-300">Original planetary coordinates, God and Agent house assignments, lunar divisions, fixed-star contacts, all aspects and both territory totals. View both frames without recasting the sky.</p>
          <pre className="zh2050-evidence">{selected.evidenceText}</pre>
        </div>}
      </section>}
      <footer className="zh2050-footer"><Link href="/horary">Open traditional question-time Horary →</Link><span>Two engines remain separate. One consistent ephemeris.</span></footer>
    </div>
  </main>;
}
