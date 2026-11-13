# Bible Believers Astrology-Only Final Validation Report

Validation date: 2026-10-03

## Scope

Validated the astrology-only source tree, excluding the separate `simulation-lab` sports-prediction project. The pass covered:

- Natal chart calculations.
- Transit-only calculations.
- Combined natal + transit calculations.
- Agent View.
- God View.
- God's View of the Agent.
- Date-only God Natal behavior and Moon uncertainty.
- Horary without a natal profile.
- Horary with a natal profile.
- Fixed-star and overlay fields.
- Nodes, angles, houses, transit contacts, and relationship metadata.
- Main chart and Horary browser routes.
- TypeScript, tests, build, health endpoint, and route manifest.

## Results

| Check | Result |
|---|---|
| TypeScript (`pnpm check`) | Passed |
| Full Vitest suite | **12 test files, 47 tests passed** |
| New aspect/Horary regression suite | 3 tests passed |
| God/Agent relationship suite | 5 tests passed |
| Production build (`pnpm build`) | Passed |
| Health endpoint | HTTP 200, `{"ok":true}` |
| Route manifest | HTTP 200, valid JSON, 4 declared routes |
| Home page browser load | Passed |
| Home page example chart calculation | Passed |
| Home page browser console | No console output/errors |
| Horary page browser load | Passed |
| Horary page browser console | No console output/errors |
| Simulation lab presence | Confirmed absent from astrology-only source |

## Engine smoke matrix

A temporary end-to-end smoke script validated the returned contracts directly:

- Agent Natal: passed.
- Agent Transit: passed.
- God's View of the Agent / Combined: passed.
- God Natal date-only: passed.
- God Transit: passed.
- Horary without natal profile: passed.
- Horary with natal profile: passed.

The smoke assertions checked:

- UTC and transit timestamps.
- Worldview and reading scope.
- Exactly 12 houses.
- Moving bodies, frozen stars, and transit rows.
- Longitude finiteness and 0°–360° range.
- Display strings and Nakshatra, Manzil, and Decan overlays.
- God House and Agent House ranges.
- God/Agent relationship metadata.
- North and South Node presence.
- Transit contact names, aspects, and 3° orb bounds.
- God Natal absence of personal Ascendant and Agent View.
- Date-only Moon uncertainty.
- Canonical geocentric longitude shared across house frames, with optional topocentric lunar longitude.
- Transit-location validation, explicit moment precision, and explicit transit house-frame metadata.
- Horary no-natal empty contact arrays and correct evidence wording.
- Horary natal preservation of natal comparison evidence.

Observed smoke counts:

- 10 natal moving bodies.
- 12 transit rows.
- 10 frozen-star rows.
- 23 combined-chart transit contacts.
- 26 Horary-with-natal transit contacts.

## Browser verification

The live home page successfully rendered the built-in Dallas example chart, including:

- Reference verified status.
- Agent View with geocentric planetary positions, optional topocentric lunar correction, and Equal House labeling.
- Natal positions and angles.
- Transit positions and natal aspect contacts.
- Chart wheel.
- God's View of the Agent relationship panel.
- Detailed placement controls.

The Horary route rendered its question form, topic-house selector, location controls, optional natal layer, date/time fields, and cast button without browser errors.

## Findings and disposition

The final pass found and corrected one God View presentation/contract issue. The live God View feed was receiving natal-contact comparisons even though its request had no natal profile and God View has no personal houses. The engine now returns empty natal contacts for God View, and the feed presents current geocentric positions and God Houses for the key live bodies instead of showing misleading “conjunction natal” entries. The live Sky Home browser check confirmed the corrected output.

Two non-issues were encountered during validation:

1. The first temporary smoke-script invocation used a `.ts` file outside the package and hit a `tsx` top-level-await module-mode error. Running the same script as an ESM `.mts` module passed all assertions. This was a test-runner invocation issue, not an application defect.
2. A broad text scan matched ordinary astrology disclaimer language such as “prediction” and package-lock integrity strings. It did not find sports-specific code in the astrology-only source. The `simulation-lab` directory is absent as intended.

## Conclusion

The astrology-only engine, aspect-wraparound fix, Horary no-natal fix, and God View live-feed cleanup are passing the full available validation matrix.
