# MASTER CHART COMPLETENESS — IMPLEMENTATION AND WIRING REPAIR MANDATE

## Owner's problem and required outcome
The Absolute has accumulated methods, doctrines, calculators, Canon research, and reading screens, but the user is not seeing all applicable methods in chart-backed readings. **Do not assume the root cause** until the data path is audited. A technique may be missing because it is reference-only, not calculated, calculated but not serialized, omitted from evidence packets, filtered by planner, dropped in the interpreter, or hidden in UI.

**Required outcome:** At any supported instant, the app constructs one authoritative, versioned Unified Master Chart *data snapshot* containing **every applicable executable technique's actual results**, plus explicit statuses for unavailable/inapplicable methods. The Master Interpreter and Master Synthesizer receive this same complete snapshot. Every material method contributes to the synthesized reading or traceable evidence appendix. The chart display may remain uncluttered: complete chart DATA is not the same as drawing every result simultaneously.

This document is a mandatory companion to:
- `docs/unified-master-chart-architecture.md`
- `docs/master-synthesizer-execution-blueprint.md`
- `docs/master-synthesizer-complete-doctrine-coverage.md`
- `docs/master-synthesizer-implementation-spec.md`

## Phase 0 — audit EVERY method's full path before modifying code
For every actual method, enumerate:
1. Doctrine definition and tradition/variant/source.
2. Actual calculator function/export and dependencies, or `research-only`.
3. Inputs: timestamp(s), timezone, observer location, profile(s), selected zodiac/frame, anchor/epoch, house mode.
4. Actual computed output, type, frame, precision, evidence IDs.
5. Inclusion in master snapshot (field/selector).
6. Inclusion in evidence packet and method-coverage ledger.
7. Selection by reading planner and Master Interpreter.
8. Inclusion in Master Synthesizer input and synthesized themes/technical annex.
9. Availability in API response and frontend reader/evidence drawer.
10. Fixture test and last verified output.

Write `docs/master-chart-wiring-audit.md` and a machine-readable method manifest. Mark **where each broken path stops**. A method being named in a prompt, Canon or TypeScript file is not proof it executes. Inspect all repository modules, not only the examples in this document. Include user-defined custom methods.

## Required coverage: chart foundation
- All supplied celestial bodies and points: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, lunar nodes, angles, Lots and other actually calculated bodies; exact positions/degrees, speeds, retrograde, sign, house, rulers, dispositors.
- All 12 houses with exact Equal House cusp degrees and house lords, occupants, relevant aspects, strength and domain; no house excluded.
- God View fixed firmament AND Agent View local horizon, separately labeled; preserve fixed Babylonian anchor, no precession, zero tilt; alternate zodiac modes only when explicitly selected. Never conflate frames or silently introduce J2000.
- All implemented aspects with orbs, applying/separating if calculated, reception, dignities, sect, condition, combustion, besiegement, planetary day/hour and timing.
- Fixed-star positions/contacts, elemental-family decans (distinct from other decan systems), actual lunar mansion occupancy/activation and contact rules.

## Required coverage: doctrine and technique families
**Western/Hellenistic/Medieval:** rulership, triplicity, terms/bounds, decans/faces, dignity/debility, sect, joys, angularity, house groupings, dispositors, reception, overcoming, bonification/maltreatment, Lots of Fortune/Spirit/Eros, translation/collection of light, prohibition/perfection, profections, zodiacal releasing, planetary periods, antiscia, dodecatemoria and any other actually executable methods.

**Vedic/Jyotish:** D1 and relevant D2/D3/D4/D7/D9/D10/D12/D16/D20/D24/D27/D30/D60 vargas, graha/rashi drishti, planetary lordships, yogas and cancellations, Shadbala, Bhava Bala, Ashtakavarga BAV/SAV, Avasthas, nakshatras/padas, Vimshottari Dasha/Bhukti, Sade Sati, Jaimini karakas, planetary war, Kendra/Trikona/Dusthana/Upachaya, Dharma/Artha/Kama/Moksha. Explicitly distinguish what is computed from what exists only as Canon doctrine.

**Arabic/Persian:** 28 Manazil, active planetary occupancy and user-defined mansion aspects, Lots/Siham, almuten, reception, perfection/prohibition, translation/collection, Firdaria, hayz, interrogational/electional testimony and other implemented methods.

**Chinese:** 28 Xiu, planetary occupants, Four Symbols, stellar territory, any implemented five-phase/calendar methods and documented boundary model. Never treat catalog-only systems as calculated.

**Babylonian/Egyptian/Hermetic/Kabbalah:** fixed-star Babylonian celestial model and relevant omens only when computable, historical Egyptian decans when implemented, Hermetic correspondences when applicable, Sefer Yetzirah 3 Mothers/7 Doubles/12 Simples, Four Worlds, relevant historically attested associations with explicit interpretive (not numeric) status.

**App-specific:** Genesis Astro Engine, Genesis Pattern Engine, Yoga Detector, seven-channel Human Behavioral Intelligence, Life Event/Sequence Intelligence, Canon Dossier, human-reality interrogation, Power → Safety → Comfort → Authenticity → Trust → Self-Sovereignty, Harmonic Flow Clock, energy scores/weights, aspect intensity, friction/harmony and easing windows. Do not recompute scores in the Synthesizer.

**Modes:** Natal, Transit/Combined, Energy Read, Horary, Zodiac Horary, Synastry, Guide & Patterns, Life Story, and any other discovered actual reading mode. Horary and synastry must preserve their distinct question and multi-profile chart contexts.

