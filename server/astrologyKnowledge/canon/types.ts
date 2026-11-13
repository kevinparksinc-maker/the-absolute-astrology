import type { Tradition } from "../types";
import type { PlanetInHouseKnowledgeRecord } from "./planetInHouseInterpretations";

/**
 * Epistemic separation required by Firmament architecture:
 * - FACT: Externally verifiable astronomical, mathematical, or historical fact.
 * - TRADITION: A historical astrological teaching, rule, or correspondence attributed to a specific tradition/source.
 * - SCHOOL_VARIANT: A specific school/author variant where historical authorities diverge (e.g. Dorothean vs Ptolemaic, Lahiri vs Tropical Hybrid, Abu Ma'shar vs Al-Qabisi).
 * - FIRMAMENT_CANON: A deterministic rule, coordinate lock, or interpretive synthesis explicitly adopted by Firmament.
 * - MODERN_SYNTHESIS: Contemporary psychological, somatic, or human-reality synthesis clearly distinguished from historical doctrine.
 */
export type EpistemicCategory =
  | "FACT"
  | "TRADITION"
  | "SCHOOL_VARIANT"
  | "FIRMAMENT_CANON"
  | "MODERN_SYNTHESIS";

export type HistoricalLineage =
  | Tradition
  | "hellenistic"
  | "babylonian"
  | "hermetic"
  | "medieval"
  | "persian"
  | "modern-psychological";

export type ProvenanceRecord = {
  tradition: HistoricalLineage;
  sourceTitle: string;
  authorOrEra?: string;
  epistemicCategory: EpistemicCategory;
  notes?: string;
  disputedOrVariantNote?: string;
};

export type EpistemicStatement = {
  category: EpistemicCategory;
  statement: string;
  provenance: ProvenanceRecord;
};

export type PlanetCanonRecord = {
  name: string;
  category: "luminary" | "classical-planet" | "modern-outer" | "lunar-node";
  astronomicalFact: EpistemicStatement;
  traditionalQualities: {
    sect: "diurnal" | "nocturnal" | "participating" | "not-applicable";
    temperament: string;
    beneficMalefic: "benefic" | "malefic" | "variable" | "modern-transpersonal";
    chaldeanOrderRank?: number;
    meanDailyMotionDeg: number;
    provenance: ProvenanceRecord;
  };
  coreMeanings: string[];
  psychologicalFunctions: {
    coreNeed: string;
    healthyExpression: string;
    defensiveStrategy: string;
    shadowExpression: string;
    provenance?: ProvenanceRecord;
  };
  rulerships: {
    domiciles: string[];
    exaltationSign?: string;
    exaltationDegree?: number;
    detriments: string[];
    fallSign?: string;
    fallDegree?: number;
    houseJoy?: number;
  };
  naturalSignifications: string[];
  horaryUses: string[];
  firmamentCanonNote: EpistemicStatement;
};

export type SignCanonRecord = {
  name: string;
  index: number; // 0..11
  degreeRange: [number, number];
  astronomicalFact: EpistemicStatement;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  polarity: "Diurnal / Masculine" | "Nocturnal / Feminine";
  domicileLord: string;
  modernCoRuler?: string;
  exaltation: { planet: string; classicalDegree: number } | null;
  detrimentLords: string[];
  fall: { planet: string; classicalDegree: number } | null;
  triplicityLords: {
    dorothean: { day: string; night: string; participating: string };
    ptolemaicNote: string;
  };
  traditionalQualities: string[];
  psychologicalTheme: string;
  firmamentGodHouse: number;
  provenance: ProvenanceRecord;
};

export type HouseCanonRecord = {
  house: number; // 1..12
  angularity: "Angular (Pivot)" | "Succedent" | "Cadent";
  traditionalTitle: string;
  LatinName: string;
  planetaryJoy: string | null;
  coreTopics: string[];
  horarySignifications: string[];
  psychologicalField: string;
  godViewDefinition: EpistemicStatement;
  agentViewDefinition: EpistemicStatement;
  godToAgentTranslationRule: EpistemicStatement;
};

