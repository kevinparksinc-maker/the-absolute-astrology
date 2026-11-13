export const APP_DIRECTORY = [
  {
    href: "/",
    title: "Home",
    description: "Your profile, main signals and next step",
    group: "Start here",
  },
  {
    href: "/chart",
    title: "Natal chart",
    description: "Diamond or wheel, houses and planetary placements",
    group: "Start here",
  },
  {
    href: "/reading",
    title: "Reading summary",
    description: "The main message from your calculated chart",
    group: "Readings",
  },
  {
    href: "/reading/depth",
    title: "Full interpretation",
    description: "Why the patterns matter and how they connect",
    group: "Readings",
  },
  {
    href: "/reading/evidence",
    title: "Calculation evidence",
    description: "Methods, source references and coverage",
    group: "Readings",
  },
  {
    href: "/guide?tab=blueprint",
    title: "Guide & patterns",
    description: "Mansions, decans, fixed stars and traditional layers",
    group: "Readings",
  },
  {
    href: "/life-story",
    title: "Life story",
    description: "Chronological chapters and timing cycles",
    group: "Readings",
  },
  {
    href: "/energy",
    title: "Current energy",
    description: "Your natal chart meeting the current sky",
    group: "Timing",
  },
  {
    href: "/energy/contacts",
    title: "Energy contact ledger",
    description: "Every contact, orb, intensity and weight",
    group: "Timing",
  },
  {
    href: "/forecast",
    title: "Harmonic Flow Clock",
    description: "24-hour forecast in calculated 30-minute steps",
    group: "Timing",
  },
  {
    href: "/transit-sky",
    title: "Independent transit sky",
    description: "A chart and energy read for its own time and place",
    group: "Timing",
  },
  {
    href: "/energy/consultation",
    title: "Transit interpretation",
    description: "Ask about the current sky and your natal chart",
    group: "Timing",
  },
  {
    href: "/sports-lab",
    title: "Sports Simulation Lab",
    description: "AI astrology matchups, symbolic method scores and evidence-ledger predictions",
    group: "Explore",
  },
  {
    href: "/horary",
    title: "Horary",
    description: "Cast a chart for a specific question",
    group: "Explore",
  },
  {
    href: "/synastry",
    title: "Synastry",
    description: "Compare two birth charts",
    group: "Explore",
  },
  {
    href: "/sky",
    title: "Sky map",
    description: "Explore the celestial sphere",
    group: "Explore",
  },
  {
    href: "/zodiac-readings",
    title: "Twelve Gates",
    description: "Explore zodiac sectors and their meanings",
    group: "Explore",
  },
  {
    href: "/profiles",
    title: "Saved profiles",
    description: "Open, import or manage your birth profiles",
    group: "Your account",
  },
  {
    href: "/history",
    title: "Saved charts & readings",
    description: "Revisit records saved to your account",
    group: "Your account",
  },
  {
    href: "/account",
    title: "Account",
    description: "Sign in or manage your session",
    group: "Your account",
  },
] as const;
export function searchDirectory(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return APP_DIRECTORY.filter(item =>
    terms.every(term =>
      `${item.title} ${item.description} ${item.group}`
        .toLowerCase()
        .includes(term)
    )
  );
}
