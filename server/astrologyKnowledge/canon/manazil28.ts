import { MANAZIL, normalizeLongitude } from "../../../shared/hybrid";
import type { ManzilCanonRecord } from "./types";

const MANZIL_SPAN = 360 / 28; // ~12.85714286°

const MANZIL_DOCTRINE: Array<{
  variants: string[];
  translation: string;
  quality: ManzilCanonRecord["traditionalQuality"];
  themes: string[];
  elections: string;
  natalMeaning: string;
}> = [
  { variants: ["Al-Sharatain", "Al-Nath"], translation: "The Two Signs / Horns of the Ram", quality: "Mixed / Conditional", themes: ["initiation", "cutting ties", "bold departure"], elections: "Journeys, decisive beginnings, and breaking stagnation.", natalMeaning: "Strong pioneering impulse; acts decisively when a boundary must be crossed, though must guard against impatience." },
  { variants: ["Al-Butain"], translation: "The Little Belly (of the Ram)", quality: "Fortunate", themes: ["hidden resource", "reconciliation", "finding support"], elections: "Reconciling with authority, cultivating land, and uncovering hidden value.", natalMeaning: "Quiet resourcefulness and ability to win support or calm tension after an initial disruption." },
  { variants: ["Al-Thurayya"], translation: "The Many Little Ones (Pleiades)", quality: "Fortunate", themes: ["abundance", "fellowship", "craft and study"], elections: "Trade, partnerships, learning, and gathering community.", natalMeaning: "Relational warmth, love of craft and knowledge, and thriving within a trusted circle." },
  { variants: ["Al-Dabaran"], translation: "The Follower (Aldebaran)", quality: "Unfortunate", themes: ["contest", "intense friction", "integrity under fire"], elections: "Traditional texts warn against marriage or building here; suited only to confronting entrenched obstacles.", natalMeaning: "High-intensity drive connected to Royal Star Aldebaran; demands absolute moral integrity when handling conflict." },
  { variants: ["Al-Haq’ah", "Al-Haq'a"], translation: "The White Spot (Head of Orion)", quality: "Mixed / Conditional", themes: ["instruction", "travel", "patronage"], elections: "Seeking favor from teachers or leaders, study, and travel.", natalMeaning: "Intellectual clarity, curiosity, and capacity to earn respect through skill and clear speech." },
  { variants: ["Al-Han’ah", "Al-Han'a"], translation: "The Brand / Mark (Feet of Gemini)", quality: "Fortunate", themes: ["kinship", "alliance", "mutual protection"], elections: "Forming alliances, benevolence between partners, and cooperative ventures.", natalMeaning: "Instinctive loyalty to allies and strong desire for reciprocal, protective bonds." },
  { variants: ["Al-Dhira’", "Al-Dhira"], translation: "The Forearm / Outstretched Arm", quality: "Fortunate", themes: ["gain", "friendship", "safe passage"], elections: "Commerce, reconciliation, and approaching leaders.", natalMeaning: "Generous reach, diplomatic skill, and ability to turn goodwill into practical opportunity." },
  { variants: ["Al-Nathrah", "Al-Nathra"], translation: "The Crib / Tip of the Nose (Praesepe)", quality: "Fortunate", themes: ["nurture", "victory", "affection"], elections: "Love, friendship, safe travel, and solidifying domestic security.", natalMeaning: "Protective warmth, strong family/pack instinct, and fierce defense of those in one's care." },
  { variants: ["Al-Tarf"], translation: "The Glance / Eye of the Lion", quality: "Unfortunate", themes: ["vigilance", "caution", "boundary defense"], elections: "Traditional warning against naive trust or hasty travel; favors defensive vigilance.", natalMeaning: "Sharp situational awareness and sensitivity to insincerity; learns to set firm boundaries without bitterness." },
  { variants: ["Al-Jabhah", "Al-Jabha"], translation: "The Forehead of the Lion (Regulus)", quality: "Fortunate", themes: ["sovereignty", "healing", "enduring alliances"], elections: "Strengthening buildings, love, mutual help, and leadership.", natalMeaning: "Natural dignity and leadership presence tied to the Lion's brow; thrives when authority is used to strengthen others." },
  { variants: ["Al-Zubrah", "Al-Kharatain"], translation: "The Mane of the Lion", quality: "Fortunate", themes: ["respect", "commerce", "rescue"], elections: "Trade, marriage, and honorable advancement.", natalMeaning: "Steadfast pride, protective generosity, and capacity to command respect in public arenas." },
  { variants: ["Al-Sarfah", "Al-Sarfa"], translation: "The Changer (of the Weather)", quality: "Fortunate", themes: ["harvest", "turning point", "betterment"], elections: "Agriculture, building, and advancing trusted subordinates.", natalMeaning: "Marks seasonal and personal turning points; skilled at ripening long effort into tangible results." },
  { variants: ["Al-Awwa’", "Al-Awwa"], translation: "The Barker / Howler (Wings of Virgo)", quality: "Fortunate", themes: ["benevolence", "freedom", "union"], elections: "Voyages, marriage, harvest, and seeking counsel.", natalMeaning: "Persuasive voice, relational discernment, and desire for liberating, honest companionship." },
  { variants: ["Al-Simak", "Al-Simak al-A'zal"], translation: "The Unarmed (Spica)", quality: "Fortunate", themes: ["grace", "artistry", "protection"], elections: "Marital harmony, study, healing, and skilled craft.", natalMeaning: "Aligned with Spica's gift: natural talent, refinement, and protection through skill rather than force." },
  { variants: ["Al-Ghafr"], translation: "The Covering / Veil", quality: "Fortunate", themes: ["uncovering hidden value", "goodwill", "quiet study"], elections: "Digging/excavating, establishing friendships, and discreet agreements.", natalMeaning: "Perceptive mind that looks beneath appearances and values quiet, trustworthy alliances." },
  { variants: ["Al-Zubana"], translation: "The Claws / Scales of the Scorpion", quality: "Mixed / Conditional", themes: ["redress", "liberation", "weighing cost"], elections: "Freeing the captive or settling accounts; cautious in new partnerships.", natalMeaning: "Acute sense of fairness and balance; quick to notice when an exchange has become one-sided." },
  { variants: ["Al-Iklil"], translation: "The Crown (of the Forehead of Scorpio)", quality: "Fortunate", themes: ["durable friendship", "security", "protection"], elections: "Securing property, lasting friendships, and protective measures.", natalMeaning: "Builds enduring, crisis-tested loyalty; values friends and partners who stand firm under pressure." },
  { variants: ["Al-Qalb"], translation: "The Heart of the Scorpion (Antares)", quality: "Mixed / Conditional", themes: ["courage", "defending against rivalry", "deep resolve"], elections: "Guarding against discord, building strongholds, and strategic defense.", natalMeaning: "Aligned with Royal Star Antares: intense passion, strategic focus, and the need to channel intensity into noble purpose rather than obsession." },
  { variants: ["Al-Shaula", "Al-Shawlah"], translation: "The Raised Sting (of the Scorpion)", quality: "Mixed / Conditional", themes: ["decisive strike", "completing difficult work", "harvest"], elections: "Pressing toward a goal, agriculture, and decisive action.", natalMeaning: "Incisive honesty and willingness to name what others avoid; potent capacity for breakthrough when disciplined." },
  { variants: ["Al-Na’am", "Al-Na'am"], translation: "The Ostriches / Beams", quality: "Fortunate", themes: ["taming wildness", "swift journey", "fellowship"], elections: "Travel, domesticating effort, and bringing people together.", natalMeaning: "Combines adventurous reach with practical discipline that brings big ambitions home." },
  { variants: ["Al-Baldah", "Al-Balda"], translation: "The City / Empty Space", quality: "Mixed / Conditional", themes: ["solitude", "structural completion", "sobriety"], elections: "Harvest, construction, and serious long-term commitments.", natalMeaning: "Self-contained realism; comfortable standing in empty or uncharted space to build something lasting." },
  { variants: ["Sa’d al-Dhabih"], translation: "The Lucky Star of the Slaughterer", quality: "Mixed / Conditional", themes: ["sacrifice for freedom", "healing", "escape from constraint"], elections: "Medical care, releasing burdens, and breaking free of entrapment.", natalMeaning: "Willingness to make a hard, clean sacrifice in order to preserve integrity and freedom." },
  { variants: ["Sa’d Bula’"], translation: "The Lucky Star of the Swallower", quality: "Mixed / Conditional", themes: ["absorption", "healing", "release"], elections: "Remedies, clearing old debts, and separation from harmful ties.", natalMeaning: "Capacity to digest difficult experience and metabolize pressure into quiet wisdom." },
  { variants: ["Sa’d al-Su’ud"], translation: "The Luckiest of the Lucky", quality: "Fortunate", themes: ["auspicious growth", "harmony", "vitality"], elections: "Marriage, new enterprises, leadership, and friendship.", natalMeaning: "Restorative warmth, steady hope, and ability to bring renewal after a long winter." },
  { variants: ["Sa’d al-Akhbiya"], translation: "The Lucky Star of the Tents / Hidden Things", quality: "Fortunate", themes: ["shelter", "emerging life", "protection"], elections: "Construction, messages, and protecting one's household.", natalMeaning: "Nurtures fledgling ideas and people in private shelter until they are strong enough to emerge." },
  { variants: ["Al-Fargh al-Muqaddam"], translation: "The First Spout of the Water-Bucket", quality: "Fortunate", themes: ["union", "affection", "safe deliverance"], elections: "Love, partnership, and healing.", natalMeaning: "Generous outpouring of goodwill, creativity, and capacity to unite disparate people." },
  { variants: ["Al-Fargh al-Mu’akhkhar"], translation: "The Second Spout of the Water-Bucket", quality: "Mixed / Conditional", themes: ["increase of trade", "harvest", "fluidity"], elections: "Commerce, healing, and completing agreements.", natalMeaning: "Adaptable resourcefulness; must keep commitments anchored so energy does not spill outward." },
  { variants: ["Al-Risha/Batn al-Hut", "Al-Risha", "Batn al-Hut"], translation: "The Cord / Belly of the Fish", quality: "Fortunate", themes: ["tying the knot", "safe return", "synthesis"], elections: "Marriage, trade, safe completion of voyages, and gathering treasure.", natalMeaning: "Completes the 28-mansion circle by tying together loose threads into enduring meaning and safe harbor." },
];

