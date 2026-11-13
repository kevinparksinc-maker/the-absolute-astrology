import { FocusedPlacementReading } from "./FocusedPlacementReading";
import { useMemo, useState } from "react";
import { Activity, ArrowRight, Clock3, RefreshCw, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";
import { calculateEnergyRead } from "@/lib/energyScoring";
import { calculatePlanetaryHours } from "../lib/planetaryHours";
import type { ChartResult, TransitContact, MinorTransitContact } from "../../../server/astronomy";
import { HarmonicFlowTimeline } from "./HarmonicFlowTimeline";
import { TransitLocationBar } from "./TransitLocationBar";

const aspectFlow: Record<TransitContact["aspect"] | MinorTransitContact["aspect"], number> = {
  trine: 1, sextile: 1, square: -1, opposition: -1, conjunction: 1, semisextile: 1, semisquare: -1, quincunx: -1,
};
export function PersonalCosmicForecast({ chart, calculating, onRefresh }: { chart: ChartResult | null; calculating: boolean; onRefresh?: () => void }) {
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const data = useMemo(() => {
    const score = calculateEnergyRead(chart);
    if (!score || !chart) return null;
    return { contacts: score.contacts, flow: score.flowWeight, friction: score.frictionWeight,
      neutral: score.dynamic, conjunctionCount: score.contacts.filter(c => c.aspect === "conjunction").length,
      signal: score.signal === "Harmonious Flow" ? "Easy Flow" : score.signal === "Dynamic Friction" ? "Friction" : score.signal === "No active contacts" ? "No close contacts" : "Mixed",
      strongest: [...score.contacts].sort((a,b) => a.orb-b.orb), moment: chart.transitDate };
  }, [chart]);

  const hours = useMemo(() => {
    if (!chart || chart.readingScope === "natal") return null;
    const lat = chart.input.transitLatitude ?? chart.input.latitude;
    const lon = chart.input.transitLongitude ?? chart.input.longitude;
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    return calculatePlanetaryHours(new Date(chart.transitDate), lat, lon, chart.input.transitTimezone || chart.input.timezone);
  }, [chart]);
  const timeZone = chart?.input.transitTimezone || chart?.input.timezone || "UTC";
  const formatHour = (iso: string) => {
    try { return new Intl.DateTimeFormat("en-US", { hour:"numeric", minute:"2-digit", timeZone }).format(new Date(iso)); }
    catch { return new Date(iso).toISOString().slice(11,16) + " UTC"; }
  };
  return <section aria-label="Personal Cosmic Forecast" className="relative overflow-hidden rounded-3xl border border-cyan-300/65 bg-[radial-gradient(ellipse_at_top_right,rgba(123,78,240,.21),transparent_65%),linear-gradient(150deg,#0A152C,#080D19)] p-5 shadow-[0_0_26px_rgba(83,244,255,.15),inset_0_0_18px_rgba(83,244,255,.035)] sm:p-6">
    <div className="flex items-center justify-between gap-3">
      <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">Personal Harmonic Flow Clock</p>
        <h2 className="mt-1 font-serif text-2xl text-amber-100">Your Personal Cosmic Forecast</h2>
        <p className="mt-1 text-sm text-slate-300">Feel the Flow. See What’s Ahead.</p>
      </div><div className="rounded-full border border-amber-300/45 bg-amber-300/10 p-3 text-amber-200"><Activity size={25}/></div>
    </div>
    <TransitLocationBar className="mt-4" />
    {onRefresh && <button type="button" disabled={calculating} onClick={onRefresh} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-300/10 px-4 text-sm font-semibold text-amber-100 disabled:opacity-50"><RefreshCw size={15} className={calculating ? "animate-spin" : ""}/>Refresh current energy</button>}
    {!data ? <div className="mt-5 rounded-xl border border-amber-200/25 bg-white/[.035] p-4 text-sm text-slate-200">
      {calculating ? "Calculating your personal sky…" : "Your birth chart is ready for a personal energy forecast. Open Cosmic Weather to calculate current transit contacts with your natal chart."}
      <div className="mt-3"><Link className="text-amber-200 underline underline-offset-4" href="/guide?tab=weather#main-cosmos-tabs">Open Cosmic Weather →</Link></div>
    </div> : <>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className={`rounded-full border px-4 py-2 text-base font-semibold shadow-[0_0_20px_rgba(83,244,255,.14)] ${data.signal === "Easy Flow" ? "border-emerald-300/70 text-emerald-200" : data.signal === "Friction" ? "border-rose-300/70 text-rose-200" : "border-cyan-300/70 text-cyan-100"}`}><Zap size={16} className="mr-2 inline"/>{data.signal}</span>
        <span className="text-xs text-slate-400">{data.contacts.length} calculated contacts · 5° orb · 1–5 intensity · planet weights</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-200">{data.signal === "Easy Flow"
        ? "Supportive angular relationships carry more weight in this snapshot. Explore the contacts to see which parts of life are involved."
        : data.signal === "Friction"
        ? "Challenging angular relationships carry more weight in this snapshot. Friction describes symbolic tension, not inevitable events."
        : data.signal === "Mixed"
        ? "Supportive and challenging contacts are both present. The pattern can be explored through the planets and houses involved."
        : "No natal–transit aspects fall inside your selected 5° orb in this snapshot. This is not a claim that nothing is happening."}</p>
      <div className="mt-5 overflow-hidden rounded-2xl border border-amber-200/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(225,185,108,.13),transparent_65%),linear-gradient(145deg,rgba(11,24,50,.96),rgba(5,10,25,.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_16px_36px_rgba(0,0,0,.28)] sm:p-5">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-200">Celestial Energy Balance</p><h3 className="mt-1 font-serif text-lg text-white">Your current energetic signature</h3></div><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-300">Calculated snapshot</span></div>
        {(() => {
          const total = data.flow + data.friction;
          const flowShare = total ? data.flow / total : 0;
          const circumference = 2 * Math.PI * 48;
          return <div className="mt-5 grid items-center gap-5 sm:grid-cols-[190px_1fr]">
            <div className="relative mx-auto h-44 w-44">
              <svg viewBox="0 0 160 160" role="img" aria-label={total ? `${Math.round(flowShare*100)} percent of classified aspect weight is flow` : "No classified flow or friction contacts"} className="h-full w-full -rotate-90">
                <circle cx="80" cy="80" r="48" fill="none" stroke="#26334a" strokeWidth="13"/>
                <circle cx="80" cy="80" r="48" fill="none" stroke="#ef8b91" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${total ? circumference : 0} ${circumference}`}/>
                <circle cx="80" cy="80" r="48" fill="none" stroke="#70e3bb" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${flowShare*circumference} ${circumference}`} className="drop-shadow-[0_0_8px_rgba(112,227,187,.55)]"/>
                <circle cx="80" cy="80" r="32" fill="#0c1730" stroke="#bca078" strokeOpacity=".2"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><strong className="font-serif text-3xl text-white">{total ? `${Math.round(flowShare*100)}%` : "—"}</strong><span className="text-[10px] uppercase tracking-widest text-emerald-200">Flow share</span></div>
            </div>
            <div className="space-y-4">
              <div><div className="mb-2 flex justify-between text-xs"><span className="text-emerald-200">Harmonious contacts</span><strong className="text-white">{data.flow}</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.4)]" style={{width:`${flowShare*100}%`}}/></div></div>
              <div><div className="mb-2 flex justify-between text-xs"><span className="text-rose-200">Friction contacts</span><strong className="text-white">{data.friction}</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400" style={{width:`${total ? (1-flowShare)*100 : 0}%`}}/></div></div>
              <div className="flex flex-wrap gap-2 text-[11px]"><span className="rounded-lg border border-violet-300/20 bg-violet-300/10 px-2 py-1 text-violet-200">{data.conjunctionCount} conjunctions</span><span className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-amber-100">{data.contacts.filter(c=>c.orb<=1.25).length} tight contacts</span></div>
            </div>
          </div>;
        })()}
        <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-slate-400">The dial compares actual calculated natal–transit aspect weights, not a prediction of outcomes. Conjunctions are included in harmonious flow and identified separately in the contact count. Future energy curves require new timed chart calculations.</p>
      </div>
      <div className="mt-4 rounded-2xl border border-violet-300/20 bg-[linear-gradient(135deg,rgba(24,34,67,.94),rgba(10,15,32,.98))] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-200">Planetary Contributors</p><h3 className="mt-1 font-serif text-lg text-white">What is shaping your energy?</h3></div><Sparkles size={19} className="text-amber-200"/></div>
        <div className="mt-4 space-y-4">{data.strongest.slice(0,5).map((contact,index) => {
          const mode = aspectFlow[contact.aspect];
          return <div key={`${contact.transit}-${contact.natalName}-${index}`}>
            <div className="mb-2 flex items-center justify-between gap-2 text-xs"><span className="text-slate-100">{contact.transit} {contact.aspect} {contact.natalName}</span><span className={mode>0?"text-emerald-200":mode<0?"text-rose-200":"text-violet-200"}>{contact.strength}% · {mode>0?"Flow":mode<0?"Friction":"Conjunction"}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full shadow-[0_0_12px_rgba(255,255,255,.13)] ${mode>0?"bg-gradient-to-r from-cyan-400 to-emerald-300":mode<0?"bg-gradient-to-r from-amber-400 to-rose-400":"bg-gradient-to-r from-violet-400 to-fuchsia-300"}`} style={{width:`${contact.intensity * 20}%`}}/></div>
            <p className="mt-1 text-[10px] text-slate-400">{contact.orb.toFixed(2)}° exact orb · within 5°</p>
          </div>;
        })}</div>
        {!data.strongest.length && <p className="mt-3 text-xs text-slate-400">No natal–transit contacts within the 5° orb, including supported minor aspects.</p>}
      </div>
      {chart && <HarmonicFlowTimeline chart={chart} />}
      <div className="mt-4 rounded-2xl border border-amber-300/30 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,.14),transparent_65%),linear-gradient(145deg,#111c37,#0a1225)] p-4 shadow-[0_12px_32px_rgba(0,0,0,.24)] sm:p-5">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-200">Traditional Time Lord</p><h3 className="mt-1 font-serif text-xl text-white">Planetary Hour Clock</h3></div><Clock3 size={23} className="text-amber-200"/></div>
        {hours ? <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-300/30 bg-amber-300/[.06] p-3"><p className="text-[10px] uppercase tracking-wider text-amber-200">Ruling this hour</p><p className="mt-1 font-serif text-2xl text-white">{hours.current.ruler}</p><p className="mt-1 text-xs text-slate-300">{formatHour(hours.current.start)} – {formatHour(hours.current.end)}</p></div>
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/[.05] p-3"><p className="text-[10px] uppercase tracking-wider text-cyan-200">Up next</p><p className="mt-1 font-serif text-2xl text-white">{hours.next.ruler}</p><p className="mt-1 text-xs text-slate-300">Begins {formatHour(hours.next.start)}</p></div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-200" style={{width:`${Math.max(0,Math.min(100,100*(Date.parse(chart!.transitDate)-Date.parse(hours.current.start))/(Date.parse(hours.current.end)-Date.parse(hours.current.start))))}%`}}/></div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-300">Coming rulers</p>
          <div className="mt-2 flex flex-wrap gap-2">{hours.upcoming.map((hour,i)=><div key={hour.start} className="rounded-lg border border-white/10 bg-white/[.035] px-3 py-2 text-xs text-slate-200"><span className="text-amber-100">{hour.ruler}</span><span className="ml-2 text-slate-400">{i===0?"Now":formatHour(hour.start)}</span></div>)}</div>
          <p className="mt-3 text-xs leading-5 text-slate-400">Calculated from sunrise and sunset at the transit coordinates. The hour ruler is a traditional timing indicator; its favorable or challenging meaning depends on natal and transit chart context.</p>
        </> : <p className="mt-3 text-sm text-slate-300">Resolve a transit location to calculate planetary hours. Polar day/night locations may require a different traditional convention.</p>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-300/35 bg-emerald-300/[.055] p-3"><p className="text-xs text-emerald-200">Flow weight</p><p className="mt-1 text-xl font-semibold text-white">{Math.round(data.flow)}</p></div>
        <div className="rounded-xl border border-rose-300/35 bg-rose-300/[.055] p-3"><p className="text-xs text-rose-200">Friction weight</p><p className="mt-1 text-xl font-semibold text-white">{Math.round(data.friction)}</p></div>
      </div>
      {data.strongest.length > 0 && <div className="mt-4 space-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200"><Sparkles size={14}/> Calculated transit contacts ({data.contacts.length})</p>
        {(showAllContacts ? data.strongest : data.strongest.slice(0,4)).map((c,i) => {
          const id = `${c.transit}-${c.natalName}-${c.aspect}-${i}`;
          return <div key={id} className="rounded-lg border border-white/10 bg-white/[.035] p-3 text-sm text-slate-200">
            <button type="button" className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200" aria-expanded={selectedContact === id} onClick={() => setSelectedContact(current => current === id ? null : id)}>
              <span className="font-medium text-white">Transit {c.transit} {c.aspect} natal {c.natalName}</span>
              <span className="mt-1 block text-xs text-amber-100">{c.orb.toFixed(2)}° orb · {c.intensity}/5 intensity · {c.strength} weight · {aspectFlow[c.aspect] === 1 ? "Flow" : aspectFlow[c.aspect] === -1 ? "Friction" : "Conjunction / context dependent"}</span>
            </button>
            {selectedContact === id && <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-slate-300">
              <p>Exact chart testimony: transiting {c.transit} forms a {c.aspect} with natal {c.natalName}, separated by {c.orb.toFixed(2)}°. This contact contributes {c.strength} weighted points under the configured 5° orb.</p>
              {chart && <FocusedPlacementReading chart={chart} name={c.transit} otherName={c.natalName} kind="contact" layer="transit"/>}

              <Link href="/reading" className="mt-2 inline-block font-semibold text-cyan-200 underline underline-offset-2">Ask the Master Interpreter →</Link>
            </div>}
          </div>;
        })}
        {data.strongest.length > 4 && <button type="button" className="w-full rounded-lg border border-amber-300/40 px-3 py-3 text-sm font-semibold text-amber-100" onClick={() => setShowAllContacts(current => !current)}>{showAllContacts ? "Show leading four contacts" : `Show all ${data.strongest.length} calculated contacts`}</button>}
      </div>}
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400"><Clock3 size={14} className="mt-0.5 shrink-0"/>Snapshot: {new Date(data.moment).toLocaleString()} · Current energy refreshes every five minutes while open. Use the 30-minute timeline above for calculated future scores.</p>
      <Link href="/guide?tab=weather#main-cosmos-tabs" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-300/45 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/20">Explore your energy in depth <ArrowRight size={16}/></Link>
    </>}
  </section>;
}
