import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useProfileSession } from "@/contexts/ProfileSessionContext";

export function useTransitGPS() {
  const { profile, updateTransitLocation } = useProfileSession();
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const activeTransitCity = profile?.transitLocation || profile?.location || "Unset";
  const isUsingCustomTransit = Boolean(profile?.transitLocation && profile.transitLocation !== profile.location);

  const locateCurrentSky = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setGpsError("Geolocation is not supported");
      return null;
    }

    setIsLocating(true);
    setGpsError(null);

    return new Promise<{ label: string; latitude: number; longitude: number; timezone: string } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            toast.loading("Resolving your physical sky coordinates…", { id: "gps-locate" });
            const geo = await utils.hybrid.reverseGeocode.fetch({ latitude, longitude });
            toast.success(`Active Sky set to ${geo.label}`, { id: "gps-locate" });
            
            updateTransitLocation({
              transitLocation: geo.label,
              transitLatitude: geo.latitude,
              transitLongitude: geo.longitude,
              transitTimezone: geo.timezone,
            });
            setIsLocating(false);
            resolve(geo);
          } catch (err) {
            console.warn("Reverse geocode fallback to coords:", err);
            const fallback = {
              label: `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
              latitude,
              longitude,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
            };
            updateTransitLocation({
              transitLocation: fallback.label,
              transitLatitude: fallback.latitude,
              transitLongitude: fallback.longitude,
              transitTimezone: fallback.timezone,
            });
            toast.success(`Active Sky set to current GPS coordinates`, { id: "gps-locate" });
            setIsLocating(false);
            resolve(fallback);
          }
        },
        (error) => {
          setIsLocating(false);
          let msg = "Could not access current location.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location access was denied. You can search your city manually below.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = "Current GPS position is unavailable. Please enter your city manually.";
          } else if (error.code === error.TIMEOUT) {
            msg = "Location request timed out. Please try again or search your city.";
          }
          setGpsError(msg);
          toast.error(msg, { id: "gps-locate" });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  }, [utils, updateTransitLocation]);

  const setManualTransitCity = useCallback((city: { label: string; latitude: number; longitude: number; timezone: string }) => {
    updateTransitLocation({
      transitLocation: city.label,
      transitLatitude: city.latitude,
      transitLongitude: city.longitude,
      transitTimezone: city.timezone,
    });
    toast.success(`Active Sky location updated to ${city.label}`);
  }, [updateTransitLocation]);

  return {
    isLocating,
    gpsError,
    activeTransitCity,
    isUsingCustomTransit,
    locateCurrentSky,
    setManualTransitCity,
  };
}
