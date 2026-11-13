# Sunrise-anchored Ascendant integration contract

The new `server/sunriseAscendant.ts` contains the **geometric calculation**, not a verified historical sunrise data source. It deliberately does not replace the active Ascendant yet.

## Required inputs
- Historical sunrise **UTC instant** for the requested civil date and observer coordinates, including timezone and any historical offset.
- The Sun's **fixed equatorial XYZ** vector at that sunrise instant. X and Y must share the fixed 360-degree wheel axes; Z is aligned with the north celestial pole. Ecliptic XYZ must **not** be passed as equatorial XYZ without a verified transform.
- Observer latitude, and birth/event UTC instant.

## Calculation
1. Compute solar right ascension `atan2(y,x)` and declination `atan2(z,hypot(x,y))`.
2. Compute sunrise hour angle `acos(-tan(latitude)*tan(declination))` for a geometric horizon (no refraction/altitude correction).
3. The zero-tilt east-horizon intersection at sunrise is `sunRA - sunriseHourAngle + 90°`.
4. Advance by elapsed UTC hours times `360.98564736629/24` degrees, normalize to the 360° fixed wheel.
5. Place equal-house cusps every 30° from the exact Ascendant. Do not use whole-sign houses.

## Remaining wiring before switching the production engine
- Implement/verify a historical sunrise resolver, including polar conditions, altitude, daylight-saving history and date boundaries.
- Verify the XYZ coordinate frame: the current automatic planetary XYZ call requests sidereal ecliptic vectors; this function requires equatorial axes. A consistent transform must be demonstrated and tested, not guessed.
- Connect sunrise inputs through the API, canonical chart, Master Chart, Sky and Energy Read.
- Run numerical fixtures, CI and Render smoke tests before enabling by default.

**Never claim the sunrise Ascendant is active just because this module exists.**
