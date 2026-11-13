// Human-to-Human Resonance Dialogue Engine
// Translates transit-to-natal aspects into specific, distinct, real-world behavioral insights.
// Plain language only: no mystical filler, no identical fallback boilerplate, distinct copy per transit->natal direction AND aspect angle.

export interface HumanAspectDialogue {
  everydayTitle: string;
  tagline: string;
  feelingInBodyAndMind: string;
  workAndMoney: string;
  relationshipsAndPeople: string;
  bestMoveToday: string;
  trapToAvoid: string;
  isMajor: boolean;
  impactExplanation: string;
}

type AspectKind =
  | "conjunction"
  | "trine"
  | "sextile"
  | "semisextile"
  | "square"
  | "opposition"
  | "semisquare"
  | "quincunx";

interface TransitActorSpec {
  shortLabel: string;
  flowCatalyst: string;
  frictionCatalyst: string;
  bodyMindFlow: string;
  bodyMindFriction: string;
  workFlow: string;
  workFriction: string;
  socialFlow: string;
  socialFriction: string;
  bestMoveFlow: string;
  bestMoveFriction: string;
  trapFlow: string;
  trapFriction: string;
}

interface NatalReceptorSpec {
  domain: string;
  personalTrait: string;
  workArena: string;
  relationshipArena: string;
  sensitiveSpot: string;
  strengthAnchor: string;
}

interface AspectMechanic {
  label: string;
  isHarmonious: boolean;
  isFriction: boolean;
  titleVerbFlow: string;
  titleVerbFriction: string;
  taglineNote: string;
  howItFeels: string;
  workStyle: string;
  peopleStyle: string;
  timingNote: string;
}

const ASPECT_MECHANICS: Record<string, AspectMechanic> = {
  conjunction: {
    label: "Conjunction",
    isHarmonious: true,
    isFriction: false,
    titleVerbFlow: "Amplifies",
    titleVerbFriction: "Merges With",
    taglineNote: "Both forces land in the same place at once, turning up the volume on your immediate reaction.",
    howItFeels: "You feel this right up front because outside timing and your personal habit fire together.",
    workStyle: "Put this concentrated energy behind one top priority instead of splitting focus across half-finished work.",
    peopleStyle: "People immediately sense your mood and direction before you even say much.",
    timingNote: "Act deliberately while momentum is direct and unmistakable.",
  },
  trine: {
    label: "Trine",
    isHarmonious: true,
    isFriction: false,
    titleVerbFlow: "Opens an Easy Lane for",
    titleVerbFriction: "Flows Through",
    taglineNote: "Timing lines up smoothly with very little pushback.",
    howItFeels: "Your instincts and outside circumstances pull in the same direction, lowering second-guessing.",
    workStyle: "Use the low-friction rhythm to ship deliverables or advance agreements while doors are open.",
    peopleStyle: "Expect easier rapport and fewer defensive walls when you bring up an honest point.",
    timingNote: "Don't just coast on comfort—finish something concrete while friction stays low.",
  },
  sextile: {
    label: "Sextile",
    isHarmonious: true,
    isFriction: false,
    titleVerbFlow: "Creates a Practical Opening for",
    titleVerbFriction: "Nudges",
    taglineNote: "This helpful opening stays quiet unless you make the first move.",
    howItFeels: "You notice a mild spark of curiosity or readiness as soon as you engage.",
    workStyle: "A quick outreach message, follow-up call, or smart tweak goes much further than grinding solo.",
    peopleStyle: "One casual conversation or direct ask can bridge a gap smoothly today.",
    timingNote: "Initiate the step—opportunity responds right after you reach out.",
  },
  semisextile: {
    label: "Semisextile",
    isHarmonious: true,
    isFriction: false,
    titleVerbFlow: "Gently Tweaks",
    titleVerbFriction: "Nudges",
    taglineNote: "A quiet side-nudge connecting two daily habits that need one small adjustment.",
    howItFeels: "Not dramatic—just a gentle mental tap reminding you to sync two routines that usually run separately.",
    workStyle: "Tidy one minor workflow handoff or calendar detail so a small oversight doesn't linger.",
    peopleStyle: "Keep quick check-ins clear and straightforward so minor tone differences don't distract.",
    timingNote: "Make a one-minute practical fix now instead of ignoring a tiny habit mismatch.",
  },
  square: {
    label: "Square",
    isHarmonious: false,
    isFriction: true,
    titleVerbFlow: "Forces a Decision Around",
    titleVerbFriction: "Pressures",
    taglineNote: "Two competing priorities collide and push for a clear decision.",
    howItFeels: "Tension builds until you pick a lane, draw a boundary, or shift how you are spending effort.",
    workStyle: "Expect a bottleneck, tight deadline, or blunt feedback that points straight to what needs fixing.",
    peopleStyle: "Someone may test your patience or push an opposing agenda, so state your limits calmly and clearly.",
    timingNote: "Turn pressure into crisp execution or an honest boundary instead of venting.",
  },
  opposition: {
    label: "Opposition",
    isHarmonious: false,
    isFriction: true,
    titleVerbFlow: "Mirrors",
    titleVerbFriction: "Pulls Against",
    taglineNote: "You meet this push-pull across the table through another person's request or deadline.",
    howItFeels: "You can feel tugged between two valid sides: what you want to do and what someone else expects.",
    workStyle: "Negotiation beats stubbornness—check the other side's constraints before locking in terms.",
    peopleStyle: "Someone else acts like a mirror today, voicing the exact tradeoff you have been weighing internally.",
    timingNote: "Aim for a workable middle split rather than forcing an all-or-nothing win.",
  },
  semisquare: {
    label: "Semisquare",
    isHarmonious: false,
    isFriction: true,
    titleVerbFlow: "Triggers a Minor Snag in",
    titleVerbFriction: "Aggravates",
    taglineNote: "A small timing snag or low-grade irritation that clears fast once handled.",
    howItFeels: "More like a pebble in your shoe than a crisis—minor restlessness or impatience over small details.",
    workStyle: "Double-check calendar links, numbers, and replies before sending so tiny slip-ups don't waste an hour.",
    peopleStyle: "Small misunderstandings happen fast when rushed, so clarify what you meant instead of letting irritation simmer.",
    timingNote: "Handle the specific friction point directly so a minor snag doesn't derail your focus.",
  },
  quincunx: {
    label: "Quincunx",
    isHarmonious: false,
    isFriction: true,
    titleVerbFlow: "Forces a Pivot Around",
    titleVerbFriction: "Clashes With",
    taglineNote: "Your usual habit doesn't fit today's setup—adapting expectations unlocks the fix.",
    howItFeels: "An awkward 'almost, but not quite' sensation where normal autopilot responses miss the mark.",
    workStyle: "Stop forcing an old method onto a changed situation; reorder steps or trim scope.",
    peopleStyle: "You and someone else may be speaking from two completely different assumptions—ask a clarifying question first.",
    timingNote: "Adjust your approach creatively instead of repeating the same tactic harder.",
  },
};

