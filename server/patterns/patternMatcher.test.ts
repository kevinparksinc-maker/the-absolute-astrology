import { describe, expect, it } from "vitest";
import {
  detectWesternAspects,
  synthesizeCrossSystemPatterns,
} from "../utils/patternMatcher";
import { MockArabicProvider, calculateArabicLots } from "../utils/arabicLots";
import { MockTvamProvider, parseTvamResponse } from "../services/tvamClient";

const placements = [
  { planet: "Sun", longitude: 359, sign: "Pisces", house: 1 },
  { planet: "Moon", longitude: 1, sign: "Aries", house: 7 },
  { planet: "Mars", longitude: 89, sign: "Gemini", house: 10 },
];

describe("local pattern matcher", () => {
  it("uses inclusive 5° boundaries for conjunction, square, trine, and opposition", () => {
    const targets = [
      ["conjunction", 0],
      ["square", 90],
      ["trine", 120],
      ["opposition", 180],
    ] as const;
    for (const [type, angle] of targets) {
      for (const delta of [4.99, 5]) {
        expect(
          detectWesternAspects([
            { planet: "A", longitude: 0 },
            { planet: "B", longitude: angle + delta },
          ])
        ).toEqual(expect.arrayContaining([expect.objectContaining({ type })]));
      }
      expect(
        detectWesternAspects([
          { planet: "A", longitude: 359 },
          { planet: "B", longitude: 3.99 },
        ])
      ).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "conjunction", orb: 4.99 })])
      );
    }
    expect(
      detectWesternAspects([
        { planet: "A", longitude: 359 },
        { planet: "B", longitude: 3.01 },
      ])
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "conjunction", orb: 4.01 }),
      ])
    );
  });

  it("detects wraparound conjunctions and a square", () => {
    const aspects = detectWesternAspects(placements);
    expect(aspects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          planetA: "Sun",
          planetB: "Moon",
          type: "conjunction",
          orb: 2,
        }),
        expect.objectContaining({
          planetA: "Moon",
          planetB: "Mars",
          type: "square",
        }),
      ])
    );
  });

  it("synthesizes only convergences supported by at least two layers", () => {
    const result = synthesizeCrossSystemPatterns({
      userQuestion: "How should I work with pressure?",
      western: { placements, aspects: [], provider: "local-western" },
      vedic: {
        provider: "mock-tvam",
        signals: [
          {
            planet: "Moon",
            longitude: 1,
            nakshatra: "Ashwini",
            dignity: "neutral",
            themes: ["pressure"],
          },
        ],
      },
      arabic: {
        provider: "mock-canopy",
        lots: {},
        signals: [
          { planet: "Mars", manzil: "Al-Sharatain", themes: ["pressure"] },
        ],
      },
      minimumScore: 0,
    });
    expect(result.aspects.length).toBeGreaterThan(0);
    expect(result.patterns.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toMatch(/unverified third-party scraping/);
  });
});

describe("provider adapters", () => {
  it("normalizes a Tvam-like payload without requiring the real app", async () => {
    const snapshot = parseTvamResponse({
      planets: [
        {
          name: "Moon",
          longitude: 361,
          nakshatra: "Ashwini",
          dignity: "exalted",
          themes: ["belonging"],
        },
      ],
    });
    expect(snapshot.signals[0]).toMatchObject({
      planet: "Moon",
      longitude: 1,
      nakshatra: "Ashwini",
    });
    await expect(
      new MockTvamProvider(snapshot).getAnalysis({ chartId: "test" })
    ).resolves.toEqual(snapshot);
  });

  it("calculates sect-sensitive Lots and exposes a mock Arabic provider", async () => {
    const inputs = {
      ascendant: 10,
      sun: 100,
      moon: 200,
      venus: 300,
      sect: "day" as const,
    };
    expect(calculateArabicLots(inputs)).toMatchObject({
      fortune: 110,
      spirit: 270,
      eros: 40,
    });
    await expect(
      new MockArabicProvider().getAnalysis(inputs)
    ).resolves.toMatchObject({
      provider: "mock-canopy",
      lots: { fortune: 110, spirit: 270, eros: 40 },
    });
  });
});
