import { useEffect, useRef, useState } from "react";
import { Activity, Pause, Play } from "lucide-react";

export function ObservatoryField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let animation = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = Array.from({ length: 58 }, (_, index) => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .00022, vy: (Math.random() - .5) * .00016,
      radius: index % 7 === 0 ? 1.8 : .8 + Math.random() * .8, hue: index % 3 === 0 ? "103,232,249" : "167,139,250",
    }));
    const resize = () => { const ratio = Math.min(window.devicePixelRatio || 1, 1.5); canvas.width = window.innerWidth * ratio; canvas.height = window.innerHeight * ratio; canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`; context.setTransform(ratio, 0, 0, ratio, 0, 0); };
    const draw = () => {
      const width = window.innerWidth; const height = window.innerHeight;
      context.clearRect(0, 0, width, height);
      particles.forEach(particle => {
        if (!reduceMotion) { particle.x += particle.vx; particle.y += particle.vy; if (particle.x < 0 || particle.x > 1) particle.vx *= -1; if (particle.y < 0 || particle.y > 1) particle.vy *= -1; }
        const x = particle.x * width; const y = particle.y * height; const pulse = .35 + Math.sin(frame * .018 + x) * .12;
        context.beginPath(); context.fillStyle = `rgba(${particle.hue},${Math.max(.16, pulse)})`; context.arc(x, y, particle.radius, 0, Math.PI * 2); context.fill();
      });
      for (let index = 0; index < particles.length; index += 1) for (let next = index + 1; next < particles.length; next += 1) {
        const a = particles[index]; const b = particles[next]; const dx = (a.x - b.x) * width; const dy = (a.y - b.y) * height; const distance = Math.hypot(dx, dy);
        if (distance < 120) { context.beginPath(); context.strokeStyle = `rgba(103,232,249,${.045 * (1 - distance / 120)})`; context.lineWidth = 1; context.moveTo(a.x * width, a.y * height); context.lineTo(b.x * width, b.y * height); context.stroke(); }
      }
      frame += 1; if (!reduceMotion) animation = requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animation); window.removeEventListener("resize", resize); };
  }, [enabled]);

  return <>
    <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-500 ${enabled ? "opacity-80" : "opacity-0"}`} />
    <button type="button" onClick={() => setEnabled(value => !value)} aria-pressed={enabled} className="fixed right-5 top-5 z-30 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-slate-950/65 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-100 shadow-xl shadow-cyan-950/20 backdrop-blur-xl hover:border-cyan-200/45 hover:bg-slate-900/80">
      <Activity className={`h-3.5 w-3.5 ${enabled ? "text-cyan-300" : "text-slate-500"}`} /> {enabled ? "Live field" : "Field paused"} {enabled ? <Pause className="h-3 w-3 text-slate-400" /> : <Play className="h-3 w-3 text-slate-400" />}
    </button>
  </>;
}
