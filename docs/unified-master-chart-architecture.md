# UNIFIED MASTER CHART — SINGLE SOURCE OF CALCULATED TRUTH

**Required architectural dependency of the Master Synthesizer.** Implement this alongside `master-synthesizer-execution-blueprint.md`, `master-synthesizer-implementation-spec.md`, and `master-synthesizer-complete-doctrine-coverage.md`. This is a specification/handoff, not working code.

## Owner's requirement
At any requested instant, the system must build ONE authoritative, fully populated, internally consistent **Unified Master Chart snapshot** that contains or references the complete results of every applicable implemented technique. All reading modes, the existing Master Interpreter, and the new Master Synthesizer read that SAME immutable snapshot. They must not individually recompute or silently use different frame, epoch, house, zodiac, longitude, time, or profile assumptions.

**One chart** means one authoritative data contract and shared coordinate/temporal context, NOT one flat diagram that merges incompatible tradition-specific geometries. Keep separately labeled frame-specific projections and overlays within the same snapshot.

## Required pipeline
1. Validate input: profile ID, natal date/time/timezone/location, reading/event time and location, selected zodiac/firmament model, house settings, versioned anchor settings and requested reading mode. Use explicit UTC instant plus original local offset/timezone.
2. Build a canonical base celestial state ONCE per unique input/frame: bodies, nodes, longitudes, speeds, directions, angles, house cusps, fixed-star reference, coordinate assumptions.
3. Generate both God and Agent projections from the SAME base state, preserving their differences and Equal House Ascendant anchoring.
4. Compute/retrieve ALL applicable implemented overlays from the canonical base and frame-specific projections: houses/lords, aspects/orbs, dignity/strength, sect, Lots, stars, elemental decans, Vedic nakshatras/vargas/Dasha/Ashtakavarga/Shadbala/Bhava Bala/Yogas/Drishti, Arabic Manazil, Chinese Xiu and activated mansion contacts, Kabbalah correspondences, timing/transits, Genesis Astro/Pattern/behavior/life-event findings, etc. If a method is not implemented or inapplicable, store explicit status; never manufacture it.
5. Assemble immutable `UnifiedMasterChartSnapshot` with complete per-technique evidence records and source IDs. Freeze/validate before any narrative generation.
6. Pass the snapshot by reference or immutable serialized value into the Master Interpreter and Synthesizer. Both must consume exactly the same `snapshotId` and data version. Each reading mode selects relevant results without losing access to the full ledger.
7. Return unified reading plus evidence annex linked back to snapshot ID and exact evidence IDs.

## Suggested typed data contract
```ts
type LayerStatus = "computed-with-result" | "computed-no-result" | "not-applicable" | "not-implemented" | "reference-only" | "failed";
interface LayerRecord<T = unknown> {
  id: string; tradition: string; technique: string;
  status: LayerStatus; frame: "god" | "agent" | "shared" | "natal" | "transit" | "cross-chart";
  results?: T; evidenceIds: string[]; sourceIds: string[];
  prerequisites: string[]; calculationVersion: string;
  errorCode?: string; // never falsely report failure as no result
}
interface UnifiedMasterChartSnapshot {
  snapshotId: string; schemaVersion: string; createdAtUtc: string;
  inputs: { profileIds: string[]; eventInstantUtc: string; timezone: string; locationContext: unknown; mode: string };
  frameConfig: { zodiacMode: string; firmamentAnchorVersion: string; obliquityMode: string; precessionMode: string; houseSystem: string; engineVersion: string };
  baseCelestialState: unknown;
  godView: unknown; agentView: unknown;
  natal?: unknown; transit?: unknown; horary?: unknown; secondProfile?: unknown; synastry?: unknown;
  layers: Record<string, LayerRecord>;
  methodExecutionLedger: LayerRecord[];
  validation: { complete: boolean; errors: string[]; warnings: string[] };
}
```
Use existing concrete chart types rather than leaving `unknown` in the implementation. Make snapshots read-only and validate schema/version.

