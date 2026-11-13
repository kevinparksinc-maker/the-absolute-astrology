/**
 * Sumerian celestial foundations.
 *
 * HISTORICAL SCOPE: The associations below are attested in Sumerian religious
 * texts and their Mesopotamian continuation. They are not a recovered Sumerian
 * natal horoscope system, planetary dignity table, or predictive algorithm.
 * The app's contemporary psychological reading is explicitly distinguished
 * from the historical correspondence.
 *
 * Sources:
 * - Samuel Noah Kramer, History Begins at Sumer, chapter on Sumerian cosmology.
 * - Francesca Rochberg, The Heavenly Writing (2004), on Mesopotamian
 *   celestial divination and its historical development.
 * - Oxford Research Encyclopedia of Planetary Science (2020),
 *   "The Moon and Planets in Ancient Mesopotamia".
 */
export const SUMERIAN_CELESTIAL_SOURCE_ID = "sumerian-celestial-foundations";
export const SUMERIAN_CELESTIAL_SOURCE_TITLE =
  "Sumerian celestial associations (Kramer; Rochberg; Oxford Research Encyclopedia of Planetary Science)";

export const SUMERIAN_CELESTIAL_ASSOCIATIONS = {
  Venus: {
    name: "Inanna",
    continuity: "Later Mesopotamian Ishtar",
    historicalMeaning: "Venus, desire, power, and conflict in Sumerian celestial and literary traditions.",
    modernInterpretiveLens: "Examine how attraction, values, assertiveness and sovereignty reinforce or conflict with one another.",
    limit: "This is a modern symbolic reading, not an extant Sumerian natal prediction. Morning/evening-star status needs independently calculated visibility data.",
  },
  Moon: {
    name: "Nanna",
    continuity: "Later Mesopotamian Sin",
    historicalMeaning: "The Moon, lunar cycles and calendrical order.",
    modernInterpretiveLens: "Examine recurring needs, habits, reflection, and how personal rhythms influence decisions.",
    limit: "No ancient Sumerian lunar-mansion horoscope or phase-based prediction is inferred.",
  },
  Sun: {
    name: "Utu",
    continuity: "Later Mesopotamian Shamash",
    historicalMeaning: "The Sun, light, justice, and the revelation of what is hidden.",
    modernInterpretiveLens: "Examine integrity, accountability, visibility and the consequences of choices.",
    limit: "This is an explicitly modern symbolic synthesis, not a preserved Sumerian solar natal rule.",
  },
} as const;

export type SumerianCelestialBody = keyof typeof SUMERIAN_CELESTIAL_ASSOCIATIONS;

/** Enlil is NOT assigned to a planet. The Path of Enlil is later
 * Mesopotamian celestial geography; a separate historical star-list /
 * rising-region model would be needed before issuing positional judgments.
 */
export const ENLIL_HISTORICAL_NOTE =
  "Enlil: Sumerian deity of wind and authority; later Babylonian Path of Enlil is a northern celestial region, not a natal planet.";
