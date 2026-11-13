import { describe, expect, it } from "vitest";
import {
  buildAstrologyEvidencePacket,
  formatEvidencePacket,
} from "./evidencePacket";
import { planKnowledge } from "./planner";
import { canonDossierToEvidenceItems, retrieveChartCanonDossier } from "./canon";
import { PLANET_IN_HOUSE, getPlanetInHouseKnowledge } from "./canon/planetInHouseInterpretations";
import { ASTROLOGY_RULES, ASTROLOGY_SOURCES } from "./registry";
import { resolveRelationships } from "./resolver";
import type { ChartResult } from "../astronomy";

const chart = {
  input: {
    location: "Dallas, Texas, USA",
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
    date: "1986-11-20",
    time: "10:06",
  },
  utc: "1986-11-20T16:06:00.000Z",
  julianDay: 2446751,
  worldview: "agent",
  readingScope: "combined",
  agentViewAvailable: true,
  ascendant: {
    name: "Ascendant",
    longitude: 256,
    display: "Sagittarius 16°00′",
    house: 1,
    godHouse: 9,
    agentHouse: 1,
  },
  descendant: null,
  midheaven: null,
  northNode: {
    name: "North Node",
    longitude: 20,
    display: "Aries 20°00′",
    house: 5,
    godHouse: 1,
    agentHouse: 5,
  },
  southNode: {
    name: "South Node",
    longitude: 200,
    display: "Libra 20°00′",
    house: 11,
    godHouse: 7,
    agentHouse: 11,
  },
  houses: [],
  movingBodies: [
    {
      name: "Sun",
      longitude: 238,
      display: "Scorpio 28°00′",
      house: 12,
      godHouse: 8,
      agentHouse: 12,
    },
    {
      name: "Moon",
      longitude: 103.5,
      display: "Cancer 13°30′",
      house: 8,
      godHouse: 4,
      agentHouse: 8,
    },
    {
      name: "Pluto",
      longitude: 238.5,
      display: "Scorpio 28°30′",
      house: 12,
      godHouse: 8,
      agentHouse: 12,
    },
    {
      name: "Jupiter",
      longitude: 345,
      display: "Pisces 15°00′",
      house: 4,
      godHouse: 12,
      agentHouse: 4,
    },
    {
      name: "Saturn",
      longitude: 100,
      display: "Cancer 10°00′",
      house: 8,
      godHouse: 4,
      agentHouse: 8,
    },
  ],
  frozenStars: [],
  godPlacements: [],
  transitDate: "2026-01-01T12:00:00.000Z",
  momentPrecision: "exact",
  transitHouseFrame: "natal-location",
  transits: [],
  validation: { passed: true, notes: [] },
} as unknown as ChartResult;

