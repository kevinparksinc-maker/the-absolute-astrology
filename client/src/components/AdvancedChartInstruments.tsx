import { lazy, Suspense, useState } from "react";
import { BookOpen, ChevronDown, Loader2 } from "lucide-react";
import type { ChartResult } from "../../../server/astronomy";

const AdvancedSkyWheel = lazy(() => import("./SkyObservatoryWheel").then(module => ({ default: module.SkyObservatoryWheel })));
const AdvancedChartWheel = lazy(() => import("./ChartWheel").then(module => ({ default: module.ChartWheel })));

export function AdvancedChartInstruments({ chart }: { chart: ChartResult }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="guardian-advanced-tools overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-r from-amber-100/[0.045] to-cyan-100/[0.025] p-4 sm:p-6">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="guardian-advanced-wheel-content"
        onClick={() => setOpen(current => !current)}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg text-left text-sm font-semibold text-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
      >
        <BookOpen className="h-5 w-5 shrink-0 text-amber-200" aria-hidden="true" />
        <span className="flex-1">{open ? "Hide" : "Open"} advanced chart instruments — full observatory, aspects, dignities, and technical overlays</span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id="guardian-advanced-wheel-content" className="mt-4 space-y-6">
          <p className="text-xs leading-6 text-slate-300">The complete original chart instruments remain available for detailed study. They use the same chart calculation shown in the guided view.</p>
          <Suspense fallback={<p role="status" className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-6 text-sm text-cyan-100"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true"/>Opening advanced chart instruments…</p>}>
            <AdvancedSkyWheel chart={chart} />
            <AdvancedChartWheel chart={chart} />
          </Suspense>
        </div>
      )}
    </section>
  );
}
