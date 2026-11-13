import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

/** Actual sports endpoint; no guessed fixtures, scores or fake method outputs. */
export default function SportsLabPage() {
  const [league, setLeague] = useState<"NFL" | "NBA" | "NHL">("NFL");
  const [ascTeam, setAscTeam] = useState("");
  const [descTeam, setDescTeam] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venue, setVenue] = useState<{name:string;latitude:number;longitude:number;timezone:string}|null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityError, setCityError] = useState("");
  const geocode = trpc.useUtils().hybrid.geocode;
  const predict = trpc.simulationLab.predict.useMutation();
  const [result, setResult] = useState<Awaited<ReturnType<typeof predict.mutateAsync>> | null>(null);
  const [resolving, setResolving] = useState(false);
  async function findVenue() {
    setResolving(true); setCityError(""); setVenue(null); setResult(null);
    try {
      const place = await geocode.fetch({query: venueName});
      setVenue({name:place.label,latitude:place.latitude,longitude:place.longitude,timezone:place.timezone});
    } catch(e) { setCityError(e instanceof Error ? e.message : "Venue lookup failed"); }
    finally {setResolving(false);}
  }
  const ready = venue && ascTeam.trim() && descTeam.trim() && ascTeam.trim() !== descTeam.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time);
  async function run() {
    if (!venue || !ready) return;
    setResult(null);
    try {
      const value = await predict.mutateAsync({
        id:`${league}:${date}:${ascTeam.trim()}:${descTeam.trim()}`,
        league, scheduledDate:date, scheduledTime:time, venue,
        ascTeam:ascTeam.trim(),descTeam:descTeam.trim(),
      });
      setResult(value);
    } catch { /* The mutation exposes its exact error visibly. */ }
  }
  const inputStyle = "w-full rounded-lg border border-white/20 bg-slate-950 p-3 text-slate-100";
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-7 text-slate-100">
    <Link href="/" className="text-cyan-300">← The Absolute</Link>
    <header><h1 className="text-3xl font-semibold">Sports Simulation Lab</h1>
      <p className="mt-2 text-slate-300">Master Sports Astrology AI · Venue Sunrise Chart · Audited symbolic verdict</p></header>
    <section className="space-y-4 rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5">
      <p className="text-sm text-slate-300">This first executable baseline uses the real event chart and weighted team-house occupancy. The full multi-method, injury/weather and 10,000-game simulator is not yet connected; symbolic points are not win probabilities.</p>
      <label className="block">League<select className={inputStyle} value={league} onChange={e=>{setLeague(e.target.value as typeof league);setResult(null);}}><option>NFL</option><option>NBA</option><option>NHL</option></select></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>ASC-side team<input className={inputStyle} value={ascTeam} onChange={e=>{setAscTeam(e.target.value);setResult(null);}} placeholder="Assigned favorite / ASC team"/></label>
        <label>DESC-side team<input className={inputStyle} value={descTeam} onChange={e=>{setDescTeam(e.target.value);setResult(null);}} placeholder="Opponent / DESC team"/></label>
      </div>
      <label className="block">Venue city or stadium address<input className={inputStyle} value={venueName} onChange={e=>{setVenueName(e.target.value);setVenue(null);setResult(null);}} placeholder="Game venue, city"/></label>
      <button type="button" onClick={findVenue} disabled={resolving || venueName.trim().length<2} className="rounded-lg border border-cyan-300/50 px-4 py-2 disabled:opacity-50">{resolving?"Looking up venue…":"Resolve venue coordinates"}</button>
      {venue && <p className="text-sm text-cyan-200">Resolved: {venue.name} · {venue.timezone} · {venue.latitude}, {venue.longitude}</p>}
      {cityError && <p role="alert" className="text-rose-300">{cityError}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label>Game date (venue local)<input type="date" className={inputStyle} value={date} onChange={e=>{setDate(e.target.value);setResult(null);}}/></label>
        <label>Kickoff / tipoff (venue local)<input type="time" className={inputStyle} value={time} onChange={e=>{setTime(e.target.value);setResult(null);}}/></label>
      </div>
      <button type="button" onClick={()=>void run()} disabled={!ready || predict.isPending} className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold disabled:opacity-50">{predict.isPending?"Calculating and synthesizing…":"Run Master Sports AI"}</button>
      {predict.error && <p role="alert" className="text-rose-300">{predict.error.message}</p>}
    </section>
    {result && <section className="space-y-4 rounded-2xl border border-cyan-300/25 bg-slate-900 p-5">
      <h2 className="text-2xl font-semibold">AI verdict: {result.prediction.team ?? "No pick — tie"}</h2>
      <p className="text-slate-300">{result.prediction.reasoning}</p>
      <p className="font-medium">Symbolic tally · ASC {result.prediction.calculatedScore.asc} / DESC {result.prediction.calculatedScore.desc}</p>
      <h3 className="font-semibold">Evidence-backed method contributions</h3>
      {result.prediction.keyFactors.map((f,i)=><p key={i} className="text-sm"><strong>{f.methodId}:</strong> {f.finding} <span className="text-cyan-300">[{f.evidenceIds.join(", ")}]</span></p>)}
      <h3 className="font-semibold">Contrary evidence</h3><p>{result.prediction.contraryEvidence}</p>
      <h3 className="font-semibold">Conditions and unknowns</h3><p>{result.prediction.conditions}</p>
      <p className="text-sm text-amber-200">{result.prediction.warning}</p>
      <details><summary className="cursor-pointer">Calculation ledger ({result.methods.length} sports methods; {result.snapshot.masterMethods?.base.length ?? 0} natal/event Canon layers)</summary>
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(result.methods,null,2)}</pre>
      </details>
    </section>}
  </main>;
}
