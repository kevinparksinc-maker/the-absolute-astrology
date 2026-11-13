# Homepage placement synthesis audit — Babylonian development branch

Branch: `feature/babylonian-fixed-frame-app-validation`  
Audited source commit: `bc8b54a`  
Scope: read-only source tracing and deterministic execution. No provider request, production deployment, engine rewrite or UI behavior change.

## Finding

The homepage never requests a synthesized placement interpretation. Its displayed text is constructed in React from chart positions and static templates. The deeper evidence is not being replaced by a fallback at this point: the homepage bypasses that interpretation path entirely.

## Actual homepage path

1. `client/src/pages/Home.tsx` calls `trpc.hybrid.calculate` and passes its `result` to `ProfileHomeScreen`.
2. `server/routers.ts` → `hybrid.calculate` → `server/astronomy.ts::calculateChart`.
3. `ProfileHomeScreen.tsx` selects Sun/Moon/Ascendant rows, shows sign and a caption, and expands longitude/house with another fixed caption. There is no interpretation API call in this component.
4. `PersonalDiscoveryCarousel.tsx` builds its placement, mansion and decan teasers from string templates and `planetThemes`. Expanding a card repeats the teaser and displays position/overlay facts. It does not retrieve method interpretations or call an AI.
5. `PersonalCosmicForecast.tsx` computes a local contact summary and selects preset climate text. That is another homepage output path, separate from placement synthesis.

## Existing deeper path — not connected to those cards

`interpretation.generate` → `generateInterpretation` → `buildAstrologyEvidencePacket` → Western/Vedic/Arabic resolvers, Genesis engines, behavior/life-event engines, Canon dossier, Sefer Yetzirah and relationship resolution → `analyzeChart` → `generateLifeStoryReading` → `invokeLLM`.

This route requests a chapter-based life-story narrative. It is not a one/two-paragraph placement-card route. On provider failure it returns `buildLifeStoryExecutiveOverview`; this is a real fallback and needs to remain distinguishable from a completed AI synthesis.

## Runtime method-family inventory

The branch has **12 existing coverage families** and **20 rule records marked implemented**. These are different counts, not an independently executed 16-method Master Chart ledger. Several families overlap: lunar evidence repeats Nakshatra/Manzil evidence from Vedic/Arabic families. Evidence-record counts must not be added and described as independent methods.

All families below are absent from the homepage interpretation request because no such request exists. Counts are from the deterministic natal probe, not proof that every possible subtechnique is complete.

| Existing family ID | Returned status | Evidence records | Techniques returned |
|---|---|---:|---|
| `western` | evidence-supplied | 51 | aspects, calculation, dignity |
| `genesisAstro` | evidence-supplied | 4 | astro-pillar, vedic-yoga |
| `genesisPattern` | evidence-supplied | 75 | archetype, pattern-archetype, pattern-aspect, pattern-configuration, pattern-recognition, signature |
| `behavior` | evidence-supplied | 15 | behavioral-pattern, behavioral-polarity, interaction-matrix |
| `lifeEvents` | evidence-supplied | 7 | event-sequence-chain, life-event-signature |
| `canon` | evidence-supplied | 78 | applying-aspect, canon-placement-dossier, chinese-28-xiu, firdaria-and-almuten, jyotish-bhava-classifications, mutual-reception, planet-in-house-interpretation, refranation, relational-house-chain, retrograde-condition, separating-aspect, shani-lordship-sade-sati-dhaiya, under-the-beams |
| `kabbalah` | evidence-supplied | 20 | four-worlds, sefer-yetzirah-doubles, sefer-yetzirah-framework, sefer-yetzirah-mothers, sefer-yetzirah-simples |
| `vedic` | evidence-supplied | 89 | ashtakavarga, dasha, drishti, house-lord, nakshatra, varga |
| `arabic` | evidence-supplied | 31 | lots, manzil, planetary-hours, sect, twelfth-parts |
| `lunar` | evidence-supplied | 26 | manzil, nakshatra |
| `fixedStars` | evidence-supplied | 51 | fixed-star-aspects, fixed-star-position-and-meaning |
| `timing` | no-result-supplied | 0 | None |

## Proposed adapter inventory mapped to existing code

These are integration responsibilities from the requested design, not a second method registry. A placement owner should import the existing registry/coverage definitions and adapt existing engines.

