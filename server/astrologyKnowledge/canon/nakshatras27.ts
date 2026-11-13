import { NAKSHATRAS, normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import type { NakshatraCanonRecord, NakshatraPadaRecord } from "./types";

const NAK_SPAN = 360 / 27; // 13.33333333°
const PADA_SPAN = NAK_SPAN / 4; // 3.33333333°

const SIGN_RULERS: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const PADA_EMPHASIS_BY_ELEMENT: Record<number, string> = {
  0: "Dharma / Fire pada (initiative, principle, and purposeful action)",
  1: "Artha / Earth pada (practical craft, material grounding, and tangible results)",
  2: "Kama / Air pada (communication, relational exchange, and mental synthesis)",
  3: "Moksha / Water pada (emotional depth, intuitive integration, and spiritual release)",
};

const NAKSHATRA_DOCTRINE: Array<{
  ruler: string;
  deity: string;
  symbol: string;
  shakti: string;
  guna: NakshatraCanonRecord["guna"];
  gana: NakshatraCanonRecord["gana"];
  motivation: NakshatraCanonRecord["motivationPuruSharthas"];
  core: string;
  psychology: string;
}> = [
  { ruler: "Ketu (South Node)", deity: "Ashwini Kumaras (Celestial Physicians)", symbol: "Horse's Head", shakti: "Shidhra Vyapani Shakti (power to quickly reach and heal)", guna: "Rajas", gana: "Deva (Divine)", motivation: "Dharma", core: "Swift initiation,vitality, rescue, and pioneering renewal.", psychology: "Instinctive first-responder energy; thrives on fresh starts and rapid intervention, learning patience for the long middle." },
  { ruler: "Venus", deity: "Yama (Lord of Dharma and Restraint)", symbol: "Yoni (Womb / Vessel of Life)", shakti: "Apabharani Shakti (power to cleanse, bear, and carry through transformation)", guna: "Rajas", gana: "Manushya (Human)", motivation: "Artha", core: "Gestation, restraint, threshold-crossing, and bearing heavy responsibility.", psychology: "Willingness to carry intense emotional or creative weight to birth something real; learns not to carry others' karma alone." },
  { ruler: "Sun", deity: "Agni (Sacred Fire)", symbol: "Razor / Flame", shakti: "Dahana Shakti (power to burn away impurity and illuminate)", guna: "Rajas", gana: "Rakshasa (Fierce/Independent)", motivation: "Kama", core: "Purification, sharp discernment, protective warmth, and cutting away falsehood.", psychology: "Direct, uncompromising honesty paired with fierce maternal/protective care for those under one's roof." },
  { ruler: "Moon", deity: "Prajapati / Brahma (The Creator)", symbol: "Chariot / Ox Cart", shakti: "Rohana Shakti (power of growth, fertility, and cultivation)", guna: "Rajas", gana: "Manushya (Human)", motivation: "Moksha", core: "Abundant growth, magnetic beauty, artistic creation, and embodied stability.", psychology: "Deep desire to cultivate beauty, safety, and lasting affection; must guard against possessiveness when attached." },
  { ruler: "Mars", deity: "Soma (The Moon / Nectar)", symbol: "Deer's Head", shakti: "Prinana Shakti (power to fulfill and bring delight through seeking)", guna: "Tamas", gana: "Deva (Divine)", motivation: "Moksha", core: "Alert curiosity, searching inquiry, gentle tracking, and intellectual quest.", psychology: "Sensitive, observant seeker who notices every subtle shift in the room; learns to rest once the truth is found." },
  { ruler: "Rahu (North Node)", deity: "Rudra (The Storm God)", symbol: "Teardrop / Diamond", shakti: "Yatna Shakti (power of effort and breakthrough through storm)", guna: "Tamas", gana: "Manushya (Human)", motivation: "Kama", core: "Cathartic storm, fierce mental honesty, and clarity after emotional release.", psychology: "Meets pressure head-on and clears the air through candor; transforms grief or turbulence into diamond-sharp insight." },
  { ruler: "Jupiter", deity: "Aditi (Mother of the Gods / Boundlessness)", symbol: "Quiver of Arrows / Home", shakti: "Vasutva Prapana Shakti (power to recover, renew, and return to goodness)", guna: "Sattva", gana: "Deva (Divine)", motivation: "Artha", core: "Resilience, safe return, sanctuary, and philosophical renewal after storm.", psychology: "Natural capacity to bounce back, forgive, and rebuild a warm home base no matter what was lost." },
  { ruler: "Saturn", deity: "Brihaspati (Priest/Sage of the Gods)", symbol: "Cow's Udder / Lotus / Arrow", shakti: "Brahmavarchasa Shakti (power to nourish and create spiritual/practical order)", guna: "Tamas", gana: "Deva (Divine)", motivation: "Dharma", core: "Devoted nourishment, patient stewardship, ethical counsel, and lawful care.", psychology: "Steady caregiver and advisor who shows love through reliable duty; learns to receive nourishment as well as give it." },
  { ruler: "Mercury", deity: "Nagas (Serpent Deities of Wisdom)", symbol: "Coiled Serpent", shakti: "Visleshana Shakti (power to penetrate, bind, or neutralize poison)", guna: "Sattva", gana: "Rakshasa (Fierce/Independent)", motivation: "Dharma", core: "Hypnotic perception, psychological radar,kundalini depth, and strategic protection.", psychology: "Sees straight through facades and guards inner vulnerability carefully; thrives when perceptive sharpness serves healing." },
  { ruler: "Ketu (South Node)", deity: "Pitris (The Ancestors)", symbol: "Royal Throne", shakti: "Tyage Shepani Shakti (power to leave the body / honor ancestral lineage)", guna: "Tamas", gana: "Rakshasa (Fierce/Independent)", motivation: "Artha", core: "Ancestral dignity, sovereign standards, lineage pride, and noble responsibility.", psychology: "Carries a strong internal standard of honor and legacy; learns to lead from authentic worth rather than ancestral burden." },
  { ruler: "Venus", deity: "Bhaga (God of Marital Bliss and Prosperity)", symbol: "Front Legs of Marriage Bed / Hammock", shakti: "Prajanana Shakti (power of procreation, union, and creative delight)", guna: "Rajas", gana: "Manushya (Human)", motivation: "Kama", core: "Affection, creative leisure, warmth, charisma, and relational bonding.", psychology: "Generous, warmhearted connector who rejuvenates others through joy and companionship." },
  { ruler: "Sun", deity: "Aryaman (God of Patronage, Contracts, and Noble Friendship)", symbol: "Back Legs of Bed", shakti: "Chayani Shakti (power of prosperity through honorable alliance and marriage)", guna: "Rajas", gana: "Manushya (Human)", motivation: "Moksha", core: "Kept covenants, enduring partnership, patronage, and dependable sovereignty.", psychology: "Turns romantic or creative warmth into lasting, honorable commitment and reliable support." },
  { ruler: "Moon", deity: "Savitar (The Sun of Skillful Awakening)", symbol: "Open Hand", shakti: "Hasta Sthapaniya Agama Shakti (power to place one's goal directly in the hand)", guna: "Rajas", gana: "Deva (Divine)", motivation: "Moksha", core: "Dexterity, craftsmanship, tangible mastery, healing hands, and resourcefulness.", psychology: "Finds calm through practical competence; wants to fix, build, and hold concrete solutions in hand." },
  { ruler: "Mars", deity: "Tvashtar / Vishvakarma (Celestial Architect)", symbol: "Shining Jewel / Pearl", shakti: "Punya Chayani Shakti (power to accumulate merit and craft structural beauty)", guna: "Tamas", gana: "Rakshasa (Fierce/Independent)", motivation: "Kama", core: "Architectural design, aesthetic precision, and cutting rough stone into a jewel.", psychology: "Strong eye for structure, form, and hidden flaws; learns to appreciate human imperfection alongside high craft." },
  { ruler: "Rahu (North Node)", deity: "Vayu (The Wind)", symbol: "Young Shoot Blown by Wind / Coral", shakti: "Pradhvamsa Shakti (power to scatter like the wind and adapt freely)", guna: "Tamas", gana: "Deva (Divine)", motivation: "Artha", core: "Self-reliant flexibility, diplomacy, trade, and bending without breaking.", psychology: "Values independence and fair exchange; adapts gracefully across social worlds while protecting personal freedom." },
  { ruler: "Jupiter", deity: "Indra and Agni (Chief and Sacred Fire)", symbol: "Triumphal Archway / Potter's Wheel", shakti: "Vyapana Shakti (power to achieve many fruits and reach the target)", guna: "Sattva", gana: "Rakshasa (Fierce/Independent)", motivation: "Dharma", core: "Single-pointed ambition, forked path choosing, and long-term triumph.", psychology: "Relentless focus once a worthy goal is chosen; learns not to sacrifice present relationships on the altar of future victory." },
  { ruler: "Saturn", deity: "Mitra (God of Friendship and Sacred Covenant)", symbol: "Lotus in Mud / Triumphal Staff", shakti: "Radhana Shakti (power of devotion, friendship, and blooming in adversity)", guna: "Tamas", gana: "Deva (Divine)", motivation: "Dharma", core: "Loyal friendship, bridge-building across divides, and blooming inside intense environments.", psychology: "Maintains warmth, devotion, and alliance even in difficult or high-stakes emotional terrain." },
  { ruler: "Mercury", deity: "Indra (King of the Gods / Protector)", symbol: "Circular Amulet / Umbrella / Earring", shakti: "Arohana Shakti (power to rise, conquer, and assume eldest responsibility)", guna: "Sattva", gana: "Rakshasa (Fierce/Independent)", motivation: "Artha", core: "Seniority, protective authority, crisis mastery, and carrying the shield for others.", psychology: "Often steps into the 'eldest' or protector role early in life; must guard against lonely hyper-responsibility." },
  { ruler: "Ketu (South Node)", deity: "Nirriti (Goddess of Dissolution and the Root)", symbol: "Tied Bunch of Roots", shakti: "Barhana Shakti (power to uproot, destroy falsehood, and get to the bottom)", guna: "Tamas", gana: "Rakshasa (Fierce/Independent)", motivation: "Kama", core: "Root-level investigation, stripping away illusion, and rebuilding from bedrock truth.", psychology: "Cannot live on surface platitudes; digs until the real root cause is exposed." },
  { ruler: "Venus", deity: "Apas (The Cosmic Waters)", symbol: "Winnowing Basket / Elephant Tusk", shakti: "Varchograhana Shakti (power of invigoration and purifying the waters)", guna: "Rajas", gana: "Manushya (Human)", motivation: "Moksha", core: "Undefeated conviction, emotional renewal, and separating wheat from chaff.", psychology: " buoyant faith and persuasive inspiration; regenerates confidence by returning to core values." },
  { ruler: "Sun", deity: "Vishvadevas (All the Universal Principles/Virtues)", symbol: "Elephant Tusk / Small Cot", shakti: "Apradhrishya Shakti (power to grant unchallenged, enduring victory through dharma)", guna: "Rajas", gana: "Manushya (Human)", motivation: "Moksha", core: "Enduring integrity, universal duty, alliance for the common good, and mature triumph.", psychology: "Holds self to high ethical accountability; wins lasting respect by standing for principle." },
  { ruler: "Moon", deity: "Vishnu (The Preserver)", symbol: "Ear / Three Footprints", shakti: "Samhanana Shakti (power of connection and learning through deep listening)", guna: "Rajas", gana: "Deva (Divine)", motivation: "Artha", core: "Deep listening, oral wisdom, counsel, and connecting people to their path.", psychology: "Listens for what is unsaid; synthesizes experience into practical wisdom and steady guidance." },
  { ruler: "Mars", deity: "Eight Vasus (Deities of Earthly Abundance)", symbol: "Drum / Flute", shakti: "Khyapayitri Shakti (power to give abundance, fame, and rhythmic harmony)", guna: "Tamas", gana: "Rakshasa (Fierce/Independent)", motivation: "Dharma", core: "Rhythmic timing, martial orchestration, resourcefulness, and resonant action.", psychology: "Strong sense of timing and momentum; turns hollow space into resonant achievement." },
  { ruler: "Rahu (North Node)", deity: "Varuna (Lord of Cosmic Law and Deep Waters)", symbol: "Empty Circle / 100 Physicians / 100 Stars", shakti: "Bheshaja Shakti (power of healing, containment, and unveiling secrets)", guna: "Tamas", gana: "Rakshasa (Fierce/Independent)", motivation: "Dharma", core: "Radical healing, systemic truth, boundary containment, and confronting hard remedies.", psychology: "Sees systemic patterns and hidden ailments clearly; needs solitude to recharge without becoming isolated." },
  { ruler: "Jupiter", deity: "Aja Ekapada (The One-Footed Goat / Fire of Ascent)", symbol: "Sword / Front Legs of Funeral Cot / Two-Faced Man", shakti: "Yajamana Udyamana Shakti (power to raise the evolutionary fire)", guna: "Sattva", gana: "Manushya (Human)", motivation: "Artha", core: "Fierce idealism, purifying fire, and standing between worldly life and spiritual vision.", psychology: "Passionate devotion to a transformative vision; learns to ground fierce idealism in compassion." },
  { ruler: "Saturn", deity: "Ahir Budhnya (Serpent of the Deep Ocean)", symbol: "Back Legs of Cot / Twins in the Deep", shakti: "Varshodyamana Shakti (power to bring stabilizing rain and deep foundation)", guna: "Tamas", gana: "Manushya (Human)", motivation: "Kama", core: "Deep stillness, meditative endurance, compassionate wisdom, and emotional anchoring.", psychology: "Capable of holding calm in the deepest waters; offers grounded shelter after upheaval." },
  { ruler: "Mercury", deity: "Pushan (The Nourisher and Guide of Travelers)", symbol: "Pair of Fish / Drum for Timekeeping", shakti: "Kshiradyapani Shakti (power of nourishment, safe journeying, and completion)", guna: "Sattva", gana: "Deva (Divine)", motivation: "Moksha", core: "Safe guidance, empathy, completion of cycles, and shepherding others across thresholds.", psychology: "Gentle guardian energy that guides people safely home; must protect personal boundaries while caring for the flock." },
];

export const NAKSHATRA_CANON_RECORDS: NakshatraCanonRecord[] = NAKSHATRAS.map((name, idx) => {
  const startDeg = Number((idx * NAK_SPAN).toFixed(4));
  const endDeg = Number(((idx + 1) * NAK_SPAN).toFixed(4));
  const doc = NAKSHATRA_DOCTRINE[idx];

  const padas = [0, 1, 2, 3].map(pIdx => {
    const globalPadaIndex = idx * 4 + pIdx;
    const navamshaSign = ZODIAC_SIGNS[globalPadaIndex % 12];
    const navamshaRuler = SIGN_RULERS[navamshaSign];
    const pStart = Number((startDeg + pIdx * PADA_SPAN).toFixed(4));
    const pEnd = Number((startDeg + (pIdx + 1) * PADA_SPAN).toFixed(4));
    return {
      pada: (pIdx + 1) as 1 | 2 | 3 | 4,
      navamshaSign,
      navamshaRuler,
      degreeRange: [pStart, pEnd] as [number, number],
      emphasis: `${PADA_EMPHASIS_BY_ELEMENT[globalPadaIndex % 4]} — colored by ${navamshaSign} (${navamshaRuler}).`,
    };
  }) as [
    NakshatraPadaRecord,
    NakshatraPadaRecord,
    NakshatraPadaRecord,
    NakshatraPadaRecord,
  ];

  return {
    index: idx + 1,
    name,
    degreeRange: [startDeg, endDeg],
    vimshottariRuler: doc.ruler,
    deity: doc.deity,
    symbol: doc.symbol,
    shakti: doc.shakti,
    guna: doc.guna,
    gana: doc.gana,
    motivationPuruSharthas: doc.motivation,
    coreMeaning: doc.core,
    psychologicalPattern: doc.psychology,
    padas,
    epistemicNote: {
      category: "FIRMAMENT_CANON",
      statement: `Firmament projects ${name} onto the locked 0° Aries tropical coordinate frame (${startDeg.toFixed(2)}°–${endDeg.toFixed(2)}°). Classical Vedic Jyotish (Parashara / Taittiriya Brahmana) applies a sidereal ayanamsa offset; Firmament preserves the classical deity (${doc.deity}), Shakti, and 4 Navamsha padas while explicitly documenting the tropical 0° Aries lock.`,
      provenance: {
        tradition: "firmament",
        sourceTitle: "Firmament Hybrid Zodiac Canon",
        epistemicCategory: "FIRMAMENT_CANON",
      },
    },
    provenance: {
      tradition: "vedic",
      sourceTitle:
        "Taittiriya Brahmana 1.5; Brihat Parashara Hora Shastra; Varahamihira, Brihat Jataka",
      epistemicCategory: "TRADITION",
      disputedOrVariantNote:
        "Traditional Jyotish uses sidereal (Nirayana) longitudes; Firmament Canon locks the 27 equal 13°20′ divisions to tropical 0° Aries without applying precession.",
    },
  };
});

export function getNakshatraCanonByLongitude(
  longitude: number,
  options?: {
    coordinateMode?: "firmament-tropical-hybrid" | "classical-sidereal-lahiri" | "classical-sidereal-raman";
    utcIso?: string;
  }
): {
  nakshatra: NakshatraCanonRecord;
  pada: NakshatraPadaRecord;
  coordinateModeUsed: "firmament-tropical-hybrid" | "classical-sidereal-lahiri" | "classical-sidereal-raman";
  effectiveLongitude: number;
} {
  const mode = options?.coordinateMode ?? "firmament-tropical-hybrid";
  let offset = 0;
  if (mode !== "firmament-tropical-hybrid") {
    const year = options?.utcIso ? new Date(options.utcIso).getUTCFullYear() : 2000;
    const effectiveYear = Number.isFinite(year) ? year : 2000;
    const lahiri = 23.856 + (effectiveYear - 2000) * 0.01397;
    offset = mode === "classical-sidereal-raman" ? lahiri - 1.44 : lahiri;
  }
  const L = normalizeLongitude(longitude - offset);
  const idx = Math.floor(L / NAK_SPAN) % 27;
  const nakshatra = NAKSHATRA_CANON_RECORDS[idx];
  const within = L - idx * NAK_SPAN;
  const padaIdx = Math.min(3, Math.floor(within / PADA_SPAN));
  return {
    nakshatra,
    pada: nakshatra.padas[padaIdx],
    coordinateModeUsed: mode,
    effectiveLongitude: Number(L.toFixed(4)),
  };
}
