# Consolidated Stitch Integration Handoffs

These sections preserve the original branch handoff specifications. The branches provide implementation guidance; they do not themselves contain installed Stitch UI code.

## Home Dashboard (`feature/stitch-home-dashboard`)

### Stitch integration handoff: Home dashboard + desktop observatory

#### Source
Use the user-provided archive `stitch_the_absolute_astrology_redesign.zip` (attached in the ChatGPT conversation). This branch contains a handoff specification, **not** the exported HTML or installed UI. Do not infer that a design is implemented.

Stitch source files:
- `stitch_the_absolute_astrology_redesign/home_dashboard_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/home_observatory_desktop_the_absolute_1/code.html`
- `stitch_the_absolute_astrology_redesign/home_observatory_desktop_the_absolute_2/code.html`

#### React integration targets
- `client/src/components/ProfileHomeScreen.tsx`
- `client/src/pages/Home.tsx`
- `client/src/components/CelestialCommandShell.css`

#### Implementation contract
- Adapt HTML/Tailwind layouts into existing React components; retain props, hooks, routes, event handlers, state, backend API calls, profile context, and loading/error states.
- Do not modify `server/`, astronomy/ephemeris modules, calculation engines, scoring formulas, or API contracts.
- Use real bound chart and energy values, not Stitch sample numbers, fake user data, or placeholder calculations.
- Preserve loaded-profile gating, Harmonic Flow Clock live values, chart data, saved profiles, navigation, and God/Agent displays. Treat Stitch static data as placeholders.
- Keep responsive mobile and desktop layouts, readable text, keyboard focus, semantic labels, and accessible contrast.
- Scope changes to this branch's target and shared UI components; coordinate shared styles with the shared-design-system branch to avoid conflicting edits.

#### Acceptance checklist
- Existing app routes and navigation still work.
- No astrology logic, engine files, or API signatures changed.
- No static Stitch example scores or birth details appear as live user data.
- Mobile and desktop screenshots visually match intended Stitch layout.
- `pnpm check`, `pnpm test`, and `pnpm build` pass (or failures documented).
- Open a PR to `main` for review; **do not auto-merge or deploy** until approved.

---

## Natal Chart (`feature/stitch-natal-chart`)

### Stitch integration handoff: Natal diamond chart

#### Source
Use the user-provided archive `stitch_the_absolute_astrology_redesign.zip` (attached in the ChatGPT conversation). This branch contains a handoff specification, **not** the exported HTML or installed UI. Do not infer that a design is implemented.

Stitch source files:
- `stitch_the_absolute_astrology_redesign/natal_chart_the_absolute/code.html`

#### React integration targets
- `client/src/components/ProfileChartScreen.tsx`
- `client/src/components/DiamondChart.tsx`

#### Implementation contract
- Adapt HTML/Tailwind layouts into existing React components; retain props, hooks, routes, event handlers, state, backend API calls, profile context, and loading/error states.
- Do not modify `server/`, astronomy/ephemeris modules, calculation engines, scoring formulas, or API contracts.
- Use real bound chart and energy values, not Stitch sample numbers, fake user data, or placeholder calculations.
- Preserve existing North Indian diamond geometry, equal-house placements, fixed-star coordinate model, both chart frames, decans and mansions. Never hardcode placements or ayanamsha.
- Keep responsive mobile and desktop layouts, readable text, keyboard focus, semantic labels, and accessible contrast.
- Scope changes to this branch's target and shared UI components; coordinate shared styles with the shared-design-system branch to avoid conflicting edits.

#### Acceptance checklist
- Existing app routes and navigation still work.
- No astrology logic, engine files, or API signatures changed.
- No static Stitch example scores or birth details appear as live user data.
- Mobile and desktop screenshots visually match intended Stitch layout.
- `pnpm check`, `pnpm test`, and `pnpm build` pass (or failures documented).
- Open a PR to `main` for review; **do not auto-merge or deploy** until approved.

---

## Energy Read (`feature/stitch-energy-read`)

### Stitch integration handoff: Energy Read mobile + desktop

#### Source
Use the user-provided archive `stitch_the_absolute_astrology_redesign.zip` (attached in the ChatGPT conversation). This branch contains a handoff specification, **not** the exported HTML or installed UI. Do not infer that a design is implemented.

