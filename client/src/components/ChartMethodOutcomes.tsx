import { readingProse } from "@shared/readingProse";
import { PlanetStrengthChart, HouseStrengthChart } from "./VedicStrengthCharts";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";
import { VedicDivisionalCharts } from "./VedicDivisionalCharts";
import { VedicDashaTimeline } from "./VedicDashaTimeline";
import { VedicAshtakavarga } from "./VedicAshtakavarga";

const STATUS: Record<string, string> = {
  interpreted: "Calculated and interpreted",
  "reference-only": "Reference only · no personal calculation",
  "not-applicable": "Not applicable to this chart",
  "no-result": "Calculated · no qualifying result",
  failed: "Calculation or rule error",
};
/** Every method owns its own outcome; the whole-chart reading follows these records. */
export function ChartMethodOutcomes({
  chart,
  mode,
}: {
  chart: ChartResult;
  mode: "natal" | "transit" | "combined";
}) {
  const query = trpc.interpretation.methodOutcomes.useQuery(
    { chart, mode },
    { retry: false, staleTime: Infinity, refetchOnWindowFocus: false }
  );
  const renderMethods = (event: boolean) =>
    query.data?.methods
      .filter(m => m.methodId.startsWith("transit:") === event)
      .map((method, index) => (
        <article
          key={method.methodId}
          id={`method-${method.methodId.replace(":", "-")}`}
          className="space-y-4 rounded-2xl border border-amber-300/20 bg-slate-950/80 p-5"
        >
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-amber-200">
              Layer {index + 1} · {method.tradition} · {method.frame} view
            </p>
            <h3 className="font-serif text-xl font-semibold text-white">
              {method.methodName}
            </h3>
            <p
              className={
                method.status === "interpreted"
                  ? "text-sm text-emerald-200"
                  : "text-sm text-amber-200"
              }
            >
              {STATUS[method.status] ?? method.status}
            </p>
          </header>
          {method.status === "interpreted" && method.planetStrength && (
            <PlanetStrengthChart rows={method.planetStrength} />
          )}
          {method.status === "interpreted" && method.houseStrength && (
            <HouseStrengthChart rows={method.houseStrength} />
          )}
          {method.status === "interpreted" ? (
            <div className="space-y-5">
              {method.findingJudgments.map(finding => (
                <section
                  key={finding.id}
                  className="space-y-2 border-t border-white/10 pt-4"
                >
                  <h4 className="font-semibold text-cyan-100">
                    {finding.subject}
                  </h4>
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-200">
                    {readingProse(finding.judgment)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {finding.strength} testimony · {finding.valence} ·{" "}
                    {finding.frame ?? method.frame}
                  </p>
                  {finding.limitation && (
                    <p className="text-xs text-amber-200">
                      {finding.limitation}
                    </p>
                  )}
                  <details className="text-xs text-slate-400">
                    <summary className="cursor-pointer text-cyan-200">
                      Formula, rule and evidence for this outcome
                    </summary>
                    <p className="mt-2">{finding.mechanism}</p>
                    <p className="mt-2 break-words">
                      Evidence: {finding.evidenceIds.join(", ")}
                    </p>
                    {finding.rules.map(rule => (
                      <p key={rule.canonEvidenceId} className="mt-2">
                        {rule.ruleId} · {rule.sourceTitle}
                      </p>
                    ))}
                  </details>
                </section>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
              {readingProse(method.interpretation)} {readingProse(method.judgment)}
            </p>
          )}
          {!event && method.methodId === "vedic-vargas-divisional" && (
            <VedicDivisionalCharts chart={chart} />
          )}
          {!event && method.methodId === "vedic-dasha-and-ashtakavarga" && (
            <>
              <VedicDashaTimeline chart={chart} />
              <VedicAshtakavarga chart={chart} />
            </>
          )}
          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer text-cyan-200">
              Calculated inputs, results and sources
            </summary>
            <div className="mt-3 space-y-3">
              <p>
                Calculation: {method.formula} · Version:{" "}
                {method.calculationVersion}
              </p>
              <p>Required inputs: {method.prerequisites.join(", ")}</p>
              {method.calculatedFindings.map((finding, index) => (
                <div key={`${finding.evidenceId}-${index}`}>
                  <h4 className="font-semibold">{finding.label}</h4>
                  <pre className="mt-1 whitespace-pre-wrap break-words font-mono">
                    {finding.calculatedValue}
                  </pre>
                </div>
              ))}
              {method.strengthAndLimitations.map((text, index) => (
                <p key={index} className="text-amber-200">
                  {text}
                </p>
              ))}
            </div>
          </details>
        </article>
      ));
  return (
    <section aria-label="Individual method outcomes" className="space-y-5">
      <header className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-white">
          My Chart · Every method and its outcome
        </h2>
        <p className="text-sm leading-6 text-slate-300">
          Each layer applies its own formula to your calculated chart and
          explains its own findings. The whole-chart synthesis reads these same
          outcomes together.
        </p>
        <p className="text-xs text-slate-400">
          Planetary positions originate from astronomical ephemeris XYZ vectors
          and The Absolute’s custom fixed-firmament projection.
        </p>
      </header>
      {query.isLoading && (
        <p role="status" className="text-cyan-200">
          Calculating each method’s outcome…
        </p>
      )}
      {query.error && (
        <div role="alert" className="space-y-2 text-rose-200">
          <p>{query.error.message}</p>
          <button className="underline" onClick={() => query.refetch()}>
            Retry method outcomes
          </button>
        </div>
      )}
      {query.data && (
        <>
          <p className="text-xs text-cyan-200">
            {
              query.data.methods.filter(m => !m.methodId.startsWith("transit:"))
                .length
            }{" "}
            base-chart layers · Snapshot {query.data.snapshotId}
          </p>
          {renderMethods(false)}
          {query.data.methods.some(m => m.methodId.startsWith("transit:")) && (
            <section
              aria-label="Independent event method outcomes"
              className="space-y-5"
            >
              <h2 className="font-serif text-2xl text-violet-100">
                The event sky · Its own method outcomes
              </h2>
              <p className="text-sm text-slate-300">
                These results describe the selected event moment. Your
                birth-chart outcomes remain separate above.
              </p>
              {renderMethods(true)}
            </section>
          )}
          <p className="text-xs text-slate-400">
            Shadbala and Bhava Bala are independent calculated layers in this
            formation. Their formula variants, component arithmetic and source
            references remain available with their individual outcomes.
          </p>
        </>
      )}
    </section>
  );
}