export const MANZIL_CANON_RECORDS: ManzilCanonRecord[] = MANAZIL.map((name, idx) => {
  const startDeg = Number((idx * MANZIL_SPAN).toFixed(4));
  const endDeg = Number(((idx + 1) * MANZIL_SPAN).toFixed(4));
  const doc = MANZIL_DOCTRINE[idx];

  return {
    index: idx + 1,
    name,
    transliterationVariants: doc.variants,
    englishTranslation: doc.translation,
    degreeRange: [startDeg, endDeg],
    astronomicalFact: {
      category: "FACT",
      statement: `Mansion ${idx + 1} of 28 equal ecliptic divisions (12°51′26″ each), spanning ${startDeg.toFixed(2)}° to ${endDeg.toFixed(2)}° from 0° Aries.`,
      provenance: {
        tradition: "firmament",
        sourceTitle: "28-Fold Lunar Ecliptic Division (360° / 28)",
        epistemicCategory: "FACT",
      },
    },
    traditionalQuality: doc.quality,
    traditionalThemes: doc.themes,
    traditionalElections: doc.elections,
    natalAndPsychologicalMeaning: doc.natalMeaning,
    firmamentCanonNote: {
      category: "FIRMAMENT_CANON",
      statement: `Firmament locks the 28 Manazil to the tropical 0° Aries frame (${startDeg.toFixed(2)}°–${endDeg.toFixed(2)}°), preserving the medieval Arabic tropicalized mansion wheel (Picatrix / Ibn Arabi) while noting historical pre-Islamic sidereal asterism origins.`,
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Hybrid Zodiac Canon",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "arabic",
      sourceTitle:
        "Ghayat al-Hakim (Picatrix) Book I ch. 4; Al-Biruni, Book of Instruction; Ibn Arabi, Mansions of the Moon",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote:
        "Pre-Islamic anwa' traditions anchored mansions to visible star asterisms; medieval Western/Andalusian Arabic astrology (Picatrix) tropicalized the 28 divisions starting at 0° Aries.",
    },
  };
});

export function getManzilCanonByLongitude(longitude: number): ManzilCanonRecord {
  const index = Math.floor(normalizeLongitude(longitude) / MANZIL_SPAN) % 28;
  return MANZIL_CANON_RECORDS[index];
}
