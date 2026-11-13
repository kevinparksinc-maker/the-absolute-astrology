import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { calculateHoraryChart, type HoraryInput } from "./horary";
import { threeChartLayers } from "../shared/threeChartWheel";
import { HoraryOrrery } from "../client/src/components/HoraryOrrery";

const input: HoraryInput = {
  question: "Will the project be ready for launch?", subject: "querent", topicHouse: 10,
  location: "Las Vegas, Nevada", latitude: 36.1699, longitude: -115.1398,
  timezone: "America/Los_Angeles", date: "2026-11-04", time: "12:00",
  natal: { location: "Dallas, Texas", latitude: 32.7767, longitude: -96.797,
    timezone: "America/Chicago", date: "1986-11-20", time: "10:06" },
};

describe("three-chart wheel", () => {
  it("renders the birth and question moments as independent selectable layers", async () => {
    const chart = await calculateHoraryChart(input);
    const layers = threeChartLayers(chart.natalChart, chart.transitChart, chart.godChart);
    const sun = (id: string) => layers.find(layer => layer.id === id)!.rows.find(row => row.name === "Sun")!;
    expect(sun("natal").longitude).not.toBeCloseTo(sun("transit").longitude, 4);
    expect(sun("transit").longitude).toBeCloseTo(sun("god").longitude, 8);
    const html = renderToStaticMarkup(React.createElement(HoraryOrrery, {
      natal: chart.natalChart, transit: chart.transitChart, god: chart.godChart, questionHouses: chart.houses,
    }));
    expect(html).toContain(`Natal: Sun, ${sun("natal").display}`);
    expect(html).toContain(`Transits: Sun, ${sun("transit").display}`);
    expect(html).toContain(`God View: Sun, ${sun("god").display}`);
    expect(html).toContain("Enlarge wheel");
    expect(html).toContain("POLARIS");
    expect(html).toContain("ASC");
  });
  it("leaves the natal ring unavailable when no birth profile was supplied", async () => {
    const chart = await calculateHoraryChart({ ...input, natal: undefined });
    expect(threeChartLayers(undefined, chart.transitChart, chart.godChart).find(layer => layer.id === "natal")!.rows).toEqual([]);
    const html = renderToStaticMarkup(React.createElement(HoraryOrrery, {
      transit: chart.transitChart, god: chart.godChart, questionHouses: chart.houses,
    }));
    expect(chart.transitChart.transits.every(row => row.natalContacts.length === 0 && row.minorNatalContacts.length === 0)).toBe(true);
    expect(html).not.toContain("Natal: Sun");
    expect(html).toContain("natal ring is empty");
  });
});
