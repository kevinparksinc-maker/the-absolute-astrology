/**
 * Classical Chinese 28 Xiu (二十八宿).
 * Ancient determinative-star system with unequal equatorial sectors.
 * This module intentionally stores the names and source traditions only.
 * Actual ancient boundary coordinates remain unassigned pending a verifiable
 * historical catalog and an explicit permanent anchor epoch.
 * Never silently substitute modern stellar coordinates or equal 360/28 sectors.
 */
export type ChineseMansion = {
 index:number; hanzi:string; pinyin:string; english:string;
 quadrant:"AZURE_DRAGON"|"BLACK_TORTOISE"|"WHITE_TIGER"|"VERMILION_BIRD";
 determinativeStar:string;
};
const entries = [
 ["角","Jiao","Horn","α Virginis"],["亢","Kang","Neck","κ Virginis"],
 ["氐","Di","Root","α² Librae"],["房","Fang","Room","π Scorpii"],
 ["心","Xin","Heart","σ Scorpii"],["尾","Wei","Tail","μ¹ Scorpii"],
 ["箕","Ji","Winnowing Basket","γ Sagittarii"],
 ["斗","Dou","Southern Dipper","μ Sagittarii"],["牛","Niu","Ox","β Capricorni"],
 ["女","Nu","Girl","ε Aquarii"],["虛","Xu","Emptiness","β Aquarii"],
 ["危","Wei","Rooftop","α Aquarii"],["室","Shi","Encampment","α Pegasi"],
 ["壁","Bi","Wall","γ Pegasi"],
 ["奎","Kui","Legs","η Andromedae"],["婁","Lou","Bond","β Arietis"],
 ["胃","Wei","Stomach","35 Arietis"],["昴","Mao","Hairy Head","17 Tauri"],
 ["畢","Bi","Net","ε Tauri"],["觜","Zi","Turtle Beak","λ Orionis"],
 ["參","Shen","Three Stars","ζ Orionis"],
 ["井","Jing","Well","μ Geminorum"],["鬼","Gui","Ghost","θ Cancri"],
 ["柳","Liu","Willow","δ Hydrae"],["星","Xing","Star","α Hydrae"],
 ["張","Zhang","Extended Net","υ¹ Hydrae"],["翼","Yi","Wings","α Crateris"],
 ["軫","Zhen","Chariot","γ Corvi"],
] as const;
export const CHINESE_MANSIONS: readonly ChineseMansion[] = Object.freeze(
 entries.map(([hanzi,pinyin,english,determinativeStar],i)=>Object.freeze({
  index:i+1,hanzi,pinyin,english,determinativeStar,
  quadrant:(i<7?"AZURE_DRAGON":i<14?"BLACK_TORTOISE":i<21?"WHITE_TIGER":"VERMILION_BIRD") as ChineseMansion["quadrant"]
 }))
);
export const CHINESE_MANSION_HISTORICAL_SOURCE = {
 title:"Twenty-Eight Mansions — Academy of Contemporary China and World Studies",
 url:"https://english.scio.gov.cn/m/featured/chinakeywords/2024-08/30/content_117397320.htm",
 note:"Traditional 28 names and four directional animal groups. Historical celestial boundaries and chart placements not asserted.",
} as const;
