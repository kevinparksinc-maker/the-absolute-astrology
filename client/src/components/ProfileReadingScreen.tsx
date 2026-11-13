import { Link, useLocation } from "wouter";
import { MasterSynthesizerPanel } from "./MasterSynthesizerPanel";
import type { ChartResult } from "../../../server/astronomy";
import type { ReadingScope } from "../../../server/astrologyCore";
export type ProfileReadingScreenProps = {
  chart: ChartResult;
  readingView: "guided" | "evidence";
  onReadingViewChange: (view: "guided" | "evidence") => void;
  readingMode: ReadingScope;
  readingQuestion: string;
  interpreterPrompt: string | null;
  onClearInterpreterPrompt: () => void;
  onLoadSampleChart: () => void;
  onOpenProfileBuilder: () => void;
  onReadingModeChange: (mode: ReadingScope) => void;
};
export function ProfileReadingScreen({
  chart,
  interpreterPrompt,
}: ProfileReadingScreenProps) {
  const [path] = useLocation();
  const view = path.endsWith("/evidence")
    ? "evidence"
    : path.endsWith("/depth")
      ? "full"
      : "summary";
  return (
    <section className="mx-auto max-w-4xl space-y-8 pb-24 text-slate-100">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-amber-200">
          The Absolute · Your reading
        </p>
        <h1 className="font-serif text-3xl">
          {view === "summary"
            ? "The main message"
            : view === "full"
              ? "Your full interpretation"
              : "The calculation evidence"}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          {view === "summary"
            ? "Begin with the strongest calculated patterns. Follow the explanation and evidence when you want to go deeper."
            : view === "full"
              ? "Explore how the chart's methods combine, reinforce or challenge each other."
              : "Inspect the methods, evidence IDs, sources and coverage behind the reading."}
        </p>
      </header>
      <nav aria-label="Reading pages" className="flex flex-wrap gap-3">
        {[
          { href: "/reading", label: "1 · Summary" },
          { href: "/reading/depth", label: "2 · Explanation" },
          { href: "/reading/evidence", label: "3 · Evidence" },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={path === item.href ? "page" : undefined}
            className={`rounded-xl border px-4 py-3 text-sm ${path === item.href ? "border-amber-200/50 bg-amber-200/10 text-amber-100" : "border-white/15 text-slate-300"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <section id="master-interpreter-section">
        <MasterSynthesizerPanel
          chart={chart}
          initialQuestion={interpreterPrompt || undefined}
          presentation={view}
        />
      </section>
      <nav
        aria-label="Explore after your reading"
        className="flex flex-wrap gap-5 border-t border-white/10 pt-6 text-sm text-cyan-200"
      >
        <Link href="/chart">View chart →</Link>
        <Link href="/life-story">Life story →</Link>
        <Link href="/guide?tab=blueprint">Guide & patterns →</Link>
        <Link href="/energy/consultation">Current transit reading →</Link>
      </nav>
    </section>
  );
}
