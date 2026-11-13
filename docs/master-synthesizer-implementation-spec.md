# THE ABSOLUTE — MASTER SYNTHESIZER IMPLEMENTATION SPECIFICATION

## Mission
Add a **Master Synthesizer** to the existing chart → deterministic evidence → Canon/knowledge → Master Interpreter → reading pipeline. Its job is to synthesize all applicable calculated and interpreted layers into one coherent, chart-specific, question-aware human reading, not a series of doctrine-by-doctrine paragraphs.

This branch is a **technical handoff specification**, not an implemented synthesizer. Manus/Studio must implement, test and open a PR. Do not merge without review.

## Inspect before editing
- `server/master-interpreter.ts`
- `server/astrologyKnowledge/evidencePacket.ts`
- `server/astrologyKnowledge/planner.ts`
- `server/astrologyKnowledge/methodCoverage.ts`
- `server/astrologyKnowledge/resolver.ts`
- `server/astrologyKnowledge/types.ts`
- `server/astrologyKnowledge/canon/retriever.ts`
- `server/interpretation.ts`
- `client/src/components/ProfileReadingScreen.tsx`
- `client/src/components/Interpreter2050.tsx`
- relevant Natal, Transit, Horary, Synastry, Energy, Guide, Life Story, Zodiac Horary paths and tests.

## Architecture / non-negotiable separation
1. **Calculation engines** determine actual positions, aspects, orbs, houses, strengths, timings and frame-specific chart data. These engines are authoritative and must remain unchanged in this PR.
2. **Knowledge retrieval and Master Interpreter** determine the applicable doctrinal interpretations, attach source/evidence references and classify applicability.
3. **Master Synthesizer** consumes only the structured evidence and grounded interpretations. It groups, prioritizes, cross-checks and weaves them into integrated themes.
4. **Final narrator/UI** renders coherent prose with expandable evidence traces. The Synthesizer cannot invent positions, events, exact dates, historical doctrine, scores or missing calculations.

## New typed contract
Create a synthesis module under `server/astrologyKnowledge/synthesis/` (or nearest existing consistent structure):
- `SynthesisInput`: reading mode, user question, chart context, God/Agent frame facts, complete evidence packet, method coverage, interpreted propositions, timing intervals, confidence/availability metadata.
- `InterpretedProposition`: id, plain-language meaning, domain(s), causal mechanism, valence, strength (derived from existing evidence, not a new arbitrary formula), frame, active interval, supporting evidence IDs, opposing evidence IDs, doctrine/source IDs.
- `SynthesizedTheme`: id, human theme, primary conclusion, why/how, concrete manifestations, consequences, deeper meaning, timing (only if supplied), agreement/conflict assessment, linked proposition/evidence IDs, unresolved limitations.
- `SynthesisResult`: ordered themes, integrated narrative sections, evidence-to-sentence trace map, coverage ledger, conflicts/limitations, quality validation results.

## Required synthesis algorithm
A. Collect **all applicable** evidence families without dropping material based only on tradition. Existing coverage ledger must distinguish evaluated-with-result, evaluated-without-result and unavailable/not-executed when possible.
B. Normalize to structured propositions with provenance. No naked LLM assertions: every astrological claim must map to one or more evidence IDs.
C. Cluster by lived human realities: identity, family/home, relationships, work/purpose, money/resources, autonomy/power, health/energy (symbolic only), conflict, opportunities, timing and question-specific themes. Do NOT cluster by Western/Vedic/Arabic/Chinese headings.
D. Combine evidence that reinforces the same theme; distinguish independent corroboration from duplicated interpretations of the same source calculation. Do not double-count a single aspect just because multiple traditions discuss it.
E. Resolve tensions by identifying frame (God vs Agent), chart role, temporal window, planetary condition, house relevance, strength, or technique applicability. When irreconcilable, explicitly state the tension; never silently pick a convenient verdict.
F. Prioritize strongest, question-relevant and actionable themes without pretending unsupported numeric certainty. Preserve critical minority warnings and meaningful counter-evidence.
G. Compose integrated prose in WHAT → WHY → HOW → CONSEQUENCE → MEANING order **internally**, without forcing five repetitive headings. State what this looks like in life, and how/when it appears when grounded.
H. Keep calculations, technique-by-technique evidence and citations available in a collapsed `How was this calculated?` view, not in a long visible dump.
I. Deliver clear direct prose without generic filler, forced doctrinal name-dropping, repetitive claims, fabricated predictions or compulsory hedging. Clearly mark uncertainty where evidence genuinely lacks precision.

