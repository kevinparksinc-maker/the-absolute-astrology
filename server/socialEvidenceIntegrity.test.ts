import { describe, expect, it } from "vitest";
import type { ChartResult } from "./astronomy";
import { analyzeSystemIntersect } from "./social";

function chart(positions: Record<string, number>): ChartResult {
  return {
    movingBodies: Object.entries(positions).map(([name, longitude]) => ({ name, longitude })),
    ascendant: { longitude: 0 },
  } as unknown as ChartResult;
}

describe("System Intersect evidence integrity", () => {
  it("does not fabricate an aspect or transit window when none is calculated", () => {
    const first = chart({ Sun: 10 });
    const second = chart({ Sun: 200 });
    const result = analyzeSystemIntersect(first, second);
    expect(result.keyConnections).toEqual([]);
    expect(result.harmonyScore).toBe(50);
    expect(result.currentTransitIntersect.harmoniousWindows).toEqual([]);
    expect(result.currentTransitIntersect.frictionPoints).toEqual([]);
    expect(result.currentTransitIntersect.summary).toContain("No live transit calculation");
  });

  it("reports the actual orb for Mercury sextiles", () => {
    const first = chart({ Mercury: 10 });
    const second = chart({ Mercury: 72 });
    const result = analyzeSystemIntersect(first, second);
    expect(result.keyConnections).toEqual(expect.arrayContaining([
      expect.objectContaining({ aspectName: "Harmonious Cognitive Flow", orb: 2 }),
    ]));
  });

  it("reports the actual orb for Mars-Saturn squares", () => {
    const first = chart({ Mars: 10 });
    const second = chart({ Saturn: 102 });
    const result = analyzeSystemIntersect(first, second);
    expect(result.keyConnections).toEqual(expect.arrayContaining([
      expect.objectContaining({ aspectName: "Brake & Accelerator Paradox", orb: 2 }),
    ]));
  });
});
