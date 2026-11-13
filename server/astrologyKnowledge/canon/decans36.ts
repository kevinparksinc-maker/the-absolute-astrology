import { DECANS, ELEMENTAL_DECAN_SIGNS, normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import { PLANET_CANON_RECORDS, SIGN_CANON_RECORDS } from "./planetsAndSigns";
import type { DecanCanonRecord } from "./types";

const TRIPLICITY_SUB_RULERS: Record<string, [string, string, string]> = {
  Aries: ["Mars", "Sun", "Jupiter"],
  Taurus: ["Venus", "Mercury", "Saturn"],
  Gemini: ["Mercury", "Venus", "Saturn"],
  Cancer: ["Moon", "Mars", "Jupiter"],
  Leo: ["Sun", "Jupiter", "Mars"],
  Virgo: ["Mercury", "Saturn", "Venus"],
  Libra: ["Venus", "Saturn", "Mercury"],
  Scorpio: ["Mars", "Jupiter", "Moon"],
  Sagittarius: ["Jupiter", "Mars", "Sun"],
  Capricorn: ["Saturn", "Venus", "Mercury"],
  Aquarius: ["Saturn", "Mercury", "Venus"],
  Pisces: ["Jupiter", "Moon", "Mars"],
};

const DECAN_DOCTRINE: Array<{
  title: string;
  themes: [string, string, string];
  nuance: string;
}> = [
  // Aries 1-3
  { title: "The Double-Bladed Axe", themes: ["raw initiative", "unmediated courage", "boundary-setting"], nuance: "Mars in Mars's domicile: pure cardinal fire that cuts through hesitation and demands immediate autonomy." },
  { title: "The Crowned Torch", themes: ["visible nobility", "solar confidence", "principled leadership"], nuance: "Sun face of Aries (containing the 19° Exaltation of the Sun): channels raw drive into honorable, visible leadership." },
  { title: "The Embroidered Banner", themes: ["chivalrous alliance", "creative persuasion", "social daring"], nuance: "Venus face of Aries: softens martial edge with relational charm, artistry, and desire for shared adventure." },
  // Taurus 1-3
  { title: "The Plowed Field", themes: ["practical craft", "methodical cultivation", "resource planning"], nuance: "Mercury face of Taurus (containing the 3° Exaltation of the Moon): applies practical intelligence to tangible building." },
  { title: "The Abundant Orchard", themes: ["embodied comfort", "fertile stability", "protective nurture"], nuance: "Moon face of Taurus: deep somatic steadiness, loyalty, and the need for peaceful material security." },
  { title: "The Stone Granary", themes: ["austere endurance", "long-term discipline", "structural weight"], nuance: "Saturn face of Taurus: tests material attachments and demands patient, unglamorous perseverance." },
  // Gemini 1-3
  { title: "The Open Lyre", themes: ["generous inquiry", "teaching", "expansive dialogue"], nuance: "Jupiter face of Gemini: elevates curiosity toward broad synthesis, storytelling, and philosophical goodwill." },
  { title: "The Sharpened Stylus", themes: ["incisive debate", "strategic speech", "restless urgency"], nuance: "Mars face of Gemini: sharpens words into instruments of contest, precision, and rapid problem-solving." },
  { title: "The Beacon Tower", themes: ["articulate authority", "public voice", "synthesis before the solstice"], nuance: "Sun face of Gemini: seeks to unify scattered ideas into a coherent, visible message." },
  // Cancer 1-3
  { title: "The Sheltered Harbor", themes: ["affectionate bonding", "emotional hospitality", "relational warmth"], nuance: "Venus face of Cancer: initiates emotional connection through tenderness, beauty, and welcoming care." },
  { title: "The Walled Garden", themes: ["perceptive memory", "intuitive translation", "protective discernment"], nuance: "Mercury face of Cancer (containing the 15° Exaltation of Jupiter): pairs deep emotional memory with articulate insight." },
  { title: "The Full Tide", themes: ["visceral loyalty", "instinctive protection", "ancestral depth"], nuance: "Moon face of Cancer (Moon in her own domicile and face): pure lunar sensitivity and fierce devotion to one's people." },
  // Leo 1-3
  { title: "The Enthroned Lion", themes: ["tested sovereignty", "disciplined command", "earned authority"], nuance: "Saturn face of Leo: tempers solar pride with gravity, responsibility, and high standards of self-command." },
  { title: "The Golden Crown", themes: ["magnanimity", "generous patronage", "radiant conviction"], nuance: "Jupiter face of Leo: expansive, warmhearted leadership that uplifts others when anchored in integrity." },
  { title: "The Banner of Victory", themes: ["fearless persistence", "passionate defense", "unyielding loyalty"], nuance: "Mars face of Leo: combines fixed solar purpose with martial courage to defend what one loves." },
  // Virgo 1-3
  { title: "The Harvest Sheaf", themes: ["illuminated craft", "conscientious service", "orderly purpose"], nuance: "Sun face of Virgo: brings quiet dignity and purposeful clarity to detailed stewardship." },
  { title: "The Vial of Balm", themes: ["refined skill", "devoted care", "harmonious precision"], nuance: "Venus face of Virgo (containing the 15° Exaltation of Mercury): marries analytical exactness with grace and healing utility." },
  { title: "The Scribe's Scale", themes: ["mastery of detail", "diagnostic acuity", "completions"], nuance: "Mercury face of Virgo (Mercury in domicile, exaltation sign, and own face): supreme analytical and technical discernment." },
  // Libra 1-3
  { title: "The Silver Balance", themes: ["social attunement", "responsive diplomacy", "public mirror"], nuance: "Moon face of Libra: quick sensitivity to the emotional climate between people and desire for fair peace." },
  { title: "The Pillar of Law", themes: ["binding covenant", "structural justice", "enduring accountability"], nuance: "Saturn face of Libra: grounds harmony in fair rules, kept promises, and mature boundaries." },
  { title: "The Hall of Treaty", themes: ["gracious ceremony", "mutual elevation", "wise counsel"], nuance: "Jupiter face of Libra (containing the 21° Exaltation of Saturn): blends principle with generosity in partnership." },
  // Scorpio 1-3
  { title: "The Iron Fortress", themes: ["unflinching resolve", "survival instinct", "penetrating honesty"], nuance: "Mars face of Scorpio (Mars in its nocturnal domicile and own face): concentrated courage and refusal of superficiality." },
  { title: "The Crucible of Gold", themes: ["exposed truth", "regenerative vitality", "loyalty under fire"], nuance: "Sun face of Scorpio: brings light into hidden depths, demanding integrity in shared entanglements." },
  { title: "The Deep Wellspring", themes: ["devotional intensity", "emotional alchemy", "passionate bond"], nuance: "Venus face of Scorpio: seeks total emotional fusion and must balance devotion with self-respect." },
  // Sagittarius 1-3
  { title: "The Winged Arrow", themes: ["philosophical agility", "direct truth-telling", "wide inquiry"], nuance: "Mercury face of Sagittarius: translates broad vision into direct teaching, travel, and swift perception." },
  { title: "The Bridled Steed", themes: ["empathetic wisdom", "adaptive faith", "protective guidance"], nuance: "Moon face of Sagittarius: connects high ideals to human emotional reality and rhythmic growth." },
  { title: "The Mountain Summit", themes: ["concentrated conviction", "tested philosophy", "mastered aim"], nuance: "Saturn face of Sagittarius: demands that big visions and promises be backed by real endurance." },
  // Capricorn 1-3
  { title: "The Foundation Stone", themes: ["architectural vision", "stewardship", "patient enterprise"], nuance: "Jupiter face of Capricorn: softens Saturnian rigor with purposeful governance and long-range builders' faith." },
  { title: "The Mountain Goat", themes: ["relentless drive", "executive stamina", "disciplined conquest"], nuance: "Mars face of Capricorn: channels martial ambition into methodical, step-by-step ascent." },
  { title: "The Sealed Citadel", themes: ["sovereign mastery", "enduring legacy", "tested authority"], nuance: "Sun face of Capricorn (containing the 28° Exaltation of Mars): culminates long effort in visible, durable command." },
  // Aquarius 1-3
  { title: "The Shared Cup", themes: ["humane fellowship", "principled grace", "cooperative networks"], nuance: "Venus face of Aquarius: warms Saturnian air with relational goodwill, civic care, and aesthetic originality." },
  { title: "The Astrolabe", themes: ["systemic analysis", "lucid invention", "objective truth"], nuance: "Mercury face of Aquarius: excels at structural thinking, pattern recognition, and fair-minded clarity." },
  { title: "The Night Watch", themes: ["collective attunement", "quiet vigil", "protective distance"], nuance: "Moon face of Aquarius: senses collective currents while needing personal breathing room to process feeling." },
  // Pisces 1-3
  { title: "The Anchor in the Deep", themes: ["quiet endurance", "contemplative depth", "sacred containment"], nuance: "Saturn face of Pisces: gives form and patience to deep oceanic sensitivity." },
  { title: "The Net of Pearl", themes: ["expansive compassion", "spiritual synthesis", "generous shelter"], nuance: "Jupiter face of Pisces (Jupiter in its nocturnal domicile and own face): restorative faith, mercy, and wholeness." },
  { title: "The Crossing of the Threshold", themes: ["courageous closure", "decisive renewal", "spiritual fire in water"], nuance: "Mars face of Pisces (containing the 27° Exaltation of Venus): completes the zodiacal circle with the courage to release and begin anew." },
];

export const DECAN_CANON_RECORDS: DecanCanonRecord[] = DECANS.map((label, idx) => {
  const signIndex = Math.floor(idx / 3);
  const sign = ZODIAC_SIGNS[signIndex];
  const decanNumber = ((idx % 3) + 1) as 1 | 2 | 3;
  const startDeg = idx * 10;
  const endDeg = (idx + 1) * 10;
  const chaldeanFaceRuler = label.split(" ")[0];
  const triplicitySubRuler = TRIPLICITY_SUB_RULERS[sign][decanNumber - 1];
  const doc = DECAN_DOCTRINE[idx];

  return {
    index: idx + 1,
    sign,
    decanNumber,
    degreeRange: [startDeg, endDeg],
    label,
    chaldeanFaceRuler,
    triplicitySubRuler,
    traditionalTitle: doc.title,
    coreThemes: doc.themes,
    behavioralNuance: doc.nuance,
    provenance: {
      tradition: "hellenistic",
      sourceTitle:
        "Teucer of Babylon; Firmicus Maternus, Mathesis IV.22; Abu Ma'shar, Great Introduction; Picatrix II.11",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote: `Chaldean Face ruler is ${chaldeanFaceRuler} (descending planetary order); Western Triplicity sub-ruler is ${triplicitySubRuler} (elemental sign order). Both are preserved without conflation.`,
    },
  };
});

export function getDecanCanonByLongitude(longitude: number): DecanCanonRecord {
  const index = Math.floor(normalizeLongitude(longitude) / 10) % 36;
  return DECAN_CANON_RECORDS[index];
}

/** The Absolute uses elemental-family decans; Chaldean faces remain a separate catalog. */
export function elementalDecanTeaching(record: DecanCanonRecord) {
  const subSign = ELEMENTAL_DECAN_SIGNS[Math.floor((record.index - 1) / 3)][record.decanNumber - 1];
  const sign = SIGN_CANON_RECORDS[subSign];
  const ruler = PLANET_CANON_RECORDS[record.triplicitySubRuler];
  return {
    subSign,
    label: `${record.sign} decan ${record.decanNumber}: ${subSign} / ${record.triplicitySubRuler}`,
    statement: `The ${record.decanNumber === 1 ? "first" : record.decanNumber === 2 ? "second" : "third"} ten-degree sector of ${record.sign} takes the ${subSign} member of its elemental family. ${sign.psychologicalTheme} Its ruler ${record.triplicitySubRuler} brings ${ruler.coreMeanings[0]}.`,
    sourceTitle: "The Absolute elemental-family decan policy; local planetary and sign Canon",
  };
}
