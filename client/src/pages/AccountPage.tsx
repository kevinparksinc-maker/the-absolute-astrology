import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { startLegacyLogin } from "@/const";

function returnPath() {
  const path = new URLSearchParams(window.location.search).get("next");
  return path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/account") && !/[\\\r\n]/.test(path) ? path : "/";
}

export default function AccountPage() {
  const { user, refresh, logout } = useAuth();
  const { deviceProfilesCount, importDeviceProfiles } = useProfileSession();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const availability = trpc.auth.availability.useQuery(undefined, { retry: false, staleTime: 0 });
  const login = trpc.auth.login.useMutation();
  const register = trpc.auth.register.useMutation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !availability.data?.available) return;
    setSubmitting(true);
    setError("");
    try {
      if (mode === "register") await register.mutateAsync({ name, email, password });
      else await login.mutateAsync({ email, password });
      setPassword("");
      try { sessionStorage.removeItem("manus-cookie"); } catch { /* Cookie login does not require browser token storage. */ }
      const account = await utils.auth.me.fetch();
      if (!account) throw new Error("The browser did not retain your sign-in session. Open this app directly in your browser and try again.");
      navigate(returnPath());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in could not complete. Please retry.");
    } finally { setSubmitting(false); }
  }

  return <main className="mx-auto max-w-lg space-y-6 py-12 text-slate-100">
    <header className="space-y-3"><p className="text-xs uppercase tracking-widest text-amber-200">The Absolute · Your account</p><h1 className="font-serif text-3xl">{user ? "Your private observatory" : mode === "register" ? "Create your account" : "Welcome back"}</h1><p className="text-sm leading-7 text-slate-300">Accounts keep saved chart history connected to you. Birth profiles on this browser stay on this device and can be imported explicitly.</p></header>
    {error && <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</p>}
    {user ? <div className="space-y-4"><p>Signed in as {user.name || user.email || "your account"}.</p>{deviceProfilesCount > 0 && <button type="button" onClick={importDeviceProfiles} className="w-full rounded-xl border border-amber-200/40 p-3">Import {deviceProfilesCount} existing device profile{deviceProfilesCount === 1 ? "" : "s"} into this account’s browser space</button>}<button type="button" onClick={() => void logout().catch(cause => setError(cause.message))} className="rounded-xl border border-white/20 p-3">Sign out</button></div> : <>
      {availability.isPending ? <p role="status">Checking the account connection…</p> : !availability.data?.available ? <div className="space-y-3 rounded-xl border border-amber-200/30 p-4"><p role="status">{availability.data?.message || "The account connection is unavailable. Your device profiles have been preserved."}</p><button type="button" onClick={() => { void availability.refetch(); void refresh(); }} className="rounded-lg border border-white/20 p-2">Check connection again</button></div> : <form onSubmit={submit} className="space-y-4">
        {mode === "register" && <label className="block space-y-2"><span>Name</span><input name="name" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} className="w-full rounded-xl border border-white/20 bg-slate-950 p-3" /></label>}
        <label className="block space-y-2"><span>Email</span><input name="email" type="email" autoComplete="username" required maxLength={320} value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-white/20 bg-slate-950 p-3" /></label>
        <label className="block space-y-2"><span>Password{mode === "register" ? " (at least 12 characters)" : ""}</span><input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 12 : 1} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-white/20 bg-slate-950 p-3" /></label>
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-amber-200 p-3 font-semibold text-slate-950 disabled:opacity-50">{submitting ? "Checking your account…" : mode === "register" ? "Create account" : "Sign in"}</button>
        <button type="button" disabled={submitting} onClick={() => { setMode(mode === "login" ? "register" : "login"); setPassword(""); setError(""); }} className="text-sm text-cyan-200">{mode === "login" ? "Create an account" : "Already registered? Sign in"}</button>
      </form>}
      {availability.data?.legacySignInAvailable && <button type="button" disabled={submitting} onClick={() => void startLegacyLogin().catch(cause => setError(cause.message))} className="rounded-xl border border-white/20 p-3 text-sm">Sign in with your original Manus account</button>}
    </>}
    <Link href="/" className="inline-flex rounded-xl border border-white/20 px-5 py-3">Continue to the observatory</Link>
  </main>;
}
