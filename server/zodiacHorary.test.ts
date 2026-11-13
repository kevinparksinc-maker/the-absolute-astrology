import { describe, expect, it } from "vitest";
import { overlay, ZODIAC_SIGNS } from "../shared/hybrid";
import { SIGN_RULERS } from "../shared/zodiacSigns";
import { agentHouseFor, godHouseFor } from "./astrologyCore";
import { createRulerAnchoredEvidence, ASC_SIDE_HOUSES, DSC_SIDE_HOUSES } from "./zodiacHorary";

const sample = [
  ["Sun", 135], ["Moon", 355], ["Mercury", 2], ["Venus", 44],
  ["Mars", 15], ["Jupiter", 225], ["Saturn", 307], ["Uranus", 88],
  ["Neptune", 181], ["Pluto", 270],
] as const;
const sky = {
  utc: "2026-10-14T12:00:00.000Z",
  movingBodies: sample.map(([name, longitude]) => ({
    name, longitude, overlay: overlay(longitude), speed: 1, retrograde: false,
  })),
} as Parameters<typeof createRulerAnchoredEvidence>[1];

describe("ruler-anchored zodiac celestial engine", () => {
  it("has all twelve traditional rulers and exactly one anchor per sign", () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
    for (const sign of ZODIAC_SIGNS) {
      const result = createRulerAnchoredEvidence(sign, sky, "2026-10-14", "12:00");
      expect(result.ruler).toBe(SIGN_RULERS[sign]);
      expect(result.placements.find(row => row.name === result.ruler)?.agentHouse).toBe(1);
      expect(result.agentHouses[0]).toBe(result.anchorLongitude);
      expect(result.agentHouses).toHaveLength(12);
      expect(result.godHouses).toHaveLength(12);
      expect(result.placements).toHaveLength(10);
    }
  });
  it("keeps God View absolutely fixed when ruler and sign change", () => {
    const mars = createRulerAnchoredEvidence("Aries", sky, "2026-10-14", "12:00");
    const venus = createRulerAnchoredEvidence("Taurus", sky, "2026-10-14", "12:00");
    expect(mars.godHouses).toEqual(venus.godHouses);
    expect(mars.godHouses[0]).toBe(0);
    expect(mars.placements.map(row => [row.name, row.longitude, row.godHouse]))
      .toEqual(venus.placements.map(row => [row.name, row.longitude, row.godHouse]));
    expect(mars.agentHouses).not.toEqual(venus.agentHouses);
    expect(mars.placements.find(p => p.name === "Sun")?.agentHouse)
      .not.toBe(venus.placements.find(p => p.name === "Sun")?.agentHouse);
  });
  it("uses true wraparound and a firm 5° orb for every planet and house", () => {
    const result = createRulerAnchoredEvidence("Cancer", sky, "2026-10-14", "12:00");
    const contact = result.aspects.find(a => [a.first, a.second].includes("Moon") && [a.first, a.second].includes("Mercury"));
    expect(contact).toBeUndefined(); // seven degrees falls outside the configured 5° orb
  });
  it("assigns every placement to one frame house and every house to a side", () => {
    const result = createRulerAnchoredEvidence("Aquarius", sky, "2026-10-14", "12:00");
    expect([...ASC_SIDE_HOUSES, ...DSC_SIDE_HOUSES].sort((a,b)=>a-b)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
    for (const planet of result.placements) {
      expect(planet.agentHouse).toBe(agentHouseFor(planet.longitude, result.anchorLongitude));
      expect(planet.godHouse).toBe(godHouseFor(planet.longitude));
      expect(planet.agentHouse).toBeGreaterThanOrEqual(1);
      expect(planet.agentHouse).toBeLessThanOrEqual(12);
    }
    const totalAgentContacts = result.agent.asc.contacts + result.agent.dsc.contacts;
    const totalGodContacts = result.god.asc.contacts + result.god.dsc.contacts;
    expect(totalAgentContacts).toBe(2 * result.aspects.length);
    expect(totalGodContacts).toBe(2 * result.aspects.length);
  });
  it("preserves equal-ruler signs as different sign labels but same planetary anchor", () => {
    const gemini = createRulerAnchoredEvidence("Gemini", sky, "2026-10-14", "12:00");
    const virgo = createRulerAnchoredEvidence("Virgo", sky, "2026-10-14", "12:00");
    expect(gemini.anchorLongitude).toBe(virgo.anchorLongitude);
    expect(gemini.agentHouses).toEqual(virgo.agentHouses);
    expect(gemini.sign).not.toBe(virgo.sign);
    expect(gemini.signTerritory.from).toBe(60);
    expect(virgo.signTerritory.from).toBe(150);
    expect(gemini.signTerritory.themes).not.toBe(virgo.signTerritory.themes);
  });
});
