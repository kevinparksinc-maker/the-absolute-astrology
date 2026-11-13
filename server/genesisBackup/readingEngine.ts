/**
 * READING ENGINE v2.0
 * 
 * Converts pattern analysis into human-readable interpretations.
 * Answers: "What does this mean for the user, right now, in this place?"
 * 
 * Features:
 * - Childhood-to-adulthood developmental arc (roots, early conditioning, adolescent testing, adult consolidation)
 * - Aspect polarity interpretation (harmonious vs challenging)
 * - Planetary dignity-aware language
 * - Synthesis rules engine (combines multiple signals)
 * - User context (birth chart, question, focus area, gender)
 * - Dynamic archetype-to-language mapping
 * - Actionable guidance generation
 * - Developmental phase (seeding, growing, harvesting, releasing, integrating)
 * - Emotional tone detection
 * - Deep real-world 2026 translation
 */

import type { PatternAnalysis, ArchetypeLabel } from './patternEngine';
import type { PlanetPlacement } from './astroEngine';

// ============================================================================
// TYPES
// ============================================================================

export type QuestionArea = 'career' | 'relationships' | 'health' | 'finance' | 'spirituality' | 'general' | 'creativity' | 'home';
export type ReadingTone = 'gentle' | 'direct' | 'poetic' | 'practical' | 'inspirational';
export type DevelopmentalPhase = 'seeding' | 'growing' | 'harvesting' | 'releasing' | 'integrating';

export interface UserContext {
  birthChart?: Record<string, PlanetPlacement>;
  question?: string;
  focusArea?: QuestionArea;
  preferredTone?: ReadingTone;
  name?: string;
  gender?: 'male' | 'female' | 'other';
  previousReadings?: string[]; // for continuity
}

export interface ReadingOutput {
  // Core layers
  plain: string;           // What's happening
  deep: string;            // Why it matters
  guidance: string;        // What to do
  forecast: string;        // What's emerging
  
  // Childhood to Adulthood Life Arc
  childhoodRoots: string;  // Early environment, attachment & formative emotional wiring
  adulthoodArc: string;    // How adult maturity, vocation & purpose consolidated
  
  // Structured data
  themes: Theme[];
  tensions: Tension[];
  gifts: Gift[];
  developmentalPhase: DevelopmentalPhase;
  emotionalTone: string;
  
  // Formatted full reading markdown
  formattedReading: string;
  
  // Metadata
  timestamp: Date;
  confidence: number;     // 0-1 how certain the reading is
}

export interface Theme {
  name: string;
  strength: number;
  description: string;
  actionableAdvice: string;
}

export interface Tension {
  between: string[];
  description: string;
  resolutionPath: string;
}

export interface Gift {
  source: string;
  description: string;
  howToUse: string;
}

export interface SynthesisRule {
  conditions: (analysis: PatternAnalysis, context: UserContext) => boolean;
  output: (analysis: PatternAnalysis, context: UserContext) => Partial<ReadingOutput>;
  priority: number;
}

// ============================================================================
// ASPECT INTERPRETATION (With Polarity + Dignity)
// ============================================================================