describe("astrology knowledge gateway", () => {
  it("plans relationship questions without retrieving the entire chart indiscriminately", () => {
    const plan = planKnowledge(
      "Why do relationships keep repeating the same pattern for me?",
      "natal"
    );
    expect(plan.subjects).toEqual(
      expect.arrayContaining(["7th-house", "7th-lord", "Venus", "Moon", "D9"])
    );
    expect(plan.techniques).toEqual(
      expect.arrayContaining(["house-lord", "varga", "nakshatra", "manzil"])
    );
    expect(plan.includeTiming).toBe(false);
    expect(plan.coreLayers).toEqual([
      "genesis-astro-engine",
      "genesis-pattern-engine",
      "genesis-yoga-detector",
    ]);
    expect(plan.genesisPolicy).toBe("mandatory-evaluate-before-prioritization");
    expect(plan.reasons.join(" ")).toContain("mandatory core evidence layer");
  });

  it("produces an auditable evidence packet with all three layers and explicit incomplete families", () => {
    const packet = buildAstrologyEvidencePacket(
      chart,
      "Why do relationships keep repeating the same pattern for me?",
      "natal"
    );
    expect(packet.westernEvidence.length).toBeGreaterThan(0);
    expect(packet.vedicEvidence.length).toBeGreaterThan(0);
    expect(packet.arabicEvidence.length).toBeGreaterThan(0);
    expect(packet.sourceTrace.every(trace => trace.sourceId)).toBe(true);
    expect(packet.doctrine.western.relationshipOrb).toBe(5);
    expect(packet.uncertainties.some(item => item.technique === "varga")).toBe(
      true
    );
    expect(formatEvidencePacket(packet)).toContain("ASTROLOGY EVIDENCE PACKET");
    expect(formatEvidencePacket(packet)).toContain(
      "Genesis Astro Engine, Genesis Pattern Engine, and Genesis Yoga Detector are mandatory evaluated layers"
    );
  });

  it("keeps reference sources distinct from local deterministic rules", () => {
    expect(
      ASTROLOGY_SOURCES.find(source => source.id === "tvam-jyotish")?.status
    ).toBe("reference-only");
    expect(
      ASTROLOGY_SOURCES.find(source => source.id === "canopy-arabian")?.status
    ).toBe("reference-only");
    expect(
      ASTROLOGY_RULES.find(rule => rule.id === "western-5-degree-geometry")
        ?.status
    ).toBe("implemented");
    expect(
      ASTROLOGY_RULES.find(rule => rule.id === "vedic-dasha-architecture")
        ?.status
    ).toBe("implemented");
    expect(
      ASTROLOGY_RULES.find(rule => rule.id === "vedic-ashtakavarga-classical")
        ?.status
    ).toBe("implemented");
  });

  it("distinguishes evidence convergence from contradiction", () => {
    const base = (
      tradition: "western" | "vedic" | "arabic",
      polarity: "supportive" | "pressured" | "mixed"
    ) => ({
      id: tradition,
      tradition,
      category: "deterministic-rule" as const,
      technique: "relationship",
      subject: "relationship",
      statement: `${tradition} testimony`,
      concepts: ["relationship", "7th-house"],
      polarity,
      sourceId: "local",
      sourceTrace: {
        sourceId: "local",
        tradition,
        technique: "relationship",
        sourceTitle: "fixture",
        retrievedAt: new Date().toISOString(),
        confidence: "high" as const,
      },
    });
    const agreement = resolveRelationships([
      base("western", "pressured"),
      base("vedic", "pressured"),
      base("arabic", "pressured"),
    ]);
    expect(agreement.convergences[0]).toMatchObject({
      relation: "reinforcement",
      traditions: ["western", "vedic", "arabic"],
    });
    const mixed = resolveRelationships([
      base("western", "pressured"),
      base("vedic", "supportive"),
      base("arabic", "mixed"),
    ]);
    expect(mixed.contradictions.length).toBeGreaterThan(0);
  });

  it("evaluates the 200-pattern Human Behavior & Life-Event Intelligence System in the evidence packet", () => {
    const packet = buildAstrologyEvidencePacket(
      chart,
      "Why do I feel guarded and intensely self-protective in relationships and emotional intimacy?",
      "combined"
    );
    expect(packet.behavioralReport).toBeDefined();
    expect(packet.behavioralReport.allAboutYouProfile.length).toBe(16);
    expect(
      packet.behavioralReport.convergenceSimulationLab.sixteenSystems.length
    ).toBe(16);
    expect(
      packet.behavioralReport.convergenceSimulationLab.simulationComparisons
        .length
    ).toBe(3);
    expect(packet.behavioralReport.dominantBehaviors.length).toBeGreaterThan(0);
    expect(packet.behavioralReport.activeLifeEvents.length).toBeGreaterThan(0);
    expect(packet.behavioralReport.polarityAxes.length).toBe(12);
    expect(packet.behavioralReport.doNotClaimRestrictions.length).toBeGreaterThanOrEqual(8);
    expect(packet.behavioralEvidence.length).toBeGreaterThan(0);
    expect(packet.lifeEventEvidence.length).toBeGreaterThan(0);
    expect(formatEvidencePacket(packet)).toContain(
      "Firmament Human Behavior Pattern Intelligence"
    );
    expect(formatEvidencePacket(packet)).toContain(
      "Firmament Life-Event & Situation Intelligence"
    );
  });

  it("retrieves the structured Firmament Canon & Traditional Doctrine Dossier with FACT, TRADITION, and FIRMAMENT_CANON categories", () => {
    const packet = buildAstrologyEvidencePacket(
      chart,
      "What are the core traditional placements and mechanisms in my chart?",
      "natal"
    );
    expect(packet.canonDossier).toBeDefined();
    expect(packet.canonDossier.placements.length).toBeGreaterThan(0);
    const sunPlacement = packet.canonDossier.placements.find(
      p => p.body === "Sun"
    );
    expect(sunPlacement).toBeDefined();
    expect(sunPlacement?.planetDoctrine?.astronomicalFact.category).toBe("FACT");
    expect(
      sunPlacement?.planetDoctrine?.traditionalQualities.provenance
        .epistemicCategory
    ).toBe("TRADITION");
    expect(sunPlacement?.planetDoctrine?.firmamentCanonNote.category).toBe(
      "FIRMAMENT_CANON"
    );
    expect(sunPlacement?.decanRecord?.index).toBe(24); // Scorpio 3rd decan (230-240)
    expect(sunPlacement?.manzilRecord?.name).toBeDefined();
    expect(sunPlacement?.nakshatraRecord?.name).toBeDefined();
    expect(sunPlacement?.activePada?.pada).toBeGreaterThanOrEqual(1);
    expect(packet.canonDossier.arabicLotsSummary.length).toBeGreaterThanOrEqual(2);
    expect(packet.canonDossier.dispositorChains?.length).toBeGreaterThan(0);
    expect(packet.canonDossier.westernTimingActivations?.length).toBeGreaterThanOrEqual(5);
    expect(packet.canonDossier.vedicJyotishSystem).toBeDefined();
    expect(packet.canonDossier.vedicJyotishSystem?.panchanga.tithi.name).toBeDefined();
    expect(packet.canonDossier.vedicJyotishSystem?.charaKarakas.length).toBeGreaterThan(0);
    expect(packet.canonDossier.arabicPersianSystem).toBeDefined();
    expect(packet.canonDossier.arabicPersianSystem?.almutenFiguris.winnerPlanet).toBeDefined();
    expect(packet.canonDossier.relationalChains?.length).toBeGreaterThanOrEqual(4);
    // Verify Modern Psychological synthesis is explicitly attributed rather than conflated with ancient texts
    expect(sunPlacement?.planetInSignSynthesis).toContain("[MODERN_SYNTHESIS");
    expect(formatEvidencePacket(packet)).toContain(
      "LOCAL FIRMAMENT CANON & TRADITIONAL DOCTRINE DOSSIER"
    );
    expect(formatEvidencePacket(packet)).toContain(
      "RELATIONAL INTERPRETATION LAYER"
    );
  });
  it("retrieves expanded planet-in-house knowledge with provenance into the canon dossier and evidence packet", () => {
    const dossier = retrieveChartCanonDossier(chart);
    const moonPlacement = dossier.placements.find(
      placement => placement.body === "Moon" && placement.displayedHouse === 8
    );
    const plutoPlacement = dossier.placements.find(
      placement => placement.body === "Pluto" && placement.displayedHouse === 12
    );

    expect(moonPlacement?.planetInHouseKnowledge?.epistemicStatus).toBe(
      "tradition-attributed-unverified"
    );
    expect(moonPlacement?.planetInHouseKnowledge?.sourceCaveat).toContain(
      "does not cite a specific passage"
    );
    expect(plutoPlacement?.planetInHouseKnowledge?.epistemicStatus).toBe(
      "modern-synthesis"
    );
    expect(plutoPlacement?.planetInHouseKnowledge?.sourceCaveat).toContain(
      "modern astrological synthesis"
    );
    expect(dossier.formattedSummaryForInterpreter).toContain(
      "[Planet-in-House Library · modern-synthesis]"
    );

    const placementEvidence = canonDossierToEvidenceItems(dossier).filter(
      item => item.technique === "planet-in-house-interpretation"
    );
    expect(
      placementEvidence.some(
        item => item.subject === "Pluto in House 12" &&
          item.sourceTrace.confidence === "reference-only"
      )
    ).toBe(true);
    expect(
      placementEvidence.some(
        item => item.subject === "Moon in House 8" &&
          item.tradition === "vedic"
      )
    ).toBe(true);
  });

  it("contains all 144 unique planet-house records with safe provenance labels", () => {
    expect(PLANET_IN_HOUSE).toHaveLength(144);
    const uniqueKeys = new Set(
      PLANET_IN_HOUSE.map(record => `${record.planet.toLowerCase()}:${record.house}`)
    );
    expect(uniqueKeys.size).toBe(144);
    for (const planet of [
      "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus",
      "Saturn", "Rahu", "Ketu", "Uranus", "Neptune", "Pluto",
    ]) {
      expect(PLANET_IN_HOUSE.filter(record => record.planet === planet)).toHaveLength(12);
    }
    expect(getPlanetInHouseKnowledge("pluto", 12)?.epistemicStatus).toBe("modern-synthesis");
    expect(getPlanetInHouseKnowledge("moon", 8)?.epistemicStatus).toBe("tradition-attributed-unverified");
    expect(getPlanetInHouseKnowledge("Moon", 13)).toBeNull();
  });

});
