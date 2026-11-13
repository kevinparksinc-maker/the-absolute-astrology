import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  UserRound,
  Volume2,
  VolumeX,
  RotateCcw,
  Compass,
  CheckCircle2,
  ArrowRight,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { GuardianVoiceButton, speakGuardian } from "@/components/GuardianVoiceButton";
import type { ChartResult } from "../../../server/astronomy";

type ChatMessage = { role: "user" | "assistant"; content: string };

export interface WelcomeHostProps {
  chart?: ChartResult | null;
  readingMode?: "natal" | "transit" | "combined";
  onLoadSampleChart?: () => void;
  onOpenProfileBuilder?: () => void;
  className?: string;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export function WelcomeHost({
  chart,
  readingMode = "combined",
  onLoadSampleChart,
  onOpenProfileBuilder,
  className = "",
  externalPrompt,
  onClearExternalPrompt,
}: WelcomeHostProps) {
  const hasChart = Boolean(chart && chart.movingBodies && chart.movingBodies.length > 0);

  const defaultGreeting = hasChart
    ? `Welcome. I am your Master Interpreter. Your chart for **${chart?.input.location || "God View"}** (${chart?.input.date || "Selected Moment"}) is connected to our multi-system RAG engine. 

I have retrieved your exact planetary degrees, 27 Vedic Nakshatras & padas, 28 Arabic Lunar Mansions (Manazil), 36 Decans, Fixed Stars, active Transits, and Behavioral Pattern Intelligence. 

What aspect of your chart, life chapter, or inner pattern would you like to explore?`
    : `Welcome to The Algorithms of the Cosmos. I am your Master Interpreter and celestial guide. 

I can answer any question about our hybrid geocentric astronomy engine, Vedic Nakshatras, 28 Arabic Mansions, Fixed Stars, and traditional Horary astrology. 

To unlock deeply personalized interpretations grounded in your exact birth sky, enter your birth details below or click **"Load Dallas 1986 Sample Chart"** to test the live RAG engine immediately.`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: defaultGreeting },
  ]);
  const [question, setQuestion] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Update greeting when chart state changes if user hasn't chatted yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([{ role: "assistant", content: defaultGreeting }]);
    }
  }, [hasChart, chart?.input.location, chart?.input.date]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const host = trpc.interpretation.host.useMutation({
    onSuccess: answer => {
      setMessages(current => [...current, { role: "assistant", content: answer }]);
      if (autoSpeak) speakGuardian(answer);
      setTimeout(scrollToBottom, 60);
    },
  });

  const send = (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || host.isPending) return;

    if (trimmed === "Load Dallas 1986 Sample Chart" && onLoadSampleChart) {
      onLoadSampleChart();
      setMessages(current => [
        ...current,
        { role: "user", content: "Load Dallas 1986 sample chart and ground reading." },
        {
          role: "assistant",
          content:
            "Loading the verified 1986 Dallas, TX chart into the observatory... Once calculated, your personalized RAG evidence packet will be live!",
        },
      ]);
      return;
    }

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setQuestion("");
    setTimeout(scrollToBottom, 40);

    host.mutate({
      question: trimmed,
      history: next.slice(-8),
      chart: chart ? (chart as any) : undefined,
      mode: readingMode,
    });
  };

  // React to external prompt requests (e.g. from Social Loved Ones Matrix or Quick Action)
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      send(externalPrompt);
      onClearExternalPrompt?.();
    }
  }, [externalPrompt]);

  const clearChat = () => {
    setMessages([{ role: "assistant", content: defaultGreeting }]);
  };

  const noChartPrompts = [
    "✨ How do the Algorithms of the Cosmos decode my unique blueprint?",
    "🪐 What is the difference between God View and Agent View?",
    "🌙 Explain the 28 Arabic Lunar Mansions vs 27 Nakshatras",
    "🧭 How does traditional Horary astrology work here?",
    ...(onLoadSampleChart ? ["📍 Load Dallas 1986 Sample Chart"] : []),
  ];

  const withChartPrompts = [
    "🔮 Decode my Sun & Moon in their Nakshatras & Mansions",
    "⚡ What are today's transits activating in my birth chart?",
    "🛡️ What is my core behavioral pattern and defense style?",
    "🧭 What does my 10th house indicate for career & purpose?",
    "⭐ Do I have any contacts with Royal Stars or Fixed Stars?",
    "⚖️ Analyze my key aspect tensions (squares/oppositions)",
  ];

  const currentPrompts = hasChart ? withChartPrompts : noChartPrompts;

  return (
    <section
      aria-label="Bible Believers Astrology AI Master Interpreter"
      className={`firmament-host relative mb-8 overflow-hidden rounded-3xl border border-cyan-200/25 bg-gradient-to-br from-cyan-950/40 via-slate-950/70 to-violet-950/40 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl ${className}`}
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

      {/* Top Header / RAG Status Banner */}
      <div className="flex flex-col gap-3 border-b border-cyan-200/15 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 shadow-inner">
            <Sparkles className="h-5 w-5 text-cyan-200 animate-pulse" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 ${
                hasChart ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-semibold tracking-wide text-white">
                AI Master Interpreter
              </span>
              {hasChart ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                  <Database className="h-2.5 w-2.5" /> Live RAG Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
                  <Compass className="h-2.5 w-2.5" /> Observatory Guide
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {hasChart
                ? `Grounding answers in ${chart?.input.location || "God View"} (${chart?.movingBodies.length} placements, ${chart?.worldview} frame)`
                : "Ask anything about astrology or calculate your chart below for deep personalized reading"}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-2">
          {hasChart && (
            <div className="hidden xl:flex items-center gap-1 text-[11px] text-cyan-200/70 mr-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Vedic + Manazil + Stars RAG</span>
            </div>
          )}

          {onOpenProfileBuilder && (
            <button
              type="button"
              onClick={onOpenProfileBuilder}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-cyan-200 transition hover:bg-cyan-400/25 shadow-sm"
            >
              <Compass className="h-3 w-3 text-cyan-300" />
              <span>{hasChart ? "Edit Natal Details" : "Enter Birth Info"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => speakGuardian("Guardian voice is ready. Welcome to The Algorithms of the Cosmos.")}
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-300/[.06] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-cyan-100 transition hover:border-cyan-200/45 hover:bg-cyan-300/15"
          >
            <Volume2 className="h-3 w-3" /> Voice
          </button>

          <button
            type="button"
            onClick={() => setAutoSpeak(val => !val)}
            aria-pressed={autoSpeak}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] transition ${
              autoSpeak
                ? "border-violet-200/40 bg-violet-300/20 text-violet-100"
                : "border-white/10 bg-white/[.04] text-slate-400 hover:text-slate-200"
            }`}
          >
            {autoSpeak ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            {autoSpeak ? "Auto-speak on" : "Auto-speak off"}
          </button>

          <button
            type="button"
            onClick={clearChat}
            title="Reset conversation"
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-[10px] font-medium text-slate-400 transition hover:bg-white/[.08] hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Main Grid: Chat Canvas (Left) + RAG Knowledge Anchor (Right) */}
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: Chat Stream & Input */}
        <div className="flex flex-col p-4 sm:p-6">
          {/* Scrollable Messages Area */}
          <div
            ref={scrollAreaRef}
            className="h-[360px] sm:h-[400px] space-y-3.5 overflow-y-auto rounded-2xl border border-white/10 bg-black/35 p-4 shadow-inner"
            aria-live="polite"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex items-start gap-2.5 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 border border-cyan-300/25">
                    <Bot className="h-3.5 w-3.5 text-cyan-200" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "bg-violet-600/30 border border-violet-400/25 text-violet-50"
                      : "bg-white/[0.06] border border-white/10 text-slate-100"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div>
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-cyan-200 prose-strong:text-white">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-slate-400">
                        <span className="text-[10px] text-cyan-200/60 uppercase tracking-widest">
                          {hasChart ? "Grounded in Chart RAG" : "Master Interpreter"}
                        </span>
                        <GuardianVoiceButton text={message.content} />
                      </div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>

                {message.role === "user" && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-400/20 border border-violet-400/30">
                    <UserRound className="h-3.5 w-3.5 text-violet-200" />
                  </div>
                )}
              </div>
            ))}

            {host.isPending && (
              <div className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-3.5 py-2.5 text-xs text-cyan-200">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                <span>
                  {hasChart
                    ? "Master Interpreter is synthesizing your multi-system chart evidence..."
                    : "Master Interpreter is formulating your astrological guidance..."}
                </span>
              </div>
            )}
          </div>

          {host.error && (
            <p className="mt-2 text-xs text-rose-300 bg-rose-950/30 border border-rose-500/20 rounded-lg p-2">
              The Master Interpreter encountered a temporary issue. You can still use the chart calculation controls below. ({host.error.message})
            </p>
          )}

          {/* Input Area */}
          <div className="mt-3.5 flex gap-2">
            <Textarea
              value={question}
              onChange={event => setQuestion(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder={
                hasChart
                  ? "Ask the Master Interpreter about your placements, transits, or life chapter..."
                  : "Ask about any astrological topic, or type a question about yourself..."
              }
              className="min-h-12 max-h-32 resize-none rounded-xl border-white/15 bg-black/40 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-300"
            />
            <Button
              onClick={() => send()}
              disabled={!question.trim() || host.isPending}
              className="h-auto px-5 shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-semibold hover:from-cyan-300 hover:to-cyan-200 shadow-md shadow-cyan-900/30"
              aria-label="Send message to Master Interpreter"
            >
              {host.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Right Sidebar: Context Anchors & Quick Prompts */}
        <div className="flex flex-col justify-between border-t border-cyan-200/15 bg-black/25 p-4 sm:p-6 lg:border-l lg:border-t-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                {hasChart ? "Retrieved RAG Layers" : "Quick Starters"}
              </span>
              {hasChart && (
                <Badge variant="outline" className="border-cyan-400/30 text-cyan-300 text-[10px]">
                  Whole-Chart Synthesis
                </Badge>
              )}
            </div>

            <h3 className="mt-1 font-serif text-xl text-white">
              {hasChart ? "Personalized Inquiries" : "Explore the Observatory"}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {hasChart
                ? "Click any prompt below to immediately interrogate your chart's multi-system evidence:"
                : "Select an inquiry below, or calculate your natal chart to unlock full RAG precision:"}
            </p>

            {/* Prompt Buttons */}
            <div className="mt-4 space-y-2">
              {currentPrompts.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    if (prompt.includes("Load Dallas 1986") && onLoadSampleChart) {
                      onLoadSampleChart();
                    } else {
                      send(prompt);
                    }
                  }}
                  disabled={host.isPending}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-left text-xs text-slate-300 transition hover:border-cyan-200/40 hover:bg-cyan-300/10 hover:text-white disabled:opacity-50"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100 text-cyan-200 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom RAG Context Info Card */}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-slate-400">
            {hasChart ? (
              <div className="space-y-1">
                <div className="font-semibold text-cyan-200 flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-cyan-300" />
                  <span>Evidence Connected</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Houses, degrees, speeds, aspects, Vedic nakshatras, Manazil, and behavioral defense patterns are actively retrieved for this session.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-300">Have birth time & city?</div>
                <p className="text-[10px] text-slate-400">
                  Scroll down to Step 1 & 2 to calculate your hybrid chart. The Master Interpreter will automatically adapt to your personal sky.
                </p>
                {onLoadSampleChart && (
                  <button
                    type="button"
                    onClick={onLoadSampleChart}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 hover:underline pt-0.5"
                  >
                    Try 1986 Dallas sample chart →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
