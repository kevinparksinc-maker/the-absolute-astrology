import { normalizeLongitude, ZODIAC_SIGNS } from "../../../shared/hybrid";
import type { ChartResult, ChartRow } from "../../astronomy";
import type { EvidenceItem, SourceTrace } from "../types";
import { evaluateArabicPersianTradition } from "./arabicPersianCanon";
import { getDecanCanonByLongitude, elementalDecanTeaching } from "./decans36";
import {
  detectHoraryAndTraditionalMechanisms,
  evaluatePlacementDignityAndCondition,
} from "./dignitiesAndHorary";
import {
  calculateChartHermeticLots,
  findFixedStarContactsForLongitude,
} from "./fixedStarsAndLots";
import { HOUSE_CANON_RECORDS, synthesizePlanetInHouse } from "./housesAndFrames";
import { getManzilCanonByLongitude } from "./manazil28";
import { getNakshatraCanonByLongitude } from "./nakshatras27";
import { getPlanetInHouseKnowledge } from "./planetInHouseInterpretations";
import {
  PLANET_CANON_RECORDS,
  SIGN_CANON_RECORDS,
  synthesizePlanetInSign,
} from "./planetsAndSigns";
import type {
  ChartCanonDossier,
  RetrievedPlacementDossier,
  VedicAyanamsaMode,
} from "./types";
import { evaluateVedicJyotishSystem } from "./vedicJyotishCanon";
import {
  buildDispositorChains,
  buildRelationalHouseChains,
  evaluateWesternTimingActivations,
} from "./westernRelationalAndTiming";

export function retrievePlacementDossier(
  row: ChartRow,
  chart: ChartResult,
  isDayChart: boolean
): RetrievedPlacementDossier {
  const lon = normalizeLongitude(row.longitude);
  const sign = ZODIAC_SIGNS[Math.floor(lon / 30)];
  const planetDoctrine = PLANET_CANON_RECORDS[row.name];
  const signDoctrine = SIGN_CANON_RECORDS[sign];
  const houseDoctrine = HOUSE_CANON_RECORDS[row.house];

  const planetInSignSynthesis = synthesizePlanetInSign(row.name, sign);
  const { houseSynthesis: planetInHouseSynthesis, godToAgentNote } =
    synthesizePlanetInHouse(row.name, row.house, row.godHouse, row.agentHouse);
  const planetInHouseKnowledge = getPlanetInHouseKnowledge(row.name, row.house);

  const dignityAndCondition = evaluatePlacementDignityAndCondition(
    row,
    chart,
    isDayChart
  );
  const decanRecord = getDecanCanonByLongitude(lon);
  const manzilRecord = getManzilCanonByLongitude(lon);
  const { nakshatra: nakshatraRecord, pada: activePada } =
    getNakshatraCanonByLongitude(lon);
  const fixedStarContacts = findFixedStarContactsForLongitude(lon);

  return {
    body: row.name,
    display: row.display,
    longitude: lon,
    sign,
    displayedHouse: row.house,
    godHouse: row.godHouse,
    agentHouse: row.agentHouse,
    planetDoctrine,
    signDoctrine,
    planetInSignSynthesis,
    houseDoctrine,
    planetInHouseSynthesis,
    planetInHouseKnowledge,
    godToAgentNote,
    dignityAndCondition,
    decanRecord,
    manzilRecord,
    nakshatraRecord,
    activePada,
    fixedStarContacts,
  };
}

