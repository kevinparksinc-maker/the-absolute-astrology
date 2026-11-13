import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  User,
  Bot,
  RotateCcw,
  Compass,
  Heart,
  Briefcase,
  Shield,
  HelpCircle,
  Clock,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";
import { Streamdown } from "streamdown";

export interface InteractiveNatalCompanionProps {
  chart: ChartResult;
  initialQuestion?: string;
  className?: string;
  mode?: "natal" | "transit" | "combined";
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedFollowUps?: string[];
}

const STARTER_PROMPTS = [
  {
    icon: Compass,
    label: "Big Story Overview",
    prompt: "Walk me through my chart's big overarching story in plain English. What is my soul built to do here?",
  },
  {
    icon: Briefcase,
    label: "Career & Life Calling",
    prompt: "What kind of work, craft, or career path actually fulfills my natural wiring without burning me out?",
  },
  {
    icon: Heart,
    label: "Love & Partnership Patterns",
    prompt: "What is my biggest repeating blind spot or pattern in intimate relationships and partnerships?",
  },
  {
    icon: Clock,
    label: "Current Life Season",
    prompt: "What timing season or cycle of life am I navigating right now, and what is it asking of me?",
  },
  {
    icon: Shield,
    label: "Stress & Defensive Armor",
    prompt: "What defensive armor or coping mechanisms do I put up when I'm stressed, and how can I let my guard down safely?",
  },
];

export function InteractiveNatalCompanion({
  chart,
  initialQuestion,
  className = "",
  mode = "natal",
}: InteractiveNatalCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "intro-1",
      role: "assistant",
      content: `Welcome to your personal astrological conversation.

Here, all the intricate calculations—degrees, virupas, bounds, Nakshatras, and planetary speeds—work silently in the background. My job is to speak with you like a perceptive, grounded friend and mentor.

We can explore your emotional wiring, career trajectory, relationship blind spots, life seasons, or any specific placements you want to unpack. What part of your life is calling for clarity right now?`,
      timestamp: new Date(),
      suggestedFollowUps: [
        "Walk me through my chart's big story in plain English",
        "What kind of work or career actually fulfills my wiring?",
        "What is my biggest blind spot in relationships?",
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.interpretation.chatWithChart.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  // Handle optional initial question trigger
  const hasTriggeredInitial = useRef(false);
  useEffect(() => {
    if (initialQuestion && !hasTriggeredInitial.current) {
      hasTriggeredInitial.current = true;
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Prepare history payload for server
    const historyPayload = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    chatMutation.mutate(
      {
        chart,
        history: historyPayload,
        question: text,
        mode,
      },
      {
        onSuccess: data => {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.answer,
            timestamp: new Date(),
            suggestedFollowUps: data.suggestedFollowUps,
          };
          setMessages(prev => [...prev, assistantMessage]);
        },
        onError: err => {
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: `I'm having a brief connection pause with the reasoning engine (${err.message}). Your chart is completely safe—please try sending your question once more.`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `intro-${Date.now()}`,
        role: "assistant",
        content: `Conversation reset. I'm anchored in your chart and ready whenever you want to explore a new question or life theme.`,
        timestamp: new Date(),
        suggestedFollowUps: [
          "Walk me through my chart's big story in plain English",
          "What kind of work or career actually fulfills my wiring?",
          "What is my biggest blind spot in relationships?",
        ],
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className={`flex flex-col h-[750px] max-h-[85vh] rounded-2xl border border-cyan-500/30 bg-slate-950/90 shadow-2xl backdrop-blur-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Astrologer's Parlor</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Interactive Reasoning AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded life counsel · Zero calculation dumps · Plain people talk
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          title="Restart Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map(msg => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-md relative group ${
                    isUser
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none font-medium"
                      : "bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-tl-none prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-cyan-300"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <Streamdown>{msg.content}</Streamdown>
                  )}

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Suggested follow-up chips under assistant reply */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 hover:text-cyan-200 transition-all text-left flex items-center gap-1.5 group"
                      >
                        <ChevronRight className="w-3 h-3 text-cyan-500 group-hover:translate-x-0.5 transition-transform" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {chatMutation.isPending && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-start">
            <div className="w-7 h-7 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Synthesizing your chart and reasoning through the celestial patterns…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Bar (when conversation is fresh) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
          <div className="flex gap-2">
            {STARTER_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <Icon className="w-3 h-3 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask anything about your chart, life season, career, or relationships…"
            className="w-full pl-3.5 pr-12 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none max-h-32 min-h-[42px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatMutation.isPending}
            className="absolute right-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Press Enter to send, Shift+Enter for new line · The AI reasons across all 18 canonical traditions in plain human language.
        </p>
      </div>
    </div>
  );
}
