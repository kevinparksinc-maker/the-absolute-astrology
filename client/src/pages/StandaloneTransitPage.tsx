import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { calculateIndependentEnergyRead } from "@/lib/energyScoring";
import { localDateTime } from "@/lib/transitTime";
import { trpc } from "@/lib/trpc";
import { knownCity } from "@shared/profileLocations";
import { EnergyScoringKey } from "@/components/EnergyScoringKey";
import { ChartWheel } from "@/components/ChartWheel";
import { DiamondChart } from "@/components/DiamondChart";
import type { ChartResult } from "../../../server/astronomy";

/** Independent event-time chart: its birth/event coordinates are NOT the user's natal chart. */
export default function StandaloneTransitPage() {
  const { profile } = useProfileSession();
  const initial = localDateTime(
    new Date(),
    profile?.transitTimezone || profile?.timezone || "UTC"
  );
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [location, setLocation] = useState(
    () => profile?.transitLocation || profile?.location || ""
  );
  const [latitude, setLatitude] = useState(() =>
    String(profile?.transitLatitude ?? profile?.latitude ?? "")
  );
  const [longitude, setLongitude] = useState(() =>
    String(profile?.transitLongitude ?? profile?.longitude ?? "")
  );
  const [timezone, setTimezone] = useState(
    () => profile?.transitTimezone || profile?.timezone || "UTC"
  );
  const [result, setResult] = useState<ChartResult | null>(null);
  const [view, setView] = useState<"diamond" | "wheel">("diamond");
  const calculate = trpc.hybrid.calculate.useMutation();
  const utils = trpc.useUtils();
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const resolvingRef = useRef(false);
  const energy = useMemo(
    () => calculateIndependentEnergyRead(result),
    [result]
  );
  useEffect(() => {
    request.current++;
    setResult(null);
    setError("");
    calculate.reset();
    return () => {
      request.current++;
    };
  }, [date, time, location, latitude, longitude, timezone]);
  const resolveCity = async () => {
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    const version = request.current;
    setResolving(true);
    setError("");
    try {
      const city = await utils.hybrid.geocode.fetch({ query: location });
      if (version !== request.current) return;
      setLocation(city.label);
      setLatitude(String(city.latitude));
      setLongitude(String(city.longitude));
      setTimezone(city.timezone);
    } catch (error) {
      if (version === request.current)
        setError(error instanceof Error ? error.message : "City lookup failed");
    } finally {
      resolvingRef.current = false;
      setResolving(false);
    }
  };
  const preset = knownCity(location);
  const tupleMatches =
    !preset ||
    (Math.abs(Number(latitude) - preset.latitude) < 1 &&
      Math.abs(Number(longitude) - preset.longitude) < 1 &&
      timezone === preset.timezone);
  const valid =
    tupleMatches &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    /^\d{2}:\d{2}$/.test(time) &&
    !!location.trim() &&
    !!latitude.trim() &&
    !!longitude.trim() &&
    !!timezone.trim() &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Math.abs(Number(latitude)) <= 90 &&
    Math.abs(Number(longitude)) <= 180;
  const run = async () => {
    if (!valid) return;
    setResult(null);
    const version = ++request.current;
    try {
      const chart = await calculate.mutateAsync({
        location,
        latitude: Number(latitude),
        longitude: Number(longitude),
        timezone,
        date,
        time,
        worldview: "agent",
        readingScope: "natal",
      });
      // The event-time moving bodies are the independent sky; suppress natal/transit overlays.
      if (version === request.current) setResult({ ...chart, transits: [] });
    } catch (error) {
      if (version === request.current)
        setError(
          error instanceof Error && error.message.includes("Sunrise anchor")
            ? "The sunrise calculation could not resolve this event. Resolve the city again, confirm its local date and time, then calculate again."
            : error instanceof Error
              ? error.message
              : "The sky could not be calculated. Confirm the city and local time and try again."
        );
    }
  };
  const autoRequested = useRef(false);
  useEffect(() => {
    if (autoRequested.current || !valid) return;
    autoRequested.current = true;
    void run();
  }, [valid]);
  return (
    <main className="mx-auto max-w-5xl space-y-5 p-4 text-slate-100 sm:p-6">
      <header className="space-y-2">
        <Link href="/energy" className="text-sm text-cyan-300">
          ← Energy Read
        </Link>
        <h1 className="font-serif text-3xl text-amber-200">
          Independent Transit Sky
        </h1>
        <p className="text-sm text-slate-300">
          Calculate the sky for its own date, time and location—not the birth
          chart. Event-time houses and angles come from the same calculation
          engine. This is not a natal-to-transit overlay.
        </p>
      </header>
      <details className="rounded-2xl border border-white/15 bg-slate-950/70 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-cyan-200">Edit transit date, time and location</summary>
      <section className="grid gap-3 rounded-2xl border border-white/15 bg-slate-950/70 p-4 sm:grid-cols-2">
        <label className="text-xs">
          Date
          <input
            aria-label="Transit date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-white"
          />
        </label>
        <label className="text-xs">
          Local time
          <input
            aria-label="Transit local time"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-white"
          />
        </label>
        <label className="text-xs">
          Location
          <input
            aria-label="Transit location"
            value={location}
            onBlur={() => {
              if (location.trim().length >= 2 && (!latitude || !longitude))
                void resolveCity();
            }}
            onChange={e => {
              setLocation(e.target.value);
              setLatitude("");
              setLongitude("");
              setTimezone("");
            }}
            className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-white"
          />
        </label>
        <button
          type="button"
          onClick={resolveCity}
          disabled={resolving || location.trim().length < 2}
          className="rounded-xl border border-cyan-300/40 px-4 py-2 text-sm text-cyan-100"
        >
          {resolving
            ? "Resolving city…"
            : "Resolve city coordinates and timezone"}
        </button>
        <label className="text-xs">
          IANA timezone
          <input
            aria-label="Transit timezone"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-white"
          />
        </label>
        <label className="text-xs">
          Latitude
          <input
            aria-label="Transit latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={e => setLatitude(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-white"
          />
        </label>
        <label className="text-xs">
          Longitude
          <input
            aria-label="Transit longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={e => setLongitude(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-900 p-3 text-white"
          />
        </label>
        <button
          disabled={!valid || calculate.isPending}
          onClick={run}
          className="rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-50 sm:col-span-2"
        >
          {calculate.isPending
            ? "Calculating sky…"
            : "Calculate Independent Transit Chart"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-rose-300 sm:col-span-2">
            {error}
          </p>
        )}
        {!tupleMatches && latitude && longitude && (
          <p role="status" className="text-sm text-amber-200 sm:col-span-2">
            The city, coordinates and timezone do not match. Use Resolve city to
            update them together.
          </p>
        )}
      </section>
      </details>
      {!result && (
        <p
          role="status"
          className="rounded-xl border border-white/10 p-4 text-sm text-slate-300"
        >
          {calculate.isPending
            ? "Calculating the event sky and its contact ledger…"
            : "The chart will calculate automatically when the event location is valid. Open Edit transit date, time and location if you need to change it."}
        </p>
      )}
      <p className="text-sm leading-6 text-slate-400">
        Independent Sky compares body-to-body pairs within this event sky.
        Personal Energy compares transit bodies with your natal chart and
        angles, so its contact count can differ.
      </p>
      <EnergyScoringKey />
      {result && (
        <section className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setView("diamond")}
              className="rounded-lg border border-amber-300/40 px-3 py-2"
            >
              Diamond
            </button>
            <button
              onClick={() => setView("wheel")}
              className="rounded-lg border border-amber-300/40 px-3 py-2"
            >
              Wheel
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Event chart · {date} {time} · {location} · {timezone}
          </p>
          {energy && (
            <section
              aria-label="Independent sky energy"
              className="space-y-3 rounded-2xl border border-cyan-300/30 p-4"
            >
              <h2 className="font-serif text-xl">
                Independent Sky Contacts ({energy.contactsCount})
              </h2>
              <p>
                {energy.signal} · Harmony {energy.flowPct}% ({energy.flowWeight}{" "}
                points) · Friction {energy.frictionPct}% (
                {energy.frictionWeight} points)
              </p>
              <p className="text-xs text-slate-400">
                {energy.contactsCount} unique sky pairs · 5° orb · 1–5 intensity
                · minor contacts half weight
              </p>
              {energy.contactsCount === 0 && (
                <p role="status" className="text-sm text-slate-300">
                  No sky pairs fall within the 5° orb at this calculated event
                  time.
                </p>
              )}
              <details>
                <summary className="cursor-pointer text-cyan-200">
                  Full contact evidence
                </summary>
                <ul className="mt-2 space-y-1 text-xs">
                  {[...energy.contacts]
                    .sort((a, b) => a.orb - b.orb)
                    .map(c => (
                      <li key={c.id}>
                        {c.transit} {c.aspect} {c.natal} · {c.orb.toFixed(2)}° ·{" "}
                        {c.intensity}/5 · {c.stars} × {c.natalStars} ×{" "}
                        {c.majorFactor} = {c.strength} points
                      </li>
                    ))}
                </ul>
              </details>
            </section>
          )}
          {view === "diamond" ? (
            <DiamondChart chart={result} />
          ) : (
            <ChartWheel chart={result} />
          )}
        </section>
      )}
    </main>
  );
}
