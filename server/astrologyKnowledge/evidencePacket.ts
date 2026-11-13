import type { ChartResult } from "../astronomy";
import { planKnowledge } from "./planner";
import { resolveWesternEvidence } from "./western";
import { resolveVedicEvidence } from "./vedic";
import { resolveArabicEvidence } from "./arabic";
import { resolveRelationships } from "./resolver";
import { ASTROLOGY_RULES, ASTROLOGY_SOURCES } from "./registry";
import { analyzeGenesisPatterns } from "../patterns/genesisEngine";
import {
  runGenesisAstroPipeline,
  runGenesisPatternPipeline,
} from "../genesisBackup/adapter";
import {
  behavioralReportToEvidenceItems,
  evaluateBehavioralIntelligence,
} from "./behavioral";
import {
  canonDossierToEvidenceItems,
  retrieveChartCanonDossier,
} from "./canon";
import type { AstrologyEvidencePacket, EvidenceItem } from "./types";
import { overlay as canonicalOverlay } from "../../shared/hybrid";

function genesisEvidence(
  genesis: ReturnType<typeof analyzeGenesisPatterns>
): EvidenceItem[] {
  const trace = (technique: string) => ({
    sourceId: "genesis-pattern-rules",
    tradition: "firmament" as const,
    technique,
    sourceTitle: "Genesis local pattern engine",
    retrievedAt: new Date().toISOString(),
    ruleId: "genesis-pattern-engine",
    confidence: "high" as const,
    calculationSettings: genesis.config,
  });
  return [
    ...genesis.dominantPatterns.map(pattern => ({
      id: `genesis-pattern-${pattern.type}-${pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "pattern-recognition",
      subject: pattern.name,
      statement: `${pattern.name}: ${pattern.description} Strength ${pattern.strength.toFixed(2)}; planets ${pattern.planets.join(", ")}.`,
      concepts: [
        "genesis",
        pattern.type,
        ...pattern.planets.map(planet => planet.toLowerCase()),
      ],
      polarity:
        pattern.type === "t_square"
          ? ("pressured" as const)
          : ("supportive" as const),
      strength: pattern.strength,
      ruleId: "genesis-pattern-engine",
      sourceId: "genesis-pattern-rules",
      sourceTrace: trace("pattern-recognition"),
    })),
    ...genesis.archetypes.map(archetype => ({
      id: `genesis-archetype-${archetype.archetype.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "archetype",
      subject: archetype.archetype,
      statement: `${archetype.archetype} (${archetype.intensity}): ${archetype.themes.join(", ")}.`,
      concepts: ["genesis", "archetype", ...archetype.themes],
      polarity: "mixed" as const,
      strength:
        archetype.intensity === "extreme"
          ? 1
          : archetype.intensity === "high"
            ? 0.85
            : 0.7,
      ruleId: "genesis-pattern-engine",
      sourceId: "genesis-pattern-rules",
      sourceTrace: trace("archetype"),
    })),
    ...genesis.signatures.map((signature, index) => ({
      id: `genesis-signature-${index}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "signature",
      subject: "chart-signature",
      statement: signature,
      concepts: ["genesis", "signature"],
      polarity: "neutral" as const,
      strength: 0.75,
      ruleId: "genesis-pattern-engine",
      sourceId: "genesis-pattern-rules",
      sourceTrace: trace("signature"),
    })),
    ...genesis.vedicYogas.map(yoga => ({
      id: `genesis-yoga-${yoga.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "vedic-yoga",
      subject: yoga.name,
      statement: yoga.message,
      concepts: ["genesis", "vedic-yoga", yoga.name.toLowerCase()],
      polarity: "supportive" as const,
      strength: 0.8,
      ruleId: "genesis-pattern-engine",
      sourceId: "genesis-pattern-rules",
      sourceTrace: trace("vedic-yoga"),
    })),
  ];
}

function genesisAstroEvidence(
  astro: ReturnType<typeof runGenesisAstroPipeline>
): EvidenceItem[] {
  const trace = (technique: string) => ({
    sourceId: "genesis-astro-engine",
    tradition: "firmament" as const,
    technique,
    sourceTitle: "Genesis Astro Engine",
    retrievedAt: new Date().toISOString(),
    ruleId: "genesis-astro-engine",
    confidence: "high" as const,
  });
  const evidence: EvidenceItem[] = [];
  if (astro.result) {
    for (const pillar of ["mind", "soul", "spirit"] as const) {
      evidence.push({
        id: `genesis-astro-${pillar}`,
        tradition: "firmament",
        category: "deterministic-rule",
        technique: "astro-pillar",
        subject: pillar,
        statement: `Genesis Astro Engine ${pillar}: ${astro.result[pillar].state}. ${astro.result[pillar].body}`,
        concepts: ["genesis", "astro-engine", pillar],
        polarity: "mixed",
        strength: 0.8,
        ruleId: "genesis-astro-engine",
        sourceId: "genesis-astro-engine",
        sourceTrace: trace("astro-pillar"),
      });
    }
    for (const activation of astro.result.activations.slice(0, 18)) {
      evidence.push({
        id: `genesis-astro-activation-${activation.transitPlanet}-${activation.natalPlanet}-${activation.aspect}`,
        tradition: "firmament",
        category: "deterministic-rule",
        technique: "astro-transit",
        subject: activation.natalPlanet,
        statement: `Genesis Astro Engine activation: ${activation.summary} Orb ${activation.orb.toFixed(2)}°; priority ${activation.priority.toFixed(2)}.`,
        concepts: ["genesis", "astro-engine", "transit", activation.aspect],
        polarity: ["square", "opposition"].includes(activation.aspect)
          ? "pressured"
          : "supportive",
        strength: Math.max(0, Math.min(1, 1 - activation.orb / 8)),
        ruleId: "genesis-astro-engine",
        sourceId: "genesis-astro-engine",
        sourceTrace: trace("astro-transit"),
      });
    }
  }
  if (astro.error) {
    evidence.push({
      id: "genesis-astro-error",
      tradition: "firmament",
      category: "uncertainty",
      technique: "astro-engine",
      subject: "reading",
      statement: `Genesis Astro Engine could not complete: ${astro.error}`,
      concepts: ["genesis", "astro-engine", "incomplete"],
      polarity: "neutral",
      strength: 0,
      ruleId: "genesis-astro-engine",
      sourceId: "genesis-astro-engine",
      sourceTrace: trace("astro-engine"),
    });
  }
  for (const yoga of astro.yogas) {
    evidence.push({
      id: `genesis-astro-yoga-${yoga.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      tradition: "firmament",
      category: "deterministic-rule",
      technique: "vedic-yoga",
      subject: yoga.name,
      statement: yoga.message,
      concepts: [
        "genesis",
        "astro-engine",
        "vedic-yoga",
        yoga.name.toLowerCase(),
      ],
      polarity: "supportive",
      strength: 0.8,
      ruleId: "genesis-astro-engine",
      sourceId: "genesis-astro-engine",
      sourceTrace: trace("vedic-yoga"),
    });
  }
  return evidence;
}

function genesisOriginalPatternEvidence(
  pattern: ReturnType<typeof runGenesisPatternPipeline>
): EvidenceItem[] {
  const trace = (technique: string) => ({
    sourceId: "genesis-pattern-engine-original",
    tradition: "firmament" as const,
    technique,
    sourceTitle: "Genesis Pattern Engine v2.0",
    retrievedAt: new Date().toISOString(),
    ruleId: "genesis-pattern-engine-original",
    confidence: "high" as const,
  });
  return [
    ...pattern.analysis.aspects.slice(0, 60).map(aspect => ({
      id: `genesis-original-aspect-${aspect.planet1}-${aspect.planet2}-${aspect.type}-${aspect.isTransitToNatal ? "transit" : "natal"}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "pattern-aspect",
      subject: `${aspect.planet1}-${aspect.planet2}`,
      statement: `Genesis Pattern Engine v2.0 detects ${aspect.planet1} ${aspect.type} ${aspect.planet2} at ${aspect.orb.toFixed(2)}° orb with ${(aspect.strength * 100).toFixed(0)}% strength.`,
      concepts: ["genesis", "pattern-engine", aspect.type],
      polarity: ["square", "opposition"].includes(aspect.type)
        ? ("pressured" as const)
        : ("supportive" as const),
      strength: Math.max(0, Math.min(1, aspect.strength)),
      ruleId: "genesis-pattern-engine-original",
      sourceId: "genesis-pattern-engine-original",
      sourceTrace: trace("pattern-aspect"),
    })),
    ...pattern.analysis.dominantPatterns.map(item => ({
      id: `genesis-original-pattern-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "pattern-configuration",
      subject: item.name,
      statement: `Genesis Pattern Engine v2.0: ${item.description} Strength ${(item.strength * 100).toFixed(0)}%.`,
      concepts: [
        "genesis",
        "pattern-engine",
        item.type,
        ...item.planets.map(planet => planet.toLowerCase()),
      ],
      polarity:
        item.type === "t_square"
          ? ("pressured" as const)
          : ("supportive" as const),
      strength: item.strength,
      ruleId: "genesis-pattern-engine-original",
      sourceId: "genesis-pattern-engine-original",
      sourceTrace: trace("pattern-configuration"),
    })),
    ...pattern.analysis.archetypes.map(item => ({
      id: `genesis-original-archetype-${item.archetype.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      tradition: "firmament" as const,
      category: "deterministic-rule" as const,
      technique: "pattern-archetype",
      subject: item.archetype,
      statement: `Genesis Pattern Engine v2.0 archetype ${item.archetype} (${item.intensity}): ${item.themes.join(", ")}.`,
      concepts: ["genesis", "pattern-engine", "archetype", ...item.themes],
      polarity: "mixed" as const,
      strength:
        item.intensity === "extreme"
          ? 1
          : item.intensity === "high"
            ? 0.85
            : 0.7,
      ruleId: "genesis-pattern-engine-original",
      sourceId: "genesis-pattern-engine-original",
      sourceTrace: trace("pattern-archetype"),
    })),
  ];
}

export function buildAstrologyEvidencePacket(
  chart: ChartResult,
  question: string,
  mode: "natal" | "transit" | "combined" = chart.readingScope
): AstrologyEvidencePacket {
  const plan = planKnowledge(question, mode);
  const astro = runGenesisAstroPipeline(chart);
  const originalPattern = runGenesisPatternPipeline(chart);
  const genesis = analyzeGenesisPatterns(chart);
  const westernEvidence = resolveWesternEvidence(chart, plan);
  const vedicEvidence = resolveVedicEvidence(chart, plan);
  const arabicEvidence = resolveArabicEvidence(chart, plan);
  const lunarEvidence = [...vedicEvidence, ...arabicEvidence].filter(item =>
    ["nakshatra", "manzil"].includes(item.technique)
  );
  const lunarRows = mode === "natal" ? chart.movingBodies : [...chart.movingBodies, ...chart.transits];
  const overlayEvidence: EvidenceItem[] = lunarRows.flatMap((row, index) => {
    const lunarOverlay = row.overlay ?? (Number.isFinite(row.longitude) ? canonicalOverlay(row.longitude) : null);
    if (!lunarOverlay) return [];
    return [{
      id: `fixed-frame-lunar-overlay-${index}-${row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      tradition: "firmament" as const,
      category: "source-correspondence" as const,
      technique: "fixed-frame-lunar-overlay",
      subject: row.name,
      statement: `${row.name} at ${row.display}: Nakshatra ${lunarOverlay.nakshatra}, Pada ${lunarOverlay.pada}, ruler ${lunarOverlay.nakshatraRuler}; Arabic Manzil ${lunarOverlay.manzil}; Chinese Xiu ${lunarOverlay.chineseMansion}, determinative star ${lunarOverlay.chineseDeterminativeStar}. Chinese assignment uses the ${lunarOverlay.chineseBoundaryModel} in the firmament-aldebaran-15-taurus frame. This overlay is derived from canonical longitude and does not apply another ayanamsha.`,
      concepts: ["nakshatra", "nakshatra-ruler", "manzil", "chinese-xiu", "determinative-star", row.name.toLowerCase()],
      polarity: "neutral" as const,
      strength: 1,
      sourceId: "firmament-fixed-frame-lunar-overlays",
      sourceTrace: {
        sourceId: "firmament-fixed-frame-lunar-overlays",
        tradition: "firmament" as const,
        technique: "fixed-frame-lunar-overlay",
        sourceTitle: "Firmament canonical lunar overlay calculation",
        retrievedAt: new Date().toISOString(),
        confidence: "high" as const,
        calculationSettings: {
          longitude: row.longitude,
          referenceFrame: "firmament-aldebaran-15-taurus",
          chineseBoundaryModel: lunarOverlay.chineseBoundaryModel,
        },
      },
    }];
  });
  lunarEvidence.push(...overlayEvidence);
  const fixedStarEvidence: EvidenceItem[] = chart.frozenStars.flatMap(star =>
    (star.royalStarContacts ?? [])
      .filter(contact => contact.contact)
      .map(contact => ({
        id: `fixed-star-${star.name}-${contact.name}`,
        tradition: "firmament" as const,
        category: "calculated-fact" as const,
        technique: "fixed-stars",
        subject: star.name,
        statement: `${star.name} is within ${contact.distance.toFixed(2)}° of ${contact.name}.`,
        concepts: ["fixed-star", contact.name.toLowerCase()],
        polarity: "neutral" as const,
        strength: Math.max(0, 1 - contact.distance / 5),
        sourceId: "firmament-ephemeris",
        sourceTrace: {
          sourceId: "firmament-ephemeris",
          tradition: "firmament" as const,
          technique: "fixed-stars",
          sourceTitle: "Firmament local ephemeris",
          retrievedAt: new Date().toISOString(),
          confidence: "high" as const,
        },
      }))
  );
  const timingEvidence: EvidenceItem[] =
    mode === "natal"
      ? []
      : chart.transits.flatMap(transit =>
          transit.natalContacts
            .filter(contact => contact.orb <= 5)
            .map(contact => ({
              id: `timing-${transit.name}-${contact.natalName}-${contact.aspect}`,
              tradition: "firmament" as const,
              category: "calculated-fact" as const,
              technique: "transits",
              subject: transit.name,
              statement: `Transit ${transit.name} makes a ${contact.aspect} to natal ${contact.natalName} at ${contact.orb.toFixed(2)}°.`,
              concepts: [
                "transit",
                contact.aspect,
                transit.name.toLowerCase(),
                contact.natalName.toLowerCase(),
              ],
              polarity: ["square", "opposition"].includes(contact.aspect)
                ? ("pressured" as const)
                : ("supportive" as const),
              strength: Math.max(0, 1 - contact.orb / 5),
              sourceId: "firmament-ephemeris",
              sourceTrace: {
                sourceId: "firmament-ephemeris",
                tradition: "firmament" as const,
                technique: "transits",
                sourceTitle: "Firmament local ephemeris",
                retrievedAt: new Date().toISOString(),
                confidence: "high" as const,
              },
            }))
        );
  const patternEvidence = genesisEvidence(genesis);
  patternEvidence.push(...genesisOriginalPatternEvidence(originalPattern));
  const astroEvidence = genesisAstroEvidence(astro);
  const behavioralReport = evaluateBehavioralIntelligence(
    chart,
    question,
    mode
  );
  const { behavioralEvidence, lifeEventEvidence } =
    behavioralReportToEvidenceItems(behavioralReport);
  const canonDossier = retrieveChartCanonDossier(chart);
  const canonEvidence = canonDossierToEvidenceItems(canonDossier);
  const all = [
    ...westernEvidence,
    ...astroEvidence,
    ...patternEvidence,
    ...behavioralEvidence,
    ...lifeEventEvidence,
    ...canonEvidence,
    ...vedicEvidence,
    ...arabicEvidence,
    ...timingEvidence,
    ...fixedStarEvidence,
  ];
  const resolved = resolveRelationships(all);
  const uncertainties = all.filter(item => item.category === "uncertainty");
  const incomplete = ASTROLOGY_RULES.filter(
    rule => rule.status === "incomplete"
  ).map(rule => `${rule.technique}: ${rule.statement}`);
  for (const source of ASTROLOGY_SOURCES.filter(
    source => source.status === "reference-only"
  )) {
    incomplete.push(
      `${source.name} is reference-only; no authorized runtime provider is enabled.`
    );
  }
  const sourceTrace = all.map(item => {
    const rule = item.ruleId
      ? ASTROLOGY_RULES.find(candidate => candidate.id === item.ruleId)
      : undefined;
    return {
      ...item.sourceTrace,
      provider: item.sourceTrace.provider ?? item.sourceTrace.sourceId,
      implementationStatus: rule?.status ?? "implemented",
      ...(item.sourceTrace.sourceUrl
        ? {}
        : {
            calculationSettings: {
              worldview: chart.worldview,
              readingScope: chart.readingScope,
              relationshipOrb: 5,
            },
          }),
    };
  });
  return {
    question,
    plan,
    chartFacts: {
      worldview: chart.worldview,
      readingScope: chart.readingScope,
      utc: chart.utc,
      agentViewAvailable: chart.agentViewAvailable,
      placements: [
        ...chart.movingBodies,
        chart.ascendant,
        chart.descendant,
        chart.midheaven,
        chart.northNode,
        chart.southNode,
      ]
        .filter(Boolean)
        .map(row => ({
          name: row!.name,
          longitude: row!.longitude,
          display: row!.display,
          house: row!.house,
          godHouse: row!.godHouse,
          agentHouse: row!.agentHouse,
        })),
    },
    westernEvidence,
    patternEvidence,
    genesisAstroEvidence: astroEvidence,
    behavioralEvidence,
    lifeEventEvidence,
    behavioralReport,
    canonEvidence,
    canonDossier,
    vedicEvidence,
    arabicEvidence,
    lunarEvidence,
    fixedStarEvidence,
    timingEvidence,
    relationships: resolved.relationships,
    convergences: resolved.convergences,
    contradictions: resolved.contradictions,
    uncertainties,
    incomplete,
    sourceTrace,
    doctrine: {
      genesis: {
        role: "active pattern-recognition, Astro Engine, and hard-coded interpretive rules",
        engine: genesis.doctrine,
        astroEngine: astro.engine,
        aspectOrbs: genesis.config,
        houseFrame:
          "uses Firmament-calculated chart houses; does not replace Firmament ephemeris or worldview calculations",
      },
      western: {
        relationshipOrb: 5,
        houseFrame: chart.agentViewAvailable
          ? "equal-house Agent View plus fixed God View"
          : "fixed God View only",
      },
      vedic: {
        background: "fixed 0° Aries / 27 equal Nakshatras",
        sourceMode: "local rules plus reference-only Tvam trace",
      },
      arabic: {
        background: "fixed 28 Manazil",
        sourceMode: "local rules plus reference-only Canopy trace",
      },
    },
  };
}

export function formatEvidencePacket(packet: AstrologyEvidencePacket) {
  const section = (title: string, items: EvidenceItem[]) =>
    `${title}\n${items.length ? items.map(item => `- [${item.tradition}/${item.technique}] ${item.statement}`).join("\n") : "- none"}`;
  const relationEvidence = (
    item: AstrologyEvidencePacket["relationships"][number],
    technique: string
  ): EvidenceItem => ({
    id: item.id,
    tradition: "firmament",
    category: "deterministic-rule",
    technique,
    subject: item.theme,
    statement: `${item.explanation} Strength ${item.strength}.`,
    concepts: [item.theme],
    sourceId: "firmament-architecture",
    sourceTrace: {
      sourceId: "firmament-architecture",
      tradition: "firmament",
      technique,
      sourceTitle: "Firmament architecture",
      retrievedAt: new Date().toISOString(),
      confidence: "high",
    },
  });
  return [
    "ASTROLOGY EVIDENCE PACKET",
    `Question: ${packet.question}`,
    "Core policy: Genesis Astro Engine, Genesis Pattern Engine, and Genesis Yoga Detector are mandatory evaluated layers. The planner may prioritize their findings, but may not bypass the Genesis layer.",
    `Plan: ${packet.plan.reasons.join(" ")}`,
    section("Western evidence", packet.westernEvidence),
    section("Genesis Astro Engine evidence", packet.genesisAstroEvidence),
    section("Genesis Pattern Engine evidence", packet.patternEvidence),
    section(
      "Firmament Human Behavior Pattern Intelligence (7-channel convergence, 5-level confidence, triggers, motivations, responses & polarities)",
      packet.behavioralEvidence
    ),
    section(
      "Firmament Life-Event & Situation Intelligence (E1-E5 event signatures, temporal states & cross-domain sequences)",
      packet.lifeEventEvidence
    ),
    packet.canonDossier?.formattedSummaryForInterpreter ?? "",
    section("Vedic evidence", packet.vedicEvidence),
    section("Arabic evidence", packet.arabicEvidence),
    section("Lunar evidence", packet.lunarEvidence),
    section("Timing evidence", packet.timingEvidence),
    section(
      "Convergences",
      packet.convergences.map(item => relationEvidence(item, "convergence"))
    ),
    section(
      "Contradictions and qualifications",
      packet.contradictions.map(item => relationEvidence(item, "contradiction"))
    ),
    packet.uncertainties.length
      ? section("Explicit uncertainties", packet.uncertainties)
      : "",
    packet.incomplete.length
      ? `Incomplete or reference-only\n${packet.incomplete.map(item => `- ${item}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function compactText(text: string, maxLen = 165): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen - 1);
  const stop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "), slice.lastIndexOf(" "));
  return (stop > maxLen * 0.55 ? slice.slice(0, stop) : slice).trim() + "…";
}

export function formatCompactEvidencePacket(packet: AstrologyEvidencePacket): string {
  const section = (title: string, items: EvidenceItem[], maxItems = 8) => {
    if (!items.length) return "";
    const sorted = [...items].sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0));
    const sliced = sorted.slice(0, maxItems);
    const lines = sliced.map(
      item => `- [${item.tradition}/${item.technique}] ${compactText(item.statement)}`
    );
    if (items.length > maxItems) {
      lines.push(`- (+${items.length - maxItems} additional calculated items in synthesis)`);
    }
    return `${title}\n${lines.join("\n")}`;
  };

  const relationLines = (
    title: string,
    items: AstrologyEvidencePacket["relationships"],
    maxItems = 5
  ) => {
    if (!items.length) return "";
    return `${title}\n${items
      .slice(0, maxItems)
      .map(item => `- ${compactText(item.explanation, 150)} (strength ${item.strength})`)
      .join("\n")}`;
  };

  return [
    "ASTROLOGY EVIDENCE PACKET (COMPACT DIGEST)",
    `Question: ${packet.question}`,
    `Plan: ${packet.plan.reasons.join(" ")}`,
    section("Western evidence", packet.westernEvidence, 8),
    section("Genesis Astro Engine evidence", packet.genesisAstroEvidence, 8),
    section("Genesis Pattern Engine evidence", packet.patternEvidence, 8),
    section("Human Behavior Pattern Intelligence", packet.behavioralEvidence, 8),
    section("Life-Event & Situation Intelligence", packet.lifeEventEvidence, 5),
    section("Vedic evidence", packet.vedicEvidence, 8),
    section("Arabic evidence", packet.arabicEvidence, 6),
    section("Lunar & Fixed-Frame Overlays", packet.lunarEvidence, 8),
    section("Timing evidence (transits <= 5°)", packet.timingEvidence, 10),
    relationLines("Convergences", packet.convergences, 5),
    relationLines("Contradictions and qualifications", packet.contradictions, 5),
    packet.uncertainties.length
      ? section("Explicit uncertainties", packet.uncertainties, 4)
      : "",
    packet.incomplete.length
      ? `Incomplete or reference-only: ${packet.incomplete.slice(0, 4).join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