export type DecanCanonRecord = {
  index: number; // 1..36
  sign: string;
  decanNumber: 1 | 2 | 3;
  degreeRange: [number, number];
  label: string;
  chaldeanFaceRuler: string; // Hellenistic / Arabic Face ruler
  triplicitySubRuler: string; // Western Triplicity sub-ruler (preserved separately, not merged)
  traditionalTitle: string;
  coreThemes: string[];
  behavioralNuance: string;
  provenance: ProvenanceRecord;
};

export type ManzilCanonRecord = {
  index: number; // 1..28
  name: string;
  transliterationVariants: string[];
  englishTranslation: string;
  degreeRange: [number, number];
  astronomicalFact: EpistemicStatement;
  traditionalQuality: "Fortunate" | "Unfortunate" | "Mixed / Conditional";
  traditionalThemes: string[];
  traditionalElections: string;
  natalAndPsychologicalMeaning: string;
  firmamentCanonNote: EpistemicStatement;
  provenance: ProvenanceRecord;
};

export type NakshatraPadaRecord = {
  pada: 1 | 2 | 3 | 4;
  navamshaSign: string;
  navamshaRuler: string;
  degreeRange: [number, number];
  emphasis: string;
};

export type NakshatraCanonRecord = {
  index: number; // 1..27
  name: string;
  degreeRange: [number, number];
  vimshottariRuler: string;
  deity: string;
  symbol: string;
  shakti: string; // Power / action
  guna: "Sattva" | "Rajas" | "Tamas";
  gana: "Deva (Divine)" | "Manushya (Human)" | "Rakshasa (Fierce/Independent)";
  motivationPuruSharthas: "Dharma" | "Artha" | "Kama" | "Moksha";
  coreMeaning: string;
  psychologicalPattern: string;
  padas: [
    NakshatraPadaRecord,
    NakshatraPadaRecord,
    NakshatraPadaRecord,
    NakshatraPadaRecord,
  ];
  epistemicNote: EpistemicStatement;
  provenance: ProvenanceRecord;
};

export type FixedStarCanonRecord = {
  name: string;
  isRoyalStar: boolean;
  watcherDirection?: "East (Vernal)" | "North (Summer)" | "West (Autumnal)" | "South (Winter)";
  constellation: string;
  firmamentLockedLongitude: number;
  astronomicalFact: EpistemicStatement;
  ptolemaicPlanetaryNature: string;
  traditionalMeaning: string;
  giftWhenIntegrated: string;
  nemesisOrTest: string;
  firmamentOrbRule: EpistemicStatement;
  provenance: ProvenanceRecord;
};

export type LotCanonRecord = {
  id: string;
  name: string;
  dayFormula: string;
  nightFormula: string;
  associatedPlanet: string;
  traditionalMeaning: string;
  psychologicalMeaning: string;
  horaryAndNatalUse: string;
  provenance: ProvenanceRecord;
};

export type HoraryMechanismRecord = {
  id:
    | "applying-aspect"
    | "separating-aspect"
    | "mutual-reception"
    | "unilateral-reception"
    | "translation-of-light"
    | "collection-of-light"
    | "prohibition"
    | "refranation"
    | "frustration"
    | "cazimi"
    | "combustion"
    | "under-the-beams"
    | "besiegement"
    | "retrograde-condition"
    | "void-of-course";
  name: string;
  category: "perfection" | "impediment" | "solar-condition" | "reception" | "motion";
  definition: string;
  astronomicalCriterion: string;
  traditionalJudgment: string;
  psychologicalAnalogue: string;
  provenance: ProvenanceRecord;
};

