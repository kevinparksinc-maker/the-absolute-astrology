# Final production migration blueprint — XYZ + sunrise Ascendant

## Critical status
The repository contains isolated vector projection, XYZ adapter, angular sunrise model, and provisional sunrise-time approximation. Production `server/astronomy.ts` is NOT yet switched: no validated 100 BCE calibration, no verified historical sunrise provider, and no confirmed `sweph` native XYZ return shape. Activating them as-is would give an untrustworthy natal chart.

## Step 1: Calibration certificate
- Establish reference frame and time scale for every 100 BCE vector, numerical normal, Aldebaran direction, and origin.
- Derive independently from catalog/ephemeris data; record calibration date, star motion assumptions, accuracy, and test vectors.
- Require Aldebaran at exactly 45° by construction, then verify independent stars and dates. Do not confuse anchor consistency with historical accuracy.
- Check cross-product handedness and obliquity sign.

## Step 2: Real XYZ source
- Confirm installed sweph bindings, numeric SEFLG_XYZ / EQUATORIAL / J2000 / ICRS constants and flags actually returned.
- Use geocentric positions and AU/day velocities for natal and transit; separately handle topocentric Moon, Earth and lunar nodes.
- Convert all XYZ into a single documented inertial frame. Keep reference-frame metadata and errors.
- Correct `InvariantVectorEngine` speed derivative: project UNNORMALIZED position and velocity.

## Step 3: Sunrise provider
- Resolve the civil date at birth/transit location, not the UTC date; convert local noon to UTC safely across DST and historical timezone rules.
- Compute apparent upper-limb sunrise using solar topocentric altitude with configurable refraction, elevation and horizon; iterate to numerical root near dawn.
- Handle before-sunrise births, multiple local-date boundaries, polar day/night, and missing historic zone rules. Expose sunrise UTC, convention, precision, source.
- `approximateSunriseUtc` is only a rough seed; it does not correctly resolve every local civil date and is not production-ready.

## Step 4: Canonical sunrise-anchored model
- Get Sun geocentric XYZ at sunrise; project with validated invariant engine.
- Compute ASC = mod360(sunriseSunLongitude + siderealRotationRate * (eventUTC - sunriseUTC) / day).
- This is the user's specified *model*, not an independently demonstrated physical eastern-horizon intersection. Verify sign/orientation and comparison cases.
- DESC=ASC+180; equal cusps ASC+30*k. MC requires a separately defined convention.
- Preserve God View vs Agent View, houses, nodes, lots, mansions, aspects and downstream schemas.

## Step 5: Production switchover
- Replace both `sweph.houses_ex` call sites in `server/astronomy.ts` together only when steps 1–4 pass.
- Replace planetary `safeCalc` and Moon adapter with same frame in the SAME release. No tropical planets + fixed-frame houses mixed.
- Fail closed on missing calibration/sunrise rather than silently falling back to Swiss houses.
- Add startup calibration checks, telemetry, comparison snapshots, feature flag and rollback.
- Preserve retrograde speed, transit contacts, historical sunrise evidence and calculation certificates.

## Step 6: Verification / rollout
- Unit tests: vector rotation, speed dimensions, wrap, 12 houses, before/after sunrise, timezone/DST, polar cases.
- Integration: Dallas 1986-11-20 10:06 CST and multiple locations/seasons, independent astronomy reference comparison.
- Full test suite, typecheck, browser chart tests, mobile screenshots, CI evidence log.
- Mirror the same versioned engine and calibration in Simulation Lab, then verify sports charts against The Absolute.
- Do not merge until all tests and source data are confirmed.

## Current files
`core/astrology/InvariantVectorEngine.ts`, `server/invariant-xyz-provider.ts`, `server/sunrise-ascendant.ts`, `server/historical-sunrise-provider.ts`, `test/astrology/invariant_engine.test.ts`, `test/astrology/sunrise_ascendant.test.ts`.
