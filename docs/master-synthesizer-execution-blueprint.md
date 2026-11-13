# THE ABSOLUTE — MASTER SYNTHESIZER: EXECUTION BLUEPRINT & ACCEPTANCE CONTRACT

**READ THIS FIRST, THEN** `master-synthesizer-implementation-spec.md` and `master-synthesizer-complete-doctrine-coverage.md`. This is the implementation contract for Manus/Studio. Implement working code and tests, not merely prompt text. Do not merge into main without review.

## 0. Outcome and absolute boundaries
**Outcome:** An end user receives a rich, integrated, chart-specific interpretation in coherent natural prose. The engine quietly computes/retrieves and reviews all applicable evidence, combines relevant traditional doctrines, reconciles tension, and explains what the entire pattern signifies. Full method-level evidence is preserved for inspection but not dumped into the reading.

**Do not:** replace the existing Master Interpreter; edit ephemeris/coordinates/zero-tilt/fixed-star/Equal House calculations; alter God/Agent frames; change Energy Read weights or horary verdict rules; fabricate methods; treat a Canon research record as an executed calculation; concatenate 10 method summaries; produce one generic paragraph per tradition; suppress contradictory evidence; hardcode sample readings; claim spiritual/empirical certainty; silently change user-selected zodiac mode.

## 1. Mandatory repository discovery and inventory
Before implementation, trace every actual production reading route, API endpoint, evidence producer, method registry, output formatter, feature flag and frontend consumer. Inspect at minimum:
- `server/master-interpreter.ts`, `server/interpretation.ts`, `server/astrologyKnowledge/evidencePacket.ts`, `planner.ts`, `resolver.ts`, `types.ts`, `methodCoverage.ts`, `registry.ts`.
- All `server/astrologyKnowledge/canon/`, `vedic/`, `arabic/`, `western/`, `behavioral/` modules, Genesis pipelines, lunar/fixed-star code, and tests.
- `client/src/components/ProfileReadingScreen.tsx`, `Interpreter2050.tsx`, `InterpretationPanel.tsx`, plus actual Horary, Synastry, Energy, Guide, Life Story, Zodiac Horary screens.
- All existing docs on astrology framework, reading rules, doctrine research, and mode-specific interpretation.

Produce `docs/master-synthesizer-method-execution-matrix.md` and a machine-readable companion (JSON or typed data). Each individual method must have: `methodId`, tradition, canonical name, code file/export, source authority, prerequisites, coordinate frame, applicable modes, computed fields, evidence IDs, implemented vs catalogued vs research-only, last test, missing wiring and action needed. **No invented method execution.** Discover additional methods beyond the named inventory.

## 2. Required actual runtime pipeline
```
Selected reading mode + question + profile(s) + chart frame
  -> authoritative chart calculators and existing engines (UNCHANGED)
  -> run all applicable available deterministic method computations
  -> complete normalized evidence packet with per-technique coverage
  -> existing Master Interpreter: grounded doctrine-level propositions
  -> NEW Master Synthesizer: group, weigh, compare, reconcile, compose
  -> validation: evidence lineage, mode rules, coverage, factual integrity
  -> unified narrative + collapsed complete calculation/evidence annex
```
Question-aware prioritization happens **after** comprehensive evaluation, not instead of it. If a computation is unavailable, mark it unavailable and continue with truthfully supported results.

## 3. Implement typed, testable modules
Suggested modules (adjust naming to existing conventions):
- `server/astrologyKnowledge/synthesis/types.ts`: `MethodExecutionStatus`, `SynthesisInput`, `InterpretedProposition`, `ThemeCluster`, `EvidenceLink`, `SynthesisResult`, `SynthesisValidation`.
- `coverage.ts`: individual technique ledger; separate executed-with-results, executed-without-results, not-applicable, unavailable, failed, reference-only.
- `normalize.ts`: translate existing evidence into propositions preserving unique evidence IDs, original frames, sources, degrees/orbs, time windows, and interpretation text.
- `cluster.ts`: semantic theme grouping by human realities, NOT tradition labels.
- `reconcile.ts`: agreement, independent corroboration, duplicates, opposition, frame/mode differences and unresolved conflict.
- `prioritize.ts`: salience by existing computed strength, chart prominence, active timing, question relevance and independent evidence. Never introduce arbitrary pseudo-precision.
- `compose.ts`: produce long-form coherent prose; if LLM used, require structured input/output, bounded length, evidence references and validated response.
- `validate.ts`: check provenance, exact chart facts, unsupported assertions, method coverage, narrative completeness, no hallucinated timing.
- `index.ts`: stable, feature-flagged entry point; fallback to existing interpreter on synthesis failure.

