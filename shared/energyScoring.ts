import type { ChartResult, TransitContact, MinorTransitContact } from "../server/astronomy";

/** One deterministic scoring policy for the homepage and Energy Read. Five major aspects have full weight; minor aspects have half weight. */
export const ENERGY_MAX_ORB = 5;
export const ENERGY_ASPECT_FLOW: Record<TransitContact["aspect"] | MinorTransitContact["aspect"], -1 | 0 | 1> = {
  conjunction: 1, trine: 1, sextile: 1, square: -1, opposition: -1,
  semisextile: 1, semisquare: -1, quincunx: -1,
};
export const ENERGY_PLANET_STARS: Record<string, number> = {
  Sun: 5, Moon: 5, Mars: 5, Jupiter: 5, Saturn: 5, Pluto: 5,
  Mercury: 4, Neptune: 4, Venus: 3, Uranus: 3,
  "North Node": 4, "South Node": 4, Ascendant: 4, Descendant: 4,
};
const MAJOR = new Set<TransitContact["aspect"] | MinorTransitContact["aspect"]>(["conjunction", "trine", "sextile", "square", "opposition"]);
export function energyIntensity(orb: number): number {
  if (!Number.isFinite(orb) || orb < 0 || orb > ENERGY_MAX_ORB) return 0;
  return Math.max(1, 5 - Math.floor(orb));
}
export function calculateEnergyRead(chart: ChartResult | null | undefined) {
  if (!chart || chart.readingScope === "natal") return null;
  const allContacts = (chart.transits ?? []).flatMap(body =>
    [...(body.natalContacts ?? []), ...(body.minorNatalContacts ?? [])]
      .filter(contact => Number.isFinite(contact.orb) && contact.orb >= 0 && contact.orb <= ENERGY_MAX_ORB)
      .map(contact => {
        const intensity = energyIntensity(contact.orb);
        const majorFactor = MAJOR.has(contact.aspect) ? 1 : 0.5;
        const stars = ENERGY_PLANET_STARS[body.name] ?? 3;
        const natalStars = ENERGY_PLANET_STARS[contact.natalName] ?? 3;
        const strength = intensity * stars * natalStars * majorFactor;
        return {
          ...contact, transit: body.name, natal: contact.natalName,
          id: `${body.name}-${contact.aspect}-${contact.natalName}`,
          intensity, stars, natalStars, majorFactor, strength,
          flow: ENERGY_ASPECT_FLOW[contact.aspect] ?? 0,
        };
      })
  );
  // De-duplicate by transit/natal pair, not by aspect name. A single
  // planet pair must never inflate either Harmony or Friction twice.
  const unique = new Map<string, (typeof allContacts)[number]>();
  for (const contact of allContacts) {
    const key = JSON.stringify([contact.transit, contact.natal]);
    const previous = unique.get(key);
    if (!previous || contact.majorFactor > previous.majorFactor ||
        (contact.majorFactor === previous.majorFactor && contact.orb < previous.orb)) {
      unique.set(key, contact);
    }
  }
  const contacts = Array.from(unique.values());
  const harmonious = contacts.filter(c => c.flow === 1);
  const challenging = contacts.filter(c => c.flow === -1);
  const dynamic = contacts.filter(c => c.flow === 0);
  const flowWeight = harmonious.reduce((sum, c) => sum + c.strength, 0);
  const frictionWeight = challenging.reduce((sum, c) => sum + c.strength, 0);
  const total = flowWeight + frictionWeight;
  const flowPct = total ? Math.round(100 * flowWeight / total) : 0;
  const frictionPct = total ? 100 - flowPct : 0;
  const signal = !contacts.length ? "No active contacts"
    : flowWeight > frictionWeight * 1.3 ? "Harmonious Flow"
    : frictionWeight > flowWeight * 1.3 ? "Dynamic Friction"
    : "Balanced Synthesis";
  return { contacts, harmonious, challenging, dynamic, flowWeight, frictionWeight,
    flowPct, frictionPct, signal, contactsCount: contacts.length,
    tightest: [...contacts].sort((a,b) => a.orb - b.orb)[0] };
}

/** Unique pairs within one event sky, using the same weights as personal energy. */
export function calculateIndependentEnergyRead(chart: ChartResult | null | undefined) {
  if (!chart) return null;
  const bodies = [...chart.movingBodies, chart.northNode, chart.southNode];
  const angles = [
    [0, "conjunction"], [60, "sextile"], [90, "square"], [120, "trine"], [180, "opposition"],
    [30, "semisextile"], [45, "semisquare"], [150, "quincunx"],
  ] as const;
  const transits = bodies.map((body, i) => {
    const contacts = bodies.slice(i + 1).flatMap(other => {
      const delta = Math.abs(((body.longitude - other.longitude) % 360 + 360) % 360);
      const separation = Math.min(delta, 360 - delta);
      const nearest = angles.map(([angle, aspect]) => ({ aspect, orb: Math.abs(separation - angle) }))
        .filter(contact => contact.orb <= ENERGY_MAX_ORB).sort((a,b) => a.orb - b.orb)[0];
      return nearest ? [{ ...nearest, natalName: other.name }] : [];
    });
    return { ...body, natalContacts: contacts.filter(c => MAJOR.has(c.aspect)) as TransitContact[],
      minorNatalContacts: contacts.filter(c => !MAJOR.has(c.aspect)).map(c => ({ ...c,
        weightMultiplier: 0.5 as const, classification: ENERGY_ASPECT_FLOW[c.aspect] === 1 ? "flow" as const : "friction" as const })) as MinorTransitContact[] };
  });
  return calculateEnergyRead({ ...chart, readingScope: "combined", transits });
}
