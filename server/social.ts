import type { ChartResult, ChartRow } from "./astronomy";
import { angularDistance } from "./astrologyCore";
import type {
  RelationshipRole,
  SystemIntersectAnalysis,
  LovedOneCheckInStatus,
} from "../shared/social";

const ELEMENT_MAP: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

function getSignFromLongitude(longitude: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const idx = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return signs[idx] || "Aries";
}

function findBody(chart: ChartResult, name: string): ChartRow | undefined {
  return chart.movingBodies?.find(b => b.name.toLowerCase() === name.toLowerCase());
}

/**
 * Cross-examines two charts mathematically to output the System Intersect Matrix.
 */
export function analyzeSystemIntersect(
  userChart: ChartResult,
  targetChart: ChartResult
): SystemIntersectAnalysis {
  const userSun = findBody(userChart, "Sun");
  const userMoon = findBody(userChart, "Moon");
  const userMercury = findBody(userChart, "Mercury");
  const userMars = findBody(userChart, "Mars");
  const userSaturn = findBody(userChart, "Saturn");

  const targetSun = findBody(targetChart, "Sun");
  const targetMoon = findBody(targetChart, "Moon");
  const targetMercury = findBody(targetChart, "Mercury");
  const targetMars = findBody(targetChart, "Mars");
  const targetSaturn = findBody(targetChart, "Saturn");

  const userSunSign = userSun ? getSignFromLongitude(userSun.longitude) : "Aries";
  const targetSunSign = targetSun ? getSignFromLongitude(targetSun.longitude) : "Aries";
  const userPrimaryElem = ELEMENT_MAP[userSunSign] || "Fire";
  const targetPrimaryElem = ELEMENT_MAP[targetSunSign] || "Fire";

  const keyConnections: SystemIntersectAnalysis["keyConnections"] = [];
  let harmonyPoints = 50; // neutral midpoint; only measured contacts change the score

  // Check Sun-Moon Synergies
  if (userMoon && targetSun) {
    const dist = angularDistance(userMoon.longitude, targetSun.longitude);
    if (dist <= 6) {
      keyConnections.push({
        type: "support",
        planets: "User Moon ☌ Loved One Sun",
        aspectName: "Conjunction",
        orb: Number(dist.toFixed(1)),
        interpretation: "Direct Soul Alignment: Your intuitive emotional needs align effortlessly with their core vitality and purpose.",
      });
      harmonyPoints += 15;
    } else if (Math.abs(dist - 120) <= 6) {
      keyConnections.push({
        type: "support",
        planets: "User Moon △ Loved One Sun",
        aspectName: "Trine",
        orb: Number(Math.abs(dist - 120).toFixed(1)),
        interpretation: "Natural Emotional Flow: Effortless mutual comfort; you innately validate each other's identity.",
      });
      harmonyPoints += 12;
    } else if (Math.abs(dist - 90) <= 5) {
      keyConnections.push({
        type: "friction",
        planets: "User Moon □ Loved One Sun",
        aspectName: "Square",
        orb: Number(Math.abs(dist - 90).toFixed(1)),
        interpretation: "Ego-Emotional Tension: Different pacing between vulnerability and drive; requires explicit communication.",
      });
      harmonyPoints -= 8;
    }
  }

  if (targetMoon && userSun) {
    const dist = angularDistance(targetMoon.longitude, userSun.longitude);
    if (dist <= 6 || Math.abs(dist - 120) <= 6) {
      keyConnections.push({
        type: "support",
        planets: "Loved One Moon ☌/△ User Sun",
        aspectName: dist <= 6 ? "Conjunction" : "Trine",
        orb: Number(Math.min(dist, Math.abs(dist - 120)).toFixed(1)),
        interpretation: "Mutual Devotion: They feel deeply grounded and secure in your physical presence.",
      });
      harmonyPoints += 12;
    }
  }

  // Check Mercury-Mercury Cognitive Interface
  if (userMercury && targetMercury) {
    const dist = angularDistance(userMercury.longitude, targetMercury.longitude);
    if (dist <= 5 || Math.abs(dist - 60) <= 4 || Math.abs(dist - 120) <= 5) {
      keyConnections.push({
        type: "support",
        planets: "Mercury ⚹/△ Mercury",
        aspectName: "Harmonious Cognitive Flow",
        orb: Number(Math.min(dist, Math.abs(dist - 60), Math.abs(dist - 120)).toFixed(1)),
        interpretation: "Effortless Mental Synthesis: Similar processing speeds and conversation rhythm; ideas flow without translation barriers.",
      });
      harmonyPoints += 10;
    } else if (Math.abs(dist - 90) <= 5 || Math.abs(dist - 180) <= 5) {
      keyConnections.push({
        type: "friction",
        planets: "Mercury □/☍ Mercury",
        aspectName: "Dialectical Tension",
        orb: Number(Math.min(Math.abs(dist - 90), Math.abs(dist - 180)).toFixed(1)),
        interpretation: "Different Cognitive Architectures: You reach conclusions from opposing angles; clarify assumptions rather than debating conclusions.",
      });
      harmonyPoints -= 6;
    }
  }

  // Check Mars-Saturn or Structural Friction
  if (userMars && targetSaturn) {
    const dist = angularDistance(userMars.longitude, targetSaturn.longitude);
    if (Math.abs(dist - 90) <= 5 || Math.abs(dist - 180) <= 5) {
      keyConnections.push({
        type: "friction",
        planets: "User Mars □/☍ Loved One Saturn",
        aspectName: "Brake & Accelerator Paradox",
        orb: Number(Math.min(Math.abs(dist - 90), Math.abs(dist - 180)).toFixed(1)),
        interpretation: "Timing Friction: One initiates swift momentum while the other applies caution and structural brakes.",
      });
      harmonyPoints -= 7;
    }
  }

  // House Overlays: where user Sun falls in target chart
  const houseOverlays: SystemIntersectAnalysis["houseOverlays"] = [];
  if (userSun && targetChart.ascendant) {
    const asc = targetChart.ascendant.longitude;
    const houseInTarget = Math.floor(((userSun.longitude - asc + 360) % 360) / 30) + 1;
    houseOverlays.push({
      planet: "Your Sun",
      houseInTarget,
      meaning: `Your core identity illuminates their House ${houseInTarget}, energizing their ${
        houseInTarget === 1 ? "self-expression and confidence" :
        houseInTarget === 4 ? "home roots, emotional foundation, and private peace" :
        houseInTarget === 7 ? "commitment, partnership, and dedicated one-on-one bond" :
        houseInTarget === 10 ? "reputation, ambition, and life direction" :
        "daily experience and personal growth"
      }.`,
    });
  }

  // Neutral midpoint plus measured contacts; no predetermined positive floor.
  const harmonyScore = Math.max(0, Math.min(100, harmonyPoints));

  let dynamicTitle = "Resonant Co-Creators";
  if (harmonyScore >= 85) dynamicTitle = "Architectural Anchor & Soul Synergy";
  else if (harmonyScore >= 75) dynamicTitle = "Harmonious Complement & Mirror";
  else if (harmonyScore >= 60) dynamicTitle = "Dynamic Catalyst & Growth Matrix";
  else dynamicTitle = "High-Intensity Evolutionary Friction";

  return {
    harmonyScore,
    dynamicTitle,
    elementalBalance: {
      userPrimary: userPrimaryElem,
      targetPrimary: targetPrimaryElem,
      synergyNote: userPrimaryElem === targetPrimaryElem
        ? `Shared ${userPrimaryElem} Element: Mutual instinctual understanding and identical baseline tempo.`
        : `${userPrimaryElem} meets ${targetPrimaryElem}: Natural complementary polarity—one brings inspiration/drive, the other brings grounding/depth.`,
    },
    keyConnections,
    houseOverlays,
    currentTransitIntersect: {
      mutualPressure: "moderate",
      summary: "No live transit calculation was performed in this natal cross-chart comparison. Transit pressure and timing are unassessed.",
      frictionPoints: [],
      harmoniousWindows: [],
    },
  };
}

