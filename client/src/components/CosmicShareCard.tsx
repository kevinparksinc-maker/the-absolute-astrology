import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Square,
  Palette,
  Loader2,
} from "lucide-react";
import type { ChartResult } from "../../../server/astronomy";

export interface CosmicCardData {
  title?: string;
  headline?: string;
  quote?: string;
  archetype?: string;
  sunDisplay?: string;
  moonDisplay?: string;
  ascendantDisplay?: string;
  nakshatraDisplay?: string;
  manzilDisplay?: string;
  activeTransit?: string;
  harmonyScore?: number;
  partnerName?: string;
}

interface CosmicShareCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chart?: ChartResult | null;
  customData?: CosmicCardData;
}

type AspectRatio = "story" | "square";
type CardTheme = "cyan" | "gold" | "violet";

export function CosmicShareCard({
  open,
  onOpenChange,
  chart,
  customData,
}: CosmicShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("story");
  const [theme, setTheme] = useState<CardTheme>("cyan");
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Extract display facts from chart if provided
  const sun = chart?.movingBodies?.find(b => b.name === "Sun");
  const moon = chart?.movingBodies?.find(b => b.name === "Moon");
  const ascendant = chart?.ascendant;

  const title = customData?.title || "THE ALGORITHMS OF THE COSMOS";
  const archetype = customData?.archetype || (
    sun ? `${sun.display.split(" ")[0].toUpperCase()} CORE · ALGORITHMIC BLUEPRINT` : "COSMIC CODE BLUEPRINT"
  );
  const headline = customData?.headline || (
    customData?.partnerName
      ? `SYSTEM INTERSECT MATRIX · ${customData.harmonyScore ?? 84}% SYNERGY`
      : "HOW THE COSMIC CODE FORGED A PERFECT YOU"
  );
  const quote = customData?.quote || (
    customData?.partnerName
      ? `When two celestial trajectories align, friction becomes momentum and harmony becomes home.`
      : `Your algorithm was calibrated for profound depth over superficial ease. You are not random chaos; you are an intentional celestial equation.`
  );

  const sunDisplay = customData?.sunDisplay || (sun ? `${sun.name} in ${sun.display} (H${sun.house})` : "Sun: Aries 14°");
  const moonDisplay = customData?.moonDisplay || (moon ? `${moon.name} in ${moon.display} (H${moon.house})` : "Moon: Taurus 22°");
  const nakshatraDisplay = customData?.nakshatraDisplay || (moon?.overlay?.nakshatra ? `${moon.overlay.nakshatra} (Pada ${moon.overlay.pada})` : "Rohini (Pada 2)");
  const manzilDisplay = customData?.manzilDisplay || (moon?.overlay?.manzil || "Al-Dabaran");
  const ascendantDisplay = customData?.ascendantDisplay || (ascendant ? `Ascendant ${ascendant.display}` : "Ascendant Horizon");

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: High-DPI 2x for crystal-clear sharing
    const width = 1080;
    const height = aspectRatio === "story" ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;

    // Background base
    ctx.fillStyle = "#050713";
    ctx.fillRect(0, 0, width, height);

    // Glowing Nebula gradients based on theme
    const primaryGlow = theme === "cyan" ? "#06b6d4" : theme === "gold" ? "#f59e0b" : "#a855f7";
    const secondaryGlow = theme === "cyan" ? "#3b82f6" : theme === "gold" ? "#d97706" : "#6366f1";

    // Top Radial Glow
    const radGradTop = ctx.createRadialGradient(width / 2, height * 0.2, 50, width / 2, height * 0.2, 600);
    radGradTop.addColorStop(0, `${primaryGlow}33`);
    radGradTop.addColorStop(0.5, `${secondaryGlow}15`);
    radGradTop.addColorStop(1, "transparent");
    ctx.fillStyle = radGradTop;
    ctx.fillRect(0, 0, width, height);

    // Bottom Radial Glow
    const radGradBot = ctx.createRadialGradient(width * 0.8, height * 0.85, 30, width * 0.8, height * 0.85, 500);
    radGradBot.addColorStop(0, `${secondaryGlow}22`);
    radGradBot.addColorStop(1, "transparent");
    ctx.fillStyle = radGradBot;
    ctx.fillRect(0, 0, width, height);

    // Starfield specks
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 90; i++) {
      const sx = (i * 137.5) % width;
      const sy = (i * 243.1) % height;
      const size = (i % 3 === 0) ? 2.5 : (i % 2 === 0) ? 1.5 : 1;
      ctx.globalAlpha = 0.2 + ((i % 5) * 0.15);
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Geometric Concentric Orbit Rings in Center
    const orbitCenterY = aspectRatio === "story" ? height * 0.38 : height * 0.44;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `${primaryGlow}30`;
    ctx.beginPath();
    ctx.arc(width / 2, orbitCenterY, 220, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `${primaryGlow}50`;
    ctx.setLineDash([6, 12]);
    ctx.beginPath();
    ctx.arc(width / 2, orbitCenterY, 260, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = `${secondaryGlow}25`;
    ctx.beginPath();
    ctx.arc(width / 2, orbitCenterY, 300, 0, Math.PI * 2);
    ctx.stroke();

    // Orbital cross-hairs
    ctx.strokeStyle = `${primaryGlow}20`;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 340, orbitCenterY);
    ctx.lineTo(width / 2 + 340, orbitCenterY);
    ctx.moveTo(width / 2, orbitCenterY - 340);
    ctx.lineTo(width / 2, orbitCenterY + 340);
    ctx.stroke();

    // Core Center Glyph / Sun Icon
    ctx.fillStyle = `${primaryGlow}25`;
    ctx.beginPath();
    ctx.arc(width / 2, orbitCenterY, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = primaryGlow;
    ctx.beginPath();
    ctx.arc(width / 2, orbitCenterY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Outer Border Frame
    ctx.strokeStyle = `${primaryGlow}40`;
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(62, 62, width - 124, height - 124);

    // ==========================================
    // TEXT RENDERING
    // ==========================================

    // Top Brand Eyebrow
    ctx.textAlign = "center";
    ctx.fillStyle = primaryGlow;
    ctx.font = "bold 24px 'DM Mono', monospace";
    ctx.fillText("✦ THE ALGORITHMS OF THE COSMOS ✦", width / 2, 130);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "500 19px 'Manrope', sans-serif";
    ctx.fillText(chart?.input?.location || "DETERMINISTIC CELESTIAL ENGINE", width / 2, 168);

    // Archetype Badge Pill
    const badgeY = aspectRatio === "story" ? 230 : 210;
    ctx.fillStyle = `${primaryGlow}18`;
    ctx.strokeStyle = `${primaryGlow}50`;
    const pillWidth = Math.min(width - 240, ctx.measureText(archetype).width + 80);
    ctx.beginPath();
    ctx.roundRect(width / 2 - pillWidth / 2, badgeY, pillWidth, 54, 27);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px 'Manrope', sans-serif";
    ctx.fillText(archetype, width / 2, badgeY + 34);

    // Big Bold Center Headline
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Playfair Display', serif";
    const words = headline.split(" ");
    let line = "";
    let lineY = aspectRatio === "story" ? height * 0.58 : height * 0.62;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 200 && n > 0) {
        ctx.fillText(line.trim(), width / 2, lineY);
        line = words[n] + " ";
        lineY += 56;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), width / 2, lineY);

    // Three Cosmic Code Data Columns Box
    const boxY = lineY + 38;
    const boxH = aspectRatio === "story" ? 190 : 150;
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.roundRect(100, boxY, width - 200, boxH, 20);
    ctx.fill();
    ctx.stroke();

    // Column 1: Sun placement
    const col1X = width / 2 - 270;
    ctx.fillStyle = `${primaryGlow}`;
    ctx.font = "bold 17px 'DM Mono', monospace";
    ctx.fillText("☀️ SOLAR CORE", col1X, boxY + 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 21px 'Manrope', sans-serif";
    ctx.fillText(sunDisplay.replace(/^(Sun in |Your Sun in )/i, ""), col1X, boxY + 80);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "16px 'Manrope', sans-serif";
    ctx.fillText(ascendantDisplay, col1X, boxY + 115);

    // Column 2: Lunar Mansion & Nakshatra
    const col2X = width / 2 + 270;
    ctx.fillStyle = `${secondaryGlow}`;
    ctx.font = "bold 17px 'DM Mono', monospace";
    ctx.fillText("🌙 LUNAR ANCHOR", col2X, boxY + 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 21px 'Manrope', sans-serif";
    ctx.fillText(`Nakshatra: ${nakshatraDisplay}`, col2X, boxY + 80);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "16px 'Manrope', sans-serif";
    ctx.fillText(`Manzil: ${manzilDisplay}`, col2X, boxY + 115);

    // Golden Truth Quote
    if (aspectRatio === "story") {
      const quoteY = boxY + boxH + 60;
      ctx.fillStyle = `${primaryGlow}80`;
      ctx.font = "bold 48px 'Playfair Display', serif";
      ctx.fillText("“", width / 2, quoteY - 10);

      ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
      ctx.font = "italic 24px 'Playfair Display', Georgia, serif";

      // Wrap quote
      const qWords = quote.split(" ");
      let qLine = "";
      let qCurrentY = quoteY + 28;
      for (let w = 0; w < qWords.length; w++) {
        const testQ = qLine + qWords[w] + " ";
        if (ctx.measureText(testQ).width > width - 240 && w > 0) {
          ctx.fillText(qLine.trim(), width / 2, qCurrentY);
          qLine = qWords[w] + " ";
          qCurrentY += 36;
        } else {
          qLine = testQ;
        }
      }
      ctx.fillText(qLine.trim(), width / 2, qCurrentY);
    }

    // Bottom Watermark & Verification
    const footerY = height - 90;
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "500 18px 'Manrope', sans-serif";
    ctx.fillText("Verified with Swiss Ephemeris & 16-System Convergence", width / 2, footerY);

    ctx.fillStyle = primaryGlow;
    ctx.font = "bold 16px 'DM Mono', monospace";
    ctx.fillText("thealgorithmsofthecosmos.com", width / 2, footerY + 30);
  };

  useEffect(() => {
    if (open) {
      setTimeout(drawCard, 50);
    }
  }, [open, aspectRatio, theme, customData, chart]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `cosmic-algorithm-card-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setIsGenerating(true);
      canvas.toBlob(async blob => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
        setIsGenerating(false);
      }, "image/png");
    } catch (err) {
      console.warn("Clipboard write failed, falling back to download:", err);
      handleDownload();
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setIsGenerating(true);
      canvas.toBlob(async blob => {
        if (!blob) return;
        const file = new File([blob], "cosmic-card.png", { type: "image/png" });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "The Algorithms of the Cosmos",
            text: `${headline} — Decode how the cosmic algorithms made a perfect you.`,
            files: [file],
          });
        } else {
          handleDownload();
        }
        setIsGenerating(false);
      }, "image/png");
    } catch (err) {
      console.warn("Share failed or cancelled:", err);
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-cyan-200/20 bg-slate-950/95 text-slate-100 p-6 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-serif text-xl text-white">
              <Sparkles className="h-5 w-5 text-cyan-300 animate-pulse" />
              <span>Export Cosmic Share Card</span>
            </DialogTitle>
            <Badge variant="outline" className="border-cyan-300/30 text-cyan-200 text-xs">
              Instagram Stories & Feed
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate an aesthetic, high-contrast visual snapshot of your astrological algorithm to share on social platforms.
          </p>
        </DialogHeader>

        {/* Format & Theme Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Aspect Ratio Picker */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] p-1 text-xs">
            <button
              type="button"
              onClick={() => setAspectRatio("story")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                aspectRatio === "story"
                  ? "bg-cyan-400/20 text-cyan-100 font-semibold border border-cyan-300/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> 9:16 Story
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("square")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                aspectRatio === "square"
                  ? "bg-cyan-400/20 text-cyan-100 font-semibold border border-cyan-300/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Square className="h-3.5 w-3.5" /> 1:1 Square
            </button>
          </div>

          {/* Theme Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Palette className="h-3 w-3" /> Aura:
            </span>
            <button
              type="button"
              onClick={() => setTheme("cyan")}
              className={`h-6 w-6 rounded-full bg-cyan-400 border-2 transition ${
                theme === "cyan" ? "border-white scale-110 shadow-lg shadow-cyan-500/50" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              title="Obsidian Cyan"
            />
            <button
              type="button"
              onClick={() => setTheme("gold")}
              className={`h-6 w-6 rounded-full bg-amber-400 border-2 transition ${
                theme === "gold" ? "border-white scale-110 shadow-lg shadow-amber-500/50" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              title="Solar Gold"
            />
            <button
              type="button"
              onClick={() => setTheme("violet")}
              className={`h-6 w-6 rounded-full bg-violet-400 border-2 transition ${
                theme === "violet" ? "border-white scale-110 shadow-lg shadow-violet-500/50" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              title="Deep Violet"
            />
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="relative flex justify-center items-center py-2 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
          <div
            className={`overflow-hidden rounded-xl shadow-2xl transition-all ${
              aspectRatio === "story" ? "w-[240px] h-[426px]" : "w-[320px] h-[320px]"
            }`}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            disabled={isGenerating}
            className="border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-xs gap-1.5"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{isCopied ? "Copied Image!" : "Copy to Clipboard"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleNativeShare}
            disabled={isGenerating}
            className="border-cyan-200/30 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-100 text-xs gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share to Story / Post</span>
          </Button>

          <Button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 hover:from-cyan-300 hover:to-cyan-200 font-semibold text-xs gap-1.5 shadow-md shadow-cyan-900/30"
          >
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>Download High-Res PNG</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
