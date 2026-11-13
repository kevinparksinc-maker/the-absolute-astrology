# The Absolute — Production Wiring Inventory

Branch: `integration/absolute-production-wiring`  
Base: `1ef984e` (`origin/main`)  
Repository: `kevinparksinc-maker/firmament-guardian`

## Baseline

- TypeScript: passed after the synthesizer ES-target fix.
- Vitest: 27 files, 135 tests passing.
- Production build: passed.
- Dockerfile: installs `pnpm@10.18.0` with `pnpm install --frozen-lockfile`.
- Health endpoint: `/health`.
- Page routes currently active: `/`, `/sky`, `/horary`, `/zodiac-readings`, `/history`.

## Connected today

- Frontend chart calculation calls `hybrid.calculate`, which delegates to `server/astronomy.ts`.
- The Master Chart endpoint calls `buildUnifiedMasterChart`, which calls the shared chart engine and executes the method ledger.
- Master Synthesis calls the same unified snapshot, then `synthesizeMasterReading` with evidence trace and method coverage.
- Horary calls `openHoraryQuestion` and `horaryFollowUp`, including deterministic traditional evidence and optional LLM interpretation.
- History is protected by account `openId` and persists saved charts/readings through Drizzle tables.
- Anthropic is selected server-side when `ANTHROPIC_API_KEY` is present; the key is never sent to the browser.
- `system.providerStatus` now reports the selected provider, configured state, retry count, and timeout without exposing credentials.
- `/manus-routes.json` now declares all active page routes for platform discovery.

## Wiring defects found and corrected

1. The Master Chart builder previously replaced a requested transit observer with the natal location. It now preserves transit location, coordinates, timezone, and worldview through the router, snapshot ID, and astronomy engine.
2. Master Chart snapshot metadata previously claimed a hybrid/tropical/Polaris frame. It now declares the Aldebaran-anchored Babylonian stellar frame, Swiss mode 14, fixed user frame, and topocentric Equal House.
3. God View metadata previously claimed Polaris as the center. It now describes the fixed Aries 1–Pisces 12 frame and does not mark Polaris as the anchor.
4. The synthesizer now uses ES-compatible `Array.from` for `Set` iteration and emits the required explicit celestial-configuration conclusion.
5. The active astronomy engine now sets Swiss Ephemeris `SE_SIDM_ALDEBARAN_15TAU` and `SEFLG_SIDEREAL` for planetary, node, and Equal House calculations; canonical geocentric longitudes remain the shared values and only the Moon receives topocentric correction.
6. Active interpreter and Horary explanatory prompts now describe the Aldebaran stellar frame instead of the retired tropical/Polaris model.

## Remaining integration work

- Audit and migrate all active downstream doctrine prompts and UI copy that still say tropical or Polaris.
- Migrate the remaining doctrine submodules whose internal labels still say `firmament-fixed-tropical` so their evidence metadata matches the active mode-14 engine while preserving explicitly requested classical Lahiri/Raman variants.
- Add user-visible AI state on reading and Horary panels: completed, deterministic fallback, or unavailable. The server-side non-sensitive provider diagnostic is now available.
- Bring the approved Stitch/profile route components into the current app without replacing the canonical engine or the evidence-led Master Synthesizer.
- Add integration coverage for provider failure status, route interaction, profile persistence across restart, and Docker health.
