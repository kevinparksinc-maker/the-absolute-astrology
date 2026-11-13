import { describe, expect, it, vi } from "vitest";
import { invokeLLM } from "./_core/llm";
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));
import { calculateChart } from "./astronomy";
import { buildFocusedReading } from "./focusedReading";
import { getNakshatraCanonByLongitude } from "./astrologyKnowledge/canon/nakshatras27";
const input = {
  location: "Dallas, Texas, USA",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  transitLocation: "Las Vegas, Nevada, USA",
  transitLatitude: 36.1699,
  transitLongitude: -115.1398,
  transitTimezone: "America/Los_Angeles",
  transitDate: "2026-11-04",
  transitTime: "03:21",
  worldview: "agent" as const,
  readingScope: "combined" as const,
};
const placement = (name: string) => ({
  kind: "placement" as const,
  name,
  layer: "natal" as const,
});
const section = (
  reading: Awaited<ReturnType<typeof buildFocusedReading>>,
  id: string
) => reading.sections.find(section => section.id === id);

describe("focused source-backed interpretation", () => {
  it("gives Sun, Moon, Mars and Saturn different meanings and concrete challenges", async () => {
    const chart = await calculateChart(input);
    const readings = await Promise.all(
      ["Sun", "Moon", "Mars", "Saturn"].map(name =>
        buildFocusedReading(chart, placement(name))
      )
    );
    expect(
      new Set(
        readings.map(reading =>
          section(reading, "meaning")?.paragraphs.join(" ")
        )
      ).size
    ).toBe(4);
    expect(
      new Set(
        readings.map(reading => section(reading, "cost")?.paragraphs.join(" "))
      ).size
    ).toBe(4);
    for (const reading of readings) {
      expect(
        reading.evidence.some(item => item.id.startsWith("placement-"))
      ).toBe(true);
      expect(
        reading.sections.every(section => section.sources.length > 0)
      ).toBe(true);
      expect(
        reading.sourceNotes.some(
          note => note.includes("does not cite") || note.includes("modern")
        )
      ).toBe(true);
      expect(JSON.stringify(reading)).not.toMatch(
        /sovereign clarity|pivotal anchor in your living|exceptional.*mastery/
      );
    }
  });
  it("changes the house interpretation when the actual birth time changes its house", async () => {
    const first = await buildFocusedReading(
      await calculateChart(input),
      placement("Mars")
    );
    const later = await buildFocusedReading(
      await calculateChart({ ...input, time: "16:06" }),
      placement("Mars")
    );
    expect(section(first, "meaning")?.paragraphs).not.toEqual(
      section(later, "meaning")?.paragraphs
    );
    expect(section(first, "cost")?.paragraphs).not.toEqual(
      section(later, "cost")?.paragraphs
    );
  });
  it("uses canonical mansion mappings even if a browser overlay is missing or forged", async () => {
    const chart = await calculateChart(input);
    const mars = chart.movingBodies.find(body => body.name === "Mars")!;
    const expected = getNakshatraCanonByLongitude(mars.longitude).nakshatra;
    mars.overlay = { ...mars.overlay, nakshatra: "Fabricated Mansion" };
    const reading = await buildFocusedReading(chart, placement("Mars"));
    expect(section(reading, "nakshatra")?.title).toContain(expected.name);
    expect(JSON.stringify(reading)).not.toContain("Fabricated Mansion");
  });
  it("does not substitute a personality for unsupported angles", async () => {
    const chart = await calculateChart(input);
    const reading = await buildFocusedReading(chart, placement("Ascendant"));
    expect(
      reading.gaps.some(gap => gap.includes("No planet-specific Canon entry"))
    ).toBe(true);
    expect(section(reading, "motivation")).toBeUndefined();
  });
  it("gives Sirius and Antares different star-specific meanings and costs", async () => {
    const chart = await calculateChart(input);
    const sirius = await buildFocusedReading(chart, {
      kind: "star",
      name: "Sirius",
      layer: "natal",
    });
    const antares = await buildFocusedReading(chart, {
      kind: "star",
      name: "Antares",
      layer: "natal",
    });
    expect(section(sirius, "star-meaning")?.paragraphs).not.toEqual(
      section(antares, "star-meaning")?.paragraphs
    );
    expect(section(sirius, "star-pressure")?.paragraphs).not.toEqual(
      section(antares, "star-pressure")?.paragraphs
    );
  });
  it("uses the transit moment and retains natal contacts without presenting natal life claims as transit facts", async () => {
    const chart = await calculateChart(input);
    const reading = await buildFocusedReading(chart, {
      kind: "placement",
      name: "Moon",
      layer: "transit",
    });
    expect(reading.moment).toBe(chart.transitDate);
    expect(section(reading, "examples")).toBeUndefined();
    expect(
      reading.evidence.some(item => item.id.startsWith("personal-contact-"))
    ).toBe(true);
  });
  it("rejects unknown selections and divergent chart coordinates instead of emitting filler", async () => {
    const chart = await calculateChart(input);
    await expect(
      buildFocusedReading(chart, placement("Fake Planet"))
    ).rejects.toThrow("no Fake Planet placement");
    chart.movingBodies[0].longitude += 2;
    await expect(buildFocusedReading(chart, placement("Sun"))).rejects.toThrow(
      "Master Chart mismatch"
    );
  });
});