export function retrieveChartCanonDossier(
  chart: ChartResult,
  options?: { vedicCoordinateMode?: VedicAyanamsaMode }
): ChartCanonDossier {
  const sunRow = chart.movingBodies.find(b => b.name === "Sun");
  const isDayChart = sunRow ? sunRow.house >= 7 && sunRow.house <= 12 : true;
  const sect: ChartCanonDossier["sect"] = !chart.agentViewAvailable
    ? "god-view-unsected"
    : isDayChart
      ? "day"
      : "night";

  const sectExplanation =
    sect === "god-view-unsected"
      ? "God View only (birth time or local horizon unavailable): classical Day/Night sect is noted conditionally; planetary sign, decan, manzil, nakshatra, and God House placements remain exact."
      : isDayChart
        ? `Diurnal (Day) Chart [FACT: Sun in House ${sunRow?.house} above the horizon]: Sun, Jupiter, and Saturn are the diurnal sect team (Jupiter is the primary benefic; Saturn is the more constructive malefic; Mars is contrary to sect).`
        : `Nocturnal (Night) Chart [FACT: Sun in House ${sunRow?.house} below the horizon]: Moon, Venus, and Mars are the nocturnal sect team (Venus is the primary benefic; Mars is the more constructive malefic; Saturn is contrary to sect).`;

  const rows: ChartRow[] = [
    ...chart.movingBodies,
    chart.ascendant,
    chart.descendant,
    chart.midheaven,
    chart.northNode,
    chart.southNode,
  ].filter(
    (r): r is ChartRow => Boolean(r) && Number.isFinite(r!.longitude)
  );

  const placements = rows.map(row =>
    retrievePlacementDossier(row, chart, isDayChart)
  );
  const detectedMechanisms = detectHoraryAndTraditionalMechanisms(
    chart,
    isDayChart
  );
  const arabicLotsSummary = calculateChartHermeticLots(chart, isDayChart);
  const dispositorChains = buildDispositorChains(chart, isDayChart);
  const westernTimingActivations = evaluateWesternTimingActivations(
    chart,
    isDayChart
  );
  const vedicJyotishSystem = evaluateVedicJyotishSystem(
    chart,
    options?.vedicCoordinateMode ?? "firmament-tropical-hybrid"
  );
  const arabicPersianSystem = evaluateArabicPersianTradition(chart, isDayChart);
  const relationalChains = buildRelationalHouseChains(
    chart,
    isDayChart,
    westernTimingActivations
  );

  const lines: string[] = [
    "=== LOCAL FIRMAMENT CANON & TRADITIONAL DOCTRINE DOSSIER (DETERMINISTICALLY RETRIEVED) ===",
    `[SECT DOCTRINE] ${sectExplanation}`,
    "",
    "--- RETRIEVED PLACEMENT DOCTRINE (PLANET + SIGN + HOUSE + DIGNITIES + DECAN + MANZIL + NAKSHATRA) ---",
  ];

  for (const p of placements) {
    lines.push(
      `• ${p.body} at ${p.display} (House ${p.displayedHouse}${p.godHouse != null && p.agentHouse != null ? ` | God House ${p.godHouse} → Agent House ${p.agentHouse}` : ""})`
    );
    lines.push(`  - [Sign & Dignity] ${p.planetInSignSynthesis}`);
    lines.push(`  - [Condition & Bounds] ${p.dignityAndCondition.conditionSummary} | ${p.dignityAndCondition.sectAlignment}`);
    lines.push(`  - [House Doctrine] ${p.planetInHouseSynthesis}`);
    if (p.planetInHouseKnowledge) {
      const k = p.planetInHouseKnowledge;
      lines.push(`  - [Planet-in-House Library · ${k.epistemicStatus}] Domain: ${k.domain}. ${k.core}`);
      lines.push(`    Career: ${k.career} Relationships: ${k.relationships}`);
      lines.push(`    Challenge: ${k.challenge} Gift: ${k.gift}`);
      lines.push(`    Vedic/qualification note: ${k.vedic}`);
      lines.push(`    Source status: ${k.sourceCaveat}`);
      lines.push(`    Interpretive boundary: ${k.interpretiveGuardrail}`);
    }
    if (p.godToAgentNote) {
      lines.push(`  - [God→Agent Frame Translation] ${p.godToAgentNote}`);
    }
    if (p.decanRecord) {
      lines.push(
        `  - [Decan ${p.decanRecord.index}/36: ${p.decanRecord.label} — "${p.decanRecord.traditionalTitle}"] Chaldean Face: ${p.decanRecord.chaldeanFaceRuler} | Triplicity Sub-ruler: ${p.decanRecord.triplicitySubRuler}. ${p.decanRecord.behavioralNuance}`
      );
    }
    if (p.manzilRecord) {
      lines.push(
        `  - [Arabic Manzil ${p.manzilRecord.index}/28: ${p.manzilRecord.name} ("${p.manzilRecord.englishTranslation}" · ${p.manzilRecord.traditionalQuality})] ${p.manzilRecord.natalAndPsychologicalMeaning}`
      );
    }
    if (p.nakshatraRecord && p.activePada) {
      lines.push(
        `  - [Vedic Nakshatra ${p.nakshatraRecord.index}/27: ${p.nakshatraRecord.name} Pada ${p.activePada.pada} (Navamsha ${p.activePada.navamshaSign} / ${p.activePada.navamshaRuler})] Deity: ${p.nakshatraRecord.deity} | Ruler: ${p.nakshatraRecord.vimshottariRuler} | Shakti: ${p.nakshatraRecord.shakti}. ${p.nakshatraRecord.psychologicalPattern}`
      );
    }
    if (p.fixedStarContacts.length > 0) {
      for (const fc of p.fixedStarContacts) {
        lines.push(
          `  - [Fixed Star Contact: ${fc.star.name}${fc.star.isRoyalStar ? ` (Royal Star · Watcher of the ${fc.star.watcherDirection})` : ""} at ${fc.orbDeg}° orb] Nature: ${fc.star.ptolemaicPlanetaryNature}. Gift: ${fc.star.giftWhenIntegrated} Test/Nemesis: ${fc.star.nemesisOrTest}`
        );
      }
    }
  }

  if (dispositorChains.length > 0) {
    lines.push(
      "",
      "--- DISPOSITOR CHAINS & INHERENT DIGNITY VS. HOUSE DELIVERY ---"
    );
    for (const d of dispositorChains) {
      lines.push(
        `• ${d.planet} in ${d.sign} → Domicile Lord: ${d.domicileLord} (Chain: ${d.chainToFinalDispositor.join(" → ")}${d.finalDispositor ? ` [Final Dispositor: ${d.finalDispositor}]` : d.inMutualReceptionLoop ? ` [Mutual Reception Loop: ${d.loopMembers.join(" ↔ ")}]` : ""}): ${d.conditionVsDeliveryNote}`
      );
    }
  }

  if (relationalChains.length > 0) {
    lines.push(
      "",
      "--- RELATIONAL INTERPRETATION LAYER (HOUSE LORD + PLACEMENT + ASPECTS + RECEPTION + TIMING + HUMAN REALITY) ---"
    );
    for (const rc of relationalChains) {
      lines.push(`• ${rc.workedChainSummary}`);
      lines.push(`  - ${rc.humanRealityManifestation}`);
      if (rc.contradictionsOrQualifications.length > 0) {
        lines.push(
          `  - [Qualifications & Tensions] ${rc.contradictionsOrQualifications.join(" | ")}`
        );
      }
    }
  }

  if (detectedMechanisms.length > 0) {
    lines.push(
      "",
      "--- DETECTED TRADITIONAL & HORARY MECHANISMS (RECEPTIONS, TRANSLATION/COLLECTION OF LIGHT, APPLICATION/IMPEDIMENTS) ---"
    );
    for (const m of detectedMechanisms) {
      lines.push(
        `• [${m.mechanismId.toUpperCase()} · ${m.epistemicCategory} · Lineage: ${m.historicalLineage ?? "traditional"}] ${m.title}: ${m.statement} (Source: ${m.sourceTitle})`
      );
    }
  }

  if (westernTimingActivations.length > 0) {
    lines.push("", "--- WESTERN TIMING & ACTIVATION DOCTRINE ---");
    for (const wt of westernTimingActivations) {
      lines.push(
        `• [${wt.name} · ${wt.calculatedOrDoctrineStatus}] ${wt.natalPromiseExplanation} ${wt.interactionWithNatalChart}`
      );
    }
  }

  if (vedicJyotishSystem) {
    lines.push(
      "",
      `--- VEDIC JYOTISH INTERPRETIVE SYSTEM (Coordinate Frame: ${vedicJyotishSystem.coordinateMode}, Ayanamsa Offset: ${vedicJyotishSystem.ayanamsaDegreesApplied}°) ---`,
      `• [Panchanga] Tithi: ${vedicJyotishSystem.panchanga.tithi.name} (${vedicJyotishSystem.panchanga.tithi.paksha}, Lord: ${vedicJyotishSystem.panchanga.tithi.ruler}) | Vara: ${vedicJyotishSystem.panchanga.vara.name} | Nitya Yoga: ${vedicJyotishSystem.panchanga.yoga.name} | Karana: ${vedicJyotishSystem.panchanga.karana.name}`,
      `• [Vimshottari Dasha] ${vedicJyotishSystem.vimshottariDasha.interpretation}`,
      `• [Jaimini Chara Karakas] ${vedicJyotishSystem.charaKarakas.map(k => `${k.karaka}: ${k.planet} (${k.degreeInSign}°)`).join(" | ")}`,
      `• [Arudha Padas] ${vedicJyotishSystem.arudhaLagnaview.interpretation}`
    );
    for (const y of vedicJyotishSystem.detectedYogas) {
      lines.push(
        `• [Vedic Yoga: ${y.name} (${y.status})] ${y.classicalExplanation} ${y.cancellationOrModificationNote} ${y.humanRealitySynthesis}`
      );
    }
  }

  if (arabicPersianSystem) {
    lines.push(
      "",
      "--- MEDIEVAL ARABIC & PERSIAN TRADITION (FIRDARIA, ALMUTEN FIGURIS, SIHAM LOTS & 4 BRANCHES) ---",
      `• ${arabicPersianSystem.firdariaSystem.explanation}`,
      `• ${arabicPersianSystem.almutenFiguris.explanation}`
    );
    for (const el of arabicPersianSystem.extendedLots) {
      lines.push(
        `• ${el.lot.name} at ${el.display} (House ${el.house}, Lord: ${el.lord} in House ${el.lordHouse}): ${el.houseInterpretation}${el.variantNote ? ` [${el.variantNote}]` : ""}`
      );
    }
  }

  if (arabicLotsSummary.length > 0) {
    lines.push("", "--- HERMETIC & ARABIC LOTS (CALCULATED BY SECT) ---");
    for (const l of arabicLotsSummary) {
      lines.push(
        `• ${l.lot.name} at ${l.display} (House ${l.house}): ${l.houseInterpretation} [Formula: ${isDayChart ? l.lot.dayFormula : l.lot.nightFormula}]`
      );
    }
  }

  return {
    sect,
    sectExplanation,
    placements,
    detectedMechanisms,
    arabicLotsSummary,
    dispositorChains,
    westernTimingActivations,
    vedicJyotishSystem,
    arabicPersianSystem,
    relationalChains,
    formattedSummaryForInterpreter: lines.join("\n"),
  };
}

