# XYZ and Sunrise Integration — Implementation Gate

## Committed
- `server/invariant-xyz-provider.ts`: Swiss geocentric equatorial XYZ+velocity adapter, inertial ICRS/J2000 flags, no sidereal flag.
- `server/sunrise-ascendant.ts`: isolated sunrise-reference angular advance and 12 Equal Houses.
- `test/astrology/sunrise_ascendant.test.ts`: synthetic geometry tests.
- Inherited `core/astrology/InvariantVectorEngine.ts` from parent feature branch.

## Must complete before production replacement
1. Verify actual `sweph.calc_ut` wrapper returns six numeric array entries and reports requested reference flags. Do not assume successful results from unexecuted tests.
2. Calibrate and independently document 100 BCE plane normal and Aldebaran direction in the SAME inertial frame. Existing numerical examples are provisional.
3. Implement historical sunrise provider: observer lat/lon/elevation, civil date/timezone, atmospheric horizon convention, historical time scales; return UTC instant and source metadata. Handle polar-day/night and pre-sunrise events.
4. At the sunrise instant obtain geocentric Sun XYZ from the adapter; pass through calibrated InvariantVectorEngine to derive sunriseSunLongitude.
5. Pass sunrise UTC, event UTC and solar anchor to calculateSunriseAscendant. Verify east/west direction sign and horizon geometry independently: this user-defined sunrise advance is not itself a physical horizon intersection.
6. In `server/astronomy.ts`, replace BOTH natal and transit `sweph.houses_ex` only after steps 1–5. Preserve the chart response shape and downstream house mapping. MC requires separate geometric specification; do not silently keep the Swiss MC as if in the same frame.
7. Replace `safeCalc` and Moon paths only after XYZ provider and historical calibration are verified. Keep existing Swiss longitude path until then; no partial mixing of incompatible frames.
8. Validate Dallas 1986-11-20 10:06 CST with documented sunrise, calibrated Sun XYZ, Ascendant and equal houses; compare chart snapshots. Run full tests and document output.
9. Repeat the identical calibrated engine version in Simulation Lab. Do not claim its repo is updated until a separate commit exists.

## Status
Isolated implementation committed; production `server/astronomy.ts` unchanged. Sunrise timestamp provider and calibration not yet built. Do not merge as complete.