const TRANSIT_ACTORS: Record<string, TransitActorSpec> = {
  Sun: {
    shortLabel: "Spotlight & Will",
    flowCatalyst: "steady personal focus and visible confidence",
    frictionCatalyst: "ego pressure and competing demands for attention",
    bodyMindFlow: "Mental fog clears around what actually deserves your energy right now.",
    bodyMindFriction: "Pressure to prove yourself can make small obstacles feel personal.",
    workFlow: "Step forward in meetings, sign off on decisions, and take clear ownership of a deliverable.",
    workFriction: "Watch power struggles with managers or clients; focus on results rather than credit.",
    socialFlow: "Warm, straightforward presence puts people at ease and shows where you stand.",
    socialFriction: "Avoid taking blunt feedback as an attack on your capability.",
    bestMoveFlow: "Lead the conversation or lock in a clear priority before noon.",
    bestMoveFriction: "Separate your self-worth from one temporary disagreement or delay.",
    trapFlow: "Assuming others automatically notice what needs doing without clear direction.",
    trapFriction: "Doubling down out of stubborn pride when a small pivot would solve it.",
  },
  Moon: {
    shortLabel: "Mood & Gut Radar",
    flowCatalyst: "quick emotional balance and instinctive ease",
    frictionCatalyst: "touchy moods and shifting energy",
    bodyMindFlow: "Your nervous system settles easily; sleep, appetite, and intuition stay well synced.",
    bodyMindFriction: "Physical fatigue or noise amplifies minor annoyances faster than usual.",
    workFlow: "Trust practical hunches about timing, tone, and how teammates or clients feel.",
    workFriction: "Stick to routine tasks rather than making permanent career calls during a passing mood dip.",
    socialFlow: "Warm check-ins with family or close friends feel natural and grounding.",
    socialFriction: "Pause before replying to a brief text so you don't read neutral remarks as cold.",
    bestMoveFlow: "Arrange your demanding tasks around your natural energy peaks today.",
    bestMoveFriction: "Eat, hydrate, and take a 15-minute reset before answering tense messages.",
    trapFlow: "Staying inside your comfort zone when a small stretch would pay off.",
    trapFriction: "Treating a passing two-hour mood dip like a permanent verdict.",
  },
  Mercury: {
    shortLabel: "Thinking & Messages",
    flowCatalyst: "sharp wording and quick problem-solving",
    frictionCatalyst: "mixed messages and rushed scheduling",
    bodyMindFlow: "Thoughts connect fast; putting messy ideas into plain words feels effortless.",
    bodyMindFriction: "Your brain moves faster than your patience, making it easy to skim past key instructions.",
    workFlow: "Clear your inbox, draft proposals, negotiate terms, and wrap up analytical tasks.",
    workFriction: "Read contracts, dates, and recipient lines twice; verify anything vague verbally.",
    socialFlow: "Witty banter, quick logistics texts, and clearing the air come easily.",
    socialFriction: "Interrupting or over-explaining can escalate a simple misunderstanding.",
    bestMoveFlow: "Send the key message or outline the plan while your wording is crisp.",
    bestMoveFriction: "Write messy thoughts privately first or ask one short question before debating.",
    trapFlow: "Talking faster than listeners can follow when your mind jumps ahead.",
    trapFriction: "Firing off a quick reply to an annoying email just to win a point.",
  },
  Venus: {
    shortLabel: "Value, Money & Rapport",
    flowCatalyst: "social warmth and sound spending judgment",
    frictionCatalyst: "budget temptation and unspoken fairness tension",
    bodyMindFlow: "You feel more relaxed, appreciative, and tuned in to comfort and quality.",
    bodyMindFriction: "An urge to buy quick relief, dodge awkwardness, or seek reassurance clouds clarity.",
    workFlow: "Smooth client rapport, discuss pricing, refine presentation, and ease team friction.",
    workFriction: "Skip impulse purchases and avoid underpricing your work just to keep peace.",
    socialFlow: "Compliments, shared meals, and genuine affection soften recent distance.",
    socialFriction: "Don't swallow annoyance silently and expect others to guess why you pulled back.",
    bestMoveFlow: "Invest time in a key relationship or practical upgrade that improves daily comfort.",
    bestMoveFriction: "Check whether an expense or compromise reflects real value or temporary boredom.",
    trapFlow: "Putting off necessary chores because socializing feels much nicer.",
    trapFriction: "Saying yes out of politeness and resenting the promise later.",
  },
  Mars: {
    shortLabel: "Drive & Edge",
    flowCatalyst: "decisive momentum and physical stamina",
    frictionCatalyst: "impatience and sharp pushback",
    bodyMindFlow: "Energy turns cleanly into action; difficult tasks shrink once you start.",
    bodyMindFriction: "Adrenaline sits high, making slow systems, traffic, or hesitant people grating.",
    workFlow: "Tackle the toughest item first, pitch directly, and keep timelines moving.",
    workFriction: "Pour urgency into solo physical output instead of sending blunt, heated messages.",
    socialFlow: "Direct honesty clears stale air fast and energizes shared plans.",
    socialFriction: "Watch your delivery—being direct can land as hostility when you only mean speed.",
    bestMoveFlow: "Move a stalled task from talk into concrete execution right now.",
    bestMoveFriction: "Burn off restlessness with brisk movement before addressing a sore topic.",
    trapFlow: "Starting three sprints at once and running out of steam mid-afternoon.",
    trapFriction: "Turning a small logistical delay into a personal showdown.",
  },
  Jupiter: {
    shortLabel: "Scope & Opportunity",
    flowCatalyst: "broad perspective and timely openings",
    frictionCatalyst: "overpromising and blind spots on time or cost",
    bodyMindFlow: "You zoom out easily and spot possibilities you missed on busier days.",
    bodyMindFriction: "Restless appetite for bigger wins makes steady maintenance feel confining.",
    workFlow: "Pitch larger scope, reconnect with mentors, or map out smart growth plans.",
    workFriction: "Add a 20% time and budget buffer before agreeing to exciting new work.",
    socialFlow: "Generosity, humor, and shared big-picture excitement bring people together.",
    socialFriction: "Avoid promising next-week favors that overload your real calendar.",
    bestMoveFlow: "Say yes to one credible stretch conversation or review next-quarter goals.",
    bestMoveFriction: "Audit the boring operational math underneath an appealing offer.",
    trapFlow: "Skipping small quality checks because progress feels guaranteed.",
    trapFriction: "Spending money or time based purely on best-case assumptions.",
  },
  Saturn: {
    shortLabel: "Structure & Reality Check",
    flowCatalyst: "steady discipline and earned credibility",
    frictionCatalyst: "heavy expectations and strict timelines",
    bodyMindFlow: "Calm, practical focus helps you finish unglamorous work without drama.",
    bodyMindFriction: "Energy feels tighter, exposing weak margins or nagging self-doubt.",
    workFlow: "Tighten budgets, clean up systems, hit deadlines, and show reliable quality.",
    workFriction: "When a rule or delay slows progress, fix the bottleneck instead of blaming yourself.",
    socialFlow: "Showing up reliably speaks louder than flashy promises today.",
    socialFriction: "Tell people when you are locked into deadlines so focus isn't misread as coldness.",
    bestMoveFlow: "Finish one foundational habit or backlog task that simplifies the rest of the month.",
    bestMoveFriction: "Trim non-essential commitments and give one heavy duty realistic pacing.",
    trapFlow: "Expecting everyone around you to match a strict, all-business pace.",
    trapFriction: "Assuming slow progress today means the whole plan isn't working.",
  },
  Uranus: {
    shortLabel: "Change & Independence",
    flowCatalyst: "fresh shortcuts and smart breakthroughs",
    frictionCatalyst: "schedule curveballs and impatience with routine",
    bodyMindFlow: "Your mind spots original fixes and clean ways to break boring stalemates.",
    bodyMindFriction: "Nervous restlessness makes sitting through repetitive tasks or rigid rules exhausting.",
    workFlow: "Test a smarter workflow, automate repetitive steps, or modernize an old plan.",
    workFriction: "Save backups, expect last-minute calendar pivots, and avoid burning bridges impulsively.",
    socialFlow: "Refreshing honesty and lively conversations click with independent people.",
    socialFriction: "Don't flip plans abruptly just to prove nobody runs your schedule.",
    bestMoveFlow: "Try one unconventional improvement or small experiment today.",
    bestMoveFriction: "Leave flexible buffer in your schedule so sudden surprises don't rattle you.",
    trapFlow: "Changing too many moving parts at once before others can adjust.",
    trapFriction: "Dropping a steady commitment purely out of passing boredom.",
  },
  Neptune: {
    shortLabel: "Intuition & Ambiguity",
    flowCatalyst: "creative insight and strong empathy",
    frictionCatalyst: "mixed signals and low stamina",
    bodyMindFlow: "Imagination softens rigid stress; visual thinking and quiet insight land clearly.",
    bodyMindFriction: "Brain fog or tiredness creeps in faster around noise or vague expectations.",
    workFlow: "Lean into design, storytelling, vision work, or reading unspoken client hesitation.",
    workFriction: "Get verbal promises in writing and verify concrete numbers before relying on hype.",
    socialFlow: "Gentle, attentive listening helps someone open up without heavy advice.",
    socialFriction: "Check facts before absorbing someone else's stress or misreading silence.",
    bestMoveFlow: "Protect a quiet 30-minute block away from alerts for creative or reflective work.",
    bestMoveFriction: "Ask for specific examples and clear next steps whenever plans sound blurry.",
    trapFlow: "Letting practical deadlines drift while absorbed in big ideas.",
    trapFriction: "Ignoring a real warning sign because you want the situation to stay easy.",
  },
  Pluto: {
    shortLabel: "Depth & Control",
    flowCatalyst: "sharp resolve and cutting past fluff",
    frictionCatalyst: "control struggles and dug-in resistance",
    bodyMindFlow: "You see straight to the root issue and have the grit to fix what others dodge.",
    bodyMindFriction: "Obsessing over one unresolved problem drains mental bandwidth fast.",
    workFlow: "Audit broken systems, negotiate from researched facts, and cut dead weight.",
    workFriction: "Notice where micromanaging an outcome creates pushback instead of safety.",
    socialFlow: "Candid, deep conversations clear silent resentment and strengthen loyalty.",
    socialFriction: "Avoid keeping quiet score or testing people instead of speaking plainly.",
    bestMoveFlow: "Eliminate one draining habit, expense, or bottleneck for good.",
    bestMoveFriction: "Step back from trying to control how someone reacts; hold your own boundary calmly.",
    trapFlow: "Bringing heavy intensity to a light, casual conversation.",
    trapFriction: "Refusing to let a minor slight go until it turns into a standoff.",
  },
  "North Node": {
    shortLabel: "Growth Edge",
    flowCatalyst: "timely nudges toward unfamiliar skills and goals",
    frictionCatalyst: "growing pains outside your comfort script",
    bodyMindFlow: "Future-oriented steps feel energizing even before every detail is mapped.",
    bodyMindFriction: "Stepping past old habits triggers brief self-consciousness or hesitation.",
    workFlow: "Connect with new circles, learn a modern skill, or volunteer for forward-looking work.",
    workFriction: "Notice where sticking strictly to 'how I always do it' blocks real progress.",
    socialFlow: "New faces or mentors drop helpful clues about your next chapter.",
    socialFriction: "Outgrowing an old dynamic feels awkward—stay respectful without shrinking back.",
    bestMoveFlow: "Say yes to one unfamiliar step aligned with where you want to be in six months.",
    bestMoveFriction: "Pick one small stretch action today instead of hiding in safe busywork.",
    trapFlow: "Chasing brand-new goals while leaving current basics unfinished.",
    trapFriction: "Mistaking normal stretch discomfort for a sign that you should quit.",
  },
  "South Node": {
    shortLabel: "Autopilot & Old Loops",
    flowCatalyst: "smooth recall of seasoned skills",
    frictionCatalyst: "falling back into stale autopilot habits",
    bodyMindFlow: "Muscle memory kicks in cleanly—tested routines keep daily logistics steady.",
    bodyMindFriction: "Temptation rises to retreat into familiar coping habits even though life moved on.",
    workFlow: "Clear lingering loose ends using proven skills to stabilize moving pieces.",
    workFriction: "Watch repeating an outdated workaround purely because it feels predictable.",
    socialFlow: "Familiar contacts resurface with warm closure or easy shorthand.",
    socialFriction: "Old recurring pet peeves can replay unless one person changes the script.",
    bestMoveFlow: "Use one hard-earned lesson from past experience to simplify today's workload.",
    bestMoveFriction: "Catch one autopilot habit you run under stress and deliberately choose the updated option.",
    trapFlow: "Coasting inside familiar routines you have already outgrown.",
    trapFriction: "Rehashing old history instead of handling what stands in front of you now.",
  },
};

