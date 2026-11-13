# Finding-specific judgments and synthesis correction — 2026-11-06

This report supersedes the interpretation-completeness claims in `method-implementation-completion-2026-11-06.md`. The earlier implementation preserved raw records, but generic count sentences and serialized findings could still stand in for traditional judgments. This change removes that path.

## What changed

`methodRules.ts` executes method-specific rule applications against actual finding values. `methodOutcomes.ts` requires evidence-linked finding judgments. The normalizer and synthesizer consume those judgments, rather than raw snapshot propositions or the first four method summaries. Invalid or uncovered findings fail the reading gate. Existing chart-specific relational and condition producers remain attached as judged modifiers in their owning methods.

Natal and independent event frameworks retain separate scopes and their God/Agent/shared frames. Timing has structured active lords and dates. BAV/SAV judgments require matrix checksums. Natal Genesis evaluates natal strength, geometry and houses directly instead of copying natal planets into fake transits. Elemental decans use their elemental sub-sign and ruler, not Chaldean face prose. The automatic sunrise selector handles UTC/civil-day boundaries without relaxing anchor validation.

The interpreter packet retains every method judgment, evidence ID, scope and source reference. Repeated sentences and sources are interned losslessly; raw findings remain in the API audit ledger. Browser reading cache identity is version 9.

## Worked runtime example

Birth: Dallas, 1986-11-20 10:06 America/Chicago. Event: Las Vegas, 2026-11-06 11:06 America/Los_Angeles. The example runs the production reading bridge and its publication audit, without an AI provider.

| Method | Base outcome | Independent event outcome |
|---|---|---|
| western-planets-and-signs | interpreted (22 judgments) | interpreted (19 judgments) |
| western-houses-and-angles | interpreted (17 judgments) | interpreted (16 judgments) |
| western-aspects-and-orbs | interpreted (13 judgments) | interpreted (17 judgments) |
| western-essential-dignities | interpreted (10 judgments) | interpreted (10 judgments) |
| fixed-stars-royal-watchers | interpreted (32 judgments) | interpreted (32 judgments) |
| arabic-hermetic-lots | interpreted (8 judgments) | interpreted (8 judgments) |
| arabic-lunar-manazil | interpreted (14 judgments) | interpreted (14 judgments) |
| vedic-nakshatras-and-padas | interpreted (14 judgments) | interpreted (14 judgments) |
| vedic-vargas-divisional | interpreted (60 judgments) | interpreted (60 judgments) |
| vedic-dasha-and-ashtakavarga | interpreted (15 judgments) | interpreted (15 judgments) |
| vedic-graha-drishti | interpreted (13 judgments) | interpreted (13 judgments) |
| chinese-lunar-mansions-xiu | reference-only (0 judgments) | reference-only (0 judgments) |
| elemental-decans | interpreted (14 judgments) | interpreted (14 judgments) |
| kabbalah-sefer-yetzirah | interpreted (21 judgments) | interpreted (21 judgments) |
| genesis-behavioral-patterns | interpreted (10 judgments) | interpreted (9 judgments) |
| transit-activation-layer | interpreted (70 judgments) | not-applicable (0 judgments) |

The base transit-activation layer compares the two skies. The independent event registry does not compare the event against itself. For a pure natal request the base activation layer is not applicable.

The synthesis audit passed with no unsupported claims and grounded ratio 1. This is evidence-link coverage under the configured code; it is not independent historical verification or a predictive accuracy score. The lossless model packet for this example is 382901 characters.

### Actual applied judgments

**arabic-hermetic-lots**

The primary Lunar Lot of the body, health, material circumstances, livelihood, and what happens to the native through the environment rather than pure willpower. Here Lot of Fortune (Pars Fortunae / Tyche) falls in Virgo, House 8: Shared finances, debt, taxes, inheritance, and the partner's resources. Its lord Mercury delivers these matters through House 10: Vocation, career, public reputation, authority, leadership, and visible contribution. Mercury is hosted by Mars in Scorpio. This four-condition subset gives it no special essential status; house placement and the host's condition determine delivery. This is not a full Shadbala or complete essential-dignity score. This links the Lot's specific topic to the lord's circumstances rather than making all Lots equivalent.

