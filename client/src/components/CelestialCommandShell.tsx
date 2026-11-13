import { FloatingInterpreter } from "./FloatingInterpreter";
import type { ReactNode } from "react";
import { GuardianNavigation } from "./GuardianNavigation";
import { PrimaryProfileNavigation } from "./PrimaryProfileNavigation";
import "./CelestialCommandShell.css";

export function CelestialCommandShell({ children }: { children: ReactNode }) {
  return (
    <div className="fg-command-shell">
      {/* Consistent luxury header across ALL pages */}
      <GuardianNavigation />

      {/* Main content viewport with room for mobile bottom dock */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-xl focus:bg-slate-900 focus:p-3 focus:text-cyan-100">Skip to content</a>
      <div id="main-content" tabIndex={-1} className="min-w-0 pb-40 md:pb-28">
        <div className="fg-command-main max-w-[1680px] mx-auto px-3 sm:px-6 py-4">
          {children}
        </div>
      </div>

      {/* Mobile-only thumb dock navigation */}
      <PrimaryProfileNavigation />
      <FloatingInterpreter />
    </div>
  );
}