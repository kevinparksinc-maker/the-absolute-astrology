import { describe, expect, it } from "vitest";
import { calculateChart } from "./astronomy";
import { buildAstrologyEvidencePacket, formatEvidencePacket } from "./astrologyKnowledge";

const base = {
  location: "Dallas, Texas, USA",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  transitLocation: "Dallas, Texas, USA",
  transitLatitude: 32.7767,
  transitLongitude: -96.797,
  transitTimezone: "America/Chicago",
  transitDate: "2026-10-27",
  transitTime: "12:00",
};

describe("lunar mansion integration", () => {
  it.each(["agent", "god"] as const)("adds canonical overlays to %s natal and transit rows", async worldview => {
    const chart = await calculateChart({ ...base, worldview, readingScope: "combined" });
    const rows = [...chart.movingBodies, ...chart.transits, ...chart.godPlacements];
    expect(rows.length).toBeGreaterThan(20);
    for (const row of rows) {
      expect(row.overlay.nakshatraRuler).toBeTruthy();
      expect(row.overlay.chineseMansion).toBeTruthy();
      expect(row.overlay.chineseDeterminativeStar).toBeTruthy();
      expect(row.overlay.chineseBoundaryModel).toBe("historical-han-width-proportional-firmament-adaptation");
      expect(row.overlay.nakshatra).toBeTruthy();
      expect(row.overlay.manzil).toBeTruthy();
      expect(row.overlay.decan).toBeTruthy();
    }
  });

  it("keeps the same canonical overlay across God and Agent views", async () => {
    const agent = await calculateChart({ ...base, worldview: "agent", readingScope: "natal" });
    const god = await calculateChart({ ...base, worldview: "god", readingScope: "natal" });
    expect(agent.movingBodies.map(row => row.overlay)).toEqual(god.movingBodies.map(row => row.overlay));
  });

  it("passes active Chinese Xiu and Nakshatra ruler evidence to the Master Interpreter packet", async () => {
    const chart = await calculateChart({ ...base, worldview: "agent", readingScope: "combined" });
    const packet = buildAstrologyEvidencePacket(chart, "Explain the lunar mansion layers", "combined");
    const lunarRows = packet.lunarEvidence.filter(item => item.technique === "fixed-frame-lunar-overlay");
    expect(lunarRows.length).toBe(chart.movingBodies.length + chart.transits.length);
    expect(lunarRows[0]?.statement).toContain("Chinese Xiu");
    expect(lunarRows[0]?.statement).toContain("Nakshatra");
    expect(formatEvidencePacket(packet)).toContain("historical-han-width-proportional-firmament-adaptation");
  });
});