These are module boundaries, not an instruction to duplicate existing logic. Reuse existing evidence types and utilities where possible. No expensive second calculation pass when results already exist.

## 4. Every computed layer must be considered
Read **all twelve houses**, all supplied bodies, nodes, Asc/Desc/MC/IC, rulers, dispositors, signs/degrees, retrogradation, aspects and orbs, dignities, strengths, sect, fixed stars, decans, activated mansions, God/Agent frames, natal/transit and timing. Read all available method families: Western/Hellenistic/medieval; Vedic/Jyotish (D1/D9 and other computed vargas, Dashas, Yogas, Graha/Rashi Drishti, Shadbala/Bhava Bala, Ashtakavarga); Arabic/Persian (Manazil, Lots, receptions/perfection/translation/collection, planetary periods); Chinese 28 Xiu and Four Symbols; Babylonian stellar context; Egyptian/Hermetic; Kabbalah/Sefer Yetzirah; Genesis Astro, Pattern, Yoga, behavioral, life-event, human-reality and power-model layers.

**Mandatory:** The companion complete-doctrine-coverage document names specific techniques and activation rules. Inventory and review all of them. A technique can be reference-only or inapplicable; never fake an output. All houses matter, even when not emphasized in the visible narrative. Preserve the user's Elemental Family Decans and mansion occupancy/activation rules.

## 5. How to perform real synthesis (not aggregation)
For each proposed human theme:
1. Gather every relevant proposition from different traditions and chart frames.
2. Identify the shared underlying condition and its *mechanism*: planet/house/strength/relationship/timing.
3. Determine which items are truly independent and which are multiple descriptions of the same calculation. Never double-count one fact.
4. Identify reinforcement, qualifications and conflict. Explicitly separate God View from Agent View; natal predisposition from active transit; one historical school from another.
5. Connect the theme to **observable human domains** (resources, security, autonomy, family, vocation, relationships, choices, obligations, timing, purpose) with grounded examples.
6. Integrate what/why/how/consequence/meaning naturally in flowing paragraphs. Include strengths, constraints, opposing forces, developmental direction and timing when supplied.
7. Attach every material claim to source evidence IDs. Retain less important findings in the complete annex.
8. End with a clear overall conclusion that reconciles the dominant themes and answers the user's question.

**Bad:** “Western says independence. Vedic says discipline. Chinese says strategy. Kabbalah says growth.”

**Good shape:** “The chart's push for independence is concentrated in [actual house/domain], but [actual planet/condition] imposes a demand for structure. [Other independent computed layer] reinforces the same resource/security theme, while [counter-evidence] limits its expression during [verified window]. Together these point to [concrete manifestation and integrated conclusion].” Bracketed placeholders must be populated only from actual evidence.

## 6. Reading-mode requirements
| Mode | Synthesis emphasis | Hard boundary |
|---|---|---|
| Natal | Life structure, strengths, contradictions, repeating patterns, purpose, D1/D9 and relevant house domains | No fabricated biography or timing |
| Transit/Combined | Natal baseline + current activation, changes, intensity, timing, peak/easing | No fabricated date/window |
| Energy Read / Flow Clock | Active aspect mix, orb/intensity, harmony/friction, houses, actual easing times, do/avoid | Preserve original numerical scoring and conjunction rule |
| Horary | Querent/question significators, turned houses, Moon, reception, perfection, obstacles, verdict | Never override specialized horary verdict |
| Zodiac Horary | Each sign as H1; sign-specific significators and testimony | Do not reuse ordinary chart houses incorrectly |
| Synastry | Two separate natal frames, inter-chart aspects, shared strengths and friction, relational dynamics | No profile leakage or invented partner data |
| Guide & Patterns | Canon + Genesis patterns, meaning, recurring themes, evidence and practical manifestations | No generic personality text |
| Life Story | Chronology, provided events, calculated timing correlations and pattern shifts | Never invent historical events |
| Sports/Simulation Lab | Only if deliberately integrated in separate scope | No change to sports engine or betting guarantees |

