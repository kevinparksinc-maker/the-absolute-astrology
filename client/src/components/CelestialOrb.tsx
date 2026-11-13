import React, { useEffect, useRef } from "react";

interface CelestialOrbProps {
  size?: number;
  className?: string;
  intensity?: "low" | "medium" | "high";
  interactive?: boolean;
}

export function CelestialOrb({
  size = 280,
  className = "",
  intensity = "high",
  interactive = true,
}: CelestialOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, hovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion safely
    const prefersReducedMotion =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false
        : false;

    let animationFrameId: number;
    let rotation = 0;
    let pulsePhase = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Seed orbital nodes
    const nodeCount = 14;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      angle: (i / nodeCount) * Math.PI * 2,
      orbitRadius: (size * 0.28) + (i % 3) * (size * 0.08),
      speed: (0.004 + (i % 4) * 0.003) * ((i % 2 === 0) ? 1 : -1),
      radius: 1.5 + (i % 3) * 0.8,
      color: i % 4 === 0 ? "#D9B66F" : i % 4 === 1 ? "#22D3EE" : i % 4 === 2 ? "#8B5CF6" : "#E8EDF7",
      tilt: 0.35 + (i % 3) * 0.25,
    }));

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // Mouse follow interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const tiltX = (mouseRef.current.x / size) * 0.25;
      const tiltY = (mouseRef.current.y / size) * 0.25;

      if (!prefersReducedMotion) {
        rotation += 0.008;
        pulsePhase += 0.02;
      }

      const pulse = Math.sin(pulsePhase) * 0.08 + 1;

      // Layer 1: Ambient Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, size * 0.05, cx, cy, size * 0.48);
      glowGrad.addColorStop(0, "rgba(139, 92, 246, 0.24)");
      glowGrad.addColorStop(0.35, "rgba(34, 211, 238, 0.12)");
      glowGrad.addColorStop(0.7, "rgba(217, 182, 111, 0.06)");
      glowGrad.addColorStop(1, "rgba(8, 11, 20, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Concentric Gyroscopic Orbital Rings
      const ringSpecs = [
        { r: size * 0.42, tilt: 0.45 + tiltY, rotSpeed: 0.006, color: "rgba(217, 182, 111, 0.35)", dash: [4, 6] },
        { r: size * 0.34, tilt: -0.55 + tiltX, rotSpeed: -0.007, color: "rgba(34, 211, 238, 0.4)", dash: [2, 5] },
        { r: size * 0.26, tilt: 0.25 + tiltY, rotSpeed: 0.009, color: "rgba(139, 92, 246, 0.45)", dash: [] },
      ];

      ringSpecs.forEach((ring, idx) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rotation * (idx % 2 === 0 ? 1 : -1)) + idx * (Math.PI / 3));
        ctx.scale(1, Math.abs(Math.cos(ring.tilt)));

        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.2;
        if (ring.dash.length) {
          ctx.setLineDash(ring.dash);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.stroke();

        // Subtle quadrant ticks on outer ring
        if (idx === 0) {
          ctx.setLineDash([]);
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            const tx = Math.cos(a) * ring.r;
            const ty = Math.sin(a) * ring.r;
            ctx.beginPath();
            ctx.arc(tx, ty, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(217, 182, 111, 0.6)";
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // Layer 3: Orbiting Celestial Nodes
      nodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.angle += node.speed;
        }
        const effAngle = node.angle + rotation * 0.5;
        const x = cx + Math.cos(effAngle) * node.orbitRadius;
        const y = cy + Math.sin(effAngle) * node.orbitRadius * node.tilt;

        // Draw node glow
        ctx.beginPath();
        ctx.arc(x, y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = node.color.replace(")", ", 0.25)").replace("rgb", "rgba").replace("#D9B66F", "rgba(217, 182, 111, 0.25)").replace("#22D3EE", "rgba(34, 211, 238, 0.25)").replace("#8B5CF6", "rgba(139, 92, 246, 0.25)").replace("#E8EDF7", "rgba(232, 237, 247, 0.25)");
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(x, y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      // Layer 4: Deep Obsidian Core with Gold/Violet Corona
      const coreR = size * 0.17 * pulse;
      const coreGrad = ctx.createRadialGradient(
        cx - coreR * 0.25,
        cy - coreR * 0.25,
        coreR * 0.1,
        cx,
        cy,
        coreR
      );
      coreGrad.addColorStop(0, "#22194D");
      coreGrad.addColorStop(0.4, "#101628");
      coreGrad.addColorStop(0.85, "#080B14");
      coreGrad.addColorStop(1, "rgba(8, 11, 20, 0.95)");

      ctx.save();
      ctx.shadowColor = "#D9B66F";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Core luminous rim
      ctx.strokeStyle = "rgba(217, 182, 111, 0.75)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Layer 5: Central Divine Sparkle / Emblem
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation * 0.5);

      // Four-point celestial star inside the core
      const starR = coreR * 0.55;
      ctx.fillStyle = "rgba(232, 237, 247, 0.85)";
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * starR, Math.sin(a) * starR);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * (starR * 0.22), Math.sin(a + Math.PI / 4) * (starR * 0.22));
      }
      ctx.closePath();
      ctx.fill();

      // Central gold dot
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#D9B66F";
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
      mouseRef.current.hovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.hovering = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [size, intensity, interactive]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Celestial intelligence orb with concentric rotating orbits and luminous core"
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="pointer-events-auto"
      />
    </div>
  );
}