export type RetrievedPlacementDossier = {
  body: string;
  display: string;
  longitude: number;
  sign: string;
  displayedHouse: number;
  godHouse?: number;
  agentHouse?: number;
  planetDoctrine?: PlanetCanonRecord;
  signDoctrine?: SignCanonRecord;
  planetInSignSynthesis: string;
  houseDoctrine?: HouseCanonRecord;
  planetInHouseSynthesis: string;
  /** Expanded legacy placement interpretation, with explicit provenance and usage caveats. */
  planetInHouseKnowledge?: PlanetInHouseKnowledgeRecord | null;
  godToAgentNote?: string;
  dignityAndCondition: {
    essentialDignities: string[];
    essentialDebilities: string[];
    egyptianTermRuler?: string;
    ptolemaicTermRuler?: string;
    chaldeanFaceRuler?: string;
    dorotheanTriplicityRulers?: { day: string; night: string; participating: string };
    solarCondition: "cazimi" | "combust" | "under-the-beams" | "free-of-solar-rays" | "solar-source";
    solarDistanceDeg?: number;
    sectAlignment: string;
    accidentalCondition: string;
    conditionSummary: string;
  };
  decanRecord?: DecanCanonRecord;
  manzilRecord?: ManzilCanonRecord;
  nakshatraRecord?: NakshatraCanonRecord;
  activePada?: NakshatraPadaRecord;
  fixedStarContacts: Array<{
    star: FixedStarCanonRecord;
    orbDeg: number;
  }>;
};

export type DetectedTraditionalMechanism = {
  mechanismId: HoraryMechanismRecord["id"];
  title: string;
  involvedBodies: string[];
  statement: string;
  epistemicCategory: EpistemicCategory;
  sourceTitle: string;
  provenanceTradition?: Tradition;
  historicalLineage?: HistoricalLineage;
  confidence?: "high" | "moderate" | "low" | "reference-only";
};

export type DispositorChainNode = {
  planet: string;
  sign: string;
  domicileLord: string;
  exaltationLord: string | null;
  termLordEgyptian?: string;
  termLordPtolemaic?: string;
  chainToFinalDispositor: string[];
  finalDispositor: string | null;
  inMutualReceptionLoop: boolean;
  loopMembers: string[];
  receptionWithLord: "domicile-self" | "mutual-reception" | "aspect-with-reception" | "aversion-to-lord" | "unreceived-aspect";
  conditionVsDeliveryNote: string;
};

export type WesternTimingActivationRecord = {
  techniqueId:
    | "annual-profection"
    | "zodiacal-releasing"
    | "primary-directions"
    | "solar-return"
    | "secondary-progressions";
  name: string;
  eraClassification: "hellenistic-medieval" | "modern-secondary";
  calculatedOrDoctrineStatus: "calculated-active" | "doctrine-only";
  activeSignOrPeriod?: string;
  timeLordOrActivatedBody?: string;
  activatedHouse?: number;
  natalPromiseExplanation: string;
  interactionWithNatalChart: string;
  provenance: ProvenanceRecord;
};

export type VedicAyanamsaMode = "firmament-tropical-hybrid" | "classical-sidereal-lahiri" | "classical-sidereal-raman";

export type VedicVargaDoctrineRecord = {
  code: "D1" | "D2" | "D3" | "D4" | "D7" | "D9" | "D10" | "D12" | "D16" | "D20" | "D24" | "D27" | "D30" | "D60";
  sanskritName: string;
  divisionCount: number;
  primaryDomain: string;
  whenToConsult: string;
  evaluationRule: string;
  relationToD1Rashi: string;
  provenance: ProvenanceRecord;
};

export type VedicYogaCanonRecord = {
  id: string;
  name: string;
  category: "raja-yoga" | "dhana-yoga" | "pancha-mahapurusha" | "lunar-solar-yoga" | "nabhasa-or-special" | "arista-or-cancellation";
  formationRule: string;
  requiredConditions: string[];
  exceptionsAndBhanga: string[];
  classicalMeaning: string;
  humanRealityManifestation: string;
  provenance: ProvenanceRecord;
};

export type DetectedVedicYoga = {
  yogaId: string;
  name: string;
  category: VedicYogaCanonRecord["category"];
  involvedBodies: string[];
  housesInvolved: number[];
  status: "formed-strong" | "formed-modified" | "cancelled-or-bhanga";
  classicalExplanation: string;
  cancellationOrModificationNote: string;
  humanRealitySynthesis: string;
  coordinateFrame: VedicAyanamsaMode;
  provenance: ProvenanceRecord;
};

