import { beforeAll, describe, expect, it } from "vitest";
import { calculateChart, type ChartResult } from "../../astronomy";
import { buildUnifiedMasterChart } from "../../masterChart/builder";
import { synthesizeMasterSnapshot } from "../synthesis/readingBridge";
import { applyMethodRules } from "../synthesis/methodRules";
import {
  calculateVedicStrength,
  uchchaBala,
  digBala,
  sphutaDrishti,
  cheshtaKendra,
  strengthVargaSign,
  ayanaBala,
  REQUIRED,
  type VedicStrength,
} from "./strength";
let chart: ChartResult, result: VedicStrength;
const input = {
  location: "Dallas, Texas",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  readingScope: "natal" as const,
};
beforeAll(async () => {
  chart = await calculateChart(input);
  result = calculateVedicStrength(chart);
});
describe("Source-backed Vedic strength formulas", () => {
  it("matches the published Sun 12 Gemini exaltation-distance example and endpoints", () => {
    expect(uchchaBala("Sun", 72)).toBeCloseTo(118 / 3, 10);
    expect(uchchaBala("Sun", 10)).toBeCloseTo(60, 10);
    expect(uchchaBala("Sun", 190)).toBeCloseTo(0, 10);
  });
  it("matches the Moon 3 Taurus / 17 Cancer directional example and wraps the seam", () => {
    const houses = Array.from({ length: 12 }, (_, i) => (187 + 30 * i) % 360);
    expect(digBala("Moon", 33, houses)).toBeCloseTo(64 / 3, 10);
    const zero = Array.from({ length: 12 }, (_, i) => i * 30);
    expect(digBala("Sun", 270, zero)).toBe(60);
    expect(digBala("Sun", 90, zero)).toBe(0);
    expect(digBala("Saturn", 359, zero)).toBeCloseTo(1 / 3, 10);
  });
  it("uses exact degree-based special Drishti rather than Western aspect weights", () => {
    expect(sphutaDrishti("Saturn", 0, 60)).toBe(60);
    expect(sphutaDrishti("Mars", 0, 90)).toBe(60);
    expect(sphutaDrishti("Jupiter", 0, 120)).toBe(60);
    expect(sphutaDrishti("Sun", 0, 180)).toBe(60);
    expect(sphutaDrishti("Sun", 0, 20)).toBe(0);
    expect(sphutaDrishti("Jupiter", 359, 119)).toBe(60);
  });
  it("derives the additional D7, D12 and unequal D30 divisions from the original longitude", () => {
    expect(strengthVargaSign(0, 7)).toBe(0);
    expect(strengthVargaSign(30, 7)).toBe(7);
    expect(strengthVargaSign(32.5, 12)).toBe(2);
    expect(strengthVargaSign(4.999, 30)).toBe(0);
    expect(strengthVargaSign(5, 30)).toBe(10);
    expect(strengthVargaSign(35, 30)).toBe(5);
    expect(strengthVargaSign(55, 30)).toBe(7);
  });
  it("reads physical declination without tilting the wheel and applies the planet-specific polarity", () => {
    expect(ayanaBala("Sun", 24)).toBe(60);
    expect(ayanaBala("Moon", 24)).toBe(0);
    expect(ayanaBala("Moon", -24)).toBe(60);
    expect(ayanaBala("Mercury", -24)).toBe(60);
    expect(ayanaBala("Jupiter", 0)).toBe(30);
  });
  it("takes a circular mean for continuous Cheshta across 0 degrees", () => {
    expect(cheshtaKendra("Mars", 1, 359, 180)).toBe(60);
    expect(cheshtaKendra("Mercury", 1, 180, 359)).toBe(60);
  });
  it("computes every limb and subcomponent and preserves the classical minimums", () => {
    expect(result.planets).toHaveLength(7);
    for (const p of result.planets) {
      expect(Object.keys(p.components)).toEqual([
        "sthana",
        "dig",
        "kala",
        "cheshta",
        "naisargika",
        "drik",
      ]);
      expect(Object.values(p.components).every(Number.isFinite)).toBe(true);
      expect(p.totalVirupas).toBeCloseTo(
        Object.values(p.components).reduce((a, b) => a + b),
        10
      );
      expect(p.components.sthana).toBeCloseTo(
        Object.values(p.sthanaParts).reduce((a, b) => a + b),
        10
      );
      expect(p.components.kala).toBeCloseTo(
        Object.values(p.kalaParts).reduce((a, b) => a + b),
        10
      );
      expect(p.vargas.map(v => v.division)).toEqual([
        "D1",
        "D2",
        "D3",
        "D7",
        "D9",
        "D12",
        "D30",
      ]);
      expect(p.requiredVirupas).toBe(REQUIRED[p.body]);
      expect(p.adequacyRatio).toBeCloseTo(
        p.totalVirupas / REQUIRED[p.body],
        10
      );
      expect(p.rupas).toBeCloseTo(p.totalVirupas / 60, 10);
    }
  });
  it("keeps astronomical input positions and cusps intact", () => {
    const before = structuredClone(chart);
    calculateVedicStrength(chart);
    expect(chart).toEqual(before);
    expect(result.coordinateVariant.frame).toContain("no zodiac conversion");
  });
  it("builds house totals from their actual lord's full Shadbala plus all house components", () => {
    expect(result.houses).toHaveLength(12);
    expect(new Set(result.houses.map(h => h.rank)).size).toBe(12);
    for (const h of result.houses) {
      const lord = result.planets.find(p => p.body === h.lord)!;
      expect(h.components.lord).toBe(lord.totalVirupas);
      expect(h.totalVirupas).toBeCloseTo(
        Object.values(h.components).reduce((a, b) => a + b),
        10
      );
      expect(h.lordDeliveryHouse).toBe(lord.house);
    }
  });
  it("calculates zero-sum war redistribution from eligible pairs only", () => {
    const changed = structuredClone(chart);
    changed.movingBodies.find(p => p.name === "Mars")!.longitude = 100;
    changed.movingBodies.find(p => p.name === "Mercury")!.longitude = 100.5;
    const s = calculateVedicStrength(changed);
    expect(
      s.planets
        .find(p => p.body === "Mercury")!
        .war.some(w => w.other === "Mars" && w.winner === "Mercury")
    ).toBe(true);
    expect(s.planets.reduce((n, p) => n + p.kalaParts.yuddha, 0)).toBeCloseTo(
      0,
      10
    );
    expect(s.planets.slice(0, 2).every(p => p.kalaParts.yuddha === 0)).toBe(
      true
    );
  });
  it("rejects missing prerequisites instead of substituting a strength", () => {
    expect(() => calculateVedicStrength({ ...chart, ascendant: null })).toThrow(
      "Ascendant"
    );
    expect(() =>
      calculateVedicStrength({
        ...chart,
        movingBodies: chart.movingBodies.filter(p => p.name !== "Mars"),
      })
    ).toThrow("Mars");
  });
  it("feeds both numerical layers into the Master Synthesizer with a grounded H5/H11 comparison", async () => {
    const snapshot = await buildUnifiedMasterChart({ ...input, mode: "natal" });
    const synthesis = (
      await synthesizeMasterSnapshot(
        snapshot,
        "natal",
        "Explain creative output and network support using house and planetary strength"
      )
    ).synthesis;
    for (const id of ["vedic-shadbala", "vedic-bhava-bala"]) {
      expect(snapshot.layers[id].status).toBe("computed-with-result");
      expect(
        synthesis.methodOutcomes.find(o => o.methodId === id)?.status
      ).toBe("interpreted");
    }
    const bhava = synthesis.methodOutcomes.find(
      o => o.methodId === "vedic-bhava-bala"
    )!;
    const comparison = bhava.findingJudgments.find(
      j => j.subject === "Creative output and network support"
    )!;
    expect(comparison.evidenceIds).toEqual(
      expect.arrayContaining(["bhava-bala-house-5", "bhava-bala-house-11"])
    );
    expect(comparison.judgment).toContain(
      "your own creative output more capacity"
    );
    expect(
      synthesis.themes.some(t => t.linkedPropositionIds.includes(comparison.id))
    ).toBe(true);
    const broken = structuredClone(snapshot.layers["vedic-shadbala"]);
    (broken.results as any[])[0].totalVirupas += 1;
    expect(() => applyMethodRules(broken, snapshot)).toThrow("sum mismatch");
  });
});