Stitch source files:
- `stitch_the_absolute_astrology_redesign/energy_read_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/energy_read_desktop_the_absolute/code.html`

#### React integration targets
- `client/src/pages/EnergyPage.tsx`
- `client/src/components/ProfileHomeScreen.tsx`

#### Implementation contract
- Adapt HTML/Tailwind layouts into existing React components; retain props, hooks, routes, event handlers, state, backend API calls, profile context, and loading/error states.
- Do not modify `server/`, astronomy/ephemeris modules, calculation engines, scoring formulas, or API contracts.
- Use real bound chart and energy values, not Stitch sample numbers, fake user data, or placeholder calculations.
- Preserve calculation pipeline and real-time chart bindings; do not replace scores, orb thresholds, aspect classifications, time stepping, or totals with demo numbers. Flag any pre-existing scoring discrepancy separately.
- Keep responsive mobile and desktop layouts, readable text, keyboard focus, semantic labels, and accessible contrast.
- Scope changes to this branch's target and shared UI components; coordinate shared styles with the shared-design-system branch to avoid conflicting edits.

#### Acceptance checklist
- Existing app routes and navigation still work.
- No astrology logic, engine files, or API signatures changed.
- No static Stitch example scores or birth details appear as live user data.
- Mobile and desktop screenshots visually match intended Stitch layout.
- `pnpm check`, `pnpm test`, and `pnpm build` pass (or failures documented).
- Open a PR to `main` for review; **do not auto-merge or deploy** until approved.

---

## Shared Design System (`feature/stitch-shared-design-system`)

### Stitch integration handoff: Shared premium theme and responsive shell

#### Source
Use the user-provided archive `stitch_the_absolute_astrology_redesign.zip` (attached in the ChatGPT conversation). This branch contains a handoff specification, **not** the exported HTML or installed UI. Do not infer that a design is implemented.

Stitch source files:
- `stitch_the_absolute_astrology_redesign/celestial_observatory/DESIGN.md`

#### React integration targets
- `client/src/index.css`
- `client/src/components/CelestialCommandShell.css`
- `client/src/components/CelestialCommandShell.tsx`

#### Implementation contract
- Adapt HTML/Tailwind layouts into existing React components; retain props, hooks, routes, event handlers, state, backend API calls, profile context, and loading/error states.
- Do not modify `server/`, astronomy/ephemeris modules, calculation engines, scoring formulas, or API contracts.
- Use real bound chart and energy values, not Stitch sample numbers, fake user data, or placeholder calculations.
- Translate Stitch tokens, typography, spacing, responsive layout and accessible states to reusable styles; avoid global regressions, remove no features, and never edit server or calculation files.
- Keep responsive mobile and desktop layouts, readable text, keyboard focus, semantic labels, and accessible contrast.
- Scope changes to this branch's target and shared UI components; coordinate shared styles with the shared-design-system branch to avoid conflicting edits.

#### Acceptance checklist
- Existing app routes and navigation still work.
- No astrology logic, engine files, or API signatures changed.
- No static Stitch example scores or birth details appear as live user data.
- Mobile and desktop screenshots visually match intended Stitch layout.
- `pnpm check`, `pnpm test`, and `pnpm build` pass (or failures documented).
- Open a PR to `main` for review; **do not auto-merge or deploy** until approved.

---

## Transit Readings (`feature/stitch-transit-readings`)

### Stitch premium layout integration — Transit Readings

#### Source asset
Use the user-provided updated Stitch archive `stitch_the_absolute_astrology_redesign (1).zip`.
- `stitch_the_absolute_astrology_redesign/transit_readings_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/transit_readings_the_absolute/screen.png`

This branch contains **handoff instructions only**, not the actual Stitch export or completed implementation. Obtain the ZIP from the user before implementing.

#### Integration targets
- `client/src/components/ProfileReadingScreen.tsx`
- `client/src/pages/Home.tsx`

