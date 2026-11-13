import { describe, it, expect } from "vitest";
import { calculateChart } from "./astronomy";
import { placementMiniIdentity } from "../shared/placementMiniReadings";
describe("Placement mini reading cache", () => {
  it("retains natal minis during transit refreshes but refreshes transit minis", async () => {
    const chart = await calculateChart({
      location: "Dallas",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      date: "1986-11-20",
      time: "10:06",
      readingScope: "natal",
    });
    const next = {
      ...chart,
      transitDate: "2026-11-07T16:00:00Z",
      input: { ...chart.input, transitLocation: "Las Vegas" },
    };
    expect(placementMiniIdentity(next)).toBe(placementMiniIdentity(chart));
    expect(placementMiniIdentity(next, "transit")).not.toBe(
      placementMiniIdentity(chart, "transit")
    );
    expect(placementMiniIdentity(chart, "natal", "a")).not.toBe(
      placementMiniIdentity(chart, "natal", "b")
    );
    expect(
      placementMiniIdentity({ ...chart, houses: chart.houses.map(n => n + 1) })
    ).not.toBe(placementMiniIdentity(chart));
    expect(placementMiniIdentity({ ...chart, worldview: "god" })).not.toBe(
      placementMiniIdentity(chart)
    );
  });
});
