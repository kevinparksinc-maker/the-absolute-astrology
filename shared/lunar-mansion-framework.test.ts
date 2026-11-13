import { describe, expect, it } from "vitest";
import {
  CHINESE_MANSIONS,
  CHINESE_HAN_ANGULAR_EXTENTS,
  CHINESE_HAN_TOTAL_EXTENT,
  FIRMAMENT_CHINESE_BOUNDARIES,
  NAKSHATRA_RULERS,
  buildFirmamentChineseBoundaries,
  chineseMansionAtLongitude,
  nakshatraRulerAtLongitude,
  normalizeMansionLongitude,
  validateChineseBoundaries,
} from "./lunar-mansion-framework";

const fixtureBoundaries = Array.from({ length: 28 }, (_, mansionIndex) => ({
  start: mansionIndex * (360 / 28),
  mansionIndex,
}));
// Fixture boundaries are synthetic and must NEVER be used as production calibration.

describe("fixed-frame lunar mansion utilities", () => {
  it("has 28 Chinese mansion names and 27 Nakshatra rulers", () => {
    expect(CHINESE_MANSIONS).toHaveLength(28);
    expect(NAKSHATRA_RULERS).toHaveLength(27);
  });
  it("retains the published unequal Han-era width record", () => {
    expect(CHINESE_HAN_ANGULAR_EXTENTS).toHaveLength(28);
    expect(CHINESE_HAN_TOTAL_EXTENT).toBe(367);
    expect(new Set(CHINESE_HAN_ANGULAR_EXTENTS).size).toBeGreaterThan(1);
    expect(FIRMAMENT_CHINESE_BOUNDARIES).toHaveLength(28);
    expect(buildFirmamentChineseBoundaries().find(boundary => boundary.mansionIndex === 18)?.start).toBeCloseTo(45, 10);
  });
  it("normalizes angles without applying another ayanamsha", () => {
    expect(normalizeMansionLongitude(360)).toBe(0);
    expect(normalizeMansionLongitude(-15)).toBe(345);
    expect(() => normalizeMansionLongitude(NaN)).toThrow();
  });
  it("uses the classical nine-lord Nakshatra cycle", () => {
    expect(nakshatraRulerAtLongitude(0)).toBe("Ketu");
    expect(nakshatraRulerAtLongitude(360 / 27)).toBe("Venus");
    expect(nakshatraRulerAtLongitude(2 * 360 / 27)).toBe("Sun");
    expect(nakshatraRulerAtLongitude(360)).toBe("Ketu");
  });
  it("refuses missing, duplicated, and invalid Chinese boundary tables", () => {
    expect(() => validateChineseBoundaries([])).toThrow();
    expect(() => validateChineseBoundaries([...fixtureBoundaries.slice(0, 27), fixtureBoundaries[0]])).toThrow();
    expect(() => validateChineseBoundaries(fixtureBoundaries.map((x, i) => i === 0 ? { ...x, start: -1 } : x))).toThrow();
  });
  it("selects the sector starting at the last preceding boundary, including wraparound", () => {
    expect(chineseMansionAtLongitude(0, fixtureBoundaries).mansionIndex).toBe(0);
    expect(chineseMansionAtLongitude(359, fixtureBoundaries).mansionIndex).toBe(27);
    expect(chineseMansionAtLongitude(-1, fixtureBoundaries).mansionIndex).toBe(27);
    expect(chineseMansionAtLongitude(360 / 28, fixtureBoundaries).mansionIndex).toBe(1);
  });
  it("does not require an ascendant or a house to identify a mansion", () => {
    const result = chineseMansionAtLongitude(45, fixtureBoundaries);
    expect(result.referenceFrame).toBe("firmament-aldebaran-15-taurus");
    expect(result.boundaryModel).toBe("historical-han-width-proportional-firmament-adaptation");
    expect(result.determinativeStar).toBe("π Scorpii");
    expect(chineseMansionAtLongitude(45).mansionIndex).toBe(18);
  });
});