const ASPECT_MEANINGS: Record<string, {
  harmonious: (p1: string, p2: string, dignity: number) => string;
  challenging: (p1: string, p2: string, dignity: number) => string;
}> = {
  'conjunction': {
    harmonious: (p1, p2, d) =>
      `When ${p1} and ${p2} fuse in a harmonious conjunction, their fundamental drives operate as a unified, potent force across your life story. Rather than experiencing these energies as competing demands, your internal motivation and external execution work in lockstep. In real-world 2026 everyday terms, this translates into singular focus, rapid creative execution, and an ability to cut straight through corporate buzzwords and digital noise. ${d > 0.7 ? 'Because their planetary dignity is exceptionally high, this convergence functions as your foundational superpower—giving you the instinctive authority to anchor complex initiatives and inspire trust without performative posturing.' : 'Pay close attention to how these combined drives influence your daily choices, ensuring that singular focus doesn’t blind you to subtle relational needs.'}`,
    challenging: (p1, p2, d) =>
      `When ${p1} and ${p2} lock into an intense conjunction, their competing demands collide within your core identity. In real-world 2026 living, this feels like an internal pressure cooker where competing imperatives refuse to compromise—for instance, wanting immediate decisive action while simultaneously demanding absolute emotional sanctuary. ${d < 0.3 ? 'Because both planets feel constrained here, trying to suppress either one creates acute restlessness or sudden burnout.' : 'The friction itself is the evolutionary engine: it prevents complacency and forces you to develop seasoned discernment.'} In your modern career and personal relationships, treat this intensity as a signal to pause and pace yourself rather than forcing premature decisions.`
  },
  'opposition': {
    harmonious: (p1, p2, d) =>
      `When ${p1} and ${p2} stand across from each other in opposition, they create an illuminating axis of awareness in your life narrative. Rather than fighting, they act like two mirrors reflecting your internal dynamics through real-world relationships. In 2026 daily reality, this gives you an innate understanding of human psychology, relational nuance, and strategic balance. ${d > 0.7 ? 'With elevated dignity, integration brings seasoned diplomatic mastery—you know how to hold space for others without sacrificing an ounce of your sovereign boundaries.' : 'Your ongoing practice is walking the conscious middle path rather than oscillating between emotional withdrawal and sudden over-involvement.'}`,
    challenging: (p1, p2, d) =>
      `When ${p1} and ${p2} engage in a tense opposition, you frequently feel pulled in two contrasting directions across the stage of your life. In everyday modern experience, this plays out in relationship dynamics and career choices: you may feel that honoring ${p1} immediately threatens the needs of ${p2}. ${d < 0.3 ? 'Trying to choose one side permanently will only cause the neglected planet to erupt as an unexpected crisis.' : 'The mature 2026 resolution is holding a compassionate "both/and" posture: honoring both drives in their dedicated times and communicating your alternating needs transparently.'}`
  },
  'trine': {
    harmonious: (p1, p2, d) =>
      `When ${p1} and ${p2} form a flowing trine, energy circulates with organic, effortless grace between these sectors of your life. In real-world 2026 terms, tasks and creative expressions connected to these planets feel natural, joyful, and intuitively aligned—you execute with a fluency that leaves others wondering how you make it look so simple. ${d > 0.7 ? 'This is an inborn ancestral gift and personal sanctuary; use this fertile current to build durable, real-world structures that will sustain you for years to come.' : 'Take deliberate care not to take this ease for granted—channel this frictionless grace toward high-impact goals before routine distracts you.'}`,
    challenging: (p1, p2, d) =>
      `Even a trine can harbor a subtle shadow when ${p1} and ${p2} become so comfortable that growth stalls. In everyday 2026 living, this pattern manifests as the path of least resistance: resting on past laurels, procrastinating on demanding leaps, or settling for "good enough" because things are comfortable. ${d < 0.3 ? 'Complacency is the quiet adversary here; without external deadlines, potential can languish in the comfort zone.' : 'To activate this circuit fully, deliberately introduce creative challenges and hold yourself to higher standards of craftsmanship.'}`
  },
  'square': {
    harmonious: (p1, p2, d) =>
      `When ${p1} and ${p2} form a dynamic square, they generate productive friction that refuses to allow you to settle for mediocrity. In real-world 2026 terms, this is the internal combustion engine behind your greatest accomplishments—the feeling that challenges, tight constraints, or complex obstacles actually sharpen your wit and elevate your determination. ${d > 0.7 ? 'Immense pressure is forging diamond-hard competence; what others view as setbacks, you transform into strategic stepping stones.' : 'This friction continuously builds your character, stamina, and resilience, teaching you that real authority is earned in the arena, not given for free.'}`,
    challenging: (p1, p2, d) =>
      `When ${p1} and ${p2} lock into an uncompromising square, the internal tension can feel like a civil war between two non-negotiable needs. In 2026 everyday life, this manifests as chronic frustration, sudden interpersonal clashes, or feeling blocked at the exact moment you want to accelerate. ${d < 0.3 ? 'This block is not bad luck; it is a vital guardrail forcing you to dismantle ineffective habits, outdated pride, or unexamined assumptions.' : 'Action, grounded communication, and deliberate emotional pacing break the logjam; rumination only deepens the friction.'}`
  },
  'sextile': {
    harmonious: (p1, p2, d) =>
      `When ${p1} and ${p2} form an active sextile, they open an encouraging gateway of collaborative opportunity. In real-world 2026 living, this translates into timely introductions, fruitful alliances, and intuitive hunches that pan out when acted upon. ${d > 0.7 ? 'Fortune favors your deliberate initiative right now—doors unlock smoothly the moment you introduce yourself and show your craft.' : 'A door is quietly cracked open in your daily environment; all that is required is stepping forward with curiosity and readiness.'}`,
    challenging: (p1, p2, d) =>
      `When ${p1} and ${p2} present a more demanding sextile, potential hums in the background but requires active effort to crystallize into reality. In modern life, you may sense that a lucrative opportunity or deeply fulfilling partnership is within arm's reach, yet nothing moves without disciplined follow-through. ${d < 0.3 ? 'Passive wishing will not activate this circuit; you must establish a concrete schedule and do the unglamorous legwork.' : 'The invitation from the cosmos is genuine and reachable—claim it by taking tangible, structured steps each week.'}`
  },
  'quincunx': {
    harmonious: (p1, p2, d) =>
      `When ${p1} and ${p2} connect via a quincunx, their disparate languages require continuous, subtle recalibration. In real-world 2026 terms, this feels like fine-tuning a precision instrument: your emotional needs and professional duties require periodic micro-adjustments rather than wholesale overhauls. ${d > 0.7 ? 'A small, strategic pivot in your daily routine or communication style unlocks tremendous efficiency and peace of mind.' : 'When friction arises, do not assume disaster; simply adjust expectations and reorganize your boundaries.'}`,
    challenging: (p1, p2, d) =>
      `When ${p1} and ${p2} clash in a disjointed quincunx, they seem to inhabit completely different universes with no common vocabulary. In everyday 2026 living, this manifests as feeling perpetually out of sync—as if being true to one department of your life inevitably creates awkward friction in another. ${d < 0.3 ? 'Stop attempting to force these two forces into identical molds; they have different rhythms and different purposes.' : 'Accept this paradox as part of your rich human complexity; give each planetary need its own separate room and schedule.'}`
  }
};

function interpretAspect(planet1: string, planet2: string, type: string, strength: number, dignity: number, isHarmonious: boolean): string {
  const meaning = ASPECT_MEANINGS[type];
  if (!meaning) return `${planet1} and ${planet2} are in an active planetary dialogue shaping your developmental arc.`;
  const interpreter = isHarmonious ? meaning.harmonious : meaning.challenging;
  return interpreter(planet1, planet2, dignity);
}

// ============================================================================
// PLANETARY DIGNITY PHRASING
// ============================================================================

function getDignityPhrase(planet: string, dignity: number): string {
  if (dignity > 0.8) {
    return `${planet} operates with exceptional sovereign dignity in your chart—it acts as a foundational architect across your entire life story. In real-world 2026 living, this gives you natural authority, steady poise, and an unshakeable instinct in the matters governed by ${planet}. While others get swept up in digital trends or second-guess themselves, your judgment here cuts through confusion with effortless precision.`;
  }
  if (dignity > 0.6) {
    return `${planet} is strong, lucid, and operating as a dependable ally in your chart. In modern daily life, it supplies consistent clarity, grounded competence, and the ability to maintain your composure when pressure mounts.`;
  }
  if (dignity > 0.4) {
    return `${planet} operates in a balanced, adaptable equilibrium. It neither dominates your psyche nor falls into crisis, offering you flexibility to shape its expression according to your conscious values.`;
  }
  if (dignity > 0.2) {
    return `${planet} functions under noticeable constraint in this placement, meaning its gifts do not arrive automatically on a silver platter. In everyday 2026 living, this is the sector where you have had to work harder, stumble, and learn the rules of the road through direct experience. What you build here is forged through conscious sweat rather than casual luck.`;
  }
  return `${planet} sits in an intensive developmental crucible, compelling you to evolve through trial, patience, and self-honesty. In your lived reality, this often represents an early vulnerability or recurring test that initially caused frustration. Yet as you mature in 2026, this very placement becomes your most unshakeable pillar of wisdom—because hard-won mastery can never be stripped away from you.`;
}

// ============================================================================
// QUESTION AREA MAPPING
// ============================================================================

