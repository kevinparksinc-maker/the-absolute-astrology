import type { PlanetCanonRecord, SignCanonRecord } from "./types";

export const PLANET_CANON_RECORDS: Record<string, PlanetCanonRecord> = {
  Sun: {
    name: "Sun",
    category: "luminary",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Apparent geocentric motion defines the ecliptic plane (0° latitude) at a mean daily speed of ~0°59′08″; never turns retrograde.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris / Moshier Geocentric Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "diurnal",
      temperament: "Hot and Dry (moderate when rising, intense at culmination)",
      beneficMalefic: "variable",
      chaldeanOrderRank: 4,
      meanDailyMotionDeg: 0.9856,
      provenance: {
        tradition: "hellenistic",
        sourceTitle: "Ptolemy, Tetrabiblos I.4–7; Vettius Valens, Anthology I.1",
        authorOrEra: "2nd Century CE",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Conscious vitality, central purpose, and coherent selfhood",
      "Visible authority, sovereignty, leadership, and public authorship",
      "Paternal archetype, honor, reputation, and moral backbone",
      "The illuminating center that either warms and clarifies or burns (combusts) what comes too close",
    ],
    psychologicalFunctions: {
      coreNeed: "To be seen as authentic, coherent, and purposeful in one's own right",
      healthyExpression:
        "Steady self-respect, warm generosity, clear direction, and willingness to stand behind one's choices",
      defensiveStrategy:
        "Performative pride, over-identification with status, or hiding when full recognition is not guaranteed",
      shadowExpression:
        "Arrogance, fragile ego requiring constant validation, or self-erasure out of fear of exposure",
    },
    rulerships: {
      domiciles: ["Leo"],
      exaltationSign: "Aries",
      exaltationDegree: 19,
      detriments: ["Aquarius"],
      fallSign: "Libra",
      fallDegree: 19,
      houseJoy: 9,
    },
    naturalSignifications: [
      "Kings, executives, fathers, mentors, gold, the heart, eyesight, and public honors",
    ],
    horaryUses: [
      "Natural significator of authority figures, bosses, fathers, and in diurnal charts a co-significator of the querent's conscious aim",
      "By proximity: within 17′ (Cazimi) fortifies a planet in the heart of the King; within 8°30′ (Combustion) conceals and overwhelms; within 17° (Under the Beams) weakens visibility",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Determines chart sect (Day Chart when in Houses 7–12 above the horizon; Night Chart when in Houses 1–6) and serves as the Spirit-axis anchor in Lot calculations.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Moon: {
    name: "Moon",
    category: "luminary",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Fastest geocentric body with a mean daily motion of ~13°10′35″ (ranging ~11.8° to ~15.3°/day); exhibits measurable topocentric horizontal parallax up to ~1°.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris / Firmament Hybrid Lunar Architecture",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "nocturnal",
      temperament: "Cold and Moist (modulated by lunar phase/waxing-waning quarter)",
      beneficMalefic: "benefic",
      chaldeanOrderRank: 7,
      meanDailyMotionDeg: 13.1764,
      provenance: {
        tradition: "hellenistic",
        sourceTitle: "Ptolemy, Tetrabiblos I.4; Dorotheus of Sidon, Carmen Astrologicum",
        authorOrEra: "1st–2nd Century CE",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Instinctive emotional life, bodily felt safety, memory, and attachment",
      "Rhythms of nurture, shelter, domestic belonging, and somatic receptivity",
      "Maternal archetype, early conditioning, and what the nervous system reaches for under stress",
      "The primary translator of celestial light into everyday human change",
    ],
    psychologicalFunctions: {
      coreNeed: "Emotional safety, reliable belonging, and visceral attunement",
      healthyExpression:
        "Emotional honesty, empathy, capacity to be nourished and to care without losing boundaries",
      defensiveStrategy:
        "Mood-driven withdrawal, caretaking to secure attachment, or numbing somatic needs",
      shadowExpression:
        "Emotional volatility, clinging dependency, or reflexive guardedness against intimacy",
    },
    rulerships: {
      domiciles: ["Cancer"],
      exaltationSign: "Taurus",
      exaltationDegree: 3,
      detriments: ["Capricorn"],
      fallSign: "Scorpio",
      fallDegree: 3,
      houseJoy: 3,
    },
    naturalSignifications: [
      "Mothers, home, nourishment, silver, tides, the stomach, crowds, and public fluctuation",
    ],
    horaryUses: [
      "Universal co-significator of the querent and the unfolding narrative of the question",
      "Primary carrier of Translation of Light, Collection of Light, and Void-of-Course judgment",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Canonical geocentric longitude governs tropical sign, Nakshatra (27), Manzil (28), and Decan (36) overlays; topocentric parallax is preserved separately in Agent View. If birth time is unknown, Firmament flags the full ~12°–15° daily lunar range rather than guessing a single degree.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Mercury: {
    name: "Mercury",
    category: "classical-planet",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Inferior planet whose geocentric elongation from the Sun never exceeds ~28°; turns retrograde ~3 times per year for ~21–24 days.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "participating",
      temperament:
        "Variable (diurnal when oriental/rising before the Sun; nocturnal when occidental/setting after the Sun; slightly Cold and Dry by base nature)",
      beneficMalefic: "variable",
      chaldeanOrderRank: 6,
      meanDailyMotionDeg: 1.383,
      provenance: {
        tradition: "hellenistic",
        sourceTitle: "Ptolemy, Tetrabiblos I.4–6; Rhetorius the Egyptian",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Cognition, language, discernment, logic, interpretation, and naming",
      "Negotiation, commerce, craft, skill, and adaptability between worlds",
      "How the mind organizes uncertainty and translates feeling into speech",
    ],
    psychologicalFunctions: {
      coreNeed: "To understand, articulate, and make sense of experience",
      healthyExpression:
        "Clear communication, intellectual curiosity, precision, and fair-minded discernment",
      defensiveStrategy:
        "Over-intellectualizing emotion, compulsive overthinking, or verbal sparring to maintain control",
      shadowExpression:
        "Rationalization, duplicity, nervous scatter, or weaponizing words when cornered",
    },
    rulerships: {
      domiciles: ["Gemini", "Virgo"],
      exaltationSign: "Virgo",
      exaltationDegree: 15,
      detriments: ["Sagittarius", "Pisces"],
      fallSign: "Pisces",
      fallDegree: 15,
      houseJoy: 1,
    },
    naturalSignifications: [
      "Writers, messengers, clerks, merchants, siblings, contracts, documents, and short journeys",
    ],
    horaryUses: [
      "Natural significator of letters, messages, contracts, exams, commerce, and younger people",
      "Retrograde Mercury signifies reconsideration, returning messages, or hidden/incomplete information",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Evaluated for both Gemini (outward synthesis/exchange) and Virgo (both domicile and exaltation: analytical discernment).",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Venus: {
    name: "Venus",
    category: "classical-planet",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Inferior planet with a maximum solar elongation of ~47°; turns retrograde every ~18 months for ~40–43 days.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "nocturnal",
      temperament: "Cold and Moist (temperate, fertile, unifying)",
      beneficMalefic: "benefic",
      chaldeanOrderRank: 5,
      meanDailyMotionDeg: 1.2,
      provenance: {
        tradition: "hellenistic",
        sourceTitle: "Ptolemy, Tetrabiblos I.4; Abu Ma'shar, Great Introduction",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Attraction, affection, reciprocity, harmony, beauty, and felt value",
      "Relational bonding, conciliation, pleasure, and what a person deems worthy of devotion",
      "Lesser Benefic of the nocturnal sect: reconciles conflict and softens harshness",
    ],
    psychologicalFunctions: {
      coreNeed: "To love, be valued, and experience harmonious reciprocity",
      healthyExpression:
        "Warmth, relational grace, clear personal values, and capacity for mutual appreciation",
      defensiveStrategy:
        "People-pleasing, conflict-avoidance, or using charm to prevent rejection",
      shadowExpression:
        "Superficiality, transactional affection, vanity, or staying in dynamics that erode self-respect",
    },
    rulerships: {
      domiciles: ["Taurus", "Libra"],
      exaltationSign: "Pisces",
      exaltationDegree: 27,
      detriments: ["Scorpio", "Aries"],
      fallSign: "Virgo",
      fallDegree: 27,
      houseJoy: 5,
    },
    naturalSignifications: [
      "Lovers, spouses, artists, diplomacy, jewelry, peace agreements, pleasure, and social bonds",
    ],
    horaryUses: [
      "Natural significator of love, partnership, reconciliation, women/partners in relational questions, and peace",
      "Anchor of the Lot of Eros",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Governs relational valuation, reciprocity, and the Lot of Eros in Firmament's traditional + behavioral matrix.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Mars: {
    name: "Mars",
    category: "classical-planet",
    astronomicalFact: {
      category: "FACT",
      statement:
        "First superior planet outside Earth's orbit; mean daily motion ~0°31′27″; turns retrograde every ~26 months for ~60–80 days.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "nocturnal",
      temperament: "Hot and Dry (burning, severing, mobilizing)",
      beneficMalefic: "malefic",
      chaldeanOrderRank: 3,
      meanDailyMotionDeg: 0.524,
      provenance: {
        tradition: "hellenistic",
        sourceTitle: "Ptolemy, Tetrabiblos I.4–7; Firmicus Maternus, Mathesis",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Courage, assertion, separation, boundary-defense, willpower, and decisive action",
      "Lesser Malefic (constructive and more temperate in a Night Chart; sharper and more combative in a Day Chart)",
      "How a person handles anger, threat, competition, desire, and the need to say 'no'",
    ],
    psychologicalFunctions: {
      coreNeed: "Agency, self-defense, and the power to act decisively on one's will",
      healthyExpression:
        "Courageous initiative, clean boundaries, protective strength, and direct honesty",
      defensiveStrategy:
        "Preemptive aggression,picking fights to avoid vulnerability, or suppressing anger until it erupts",
      shadowExpression:
        "Hostility, impulsiveness, domination, or chronic resentment from swallowed boundaries",
    },
    rulerships: {
      domiciles: ["Aries", "Scorpio"],
      exaltationSign: "Capricorn",
      exaltationDegree: 28,
      detriments: ["Libra", "Taurus"],
      fallSign: "Cancer",
      fallDegree: 28,
      houseJoy: 6,
    },
    naturalSignifications: [
      "Soldiers, surgeons, athletes, iron, fire, conflict, cuts, fevers, and urgent enterprise",
    ],
    horaryUses: [
      "Natural significator of conflict, litigation, surgery, competitors, courage, and separation",
      "In Vedic Jyotish (Graha Drishti), casts special full aspects to the 4th, 7th, and 8th houses from itself",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Traditional ruler of both Aries (outward conquest) and Scorpio (strategic endurance), and carrier of 4th/7th/8th Vedic Drishti.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Jupiter: {
    name: "Jupiter",
    category: "classical-planet",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Superior gas giant with a ~11.86-year sidereal period (~1 year per zodiac sign); mean daily motion ~0°04′59″.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "diurnal",
      temperament: "Hot and Moist (temperate, life-giving, expansive)",
      beneficMalefic: "benefic",
      chaldeanOrderRank: 2,
      meanDailyMotionDeg: 0.0831,
      provenance: {
        tradition: "hellenistic",
        sourceTitle: "Ptolemy, Tetrabiblos I.4–7; Vettius Valens, Anthology",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Wisdom, coherence, generosity, faith, law, mentorship, and expansion",
      "Greater Benefic of the diurnal sect: stabilizes, elevates, and restores proportion",
      "Where a person finds meaning, trust, philosophical perspective, and grace",
    ],
    psychologicalFunctions: {
      coreNeed: "Meaning, growth, ethical coherence, and trust in a larger horizon",
      healthyExpression:
        "Wisdom, generosity, grounded optimism, mentorship, and principled expansion",
      defensiveStrategy:
        "Bypassing painful specifics with grand philosophy, over-promising, or moral superiority",
      shadowExpression:
        "Excess, entitlement, dogmatism, or reckless over-extension",
    },
    rulerships: {
      domiciles: ["Sagittarius", "Pisces"],
      exaltationSign: "Cancer",
      exaltationDegree: 15,
      detriments: ["Gemini", "Virgo"],
      fallSign: "Capricorn",
      fallDegree: 15,
      houseJoy: 11,
    },
    naturalSignifications: [
      "Judges, teachers, scholars, patrons, wealth, alliances, children, and spiritual counsel",
    ],
    horaryUses: [
      "Natural significator of wealth, legal relief, patronage, wisdom, and fortunate resolution",
      "In Vedic Jyotish (Graha Drishti), casts special protective aspects to the 5th, 7th, and 9th houses from itself",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Traditional domicile lord of both Sagittarius and Pisces, exalted in Cancer, casting 5th/7th/9th Vedic Drishti.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Saturn: {
    name: "Saturn",
    category: "classical-planet",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Outermost classical planet visible to the naked eye; ~29.46-year orbital period (~2.5 years per sign); mean daily motion ~0°02′01″.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "diurnal",
      temperament: "Cold and Dry (contracting, solidifying, enduring)",
      beneficMalefic: "malefic",
      chaldeanOrderRank: 1,
      meanDailyMotionDeg: 0.0335,
      provenance: {
        tradition: "hellenistic",
        sourceTitle: "Ptolemy, Tetrabiblos I.4–7; Abu Ma'shar; William Lilly, Christian Astrology",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Time, boundaries, structure, consequence, endurance, mastery, and containment",
      "Greater Malefic (more constructive, architectural, and disciplined in a Day Chart; heavier, colder, and more defensive in a Night Chart)",
      "Where a person feels tested by reality and builds earned, unshakable authority through patience",
    ],
    psychologicalFunctions: {
      coreNeed: "Competence, structural security, self-respect, and enduring integrity",
      healthyExpression:
        "Patience, realism, accountability, deep craft, and keeping one's word under pressure",
      defensiveStrategy:
        "Hyper-independence, emotional walling-off, harsh self-criticism, or rigid control",
      shadowExpression:
        "Fear-driven paralysis, cynicism, coldness, shame, or confusing isolation with strength",
    },
    rulerships: {
      domiciles: ["Capricorn", "Aquarius"],
      exaltationSign: "Libra",
      exaltationDegree: 21,
      detriments: ["Cancer", "Leo"],
      fallSign: "Aries",
      fallDegree: 21,
      houseJoy: 12,
    },
    naturalSignifications: [
      "Elders, builders, farmers, land, stone, foundations, debts, time, solitude, and long endurance",
    ],
    horaryUses: [
      "Natural significator of delay, permanence, real estate, elders, and structural limits",
      "Often acts as the planet of Prohibition or Collection of Light (because of its slow motion)",
      "In Vedic Jyotish (Graha Drishti), casts special aspects to the 3rd, 7th, and 10th houses from itself, and governs Sade Sati when transiting the natal Moon's sign and adjacent signs",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Traditional domicile lord of both Capricorn and Aquarius, exalted in Libra, and carrier of 3rd/7th/10th Vedic Drishti and Sade Sati timing.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Uranus: {
    name: "Uranus",
    category: "modern-outer",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Discovered in 1781; ~84-year orbital period (~7 years per sign); mean daily motion ~0°00′42″.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "not-applicable",
      temperament: "Modern transpersonal planet (not part of classical septenary sect/dignity tables)",
      beneficMalefic: "modern-transpersonal",
      meanDailyMotionDeg: 0.0117,
      provenance: {
        tradition: "western",
        sourceTitle: "Modern Western Astrological Tradition (post-1781)",
        epistemicCategory: "TRADITION",
        notes:
          "Firmament preserves Saturn as traditional domicile ruler of Aquarius while recognizing Uranus as a modern disruptive/individuating factor.",
      },
    },
    coreMeanings: [
      "Sudden awakening, individuation, disruption of stagnant patterns, originality, and freedom",
      "Refusal of false conformity and electric flashes of insight",
    ],
    psychologicalFunctions: {
      coreNeed: "Authenticity, autonomy, and freedom from suffocating scripts",
      healthyExpression:
        "Original thought, courage to innovate, and liberating truth-telling",
      defensiveStrategy:
        "Detachment, premature bolting when closeness feels confining, or contrarianism",
      shadowExpression:
        "Erratic instability, emotional cut-off, or blowing up stability out of restlessness",
    },
    rulerships: {
      domiciles: [],
      detriments: [],
    },
    naturalSignifications: [
      "Invention, sudden reversals, technology, independence, and breakthroughs",
    ],
    horaryUses: [
      "Used in Firmament only as a supplemental indicator of sudden disruption when closely conjunct an angle or primary significator; never overrides classical house rulers",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Supplemental transpersonal body; never replaces Saturn's traditional rulership of Aquarius in essential dignity or horary judgment.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Neptune: {
    name: "Neptune",
    category: "modern-outer",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Discovered in 1846; ~164.8-year orbital period (~14 years per sign); mean daily motion ~0°00′24″.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "not-applicable",
      temperament: "Modern transpersonal planet (not part of classical septenary sect/dignity tables)",
      beneficMalefic: "modern-transpersonal",
      meanDailyMotionDeg: 0.0067,
      provenance: {
        tradition: "western",
        sourceTitle: "Modern Western Astrological Tradition (post-1846)",
        epistemicCategory: "TRADITION",
        notes:
          "Firmament preserves Jupiter as traditional domicile ruler of Pisces while recognizing Neptune as a modern indicator of dissolution, idealization, and porosity.",
      },
    },
    coreMeanings: [
      "Transcendence, imagination, compassion, dissolution of boundaries, longing, and illusion",
      "Where boundaries become porous and where idealization must be tested against reality",
    ],
    psychologicalFunctions: {
      coreNeed: "Spiritual resonance, compassion, and connection beyond rigid ego walls",
      healthyExpression:
        "Deep empathy, artistic/spiritual vision, forgiveness, and gentle receptivity",
      defensiveStrategy:
        "Idealizing people, fogging over hard truths, escapism, or martyr-like self-sacrifice",
      shadowExpression:
        "Self-deception, boundary collapse, projection, or disillusionment",
    },
    rulerships: {
      domiciles: [],
      detriments: [],
    },
    naturalSignifications: [
      "Dreams, cinema, poetry, mysticism, oceans, ambiguity, and idealized longing",
    ],
    horaryUses: [
      "Supplemental indicator of confusion, fog, or unrealistic expectations when closely contacting an angle or significator; never overrides Jupiter's rulership of Pisces",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Supplemental transpersonal body; never replaces Jupiter's traditional rulership of Pisces.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  Pluto: {
    name: "Pluto",
    category: "modern-outer",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Discovered in 1930; ~248-year elliptical orbit (spending ~12 to ~31 years per sign); mean daily motion ~0°00′15″.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "not-applicable",
      temperament: "Modern transpersonal planet (not part of classical septenary sect/dignity tables)",
      beneficMalefic: "modern-transpersonal",
      meanDailyMotionDeg: 0.004,
      provenance: {
        tradition: "western",
        sourceTitle: "Modern Psychological Astrology (post-1930)",
        epistemicCategory: "TRADITION",
        notes:
          "Firmament preserves Mars as traditional domicile ruler of Scorpio while recognizing Pluto as an indicator of deep psychological pressure, power, and regeneration.",
      },
    },
    coreMeanings: [
      "Deep psychological excavation, intensity, power dynamics, survival instincts, and regeneration",
      "Where superficial answers fail and honest confrontation with hidden truth is required",
    ],
    psychologicalFunctions: {
      coreNeed: "Emotional truth, depth, and resilience through transformation",
      healthyExpression:
        "Fearless psychological honesty, regenerative strength, and loyalty through crisis",
      defensiveStrategy:
        "Hyper-vigilance, secrecy, testing others' loyalty, or controlling outcomes to prevent betrayal",
      shadowExpression:
        "Power struggles, compulsion, scorched-earth reactions, or obsessive brooding",
    },
    rulerships: {
      domiciles: [],
      detriments: [],
    },
    naturalSignifications: [
      "Crisis, regeneration, underground wealth, taboo truths, and deep transformation",
    ],
    horaryUses: [
      "Supplemental indicator of extreme pressure, elimination, or hidden power dynamics when closely conjunct an angle or significator; never overrides Mars's rulership of Scorpio",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Supplemental transpersonal body; never replaces Mars's traditional rulership of Scorpio.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  "North Node": {
    name: "North Node",
    category: "lunar-node",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Ascending intersection of the Moon's orbit with the ecliptic plane; regresses westward at a mean rate of ~0°03′11″/day (~18.6-year cycle). Mean nodes are always retrograde by mathematical definition.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris (Mean Lunar Node)",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "not-applicable",
      temperament: "Increasing / Amplifying (Caput Draconis in Western/Arabic; Rahu in Vedic Jyotish)",
      beneficMalefic: "variable",
      meanDailyMotionDeg: -0.0529,
      provenance: {
        tradition: "vedic",
        sourceTitle: "Brihat Parashara Hora Shastra (Rahu); Abu Ma'shar (Caput Draconis)",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Appetite for growth, unfamiliar territory, developmental stretching, and amplification",
      "Where the person is called to build new capacity beyond old automatic habits",
    ],
    psychologicalFunctions: {
      coreNeed: "Evolution, new competence, and stepping into unlived potential",
      healthyExpression:
        "Courageous learning, conscious risk-taking, and integrating unfamiliar strengths",
      defensiveStrategy:
        "Either avoiding the growth edge out of discomfort or over-grasping with restless hunger",
      shadowExpression:
        "Insatiable craving, impostor anxiety, or obsessive fixation",
    },
    rulerships: { domiciles: [], detriments: [] },
    naturalSignifications: [
      "Growth direction, amplification, foreign or novel paths, and future-oriented development",
    ],
    horaryUses: [
      "Fortifies and increases the house or planet it conjoins (traditional Caput Draconis doctrine)",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Mean Lunar Nodes are always retrograde mathematically; Firmament strictly forbids interpreting nodal retrograde motion as an anomaly.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },

  "South Node": {
    name: "South Node",
    category: "lunar-node",
    astronomicalFact: {
      category: "FACT",
      statement:
        "Descending intersection of the Moon's orbit with the ecliptic plane, exactly 180° opposite the North Node; mean regression ~0°03′11″/day.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Swiss Ephemeris (Mean Lunar Node)",
        epistemicCategory: "FACT",
      },
    },
    traditionalQualities: {
      sect: "not-applicable",
      temperament: "Diminishing / Releasing (Cauda Draconis in Western/Arabic; Ketu in Vedic Jyotish)",
      beneficMalefic: "variable",
      meanDailyMotionDeg: -0.0529,
      provenance: {
        tradition: "vedic",
        sourceTitle: "Brihat Parashara Hora Shastra (Ketu); Abu Ma'shar (Cauda Draconis)",
        epistemicCategory: "TRADITION",
      },
    },
    coreMeanings: [
      "Ingrained instinct, default fallback reflex, mastery already acquired, and detachment/release",
      "Where a person is naturally skilled on autopilot but risks stagnation if they hide there",
    ],
    psychologicalFunctions: {
      coreNeed: "To distill wisdom from ingrained habits without remaining trapped in them",
      healthyExpression:
        "Effortless competence, spiritual non-attachment, and seasoned discernment",
      defensiveStrategy:
        "Retreating into familiar comfort zones whenever the North Node feels too demanding",
      shadowExpression:
        "Repetition of outgrown loops, resignation, or self-sabotaging withdrawal",
    },
    rulerships: { domiciles: [], detriments: [] },
    naturalSignifications: [
      "Inherited reflex, release, renunciation, spiritual distillation, and reduction",
    ],
    horaryUses: [
      "Diminishes, releases, or brings reduction/loss to the house or significator it conjoins (traditional Cauda Draconis doctrine)",
    ],
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement:
        "Always 180° opposite the North Node; never describe as anomalously retrograde.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Core Doctrine",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
};

export const SIGN_CANON_RECORDS: Record<string, SignCanonRecord> = {
  Aries: {
    name: "Aries",
    index: 0,
    degreeRange: [0, 30],
    astronomicalFact: {
      category: "FACT",
      statement: "0°00′–30°00′ tropical ecliptic longitude beginning at the vernal equinox.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Fire",
    modality: "Cardinal",
    polarity: "Diurnal / Masculine",
    domicileLord: "Mars",
    exaltation: { planet: "Sun", classicalDegree: 19 },
    detrimentLords: ["Venus"],
    fall: { planet: "Saturn", classicalDegree: 21 },
    triplicityLords: {
      dorothean: { day: "Sun", night: "Jupiter", participating: "Saturn" },
      ptolemaicNote: "Ptolemy omits Saturn and assigns Sun (day) and Jupiter (night).",
    },
    traditionalQualities: ["Hot and Dry", "Choler", "Commanding", "Equinoctial / Rapid"],
    psychologicalTheme:
      "Direct initiation, courage, self-assertion, and learning to act without confusing urgency with strength.",
    firmamentGodHouse: 1,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Ptolemy, Tetrabiblos I.11–19",
      epistemicCategory: "TRADITION",
    },
  },
  Taurus: {
    name: "Taurus",
    index: 1,
    degreeRange: [30, 60],
    astronomicalFact: {
      category: "FACT",
      statement: "30°00′–60°00′ tropical ecliptic longitude.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Earth",
    modality: "Fixed",
    polarity: "Nocturnal / Feminine",
    domicileLord: "Venus",
    exaltation: { planet: "Moon", classicalDegree: 3 },
    detrimentLords: ["Mars"],
    fall: null,
    triplicityLords: {
      dorothean: { day: "Venus", night: "Moon", participating: "Mars" },
      ptolemaicNote: "Ptolemy assigns Venus (day) and Moon (night) without participating Mars.",
    },
    traditionalQualities: ["Cold and Dry", "Melancholic", "Fertile", "Steadfast"],
    psychologicalTheme:
      "Endurance, embodied stability, material stewardship, and distinguishing grounded loyalty from stubborn inertia.",
    firmamentGodHouse: 2,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
  Gemini: {
    name: "Gemini",
    index: 2,
    degreeRange: [60, 90],
    astronomicalFact: {
      category: "FACT",
      statement: "60°00′–90°00′ tropical ecliptic longitude, reaching the northern solstice at 90°.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Air",
    modality: "Mutable",
    polarity: "Diurnal / Masculine",
    domicileLord: "Mercury",
    exaltation: null,
    detrimentLords: ["Jupiter"],
    fall: null,
    triplicityLords: {
      dorothean: { day: "Saturn", night: "Mercury", participating: "Jupiter" },
      ptolemaicNote: "Some later medieval sources list North Node (Caput Draconis) exalted at 3° Gemini.",
    },
    traditionalQualities: ["Hot and Moist", "Sanguine", "Human / Voiced", "Bicorporal (Double-bodied)"],
    psychologicalTheme:
      "Curiosity, mental agility, translation between perspectives, and avoiding scattering attention to escape emotional depth.",
    firmamentGodHouse: 3,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
  Cancer: {
    name: "Cancer",
    index: 3,
    degreeRange: [90, 120],
    astronomicalFact: {
      category: "FACT",
      statement: "90°00′–120°00′ tropical ecliptic longitude beginning at the summer solstice.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Water",
    modality: "Cardinal",
    polarity: "Nocturnal / Feminine",
    domicileLord: "Moon",
    exaltation: { planet: "Jupiter", classicalDegree: 15 },
    detrimentLords: ["Saturn"],
    fall: { planet: "Mars", classicalDegree: 28 },
    triplicityLords: {
      dorothean: { day: "Venus", night: "Mars", participating: "Moon" },
      ptolemaicNote: "Ptolemy assigns Mars as primary ruler of the Water triplicity.",
    },
    traditionalQualities: ["Cold and Moist", "Phlegmatic", "Fertile / Mute", "Solstitial (Tropical)"],
    psychologicalTheme:
      "Protective care, emotional memory, sanctuary-building, and initiating connection without retreating into a defensive shell.",
    firmamentGodHouse: 4,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Ptolemy, Tetrabiblos",
      epistemicCategory: "TRADITION",
    },
  },
  Leo: {
    name: "Leo",
    index: 4,
    degreeRange: [120, 150],
    astronomicalFact: {
      category: "FACT",
      statement: "120°00′–150°00′ tropical ecliptic longitude.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Fire",
    modality: "Fixed",
    polarity: "Diurnal / Masculine",
    domicileLord: "Sun",
    exaltation: null,
    detrimentLords: ["Saturn"],
    fall: null,
    triplicityLords: {
      dorothean: { day: "Sun", night: "Jupiter", participating: "Saturn" },
      ptolemaicNote: "Ptolemy assigns Sun (day) and Jupiter (night).",
    },
    traditionalQualities: ["Hot and Dry", "Choler", "Royal / Commanding", "Barren"],
    psychologicalTheme:
      "Wholehearted creative sovereignty, loyalty, warmth, and leading from character rather than need for applause.",
    firmamentGodHouse: 5,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Vettius Valens; Abu Ma'shar",
      epistemicCategory: "TRADITION",
    },
  },
  Virgo: {
    name: "Virgo",
    index: 5,
    degreeRange: [150, 180],
    astronomicalFact: {
      category: "FACT",
      statement: "150°00′–180°00′ tropical ecliptic longitude approaching the autumnal equinox.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Earth",
    modality: "Mutable",
    polarity: "Nocturnal / Feminine",
    domicileLord: "Mercury",
    exaltation: { planet: "Mercury", classicalDegree: 15 },
    detrimentLords: ["Jupiter"],
    fall: { planet: "Venus", classicalDegree: 27 },
    triplicityLords: {
      dorothean: { day: "Venus", night: "Moon", participating: "Mars" },
      ptolemaicNote: "Unique classical sign where the domicile lord (Mercury) is also exalted.",
    },
    traditionalQualities: ["Cold and Dry", "Melancholic", "Human / Voiced", "Bicorporal"],
    psychologicalTheme:
      "Precision, practical devotion, craft, and refining what matters without turning discernment into anxious perfectionism.",
    firmamentGodHouse: 6,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
  Libra: {
    name: "Libra",
    index: 6,
    degreeRange: [180, 210],
    astronomicalFact: {
      category: "FACT",
      statement: "180°00′–210°00′ tropical ecliptic longitude beginning at the autumnal equinox.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Air",
    modality: "Cardinal",
    polarity: "Diurnal / Masculine",
    domicileLord: "Venus",
    exaltation: { planet: "Saturn", classicalDegree: 21 },
    detrimentLords: ["Mars"],
    fall: { planet: "Sun", classicalDegree: 19 },
    triplicityLords: {
      dorothean: { day: "Saturn", night: "Mercury", participating: "Jupiter" },
      ptolemaicNote: "Saturn's exaltation in Libra shows that true relational balance requires fair structure and accountability.",
    },
    traditionalQualities: ["Hot and Moist", "Sanguine", "Human / Equinoctial"],
    psychologicalTheme:
      "Reciprocity, justice, relational calibration, and choosing honest equity over conflict-avoidant appeasement.",
    firmamentGodHouse: 7,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Ptolemy, Tetrabiblos",
      epistemicCategory: "TRADITION",
    },
  },
  Scorpio: {
    name: "Scorpio",
    index: 7,
    degreeRange: [210, 240],
    astronomicalFact: {
      category: "FACT",
      statement: "210°00′–240°00′ tropical ecliptic longitude.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Water",
    modality: "Fixed",
    polarity: "Nocturnal / Feminine",
    domicileLord: "Mars",
    modernCoRuler: "Pluto",
    exaltation: null,
    detrimentLords: ["Venus"],
    fall: { planet: "Moon", classicalDegree: 3 },
    triplicityLords: {
      dorothean: { day: "Venus", night: "Mars", participating: "Moon" },
      ptolemaicNote: "Nocturnal domicile of Mars: concentrated, strategic, and unyielding under pressure.",
    },
    traditionalQualities: ["Cold and Moist", "Phlegmatic", "Fixed / Silent", "Fertile"],
    psychologicalTheme:
      "Emotional truth, unflinching loyalty, strategic endurance, and learning to trust without testing or armoring the heart.",
    firmamentGodHouse: 8,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
  Sagittarius: {
    name: "Sagittarius",
    index: 8,
    degreeRange: [240, 270],
    astronomicalFact: {
      category: "FACT",
      statement: "240°00′–270°00′ tropical ecliptic longitude approaching the winter solstice.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Fire",
    modality: "Mutable",
    polarity: "Diurnal / Masculine",
    domicileLord: "Jupiter",
    exaltation: null,
    detrimentLords: ["Mercury"],
    fall: null,
    triplicityLords: {
      dorothean: { day: "Sun", night: "Jupiter", participating: "Saturn" },
      ptolemaicNote: "Some medieval Arabic/Latin texts place South Node (Cauda Draconis) exalted at 3° Sagittarius.",
    },
    traditionalQualities: ["Hot and Dry", "Choler", "Bicorporal (Double-bodied)"],
    psychologicalTheme:
      "Search for truth, ethical conviction, long-range vision, and anchoring high ideals in lived follow-through.",
    firmamentGodHouse: 9,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
  Capricorn: {
    name: "Capricorn",
    index: 9,
    degreeRange: [270, 300],
    astronomicalFact: {
      category: "FACT",
      statement: "270°00′–300°00′ tropical ecliptic longitude beginning at the winter solstice.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Earth",
    modality: "Cardinal",
    polarity: "Nocturnal / Feminine",
    domicileLord: "Saturn",
    exaltation: { planet: "Mars", classicalDegree: 28 },
    detrimentLords: ["Moon"],
    fall: { planet: "Jupiter", classicalDegree: 15 },
    triplicityLords: {
      dorothean: { day: "Venus", night: "Moon", participating: "Mars" },
      ptolemaicNote: "Mars is exalted in Capricorn because disciplined Saturnian structure channels raw drive into enduring achievement.",
    },
    traditionalQualities: ["Cold and Dry", "Melancholic", "Solstitial (Tropical)", "Earthly"],
    psychologicalTheme:
      "Mastery, stewardship, long-range architecture, and allowing human warmth alongside duty and self-reliance.",
    firmamentGodHouse: 10,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
  Aquarius: {
    name: "Aquarius",
    index: 10,
    degreeRange: [300, 330],
    astronomicalFact: {
      category: "FACT",
      statement: "300°00′–330°00′ tropical ecliptic longitude.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Air",
    modality: "Fixed",
    polarity: "Diurnal / Masculine",
    domicileLord: "Saturn",
    modernCoRuler: "Uranus",
    exaltation: null,
    detrimentLords: ["Sun"],
    fall: null,
    triplicityLords: {
      dorothean: { day: "Saturn", night: "Mercury", participating: "Jupiter" },
      ptolemaicNote: "Diurnal, airy domicile of Saturn: principled, systemic, objective, and structural.",
    },
    traditionalQualities: ["Hot and Moist", "Sanguine", "Human / Voiced", "Fixed"],
    psychologicalTheme:
      "Principled independence, systemic vision, civic loyalty, and staying emotionally present rather than retreating into cool abstraction.",
    firmamentGodHouse: 11,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
  Pisces: {
    name: "Pisces",
    index: 11,
    degreeRange: [330, 360],
    astronomicalFact: {
      category: "FACT",
      statement: "330°00′–360°00′ tropical ecliptic longitude completing the ecliptic circle.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Tropical Ecliptic Coordinate System",
        epistemicCategory: "FACT",
      },
    },
    element: "Water",
    modality: "Mutable",
    polarity: "Nocturnal / Feminine",
    domicileLord: "Jupiter",
    modernCoRuler: "Neptune",
    exaltation: { planet: "Venus", classicalDegree: 27 },
    detrimentLords: ["Mercury"],
    fall: { planet: "Mercury", classicalDegree: 15 },
    triplicityLords: {
      dorothean: { day: "Venus", night: "Mars", participating: "Moon" },
      ptolemaicNote: "Nocturnal, watery domicile of Jupiter and exaltation of Venus: empathetic, integrative, and spiritually receptive.",
    },
    traditionalQualities: ["Cold and Moist", "Phlegmatic", "Fertile / Mute", "Bicorporal"],
    psychologicalTheme:
      "Compassion, synthesis of whole-life patterns, intuitive depth, and maintaining clear boundaries so empathy does not become self-loss.",
    firmamentGodHouse: 12,
    provenance: {
      tradition: "hellenistic",
      sourceTitle: "Dorotheus of Sidon; Vettius Valens",
      epistemicCategory: "TRADITION",
    },
  },
};

export const MODERN_PSYCHOLOGICAL_PROVENANCE = {
  tradition: "modern-psychological" as const,
  sourceTitle:
    "Firmament Human Reality & Psychological Synthesis Layer (distinguished from classical/medieval doctrine)",
  authorOrEra: "20th–21st Century Depth & Humanistic Synthesis",
  epistemicCategory: "MODERN_SYNTHESIS" as const,
  notes:
    "Psychological needs, healthy expressions, defensive strategies, and shadow expressions belong to the modern human-reality translation layer and are never attributed as claims of ancient Hellenistic, Vedic, or medieval Arabic texts.",
};

/**
 * Deterministically synthesizes any Planet + Sign combination using the local
 * Firmament Canon records so the AI never has to rediscover basic sign placement doctrine,
 * while explicitly separating [TRADITION] dignity/rulership doctrine from [MODERN_SYNTHESIS] psychological dynamics.
 */
export function synthesizePlanetInSign(planetName: string, signName: string): string {
  const planet = PLANET_CANON_RECORDS[planetName];
  const sign = SIGN_CANON_RECORDS[signName];
  if (!planet || !sign) {
    return `${planetName} in ${signName} operates through the ${signName} field.`;
  }

  const dignityParts: string[] = [];
  if (sign.domicileLord === planetName) {
    dignityParts.push(
      `in its own domicile (${signName}), operating with full authority, autonomy, and natural resources`
    );
  }
  if (sign.exaltation?.planet === planetName) {
    dignityParts.push(
      `exalted in ${signName} (classical degree ${sign.exaltation.classicalDegree}°), elevated in visibility, honor, and high standards`
    );
  }
  if (sign.detrimentLords.includes(planetName)) {
    dignityParts.push(
      `in detriment in ${signName} (opposite its home sign, ruled by ${sign.domicileLord}), requiring conscious adaptation, counter-cultural effort, and working with another planet's rules`
    );
  }
  if (sign.fall?.planet === planetName) {
    dignityParts.push(
      `in fall in ${signName} (classical degree ${sign.fall.classicalDegree}°), where its natural impulse feels scrutinized or unsupported until it develops quiet resilience`
    );
  }
  if (dignityParts.length === 0) {
    dignityParts.push(
      `hosted in the sign of ${sign.domicileLord}, taking on ${sign.modality.toLowerCase()} ${sign.element.toLowerCase()} pacing`
    );
  }

  return `[TRADITION] ${planetName} in ${signName} (${sign.modality} ${sign.element}, domicile lord ${sign.domicileLord}): ${planetName} is ${dignityParts.join(" and ")}. [MODERN_SYNTHESIS · Human Reality Layer] Psychological dynamic: ${planet.psychologicalFunctions.coreNeed} is pursued through ${sign.psychologicalTheme.charAt(0).toLowerCase() + sign.psychologicalTheme.slice(1)} Healthy expression: ${planet.psychologicalFunctions.healthyExpression}. Defensive risk under pressure: ${planet.psychologicalFunctions.defensiveStrategy}.`;
}