**vedic-dasha-and-ashtakavarga**

Mahadasha Venus, 2012-11-27–2032-11-27, activates Attraction, affection, reciprocity, harmony, beauty, and felt value through House 10: Vocation, career, public reputation, authority, leadership, and visible contribution, with rulership over houses 5 (Creative self-expression, children, romance, courtship, play, joy, and risk-taking); 10 (Vocation, career, public reputation, authority, leadership, and visible contribution). Venus is in detriment in Scorpio; Attraction, affection, reciprocity, harmony, beauty, and felt value must work through Mars's priorities rather than its own. This is the governing period theme.

**transit:elemental-decans**

Sun's Conscious vitality, central purpose, and coherent selfhood is refined by Scorpio decan 2: Pisces / Jupiter: The second ten-degree sector of Scorpio takes the Pisces member of its elemental family. Compassion, synthesis of whole-life patterns, intuitive depth, and maintaining clear boundaries so empathy does not become self-loss. Its ruler Jupiter brings Wisdom, coherence, generosity, faith, law, mentorship, and expansion. The elemental-family ruler Jupiter is at Leo 27°31′, House 8: Shared finances, debt, taxes, inheritance, and the partner's resources. Jupiter is hosted by Sun in Leo. This four-condition subset gives it no special essential status; house placement and the host's condition determine delivery. This is not a full Shadbala or complete essential-dignity score. Its condition modifies how this decan's Scorpio decan 2: Pisces / Jupiter can be delivered.

**genesis-behavioral-patterns**

4 planets concentrated in Scorpio The engine detects Stellium in Scorpio among Sun, Mercury, Venus, Pluto in signs Scorpio and houses 11, 10, with recorded strength 0.800. Sun contributes Conscious vitality, central purpose, and coherent selfhood; Mercury contributes Cognition, language, discernment, logic, interpretation, and naming; Venus contributes Attraction, affection, reciprocity, harmony, beauty, and felt value; Pluto contributes Deep psychological excavation, intensity, power dynamics, survival instincts, and regeneration. House 11: Alliances, friends, communities, networks, patrons, and shared aspirations; House 10: Vocation, career, public reputation, authority, leadership, and visible contribution. These participants make this pattern's operation specific to this chart.

## Validation

- Full suite: 54 files, 287 tests passed.
- TypeScript: passed.
- Production build: passed.
- Regressions change aspect polarity, dignity, Lot ruler/house, D9 conditions, Dasha lords, valid BAV/SAV support, Drishti offsets, mansion/decan findings, Sefer sign gates and Genesis strength.
- An unchanged raw snapshot with altered method judgments changes final themes, proving actual judgment consumption.
- Failed method judgments cannot leak raw findings into themes or the model packet.
- Every packed judgment round-trips exactly; no finding is dropped for prompt-size reduction.
- Natal Genesis remains stable while the separate event instant changes.
- Equivalent Tokyo UTC/local instants select the same sunrise Ascendant.

## Explicit scope and source limits

- Chinese historical Xiu remains reference-only; the custom Firmament overlay is separately identified. This work does not invent missing ancient boundary measurements.
- Twenty catalog fixed-star entries have no source-verified individual doctrine. Their contacts are geometry only, flagged in finding limitations; source-backed entries receive their specific existing Canon teachings. A method-level interpreted status does not certify every catalog star as traditionally sourced.
- Dignity uses the stated four-condition subset. It is not complete essential dignity, Shadbala or Bhava Bala.
- Vargas use the implemented D1/D2/D3/D9/D10 formulas in the custom Firmament coordinate variant. Event-origin Dasha/divisional outcomes describe the event model, never a natal biography.
- SAV support uses an explicitly identified chart-relative comparison against 337/12, not a probability or a newly sourced ancient threshold.
- Existing configured Yoga detection currently implements Hamsa. Other Yoga families remain outside this implementation.
- Sefer Yetzirah uses the supplied Westcott attribution variant. Collective contrary pairs are not invented as individual planet pairs.
- No hosted AI-provider request, Render deployment, or mobile-session output is certified by these local checks. GitHub workflow status is reported separately after publication.
