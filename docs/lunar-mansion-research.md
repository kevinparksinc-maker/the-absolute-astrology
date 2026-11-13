# Chinese Twenty-Eight Lunar Lodges: calibration record

## Findings

The Chinese *xiu* (宿), or lunar lodges, are not historically equal ecliptic sectors. The University of Chicago's *History of Science and Technology in China* chapter reproduces a Han-dynasty table of 28 lodges with determinative stars and unequal computed angular extents. The widths in traditional order are:

`12, 9, 15, 5, 5, 19, 11, 27, 8, 12, 10, 17, 17, 9, 16, 11, 15, 11, 18, 1, 8, 33, 4, 15, 7, 17, 18, 17` degrees.

These values sum to 367 degrees. Therefore they cannot be copied as a literal modern 360-degree ecliptic partition without an explicit historical-era conversion rule. They are retained as the source width record, and any application boundary table must declare how the historical equatorial widths are normalized or projected.

The same source lists the determinative stars: alpha Virginis, kappa Virginis, alpha Librae, pi Scorpii, sigma Scorpii, mu Scorpii, gamma Sagittarii, phi Sagittarii, beta Capricorni, epsilon Aquarii, beta Aquarii, alpha Aquarii, alpha Pegasi, gamma Pegasi, zeta Andromedae, beta Arietis, 35 Arietis, 17 Tauri, epsilon Tauri, phi-prime Orionis, delta Orionis, mu Geminorum, theta Cancri, delta Hydrae, alpha Hydrae, upsilon Hydrae, alpha Crateris, and gamma Corvi.

The historical coordinate convention is equatorial rather than Western ecliptic zodiacal. Chinese right ascension was measured eastward from local meridians defined by one determinative star per lodge; the lodge widths could range from about 1–2 degrees to roughly 33 degrees. The system therefore represents unequal right-ascension zones associated with determinative-star meridians, not a set of equal ecliptic zodiac slices.

The International Dunhuang Programme of the British Library describes the 28 lodges as equatorial asterism regions near the celestial equator and along the Moon's path, with the four symbolic regions arranged in the Chinese sky orientation. A ChinaXiv paper by researchers from Yunnan Astronomical Observatory and the Institute for the History of Natural Sciences emphasizes that the 28 lodges became a coordinate framework for measuring celestial bodies, with each lodge using a determinative star as a calculation reference.

## Implementation convention for Firmament

The application already uses a canonical Aldebaran-anchored longitude frame (`firmament-aldebaran-15-taurus`) and Swiss Ephemeris sidereal mode 14. The historical Chinese system cannot be silently converted by applying another ayanamsha or by treating Han equatorial width values as modern ecliptic widths. The integration must therefore:

1. Keep the canonical planetary longitude unchanged.
2. Preserve the historical Han width and determinative-star source table as provenance.
3. Expose any projected Aldebaran-frame boundary table as an explicitly labeled custom Firmament adaptation, not as an unqualified historical Chinese boundary table.
4. The live chart overlay may expose the projected assignment for exploration, but must label it as a custom Firmament adaptation until the projected boundary calibration is independently verified; it must not be described as an unqualified historical Chinese ecliptic reading.
5. Continue exposing the existing 27 Nakshatras, 28 Arabic Manazil, elemental decans, and fixed-star positions without applying an additional ayanamsha.

## Sources

- University of Chicago, *History of Science and Technology in China*, “Chinese and Korean Star Maps and Catalogs,” Table 13.1 and surrounding discussion: https://press.uchicago.edu/books/hoc/HOC_V2_B2/HOC_VOLUME2_Book2_chapter13.pdf
- International Dunhuang Programme, British Library, “The regions of the sky”: https://idp.bl.uk/discover/learning/chinese-astronomy/articles/the-chinese-sky/the-regions-of-the-sky/
- Xiaochun Sun, “Chinese Constellations and Star Maps,” *Handbook of Archaeoastronomy and Ethnoastronomy*: https://link.springer.com/rwe/10.1007/978-1-4614-6141-8_216
- Li Weibao, Chen Jiujin, Feng Yongli, Tao Jinping, “Lunar Mansions, Asterisms, and Constellations in Traditional Chinese Star Names,” ChinaXiv: https://chinarxiv.org/items/chinaxiv-201711.01330