describe("focused contact interpretation", () => {
  it("uses both actual placements and the natal life area for a selected transit contact", async () => {
    const chart = await calculateChart(input);
    const transit = chart.transits.find(body => body.natalContacts.length > 0)!;
    const contact =
      transit.natalContacts.find(
        c => !["Ascendant", "Descendant"].includes(c.natalName)
      ) || transit.natalContacts[0];
    const reading = await buildFocusedReading(chart, {
      kind: "contact",
      name: transit.name,
      otherName: contact.natalName,
      layer: "transit",
    });
    expect(reading.title).toContain(`${transit.name} ${contact.aspect}`);
    expect(
      reading.evidence.find(item => item.id === "contact-moving")?.value
    ).toContain(transit.display);
    expect(
      reading.evidence.find(item => item.id === "contact-geometry")?.value
    ).toContain(contact.orb.toFixed(2));
    expect(
      section(reading, "contact-integration")?.paragraphs.length
    ).toBeGreaterThan(0);
    expect(reading.sections.every(section => section.sources.length > 0)).toBe(
      true
    );
  });
  it("rejects a selected pair that has no supported aspect instead of filling its panel", async () => {
    const chart = await calculateChart(input);
    const transit = chart.transits[0];
    const excluded = new Set(
      [...transit.natalContacts, ...transit.minorNatalContacts].map(
        c => c.natalName
      )
    );
    const other = chart.movingBodies.find(body => !excluded.has(body.name))!;
    await expect(
      buildFocusedReading(chart, {
        kind: "contact",
        name: transit.name,
        otherName: other.name,
        layer: "transit",
      })
    ).rejects.toThrow("no supported contact");
  });
});

describe("calculated audio chapters", () => {
  it("uses source-linked synthesis chapters rather than a fixed daily advice script", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({ id:"audio-test", created:0, model:"test", choices:[{index:0, finish_reason:"stop", message:{role:"assistant", content:"You bring your chart’s distinct strengths and pressures into the same decisions. This audio reading interprets the calculated layers together rather than repeating a fixed advice script."}}] });
    const { buildChartBriefing } = await import("./chartBriefing");
    const chart = await calculateChart(input);
    const briefing = await buildChartBriefing(chart);
    expect(briefing.chapters.length).toBeGreaterThan(0);
    expect(invokeLLM).toHaveBeenCalled();
    expect(briefing.chapters[0].text).toContain("This audio reading");
    expect(
      briefing.chapters.every(chapter => chapter.evidenceIds.length > 0)
    ).toBe(true);
    expect(JSON.stringify(briefing)).not.toMatch(
      /between one and three|relationship axis is receiving subtle emotional|your day is not random luck/i
    );
    expect(new Set(briefing.chapters.map(chapter => chapter.text)).size).toBe(
      briefing.chapters.length
    );
  });
});
