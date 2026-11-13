import { describe, it, expect } from "vitest";
import { interactiveNatalChat } from "./interactiveNatalCompanion";
import { calculateMasterChart } from "./masterChart/entry";

describe("Interactive Natal Chart Reasoning Companion", () => {
  const sampleInput = {
    date: "1986-11-20",
    time: "10:06",
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
    location: "Dallas, Texas, USA",
  };

  it("successfully conducts a reasoning conversation grounded in the chart", async () => {
    const chart = await calculateMasterChart({ ...sampleInput, worldview: "agent" });

    const result = await interactiveNatalChat(
      [],
      "What is my biggest blind spot or repeating challenge in relationships?",
      chart,
      "natal"
    );

    expect(result).toBeDefined();
    expect(result.answer).toBeTruthy();
    expect(typeof result.answer).toBe("string");
    expect(result.answer.length).toBeGreaterThan(50);

    // Follow-ups should be generated
    expect(Array.isArray(result.suggestedFollowUps)).toBe(true);
    expect(result.suggestedFollowUps.length).toBeGreaterThan(0);

    // Check focused placements
    expect(Array.isArray(result.focusedPlacements)).toBe(true);
    expect(result.focusedPlacements.length).toBeGreaterThan(0);
  });

  it("handles specific planet inquiry with real-world people talk", async () => {
    const chart = await calculateMasterChart({ ...sampleInput, worldview: "agent" });

    const result = await interactiveNatalChat(
      [
        { role: "user", content: "Tell me about my career." },
        { role: "assistant", content: "Your career is strongly tied to communication and deep investigation." },
      ],
      "How does my Moon affect my emotions and decisions?",
      chart,
      "natal"
    );

    expect(result).toBeDefined();
    expect(result.answer).toBeTruthy();
    // Answer should mention Moon or emotional dynamics without dumping raw calculation virupas
    expect(result.answer.toLowerCase()).toMatch(/moon|emotion|security|feel/);
  });
});
