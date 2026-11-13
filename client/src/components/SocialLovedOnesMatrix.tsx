import React, { useState, useEffect } from "react";
import {
  Users,
  Heart,
  AlertTriangle,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Compass,
  ArrowRight,
  ShieldAlert,
  Sun,
  Moon,
  MessageSquare,
  Activity,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { CosmicShareCard } from "./CosmicShareCard";
import type { ChartResult } from "../../../server/astronomy";
import type {
  LovedOneRecord,
  RelationshipRole,
  LovedOneCheckInStatus,
  SystemIntersectAnalysis,
} from "../../../shared/social";

interface SocialLovedOnesMatrixProps {
  userChart?: ChartResult | null;
  onAskMasterInterpreter?: (question: string) => void;
  className?: string;
}

const RELATIONSHIP_LABELS: Record<RelationshipRole, string> = {
  child: "Child",
  partner: "Partner",
  parent: "Parent",
  sibling: "Sibling",
  friend: "Friend",
  mentor: "Mentor",
  colleague: "Colleague",
};

export function SocialLovedOnesMatrix({
  userChart,
  onAskMasterInterpreter,
  className = "",
}: SocialLovedOnesMatrixProps) {
  const [selectedLovedOne, setSelectedLovedOne] = useState<LovedOneRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Form state for adding loved ones
  const [formData, setFormData] = useState({
    name: "",
    relationship: "child" as RelationshipRole,
    location: "Dallas, Texas, USA",
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
    date: "2012-05-18",
    time: "14:24",
    notes: "",
  });

  const utils = trpc.useUtils();
  const lovedOnesQuery = trpc.social.listLovedOnes.useQuery();
  const saveMutation = trpc.social.saveLovedOne.useMutation({
    onSuccess: () => {
      utils.social.listLovedOnes.invalidate();
      setIsAddModalOpen(false);
    },
  });
  const deleteMutation = trpc.social.deleteLovedOne.useMutation({
    onSuccess: () => {
      utils.social.listLovedOnes.invalidate();
      if (selectedLovedOne) setSelectedLovedOne(null);
    },
  });

  // Automatically select the first loved one (e.g. Amaree) on load
  const lovedOnes = lovedOnesQuery.data || [];
  useEffect(() => {
    if (lovedOnes.length > 0 && !selectedLovedOne) {
      setSelectedLovedOne(lovedOnes[0]);
    }
  }, [lovedOnes, selectedLovedOne]);

  // Query live check-in transit status for selected loved one
  const checkInQuery = trpc.social.checkInStatus.useMutation();
  const [activeCheckInStatus, setActiveCheckInStatus] = useState<LovedOneCheckInStatus | null>(null);
  const [lovedOneChart, setLovedOneChart] = useState<ChartResult | null>(null);

  // Query synastry intersect when both charts are available
  const intersectQuery = trpc.social.systemIntersect.useMutation();
  const [activeIntersect, setActiveIntersect] = useState<SystemIntersectAnalysis | null>(null);

  // When selected loved one changes, calculate their check-in status
  useEffect(() => {
    if (selectedLovedOne) {
      checkInQuery.mutate(
        {
          name: selectedLovedOne.name,
          relationship: selectedLovedOne.relationship,
          location: selectedLovedOne.location,
          latitude: selectedLovedOne.latitude,
          longitude: selectedLovedOne.longitude,
          timezone: selectedLovedOne.timezone,
          date: selectedLovedOne.date,
          time: selectedLovedOne.time,
        },
        {
          onSuccess: data => {
            setActiveCheckInStatus(data.status);
            setLovedOneChart(data.chart);

            // If user chart is calculated, run the System Intersect cross-examination
            if (userChart) {
              intersectQuery.mutate(
                {
                  userChart,
                  targetChart: data.chart,
                },
                {
                  onSuccess: intersectData => {
                    setActiveIntersect(intersectData);
                  },
                }
              );
            }
          },
        }
      );
    }
  }, [selectedLovedOne, userChart]);

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200/20 bg-gradient-to-r from-cyan-950/40 via-slate-950/60 to-violet-950/40 p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Module B & C · Connection Layer
            </span>
            <Badge variant="outline" className="border-cyan-300/30 text-cyan-200 text-[10px]">
              System Intersect & Empathy Loop
            </Badge>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            Loved Ones & Social Optimization Matrix
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            Cross-examine natal data frameworks with family and friends. Track real-time daily energetic volatility spikes to know exactly when and how to show up for the people you care about.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-semibold hover:from-cyan-300 hover:to-cyan-200"
          >
            <Plus className="h-4 w-4" /> Add Loved One
          </Button>
        </div>
      </div>

      {/* Pinned Loved Ones Carousel / Cards */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {lovedOnes.map(lovedOne => {
          const isSelected = selectedLovedOne?.id === lovedOne.id;
          const isAmaree = lovedOne.name.toLowerCase().includes("amaree");

          return (
            <div
              key={lovedOne.id}
              onClick={() => setSelectedLovedOne(lovedOne)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                isSelected
                  ? "border-cyan-400/60 bg-gradient-to-br from-cyan-950/60 to-slate-950/80 shadow-lg shadow-cyan-950/40 scale-[1.02]"
                  : "border-white/10 bg-black/25 hover:border-cyan-200/30 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-200 font-serif font-bold text-base">
                    {lovedOne.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-sm">{lovedOne.name}</span>
                      {isAmaree && (
                        <span className="text-[10px] text-amber-300 bg-amber-400/15 border border-amber-300/30 rounded px-1.5 py-0.2">
                          Son
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {RELATIONSHIP_LABELS[lovedOne.relationship] || "Family"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              </div>

              <div className="mt-3 border-t border-white/5 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{lovedOne.location.split(",")[0]}</span>
                <span className="font-mono text-cyan-200/70">{lovedOne.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Loved One Deep Diagnostic */}
      {selectedLovedOne && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Module C: Predictive Loved One Check-In Loop (Left / Top: 7 cols) */}
          <div className="space-y-5 lg:col-span-7">
            {/* Systemic Pressure Alert Box */}
            <Card className="border-cyan-200/20 bg-gradient-to-br from-slate-950/90 via-cyan-950/20 to-slate-950/90 text-slate-100 shadow-2xl">
              <CardHeader className="border-b border-white/10 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-cyan-300" />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                        Predictive Care Engine · Real-Time Transits
                      </span>
                    </div>
                    <CardTitle className="mt-1 font-serif text-xl text-white">
                      {selectedLovedOne.name}'s Energetic Status Today
                    </CardTitle>
                  </div>

                  {activeCheckInStatus && (
                    <Badge
                      className={`text-xs capitalize font-semibold px-2.5 py-1 ${
                        activeCheckInStatus.pressureLevel === "high" || activeCheckInStatus.pressureLevel === "severe"
                          ? "bg-rose-500/20 border-rose-400/40 text-rose-200 animate-pulse"
                          : activeCheckInStatus.pressureLevel === "moderate"
                          ? "bg-amber-500/20 border-amber-400/40 text-amber-200"
                          : "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                      }`}
                    >
                      {activeCheckInStatus.pressureLevel} Systemic Pressure
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {checkInQuery.isPending ? (
                  <div className="flex items-center justify-center p-8 text-xs text-slate-400">
                    <Activity className="h-4 w-4 animate-spin mr-2 text-cyan-300" />
                    Scanning today's transits against {selectedLovedOne.name}'s birth grid...
                  </div>
                ) : activeCheckInStatus ? (
                  <>
                    {/* Mechanics Diagnostic */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-cyan-300" />
                        <span>Astronomical Trigger Mechanism</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-200">
                        {activeCheckInStatus.mechanicsSummary}
                      </p>
                      {activeCheckInStatus.activeSignatures.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {activeCheckInStatus.activeSignatures.map((sig, idx) => (
                            <span
                              key={idx}
                              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-mono text-cyan-100"
                            >
                              {sig}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actionable Empathy Prompts */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-950/20 p-3.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                          <Check className="h-3 w-3" /> How To Show Up Today
                        </span>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                          {activeCheckInStatus.actionableEmpathyPrompt.howToShowUp}
                        </p>
                      </div>

                      <div className="rounded-xl border border-rose-400/20 bg-rose-950/20 p-3.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> What To Avoid
                        </span>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                          {activeCheckInStatus.actionableEmpathyPrompt.whatToAvoid}
                        </p>
                      </div>
                    </div>

                    {/* Ready-to-send Check-in Message */}
                    <div className="rounded-xl border border-cyan-300/25 bg-gradient-to-r from-cyan-950/40 to-slate-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-cyan-300" />
                          <span>Algorithmic Check-In Text (1-Tap Copy)</span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyMessage(activeCheckInStatus.suggestedCheckInMessage, "checkin")}
                          className="h-7 text-xs text-cyan-200 hover:bg-cyan-400/20 gap-1"
                        >
                          {copiedMessageId === "checkin" ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Text
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="mt-2 text-xs italic text-slate-200 bg-black/30 p-3 rounded-lg border border-white/5">
                        "{activeCheckInStatus.suggestedCheckInMessage}"
                      </p>
                    </div>

                    {/* Ask Master Interpreter Action */}
                    {onAskMasterInterpreter && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          onAskMasterInterpreter(
                            `How is today's sky affecting my ${selectedLovedOne.relationship} ${selectedLovedOne.name}, and what are the best ways I can support them through their current planetary transits?`
                          )
                        }
                        className="w-full border-cyan-300/30 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-100 text-xs gap-2 py-5"
                      >
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                        <span>Ask AI Master Interpreter Deep Guidance on {selectedLovedOne.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Module B: System Intersect Matrix (Synastry: 5 cols) */}
          <div className="space-y-5 lg:col-span-5">
            <Card className="border-cyan-200/20 bg-gradient-to-br from-slate-950/90 via-violet-950/20 to-slate-950/90 text-slate-100 shadow-2xl h-full flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                        Module B · Peer Synergy
                      </span>
                      <CardTitle className="mt-1 font-serif text-xl text-white">
                        System Intersect Matrix
                      </CardTitle>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsShareModalOpen(true)}
                      className="border-cyan-300/30 text-cyan-200 text-xs gap-1.5"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share Bond Card
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cross-examining your natal blueprint with {selectedLovedOne.name}.
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {!userChart ? (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-xs text-slate-400">
                      <Compass className="h-8 w-8 text-cyan-300/40 mx-auto mb-2" />
                      Calculate your chart above first to generate the full live System Intersect Matrix with {selectedLovedOne.name}.
                    </div>
                  ) : activeIntersect ? (
                    <>
                      {/* Harmony vs Friction Score Meter */}
                      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Algorithmic Synergy Metric
                        </span>
                        <div className="mt-1 font-serif text-3xl font-bold text-white flex items-center justify-center gap-2">
                          <span className="text-cyan-300">{activeIntersect.harmonyScore}%</span>
                          <span className="text-xs font-sans text-slate-400 uppercase tracking-wider font-semibold">
                            Alignment
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-semibold text-violet-200">
                          {activeIntersect.dynamicTitle}
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                          {activeIntersect.elementalBalance.synergyNote}
                        </p>
                      </div>

                      {/* Key Intersect Connections */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Core Planetary Intersections
                        </span>
                        {activeIntersect.keyConnections.slice(0, 3).map((conn, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-cyan-200">{conn.planets}</span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                  conn.type === "support"
                                    ? "bg-emerald-400/10 text-emerald-200 border border-emerald-400/20"
                                    : "bg-amber-400/10 text-amber-200 border border-amber-400/20"
                                }`}
                              >
                                {conn.aspectName} (orb {conn.orb}°)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {conn.interpretation}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* House Overlays */}
                      {activeIntersect.houseOverlays.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                            Spatial Horizon Overlay
                          </span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {activeIntersect.houseOverlays[0].meaning}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Computing synastry matrices...
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Delete / Remove Contact Footer */}
              <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                <span>Pinned contact: {selectedLovedOne.name}</span>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate({ id: selectedLovedOne.id })}
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Add Loved One Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md border-cyan-200/20 bg-slate-950 text-slate-100 p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-300" />
              <span>Add Loved One to System Matrix</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Name</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amaree, Elena, Marcus"
                className="border-white/15 bg-black/40 text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Relationship</Label>
              <select
                value={formData.relationship}
                onChange={e => setFormData({ ...formData, relationship: e.target.value as RelationshipRole })}
                className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-slate-100"
              >
                <option value="child">Child / Son / Daughter</option>
                <option value="partner">Partner / Spouse</option>
                <option value="parent">Parent / Mother / Father</option>
                <option value="sibling">Sibling / Brother / Sister</option>
                <option value="friend">Friend / Confidant</option>
                <option value="colleague">Colleague / Partner</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Birth Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="border-white/15 bg-black/40 text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Birth Time (optional)</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="border-white/15 bg-black/40 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Birth Location</Label>
              <Input
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State / Country"
                className="border-white/15 bg-black/40 text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Notes / Protective Reminders</Label>
              <Input
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Sensitive to heavy critiques, high creative drive"
                className="border-white/15 bg-black/40 text-slate-100"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!formData.name.trim() || !formData.date || saveMutation.isPending}
                onClick={() => saveMutation.mutate(formData)}
                className="bg-cyan-300 text-slate-950 hover:bg-cyan-200 font-semibold"
              >
                Save Loved One
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cosmic Share Card Modal for System Intersect */}
      <CosmicShareCard
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        chart={userChart}
        customData={
          selectedLovedOne
            ? {
                title: "THE ALGORITHMS OF THE COSMOS · SYSTEM INTERSECT",
                headline: `${selectedLovedOne.name.toUpperCase()} & YOUR CELESTIAL INTERSECT MATRIX`,
                archetype: `${activeIntersect?.dynamicTitle.toUpperCase() || "SOUL HARMONY MATRIX"}`,
                quote: `Two distinct celestial algorithms converging in space-time: ${activeIntersect?.elementalBalance.synergyNote || "Mutual recognition and shared growth."}`,
                harmonyScore: activeIntersect?.harmonyScore ?? 84,
                partnerName: selectedLovedOne.name,
              }
            : undefined
        }
      />
    </div>
  );
}
