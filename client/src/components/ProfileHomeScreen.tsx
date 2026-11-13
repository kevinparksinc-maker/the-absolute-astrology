import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { MasterSynthesizerPanel } from "./MasterSynthesizerPanel";
import { calculateEnergyRead } from "@/lib/energyScoring";
import type { UserProfileData } from "./NatalProfileBuilder";
import type { ChartResult } from "../../../server/astronomy";
import { trpc } from "@/lib/trpc";

function reduceNumber(n: number): number {
  while (n > 9 && ![11, 22, 33].includes(n)) n = String(n).split("").reduce((a, d) => a + Number(d), 0);
  return n;
}
function nameNumber(name: string, filter: (letter: string) => boolean): number | null {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").split("").filter(filter);
  return letters.length ? reduceNumber(letters.reduce((sum, letter) => sum + ((letter.charCodeAt(0) - 65) % 9) + 1, 0)) : null;
}
function numerology(name: string, date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const vowels = (s: string) => "AEIOU".includes(s);
  return [
    { label: "Life Path", value: match ? reduceNumber((match[1] + match[2] + match[3]).split("").reduce((sum, d) => sum + Number(d), 0)) : null },
    { label: "Destiny", value: nameNumber(name, () => true) },
    { label: "Soul Urge", value: nameNumber(name, vowels) },
    { label: "Personality", value: nameNumber(name, s => !vowels(s)) },
    { label: "Birthday", value: match ? reduceNumber(Number(match[3])) : null },
  ];
}
const themes: Record<string, { heading: string; meaning: string; question: string }> = {
  Sun: { heading: "Core identity", meaning: "Your will, creative expression, and the qualities you consciously develop.", question: "Where do you feel most fully yourself?" },
  Moon: { heading: "Emotional nature", meaning: "Your instincts, inner security, and emotional needs.", question: "What helps you feel at home within yourself?" },
  Ascendant: { heading: "The self", meaning: "How you approach life, new experiences, and your own becoming.", question: "How do you meet the world on your own terms?" },
  Descendant: { heading: "The other", meaning: "Partnerships, projections, and the qualities you encounter through others.", question: "How can you honor others without losing yourself?" },
  "North Node": { heading: "The developing path", meaning: "In karmic astrology, the unfamiliar qualities you are learning to embody.", question: "What new strengths are you willing to cultivate?" },
  "South Node": { heading: "The familiar path", meaning: "In karmic astrology, established gifts and patterns that may need balancing.", question: "Which familiar habits are ready to evolve?" },
};

type Props = {
  profile: UserProfileData;
  chart: ChartResult | null;
  calculating: boolean;
  onEditProfile: () => void;
  onSwitchProfile: () => void;
  onRefreshTransits?: () => void;
  savedProfiles?: UserProfileData[];
  onLoadProfile?: (profile: UserProfileData) => void;
};
function HomepagePlacementSynthesis({ chart }: { chart: ChartResult }) {
  const [body, setBody] = useState("Sun");
  const [result, setResult] = useState<Awaited<ReturnType<typeof import("../../../server/placement-synthesis").synthesizePlacement>> | null>(null);
  const synthesis = trpc.astrologyKnowledge.placementSynthesis.useMutation();
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    synthesis.mutateAsync({ chart, body }).then(value => { if (!cancelled) setResult(value); }).catch(() => { if (!cancelled) setResult(null); });
    return () => { cancelled = true; };
    // chart UTC and selected body define this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart.utc, body]);
  const choices = ["Sun", "Moon", "Ascendant", "Descendant", "North Node", "South Node"];
  return <section aria-label="Precision placement synthesis" className="space-y-4 rounded-2xl border border-amber-200/20 bg-slate-950/60 p-5">
    <div><h2 className="font-serif text-2xl text-amber-100">Precision placement synthesis</h2><p className="mt-2 text-sm leading-6 text-slate-300">Each placement is sent through every configured method adapter. The result records included, unavailable, and unresolved methods instead of silently dropping them.</p></div>
    <div className="flex flex-wrap gap-2">{choices.map(choice => <button key={choice} type="button" onClick={() => setBody(choice)} className={`rounded-full border px-3 py-1.5 text-xs ${body === choice ? "border-amber-200 bg-amber-200/15 text-amber-100" : "border-white/15 text-slate-300"}`}>{choice}</button>)}</div>
    {synthesis.isPending && <p role="status" className="text-sm text-amber-200">Running all placement methods…</p>}
    {result && <div className="space-y-3"><p className="whitespace-pre-line text-sm leading-7 text-slate-100">{result.synthesis}</p><details className="rounded-lg border border-white/10 bg-black/20 p-3"><summary className="cursor-pointer text-xs uppercase tracking-wider text-slate-300">Method execution audit</summary><ul className="mt-3 space-y-1 text-xs text-slate-300">{result.packet.contributions.map(item => <li key={item.method}><span className={item.status === "included" ? "text-emerald-300" : "text-amber-200"}>{item.status}</span> · {item.label}{item.reason ? ` — ${item.reason}` : ""}</li>)}</ul></details></div>}
  </section>;
}

