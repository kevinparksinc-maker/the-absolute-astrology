import { prepareBirthStep } from "@shared/profileOnboarding";
import { KNOWN_CITIES } from "@shared/profileLocations";
import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  Heart,
  Compass,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Star,
  Flame,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import type { ChartResult } from "../../../server/astronomy";

export interface UserProfileData {
  id?: string;
  name: string;
  date: string;
  time: string;
  birthTimeUnknown: boolean;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
  transitLocation?: string;
  transitLatitude?: number;
  transitLongitude?: number;
  transitTimezone?: string;
  primaryFocus?: string;
}

export const CITY_PRESETS = [
  ...KNOWN_CITIES.map(city => ({ label: city.shortLabel, full: city.label, lat: city.latitude, lng: city.longitude, tz: city.timezone })),
  { label: "Los Angeles, CA", full: "Los Angeles, California, USA", lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles" },
  { label: "New York, NY", full: "New York, New York, USA", lat: 40.7128, lng: -74.006, tz: "America/New_York" },
  { label: "Atlanta, GA", full: "Atlanta, Georgia, USA", lat: 33.749, lng: -84.388, tz: "America/New_York" },
  { label: "Chicago, IL", full: "Chicago, Illinois, USA", lat: 41.8781, lng: -87.6298, tz: "America/Chicago" },
  { label: "Miami, FL", full: "Miami, Florida, USA", lat: 25.7617, lng: -80.1918, tz: "America/New_York" },
  { label: "Houston, TX", full: "Houston, Texas, USA", lat: 29.7604, lng: -95.3698, tz: "America/Chicago" },
  { label: "London, UK", full: "London, England, UK", lat: 51.5074, lng: -0.1278, tz: "Europe/London" },
  { label: "Paris, FR", full: "Paris, France", lat: 48.8566, lng: 2.3522, tz: "Europe/Paris" },
  { label: "Tokyo, JP", full: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo" },
];

export const FOCUS_AREAS = [
  { id: "love", label: "Love & Synastry", icon: Heart, description: "Soulmate chemistry, house overlays & relational karmic patterns" },
  { id: "purpose", label: "Life Purpose & Destiny", icon: Compass, description: "North Node destiny, Midheaven legacy & frozen star alignments" },
  { id: "psychology", label: "Shadow Work & Healing", icon: Star, description: "Lunar mansions, Nakshatra subconscious & emotional blueprint" },
  { id: "transits", label: "Career & Cosmic Timing", icon: Flame, description: "Active planetary transits, solar return & 30/90-day cycles" },
];

export const SAMPLE_PROFILE: UserProfileData = {
  name: "Jordan (Demo Seeker)",
  date: "1986-11-20",
  time: "10:06",
  birthTimeUnknown: false,
  location: "Dallas, Texas, USA",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  transitLocation: "Dallas, Texas, USA",
  transitLatitude: 32.7767,
  transitLongitude: -96.797,
  transitTimezone: "America/Chicago",
  primaryFocus: "love",
};

interface NatalProfileBuilderProps {
  currentProfile: UserProfileData | null;
  onSaveProfile: (profile: UserProfileData) => Promise<void> | void;
  onLoadSample: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  mode?: "inline-gate" | "dialog";
  isCalculating?: boolean;
}

export function NatalProfileBuilder({
  currentProfile,
  onSaveProfile,
  onLoadSample,
  isOpen = false,
  onClose,
  mode = "inline-gate",
  isCalculating = false,
}: NatalProfileBuilderProps) {
  const [formData, setFormData] = useState<UserProfileData>(() => {
    return (
      currentProfile || {
        name: "",
        date: "",
        time: "",
        birthTimeUnknown: false,
        location: "",
        latitude: 0,
        longitude: 0,
        timezone: "",
        transitLocation: "",
        transitLatitude: 0,
        transitLongitude: 0,
        transitTimezone: "",
        primaryFocus: "purpose",
      }
    );
  });

  const [citySearch, setCitySearch] = useState(formData.location || "");
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [citySearchError, setCitySearchError] = useState("");
  const [currentCitySame, setCurrentCitySame] = useState(true);
  const [verifiedTransitCity, setVerifiedTransitCity] = useState<string | null>(currentProfile?.transitLocation && Number.isFinite(currentProfile.transitLatitude) && Number.isFinite(currentProfile.transitLongitude) && currentProfile.transitTimezone ? currentProfile.transitLocation : null);
  const [transitCityError, setTransitCityError] = useState("");
  const [resolvingTransitCity, setResolvingTransitCity] = useState(false);
  const trpcUtils = trpc.useUtils();
  const [formError, setFormError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const geocode = trpc.hybrid.geocode.useQuery(
    { query: citySearch },
    { enabled: false, retry: false }
  );

  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
      setCitySearch(currentProfile.location);
      setVerifiedTransitCity(currentProfile.transitLocation && Number.isFinite(currentProfile.transitLatitude) && Number.isFinite(currentProfile.transitLongitude) && currentProfile.transitTimezone ? currentProfile.transitLocation : null);
      setCurrentCitySame(!currentProfile.transitLocation || currentProfile.transitLocation === currentProfile.location);
    }
  }, [currentProfile]);

  const handleResolveCity = async () => {
    if (!citySearch.trim()) return;
    setIsSearchingCity(true);
    setCitySearchError("");
    try {
      const res = await geocode.refetch();
      if (res.data) {
        setFormData(prev => ({
          ...prev,
          location: res.data.label,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          timezone: res.data.timezone,
          ...(currentCitySame
            ? {
                transitLocation: res.data.label,
                transitLatitude: res.data.latitude,
                transitLongitude: res.data.longitude,
                transitTimezone: res.data.timezone,
              }
            : {}),
        }));
        setCitySearch(res.data.label);
      } else if (res.error) {
        setCitySearchError(res.error.message || "Could not find coordinates for this city.");
      }
    } catch (err: any) {
      setCitySearchError(err?.message || "City geocoding service unavailable.");
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleSelectPreset = (preset: typeof CITY_PRESETS[0]) => {
    setCitySearch(preset.full);
    setCitySearchError("");
    setFormData(prev => ({
      ...prev,
      location: preset.full,
      latitude: preset.lat,
      longitude: preset.lng,
      timezone: preset.tz,
      ...(currentCitySame
        ? {
            transitLocation: preset.full,
            transitLatitude: preset.lat,
            transitLongitude: preset.lng,
            transitTimezone: preset.tz,
          }
        : {}),
    }));
  };

  const handleResolveTransitCity = async () => {
    const query = (formData.transitLocation || "").trim();
    if (query.length < 2) {
      setTransitCityError("Enter your current city first.");
      return;
    }
    setResolvingTransitCity(true);
    setTransitCityError("");
    try {
      const result = await trpcUtils.hybrid.geocode.fetch({ query });
      if (!result) {
        setTransitCityError("Location not found. Try a more specific city.");
        return;
      }
      setFormData(prev => ({
        ...prev,
        transitLocation: result.label,
        transitLatitude: result.latitude,
        transitLongitude: result.longitude,
        transitTimezone: result.timezone,
      }));
      setVerifiedTransitCity(result.label);
    } catch {
      setTransitCityError("Unable to verify this location. Try again.");
    } finally {
      setResolvingTransitCity(false);
    }
  };

  const birthDraft = useRef("");
  birthDraft.current = JSON.stringify([formData.name,formData.date,formData.time,formData.birthTimeUnknown,citySearch]);
  const handleNext = async () => {
    const draft = birthDraft.current;
    setFormError("");
    setCitySearchError("");
    setIsSearchingCity(true);
    try {
      const next = await prepareBirthStep(formData,citySearch,query=>trpcUtils.hybrid.geocode.fetch({query}));
      if(draft !== birthDraft.current) {setFormError("Your details changed while resolving the city. Click Next again.");return;}
      setFormData(prev=>({...prev,location:next.location,latitude:next.latitude,longitude:next.longitude,timezone:next.timezone,
        ...(currentCitySame?{transitLocation:next.location,transitLatitude:next.latitude,transitLongitude:next.longitude,transitTimezone:next.timezone}:{}),
      }));
      setCitySearch(next.location);
      setStep(2);
    } catch(error) {
      setFormError(error instanceof Error ? error.message : "Could not resolve your birth city. Try a quick preset.");
    } finally {setIsSearchingCity(false);}
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Please enter your name or cosmic moniker.");
      return;
    }
    if (!formData.date) {
      setFormError("Please enter your birth date.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date) || !Number.isFinite(Date.parse(`${formData.date}T00:00:00.000Z`)) || new Date(`${formData.date}T00:00:00.000Z`).toISOString().slice(0, 10) !== formData.date) {
      setFormError("Please enter a valid birth date in YYYY-MM-DD format.");
      return;
    }
    if (!formData.birthTimeUnknown && !formData.time) {
      setFormError("Please provide your birth time or check 'Exact birth time unknown'.");
      return;
    }
    if (!Number.isFinite(formData.latitude) || !Number.isFinite(formData.longitude) || Math.abs(formData.latitude) > 90 || Math.abs(formData.longitude) > 180 || !formData.timezone || !formData.location.trim()) {
      setFormError("Please resolve your birth city to lock exact coordinates and timezone.");
      return;
    }

    if (!currentCitySame && (!verifiedTransitCity || verifiedTransitCity !== formData.transitLocation)) {
      setFormError("Resolve your current city to verify its coordinates and timezone before continuing.");
      return;
    }

    const payload: UserProfileData = {
      ...formData,
      time: formData.birthTimeUnknown ? "12:00" : formData.time,
      transitLocation: currentCitySame ? formData.location : formData.transitLocation,
      transitLatitude: currentCitySame ? formData.latitude : formData.transitLatitude,
      transitLongitude: currentCitySame ? formData.longitude : formData.transitLongitude,
      transitTimezone: currentCitySame ? formData.timezone : formData.transitTimezone,
    };

    onSaveProfile(payload);
    if (onClose) onClose();
  };

  const formBody = (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
              step === 1
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "bg-white/10 text-slate-300"
            }`}
          >
            1
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Identity & Birth Coordinates
            </div>
            <div className="text-[11px] text-slate-400">Exact time & space anchor</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
              step === 2
                ? "bg-gradient-to-r from-violet-400 to-purple-500 text-slate-950 shadow-md shadow-violet-500/30"
                : "bg-white/10 text-slate-300"
            }`}
          >
            2
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-violet-300">
              Cosmic Focus & Horizon
            </div>
            <div className="text-[11px] text-slate-400">Primary esoteric inquiry</div>
          </div>
        </div>
      </div>

      {formError && <div role="alert" aria-live="assertive" className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{formError}</div>}

      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-cyan-300" />
              <span>Your Name or Cosmic Moniker</span>
              <span className="text-cyan-400">*</span>
            </Label>
            <Input
              id="profile-name"
              placeholder="e.g. Sophia, Jordan, or Seeker"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="border-white/10 bg-black/40 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400/50"
            />
            <p className="text-[11px] text-slate-400">
              Used to personalize your Master Interpreter readings, synastry chemistry, and export cards.
            </p>
          </div>

          {/* Date & Time Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-date" className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-300" />
                <span>Birth Date</span>
                <span className="text-cyan-400">*</span>
              </Label>
              <Input
                id="profile-date"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="border-white/10 bg-black/40 text-slate-100 focus:border-cyan-400/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-time" className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-300" />
                  <span>Exact Birth Time</span>
                  {!formData.birthTimeUnknown && <span className="text-cyan-400">*</span>}
                </Label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.birthTimeUnknown}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        birthTimeUnknown: e.target.checked,
                        time: e.target.checked ? "12:00" : prev.time,
                      }))
                    }
                    className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0"
                  />
                  <span>Time unknown</span>
                </label>
              </div>
              <Input
                id="profile-time"
                type="time"
                disabled={formData.birthTimeUnknown}
                value={formData.birthTimeUnknown ? "" : formData.time}
                onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                placeholder={formData.birthTimeUnknown ? "12:00 (Noon Solar default)" : "10:06"}
                className="border-white/10 bg-black/40 text-slate-100 disabled:opacity-40 focus:border-cyan-400/50"
              />
              {formData.birthTimeUnknown && (
                <p className="text-[11px] text-amber-300/80">
                  Calculates noon solar reference; Rising sign & house cusps will be approximate.
                </p>
              )}
            </div>
          </div>

          {/* Birth Location Field & Geocoding */}
          <div className="space-y-2">
            <Label htmlFor="profile-city" className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-300" />
              <span>Birth City & Country</span>
              <span className="text-cyan-400">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="profile-city"
                  placeholder="Enter city (e.g., Dallas, TX, London, Tokyo)"
                  value={citySearch}
                  onChange={e => {
                    setCitySearch(e.target.value);
                    setFormError("");
                    setCitySearchError("");
                    setFormData(prev=>({...prev,location:"",latitude:0,longitude:0,timezone:""}));
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleResolveCity();
                    }
                  }}
                  className="border-white/10 bg-black/40 text-slate-100 pr-10 focus:border-cyan-400/50"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleResolveCity}
                disabled={isSearchingCity || !citySearch.trim()}
                className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 hover:text-white shrink-0"
              >
                {isSearchingCity ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-1.5" />
                    <span>Resolve City</span>
                  </>
                )}
              </Button>
            </div>

            {/* Resolved Status or Error */}
            {formData.location && formData.timezone && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  <strong>Locked:</strong> {formData.location} ({formData.latitude.toFixed(2)}°, {formData.longitude.toFixed(2)}°) · Timezone: {formData.timezone}
                </span>
              </div>
            )}

            {citySearchError && (
              <p className="text-xs text-rose-400">{citySearchError}</p>
            )}

            {/* 1-Tap Quick City Presets */}
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-medium text-slate-400">1-Tap Quick Presets:</div>
              <div className="flex flex-wrap gap-1.5">
                {CITY_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                      formData.location === preset.full
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-100 shadow-sm shadow-cyan-500/30"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onLoadSample}
              className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Or quick-test with Dallas 1986 Demo Chart</span>
            </button>

            <Button
              type="button"
              onClick={() => void handleNext()}
              disabled={isSearchingCity}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500"
            >
              <span>{isSearchingCity ? "Verifying birth city…" : "Next: Cosmic Focus"}</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Primary Focus Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-200">
              What profound insight or area of life are you seeking today?
            </Label>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {FOCUS_AREAS.map(area => {
                const Icon = area.icon;
                const isSelected = formData.primaryFocus === area.id;
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, primaryFocus: area.id }))}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      isSelected
                        ? "border-violet-400 bg-gradient-to-br from-violet-500/20 to-purple-500/10 shadow-lg shadow-violet-950/40 text-white"
                        : "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <Icon className={`h-4 w-4 ${isSelected ? "text-violet-300" : "text-slate-400"}`} />
                        <span>{area.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-violet-300" />}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {area.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transit Location Option */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Transit Horizon (Current City)</div>
                <div className="text-[11px] text-slate-400">
                  Calibrates the live sky transits to your current physical residence.
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentCitySame}
                  onChange={e => setCurrentCitySame(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-violet-500 focus:ring-0"
                />
                <span>Same as birth city</span>
              </label>
            </div>

            {!currentCitySame && (
              <div className="space-y-1.5 pt-1">
                <Input
                  placeholder="Enter current city (e.g. New York, London, Miami)"
                  value={formData.transitLocation || ""}
                  onChange={e => { setVerifiedTransitCity(null); setTransitCityError(""); setFormData(prev => ({ ...prev, transitLocation: e.target.value, transitLatitude: undefined, transitLongitude: undefined, transitTimezone: undefined })); }}
                  className="border-white/10 bg-black/40 text-slate-100 text-xs"
                />
                <Button type="button" variant="outline" disabled={resolvingTransitCity} onClick={() => void handleResolveTransitCity()}>{resolvingTransitCity ? "Resolving…" : "Verify current city coordinates"}</Button>
                {verifiedTransitCity === formData.transitLocation && <p className="text-xs text-emerald-300">Verified: {formData.transitLatitude?.toFixed(4)}, {formData.transitLongitude?.toFixed(4)} · {formData.transitTimezone}</p>}
                {transitCityError && <p className="text-xs text-rose-300">{transitCityError}</p>}
              </div>
            )}
          </div>



          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            >
              Back to Coordinates
            </Button>

            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isCalculating}
              className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 px-6 py-2.5 font-bold text-white shadow-xl shadow-cyan-950/40 hover:from-cyan-300 hover:to-purple-500"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Decoding Swiss Ephemeris...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 text-cyan-200 animate-pulse" />
                  <span>Calculate My Celestial Blueprint ✦</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (mode === "dialog") {
    return (
      <Dialog open={isOpen} onOpenChange={open => !open && onClose && onClose()}>
        <DialogContent className="max-w-2xl border-cyan-400/20 bg-slate-950/95 text-slate-100 backdrop-blur-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Compass className="h-4 w-4 text-cyan-300" />
              <span>Cosmic Natal Profile Configuration</span>
            </div>
            <DialogTitle className="font-serif text-2xl text-white">
              {currentProfile?.name ? `Update Profile: ${currentProfile.name}` : "Build Your Celestial Natal Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Anchor the complete astronomical method engine to your exact moment of birth.
            </DialogDescription>
          </DialogHeader>

          {formBody}
        </DialogContent>
      </Dialog>
    );
  }

  // Inline Hero Gate
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl sm:p-8">
      {/* Background celestial glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
              <span>Core Profile Onboarding · Step 1</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create Your Celestial Natal Profile First
            </h2>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Before the algorithms reveal your layered Celestial Blueprint, Synastry chemistry, or AI Master Interpreter readings, the engine must anchor to your unique birth coordinates.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onLoadSample}
              className="border-white/15 bg-white/5 text-xs text-cyan-200 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              <span>Quick Demo (Dallas 1986)</span>
            </Button>
          </div>
        </div>

        {formBody}
      </div>
    </div>
  );
}

/**
 * Active Profile Ribbon: Displays the user's computed cosmic identity (Name, Sun, Moon, Rising)
 * and provides a 1-tap "Edit Natal Chart" button so they can change their data whenever they want.
 */
interface ActiveProfileBarProps {
  profile: UserProfileData;
  chart: ChartResult | null;
  onEditProfile: () => void;
  onSwitchProfile: () => void;
}

export function ActiveProfileBar({
  profile,
  chart,
  onEditProfile,
  onSwitchProfile,
}: ActiveProfileBarProps) {
  // Extract Sun, Moon, Ascendant from chart if available
  const sunBody = chart?.movingBodies?.find(b => b.name === "Sun");
  const moonBody = chart?.movingBodies?.find(b => b.name === "Moon");
  const ascendant = chart?.ascendant;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-slate-950/90 via-cyan-950/20 to-slate-950/90 p-3.5 shadow-xl shadow-cyan-950/20 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {/* User Moniker */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-400/20 to-violet-500/30 text-cyan-200 font-bold text-xs">
            {profile.name.charAt(0).toUpperCase() || "✦"}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              Active Cosmic Profile
            </div>
            <div className="text-sm font-bold text-white leading-tight">
              {profile.name}
            </div>
          </div>
        </div>

        {/* Astro Trinity Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {sunBody && (
            <Badge className="border-amber-400/30 bg-amber-500/10 text-amber-200 gap-1 font-normal py-1">
              <span className="font-bold">☉ Sun:</span> {sunBody.display}
              {sunBody.overlay?.nakshatra ? ` · ${sunBody.overlay.nakshatra}` : ""}
            </Badge>
          )}

          {moonBody && (
            <Badge className="border-cyan-300/30 bg-cyan-500/10 text-cyan-200 gap-1 font-normal py-1">
              <span className="font-bold">☽ Moon:</span> {moonBody.display}
              {moonBody.overlay?.nakshatra ? ` · ${moonBody.overlay.nakshatra}` : ""}
            </Badge>
          )}

          {ascendant && (
            <Badge className="border-violet-300/30 bg-violet-500/10 text-violet-200 gap-1 font-normal py-1">
              <span className="font-bold">↑ Asc:</span> {ascendant.display}
            </Badge>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 pl-2">
            <MapPin className="h-3 w-3 text-slate-500" />
            <span>{profile.location.split(",")[0]}</span>
            <span>·</span>
            <span>{profile.date}</span>
            <span>·</span>
            <span>{profile.birthTimeUnknown ? "Noon Solar" : profile.time}</span>
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onEditProfile}
          className="border-cyan-400/30 bg-cyan-500/10 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 hover:text-white"
        >
          <Compass className="h-3.5 w-3.5 mr-1 text-cyan-300" />
          <span>Edit Natal Chart</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onSwitchProfile}
          className="text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          <span>Switch / New</span>
        </Button>
      </div>
    </div>
  );
}
