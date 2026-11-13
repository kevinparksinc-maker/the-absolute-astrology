import { lazy, Suspense, useState } from "react";
import { useAuth } from "./_core/hooks/useAuth";
import { ProfileSessionProvider, useProfileSession } from "./contexts/ProfileSessionContext";
import { PROFILE_TABS } from "./config/profileNavigation";
import { CelestialCommandShell } from "./components/CelestialCommandShell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SovereignTierProvider } from "./components/SovereignTierModal";
// Route-level splitting: the large sky map and horary engine UI do not block the home screen.
const SavedProfilesPage = lazy(() => import("./pages/SavedProfilesPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const Home = lazy(() => import("./pages/Home"));
const LegacyHome = lazy(() => import("./pages/LegacyHome"));
const HoraryPage = lazy(() => import("./pages/HoraryPage"));
const ZodiacHoraryPage = lazy(() => import("./pages/ZodiacHoraryPage"));
const History = lazy(() => import("./pages/History"));
const SkyHomePrototype = lazy(() => import("./pages/SkyHomePrototype"));
const LifeStoryPage = lazy(() => import("./pages/LifeStoryPage"));
const SynastryPage = lazy(() => import("./pages/SynastryPage"));
const StandaloneTransitPage = lazy(() => import("./pages/StandaloneTransitPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const SportsLabPage = lazy(() => import("./pages/SportsLabPage"));

function AccountEntryGate({ children }: { children: React.ReactNode }) {
  const { user, loading, error, refresh } = useAuth();
  const [useDeviceProfiles, setUseDeviceProfiles] = useState(false);
  if (loading) return <main role="status" className="p-8 text-center text-cyan-100">Checking your account session…</main>;
  if (error && !useDeviceProfiles) return <main className="mx-auto max-w-lg space-y-4 p-8 text-slate-100"><h1 className="text-xl">Your account connection needs another try</h1><p role="alert">Your saved profiles have not been changed. We could not check your session.</p><button type="button" onClick={() => void refresh()} className="rounded-xl border border-white/20 p-3">Retry connection</button><button type="button" onClick={() => setUseDeviceProfiles(true)} className="ml-3 rounded-xl border border-white/20 p-3">Use device profiles</button></main>;
  const accountId = error && useDeviceProfiles ? "guest" : user?.openId ?? "guest";
  // Remounting clears the previous account's in-memory charts and callbacks.
  return <ProfileSessionProvider key={accountId} accountId={accountId}><CelestialCommandShell>{error && <p role="status" className="p-3 text-amber-200">Account connection unavailable. You are viewing device profiles.</p>}{children}</CelestialCommandShell></ProfileSessionProvider>;
}

function Router() {
  const [path] = useLocation();
  const { profile } = useProfileSession();
  // A birth profile is still required before opening profile-based observatory modules.
  if (!profile && path !== "/account" && path !== "/profiles" && path !== "/" && path !== "/legacy" && path !== "/horary" && path !== "/zodiac-readings" && path !== "/sky" && path !== "/history") return <Redirect to="/" />;
  return (
    <Switch>
      <Route path="/account" component={AccountPage} />
      <Route path="/profiles" component={SavedProfilesPage} />
      <Route path="/reading/depth"><Home section="reading" /></Route>
      <Route path="/reading/evidence"><Home section="reading" /></Route>
      <Route path="/energy/contacts"><Home section="energy" /></Route>
      <Route path="/energy/consultation"><Home section="energy" /></Route>
      <Route path="/forecast"><Home section="energy" /></Route>
      {PROFILE_TABS.map(tab => (
        <Route key={tab.href} path={tab.href}><Home section={tab.section} /></Route>
      ))}
      <Route path={"/legacy"} component={LegacyHome} />
      <Route path={"/synastry"} component={SynastryPage} />
      <Route path={"/transit-sky"} component={StandaloneTransitPage} />
      <Route path={"/explore"} component={ExplorePage} />
      <Route path={"/sports-lab"} component={SportsLabPage} />
      <Route path={"/sky"} component={SkyHomePrototype} />
      <Route path={"/life-story"} component={LifeStoryPage} />
      <Route path={"/horary"} component={HoraryPage} />
      <Route path={"/zodiac-readings"} component={ZodiacHoraryPage} />
      <Route path={"/history"} component={History} />
      <Route path={"/guide"}><Home section="guide" /></Route>
      <Route path={"/profile"}><Home section="profile" /></Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SovereignTierProvider>
            <Toaster />
            <Suspense fallback={<main role="status" className="flex min-h-[55vh] items-center justify-center px-6 text-center text-sm text-cyan-100"><div className="rounded-2xl border border-cyan-200/20 bg-slate-950/70 px-6 py-5" aria-live="polite">Opening your celestial observatory…</div></main>}>
              <AccountEntryGate><Router /></AccountEntryGate>
            </Suspense>
          </SovereignTierProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
