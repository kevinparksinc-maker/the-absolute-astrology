import { translationFor } from "../../astrologyCore";
import { PLANET_CANON_RECORDS } from "./planetsAndSigns";
import type { HouseCanonRecord } from "./types";

export const HOUSE_CANON_RECORDS: Record<number, HouseCanonRecord> = {
  1: {
    house: 1,
    angularity: "Angular (Pivot)",
    traditionalTitle: "The Helm (Horoskopos)",
    LatinName: "Vita (Life)",
    planetaryJoy: "Mercury",
    coreTopics: [
      "Identity, physical body, vitality, temperament, and self-presentation",
      "First moves, personal agency, and how the person meets the world",
    ],
    horarySignifications: [
      "The Querent (the person asking the question), their body, life force, and immediate agency",
    ],
    psychologicalField:
      "How you step into a room, initiate action, and defend your right to exist as yourself.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 1 (0°–30° Aries): The universal field of initiation, emergence, and primary impulse.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 1 (0°–30° from the local Ascendant): Personal embodiment, immediate agency, and visible selfhood.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Placements in Agent House 1 bring their God House collective field directly into the person's posture, face, and first response.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  2: {
    house: 2,
    angularity: "Succedent",
    traditionalTitle: "Gate of Hades",
    LatinName: "Lucrum (Wealth / Gain)",
    planetaryJoy: null,
    coreTopics: [
      "Money, moveable possessions, livelihood, resources, and practical self-sufficiency",
      "Felt self-worth, material security, and what one values enough to steward",
    ],
    horarySignifications: [
      "The querent's money, movable property, liquid assets, and immediate financial support",
    ],
    psychologicalField:
      "How you measure your own worth, earn your keep, and stabilize yourself materially and emotionally.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 2 (30°–60° Taurus): The collective field of substance, value, and material stewardship.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 2 (30°–60° from Ascendant): Personal income, pricing, possessions, and self-worth.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Routes the planet's collective God House theme into concrete income choices, material security, and self-valuation.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  3: {
    house: 3,
    angularity: "Cadent",
    traditionalTitle: "Goddess (Dea)",
    LatinName: "Fratres (Siblings)",
    planetaryJoy: "Moon",
    coreTopics: [
      "Everyday communication, speech, writing, siblings, neighbors, and local environment",
      "Short journeys, daily errands, practical learning, and immediate mental habits",
    ],
    horarySignifications: [
      "Siblings, cousins, neighbors, letters, messages, rumors, contracts, and short trips",
    ],
    psychologicalField:
      "How you talk to yourself and others in ordinary moments, process daily signals, and navigate your immediate environment.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 3 (60°–90° Gemini): The collective field of language, exchange, and local connection.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 3 (60°–90° from Ascendant): Personal speech, siblings, study, and everyday messaging.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Routes the planet's collective God House theme into everyday conversations, sibling/neighbor dynamics, and practical learning.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  4: {
    house: 4,
    angularity: "Angular (Pivot)",
    traditionalTitle: "Subterranean Pivot (Hypogeion)",
    LatinName: "Genitor (Parents / Foundations)",
    planetaryJoy: null,
    coreTopics: [
      "Home, family of origin, ancestry, father/parents, land, and private foundations",
      "The emotional root system, inner sanctuary, and how matters conclude",
    ],
    horarySignifications: [
      "Parents (especially father in traditional texts), real estate, land, houses, buried/lost treasures, and the final outcome (end of the matter)",
    ],
    psychologicalField:
      "What you inherited from home, where you go when the door is closed, and what makes you feel safe at the root.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 4 (90°–120° Cancer): The collective field of roots, ancestry, shelter, and foundational memory.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 4 (90°–120° from Ascendant): Private home, family history, property, and emotional foundation.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Anchors the planet's collective God House theme deep inside private domestic life, family memory, and foundational security.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  5: {
    house: 5,
    angularity: "Succedent",
    traditionalTitle: "Good Fortune (Agathe Tyche)",
    LatinName: "Nati (Children / Pleasure)",
    planetaryJoy: "Venus",
    coreTopics: [
      "Creative self-expression, children, romance, courtship, play, joy, and risk-taking",
      "What one creates from the heart and offers to the world for delight",
    ],
    horarySignifications: [
      "Children, pregnancy, romantic courtship, creative projects, entertainment, and speculative ventures",
    ],
    psychologicalField:
      "How you play, take creative or romantic risks, and allow yourself to feel joy without guilt.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 5 (120°–150° Leo): The collective field of creative authorship, generative warmth, and legacy.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 5 (120°–150° from Ascendant): Personal creativity, romance, children, and pleasure.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Channels the planet's collective God House theme into personal creative output, romance, and generative risk.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  6: {
    house: 6,
    angularity: "Cadent",
    traditionalTitle: "Bad Fortune (Kake Tyche)",
    LatinName: "Valetudo (Health / Labor)",
    planetaryJoy: "Mars",
    coreTopics: [
      "Daily labor, service, craft, discipline, physical health routines, and problem-solving",
      "Subordinates, apprentices, small animals, and the friction of daily maintenance",
    ],
    horarySignifications: [
      "Illness, physical ailments, employees, coworkers, daily chores, pets/small animals, and practical repair",
    ],
    psychologicalField:
      "How you handle daily stress, maintain your body and craft, and respond when life requires unglamorous discipline.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 6 (150°–180° Virgo): The collective field of refinement, service, maintenance, and practical order.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 6 (150°–180° from Ascendant): Personal work habits, health routines, duties, and repair.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Translates the planet's collective God House theme into daily habits, bodily upkeep, and practical problem-solving.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  7: {
    house: 7,
    angularity: "Angular (Pivot)",
    traditionalTitle: "The Setting Place (Dysis)",
    LatinName: "Uxor (Spouse / Partner)",
    planetaryJoy: null,
    coreTopics: [
      "Committed partnership, marriage, business partners, contracts, and one-to-one encounter",
      "Open rivals, legal opponents, and the qualities mirrored back by another person",
    ],
    horarySignifications: [
      "Spouses, romantic partners, business partners, clients, open enemies/opponents, and the astrologer when relevant",
    ],
    psychologicalField:
      "Who you draw across the table from you, how you negotiate commitment, and what you project onto partners.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 7 (180°–210° Libra): The collective field of reciprocity, covenant, and encounter with the Other.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 7 (180°–210° from Ascendant): Personal partnerships, contracts, and relational mirroring.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Routes the planet's collective God House theme directly into committed partnerships, agreements, and interpersonal mirrors.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  8: {
    house: 8,
    angularity: "Succedent",
    traditionalTitle: "The Idle Place (Epikataphora)",
    LatinName: "Mors (Transformation / Shared Debt)",
    planetaryJoy: null,
    coreTopics: [
      "Shared finances, debt, taxes, inheritance, and the partner's resources",
      "Psychological vulnerability, trust under high stakes, grief, loss, and deep regeneration",
    ],
    horarySignifications: [
      "The partner's money (2nd from the 7th), debts, loans, taxes, wills, inheritances, fear, and mortality",
    ],
    psychologicalField:
      "What happens when you cannot stay in control alone: shared entanglements, deep intimacy, fear of betrayal, and what must be shed.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 8 (210°–240° Scorpio): The collective field of shared obligation, deep entanglement, and regeneration.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 8 (210°–240° from Ascendant): Joint finances, intimacy, vulnerability, and transformation.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Concentrates the planet's collective God House theme in shared resources, emotional vulnerability, and high-stakes trust.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  9: {
    house: 9,
    angularity: "Cadent",
    traditionalTitle: "God (Theos)",
    LatinName: "Pietas (Faith / Wisdom / Pilgrimage)",
    planetaryJoy: "Sun",
    coreTopics: [
      "Philosophy, religion, higher education, law, publishing, mentorship, and long journeys",
      "The search for overarching truth, ethics, and worldview",
    ],
    horarySignifications: [
      "Long-distance travel, foreign lands, universities, courts/law, clergy, dreams, prophecies, and higher wisdom",
    ],
    psychologicalField:
      "What gives your life moral coherence and meaning when immediate circumstances feel confusing.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 9 (240°–270° Sagittarius): The collective field of higher truth, law, wisdom, and horizon-expansion.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 9 (240°–270° from Ascendant): Personal convictions, higher study, teaching, and long journeys.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Routes the planet's collective God House theme into personal belief systems, teaching, study, and long-range perspective.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  10: {
    house: 10,
    angularity: "Angular (Pivot)",
    traditionalTitle: "Midheaven (Mesouranema)",
    LatinName: "Regnum (Vocation / Authority)",
    planetaryJoy: null,
    coreTopics: [
      "Vocation, career, public reputation, authority, leadership, and visible contribution",
      "How a person is judged by the public and what they build in the world",
    ],
    horarySignifications: [
      "Career, profession, bosses, kings/judges, government authority, honors, and public standing",
    ],
    psychologicalField:
      "Your relationship to authority, ambition, public accountability, and the legacy of your work.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 10 (270°–300° Capricorn): The collective field of structural authority, public order, and vocation.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 10 (270°–300° from Ascendant): Personal career, public role, reputation, and visible mastery.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Makes the planet's collective God House theme publicly visible through career, leadership, and reputation.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  11: {
    house: 11,
    angularity: "Succedent",
    traditionalTitle: "Good Spirit (Agathos Daimon)",
    LatinName: "Benefacta (Friends / Hopes)",
    planetaryJoy: "Jupiter",
    coreTopics: [
      "Alliances, friends, communities, networks, patrons, and shared aspirations",
      "Gains from one's vocation (2nd from the 10th) and long-range hopes",
    ],
    horarySignifications: [
      "Friends, allies, benefactors, hopes, wishes, groups, and income derived from career/authority",
    ],
    psychologicalField:
      "Where you find your people, build alliances, and connect your personal gifts to a larger future.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 11 (300°–330° Aquarius): The collective field of alliance, shared future, and systemic fellowship.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 11 (300°–330° from Ascendant): Personal friendships, networks, audiences, and long-range hopes.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Channels the planet's collective God House theme into friendships, community alliances, and long-term aims.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
  12: {
    house: 12,
    angularity: "Cadent",
    traditionalTitle: "Bad Spirit (Kakos Daimon)",
    LatinName: "Carcer (Solitude / Hidden Matters)",
    planetaryJoy: "Saturn",
    coreTopics: [
      "Solitude, retreat, behind-the-scenes preparation, subconscious patterns, and hidden burdens",
      "Self-undoing, secret adversaries, spiritual surrender, and gestation before rebirth",
    ],
    horarySignifications: [
      "Hidden enemies, secrets, confinement, exile, self-undoing, large animals, and matters kept out of view",
    ],
    psychologicalField:
      "What operates beneath conscious awareness: where you retreat to heal, or where unexamined fears quietly sabotage your direct agency.",
    godViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "God House 12 (330°–360° Pisces): The collective field of completion, dissolution, and hidden gestation.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    agentViewDefinition: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 12 (330°–360° from Ascendant): The 1st-house undoing/withdrawal channel—private labor, subconscious pressure, and preparation outside public view.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    godToAgentTranslationRule: {
      category: "FIRMAMENT_CANON",
      statement:
        "Agent House 12 withdraws the planet's God House collective field from immediate outward agency, requiring private incubation, boundary-awareness, and inner integration before outward action.",
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Dual-Frame Architecture",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
  },
};

/**
 * Deterministically synthesizes any Planet + House placement, including accidental
 * house angularity, planetary joy, and the God View → Agent View translation.
 */
export function synthesizePlanetInHouse(
  planetName: string,
  displayedHouse: number,
  godHouse?: number,
  agentHouse?: number
): { houseSynthesis: string; godToAgentNote?: string } {
  const planet = PLANET_CANON_RECORDS[planetName];
  const house = HOUSE_CANON_RECORDS[displayedHouse];
  if (!house) {
    return {
      houseSynthesis: `${planetName} operates in House ${displayedHouse}.`,
    };
  }

  const joyNote =
    house.planetaryJoy === planetName
      ? ` ${planetName} is in its traditional Planetary Joy in the ${displayedHouse}th house (${house.traditionalTitle}), giving it natural resonance and ease in this domain.`
      : "";

  const angularityNote =
    house.angularity === "Angular (Pivot)"
      ? "Because this is an Angular (Pivot) house, the planet acts with high visibility, immediacy, and unmistakable impact in life."
      : house.angularity === "Succedent"
        ? "Because this is a Succedent house, the planet builds steady, cumulative results over time through resourcefulness and persistence."
        : "Because this is a Cadent house, the planet works first through mental processing, preparation, adaptation, or behind-the-scenes movement before outer results crystallize.";

  const planetMeaning = planet
    ? planet.coreMeanings[0].charAt(0).toLowerCase() +
      planet.coreMeanings[0].slice(1)
    : "its planetary nature";

  const houseSynthesis = `${planetName} in House ${displayedHouse} (${house.traditionalTitle} · ${house.angularity}): Channels ${planetMeaning} into ${house.coreTopics[0].toLowerCase()}. ${angularityNote}${joyNote} Psychological field: ${house.psychologicalField}`;

  if (godHouse != null && agentHouse != null) {
    const dual = translationFor(planetName, godHouse, agentHouse);
    return {
      houseSynthesis,
      godToAgentNote: `${dual.translation} ${dual.synthesis}`,
    };
  }

  return { houseSynthesis };
}