export function ProfileHomeScreen({
  profile,
  chart,
  calculating,
  onEditProfile,
  onRefreshTransits,
}: Props) {
  const energy = useMemo(() => calculateEnergyRead(chart), [chart]);
  const numbers = useMemo(() => numerology(profile.name, profile.date), [profile.name, profile.date]);
  const bodies = [
    { label: "Sun", body: chart?.movingBodies.find(body => body.name === "Sun") },
    { label: "Moon", body: chart?.movingBodies.find(body => body.name === "Moon") },
    { label: "Ascendant", body: chart?.ascendant },
    { label: "Descendant", body: chart?.descendant },
    { label: "North Node", body: chart?.northNode },
    { label: "South Node", body: chart?.southNode },
  ];
  return (
    <section className="mx-auto max-w-4xl space-y-9 pb-20 text-slate-100">
      <header className="space-y-4 rounded-3xl border border-amber-200/20 bg-[linear-gradient(135deg,#14213b,#080f1f)] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-amber-200">
          The Absolute · Your observatory
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl">
          Welcome, {profile.name}
        </h1>
        <p className="max-w-xl text-sm leading-6 text-slate-300">
          Your birth chart is the starting point. Read its main message, then
          follow the evidence or explore today's sky.
        </p>
        <p className="text-xs leading-6 text-slate-400">
          {profile.date} ·{" "}
          {profile.birthTimeUnknown ? "Time unknown" : profile.time} ·{" "}
          {profile.location}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/chart"
            className="rounded-xl border border-amber-300/60 bg-amber-300/20 font-semibold px-4 py-2 text-sm text-amber-100 hover:bg-amber-300/30 shadow-sm"
          >
            View Birth Chart & Wheel →
          </Link>
          <button
            type="button"
            onClick={onEditProfile}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-white/30"
          >
            Edit profile
          </button>
          <Link
            href="/profiles"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-white/30"
          >
            Saved profiles
          </Link>
        </div>
      </header>
      <section aria-label="Your core numerology" className="space-y-4">
        <h2 className="font-serif text-xl text-amber-100">Your core numbers</h2>
        <p className="text-sm leading-6 text-slate-300">Know thyself. Love thyself. Master thyself. Be thyself. Explore your own path without measuring your worth against somebody else's.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {numbers.map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-amber-200/15 bg-slate-950/60 p-4">
              <p className="text-sm text-amber-200">{label}</p>
              <p className="font-serif text-3xl">{value ?? "Unavailable"}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">Pythagorean numerology: letters repeat 1–9, vowels A/E/I/O/U, and master numbers 11/22/33 are retained. Name-based values use the name entered in your profile.</p>
      </section>
      <section aria-label="Your main chart signals" className="space-y-4">
        <h2 className="font-serif text-xl text-amber-100">Your main signals</h2>
        <p className="text-sm leading-6 text-slate-300">Identity, inner nature, relationships, and the karmic axis. The full synthesis below connects these placements with your chart's methods and evidence.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {bodies.map(({ label, body }) => (
            <Link href="/chart" key={label} className="block space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-amber-200">{label} · {themes[label].heading}</p>
              <p className="font-serif text-xl">{body?.display || (calculating ? "Calculating…" : "Unavailable")}</p>
              {body?.agentHouse && <p className="text-xs text-slate-400">Agent House {body.agentHouse}</p>}
              <p className="text-sm leading-6 text-slate-300">{themes[label].meaning}</p>
              <p className="text-sm leading-6 text-slate-200"><strong>Explore:</strong> {themes[label].question}</p>
              <span className="block text-sm text-amber-200">Inspect placement and chart evidence →</span>
            </Link>
          ))}
        </div>
      </section>
      {chart && <HomepagePlacementSynthesis chart={chart} />}
      {chart && (
        <section aria-label="Your integrated personal synthesis" className="space-y-4">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-amber-100">Your integrated self-discovery reading</h2>
            <p className="text-sm leading-6 text-slate-300">One connected interpretation of your identity, emotions, relationship axis, karmic direction, and the traditional methods calculated for your chart. Explore the full narrative and method evidence in Readings.</p>
          </div>
          <MasterSynthesizerPanel chart={chart} presentation="summary" mode="natal" initialQuestion="Synthesize my Sun, Moon, Ascendant, Descendant, North Node and South Node together. Explain their sign and house placements, aspects, decans, lunar mansions where applicable, dignity and house-strength evidence, God and Agent views, and how these factors interact. Discuss strengths, shadows, familiar patterns, growth goals and practical self-mastery. Use all available calculated methods, cite their evidence, and explicitly identify missing methods rather than inventing data." />
          <Link href="/reading/depth" className="block text-sm text-amber-200">Read the full integrated interpretation →</Link>
        </section>
      )}
      <section
        aria-label="Your next step"
        className="grid gap-5 md:grid-cols-3"
      >
        <Link
          href="/chart"
          className="space-y-3 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-6 transition-all hover:border-cyan-400/60 hover:bg-cyan-950/30"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
              Visual Celestial Map
            </span>
          </div>
          <h2 className="font-serif text-2xl text-cyan-100">
            Birth Chart & Wheel
          </h2>
          <p className="text-sm leading-6 text-slate-300">
            View your full 360° circular natal wheel and the complete table of planetary placements directly underneath.
          </p>
          <span className="block text-sm font-semibold text-cyan-200">
            Open chart & placements →
          </span>
        </Link>
        <Link
          href="/reading"
          className="space-y-3 rounded-2xl border border-amber-200/25 bg-amber-200/5 p-6 transition-all hover:border-amber-200/40"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
              Personal Synthesis
            </span>
          </div>
          <h2 className="font-serif text-2xl text-amber-100">
            Read your chart
          </h2>
          <p className="text-sm leading-6 text-slate-300">
            Start with the main interpretation. Open the full explanation and
            calculation evidence at your own pace.
          </p>
          <span className="block text-sm font-semibold text-amber-200">
            Open reading summary →
          </span>
        </Link>
        <div className="space-y-3 rounded-2xl border border-emerald-400/25 bg-emerald-950/20 p-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
              Live Transit Barometer
            </span>
          </div>
          <h2 className="font-serif text-2xl text-emerald-100">
            Your current energy
          </h2>
          {energy ? (
            <>
              <p className="text-sm">{energy.signal}</p>
              <p className="text-sm text-slate-300">
                Harmony {energy.flowPct}% · Friction {energy.frictionPct}%
              </p>
              <p className="text-xs text-slate-400">
                {energy.contactsCount} contacts · Calculated{" "}
                {new Date(chart!.transitDate).toLocaleString([], {
                  timeZone:
                    chart!.input.transitTimezone || chart!.input.timezone,
                })}
              </p>
            </>
          ) : (
            <p role="status" className="text-sm text-slate-300">
              {calculating
                ? "Calculating current energy…"
                : "Current energy is ready to calculate."}
            </p>
          )}
          <div className="flex flex-wrap gap-4 pt-1">
            <Link href="/energy" className="text-sm font-semibold text-emerald-300">
              Open Energy Read →
            </Link>
            <button
              type="button"
              disabled={calculating}
              onClick={onRefreshTransits}
              className="text-xs text-slate-400 underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>
      <Link
        href="/explore"
        className="block rounded-2xl border border-white/10 bg-slate-950/50 p-6"
      >
        <h2 className="font-serif text-xl">Explore the page index →</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Find the forecast, transit chart, Horary, Synastry, patterns and saved
          records.
        </p>
      </Link>
    </section>
  );
}
