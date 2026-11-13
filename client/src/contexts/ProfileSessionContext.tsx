import { repairProfileLocations } from "@shared/profileLocations";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { ChartResult } from "../../../server/astronomy";
import type { UserProfileData } from "@/components/NatalProfileBuilder";

const PROFILE_KEY = "algorithms_cosmos_profile";
const SAVED_PROFILES_KEY = "fg:saved-birth-profiles:v1";

function legacyKey(p: UserProfileData): string {
  return [p.name.trim().toLowerCase(), p.date, p.time, p.location.trim().toLowerCase()].join("|");
}

function profileId(p: UserProfileData): string {
  return p.id || legacyKey(p);
}

function ensureId(p: UserProfileData): UserProfileData {
  return p.id ? p : { ...p, id: crypto.randomUUID() };
}

function readSavedProfiles(key = SAVED_PROFILES_KEY): UserProfileData[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    const valid = Array.isArray(value) ? value.filter((p): p is UserProfileData => Boolean(p && typeof p.name === "string" && typeof p.date === "string" && typeof p.location === "string")) : [];
    const migrated = valid.map(p => ensureId(repairProfileLocations(p)));
    if (JSON.stringify(valid) !== JSON.stringify(migrated)) window.localStorage.setItem(key, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}


function readProfile(profileKey = PROFILE_KEY, savedKey = SAVED_PROFILES_KEY): UserProfileData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(profileKey);
    if (stored) {
      const parsed = JSON.parse(stored) as UserProfileData;
      if (parsed && typeof parsed.name === "string" && parsed.location) {
        const saved = readSavedProfiles(savedKey).find(p => p.id === parsed.id || legacyKey(p) === legacyKey(parsed));
        const migrated = saved || ensureId(repairProfileLocations(parsed));
        if (JSON.stringify(parsed) !== JSON.stringify(migrated)) window.localStorage.setItem(profileKey, JSON.stringify(migrated));
        return migrated;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function profileStorageKeys(accountId: string) {
  return { active: `fg:account:${accountId}:active-profile`, saved: `fg:account:${accountId}:saved-profiles` };
}

/** Explicit import only: include the previous device-only namespace, never another account. */
export function readDeviceProfilesForImport(accountId: string): UserProfileData[] {
  const guest = profileStorageKeys("guest");
  const candidates = [...readSavedProfiles(), readProfile(), ...(accountId === "guest" ? [] : [...readSavedProfiles(guest.saved), readProfile(guest.active, guest.saved)])];
  const unique = new Map<string, UserProfileData>();
  for (const profile of candidates) if (profile) unique.set(legacyKey(profile), profile);
  return Array.from(unique.values());
}

type ProfileSession = {
  profile: UserProfileData | null;
  deviceProfilesCount: number;
  importDeviceProfiles: () => void;
  chart: ChartResult | null;
  energyChart: ChartResult | null;
  setEnergyChart: Dispatch<SetStateAction<ChartResult | null>>;
  savedProfiles: UserProfileData[];
  deleteSavedProfile: (profile: UserProfileData) => void;
  setProfile: (next: UserProfileData | null) => void;
  saveEditedProfile: (previous: UserProfileData, next: UserProfileData) => void;
  importProfiles: (profiles: UserProfileData[]) => number;
  updateTransitLocation: (transit: {
    transitLocation: string;
    transitLatitude: number;
    transitLongitude: number;
    transitTimezone: string;
  }) => void;
  setChart: Dispatch<SetStateAction<ChartResult | null>>;
};

const ProfileSessionContext = createContext<ProfileSession | null>(null);

export function ProfileSessionProvider({ children, accountId = "guest" }: { children: ReactNode; accountId?: string }) {
  const { active: PROFILE_KEY, saved: SAVED_PROFILES_KEY } = profileStorageKeys(accountId);
  const [deviceProfilesCount, setDeviceProfilesCount] = useState(() => { try { return window.localStorage.getItem(`fg:account:${accountId}:device-imported`) ? 0 : readDeviceProfilesForImport(accountId).length; } catch { return 0; } });
  const [profile, updateProfile] = useState<UserProfileData | null>(() => readProfile(PROFILE_KEY, SAVED_PROFILES_KEY));
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [energyChart, setEnergyChart] = useState<ChartResult | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<UserProfileData[]>(() => readSavedProfiles(SAVED_PROFILES_KEY));

  const setProfile = useCallback((next: UserProfileData | null) => {
    const saved = next ? ensureId(repairProfileLocations(next)) : null;
    updateProfile(saved);
    setChart(null);
    setEnergyChart(null);
    if (typeof window === "undefined") return;
    try {
      if (saved) {
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));
        const existing = readSavedProfiles(SAVED_PROFILES_KEY);
        const withoutMatch = existing.filter(p => profileId(p) !== profileId(saved));
        const updated = [saved, ...withoutMatch].slice(0, 100);
        window.localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(updated));
        setSavedProfiles(updated);
      } else window.localStorage.removeItem(PROFILE_KEY);
      window.dispatchEvent(new Event("fg:profile-updated"));
    } catch {
      // The current session remains usable if local storage is blocked.
    }
  }, []);

  const saveEditedProfile = useCallback((previous: UserProfileData, next: UserProfileData) => {
    const saved = { ...next, id: previous.id || next.id || crypto.randomUUID() };
    updateProfile(saved);
    setChart(null);
    setEnergyChart(null);
    if (typeof window === "undefined") return;
    try {
      const updated = [saved, ...readSavedProfiles(SAVED_PROFILES_KEY).filter(p =>
        profileId(p) !== profileId(previous) && profileId(p) !== profileId(saved) && legacyKey(p) !== legacyKey(previous)
      )].slice(0, 100);
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));
      window.localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(updated));
      setSavedProfiles(updated);
      window.dispatchEvent(new Event("fg:profile-updated"));
    } catch {
      // Editing remains available for this session if browser storage is blocked.
    }
  }, []);

  const deleteSavedProfile = useCallback((target: UserProfileData) => {
    const updated = readSavedProfiles(SAVED_PROFILES_KEY).filter(p => profileId(p) !== profileId(target));
    const isActive = profile && (profileId(profile) === profileId(target) || legacyKey(profile) === legacyKey(target));
    try {
      window.localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(updated));
      setSavedProfiles(updated);
      if (isActive) {
        window.localStorage.removeItem(PROFILE_KEY);
        updateProfile(null);
        setChart(null);
        setEnergyChart(null);
      }
      window.dispatchEvent(new Event("fg:profile-updated"));
    } catch { /* Browser storage may be unavailable. */ }
  }, [profile]);

  const importProfiles = useCallback((incoming: UserProfileData[]): number => {
    const existing = readSavedProfiles(SAVED_PROFILES_KEY);
    const known = new Set(existing.map(profileId));
    const added: UserProfileData[] = [];
    for (const candidate of incoming) {
      if (!candidate || typeof candidate.name !== "string" || !candidate.name.trim() ||
          !/^\d{4}-\d{2}-\d{2}$/.test(candidate.date) ||
          !/^\d{2}:\d{2}$/.test(candidate.time) ||
          typeof candidate.location !== "string" ||
          !Number.isFinite(candidate.latitude) || !Number.isFinite(candidate.longitude) ||
          Math.abs(candidate.latitude) > 90 || Math.abs(candidate.longitude) > 180 ||
          typeof candidate.timezone !== "string" || !candidate.timezone) continue;
      const saved = ensureId(candidate);
      if (!known.has(profileId(saved))) {
        known.add(profileId(saved));
        added.push(saved);
      }
    }
    if (!added.length) return 0;
    const updated = [...added, ...existing].slice(0, 100);
    window.localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(updated));
    setSavedProfiles(updated);
    window.dispatchEvent(new Event("fg:profile-updated"));
    return added.length;
  }, []);

  useEffect(() => {
    const sync = () => {
      setSavedProfiles(readSavedProfiles(SAVED_PROFILES_KEY));
      const updated = readProfile(PROFILE_KEY, SAVED_PROFILES_KEY);
      updateProfile(current => {
        if (JSON.stringify(current) === JSON.stringify(updated)) return current;
        setChart(null);
        setEnergyChart(null);
        return updated;
      });
    };
    window.addEventListener("storage", sync);
    window.addEventListener("fg:profile-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("fg:profile-updated", sync);
    };
  }, []);

  const updateTransitLocation = useCallback((transit: {
    transitLocation: string;
    transitLatitude: number;
    transitLongitude: number;
    transitTimezone: string;
  }) => {
    setEnergyChart(null);
    updateProfile(current => {
      if (!current) return current;
      const next: UserProfileData = {
        ...current,
        transitLocation: transit.transitLocation,
        transitLatitude: transit.transitLatitude,
        transitLongitude: transit.transitLongitude,
        transitTimezone: transit.transitTimezone,
      };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
          const existing = readSavedProfiles(SAVED_PROFILES_KEY);
          const withoutMatch = existing.filter(p => profileId(p) !== profileId(next));
          const updated = [next, ...withoutMatch].slice(0, 100);
          window.localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(updated));
          setSavedProfiles(updated);
        } catch {}
      }
      return next;
    });
    window.dispatchEvent(new CustomEvent("fg:transit-location-updated", { detail: transit }));
  }, []);

  const importDeviceProfiles = useCallback(() => {
    const deviceProfiles = readDeviceProfilesForImport(accountId);
    importProfiles(deviceProfiles);
    if (deviceProfiles[0]) setProfile(deviceProfiles[0]);
    try { window.localStorage.setItem(`fg:account:${accountId}:device-imported`, "true"); } catch {}
    setDeviceProfilesCount(0);
  }, [accountId, importProfiles, setProfile]);

  const value = useMemo(
    () => ({ deviceProfilesCount, importDeviceProfiles, profile, chart, energyChart, setEnergyChart, savedProfiles, setProfile, saveEditedProfile, importProfiles, updateTransitLocation, setChart, deleteSavedProfile }),
    [profile, chart, energyChart, setEnergyChart, savedProfiles, setProfile, saveEditedProfile, importProfiles, updateTransitLocation, deleteSavedProfile]
  );
  return <ProfileSessionContext.Provider value={value}>{children}</ProfileSessionContext.Provider>;
}

export function useProfileSession() {
  const context = useContext(ProfileSessionContext);
  if (!context) throw new Error("ProfileSessionProvider is required");
  return context;
}
