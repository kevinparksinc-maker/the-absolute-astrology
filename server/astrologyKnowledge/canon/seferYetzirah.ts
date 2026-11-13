/** Sefer Yetzirah / Four Worlds knowledge layer.
 * These are historically situated symbolic correspondences, not physical causes.
 * 32 paths = 10 sefirot + 22 letters (3 mothers, 7 doubles, 12 simples).
 * The Four Worlds belong to later Kabbalistic cosmology, not the text of Sefer Yetzirah itself.
 * Source: https://sacred-texts.com/jud/yetzirah.htm (Westcott translation, textual variant)
 * Four worlds: https://www.jewishencyclopedia.com/articles/3073-beriah
 * https://sefaria.jewishencyclopedia.com/articles/2012-asiyah
 */
import { ZODIAC_SIGNS, normalizeLongitude } from "../../../shared/hybrid";
import type { ChartResult } from "../../astronomy";
import type { EvidenceItem } from "../types";

const BASE="https://sacred-texts.com/jud/yetzirah.htm";
const WORLDS_SOURCE="https://www.jewishencyclopedia.com/articles/3073-beriah";
export const MOTHER_LETTERS = [
  {letter:"א",name:"Aleph",element:"Air"},
  {letter:"מ",name:"Mem",element:"Water"},
  {letter:"ש",name:"Shin",element:"Fire"},
] as const;
export const SIMPLE_LETTERS=[
  {letter:"ה",name:"Heh"},{letter:"ו",name:"Vav"},{letter:"ז",name:"Zayin"},
  {letter:"ח",name:"Chet"},{letter:"ט",name:"Tet"},{letter:"י",name:"Yod"},
  {letter:"ל",name:"Lamed"},{letter:"נ",name:"Nun"},{letter:"ס",name:"Samekh"},
  {letter:"ע",name:"Ayin"},{letter:"צ",name:"Tsadi"},{letter:"ק",name:"Qoph"},
].map((v,i)=>({...v,sign:ZODIAC_SIGNS[i],variant:"Westcott / Short recension family; compare editions"}));
/** The planetary ordering below is one explicitly identified textual variant.
 * It must never be presented as the only authentic Sefer Yetzirah assignment.
 */
export const DOUBLE_LETTERS=[
  {letter:"ב",name:"Bet",planet:"Moon",quality:"wisdom"},
  {letter:"ג",name:"Gimel",planet:"Mars",quality:"health"},
  {letter:"ד",name:"Dalet",planet:"Sun",quality:"fertility"},
  {letter:"כ",name:"Kaf",planet:"Venus",quality:"life"},
  {letter:"פ",name:"Pe",planet:"Mercury",quality:"power"},
  {letter:"ר",name:"Resh",planet:"Saturn",quality:"peace"},
  {letter:"ת",name:"Tav",planet:"Jupiter",quality:"beauty"},
] as const;
/** These pairs appear as a GROUP in Westcott chapter IV; the supplement
 * gives planet-letter-quality rows but does not pair each letter with
 * this same chapter-IV order of opposite pairs. Keep this distinction.
 */
