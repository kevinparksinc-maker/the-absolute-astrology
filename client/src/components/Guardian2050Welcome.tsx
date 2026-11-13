import { useState } from "react";
import { ArrowDown, ArrowUpRight, BookOpenText, Compass, Eye, HelpCircle, Layers3, MoonStar, Orbit, Sparkles, Stars } from "lucide-react";
import "./Guardian2050.css";

type Depth = "guided" | "scholar";
type Portal = { href: string; eyebrow: string; title: string; summary: string; icon: typeof Stars; label: string; external?: boolean };
const portals: Portal[] = [
  { href: "#chart-setup", eyebrow: "01 / YOUR FOUNDATION", title: "Cast a natal chart", summary: "Begin with your birth details. See the moving sky against the permanently fixed firmament.", icon: Stars, label: "Open chart setup" },
  { href: "/horary", eyebrow: "02 / A LIVING QUESTION", title: "Ask a Horary question", summary: "Explore the heavens at the exact moment of your question, including rulers and testimony.", icon: MoonStar, label: "Open Horary" },
  { href: "/zodiac-readings", eyebrow: "NEW / THE TWELVE CELESTIAL GATES", title: "Your sign’s celestial reading", summary: "Each sign’s ruling planet becomes Agent House 1, while God View stays fixed. Explore the same calculated sky through twelve distinct house perspectives.", icon: Sparkles, label: "Open zodiac sign readings" },
  { href: "/sky", eyebrow: "03 / THE CELESTIAL MAP", title: "Explore the Firmament", summary: "Examine tropical planets, fixed stellar territories, and the 27 / 28 / 36 overlays.", icon: Orbit, label: "Explore celestial map" },
  { href: "/history", eyebrow: "04 / YOUR LIBRARY", title: "Return to your readings", summary: "Revisit previous chart work and reflect on what you have learned.", icon: BookOpenText, label: "Open history" },
];
const glossary = [
  { word: "God View", meaning: "The permanent twelve-sector celestial reference frame. It does not depend on your local horizon." },
  { word: "Agent View", meaning: "Your observer-centered equal houses, beginning with the local Ascendant. Moving planets are interpreted locally." },
  { word: "Synthesis", meaning: "Where the independent God and Agent calculations are woven together and their agreements and differences explained." },
  { word: "Nakshatras · Manzils · Decans", meaning: "The permanent 27, 28 and 36 equal divisions of the fixed Firmament backdrop; moving planets pass through them." },
];

