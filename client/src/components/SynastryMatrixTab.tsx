import React, { useState, useMemo } from "react";
import {
  Heart,
  Users,
  Sparkles,
  Flame,
  Shield,
  Brain,
  Anchor,
  Compass,
  ArrowRight,
  MessageSquare,
  Share2,
  Lock,
  Crown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  MapPin,
  Clock,
  ArrowLeftRight,
  UserPlus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useSovereignTier, SovereignTeaserLock } from "./SovereignTierModal";
import type { ChartResult } from "../../../server/astronomy";
import { computeSynastry, computeRelationshipCompatibility, computeExpressionReception, computeParentChildDynamic, type ParentChildDynamic, type SynastryAspect } from "@/lib/synastry-engine";
import { SynastryDualOrrery } from "./SynastryDualOrrery";
import type { LovedOneRecord, RelationshipRole } from "../../../shared/social";

interface SynastryMatrixTabProps {
  userChart: ChartResult | null;
  onAskMasterInterpreter?: (question: string) => void;
  onOpenShareModal?: () => void;
  className?: string;
}

// Popular city presets for fast 1-tap coordinate resolution
const CITY_PRESETS = [
  { label: "Dallas, TX", full: "Dallas, Texas, USA", lat: 32.7767, lng: -96.797, tz: "America/Chicago" },
  { label: "Los Angeles, CA", full: "Los Angeles, California, USA", lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles" },
  { label: "New York, NY", full: "New York, New York, USA", lat: 40.7128, lng: -74.006, tz: "America/New_York" },
  { label: "Chicago, IL", full: "Chicago, Illinois, USA", lat: 41.8781, lng: -87.6298, tz: "America/Chicago" },
  { label: "Atlanta, GA", full: "Atlanta, Georgia, USA", lat: 33.749, lng: -84.388, tz: "America/New_York" },
  { label: "Miami, FL", full: "Miami, Florida, USA", lat: 25.7617, lng: -80.1918, tz: "America/New_York" },
  { label: "Houston, TX", full: "Houston, Texas, USA", lat: 29.7604, lng: -95.3698, tz: "America/Chicago" },
  { label: "London, UK", full: "London, United Kingdom", lat: 51.5074, lng: -0.1278, tz: "Europe/London" },
  { label: "Paris, FR", full: "Paris, France", lat: 48.8566, lng: 2.3522, tz: "Europe/Paris" },
  { label: "Tokyo, JP", full: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo" },
];

export function SynastryMatrixTab({
  userChart,
  onAskMasterInterpreter,
  onOpenShareModal,
  className = "",
}: SynastryMatrixTabProps) {
  const utils = trpc.useUtils();
  const { isSovereign, openPaywall } = useSovereignTier();
  const lovedOnesQuery = trpc.social.listLovedOnes.useQuery();
  const savedLovedOnes = lovedOnesQuery.data || [];

  // Selected partner state
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("preset-jordan");
  const [isSwapped, setIsSwapped] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState({
    name: "Jordan (Partner)",
    relationship: "partner",
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles",
    date: "1988-06-15",
    time: "20:30",
  });

  // Modal State for adding a new person into Synastry
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [personForm, setPersonForm] = useState({
    name: "",
    relationship: "partner" as RelationshipRole,
    location: "Dallas, Texas, USA",
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
    date: "1993-08-14",
    time: "14:15",
    timeUnknown: false,
    notes: "",
  });
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citySearchError, setCitySearchError] = useState("");
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [saveToLovedOnes, setSaveToLovedOnes] = useState(true);

  // Geocode query for custom city lookup
  const geocodeLookup = trpc.hybrid.geocode.useQuery(
    { query: citySearchQuery },
    { enabled: false, retry: false }
  );

  // Save loved one mutation
  const saveLovedOneMutation = trpc.social.saveLovedOne.useMutation({
    onSuccess: () => {
      utils.social.listLovedOnes.invalidate();
    },
  });

  const handleResolveCity = async () => {
    if (!citySearchQuery.trim()) return;
    setCitySearchError("");
    setIsSearchingCity(true);
    try {
      const res = await geocodeLookup.refetch();
      if (res.data) {
        setPersonForm((prev) => ({
          ...prev,
          location: res.data.label,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          timezone: res.data.timezone,
        }));
      } else if (res.error) {
        setCitySearchError(res.error.message || "Location not found. Pick a preset below.");
      }
    } catch (err: any) {
      setCitySearchError(err?.message || "City geocoding service unavailable.");
    } finally {
      setIsSearchingCity(false);
    }
  };

  const handleSelectCityPreset = (preset: typeof CITY_PRESETS[0]) => {
    setPersonForm((prev) => ({
      ...prev,
      location: preset.full,
      latitude: preset.lat,
      longitude: preset.lng,
      timezone: preset.tz,
    }));
    setCitySearchQuery("");
    setCitySearchError("");
  };

  const handleAddPersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personForm.name.trim()) return;

    const chosenTime = personForm.timeUnknown ? "12:00" : (personForm.time || "12:00");
    const personName = personForm.name.trim();

    if (saveToLovedOnes) {
      try {
        const saved = await saveLovedOneMutation.mutateAsync({
          name: personName,
          relationship: personForm.relationship,
          location: personForm.location,
          latitude: personForm.latitude,
          longitude: personForm.longitude,
          timezone: personForm.timezone,
          date: personForm.date,
          time: chosenTime,
          notes: personForm.notes,
        });

        utils.social.listLovedOnes.invalidate();
        if (saved && saved.id) {
          setSelectedPartnerId(String(saved.id));
        }
      } catch (err) {
        console.error("Failed to save to database:", err);
      }
    } else {
      setSelectedPartnerId(`custom-${Date.now()}`);
    }

    setPartnerDetails({
      name: `${personName} (${personForm.relationship})`,
      relationship: personForm.relationship,
      location: personForm.location,
      latitude: personForm.latitude,
      longitude: personForm.longitude,
      timezone: personForm.timezone,
      date: personForm.date,
      time: chosenTime,
    });

    setIsAddPersonOpen(false);
  };

  const [aspectFilter, setAspectFilter] = useState<"all" | "harmony" | "tension" | "karmic">("all");
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>("communication");

  // Calculate partner chart
  const calculatePartnerMutation = trpc.hybrid.calculate.useMutation();
  const [partnerChart, setPartnerChart] = useState<ChartResult | null>(null);

  // Trigger calculation when partner details change
  React.useEffect(() => {
    setPartnerChart(null);
    calculatePartnerMutation.mutate(
      {
        location: partnerDetails.location,
        latitude: partnerDetails.latitude,
        longitude: partnerDetails.longitude,
        timezone: partnerDetails.timezone,
        date: partnerDetails.date,
        time: partnerDetails.time || "12:00",
        worldview: "agent",
        readingScope: "natal",
      },
      {
        onSuccess: (data) => {
          setPartnerChart(data);
        },
      }
    );
  }, [partnerDetails.date, partnerDetails.time, partnerDetails.location, partnerDetails.latitude, partnerDetails.longitude, partnerDetails.timezone]);

  // Handle partner selection
  const handleSelectPartner = (id: string) => {
    setSelectedPartnerId(id);
    if (id === "preset-jordan") {
      setPartnerDetails({
        name: "Jordan (Partner)",
        relationship: "partner",
        location: "Los Angeles, CA",
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: "America/Los_Angeles",
        date: "1988-06-15",
        time: "20:30",
      });
    } else if (id === "preset-amaree") {
      setPartnerDetails({
        name: "Amaree (Child / Family)",
        relationship: "child",
        location: "Dallas, Texas, USA",
        latitude: 32.7767,
        longitude: -96.797,
        timezone: "America/Chicago",
        date: "2012-05-18",
        time: "14:24",
      });
    } else {
      const match = savedLovedOnes.find((lo) => String(lo.id) === id);
      if (match) {
        setPartnerDetails({
          name: `${match.name} (${match.relationship})`,
          relationship: match.relationship,
          location: match.location,
          latitude: match.latitude,
          longitude: match.longitude,
          timezone: match.timezone,
          date: match.date,
          time: match.time || "12:00",
        });
      }
    }
  };

  // Use the shared 5° all-planet calculation engine. Nothing is scored before
  // two real charts exist, and all house overlays come from actual ascendants.
  const { aspects, scores, houseOverlays } = useMemo(
    () => computeSynastry(isSwapped ? partnerChart : userChart, isSwapped ? userChart : partnerChart),
    [userChart, partnerChart, isSwapped]
  );

  const relationshipCompatibility = useMemo(
    () => computeRelationshipCompatibility(aspects, partnerDetails.relationship as RelationshipRole),
    [aspects, partnerDetails.relationship]
  );

  // Explicit choice avoids guessing family identities from birth charts.
  const [familyPair, setFamilyPair] = useState<ParentChildDynamic>("father-son");
  const isParentChild = partnerDetails.relationship === "parent" || partnerDetails.relationship === "child";
  const familyDynamic = useMemo(
    () => isParentChild ? computeParentChildDynamic(aspects, familyPair) : null,
    [aspects, familyPair, isParentChild]
  );

  const expressionReception = useMemo(() => computeExpressionReception(aspects), [aspects]);

  // Filtered aspects
  const filteredAspects = useMemo(() => {
    if (aspectFilter === "all") return aspects;
    return aspects.filter((a) => a.type === aspectFilter);
  }, [aspects, aspectFilter]);

  const handleAskAboutBond = () => {
    if (!onAskMasterInterpreter || !userChart || !partnerChart) return;
    const query = `Please provide an in-depth synastry and relationship analysis between me (${userChart?.input.location || "my birth chart"}) and ${partnerDetails.name} (${partnerDetails.date} in ${partnerDetails.location}). The charts contain ${aspects.length} cross-aspects across eight configured aspect types within 5°. Key calculated aspects: ${aspects.slice(0,16).map(a=>`${a.planetA} ${a.aspect} ${a.planetB} (${a.orb}°)`).join("; ")}. Explain the mutual patterns, both people’s house placements, any tensions and practical ways to communicate, distinguishing symbolic possibility from established human facts.`;
    onAskMasterInterpreter(query);
  };

  return (
    <div className={`fg-synastry-deck space-y-8 ${className}`}>
      {/* Top Banner & Partner Selector */}
      <div className="rounded-3xl border border-rose-300/25 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-black/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-rose-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-300/40 bg-rose-500/20 shadow-md">
                <Heart className="h-4 w-4 text-rose-300" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-rose-300">
                Interactive Synastry & Chemistry Hub
              </span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
              The Celestial Relationship Observatory
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Overlay your exact natal coordinates onto your partner, date, friend, or family member. Calculate the actual planetary contacts and house placements of two people. The symbolic readings suggest possible dynamics; they do not determine personal compatibility or establish anyone's feelings.
            </p>
          </div>

          {/* Quick Partner Switcher */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400 pl-2">Compare With:</span>
            <button
              type="button"
              onClick={() => handleSelectPartner("preset-jordan")}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedPartnerId === "preset-jordan"
                  ? "bg-rose-500/30 text-rose-200 border border-rose-400/40 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Jordan (Partner)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPartner("preset-amaree")}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                selectedPartnerId === "preset-amaree"
                  ? "bg-rose-500/30 text-rose-200 border border-rose-400/40 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Amaree (Child)
            </button>

            {savedLovedOnes.map((lo) => (
              <button
                key={lo.id}
                type="button"
                onClick={() => handleSelectPartner(String(lo.id))}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  selectedPartnerId === String(lo.id)
                    ? "bg-rose-500/30 text-rose-200 border border-rose-400/40 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lo.name}
              </button>
            ))}

            {/* Prominent Add Person Button */}
            <button
              type="button"
              onClick={() => setIsAddPersonOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-400/60 bg-gradient-to-r from-rose-500/30 via-pink-500/25 to-purple-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-200 hover:from-rose-500/50 hover:to-purple-500/50 hover:text-white transition shadow-lg shadow-rose-950/40 active:scale-95"
            >
              <UserPlus className="h-3.5 w-3.5 text-rose-300 animate-pulse" />
              <span>+ Add Person</span>
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Person A: {isSwapped ? partnerDetails.name : (userChart ? (userChart.input.location || "You") : "Natal chart not yet calculated")}
            </span>
            
            <button
              type="button"
              onClick={() => setIsSwapped(!isSwapped)}
              title="Click to Swap Person A and Person B"
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/15 transition active:scale-95"
            >
              <ArrowLeftRight className="h-3 w-3 text-rose-300" />
              <span>Swap</span>
            </button>

            <span className="flex items-center gap-1.5 font-medium text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Person B: {isSwapped ? (userChart ? (userChart.input.location || "You") : "Dallas 1986 Sample") : `${partnerDetails.name} (${partnerDetails.date})`}
            </span>

            <button
              type="button"
              onClick={() => setIsAddPersonOpen(true)}
              className="text-[11px] text-rose-400 hover:text-rose-200 underline underline-offset-2 ml-1"
            >
              (Change / Add New)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleAskAboutBond}
              className="h-9 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-rose-950/30 hover:from-rose-400 hover:to-purple-500 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask Master Interpreter About Us</span>
            </Button>
            {onOpenShareModal && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenShareModal}
                className="h-9 rounded-xl border-white/15 bg-white/5 px-3 text-xs text-slate-200 hover:bg-white/10 gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5 text-rose-300" />
                <span>Export Duo Card</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="fg-module-banner">
        <div className="fg-module-eyebrow">02 / THE CELESTIAL INTERSECTION · TWO CALCULATED NATAL SKIES</div>
        <h3 className="fg-module-title">Two lives. One shared sky.</h3>
        <p className="fg-module-desc">All available planets compared across both natal charts using eight aspects and a five-degree orb. House overlays are calculated in both directions using actual Ascendants. The relationship indices describe the observed aspect mix, not emotional certainty or compatibility probabilities.</p>
        {!userChart && <p className="mt-3 text-amber-200 text-sm" role="status">Calculate your natal chart first to activate the synastry evidence.</p>}
        {calculatePartnerMutation.isPending && <p className="mt-3 text-cyan-200 text-sm" role="status">Calculating the second natal chart…</p>}
        {calculatePartnerMutation.isError && <p className="mt-3 text-rose-200 text-sm" role="alert">Could not calculate the second chart: {calculatePartnerMutation.error.message}</p>}
        {userChart && partnerChart && aspects.length === 0 && <p className="mt-3 text-slate-300 text-sm">No configured cross-chart contacts were found within 5°. A zero index here means no testimony in scope, not an incompatible partnership.</p>}
      </div>

      {userChart && partnerChart && <SynastryDualOrrery
        first={isSwapped ? partnerChart : userChart}
        second={isSwapped ? userChart : partnerChart}
        firstName={isSwapped ? partnerDetails.name : "Your birth chart"}
        secondName={isSwapped ? "Your birth chart" : partnerDetails.name}
      />}

      {/* Relationship-specific compatibility is grounded in cross-chart evidence. */}
      <Card className="border-cyan-300/20 bg-slate-950/70 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg text-cyan-200">{relationshipCompatibility.label} · Compatibility dynamics</CardTitle>
          <p className="text-xs text-slate-300">{relationshipCompatibility.summary}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {relationshipCompatibility.dimensions.map(d => (
              <div key={d.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex justify-between gap-2 text-sm"><span>{d.label}</span>
                  <span className="font-semibold">{d.score === null ? "No evidence" : d.score + "% flow"}</span></div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-400" style={{width: (d.score ?? 0) + "%"}} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{d.contacts} supporting cross-chart contacts</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-xs leading-relaxed">
            <div><strong className="text-emerald-300">Where you flow</strong>
              <p className="mt-1 text-slate-300">{relationshipCompatibility.strengths.map(a => a.planetA+" "+a.aspect+" "+a.planetB+" ("+a.orb+"°)").join("; ") || "No close harmonious contacts in scope."}</p>
            </div>
            <div><strong className="text-amber-300">Where to work together</strong>
              <p className="mt-1 text-slate-300">{relationshipCompatibility.challenges.map(a => a.planetA+" "+a.aspect+" "+a.planetB+" ("+a.orb+"°)").join("; ") || "No close friction contacts in scope."}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">These scores describe weighted astrological aspect balance in this relationship, not a measurement of feelings, safety, or real-world relationship success.</p>
        </CardContent>
      </Card>

      <Card className="border-violet-300/20 bg-slate-950/70 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg text-violet-200">Expression vs. Reception · Both Directions</CardTitle>
          <p className="text-xs text-slate-300">How one person's communication and self-expression symbolically meet the other's emotional and mental reception. The direction matters.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {expressionReception.map(d => (
            <div key={d.direction} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <h4 className="font-semibold text-violet-200">{d.sender} expresses → {d.receiver} receives</h4>
              <p className="text-sm">{d.flowPercent === null ? "Insufficient close contacts" : d.flowPercent + "% weighted harmony"}</p>
              <p className="text-xs text-slate-300">{d.reading}</p>
              <p className="text-xs text-slate-400">{d.expression.length} relevant cross-chart contacts</p>
              {d.expression.slice(0,5).map(a => (
                <p key={a.planetA+"-"+a.planetB+"-"+a.aspect} className="text-xs text-slate-300">
                  {a.planetA} {a.aspect} {a.planetB} · {a.orb}° · {a.type === "harmony" ? "flow" : "friction"}
                </p>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {isParentChild && familyDynamic && (
        <Card className="border-amber-300/20 bg-slate-950/70 text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-amber-200">Parent–Child Relationship Patterns</CardTitle>
            <p className="text-xs text-slate-300">Select the family pairing explicitly. Charts do not determine a person's family role or identity.</p>
            <select aria-label="Family relationship pairing" value={familyPair}
              onChange={e => setFamilyPair(e.target.value as ParentChildDynamic)}
              className="mt-2 w-full rounded-lg border border-white/20 bg-slate-900 p-2 text-sm text-white">
              <option value="father-son">Father ↔ Son</option>
              <option value="mother-son">Mother ↔ Son</option>
              <option value="mother-daughter">Mother ↔ Daughter</option>
              <option value="father-daughter">Father ↔ Daughter</option>
            </select>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">{familyDynamic.summary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {familyDynamic.dimensions.map(d => (
                <div key={d.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex justify-between gap-2 text-sm">
                    <span>{d.label}</span>
                    <span>{d.score === null ? "No evidence" : d.score + "% flow"}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{d.contacts} cross-chart contacts</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">The expression–reception panel below compares both directions. Neither panel diagnoses competition, jealousy, or anyone's intentions.</p>
          </CardContent>
        </Card>
      )}

      {/* Symbolic cross-aspect balance — never a measure of human compatibility. */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Core Archetype & Overall Compatibility */}
        <Card className="lg:col-span-5 border-rose-300/20 bg-gradient-to-b from-rose-950/20 via-black/40 to-black/60 text-slate-100 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">
                Relationship Archetype
              </span>
              <Badge variant="outline" className="border-rose-400/40 bg-rose-400/10 text-rose-200 text-xs">
                {scores.overall} / 100 Aspect Balance
              </Badge>
            </div>
            <CardTitle className="font-serif text-2xl text-white mt-1">
              {scores.archetype}
            </CardTitle>
            <p className="text-xs text-rose-200/80 leading-5">
              {scores.archetypeSubtitle}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Visual Overall Ring / Progress */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">Calculated aspect balance (not relationship odds)</div>
                <div className="text-3xl font-extrabold text-white mt-0.5">
                  {scores.overall}<span className="text-lg font-normal text-rose-400"> / 100</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Symbolic evidence · Not a relationship verdict
                </p>
              </div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-rose-500/20 bg-rose-500/10 shadow-inner">
                <Heart className="h-8 w-8 text-rose-400 animate-pulse" />
              </div>
            </div>

            {/* Dimensional Pillars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <Flame className="h-3.5 w-3.5" /> Romantic aspect themes
                  </span>
                  <span className="text-white font-bold">{scores.romantic}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                    style={{ width: `${scores.romantic}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Shield className="h-3.5 w-3.5" /> Emotional aspect themes
                  </span>
                  <span className="text-white font-bold">{scores.emotional}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${scores.emotional}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <Brain className="h-3.5 w-3.5" /> Intellectual aspect themes
                  </span>
                  <span className="text-white font-bold">{scores.intellectual}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
                    style={{ width: `${scores.intellectual}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Anchor className="h-3.5 w-3.5" /> Stability aspect themes
                  </span>
                  <span className="text-white font-bold">{scores.stability}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    style={{ width: `${scores.stability}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" /> Growth aspect themes
                  </span>
                  <span className="text-white font-bold">{scores.soulGrowth}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: `${scores.soulGrowth}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* House Overlays & Planetary Cross-Aspects Grid */}
        <div className="lg:col-span-7 space-y-6">
          {/* House Overlays Table */}
          <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-xl backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Compass className="h-4 w-4 text-purple-300" />
                House Overlays · Where You Activate Each Other
              </CardTitle>
              <p className="text-xs text-slate-400">
                When your natal planets fall into their houses, you trigger specific psychological life chapters for them.
              </p>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {houseOverlays.map((overlay, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs flex items-start gap-3 hover:bg-white/[0.04] transition"
                >
                  <span className="rounded-lg bg-purple-500/20 px-2 py-1 font-mono font-bold text-purple-200 shrink-0">
                    House {overlay.inHouse}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{overlay.planet}</div>
                    <div className="text-slate-300 mt-0.5 leading-5">{overlay.meaning}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actionable Relationship Playbook */}
          <Card className="border-cyan-300/20 bg-cyan-950/15 text-slate-100 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-cyan-200">
                <MessageSquare className="h-4 w-4 text-cyan-300" />
                The Duo Playbook · Actionable Communication Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Accordion Item: Communication */}
              <div className="rounded-xl border border-cyan-300/20 bg-cyan-950/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPlaybook(expandedPlaybook === "communication" ? null : "communication")
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-cyan-300/10 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    How You Communicate vs How They Hear You
                  </span>
                  {expandedPlaybook === "communication" ? (
                    <ChevronUp className="h-4 w-4 text-cyan-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-cyan-300" />
                  )}
                </button>
                {expandedPlaybook === "communication" && (
                  <div className="p-3.5 pt-0 text-xs text-slate-300 space-y-2 border-t border-cyan-300/15 leading-relaxed">
                    <p>
                      <strong>Your Style:</strong> {aspects.filter(a => a.planetA === "Mercury" || a.planetB === "Mercury").map(a => a.planetA + " " + a.aspect + " " + a.planetB + " (" + a.orb + "°)").slice(0,5).join("; ") || "No Mercury cross-aspects were found within the 5° orb."}
                    </p>
                    <p>
                      <strong>Their Reception:</strong> The Mercury and Moon connections are symbolic conversation and emotional-style prompts, not evidence of how either person actually thinks or feels. Ask each other what support means in practice.
                    </p>
                    <p className="rounded-lg bg-cyan-400/10 p-2 text-cyan-200 font-medium">
                      💡 <strong>Golden Rule:</strong> Spend 3 minutes validating their emotional reality before offering a tactical fix.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion Item: De-escalation */}
              <div className="rounded-xl border border-rose-300/20 bg-rose-950/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPlaybook(expandedPlaybook === "conflict" ? null : "conflict")
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-rose-300/10 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    The Friction De-escalation Protocol (When Arguments Flare)
                  </span>
                  {expandedPlaybook === "conflict" ? (
                    <ChevronUp className="h-4 w-4 text-rose-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-rose-300" />
                  )}
                </button>
                {expandedPlaybook === "conflict" && (
                  <div className="p-3.5 pt-0 text-xs text-slate-300 space-y-2 border-t border-rose-300/15 leading-relaxed">
                    <p>
                      <strong>Trigger Point:</strong> {aspects.filter(a => a.type === "tension").slice(0,5).map(a => a.planetA + " " + a.aspect + " " + a.planetB + " (" + a.orb + "°)").join("; ") || "There are no close tension aspects in the configured 5° scope."} These symbolic contacts do not establish anyone's actual reaction patterns.
                    </p>
                    <p className="rounded-lg bg-rose-400/10 p-2 text-rose-200 font-medium">
                      🛡️ <strong>De-escalation Script:</strong> Say: <em>&ldquo;I am completely on your team and not leaving. My system needs 20 minutes to reset so I can give you my best presence, and then we will finish this together.&rdquo;</em>
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion Item: Shared Superpower */}
              <div className="rounded-xl border border-amber-300/20 bg-amber-950/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPlaybook(expandedPlaybook === "superpower" ? null : "superpower")
                  }
                  className="w-full p-3.5 flex items-center justify-between text-left text-xs font-semibold text-white hover:bg-amber-300/10 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Your Shared Superpower (What You Unlock Together)
                  </span>
                  {expandedPlaybook === "superpower" ? (
                    <ChevronUp className="h-4 w-4 text-amber-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-amber-300" />
                  )}
                </button>
                {expandedPlaybook === "superpower" && (
                  <div className="p-3.5 pt-0 text-xs text-slate-300 space-y-2 border-t border-amber-300/15 leading-relaxed">
                    <p>
                      {aspects.filter(a => a.type === "harmony").slice(0,5).map(a => a.planetA + " " + a.aspect + " " + a.planetB + " (" + a.orb + "°)").join("; ") || "No close harmony aspects appear in the configured 5° scope."} Use any supportive themes to discuss strengths you can verify together, not to assume either person's traits.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Planetary Aspects Grid */}
      <Card className="border-white/10 bg-white/[0.035] text-slate-100 shadow-xl backdrop-blur-md">
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-xl text-white">
                Planetary Aspect Cross-Grid
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Eight cross-chart aspect types calculated within a 5° orb; minor aspects carry half weight.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1">
              <button
                type="button"
                onClick={() => setAspectFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  aspectFilter === "all" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                All ({aspects.length})
              </button>
              <button
                type="button"
                onClick={() => setAspectFilter("harmony")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  aspectFilter === "harmony"
                    ? "bg-emerald-500/30 text-emerald-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Harmonious
              </button>
              <button
                type="button"
                onClick={() => setAspectFilter("tension")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  aspectFilter === "tension"
                    ? "bg-rose-500/30 text-rose-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Growth Friction
              </button>
              <button
                type="button"
                onClick={() => setAspectFilter("karmic")}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  aspectFilter === "karmic"
                    ? "bg-amber-500/30 text-amber-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Karmic / Mirror
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {filteredAspects.map((asp, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.025] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                        asp.type === "harmony"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : asp.type === "tension"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      <span>{asp.symbol}</span>
                      <span>{asp.aspect}</span>
                    </span>
                    <span className="font-semibold text-white text-sm">{asp.title}</span>
                    <Badge variant="secondary" className="bg-white/10 text-[10px] text-slate-300">
                      Orb {asp.orb}°
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-5">{asp.description}</p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (onAskMasterInterpreter) {
                      onAskMasterInterpreter(
                        `Explain the exact synastry impact of ${asp.planetA} ${asp.aspect} ${asp.planetB} (orb ${asp.orb}°) between me and ${partnerDetails.name}. How does this show up day-to-day?`
                      );
                    }
                  }}
                  className="shrink-0 text-xs text-cyan-300 hover:text-white hover:bg-cyan-500/20 gap-1"
                >
                  <span>Deconstruct</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {filteredAspects.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No aspects match the selected filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Planned extension: visually explicit, not a calculated composite. */}
      <SovereignTeaserLock
        title="Composite Midpoint Chart & Davison Time-Space Matrix"
        description="Composite midpoint and Davison time-space charts are proposed extensions. This panel is a preview, not a functioning calculation or verified prediction."
        featureKey="composite-synastry"
      />

      {/* Add Person to Synastry Dialog */}
      <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
        <DialogContent className="max-w-lg border-rose-300/30 bg-[#0d101d] text-slate-100 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl shadow-2xl shadow-rose-950/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-300/40 bg-rose-500/20 text-rose-300">
                <UserPlus className="h-4 w-4" />
              </span>
              <DialogTitle className="font-serif text-2xl text-white">
                Add Person to Compare
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-300 leading-relaxed">
              Enter their birth details to generate full dual-wheel synastry, cross-aspect mathematics, chemistry scores, and an actionable relationship playbook.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPersonSubmit} className="space-y-4 mt-2">
            {/* Name & Relationship */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Name / Nickname *</Label>
                <Input
                  required
                  placeholder="e.g. Maya, Marcus, Mom"
                  value={personForm.name}
                  onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                  className="h-10 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-rose-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Connection / Dynamic</Label>
                <select
                  value={personForm.relationship}
                  onChange={(e) => setPersonForm({ ...personForm, relationship: e.target.value as RelationshipRole })}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#161a2e] px-3 text-xs text-white focus:border-rose-400 focus:outline-none"
                >
                  <option value="partner">Partner / Date / Crush</option>
                  <option value="friend">Best Friend</option>
                  <option value="child">Child / Family</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="colleague">Colleague / Work</option>
                  <option value="mentor">Mentor / Guide</option>
                </select>
              </div>
            </div>

            {/* Birth Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Birth Date *</Label>
                <div className="relative">
                  <Input
                    type="date"
                    required
                    value={personForm.date}
                    onChange={(e) => setPersonForm({ ...personForm, date: e.target.value })}
                    className="h-10 rounded-xl border-white/10 bg-white/5 text-white focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-300">Birth Time</Label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={personForm.timeUnknown}
                      onChange={(e) => setPersonForm({ ...personForm, timeUnknown: e.target.checked })}
                      className="rounded border-white/20 bg-black/40 text-rose-500 focus:ring-0"
                    />
                    <span>Time unknown</span>
                  </label>
                </div>
                <Input
                  type="time"
                  disabled={personForm.timeUnknown}
                  value={personForm.timeUnknown ? "12:00" : personForm.time}
                  onChange={(e) => setPersonForm({ ...personForm, time: e.target.value })}
                  className="h-10 rounded-xl border-white/10 bg-white/5 text-white disabled:opacity-50 focus:border-rose-400"
                />
              </div>
            </div>

            {/* Birth Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-300">Birth City / Location *</Label>
                <span className="text-[11px] text-cyan-300 truncate max-w-[220px]">
                  {personForm.location}
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Search city (e.g. Austin, Toronto, Seattle)"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleResolveCity();
                    }
                  }}
                  className="h-9 rounded-xl border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500 focus:border-rose-400"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResolveCity}
                  disabled={isSearchingCity || !citySearchQuery.trim()}
                  className="h-9 shrink-0 rounded-xl border-white/15 bg-white/5 px-3 text-xs text-slate-200 hover:bg-white/10"
                >
                  {isSearchingCity ? "Locating..." : "Locate"}
                </Button>
              </div>

              {citySearchError && (
                <p className="text-[11px] text-rose-400">{citySearchError}</p>
              )}

              {/* Fast City Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Quick Select Major City:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CITY_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectCityPreset(preset)}
                      className={`rounded-lg px-2 py-1 text-[11px] transition ${
                        personForm.location === preset.full
                          ? "bg-rose-500/30 text-rose-200 border border-rose-400/50 font-semibold"
                          : "border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Notes & Persistence Toggle */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToLovedOnes}
                  onChange={(e) => setSaveToLovedOnes(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-rose-500 focus:ring-0"
                />
                <span>Save to my Loved Ones Circles (track transit check-ins & relationship alerts)</span>
              </label>

              <Input
                placeholder="Optional notes (e.g. First met in college, Scorpio rising)"
                value={personForm.notes}
                onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                className="h-9 rounded-xl border-white/10 bg-white/5 text-xs text-white placeholder:text-slate-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddPersonOpen(false)}
                className="rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!personForm.name.trim()}
                className="rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 px-5 text-xs font-semibold text-white shadow-lg shadow-rose-950/40 hover:from-rose-400 hover:to-purple-500"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                <span>Calculate Duo Synastry</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