export type VedicStrengthAndPanchangaSummary = {
  coordinateMode: VedicAyanamsaMode;
  ayanamsaDegreesApplied: number;
  panchanga: {
    tithi: { index: number; name: string; paksha: "Shukla (Waxing)" | "Krishna (Waning)"; ruler: string; meaning: string };
    vara: { name: string; ruler: string; meaning: string };
    yoga: { index: number; name: string; meaning: string };
    karana: { name: string; meaning: string };
  };
  charaKarakas: Array<{
    karaka: "Atmakaraka (AK)" | "Amatyakaraka (AmK)" | "Bhratrikaraka (BK)" | "Matrikaraka (MK)" | "Putrakaraka (PK)" | "Gnatikaraka (GK)" | "Darakaraka (DK)";
    planet: string;
    degreeInSign: number;
    signification: string;
  }>;
  arudhaLagnaview: {
    alSign: string;
    alHouseFromLagna: number;
    ulUpapadaSign: string;
    interpretation: string;
  };
  vimshottariDasha: {
    birthNakshatra: string;
    startingMahadashaLord: string;
    balanceAtBirthYears: number;
    currentActiveMahadasha?: string;
    currentActiveAntardasha?: string;
    interpretation: string;
  };
  navamshaD9Placements: Array<{
    body: string;
    d1Sign: string;
    d9Sign: string;
    isVargottama: boolean;
    d9Ruler: string;
    synthesis: string;
  }>;
  detectedYogas: DetectedVedicYoga[];
};

export type MedievalFirdariaPeriod = {
  planet: string;
  yearsSpan: number;
  startAge: number;
  endAge: number;
  subPeriods: Array<{ planet: string; startAge: number; endAge: number }>;
};

export type ArabicPersianTraditionSummary = {
  sect: "day" | "night" | "god-view-unsected";
  firdariaSystem: {
    variantUsed: "Abu Ma'shar / Alcabitius Standard" | "Nocturnal Node Variant";
    currentMajorLord?: string;
    currentSubLord?: string;
    activeAge?: number;
    explanation: string;
    provenance: ProvenanceRecord;
  };
  almutenFiguris: {
    winnerPlanet: string;
    scores: Record<string, number>;
    explanation: string;
    provenance: ProvenanceRecord;
  };
  extendedLots: Array<{
    lot: LotCanonRecord;
    longitude: number;
    display: string;
    sign: string;
    house: number;
    lord: string;
    lordHouse: number;
    houseInterpretation: string;
    variantNote?: string;
  }>;
  branchDoctrines: {
    nativities: string;
    elections: string;
    interrogations: string;
    mundaneIngressesAndConjunctions: string;
  };
};

export type RelationalHouseChainSynthesis = {
  house: number;
  houseTopic: string;
  signOnCusp: string;
  ruler: string;
  rulerSign: string;
  rulerHouse: number;
  inherentDignityVsDelivery: string;
  incomingAspectsToRuler: Array<{
    fromPlanet: string;
    aspect: string;
    orb: number;
    applying: boolean;
    effect: "strengthens" | "obstructs" | "disciplines-and-redirects" | "supports-with-reception" | "pressures-without-reception";
    receptionNote: string;
  }>;
  timingActivationStatus: string;
  humanRealityManifestation: string;
  supportedConclusions: string[];
  contradictionsOrQualifications: string[];
  uncertainties: string[];
  workedChainSummary: string;
};

export type ChartCanonDossier = {
  sect: "day" | "night" | "god-view-unsected";
  sectExplanation: string;
  placements: RetrievedPlacementDossier[];
  detectedMechanisms: DetectedTraditionalMechanism[];
  arabicLotsSummary: Array<{
    lot: LotCanonRecord;
    longitude: number;
    display: string;
    sign: string;
    house: number;
    houseInterpretation: string;
  }>;
  dispositorChains?: DispositorChainNode[];
  westernTimingActivations?: WesternTimingActivationRecord[];
  vedicJyotishSystem?: VedicStrengthAndPanchangaSummary;
  arabicPersianSystem?: ArabicPersianTraditionSummary;
  relationalChains?: RelationalHouseChainSynthesis[];
  formattedSummaryForInterpreter: string;
};