/**
 * Scans today's real-time transit activations against a loved one's chart
 * to detect systemic pressure spikes and generate actionable empathy prompts.
 */
export function evaluateLovedOneCheckIn(
  lovedOneChart: ChartResult,
  name: string,
  relationship: RelationshipRole
): LovedOneCheckInStatus {
  const transits = lovedOneChart.transits || [];
  const movingBodies = lovedOneChart.movingBodies || [];

  const saturnTransit = transits.find(t => t.name === "Saturn");
  const marsTransit = transits.find(t => t.name === "Mars");
  const uranusTransit = transits.find(t => t.name === "Uranus");
  const jupiterTransit = transits.find(t => t.name === "Jupiter");

  const activeSignatures: string[] = [];
  let pressureLevel: LovedOneCheckInStatus["pressureLevel"] = "calm";
  let mechanicsSummary = `${name}'s celestial matrix is currently operating under stable, balanced energetic conditions.`;
  let whatTheyAreProcessing = "Consolidating routine habits, steady mental bandwidth, and normal emotional equilibrium.";
  let howToShowUp = "Casual, warm check-ins; share light humor, check in on shared goals, or invite them to catch up.";
  let whatToAvoid = "Over-analyzing small remarks; they are in steady flow.";
  let suggestedCheckInMessage = `Hey ${name}! Just thinking of you today and checking in. Hope your week is flowing smooth. Talk soon!`;
  let dominantTransitBody = "Sun";

  // Check Saturn pressure (heavy burden, fatigue, 4th/8th/12th house or hard Moon aspect)
  if (saturnTransit) {
    const hardMoonContact = saturnTransit.natalContacts?.find(
      c => (c.natalName === "Moon" || c.natalName === "Sun") && (c.aspect === "conjunction" || c.aspect === "square" || c.aspect === "opposition")
    );
    const inSensitiveHouse = [4, 6, 8, 12].includes(saturnTransit.house);

    if (hardMoonContact || inSensitiveHouse) {
      pressureLevel = hardMoonContact ? "high" : "moderate";
      dominantTransitBody = "Saturn";
      activeSignatures.push(`Saturn transit in House ${saturnTransit.house}`);
      if (hardMoonContact) activeSignatures.push(`Saturn ${hardMoonContact.aspect} natal ${hardMoonContact.natalName}`);

      mechanicsSummary = `Transit Saturn is exerting gravitational weight on ${name}'s ${
        inSensitiveHouse ? `House ${saturnTransit.house} (internal roots & vitality)` : "core emotional axis"
      }. This manifests as deep mental/emotional fatigue, heightened responsibility burdens, and reduced patience for trivial demands.`;

      whatTheyAreProcessing = `Internal exhaustion and the weight of personal expectations. They may feel like every task requires twice the effort right now, leading to quiet withdrawal.`;

      howToShowUp = `Provide a quiet, zero-pressure presence. Offer practical ground support without demanding emotional energy or immediate problem-solving.`;

      whatToAvoid = `Do not initiate heavy lectures, unsolicited critiques, or demand immediate high-energy responsiveness.`;

      suggestedCheckInMessage = `Hey ${name}, just wanted to check in and say I'm thinking of you. No need to text back right away if you're low on energy or swamped—just wanted you to know I've got your back. Take it easy today!`;
    }
  }

  // Check Mars pressure (volatility, irritable, short fuse)
  if (marsTransit && pressureLevel !== "high") {
    const hardAspect = marsTransit.natalContacts?.find(
      c => (c.natalName === "Mars" || c.natalName === "Pluto" || c.natalName === "Sun") &&
           (c.aspect === "conjunction" || c.aspect === "square" || c.aspect === "opposition")
    );
    if (hardAspect || marsTransit.house === 1 || marsTransit.house === 7) {
      pressureLevel = "moderate";
      dominantTransitBody = "Mars";
      activeSignatures.push(`Mars transit in House ${marsTransit.house}`);
      if (hardAspect) activeSignatures.push(`Mars ${hardAspect.aspect} natal ${hardAspect.natalName}`);

      mechanicsSummary = `Transit Mars is activating high kinetic pressure in ${name}'s chart. Energy is running fast and hot; internal urgency or frustration can spike quickly under minor irritants.`;

      whatTheyAreProcessing = `A restless appetite for progress, friction with bottlenecks, and potential nervous irritability.`;

      howToShowUp = `Give them room to blow off steam. Validate their drive, encourage physical movement or exercise, and be direct and concise.`;

      whatToAvoid = `Passive-aggressive comments, bureaucratic delays, or taking sudden sharpness personally.`;

      suggestedCheckInMessage = `Hey ${name}! Just sending some good energy your way today. Know you're pushing hard—make sure you take a minute to breathe and hydrate. Let me know if you need anything!`;
    }
  }

  // Check Jupiter expansive window
  if (jupiterTransit && pressureLevel === "calm") {
    const softAspect = jupiterTransit.natalContacts?.find(
      c => c.aspect === "trine" || c.aspect === "conjunction"
    );
    const minorSoftAspect = jupiterTransit.minorNatalContacts?.find(c => c.classification === "flow");
    const supportiveAspect = softAspect ?? minorSoftAspect;
    if (supportiveAspect) {
      dominantTransitBody = "Jupiter";
      activeSignatures.push(`Jupiter ${supportiveAspect.aspect} natal ${supportiveAspect.natalName}${supportiveAspect === minorSoftAspect ? " (minor, half weight)" : ""}`);
      mechanicsSummary = `Transit Jupiter is generating an expansive vitality window for ${name}. High receptivity, optimism, and open horizons.`;
      whatTheyAreProcessing = `Fresh inspiration, creative clarity, and appetite for expansion.`;
      howToShowUp = `Celebrate their wins, brainstorm possibilities, and lean into vision-building.`;
      suggestedCheckInMessage = `Hey ${name}! Hope you're feeling the good momentum today. Just wanted to tell you I'm proud of what you're building. Catch up soon!`;
    }
  }

  return {
    lovedOneName: name,
    relationship,
    pressureLevel,
    activeSignatures,
    mechanicsSummary,
    actionableEmpathyPrompt: {
      whatTheyAreProcessing,
      howToShowUp,
      whatToAvoid,
    },
    suggestedCheckInMessage,
    dominantTransitBody,
  };
}
