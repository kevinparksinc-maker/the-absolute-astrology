import { describe, expect, it } from "vitest";
import { buildDivisionalCharts } from "./divisionalCharts";

describe("Vedic divisions from one authoritative natal state", () => {
  const ascendantLongitude = 15;
  const planets = [
    { name: "Sun", longitude: 15 },
    { name: "Moon", longitude: 45 },
    { name: "Mars", longitude: 125 },
    { name: "Jupiter", longitude: 359.999 },
  ];
  const d1HouseCusps = Array.from({ length: 12 }, (_, i) => (15 + i * 30) % 360);
  const charts = buildDivisionalCharts({ ascendantLongitude, planets, d1HouseCusps });
  const by = (division: string) => {
    const chart = charts.find(c => c.division === division);
    if (!chart) throw new Error("Missing " + division);
    return chart;
  };
  it("produces exactly five full charts from existing natal longitudes", () => {
    expect(charts.map(c => c.division)).toEqual(["D1", "D2", "D3", "D9", "D10"]);
    for (const chart of charts) {
      expect(chart.houses).toHaveLength(12);
      expect(chart.placements).toHaveLength(planets.length);
      expect(chart.houses.flatMap(h => h.planets)).toHaveLength(planets.length);
      expect(chart.chartLayout).toBe("north-indian-diamond");
      expect(chart.ascendant.sourceLongitude).toBe(ascendantLongitude);
    }
  });
  it("preserves D1 Ascendant, cusps and source planetary positions", () => {
    expect(by("D1").houses.map(h => h.cusp)).toEqual(d1HouseCusps);
    expect(by("D1").ascendant.longitude).toBe(15);
    expect(by("D1").placements.find(p => p.body === "Moon")?.longitude).toBe(45);
  });
  it("maps Hora odd/even halves to Sun/Leo and Moon/Cancer", () => {
    expect(by("D2").placements.find(p => p.body === "Sun")?.sign).toBe("Cancer");
    expect(by("D2").placements.find(p => p.body === "Moon")?.sign).toBe("Leo");
  });
  it("maps the third Drekkana to the ninth sign from natal sign", () => {
    const result = buildDivisionalCharts({ ascendantLongitude: 1, planets: [{ name: "Mars", longitude: 25 }] });
    expect(result.find(c => c.division === "D3")?.placements[0].sign).toBe("Sagittarius");
  });
  it("maps Navamsha movable and fixed starting signs", () => {
    const result = buildDivisionalCharts({ ascendantLongitude: 0, planets: [{ name: "A", longitude: 0 }, { name: "B", longitude: 30 }] });
    const d9 = result.find(c => c.division === "D9")!;
    expect(d9.placements[0].sign).toBe("Aries");
    expect(d9.placements[1].sign).toBe("Capricorn");
  });
  it("rejects invalid input rather than fabricating a chart", () => {
    expect(() => buildDivisionalCharts({ ascendantLongitude: Number.NaN, planets })).toThrow();
    expect(() => buildDivisionalCharts({ ascendantLongitude: 0, planets: [{ name: "X", longitude: Infinity }] })).toThrow();
  });
});