const QUESTION_AREAS: Record<QuestionArea, {
  houses: number[];
  planets: string[];
  keywords: string[];
  archetypes: string[];
}> = {
  'career': { houses: [10, 2, 6], planets: ['Saturn', 'Jupiter', 'Mars'], keywords: ['ambition', 'status', 'vocation'], archetypes: ['Public Visibility', 'Structure & Discipline'] },
  'relationships': { houses: [7, 5, 8], planets: ['Venus', 'Mars', 'Moon'], keywords: ['connection', 'love', 'partnership'], archetypes: ['Relationships & Mirrors', 'Emotional Intensity'] },
  'health': { houses: [6, 1, 12], planets: ['Moon', 'Saturn', 'Chiron'], keywords: ['wellness', 'healing', 'body'], archetypes: ['Emotional Foundations', 'Structure & Discipline'] },
  'finance': { houses: [2, 8, 11], planets: ['Jupiter', 'Venus', 'Saturn'], keywords: ['money', 'value', 'resources'], archetypes: ['Action & Drive', 'Structure & Discipline'] },
  'spirituality': { houses: [12, 9, 4], planets: ['Neptune', 'Jupiter', 'Moon'], keywords: ['purpose', 'meaning', 'soul'], archetypes: ['Visibility & Identity', 'Emotional Foundations'] },
  'general': { houses: [1], planets: ['Sun'], keywords: ['life', 'direction', 'self'], archetypes: [] },
  'creativity': { houses: [5, 1], planets: ['Venus', 'Sun', 'Neptune'], keywords: ['art', 'expression', 'innovation'], archetypes: ['Action & Drive', 'Visibility & Identity'] },
  'home': { houses: [4, 3], planets: ['Moon', 'Venus'], keywords: ['family', 'space', 'roots'], archetypes: ['Emotional Foundations', 'Relationships & Mirrors'] }
};

// ============================================================================
// SYNTHESIS RULES ENGINE
// ============================================================================

const synthesisRules: SynthesisRule[] = [
  // Rule 1: Saturn + Venus + Relationships = Relationship structure tension
  {
    conditions: (analysis, context) => {
      const saturnStrength = analysis.planetaryStrength['Saturn']?.totalStrength || 0;
      const venusStrength = analysis.planetaryStrength['Venus']?.totalStrength || 0;
      const relationshipArchetype = analysis.archetypes.some(a => a.archetype === 'Relationships & Mirrors');
      return saturnStrength > 0.6 && venusStrength > 0.5 && (relationshipArchetype || context.focusArea === 'relationships');
    },
    priority: 90,
    output: (analysis, context) => ({
      plain: "Your relationships are undergoing a profound structural maturation. The convergent friction of Saturn and Venus strips away romantic illusions and poses the central question of your adult relational life: 'What are you genuinely committed to building, and what was merely temporary comfort?' In modern 2026 dating, partnership, and professional alliances, you can no longer thrive on casual ambiguity, mixed signals, or unearned intimacy. Your blueprint demands demonstrated character, emotional courage, and mutual accountability over time.",
      guidance: "Initiate the clear, grounded boundary conversation you have been postponing. In 2026, Saturn rewards radical self-honesty and calm consistency rather than performative harmony. Name what you need in plain words, listen without defensiveness, and allow unaligned connections to fall away without guilt.",
      deep: "Saturn and Venus together represent the alchemy of enduring love: affection tested by time and forged into an unbreakable alliance. When you stop fearing that boundaries will push people away, you discover that the right allies respect your perimeter and love you more deeply because of it.",
      themes: [{ name: 'Relationship Maturation', strength: 0.88, description: 'Love and alliances require demonstrated character, clear boundaries, and reciprocity over time.', actionableAdvice: 'Define your non-negotiable relationship standards with calm, gentle firmness.' }],
      tensions: [{ between: ['Fierce Personal Sovereignty', 'Deep Intimate Attachment'], description: 'You carry an intense longing for complete independence alongside a profound hunger for unwavering, loyal partnership.', resolutionPath: 'Communicate your need for private sanctuary early and neutrally, so your partner never mistakes your solitude for emotional abandonment.' }]
    })
  },
  
  // Rule 2: Grand Trine + Low Tension = Complacency risk
  {
    conditions: (analysis) => {
      const hasGrandTrine = analysis.dominantPatterns.some(p => p.type === 'grand_trine');
      const challengingAspects = analysis.aspects.filter(a => ['square', 'opposition'].includes(a.type) && a.strength > 0.5).length;
      return hasGrandTrine && challengingAspects < 2;
    },
    priority: 85,
    output: () => ({
      plain: "A river of natural ease and intuitive fluency circulates through your sky. A Grand Trine is an extraordinary celestial gift, allowing complex tasks, emotional equilibrium, or creative insights to flow with organic grace. However, when unmitigated by constructive tension, this ease can morph into a seductive hammock—tempting you to glide by on natural talent rather than doing the demanding work of building enduring legacy.",
      guidance: "Deliberately introduce constructive challenges into your weekly rhythm. Commit to a demanding craft or ambitious project that requires stretching your stamina. In modern 2026 living, raw talent is everywhere; what distinguishes mastery is disciplined follow-through when the initial spark wanes.",
      deep: "Effortless flow is not identical to conscious evolution. Without the sharpening pressure of a worthy mountain to climb, rare inborn brilliance risks remaining an internal sanctuary rather than an outward triumph."
    })
  },
  
  // Rule 3: T-Square = Pressure cooker action
  {
    conditions: (analysis) => {
      return analysis.dominantPatterns.some(p => p.type === 't_square');
    },
    priority: 95,
    output: (analysis, context) => {
      const tSquare = analysis.dominantPatterns.find(p => p.type === 't_square');
      const focalPlanet = tSquare?.planets[2] || 'the focal apex';
      return {
        plain: `Your natal blueprint is anchored by a high-octane celestial engine: an active T-Square that refuses to let you stay comfortable or complacent. Two opposing forces pull at you across the axis of your life, while ${focalPlanet} acts as the focal apex through which this immense pressure must discharge. In 2026 everyday experience, this feels like an internal restlessness—a persistent knowing that you came here to execute something significant and that playing small creates unbearable stagnation.`,
        guidance: `The evolutionary release valve for this architectural tension operates directly through ${focalPlanet}. Cease circular over-analysis, step away from the planning board, and translate the tension into tangible, real-world execution. Dedicated physical action and craft mastery break the mental loop every single time.`,
        deep: `T-Squares are the celestial signatures of world-builders, reformers, and masters of craft. The friction you feel is not a punishment or a mistake—it is the pressurized fuel that gives you the grit to outlast obstacles that defeat others.`,
        tensions: [{ between: ['Withholding in Self-Protection', 'Executing Bold Real-World Action'], description: 'Remaining passive builds intolerable internal pressure, while uncalculated recklessness risks unnecessary backlash.', resolutionPath: `Channel the tension into structured, daily discipline through ${focalPlanet}. That disciplined vessel is your breakthrough.` }],
        developmentalPhase: 'growing'
      };
    }
  },
  
  // Rule 4: Stellium + Question alignment = Hyper-focus
  {
    conditions: (analysis, context) => {
      const stellium = analysis.dominantPatterns.find(p => p.type === 'stellium');
      if (!stellium || !context.focusArea) return false;
      const areaData = QUESTION_AREAS[context.focusArea];
      return stellium.houses.some(h => areaData.houses.includes(h));
    },
    priority: 80,
    output: (analysis, context) => {
      return {
        plain: `Your inquiry concerning ${context.focusArea} aligns with the densest planetary concentration in your entire chart. A Stellium acts like a concentrated laser beam in your life story: energy does not scatter across twelve mild interests, but converges into intense, high-stakes focus within this sector. In modern 2026 reality, this is where you possess extraordinary leverage, deep instinct, and the power to redefine your trajectory.`,
        guidance: `Double down on ${context.focusArea} with unshakeable dedication. Clear away competing secondary distractions and protect deep, uninterrupted time blocks. When you focus your full concentration on this domain, progress compounds exponentially.`,
        deep: `Because your energy is so tightly concentrated here, your biggest hazard is all-or-nothing obsession. Build healthy grounding habits so that your identity remains sovereign even as you excel within this domain.`,
        confidence: 0.92
      };
    }
  },
  
  // Rule 5: Pluto heavy = Transformation portal
  {
    conditions: (analysis) => {
      const plutoStrength = analysis.planetaryStrength['Pluto']?.totalStrength || 0;
      const hasPlutoAspect = analysis.aspects.some(a => 
        (a.planet1 === 'Pluto' || a.planet2 === 'Pluto') && a.strength > 0.7
      );
      return plutoStrength > 0.7 || hasPlutoAspect;
    },
    priority: 85,
    output: () => ({
      plain: "You are standing inside a profound transformational portal. Pluto refuses to deal in cosmetic surface adjustments or polite compromises. An outgrown identity skin, outdated career attachment, or psychological defense mechanism is undergoing sacred dissolution so that your authentic, unshakeable sovereignty can emerge into the light.",
      guidance: "Examine with total clarity what you have outgrown in your daily life, career, or relational habits. Release your grip with dignity before mounting friction forces the issue. Trust that what falls away is clearing sacred ground for your next, more powerful incarnation.",
      deep: "Plutonian initiations feel like a descent into the dark night of the soul, but they are in fact the forge of indestructible power. Once you have survived the loss of who you thought you were, nobody can ever manipulate you with fear again.",
      developmentalPhase: 'releasing',
      emotionalTone: 'deep, intense, and transformative'
    })
  },
  
  // Rule 6: Jupiter strong + Sextiles = Opportunity window
  {
    conditions: (analysis) => {
      const jupiterStrength = analysis.planetaryStrength['Jupiter']?.totalStrength || 0;
      const sextiles = analysis.aspects.filter(a => a.type === 'sextile' && a.strength > 0.5).length;
      return jupiterStrength > 0.6 && sextiles > 1;
    },
    priority: 75,
    output: () => ({
      plain: "Doors are unlocking without brute force. Jupiter combined with supportive sextiles indicates that fortune favors saying 'yes' to new invitations.",
      guidance: "Say yes to opportunities that excite and slightly intimidate you. Take the meeting, initiate the outreach, and trust the tailwind.",
      gifts: [{ source: 'Jupiter', description: 'Generous expansion and quiet synchronicity', howToUse: 'Step into rooms before you feel 100% prepared.' }]
    })
  }
];

