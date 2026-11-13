import { describe, expect, it } from "vitest";
import { aspectBetween, minorAspectBetween } from "./astronomy";

describe("balanced Energy Read aspect classifications", () => {
  it.each([
    [0, "conjunction"],
    [120, "trine"],
    [90, "square"],
    [180, "opposition"],
  ] as const)("recognizes canonical major %s° %s", (angle, aspect) => {
    expect(aspectBetween(0, angle)).toEqual({ aspect, orb: 0 });
  });

  it.each([
    [30, "semisextile", "flow"],
    [60, "sextile", "flow"],
    [45, "semisquare", "friction"],
    [150, "quincunx", "friction"],
  ] as const)("recognizes half-weight minor %s° %s", (angle, aspect, classification) => {
    expect(minorAspectBetween(0, angle)).toEqual({ aspect, classification, orb: 0, weightMultiplier: 0.5 });
  });

  it("limits major and minor orbs to five degrees", () => {
    expect(aspectBetween(0, 125)).toMatchObject({ aspect: "trine", orb: 5 });
    expect(aspectBetween(0, 125.01)).toBeNull();
    expect(minorAspectBetween(0, 65)).toMatchObject({ aspect: "sextile", orb: 5 });
    expect(minorAspectBetween(0, 65.01)).toBeNull();
  });

  it("keeps minor aspects out of the major channel", () => {
    for (const angle of [30, 45, 60, 150]) {
      expect(aspectBetween(0, angle)).toBeNull();
      expect(minorAspectBetween(0, angle)).not.toBeNull();
    }
  });

  it("wraps angular positions across zero", () => {
    expect(minorAspectBetween(350, 50)?.aspect).toBe("sextile");
    expect(aspectBetween(350, 110)?.aspect).toBe("trine");
  });
});