const NATAL_RECEPTORS: Record<string, NatalReceptorSpec> = {
  Sun: {
    domain: "your confidence, core goals, and personal pride",
    personalTrait: "core pride and vitality",
    workArena: "your main goals, visibility, and leadership",
    relationshipArena: "how openly you show up and expect respect",
    sensitiveSpot: "feeling overlooked or boxed in",
    strengthAnchor: "clear self-direction",
  },
  Moon: {
    domain: "your daily mood, gut comfort, and home rhythm",
    personalTrait: "gut feelings and comfort habits",
    workArena: "behind-the-scenes morale and steady focus",
    relationshipArena: "home life, closeness, and emotional safety",
    sensitiveSpot: "feeling brushed off or emotionally unsettled",
    strengthAnchor: "grounded gut intuition",
  },
  Mercury: {
    domain: "how you think, speak, plan, and sort details",
    personalTrait: "thinking speed and choice of words",
    workArena: "emails, meetings, writing, and daily logistics",
    relationshipArena: "how clearly you explain yourself and listen",
    sensitiveSpot: "mental overthinking or feeling misunderstood",
    strengthAnchor: "sharp mental clarity",
  },
  Venus: {
    domain: "your affection, spending habits, taste, and desire for peace",
    personalTrait: "what you value, enjoy, and attract",
    workArena: "client rapport, creative taste, and cash flow",
    relationshipArena: "romance, warmth, fairness, and compromise",
    sensitiveSpot: "feeling unappreciated or uneasy over fairness",
    strengthAnchor: "natural diplomacy and taste",
  },
  Mars: {
    domain: "how you act, push back, and manage frustration",
    personalTrait: "personal drive and temper",
    workArena: "execution speed, deadlines, and competitive effort",
    relationshipArena: "directness, boundaries, and active chemistry",
    sensitiveSpot: "feeling blocked, micromanaged, or provoked",
    strengthAnchor: "clean courage and initiative",
  },
  Jupiter: {
    domain: "your optimism, ambition, and appetite for growth",
    personalTrait: "big-picture confidence and risk appetite",
    workArena: "career expansion, strategy, and larger bets",
    relationshipArena: "generosity, shared plans, and openness",
    sensitiveSpot: "feeling fenced in or tempted to overreach",
    strengthAnchor: "resilient big-picture judgment",
  },
  Saturn: {
    domain: "your discipline, workload, boundaries, and standards",
    personalTrait: "inner backbone and patience",
    workArena: "long-term reliability, budgets, and core duties",
    relationshipArena: "loyalty, promises, and firm limits",
    sensitiveSpot: "self-criticism or carrying too much alone",
    strengthAnchor: "steady follow-through",
  },
  Uranus: {
    domain: "your need for autonomy, originality, and breathing room",
    personalTrait: "independent streak and unconventional ideas",
    workArena: "innovation, tech flexibility, and self-directed space",
    relationshipArena: "honest individuality and freedom in close ties",
    sensitiveSpot: "feeling trapped by rigid rules or dull ruts",
    strengthAnchor: "inventive problem-solving",
  },
  Neptune: {
    domain: "your imagination, empathy, ideals, and sensitivity",
    personalTrait: "creative radar and emotional sensitivity",
    workArena: "vision, creative work, and subtle people cues",
    relationshipArena: "compassion, high hopes, and healthy boundaries",
    sensitiveSpot: "blurred boundaries or drained energy",
    strengthAnchor: "calm empathy and creativity",
  },
  Pluto: {
    domain: "your willpower, trust, privacy, and need for control",
    personalTrait: "all-or-nothing focus and intensity",
    workArena: "high-stakes fixes, strategy, and real leverage",
    relationshipArena: "deep trust, candor, and power balance",
    sensitiveSpot: "fear of losing control or sensing hidden motives",
    strengthAnchor: "steady grit under pressure",
  },
  "North Node": {
    domain: "your next-chapter growth path and stretch goals",
    personalTrait: "evolving future direction",
    workArena: "forward-looking work that stretches current skills",
    relationshipArena: "connections that pull you forward rather than backward",
    sensitiveSpot: "feeling unfamiliar while stepping up",
    strengthAnchor: "willingness to keep growing",
  },
  "South Node": {
    domain: "your default habits, fallback skills, and familiar scripts",
    personalTrait: "automatic fallback reflexes",
    workArena: "well-worn strengths that can either help or stall growth",
    relationshipArena: "old relational scripts you slip into effortlessly",
    sensitiveSpot: "reverting to outdated defenses under stress",
    strengthAnchor: "hard-won practical know-how",
  },
  Ascendant: {
    domain: "your first impressions, body posture, and immediate reactions",
    personalTrait: "outward demeanor and instant presence",
    workArena: "how colleagues and clients read you in the first ten seconds",
    relationshipArena: "your gut response right as someone approaches you",
    sensitiveSpot: "feeling caught off guard or scrutinized in public",
    strengthAnchor: "grounded personal presence",
  },
  Descendant: {
    domain: "your one-on-one partnerships, contracts, and key counterparts",
    personalTrait: "how you negotiate and meet partners half-way",
    workArena: "client agreements, co-founders, and close collaborations",
    relationshipArena: "spouses, close friends, and balanced give-and-take",
    sensitiveSpot: "feeling thrown off balance by someone else's mood or demands",
    strengthAnchor: "fair one-on-one partnership",
  },
};