// ============================================================================
// DEVELOPMENTAL PHASE DETECTION
// ============================================================================

function detectDevelopmentalPhase(analysis: PatternAnalysis): DevelopmentalPhase {
  const challengingAspects = analysis.aspects.filter(a => ['square', 'opposition'].includes(a.type) && a.strength > 0.6).length;
  const harmoniousAspects = analysis.aspects.filter(a => ['trine', 'sextile'].includes(a.type) && a.strength > 0.6).length;
  const saturnStrength = analysis.planetaryStrength['Saturn']?.totalStrength || 0;
  const jupiterStrength = analysis.planetaryStrength['Jupiter']?.totalStrength || 0;
  const plutoStrength = analysis.planetaryStrength['Pluto']?.totalStrength || 0;
  
  if (plutoStrength > 0.7) return 'releasing';
  if (challengingAspects > harmoniousAspects + 1 && saturnStrength > 0.5) return 'growing';
  if (harmoniousAspects > challengingAspects + 1 && jupiterStrength > 0.5) return 'harvesting';
  if (challengingAspects > 0 && harmoniousAspects > 0) return 'integrating';
  return 'seeding';
}

// ============================================================================
// EMOTIONAL TONE DETECTION
// ============================================================================

function detectEmotionalTone(analysis: PatternAnalysis, context: UserContext): string {
  const moonStrength = analysis.planetaryStrength['Moon']?.totalStrength || 0.5;
  const moonAspects = analysis.aspects.filter(a => a.planet1 === 'Moon' || a.planet2 === 'Moon');
  const challengingMoon = moonAspects.some(a => ['square', 'opposition'].includes(a.type) && a.strength > 0.6);
  const venusStrength = analysis.planetaryStrength['Venus']?.totalStrength || 0.5;
  
  if (challengingMoon && moonStrength > 0.6) return 'deeply charged — feelings and boundaries are undergoing serious recalibration';
  if (venusStrength > 0.7) return 'warm, receptive, and relational — connection and creative spark come easily';
  if (moonStrength < 0.3) return 'composed and stoic — emotions are kept tightly contained while focus is on practical duty';
  if (analysis.dominantPatterns.some(p => p.type === 't_square')) return 'taut and alert — high creative tension ready to break through';
  
  return 'steady and centered — clear perception without emotional distortion';
}

// ============================================================================
// CHILDHOOD ROOTS & ADULTHOOD DEVELOPMENTAL ARC
// ============================================================================

