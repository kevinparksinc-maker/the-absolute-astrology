import { Link, useLocation } from "wouter";
import { BookOpen, Diamond, House, LayoutGrid, MessageCircleQuestion, Zap } from "lucide-react";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { trpc } from "@/lib/trpc";

export function PrimaryProfileNavigation() {
  const { profile } = useProfileSession();
  const [path] = useLocation();
  if (!profile) return null;

  const navItems = [
    { href: "/", label: "Home", Icon: House, active: path === "/" },
    { href: "/chart", label: "Chart", Icon: Diamond, active: path === "/chart" },
    { href: "/energy", label: "Energy", Icon: Zap, active: path.startsWith("/energy") || path === "/forecast" || path === "/transit-sky" },
    { href: "/reading", label: "Readings", Icon: BookOpen, active: path.startsWith("/reading") || path === "/life-story" || path === "/guide" },
    { href: "/horary", label: "Horary", Icon: MessageCircleQuestion, active: path === "/horary" },
    {
      href: "/explore",
      label: "Explore",
      Icon: LayoutGrid,
      active:
        path === "/explore" ||
        path === "/synastry" ||
        path === "/sky" ||
        path === "/zodiac-readings" ||
        path === "/history" || path === "/profiles" || path === "/account",
    },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation dock"
      className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-6 border-t border-white/10 bg-[#080B14]/94 px-2 py-1.5 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-15px_40px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.Icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`flex min-h-[50px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-center text-[10px] font-semibold transition-all duration-200 active:scale-95 ${
              item.active
                ? "text-[#D9B66F] bg-[#D9B66F]/15 font-bold shadow-[0_0_16px_rgba(217,182,111,0.25)] border border-[#D9B66F]/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={20} strokeWidth={item.active ? 2.5 : 1.8} aria-hidden="true" />
            <span className="tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
