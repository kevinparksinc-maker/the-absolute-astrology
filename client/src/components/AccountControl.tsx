import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export function AccountControl() {
  const { user, logout, loading } = useAuth();

  if (user) {
    return <div className="flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/[0.06] pl-3 pr-1.5 py-1"><UserRound className="h-3.5 w-3.5 text-cyan-200"/><span className="hidden sm:inline max-w-28 truncate text-xs text-cyan-100">{user.name || "My observatory"}</span><Button type="button" variant="ghost" size="sm" onClick={() => void logout().catch(error => toast.error(error.message))} disabled={loading} className="h-7 rounded-full px-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut className="h-3.5 w-3.5"/></Button></div>;
  }

  return <Link href="/account" className="rounded-full border border-cyan-200/20 px-3 py-2 text-xs text-cyan-100">{loading ? "Checking account…" : "Sign in"}</Link>;
}