function generateChildhoodRoots(analysis: PatternAnalysis, context: UserContext): string {
  const moonStrength = analysis.planetaryStrength['Moon']?.totalStrength || 0.5;
  const saturnStrength = analysis.planetaryStrength['Saturn']?.totalStrength || 0.5;
  const marsStrength = analysis.planetaryStrength['Mars']?.totalStrength || 0.5;
  
  let earlyTone = "";
  if (saturnStrength > 0.6) {
    earlyTone = "In your early childhood years, you likely learned early that responsibility fell on your shoulders. You were the child who observed adult dynamics before speaking, developing a premature self-reliance. You learned to keep your composure, manage your own fears, and earn respect through competence rather than demanding attention.";
  } else if (moonStrength > 0.6) {
    earlyTone = "In childhood, your emotional sensitivity operated like an open antenna. You absorbed the unspoken emotional climate of the home, noticing undercurrents of tension or warmth before anyone said a word. To protect yourself, you developed a rich, private internal world—a sanctuary where you could retreat when the outer environment felt overwhelming.";
  } else if (marsStrength > 0.6) {
    earlyTone = "From your earliest years, you possessed a fierce streak of personal will. You tested boundaries, insisted on doing things your own way, and reacted strongly whenever you felt unfairly constrained or micromanaged. You learned early to stand your ground, even if it meant walking alone.";
  } else {
    earlyTone = "Your early life formed the foundational crucible of your character: a mixture of watchful observation, intuitive feeling, and an early realization that you possessed an internal compass different from the crowd around you.";
  }

  const adolescentBridge = "Moving through adolescence and young adulthood, this formative wiring was tested against the real world. You experienced the friction of trying to fit into superficial groups, only to realize that popular approval left you hollow. Each challenge in early adulthood forced you to strip away false pretenses, establishing an unshakeable boundary between what belongs to you and what belongs to others.";

  return `${earlyTone}\n\n${adolescentBridge}`;
}

function generateAdulthoodArc(analysis: PatternAnalysis, context: UserContext): string {
  const saturnDignity = analysis.planetaryStrength['Saturn']?.totalStrength || 0.5;
  const sunDignity = analysis.planetaryStrength['Sun']?.totalStrength || 0.5;

  const adulthoodConsolidation = `As you stepped fully into adulthood, the defensive habits of your youth began transforming into your greatest assets. What once felt like isolating self-reliance matured into steady, grounded leadership and craft mastery. You realized that your refusal to engage in shallow networking is not an antisocial flaw—it is your greatest protective filter.`;

  const modern2026Living = `In real-world 2026 living, your life story has reached a pivotal consolidation phase:
1. **In Career & Purpose:** You are stepping away from busywork and toward sovereign authority. You thrive where your deep discernment and strategic insight are valued.
2. **In Relationships & Love:** You no longer tolerate half-hearted commitment or games. You demand and offer total fidelity, emotional honesty, and mutual respect.
3. **In Personal Sovereignty:** You have earned the right to say 'no' without guilt. Your daily peace and private sanctuary are non-negotiable anchors in an increasingly noisy world.`;

  return `${adulthoodConsolidation}\n\n${modern2026Living}`;
}

// ============================================================================
// THEME EXTRACTION (Enhanced)
// ============================================================================

function extractThemes(analysis: PatternAnalysis, context: UserContext): Theme[] {
  const themes: Theme[] = [];
  
  for (const archetype of analysis.archetypes) {
    const intensityMap = { extreme: 0.95, high: 0.8, moderate: 0.6, low: 0.4 };
    themes.push({
      name: archetype.archetype,
      strength: intensityMap[archetype.intensity],
      description: `${archetype.themes.slice(0, 3).join(', ')} are defining your life trajectory right now.`,
      actionableAdvice: generateAdviceForArchetype(archetype, context)
    });
  }
  
  if (context.focusArea) {
    const area = QUESTION_AREAS[context.focusArea];
    themes.push({
      name: `${context.focusArea.toUpperCase()} Sovereignty`,
      strength: 0.75,
      description: `Your focus on ${context.focusArea} aligns with core celestial drivers (${area.keywords.join(', ')}).`,
      actionableAdvice: `Ground your decisions in long-term character and non-negotiable standards rather than short-term panic.`
    });
  }
  
  return themes.sort((a, b) => b.strength - a.strength).slice(0, 5);
}

function generateAdviceForArchetype(archetype: ArchetypeLabel, context: UserContext): string {
  const adviceMap: Record<string, string> = {
    'Emotional Intensity':
      'In 2026\'s hyper-connected environment, your feelings operate like high-fidelity radar rather than mere moods. Pause and take three conscious breaths before reacting to sudden emotional surges. Remember that sensing an unspoken undercurrent does not require emergency defense. Establish a non-negotiable decompression ritual away from screens and alerts so your nervous system can reset before you respond.',
    'Action & Drive':
      'Initiate the bold move before you feel 100% comfortable. In modern work and creativity, waiting for total certainty is merely refined procrastination. Real-world momentum dissolves overthinking within minutes. Take one decisive, tangible step each morning that puts real skin in the game.',
    'Structure & Discipline':
      'Treat your focused calendar blocks as sacred sanctuaries. In an era dominated by notifications, endless meetings, and performative busywork, your superpower is uninterrupted craft. Build repeatable systems, protect your mornings for deep work, and let quiet consistency compound into mastery.',
    'Public Visibility':
      'Step into professional and social spaces knowing that genuine competence speaks far louder than self-promotion. In 2026, people are exhausted by digital noise; they crave authentic substance and steady discernment. Lead with quiet, unshakeable authority and let the quality of your results do the talking.',
    'Relationships & Mirrors':
      'Pay close attention to what irritates or fascinates you in others—it is actively illuminating an unintegrated boundary or hidden longing within your own psyche. Stop waiting for partners or colleagues to read your mind; express your needs early and plainly, and evaluate connections based on consistent action rather than persuasive promises.',
    'Saturn Heavy':
      'Do the single most demanding, disciplined task first thing in the morning before opening communication feeds. Saturn rewards those who face reality without complaint. When you voluntarily take on constructive responsibility, anxiety dissolves and is replaced by unshakeable self-respect.',
    'Pluto Heavy':
      'Allow outgrown situations, dead-end projects, or one-sided dynamics to expire cleanly. When Pluto is active, attempting to revive what is already dead only prolongs exhaustion. Trust the natural demolition process: clearing away the obsolete is the precise prerequisite for your next sovereign chapter.',
    'Grand Trine':
      'Refuse to let your rare natural talent become a comfortable hiding spot. When a gift comes too easily, human nature is to coast. In 2026, set deliberate, audacious benchmarks for your craft that demand rigorous effort. Channel effortless ease into structured, durable creation that serves something greater than yourself.'
  };
  
  for (const [key, advice] of Object.entries(adviceMap)) {
    if (archetype.archetype.includes(key) || key === archetype.archetype) {
      return advice;
    }
  }
  
  return `Work with ${archetype.themes[0] || 'this cosmic pattern'} with conscious intention today.`;
}

