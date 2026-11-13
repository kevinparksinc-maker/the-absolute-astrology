import { useState } from "react";
import { Link } from "wouter";
import { searchDirectory } from "@/config/appDirectory";
export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const results = searchDirectory(query);
  return (
    <main className="mx-auto max-w-5xl space-y-9 pb-24 text-slate-100">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-amber-200">
          The Absolute · Page index
        </p>
        <h1 className="font-serif text-3xl">Find your next step</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          Start with your chart and reading. Open timing, relationship tools or
          deeper evidence when you need them.
        </p>
      </header>
      <Link href="/horary" className="block rounded-2xl border border-amber-300/40 bg-amber-300/10 p-5 transition hover:border-amber-200/70">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">Featured observatory</p>
        <h2 className="mt-2 font-serif text-2xl text-white">Open Horary Chamber →</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Ask a specific question, cast its event-time chart, and inspect the God and Agent frames with traditional testimony.</p>
      </Link>
      <label className="block space-y-2 text-sm text-slate-300">
        <span>Search all pages</span>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Try “transit”, “evidence” or “saved”…"
          className="w-full rounded-xl border border-white/15 bg-slate-950/70 p-4 text-white"
        />
      </label>
      {Array.from(new Set(results.map(item => item.group))).map(group => (
        <section key={group} className="space-y-4">
          <h2 className="font-serif text-xl text-amber-100">{group}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {results
              .filter(item => item.group === group)
              .map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-cyan-200/35"
                >
                  <h3 className="font-semibold">{item.title} →</h3>
                  <p className="text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      ))}
      {!results.length && (
        <p role="status">No matching pages. Try another word.</p>
      )}
    </main>
  );
}
