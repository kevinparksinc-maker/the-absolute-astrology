import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import {
  type UserProfileData,
  SAMPLE_PROFILE,
} from "@/components/NatalProfileBuilder";
import {
  User,
  Users,
  Plus,
  Check,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProfile?: () => void;
}

export function ProfileSwitcherModal({
  isOpen,
  onClose,
  onOpenNewProfile,
}: ProfileSwitcherModalProps) {
  const { profile: activeProfile, savedProfiles, setProfile, deleteSavedProfile } =
    useProfileSession();

  const handleSelect = (p: UserProfileData) => {
    setProfile(p);
    toast.success(`Loaded profile for ${p.name}`);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, p: UserProfileData) => {
    e.stopPropagation();
    if (window.confirm(`Remove saved profile for ${p.name}?`)) {
      deleteSavedProfile(p);
      toast.info(`Removed profile for ${p.name}`);
    }
  };

  const handleLoadSample = () => {
    setProfile(SAMPLE_PROFILE);
    toast.success("Loaded demo seeker Jordan");
    onClose();
  };

  const isCurrent = (p: UserProfileData) => {
    if (!activeProfile) return false;
    return (
      activeProfile.name.trim().toLowerCase() === p.name.trim().toLowerCase() &&
      activeProfile.date === p.date &&
      activeProfile.time === p.time &&
      activeProfile.location.trim().toLowerCase() === p.location.trim().toLowerCase()
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border border-[#D9B66F]/30 bg-[linear-gradient(145deg,#0a0e1c_0%,#11172e_100%)] p-6 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.85)] sm:rounded-3xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9B66F]">
            <Users className="h-4 w-4" />
            <span>Profile Roster · Saved Birth Charts</span>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-white">
            Switch Seeker Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Select a saved birth chart to recalculate all natal placements, active
            transits, and readings instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-[50vh] space-y-2.5 overflow-y-auto pr-1">
          {savedProfiles.map((p, idx) => {
            const active = isCurrent(p);
            return (
              <div
                key={`${p.name}-${p.date}-${p.time}-${idx}`}
                onClick={() => handleSelect(p)}
                className={`group relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all ${
                  active
                    ? "border-[#D9B66F] bg-[#D9B66F]/10 shadow-[0_0_20px_rgba(217,182,111,0.2)]"
                    : "border-white/10 bg-black/40 hover:border-cyan-400/40 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-[#D9B66F] text-black font-bold"
                          : "bg-white/10 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300"
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="truncate text-sm font-semibold text-white">
                          {p.name}
                        </strong>
                        {active && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#D9B66F]/20 px-2 py-0.5 text-[10px] font-bold text-[#D9B66F]">
                            <Check className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!active && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(p);
                        }}
                        className="h-7 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                      >
                        Load
                      </Button>
                    )}
                    {(
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, p)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 opacity-60 transition-opacity hover:bg-rose-500/20 hover:text-rose-300 hover:opacity-100"
                        title="Delete saved profile"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 sm:grid-cols-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="h-3 w-3 shrink-0 text-slate-500" />
                    <span>{p.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="h-3 w-3 shrink-0 text-slate-500" />
                    <span>{p.birthTimeUnknown ? "Untimed (12:00 PM)" : p.time}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
                    <span className="truncate">{p.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              if (onOpenNewProfile) onOpenNewProfile();
            }}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border-[#D9B66F]/50 bg-[#D9B66F]/10 text-xs font-semibold text-[#D9B66F] hover:bg-[#D9B66F]/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Natal Profile</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleLoadSample}
            className="flex min-h-10 items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-cyan-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Load Demo Chart</span>
          </Button>
        </div>

        <p className="mt-2 text-[11px] text-slate-400 text-center">
          Profiles are saved in this browser only. Back up profiles before clearing browser data or switching devices.
        </p>
      </DialogContent>
    </Dialog>
  );
}