export function Guardian2050Welcome() {
  const [depth, setDepth] = useState<Depth>("guided");
  const [guideOpen, setGuideOpen] = useState(false);
  return <section className="fg2050" aria-label="Firmament Guardian celestial observatory">
    <nav className="fg2050-topbar" aria-label="Guardian primary navigation">
      <a href="/" className="fg2050-brand"><span className="fg2050-brandmark"><Orbit size={21}/></span><span><b>FIRMAMENT</b><small>GUARDIAN · CELESTIAL WISDOM</small></span></a>
      <div className="fg2050-toplinks"><a href="#chart-setup">Natal</a><a href="/horary">Horary</a><a href="/zodiac-readings">12 Signs</a><a href="/sky">Celestial Map</a><a href="/history">Library</a></div>
      <span className="fg2050-model-tag"><i/> POLARIS-CENTERED FIRMAMENT</span>
    </nav>
    <div className="fg2050-lead">
      <div className="fg2050-intro">
        <div className="fg2050-kicker"><span/> THE BIBLICAL FIRMAMENT · AN INTERPRETIVE OBSERVATORY</div>
        <h2>Two skies.<br/><em>One precise moment.</em></h2>
        <p className="fg2050-subtitle">An ancient language of the heavens, reimagined for a new generation. Explore the moving tropical sky against a permanent stellar firmament—then discover what its patterns mean in everyday life.</p>
        <div className="fg2050-actions"><a href="#chart-setup" className="fg2050-action-primary">Begin your reading <ArrowUpRight size={17}/></a><a href="/sky" className="fg2050-action-secondary">Enter the observatory <Orbit size={17}/></a></div>
        <div className="fg2050-horizon-badges"><span><Stars size={14}/> FIXED STARS</span><span><Layers3 size={14}/> 27 · 28 · 36 OVERLAYS</span><span><Compass size={14}/> EQUAL HOUSES</span></div>
      </div>
      <div className="fg2050-orrery" aria-label="Conceptual diagram showing fixed star background and moving planetary orbit">
        <div className="fg2050-orrery-shell"><div className="fg2050-orrery-outer"/><div className="fg2050-orrery-mid"/><div className="fg2050-orrery-inner"/><div className="fg2050-orrery-line l1"/><div className="fg2050-orrery-line l2"/><div className="fg2050-orrery-line l3"/><div className="fg2050-orrery-center"><Orbit size={29}/><b>FIRMAMENT</b><small>STARS REMAIN FIXED</small></div><i className="fg2050-planet p1"/><i className="fg2050-planet p2"/><i className="fg2050-planet p3"/></div>
        <div className="fg2050-orrery-caption"><span><i/> PERMANENT STELLAR GRID</span><span><i/> MOVING TROPICAL PLANETS</span></div>
        <p>Conceptual visualization · not a calculated natal placement</p>
      </div>
    </div>
    <div className="fg2050-portal-heading">
      <div><span className="fg2050-eyebrow">YOUR CELESTIAL JOURNEY</span><h3>Where would you like to begin?</h3><p>Choose a simple starting point. The deeper knowledge remains one tap away.</p></div>
      <div className="fg2050-depth-switch" role="group" aria-label="Explanation depth"><button type="button" aria-pressed={depth==="guided"} className={depth==="guided"?"active":""} onClick={()=>setDepth("guided")}><Sparkles size={14}/> New to astrology</button><button type="button" aria-pressed={depth==="scholar"} className={depth==="scholar"?"active":""} onClick={()=>setDepth("scholar")}><BookOpenText size={14}/> Deep study</button></div>
    </div>
    <div className="fg2050-portals">{portals.map(({href,eyebrow,title,summary,icon:Icon,label})=><a key={href} href={href} className="fg2050-portal" aria-label={label}><div className="fg2050-portal-top"><span>{eyebrow}</span><ArrowUpRight size={17}/></div><div className="fg2050-portal-icon"><Icon size={23} strokeWidth={1.4}/></div><strong>{title}</strong><p>{depth==="guided"?summary:href==="#chart-setup"?"Natal foundation · geocentric tropical ephemeris · dual fixed/local 30° house frameworks":href==="/horary"?"Question-moment significators · reception · lunar applications · traditional testimony":href==="/sky"?"Deterministic fixed-star archive · Nakshatras, Manzils, Decans · dual-frame overlays":"Saved charts, interpretations, evidence chains and re-examination"}</p><span className="fg2050-portal-cta">{label} <ArrowUpRight size={14}/></span></a>)}</div>
    <div className="fg2050-education"><div><div className="fg2050-eyebrow">ONE CALCULATION · TWO PERSPECTIVES</div><h3>Separate in calculation.<br/><em>United in understanding.</em></h3><p>Your chart keeps God View and Agent View distinct. The Master Interpreter connects their evidence in clear English, without erasing the differences between them.</p></div><div className="fg2050-education-right"><div className="fg2050-view-row"><span><Eye size={17}/> GOD VIEW</span><p>Permanent celestial reference · the shared fixed order</p></div><div className="fg2050-view-row"><span><Compass size={17}/> AGENT VIEW</span><p>Local Ascendant · observer-centered equal houses</p></div><div className="fg2050-view-row"><span><Sparkles size={17}/> SYNTHESIS</span><p>Agreements, contradictions, and lived human meaning</p></div></div></div>
    <div className="fg2050-guide"><button type="button" aria-expanded={guideOpen} onClick={()=>setGuideOpen(v=>!v)}><HelpCircle size={18}/><span>{guideOpen?"Hide the quick guide":"What do these astrology terms mean?"}</span><span className="fg2050-guide-state">{guideOpen?"−":"+"}</span></button>{guideOpen&&<dl>{glossary.map(item=><div key={item.word}><dt>{item.word}</dt><dd>{item.meaning}</dd></div>)}</dl>}</div>
    <a href="#chart-setup" className="fg2050-step-link">CONTINUE TO YOUR CHART SETUP <ArrowDown size={15}/></a>
  </section>;
}
