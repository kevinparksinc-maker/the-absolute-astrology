import { MASTER_METHOD_IDS } from "./masterChart/registry";
import { describe, it, expect } from "vitest";
import { buildUnifiedMasterChart, getLayer, getEvidence, getModeView } from "./masterChart";

const SAMPLE_INPUT = {
  location: "Alexandria, Egypt",
  latitude: 31.2001,
  longitude: 29.9187,
  timezone: "Africa/Cairo",
  date: "1988-08-08",
  time: "12:00",
  transitLocation: "Alexandria, Egypt",
  transitLatitude: 31.2001,
  transitLongitude: 29.9187,
  transitTimezone: "Africa/Cairo",
  mode: "natal" as const,
};

describe("Unified Master Chart Architecture", () => {
  it("builds an immutable UnifiedMasterChartSnapshot with complete validation", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);

    expect(snapshot).toBeDefined();
    expect(snapshot.snapshotId).toMatch(/^umc-[a-f0-9]{16}$/);
    expect(snapshot.schemaVersion).toBe("1.0.0");
    expect(snapshot.validation.complete).toBe(false); // Chinese Xiu remains reference-only, not computed.\n    expect(snapshot.validation.warnings.some(w => w.includes("Chinese"))).toBe(true);
    expect(snapshot.validation.errors).toHaveLength(0);
    expect(snapshot.validation.totalMethods).toBe(MASTER_METHOD_IDS.length);
    expect(snapshot.validation.computedWithResultCount).toBeGreaterThanOrEqual(10);
    expect(snapshot.frameConfig.zodiacMode).toBe("fixed-cartesian-xyz");
    expect(snapshot.frameConfig.firmamentAnchorVersion).toBe("sunrise-xyz-15deg-hour-v1");
  });

  it("produces identical snapshot IDs for identical inputs (deterministic stability)", async () => {
    const snap1 = await buildUnifiedMasterChart(SAMPLE_INPUT);
    const snap2 = await buildUnifiedMasterChart(SAMPLE_INPUT);

    expect(snap1.snapshotId).toBe(snap2.snapshotId);
  });

  it("produces distinct snapshot IDs when date or location changes", async () => {
    const snap1 = await buildUnifiedMasterChart(SAMPLE_INPUT);
    const snap2 = await buildUnifiedMasterChart({
      ...SAMPLE_INPUT,
      date: "1992-04-15",
    });

    expect(snap1.snapshotId).not.toBe(snap2.snapshotId);
  });

  it("preserves distinct God View and Agent View projections from the same celestial state", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);

    expect(snapshot.godView.cosmicFrame).toBe("fixed-aries-1-to-pisces-12");
    expect(snapshot.godView.polarisCenter).toBe(true);
    expect(snapshot.frameConfig.firmamentCenter).toBe("polaris-centered-firmament-dome");
    expect(snapshot.godView.placements.length).toBeGreaterThanOrEqual(7);

    expect(snapshot.agentView.houseSystem).toBe("topocentric-equal-house-from-ascendant");
    expect(snapshot.agentView.ascendantAnchor).toBeDefined();
    expect(snapshot.agentView.placements.length).toBeGreaterThanOrEqual(7);

    const modeView = getModeView(snapshot, "god");
    expect(modeView).toEqual(snapshot.godView);
  });

  it("registers all 16 canonical method layers with truthful execution statuses", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);

    const expectedLayers = [
      "western-planets-and-signs",
      "western-houses-and-angles",
      "western-aspects-and-orbs",
      "western-essential-dignities",
      "fixed-stars-royal-watchers",
      "arabic-hermetic-lots",
      "arabic-lunar-manazil",
      "vedic-nakshatras-and-padas",
      "vedic-vargas-divisional",
      "vedic-dasha-and-ashtakavarga",
      "vedic-graha-drishti",
      "chinese-lunar-mansions-xiu",
      "elemental-decans",
      "kabbalah-sefer-yetzirah",
      "genesis-behavioral-patterns",
      "transit-activation-layer",
    ];

    for (const layerId of expectedLayers) {
      const layer = getLayer(snapshot, layerId);
      expect(layer, `Missing layer: ${layerId}`).toBeDefined();
      expect(layer!.id).toBe(layerId);
      expect(layer!.status).toBeDefined();
    }

    // Chinese 28 Xiu must have explicit reference-only status
    const chineseLayer = getLayer(snapshot, "chinese-lunar-mansions-xiu");
    expect(chineseLayer?.status).toBe("reference-only");
    expect(chineseLayer?.notes).toContain("Historical determinative equatorial star catalog preserved as reference");

    // Arabic Hermetic Lots must have computed results
    const lotsLayer = getLayer(snapshot, "arabic-hermetic-lots");
    expect(lotsLayer?.status).toBe("computed-with-result");
    expect((lotsLayer?.results as any[]).length).toBeGreaterThan(0);

    // Vedic Nakshatras must be computed
    const nakLayer = getLayer(snapshot, "vedic-nakshatras-and-padas");
    expect(nakLayer?.status).toBe("computed-with-result");
  });

  it("correctly resolves evidence IDs via getEvidence selector", async () => {
    const snapshot = await buildUnifiedMasterChart(SAMPLE_INPUT);

    const found = getEvidence(snapshot, "planet-sun");
    expect(found).toBeDefined();
    expect(found?.id).toBe("western-planets-and-signs");
  });

  it("keeps natal geometry consistent across natal, transit and combined modes", async () => {
    const base = { ...SAMPLE_INPUT, transitDate: "2026-10-31", transitTime: "12:00" };
    const natal = await buildUnifiedMasterChart({ ...base, mode: "natal" });
    const transit = await buildUnifiedMasterChart({ ...base, mode: "transit" });
    const combined = await buildUnifiedMasterChart({ ...base, mode: "combined" });

    for (const candidate of [transit, combined]) {
      expect(candidate.baseCelestialState.planets).toEqual(natal.baseCelestialState.planets);
      expect(candidate.baseCelestialState.houses).toEqual(natal.baseCelestialState.houses);
      expect(candidate.baseCelestialState.ascendant).toEqual(natal.baseCelestialState.ascendant);
    }
    expect(transit.transit?.planets).toEqual(combined.transit?.planets);
    expect(transit.snapshotId).not.toBe(combined.snapshotId);
    expect(natal.snapshotId).not.toBe(combined.snapshotId);
  });

  it("activates transit activation layer when mode is transit or combined", async () => {
    const snapshot = await buildUnifiedMasterChart({
      ...SAMPLE_INPUT,
      mode: "combined",
      transitDate: "2026-10-31",
      transitTime: "12:00",
    });

    const transitLayer = getLayer(snapshot, "transit-activation-layer");
    expect(transitLayer).toBeDefined();
    expect(transitLayer?.frame).toBe("transit");
    expect(transitLayer?.status).toBe("computed-with-result");
    expect(snapshot.transit).toBeDefined();
  });

  it("preserves transit observer and worldview in the authoritative snapshot", async () => {
    const snapshot = await buildUnifiedMasterChart({
      ...SAMPLE_INPUT,
      mode: "combined",
      worldview: "god",
      transitLocation: "Las Vegas, Nevada, USA",
      transitLatitude: 36.1699,
      transitLongitude: -115.1398,
      transitTimezone: "America/Los_Angeles",
      transitDate: "2026-11-02",
      transitTime: "12:00",
    });

    expect(snapshot.natal?.worldview).toBe("god");
    expect(snapshot.natal?.transitHouseFrame).toBe("god-fixed");
    expect(snapshot.natal?.ascendant).toBeNull();
    expect(snapshot.natal?.houses).toEqual(Array.from({ length: 12 }, (_, i) => i * 30));
    expect(Number.isFinite(snapshot.baseCelestialState.ascendant!.longitude)).toBe(true);
    for (const body of snapshot.natal!.movingBodies) {
      expect(body.house).toBe(Math.floor(body.longitude / 30) + 1);
      expect(body.longitude).toBe(snapshot.baseCelestialState.planets.find(row => row.name === body.name)!.longitude);
    }
    expect(snapshot.snapshotId).not.toBe((await buildUnifiedMasterChart({
      ...SAMPLE_INPUT,
      mode: "combined",
      worldview: "god",
      transitLocation: "New York, New York, USA",
      transitLatitude: 40.7128,
      transitLongitude: -74.006,
      transitTimezone: "America/New_York",
      transitDate: "2026-11-02",
      transitTime: "12:00",
    })).snapshotId);
  });
});
