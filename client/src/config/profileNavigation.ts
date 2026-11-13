/** One canonical route map for the primary navigation destinations. */
export const PROFILE_TABS = [
  { href: "/", label: "Home", section: "home", icon: "House" },
  { href: "/chart", label: "Birth Chart", section: "chart", icon: "Orbit" },
  { href: "/energy", label: "Energy", section: "energy", icon: "Zap" },
  { href: "/reading", label: "Readings", section: "reading", icon: "BookOpen" },
  { href: "/explore", label: "Explore", section: "explore", icon: "LayoutGrid" },
] as const;

export type ProfileSection = (typeof PROFILE_TABS)[number]["section"] | "guide" | "profile";

export function isProfileRoute(path: string): boolean {
  return PROFILE_TABS.some(tab => tab.href === path) || path === "/guide" || path === "/profile";
}

