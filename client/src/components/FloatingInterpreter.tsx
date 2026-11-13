import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
const Chat = lazy(() =>
  import("./AIChatBox").then(module => ({ default: module.AIChatBox }))
);
type Message = { role: "user" | "assistant"; content: string };

export function FloatingInterpreter() {
  const { chart, energyChart, profile } = useProfileSession();
  const [path] = useLocation();
  const currentChart =
    path.startsWith("/energy") || path === "/forecast" ? energyChart : chart;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const host = trpc.interpretation.host.useMutation();
  const generation = useRef(0);
  const identity =
    profile?.id ||
    `${profile?.date || ""}:${profile?.time || ""}:${profile?.location || ""}`;
  useEffect(() => {
    generation.current++;
    setMessages([]);
    host.reset();
    return () => {
      generation.current++;
    };
  }, [identity]);
  const lastQuestionRef = useRef<string>("");
  const send = (question: string) => {
    const trimmed = question.trim();
    if (host.isPending || !trimmed) return;
    lastQuestionRef.current = trimmed;
    const request = generation.current;
    const history = [
      ...messages,
      { role: "user" as const, content: trimmed },
    ];
    setMessages(history);
    host.mutate(
      {
        question: trimmed,
        history: history.slice(-12),
        chart: currentChart || undefined,
        mode: currentChart?.readingScope || "natal",
      },
      {
        onSuccess: answer => {
          if (generation.current === request)
            setMessages(current => [
              ...current,
              { role: "assistant", content: answer },
            ]);
        },
      }
    );
  };
  const retryLast = () => {
    const last = lastQuestionRef.current || messages.filter(m => m.role === "user").at(-1)?.content;
    if (!last || host.isPending) return;
    const request = generation.current;
    host.mutate(
      {
        question: last,
        history: messages.slice(-12),
        chart: currentChart || undefined,
        mode: currentChart?.readingScope || "natal",
      },
      {
        onSuccess: answer => {
          if (generation.current === request)
            setMessages(current => [
              ...current,
              { role: "assistant", content: answer },
            ]);
        },
      }
    );
  };
  const cleanErrorMessage = (raw?: string) => {
    if (!raw) return "The AI service could not answer right now.";
    const stripped = raw.replace(/^(AI_RATE_LIMIT|AI_REQUEST_FAILED):\s*/, "");
    if (stripped.startsWith("{") || stripped.includes("RESOURCE_EXHAUSTED")) {
      return "Temporary rate/token limit reached on the AI service. Wait ~20 seconds and click Retry.";
    }
    return stripped;
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Open AI guide"
          title="Ask the AI guide"
          className={`${profile ? "fixed right-4" : "ml-auto mr-4 mb-6"} z-40 flex h-14 w-14 items-center justify-center rounded-full border border-amber-200/60 bg-[#14213b] text-amber-100 shadow-lg shadow-black/50 hover:bg-[#203251] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200`}
          style={profile ? { bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))" } : undefined}
        >
          <Sparkles size={25} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100vw-2rem)] overflow-y-auto border-white/15 bg-[#080f1f] p-4 text-slate-100 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Your AI guide
          </DialogTitle>
          <DialogDescription className="pr-6 text-slate-400">
            Ask a question or explore a pattern.{" "}
            {currentChart
              ? "Your calculated chart evidence is connected."
              : "Calculate a chart for personal interpretation."}
          </DialogDescription>
        </DialogHeader>
        <Suspense fallback={<p role="status">Opening your chat…</p>}>
          <Chat
            messages={messages}
            onSendMessage={send}
            isLoading={host.isPending}
            height="min(55dvh, 500px)"
            emptyStateMessage="What would you like to explore?"
            suggestedPrompts={[
              "Help me understand my chart",
              "What should I focus on today?",
            ]}
          />
        </Suspense>
        {host.error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-400/30 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
            <span>{cleanErrorMessage(host.error.message)} Your conversation is still here.</span>
            <button
              type="button"
              disabled={host.isPending}
              onClick={retryLast}
              className="rounded border border-rose-300/40 px-2.5 py-1 text-xs font-medium text-rose-100 hover:bg-rose-900/40"
            >
              Retry
            </button>
          </div>
        )}
        {messages.length > 0 && (
          <button
            type="button"
            disabled={host.isPending}
            onClick={() => {
              generation.current++;
              setMessages([]);
              host.reset();
            }}
            className="justify-self-start text-xs text-slate-400 underline"
          >
            Clear conversation
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
