import { useLocation } from "wouter";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { SavedProfilePicker } from "@/components/SavedProfilePicker";
export default function SavedProfilesPage() {
  const { setProfile, deviceProfilesCount, importDeviceProfiles } =
    useProfileSession();
  const [, navigate] = useLocation();
  return (
    <main className="mx-auto max-w-3xl space-y-8 pb-24 text-slate-100">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-amber-200">
          The Absolute · Your account
        </p>
        <h1 className="font-serif text-3xl">Saved birth profiles</h1>
        <p className="text-sm leading-6 text-slate-300">
          Open a profile to calculate its chart. Profiles saved on this device
          are separated by account.
        </p>
      </header>
      {deviceProfilesCount > 0 && (
        <section className="space-y-3 rounded-2xl border border-cyan-200/25 p-5">
          <h2 className="font-serif text-xl">Existing device profiles</h2>
          <p className="text-sm text-slate-400">
            Import the profiles saved before account separation. The original
            device records are preserved.
          </p>
          <button
            type="button"
            onClick={importDeviceProfiles}
            className="rounded-xl border border-cyan-200/40 px-4 py-3 text-cyan-100"
          >
            Import device profiles
          </button>
        </section>
      )}
      <SavedProfilePicker
        onLoad={profile => {
          setProfile(profile);
          navigate("/chart");
        }}
      />
    </main>
  );
}
