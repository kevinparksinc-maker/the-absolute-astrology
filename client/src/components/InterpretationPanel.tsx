import { readingCacheIdentity } from "@shared/readingIdentity";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  Check,
  Compass,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { AudioReader } from "@/components/AudioReader";
import { BehavioralIntelligencePanel } from "@/components/BehavioralIntelligencePanel";
import { Interpreter2050 } from "@/components/Interpreter2050";
import type { ChartResult } from "../../../server/astronomy";
import type { AstrologyEvidencePacket } from "../../../server/astrologyKnowledge/types";
import { startLogin } from "@/const";

type ReadingMode = "natal" | "transit" | "combined";
type ChapterStatus = "pending" | "loading" | "complete" | "error";
type Chapter = {
  id: string;
  title: string;
  subtitle: string;
  focus: string;
  status: ChapterStatus;
  content?: string;
  error?: string;
};
type Interpretation = {
  intelligence: string;
  evidencePacket?: AstrologyEvidencePacket;
  analysis?: string;
  reading: string;
  generatedAt: string;
  chapters: Chapter[];
};

const READING_MEMORY_CACHE = new Map<
  string,
  { interpretation: Interpretation; messages: Message[] }
>();

const getReadingCacheKey = readingCacheIdentity;

function loadCachedReading(
  chart: ChartResult,
  mode: ReadingMode,
  question = "",
  accountId = "guest"
): { interpretation: Interpretation; messages: Message[] } | null {
  const key = getReadingCacheKey(chart, mode, question, accountId);
  const inMem = READING_MEMORY_CACHE.get(key);
  if (inMem) return inMem;
  try {
    if (typeof window !== "undefined") {
      const raw =
        window.sessionStorage.getItem(key) ??
        window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          interpretation: Interpretation;
          messages: Message[];
        };
        if (parsed?.interpretation?.chapters) {
          const normalized: Interpretation = {
            ...parsed.interpretation,
            chapters: parsed.interpretation.chapters.map(ch =>
              ch.status === "loading" ? { ...ch, status: "pending" } : ch
            ),
          };
          const entry = {
            interpretation: normalized,
            messages: parsed.messages ?? [],
          };
          READING_MEMORY_CACHE.set(key, entry);
          return entry;
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

function saveCachedReading(
  chart: ChartResult,
  mode: ReadingMode,
  interpretation: Interpretation | null,
  messages: Message[],
  question = "",
  accountId = "guest"
) {
  if (!interpretation) return;
  const key = getReadingCacheKey(chart, mode, question, accountId);
  const payload = { interpretation, messages };
  READING_MEMORY_CACHE.set(key, payload);
  try {
    if (typeof window !== "undefined") {
      const serialized = JSON.stringify(payload);
      window.sessionStorage.setItem(key, serialized);
      window.localStorage.setItem(key, serialized);
    }
  } catch {
    // Ignore storage quota errors
  }
}
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
function followUpPrompts(question: string) {
  const q = question.toLowerCase();
  if (/relationship|love|partner|dating|marriage|friend|family|trust/.test(q))
    return [
      "What pattern do I repeat when I feel emotionally unsafe?",
      "How can I set a boundary without closing my heart?",
      "What is this transit asking me to understand about reciprocity?",
    ];
  if (/work|career|money|purpose|success|business|job|calling/.test(q))
    return [
      "What strength in my chart am I underusing at work?",
      "Where might fear be shaping my career decisions?",
      "What practical choice would align me with this transit?",
    ];
  if (/future|when|how long|change|next|timing|will/.test(q))
    return [
      "What is the mature lesson beneath this current activation?",
      "What can I do now instead of waiting for certainty?",
      "What evidence would show that I am moving through this well?",
    ];
  if (/feel|emotion|anxious|pressure|sad|angry|hurt|stress|overwhelm/.test(q))
    return [
      "What need is underneath this reaction?",
      "How does my protective strategy help me—and what does it cost?",
      "What would self-respect look like in the next real-life moment?",
    ];
  return [
    "What deeper pattern is this question pointing toward?",
    "How might this show up in an ordinary day or relationship?",
    "What honest choice would help me work with this transit?",
  ];
}
const modes: Array<{
  value: ReadingMode;
  label: string;
  short: string;
  description: string;
}> = [
  {
    value: "natal",
    label: "Natal chart",
    short: "The foundation",
    description: "Your enduring birth-chart story",
  },
  {
    value: "transit",
    label: "Transit reading",
    short: "The present chapter",
    description: "What the selected moment is activating",
  },
  {
    value: "combined",
    label: "Natal + transit",
    short: "The full picture",
    description: "Your foundation meeting the present moment",
  },
];
const prose =
  "prose prose-invert max-w-none prose-headings:font-serif prose-headings:font-medium prose-headings:text-white prose-headings:tracking-tight prose-h2:mb-4 prose-h2:mt-2 prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:mb-2 prose-h3:mt-7 prose-h3:text-lg prose-h3:text-cyan-100 prose-p:my-4 prose-p:text-[15px] prose-p:leading-8 prose-p:text-slate-300 prose-li:my-2 prose-li:text-slate-300 prose-strong:text-cyan-100 prose-blockquote:border-cyan-300/40 prose-blockquote:text-slate-300";

function ReadingProgress({ chart }: { chart: ChartResult }) {
  const lines = [
    ...chart.movingBodies.map(
      row => `${row.name} — ${row.display}, house ${row.house}`
    ),
    ...(chart.ascendant ? [`Ascendant — ${chart.ascendant.display}`] : []),
    `North Node — ${chart.northNode.display}`,
    `South Node — ${chart.southNode.display}`,
  ];
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const timer = window.setInterval(
      () => setShown(count => Math.min(count + 1, lines.length)),
      1800
    );
    return () => window.clearInterval(timer);
  }, [lines.length]);
  return (
    <div className="mx-auto max-w-3xl space-y-3 rounded-2xl border border-cyan-200/15 bg-cyan-100/[0.04] p-5 sm:p-7">
      <div className="flex items-center gap-3 text-sm text-cyan-100">
        <Brain className="h-4 w-4 animate-pulse text-cyan-300" />
        Reading your whole chart before writing a word
      </div>
      <ul className="space-y-1.5 text-sm text-slate-300">
        {lines.slice(0, shown).map(line => (
          <li key={line} className="flex gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300/70" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">
        Nothing is shown until the full reading is ready.
      </p>
    </div>
  );
}

function InterpretationPanelInner({
  chart,
  initialMode = "combined",
  initialQuestion = "",
  onModeChange,
  cacheScope = "guest",
}: {
  chart: ChartResult;
  initialMode?: ReadingMode;
  initialQuestion?: string;
  onModeChange?: (mode: ReadingMode) => void;
  cacheScope?: string;
}) {
  const [mode, setMode] = useState<ReadingMode>(initialMode);
  const prevInitialModeRef = useRef<ReadingMode>(initialMode);
  const [activeQuestion, setActiveQuestion] = useState<string>(initialQuestion);
  const [readingQuestion, setReadingQuestion] = useState(initialQuestion);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(
    () => loadCachedReading(chart, initialMode, initialQuestion, cacheScope)?.interpretation ?? null
  );
  const [messages, setMessages] = useState<Message[]>(
    () => loadCachedReading(chart, initialMode, initialQuestion, cacheScope)?.messages ?? []
  );
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setActiveQuestion(initialQuestion);
  }, [initialQuestion]);

  useEffect(() => {
    if (prevInitialModeRef.current !== initialMode) {
      prevInitialModeRef.current = initialMode;
      if (!isGeneratingReading && initialMode !== mode) {
        setMode(initialMode);
        const cached = loadCachedReading(chart, initialMode, initialQuestion, cacheScope);
        setInterpretation(cached?.interpretation ?? null);
        setMessages(cached?.messages ?? []);
      }
    }
  }, [initialMode, isGeneratingReading, mode, chart]);

  useEffect(() => {
    if (interpretation) {
      saveCachedReading(chart, mode, interpretation, messages, readingQuestion, cacheScope);
    }
  }, [chart, mode, interpretation, messages, readingQuestion, cacheScope]);

  const [oralQuestion, setOralQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("");
  const [followUps, setFollowUps] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const generate = trpc.interpretation.generate.useMutation();
  const masterSynthesis = trpc.interpretation.masterSynthesize.useMutation();
  const [visibleMasterSynthesis, setVisibleMasterSynthesis] = useState<NonNullable<typeof masterSynthesis.data> | null>(null);
  const masterSynthesisRequest = useRef(0);
  useEffect(() => {
    const request = ++masterSynthesisRequest.current;
    setVisibleMasterSynthesis(null);
    // The full calculated synthesis is the primary chart reading, not an opt-in extra.
    masterSynthesis.mutate({
      ...chart.input,
      chart,
      worldview: chart.worldview,
      mode,
      question: activeQuestion || "Synthesize every calculated doctrine and show the evidence.",
    }, {
      onSuccess: data => {
        if (request === masterSynthesisRequest.current) setVisibleMasterSynthesis(data);
      },
    });
    return () => { masterSynthesisRequest.current++; };
  }, [chart, mode, activeQuestion]);
  const chapterMutation = trpc.interpretation.chapter.useMutation();
  const chat = trpc.interpretation.followUp.useMutation({
    onSuccess: answer => {
      setLastAnswer(answer);
      setMessages(current => [
        ...current,
        { role: "assistant", content: answer },
      ]);
    },
  });
  const me = trpc.auth.me.useQuery();
  const saveReading = trpc.history.saveReading.useMutation();
  const selected = modes.find(item => item.value === mode)!;

  const updateChapter = (id: string, patch: Partial<Chapter>) =>
    setInterpretation(current =>
      current
        ? {
            ...current,
            chapters: current.chapters.map(chapter =>
              chapter.id === id ? { ...chapter, ...patch } : chapter
            ),
          }
        : current
    );
  const generateChapterAt = async (
    base: Interpretation,
    index: number,
    questionOverride = readingQuestion
  ) => {
    const chapter = base.chapters[index];
    if (!chapter) return;
    updateChapter(chapter.id, { status: "loading", error: undefined });
    const completed = base.chapters
      .slice(0, index)
      .filter(item => item.status === "complete")
      .map(item => `## ${item.title}\n${item.content ?? ""}`);
    try {
      const result = await chapterMutation.mutateAsync({
        chart,
        mode,
        intelligence: base.intelligence,
        chapterId: chapter.id as never,
        completedChapters: completed,
        analysis: base.analysis ?? "",
        question: questionOverride.trim(),
      });
      const updatedBase: Interpretation = {
        ...base,
        chapters: base.chapters.map(item =>
          item.id === chapter.id
            ? { ...item, status: "complete", content: result }
            : item
        ),
      };
      setInterpretation(updatedBase);
      saveCachedReading(chart, mode, updatedBase, messages, questionOverride, cacheScope);
      setCollapsedChapters(prev => ({ ...prev, [chapter.id]: false }));
      const nextIndex = index + 1;
      if (nextIndex < base.chapters.length)
        await generateChapterAt(updatedBase, nextIndex, questionOverride);
    } catch (error) {
      updateChapter(chapter.id, {
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "This chapter could not be completed.",
      });
    }
  };
  const run = async (questionOverride?: string) => {
    const q = (questionOverride ?? activeQuestion).trim();
    setReadingQuestion(q);
    if (questionOverride !== undefined) setActiveQuestion(questionOverride);
    setInterpretation(null);
    setMessages([]);
    setFollowUps([]);
    setCollapsedChapters({});
    setIsGeneratingReading(true);
    try {
      const base = await generate.mutateAsync({
        chart,
        mode,
        question: q || undefined,
      });
      const initial = { ...base, chapters: base.chapters as Chapter[] };
      setInterpretation(initial);
      saveCachedReading(chart, mode, initial, [], q, cacheScope);
      await generateChapterAt(initial, 0, q);
    } finally {
      setIsGeneratingReading(false);
    }
  };
  const retryChapter = async (index: number) => {
    if (!interpretation) return;
    setIsGeneratingReading(true);
    try {
      await generateChapterAt(interpretation, index);
    } finally {
      setIsGeneratingReading(false);
    }
  };
  const send = (question: string, questionMode: ReadingMode = mode) => {
    if (!interpretation) return;
    setFollowUps(followUpPrompts(question));
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    chat.mutate({
      chart,
      interpretation: {
        intelligence: interpretation.intelligence,
        reading: interpretation.chapters
          .filter(chapter => chapter.content)
          .map(chapter => `## ${chapter.title}\n${chapter.content}`)
          .join("\n\n"),
      },
      mode: questionMode,
      history: next.filter(
        (
          message
        ): message is Extract<Message, { role: "user" | "assistant" }> =>
          message.role !== "system"
      ),
      question,
    });
  };
  const submitOralQuestion = () => {
    const question = oralQuestion.trim();
    if (!question || !interpretation || chat.isPending) return;
    send(question, "combined");
    setOralQuestion("");
  };
  const saveCurrentReading = () => {
    if (!interpretation) return;
    if (!me.data) {
      startLogin();
      return;
    }
    saveReading.mutate({
      title: `${selected.label} · ${chart.input.location}`,
      mode,
      content: {
        intelligence: interpretation.intelligence,
        chapters: interpretation.chapters
          .filter(chapter => chapter.content)
          .map(chapter => ({
            id: chapter.id,
            title: chapter.title,
            subtitle: chapter.subtitle,
            content: chapter.content,
          })),
      },
    });
  };
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = event => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1)
        transcript += event.results[index]?.[0]?.transcript ?? "";
      setOralQuestion(transcript);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };
  const busy =
    isGeneratingReading ||
    generate.isPending ||
    chapterMutation.isPending ||
    chat.isPending;
  const completedCount =
    interpretation?.chapters.filter(chapter => chapter.status === "complete")
      .length ?? 0;
  const selectMode = (nextMode: ReadingMode) => {
    if (busy) return;
    recognitionRef.current?.stop();
    prevInitialModeRef.current = nextMode;
    setMode(nextMode);
    onModeChange?.(nextMode);
    const cached = loadCachedReading(chart, nextMode, activeQuestion, cacheScope);
    setReadingQuestion(activeQuestion);
    setInterpretation(cached?.interpretation ?? null);
    setMessages(cached?.messages ?? []);
    setCollapsedChapters({});
    setOralQuestion("");
    setIsListening(false);
    setLastAnswer("");
    setFollowUps([]);
    generate.reset();
    chapterMutation.reset();
    chat.reset();
  };

  return (
    <section
      id="ai-reading"
      className="mt-10 scroll-mt-8 space-y-7 border-t border-white/10 pt-10 sm:mt-14 sm:pt-14"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-cyan-300/25 bg-slate-950/60 p-5">
        <h3 className="text-xl font-semibold text-cyan-100">Unified Master Chart Synthesis</h3>
        <p className="mt-2 text-sm text-slate-300">Your calculated doctrines and their evidence-backed synthesis load automatically with the chart. Unavailable methods are identified rather than invented.</p>
        {masterSynthesis.isPending && <p role="status" className="mt-3 text-sm text-cyan-200">Calculating your full synthesis and tracing each available doctrine…</p>}
        {masterSynthesis.error && <div role="alert" className="mt-3 text-sm text-rose-300"><p>{masterSynthesis.error.message}</p><button type="button" className="mt-2 underline" onClick={() => {
          const request = ++masterSynthesisRequest.current;
          masterSynthesis.mutate({ ...chart.input, chart, worldview: chart.worldview, mode, question: activeQuestion || "Synthesize every calculated doctrine and show the evidence." }, { onSuccess: data => { if (request === masterSynthesisRequest.current) setVisibleMasterSynthesis(data); } });
        }}>Retry synthesis</button></div>}
        {visibleMasterSynthesis && <div className="mt-4 space-y-3 text-sm text-slate-200">
          <p className="font-medium">{visibleMasterSynthesis.dominantConclusion}</p>
          <p className="text-xs text-slate-300">Evidence traced: {Math.round(visibleMasterSynthesis.qualityAudit.groundedRatio * 100)}% · {visibleMasterSynthesis.qualityAudit.passed ? "Coverage audit passed" : "Coverage review required"}</p>
          {!visibleMasterSynthesis.qualityAudit.passed && <p role="alert" className="text-xs text-amber-200">{visibleMasterSynthesis.qualityAudit.unsupportedClaims.length} evidence coverage issues. Review method findings before relying on this summary.</p>}
          <p className="text-xs text-cyan-200">Methods evaluated: {visibleMasterSynthesis.methodLedgerSummary.totalEvaluated} · Computed: {visibleMasterSynthesis.methodLedgerSummary.computedWithResult} · Reference only: {visibleMasterSynthesis.methodLedgerSummary.referenceOnly} · Failed: {visibleMasterSynthesis.methodLedgerSummary.failed}</p>
          {visibleMasterSynthesis.narrative.sections.map(section => <div key={section.id} className="space-y-2"><h4 className="font-semibold text-cyan-100">{section.title}</h4><p className="whitespace-pre-line">{section.text}</p></div>)}
          <details className="rounded-lg border border-white/10 p-3"><summary className="cursor-pointer">How each method shaped this reading</summary><div className="mt-3 space-y-3">{visibleMasterSynthesis.narrative.methodContributions.map(contribution => <div key={contribution.methodId}><p className="font-medium">{visibleMasterSynthesis.methodOutcomes.find(m => m.methodId === contribution.methodId)?.methodName} · {contribution.methodId.startsWith("transit:") ? "Event" : "Base chart"}</p><p>{contribution.contribution}</p><p className="mt-1 text-xs text-slate-400">{contribution.findingIds.join(", ")}</p></div>)}</div></details>
          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-100">Every recorded method and its calculated findings</h4>
            {visibleMasterSynthesis.methodFindings.map(method => <details key={method.id} className="rounded-lg border border-white/10 p-3">
              <summary className="cursor-pointer font-medium">{method.name} · {method.status} · {method.resultCount} result entries</summary>
              <p className="mt-2 text-xs text-slate-400">{method.tradition} · {method.frame} · Sources: {method.sourceIds.join(", ") || "Not recorded"}</p>
              {method.notes && <p className="mt-2 text-xs text-amber-200">{method.notes}</p>}
              <p className="mt-2 text-xs text-cyan-200">Evidence: {method.evidenceIds.join(", ") || "Not recorded"}</p>
              <div className="mt-3 max-h-80 space-y-2 overflow-auto">
                {method.findings.map((finding, index) => <div key={index} className="rounded bg-white/5 p-2">
                  <p className="font-medium">{finding.label}</p>
                  <p className="mt-1 whitespace-pre-wrap break-words font-mono text-xs">{finding.details}</p>
                </div>)}
              </div>
            </details>)}
          </div>
          {visibleMasterSynthesis.themes.map(theme => <details key={theme.id} className="rounded-lg border border-white/10 p-3"><summary className="cursor-pointer font-medium">{theme.humanTheme}</summary><p className="mt-2">{theme.primaryConclusion}</p><p className="mt-2">{theme.whyHow}</p><p className="mt-2 text-xs text-cyan-200">Evidence: {theme.evidenceIds.join(", ") || "Not recorded"}</p></details>)}
        </div>}
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-300">
          <BookOpen className="h-4 w-4" /> Your personal reading
        </div>
        <h2 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
          A story written in your sky
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          This is a private self-knowledge profile, not a data dump. Choose a
          layer and let the guide unfold the patterns, needs, gifts, defenses,
          relationships, and growth edges you may recognize in your own life.
        </p>
      </div>
      <Card className="mx-auto max-w-5xl overflow-hidden border-cyan-200/15 bg-gradient-to-br from-cyan-100/[0.08] via-white/[0.035] to-violet-200/[0.06] text-slate-100 shadow-2xl shadow-cyan-950/20">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-300">
            <Compass className="h-4 w-4 text-cyan-300" />
            <span>What would you like to read?</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {modes.map(item => (
              <button
                key={item.value}
                type="button"
                onClick={() => selectMode(item.value)}
                disabled={busy}
                className={`group rounded-2xl border p-4 text-left transition-all sm:p-5 ${mode === item.value ? "border-cyan-300/60 bg-cyan-200/10 shadow-lg shadow-cyan-950/20" : "border-white/10 bg-black/10 hover:border-white/25 hover:bg-white/[0.06]"} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">
                      {item.label}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-200/70">
                      {item.short}
                    </div>
                  </div>
                  {mode === item.value && (
                    <span className="rounded-full bg-cyan-300/15 p-1 text-cyan-200">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div className="mt-4 text-sm leading-6 text-slate-400">
                  {item.description}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <BehavioralIntelligencePanel
        chart={chart}
        mode={mode}
        question={activeQuestion}
        onSelectPrompt={prompt => {
          setActiveQuestion(prompt);
          setOralQuestion(prompt);
          if (interpretation) {
            send(prompt, mode);
          } else {
            run(prompt);
          }
        }}
      />
      <Interpreter2050 packet={interpretation?.evidencePacket} hasReading={Boolean(interpretation?.reading)} />
      {interpretation?.evidencePacket?.vedicEvidence && (
        <Card className="mx-auto max-w-5xl border-cyan-200/15 bg-slate-950/70 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-xl">
              <Compass className="h-5 w-5 text-cyan-300" />
              Vedic Timing & Strength Layers
            </CardTitle>
            <p className="text-sm leading-6 text-slate-400">
              Dasha describes the traditional timing period; Ashtakavarga reports sign-strength bindu scores. They remain separate evidence layers.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["dasha", "ashtakavarga"] as const).map(technique => {
              const items = interpretation.evidencePacket?.vedicEvidence.filter(item => item.technique === technique) ?? [];
              return (
                <section key={technique} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-cyan-100">
                      {technique === "dasha" ? "Vimshottari Dasha" : "Ashtakavarga (BAV / SAV)"}
                    </h3>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                      {items.some(item => item.category === "calculated-fact") ? "Calculated" : "Unavailable / needs input"}
                    </span>
                  </div>
                  {items.length ? items.map(item => (
                    <p key={item.id} className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {item.statement}
                    </p>
                  )) : (
                    <p className="text-sm text-slate-400">No evidence was returned for this layer.</p>
                  )}
                </section>
              );
            })}
          </CardContent>
        </Card>
      )}
      {!interpretation && (
        <div className="mx-auto max-w-5xl">
          <Button
            onClick={() => run()}
            disabled={busy}
            className="h-12 w-full rounded-xl bg-cyan-400 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-300"
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <WandSparkles className="mr-2 h-4 w-4" />
            )}
            {busy
              ? "The guide is reading your chart…"
              : `Begin your ${selected.label.toLowerCase()}`}
          </Button>
        </div>
      )}
      {generate.isPending && !interpretation && (
        <ReadingProgress chart={chart} />
      )}
      {generate.error && (
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm leading-6 text-rose-100">
          <div className="font-medium">The chart map could not be opened.</div>
          <div className="mt-1 text-rose-200/80">{generate.error.message}</div>
          <Button
            variant="outline"
            onClick={() => void run()}
            className="mt-4 border-rose-200/30 bg-transparent text-rose-100 hover:bg-rose-100/10"
          >
            Try again
          </Button>
        </div>
      )}
      {interpretation ? (
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                {selected.short}
              </div>
              <h3 className="mt-2 font-serif text-3xl text-white sm:text-4xl">
                Your {selected.label.toLowerCase()}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                A deep reading for {chart.input.location || "God View"}, unfolding one
                substantial chapter at a time.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3 text-left sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => void run()}
                disabled={busy}
                className="h-9 border-white/15 bg-white/5 px-3 text-xs text-slate-200 hover:bg-white/10"
              >
                <WandSparkles className="mr-2 h-3.5 w-3.5 text-cyan-300" />
                Regenerate reading
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={saveCurrentReading}
                disabled={saveReading.isPending || completedCount === 0}
                className="h-9 border-cyan-200/25 bg-cyan-100/10 px-3 text-xs text-cyan-100 hover:bg-cyan-100/20"
              >
                {saveReading.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <BookOpen className="mr-2 h-3.5 w-3.5" />
                )}
                {me.data ? "Save reading" : "Save to account"}
              </Button>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Your book
                </div>
                <div className="mt-1 text-sm text-cyan-200">
                  {completedCount} of {interpretation.chapters.length} chapters
                  read
                </div>
              </div>
            </div>
          </div>

          <div id="fg2050-human-reading" className="scroll-mt-8" />
          {/* Executive Opening Synthesis (Always Visible Immediately) - Life Storytelling Mode */}
          {interpretation.reading && (
            <Card className="overflow-hidden border-cyan-300/35 bg-gradient-to-br from-cyan-950/45 via-[#0a0f1d] to-violet-950/35 text-slate-100 shadow-2xl shadow-cyan-950/30">
              <CardHeader className="border-b border-cyan-300/15 bg-slate-950/60 px-5 py-4 sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200">
                      <Sparkles className="h-3 w-3 text-cyan-300 animate-pulse" />
                      Life Storytelling Mode Active
                    </span>
                    <span className="hidden sm:inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-[11px] font-medium text-violet-200">
                      Childhood Roots → Adulthood Mastery (2026)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300/80">
                    Comprehensive Narrative Flow
                  </span>
                </div>
                <CardTitle className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                  The Master Life Story · Your Core Blueprint
                </CardTitle>
                <p className="mt-1 text-xs text-slate-300">
                  A continuous biographical narrative tracing your formative childhood roots, core strengths, active tensions, and 2026 everyday real-world navigation.
                </p>
              </CardHeader>
              <CardContent className={`space-y-4 px-5 py-6 sm:px-8 ${prose}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
                  <AudioReader
                    text={interpretation.reading}
                    label="Listen to Complete Life Story"
                  />
                  <span className="text-[11px] text-cyan-200/80 font-mono">
                    Translated for Modern 2026 Living
                  </span>
                </div>
                <Streamdown>{interpretation.reading}</Streamdown>
              </CardContent>
            </Card>
          )}

          <div className="rounded-2xl border border-white/10 bg-black/15 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
                  Reading map
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  All completed chapters stay open below. Click any chapter pill to jump directly to it.
                </p>
              </div>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-300 transition-all duration-500"
                  style={{
                    width: `${(completedCount / interpretation.chapters.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {interpretation.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  type="button"
                  disabled={chapter.status !== "complete"}
                  onClick={() => {
                    setCollapsedChapters(prev => ({
                      ...prev,
                      [chapter.id]: false,
                    }));
                    window.setTimeout(
                      () =>
                        document
                          .getElementById(`reading-chapter-${chapter.id}`)
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          }),
                      0
                    );
                  }}
                  className={`rounded-xl border px-3 py-2 text-left transition ${chapter.status === "complete" ? "border-cyan-200/20 bg-cyan-300/[0.06] text-slate-200 hover:border-cyan-200/50 hover:bg-cyan-300/10" : "border-white/5 bg-white/[0.02] text-slate-600"}`}
                >
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-cyan-300/70">
                    {index + 1} ·{" "}
                    {chapter.status === "complete"
                      ? "Read"
                      : chapter.status === "loading"
                        ? "Opening"
                        : "Queued"}
                  </span>
                  <span className="mt-1 block whitespace-normal break-words text-xs font-medium">
                    {chapter.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {interpretation.chapters.map((chapter, index) => {
              const isExpanded = !collapsedChapters[chapter.id];
              return (
                <Card
                  id={`reading-chapter-${chapter.id}`}
                  key={chapter.id}
                  className={`scroll-mt-28 overflow-hidden text-slate-100 ${chapter.status === "complete" ? "border-white/10 bg-white/[0.035]" : chapter.status === "loading" ? "border-cyan-300/30 bg-cyan-100/[0.05]" : chapter.status === "error" ? "border-rose-300/20 bg-rose-400/[0.05]" : "border-white/10 bg-black/10"}`}
                >
                  <CardHeader
                    className="cursor-pointer px-5 py-5 sm:px-7"
                    onClick={() =>
                      chapter.status === "complete" &&
                      setCollapsedChapters(prev => ({
                        ...prev,
                        [chapter.id]: !prev[chapter.id],
                      }))
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${chapter.status === "complete" ? "bg-cyan-300/15 text-cyan-200" : "bg-white/[0.07] text-slate-500"}`}
                      >
                        {chapter.status === "complete" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                          Chapter {index + 1}
                        </div>
                        <CardTitle className="mt-1 font-serif text-2xl text-white">
                          {chapter.title}
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-400">
                          {chapter.subtitle}
                        </p>
                      </div>
                      {chapter.status === "loading" && (
                        <Loader2 className="mt-2 h-5 w-5 animate-spin text-cyan-300" />
                      )}
                      {chapter.status === "complete" && (
                        <span className="mt-2 text-xs text-cyan-300/80">
                          {isExpanded ? "Hide" : "Show"}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  {chapter.status === "loading" && (
                    <CardContent className="px-5 pb-7 pt-0 text-sm leading-7 text-slate-400 sm:px-7">
                      The guide is listening carefully to this part of the chart…
                    </CardContent>
                  )}
                  {chapter.status === "error" && (
                    <CardContent className="px-5 pb-7 pt-0 sm:px-7">
                      <p className="text-sm leading-6 text-rose-200">
                        {chapter.error}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => void retryChapter(index)}
                        className="mt-4 border-rose-200/30 bg-transparent text-rose-100 hover:bg-rose-100/10"
                      >
                        Retry this chapter
                      </Button>
                    </CardContent>
                  )}
                  {chapter.status === "complete" && isExpanded && (
                    <CardContent
                      className={`space-y-5 border-t border-white/10 px-5 py-7 sm:px-8 sm:py-10 ${prose}`}
                    >
                      <AudioReader
                        text={chapter.content ?? ""}
                        label={`Listen to ${chapter.title}`}
                      />
                      <div className="rounded-xl border border-cyan-200/10 bg-cyan-300/[0.04] p-4 text-xs leading-5 text-slate-400">
                        <span className="font-semibold uppercase tracking-[0.16em] text-cyan-200">
                          Chart evidence
                        </span>
                        <p className="mt-1">
                          This chapter is grounded in the calculated placements,
                          houses, aspects, and timing shown above. Hover or
                          focus a calculation to inspect the evidence behind it.
                        </p>
                      </div>
                      <Streamdown>{chapter.content}</Streamdown>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
          {chapterMutation.error &&
            !interpretation.chapters.some(
              chapter => chapter.status === "error"
            ) && (
              <p className="text-sm text-rose-300">
                A chapter could not be completed. Your completed chapters are
                safe; retry the unfinished chapter above.
              </p>
            )}
          <Card className="overflow-hidden border-cyan-200/15 bg-gradient-to-br from-cyan-100/[0.06] to-violet-100/[0.04] text-slate-100">
            <CardHeader className="border-b border-cyan-200/10 px-5 py-5 sm:px-7">
              <CardTitle className="flex items-center gap-3 font-serif text-2xl text-white">
                <Mic className="h-5 w-5 text-cyan-300" />
                Ask your natal + transit chart
              </CardTitle>
              <p className="text-sm leading-6 text-slate-400">
                Ask any question aloud or type it below. The guide interprets
                your answer from the birth chart together with the selected
                transit moment.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={oralQuestion}
                  onChange={event => setOralQuestion(event.target.value)}
                  placeholder="For example: Why do I feel so much pressure in my relationships right now?"
                  className="min-h-24 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                />
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleListening}
                    className={`h-11 border-cyan-200/20 bg-cyan-100/5 ${isListening ? "text-rose-200" : "text-cyan-100"}`}
                  >
                    {isListening ? (
                      <MicOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Mic className="mr-2 h-4 w-4" />
                    )}
                    {isListening ? "Stop" : "Speak"}
                  </Button>
                  <Button
                    type="button"
                    onClick={submitOralQuestion}
                    disabled={!oralQuestion.trim() || chat.isPending}
                    className="h-11 bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  >
                    {chat.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Ask
                  </Button>
                </div>
              </div>
              {isListening && (
                <p className="text-xs text-cyan-200">
                  Listening… speak naturally, then tap Ask.
                </p>
              )}
              {lastAnswer && (
                <div className="space-y-4 rounded-2xl border border-white/10 bg-black/15 p-4 sm:p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    The chart’s answer
                  </div>
                  <AudioReader text={lastAnswer} label="Listen to the answer" />
                  <div className={prose}>
                    <Streamdown>{lastAnswer}</Streamdown>
                  </div>
                </div>
              )}
              <p className="text-xs leading-5 text-slate-500">
                Voice input uses your browser’s microphone permission. If voice
                input is unavailable, type your question instead.
              </p>
              {followUps.length > 0 && (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Go deeper
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {followUps.map(prompt => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setOralQuestion(prompt);
                          send(prompt, "combined");
                        }}
                        disabled={chat.isPending}
                        className="rounded-xl border border-cyan-200/15 bg-cyan-100/[0.04] p-3 text-left text-sm leading-5 text-slate-300 transition hover:border-cyan-200/40 hover:bg-cyan-100/[0.09] disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-cyan-200/20 bg-gradient-to-br from-cyan-100/[0.08] via-violet-100/[0.05] to-transparent shadow-2xl shadow-cyan-950/20 text-slate-100">
            <CardHeader className="border-b border-violet-200/10 px-5 py-5 sm:px-7">
              <CardTitle className="flex items-center gap-3 font-serif text-2xl text-white">
                <MessageCircle className="h-5 w-5 text-cyan-300" />
                Meet your chart host
              </CardTitle>
              <p className="text-sm leading-6 text-slate-400">
                This is your always-on astrology guide. Ask follow-up questions,
                challenge an interpretation, or explore any natal placement and
                transit in plain language.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <AIChatBox
                messages={messages}
                onSendMessage={send}
                isLoading={chat.isPending}
                height="600px"
                placeholder="Ask your chart host anything…"
                emptyStateMessage="Your chart host is ready. Ask about a placement, house, aspect, relationship pattern, or current transit."
                suggestedPrompts={[
                  "Tell me more about the central theme.",
                  "How might this show up in relationships?",
                  "What is the honest lesson here?",
                  "What should I pay attention to in daily life?",
                ]}
              />
            </CardContent>
          </Card>
          {chat.error && (
            <p className="text-sm text-rose-300">{chat.error.message}</p>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-cyan-200/15 bg-cyan-100/[0.02] p-8 text-center text-sm leading-7 text-slate-400 sm:p-10">
          Choose a reading above. The guide reads your whole chart first, then
          unfolds a full-depth personal book one chapter at a time. Completed
          chapters remain available if a later chapter needs a retry.
        </div>
      )}
    </section>
  );
}


/** Remount when the account, selected question or canonical chart changes. */
export function InterpretationPanel(props: Parameters<typeof InterpretationPanelInner>[0]) {
  const me = trpc.auth.me.useQuery(undefined, { retry: false });
  const accountId = me.data?.openId || "guest";
  return <InterpretationPanelInner key={getReadingCacheKey(props.chart, props.initialMode ?? "combined", props.initialQuestion || "", accountId)} {...props} cacheScope={accountId} />;
}
