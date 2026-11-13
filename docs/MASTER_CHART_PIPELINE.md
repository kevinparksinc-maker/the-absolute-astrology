# Shared chart production and reading pipeline

Every public chart producer uses `server/masterChart/entry.ts`:

1. `buildUnifiedMasterChart` calculates the authoritative astronomical state, sunrise Ascendant and Equal Houses.
2. `registry.ts` requires the same 18 method IDs for every sky. A missing or unregistered adapter is an error. Each method retains its actual results, sources, evidence IDs and execution status.
3. A combined/transit snapshot includes an independent event framework calculated at the exact event instant and resolved horizon. It evaluates the same registry. Natal and event mansions, decans, star contacts, conditions, divisional data and other methods are separate.
4. `synthesizeMasterSnapshot` retrieves both skies' Canon dossiers, binds the actual teachings to calculated evidence, and applies executable finding-specific rules in `synthesis/methodRules.ts`. Structured `findingJudgments` are produced before synthesis. The normalizer consumes those judgments; raw JSON is audit data and cannot become a fallback interpretation. Event method/evidence IDs use the `transit:` prefix.
5. Coverage failure blocks chart publication. Successful charts carry `methodBindings`: base results, event results and the synthesis audit. This contract is also attached to sports game snapshots for their adapters.
6. User-facing prose is generated from the verified synthesis. Energy requires citations to actual evidence and explicit use of the available natal/event mansion, decan and fixed-star layers before displaying the reading and score evidence.

## Production callers

- `server/routers.ts`: ordinary chart production and the Master Chart/synthesis endpoints.
- `server/horary.ts`: question, natal and God charts.
- `server/zodiacHorary.ts`: sign-centered sky; its symbolic ruler houses remain a separate lens.
- `server/harmonicForecast.ts`: every sample is recalculated at its selected instant; it does not reuse the source instant or interpolate scores.
- `server/simulationLab/masterGameChart.ts`: sports charts use the same formation; no alternate astronomical engine.
- `server/focusedReading.ts`: placement/contact readers reuse the verified natal/event frameworks rather than casting another event chart with birth anchors.
- `server/master-pipeline.ts`: compatibility entry point delegating to the single verified reading bridge. It has no alternate defaults or calculation path.

The low-level `astronomy.calculateChart` remains the builder's calculation primitive and is used directly by astronomy unit tests. Public producers import `calculateMasterChart`.

## Data and model rules

- No substitute dates, coordinates, timezones, XYZ vectors or sunrise anchors are introduced by the reading gate.
- A location-free God chart has no local Ascendant. Horizon-dependent methods retain explicit not-applicable statuses; fixed-frame placements and applicable longitude methods still run.
- Nodes and available chart angles receive mansion, decan and stellar-contact findings too.
- The transit activation layer consumes the same deduplicated ledger as Energy, including minor aspects, angles and the configured weight formula.
- The existing Chinese overlay identifies its custom Firmament boundary model. The separate ancient Chinese catalog remains reference-only; its unavailable ancient boundaries are not fabricated.
- Shadbala and Bhava Bala are separate registered calculations. The strength engine records all six planetary components, all 12 house totals, component traces, minima/rankings and the explicit fixed-XYZ/Equal-House/calendar/motion variants. Unavailable prerequisites produce an explicit status or error.
- Event-origin cycle/divisional results describe the event model; they must not be presented as someone's birth history or natal lifecycle.

## Avoiding duplicate work

Ordinary reading routes call their gate once, rather than running another gate in both router and service. Exact repeated reading requests share a bounded, short-lived promise cache; failures are evicted. The interpreter packet carries every method and Canon application once, instead of expanding the same records repeatedly inside narrative themes. The model packet losslessly interns repeated sentences and source records, retains every judgment with its evidence and scope, and omits duplicate raw calculation dumps. Saved-reading cache version 9 invalidates older interpretation output.

## Verification

`pnpm check`, `pnpm test`, and `pnpm build` verify types, calculations, source-input preservation, cross-chart separation, Canon lineage, forecast progression, sports bindings and build output. Provider failures remain explicit; mocked-provider tests cannot establish that a hosted AI service is currently available or that a deployment has become live.

## Rule judgments and scope safeguards

- The four-condition dignity adapter evaluates domicile, exaltation, detriment and fall. It does not claim the complete classical dignity score or Shadbala.
- Lot judgments use the actual Lot topic, house, sign lord and that lord's condition and delivery house. Vargas apply the division's topic to its calculated sign, house and condition. Active Dasha periods carry their exact lords and windows; BAV/SAV matrices must pass row/column checksums before relative support is judged.
- Manazil, Nakshatra/Pada, elemental-family decans, fixed stars, Drishti and Sefer Yetzirah have separate handlers. Elemental-family decans use their own sub-sign and ruler, never Chaldean face prose presented as elemental doctrine.
- Natal Genesis uses natal geometry and strength directly, without copying natal planets into a fake transit sky. Independent event Genesis is evaluated separately. Existing configured Yoga detection is retained; absent Yoga families are not invented.
- A rule failure blocks publication. Reference-only catalogs, successful empty results and inapplicable methods remain explicit and excluded from personal interpretation.
- The current fixed-star catalog includes entries without verified star-specific doctrine. Their contacts remain measured geometry with explicit limitations, not fabricated traditional predictions.
- Automatic sunrise selection chooses the latest calculated sunrise preceding the exact event across UTC date boundaries. Caller-supplied anchors retain the existing validity checks.

## Numerical Vedic strength

`server/astrologyKnowledge/vedic/strength.ts` calculates both strength layers. `methodRules.ts` applies each measured capacity to its actual planetary functions, owned houses and delivery house. Bhava judgments include a numerical H5/H11 comparison. The model packet carries these judgments alongside the other methods; My Chart displays the raw component arithmetic and the same judgments before the whole-chart reading. See `vedic-strength-formulas-2026-11-06.md` for formulas, variants, sources and the worked Dallas example.
