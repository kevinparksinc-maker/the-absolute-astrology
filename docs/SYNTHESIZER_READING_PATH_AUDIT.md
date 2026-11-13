# Unified Synthesizer — reading-path and doctrine audit

## Enforced in this change

- `interpretation.generate`: builds the canonical Unified Master Chart, validates each natal planet against the chart being read, synthesizes all computed method records, and injects that evidence into the reading plan and generated narrative. Returns the structured synthesis alongside the reading.
- `interpretation.chapter`: independently builds the same method ledger and injects it into the chapter prompt. The previously returned `intelligence` alone was insufficient: the chapter code ignored it.
- `interpretation.followUp`: injects the complete synthesis into the follow-up chart intelligence.
- `interpretation.host`: injects the synthesis for chart-grounded Host conversations. Chartless general questions cannot claim calculated doctrine coverage.
- `interpretation.masterSynthesize`: remains the direct structured synthesis API.
- `lifeStory.generateChapter`: now supplies the same canonical method findings to the Life Story chapter generator.
- Every `computed-with-result` layer produces individual method propositions; reference-only, failed, and not-applicable layers are not promoted to findings. Evidence coverage is measured in linked themes, not ledger bookkeeping.

## Existing 16-layer ledger — coverage is not proof of doctrinal completeness

The registered ledger currently includes planets/signs, equal houses/angles, major aspects, essential dignities, fixed stars, Hermetic lots, Arabic Manazil, Vedic Nakshatras, Vargas, Dasha/Ashtakavarga, Graha Drishti, Chinese Xiu, elemental decans, Sefer Yetzirah, Genesis patterns and transit activation. Chinese Xiu is reference-only; the synthesis must not pretend its historical unequal-sector calculations exist.

## Still separate or incomplete — do not call all readings unified yet

- `horary.open` and `horary.followUp`: now attach canonical question-moment method evidence alongside the specialized significator and traditional judgment. The latter remains the authoritative Horary verdict.
- `zodiacHorary.read`: sign-as-Agent-H1 special chart; not yet adapted.
- `social.systemIntersect`, Life Story cycle/audit APIs, Energy Read, Simulation Lab, and standalone `ai.*` endpoints: independent engines or text-only inputs; they are not yet guaranteed to consume the same complete method ledger.
- Full Shadbala, Bhava Bala, Rasi Drishti, Yoga, planetary war, receptions, translation/collection of light, and activated lunar-mansion aspect engines must be separately audited and registered with actual calculation records before any completeness claim.
- God/Agent chart consistency, sunrise-anchor provenance, the interpretation prompt token budget, and live Render/Android behavior still need end-to-end verification.

## Release acceptance gates

1. Every calculated doctrine appears in the method ledger with status, raw result, source, frame and evidence IDs.
2. Every computed result is linked to an interpreted theme; uncomputed doctrines are clearly identified.
3. Every reading endpoint is either connected to the canonical synthesis or explicitly marked as a separate non-unified engine.
4. AI output must not invent calculations or treat reference-only methods as computed.
5. Unit tests, typecheck, build, Docker and security checks pass; then verify the actual rendered screens and endpoint responses.
\n## Synastry-specific audit findings\n\n`social.systemIntersect` now returns two independently calculated natal synthesis ledgers alongside its existing cross-chart analysis. These are NOT yet a unified cross-chart doctrine interpretation. The legacy synastry engine uses a starting harmony score of 65, fallback fabricated 2.1° orb when no connection exists, and canned transit pressure/windows. These must be replaced with measured cross-chart aspect evidence and actual transit calculations before claiming accurate relationship scoring.\n