## 7. Output contract
**Visible:**
- Opening: substantive dominant conclusion, directly answering question.
- Integrated body: several deep, connected themes organized by human domain; show why and how chart layers interact, rather than listing techniques.
- Contradictions: meaningful counter-evidence and explanation.
- Timing: onset, peak, easing only when actual calculations support them.
- Closing: concise, strong core synthesis.
- Accessible, plain language with clear technical evidence when useful; authoritative interpretation without unsupported factual certainty.

**Expandable “How was this calculated?”:**
- Method-by-method status ledger with actual computed result counts, no-results, failures, unavailable/research-only.
- Every chart datum used: planet/sign/degree/house/aspect/orb/strength, God/Agent distinction, mansion activation, timing.
- Doctrine/source provenance and evidence IDs.
- Direct link from each major conclusion to underlying evidence.
- Full low-salience but material findings, unresolved conflicts and missing calculations.
- No private birth data in public share/export or telemetry.

## 8. Quality checks (fail the PR if missing)
**Correctness:** All specific chart assertions map to real evidence IDs; impossible to insert invented longitude, orb, Dasha, mansion, timing or house. All 12 houses and all supplied bodies examined. Feature flag and fallback functional.

**Coverage:** Technique-level execution ledger distinguishes computed, not applicable, missing, failed, reference-only. Audit that methods present in repo are discoverable. Do not equate presence of a Canon file with actual execution.

**Synthesis:** Three independent computed method layers converge in at least one test theme and become one coherent conclusion, not three paragraphs. A conflict fixture preserves contradictory testimony. God/Agent and natal/transit never silently conflated.

**Differentiation:** At least two substantially different fixed natal fixtures produce distinguishable, evidence-specific readings. Re-running same fixture yields stable factual claims. No generic fallback masquerades as full synthesis.

**Depth:** Major themes contain chart condition, causal interpretation, real-life manifestation, consequence, counterweight and meaning. The conclusion genuinely integrates the whole reading, not a summary of disconnected bullet points. Use human review for quality, not solely a word count or keyword checklist.

**Regression:** Existing horary verdicts, Energy Read totals, fixed-star anchor, Equal Houses, mansion activation, API contracts and profile loading remain unchanged. Unit/integration/e2e tests as available. Run `pnpm check`, `pnpm test`, `pnpm build`; report pass/fail and baseline issues honestly.

**Operational:** Record duration and compute/model usage; protect privacy; gracefully handle missing evidence and synthesis errors. Avoid uncontrolled token costs and repeated API calls.

## 9. Required evidence for reviewer
Deliver in PR:
1. Exact changed files and data-flow diagram with actual production call sites.
2. Method execution matrix with implemented vs research-only status and any discovered missing wiring.
3. Real before/after reading from at least two fixed natal fixtures, plus transit, horary and one multi-method convergence/conflict fixture.
4. Machine-readable trace of each major synthesized claim to its evidence IDs.
5. Screenshots of final visible reading and expanded evidence drawer (mobile/desktop).
6. Tests and logs, performance/cost summary, limitations and follow-up tickets.
7. Explicit statement: **No calculation formulas changed**, or list deviations and request approval before proceeding.

## 10. Build sequence / work order for Manus
Phase A: Inventory, trace real endpoints, baseline outputs/tests, identify missing methods.
Phase B: Add typed coverage ledger + evidence/proposition normalization.
Phase C: Add clustering, independent-corroboration analysis, conflict reconciliation and theme prioritization.
Phase D: Compose integrated narrative using Master Interpreter propositions; validate claim-to-evidence lineage.
Phase E: Wire feature-flagged pipeline into real reading endpoints and UI annex without breaking Stitch layout work.
Phase F: Execute mode-specific regression and depth tests; present actual outputs; open PR for review.

**No “done” claim** until the real application generates integrated readings from actual calculations and passes the acceptance checks. A committed document or prompt-only change does not satisfy this task.