#### Required work
1. Inspect the current route and component hierarchy and map the Stitch layout to existing React components.
2. Transfer only visual structure, typography, styling, responsive behavior and reading presentation. Retain state, hooks, handlers, props, API calls, error/loading states and navigation.
3. Preserve natal/transit/combined reading mode, live transit chart data, timing, house meanings, evidence and interpreter calls. No static Stitch placements or invented dates.
4. Do not edit any `server/` files, ephemeris, Babylonian fixed-star engine, God/Agent frame, houses, scoring formulas or API contracts.
5. Avoid copying Stitch's demonstration chart numbers, personal details or scores into live UI.
6. Use the shared premium design tokens from `feature/stitch-shared-design-system` where compatible; resolve conflicts before merge.

#### Acceptance
- Current workflows remain functional with real data and no missing controls.
- Layout matches Stitch preview at phone and desktop widths.
- `pnpm check`, `pnpm test`, `pnpm build` run successfully or failures are documented.
- Show before/after screenshots and list modified files.
- Open a PR; do not merge to main without review.

---

## Horary Chamber (`feature/stitch-horary-chamber`)

### Stitch premium layout integration — Horary Chamber

#### Source asset
Use the user-provided updated Stitch archive `stitch_the_absolute_astrology_redesign (1).zip`.
- `stitch_the_absolute_astrology_redesign/horary_chamber_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/horary_chamber_the_absolute/screen.png`

This branch contains **handoff instructions only**, not the actual Stitch export or completed implementation. Obtain the ZIP from the user before implementing.

#### Integration targets
- `client/src/pages/HoraryPage.tsx`
- `client/src/components/HoraryChamber2050.css`

#### Required work
1. Inspect the current route and component hierarchy and map the Stitch layout to existing React components.
2. Transfer only visual structure, typography, styling, responsive behavior and reading presentation. Retain state, hooks, handlers, props, API calls, error/loading states and navigation.
3. Preserve question state, significators, verdict derivation, receptions, Moon status, aspect evidence, backend/API calls and current question chart logic. Never replace calculated yes/no verdict with mock text.
4. Do not edit any `server/` files, ephemeris, Babylonian fixed-star engine, God/Agent frame, houses, scoring formulas or API contracts.
5. Avoid copying Stitch's demonstration chart numbers, personal details or scores into live UI.
6. Use the shared premium design tokens from `feature/stitch-shared-design-system` where compatible; resolve conflicts before merge.

#### Acceptance
- Current workflows remain functional with real data and no missing controls.
- Layout matches Stitch preview at phone and desktop widths.
- `pnpm check`, `pnpm test`, `pnpm build` run successfully or failures are documented.
- Show before/after screenshots and list modified files.
- Open a PR; do not merge to main without review.

---

## Synastry Studio (`feature/stitch-synastry-studio`)

### Stitch integration handoff — Synastry Studio

#### Source files
User-provided `stitch_the_absolute_astrology_redesign (3).zip` contains:
- `stitch_the_absolute_astrology_redesign/synastry_studio_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/synastry_studio_the_absolute/screen.png`

**This branch contains instructions only, not imported HTML or completed frontend changes.** Manus / Studio must receive the ZIP separately.

#### Existing React integration targets
- `client/src/pages/SynastryPage.tsx`

#### Implementation requirements
1. Compare Stitch's HTML layout and screenshot to the existing screen, then adapt the design into existing React/TypeScript components. Preserve props, hooks, routing, user actions, accessibility, loading/error states and mobile responsiveness.
2. Retain both profiles, comparison calculations, dual chart data, relationship aspects, and interpretations.
3. Do **not** change `server/`, ephemeris, Babylonian fixed-star frame, God/Agent calculations, Equal Houses, lunar mansion methods, scoring algorithms, or API contracts.
4. Replace all Stitch demonstration scores, charts, names and dates with the existing live data bindings. Never introduce hardcoded predictions or calculations.
5. Coordinate styling with `feature/stitch-shared-design-system`; minimize CSS collisions and maintain visual consistency with other Stitch screens.
6. Run `pnpm check`, `pnpm test`, and `pnpm build`. Document any failures, and provide mobile/desktop before-after screenshots.
7. Create a PR for review; do not merge or deploy without approval.

#### Acceptance
- Every existing feature and control on this page still works.
- Real calculations and profile data remain connected.
- Visual output matches the supplied Stitch preview.
- No engine or backend source files are modified.

---

## Guide & Patterns (`feature/stitch-guide-patterns`)

### Stitch integration handoff — Guide & Patterns

