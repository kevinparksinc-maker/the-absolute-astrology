# The Absolute — Verifiable XYZ Equatorial Wheel Foundation
Version: 0.1 SPECIFICATION / NOT PRODUCTION-VALIDATED
Status: independent implementation contract; no existing production engine is replaced by this branch.

## 0. Scope and scientific honesty
This specification defines a CUSTOM equatorial 360-degree interpretive wheel, not a conventional tropical or sidereal ecliptic zodiac. Assigning familiar zodiac sign names to right-ascension sectors is a convention, not proof that a body has that traditional zodiac placement. A result must disclose its frame, epoch, input source, and uncertainty. No claim that zero obliquity describes physical astronomy is made. Never silently substitute ecliptic longitude for equatorial right ascension. Never claim a model output has been astronomically validated unless independent checks have been run.

## 1. Required immutable input record
Record: local birth civil date/time; IANA timezone; UTC instant including seconds; daylight-saving resolution; geographic latitude and longitude in signed decimal degrees; elevation (or explicitly unknown); ephemeris name/version; geocentric versus topocentric mode; coordinate origin; equatorial frame/equinox (of-date, ICRS, etc.); light-time/aberration/nutation settings; chosen node type; sunrise method; horizon altitude/refraction settings; wheel convention and version; exact source data and calculation code revision. Missing inputs must be visible, not invented. Keep unrounded values throughout the engine.

## 2. Ephemeris and geometry
Fetch a 3-vector (X,Y,Z) for each planet at the UTC instant, all in ONE declared equatorial reference frame and origin. Record units and whether vectors are geocentric. Compute:
RA = mod360(atan2(Y,X)*180/pi)
Dec = atan2(Z,sqrt(X*X+Y*Y))*180/pi
Distance = sqrt(X*X+Y*Y+Z*Z)
mod360(x) = ((x % 360)+360)%360.
Reject zero-length vectors, NaN, mixed reference frames, and timestamps without time-zone resolution. Nodes are orbital intersection directions, not physical planets: compute the selected ascending-node direction in the same frame, then define the descending node as its exact antipode. Do not assume an ephemeris's XYZ node fields are ordinary physical-body coordinates.

## 3. Wheel convention
Define wheelAngle = RA (0° at equatorial RA 0°, increasing to 360°). For CUSTOM wheel labels only, assign 12 successive 30° sectors: Aries [0,30), Taurus [30,60), Gemini [60,90), Cancer [90,120), Leo [120,150), Virgo [150,180), Libra [180,210), Scorpio [210,240), Sagittarius [240,270), Capricorn [270,300), Aquarius [300,330), Pisces [330,360). These labels are not ecliptic signs. Use half-open intervals, exact boundary tests, and degrees/minutes rounded only for display.

## 4. Sunrise-based equatorial Ascendant: experimental method
This method determines the eastern HORIZON intersection of the equatorial great circle, not the conventional ecliptic Ascendant. Preferred reproducible implementation: calculate local apparent sidereal time (LAST) at birth from a documented astronomical routine and local longitude; the east equatorial horizon intersection is ASC_RA = mod360(LAST + 90°) for normal latitudes. Derivation: hour angle H = LAST - RA; an equatorial point rising at due east has H = -90°, hence RA = LAST + 90°.
Alternative sunrise-derived consistency check: from the Sun's equatorial RA and declination at sunrise, latitude phi, and a specified solar-center altitude h0, solve cos(H0) = (sin(h0)-sin(phi)*sin(dec))/(cos(phi)*cos(dec)). For a rising Sun, LAST_sunrise = RA_sun - H0. Advance LAST by Earth's sidereal rotation for elapsed UTC time, then ASC_RA = mod360(LAST_birth+90°). The approximate 86164.0905 s sidereal day is suitable for a diagnostic, NOT a substitute for a high-precision apparent sidereal-time routine. Sunrise must be calculated/verified for the historical date, site, atmospheric convention, and time zone; do not hardcode 07:04 as established fact. Handle polar no-sunrise cases and grazing geometries explicitly. Record both approaches and residual difference.

## 5. Equal houses
House cusp k (k=1..12) = mod360(ASC_RA+30*(k-1)).
house(angle) = 1+floor(mod360(angle-ASC_RA)/30).
House cusps are 30° RA arcs on this custom equatorial wheel, not traditional ecliptic equal houses. Validate every object lies in exactly one half-open house; an exact cusp belongs to the following house. Opposite directions occupy houses six apart.

## 6. Nodal axis
Choose MEAN or TRUE ascending node explicitly. north = mod360(ascending_node_RA); south = mod360(north+180). Use the antipodal point, not an independent ephemeris South Node lookup. Assert abs(mod360(south-north)-180) < tolerance and house(south)=1+((house(north)+5)%12). Node labels, mansion assignments, aspects and houses are derived from the same wheel angles. Do not conflate true-node oscillation with mean-node position.

