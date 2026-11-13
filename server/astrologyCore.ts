import { FIXED_STARS, normalizeLongitude } from "../shared/hybrid";

export type Worldview = "god" | "agent" | "agent-vs-god";
export type ReadingScope = "natal" | "transit" | "combined";

const ROYAL_STAR_NAMES = new Set(["Aldebaran", "Regulus", "Antares", "Fomalhaut"]);
export const ROYAL_STARS = FIXED_STARS
  .filter(([name]) => ROYAL_STAR_NAMES.has(name))
  .map(([name, longitude]) => ({ name, longitude }));

export type RoyalStarContact = {
  name: string;
  longitude: number;
  distance: number;
  contact: boolean;
  weight: number;
};

export type FrameRelationshipType = "convergence" | "translation" | "tension" | "concealment";

export type FrameRelationship = {
  type: FrameRelationshipType;
  godThemes: string[];
  agentThemes: string[];
  translation: string;
  tension: string | null;
  synthesis: string;
};

export type DualPlacement = {
  godHouse: number;
  royalStarContacts: RoyalStarContact[];
  agentHouse?: number;
  frameRelationship?: FrameRelationship;
};

type PlanetNature = { quality: string; mechanism: string; localExpression: string };
type HouseField = { label: string; themes: string[] };
type AgentChannel = { label: string; manifestations: string };

export const PLANET_NATURES: Record<string, PlanetNature> = {
  Sun: { quality: "visibility, vitality, coherence, and creative authority", mechanism: "clarifies and centers", localExpression: "visible authorship, leadership, confidence, and the need to make the matter unmistakably one's own" },
  Moon: { quality: "feeling, memory, fluctuation, and need", mechanism: "sensitizes and changes", localExpression: "mood-led reactions, memory loops, changing priorities, and a strong need for safety or response" },
  Mercury: { quality: "language, analysis, trade, and mediation", mechanism: "names, connects, and differentiates", localExpression: "questions, edits, negotiations, messages, and quick shifts in what is understood" },
  Venus: { quality: "attraction, pleasure, value, and agreement", mechanism: "draws together and evaluates", localExpression: "appeal, diplomacy, aesthetic choices, invitations, and decisions about what or whom to value" },
  Mars: { quality: "drive, heat, conflict, and decisive action", mechanism: "cuts, accelerates, and contests", localExpression: "assertive moves, urgency, competition, friction, and direct action that forces a response" },
  Jupiter: { quality: "growth, meaning, generosity, and faith", mechanism: "enlarges and interprets", localExpression: "teaching, opportunity, confidence, broad claims, and a willingness to take a larger view or risk" },
  Saturn: { quality: "restriction, structure, delay, and accountability", mechanism: "narrows, tests, and makes durable", localExpression: "deadlines, formal obligations, delayed results, limits, and work that only improves through repetition" },
  Uranus: { quality: "disruption, freedom, invention, and sudden change", mechanism: "interrupts and reroutes", localExpression: "surprises, breaks in routine, unconventional choices, sudden messages, and refusal of an inherited plan" },
  Neptune: { quality: "dissolution, idealization, vision, ambiguity, and porousness", mechanism: "dissolves boundaries and imagines", localExpression: "inspired but vague perception, porous attention, imagination, projection, rumor, or unclear information" },
  Pluto: { quality: "compulsion, power, removal, and deep transformation", mechanism: "concentrates, exposes, and transforms", localExpression: "high-stakes focus, strategic disclosure, control struggles, irreversible choices, and pressure to confront what is hidden" },
};

