import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Download,
  FlaskConical,
  GitBranch,
  Layers,
  Scale,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";

type ReadingMode = "natal" | "transit" | "combined";

interface BehavioralIntelligencePanelProps {
  chart: ChartResult;
  mode: ReadingMode;
  question: string;
  onSelectPrompt?: (prompt: string) => void;
}

const CONFIDENCE_COLORS: Record<number, string> = {
  5: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  4: "border-cyan-300/40 bg-cyan-400/15 text-cyan-100",
  3: "border-violet-300/40 bg-violet-400/15 text-violet-100",
  2: "border-amber-300/35 bg-amber-400/15 text-amber-100",
  1: "border-white/20 bg-white/10 text-slate-300",
};

const EVENT_CONFIDENCE_COLORS: Record<string, string> = {
  E5: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  E4: "border-cyan-300/40 bg-cyan-400/15 text-cyan-100",
  E3: "border-violet-300/40 bg-violet-400/15 text-violet-100",
  E2: "border-amber-300/35 bg-amber-400/15 text-amber-100",
  E1: "border-white/20 bg-white/10 text-slate-300",
};

const CHANNEL_LABELS: Record<string, string> = {
  planet: "Planet",
  sign: "Sign",
  house: "House",
  aspect: "Aspect",
  angularity: "Angularity",
  repetition: "Repetition",
  development: "Development",
  "god-agent": "God ↔ Agent Frame",
  overlay: "Star / Lunar Overlay",
};

const TRANSLATION_PIPELINE = [
  "Traditional Knowledge",
  "Structured Knowledge",
  "Deterministic Calculation",
  "Evidence",
  "Pattern Recognition",
  "Simulation / Comparison",
  "Master Interpretation",
  "Personal Understanding",
];