// ============================================================================
// TENSION DETECTION
// ============================================================================

function extractTensions(analysis: PatternAnalysis): Tension[] {
  const tensions: Tension[] = [];
  
  const oppositions = analysis.aspects.filter(a => a.type === 'opposition' && a.strength > 0.6);
  for (const opp of oppositions.slice(0, 2)) {
    tensions.push({
      between: [opp.planet1, opp.planet2],
      description: `In your lived 2026 experience, ${opp.planet1} pulls you toward one core life imperative while ${opp.planet2} fiercely demands another. Rather than seeing this as a toxic contradiction, recognize that both are vital dimensions of your full wholeness. When unintegrated, you may swing between intense immersion in one side and total abandonment of the other.`,
      resolutionPath: `Establish an intentional life rhythm that honors each drive in dedicated seasons and time blocks. In close relationships, communicate these alternating needs transparently so partners understand your rhythm without taking it personally.`
    });
  }
  
  const tSquare = analysis.dominantPatterns.find(p => p.type === 't_square');
  if (tSquare) {
    tensions.push({
      between: tSquare.planets,
      description: `The energetic tug-of-war along the ${tSquare.planets[0]} vs ${tSquare.planets[1]} axis is compressed directly onto ${tSquare.planets[2]}. In daily life, this feels like an internal engine that constantly demands release—accumulating restless energy whenever you stay passive or try to please everyone.`,
      resolutionPath: `Direct this pressurized energy into structured, daily craftsmanship through ${tSquare.planets[2]}. Moving your body, writing, building tangible projects, and making clear decisions converts this friction into formidable stamina.`
    });
  }
  
  if (tensions.length === 0) {
    tensions.push({
      between: ['Personal Autonomy', 'Relational Intimacy'],
      description: 'The defining modern tension between maintaining your sovereign boundaries and dropping your armor to experience deep, vulnerable intimacy. One part of you insists on carrying everything alone; the other yearns for an unwavering ally who truly sees your soul.',
      resolutionPath: 'Communicate your need for solitude calmly and early, before exhaustion sets in. Safe, high-trust partners will respect your independence when they know you are not running away.'
    });
  }
  
  return tensions.slice(0, 3);
}

// ============================================================================
// GIFT DETECTION
// ============================================================================

function extractGifts(analysis: PatternAnalysis): Gift[] {
  const gifts: Gift[] = [];
  
  const grandTrine = analysis.dominantPatterns.find(p => p.type === 'grand_trine');
  if (grandTrine) {
    gifts.push({
      source: 'Grand Trine Synthesis',
      description: `A rare, harmonious celestial circuit connecting ${grandTrine.planets.join(', ')}. Tasks, intuitive insights, and creative endeavors that exhaust other people flow through your hands with natural, organic grace.`,
      howToUse: 'Do not hide this gift in the shadows or assume everyone can do it. Anchor a visible, professional craft or community service around this fluency; it is your enduring point of high-leverage impact in 2026.'
    });
  }
  
  const jupiterStrength = analysis.planetaryStrength['Jupiter']?.totalStrength || 0;
  if (jupiterStrength > 0.65) {
    gifts.push({
      source: 'Jupiterian Vision & Strategic Horizon',
      description: 'An expansive capacity to see beyond immediate panic, identify long-range silver linings, and maintain faith in your trajectory even when surrounded by short-term digital chaos.',
      howToUse: 'Step into rooms before you feel 100% prepared. Take calculated leaps of faith, initiate bold career moves, and mentor others who need your grounded optimism.'
    });
  }
  
  const venusStrength = analysis.planetaryStrength['Venus']?.totalStrength || 0;
  if (venusStrength > 0.65) {
    gifts.push({
      source: 'Venusian Magnetism & Discernment',
      description: 'Natural aesthetic refinement, relational grace, and an innate instinct for authentic quality in both creative work and human character. You instantly sense when someone is being fake or sincere.',
      howToUse: 'Invest in curated, high-trust environments. Say an uncompromising "no" to cheap compromises, and cultivate deep reciprocal loyalty with your chosen allies.'
    });
  }

  if (gifts.length === 0) {
    gifts.push({
      source: 'Sovereign Discernment',
      description: 'An innate, high-accuracy radar for emotional substance and the rare ability to remain centered and lucid while others panic in superficial noise.',
      howToUse: 'Trust your first intuitive assessment of people, contracts, and environments. You rarely need second-guessing.'
    });
  }
  
  return gifts.slice(0, 3);
}

// ============================================================================
// LAYER GENERATORS
// ============================================================================

function generatePlainLayer(analysis: PatternAnalysis, context: UserContext, phase: DevelopmentalPhase, tone: string): string {
  const topArchetypes = analysis.archetypes.slice(0, 2);
  
  const phaseLanguage: Record<DevelopmentalPhase, string> = {
    'seeding': 'You are currently moving through a sacred seeding phase in your life arc. The real work is occurring subterranean—beneath the surface of public notice. In real-world 2026 terms, this is not the time for impatient launches or seeking immediate external validation; it is the season for quiet craft, laying unshakeable structural foundations, and clarifying your non-negotiables.',
    'growing': 'You are currently navigating an active, vigorous growth phase. Growth invariably creates constructive friction: old habits resist change, new responsibilities test your capacity, and your daily schedule demands tighter boundaries. In 2026 living, this friction is the exact sign that your stamina, authority, and emotional maturity are expanding.',
    'harvesting': 'You are currently standing in a fruitful harvesting chapter. The discipline, silent endurance, and integrity you cultivated through past crucibles are bearing tangible fruit. In everyday life, this manifests as heightened credibility, unforced respect from peers, and opportunities that align with your natural strengths.',
    'releasing': 'You are currently traversing a necessary releasing phase. An outdated chapter, an outgrown defense mechanism, or a one-sided connection has reached its natural expiration. In modern living, holding onto what has finished its purpose only generates exhaustion; releasing it with gratitude clears the runway for your true next incarnation.',
    'integrating': 'You are currently walking through a powerful integration phase. Opposing parts of your personality—the watchful child who learned to self-rely and the mature adult ready for mutual trust—are coming to peace. You are realizing that you do not have to choose between total autonomy and deep intimacy.'
  };
  
  const archetypeText = topArchetypes.length > 0
    ? topArchetypes.map(a => `**${a.archetype}** (${a.themes.slice(0, 2).join(', ')})`).join(' alongside ')
    : "a poised, balanced celestial equilibrium";
  
  const paragraphs = [
    `Your life story right now is anchored by ${archetypeText}. In real-world 2026 living, this means your energy is not diffused across chaotic trivialities; your psyche is concentrated on establishing genuine substance, protecting your focus, and refusing to settle for performative illusions.`,
    phaseLanguage[phase],
    `At an emotional and psychological frequency, the underlying tone of your present reality is **${tone}**. This reflects an internal system that is highly perceptive, scanning your environment for authenticity, and demanding that your external actions match your inner truth.`
  ];
  
  if (context.focusArea) {
    paragraphs.push(`Regarding your inquiry about **${context.focusArea}**: the celestial architecture indicates that this domain is a primary testing ground for your personal sovereignty. Rather than seeking quick fixes, treat this area as your master class in building enduring value.`);
  }
  
  return paragraphs.join('\n\n');
}