export const CONTRARY_PAIRS=[
  ["life","death"],["peace","war"],["wealth","poverty"],["beauty","disrepute"],
  ["wisdom","folly"],["fruitfulness","sterility"],["power","servitude"]
] as const;
export const FOUR_WORLDS=[
  {name:"Atzilut",hebrew:"אצילות",stage:"Emanation",question:"What is the originating principle?"},
  {name:"Beriah",hebrew:"בריאה",stage:"Creation",question:"What possibility or intention takes shape?"},
  {name:"Yetzirah",hebrew:"יצירה",stage:"Formation",question:"What structure, relationship, or pattern forms?"},
  {name:"Assiah",hebrew:"עשיה",stage:"Action",question:"What actions and observable consequences follow?"},
] as const;
const trace=(technique:string,url=BASE,title="Sefer Yetzirah (Westcott translation; attribution variant)")=>({
  sourceId:"sefer-yetzirah-canon",tradition:"firmament" as const,technique,sourceUrl:url,
  sourceTitle:title,retrievedAt:"2026-10-21T00:00:00.000Z",ruleId:"sefer-yetzirah-correspondences",
  confidence:"reference-only" as const,implementationStatus:"implemented" as const,
});
const evidence=(id:string,technique:string,subject:string,statement:string,concepts:string[],url=BASE,title?:string):EvidenceItem=>({
  id,tradition:"firmament",category:"source-correspondence",technique,subject,statement,concepts,
  polarity:"neutral",sourceId:"sefer-yetzirah-canon",sourceTrace:trace(technique,url,title),
});
export function seferYetzirahEvidence(chart:ChartResult, layer:"natal"|"transit"="natal"):EvidenceItem[]{
  const result:EvidenceItem[]=[];
  if(layer==="natal") result.push(evidence("sy-cosmology-32","sefer-yetzirah-framework","32 Paths",
    "[TEXTUAL TRADITION] Thirty-two paths: ten sefirot and twenty-two Hebrew letters (three mothers, seven doubles, twelve simples). Treat this as a symbolic architecture of differentiation and relationship: source, polarity, language, and form—not as a hidden numerical score or physical prediction.",
    ["sefer-yetzirah","32-paths","cosmology","differentiation","relationship"]));
  if(layer==="natal") result.push(evidence("sy-mothers","sefer-yetzirah-mothers","Aleph Mem Shin",
    "[TEXTUAL TRADITION] Mother letters: Aleph/Air, Mem/Water, Shin/Fire. Read the triad as a symbolic tension among breath/space, depth/receptivity, and heat/activation; Earth is not one of the three mothers. Guardian's four-element decan framework remains independent.",
    ["sefer-yetzirah","mothers","elements","triad","tension"]));
  if(layer==="natal") result.push(evidence("sy-contraries","sefer-yetzirah-contraries","Seven Contraries",
    `[TEXTUAL TRADITION] The seven double-letter qualities are held in paired polarities: ${CONTRARY_PAIRS.map(pair=>pair.join("/")).join(", ")}. Use these as interpretive spectra—constructive expression, shadow expression, and the choice that moves between them—not as predictions that one pole must manifest.`,
    ["sefer-yetzirah","seven-doubles","contraries","polarity"]));
  const rows = layer==="transit" ? chart.transits : chart.movingBodies;
  for(const row of rows){
    const body=DOUBLE_LETTERS.find(r=>r.planet===row.name);
    if(body) result.push(evidence(`sy-${layer}-double-${row.name.toLowerCase()}`,"sefer-yetzirah-doubles",row.name,
      `[WESTCOTT CHAPTER IV SUPPLEMENT — found in some editions, not universal] ${layer.toUpperCase()} ${row.name} at ${row.display}: double letter ${body.name} (${body.letter}), symbolic quality ${body.quality}. The seven pairs of contraries are given collectively in chapter IV; this supplement does not uniquely assign one pair to each planet. The chart does not establish what manifests.`,
      ["sefer-yetzirah","seven-doubles",row.name.toLowerCase(),body.name.toLowerCase()]));
    const simple=SIMPLE_LETTERS[Math.floor(normalizeLongitude(row.longitude)/30)];
    result.push(evidence(`sy-${layer}-simple-${row.name.toLowerCase()}`,"sefer-yetzirah-simples",row.name,
      `[TEXTUAL VARIANT] ${layer.toUpperCase()} ${row.name} at ${row.display}: ${simple.sign} is associated with the simple letter ${simple.name} (${simple.letter}) in the specified recension. The twelve simples can be read as sign, temporal, and soul-attention gates; use the exact sign and chart house to make the symbolism specific. This does not replace zodiac or house calculations.`,
      ["sefer-yetzirah","twelve-simples","sign-gates","temporal-gates",simple.sign.toLowerCase(),row.name.toLowerCase()]));
  }
  if(layer==="natal") result.push(evidence("sy-four-worlds","four-worlds","Four Worlds",
    "[LATER JEWISH KABBALAH — distinct from Sefer Yetzirah] Atzilut/Emanation → Beriah/Creation → Yetzirah/Formation → Assiah/Action. Interpret symbolically through source, possibility, formed pattern, and observable action; do not claim a chart proves causal manifestation.",
    ["four-worlds","emanation","creation","formation","action"],WORLDS_SOURCE,"Jewish Encyclopedia: Beriah and the Four Worlds"));
  return result;
}

/** Shared synthesis policy for all consumers of the evidence layer.
 * These symbolic correspondences qualify an interpretation; they do not replace
 * calculated chart facts or establish concrete life outcomes.
 */
