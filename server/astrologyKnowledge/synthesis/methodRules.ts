import { ZODIAC_SIGNS, normalizeLongitude } from "../../../shared/hybrid";
import { SUMERIAN_CELESTIAL_ASSOCIATIONS, SUMERIAN_CELESTIAL_SOURCE_TITLE } from "../canon/sumerianCelestial";
import { ENERGY_ASPECT_FLOW } from "../../../shared/energyScoring";
import { CLASSICAL, REQUIRED, type Graha } from "../vedic/strength";
import {
  PLANET_CANON_RECORDS,
  SIGN_CANON_RECORDS,
  synthesizePlanetInSign,
} from "../canon/planetsAndSigns";
import {
  HOUSE_CANON_RECORDS,
  synthesizePlanetInHouse,
} from "../canon/housesAndFrames";
import { getManzilCanonByLongitude } from "../canon/manazil28";
import { getNakshatraCanonByLongitude } from "../canon/nakshatras27";
import {
  getDecanCanonByLongitude,
  elementalDecanTeaching,
} from "../canon/decans36";
import {
  FIXED_STAR_CANON_RECORDS,
  LOT_CANON_RECORDS,
} from "../canon/fixedStarsAndLots";
import { TRADITIONAL_ASPECT_DOCTRINE } from "../canon/dignitiesAndHorary";
import {
  DOUBLE_LETTERS,
  SIMPLE_LETTERS,
  CONTRARY_PAIRS,
} from "../canon/seferYetzirah";
import type { ChartRow } from "../../astronomy";
import type {
  LayerRecord,
  UnifiedMasterChartSnapshot,
} from "../../masterChart/types";
import type {
  CanonRuleApplication,
  FindingJudgment,
  HumanDomain,
  InterpretedProposition,
} from "./types";

type Data = Record<string, any>;
type Polarity = FindingJudgment["valence"];
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
const domains: Record<number, HumanDomain> = {
  1: "identity",
  2: "resources_wealth",
  3: "choices_obstacles",
  4: "family_home",
  5: "relationships",
  6: "energy_wellbeing",
  7: "relationships",
  8: "resources_wealth",
  9: "purpose_work",
  10: "purpose_work",
  11: "relationships",
  12: "choices_obstacles",
};
const roles: Record<string, string> = {
  Ascendant: "self-direction and embodied response",
  Descendant: "partners and the other party",
  Midheaven: "public action and vocation",
  Rahu: "development and unfamiliar direction",
  Ketu: "release and familiar patterns",
};
const aliases: Record<string, string> = {
  Rahu: "North Node",
  Ketu: "South Node",
};
function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`METHOD_RULE_INPUT_INVALID: ${message}`);
}
function record(value: unknown): Data {
  requireValue(
    value && typeof value === "object" && !Array.isArray(value),
    "Expected a calculated record"
  );
  return value as Data;
}
function finite(value: unknown, name: string): number {
  requireValue(
    typeof value === "number" && Number.isFinite(value),
    `${name} must be finite`
  );
  return value;
}
function signAt(longitude: number) {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)];
}
function role(body: string) {
  return (
    PLANET_CANON_RECORDS[aliases[body] ?? body]?.coreMeanings[0] ??
    roles[body] ??
    (() => {
      throw new Error(`CANON_RULE_MISSING: role for ${body}`);
    })()
  );
}
function houseText(house: number, god = false) {
  const h = HOUSE_CANON_RECORDS[house];
  requireValue(h, `Unknown house ${house}`);
  return god
    ? h.godViewDefinition.statement
    : `House ${house}: ${h.coreTopics[0]}`;
}
function point(snapshot: UnifiedMasterChartSnapshot, name: string): ChartRow {
  const chart = snapshot.natal;
  const rows = [
    ...(chart?.movingBodies ?? snapshot.baseCelestialState.planets),
    chart?.northNode,
    chart?.southNode,
    chart?.ascendant,
    chart?.descendant,
    chart?.midheaven,
    snapshot.baseCelestialState.ascendant,
    snapshot.baseCelestialState.descendant,
    snapshot.baseCelestialState.midheaven,
  ].filter(Boolean) as ChartRow[];
  const found = rows.find(row => row.name === (aliases[name] ?? name));
  requireValue(found, `Missing ${name} in this chart scope`);
  return found;
}
function condition(body: string, sign: string) {
  const p = PLANET_CANON_RECORDS[aliases[body] ?? body];
  if (!p)
    return {
      label: "angle/significator",
      valence: "neutral" as Polarity,
      text: `${body} describes ${role(body)} rather than planetary essential dignity.`,
    };
  const r = p.rulerships;
  if (r.domiciles.includes(sign))
    return {
      label: "domicile",
      valence: "supportive" as Polarity,
      text: `${body} rules ${sign}, so ${role(body)} acts from its own resources and priorities.`,
    };
  if (r.exaltationSign === sign)
    return {
      label: "exaltation",
      valence: "supportive" as Polarity,
      text: `${body} is exalted in ${sign}: ${role(body)} gains emphasis and visibility, with the demands of that elevated position.`,
    };
  if (r.detriments.includes(sign))
    return {
      label: "detriment",
      valence: "challenging" as Polarity,
      text: `${body} is in detriment in ${sign}; ${role(body)} must work through ${SIGN_CANON_RECORDS[sign].domicileLord}'s priorities rather than its own.`,
    };
  if (r.fallSign === sign)
    return {
      label: "fall",
      valence: "challenging" as Polarity,
      text: `${body} is in fall in ${sign}; the natural delivery of ${role(body)} is strained and needs deliberate adjustment.`,
    };
  return {
    label: "no domicile/exaltation/detriment/fall",
    valence: "neutral" as Polarity,
    text: `${body} is hosted by ${SIGN_CANON_RECORDS[sign].domicileLord} in ${sign}. This four-condition subset gives it no special essential status; house placement and the host's condition determine delivery. This four-condition dignity subset is distinct from the separately calculated Shadbala capacity.`,
  };
}