function generateDeepLayer(analysis: PatternAnalysis, context: UserContext): string {
  const lines: string[] = [];
  
  const strongest = Object.entries(analysis.planetaryStrength)
    .sort((a, b) => b[1].totalStrength - a[1].totalStrength)[0];
  
  if (strongest) {
    lines.push(getDignityPhrase(strongest[0], strongest[1].totalStrength));
  }
  
  const strongestAspect = analysis.aspects
    .sort((a, b) => b.strength - a.strength)[0];
  
  if (strongestAspect && strongestAspect.strength > 0.5) {
    const isHarmonious = ['trine', 'sextile', 'conjunction'].includes(strongestAspect.type);
    const dignity = analysis.planetaryStrength[strongestAspect.planet1]?.totalStrength || 0.5;
    lines.push(interpretAspect(
      strongestAspect.planet1, strongestAspect.planet2,
      strongestAspect.type, strongestAspect.strength,
      dignity, isHarmonious
    ));
  }
  
  const plutoStrength = analysis.planetaryStrength['Pluto']?.totalStrength || 0;
  if (plutoStrength > 0.6) {
    lines.push("Pluto's heavy presence indicates that subterranean truth demands acknowledgement. In real-world 2026 terms, what have you been quietly tolerating or carrying out of habit that is ready for total honest rebirth? Real power begins the moment you stop protecting what is already decaying.");
  }
  
  return lines.join('\n\n');
}

function generateGuidanceLayer(analysis: PatternAnalysis, context: UserContext, phase: DevelopmentalPhase, tensions: Tension[]): string {
  const guidance: string[] = [];
  
  const phaseGuidance: Record<DevelopmentalPhase, string> = {
    'seeding': 'Commit to one small, non-negotiable daily habit starting today. In modern life, empires are not built overnight—they are constructed from consistent 45-minute blocks of quiet craft protected from notifications.',
    'growing': 'Take one action today that stretches your comfort zone by just ten percent. In 2026, real courage is not recklessness; it is showing up at your growing edge even when your stomach flips.',
    'harvesting': 'Celebrate your tangible progress, thank those who stood loyally beside you, and consolidate your wins before compulsively chasing the next mountain.',
    'releasing': 'Ask yourself with complete honesty: "What am I holding onto that is actually holding me back?" Unsubscribe, resign, or step back from one obligation that drains your vital spirit without reciprocating value.',
    'integrating': 'Write down your two conflicting impulses side-by-side. Then ask what mature middle path allows both needs to be honored in their proper seasons.'
  };
  guidance.push(`**Phase Guidance:** ${phaseGuidance[phase]}`);
  
  if (tensions.length > 0) {
    guidance.push(`**Tension Resolution:** ${tensions[0].resolutionPath}`);
  }
  
  if (context.focusArea) {
    const areaGuidance: Record<QuestionArea, string> = {
      'career': 'Focus on visible, high-impact craft today. Block out distraction, silence communication pings, and execute one task of undeniable competence.',
      'relationships': 'Speak the honest truth you have been privately rehearsing in your head. In 2026, sincere vulnerability coupled with clear boundaries unlocks profound trust.',
      'health': 'Do one act of kindness for your future physical body today—proper hydration, deep sleep, or an intentional walk away from screens.',
      'finance': 'Review your numbers clearly, neutrally, and without self-judgment. Financial clarity and intentional living are the foundations of true sovereignty.',
      'spirituality': 'Carve out 15 uninterrupted minutes of silence. Step outdoors, disconnect from digital feeds, and let your nervous system recalibrate.',
      'general': 'Ask your inner elder: "What will truly matter across the next five years?" Then align today\'s calendar and priorities with that long-range perspective.',
      'creativity': 'Create something raw, authentic, and unpolished today. Finished and genuine beats sterile perfection every time.',
      'home': 'Reclaim and clear your physical sanctuary. Order and beauty in your immediate physical environment create immediate calm in your mind.'
    };
    guidance.push(`**Targeted Focus (${context.focusArea}):** ${areaGuidance[context.focusArea]}`);
  }
  
  return guidance.join('\n\n');
}

function generateForecastLayer(analysis: PatternAnalysis, phase: DevelopmentalPhase): string {
  const fastPlanets = ['Moon', 'Mercury', 'Venus', 'Mars'];
  const fastAspects = analysis.aspects.filter(a => 
    fastPlanets.includes(a.planet1) || fastPlanets.includes(a.planet2)
  );
  
  const forecast: string[] = [];
  
  if (phase === 'growing') {
    forecast.push("The pressure you feel is constructive architectural tension. It is building your character and fortitude, not tearing down your peace.");
  } else if (phase === 'harvesting') {
    forecast.push("A window of ease, public recognition, and reciprocal support is opening. Receive what arrives without impostor syndrome or hesitation.");
  } else if (phase === 'releasing') {
    forecast.push("The discomfort of letting go is the sacred labor of transition. Clarity, lighter shoulders, and fresh vitality will follow promptly once you release your grip.");
  }
  
  if (fastAspects.some(a => a.type === 'square' && a.strength > 0.65)) {
    forecast.push("Across the coming 7 to 14 days, a lingering dilemma in your personal or professional sphere will reach a natural inflection point. Stay grounded, avoid reactive arguments, and speak with calm, decisive clarity.");
  } else if (fastAspects.some(a => a.type === 'trine' && a.strength > 0.65)) {
    forecast.push("The coming days offer a clear runway for forward momentum. Move decisively, submit the proposal, or initiate the outreach while celestial tailwinds are behind you.");
  } else {
    forecast.push("The emerging cycle counsels patience, keen observation, and strengthening your internal perimeter before making major outward commitments.");
  }
  
  return forecast.join('\n\n');
}

