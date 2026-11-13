import { useEffect, useRef, useState } from "react";
import { AudioLines, ChevronDown, Pause, Play, Volume2, VolumeX } from "lucide-react";

const YOUTUBE_VIDEO_ID = "PKcuoULep8c";
const ENABLED_KEY = "firmament-music-enabled";
const VOLUME_KEY = "firmament-music-volume";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function ObservatorySoundscape() {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(0.22);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const storedVolume = Number(window.localStorage.getItem(VOLUME_KEY));
    if (Number.isFinite(storedVolume) && storedVolume >= 0 && storedVolume <= 1) {
      setVolume(storedVolume);
    }
    const storedEnabled = window.localStorage.getItem(ENABLED_KEY);
    const nextEnabled = storedEnabled !== "false";
    setEnabled(nextEnabled);
    window.localStorage.setItem(ENABLED_KEY, String(nextEnabled));
  }, []);

  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT?.Player || !containerRef.current || playerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            setReady(true);
            const savedVol = Number(window.localStorage.getItem(VOLUME_KEY));
            const initialVol = Number.isFinite(savedVol) && savedVol >= 0 && savedVol <= 1 ? savedVol : 0.22;
            event.target.setVolume(Math.round(initialVol * 100));
            const isEnabled = window.localStorage.getItem(ENABLED_KEY) !== "false";
            if (isEnabled) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) setPlaying(true);
            else if (event.data === 2) setPlaying(false);
            else if (event.data === 0) event.target.playVideo();
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.();
        initPlayer();
      };
    }

    return () => {
      try {
        playerRef.current?.destroy?.();
        playerRef.current = null;
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !playerRef.current) return;
    try {
      playerRef.current.setVolume(Math.round(volume * 100));
    } catch {
      // ignore
    }
  }, [ready, volume]);

  useEffect(() => {
    if (!ready || !playerRef.current || !enabled || playing) return;
    const unlock = () => {
      if (window.localStorage.getItem(ENABLED_KEY) !== "false") {
        try {
          playerRef.current?.playVideo?.();
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [ready, enabled, playing]);

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.pauseVideo();
      setPlaying(false);
      setEnabled(false);
      window.localStorage.setItem(ENABLED_KEY, "false");
    } else {
      setEnabled(true);
      window.localStorage.setItem(ENABLED_KEY, "true");
      player.setVolume(Math.round(volume * 100));
      player.playVideo();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    togglePlayback();
  };

  const updateVolume = (value: number) => {
    setVolume(value);
    window.localStorage.setItem(VOLUME_KEY, String(value));
    if (playerRef.current) {
      playerRef.current.setVolume(Math.round(value * 100));
      if (value > 0 && !playing) {
        setEnabled(true);
        window.localStorage.setItem(ENABLED_KEY, "true");
        playerRef.current.playVideo();
      }
    }
  };

  return <>
    <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-1 w-1 overflow-hidden opacity-0" aria-hidden="true">
      <div ref={containerRef} />
    </div>
    <div className="fixed bottom-20 right-3 z-30 flex items-center gap-2 sm:bottom-4 sm:right-4">
      <div className={`overflow-hidden rounded-full border border-violet-200/20 bg-slate-950/85 shadow-xl shadow-violet-950/20 backdrop-blur-xl transition-all ${expanded ? "w-52" : "w-0"}`}>
        <div className="flex h-10 items-center gap-2 px-3">
          <span className="truncate text-[9px] font-semibold uppercase tracking-[.12em] text-violet-100">Inner Peace · 528 Hz</span>
          <input aria-label="Music volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={event => updateVolume(Number(event.target.value))} className="w-16 accent-cyan-300" />
        </div>
      </div>
      <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} aria-label="Open music controls" className="rounded-full border border-violet-200/20 bg-slate-950/85 p-2 text-slate-300 shadow-xl shadow-violet-950/20 backdrop-blur-xl hover:border-violet-200/45 hover:text-white"><ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} /></button>
      <button type="button" onClick={togglePlayback} aria-pressed={playing} aria-label={playing ? "Pause background music" : "Play background music"} className="inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-slate-950/85 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.16em] text-violet-100 shadow-xl shadow-violet-950/20 backdrop-blur-xl hover:border-violet-200/45 hover:bg-slate-900/90">{playing ? <Pause className="h-3.5 w-3.5 text-cyan-300" /> : <Play className="h-3.5 w-3.5 text-violet-200" />}<span className="hidden sm:inline">{playing ? "Music on" : "Music off"}</span></button>
      <button type="button" onClick={toggleMute} aria-label={playing ? "Mute background music" : "Unmute background music"} className="rounded-full border border-violet-200/20 bg-slate-950/85 p-2 text-slate-300 shadow-xl shadow-violet-950/20 backdrop-blur-xl hover:border-violet-200/45 hover:text-white">{playing ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}</button>
      <AudioLines className={`h-3.5 w-3.5 ${playing ? "animate-pulse text-cyan-300" : "text-slate-600"}`} aria-hidden="true" />
    </div>
  </>;
}
