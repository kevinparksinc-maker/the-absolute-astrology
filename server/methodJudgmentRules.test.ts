import { beforeAll, describe, expect, it, vi } from "vitest";
import { buildUnifiedMasterChart } from "./masterChart/builder";
import type { UnifiedMasterChartSnapshot } from "./masterChart/types";
import * as outcomesModule from "./astrologyKnowledge/synthesis/methodOutcomes";
import { synthesizeMasterReading } from "./astrologyKnowledge/synthesis/synthesizer";
import { packSynthesis } from "./astrologyKnowledge/synthesis/context";
import { getDecanCanonByLongitude } from "./astrologyKnowledge/canon/decans36";
import { ZODIAC_SIGNS } from "../shared/hybrid";

const input = {
  location: "Dallas",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  mode: "natal" as const,
};
let base: UnifiedMasterChartSnapshot;
beforeAll(async () => {
  base = await buildUnifiedMasterChart(input);
});
const run = (snapshot: UnifiedMasterChartSnapshot, id: string) =>
  outcomesModule
    .buildMethodOutcomes(snapshot, [])
    .find(o => o.methodId === id)!;
function altered(id: string, edit: (results: any) => void) {
  const s = structuredClone(base);
  edit(s.layers[id].results);
  return s;
}

describe("Finding-to-rule-to-judgment behavior", () => {
  it("all applicable local handlers produce specific judgments and source/evidence links without raw-dump completion", () => {
    for (const o of outcomesModule.buildMethodOutcomes(base, [])) {
      if (o.status !== "interpreted") continue;
      expect(o.findingJudgments.length).toBeGreaterThan(0);
      expect(o.judgment).not.toMatch(
        /Findings:|finding\(s\) were evaluated|record\(s\) are available/
      );
      for (const j of o.findingJudgments) {
        expect(j.rules.length).toBeGreaterThan(0);
        expect(j.evidenceIds.length).toBeGreaterThan(0);
        expect(
          j.rules.every(r => r.sourceTitle && r.calculationEvidenceIds.length)
        ).toBe(true);
      }
    }
  });
  it("square and trine produce opposing judgments, not just different aspect names", () => {
    const a = altered("western-aspects-and-orbs", r => {
      r[0].aspect = "Square";
      r[0].orb = 0.2;
    });
    const b = altered("western-aspects-and-orbs", r => {
      r[0].aspect = "Trine";
      r[0].orb = 0.2;
    });
    const square = run(a, "western-aspects-and-orbs").findingJudgments[0];
    const trine = run(b, "western-aspects-and-orbs").findingJudgments[0];
    expect(square.valence).toBe("challenging");
    expect(square.judgment).toContain("presses against");
    expect(trine.valence).toBe("supportive");
    expect(trine.judgment).toContain("cooperates");
    expect(square.rules[0].ruleId).toBe("aspect-square");
    expect(trine.rules[0].ruleId).toBe("aspect-trine");
  });
  it("quincunx retains the configured friction classification", () => {
    const s = altered("western-aspects-and-orbs", r => {
      r[0].aspect = "Quincunx";
      r[0].orb = 1;
    });
    expect(run(s, "western-aspects-and-orbs").findingJudgments[0].valence).toBe(
      "challenging"
    );
  });
  it("domicile versus detriment changes capacity and the support/pressure judgment", () => {
    const a = altered("western-essential-dignities", r => {
      r[0].body = "Sun";
      r[0].sign = "Leo";
    });
    const b = altered("western-essential-dignities", r => {
      r[0].body = "Sun";
      r[0].sign = "Aquarius";
    });
    const own = run(a, "western-essential-dignities").findingJudgments[0];
    const away = run(b, "western-essential-dignities").findingJudgments[0];
    expect(own.judgment).toContain("own resources");
    expect(own.valence).toBe("supportive");
    expect(away.judgment).toContain("detriment");
    expect(away.valence).toBe("challenging");
  });
  it("the Lot topic is delivered through its actual sign lord and house", () => {
    const a = altered("arabic-hermetic-lots", r => {
      r[0].sign = "Aries";
      r[0].house = 2;
    });
    const b = altered("arabic-hermetic-lots", r => {
      r[0].sign = "Taurus";
      r[0].house = 8;
    });
    const mars = run(a, "arabic-hermetic-lots").findingJudgments[0].judgment;
    const venus = run(b, "arabic-hermetic-lots").findingJudgments[0].judgment;
    expect(mars).toContain("lord Mars");
    expect(mars).toContain("House 2");
    expect(venus).toContain("lord Venus");
    expect(venus).toContain("House 8");
    expect(venus).not.toBe(mars);
  });
  it("D9 sign condition and partnership house modify the divisional judgment", () => {
    const a = altered("vedic-vargas-divisional", r => {
      const p = r
        .find((v: any) => v.division === "D9")
        .placements.find((p: any) => p.body === "Sun");
      p.sign = "Leo";
      p.house = 1;
    });
    const b = altered("vedic-vargas-divisional", r => {
      const p = r
        .find((v: any) => v.division === "D9")
        .placements.find((p: any) => p.body === "Sun");
      p.sign = "Aquarius";
      p.house = 7;
    });
    const own = run(a, "vedic-vargas-divisional").findingJudgments.find(
      j => j.subject === "D9 Sun"
    )!;
    const away = run(b, "vedic-vargas-divisional").findingJudgments.find(
      j => j.subject === "D9 Sun"
    )!;
    expect(own.domain).toBe("relationships");
    expect(own.valence).toBe("supportive");
    expect(away.valence).toBe("challenging");
    expect(away.judgment).toContain("House 7");
    expect(away.judgment).toContain("detriment");
  });
  it("a changed active Dasha lord changes the activated functions and natal delivery", () => {
    const a = altered("vedic-dasha-and-ashtakavarga", r => {
      r.find(
        (v: any) => v.technique === "dasha"
      ).calculation.activeLords[0].lord = "Mercury";
    });
    const b = altered("vedic-dasha-and-ashtakavarga", r => {
      r.find(
        (v: any) => v.technique === "dasha"
      ).calculation.activeLords[0].lord = "Saturn";
    });
    const mercury = run(a, "vedic-dasha-and-ashtakavarga").findingJudgments[0];
    const saturn = run(b, "vedic-dasha-and-ashtakavarga").findingJudgments[0];
    expect(mercury.subject).toContain("Mercury");
    expect(saturn.subject).toContain("Saturn");
    expect(mercury.judgment).not.toBe(saturn.judgment);
    expect(mercury.judgment).toContain("rulership over houses");
  });
  it("BAV/SAV support changes while all row and column checksums stay valid", () => {
    const original = run(base, "vedic-dasha-and-ashtakavarga");
    const s = altered("vedic-dasha-and-ashtakavarga", r => {
      const data = r.find(
        (v: any) => v.technique === "ashtakavarga"
      ).calculation;
      const high = data.sav.findIndex((e: any) => e.score > 337 / 12),
        low = data.sav.findIndex((e: any) => e.score < 337 / 12);
      const temp = data.sav[high].score;
      data.sav[high].score = data.sav[low].score;
      data.sav[low].score = temp;
      for (const row of data.bav)
        [row.scores[high], row.scores[low]] = [
          row.scores[low],
          row.scores[high],
        ];
    });
    const changed = run(s, "vedic-dasha-and-ashtakavarga");
    expect(changed.status).toBe("interpreted");
    expect(
      changed.findingJudgments.some(
        j =>
          j.subject.startsWith("SAV ") &&
          j.valence !==
            original.findingJudgments.find(o => o.subject === j.subject)!
              .valence
      )
    ).toBe(true);
  });
  it("a malformed BAV/SAV matrix blocks a judgment instead of retaining generic prose", () => {
    const s = altered("vedic-dasha-and-ashtakavarga", r => {
      r.find((v: any) => v.technique === "ashtakavarga").calculation.bav[0]
        .scores[0]++;
    });
    expect(run(s, "vedic-dasha-and-ashtakavarga").status).toBe("failed");
  });
  it("Drishti special offsets change the receiving sign and rule ID", () => {
    const source = base.baseCelestialState.planets.find(
      p => p.name === "Mars"
    )!;
    const sign = Math.floor(source.longitude / 30);
    const a = altered("vedic-graha-drishti", r => {
      const m = r.find((v: any) => v.planet === "Mars");
      m.targetHouseOffset = 4;
      m.targetSign = ZODIAC_SIGNS[(sign + 3) % 12];
    });
    const b = altered("vedic-graha-drishti", r => {
      const m = r.find((v: any) => v.planet === "Mars");
      m.targetHouseOffset = 8;
      m.targetSign = ZODIAC_SIGNS[(sign + 7) % 12];
    });
    const first = run(a, "vedic-graha-drishti").findingJudgments.find(j =>
      j.subject.startsWith("Mars")
    )!;
    const second = run(b, "vedic-graha-drishti").findingJudgments.find(j =>
      j.subject.startsWith("Mars")
    )!;
    expect(first.rules[0].ruleId).toBe("graha-drishti-mars-4");
    expect(second.rules[0].ruleId).toBe("graha-drishti-mars-8");
    expect(first.subject).not.toBe(second.subject);
  });
  it("a real decan transition changes the elemental-family ruler and resulting meaning", () => {
    const a = altered("elemental-decans", r => {
      const d = getDecanCanonByLongitude(1);
      Object.assign(r[0], { longitude: 1, decanIndex: d.index });
    });
    const b = altered("elemental-decans", r => {
      const d = getDecanCanonByLongitude(11);
      Object.assign(r[0], { longitude: 11, decanIndex: d.index });
    });
    const first = run(a, "elemental-decans").findingJudgments[0],
      second = run(b, "elemental-decans").findingJudgments[0];
    expect(first.mechanism).toContain("ruler Mars");
    expect(second.mechanism).toContain("ruler Sun");
    expect(first.judgment).not.toBe(second.judgment);
  });
  it("elemental-family judgments do not borrow a conflicting Chaldean face ruler", () => {
    const s = altered("elemental-decans", r => {
      const d = getDecanCanonByLongitude(221);
      Object.assign(r[0], { longitude: 221, decanIndex: d.index });
    });
    const judgment = run(s, "elemental-decans").findingJudgments[0];
    expect(judgment.judgment).toContain("Pisces / Jupiter");
    expect(judgment.judgment).not.toContain("Sun face of Scorpio");
    expect(judgment.rules[0].sourceTitle).toContain(
      "elemental-family decan policy"
    );
  });
  it("a changed calculated sign changes the Sefer Yetzirah gate and its application", async () => {
    const first = await buildUnifiedMasterChart({
      ...input,
      xyzPositions: { Mercury: { x: 1, y: 0, z: 0 } },
    });
    const second = await buildUnifiedMasterChart({
      ...input,
      xyzPositions: {
        Mercury: {
          x: Math.cos((40 * Math.PI) / 180),
          y: Math.sin((40 * Math.PI) / 180),
          z: 0,
        },
      },
    });
    const a = run(first, "kabbalah-sefer-yetzirah").findingJudgments.find(
      j =>
        j.subject === "Mercury" &&
        j.rules[0].ruleId === "sefer-yetzirah-sign-simple"
    )!;
    const b = run(second, "kabbalah-sefer-yetzirah").findingJudgments.find(
      j =>
        j.subject === "Mercury" &&
        j.rules[0].ruleId === "sefer-yetzirah-sign-simple"
    )!;
    expect(a.judgment).toContain("Heh");
    expect(b.judgment).toContain("Vav");
    expect(a.judgment).not.toBe(b.judgment);
    expect(run(first, "kabbalah-sefer-yetzirah").judgment).toContain(
      "no individual contrary pair"
    );
  });
  it("Genesis evaluates the detected participants and normalized strength", () => {
    const change = (strength: number) =>
      altered("genesis-behavioral-patterns", r => {
        r.dominantPatterns = [
          {
            name: "Grand Trine",
            type: "grand_trine",
            planets: ["Sun", "Moon", "Jupiter"],
            houses: [1, 5, 9],
            signs: ["Aries", "Leo", "Sagittarius"],
            strength,
            description:
              "The configured engine detects a connected trine pattern.",
          },
        ];
      });
    const a = run(change(0.5), "genesis-behavioral-patterns")
      .findingJudgments[0];
    const b = run(change(0.9), "genesis-behavioral-patterns")
      .findingJudgments[0];
    expect(a.strength).toBe("moderate");
    expect(b.strength).toBe("strong");
    expect(a.valence).toBe("supportive");
    expect(b.judgment).toContain("Sun");
    expect(b.judgment).toContain("House 5");
  });
  it("natal Genesis patterns do not change when the separate event sky changes", async () => {
    const event = {
      ...input,
      mode: "combined" as const,
      transitLocation: "Las Vegas",
      transitLatitude: 36.1699,
      transitLongitude: -115.1398,
      transitTimezone: "America/Los_Angeles",
      transitDate: "2026-11-06",
    };
    const a = await buildUnifiedMasterChart({ ...event, transitTime: "10:00" });
    const b = await buildUnifiedMasterChart({ ...event, transitTime: "14:00" });
    const first = a.layers["genesis-behavioral-patterns"].results as any,
      second = b.layers["genesis-behavioral-patterns"].results as any;
    expect(first.dominantPatterns).toEqual(second.dominantPatterns);
    expect(first.houseEmphasis).toEqual(second.houseEmphasis);
    expect(first.aspects.every((aspect: any) => !aspect.isTransitToNatal)).toBe(
      true
    );
  });

  it("the final themes consume judgment meanings even when the raw snapshot is held unchanged", async () => {
    const built = outcomesModule.buildMethodOutcomes(base, []);
    const target = built.find(
      o => o.methodId === "vedic-dasha-and-ashtakavarga"
    )!;
    const spy = vi.spyOn(outcomesModule, "buildMethodOutcomes");
    try {
      spy.mockReturnValue(built);
      const original = await synthesizeMasterReading({
        snapshot: base,
        readingMode: "natal",
        userQuestion: "timing",
      });
      const changed = structuredClone(built);
      const active = changed.find(o => o.methodId === target.methodId)!;
      active.findingJudgments[0].judgment =
        "The governing period directs the existing obligations toward a clearly defined timing decision.";
      spy.mockReturnValue(changed);
      const updated = await synthesizeMasterReading({
        snapshot: base,
        readingMode: "natal",
        userQuestion: "timing",
      });
      expect(updated.themes.find(t => t.domain === "timing")!.whyHow).toContain(
        active.findingJudgments[0].judgment
      );
      expect(updated.themes).not.toEqual(original.themes);
    } finally {
      spy.mockRestore();
    }
  });
  it("failed rule interpretations stay out of deterministic themes but retain every finding for the AI", async () => {
    const built = outcomesModule.buildMethodOutcomes(base, []);
    const failed = structuredClone(built);
    const method = failed.find(
      o => o.methodId === "vedic-dasha-and-ashtakavarga"
    )!;
    method.status = "failed";
    const spy = vi
      .spyOn(outcomesModule, "buildMethodOutcomes")
      .mockReturnValue(failed);
    try {
      const result = await synthesizeMasterReading({
        snapshot: base,
        readingMode: "natal",
      });
      expect(result.qualityAudit.passed).toBe(false);
      expect(result.methodOutcomeAudit.incompleteMethodIds).toContain(
        method.methodId
      );
      expect(
        result.themes
          .flatMap(t => t.linkedPropositionIds)
          .some(id =>
            id.startsWith("prop-method-vedic-dasha-and-ashtakavarga-")
          )
      ).toBe(false);
      expect(
        packSynthesis(result).methodOutcomes.find(
          o => o.methodId === method.methodId
        )!.findingJudgments.length
      ).toBe(method.findingJudgments.length);
      expect(packSynthesis(result).fullMethodOutcomes).toEqual(result.methodOutcomes);
    } finally {
      spy.mockRestore();
    }
  });
  it("text interning preserves EVERY original judgment exactly and preserves source/evidence references", async () => {
    const result = await synthesizeMasterReading({
      snapshot: base,
      readingMode: "natal",
    });
    const packet = packSynthesis(result);
    for (const outcome of result.methodOutcomes) {
      const packed = packet.methodOutcomes.find(
        o => o.methodId === outcome.methodId
      )!;
      expect(packed.findingJudgments.length).toBe(
        outcome.findingJudgments.length
      );
      packed.findingJudgments.forEach((row, index) => {
        const parts = row[1] as Array<string | number>;
        const text = parts
          .map(part =>
            typeof part === "number" ? packet.textTable[part] : part
          )
          .join("");
        expect(text).toBe(outcome.findingJudgments[index].judgment);
        expect(row[2]).toEqual(outcome.findingJudgments[index].evidenceIds);
        for (const ref of row[3] as number[])
          expect(packet.canonApplications[ref]?.sourceTitle).toBeTruthy();
      });
    }
  });
  it("event-prefixed methods dispatch the same specific handlers with separate scope", async () => {
    const s = await buildUnifiedMasterChart({
      ...input,
      mode: "combined",
      transitLocation: "Las Vegas",
      transitLatitude: 36.1699,
      transitLongitude: -115.1398,
      transitTimezone: "America/Los_Angeles",
      transitDate: "2026-11-06",
      transitTime: "11:06",
    });
    const event = s.transit!.framework!;
    const merged = {
      ...s,
      methodExecutionLedger: [
        ...s.methodExecutionLedger,
        ...event.methodExecutionLedger.map(m => ({
          ...m,
          id: `transit:${m.id}`,
          evidenceIds: m.evidenceIds.map(id => `transit:${id}`),
        })),
      ],
    };
    const o = run(merged, "transit:vedic-dasha-and-ashtakavarga");
    expect(o.status).toBe("interpreted");
    expect(o.chartScope).toBe("event");
    expect(o.frame).toBe("agent");
    expect(o.findingJudgments[0].subject).toContain("Mahadasha");
    expect(
      o.findingJudgments[0].evidenceIds.every(id => id.startsWith("transit:"))
    ).toBe(true);
  });
});
