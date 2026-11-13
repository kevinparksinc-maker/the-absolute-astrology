# Invariant Babylonian Vector Engine — Integration Brief

## Status
Isolated geometry and synthetic tests only. NOT connected to production astronomy.ts. NOT a historical calibration certificate. Do not merge or enable until validation.

## Coordinate contract
- Input position and velocity must be geocentric Cartesian vectors in the SAME documented inertial axes, with velocity in distance/day.
- Output longitude is degrees [0,360); angular speed is degrees/day, signed for retrograde.
- Never feed heliocentric or barycentric vectors to a geocentric chart without translating the origin.
- Rectangular XYZ alone does NOT disable precession or guarantee ICRS. Verify native Swiss wrapper and actual returned flags. An ICRS/J2000 reference-axis conversion upstream is not the Babylonian zodiac anchor.
- Swiss Ephemeris constants/flags must be confirmed against installed bindings before use; no invented rawCalcCartesian function.
- The 100 BCE normal, reference axis and Aldebaran direction supplied in the draft are PROVISIONAL, not verified. Derive and record calibrated numeric constants with provenance before activation.
- Freeze reference basis; input planetary vectors still change with date.
- Preserve the current safeCalc return signature, planet speeds, topocentric Moon, and zero-tilt Ascendant/horizon code until integration tests pass.
- Do not replace canonicalLocalSiderealAngle with an arbitrary observer direction.
- Do not block existing ayanamsha callers until dependencies are inventoried.
- Validate vector source, Moon, nodes, house boundaries, retrograde, 0/360 crossings, and chart snapshots; ensure God/Agent and Simulation Lab share versioned calibration.
- The geometry engine is NOT an independent orbital propagator. Upstream planetary ephemeris remains a separate dependency.

## Tests
Run the repository's Vitest command against test/astrology/invariant_engine.test.ts and compare numerical outputs with an independent geometry reference. Synthetic fixtures do not establish historical accuracy.