const HOUSE_THEMES: Record<number, { label: string; themes: string[]; private: boolean; visible: boolean }> = {
  1: { label: "identity and initiative", themes: ["selfhood", "beginnings", "agency"], private: false, visible: true },
  2: { label: "resources and values", themes: ["money", "possessions", "self-worth"], private: false, visible: true },
  3: { label: "learning and exchange", themes: ["communication", "information", "movement"], private: false, visible: true },
  4: { label: "roots and foundations", themes: ["home", "family", "belonging"], private: true, visible: false },
  5: { label: "creative expression", themes: ["creativity", "pleasure", "romance"], private: false, visible: true },
  6: { label: "work and maintenance", themes: ["routine", "service", "skill-building"], private: false, visible: true },
  7: { label: "partnership and encounter", themes: ["relationships", "contracts", "mirroring"], private: false, visible: true },
  8: { label: "depth and shared entanglement", themes: ["shared resources", "intimacy", "transformation"], private: true, visible: false },
  9: { label: "meaning and horizons", themes: ["belief", "study", "long journeys"], private: false, visible: true },
  10: { label: "public direction", themes: ["career", "authority", "reputation"], private: false, visible: true },
  11: { label: "community and future aims", themes: ["networks", "alliances", "hopes"], private: false, visible: true },
  12: { label: "withdrawal and preparation", themes: ["private work", "closure", "behind-the-scenes development"], private: true, visible: false },
};

const GOD_HOUSE_FIELDS: Record<number, HouseField> = Object.fromEntries(
  Object.entries(HOUSE_THEMES).map(([house, value]) => [Number(house), { label: value.label, themes: value.themes }]),
);

const AGENT_HOUSE_CHANNELS: Record<number, AgentChannel> = {
  1: { label: "identity, embodiment, and initiative", manifestations: "self-presentation, bodily energy, first moves, and the way the person meets the world" },
  2: { label: "money, possessions, and self-worth", manifestations: "income choices, pricing, spending, possessions, and the felt value of one's contribution" },
  3: { label: "communication, information, and movement", manifestations: "messages, writing, study, short trips, conversations, and the handling of everyday information" },
  4: { label: "home, family, and belonging", manifestations: "living arrangements, family memory, private foundations, roots, and the need for emotional shelter" },
  5: { label: "creativity, pleasure, and romance", manifestations: "creative output, play, dating, children, risk, and the desire to be recognized for what one makes" },
  6: { label: "routine, service, and skill-building", manifestations: "work habits, health routines, duties, repair, apprenticeship, and the practical management of effort" },
  7: { label: "relationships, contracts, and mirroring", manifestations: "partners, clients, agreements, open rivals, and the qualities reflected back by another person" },
  8: { label: "shared resources, intimacy, and transformation", manifestations: "debts, taxes, joint finances, vulnerability, grief, crisis, and what must be surrendered or rebuilt" },
  9: { label: "belief, study, and long journeys", manifestations: "faith, teaching, publishing, higher education, legal or philosophical commitments, and travel beyond the familiar" },
  10: { label: "career, authority, and reputation", manifestations: "public direction, vocation, leadership, recognition, accountability, and visible consequences" },
  11: { label: "networks, alliances, and hopes", manifestations: "friends, communities, patrons, audiences, long-range goals, and support from the wider network" },
  12: { label: "private work, closure, and behind-the-scenes development", manifestations: "retreat, hidden labor, unfinished matters, isolation, subconscious pressure, and preparation outside public view" },
};

function houseThemes(house: number) {
  return HOUSE_THEMES[house] ?? { label: "an unclassified field", themes: [], private: false, visible: false };
}

function isOppositeHouse(first: number, second: number) {
  return ((first - 1 + 6) % 12) + 1 === second;
}

/**
 * Builds the deliberate translation between the fixed zodiac frame and the
 * observer-specific Equal House frame. It never recalculates a longitude.
 */
