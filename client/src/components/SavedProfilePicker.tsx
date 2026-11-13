import { useRef, useState } from "react";
import { toast } from "sonner";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import type { UserProfileData } from "@/components/NatalProfileBuilder";

type Props = { onLoad: (profile: UserProfileData) => void; };

export function SavedProfilePicker({ onLoad }: Props) {
  const { savedProfiles, deleteSavedProfile, importProfiles } = useProfileSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ format: "the-absolute-profiles", version: 1, profiles: savedProfiles }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "the-absolute-profiles-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Profile backup downloaded");
  };
  const restoreBackup = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error("Backup exceeds 1 MB");
      const data = JSON.parse(await file.text());
      if (data?.format !== "the-absolute-profiles" || data?.version !== 1 || !Array.isArray(data.profiles)) throw new Error("Not a supported profile backup");
      const count = importProfiles(data.profiles);
      toast.success(count ? `Restored ${count} profile(s)` : "No new valid profiles found");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to restore backup");
    } finally { if (fileInput.current) fileInput.current.value = ""; }
  };
  const [open, setOpen] = useState(false);
  return <section aria-label="Saved birth profiles" className="rounded-2xl border border-cyan-200/20 bg-slate-950/70 p-5 text-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-serif text-xl text-white">Load Profile</h2><p className="mt-1 text-xs text-slate-400">Choose a saved birth chart without entering the details again.</p></div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(v => !v)} className="min-h-11 rounded-xl border border-cyan-300/40 px-4 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/10">{open ? "Close saved profiles" : `Load Profile (${savedProfiles.length})`}</button>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" disabled={!savedProfiles.length} onClick={exportBackup} className="min-h-11 rounded-lg border border-cyan-300/40 px-4 text-sm text-cyan-100 disabled:opacity-40">Export backup</button>
      <button type="button" onClick={() => fileInput.current?.click()} className="min-h-11 rounded-lg border border-cyan-300/40 px-4 text-sm text-cyan-100">Import backup</button>
      <input ref={fileInput} type="file" accept=".json,application/json" className="hidden" aria-label="Choose profile backup" onChange={e => void restoreBackup(e.target.files?.[0])} />
    </div>
    {open && <div className="mt-4 space-y-2">
      {!savedProfiles.length ? <p className="rounded-lg bg-white/5 p-4 text-sm text-slate-300">No saved profiles in this browser yet. Save a birth profile first.</p> : savedProfiles.map((profile, index) => <div key={`${profile.name}-${profile.date}-${profile.time}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-3">
        <div className="min-w-0"><strong className="block break-words text-sm">{profile.name}</strong><p className="text-xs text-slate-400">{profile.date} · {profile.location}</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onLoad(profile)} className="min-h-11 rounded-lg border border-cyan-300/50 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100">Load</button>
          <button type="button" onClick={() => { if (window.confirm(`Remove saved profile for ${profile.name}?`)) deleteSavedProfile(profile); }} className="min-h-11 rounded-lg border border-rose-300/30 px-3 text-sm text-rose-200">Remove</button>
        </div>
      </div>)}
      <p className="pt-2 text-xs text-amber-200/80">These profiles are saved in this browser only. Other devices, cleared browser data, Manus and Google deployments do not automatically share them.</p>
    </div>}
  </section>;
}
