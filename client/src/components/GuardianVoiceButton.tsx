import { useEffect, useState } from "react";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

type VoiceStatus = "idle" | "speaking" | "unavailable" | "error";

const cleanSpeech = (text: string) => text.replace(/[*_#`]/g, "").replace(/\s+/g, " ").trim();
const splitSpeech = (text: string) => {
  const normalized = cleanSpeech(text);
  if (normalized.length <= 850) return [normalized];
  const sentences = normalized.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length + 1 > 850) { chunks.push(current); current = ""; }
    current += `${current ? " " : ""}${sentence}`;
  }
  if (current) chunks.push(current);
  return chunks;
};

export function speakGuardian(text: string, onStatus?: (status: VoiceStatus) => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    onStatus?.("unavailable");
    return false;
  }
  const synthesis = window.speechSynthesis;
  synthesis.cancel();
  const chunks = splitSpeech(text);
  if (!chunks.length) return false;
  let index = 0;
  let started = false;
  const speakNext = () => {
    if (index >= chunks.length) { onStatus?.("idle"); return; }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 0.88;
    utterance.pitch = 0.82;
    utterance.volume = 1;
    utterance.onstart = () => { started = true; onStatus?.("speaking"); };
    utterance.onend = () => { index += 1; window.setTimeout(speakNext, 180); };
    utterance.onerror = () => onStatus?.("error");
    const voices = synthesis.getVoices();
    const preferred = voices.find(voice => /^en(-US)?/i.test(voice.lang) && /Google|Samantha|Microsoft|Alex/i.test(voice.name)) || voices.find(voice => /^en/i.test(voice.lang));
    if (preferred) utterance.voice = preferred;
    synthesis.speak(utterance);
  };
  const chooseVoicesAndStart = () => { if (started) return; speakNext(); };
  if (synthesis.getVoices().length) chooseVoicesAndStart();
  else { synthesis.addEventListener("voiceschanged", chooseVoicesAndStart, { once: true }); window.setTimeout(chooseVoicesAndStart, 250); }
  return true;
}

export function GuardianVoiceButton({ text }: { text: string }) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  if (!supported) return null;
  const speaking = status === "speaking";
  return <Button type="button" variant="ghost" size="icon" onClick={() => { if (speaking) { window.speechSynthesis.cancel(); setStatus("idle"); } else speakGuardian(text, setStatus); }} className={`h-7 w-7 rounded-full ${status === "error" ? "text-rose-300" : "text-cyan-200/70 hover:bg-cyan-300/10 hover:text-cyan-100"}`} aria-label={speaking ? "Stop Guardian voice" : "Play Guardian voice"} title={status === "error" ? "Voice failed — try again" : "Play Guardian voice"}>
    {speaking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === "error" ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
  </Button>;
}
