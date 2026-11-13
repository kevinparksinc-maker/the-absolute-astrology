import { trpc } from "@/lib/trpc";
import type { buildChartBriefing } from "../../../server/chartBriefing";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Sliders,
  User,
  Music,
  FileText,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartResult } from "../../../server/astronomy";

interface AudioPodcastBriefingProps {
  chart: ChartResult | null;
  onAskMasterInterpreter?: (question: string) => void;
  className?: string;
}

type VoiceStyle = "guardian" | "oracle" | "scholar";

export function AudioPodcastBriefing({
  chart,
  onAskMasterInterpreter,
  className = "",
}: AudioPodcastBriefingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("guardian");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [ambientSound, setAmbientSound] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [audioSupported, setAudioSupported] = useState(false);

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechChunkIndexRef = useRef(0);

  const [briefingChapters, setBriefingChapters] = useState<Awaited<ReturnType<typeof buildChartBriefing>>["chapters"]>([]);
  const [briefingError, setBriefingError] = useState("");
  const [briefingRetry, setBriefingRetry] = useState(0);
  const briefing = trpc.interpretation.chartBriefing.useMutation();
  const briefingVersion = useRef(0);
  useEffect(() => {
    const version = ++briefingVersion.current;
    setBriefingChapters([]); setBriefingError(""); setActiveChapterIndex(0); setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (chart) briefing.mutate({ chart }, {
      onSuccess: result => { if (version === briefingVersion.current) setBriefingChapters(result.chapters); },
      onError: error => { if (version === briefingVersion.current) setBriefingError(error.message); },
    });
    return () => { briefingVersion.current++; };
  }, [chart, briefingRetry]);

  const fullScript = useMemo(() => {
    return briefingChapters.map(c => c.text).join(" ");
  }, [briefingChapters]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setAudioSupported(true);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle SpeechSynthesis playback
  const speakCurrentChapter = (index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (index < 0 || index >= briefingChapters.length) {
      setIsPlaying(false);
      setActiveChapterIndex(0);
      return;
    }

    setActiveChapterIndex(index);
    const chapter = briefingChapters[index];
    const utterance = new SpeechSynthesisUtterance(chapter.text);

    // Voice tuning based on selected style
    if (voiceStyle === "guardian") {
      utterance.rate = 0.88 * playbackSpeed;
      utterance.pitch = 0.82;
    } else if (voiceStyle === "oracle") {
      utterance.rate = 0.86 * playbackSpeed;
      utterance.pitch = 1.05;
    } else {
      utterance.rate = 0.95 * playbackSpeed;
      utterance.pitch = 0.95;
    }

    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => /^en/i.test(v.lang) && /Google|Samantha|Alex|Daniel|David|Microsoft/i.test(v.name)) ||
      voices.find(v => /^en/i.test(v.lang));
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      if (index + 1 < briefingChapters.length) {
        speakCurrentChapter(index + 1);
      } else {
        setIsPlaying(false);
        setActiveChapterIndex(0);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled") {
        setIsPlaying(false);
      }
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      speakCurrentChapter(activeChapterIndex);
    }
  };

  const handleSkipForward = () => {
    const nextIdx = Math.min(briefingChapters.length - 1, activeChapterIndex + 1);
    speakCurrentChapter(nextIdx);
  };

  const handleSkipBack = () => {
    const prevIdx = Math.max(0, activeChapterIndex - 1);
    speakCurrentChapter(prevIdx);
  };

  const handleSpeedCycle = () => {
    const nextSpeed = playbackSpeed === 1.0 ? 1.2 : playbackSpeed === 1.2 ? 0.8 : 1.0;
    setPlaybackSpeed(nextSpeed);
    if (isPlaying) {
      speakCurrentChapter(activeChapterIndex);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {briefing.isPending && !briefingChapters.length && <p role="status" className="text-sm text-cyan-200">Building your briefing from the calculated chart evidence…</p>}
      {briefingError && <div role="alert" className="space-y-3 rounded-xl border border-rose-300/30 p-4 text-sm text-rose-200"><p>{briefingError}</p><button type="button" onClick={() => setBriefingRetry(value => value + 1)} className="underline">Retry the audio reading</button></div>}
      {/* Podcast Player Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-300/30 bg-gradient-to-r from-violet-950/50 via-indigo-950/40 to-black/60 p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-violet-950/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-300/40 bg-violet-500/20 shadow-md">
                <Radio className="h-4 w-4 text-violet-300" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">
                Voice-First Daily Cosmic Podcast
              </span>
              {isPlaying && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse text-[10px]">
                  ON AIR
                </Badge>
              )}
            </div>
            <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
              Your Calculated Chart Audio Briefing
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Listen to the interpretation of your selected chart. Each chapter uses the same calculated synthesis and evidence as the reading.
            </p>
          </div>

          {/* Voice Personality Selector */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1.5 shrink-0">
            <span className="text-xs font-semibold text-slate-400 pl-2">Voice Tone:</span>
            <button
              type="button"
              onClick={() => {
                setVoiceStyle("guardian");
                if (isPlaying) speakCurrentChapter(activeChapterIndex);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                voiceStyle === "guardian"
                  ? "bg-violet-500/30 text-violet-200 border border-violet-400/40 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Guardian (Calm)
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceStyle("oracle");
                if (isPlaying) speakCurrentChapter(activeChapterIndex);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                voiceStyle === "oracle"
                  ? "bg-violet-500/30 text-violet-200 border border-violet-400/40 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Oracle (Radiant)
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceStyle("scholar");
                if (isPlaying) speakCurrentChapter(activeChapterIndex);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                voiceStyle === "scholar"
                  ? "bg-violet-500/30 text-violet-200 border border-violet-400/40 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Scholar (Analytical)
            </button>
          </div>
        </div>

        {/* Audio Waveform & Player Deck */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 backdrop-blur-md">
          {/* Animated Waveform Bars */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-16 mb-6">
            {[40, 65, 25, 80, 50, 95, 30, 85, 45, 70, 90, 60, 35, 75, 55, 90, 40, 60, 85, 50, 30, 70].map((h, i) => (
              <div
                key={i}
                className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 ${
                  isPlaying
                    ? "bg-gradient-to-t from-violet-500 to-cyan-300 shadow-sm shadow-cyan-300/30"
                    : "bg-white/15"
                }`}
                style={{
                  height: isPlaying ? `${Math.max(12, (h * (0.6 + Math.sin(i + Date.now() / 400) * 0.4)))}%` : "16%",
                }}
              />
            ))}
          </div>

          {/* Current Track Info & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-violet-300 font-semibold">
                Episode 1 · {briefingChapters[activeChapterIndex]?.title}
              </div>
              <div className="text-sm text-slate-300 mt-0.5">
                {briefingChapters[activeChapterIndex]?.subtitle}
              </div>
            </div>

            {/* Main Playback Buttons */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!briefingChapters.length}
                onClick={handleSkipBack}
                className="h-10 w-10 text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                title="Previous Chapter"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                disabled={!briefingChapters.length || !audioSupported}
                onClick={handleTogglePlay}
                className="h-13 w-13 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 text-black font-bold shadow-xl shadow-cyan-400/20 hover:from-violet-400 hover:to-cyan-300"
                aria-label={isPlaying ? "Pause podcast" : "Play podcast"}
              >
                {isPlaying ? <Pause className="h-6 w-6 text-black" /> : <Play className="h-6 w-6 text-black ml-0.5" />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!briefingChapters.length}
                onClick={handleSkipForward}
                className="h-10 w-10 text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                title="Next Chapter"
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSpeedCycle}
                className="h-9 px-2.5 rounded-xl border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 ml-2"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters & Interactive Transcript Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Chapters Playlist */}
        <Card className="lg:col-span-5 border-white/10 bg-white/[0.035] text-slate-100 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-xl text-white flex items-center gap-2">
              <Headphones className="h-4 w-4 text-violet-300" />
              Podcast Chapters
            </CardTitle>
            <p className="text-xs text-slate-400">
              Click any chapter to jump and listen instantly.
            </p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {briefingChapters.map((ch, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => speakCurrentChapter(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isActive
                      ? "border-violet-400/60 bg-violet-500/20 shadow-md shadow-violet-950/20"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {ch.title}
                    </span>
                    {isActive && isPlaying && (
                      <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {ch.subtitle}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Read-Along Transcript Card */}
        <Card className="lg:col-span-7 border-white/10 bg-white/[0.035] text-slate-100 shadow-xl backdrop-blur-md">
          <CardHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-300" />
                  Live Read-Along Transcript
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full transcript grounded in your exact natal and transit ephemeris data.
                </p>
              </div>

              {onAskMasterInterpreter && (
                <Button
                  type="button"
                  onClick={() =>
                    onAskMasterInterpreter(
                      `Please elaborate deeply on my celestial podcast briefing: "${briefingChapters[activeChapterIndex]?.title}". What are the hidden astrological mechanics behind this advice?`
                    )
                  }
                  className="h-8 rounded-xl bg-violet-500/30 border border-violet-400/40 text-violet-200 text-xs hover:bg-violet-500/40 gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Ask AI to Elaborate</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4 max-h-[360px] overflow-y-auto">
            {briefingChapters.map((ch, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <div
                  key={ch.id}
                  className={`p-3.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-violet-400/15 border border-violet-400/30 text-white font-medium"
                      : "text-slate-400 opacity-70"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-violet-300 mb-1">
                    {ch.title}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{ch.text}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