## System-specific requirements
- Respect The Absolute's currently configured Babylonian fixed-star reference, zero-tilt and no-precession rules; never substitute tropical, Lahiri, J2000 or a conventional Ascendant without explicit selected mode.
- God View and Agent View remain distinct evidence streams and must be synthesized rather than silently collapsed. Equal-house Ascendant anchoring preserved.
- Consider Western/Hellenistic, Vedic/Jyotish (Dasha, vargas, yogas, Shadbala/Bhava Bala, Ashtakavarga when actually computed), Arabic/Persian, Chinese 28 mansions, Vedic 27 nakshatras, Arabic 28 manazil, elemental decans, fixed stars, lots and Kabbalistic correspondences when relevant and available.
- Mansion occupancy/activation and any user-defined mansion aspect model must be sourced from actual calculated outputs. Never present inactive mansion symbolism as an active transit.
- Energy Read: preserve harmonious conjunction rule, major-aspect/orb settings, scoring math and timing/easing evidence; no recalculation by the synthesizer.
- Horary: maintain specialized significators, reception, Moon conditions and question-specific yes/no logic; synthesis explains the verdict, never replaces deterministic verdict.
- Synastry: preserve both people's distinct chart facts and relationship aspect provenance.
- Transit: distinguish natal predisposition from currently active transits, onset/peak/easing if supplied.
- Life Story: do not invent historical events; separate chart symbolism from user-provided history.
- Zodiac Horary: respect sign-as-H1 convention.
- Sports/Simulation Lab remains separate; no betting or outcome guarantees.

## Integration and feature flag
- Identify actual production call path(s) before editing; don't only modify a prompt string that isn't called.
- Add `masterSynthesizer` after evidence interpretation and before response formatting, with feature flag/fallback to current Master Interpreter behavior.
- Preserve existing APIs, response schemas, saved profile behavior, frontend reading controls and the Stitch redesign integration branches.
- Avoid duplicated model calls if a structured pass can be combined safely. Record latency and token/compute cost.
- Provide structured output validation, bounded retries, deterministic trace integrity checks and graceful fallback if synthesis fails.
- Never send private birth details to logging/telemetry.

## Quality gates / tests
1. Snapshot and integration tests for Natal, Transit, Combined, Horary, Synastry, Energy Read, Guide & Patterns, Life Story, Zodiac Horary as supported by production.
2. Two meaningfully different charts produce distinguishable conclusions tied to differing evidence.
3. Cross-system reinforcement appears as **one integrated theme**, not five redundant doctrine paragraphs.
4. Contradictory evidence produces a nuanced reconciliation with linked IDs.
5. No invented planet/house/orb/dasha/mansion/timing/event; all specific claims trace to actual packet evidence.
6. All applicable method families are evaluated or explicitly marked unavailable; no fabricated coverage.
7. God and Agent facts are labeled and never interchanged.
8. No modification of chart calculations or Energy Read totals.
9. Readings remain substantive, comprehensible, mobile-friendly and accessible; evidence drawer contains the technical details.
10. Run `pnpm check`, `pnpm test`, `pnpm build`; report results honestly, including baseline failures.
11. Provide side-by-side before/after real output from fixed test fixtures and explain which evidence produced each theme.
12. Confirm graceful fallback, latency and output-size limits.

## Deliverables
- Typed synthesis pipeline, implementation and tests.
- Wiring into **actual** reading endpoint(s).
- UI evidence trace integration as appropriate; coordinate with ongoing Stitch frontend branches.
- Documentation of mode-specific logic, evidence lineage, and coverage/quality metrics.
- PR with exact changed files, screenshots, sample outputs, passing tests and known gaps. Do not merge automatically.

## Definition of done
A user sees **one coherent, deeply synthesized reading** across relevant traditions and both chart frames. All substantive astrological claims are grounded in computed evidence; deeper calculations remain one tap away. The Master Interpreter is retained as a knowledge interpreter, not overwritten.