#### Source files
User-provided `stitch_the_absolute_astrology_redesign (3).zip` contains:
- `stitch_the_absolute_astrology_redesign/guide_patterns_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/guide_patterns_the_absolute/screen.png`

**This branch contains instructions only, not imported HTML or completed frontend changes.** Manus / Studio must receive the ZIP separately.

#### Existing React integration targets
- `client/src/components/ProfileGuideScreen.tsx`

#### Implementation requirements
1. Compare Stitch's HTML layout and screenshot to the existing screen, then adapt the design into existing React/TypeScript components. Preserve props, hooks, routing, user actions, accessibility, loading/error states and mobile responsiveness.
2. Retain guide tabs, interpreter evidence, saved profile context, and actual generated readings.
3. Do **not** change `server/`, ephemeris, Babylonian fixed-star frame, God/Agent calculations, Equal Houses, lunar mansion methods, scoring algorithms, or API contracts.
4. Replace all Stitch demonstration scores, charts, names and dates with the existing live data bindings. Never introduce hardcoded predictions or calculations.
5. Coordinate styling with `feature/stitch-shared-design-system`; minimize CSS collisions and maintain visual consistency with other Stitch screens.
6. Run `pnpm check`, `pnpm test`, and `pnpm build`. Document any failures, and provide mobile/desktop before-after screenshots.
7. Create a PR for review; do not merge or deploy without approval.

#### Acceptance
- Every existing feature and control on this page still works.
- Real calculations and profile data remain connected.
- Visual output matches the supplied Stitch preview.
- No engine or backend source files are modified.

---

## Explore / Sky Map (`feature/stitch-explore-sky-map`)

### Stitch integration handoff — Explore / Sky Map

#### Source files
User-provided `stitch_the_absolute_astrology_redesign (3).zip` contains:
- `stitch_the_absolute_astrology_redesign/explore_sky_map_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/explore_sky_map_the_absolute/screen.png`

**This branch contains instructions only, not imported HTML or completed frontend changes.** Manus / Studio must receive the ZIP separately.

#### Existing React integration targets
- `client/src/pages/ExplorePage.tsx`
- `client/src/pages/SkyHomePrototype.tsx`

#### Implementation requirements
1. Compare Stitch's HTML layout and screenshot to the existing screen, then adapt the design into existing React/TypeScript components. Preserve props, hooks, routing, user actions, accessibility, loading/error states and mobile responsiveness.
2. Preserve celestial rendering, God/Agent frame switching, mansion overlays, coordinate engine and all map controls.
3. Do **not** change `server/`, ephemeris, Babylonian fixed-star frame, God/Agent calculations, Equal Houses, lunar mansion methods, scoring algorithms, or API contracts.
4. Replace all Stitch demonstration scores, charts, names and dates with the existing live data bindings. Never introduce hardcoded predictions or calculations.
5. Coordinate styling with `feature/stitch-shared-design-system`; minimize CSS collisions and maintain visual consistency with other Stitch screens.
6. Run `pnpm check`, `pnpm test`, and `pnpm build`. Document any failures, and provide mobile/desktop before-after screenshots.
7. Create a PR for review; do not merge or deploy without approval.

#### Acceptance
- Every existing feature and control on this page still works.
- Real calculations and profile data remain connected.
- Visual output matches the supplied Stitch preview.
- No engine or backend source files are modified.

---

## Life Story (`feature/stitch-life-story`)

### Stitch integration handoff — Life Story Timeline

#### Source files
User-provided `stitch_the_absolute_astrology_redesign (3).zip` contains:
- `stitch_the_absolute_astrology_redesign/life_story_timeline_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/life_story_timeline_the_absolute/screen.png`

**This branch contains instructions only, not imported HTML or completed frontend changes.** Manus / Studio must receive the ZIP separately.

#### Existing React integration targets
- `client/src/pages/LifeStoryPage.tsx`