export function translationFor(planet: string, godHouse: number, agentHouse: number) {
  const nature = PLANET_NATURES[planet] ?? { quality: "the body's distinctive function", mechanism: "acts through its distinctive function", localExpression: "the body's distinctive effects in daily life" };
  const god = GOD_HOUSE_FIELDS[godHouse] ?? { label: "an unclassified field", themes: [] };
  const agent = AGENT_HOUSE_CHANNELS[agentHouse] ?? { label: "an unclassified channel", manifestations: "the concrete circumstances of that channel" };
  const godThemes = godThemesSentence(god.themes);
  const isUndoing = agentHouse === 12;
  const translation = isUndoing
    ? `${planet} in God House ${godHouse} (the field of ${god.label}: ${godThemes}) is routed through Agent House 12, the 1st-house undoing/opposition to the Agent (private work, closure, and behind-the-scenes development). ${planet}'s ${nature.quality} ${nature.mechanism} here by withdrawing the field from direct agency, so it appears as ${agent.manifestations}, colored by ${nature.localExpression}.`
    : `${planet} in God House ${godHouse} (the field of ${god.label}: ${godThemes}) is routed through Agent House ${agentHouse} (${agent.label}). ${planet}'s ${nature.quality} ${nature.mechanism} the wider field as it enters this local channel, showing up in ${agent.manifestations} through ${nature.localExpression}.`;
  const synthesis = isUndoing
    ? `${planet} makes the God House ${godHouse} field consequential through absence and preparation: its ${nature.quality} are felt in Agent House 12 as a limit on immediate agency, requiring retreat, containment, or work that matures before it can be seen through ${nature.localExpression}.`
    : `${planet} makes the God House ${godHouse} field concrete through Agent House ${agentHouse}: its ${nature.quality} determine how ${agent.manifestations} becomes the place where the wider pattern is expressed through ${nature.localExpression}.`;
  return { translation, synthesis };
}

export function buildFrameRelationship(godHouse: number, agentHouse: number, planet = "Planet"): FrameRelationship {
  const god = houseThemes(godHouse);
  const agent = houseThemes(agentHouse);
  const same = godHouse === agentHouse;
  const concealment = agentHouse === 12;
  const tension = !same && !concealment && isOppositeHouse(godHouse, agentHouse);
  const type: FrameRelationshipType = same ? "convergence" : concealment ? "concealment" : tension ? "tension" : "translation";

  const planetSpecific = translationFor(planet, godHouse, agentHouse);
  const translation = planetSpecific.translation;
  const tensionText = tension
    ? `The two frames face one another across an axis: ${god.label} may pull against the way the experience is currently being lived through ${agent.label}.`
    : null;
  const synthesis = planetSpecific.synthesis;

  return {
    type,
    godThemes: god.themes,
    agentThemes: agent.themes,
    translation,
    tension: tensionText,
    synthesis,
  };
}

function godThemesSentence(themes: string[]) {
  if (themes.length < 2) return themes[0] ?? "the supplied symbolism";
  return `${themes.slice(0, -1).join(", ")}, and ${themes[themes.length - 1]}`;
}

export function godHouseFor(longitude: number) {
  return Math.floor(normalizeLongitude(longitude) / 30) + 1;
}

export function agentHouseFor(longitude: number, ascendant: number) {
  return Math.floor(normalizeLongitude(longitude - ascendant) / 30) + 1;
}

export function equalHouseCusps(ascendant: number) {
  return Array.from({ length: 12 }, (_, index) => Number(normalizeLongitude(ascendant + index * 30).toFixed(6)));
}

export function angularDistance(a: number, b: number) {
  const distance = Math.abs(normalizeLongitude(a - b));
  return Math.min(distance, 360 - distance);
}

export function royalStarContacts(longitude: number, orb = 5): RoyalStarContact[] {
  return ROYAL_STARS.map(star => {
    const distance = Number(angularDistance(longitude, star.longitude).toFixed(4));
    const weight = distance <= orb ? Math.max(1, 5 - Math.floor(distance)) : 0;
    return { ...star, distance, contact: weight > 0, weight };
  });
}

export function godPlacement(longitude: number): { godHouse: number; royalStarContacts: RoyalStarContact[] } {
  return { godHouse: godHouseFor(longitude), royalStarContacts: royalStarContacts(longitude) };
}

export function agentPlacement(longitude: number, ascendant: number): { agentHouse: number } {
  return { agentHouse: agentHouseFor(longitude, ascendant) };
}

export function dualPlacement(longitude: number, ascendant?: number | null, planet = "Planet") {
  return ascendant == null
    ? godPlacement(longitude)
    : { ...godPlacement(longitude), ...agentPlacement(longitude, ascendant), frameRelationship: buildFrameRelationship(godHouseFor(longitude), agentHouseFor(longitude, ascendant), planet) };
}