function getOrbUrgencyText(orb: number): { timingLabel: string; leadNote: string } {
  if (orb <= 0.35) {
    return {
      timingLabel: "Peak Right Now",
      leadNote: "Near-exact alignment today, so it shows up clearly in real-time moments.",
    };
  }
  if (orb <= 1.25) {
    return {
      timingLabel: "Sharp Active Current",
      leadNote: "Tight enough to influence active conversations and choices through the day.",
    };
  }
  if (orb <= 2.75) {
    return {
      timingLabel: "Steady Influence",
      leadNote: "Active underneath main priorities and easiest to spot when related topics arise.",
    };
  }
  return {
    timingLabel: "Light Background Shift",
    leadNote: "Wider-orb undercurrent nudging tone subtly in the background.",
  };
}

interface SpecificCore {
  titleFlow: string;
  titleFriction: string;
  taglineFlow: string;
  taglineFriction: string;
  feelFlow: string;
  feelFriction: string;
  workFlow: string;
  workFriction: string;
  loveFlow: string;
  loveFriction: string;
  moveFlow: string;
  moveFriction: string;
  trapFlow: string;
  trapFriction: string;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

const PAIR_CORES: Record<string, SpecificCore> = {
  [pairKey("Sun", "Moon")]: {
    titleFlow: "Head & Gut on the Same Page",
    titleFriction: "What You Want vs. How You Feel",
    taglineFlow: "Practical plans match your real mood instead of fighting each other.",
    taglineFriction: "Part of you wants to push forward while another part feels drained or guarded.",
    feelFlow: "You feel steady in your own skin—choices don't trigger inner second-guessing.",
    feelFriction: "Tug between drive and fatigue makes simple choices feel heavier than normal.",
    workFlow: "Present your point of view or lock in a personal priority with clean conviction.",
    workFriction: "Sleep on major career shifts if your gut hesitates; stick to steady tasks today.",
    loveFlow: "Warm, straightforward check-ins with partners or family land without defensiveness.",
    loveFriction: "Small comments feel personal quickly, so check your tiredness level before reacting.",
    moveFlow: "Act on one clear personal goal while focus and mood agree.",
    moveFriction: "Respect what is draining your battery instead of forcing fake energy.",
    trapFlow: "Assuming others automatically share your clarity without spelling it out.",
    trapFriction: "Making a permanent decision during a temporary tired mood.",
  },
  [pairKey("Sun", "Mars")]: {
    titleFlow: "Clean Drive & Follow-Through",
    titleFriction: "Short Fuse & Pushback",
    taglineFlow: "Vitality converts straight into action—less hesitation, more output.",
    taglineFriction: "Urges to rush, butt heads over control, or snap at slow progress.",
    feelFlow: "Physically awake and decisive; tough tasks look solvable instead of heavy.",
    feelFriction: "Adrenaline sits close to the surface, turning small delays into irritation.",
    workFlow: "Tackle tough calls, negotiations, or demanding deliverables early.",
    workFriction: "Pour the heat into solo output—skip reactive replies when annoyed.",
    loveFlow: "Playful, direct energy favors active plans and honest talk.",
    loveFriction: "What feels like simple bluntness to you can hit someone else like a fight.",
    moveFlow: "Start the hardest item you postponed while momentum runs strong.",
    moveFriction: "Reset physically for five minutes before answering an irritating message.",
    trapFlow: "Packing your calendar just because morning stamina feels high.",
    trapFriction: "Winning a petty ego point and dealing with fallout afterward.",
  },
  [pairKey("Sun", "Jupiter")]: {
    titleFlow: "Big-Picture Green Light",
    titleFriction: "Overpromising & Big Eyes",
    taglineFlow: "Confidence has real perspective behind it—doors open when you reach.",
    taglineFriction: "Temptation to stretch your time, wallet, or promises past next week's bandwidth.",
    feelFlow: "Upbeat and spacious; problems that felt cramped yesterday look manageable.",
    feelFriction: "Restless ambition pushes you to skip practical prep for the grand win.",
    workFlow: "Pitch larger scope, consult mentors, or expand projects sensibly.",
    workFriction: "Verify budgets and real timelines before signing off on ambitious bets.",
    loveFlow: "Generous humor and warm encouragement keep shared plans lively.",
    loveFriction: "Don't promise big favors to impress anyone if your week is already full.",
    moveFlow: "Say yes to one credible stretch invitation that grows your reach.",
    moveFriction: "Scale ambitious estimates down by 20% so follow-through stays solid.",
    trapFlow: "Skipping prep details because confidence makes success look automatic.",
    trapFriction: "Spending prematurely or overcommitting on best-case guesses.",
  },
  [pairKey("Sun", "Saturn")]: {
    titleFlow: "Steady, Credible Grounding",
    titleFriction: "Heavy Expectations & Reality Check",
    taglineFlow: "Patient focus pays off; steady work earns trust without noise.",
    taglineFriction: "Tight limits, slow timelines, or self-doubt test your patience.",
    feelFlow: "Calm and grounded—satisfied doing things thoroughly rather than chasing applause.",
    feelFriction: "Duties feel heavier on your shoulders; self-criticism flares if progress slows.",
    workFlow: "Tighten budgets, wrap up long-haul tasks, and prove steady reliability.",
    workFriction: "Treat delays as quality control, not failure; clear one concrete obligation at a time.",
    loveFlow: "Showing up reliably says more than flashy gestures today.",
    loveFriction: "Tell close people when workload makes you quiet so distance isn't misread.",
    moveFlow: "Finish one foundational task that makes next month noticeably smoother.",
    moveFriction: "Drop perfectionist self-talk and apply fair standards to yourself.",
    trapFlow: "Expecting everyone else to match your strict, serious pace.",
    trapFriction: "Giving up right before payoff just because progress feels gradual.",
  },
  [pairKey("Moon", "Mercury")]: {
    titleFlow: "Feelings Into Clear Words",
    titleFriction: "Overthinking Emotional Details",
    taglineFlow: "You can name what you feel plainly and read between lines accurately.",
    taglineFriction: "Mind loops over small remarks or analyzes moods instead of resting.",
    feelFlow: "Mentally quick yet emotionally tuned in—tact and honesty work together.",
    feelFriction: "Busy mental chatter makes it tough to switch off worried 'what-if' loops.",
    workFlow: "Draft sensitive emails, mediate mix-ups, or organize messy notes cleanly.",
    workFriction: "Step back from rapid-fire messaging if your head feels noisy and tired.",
    loveFlow: "Heart-to-heart talks stay attentive, warm, and genuinely clarifying.",
    loveFriction: "Acknowledge how someone feels before offering logical fixes.",
    moveFlow: "Have the thoughtful conversation you delayed while tact and clarity line up.",
    moveFriction: "Dump looping worries onto paper once instead of replaying them all day.",
    trapFlow: "Talking past someone simply because ideas arrive quickly.",
    trapFriction: "Reading hidden hostility into brief, rushed text replies.",
  },
  [pairKey("Moon", "Mars")]: {
    titleFlow: "Courageous Gut Momentum",
    titleFriction: "Moody Impatience & Snap Reactions",
    taglineFlow: "Strong emotional backing fuels fast, protective action.",
    taglineFriction: "Thin skin meets quick temper—small household or work snags flare rapidly.",
    feelFlow: "Spirited and alert; easier to stand up for yourself cleanly.",
    feelFriction: "Restless nerves make slow routines and tiny delays feel extra grating.",
    workFlow: "Power through hands-on chores or push stalled deliverables across the finish line.",
    workFriction: "Put irritating messages on a 20-minute hold before replying.",
    loveFlow: "Warm, lively chemistry favors active outings and candid affection.",
    loveFriction: "Skip bickering over petty chores—name what is actually frustrating calmly.",
    moveFlow: "Channel this burst of drive into fixing one lingering physical mess.",
    moveFriction: "Burn excess adrenaline through movement before discussing a sore issue.",
    trapFlow: "Moving fast enough to overlook simple details or drop things.",
    trapFriction: "Saying something sharp in a ten-minute mood spike that lingers afterward.",
  },
  [pairKey("Venus", "Mars")]: {
    titleFlow: "Easy Social & Creative Chemistry",
    titleFriction: "Desire vs. Compromise Pull",
    taglineFlow: "Warmth and confidence click together, energizing social and creative plans.",
    taglineFriction: "Attraction and stubborn preferences clash around wanting your own way.",
    feelFlow: "Playful, expressive, and socially charged without heavy effort.",
    feelFriction: "Pulled between insisting on your preference and keeping real harmony.",
    workFlow: "Pitch creative concepts, refine branding, and build warm client momentum.",
    workFriction: "Meet halfway on small taste points so pride doesn't stall a solid agreement.",
    loveFlow: "One of the strongest currents for romance, charm, and honest attraction.",
    loveFriction: "Speak plainly if resentment is brewing rather than dropping passive hints.",
    moveFlow: "Put energy into someone you care about or a creative project you genuinely enjoy.",
    moveFriction: "Look for a fair win-win instead of treating taste differences like a contest.",
    trapFlow: "Spending impulsively just because the moment feels celebratory.",
    trapFriction: "Mistaking dramatic tension for genuine closeness.",
  },
  [pairKey("Mercury", "Uranus")]: {
    titleFlow: "Quick Insight & Original Fix",
    titleFriction: "Mental Scatter & Tech Curveballs",
    taglineFlow: "Fresh mental breakthroughs crack stubborn problems with surprising speed.",
    taglineFriction: "Scattered focus, sudden tech quirks, or blurted thoughts disrupt routine.",
    feelFlow: "Sharp and inventive—fresh connections snap into place out of nowhere.",
    feelFriction: "Mental overstimulation makes dull checklists tough to sit through.",
    workFlow: "Brainstorm, troubleshoot systems, automate tedious tasks, and pitch fresh methods.",
    workFriction: "Back up files, double-check meeting times, and expect minor calendar audibles.",
    loveFlow: "Witty exchanges, fast humor, and surprising talks spark great energy.",
    loveFriction: "Skip arguing contrarian points purely for mental sport.",
    moveFlow: "Write sudden ideas down immediately before the thread slips away.",
    moveFriction: "Mute alerts for 30 minutes to finish one task completely.",
    trapFlow: "Speaking faster than listeners can absorb new concepts.",
    trapFriction: "Changing plans last-minute without updating people counting on you.",
  },
  [pairKey("Mars", "Saturn")]: {
    titleFlow: "Disciplined Stamina Under Load",
    titleFriction: "Gas Pedal & Brake at Once",
    taglineFlow: "Steady pacing beats speed—you have the grit to outlast hard tasks.",
    taglineFriction: "Urgency hits red tape or delays, testing self-control and temper.",
    feelFlow: "Grounded endurance; tough hours feel purposeful rather than draining.",
    feelFriction: "Tension builds when your urge to sprint runs straight into strict rules.",
    workFlow: "Handle high-precision or heavy technical tasks where cutting corners fails.",
    workFriction: "Don't force locked doors with anger; fix sequence and respect protocol.",
    loveFlow: "Quiet loyalty and dependable action build lasting trust.",
    loveFriction: "Avoid icy silence; name frustration cleanly and respectfully.",
    moveFlow: "Chip away steadily at the toughest long-term obligation on your plate.",
    moveFriction: "Use forced waiting time to sharpen prep instead of stewing.",
    trapFlow: "Judging others harshly if they tire out sooner than you.",
    trapFriction: "Pushing against an unmoving wall until morale takes a hit.",
  },
  [pairKey("Uranus", "North Node")]: {
    titleFlow: "Fresh Break Toward Your Next Chapter",
    titleFriction: "Restless Urge to Shake Up Your Path",
    taglineFlow: "An unexpected twist or fresh insight nudges you cleanly out of a rut.",
    taglineFriction: "Sudden impatience with current routines makes predictable plans feel cramped.",
    feelFlow: "Energized by novelty—testing a modern approach feels natural right now.",
    feelFriction: "Low-grade restlessness pokes at habits tied to your past rather than your future.",
    workFlow: "Adopt a better tool, test an unorthodox workflow, or meet forward-thinking peers.",
    workFriction: "Don't scrap a steady long-term goal overnight without mapping practical steps.",
    loveFlow: "Honest talks about personal space and growth bring welcome fresh air.",
    loveFriction: "Avoid pulling away abruptly from steady people just because you crave sudden freedom.",
    moveFlow: "Take one intentional step toward an unfamiliar tool, skill, or connection today.",
    moveFriction: "Channel restlessness into one smart small experiment rather than upending everything.",
    trapFlow: "Chasing shiny new directions without tying them to this week's follow-through.",
    trapFriction: "Confusing impulsive rebellion with real personal growth.",
  },
  [pairKey("Uranus", "South Node")]: {
    titleFlow: "Clean Break From Outdated Habits",
    titleFriction: "Old Routines Resist Sudden Change",
    taglineFlow: "Easy to spot which stale habits you've outgrown and drop them cleanly.",
    taglineFriction: "Unexpected shifts rattle familiar backup habits you normally lean on under stress.",
    feelFlow: "Noticeably lighter once you stop repeating an unnecessary old worry or chore.",
    feelFriction: "Pulled between wanting sudden freedom and clinging to safe old autopilot.",
    workFlow: "Retire clunky legacy steps and modernize recurring work.",
    workFriction: "Don't snap back to an old broken workaround just because a new system hiccuped.",
    loveFlow: "Calm honesty breaks stale relationship scripts cleanly without drama.",
    loveFriction: "Notice old triggers flaring up when plans shift last-minute.",
    moveFlow: "Drop one outdated task or expectation that survives purely out of inertia.",
    moveFriction: "Stay flexible when familiar routines glitch instead of fighting change.",
    trapFlow: "Throwing out useful experience while clearing away clutter.",
    trapFriction: "Letting one curveball push you straight back into old comfort ruts.",
  },
  [pairKey("Saturn", "North Node")]: {
    titleFlow: "Building Real Structure for Growth",
    titleFriction: "Duty Checks Your Next Big Step",
    taglineFlow: "Practical discipline turns distant goals into an actual weekly schedule.",
    taglineFriction: "Current responsibilities or doubts feel like speed bumps on future plans.",
    feelFlow: "Patient and realistic—ready to put solid bricks under long-term ambitions.",
    feelFriction: "Heavy realism makes stretch goals look slower or harder than expected.",
    workFlow: "Commit to formal milestones, skills, or durable systems that pay off all year.",
    workFriction: "Treat constraints as engineering specs: tighten your plan instead of dropping the goal.",
    loveFlow: "Mature candor about future plans strengthens committed partnerships.",
    loveFriction: "Don't let fear of disapproval keep you parked in a role you outgrew.",
    moveFlow: "Block one dedicated hour on your calendar for a real long-range skill or project.",
    moveFriction: "Break an intimidating future goal into one concrete, boring step today.",
    trapFlow: "Becoming overly cautious and squeezing out healthy excitement.",
    trapFriction: "Using daily chores as a shield to avoid stretching forward at all.",
  },
  [pairKey("Neptune", "North Node")]: {
    titleFlow: "Intuitive Pull Toward New Meaning",
    titleFriction: "Fog Around Your Next Direction",
    taglineFlow: "Creative intuition and quiet timing point cleanly toward what deserves focus next.",
    taglineFriction: "Fuzzy expectations or wishful thinking blur what practical step belongs next.",
    feelFlow: "Receptive, imaginative, and tuned in to quiet meaningful clues.",
    feelFriction: "Mild aimlessness or over-idealizing an unproven path softens focus.",
    workFlow: "Lean into creative vision, empathy-driven work, or big-picture storytelling.",
    workFriction: "Verify vague promises and tie inspiring ideas to real calendar dates.",
    loveFlow: "Gentle, attentive talks uncover shared hopes smoothly.",
    loveFriction: "Don't wait for someone else to clarify or rescue your direction.",
    moveFlow: "Spend 15 quiet minutes writing down what feels genuinely worth pursuing—then pick one action.",
    moveFriction: "Ask for concrete numbers and deliverables whenever plans sound vague.",
    trapFlow: "Assuming good intentions replace clear logistics.",
    trapFriction: "Drifting into distraction instead of naming one honest priority.",
  },
  [pairKey("Pluto", "North Node")]: {
    titleFlow: "Focused Power Behind Personal Growth",
    titleFriction: "Control Habits vs. New Direction",
    taglineFlow: "Deep resolve aligns cleanly with stepping into bigger territory.",
    taglineFriction: "Holding tight to familiar control makes necessary change feel risky.",
    feelFlow: "Quiet, unshakable clarity about what matters and what needs cutting.",
    feelFriction: "Strong resistance rises when growth challenges how safe and in-control you feel.",
    workFlow: "Cut dead weight and double down on work with real lasting leverage.",
    workFriction: "Stop micromanaging outgrown details so larger priorities have room.",
    loveFlow: "Direct, honest talks reshape power balance into deeper respect.",
    loveFriction: "Watch pushing helpful people away simply to stay guarded.",
    moveFlow: "End one draining commitment cleanly to open space for what is next.",
    moveFriction: "Trade rigid control for candid transparency on one important goal.",
    trapFlow: "Pushing major changes faster than collaborators can realistically adapt.",
    trapFriction: "Clinging to old leverage out of fear of starting fresh.",
  },
};

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getHumanDialogue(
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
  isMajor: boolean,
  orb: number
): HumanAspectDialogue {
  const aspectLower = aspect.toLowerCase() as AspectKind;
  const mechanic = ASPECT_MECHANICS[aspectLower] ?? {
    label: capitalize(aspectLower),
    isHarmonious: false,
    isFriction: false,
    titleVerbFlow: "Connects With",
    titleVerbFriction: "Tests",
    taglineNote: "A transitional alignment nudging two areas of daily life to interact.",
    howItFeels: "You notice an adjustment between outer events and personal habits.",
    workStyle: "Pace tasks thoughtfully as fresh details come in.",
    peopleStyle: "Stay observant of tone and timing.",
    timingNote: "Respond deliberately rather than rushing.",
  };

  const isFlow = mechanic.isHarmonious;
  const transitSpec = TRANSIT_ACTORS[transitPlanet] ?? {
    shortLabel: transitPlanet,
    flowCatalyst: `${transitPlanet.toLowerCase()} momentum`,
    frictionCatalyst: `${transitPlanet.toLowerCase()} pressure`,
    bodyMindFlow: `${transitPlanet} supports steadier focus right now.`,
    bodyMindFriction: `${transitPlanet} brings noticeable outside pressure today.`,
    workFlow: `Move ahead on work tied to ${transitPlanet.toLowerCase()} focus.`,
    workFriction: `Pause before locking in firm commitments under ${transitPlanet.toLowerCase()} pressure.`,
    socialFlow: "People respond well to calm, direct engagement.",
    socialFriction: "Give conversations extra room before reacting.",
    bestMoveFlow: "Use the steady opening cleanly.",
    bestMoveFriction: "Pick one practical adjustment instead of forcing everything at once.",
    trapFlow: "Coasting without locking in tangible follow-through.",
    trapFriction: "Reacting hastily to temporary friction.",
  };

  const natalSpec = NATAL_RECEPTORS[natalPlanet] ?? {
    domain: `your ${natalPlanet.toLowerCase()} area`,
    personalTrait: `your ${natalPlanet.toLowerCase()} baseline`,
    workArena: "your everyday workflow",
    relationshipArena: "your interactions with others",
    sensitiveSpot: "feeling rushed or off-balance",
    strengthAnchor: "steady self-awareness",
  };

  const orbInfo = getOrbUrgencyText(orb);
  const impactExplanation = isMajor
    ? `★ Major ${mechanic.label} (100% Impact) — ${orbInfo.timingLabel} (${orb.toFixed(2)}° orb). Primary driver shaping real decisions today.`
    : `✧ Minor ${mechanic.label} (50% Impact) — ${orbInfo.timingLabel} (${orb.toFixed(2)}° orb). Background adjustment nudging subtle habits and tone.`;

  const isSelfAspect = transitPlanet === natalPlanet;
  const core = PAIR_CORES[pairKey(transitPlanet, natalPlanet)];

  // Direction cue ensures Transit A -> Natal B always reads distinctly from Transit B -> Natal A
  const directionContext = `${transitSpec.shortLabel} (${transitPlanet}) triggers ${natalSpec.personalTrait} (${natalPlanet})`;

  // 1. Hand-crafted core + specific aspect angle + direction differentiation
  if (core && !isSelfAspect) {
    const baseTitle = isFlow ? core.titleFlow : core.titleFriction;
    const baseTagline = isFlow ? core.taglineFlow : core.taglineFriction;

    const angleTitlePrefix: Record<string, string> = {
      conjunction: "Spotlight:",
      trine: "Smooth Lane:",
      sextile: "Open Door:",
      semisextile: "Subtle Tweak:",
      square: "Crossroads:",
      opposition: "Tug-of-War:",
      semisquare: "Small Snag:",
      quincunx: "Gear Shift:",
    };

    const prefix = angleTitlePrefix[aspectLower] ?? "";
    const everydayTitle = prefix ? `${prefix} ${baseTitle}` : baseTitle;

    return {
      everydayTitle,
      tagline: `${baseTagline} Today, ${directionContext.toLowerCase()}. (${mechanic.label}: ${mechanic.taglineNote})`,
      feelingInBodyAndMind: `${isFlow ? core.feelFlow : core.feelFriction} ${mechanic.howItFeels} ${orbInfo.leadNote}`,
      workAndMoney: `${isFlow ? core.workFlow : core.workFriction} In ${natalSpec.workArena}, ${mechanic.workStyle.charAt(0).toLowerCase()}${mechanic.workStyle.slice(1)}`,
      relationshipsAndPeople: `${isFlow ? core.loveFlow : core.loveFriction} Around ${natalSpec.relationshipArena}, ${mechanic.peopleStyle.charAt(0).toLowerCase()}${mechanic.peopleStyle.slice(1)}`,
      bestMoveToday: `${isFlow ? core.moveFlow : core.moveFriction} Anchor on ${natalSpec.strengthAnchor}—${mechanic.timingNote.charAt(0).toLowerCase()}${mechanic.timingNote.slice(1)}`,
      trapToAvoid: `${isFlow ? core.trapFlow : core.trapFriction} Watch ${natalSpec.sensitiveSpot}.`,
      isMajor,
      impactExplanation,
    };
  }

  // 2. Self-planet cycle (e.g. transit Mars square natal Mars, transit Moon conjunction natal Moon)
  if (isSelfAspect) {
    const everydayTitle = isFlow
      ? `${mechanic.label} Reset on Your Own ${natalPlanet} Style`
      : `${mechanic.label} Stress-Test on Your ${natalPlanet} Habits`;

    return {
      everydayTitle,
      tagline: isFlow
        ? `Your own ${natalSpec.domain} hits a natural checkpoint—what works feels clear, not forced. (${mechanic.label}: ${mechanic.taglineNote})`
        : `Your default ${natalSpec.personalTrait} gets tested from outside, showing which habit needs an update. (${mechanic.label}: ${mechanic.taglineNote})`,
      feelingInBodyAndMind: `${isFlow ? transitSpec.bodyMindFlow : transitSpec.bodyMindFriction} Because both sides highlight ${natalSpec.personalTrait}, you recognize this pattern in yourself immediately. ${mechanic.howItFeels}`,
      workAndMoney: `${isFlow ? transitSpec.workFlow : transitSpec.workFriction} In ${natalSpec.workArena}, ${mechanic.workStyle.charAt(0).toLowerCase()}${mechanic.workStyle.slice(1)}`,
      relationshipsAndPeople: `${isFlow ? transitSpec.socialFlow : transitSpec.socialFriction} Notice how ${natalSpec.relationshipArena} reflects ${natalSpec.sensitiveSpot}. ${mechanic.peopleStyle}`,
      bestMoveToday: `${isFlow ? transitSpec.bestMoveFlow : transitSpec.bestMoveFriction} Lean on ${natalSpec.strengthAnchor} today.`,
      trapToAvoid: isFlow
        ? `${transitSpec.trapFlow} Especially around ${natalSpec.domain}.`
        : `${transitSpec.trapFriction} Watch reacting on autopilot when ${natalSpec.sensitiveSpot} flares.`,
      isMajor,
      impactExplanation,
    };
  }

  // 3. Fully Composed Unique Combination Engine (Transit Actor × Aspect Mechanic × Natal Receptor)
  const catalyst = isFlow ? transitSpec.flowCatalyst : transitSpec.frictionCatalyst;
  const angleTitle = isFlow
    ? `${transitSpec.shortLabel} ${mechanic.titleVerbFlow} ${capitalize(natalPlanet)}`
    : `${transitSpec.shortLabel} ${mechanic.titleVerbFriction} ${capitalize(natalPlanet)}`;

  const tagline = isFlow
    ? `Today's ${catalyst} flows directly into ${natalSpec.domain}. (${mechanic.label}: ${mechanic.taglineNote})`
    : `Today's ${catalyst} pushes directly against ${natalSpec.domain}. (${mechanic.label}: ${mechanic.taglineNote})`;

  const feelingInBodyAndMind = isFlow
    ? `${transitSpec.bodyMindFlow} It activates ${natalSpec.personalTrait}, making ${natalSpec.strengthAnchor} easier to access. ${mechanic.howItFeels}`
    : `${transitSpec.bodyMindFriction} It pokes straight at ${natalSpec.sensitiveSpot} within ${natalSpec.domain}. ${mechanic.howItFeels}`;

  const workAndMoney = isFlow
    ? `${transitSpec.workFlow} Specifically inside ${natalSpec.workArena}, ${mechanic.workStyle.charAt(0).toLowerCase()}${mechanic.workStyle.slice(1)}`
    : `${transitSpec.workFriction} Where this hits ${natalSpec.workArena}, ${mechanic.workStyle.charAt(0).toLowerCase()}${mechanic.workStyle.slice(1)}`;

  const relationshipsAndPeople = isFlow
    ? `${transitSpec.socialFlow} Around ${natalSpec.relationshipArena}, ${mechanic.peopleStyle.charAt(0).toLowerCase()}${mechanic.peopleStyle.slice(1)}`
    : `${transitSpec.socialFriction} Around ${natalSpec.relationshipArena}, ${mechanic.peopleStyle.charAt(0).toLowerCase()}${mechanic.peopleStyle.slice(1)}`;

  const bestMoveToday = isFlow
    ? `${transitSpec.bestMoveFlow} Apply that opening to ${natalSpec.workArena}. ${mechanic.timingNote}`
    : `${transitSpec.bestMoveFriction} Lean on ${natalSpec.strengthAnchor} instead of letting ${natalSpec.sensitiveSpot} steer your response.`;

  const trapToAvoid = isFlow
    ? `${transitSpec.trapFlow} Stay sharp around ${natalSpec.domain}.`
    : `${transitSpec.trapFriction} Especially if ${natalSpec.sensitiveSpot} starts creeping in.`;

  return {
    everydayTitle: angleTitle,
    tagline,
    feelingInBodyAndMind,
    workAndMoney,
    relationshipsAndPeople,
    bestMoveToday,
    trapToAvoid,
    isMajor,
    impactExplanation,
  };
}