#### Implementation requirements
1. Compare Stitch's HTML layout and screenshot to the existing screen, then adapt the design into existing React/TypeScript components. Preserve props, hooks, routing, user actions, accessibility, loading/error states and mobile responsiveness.
2. Preserve timeline chronology, profile data, event calculation references and interpretation generation.
3. Do **not** change `server/`, ephemeris, Babylonian fixed-star frame, God/Agent calculations, Equal Houses, lunar mansion methods, scoring algorithms, or API contracts.
4. Replace all Stitch demonstration scores, charts, names and dates with the existing live data bindings. Never introduce hardcoded predictions or calculations.
5. Coordinate styling with `feature/stitch-shared-design-system`; minimize CSS collisions and maintain visual consistency with other Stitch screens.
6. Run `pnpm check`, `pnpm test`, and `pnpm build`. Document any failures, and provide mobile/desktop before-after screenshots.
7. Create a PR for review; do not merge or deploy without approval.

#### Acceptance
- Every existing feature and control on this page still works.
- Real calculations and profile data remain connected.
- Visual output matches the supplied Stitch preview.
- No engine or backend source files are modified.

---

## Zodiac Horary (`feature/stitch-zodiac-horary`)

### Stitch integration handoff — Zodiac Horary

#### Source files
User-provided `stitch_the_absolute_astrology_redesign (3).zip` contains:
- `stitch_the_absolute_astrology_redesign/zodiac_horary_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/zodiac_horary_the_absolute/screen.png`

**This branch contains instructions only, not imported HTML or completed frontend changes.** Manus / Studio must receive the ZIP separately.

#### Existing React integration targets
- `client/src/pages/ZodiacHoraryPage.tsx`
- `client/src/pages/ZodiacHoraryPage.css`

#### Implementation requirements
1. Compare Stitch's HTML layout and screenshot to the existing screen, then adapt the design into existing React/TypeScript components. Preserve props, hooks, routing, user actions, accessibility, loading/error states and mobile responsiveness.
2. Retain zodiac-sign-as-first-house logic, question entry, verdict computation and evidence.
3. Do **not** change `server/`, ephemeris, Babylonian fixed-star frame, God/Agent calculations, Equal Houses, lunar mansion methods, scoring algorithms, or API contracts.
4. Replace all Stitch demonstration scores, charts, names and dates with the existing live data bindings. Never introduce hardcoded predictions or calculations.
5. Coordinate styling with `feature/stitch-shared-design-system`; minimize CSS collisions and maintain visual consistency with other Stitch screens.
6. Run `pnpm check`, `pnpm test`, and `pnpm build`. Document any failures, and provide mobile/desktop before-after screenshots.
7. Create a PR for review; do not merge or deploy without approval.

#### Acceptance
- Every existing feature and control on this page still works.
- Real calculations and profile data remain connected.
- Visual output matches the supplied Stitch preview.
- No engine or backend source files are modified.

---

## Saved Profiles (`feature/stitch-saved-profiles`)

### Stitch integration handoff — Saved Profiles

#### Source files
User-provided `stitch_the_absolute_astrology_redesign (3).zip` contains:
- `stitch_the_absolute_astrology_redesign/saved_profiles_the_absolute/code.html`
- `stitch_the_absolute_astrology_redesign/saved_profiles_the_absolute/screen.png`

**This branch contains instructions only, not imported HTML or completed frontend changes.** Manus / Studio must receive the ZIP separately.

#### Existing React integration targets
- `client/src/components/SavedProfilePicker.tsx`
- `client/src/components/ProfileHomeScreen.tsx`

#### Implementation requirements
1. Compare Stitch's HTML layout and screenshot to the existing screen, then adapt the design into existing React/TypeScript components. Preserve props, hooks, routing, user actions, accessibility, loading/error states and mobile responsiveness.
2. Preserve persisted profiles, birth fields, load/edit/switch actions, and active session state.
3. Do **not** change `server/`, ephemeris, Babylonian fixed-star frame, God/Agent calculations, Equal Houses, lunar mansion methods, scoring algorithms, or API contracts.
4. Replace all Stitch demonstration scores, charts, names and dates with the existing live data bindings. Never introduce hardcoded predictions or calculations.
5. Coordinate styling with `feature/stitch-shared-design-system`; minimize CSS collisions and maintain visual consistency with other Stitch screens.
6. Run `pnpm check`, `pnpm test`, and `pnpm build`. Document any failures, and provide mobile/desktop before-after screenshots.
7. Create a PR for review; do not merge or deploy without approval.

#### Acceptance
- Every existing feature and control on this page still works.
- Real calculations and profile data remain connected.
- Visual output matches the supplied Stitch preview.
- No engine or backend source files are modified.

---
