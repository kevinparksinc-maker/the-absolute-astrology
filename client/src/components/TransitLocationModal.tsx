import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useTransitGPS } from "@/hooks/useTransitGPS";
import { useProfileSession } from "@/contexts/ProfileSessionContext";
import { trpc } from "@/lib/trpc";
import { CITY_PRESETS } from "./NatalProfileBuilder";
import { toast } from "sonner";

interface TransitLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransitLocationModal({ open, onOpenChange }: TransitLocationModalProps) {
  const { profile } = useProfileSession();
  const { isLocating, gpsError, activeTransitCity, locateCurrentSky, setManualTransitCity } = useTransitGPS();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ label: string; latitude: number; longitude: number; timezone: string }>>([]);
  const utils = trpc.useUtils();

  const birthCity = profile?.location || "Unset";
  const isBirthCitySameAsTransit = profile?.location && (!profile?.transitLocation || profile.transitLocation === profile.location);

  const handleUseGPS = async () => {
    const result = await locateCurrentSky();
    if (result) {
      onOpenChange(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await utils.hybrid.geocode.fetch({ query: searchQuery.trim() });
      if (res) {
        setSearchResults([res]);
      } else {
        setSearchResults([]);
        toast.error("No matching location found. Please try another city name.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Location search failed. Please check the spelling.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCity = (city: { label: string; latitude: number; longitude: number; timezone: string }) => {
    setManualTransitCity(city);
    onOpenChange(false);
  };

  const handleResetToBirthCity = () => {
    if (!profile) return;
    setManualTransitCity({
      label: profile.location,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-cyan-300/30 bg-[#091122]/95 text-slate-100 backdrop-blur-xl shadow-[0_0_50px_rgba(83,244,255,0.15)] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-cyan-300 mb-1">
            <Navigation className="h-5 w-5 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Active Sky Alignment</span>
          </div>
          <DialogTitle className="font-serif text-2xl text-white">Your Current Transit Location</DialogTitle>
          <DialogDescription className="text-xs text-slate-300 leading-relaxed">
            Your live energy read, planetary hours, and transit houses depend on your physical position on Earth right now under the firmament.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Current Status Box */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Current Reading Location</span>
                <p className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-4 w-4 text-cyan-300 shrink-0" />
                  <span className="truncate">{activeTransitCity}</span>
                </p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${isBirthCitySameAsTransit ? "bg-amber-400/10 text-amber-200 border-amber-300/30" : "bg-emerald-400/10 text-emerald-200 border-emerald-300/30"}`}>
                {isBirthCitySameAsTransit ? "Using Birth City" : "Current Physical Sky"}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-white/5 pt-2 flex justify-between">
              <span>Birth City: <strong className="text-slate-300">{birthCity}</strong></span>
              {!isBirthCitySameAsTransit && (
                <button
                  type="button"
                  onClick={handleResetToBirthCity}
                  className="text-cyan-300 hover:underline text-[11px]"
                >
                  Reset to birth city
                </button>
              )}
            </div>
          </div>

          {/* Primary Action: GPS One-Tap */}
          <Button
            type="button"
            onClick={handleUseGPS}
            disabled={isLocating}
            className="w-full h-13 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-[0_0_24px_rgba(83,244,255,0.25)] flex items-center justify-center gap-2.5 transition-all text-sm"
          >
            {isLocating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span>Acquiring GPS Sky Coordinates…</span>
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5 text-white" />
                <span>Use My Current Location (GPS)</span>
              </>
            )}
          </Button>

          {gpsError && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-2.5 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Secondary Action: City Search */}
          <div className="relative pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-300">Or search your current city:</span>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Los Angeles, London, Tokyo…"
                  className="pl-9 h-11 bg-white/[0.05] border-white/15 text-white placeholder:text-slate-500 rounded-xl text-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                variant="outline"
                className="h-11 px-4 border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 rounded-xl shrink-0"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
              </Button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1.5 rounded-xl border border-cyan-400/30 bg-cyan-950/40 p-2">
                <span className="text-[10px] uppercase tracking-wider text-cyan-300 px-2 font-semibold">Matched Location</span>
                {searchResults.map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-cyan-400/20 text-xs text-white flex items-center justify-between transition-colors"
                  >
                    <span className="truncate font-medium">{city.label}</span>
                    <span className="text-[10px] text-cyan-300 shrink-0 ml-2">Select →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">Quick Cities:</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {CITY_PRESETS.map((city) => (
                <button
                  key={city.label}
                  type="button"
                  onClick={() => handleSelectCity({
                    label: city.full,
                    latitude: city.lat,
                    longitude: city.lng,
                    timezone: city.tz,
                  })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${activeTransitCity.includes(city.label.split(",")[0]) ? "bg-cyan-400/20 text-cyan-200 border-cyan-400/40" : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10"}`}
                >
                  {city.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
