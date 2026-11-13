import { describe, expect, it } from "vitest";
import {
  CORE_REQUESTED_ACTORS,
  extractRequestedActors,
  mapRequestedPlacementsToCanonicalMeaning,
  validateAndEnforceCoverage,
} from "../shared/masterPlanetPersonaConfig";
import { calculateMasterChart } from "./masterChart/entry";

const sampleInput = {
  location: "New York, USA",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
  date: "1990-05-15",
  time: "14:30",
};

describe("Master Planet Persona Matrix Configuration & Zero-Data-Drop Enforcer", () => {
  it("defines the core requested actors including Sun, Moon, Ascendant, Descendant, and Nodes", () => {
    expect(CORE_REQUESTED_ACTORS).toContain("Sun");
    expect(CORE_REQUESTED_ACTORS).toContain("Moon");
    expect(CORE_REQUESTED_ACTORS).toContain("Ascendant");
    expect(CORE_REQUESTED_ACTORS).toContain("Descendant");
    expect(CORE_REQUESTED_ACTORS).toContain("North Node");
    expect(CORE_REQUESTED_ACTORS).toContain("South Node");
  });

  it("extracts requested actors from natural user inquiries", () => {
    const question = "Can you synthesize my Sun, Moon, Ascendant, Descendant, and both Nodes?";
    const extracted = extractRequestedActors(question);
    expect(extracted).toContain("Sun");
    expect(extracted).toContain("Moon");
    expect(extracted).toContain("Ascendant");
    expect(extracted).toContain("Descendant");
    expect(extracted).toContain("North Node");
    expect(extracted).toContain("South Node");
  });

  it("maps every requested placement to its canonical meaning and real-world people talk", async () => {
    const chart = await calculateMasterChart(sampleInput);
    const mappings = mapRequestedPlacementsToCanonicalMeaning(chart, [
      "Sun",
      "Moon",
      "Ascendant",
      "Descendant",
      "North Node",
      "South Node",
    ]);

    expect(mappings).toHaveLength(6);
    for (const m of mappings) {
      expect(m.actor).toBeDefined();
      expect(m.house).toBeGreaterThanOrEqual(1);
      expect(m.houseArena).toBeDefined();
      expect(m.realWorldTranslation.coreTheme).toBeDefined();
      expect(m.realWorldTranslation.strengthAndPower).toBeDefined();
      expect(m.realWorldTranslation.humanChallenge).toBeDefined();
      expect(m.realWorldTranslation.growthAction).toBeDefined();
      expect(m.realWorldTranslation.conversationalProse.length).toBeGreaterThan(50);
    }
  });

  it("detects when an AI narrative dropped requested placements and enforces zero-data-loss", async () => {
    const chart = await calculateMasterChart(sampleInput);
    const mappings = mapRequestedPlacementsToCanonicalMeaning(chart, [
      "Sun",
      "Moon",
      "Ascendant",
      "Descendant",
      "North Node",
      "South Node",
    ]);

    // Truncated narrative that only mentions Mercury-Pluto, Jupiter-Moon, and Venus Mahadasha
    const truncatedNarrative =
      "You have Mercury conjunct Pluto in your 10th house. Jupiter trines your Moon. During your Venus Mahadasha, relationships become central.";

    const result = validateAndEnforceCoverage(truncatedNarrative, mappings);

    // It should detect that Sun, Ascendant, Descendant, North Node, South Node were missing
    expect(result.isComplete).toBe(false);
    expect(result.missingActors).toContain("Sun");
    expect(result.missingActors).toContain("Ascendant");
    expect(result.missingActors).toContain("Descendant");
    expect(result.missingActors).toContain("North Node");
    expect(result.missingActors).toContain("South Node");

    // It enforces coverage by weaving all missing actors into the narrative
    expect(result.enforcedNarrative).toContain("Zero-Data-Drop Enforced");
    expect(result.enforcedNarrative).toContain("Sun");
    expect(result.enforcedNarrative).toContain("Ascendant");
    expect(result.enforcedNarrative).toContain("Descendant");
    expect(result.enforcedNarrative).toContain("North Node");
    expect(result.enforcedNarrative).toContain("South Node");
  });

  it("marks coverage as complete when all requested actors are present", async () => {
    const chart = await calculateMasterChart(sampleInput);
    const mappings = mapRequestedPlacementsToCanonicalMeaning(chart, ["Sun", "Moon"]);

    const fullNarrative = "Your Sun radiates purposeful vitality. Meanwhile, your Moon seeks emotional sanctuary in quiet reflection.";
    const result = validateAndEnforceCoverage(fullNarrative, mappings);

    expect(result.isComplete).toBe(true);
    expect(result.missingActors).toHaveLength(0);
    expect(result.enforcedNarrative).toBe(fullNarrative);
  });
});
