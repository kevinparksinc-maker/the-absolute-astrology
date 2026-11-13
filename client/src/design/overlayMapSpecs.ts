export type OverlayMapSpec = {
  name: "Zodiac" | "Nakshatra" | "Manazil" | "Decan";
  segmentCount: number;
  unitWidthDegrees: number;
  sourceLabel: string;
  shortDescription: string;
  visualTreatment: string;
  mobileAssetSpec: string;
};

export const OVERLAY_MAP_SPECS: OverlayMapSpec[] = [
  {
    name: "Zodiac",
    segmentCount: 12,
    unitWidthDegrees: 30,
    sourceLabel: "tropical zodiac frame",
    shortDescription: "The primary 360° reference band. Use it as the common coordinate system for every overlay.",
    visualTreatment: "Neutral ivory ticks with brighter sign labels and a thin longitude cursor.",
    mobileAssetSpec: "SVG ring or horizontal strip, 360 × 44 px logical size, labels at 30° intervals.",
  },
  {
    name: "Nakshatra",
    segmentCount: 27,
    unitWidthDegrees: 360 / 27,
    sourceLabel: "Indian / Vedic lunar mansion system",
    shortDescription: "A 27-part lunar division with four padas per mansion. The selected Moon position should be the primary focus.",
    visualTreatment: "Warm amber band with four small pada marks per segment; highlight the active mansion with a soft halo.",
    mobileAssetSpec: "SVG or Canvas strip, 360 × 64 px logical size, 27 segments, 108 pada ticks, tappable labels.",
  },
  {
    name: "Manazil",
    segmentCount: 28,
    unitWidthDegrees: 360 / 28,
    sourceLabel: "Arabic lunar mansions",
    shortDescription: "A 28-part lunar mansion band. Keep its names and tradition label separate from Nakshatra terminology.",
    visualTreatment: "Violet band with alternating opacity by segment and a clear Arabic-transliterated name tooltip.",
    mobileAssetSpec: "SVG strip, 360 × 64 px logical size, 28 segments, max 2-line tooltip for long names.",
  },
  {
    name: "Decan",
    segmentCount: 36,
    unitWidthDegrees: 10,
    sourceLabel: "Egyptian / Hellenistic decan tradition",
    shortDescription: "Thirty-six 10° divisions. Use compact glyphs on the map and reveal the ruler on tap.",
    visualTreatment: "Electric cyan band with 10° grid ticks and a ruler glyph at the center of each decan.",
    mobileAssetSpec: "SVG or Canvas strip, 360 × 52 px logical size, 36 segments, 10° grid, tap target ≥44 px.",
  },
];
