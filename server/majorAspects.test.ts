import { describe, expect, it } from "vitest";
import { aspectBetween, minorAspectBetween } from "./astronomy";

describe("canonical major aspect scoring contract", () => {
  it.each([
    [0, "conjunction"],
    [90, "square"],
    [120, "trine"],
    [180, "opposition"],
  ] as const)("recognizes %s° as %s", (angle, aspect) => {
    expect(aspectBetween(0, angle)).toEqual({ aspect, orb: 0 });
  });

  it("honors the five degree inclusive orb and zodiac wraparound", () => {
    expect(aspectBetween(359, 1)).toEqual({ aspect: "conjunction", orb: 2 });
    expect(aspectBetween(0, 125)?.aspect).toBe("trine");
    expect(aspectBetween(0, 125.01)).toBeNull();
  });

  it.each([30, 45, 72, 135, 150])("does not count %s° as a major aspect", angle => {
    expect(aspectBetween(0, angle)).toBeNull();
  });

  it("retains sextile only in the separate half-weight minor-contact channel", () => {
    expect(minorAspectBetween(0, 60)).toMatchObject({ aspect: "sextile", weightMultiplier: 0.5 });
    expect(aspectBetween(0, 60)).toBeNull();
  });
});
