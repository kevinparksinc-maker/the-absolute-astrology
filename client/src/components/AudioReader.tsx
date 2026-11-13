import { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReaderState = "idle" | "playing" | "paused";

function spokenText(markdown: string) {
  return markdown.replace(/```[\s\S]*?```/g, "").replace(/[#*_>`]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
}

function splitSpeech(text: string, maxLength = 220) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences.map(value => value.trim()).filter(Boolean)) {
    if (!current) { current = sentence; continue; }
    if ((current + " " + sentence).length <= maxLength) current += ` ${sentence}`;
    else { chunks.push(current); current = sentence; }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function AudioReader({ text, label = "Listen" }: { text: string; label?: string }) {
  const [state, setState] = useState<ReaderState>("idle");
  const [supported, setSupported] = useState(false);
  const clean = useMemo(() => spokenText(text), [text]);
  const chunks = useMemo(() => splitSpeech(clean), [clean]);
  const playbackId = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    playbackId.current += 1;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setState("idle");
    return () => { playbackId.current += 1; if (typeof window !== "undefined") window.speechSynthesis?.cancel(); };
  }, [text]);

  if (!supported || !chunks.length) return null;

  const stop = () => {
    playbackId.current += 1;
    window.speechSynthesis.cancel();
    setState("idle");
  };

  const speakChunks = (id: number, index: number) => {
    if (id !== playbackId.current || index >= chunks.length) { if (id === playbackId.current) setState("idle"); return; }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => /en-US|en-GB/i.test(voice.lang) && /david|daniel|alex|george|mark|mature|male/i.test(voice.name)) ?? voices.find(voice => /en-US|en-GB/i.test(voice.lang));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.84;
    utterance.pitch = 0.82;
    utterance.volume = 1;
    utterance.onstart = () => { if (id === playbackId.current) setState("playing"); };
    utterance.onend = () => speakChunks(id, index + 1);
    utterance.onerror = event => { if (id !== playbackId.current || event.error === "canceled" || event.error === "interrupted") return; setState("idle"); };
    window.speechSynthesis.speak(utterance);
  };

  const play = () => {
    if (state === "paused") { window.speechSynthesis.resume(); setState("playing"); return; }
    playbackId.current += 1;
    const id = playbackId.current;
    window.speechSynthesis.cancel();
    setState("playing");
    let started = false;
    const start = () => { if (started || id !== playbackId.current) return; started = true; speakChunks(id, 0); };
    if (window.speechSynthesis.getVoices().length) start();
    else {
      window.speechSynthesis.addEventListener("voiceschanged", start, { once: true });
      window.setTimeout(start, 350);
    }
  };

  const pause = () => { window.speechSynthesis.pause(); setState("paused"); };

  return <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-200/10 bg-cyan-100/[0.04] px-3 py-2"><Headphones className="h-4 w-4 text-cyan-300"/><span className="mr-1 text-xs text-slate-400">{state === "playing" ? "Reading aloud" : state === "paused" ? "Paused" : label}</span>{state === "playing" ? <Button type="button" size="sm" variant="outline" onClick={pause} className="h-8 border-white/10 bg-transparent text-slate-200" aria-label="Pause reading aloud"><Pause className="mr-1.5 h-3.5 w-3.5"/>Pause</Button> : <Button type="button" size="sm" variant="outline" onClick={play} className="h-8 border-cyan-200/20 bg-cyan-100/5 text-cyan-100" aria-label={state === "paused" ? "Resume reading aloud" : label}><Play className="mr-1.5 h-3.5 w-3.5"/>{state === "paused" ? "Resume" : "Play"}</Button>}{state !== "idle" && <Button type="button" size="sm" variant="ghost" onClick={stop} className="h-8 text-slate-400 hover:text-white" aria-label="Stop reading aloud"><Square className="mr-1.5 h-3.5 w-3.5"/>Stop</Button>}</div>;
}
