# Shadbala and Bhava Bala: executable formulas

Implementation: `server/astrologyKnowledge/vedic/strength.ts`, version `bphs-fixed-xyz-strength-v1`.

These are complete numerical calculations under the selected variants below. They are not a claim of numerical interchangeability with a Lahiri/Sripati chart or every school of Jyotish. All seven classical planets receive all six Shadbala limbs. All twelve houses receive numerical Bhava totals. Nodes and outer planets do not receive invented classical Shadbala scores.

## Sources

- BPHS chapter 26, exact aspects: https://vedicpupil.in/library/books/brihat-parashara-hora-shastra/chapter-26
- BPHS chapter 27, strength: https://vedicpupil.in/library/books/brihat-parashara-hora-shastra/chapter-27
- Original text/translation, continuous Cheshta: https://www.siva.sh/brihat-parashara-hora-shastra/27/21-25
- Maitreya's documented calendar convention: https://saravali.github.io/astrology/hora_calculation.html (CC BY-SA 4.0; mathematical convention independently implemented)
- Swiss Ephemeris Cartesian/orbital API: https://www.astro.com/swisseph/swephprg.htm

The implementation independently expresses the mathematical rules. PyJHora was inspected as a comparison implementation; its program code was not copied into this project.

## Frame and units

Use the chart's existing astronomical equatorial XYZ projection and sunrise-anchored Equal Houses. No recasting into another zodiac, ayanamsha, J2000 wheel origin, or obliquity rotation is introduced. Declination comes directly from atan2(Z, hypot(X,Y)). The existing sunrise algorithm also calculates sunset when requested; the original sunrise path is preserved.

60 virupas = 1 rupa. Internal arithmetic remains unrounded. UI rounding does not change sums, ratios or ranks.

## Shadbala

Total = Sthana + Dig + Kala + Cheshta + Naisargika + signed Drik.

| Planet | Required virupas | Required rupas |
|---|---:|---:|
| Sun | 390 | 6.5 |
| Moon | 360 | 6 |
| Mars | 300 | 5 |
| Mercury | 420 | 7 |
| Jupiter | 390 | 6.5 |
| Venus | 330 | 5.5 |
| Saturn | 300 | 5 |

Adequacy = total / that planet's requirement. This is capacity, not a probability or a favorable-outcome percentage.

### Sthana

Sum five subcomponents:

1. Uchcha: shortest angular distance from deep debilitation / 3. Deep exaltation longitudes are Sun 10, Moon 33, Mars 298, Mercury 165, Jupiter 95, Venus 357, Saturn 200 degrees.
2. Saptavargaja: evaluate D1, D2, D3, D7, D9, D12 and unequal D30. Each contributes 45/30/20/15/10/4/2 for moolatrikona/own/great-friend/friend/neutral/enemy/great-enemy. This selected variant uses sign-based moolatrikona in each division and D1 temporary friendships. Temporary friends occupy 2/3/4/10/11/12 from the planet; combine that polarity with the natural relationship to the divisional sign lord.
3. Ojayugma: 15 for each qualifying D1 and D9 parity, maximum 30. Moon/Venus prefer even-numbered signs; the other five prefer odd-numbered signs.
4. Kendradi: 60/30/15 for angular/succedent/cadent placement in the supplied local Equal Houses.
5. Drekkana: selected BPHS 27.6 ordering is male planets in the first third, neutral in the second, female in the third, 15 units. This differs from a documented alternative ordering; it is intentional and exposed.

D7 starts in the source sign for odd-numbered signs and seventh from it for even-numbered signs. D12 advances from the source sign in 2.5-degree parts. D30 uses unequal Parashari sections. All transformations consume the original chart longitude.

### Dig

Shortest distance from the planet's powerless house reference / 3. Powerless references: H4 for Sun/Mars, H7 for Mercury/Jupiter, H10 for Moon/Venus, H1 for Saturn. The supplied Equal-House anchors are used; a separate Sripati/meridian house system is not substituted.

### Kala

The engine retains Nathonnata, Paksha, Tribhaga, Varsha, Masa, Dina, Hora, Ayana and Yuddha separately.

- Nathonnata: linear solar-clock distance from noon/midnight, 0–60; Mercury receives 60.
- Paksha: folded Moon–Sun phase / 3 for Moon/Mercury/Jupiter/Venus; complement to 60 for Sun/Mars/Saturn, following the selected BPHS 27.10–11 assignment. Moon's same phase value also supplies its Cheshta limb; it is not silently doubled inside Paksha.
- Tribhaga: Jupiter receives 60; the active day-third lord (Mercury/Sun/Saturn) or night-third lord (Moon/Venus/Mars) receives 60.
- Calendar: Maitreya year lord = ((year+3)*3) mod 7; month lord = ((12*year+month+6)*2) mod 7, in weekday order. The astrological date is the local date of the preceding sunrise. Year/month/day/hour lords receive 15/30/45/60. Day and night are each divided into twelve seasonal Horas in Chaldean order.
- Ayana: 30*(24 + signed declination)/24. Moon/Saturn reverse the declination sign; Mercury uses its absolute value. The physical Z component is used without rotating the wheel. The 24-degree amplitude is a traditional normalization, not a new chart obliquity. High-latitude bodies are not silently clamped.
- Yuddha: eligible Mars–Saturn pairs less than one degree apart transfer their absolute pre-war Kala difference to the higher wrapped-longitude winner and deduct it from the loser. All adjustments use immutable pre-war values and sum to zero. This explicit winner/transfer convention is not presented as the only historical war convention.