export function BehavioralIntelligencePanel({
  chart,
  mode,
  question,
  onSelectPrompt,
}: BehavioralIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<
    "all-about-you" | "behaviors" | "simulation-lab" | "polarities" | "events"
  >("all-about-you");
  const [expandedBehaviorId, setExpandedBehaviorId] = useState<string | null>(
    null
  );
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const reportQuery = trpc.astrologyKnowledge.behavioralReport.useQuery({
    chart,
    question: question || "Who am I, really? What should I understand from this chart?",
    mode,
  });

  const report = reportQuery.data;

  const downloadSelfKnowledgeDossier = () => {
    if (!report) return;
    const lines: string[] = [
      "# THE FIRMAMENT: KNOW YOURSELF THROUGH THE PATTERNS",
      `## Personal Self-Knowledge Dossier — ${chart.input.location || "God View"} (${chart.input.date || "Current Sky"})`,
      "",
      "- **THE FIRST LAYER:** ALL ABOUT YOU",
      "- **THE QUESTION:** WHO AM I?",
      "- **THE METHOD:** PATTERN. EVIDENCE. INTERPRETATION.",
      "- **THE PURPOSE:** UNDERSTANDING YOURSELF.",
      "",
      "---",
      "",
      "## I. ALL ABOUT YOU — THE 16 SELF-EXAMINATION DIMENSIONS",
      ...report.allAboutYouProfile.flatMap(item => [
        `### ${item.question}`,
        item.synthesis,
        `**Astrological Pattern Evidence:** ${item.astrologicalProof.join(" · ") || "Whole-chart synthesis"}`,
        "",
      ]),
      "---",
      "",
      "## II. DOMINANT BEHAVIORAL PATTERNS (7-Channel Convergence)",
      ...report.dominantBehaviors.flatMap(b => [
        `### #${b.codeNumber} ${b.name} (${b.confidenceLabel} | State: ${b.state})`,
        `${b.languagePrefix} ${b.definition}`,
        `- **Triggers:** ${b.triggerPatterns.join(", ")}`,
        `- **Underlying Motivation:** ${b.motivationPatterns.join(", ")}`,
        `- **Internal Experience:** ${b.internalExpression}`,
        `- **External Expression:** ${b.externalExpression}`,
        `- **Automatic Response (${b.responseStyle}):** ${b.automaticExpression}`,
        `- **Repeating Loop:** ${b.repeatingCycle}`,
        `- **Protective Compensation:** ${b.compensationPattern}`,
        `- **Constructive Expression:** ${b.constructiveExpression}`,
        `- **Shadow / Cost:** ${b.shadowExpression}`,
        `- **Mature Integration:** ${b.developmentalTrajectory.mature}`,
        `- **God ↔ Agent View:** ${b.godToAgentSynthesis}`,
        `- **Evidence Channels:** ${b.supportingEvidence.map(e => `[${e.channel}] ${e.detail}`).join("; ")}`,
        "",
      ]),
      "---",
      "",
      "## III. SIMULATION & 16-SYSTEM CONVERGENCE LAB",
      ...report.convergenceSimulationLab.simulationComparisons.flatMap(sim => [
        `### ${sim.title}`,
        `- **Question Tested:** ${sim.hypothesisTested}`,
        `- **Surface / Baseline View:** ${sim.surfaceOrBaselineView}`,
        `- **Convergent Pattern Reality:** ${sim.convergentPatternReality}`,
        `- **Verdict:** ${sim.verdict}`,
        "",
      ]),
      "### 16-System Convergence Audit",
      ...report.convergenceSimulationLab.sixteenSystems.map(
        sys => `- **${sys.system}** (${sys.category}): ${sys.evidenceSummary}`
      ),
      "",
      "---",
      "",
      "## IV. POLARITY & CONTRADICTION AXES",
      ...report.polarityAxes.map(
        ax =>
          `- **${ax.leftPole} (${ax.leftScore}) ↔ ${ax.rightPole} (${ax.rightScore})**: ${ax.synthesis}`
      ),
      "",
      "---",
      "",
      "## V. LIFE-EVENT & SITUATION SIGNATURES",
      ...report.activeLifeEvents.flatMap(ev => [
        `### #${ev.codeNumber} ${ev.name} (${ev.confidenceLabel} | ${ev.temporalState})`,
        ev.definition,
        `- **Possible Manifestations:** ${ev.possibleManifestations.join("; ")}`,
        `- **God ↔ Agent Translation:** ${ev.godToAgentTranslation}`,
        `- **Developmental Meaning:** ${ev.developmentalMeaning}`,
        `- **Supporting Evidence:** ${ev.supportingEvidence.join("; ")}`,
        "",
      ]),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const slug = (chart.input.location || "firmament")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    link.download = `the-firmament-who-am-i-${slug}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (reportQuery.isLoading) {
    return (
      <Card className="mx-auto max-w-5xl border-cyan-200/15 bg-black/25 text-slate-200">
        <CardContent className="flex items-center gap-3 p-6 text-sm text-slate-400">
          <Brain className="h-5 w-5 animate-pulse text-cyan-300" />
          Translating 16 astrological systems into your personal Self-Knowledge
          & Pattern Intelligence profile…
        </CardContent>
      </Card>
    );
  }

  if (!report) return null;

  const activeBehavior =
    report.dominantBehaviors.find(b => b.id === expandedBehaviorId) ??
    report.dominantBehaviors[0];

  return (
    <Card className="mx-auto max-w-5xl overflow-hidden border-cyan-200/20 bg-gradient-to-br from-slate-950/95 via-cyan-950/20 to-violet-950/25 text-slate-100 shadow-2xl shadow-cyan-950/25">
      <CardHeader className="border-b border-white/10 px-5 py-6 sm:px-7">
        {/* Core Firmament Manifesto Banner */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-cyan-200/15 bg-black/35 p-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/[0.03] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              The First Layer
            </div>
            <div className="mt-0.5 font-serif text-sm font-medium text-white">
              ALL ABOUT YOU
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              The Central Question
            </div>
            <div className="mt-0.5 font-serif text-sm font-medium text-white">
              WHO AM I?
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
              The Method
            </div>
            <div className="mt-0.5 font-serif text-sm font-medium text-white">
              PATTERN · EVIDENCE
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              The Purpose
            </div>
            <div className="mt-0.5 font-serif text-sm font-medium text-white">
              KNOW YOURSELF
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <Brain className="h-4 w-4" /> THE FIRMAMENT · Know Yourself
              Through the Patterns
            </div>
            <CardTitle className="mt-1.5 font-serif text-2xl text-white sm:text-3xl">
              “Who Am I, Really?” — Your Pattern & Evidence Architecture
            </CardTitle>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">
              Built for serious self-examination. Every conclusion below is
              derived deterministically from the convergence of 16 astrological
              factors—showing you not only <em>what</em> patterns repeat in your
              life, but <em>where</em> they come from in your chart.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadSelfKnowledgeDossier}
              className="border-cyan-300/35 bg-cyan-300/10 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/20"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Save Self-Knowledge Dossier
            </Button>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="outline"
                className="border-cyan-300/30 bg-cyan-300/10 px-2.5 py-0.5 text-[11px] text-cyan-100"
              >
                16 Self-Dimensions
              </Badge>
              <Badge
                variant="outline"
                className="border-violet-300/30 bg-violet-300/10 px-2.5 py-0.5 text-[11px] text-violet-100"
              >
                {report.dominantBehaviors.length} Convergent Patterns
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-300/30 bg-emerald-300/10 px-2.5 py-0.5 text-[11px] text-emerald-100"
              >
                16 Systems Audited
              </Badge>
            </div>
          </div>
        </div>

        {/* Electronic Translation Pipeline */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5">
          <div className="flex min-w-max items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-300">
            <span className="mr-1 font-semibold text-cyan-300">
              Electronic Translation:
            </span>
            {TRANSLATION_PIPELINE.map((step, idx) => (
              <span key={step} className="flex items-center gap-1.5">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-slate-200">
                  {step}
                </span>
                {idx < TRANSLATION_PIPELINE.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-cyan-300/60" />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <button
            type="button"
            onClick={() => setActiveTab("all-about-you")}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === "all-about-you"
                ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100 shadow-sm"
                : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            All About You
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("behaviors")}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === "behaviors"
                ? "border-violet-300/60 bg-violet-300/15 text-violet-100 shadow-sm"
                : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            Behavioral Patterns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulation-lab")}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === "simulation-lab"
                ? "border-emerald-300/60 bg-emerald-300/15 text-emerald-100 shadow-sm"
                : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Simulation & 16 Systems
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("polarities")}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
              activeTab === "polarities"
                ? "border-amber-300/60 bg-amber-300/15 text-amber-100 shadow-sm"
                : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            Contradictions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`col-span-2 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:col-span-1 ${
              activeTab === "events"
                ? "border-rose-300/60 bg-rose-300/15 text-rose-100 shadow-sm"
                : "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            Life Themes
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-7">
        {/* TAB 1: ALL ABOUT YOU — WHO AM I? (16 DIMENSIONS) */}
        {activeTab === "all-about-you" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-950/20 p-4 sm:p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                The Central Question: “Who Are You?”
              </div>
              <p className="mt-1.5 text-sm leading-6 text-slate-200">
                This reading was built around you—not a single zodiac sign. Below
                are the 16 foundational self-knowledge questions investigated
                from your natal and transit convergence, paired with the exact
                chart evidence that produced each conclusion.
              </p>
            </div>

            <div className="grid gap-3.5 md:grid-cols-2">
              {report.allAboutYouProfile.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-300/30"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-300">
                        {String(index + 1).padStart(2, "0")} · Self-Inquiry
                      </span>
                      {onSelectPrompt && (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectPrompt(
                              `Go deeper into "${item.question}" in my chart: explain the pattern, the evidence (${item.astrologicalProof.join(", ")}), and how it shows up in my real life.`
                            )
                          }
                          className="text-[11px] font-medium text-cyan-200/80 hover:text-cyan-100"
                        >
                          Explore with Guide →
                        </button>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <h4 className="font-serif text-lg text-white">
                        {item.question}
                      </h4>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-200">
                        2026 Living
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs sm:text-[13px] leading-6 text-slate-200">
                      {item.synthesis}
                    </p>
                  </div>

                  {item.astrologicalProof.length > 0 && (
                    <div className="mt-3.5 border-t border-white/10 pt-2.5">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Where This Comes From in Your Chart:
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.astrologicalProof.map((proof, i) => (
                          <span
                            key={i}
                            className="rounded-md border border-cyan-300/20 bg-cyan-300/[0.07] px-2 py-0.5 text-[11px] text-cyan-100"
                          >
                            {proof}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DOMINANT BEHAVIORAL PATTERNS */}
        {activeTab === "behaviors" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>
                Ordered by 7-channel convergence strength. Click any pattern to
                inspect its Trigger → Response → Motivation → Self-Sabotage →
                Maturity chain and where it comes from in the chart.
              </span>
            </div>

            <div className="space-y-3">
              {report.dominantBehaviors.map(behavior => {
                const isExpanded =
                  (expandedBehaviorId ?? activeBehavior?.id) === behavior.id;
                const activeChannelSet = new Set(
                  behavior.supportingEvidence.map(e => e.channel)
                );
                return (
                  <div
                    key={behavior.id}
                    className={`rounded-2xl border transition ${
                      isExpanded
                        ? "border-cyan-300/40 bg-cyan-950/25"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBehaviorId(isExpanded ? null : behavior.id)
                      }
                      className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] text-cyan-300/80">
                            #{behavior.codeNumber}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            {behavior.domainLabel}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                              CONFIDENCE_COLORS[behavior.confidenceLevel] ??
                              CONFIDENCE_COLORS[1]
                            }`}
                          >
                            {behavior.confidenceLabel}
                          </span>
                          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
                            State: {behavior.state}
                          </span>
                          <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-0.5 text-[11px] text-violet-200">
                            Response: {behavior.responseStyle}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl text-white">
                          {behavior.name}
                        </h4>
                        <p className="text-sm leading-6 text-slate-300">
                          <span className="font-medium text-cyan-200">
                            {behavior.languagePrefix}{" "}
                          </span>
                          {behavior.definition}
                        </p>
                      </div>
                      <div className="mt-1 shrink-0 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-cyan-300" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-5 border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                        {/* 7-Channel Evidence Badges */}
                        <div>
                          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                            Convergent Astrological Channels (
                            {behavior.supportingEvidence.length} Testimony
                            Signals)
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              [
                                "planet",
                                "sign",
                                "house",
                                "aspect",
                                "angularity",
                                "repetition",
                                "development",
                                "god-agent",
                                "overlay",
                              ] as const
                            ).map(ch => {
                              const active = activeChannelSet.has(ch);
                              return (
                                <span
                                  key={ch}
                                  className={`rounded-lg border px-2.5 py-1 text-xs ${
                                    active
                                      ? "border-cyan-300/40 bg-cyan-300/15 font-medium text-cyan-100"
                                      : "border-white/5 bg-white/[0.02] text-slate-600"
                                  }`}
                                >
                                  {CHANNEL_LABELS[ch]}
                                </span>
                              );
                            })}
                          </div>
                          <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-300">
                            {behavior.supportingEvidence.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 rounded-lg bg-black/25 px-3 py-1.5"
                              >
                                <span className="mt-0.5 font-mono text-[10px] uppercase text-cyan-300">
                                  [{item.channel}]
                                </span>
                                <span>{item.detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Trigger -> Response -> Motivation -> Loop Grid */}
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                              1. What Triggers You
                            </div>
                            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                              {behavior.triggerPatterns.map(tr => (
                                <li key={tr}>• {tr}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                              2. What Motivates You
                            </div>
                            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                              {behavior.motivationPatterns.map(mot => (
                                <li key={mot}>• {mot}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                              3. Inside vs. Outside Experience
                            </div>
                            <p className="mt-2 text-xs leading-5 text-slate-300">
                              <strong className="text-slate-100">
                                Inside:
                              </strong>{" "}
                              {behavior.internalExpression}
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300">
                              <strong className="text-slate-100">
                                Outside:
                              </strong>{" "}
                              {behavior.externalExpression}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-300">
                              4. Automatic Reflex & Repeating Loop
                            </div>
                            <p className="mt-2 text-xs leading-5 text-slate-300">
                              <strong className="text-slate-100">
                                Automatic reflex:
                              </strong>{" "}
                              {behavior.automaticExpression}
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300">
                              <strong className="text-slate-100">
                                Repeating cycle:
                              </strong>{" "}
                              {behavior.repeatingCycle}
                            </p>
                          </div>
                        </div>

                        {/* Constructive / Shadow / Mature */}
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-xl border border-emerald-300/20 bg-emerald-950/20 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                              What Strengthens You (Constructive)
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300">
                              {behavior.constructiveExpression}
                            </p>
                          </div>

                          <div className="rounded-xl border border-rose-300/20 bg-rose-950/20 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-300">
                              Where You Self-Sabotage (Shadow)
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300">
                              {behavior.shadowExpression}
                            </p>
                          </div>

                          <div className="rounded-xl border border-cyan-300/20 bg-cyan-950/20 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                              Conscious Integration (Mature)
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-slate-300">
                              {behavior.developmentalTrajectory.mature}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-violet-300/20 bg-violet-950/15 p-3.5 text-xs leading-5 text-slate-300">
                          <strong className="uppercase tracking-wider text-violet-300">
                            God View ↔ Agent View Synthesis:
                          </strong>{" "}
                          {behavior.godToAgentSynthesis}
                        </div>

                        {behavior.counterEvidence.length > 0 && (
                          <div className="rounded-xl border border-amber-300/20 bg-amber-950/15 p-3 text-xs leading-5 text-amber-100/90">
                            <strong className="uppercase tracking-wider text-amber-300">
                              Counter-evidence & Modifiers:
                            </strong>{" "}
                            {behavior.counterEvidence.join(" · ")}
                          </div>
                        )}

                        {onSelectPrompt && (
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onSelectPrompt(
                                  `How does my "${behavior.name}" pattern show up in my daily life and relationships, where did it come from in my chart, and what is the mature step forward?`
                                )
                              }
                              className="border-cyan-300/30 bg-cyan-300/10 text-xs text-cyan-100 hover:bg-cyan-300/20"
                            >
                              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                              Ask the guide about {behavior.name}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SIMULATION & 16-SYSTEM CONVERGENCE LAB */}
        {activeTab === "simulation-lab" && (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                <FlaskConical className="h-4 w-4" /> Simulation & Comparison Lab
                — Why Convergence Beats Surface Horoscopes
              </div>
              <p className="mb-4 text-xs leading-5 text-slate-400">
                The Simulation Lab compares surface single-factor assumptions
                against your full multi-system convergence so you can see
                precisely why this reading fits you as an individual.
              </p>
              <div className="space-y-3">
                {report.convergenceSimulationLab.simulationComparisons.map(
                  sim => (
                    <div
                      key={sim.id}
                      className="rounded-2xl border border-emerald-300/25 bg-emerald-950/15 p-4 sm:p-5"
                    >
                      <h4 className="font-serif text-lg text-white">
                        {sim.title}
                      </h4>
                      <p className="mt-1 text-xs text-emerald-200/90">
                        <strong>Question Tested:</strong> {sim.hypothesisTested}
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-slate-300">
                          <div className="font-semibold uppercase tracking-wider text-slate-400">
                            Surface / Baseline View
                          </div>
                          <p className="mt-1">{sim.surfaceOrBaselineView}</p>
                        </div>
                        <div className="rounded-xl border border-cyan-300/25 bg-cyan-950/25 p-3 text-xs leading-5 text-slate-200">
                          <div className="font-semibold uppercase tracking-wider text-cyan-300">
                            Full-Pattern Convergence Reality
                          </div>
                          <p className="mt-1">{sim.convergentPatternReality}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{sim.verdict}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <Layers className="h-4 w-4" /> The 16 Astrological Systems
                Audited in Your Firmament
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {report.convergenceSimulationLab.sixteenSystems.map(sys => (
                  <div
                    key={sys.system}
                    className="rounded-xl border border-white/10 bg-black/25 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {sys.system}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                          sys.status === "convergent"
                            ? "bg-emerald-400/15 text-emerald-200"
                            : "bg-cyan-400/15 text-cyan-200"
                        }`}
                      >
                        {sys.status}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                      {sys.category}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">
                      {sys.evidenceSummary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Planetary Pair Interaction Matrix */}
            <div className="border-t border-white/10 pt-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                <Zap className="h-4 w-4" /> Planetary Pair Interaction Matrix
              </div>
              {report.planetInteractions.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {report.planetInteractions.map(inter => (
                    <div
                      key={`${inter.pair}-${inter.aspect}`}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif text-lg text-white">
                          {inter.pair} — {inter.coreTheme}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-emerald-300/30 bg-emerald-300/10 text-[11px] text-emerald-200"
                        >
                          {inter.aspect} ({inter.orb.toFixed(1)}°)
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-300">
                        {inter.behavioralMechanism}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-emerald-300/15 bg-emerald-950/20 p-2.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                            Constructive
                          </div>
                          <div className="mt-1 text-slate-300">
                            {inter.constructive}
                          </div>
                        </div>
                        <div className="rounded-lg border border-rose-300/15 bg-rose-950/20 p-2.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
                            Shadow
                          </div>
                          <div className="mt-1 text-slate-300">
                            {inter.shadow}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No tight major planetary pair matrix contacts within 6° in
                  this configuration.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: POLARITY & CONTRADICTION AXES */}
        {activeTab === "polarities" && (
          <div className="space-y-4">
            <p className="text-xs leading-5 text-slate-400">
              Serious self-knowledge requires seeing where two real parts of you
              pull in opposite directions. When both sides of an axis are
              supported by your chart, the tension itself is the pattern.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {report.polarityAxes.map(axis => (
                <div
                  key={axis.id}
                  className={`rounded-2xl border p-4 ${
                    axis.isDynamicTension
                      ? "border-amber-300/35 bg-amber-950/20"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif text-lg text-white">
                      {axis.leftPole} ↔ {axis.rightPole}
                    </span>
                    {axis.isDynamicTension && (
                      <Badge className="bg-amber-400/20 text-[10px] text-amber-200">
                        Active Contradiction
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="w-28 truncate text-cyan-200">
                      {axis.leftPole} ({axis.leftScore})
                    </span>
                    <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="bg-cyan-400 transition-all"
                        style={{
                          width: `${
                            axis.leftScore + axis.rightScore > 0
                              ? (axis.leftScore /
                                  (axis.leftScore + axis.rightScore)) *
                                100
                              : 50
                          }%`,
                        }}
                      />
                      <div
                        className="bg-violet-400 transition-all"
                        style={{
                          width: `${
                            axis.leftScore + axis.rightScore > 0
                              ? (axis.rightScore /
                                  (axis.leftScore + axis.rightScore)) *
                                100
                              : 50
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-28 truncate text-right text-violet-200">
                      {axis.rightPole} ({axis.rightScore})
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-300">
                    {axis.synthesis}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="rounded-lg bg-black/25 p-2">
                      <div className="font-semibold text-cyan-300">
                        {axis.leftPole} signals
                      </div>
                      <div className="mt-1">
                        {axis.leftEvidence.length
                          ? axis.leftEvidence.slice(0, 3).join(", ")
                          : "Baseline"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/25 p-2">
                      <div className="font-semibold text-violet-300">
                        {axis.rightPole} signals
                      </div>
                      <div className="mt-1">
                        {axis.rightEvidence.length
                          ? axis.rightEvidence.slice(0, 3).join(", ")
                          : "Baseline"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {report.activeHouseAxes.length > 0 && (
              <div className="border-t border-white/10 pt-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  <Activity className="h-4 w-4" /> Activated House Polarity Axes
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {report.activeHouseAxes.map(ax => (
                    <div
                      key={ax.name}
                      className="rounded-xl border border-white/10 bg-black/25 p-3.5"
                    >
                      <div className="font-semibold text-white">{ax.name}</div>
                      <p className="mt-1 text-xs text-slate-400">
                        {ax.narrative}
                      </p>
                      <p className="mt-2 text-xs text-cyan-200">
                        {ax.evidence.join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LIFE-EVENT SIGNATURES & SEQUENCES */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Recurring life themes and active chapters evaluated across Natal
                Promise → Activated House → House Ruler → Transit Contact → God
                View ↔ Agent View Translation.
              </div>
              {report.activeLifeEvents.map(ev => {
                const isExpanded = expandedEventId === ev.id;
                return (
                  <div
                    key={ev.id}
                    className={`rounded-2xl border transition ${
                      isExpanded
                        ? "border-violet-300/40 bg-violet-950/25"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedEventId(isExpanded ? null : ev.id)
                      }
                      className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] text-violet-300/80">
                            #{ev.codeNumber}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            {ev.categoryLabel}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                              EVENT_CONFIDENCE_COLORS[ev.confidenceCode] ??
                              EVENT_CONFIDENCE_COLORS.E1
                            }`}
                          >
                            {ev.confidenceLabel}
                          </span>
                          <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] text-cyan-200">
                            {ev.temporalState}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl text-white">
                          {ev.name}
                        </h4>
                        <p className="text-sm leading-6 text-slate-300">
                          {ev.definition}
                        </p>
                      </div>
                      <div className="mt-1 shrink-0 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-violet-300" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="space-y-4 border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                              Possible Lived Manifestations
                            </div>
                            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                              {ev.possibleManifestations.map(m => (
                                <li key={m}>• {m}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                              Alternative / Internal Expressions
                            </div>
                            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300">
                              {ev.alternativeManifestations.map(m => (
                                <li key={m}>• {m}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-xl border border-cyan-300/20 bg-cyan-950/20 p-3.5">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                            God View ↔ Agent View Event Translation
                          </div>
                          <p className="mt-1.5 text-xs leading-5 text-slate-200">
                            {ev.godToAgentTranslation}
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-300/20 bg-emerald-950/20 p-3.5">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                            Developmental Meaning (Event → Experience →
                            Development)
                          </div>
                          <p className="mt-1.5 text-xs leading-5 text-slate-200">
                            {ev.developmentalMeaning}
                          </p>
                        </div>

                        <div>
                          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Supporting Chart Testimony
                          </div>
                          <ul className="space-y-1 text-xs text-slate-300">
                            {ev.supportingEvidence.map((s, idx) => (
                              <li
                                key={idx}
                                className="rounded-lg bg-black/25 px-3 py-1.5"
                              >
                                • {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <div>
                            <span className="text-slate-500">
                              Sequence chain:
                            </span>{" "}
                            {ev.sequencePredecessors.join(", ")} →{" "}
                            <strong className="text-violet-200">
                              {ev.name}
                            </strong>{" "}
                            → {ev.sequenceSuccessors.join(", ")}
                          </div>
                          {onSelectPrompt && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onSelectPrompt(
                                  `What does the "${ev.name}" life-event signature (${ev.temporalState}) mean for me right now, and how should I navigate it wisely?`
                                )
                              }
                              className="border-violet-300/30 bg-violet-300/10 text-xs text-violet-100 hover:bg-violet-300/20"
                            >
                              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                              Ask the guide about {ev.name}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {report.eventSequences.length > 0 && (
              <div className="space-y-3 border-t border-white/10 pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  <GitBranch className="h-4 w-4" /> Multi-Stage Event Sequence
                  Chains
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {report.eventSequences.map(seq => (
                    <div
                      key={seq.id}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-serif text-lg text-white">
                          {seq.name}
                        </h5>
                        <Badge
                          variant="outline"
                          className="border-cyan-300/30 bg-cyan-300/10 text-[10px] text-cyan-200"
                        >
                          {Math.round(seq.strength * 100)}% Active
                        </Badge>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-cyan-200">
                        {seq.activeStages.map((st, idx) => (
                          <span key={st} className="flex items-center gap-1.5">
                            <span className="rounded-md bg-white/10 px-2 py-0.5">
                              {st}
                            </span>
                            {idx < seq.activeStages.length - 1 && (
                              <span className="text-slate-500">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-300">
                        {seq.narrative}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-emerald-200/90">
                        <strong>Development:</strong> {seq.developmentalMeaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-slate-400">
              <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-slate-300">
                <ShieldAlert className="h-4 w-4 text-cyan-300" /> The Firmament
                Standard of Self-Inquiry
              </div>
              <p className="mt-1.5">
                The system presents the astrological tradition and the
                convergent patterns it identifies. You decide what resonates,
                what you reject, and what you do with the understanding.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
