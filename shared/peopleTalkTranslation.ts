export interface RealWorldActorTranslation {
  coreTheme: string;
  strengthAndPower: string;
  humanChallenge: string;
  growthAction: string;
  conversationalProse: string;
}

export interface MinimalTraitForTranslation {
  planet: string;
  sign: string;
  house: number;
  houseArena: string;
  decanFlavor?: string;
  personaArchetype?: string;
}

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  Ascendant: "AC",
  Descendant: "DC",
  "North Node": "☊",
  NorthNode: "☊",
  "South Node": "☋",
  SouthNode: "☋",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Translates technical matrix properties into warm, grounded "real-world people talk".
 * The calculations (degrees, virupas, Egyptian bounds, Nakshatras) go on in the background;
 * this delivers the astrologer's genuine counsel and real-world clarity.
 */
export function buildRealWorldTranslation(trait: MinimalTraitForTranslation): RealWorldActorTranslation {
  const name = trait.planet;
  const sign = trait.sign;
  const house = trait.house;
  const arena = (trait.houseArena || `House ${house}`).toLowerCase();
  const archetype = trait.personaArchetype || name;
  const decan = (trait.decanFlavor || "direct focus").toLowerCase();

  let coreTheme = "";
  let strengthAndPower = "";
  let humanChallenge = "";
  let growthAction = "";
  let conversationalProse = "";

  switch (name) {
    case "Sun":
      coreTheme = `Your central life force, self-expression, and personal purpose operating in House ${house} (${arena}).`;
      strengthAndPower = `Natural leadership and self-authorship. When you believe in what you are building, your confidence inspires people around you.`;
      humanChallenge = `Pride, burnout from feeling you must carry everything alone, or needing outside applause before validating your own efforts.`;
      growthAction = `Lead by example rather than force. Anchor your sense of worth in your integrity, not just other people's approval.`;
      conversationalProse = `You are built to stand in your own authority. With your Sun in ${sign} in your ${ordinal(house)} house, your vitality isn't meant to be hidden in the background—it is designed to bring order, creative drive, and clear direction to ${arena}. You have a strong instinct for authenticity; you can't fake enthusiasm for things that don't align with your values. Your growth comes from recognizing that you don't need to fight for the spotlight when you are already bringing genuine substance to the table.`;
      break;

    case "Moon":
      coreTheme = `Your emotional sanctuary, instinctive gut radar, and what makes you feel secure, placed in House ${house}.`;
      strengthAndPower = `Deep emotional perception. You pick up on unspoken vibes, tension, and subtle shifts in people before anyone says a word.`;
      humanChallenge = `Withdrawing into a protective shell, taking on other people's emotional baggage, or reacting out of past vulnerability.`;
      growthAction = `Give yourself permission to retreat and recharge without apologizing. Guard your inner peace like sacred property.`;
      conversationalProse = `Underneath your conscious goals lies your emotional compass: Moon in ${sign} in your ${ordinal(house)} house. This is how you nurture yourself when the world gets loud. Resting in the area of ${arena}, your instincts operate like high-definition radar. When things feel off in a room, you know it instantly. Your challenge is learning not to absorb everyone else's storm. When you give yourself a calm, quiet place to process your feelings, your emotional clarity becomes your greatest anchor.`;
      break;

    case "Ascendant":
      coreTheme = `Your physical interface, first impression, and how you naturally navigate new rooms and life transitions.`;
      strengthAndPower = `A distinctive, memorable presence. You greet the world through ${sign} energy, giving you a natural defense and personal style.`;
      humanChallenge = `Over-identifying with the mask or armor you put on for protection, leaving you feeling unseen beneath the surface.`;
      growthAction = `Let people see the warmth beneath the armor. Trust that you don't have to stay permanently guarded to be safe.`;
      conversationalProse = `Your Ascendant in ${sign} is your helm—the ship's bow cutting through the water. It sets the tone for how you step into any room and how you handle new chapters. You present an aura of ${decan}, which means people immediately sense your self-reliance and focus. In real-world terms, this is the armor you built to survive and thrive. Just remember: you don't have to keep your defenses up 24/7 around the people who have earned your trust.`;
      break;

    case "Descendant":
      coreTheme = `The mirror of partnership—what you look for, attract, and learn through one-on-one commitments in House 7.`;
      strengthAndPower = `The capacity for deep, loyal reciprocity and recognizing people who complement what you naturally lack.`;
      humanChallenge = `Attracting partners who act out your suppressed emotions, or falling into power struggles over who has control.`;
      growthAction = `Choose partners who hold their own ground and match your loyalty. Treat agreements as mutual covenants of equals.`;
      conversationalProse = `Across from your personal helm sits your Descendant in ${sign} (House 7). This is your sacred mirror. The qualities of ${sign} are what you are drawn to in significant others, business partners, and intimate companions. You don't do superficial contracts; you want people who show up with real loyalty and stay ten toes down when things get tough. Partnerships are where you learn that vulnerability isn't weakness—it's the only way real trust gets built.`;
      break;

    case "North Node":
    case "NorthNode":
      coreTheme = `Your evolutionary frontier (Rahu)—the unfamiliar, hungry edge of life where your soul is called to stretch.`;
      strengthAndPower = `Breakthrough courage. Stepping into ${sign} territory in House ${house} unlocks extraordinary breakthroughs and new horizons.`;
      humanChallenge = `Imposter syndrome or fear of the unknown, because this territory feels new and outside your ingrained habits.`;
      growthAction = `Lean into the discomfort of the new. Every time you stretch into House ${house} themes, life opens surprising doors for you.`;
      conversationalProse = `Your North Node in ${sign} in House ${house} is your soul's compass pointing north. This is unfamiliar ground—the life lessons that feel like stretching a muscle you haven't used before. Anchored in ${arena}, it asks you to stop playing it safe in old, comfortable routines and dare to develop ${sign} qualities. Every major life advancement for you happens when you take a deep breath and step onto this path, even when your hands shake.`;
      break;

    case "South Node":
    case "SouthNode":
      coreTheme = `Your ancestral crucible (Ketu)—the innate gifts, habits, and comfort zones you've already mastered over generations.`;
      strengthAndPower = `Effortless talent and wisdom in ${sign} and House ${house}. You can do these things in your sleep.`;
      humanChallenge = `Over-relying on this comfort zone to avoid the harder work of growth, leading to stagnation or repeating old loops.`;
      growthAction = `Use these innate gifts as your foundation and toolbelt, but don't camp out here forever. Let them fuel your North Node journey.`;
      conversationalProse = `Your South Node in ${sign} in House ${house} represents your innate mastery—skills that feel so second nature you might not even realize how talented you are at them. But precisely because it's so comfortable, it can become a trap if you retreat here whenever life gets challenging. Treat these gifts as your savings account: draw on them to fund your growth, but don't let them keep you from exploring new territory.`;
      break;

    case "Mercury":
      coreTheme = `Your cognitive engine, communication style, voice, and investigative drive in House ${house}.`;
      strengthAndPower = `A sharp, perceptive mind that questions assumptions, uncovers hidden facts, and articulates complex truths with clarity.`;
      humanChallenge = `Mental overthinking, skepticism that turns cynical, or weaponizing words when feeling cornered.`;
      growthAction = `Use your voice to teach, build bridges, and illuminate the truth rather than just proving people wrong.`;
      conversationalProse = `Your Mercury in ${sign} in House ${house} gives you an intellect that hates shallow answers. You want to know what makes people tick and what is really happening beneath official explanations. In ${arena}, your communication carries real weight. When you combine your investigative depth with patience, your words have the power to dismantle illusions and inspire genuine cooperation.`;
      break;

    case "Venus":
      coreTheme = `Your values, aesthetic eye, relational devotion, and how you attract abundance in House ${house}.`;
      strengthAndPower = `Fierce loyalty, magnetic charisma, and an eye for genuine quality over cheap popularity.`;
      humanChallenge = `All-or-nothing emotional expectations, fear of betrayal, or holding onto grievances when values are breached.`;
      growthAction = `Invest your love and creativity where it is genuinely cherished. True luxury is peace of mind and sincere reciprocity.`;
      conversationalProse = `In your chart, Venus in ${sign} in House ${house} governs what you truly value. You don't care for superficial pleasantries; you want connections that have soul, grit, and enduring substance. In ${arena}, you attract support when you stay true to your standards and refuse to settle for empty compromises.`;
      break;

    case "Mars":
      coreTheme = `Your drive, courage, executive execution, boundaries, and how you assert your willpower in House ${house}.`;
      strengthAndPower = `Decisive grit, resilience under pressure, and the courage to take a stand when others back down.`;
      humanChallenge = `Impatience, simmering resentment, or treating everyday discussions like battlefield contests.`;
      growthAction = `Channel your fire into long-term craft and disciplined building. Strategic patience beats impulsive reactions every time.`;
      conversationalProse = `Your Mars in ${sign} in House ${house} is your warrior principle. It dictates how you fight for what matters and enforce your boundaries. In the field of ${arena}, you aren't afraid of hard work or standing alone when necessary. Your greatest power comes when your willpower is guided by calm, deliberate strategy rather than sudden frustration.`;
      break;

    case "Jupiter":
      coreTheme = `Your philosophical vision, moral authority, generosity, and where life brings unexpected luck in House ${house}.`;
      strengthAndPower = `Wisdom, mentorship, and the ability to see the forest when everyone else is lost in the trees.`;
      humanChallenge = `Over-promising, dogmatism, or over-extending your resources assuming tomorrow will fix itself.`;
      growthAction = `Anchor your optimism in grounded reality. Share your knowledge generously and watch your community flourish.`;
      conversationalProse = `Jupiter in ${sign} in House ${house} is your beacon of higher wisdom and growth. In ${arena}, it acts like a guardian angel, rewarding you whenever you act with generosity, fairness, and moral courage. You have a natural gift for lifting people up and helping them see their own potential.`;
      break;

    case "Saturn":
      coreTheme = `Your master craftsman—where life demands patient discipline, maturity, and building an enduring legacy in House ${house}.`;
      strengthAndPower = `Unyielding perseverance, rock-solid reliability, and the stamina to finish what you start.`;
      humanChallenge = `Self-doubt, feeling that you have to work twice as hard as others, or carrying the weight of the world on your shoulders.`;
      growthAction = `Celebrate incremental progress. What Saturn builds slowly will stand long after flash-in-the-pan shortcuts fade.`;
      conversationalProse = `Saturn in ${sign} in House ${house} is your anchor. It doesn't deny your dreams—it tests them to make sure your foundations are made of granite. In ${arena}, things might feel slow or heavy at times, but that's because you are building something meant to last for decades. Your discipline is your superpower.`;
      break;

    case "Pluto":
      coreTheme = `Deep psychological transformation, reclamation of personal power, and unsparing truth in House ${house}.`;
      strengthAndPower = `The ability to rise from the ashes, see through deception, and reinvent yourself with greater power after crises.`;
      humanChallenge = `Fear of being controlled, hyper-vigilance, or holding onto old grudges like armor.`;
      growthAction = `Surrender what is already dead. Real power isn't about controlling people; it's about being unshakeable in your own truth.`;
      conversationalProse = `Pluto in ${sign} in House ${house} is the crucible of rebirth. In ${arena}, life will challenge you to let go of old attachments and illusions. Every time you survive a test in this arena, you emerge with greater inner authority, depth, and magnetism.`;
      break;

    default:
      coreTheme = `${name} in ${sign} in House ${house} (${arena}).`;
      strengthAndPower = `Unique perspective and specialized intelligence aligned with ${archetype}.`;
      humanChallenge = `Navigating unconventional or sudden shifts in this area of life.`;
      growthAction = `Stay true to your individual calling without being swayed by standard social conformity.`;
      conversationalProse = `${name} in ${sign} in House ${house} brings a distinct energy to ${arena}. Governed by ${archetype}, it calls on you to be authentic, adaptable, and forward-looking.`;
      break;
  }

  return {
    coreTheme,
    strengthAndPower,
    humanChallenge,
    growthAction,
    conversationalProse,
  };
}
