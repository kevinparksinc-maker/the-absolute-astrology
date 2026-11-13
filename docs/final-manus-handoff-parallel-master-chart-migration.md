# FINAL MANUS HANDOFF — PARALLEL MASTER CHART / MASTER READING MIGRATION

## Decision (binding)
Build a NEW Unified Master Chart data contract and NEW Comprehensive Master Reading pipeline **in parallel** with the current production chart and reading. REUSE all validated existing astronomy, astrology, doctrine, evidence, Genesis and interpretation calculators; DO NOT rewrite working formulas or simply patch the old reader. Keep the existing user-facing routes functional until validated cutover. Do not equate a Canon doctrine entry with an executable calculation.

Read and implement together:
- docs/unified-master-chart-architecture.md
- docs/master-chart-completeness-and-method-wiring-repair.md
- docs/master-synthesizer-execution-blueprint.md
- docs/master-synthesizer-complete-doctrine-coverage.md
- docs/master-synthesizer-implementation-spec.md

## Exact execution steps
1. **Audit the existing actual output, not just source definitions.** Capture real sanitized ChartResult JSON, evidencePacket JSON, API responses, and UI reading for natal, transit, horary, synastry and energy modes. Build a matrix: every discovered technique → executable calculator → invoked? → output value? → evidence packet? → interpreter? → synthesis? → API? → UI?; mark source-only, missing, failed, and verified. Identify where data is lost.
2. **Create typed Master Method Registry** covering EACH individual method, its prerequisites, applicable modes, coordinate frame, calculation function, version, and evidence schema. Automatically enumerate all registered methods; fail validation when an applicable executable method has no execution/status record. Do not mark research-only entries computed.
3. **Create new immutable UnifiedMasterChartSnapshot** and builder; include canonical celestial state, God/Agent projections, 12 houses, all planets/points, transit/natal or partner sub-snapshots, every applicable computed overlay, complete method-execution ledger, provenance, validation and error statuses. Use versioned UTC/time/location/frame/anchor keys and correct cache invalidation. Preserve the existing fixed Babylonian reference, zero tilt, no precession, Equal Houses, and user scoring conventions; do not substitute J2000 or Lahiri under fixed mode.
4. **Wire existing calculators into new registry** with adapters. Repair all gaps uncovered in step 1; avoid duplicate calculation implementations. Missing calculators are separate engineering tasks with verified formulas, fixtures and explicit not-implemented status until complete. Include 27 Nakshatras, 28 Manazil, Chinese 28 Xiu (do not claim personal placement until boundary method is validated), fixed stars, elemental decans, Vedic divisions/strengths, Western/Arabic doctrines, Kabbalah, Genesis/behavioral layers and all actual methods discovered in repo.
5. **Build new Master Reading pipeline**: one snapshot → grounded per-method propositions with evidence IDs → existing Master Interpreter logic adapted to snapshot → new Master Synthesizer theme clustering, contradictions and independent corroboration → WHAT/WHY/HOW/CONSEQUENCE/MEANING narrative plus complete evidence appendix. Both use identical snapshot ID; no silent method omission. Render a readable chart and optional Layers & Methods inspector.
6. **Run old and new side-by-side behind a feature flag** (e.g. UNIFIED_MASTER_CHART_V2) in shadow mode; preserve current production responses. Compare chart positions, all house assignments, scores, method coverage, latency, and real generated readings. For methods absent in old pipeline, document the new evidence rather than treating differences as bugs.
7. **Prove acceptance**: every registered applicable executable method has computed output or explicit error; every value traceable calculator→snapshot→evidence→interpreter→synthesizer→API→UI; fixture regressions for fixed frame and equal houses, God/Agent, time stepping, horary/synastry, mansion activation, Vedic vargas, energy totals; performance and privacy checks. Run repo typecheck, tests, build, mobile and desktop screenshots. Attach sanitized real output, method matrix, before/after readings, logs and unresolved gaps to PR.
8. **Cut over only after review and verified tests.** Feature flag defaults OFF until approved; do not delete old code or alter production calculation behavior during migration. Provide rollback. Do not auto-merge.

## Mandatory Manus delivery format
- Actual code files changed, not just documents/prompts
- Method-by-method audit with evidence and missing-method backlog
- Real snapshot output example, including individual method statuses
- Evidence coverage comparison and before/after readings
- Passing/failing commands and test logs
- PR URL, deployment status, known limitations, safe cutover/rollback plan

**Completion standard:** The new chart contains or truthfully accounts for EVERY applicable registered method, and the new reader can access the same complete evidence. Documentation alone is NOT implementation. This handoff is the migration decision; begin implementation with the actual output audit.
