# Genesis → Firmament Astro Engine Migration Matrix

This is a **migration/recovery**, not a replacement. Firmament remains canonical for ephemeris, coordinates, worldview frames, houses, overlays, and multi-tradition convergence. Genesis intelligence is consolidated into the Firmament reading pipeline as deterministic evidence.

| Genesis capability | Genesis behavior | Firmament canonical destination | Current migration status | Question-planner / interpreter path |
|---|---|---|---|---|
| Astrology vocabulary | Sign order, glyphs, rulers, exaltation/debilitation, priority | `server/astrologyKnowledge/registry.ts` plus Genesis Astro Engine constants | Active; Genesis tables preserved for Genesis scoring | `astro-engine`, `dignity` |
| House meanings | Twelve house topic descriptions | Firmament house rows and Genesis Astro Engine house topics | Active; Firmament houses supply coordinates | Relevant house subjects from planner |
| Planet meanings | Mind/Soul/Spirit meanings for Sun through Ketu | Genesis Astro Engine pillar scoring, emitted as evidence | Active | `mind-soul-spirit`; prioritized for emotional, relationship, career, and identity questions |
| Normalized placements | Degree, sign, house, longitude, natal/transit kind | Adapter from `ChartResult.movingBodies` and `ChartResult.transits` | Active; Firmament supplies chart truth | Always available to downstream stages |
| Conditions | Retrograde, combustion, cazimi | Firmament chart row condition adapter; Genesis scoring consumes them | Active where calculated; unsupported values remain explicit rather than invented | `dignity`, `astro-engine` |
| Aspects | Conjunction, opposition, trine, square, sextile, quincunx with configurable orbs | Original Genesis Pattern Engine plus Firmament five-degree cross-system detector | Active; both are retained and source-traced | `aspects`, `pattern-recognition` |
| Transit activation | Transit-to-natal contact, orb, strength, priority, summary | Original Genesis Astro Engine and Pattern Engine over Firmament transits | Active | `transits`, `astro-engine`, timing questions |
| Sade Sati | Saturn before/over/after natal Moon | Original Genesis Astro Engine | Active | Emotional, timing, Moon, Saturn questions |
| Moon phase | Sun/Moon angular phase classification | Original Genesis Astro Engine | Active | Emotional and timing questions |
| Mind/Soul/Spirit | Mercury+Moon; Moon+Venus; Sun+Jupiter with modifiers | Original Genesis Astro Engine `runAstroReading`, formatted into packet evidence | Active and protected as Genesis doctrine | `mind-soul-spirit` |
| Planetary strength | Essential and accidental dignity, angularity, retrograde modifier | Original Genesis Pattern Engine plus Firmament dignity evidence | Active; results remain separately traceable | `dignity`, `planetary-strength` |
| Classic patterns | Stellium, Grand Trine, T-Square and related configurations | Original Genesis Pattern Engine plus Firmament Genesis adapter | Active | `pattern-recognition`, relationship/career/emotional signals |
| Archetypes | Saturn Heavy, Jupiter Heavy, Pluto Heavy, passion, stellium, house emphasis, etc. | Pattern evidence in `AstrologyEvidencePacket` | Active | `archetype`, domain-specific subjects |
| Signatures | High-level deterministic chart summaries | Pattern evidence and readable formatter | Active | `signature`, Master Interpreter context |
| Vedic Yoga Detector | Hamsa Yoga / Pancha Mahapurusha entry point | Genesis Yoga Detector invoked during packet generation | Active | `vedic-yoga`, Vedic questions |
| Pattern evidence | Human-readable testimony with source trace | `AstrologyEvidencePacket` → resolver → Master Interpreter | Active | Question plan controls prioritization metadata; no generic LLM substitute |

## Precedence rules

1. **Firmament chart calculations are canonical** for the chart input, longitude, houses, worldview frames, overlays, and transit rows.
2. **Genesis rules are preserved** unless they directly conflict with a newer Firmament doctrine.
3. Conflicting outputs remain separately attributed and are resolved by the evidence relationship layer; they are not silently merged.
4. The Master Interpreter receives calculated evidence and source traces, not raw Genesis code and not an ungrounded prose replacement.
5. Missing capabilities are reported as incomplete; the pipeline never fabricates unavailable condition data.
