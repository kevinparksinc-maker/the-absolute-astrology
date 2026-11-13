import { arabicHermetic } from "./arabic-hermetic";
import { aspects } from "./aspects";
import { behavioral } from "./behavioral";
import { decan } from "./decan";
import { fixedStars } from "./fixed-stars";
import { genesis } from "./genesis";
import { godAgent } from "./god-agent";
import { kabbalah } from "./kabbalah";
import { lifeEvents } from "./life-events";
import { lots } from "./lots";
import { manzil } from "./manzil";
import { nakshatra } from "./nakshatra";
import { sectDignity } from "./sect-dignity";
import { timing } from "./timing";
import { transits } from "./transits";
import { vedic } from "./vedic";
import { western } from "./western";
import type { PlacementAdapter } from "./types";

export const PLACEMENT_METHODS: Array<{ method: string; label: string; adapter: PlacementAdapter }> = [
  { method: "western", label: "Western / Hellenistic", adapter: western },
  { method: "vedic", label: "Vedic / Jyotish", adapter: vedic },
  { method: "arabic", label: "Arabic / Hermetic", adapter: arabicHermetic },
  { method: "nakshatra", label: "Nakshatra / Pada", adapter: nakshatra },
  { method: "manzil", label: "Arabic Manzil", adapter: manzil },
  { method: "decan", label: "Decan / elemental family", adapter: decan },
  { method: "lots", label: "Lots", adapter: lots },
  { method: "sect", label: "Sect / dignity / condition", adapter: sectDignity },
  { method: "fixedStars", label: "Fixed stars", adapter: fixedStars },
  { method: "genesis", label: "Genesis Astro / Pattern / Yoga", adapter: genesis },
  { method: "behavior", label: "Human behavioral intelligence", adapter: behavioral },
  { method: "lifeEvents", label: "Life events and sequences", adapter: lifeEvents },
  { method: "kabbalah", label: "Sefer Yetzirah / Kabbalah", adapter: kabbalah },
  { method: "godAgent", label: "God View / Agent View", adapter: godAgent },
  { method: "aspects", label: "Aspects and relational mechanics", adapter: aspects },
  { method: "transits", label: "Transits to natal", adapter: transits },
  { method: "timing", label: "Timing and activation", adapter: timing },
];