function calculateConfidence(analysis: PatternAnalysis, rulesApplied: number): number {
  let confidence = 0.75;
  if (analysis.archetypes.length > 2) confidence += 0.08;
  if (analysis.dominantPatterns.length > 1) confidence += 0.08;
  if (analysis.aspects.length > 3) confidence += 0.05;
  if (rulesApplied > 0) confidence += 0.04;
  return Math.min(0.98, Math.max(0.4, confidence));
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export function generateReading(
  analysis: PatternAnalysis,
  context: UserContext,
  location: string,
  time: string,
  date: string
): ReadingOutput {
  let synthesized: Partial<ReadingOutput> = {};
  const applicableRules = synthesisRules
    .filter(rule => rule.conditions(analysis, context))
    .sort((a, b) => b.priority - a.priority);
  
  for (const rule of applicableRules.slice(0, 2)) {
    const output = rule.output(analysis, context);
    synthesized = { ...synthesized, ...output };
  }
  
  const phase = detectDevelopmentalPhase(analysis);
  const tone = detectEmotionalTone(analysis, context);
  
  const themes = extractThemes(analysis, context);
  const tensions = extractTensions(analysis);
  const gifts = extractGifts(analysis);
  
  const plain = synthesized.plain || generatePlainLayer(analysis, context, phase, tone);
  const deep = synthesized.deep || generateDeepLayer(analysis, context);
  const guidance = synthesized.guidance || generateGuidanceLayer(analysis, context, phase, tensions);
  const forecast = synthesized.forecast || generateForecastLayer(analysis, phase);
  
  const childhoodRoots = generateChildhoodRoots(analysis, context);
  const adulthoodArc = generateAdulthoodArc(analysis, context);
  
  const confidence = synthesized.confidence || calculateConfidence(analysis, applicableRules.length);
  
  const tempOutput: ReadingOutput = {
    plain,
    deep,
    guidance,
    forecast,
    childhoodRoots,
    adulthoodArc,
    themes,
    tensions,
    gifts,
    developmentalPhase: phase,
    emotionalTone: tone,
    formattedReading: "",
    timestamp: new Date(),
    confidence
  };
  
  tempOutput.formattedReading = formatReadingForDisplay(tempOutput, context, location, date);
  return tempOutput;
}

// ============================================================================
// FORMATTING & UTILITIES
// ============================================================================

export function formatReadingForDisplay(
  reading: ReadingOutput,
  context: UserContext,
  location = "Observatory Sky",
  date = new Date().toLocaleDateString()
): string {
  const nameIntro = context.name ? ` FOR ${context.name.toUpperCase()}` : '';
  
  const giftsSection = reading.gifts.length > 0
    ? `### 🎁 Core Gifts & Superpowers\n\n${reading.gifts.map(g => `* **${g.source}:** ${g.description}\n  * → **How to use in 2026:** ${g.howToUse}`).join('\n\n')}\n\n`
    : '';

  const tensionsSection = reading.tensions.length > 0
    ? `### ⚡ Tensions & Growth Edges\n\n${reading.tensions.map(t => `* **Between ${t.between.join(' & ')}:** ${t.description}\n  * → **Resolution Path:** ${t.resolutionPath}`).join('\n\n')}\n\n`
    : '';

  const themesSection = `### 🎯 Key Life Themes\n\n${reading.themes.map(t => `* **${t.name} (${Math.round(t.strength * 100)}% Convergence):** ${t.description}\n  * → **Actionable Practice:** ${t.actionableAdvice}`).join('\n\n')}`;

  return `# The Master Life Reading${nameIntro}
*Grounding in ${location} · ${date}*

> **Developmental Phase:** \`${reading.developmentalPhase.toUpperCase()}\` · **Emotional Tone:** \`${reading.emotionalTone}\` · **System Confidence:** \`${Math.round(reading.confidence * 100)}%\`

---

## I. What Is True Right Now (The Present Reality)
${reading.plain}

---

## II. The Childhood Roots & Formative Wiring
${reading.childhoodRoots}

---

## III. The Adulthood Arc & 2026 Sovereignty
${reading.adulthoodArc}

---

## IV. Deep Truth & Planetary Authority
${reading.deep}

---

## V. Grounded Guidance & Practical Next Steps
${reading.guidance}

---

## VI. What Is Emerging on the Horizon
${reading.forecast}

---

${giftsSection}${tensionsSection}${themesSection}

---

*“The sky speaks with mathematical elegance. You listened. Now walk in grounded sovereignty.”*
`;
}

// ============================================================================
// QUICK READINGS FOR SPECIFIC CONTEXTS
// ============================================================================

export function quickReading(
  analysis: PatternAnalysis,
  question: string,
  location: string
): ReadingOutput {
  let focusArea: QuestionArea = 'general';
  const qLower = question.toLowerCase();
  
  if (qLower.includes('job') || qLower.includes('career') || qLower.includes('work')) focusArea = 'career';
  else if (qLower.includes('love') || qLower.includes('partner') || qLower.includes('relationship')) focusArea = 'relationships';
  else if (qLower.includes('money') || qLower.includes('finance') || qLower.includes('wealth')) focusArea = 'finance';
  else if (qLower.includes('health') || qLower.includes('body') || qLower.includes('heal')) focusArea = 'health';
  else if (qLower.includes('purpose') || qLower.includes('spiritual') || qLower.includes('meaning')) focusArea = 'spirituality';
  else if (qLower.includes('creativ') || qLower.includes('art') || qLower.includes('make')) focusArea = 'creativity';
  else if (qLower.includes('home') || qLower.includes('family') || qLower.includes('house')) focusArea = 'home';
  
  return generateReading(analysis, {
    question,
    focusArea,
    preferredTone: 'direct'
  }, location, new Date().toLocaleTimeString(), new Date().toDateString());
}