## 7. Degree overlays: independent, versioned data tables
Elemental-family decans: 0°–10°, 10°–20°, 20°–30° of each 30° sector; ruler order = ruler of the current sign, then rulers of the next two signs of that element in zodiac order. Store traditional versus modern ruler choices explicitly (Scorpio/Mars, Aquarius/Saturn, Pisces/Jupiter for traditional).
Egyptian bounds: use a named, cited historical table with unequal sub-sign boundaries; verify five contiguous segments sum to 30° in every sign. Never invent equal terms.
Dwad: 12 subdivisions of 2.5°; first dwad begins at the containing sign, following zodiac order.
D9/Navamsa: 9 subdivisions of 3°20′; fire signs start Aries, earth Capricorn, air Libra, water Cancer, then advance zodiacally.
27 nakshatras: equal 13°20′ subdivisions only when user explicitly selects CUSTOM EQUAL-RA mode; traditional sidereal nakshatra claims require an independently defined reference system and catalog.
28 Arabic manzils: equal 360/28 RA sectors are a custom approximation and must be labeled so; historical star-defined boundaries require sourced tables.
28 Chinese mansions: use documented reference-star RA boundaries, frame/epoch, catalog provenance and conversion rules. Do not substitute equal divisions or invent a mansion name if boundaries are missing.
Mansion activation: occupancy >=1 body activates a mansion; >=2 bodies increases occupancy count, but scoring amplification must be separately configured, never asserted as a physical fact.
Fixed stars: use catalog vectors, epoch and proper-motion policy; compare only after converting to the SAME declared frame. Never claim historically fixed stars literally have zero proper motion.

## 8. Aspects, strength and interpretation
For each unique unordered object pair compute d = min(mod360(a-b),360-mod360(a-b)). Supported angles 0,60,90,120,180 degrees, orb <=5° inclusive; assign nearest applicable major angle and report exact orb, signed separation, bodies, house/sign/degree, and ruleset version. Conjunction, trine, sextile count harmonious in the user's model; square/opposition count friction. Intensity is a documented integer 1..5 computed from orb using a single versioned rule, not invented post hoc. Keep planetary importance weights in configuration; never silently assign Uranus a weight. Show raw counts, weighted sums, rounding rules and full evidence. Venus excluded from sports scoring only if sports profile selected.
Strengths (Shadbala, Bhava Bala, Ashtakavarga, dignities, yogas, receptions, lots, sect, etc.) require individual formulas and frame compatibility review before claiming traditional equivalence. No scores without implementable methods.
Day/night sect uses computed solar altitude with documented horizon model. Day Fortune = ASC+Moon-Sun; day Spirit = ASC+Sun-Moon; reverse for night; mod360 all outputs. Do not invent other Lots without explicit formulas.

## 9. Narrative synthesis contract
Produce a connected life-story interpretation, NOT one paragraph per planet. Build an evidence graph of all validated chart factors and traditions, rank repeated motifs, trace contradictions, connect motivation -> behavior -> consequence -> development, and distinguish astrological symbolism from known biographical fact. For each substantive claim internally track WHAT, WHY (specific degrees/houses/aspects/mansions), HOW in ordinary life, CONSEQUENCE, and MEANING. Cover identity, relationships, resources, work, family, emotional life, strengths, tensions and timing when supported. Use concrete paragraphs, not adjective stacks; avoid pretending to know specific events not supplied by the user. Every interpretation must offer an expandable 'How calculated / Why interpreted' evidence trail. Never silently omit Sun, Moon, Ascendant, nodes or other chart factors merely to focus on one attractive theme.

## 10. Public verification package
Publish: (a) full input JSON schema; (b) exact versioned source and formulas; (c) coordinate-provider metadata; (d) unrounded intermediate XYZ, RA, Dec, LAST, ASC and cusps; (e) all overlay table versions and citations; (f) per-aspect evidence and weights; (g) human-readable calculation certificate; (h) deterministic fixtures with expected outputs and tolerances; (i) a reproducible CLI command; (j) independent comparison against at least one separately implemented sidereal-time/ephemeris calculation. Protect privacy: birth time and birthplace must be redacted from public exports by default, with opt-in for full technical exports.

## 11. Acceptance tests (must pass before production wiring)
- Angles: atan2 quadrant tests, negative mod, 0/360 boundary, 29.999/30 cusp, 359.999/0 wrap.
- Nodes: exact 180° separation, opposite house, wraparound and near-cusp.
- Houses: twelve cusps exactly 30° apart; every object assigned exactly once.
- Sunrise: sunrise-based ASC agrees with independently computed LAST-based ASC within a declared tolerance under matched assumptions; historic DST/UTC conversion independently verified; reject polar no-sunrise for sunrise route.
- Frames: deliberate mismatched-frame fixture must fail loudly.
- Mansions: full circle partition with no overlaps/gaps; boundaries cited and versioned; no silent historical/equal-sector substitution.
- Decans/bounds/D9/dwads: exhaustive 360° sweep and boundary fixtures.
- Aspects: exact and near 5° orbs, duplicates excluded, count and weighted-score reconciliation.
- Narratives: evidence IDs attached to each significant conclusion; contradictions represented, not hidden; no invented personal facts.
- Golden fixture: Nov 20 1986 10:06 CST, Dallas 32.7767,-96.7970, is PROVISIONAL until source ephemeris, sunrise and ASC independent comparison are verified. Previously quoted 07:04 sunrise and ~294.75° ASC are hypotheses, not acceptance baselines.

## 12. Integration sequence
Phase A: reference standalone pure functions, fixture generator and tests. Phase B: signed calculation certificate and evidence JSON. Phase C: adapt The Absolute UI without changing production defaults. Phase D: adopt shared versioned engine in Simulation Lab; God View and Agent View explicitly distinguished; no mixing frames. Phase E: layered interpretive evidence graph and long-form story generator. Phase F: independent verification review and only then opt-in production migration.
Each app must import/pin the same spec version and engine revision, with regression snapshots. No merge of this branch alone constitutes implementation.