export const EMANATED_PATTERNS_INTERPRETIVE_GUIDE = `EMANATED PATTERNS — DEEP SEFER YETZIRAH CORRESPONDENCE METHOD
Use this as a named interpretive layer when the evidence and the user's question support it. Begin with the exact astronomical anchor: body, longitude, sign, house, aspect, dignity, natal/transit status, and God View or Agent View context. Then move through the correspondence without pretending the correspondence caused the chart.

1. THE 32-PATH ARCHITECTURE: Treat the ten sefirot and twenty-two letters as a map of how undivided meaning differentiates into qualities, polarities, language, and form. Do not invent a sefirah placement, Tree of Life path, or calculated 32-path score when the engine has not supplied one.
2. THE THREE MOTHERS: Aleph/Air, Mem/Water, and Shin/Fire form a symbolic elemental triad. Ask whether the chart evidence emphasizes space and articulation, receptivity and depth, or heat and activation. Name the missing or resisting quality only as an interpretive question. Do not merge this triad with the application's four-element decans or claim that Earth is a Mother Letter in this recension.
3. THE SEVEN DOUBLES: Use the supplied variant planetary-letter-quality association as a two-sided lens. For each relevant planet, name the quality, then test its constructive expression against its shadow or contrary: life/death, peace/war, wealth/poverty, beauty/disrepute, wisdom/folly, fruitfulness/sterility, or power/servitude. Do not assign a contrary to a planet unless the evidence supports the connection; the source gives the pairs collectively, not as a universal planet-by-planet mapping.
4. THE TWELVE SIMPLES: Use the specified sign-letter association as a gate of attention. Connect the exact sign, its house, and the user's question to the temporal or psychological field being activated. Treat the sign, month, and 'leader of the soul' language as a textual-symbolic correspondence, not a replacement for zodiacal calculation, house doctrine, or a claim about destiny.
5. THE FOUR WORLDS: Move from Atzilut/Emanation (originating principle or WHAT) to Beriah/Creation (possibility or WHY), Yetzirah/Formation (relationship, structure, or HOW), and Assiah/Action (observable choice and consequence). Keep this later Jewish Kabbalistic sequence distinct from the Sefer Yetzirah text itself. A strong synthesis should show where an idea remains latent, where it takes form, and what grounded action would express or interrupt it.
6. NATAL AND TRANSIT: Natal correspondences describe a durable symbolic vocabulary; transit correspondences describe what is currently being activated. Compare them without collapsing them. When both God View and Agent View are present, show how the same symbolism changes between the broader field and local lived experience.
7. DELIVERY: Write the human meaning first, then the correspondence and its exact chart ground. Prefer one or two strong convergences over a catalogue. Include a counter-reading or uncertainty when the symbolism is mixed. Never claim that astrology, Kabbalah, or emanation scientifically proves causation, guarantees manifestation, or overrides user agency.`;

export const KABBALAH_SYNTHESIS_STANDARD = `SEFER YETZIRAH AND FOUR WORLDS — CORE INTERPRETIVE DIMENSION
${EMANATED_PATTERNS_INTERPRETIVE_GUIDE}
Review all supplied Sefer Yetzirah and Four Worlds correspondences for the actual question, including the seven planetary double-letter associations, their collective contrary pairs, and the twelve zodiac simple-letter associations. Distinguish which correspondences come from natal positions and which come from transits or the horary question moment. Where God View and Agent View are supplied, compare the same planetary symbolism in their different house contexts without moving any body or conflating the two frames.
When relevant, use the later Kabbalistic Four Worlds as a disciplined interpretive sequence: Atzilut = principle or source; Beriah = possibility/creation; Yetzirah = structure and formation; Assiah = observable action and consequence. Connect the sequence to WHAT, WHY, HOW, CONSEQUENCE and MEANING and to the user's actual question. Do not fabricate a separate calculated Four Worlds score.
Treat the Sefer Yetzirah three mothers (Air/Water/Fire) as separate from the application's four-element decans. Identify manuscript/translation variants rather than presenting one letter-planet attribution as universal. Jewish Kabbalah and later Hermetic Qabalah are separate provenance families. Keep this a real, named layer of synthesis where helpful, not an obligatory generic paragraph; it must never override classical horary judgment, astronomical calculations, or the evidence. Astrology and symbolic cosmology do not scientifically demonstrate causation or guarantee manifestation.`;