## Modes and consistency
- **Natal:** natal timestamp/location produces one natal snapshot; all applicable methods use those exact inputs.
- **Transit / Energy Read:** preserve natal snapshot plus a transit/event snapshot at the requested UTC instant and observer location; combine as one linked composite snapshot. 30-minute stepping creates a NEW event snapshot, never mutates the prior one.
- **Horary:** question timestamp/location and significator/turned-house context must remain authoritative; do not silently substitute natal data. Natal may be linked separately if explicitly required by the reading design.
- **Synastry:** two independent natal snapshots linked by one composite relationship snapshot; no cross-profile leakage.
- **Life Story:** one stable natal snapshot plus separately timestamped event snapshots; never present one moment's planetary positions as valid for another moment.
- **Zodiac Horary:** one event celestial state with sign-as-H1 projections for each requested sign.
- **Guide/Patterns:** consume the linked relevant snapshot and method ledger.
- **Sports Simulation Lab:** separate workflow and not in scope for this PR; future consumers may use the same versioned chart contract.

## Calculation guarantees
- One underlying canonical coordinate/ephemeris state per unique timestamp/configuration, with derived overlays using the same source values.
- Do NOT alter current fixed Babylonian anchor, zero-tilt, no-precession, Equal House and existing energy/scoring settings. Never inject J2000 or time-varying ayanamsha into the fixed mode. Explicit alternate modes may retain their own documented conventions without mixing them into the default.
- God/Agent and incompatible historical systems remain distinct **labeled projections** within one master snapshot. Never pretend that one longitude can be directly reused under different zodiac coordinate systems without an explicit validated transformation.
- Every layer stores input version, output, status, source and provenance; a research catalog entry is not computed evidence.
- Validate every planet, house, aspect, star/mansion occupancy, timing, and score uses the correct snapshot ID/frame.
- Compute in background before synthesis. Optimize with dependency graph, safe caching and concurrent independent overlays, but do not begin final synthesis until required layer computations settle and ledger reports all statuses.
- Cache key includes all relevant inputs, UTC time, location, mode, coordinate config, algorithm/anchor versions and profile revision. Invalidate when any change; prevent stale outputs.
- If a computation fails, mark `failed` with trace; surface degraded coverage. Do not silently use stale cached values or fabricate results.
- Protect birth data: no sensitive fields in public trace exports or telemetry.

## Runtime access
Provide a single authoritative entry point such as `buildUnifiedMasterChart(input): Promise<UnifiedMasterChartSnapshot>` and read-only selectors `getLayer(snapshot,id)`, `getEvidence(snapshot,evidenceId)`, `getModeView(snapshot,mode)`. Implement only after mapping current code paths and reusing existing calculators. Do not duplicate astronomy calculations in the synthesizer.

The UI may show a clean North Indian diamond and optional wheel, but the full master snapshot lives in the data layer, not the visible diagram. The `How was this calculated?` drawer displays its selected details.

## Required tests
1. Same timestamp/profile/config produces identical canonical values and consistent snapshot IDs; different time/location/frame/anchor/profile revision produces a distinct or appropriately invalidated snapshot.
2. All applicable implemented layers are invoked or have a truthful status; all evidence references resolve.
3. God and Agent share base state but preserve distinct projections and correct house assignments.
4. Every one of 12 houses, all supplied planets and all active mansions appear in full ledger.
5. 30-minute transit stepping updates only time-dependent state while preserving linked natal inputs.
6. Horary question chart never accidentally reads transit/natal event data; synastry preserves two distinct natal charts.
7. Method failure does not yield false complete status; missing technique remains explicitly unavailable.
8. No duplicated ephemeris calls per unique canonical state beyond documented necessity; benchmark build latency and cache behavior.
9. Interpreter and Synthesizer receive identical snapshotId; each major narrative claim resolves to evidence from that snapshot or its explicitly linked natal/event sub-snapshot.
10. No change to established engine outputs: regression fixtures for Babylonian anchors, no precession/tilt, equal houses, Energy totals, and Horary verdicts.
11. Run typecheck, test suite and build; report actual results and screenshots/trace examples.

## Deliverables / definition of done
- Actual typed Unified Master Chart builder, selectors, dependency graph, caching/versioning and tests.
- Wiring to production reading endpoints and both interpreter/synthesizer.
- Per-technique status/evidence ledger and complete provenance.
- One demonstrated natal snapshot, one transit composite, one horary, one synastry; proof all layers used correct inputs.
- Performance/coverage report and PR. No auto-merge.

**Final non-negotiable:** The Synthesizer must never go hunting for separate inconsistent chart calculations at narration time. It receives one fully investigated, validated, authoritative Master Chart snapshot and synthesizes from it.
