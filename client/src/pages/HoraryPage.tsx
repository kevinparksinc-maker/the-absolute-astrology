import { useEffect, useRef, useState } from "react";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { ArrowLeft, Clock3, Loader2, MapPin, MessageCircle, Moon, Orbit, Sparkles, Sun } from "lucide-react";
import { Link } from "wouter";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { HORARY_TOPICS } from "@shared/horary";
import { HoraryLookaheadEvidence } from "@/components/HoraryLookaheadEvidence";
import { HoraryOrrery } from "@/components/HoraryOrrery";
import { FrameRelationshipPanel } from "@/components/FrameRelationshipPanel";
import { TraditionalHoraryEvidence } from "@/components/TraditionalHoraryEvidence";
import { HoraryChamber2050 } from "@/components/HoraryChamber2050";
import { formatLongitude } from "@shared/hybrid";
import type { HoraryInput, HoraryChart } from "../../../server/horary";

function localDateTime() {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

type ResolvedPlace = {
  query: string;
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type HoraryResult = { inputKey: string; chart: HoraryChart; reading: string; synthesisStatus: "ai_completed" | "deterministic_fallback" };

export default function HoraryPage() {
  const { profile: activeProfile } = useProfileSession();
  const initialMoment = localDateTime();
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState<"querent" | "other">("querent");
  const [subjectHouse, setSubjectHouse] = useState("");
  const [topicHouse, setTopicHouse] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [place, setPlace] = useState<ResolvedPlace | null>(null);
  const [birthLocationQuery, setBirthLocationQuery] = useState("");
  const [birthPlace, setBirthPlace] = useState<ResolvedPlace | null>(null);
  const [includeNatal, setIncludeNatal] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [date, setDate] = useState(initialMoment.date);
  const [time, setTime] = useState(initialMoment.time);
  const [horary, setHorary] = useState<HoraryResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const activeChart = useRef<HoraryChart | undefined>(undefined);
  activeChart.current = horary?.chart;

  const providerStatus = trpc.system.providerStatus.useQuery(undefined, { retry: false });
  const geocode = trpc.hybrid.geocode.useQuery({ query: locationQuery }, { enabled: false, retry: false });
  const birthGeocode = trpc.hybrid.geocode.useQuery({ query: birthLocationQuery }, { enabled: false, retry: false });
  const cast = trpc.horary.open.useMutation({
    onSuccess: (result, input) => {
      setHorary({ ...result, inputKey: JSON.stringify(input) });
      setMessages([]);
    },
  });
  const followUp = trpc.horary.followUp.useMutation({
    onSuccess: (answer, input) => {
      if (activeChart.current === input.chart) setMessages(current => [...current, { role: "assistant", content: answer }]);
    },
  });

  const resolvePlace = async () => {
    if (locationQuery.trim().length < 2) return;
    const result = await geocode.refetch();
    if (!result.data) return;
    const resolved = { ...result.data, query: result.data.label.trim() };
    setPlace(resolved);
    setLocationQuery(result.data.label);
  };

  const resolveBirthPlace = async () => {
    if (birthLocationQuery.trim().length < 2) return;
    const result = await birthGeocode.refetch();
    if (!result.data) return;
    const resolved = { ...result.data, query: result.data.label.trim() };
    setBirthPlace(resolved);
    setBirthLocationQuery(result.data.label);
  };

  // The saved natal foundation is the default for all Horary natal comparisons.
  // The question-time location remains independently editable.
  useEffect(() => {
    if (!activeProfile) return;
    const resolved = {
      query: activeProfile.location,
      label: activeProfile.location,
      latitude: activeProfile.latitude,
      longitude: activeProfile.longitude,
      timezone: activeProfile.timezone,
    };
    setIncludeNatal(!activeProfile.birthTimeUnknown);
    setBirthPlace(resolved);
    setBirthLocationQuery(activeProfile.location);
    setBirthDate(activeProfile.date);
    setBirthTime(activeProfile.birthTimeUnknown ? "" : activeProfile.time);
  }, [activeProfile?.id, activeProfile?.date, activeProfile?.time, activeProfile?.location, activeProfile?.latitude, activeProfile?.longitude, activeProfile?.timezone, activeProfile?.birthTimeUnknown]);

  const locationIsResolved = Boolean(place && place.query === locationQuery.trim());
  const birthLocationIsResolved = Boolean(birthPlace && birthPlace.query === birthLocationQuery.trim());
  const hasCompleteNatal = birthLocationIsResolved && birthDate.length === 10 && birthTime.length === 5;
  const canCast = question.trim().length >= 10 && topicHouse !== "" && locationIsResolved && date.length === 10 && time.length === 5 && (!includeNatal || hasCompleteNatal) && !cast.isPending;

  const castInput: HoraryInput | null = place && locationIsResolved ? {
    question: question.trim(), subject,
    ...(subject === "other" && subjectHouse ? { subjectHouse: Number(subjectHouse) } : {}),
    topicHouse: Number(topicHouse), location: place.label,
    latitude: place.latitude, longitude: place.longitude, timezone: place.timezone,
    date, time,
    ...(includeNatal && hasCompleteNatal && birthPlace ? { natal: {
      location: birthPlace.label, latitude: birthPlace.latitude, longitude: birthPlace.longitude,
      timezone: birthPlace.timezone, date: birthDate, time: birthTime,
    } } : {}),
  } : null;
  const resultIsStale = Boolean(horary && (horary.inputKey !== JSON.stringify(castInput) || (includeNatal && !hasCompleteNatal)));

  const castQuestion = () => {
    if (!canCast || !castInput) return;
    cast.reset();
    setHorary(null);
    setMessages([]);
    followUp.reset();
    cast.mutate(castInput);
  };

  const sendFollowUp = (content: string) => {
    if (!horary || resultIsStale || followUp.isPending || !content.trim()) return;
    const next = [...messages, { role: "user" as const, content: content.trim() }];
    setMessages(next);
    followUp.mutate({
      chart: horary.chart,
      history: [
        { role: "user", content: horary.chart.question },
        { role: "assistant", content: horary.reading },
        ...messages.filter((message): message is Extract<Message, { role: "user" | "assistant" }> => message.role !== "system"),
      ],
      question: content.trim(),
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080b14] text-slate-100 selection:bg-cyan-300/25">
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-36 -top-32 h-[34rem] w-[34rem] rounded-full bg-cyan-700/15 blur-3xl"/><div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-violet-600/10 blur-3xl"/><div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:64px_64px]"/></div>
      <main className="relative z-10 mx-auto max-w-6xl px-5 py-6 md:px-10 md:py-10">
        {providerStatus.data && <p role="status">{providerStatus.data.configured ? "AI provider configured" : "AI provider unavailable"}: {providerStatus.data.provider}</p>}
        <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-slate-300 transition hover:border-cyan-200/30 hover:text-white"><ArrowLeft className="h-4 w-4"/>Back to the astrology app</Link>
        <div className="mb-6 rounded-2xl border border-amber-200/25 bg-gradient-to-r from-amber-100/[0.09] via-violet-100/[0.06] to-cyan-100/[0.06] p-4 sm:p-5"><p className="text-[10px] font-bold uppercase tracking-[.23em] text-amber-200">THE QUESTION CHAMBER · 2050 OBSERVATORY</p><div className="mt-3 grid gap-3 text-xs leading-6 text-slate-300 sm:grid-cols-3"><p><strong className="block text-amber-100">01. Ask clearly</strong>Write one question that matters to you.</p><p><strong className="block text-amber-100">02. Set the moment</strong>Resolve where and when your question became important.</p><p><strong className="block text-amber-100">03. Read the testimony</strong>Explore the two chart frames, evidence and plain-English synthesis.</p></div></div>
        <Link href="/zodiac-readings" className="mb-7 flex items-center gap-3 rounded-xl border border-amber-200/30 bg-amber-100/[0.07] px-5 py-4 text-sm text-amber-100 hover:bg-amber-100/[0.12]"><Sparkles className="h-5 w-5"/> Explore the second engine: Twelve Zodiac Sign Readings →</Link>
        <header className="mb-8 border-b border-white/10 pb-8">
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-cyan-200"><span className="h-px w-8 bg-cyan-200"/>THE ABSOLUTE / HORARY CHAMBER</div>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight text-white md:text-6xl">One question. One chart. A careful answer.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">Ask a clear, present-tense question. The Absolute will cast a chart for the moment and place you provide, explain the testimony in connected plain language, and keep follow-up chat anchored to that same chart.</p>
        </header>

        <section className="mb-7 rounded-2xl border border-amber-200/25 bg-gradient-to-r from-[#27243c]/80 via-[#14273c]/80 to-[#102038]/70 p-4 shadow-xl shadow-black/20 sm:p-6" aria-label="Your Horary question readiness"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-200">YOUR QUESTION · GUIDED SETUP</p><span className="text-xs text-cyan-100">{[question.trim().length>=10,topicHouse!=="",locationIsResolved,date.length===10&&time.length===5].filter(Boolean).length} / 4 ready</span></div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{([{title:"Ask one question",done:question.trim().length>=10,description:"Write what you want to understand."},{title:"Choose the topic",done:topicHouse!=="",description:"Identify the house of the matter."},{title:"Resolve the location",done:locationIsResolved,description:"Use the place where you asked."},{title:"Set the question moment",done:date.length===10&&time.length===5,description:"Confirm date and local time."}]).map((step,index)=><div key={step.title} className={`rounded-xl border p-3 ${step.done?"border-emerald-200/30 bg-emerald-100/[0.06]":"border-white/10 bg-white/[0.035]"}`}><p className={`text-xs font-semibold ${step.done?"text-emerald-100":"text-slate-200"}`}><span className="mr-2 text-amber-200">{index+1}.</span>{step.title} <span aria-label={step.done?"Ready":"Not ready"}>{step.done?"✓":"○"}</span></p><p className="mt-1 text-[11px] leading-5 text-slate-400">{step.description}</p></div>)}</div><p className="mt-4 text-xs leading-6 text-slate-400">When all four essentials are ready, cast the chart below. An optional natal chart adds personal context but is not required for traditional Horary judgment.</p></section>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
          <Card className="border-white/10 bg-white/[0.045] text-slate-100 shadow-2xl shadow-black/20">
            <CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl"><Sparkles className="h-5 w-5 text-cyan-200"/>Ask your horary question</CardTitle><p className="text-sm leading-6 text-slate-400">Use the time and place where the question became clear and important to you. Keep it to one sincere question.</p></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2"><Label htmlFor="horary-question" className="text-slate-200">Your question</Label><textarea id="horary-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder="For example: Is this the right time to accept the job offer I received?" className="min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"/><p className="text-xs text-slate-500">One specific question works better than several questions combined. {question.trim().length < 10 ? "Enter at least 10 characters." : ""}</p></div>
              <div className="space-y-2"><Label htmlFor="horary-subject" className="text-slate-200">Who is the question about?</Label><select id="horary-subject" value={subject} onChange={event => setSubject(event.target.value as "querent" | "other")} className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/50"><option value="querent">Me — I am the person in the question</option><option value="other">Another person — I am asking about them</option></select><p className="text-xs text-slate-500">You remain the querent (House 1). If the question concerns a specific relative or role, identify them below so the app can turn the correct houses.</p></div>
              {subject === "other" && <div className="space-y-2"><Label htmlFor="horary-subject-house" className="text-slate-200">Who is the other person?</Label><select id="horary-subject-house" value={subjectHouse} onChange={event => setSubjectHouse(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/50"><option value="">Infer from the question (default House 7)</option><option value="3">Sibling — House 3</option><option value="4">Mother / parent / family — House 4</option><option value="5">Child — House 5</option><option value="7">Partner / counterpart — House 7</option><option value="10">Father / boss / authority — House 10</option><option value="11">Friend / group — House 11</option><option value="12">Other relationship / hidden matter — House 12</option></select><p className="text-xs text-slate-500">Leave inference on to use question wording, or choose the person’s house explicitly.</p></div>}
              <div className="space-y-2"><Label htmlFor="horary-topic" className="text-slate-200">What area relative to {subject === "querent" ? "me" : "this person"}?</Label><select id="horary-topic" value={topicHouse} onChange={event => setTopicHouse(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/50"><option value="">Choose the relevant topic house</option>{HORARY_TOPICS.map(topic => <option key={topic.house} value={topic.house}>House {topic.house} from {subject === "querent" ? "me" : "this person"} — {topic.label}</option>)}</select><p className="text-xs text-slate-500">The asker remains House 1. The other person’s house is inferred from the question or selected above; the chosen topic house is then turned from that person.</p></div>
              <div className="space-y-2"><Label htmlFor="horary-location" className="text-slate-200">Where were you when you asked?</Label><div className="flex gap-2"><Input id="horary-location" value={locationQuery} onChange={event => setLocationQuery(event.target.value)} placeholder="City, region, country" className="border-white/10 bg-black/20 text-white"/><Button type="button" variant="outline" onClick={resolvePlace} disabled={geocode.isFetching || locationQuery.trim().length < 2} className="shrink-0 border-white/10 bg-white/[0.04] text-cyan-100 hover:bg-white/[0.08]"><MapPin className="mr-2 h-4 w-4"/>{geocode.isFetching ? "Resolving" : "Resolve"}</Button></div>{locationIsResolved && place && <p className="text-xs text-emerald-200">{place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}° · {place.timezone}</p>}{geocode.error && <p className="text-xs text-rose-300">{geocode.error.message}</p>}{place && !locationIsResolved && <p className="text-xs text-amber-200">Resolve this location again before casting the question chart.</p>}</div>
              <div className="space-y-3 rounded-xl border border-amber-200/15 bg-amber-100/[0.035] p-4"><div><p className="text-xs uppercase tracking-[.18em] text-amber-200">Optional natal layer</p><p className="mt-1 text-xs leading-5 text-slate-500">Add the person’s birth details to compare the question-time transit against their natal chart. Switch off the comparison for a Horary + God View reading without a personal natal layer.</p></div><label className="flex items-center gap-2 text-sm text-amber-100"><input type="checkbox" checked={includeNatal} onChange={event => setIncludeNatal(event.target.checked)} />Include a natal comparison</label><fieldset disabled={!includeNatal} className="space-y-3 disabled:opacity-50"><div className="flex gap-2"><Input id="birth-location" value={birthLocationQuery} onChange={event => setBirthLocationQuery(event.target.value)} placeholder="Birth city, region, country" className="border-white/10 bg-black/20 text-white"/><Button type="button" variant="outline" onClick={resolveBirthPlace} disabled={birthGeocode.isFetching || birthLocationQuery.trim().length < 2} className="shrink-0 border-white/10 bg-white/[0.04] text-amber-100 hover:bg-white/[0.08]"><MapPin className="mr-2 h-4 w-4"/>{birthGeocode.isFetching ? "Resolving" : "Resolve"}</Button></div>{birthLocationIsResolved && birthPlace && <p className="text-xs text-emerald-200">{birthPlace.latitude.toFixed(4)}°, {birthPlace.longitude.toFixed(4)}° · {birthPlace.timezone}</p>}<div className="grid gap-3 sm:grid-cols-2"><Input aria-label="Birth date" type="date" value={birthDate} onChange={event => setBirthDate(event.target.value)} className="border-white/10 bg-black/20 text-white"/><Input aria-label="Birth time" type="time" value={birthTime} onChange={event => setBirthTime(event.target.value)} className="border-white/10 bg-black/20 text-white"/></div>{includeNatal && !hasCompleteNatal && <p className="text-xs text-amber-200">Resolve the birth place and enter both birth date and time to enable the natal layer.</p>}</fieldset></div>
              <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="horary-date" className="text-slate-200">Local date asked</Label><Input id="horary-date" type="date" value={date} onChange={event => setDate(event.target.value)} className="border-white/10 bg-black/20 text-white"/></div><div className="space-y-2"><Label htmlFor="horary-time" className="text-slate-200">Local time asked</Label><Input id="horary-time" type="time" value={time} onChange={event => setTime(event.target.value)} className="border-white/10 bg-black/20 text-white"/></div></div>
              {cast.error && <div role="alert" className="rounded-xl border border-rose-300/20 bg-rose-400/[0.08] p-3 text-sm text-rose-200">{cast.error.message}</div>}
              <Button type="button" onClick={castQuestion} disabled={!canCast} className="h-12 w-full bg-cyan-300 font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-50">{cast.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Casting the question chart and preparing your reading…</> : <><Orbit className="mr-2 h-4 w-4"/>Cast chart & interpret</>}</Button>
            </CardContent>
          </Card>

          <Card className="border-cyan-200/15 bg-gradient-to-br from-cyan-100/[0.07] to-violet-100/[0.035] text-slate-100">
            <CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><Clock3 className="h-5 w-5 text-cyan-200"/>How the judgment works</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-400"><p>The chart starts with Swiss Ephemeris equatorial Cartesian XYZ coordinates, projected into The Absolute’s fixed firmament frame. The local Ascendant starts from the preceding sunrise, the Sun’s equatorial XYZ at sunrise, and elapsed rotation at exactly 15 degrees per hour. Twelve equal houses follow at 30° intervals. This is the app’s custom model, with no tropical or sidereal zodiac conversion. The Moon may also expose a separate topocentric, parallax-corrected longitude; houses and aspects use the canonical geocentric value.</p><p>The chart distinguishes you (House 1), the person asked about (their selected or inferred relationship house), and the selected topic house counted from that person. It calculates their rulers, the Moon, and close major aspects. The expanded evidence also lists upcoming exact planetary contacts and stations; those are astronomical dates, not predictions of real-world events.</p><p className="rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-5 text-slate-500">This is reflective astrological interpretation—not certainty, a guarantee, or a substitute for medical, legal, or financial advice. The feature will say when a traditional factor has not been calculated rather than inventing it.</p></CardContent>
          </Card>
        </section>

        {horary && <section className="mt-8 flex flex-col space-y-6">
          <div className="order-first space-y-3">
            {resultIsStale && <p role="status" className="rounded-xl border border-amber-200/30 bg-amber-100/10 p-4 text-sm text-amber-100">You changed the question or chart inputs. The reading below still belongs to the previous cast. Cast again to update its calculations and answer; follow-up chat is paused until then.</p>}
            <nav aria-label="Question reading sections" className="flex flex-wrap gap-3 text-sm text-cyan-100">{[["answer", "Answer"], ["evidence", "Calculation evidence"], ["conversation", "Follow-up"], ["chart", "Three-layer chart"]].map(([id, label]) => <a key={id} href={`#horary-${id}`} className="rounded-full border border-white/15 px-3 py-2 hover:bg-white/10">{label}</a>)}</nav>
          </div>
          <Card id="horary-evidence" className="order-2 scroll-mt-6 border-cyan-200/15 bg-white/[0.035] text-slate-100">
            <CardHeader className="border-b border-white/10"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Question chart evidence</p><CardTitle className="mt-2 max-w-3xl font-serif text-2xl text-white">{horary.chart.question}</CardTitle></div><span className="inline-flex items-center gap-2 text-xs text-slate-400"><Clock3 className="h-4 w-4"/>{new Date(horary.chart.askedAt).toLocaleString(undefined, { timeZone: horary.chart.timezone })} local</span></div><p className="mt-2 text-xs text-slate-500">{horary.chart.location} · {horary.chart.houseSystem}</p></CardHeader>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">Querent · House 1</p><p className="mt-2 text-lg font-medium text-cyan-100">{horary.chart.querentRuler}</p><p className="text-xs text-slate-500">Ascendant {horary.chart.ascendant.display} · {horary.chart.ascendant.sign}</p></div><div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">Person asked about · House {horary.chart.subjectHouse}</p><p className="mt-2 text-lg font-medium text-amber-100">{horary.chart.subjectRuler}</p><p className="text-xs text-slate-500">{horary.chart.subject === "querent" ? "Same as the querent" : `Relationship House ${horary.chart.subjectHouse}`}</p></div><div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">Matter · chart House {horary.chart.actualTopicHouse}</p><p className="mt-2 text-lg font-medium text-violet-100">{horary.chart.topicRuler}</p><p className="text-xs text-slate-500">Relative House {horary.chart.topicHouse} · {horary.chart.topicLabel}</p></div><div className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-[10px] uppercase tracking-[.18em] text-slate-500">Moon · co-significator</p><p className="mt-2 text-lg font-medium text-amber-100">{horary.chart.moon.display}</p><p className="text-xs text-slate-500">{horary.chart.moon.sign} · House {horary.chart.moon.house}{horary.chart.moon.retrograde ? " · retrograde" : ""}</p></div></div>
              <details className="group rounded-xl border border-white/10 bg-black/10 p-4"><summary className="cursor-pointer text-sm font-medium text-slate-200">Inspect calculated placements, houses, and major contacts</summary><div className="mt-4 grid gap-5 xl:grid-cols-2"><div><p className="mb-2 text-xs uppercase tracking-[.16em] text-slate-500">Classical planets</p><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="py-2 pr-3">Planet</th><th className="py-2 pr-3">Position</th><th className="py-2">House</th></tr></thead><tbody className="divide-y divide-white/5">{horary.chart.placements.filter(row => ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(row.name)).map(row => <tr key={row.name}><td className="py-2 pr-3 text-slate-200">{row.name}{row.retrograde ? " ℞" : ""}</td><td className="py-2 pr-3 font-mono text-cyan-100">{row.display}</td><td className="py-2 text-slate-400">{row.house}</td></tr>)}</tbody></table></div></div><div><p className="mb-2 text-xs uppercase tracking-[.16em] text-slate-500">House cusps and rulers</p><div className="grid grid-cols-2 gap-2">{horary.chart.houses.map(row => <div key={row.house} className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-slate-400"><span className="text-slate-200">H{row.house}</span> {row.sign} · {row.ruler}<span className="block font-mono text-[10px] text-slate-600">{formatLongitude(row.longitude)}</span></div>)}</div><p className="mb-2 mt-5 text-xs uppercase tracking-[.16em] text-slate-500">Relevant major aspects · 5° orb</p>{horary.chart.relevantAspects.length ? <div className="flex flex-wrap gap-2">{horary.chart.relevantAspects.map((aspect, index) => <span key={`${aspect.first}-${aspect.second}-${index}`} className="rounded-full border border-cyan-200/10 bg-cyan-100/[0.04] px-2.5 py-1 text-[11px] text-cyan-100">{aspect.first} {aspect.aspect} {aspect.second} · {aspect.orb}° {aspect.phase}</span>)}</div> : <p className="text-xs text-slate-500">No close major contact among these significators was calculated.</p>}</div></div><HoraryLookaheadEvidence chart={horary.chart} /></details>
              <p className="text-xs text-slate-500">Technical evidence is optional; the answer above is the primary reading. Interpretation remains symbolic and provisional, and the same question chart stays fixed for this conversation.</p>
              <TraditionalHoraryEvidence chart={horary.chart} />
            </CardContent>
          </Card>

          <div className="order-3"><FrameRelationshipPanel rows={horary.chart.placements as unknown as import("../../../server/astronomy").ChartRow[]} title="God's View of the Horary Agent" intro="The horary testimony remains primary. This panel adds the broader fixed zodiac frame and explains how the same question-time positions are translated through the local horary houses." /></div>

          <div id="horary-answer" className="order-1 scroll-mt-6 space-y-3"><div role="status" className={`rounded-xl border px-4 py-3 text-sm ${horary.synthesisStatus === "ai_completed" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"}`}>{horary.synthesisStatus === "ai_completed" ? "✦ High-Speed AI Synthesis · Real-World People Talk" : "✦ Master Horary Synthesis · Real-World People Talk"}</div><HoraryChamber2050 chart={horary.chart} reading={horary.reading}/></div>

          <Card id="horary-conversation" className="order-4 scroll-mt-6 overflow-hidden border-violet-200/15 bg-white/[0.035] text-slate-100"><CardHeader className="border-b border-white/10"><CardTitle className="flex items-center gap-2 font-serif text-2xl"><MessageCircle className="h-5 w-5 text-violet-200"/>Continue with this chart</CardTitle><p className="text-sm leading-6 text-slate-400">Ask what a specific testimony means or challenge the reading. Follow-ups use this same question chart, not a new or silently recalculated chart.</p></CardHeader><CardContent className="space-y-3 p-4 sm:p-6"><fieldset disabled={resultIsStale} className="disabled:opacity-50"><AIChatBox messages={messages} onSendMessage={sendFollowUp} isLoading={followUp.isPending} height="540px" placeholder="Ask a follow-up about this horary judgment…" emptyStateMessage="Your horary chart is ready for follow-up questions." suggestedPrompts={["Which chart factor most strongly supports that conclusion?", "What is the main uncertainty or counter-testimony?", "What practical next step follows from this judgment?"]}/></fieldset>{followUp.error && <p role="alert" className="text-sm text-rose-300">{followUp.error.message}</p>}</CardContent></Card>
          <div id="horary-chart" className="order-5 scroll-mt-6"><HoraryOrrery natal={horary.chart.natalChart} transit={horary.chart.transitChart} god={horary.chart.godChart} questionHouses={horary.chart.houses}/></div>
        </section>}

        <footer className="mt-8 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-600"><Moon className="h-3.5 w-3.5"/>A question chart is a distinct horary reading; it does not modify your natal chart.</footer>
      </main>
    </div>
  );
}
