import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { calculateChart } from "./astronomy";
import { GuardianDiamondCharts } from "../client/src/components/GuardianDiamondCharts";
vi.mock("../client/src/components/PlacementMiniReading", () => ({
  PlacementMiniReading: () => null,
}));
const input = {
  location: "Dallas",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  readingScope: "natal" as const,
};
describe("Enhanced comparative chart map", () => {
  it("renders actual God/Agent mappings, keyboard-selectable houses and exact telemetry", async () => {
    const chart = await calculateChart(input);
    const sun = chart.movingBodies.find(p => p.name === "Sun")!;
    const html = renderToStaticMarkup(
      React.createElement(GuardianDiamondCharts, { chart })
    );
    expect(html).toContain("House matrix &amp; planetary projection");
    expect(html).toContain(`God H${sun.godHouse}`);
    expect(html).toContain(`Agent H${sun.agentHouse}`);
    expect(html).toContain(sun.longitude.toFixed(6));
    for (let h = 1; h <= 12; h++) {
      expect(html).toContain(`aria-label="God House ${h}"`);
      expect(html).toContain(`aria-label="Agent House ${h}"`);
    }
    expect(html).not.toMatch(/Lahiri|Sophia|JPL DE441/);
  });
  it("does not fabricate a local chart when the birth horizon is unknown", async () => {
    const chart = await calculateChart({
      ...input,
      worldview: "god",
      location: "",
      time: "",
      timezone: "",
      birthTimeKnown: false,
    });
    const html = renderToStaticMarkup(
      React.createElement(GuardianDiamondCharts, { chart })
    );
    expect(html).not.toContain("Chart II");
    expect(html).toContain("A verified local Ascendant is required");
  });
});