| Adapter responsibility | Existing implementation to reuse | Present limitation |
|---|---|---|
| Western | `astrologyKnowledge/western/index.ts` | Homepage never calls its evidence path |
| Vedic | `astrologyKnowledge/vedic/index.ts` | Multiple techniques grouped under one family; individual statuses needed |
| Arabic/Hermetic | `astrologyKnowledge/arabic/index.ts` | Individual method applicability and lineage needed |
| Nakshatra/Pada | Vedic resolver and `canon/nakshatras27.ts` | Homepage shows a name/pada, not the applied judgment |
| Manzil | Arabic resolver and `canon/manazil28.ts` | Homepage shows classification, not the applied judgment |
| Decan | `canon/decans36.ts` and placement dossier | Must preserve the configured elemental-family doctrine |
| Lots | `utils/arabicLots.ts`, Arabic resolver, Canon dossier | Must retain each actual formula, sect and outcome |
| Sect/dignity | Western/Arabic resolvers and `canon/dignitiesAndHorary.ts` | Basic conditions are not a complete strength score |
| Fixed stars | Evidence-packet stellar catalog/contact calculations and Canon | Historical catalog records are not automatically personal activations |
| Genesis | `patterns/genesisEngine.ts`, `genesisBackup/adapter.ts` | Evidence producers have hard row caps (below) |
| Behavioral | `astrologyKnowledge/behavioral/engine.ts` | Must carry actual supporting/counter evidence into the card |
| Life events | Behavioral/life-event evidence and sequence chains | Must distinguish natal indications from observed biography |
| Kabbalah | `canon/seferYetzirah.ts` | Exact recension/correspondence provenance must survive synthesis |
| God/Agent | Chart row dual placements and relationship resolution | Must retain the two frames rather than collapse house meanings |
| Aspects | Western/Genesis resolvers | Preserve every executed result and orb, not an arbitrary top-N list |
| Transits/timing | Timing evidence plus Vedic/Arabic timing modules | Pure natal timing family returned no records; that is not a failed transit engine |

## Completeness gaps before implementation

- `methodCoverage.ts` currently gives a family only `evidence-supplied` or `no-result-supplied`. It cannot distinguish a failed calculation, unavailable inputs, reference-only doctrine and genuine not-applicability.
- `evidencePacket.ts` caps Genesis Astro activations with `.slice(0, 18)` and original Pattern aspects with `.slice(0, 60)`. Those omitted records cannot be recovered by a later prompt.
- There is no placement-specific result/contribution contract and no test proving every registered method family returns a status to a homepage card.
- There is no final paragraph-to-method contribution audit for homepage cards. A method name or a separate evidence appendix does not establish that the short reading used the method.
- Chinese Xiu historical catalog evidence is present, while personally assigned historical unequal boundaries are explicitly pending. Do not turn reference material into a calculated natal mansion.
- Shadbala and Bhava Bala doctrine definitions are present in `canon/vedicJyotishCanon.ts`; no numerical `calculateShadbala`/`calculateBhavaBala`/Virupa-total engine was found in this branch audit. They must not be labeled numerically computed merely because the doctrine exists.
- External Tvam, Canopy and Astrology-API sources are reference-only in the runtime inventory, not configured data providers.

## Sun acceptance case — branch baseline does not match the requested fixture

Input: the existing Dallas fixture, 1986-11-20 10:06 America/Chicago, natal, Agent/God combined frame.

The branch actually computes **Sun Scorpio 03°28′ in House 11**, with Ascendant **Sagittarius 29°30′**. It does not compute Sun 25° Scorpio. This probe used the branch engine directly; no placement was overwritten to fit the expected case.

The branch uses `REFERENCE_FRAME = firmament-aldebaran-15-taurus`, and its local angle calculation uses `calculateZeroTiltAscendant(canonicalLocalSiderealAngle(...))`. It is not the newer sunrise/XYZ chart-entry implementation on main. The accepted coordinate baseline must be reconciled inside the development branch before a Sun-at-25° acceptance result can be claimed.

## Controlled next implementation

1. Keep all behavior changes on this existing branch. Do not create another registry or copy engines into competing folders.
2. Establish the authoritative coordinate baseline for the acceptance chart.
3. Add one placement orchestration owner importing the existing engines and registry. Every configured method/submethod must return included, no-result, not-applicable, reference-only, incomplete or failed with a reason and source trace.
4. Construct the Sun packet with actual outputs, convergences, contradictions, qualifications and provenance from every registered responsibility. No hard top-N deletion.
5. Process the complete knowledge before generating one or two plain narrative paragraphs. Use transport chunking when necessary, preserve exact lineage, and require every applicable method to map to meaning in the visible paragraphs.
6. Test omissions, invalid lineage, method-result changes and the real Sun fixture. Keep raw packet, method audit and generated reading reviewable.
7. Connect only the Sun homepage acceptance card first. Expand after that case passes.

## Preservation / safety of the audit

The unfinished newer complete-synthesis edits were stashed before switching branches (`preserve complete-placement work before Babylonian homepage audit`). They were not applied to this branch, main, or production. This report is the only change made after the branch switch.
