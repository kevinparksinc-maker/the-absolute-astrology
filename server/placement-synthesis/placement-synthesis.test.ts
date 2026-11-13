import { describe, expect, it } from "vitest";
import { calculateChart } from "../astronomy";
import { PLACEMENT_METHODS } from "./registry";
import { buildPlacementPacket } from "./orchestrator";

describe("homepage placement synthesis", () => {
  it("builds a complete, traceable Sun packet instead of a generic caption", async () => {
    const chart = await calculateChart({
      location: "Dallas, Texas, USA",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      date: "1986-11-20",
      time: "10:06",
      worldview: "agent",
      readingScope: "combined",
      birthTimeKnown: true,
      transitLocation: "Dallas, Texas, USA",
      transitLatitude: 32.7767,
      transitLongitude: -96.797,
      transitTimezone: "America/Chicago",
      transitDate: "2026-11-07",
      transitTime: "12:00",
    });
    const packet = buildPlacementPacket(chart, "Sun", "What does this exact Sun placement mean?");
    expect(packet.contributions).toHaveLength(PLACEMENT_METHODS.length);
    expect(packet.contributions.every(item => item.status)).toBe(true);
    expect(packet.prompt).toContain("PLACEMENT: Sun");
    expect(packet.prompt).toContain("METHOD: Vedic / Jyotish");
    expect(packet.prompt).toContain("METHOD: Genesis Astro / Pattern / Yoga");
    expect(packet.prompt).toContain("METHOD: Sefer Yetzirah / Kabbalah");
    expect(packet.prompt).toContain("Do not merely name methods");
    expect(packet.contributions.some(item => item.method === "western" && item.result.length > 0)).toBe(true);
  });
});