## Build the chart as a dependency graph, not scattered on-demand calculations
- One canonical base celestial state per unique instant/frame/location/algorithm configuration; derive all implemented overlays with explicit dependencies.
- A complete, immutable `UnifiedMasterChartSnapshot` includes: base state, God and Agent projections, all applicable calculated overlay results, per-technique execution status, evidence lineage, provenance, calculation version and failure details.
- Distinct natal, event/transit, horary and partner moments remain distinct **linked sub-snapshots** inside one reading context. A single chart cannot truthfully assign the same positions to multiple dates.
- Compute all applicable layers before narration. Background concurrency and memoization are permitted; **no lazy missing-method lookup by the LLM**.
- If prerequisites are unavailable, return `not-implemented`, `not-applicable`, `failed` or `reference-only`, never fabricate a value or mark the entire chart fully computed.
- The method ledger is at **individual technique level**, not just 12 broad families. It must be queryable and testable.
- Source calculations and selected frame/epoch must remain consistent. Store snapshot IDs and versioned inputs with every result. Cache invalidation covers profile, time, location, reference frame, anchor, algorithm revision.
- Preserve all raw evidence, even if a given technique is low-salience for the visible narrative.

## The missing-connection repair workflow
For each technique with a broken pipeline:
A. If already computed but omitted: wire existing result into the snapshot and evidence packet, then into interpretation/synthesis/API/UI. Add test.
B. If calculator exists but is not invoked: connect it through the dependency graph, with proper frame, prerequisites and tests.
C. If only Canon research exists: mark `reference-only`; create a separate implementation task with historically and mathematically reviewed formulas and source rules. Do not invent calculation or label it implemented.
D. If computation is unsupported in the selected fixed-frame model: mark explicitly and do not silently substitute tropical/J2000/Lahiri assumptions.
E. If data reaches API but not reading UI: repair serialization/response selectors and add UI regression tests.
F. If data is present but Synthesizer omits material findings: repair coverage validation, salience and evidence-to-theme mapping.

## Master Interpreter / Synthesizer contracts
- Both consume the same immutable `snapshotId`; neither may request a fresh inconsistent chart during narration.
- Master Interpreter creates grounded propositions for all applicable computed techniques, with evidence IDs, frames, time windows and source variants.
- Master Synthesizer evaluates **all** propositions, merges independent corroboration, resolves genuine contradictions, and creates an integrated reading by lived themes, not doctrine-by-doctrine headings.
- Every material result must appear in the narrative or expandable annex; every named specific placement/orb/strength/timing must link to an actual computed value.
- One coherent conclusion answers the question with WHAT → WHY → HOW → CONSEQUENCE → MEANING, concrete real-world manifestations, genuine counterweights and verified timing.
- Never treat multiple descriptions of the same source datum as independent confirmation.

## UI requirement: one chart, full evidence access
Keep the user-facing North Indian diamond chart readable. Add a Master Chart **Layers & Methods** inspector/drawer that can show each technique, its computed output, method status, God/Agent frame, sources and how it affected the synthesis. It is fine for many layers to be invisible until opened; **not fine for them to be absent from the chart data**.
The visible reading should be clear prose, not an exhaustive doctrine dump. Include a `How was this calculated?` expandable trace per major theme, plus full method ledger. Coordinate UI with Stitch branches, without overwriting frontend work.

## Definition of complete: required proof, not assertion
1. Automated inventory compares every registered executable method against snapshot entries and flags unaccounted-for methods.
2. A single fixed natal test fixture demonstrates all executable applicable methods were run and recorded, or truthfully failed; includes all 12 houses and every supplied body.
3. Transit stepping 30 minutes creates a new time-consistent event snapshot while retaining natal reference; no stale overlays.
4. Distinct God/Agent views use the same base input without frame confusion; fixed-star anchor and Equal House regressions pass.
5. Activated vs inactive mansions test; two occupants test; never fabricate multipliers.
6. Vedic D1/D9, strengths, Lots, decans and timing tests run when calculators are actually implemented; unsupported techniques marked explicitly.
7. Horary question moment and significators never replaced by natal; synastry retains both persons' natal data.
8. Each method is traceable through calculator → snapshot → evidence → interpreter → synthesizer → API → UI, with test evidence at each boundary.
9. Synthesis includes independent cross-tradition corroboration and conflict fixtures with correct provenance and no invented values.
10. Screenshots of readable chart, layers inspector, complete evidence drawer and synthesized reading on desktop/mobile.
11. Benchmarks for build latency, cache invalidation, computation failure and privacy-safe telemetry.
12. Run `pnpm check`, `pnpm test`, `pnpm build`; include actual logs and before/after readings, method coverage table, missing-method backlog, PR link. No auto-merge.

## Manus execution order
1. Inventory actual repository methods and production data flows; publish gap matrix.
2. Implement unified snapshot types, build graph, execution ledger and selectors using existing calculators.
3. Repair missing links for all already-implemented methods; add tests per path.
4. Mark reference-only/unimplemented methods explicitly and create follow-up backlog; do not claim they run.
5. Wire complete snapshot to Master Interpreter, then Master Synthesizer, then response/API and UI layers inspector.
6. Test real end-to-end outputs in all modes, present method-by-method proof and open PR.

**No completion claim** until the complete chart DATA, evidence pipeline, and integrated reading have been exercised end-to-end. Merely adding names of doctrines to a prompt is NOT implementation.