/** Executable applications of local Canon to actual finding values. No raw-dump fallback. */
export function applyMethodRules(
  layer: LayerRecord,
  root: UnifiedMasterChartSnapshot
): FindingJudgment[] {
  const baseId = layer.id.replace(/^transit:/, "");
  const event = layer.id.startsWith("transit:");
  const scope = event ? root.transit?.framework : root;
  requireValue(scope, `Event framework missing for ${layer.id}`);
  // An Agent-dependent method uses the already calculated local frame even
  // when the surrounding display is God View; no new horizon is fabricated.
  const snapshot =
    layer.frame === "agent" &&
    scope.natal?.worldview === "god" &&
    scope.baseCelestialState.ascendant
      ? {
          ...scope,
          natal: {
            ...scope.natal,
            worldview: "agent" as const,
            agentViewAvailable: true,
            movingBodies: scope.baseCelestialState.planets,
            ascendant: scope.baseCelestialState.ascendant,
            descendant: scope.baseCelestialState.descendant ?? null,
            northNode: scope.baseCelestialState.northNode,
            southNode: scope.baseCelestialState.southNode,
            houses: scope.baseCelestialState.houses.map(h => h.cusp),
          },
        }
      : scope;
  const god = snapshot.natal?.worldview === "god";
  const values: unknown[] = Array.isArray(layer.results)
    ? layer.results
    : layer.results == null
      ? []
      : [layer.results];
  const output: FindingJudgment[] = [];
  const sourceIds = layer.sourceIds;
  const evidence = (index: number) =>
    layer.evidenceIds[index] ?? layer.evidenceIds[0];
  function emit(
    index: number,
    subject: string,
    judgment: string,
    mechanism: string,
    ruleId: string,
    sourceTitle: string,
    domain: HumanDomain = "identity",
    valence: Polarity = "neutral",
    strength: FindingJudgment["strength"] = "moderate",
    extraEvidence: string[] = [],
    limitation?: string
  ) {
    const id = evidence(index);
    requireValue(id, `No calculated evidence for ${layer.id} finding ${index}`);
    const ids = Array.from(new Set([id, ...extraEvidence]));
    const rule: CanonRuleApplication = {
      canonEvidenceId: `applied:${layer.id}:${index}:${output.length}`,
      ruleId,
      sourceId: sourceIds[0] ?? "firmament-canon",
      sourceTitle,
      technique: layer.technique,
      subject,
      statement: `${mechanism} → ${judgment}`,
      calculationEvidenceIds: ids,
      confidence: "moderate",
      implementationStatus: "implemented",
    };
    output.push({
      ...(/^(Ascendant|Descendant|Midheaven)(?:$|[ –·])/.test(subject)
        ? { frame: "agent" as const }
        : {}),
      id: `prop-method-${layer.id}-${index}${output.some(o => o.id === `prop-method-${layer.id}-${index}`) ? `-${output.length}` : ""}`,
      subject,
      domain,
      judgment,
      mechanism,
      valence,
      strength,
      evidenceIds: ids,
      rules: [rule],
      ...(limitation ? { limitation } : {}),
    });
  }
  const localAngle = (body: string) =>
    ["Ascendant", "Descendant", "Midheaven"].includes(body);
  const bodyContext = (body: string) => {
    const p = point(snapshot!, body);
    return `${body} at ${p.display}; ${houseText(localAngle(body) ? (p.agentHouse ?? p.house) : p.house, god && !localAngle(body))}`;
  };
  const emitPlacement = (i: number, v: Data) => {
    const name = String(v.name ?? v.body),
      lon = finite(v.longitude, "longitude"),
      sign = signAt(lon);
    if (v.sign)
      requireValue(v.sign === sign, `${name} sign does not match longitude`);
    requireValue(PLANET_CANON_RECORDS[name], `No planetary Canon for ${name}`);
    const p = point(snapshot!, name),
      c = condition(name, sign);
    emit(
      i,
      name,
      `${synthesizePlanetInSign(name, sign)} ${god ? houseText(p.house, true) : synthesizePlanetInHouse(name, p.house, p.godHouse, p.agentHouse).houseSynthesis}`,
      `${name} at ${lon.toFixed(4)}° in ${sign}; sign lord ${SIGN_CANON_RECORDS[sign].domicileLord}`,
      "planet-sign-condition",
      SIGN_CANON_RECORDS[sign].provenance.sourceTitle,
      domains[p.house],
      c.valence,
      c.valence === "neutral" ? "moderate" : "strong"
    );
  };
  switch (baseId) {
    case "vedic-shadbala":
      requireValue(
        values.length === 7,
        "Shadbala requires all seven classical planets"
      );
      requireValue(
        new Set(values.map(v => record(v).body)).size === 7,
        "Duplicate Shadbala planet"
      );
      values.forEach((raw, index) => {
        const p = record(raw),
          body = p.body as Graha;
        requireValue(CLASSICAL.includes(body), "Unknown Shadbala planet");
        const components = record(p.components),
          keys = ["sthana", "dig", "kala", "cheshta", "naisargika", "drik"];
        const total = keys.reduce(
          (sum, key) => sum + finite(components[key], key),
          0
        );
        requireValue(
          Math.abs(total - finite(p.totalVirupas, "Shadbala total")) < 0.0001,
          "Shadbala component sum mismatch"
        );
        requireValue(
          p.requiredVirupas === REQUIRED[body] &&
            Math.abs(p.adequacyRatio - total / REQUIRED[body]) < 0.0001,
          "Shadbala threshold mismatch"
        );
        const sufficient = p.adequacyRatio >= 1,
          houses = (p.ownedHouses as number[])
            .map(h => houseText(h))
            .join("; ");
        emit(
          index,
          `${body} · Shadbala`,
          `${body}'s ${role(body)} has ${total.toFixed(2)} virupas (${(total / 60).toFixed(2)} rupas), against its ${REQUIRED[body]}-virupa traditional requirement: ${(p.adequacyRatio * 100).toFixed(1)}% of the requirement, ${sufficient ? "adequate operational capacity" : "below the requirement"}. Its six components are Sthana ${components.sthana.toFixed(2)}, Dig ${components.dig.toFixed(2)}, Kala ${components.kala.toFixed(2)}, Cheshta ${components.cheshta.toFixed(2)}, Naisargika ${components.naisargika.toFixed(2)}, and signed Drik ${components.drik.toFixed(2)} virupas. It governs ${houses || "no local house cusps"} and delivers these matters through ${houseText(p.house)}. ${sufficient ? "This planet can carry its responsibilities with greater force; its house rulership, condition, and contacts determine what that force serves." : "Its responsibilities may require more sustained effort, support, or cultivation; low capacity does not erase its topics or prove personal failure."} This is capacity, not a probability of success or a verdict that every strong planet is favorable.`,
          `Sixfold sum; ${total.toFixed(6)} / ${REQUIRED[body]} = ${p.adequacyRatio.toFixed(6)}; ${body} rules houses ${p.ownedHouses.join(", ")} and occupies H${p.house}`,
          "bphs-shadbala-six-components",
          "BPHS 26–27; The Absolute fixed-XYZ and Equal-House variant",
          p.ownedHouses.includes(5) || p.ownedHouses.includes(10)
            ? "purpose_work"
            : (domains[p.house] ?? "identity"),
          sufficient ? "supportive" : "challenging",
          p.adequacyRatio >= 1.25 ? "strong" : "moderate"
        );
      });
      break;
    case "vedic-bhava-bala": {
      requireValue(
        values.length === 12 &&
          new Set(values.map(v => record(v).house)).size === 12,
        "Bhava Bala requires twelve unique houses"
      );
      const average =
        values.reduce<number>(
          (sum, raw) => sum + finite(record(raw).totalVirupas, "house total"),
          0
        ) / 12;
      values.forEach((raw, index) => {
        const h = record(raw),
          components = record(h.components),
          total = Object.values(components).reduce<number>(
            (sum, value) => sum + finite(value, "house component"),
            0
          );
        requireValue(
          h.house >= 1 &&
            h.house <= 12 &&
            Math.abs(total - h.totalVirupas) < 0.0001,
          "Bhava component sum mismatch"
        );
        const above = total >= average;
        const example: Record<number, string> = {
          5: "This concerns the ability to bring your own ideas, craft, teaching, or creative projects into form; strength is not a guarantee of speculative winnings.",
          11: "This concerns help through friends, communities, patrons, networks and shared goals. Lower support can describe needing to build reliable alliances deliberately or relying on a smaller circle; it does not establish what other people think or why they act.",
        };
        emit(
          index,
          `House ${h.house} · Bhava Bala`,
          `${houseText(h.house)} scores ${total.toFixed(2)} virupas (${(total / 60).toFixed(2)} rupas), rank ${h.rank} of 12, ${above ? "at or above" : "below"} this chart's ${average.toFixed(2)}-virupa house average. Its lord ${h.lord} supplies ${components.lord.toFixed(2)} virupas and has ${(h.lordAdequacy * 100).toFixed(1)}% of its own Shadbala requirement, delivering the house through ${houseText(h.lordDeliveryHouse)}. Direction contributes ${components.direction.toFixed(2)}, aspects ${components.aspect.toFixed(2)}, occupancy ${components.occupancy.toFixed(2)}, and rising-type timing ${components.risingType.toFixed(2)} virupas. ${example[h.house] ?? (above ? "The house has comparatively greater capacity to carry its matters; its specific lord, occupants, aspects and timing determine the expression." : "This house has less capacity relative to the other houses in this chart; its matters can require more cultivation, resources or cooperation.")} A relative house ranking is not an absolute success/failure threshold.`,
          `Bhava = lord + direction + aspects + occupancy + rising-type timing; H${h.house} ${total.toFixed(6)}; chart average ${average.toFixed(6)}`,
          "bphs-bhava-bala-components",
          "BPHS 27.26–31; The Absolute Equal-House cusp-reference variant",
          h.house === 5 ? "purpose_work" : domains[h.house],
          above ? "supportive" : "challenging",
          "strong"
        );
      });
      const fifth = record(values.find(v => record(v).house === 5)),
        eleventh = record(values.find(v => record(v).house === 11));
      const higher =
        fifth.totalVirupas > eleventh.totalVirupas
          ? 5
          : eleventh.totalVirupas > fifth.totalVirupas
            ? 11
            : 0;
      emit(
        values.findIndex(v => record(v).house === 5),
        "Creative output and network support",
        `House 5 (your creative expression and creations) has ${fifth.totalVirupas.toFixed(2)} virupas; House 11 (friends, networks, patrons and shared gains) has ${eleventh.totalVirupas.toFixed(2)}. ${higher === 5 ? "The calculated comparison gives your own creative output more capacity than support through networks. That can look like having something substantial to create while needing to build its audience and alliances deliberately." : higher === 11 ? "The calculated comparison gives network support more capacity than creative output. Alliances and shared goals can provide resources, while turning ideas into your own finished work needs separate attention." : "These two houses have equal calculated capacity; their lords and timing distinguish how their matters are expressed."} This compares two calculated channels; it does not infer a biography or other people's motives.`,
        `H5 ${fifth.totalVirupas.toFixed(6)} versus H11 ${eleventh.totalVirupas.toFixed(6)}; difference ${(fifth.totalVirupas - eleventh.totalVirupas).toFixed(6)} virupas`,
        "bphs-house5-house11-capacity-comparison",
        "Local comparison of BPHS Bhava Bala results",
        "purpose_work",
        "neutral",
        "strong",
        [evidence(values.findIndex(v => record(v).house === 11))!]
      );
      break;
    }
    case "western-planets-and-signs":
      values.forEach((v, i) => emitPlacement(i, record(v)));
      break;
    case "western-houses-and-angles": {
      const v = record(values[0]);
      requireValue(
        v.ascendant && Array.isArray(v.houses),
        "Houses require a real Ascendant and cusp array"
      );
      for (const h of v.houses) {
        const house = finite(h.house, "house");
        const sign = String(h.sign);
        const canon = HOUSE_CANON_RECORDS[house];
        requireValue(
          canon && SIGN_CANON_RECORDS[sign],
          "Unknown house or cusp sign"
        );
        const occupants = snapshot.baseCelestialState.planets.filter(
          p => p.agentHouse === house || (!p.agentHouse && p.house === house)
        );
        const lord = SIGN_CANON_RECORDS[sign].domicileLord,
          ruler = point(snapshot, lord);
        emit(
          0,
          `House ${house}`,
          `${canon.traditionalTitle} governs ${canon.coreTopics.join(", ")}. Its ${sign} cusp places those matters under ${lord}, whose placement in House ${ruler.agentHouse ?? ruler.house} links them to ${HOUSE_CANON_RECORDS[ruler.agentHouse ?? ruler.house].coreTopics.join(", ")}. ${occupants.length ? occupants.map(p => `${p.name} brings ${role(p.name)}`).join("; ") : "No moving planet occupies this house; its lord remains the delivery route."}`,
          `Equal House cusp ${house} at ${h.cusp}°; ${sign} ruled by ${lord}`,
          "house-lord-delivery",
          canon.agentViewDefinition.provenance.sourceTitle,
          domains[house],
          "neutral",
          canon.angularity.startsWith("Angular") ? "strong" : "moderate",
          layer.evidenceIds.filter(
            id =>
              id.endsWith(`house-${house}`) ||
              (house === 7 && id.endsWith("angle-descendant"))
          )
        );
      }
      break;
    }
    case "western-aspects-and-orbs":
    case "transit-activation-layer":
      values.forEach((value, i) => {
        const v = record(value),
          transit = baseId === "transit-activation-layer";
        const first = String(v.transitBody ?? v.body1),
          second = String(v.natalBody ?? v.body2),
          aspect = String(v.aspect).toLowerCase(),
          orb = finite(v.orb, "orb");
        requireValue(
          aspect in ENERGY_ASPECT_FLOW && orb >= 0 && orb <= 5,
          `Unsupported ${aspect} or orb ${orb}`
        );
        const flow =
          ENERGY_ASPECT_FLOW[aspect as keyof typeof ENERGY_ASPECT_FLOW];
        const doctrine =
          TRADITIONAL_ASPECT_DOCTRINE[aspect] ??
          (aspect === "quincunx" || aspect === "semisextile"
            ? TRADITIONAL_ASPECT_DOCTRINE.aversion
            : undefined);
        const target = point(snapshot, second),
          moving = transit
            ? root.transit?.planets.find(p => p.name === first)
            : point(snapshot, first);
        requireValue(moving, `Missing aspect body ${first}`);
        const ruleMeaning =
          doctrine?.traditionalMeaning ??
          "A half-weight minor friction contact, under The Absolute's configured aspect policy.";
        emit(
          i,
          `${transit ? "Transit " : ""}${first} ${aspect} ${transit ? "natal " : ""}${second}`,
          `${transit ? "At the selected transit moment, " : ""}${first}'s ${role(first)} ${flow === 1 ? "cooperates with and activates" : "presses against"} ${second}'s ${role(second)}. ${ruleMeaning} ${houseText(moving.house, transit ? root.natal?.worldview === "god" : god)} meets ${houseText(target.house, god)}. At ${orb.toFixed(3)}° orb ${orb < 1 ? "this is a close, high-intensity contact" : "the contact is less concentrated than an exact alignment"}; ${flow === 1 ? "the opening works through the specific cooperation between those fields" : "both demands must be addressed; favoring one alone leaves the other in conflict"}.`,
          `${first} ${aspect} ${second}, orb ${orb}°; configured flow ${flow}${v.majorFactor === 0.5 ? ", half major weight" : ""}`,
          `aspect-${aspect}`,
          doctrine?.provenance ?? "The Absolute configured minor-aspect rule",
          transit ? "timing" : domains[target.house],
          flow === 1 ? "supportive" : "challenging",
          orb < 1 ? "dominant" : orb < 3 ? "strong" : "moderate"
        );
      });
      break;
    case "western-essential-dignities":
      values.forEach((value, i) => {
        const v = record(value),
          body = String(v.body),
          sign = String(v.sign);
        requireValue(SIGN_CANON_RECORDS[sign], `Unknown dignity sign ${sign}`);
        const c = condition(body, sign);
        const p = point(snapshot, body);
        emit(
          i,
          body,
          `${c.text} ${houseText(p.house, god)} is where that capacity or constraint is delivered.`,
          `${body} in ${sign}; canonical essential condition ${c.label}`,
          `essential-${c.label}`,
          "Local planetary rulership and sign Canon (dignitiesAndHorary / planetsAndSigns)",
          domains[p.house],
          c.valence,
          c.valence === "neutral" ? "moderate" : "strong"
        );
      });
      break;
    case "fixed-stars-royal-watchers":
      values.forEach((value, i) => {
        const v = record(value),
          name = String(v.name),
          contacts = v.contacts;
        requireValue(
          Array.isArray(contacts),
          `Missing star contacts for ${name}`
        );
        const canon = FIXED_STAR_CANON_RECORDS.find(s => s.name === name);
        requireValue(canon, `Unknown star ${name}`);
        if (!contacts.length)
          emit(
            i,
            name,
            `${name} has no activated conjunction within the calculated 5° window. Its stellar meaning does not supply a personal judgment in this sky.`,
            `No qualifying ${name} contacts`,
            "star-not-activated",
            canon.provenance.sourceTitle,
            "autonomy_power",
            "neutral",
            "subtle"
          );
        for (const contact of contacts) {
          const orb = finite(contact.orb, "star orb");
          requireValue(orb >= 0 && orb <= 5, "Invalid star activation orb");
          const body = String(contact.body),
            known =
              canon.ptolemaicPlanetaryNature !== "Not yet source-verified";
          emit(
            i,
            `${body}–${name}`,
            known
              ? `${body}'s ${role(body)} activates ${name} at ${orb.toFixed(2)}°: ${canon.traditionalMeaning} Constructive delivery: ${canon.giftWhenIntegrated} The corresponding test is ${canon.nemesisOrTest}`
              : `${body} is measured ${orb.toFixed(2)}° from ${name}. This catalog entry has no verified star-specific doctrine; the contact is retained as geometry and contributes no traditional stellar prediction.`,
            `${name} conjunction ${body} at ${orb}°`,
            known ? "star-contact-doctrine" : "star-contact-reference",
            canon.provenance.sourceTitle,
            "autonomy_power",
            known ? "transformative" : "neutral",
            known ? (orb < 1 ? "dominant" : "strong") : "subtle",
            [],
            known
              ? undefined
              : `${name}: star-specific doctrine is source-unverified; geometry only.`
          );
        }
      });
      break;
    case "arabic-hermetic-lots":
      values.forEach((value, i) => {
        const v = record(value),
          canon = LOT_CANON_RECORDS[v.key];
        requireValue(canon, `Unknown Lot ${v.key}`);
        const sign = String(v.sign),
          house = finite(v.house, "Lot house");
        requireValue(SIGN_CANON_RECORDS[sign], "Invalid Lot sign");
        const lord = SIGN_CANON_RECORDS[sign].domicileLord,
          ruler = point(snapshot, lord),
          c = condition(lord, signAt(ruler.longitude));
        emit(
          i,
          canon.name,
          `${canon.traditionalMeaning} Here ${canon.name} falls in ${sign}, ${houseText(house)}. Its lord ${lord} delivers these matters through ${houseText(ruler.agentHouse ?? ruler.house)}. ${c.text} This links the Lot's specific topic to the lord's circumstances rather than making all Lots equivalent.`,
          `${canon.name}: ${v.formula}; ${v.display}; lord ${lord} at ${ruler.display}`,
          `lot-${v.key}-lord-delivery`,
          canon.provenance.sourceTitle,
          v.key === "eros"
            ? "relationships"
            : v.key === "spirit"
              ? "purpose_work"
              : "resources_wealth",
          c.valence,
          "strong"
        );
      });
      break;
    case "arabic-lunar-manazil":
      values.forEach((value, i) => {
        const v = record(value),
          body = String(v.body),
          m = getManzilCanonByLongitude(
            finite(v.longitude, "Manzil longitude")
          );
        requireValue(
          v.manzilNumber === m.index,
          `Manzil index differs from ${body}'s longitude`
        );
        emit(
          i,
          body,
          `${body}'s ${role(body)} operates through ${m.name} (${m.englishTranslation}), recorded as ${m.traditionalQuality}. ${m.natalAndPsychologicalMeaning} This modifies ${bodyContext(body)}; its traditional operational emphasis is ${m.traditionalElections}.`,
          `${body} at ${v.longitude}° in Manzil ${m.index}`,
          `manzil-${m.index}`,
          m.provenance.sourceTitle,
          domains[point(snapshot, body).house],
          m.traditionalQuality === "Fortunate"
            ? "supportive"
            : m.traditionalQuality === "Unfortunate"
              ? "challenging"
              : "neutral"
        );
      });
      break;
    case "vedic-nakshatras-and-padas":
      values.forEach((value, i) => {
        const v = record(value),
          body = String(v.body),
          n = getNakshatraCanonByLongitude(
            finite(v.longitude, "Nakshatra longitude")
          );
        requireValue(
          v.nakshatraNumber === n.nakshatra.index && v.pada === n.pada.pada,
          `Nakshatra/Pada differs from ${body}'s longitude`
        );
        const lordName = n.nakshatra.vimshottariRuler.replace(/\s*\(.*\)/, "");
        const lord = point(snapshot, lordName);
        const c = condition(lord.name, signAt(lord.longitude));
        emit(
          i,
          body,
          `${body}'s ${role(body)} takes the ${n.nakshatra.name} pattern: ${n.nakshatra.coreMeaning} ${n.nakshatra.psychologicalPattern} ${n.nakshatra.deity} and the shakti ${n.nakshatra.shakti} specify its mode of action. Pada ${n.pada.pada} refines it through ${n.pada.emphasis} (${n.pada.navamshaSign}, ruler ${n.pada.navamshaRuler}). The mansion lord ${lord.name} is at ${lord.display}, ${houseText(localAngle(body) ? (lord.agentHouse ?? lord.house) : lord.house, god && !localAngle(body))}; ${c.text}`,
          `${body} ${n.nakshatra.name} pada ${n.pada.pada}; lord ${lord.name}`,
          `nakshatra-${n.nakshatra.index}-pada-${n.pada.pada}`,
          n.nakshatra.provenance.sourceTitle,
          domains[point(snapshot, body).house],
          c.valence,
          "strong"
        );
      });
      break;
    case "elemental-decans":
      values.forEach((value, i) => {
        const v = record(value),
          body = String(v.body),
          d = getDecanCanonByLongitude(finite(v.longitude, "decan longitude"));
        requireValue(
          v.decanIndex === d.index,
          `Decan differs from ${body}'s longitude`
        );
        const teaching = elementalDecanTeaching(d);
        const ruler = point(snapshot, d.triplicitySubRuler),
          c = condition(ruler.name, signAt(ruler.longitude));
        emit(
          i,
          body,
          `${body}'s ${role(body)} is refined by ${teaching.label}: ${teaching.statement} The elemental-family ruler ${ruler.name} is at ${ruler.display}, ${houseText(localAngle(body) ? (ruler.agentHouse ?? ruler.house) : ruler.house, god && !localAngle(body))}. ${c.text} Its condition modifies how this decan's ${teaching.label} can be delivered.`,
          `${body} ${v.longitude}°; decan ${d.index}; elemental-family ruler ${ruler.name}`,
          `elemental-decan-${d.index}`,
          teaching.sourceTitle,
          domains[point(snapshot, body).house],
          c.valence
        );
      });
      break;
    case "vedic-vargas-divisional":
      values.forEach((value, i) => {
        const v = record(value);
        requireValue(
          ["D1", "D2", "D3", "D9", "D10"].includes(v.division) &&
            Array.isArray(v.placements),
          "Unsupported divisional result"
        );
        for (const p of v.placements) {
          requireValue(
            SIGN_CANON_RECORDS[p.sign] && HOUSE_CANON_RECORDS[p.house],
            "Invalid varga placement"
          );
          const body = String(p.body),
            c = condition(body, p.sign),
            same = p.sign === p.sourceSign;
          emit(
            i,
            `${v.division} ${body}`,
            `${v.name} addresses ${v.purpose}. ${body}, the significator of ${role(body)}, falls in ${p.sign}, ${houseText(p.house)} within ${v.division}. ${c.text} ${same ? `Its sign repeats D1 ${p.sourceSign}, reinforcing that sign's mode in this particular division` : `D1 ${p.sourceSign} becomes ${p.sign}, so this topic calls for a different mode of expression from its D1 sign`}. The divisional lord ${SIGN_CANON_RECORDS[p.sign].domicileLord} qualifies delivery; this finding modifies this division's topic rather than replacing D1.`,
            `${v.division}: ${p.formula}; ${body} ${p.longitude}°; source ${p.sourceLongitude}°`,
            `${v.division.toLowerCase()}-topic-sign-condition`,
            "Local Parashari divisional definitions and planetary/sign Canon; explicit Firmament coordinate variant",
            v.division === "D2"
              ? "resources_wealth"
              : v.division === "D9"
                ? "relationships"
                : v.division === "D3"
                  ? "family_home"
                  : "purpose_work",
            c.valence,
            "moderate",
            [],
            "Derived chart; no independent ephemeris or independent confirmation of D1."
          );
        }
      });
      break;
    case "vedic-dasha-and-ashtakavarga":
      values.forEach((value, i) => {
        const v = record(value),
          data = record(v.calculation);
        if (v.technique === "dasha") {
          requireValue(
            data.available && Array.isArray(data.activeLords),
            "No structured active Dasha result"
          );
          if (!data.activeLords.length)
            emit(
              i,
              "Dasha window",
              `The evaluated instant ${data.asOf} lies outside the generated period window. No active period or easing date is inferred.`,
              "No active period in the supplied timeline",
              "dasha-outside-window",
              "Local Vimshottari period calculation",
              "timing",
              "neutral",
              "subtle"
            );
          for (const period of data.activeLords) {
            const lord = point(snapshot, period.lord),
              sign = signAt(lord.longitude),
              c = condition(lord.name, sign);
            const ruled = Object.values(HOUSE_CANON_RECORDS)
              .filter(h => {
                const cusp = snapshot.baseCelestialState.houses[h.house - 1];
                return (
                  cusp &&
                  SIGN_CANON_RECORDS[cusp.sign].domicileLord === lord.name
                );
              })
              .map(h => `${h.house} (${h.coreTopics[0]})`);
            emit(
              i,
              `${period.level} ${lord.name}`,
              `${period.level} ${lord.name}, ${period.start}–${period.end}, activates ${role(lord.name)} through ${houseText(lord.house, god)}${ruled.length ? `, with rulership over houses ${ruled.join("; ")}` : ""}. ${c.text} ${period.level === "Mahadasha" ? "This is the governing period theme" : "This subperiod channels and modifies the governing period through this lord's specific matters"}.`,
              `${period.level}: ${period.lord}, ${period.start}–${period.end}; evaluated ${data.asOf}`,
              "vimshottari-active-lord-delivery",
              "Local Vimshottari timeline and planetary/house rulership Canon",
              "timing",
              c.valence,
              period.level === "Mahadasha" ? "dominant" : "strong"
            );
          }
        } else if (v.technique === "ashtakavarga") {
          requireValue(
            data.available &&
              data.total === 337 &&
              Array.isArray(data.sav) &&
              Array.isArray(data.bav),
            "Invalid BAV/SAV data"
          );
          const scores = data.sav.map((r: Data) =>
            finite(r.score, "SAV score")
          );
          requireValue(
            scores.reduce((a: number, b: number) => a + b, 0) === 337,
            "SAV checksum mismatch"
          );
          const mean = 337 / 12;
          const totals: Record<string, number> = {
            Sun: 48,
            Moon: 49,
            Mars: 39,
            Mercury: 54,
            Jupiter: 56,
            Venus: 52,
            Saturn: 39,
          };
          requireValue(
            data.bav.length === 7 &&
              new Set(data.bav.map((row: Data) => row.planet)).size === 7,
            "BAV requires seven distinct classical contributors"
          );
          for (const row of data.bav) {
            requireValue(
              totals[row.planet] &&
                Array.isArray(row.scores) &&
                row.scores.length === 12 &&
                row.scores.every(
                  (n: unknown) =>
                    Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 8
                ),
              "Malformed BAV row"
            );
            requireValue(
              row.scores.reduce((a: number, b: number) => a + b, 0) ===
                totals[row.planet],
              "BAV row checksum mismatch"
            );
          }
          requireValue(
            data.sav.every(
              (entry: Data, index: number) =>
                entry.score ===
                data.bav.reduce(
                  (sum: number, row: Data) => sum + row.scores[index],
                  0
                )
            ),
            "SAV differs from BAV column sums"
          );
          for (const entry of data.sav) {
            const idx = ZODIAC_SIGNS.indexOf(entry.sign);
            requireValue(idx >= 0, "Invalid SAV sign");
            const residents = snapshot.baseCelestialState.planets.filter(
              p => signAt(p.longitude) === entry.sign
            );
            const support =
              entry.score > mean
                ? "above"
                : entry.score < mean
                  ? "below"
                  : "at";
            emit(
              i,
              `SAV ${entry.sign}`,
              `${entry.sign} receives ${entry.score} SAV bindus, ${support} this chart's ${mean.toFixed(2)}-bindu mean. In this model it offers ${entry.score > mean ? "relatively greater combined support" : "relatively less combined support"}${residents.length ? ` to ${residents.map(p => `${p.name}'s ${role(p.name)}`).join("; ")}` : " with no moving planet currently occupying that sign"}. ${data.bav
                .filter((r: Data) => residents.some(p => p.name === r.planet))
                .map(
                  (r: Data) =>
                    `${r.planet}'s own BAV in ${entry.sign} is ${r.scores[idx]}, distinct from the combined SAV.`
                )
                .join(
                  " "
                )} This is a relative support comparison, not Shadbala or an event probability.`,
              `${entry.sign} SAV ${entry.score}; validated total 337; chart-relative comparison`,
              "ashtakavarga-relative-support",
              "Local unreduced Parashari BAV/SAV tables and checksum rule",
              "timing",
              entry.score > mean ? "supportive" : "challenging",
              "moderate"
            );
          }
        } else
          throw new Error(
            `METHOD_RULE_MISSING: timing technique ${v.technique}`
          );
      });
      break;
    case "vedic-graha-drishti":
      values.forEach((value, i) => {
        const v = record(value),
          body = String(v.planet),
          offset = finite(v.targetHouseOffset, "Drishti offset");
        requireValue(
          offset === 7 ||
            (body === "Mars" && [4, 8].includes(offset)) ||
            (body === "Jupiter" && [5, 9].includes(offset)) ||
            (body === "Saturn" && [3, 10].includes(offset)),
          "Unregistered Drishti rule"
        );
        requireValue(
          SIGN_CANON_RECORDS[v.targetSign],
          "Missing Drishti target sign"
        );
        const targetSign = String(v.targetSign),
          occupants = snapshot.baseCelestialState.planets.filter(
            p => signAt(p.longitude) === targetSign
          ),
          source = point(snapshot, body),
          c = condition(body, signAt(source.longitude));
        const quality =
          body === "Jupiter"
            ? "growth, counsel and protection"
            : body === "Saturn"
              ? "discipline, delay and sustained responsibility"
              : body === "Mars"
                ? "assertion, effort and confrontation"
                : role(body);
        emit(
          i,
          `${body} → ${targetSign}`,
          `${body}'s ${offset === 7 ? "universal seventh" : "special " + offset + "th"} Drishti directs ${quality} into ${targetSign}. ${occupants.length ? occupants.map(p => `${p.name}'s ${role(p.name)} in ${houseText(p.house, god)} receives that influence`).join("; ") : "No moving planet occupies that target sign; the sign remains the receiving field"}. ${c.text}`,
          `${body} at ${source.display} aspects ${targetSign}, inclusive offset ${offset}`,
          `graha-drishti-${body.toLowerCase()}-${offset}`,
          "Local Parashari universal/special Drishti offsets and planetary Canon",
          "autonomy_power",
          body === "Jupiter"
            ? "supportive"
            : ["Mars", "Saturn"].includes(body)
              ? "challenging"
              : c.valence,
          "strong"
        );
      });
      break;
    case "sumerian-celestial-foundations":
      values.forEach((value, i) => {
        const v = record(value);
        const body = String(v.body);
        requireValue(
          Object.prototype.hasOwnProperty.call(SUMERIAN_CELESTIAL_ASSOCIATIONS, body) &&
          typeof v.longitude === "number" && Number.isFinite(v.longitude) &&
          typeof v.display === "string",
          "Sumerian celestial reading requires a calculated position and attested correspondence"
        );
        const a = SUMERIAN_CELESTIAL_ASSOCIATIONS[body as keyof typeof SUMERIAN_CELESTIAL_ASSOCIATIONS];
        emit(
          i,
          body,
          `${body} at ${v.display} echoes Sumerian ${a.name}: ${a.historicalMeaning} Modern lens: ${a.modernInterpretiveLens}`,
          `Historically attested ${body} / ${a.name}; interpretive extension explicitly modern`,
          `sumerian-celestial-${body.toLowerCase()}`,
          SUMERIAN_CELESTIAL_SOURCE_TITLE,
          body === "Venus" ? "relationships" : body === "Moon" ? "family_home" : "identity",
          "neutral",
          "subtle",
          [],
          a.limit
        );
      });
      break;
    case "kabbalah-sefer-yetzirah":
      values.forEach((value, i) => {
        const v = record(value);
        requireValue(
          typeof v.statement === "string" && v.sourceTrace?.sourceTitle,
          "Missing Sefer Yetzirah source record"
        );
        const body = String(v.subject),
          p = [
            ...(snapshot.natal?.movingBodies ?? []),
            snapshot.natal?.northNode,
            snapshot.natal?.southNode,
          ].find(row => row?.name === body);
        if (v.technique === "sefer-yetzirah-doubles") {
          const d = DOUBLE_LETTERS.find(d => d.planet === body);
          requireValue(d && p, "Unmatched double-letter result");
          emit(
            i,
            body,
            `${body}'s ${role(body)} at ${p.display}, ${houseText(p.house, god)}, is read through ${d.name} (${d.letter}) and ${d.quality} in the supplied Westcott supplement. The specific task is to bring ${d.quality} into how ${body}'s functions are expressed in that field. The text supplies ${CONTRARY_PAIRS.map(pair => pair.join("/")).join(", ")} collectively; no individual contrary pair is assigned to ${body}.`,
            `${body} ↔ ${d.name}/${d.quality}; Westcott attribution variant`,
            "sefer-yetzirah-planetary-double",
            v.sourceTrace.sourceTitle,
            "choices_obstacles",
            "neutral",
            "moderate",
            [],
            "Textual variant; no physical or predictive score is inferred."
          );
        } else if (v.technique === "sefer-yetzirah-simples") {
          requireValue(p, "Missing planetary anchor for simple letter");
          const simple =
            SIMPLE_LETTERS[Math.floor(normalizeLongitude(p.longitude) / 30)];
          emit(
            i,
            body,
            `${body}'s ${role(body)} occupies ${simple.sign}, the ${simple.name} (${simple.letter}) gate in this recension. ${SIGN_CANON_RECORDS[simple.sign].psychologicalTheme} This directs the sign-letter attention into ${houseText(p.house, god)}.`,
            `${body} ${simple.sign} ↔ ${simple.name}`,
            "sefer-yetzirah-sign-simple",
            v.sourceTrace.sourceTitle,
            domains[p.house],
            "neutral",
            "moderate",
            [],
            simple.variant
          );
        } else
          emit(
            i,
            body,
            v.statement,
            `${v.technique}; supplied textual framework`,
            String(v.ruleId ?? v.sourceTrace.ruleId),
            v.sourceTrace.sourceTitle,
            "choices_obstacles",
            "neutral",
            "subtle",
            [],
            "Collective textual framework; no invented planet-pair or sefirah allocation."
          );
      });
      break;
    case "genesis-behavioral-patterns":
      values.forEach((value, i) => {
        const v = record(value);
        requireValue(
          Array.isArray(v.dominantPatterns) &&
            v.planetaryStrength &&
            v.houseEmphasis,
          "Malformed Genesis analysis"
        );
        for (const pattern of v.dominantPatterns) {
          requireValue(
            typeof pattern.description === "string" &&
              Array.isArray(pattern.planets) &&
              Number.isFinite(pattern.strength) &&
              pattern.strength >= 0 &&
              pattern.strength <= 1,
            "Malformed detected pattern"
          );
          emit(
            i,
            pattern.name,
            `${pattern.description} The engine detects ${pattern.name} among ${pattern.planets.join(", ")} in signs ${pattern.signs.join(", ")} and houses ${pattern.houses.join(", ")}, with recorded strength ${pattern.strength.toFixed(3)}. ${pattern.planets.map((p: string) => `${p} contributes ${role(p)}`).join("; ")}. ${pattern.houses.map((h: number) => houseText(h, god)).join("; ")}. These participants make this pattern's operation specific to this chart.`,
            `${pattern.type}; recorded participants and normalized engine strength`,
            `genesis-${pattern.type}`,
            "Local Genesis patternEngine detection and description rules",
            "choices_obstacles",
            ["grand_trine", "kite"].includes(pattern.type)
              ? "supportive"
              : ["t_square", "grand_cross", "yod"].includes(pattern.type)
                ? "challenging"
                : "neutral",
            pattern.strength >= 0.7 ? "strong" : "moderate"
          );
        }
        for (const [h, raw] of Object.entries(v.houseEmphasis)) {
          const entry = record(raw),
            house = Number(h);
          if (!entry.planetCount) continue;
          requireValue(
            Array.isArray(entry.planets),
            "Missing house-pattern participants"
          );
          emit(
            i,
            `Genesis house ${house}`,
            `${entry.planetCount} recorded planet(s)—${entry.planets.join(", ")}—concentrate activity in ${houseText(house, god)}. ${entry.planets.map((p: string) => `${p} supplies ${role(p)}`).join("; ")}; the emphasis is specifically in those matters rather than a whole-life personality label.`,
            `House ${house}: ${entry.planetCount} planets; engine strength ${entry.strength}`,
            "genesis-house-concentration",
            "Local Genesis house-emphasis calculation and house Canon",
            domains[house],
            "neutral",
            entry.planetCount >= 3 ? "strong" : "moderate"
          );
        }
        requireValue(Array.isArray(v.yogas), "Missing configured Yoga results");
        const yogaId = layer.evidenceIds.find(id =>
          id.endsWith("genesis-yogas")
        );
        requireValue(yogaId, "Missing Yoga evidence lineage");
        if (v.yogas.length)
          for (const yoga of v.yogas) {
            requireValue(
              yoga.detected === true && yoga.name === "Hamsa Yoga",
              "Unsupported Yoga rule result"
            );
            const jupiter = point(snapshot, "Jupiter"),
              sign = signAt(jupiter.longitude),
              house = jupiter.agentHouse ?? jupiter.house;
            requireValue(
              [1, 4, 7, 10].includes(house) &&
                ["Sagittarius", "Pisces"].includes(sign),
              "Hamsa Yoga conditions do not match this chart"
            );
            emit(
              i,
              "Hamsa Yoga",
              `Jupiter occupies its own sign ${sign} in angular House ${house}. In the configured Hamsa Yoga rule, Jupiter's ${role("Jupiter")} has both its own resources and a direct outlet through ${houseText(house)}. This supports counsel, learning and principled leadership in that field; it is a specific traditional indication, not a guarantee of rank or events.`,
              `Jupiter in own sign ${sign}, Kendra ${house}`,
              "genesis-hamsa-own-sign-kendra",
              "Local vedicYogaDetector Hamsa conditions and Jupiter Canon",
              "purpose_work",
              "supportive",
              "strong",
              [yogaId]
            );
          }
        else
          emit(
            i,
            "Configured Yoga absence",
            `No configured Hamsa Yoga was detected. ${v.yogaScope}. No other Yoga is inferred from this sub-engine.`,
            "No match for the local Hamsa detection conditions",
            "genesis-hamsa-not-detected",
            "Local vedicYogaDetector conditions",
            "purpose_work",
            "neutral",
            "subtle",
            [yogaId]
          );
        if (!output.length)
          emit(
            i,
            "Genesis pattern absence",
            "No configured dominant pattern or occupied-house emphasis was returned. No personality or event judgment is inferred from an empty detection result.",
            "Validated engine returned no qualifying patterns",
            "genesis-no-pattern",
            "Local Genesis pattern detection",
            "choices_obstacles",
            "neutral",
            "subtle"
          );
      });
      break;
    default:
      throw new Error(`METHOD_RULE_MISSING: ${baseId}`);
  }
  return output;
}