export function canonDossierToEvidenceItems(
  dossier: ChartCanonDossier
): EvidenceItem[] {
  const now = new Date().toISOString();
  const makeTrace = (
    tradition: EvidenceItem["tradition"],
    technique: string,
    sourceTitle: string,
    ruleId: string,
    confidence: SourceTrace["confidence"] = "high"
  ): SourceTrace => ({
    sourceId: "firmament-canon-knowledge",
    tradition,
    technique,
    sourceTitle,
    retrievedAt: now,
    ruleId,
    confidence,
  });

  const items: EvidenceItem[] = [];

  for (const p of dossier.placements) {
    items.push({
      id: `canon-placement-${p.body.toLowerCase().replace(/\s+/g, "-")}`,
      tradition: "firmament",
      category: "deterministic-rule",
      technique: "canon-placement-dossier",
      subject: p.body,
      statement: `[FIRMAMENT CANON + TRADITION] ${p.planetInSignSynthesis} ${p.planetInHouseSynthesis} (${p.dignityAndCondition.conditionSummary}). Elemental decan: ${p.decanRecord ? elementalDecanTeaching(p.decanRecord).label : "unavailable"}. Manzil: ${p.manzilRecord?.name} (${p.manzilRecord?.englishTranslation}). Nakshatra: ${p.nakshatraRecord?.name} Pada ${p.activePada?.pada} (${p.nakshatraRecord?.deity}).`,
      concepts: [
        p.body.toLowerCase(),
        p.sign.toLowerCase(),
        `house-${p.displayedHouse}`,
        "canon-dossier",
      ],
      polarity:
        p.dignityAndCondition.essentialDignities.length > 0
          ? "supportive"
          : p.dignityAndCondition.essentialDebilities.some(d =>
                d.includes("Detriment") || d.includes("Fall")
              )
            ? "pressured"
            : "mixed",
      strength: 0.9,
      ruleId: "firmament-canon-dossier",
      sourceId: "firmament-canon-knowledge",
      sourceTrace: makeTrace(
        "firmament",
        "canon-placement-dossier",
        "Firmament Structured Traditional Knowledge Canon",
        "firmament-canon-dossier",
        "high"
      ),
    });
  }

  // Carry the actual method meanings, not just mansion/decan/star names.
  for (const p of dossier.placements) {
    const body = p.body.toLowerCase().replace(/\s+/g, "-");
    const add = (technique: string, tradition: EvidenceItem["tradition"], statement: string, sourceTitle: string, evidenceIds: string[]) => {
      items.push({
        id: `canon-${technique}-${body}-${items.length}`, tradition,
        category: "source-correspondence", technique, subject: p.body,
        statement, concepts: [p.body, ...evidenceIds], polarity: "mixed", strength: 0.8,
        ruleId: `firmament-${technique}`, sourceId: "firmament-canon-knowledge",
        sourceTrace: makeTrace(tradition, technique, sourceTitle, `firmament-${technique}`),
      });
    };
    if (p.nakshatraRecord && p.activePada) {
      const n = p.nakshatraRecord, pada = p.activePada;
      add("nakshatra-pada", "vedic",
        `${p.body}: ${n.name} pada ${pada.pada}. Ruler: ${n.vimshottariRuler}; deity: ${n.deity}; shakti: ${n.shakti}. ${n.coreMeaning} ${n.psychologicalPattern} Pada: ${pada.emphasis}; Navamsha ${pada.navamshaSign}, ruler ${pada.navamshaRuler}.`,
        n.provenance.sourceTitle, [`nakshatra-${body}-${n.index}`]);
    }
    if (p.manzilRecord) {
      const m = p.manzilRecord;
      add("arabic-manzil", "arabic",
        `${p.body}: ${m.name} (${m.englishTranslation}); ${m.traditionalQuality}. ${m.natalAndPsychologicalMeaning} Electional usage: ${m.traditionalElections}.`,
        m.provenance.sourceTitle, [`manzil-${body}-${m.index}`]);
    }
    if (p.decanRecord) {
      const d = p.decanRecord;
      add("elemental-decan", "firmament",
        `${p.body}: ${elementalDecanTeaching(d).label}. ${elementalDecanTeaching(d).statement}`,
        elementalDecanTeaching(d).sourceTitle, [`decan-${body}-${d.index}`]);
    }
    for (const contact of p.fixedStarContacts) {
      const star = contact.star;
      if (star.ptolemaicPlanetaryNature === "Not yet source-verified") continue;
      add(`fixed-star-${star.name.toLowerCase()}`, "firmament",
        `${p.body} activates ${star.name} at ${contact.orbDeg}° orb. Nature: ${star.ptolemaicPlanetaryNature}. ${star.traditionalMeaning} Gift: ${star.giftWhenIntegrated} Test: ${star.nemesisOrTest}`,
        star.provenance.sourceTitle, [`star-${star.name.toLowerCase()}`]);
    }
  }

  for (const p of dossier.placements) {
    const k = p.planetInHouseKnowledge;
    if (!k) continue;
    const sourceId = "legacy-planet-in-house-interpretations";
    const bodySlug = p.body.toLowerCase().replace(/\s+/g, "-");
    items.push({
      id: `canon-planet-in-house-${bodySlug}-house-${p.displayedHouse}`,
      tradition: k.tradition,
      category: "source-correspondence",
      technique: "planet-in-house-interpretation",
      subject: `${k.planet} in House ${k.house}`,
      statement: `[${k.epistemicStatus}] ${k.planet} in House ${k.house} — Domain: ${k.domain}. Core: ${k.core} Career: ${k.career} Relationships: ${k.relationships} Challenge: ${k.challenge} Gift: ${k.gift} Vedic/qualification note: ${k.vedic} Source status: ${k.sourceCaveat} Interpretive boundary: ${k.interpretiveGuardrail}`,
      concepts: [
        k.planet.toLowerCase(),
        `house-${k.house}`,
        "planet-in-house",
        k.domain.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      ],
      polarity: "mixed",
      strength: 0.68,
      ruleId: k.ruleId,
      sourceId,
      sourceTrace: {
        ...makeTrace(
          k.tradition,
          "planet-in-house-interpretation",
          k.sourceTitle,
          k.ruleId,
          "reference-only"
        ),
        sourceId,
      },
    });
  }

  for (const m of dossier.detectedMechanisms) {
    // Preserve actual historical provenance rather than hardcoding "arabic" or "high" confidence
    const mappedTradition: EvidenceItem["tradition"] =
      m.provenanceTradition ??
      (m.historicalLineage === "hellenistic" ? "western" : "arabic");
    const mappedConfidence: SourceTrace["confidence"] = m.confidence ?? "high";

    items.push({
      id: `canon-mechanism-${m.mechanismId}-${m.involvedBodies.join("-").toLowerCase()}`,
      tradition: mappedTradition,
      category: "deterministic-rule",
      technique: m.mechanismId,
      subject: m.involvedBodies.join("-"),
      statement: `[${m.epistemicCategory}] ${m.title}: ${m.statement}`,
      concepts: [
        m.mechanismId,
        ...m.involvedBodies.map(b => b.toLowerCase()),
        "traditional-mechanism",
      ],
      polarity: [
        "mutual-reception",
        "unilateral-reception",
        "translation-of-light",
        "collection-of-light",
        "cazimi",
      ].includes(m.mechanismId)
        ? "supportive"
        : ["prohibition", "refranation", "frustration", "combustion", "besiegement"].includes(
              m.mechanismId
            )
          ? "pressured"
          : "mixed",
      strength: mappedConfidence === "high" ? 0.88 : 0.72,
      ruleId: "firmament-traditional-mechanisms",
      sourceId: "firmament-canon-knowledge",
      sourceTrace: makeTrace(
        mappedTradition,
        m.mechanismId,
        m.sourceTitle,
        "firmament-traditional-mechanisms",
        mappedConfidence
      ),
    });
  }

  for (const rc of dossier.relationalChains ?? []) {
    items.push({
      id: `canon-relational-house-${rc.house}`,
      tradition: "western",
      category: "deterministic-rule",
      technique: "relational-house-chain",
      subject: `house-${rc.house}-${rc.ruler.toLowerCase()}`,
      statement: `${rc.workedChainSummary} ${rc.humanRealityManifestation}`,
      concepts: [
        `house-${rc.house}`,
        rc.ruler.toLowerCase(),
        "relational-chain",
      ],
      polarity:
        rc.contradictionsOrQualifications.length > 0 ? "mixed" : "supportive",
      strength: 0.9,
      ruleId: "firmament-relational-chain",
      sourceId: "firmament-canon-knowledge",
      sourceTrace: makeTrace(
        "western",
        "relational-house-chain",
        "Dorotheus of Sidon; Vettius Valens; Firmament Relational Engine",
        "firmament-relational-chain",
        rc.uncertainties.length > 0 ? "moderate" : "high"
      ),
    });
  }

  for (const yoga of dossier.vedicJyotishSystem?.detectedYogas ?? []) {
    items.push({
      id: `canon-vedic-yoga-${yoga.yogaId}`,
      tradition: "vedic",
      category: "deterministic-rule",
      technique: "vedic-yoga",
      subject: yoga.name,
      statement: `[TRADITION · Jyotish Yoga (${yoga.coordinateFrame})] ${yoga.name}: ${yoga.classicalExplanation} ${yoga.cancellationOrModificationNote} ${yoga.humanRealitySynthesis}`,
      concepts: [
        "vedic-yoga",
        yoga.yogaId,
        ...yoga.involvedBodies.map(b => b.toLowerCase()),
      ],
      polarity: yoga.status === "formed-strong" ? "supportive" : "mixed",
      strength: yoga.status === "formed-strong" ? 0.88 : 0.74,
      ruleId: "firmament-vedic-yogas",
      sourceId: "firmament-canon-knowledge",
      sourceTrace: makeTrace(
        "vedic",
        "vedic-yoga",
        yoga.provenance.sourceTitle,
        "firmament-vedic-yogas",
        yoga.status === "formed-strong" ? "high" : "moderate"
      ),
    });
  }

  if (dossier.arabicPersianSystem) {
    items.push({
      id: "canon-arabic-firdaria-almuten",
      tradition: "arabic",
      category: "deterministic-rule",
      technique: "firdaria-and-almuten",
      subject: dossier.arabicPersianSystem.almutenFiguris.winnerPlanet,
      statement: `${dossier.arabicPersianSystem.firdariaSystem.explanation} ${dossier.arabicPersianSystem.almutenFiguris.explanation}`,
      concepts: [
        "firdaria",
        "almuten-figuris",
        dossier.arabicPersianSystem.almutenFiguris.winnerPlanet.toLowerCase(),
      ],
      polarity: "supportive",
      strength: 0.85,
      ruleId: "firmament-arabic-persian-tradition",
      sourceId: "firmament-canon-knowledge",
      sourceTrace: makeTrace(
        "arabic",
        "firdaria-and-almuten",
        "Abu Ma'shar, Great Introduction; Ibn Ezra; Guido Bonatti",
        "firmament-arabic-persian-tradition",
        dossier.sect === "god-view-unsected" ? "moderate" : "high"
      ),
    });
  }

  return items;
}
