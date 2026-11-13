# Master Interpreter: complete evidence ingestion blueprint

## Verified against main
- `server/masterChart/builder.ts` creates layered snapshot including aspects, dignities, Nakshatra, Manzil, vargas, timing/Ashtakavarga, drishti, decans and Chinese Xiu reference catalog.
- `server/astrologyKnowledge/synthesis/normalizer.ts` extracts a curated subset of propositions, not every layer.
- `server/routers.ts` masterSynthesize passes snapshot to synthesizeMasterReading without separately passing the full interpretation evidence packet.

## Required architecture
1. Introduce `MethodEvidence` with stable ID, method, tradition, source, calculatedAt, frameVersion, status (`calculated`|`not-applicable`|`reference-only`|`failed`|`unimplemented`), payload, reliability/validation, and provenance. Never present reference-only Xiu as calculated contacts.
2. Build a single typed `EvidenceRegistry` from ALL snapshot layers plus existing astrology evidence pipeline. Dedupe by stable ID and frame, not text. Fail visibly on conflicts.
3. Define method adapters for western aspects/dignities, elemental decans, fixed stars, lots, Nakshatra/pada, Arabic Manzil, Chinese Xiu when computed, D1/D9 and other vargas, Vimshottari/Ashtakavarga, Graha/Rasi Drishti, Genesis patterns, and remaining snapshot layers. Each adapter must return findings OR an explicit status with reason.
4. Extend `extractPropositionsFromSnapshot` to take the registry; evaluate every applicable calculated method. Preserve contradictory findings, orbs, strengths, houses and timings. Do not invent a result from reference-only catalogs.
5. Modify `masterSynthesize` to await both `buildUnifiedMasterChart` and existing full evidence pipeline, merge them, then call synthesizer with the unified registry and a method coverage report. Avoid double-calculation and inconsistent frame versions.
6. Synthesizer pipeline: method completeness gate -> evidence propositions -> cross-method corroboration/conflict -> prioritize by question -> WHAT/WHY/HOW/CONSEQUENCE/MEANING -> readable answer with trace IDs.
7. UI: collapsible Method Coverage showing all 16 snapshot layers and all additional evidence methods, each status and reason. A reading cannot claim 'all methods' if any applicable layer was silently skipped.
8. Tests: one fixture per method, missing/failed/reference-only behavior, evidence ID traceability, conflict handling, deterministic ranking, snapshot/full-packet merge, natal/transit/horary/synastry regression, token-budget chunking that does not drop evidence.
9. Keep XYZ/sunrise migration separate: a unified chart reference-frame certificate must be attached to every evidence item. Do not mix old tropical placements with experimental fixed-frame ones.
10. Acceptance: all implemented applicable methods evaluated, every omission surfaced, numerical evidence unchanged, no false claim that Chinese Xiu is computed, full pipeline test pass.

## State
Specification only; no production synthesizer or router modifications in this branch. Implement and verify in a dedicated PR before merge.