### Cheshta

Sun uses its Ayana value; Moon uses its Paksha value. The other five use the continuous BPHS formula: folded distance between the fast apex and the circular midpoint of mean and true longitude, divided by 3. Inner planets use their own mean as fast apex and solar mean for the midpoint; outer planets use solar mean as apex and their own mean for the midpoint.

The source requires mean-motion input. This application's selected astronomical variant constructs mean direction by rotating a heliocentric equatorial XYZ vector around its orbital normal through mean anomaly minus true anomaly. The scalar anomalies come from the existing ephemeris at the event date. No orbital-element ecliptic longitude becomes a wheel coordinate. This is explicitly an osculating astronomical mean-direction variant, not reproduction of ancient mean-motion epoch tables. The circular midpoint handles the 359/1-degree seam.

### Naisargika and Drik

Natural strength is 60 times 7/7, 6/7, 5/7, 4/7, 3/7, 2/7 and 1/7 for Sun/Moon/Venus/Jupiter/Mercury/Mars/Saturn.

Drik uses the degree-dependent BPHS 26 piecewise aspect functions, including Saturn/Mars/Jupiter replacements. Benefic incoming aspects contribute one quarter; malefic aspects deduct one quarter. Jupiter/Venus are benefic; waxing/waning Moon and Mercury's same-sign malefic association determine their classification. Signed negative contributions remain visible. No Western aspect nature or five-degree orb cutoff is substituted.

## Bhava Bala

Total = lord's full Shadbala + directional strength + signed house aspects + occupancy + rising-type timing.

- House lord comes from the sign at the supplied house anchor; the lord's actual delivery house and Shadbala adequacy remain attached.
- Direction uses BPHS 27.26–28 sign/half-sign groups: powerless H7 for human signs, H4 for quadrupeds, H1 for Cancer/Scorpio, H10 for latter Capricorn/Pisces. Divide shortest distance by 3.
- House aspects use the same exact Drishti geometry. Mercury/Jupiter contribute full signed values, the others one quarter, under the selected reading of BPHS 27.28–29.
- Occupancy adds 60 once if Mercury/Jupiter occupies the house and deducts 60 once for Sun/Mars/Saturn occupancy, per 27.30. Both adjustments can coexist.
- Rising-type timing adds 15 for head-rising signs by day, back-rising signs by night, or Pisces at twilight. Twilight is explicitly defined here as within 24 minutes of sunrise/sunset; the duration is an implementation convention.

All houses receive raw totals, rupas, rank and comparison with their own chart's average. No invented absolute house pass mark is used. A dedicated finding compares H5 creativity with H11 friends/networks, without deriving anyone's intentions from the scores.

## Worked Dallas chart

Input: 1986-11-20 10:06 America/Chicago, Dallas 32.7767, -96.797. Values below use the application's existing XYZ/sunrise projection and the variants above.

| Channel | Calculation output |
|---|---:|
| Venus total / requirement | 464.741687 / 330 virupas |
| Venus adequacy | 1.408308 |
| Mars total / requirement | 282.969728 / 300 virupas |
| Mars adequacy | 0.943232 |
| H5 lord | Venus |
| H5 total | 423.885514 virupas |
| H11 lord | Mars |
| H11 total | 302.417531 virupas |
| H5 minus H11 | 121.467984 virupas |

H5 ranks 7/12 and H11 11/12. H5 is stronger than H11 in this calculation, while H5 is still below the all-house average. The reading must preserve both facts rather than turning a relative comparison into absolute dominance.

## Wiring and validation

The registry now evaluates 18 methods per sky: the previous 16 plus `vedic-shadbala` and `vedic-bhava-bala`. Missing inputs remain explicit. Failed strength sums block publication. Each strength result becomes its own finding-specific judgment before whole-chart synthesis. My Chart shows component tables/bars and arithmetic. Focused placement packets receive the relevant numerical totals and owned-house results without repeated raw orbital/varga dumps.

Tests cover published arithmetic examples, exaltation/direction endpoints, degree Drishti, divisional boundaries, zero-degree wrapping, component sums, minimums, war conservation, input immutability, missing-data errors, synthesis lineage, and the H5/H11 comparison. These are formula/implementation checks; they do not certify interchangeability with a conventional sidereal software package or a completed live hosted AI response.
