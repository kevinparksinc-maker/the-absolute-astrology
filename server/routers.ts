import { buildChartMethodOutcomes } from "./chartMethodOutcomes";
import { synthesizeMasterSnapshot } from "./astrologyKnowledge/synthesis/readingBridge";
import { narrateMasterSynthesis } from "./astrologyKnowledge/synthesis/narrative";
import { calculateMasterChart as calculateChart } from "./masterChart/entry";
import { buildEnergyReading } from "./energyReading";
import { buildChartPageReading } from "./chartPageReading";
import { buildPlanetPersonaMatrix } from "../shared/planetPersonaMatrix";
import { mapRequestedPlacementsToCanonicalMeaning } from "../shared/masterPlanetPersonaConfig";
import { buildChartBriefing } from "./chartBriefing";
import { buildFocusedReading } from "./focusedReading";
import { interactiveNatalChat } from "./interactiveNatalCompanion";
import { calculateHarmonicForecast } from "./harmonicForecast";
import { buildVimshottariTimeline, getAshtakavargaVisual } from "./astrologyKnowledge/vedic/timingAndAshtakavarga";
import { buildDivisionalCharts } from "./astrologyKnowledge/vedic/divisionalCharts";
import { synthesizeChartForReading } from "./astrologyKnowledge/synthesis/readingBridge";
import { formatCompactSynthesisContext } from "./astrologyKnowledge/synthesis/context";
import { z } from "zod";
import { checkAccountRateLimit, getAccountAvailability, loginAccount, registerAccount } from "./accountAuth";
import { sessionConfiguration } from "./_core/env";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { geocodeLocation, reverseGeocodeLocation, type ChartResult } from "./astronomy";
import {
  calculatePersonAge,
  calculateAnnualProfection,
  generatePlanetaryCycles,
  compileLifeStoryChapters,
  runAstrologyEngineAudit,
  generateLifeStoryChapter,
} from "./lifeStoryEngine";
import {
  followUp,
  generateChapter,
  generateInterpretation,
  READING_CHAPTERS,
} from "./interpretation";
import { askHost } from "./host";
import { horaryFollowUp, openHoraryQuestion, type HoraryChart } from "./horary";
import { getZodiacSignReading } from "./zodiacHorary";
import { ZODIAC_SIGNS } from "../shared/hybrid";
import { horaryFollowUpHistorySchema } from "./horary-input";
import {
  diagnoseAstrologyEvidence,
  evaluateBehavioralIntelligence,
} from "./astrologyKnowledge";
import { synthesizePlacement } from "./placement-synthesis";
import { analyzeSystemIntersect, evaluateLovedOneCheckIn } from "./social";
import { invokeLLM } from "./_core/llm";
import { buildAstrologyInterpreterSystem, FULL_SYNTHESIS_STYLE } from "./master-interpreter";
import { runGenesisPatternPipeline, generateReading } from "./genesisBackup";
import { buildUnifiedMasterChart, getMasterNatalChart } from "./masterChart/builder";
import { synthesizeMasterReading } from "./astrologyKnowledge/synthesis";
import { buildMasterPipeline } from "./master-pipeline";
import { buildMasterGameChart } from "./simulationLab/masterGameChart";
import { evaluatePlanetaryTeamHouses, predictSportsGame } from "./simulationLab/sportsPredictor";
import { evaluateGameMethods } from "../shared/simulationLab/registry";


const chartInput = z.object({
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  date: z.string(),
  time: z.string(),
  transitLocation: z.string().optional(),
  transitLatitude: z.number().optional(),
  transitLongitude: z.number().optional(),
  transitTimezone: z.string().optional(),
  transitDate: z.string().optional(),
  transitTime: z.string().optional(),
  transitInstantUtc: z.string().datetime({ offset: true }).optional(),
  instantUtc: z.string().datetime({ offset: true }).optional(),
  worldview: z.enum(["god", "agent", "agent-vs-god"]).default("agent"),
  readingScope: z.enum(["natal", "transit", "combined"]).default("combined"),
  birthTimeKnown: z.boolean().optional(),
  chartRole: z.enum(["natal", "event"]).optional(),
  elevation: z.number().optional(),
  sunriseAnchor: z.object({ sunriseUtc: z.string().datetime({ offset: true }), sunriseSunXYZ: z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite() }) }).optional(),
  transitSunriseAnchor: z.object({ sunriseUtc: z.string().datetime({ offset: true }), sunriseSunXYZ: z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite() }) }).optional(),
  xyzPositions: z.record(z.string(), z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite() })).optional(),
  transitXYZPositions: z.record(z.string(), z.object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite() })).optional(),
});
const chartRowPayload = z.object({
  name: z.string().min(1).max(100),
  longitude: z.number().finite(),
  display: z.string().max(100),
  house: z.number().int().min(1).max(12),
}).passthrough();
const chartPayloadShape = z.object({
  input: z.object({ location: z.string().max(240), date: z.string(), time: z.string() }).passthrough(),
  utc: z.string().min(1).max(60),
  julianDay: z.number().finite(),
  movingBodies: z.array(chartRowPayload).min(1).max(50),
  frozenStars: z.array(chartRowPayload).max(100),
  transits: z.array(chartRowPayload).max(80),
  houses: z.array(z.number().finite()).length(12),
}).passthrough();
/** Validate browser-returned calculated charts before trusting client-provided chart facts. */
const chartPayload = z.custom<ChartResult>(value => chartPayloadShape.safeParse(value).success, "Invalid calculated chart payload");
const horaryPayloadShape = z.object({
  question: z.string().min(1).max(1000),
  askedAt: z.string().min(1).max(60),
  placements: z.array(chartRowPayload).min(1).max(50),
  houses: z.array(z.object({ house: z.number().int().min(1).max(12), longitude: z.number().finite() }).passthrough()).length(12),
  traditional: z.object({ judgment: z.object({ verdict: z.string() }).passthrough() }).passthrough(),
}).passthrough();
const horaryPayload = z.custom<HoraryChart>(value => horaryPayloadShape.safeParse(value).success, "Invalid Horary chart payload");
const chartResultInput = z.object({ chart: chartPayload });
const placeInput = z.object({
  location: z.string().trim().min(2).max(240),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});
const horaryQuestionInput = placeInput.extend({
  question: z.string().trim().min(10).max(1000),
  subject: z.enum(["querent", "other"]),
  topicHouse: z.number().int().min(1).max(12),
  subjectHouse: z.number().int().min(1).max(12).optional(),
  natal: placeInput.optional(),
});
export const appRouter = router({
  system: systemRouter,
  auth: router({
    availability: publicProcedure.query(() => getAccountAvailability()),
    me: publicProcedure.query(({ ctx }) => {
      if (ctx.authError) throw ctx.authError;
      return ctx.user;
    }),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(1).max(100), email: z.string().trim().email().max(320), password: z.string().min(12).max(128) }))
      .mutation(async ({ ctx, input }) => {
        checkAccountRateLimit(`register:${ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown"}`);
        sessionConfiguration();
        const user = await registerAccount(input);
        const duration = 30 * 24 * 60 * 60 * 1000;
        const token = await sdk.createSessionToken(user.openId, { name: user.name, expiresInMs: duration });
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: duration });
        return { success: true };
      }),
    login: publicProcedure.input(z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) }))
      .mutation(async ({ ctx, input }) => {
        checkAccountRateLimit(`login:${ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown"}`);
        const user = await loginAccount(input);
        const duration = 30 * 24 * 60 * 60 * 1000;
        const token = await sdk.createSessionToken(user.openId, { name: user.name, expiresInMs: duration });
        ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: duration });
        return { success: true };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  history: router({
    charts: protectedProcedure.query(({ ctx }) =>
      db.listSavedCharts(ctx.user.openId)
    ),
    readings: protectedProcedure.query(({ ctx }) =>
      db.listSavedReadings(ctx.user.openId)
    ),
    saveChart: protectedProcedure
      .input(
        z.object({
          title: z.string().trim().min(1).max(180),
          location: z.string().trim().min(2).max(240),
          input: z.record(z.string(), z.unknown()),
          chart: z.record(z.string(), z.unknown()),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createSavedChart({ openId: ctx.user.openId, ...input })
      ),
    saveReading: protectedProcedure
      .input(
        z.object({
          chartId: z.number().int().optional(),
          title: z.string().trim().min(1).max(180),
          mode: z.enum(["natal", "transit", "combined"]),
          content: z.record(z.string(), z.unknown()),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createSavedReading({ openId: ctx.user.openId, ...input })
      ),
  }),
  simulationLab: router({
    predict: publicProcedure
      .input(z.object({
        id: z.string().trim().min(1).max(120),
        league: z.enum(["NFL", "NBA", "NHL"]),
        scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
        venue: z.object({
          name: z.string().trim().min(1).max(240),
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
          timezone: z.string().min(2).max(100),
        }),
        ascTeam: z.string().trim().min(1).max(120),
        descTeam: z.string().trim().min(1).max(120),
      }))
      .mutation(async ({ input }) => {
        const { snapshot, chart } = await buildMasterGameChart({
          ...input,
          chartVersion: "sports-master-2026.1",
        });
        const methods = evaluateGameMethods(snapshot, [{
          id: "sports-team-house-occupancy",
          name: "God/Agent event-chart team-house occupancy baseline",
          evaluate: () => evaluatePlanetaryTeamHouses(chart),
        }]);
        const prediction = await predictSportsGame(snapshot, methods);
        return { snapshot, methods, prediction };
      }),
  }),
  hybrid: router({
    geocode: publicProcedure
      .input(z.object({ query: z.string().min(2) }))
      .query(({ input }) => geocodeLocation(input.query)),
    reverseGeocode: publicProcedure
      .input(z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }))
      .query(({ input }) => reverseGeocodeLocation(input.latitude, input.longitude)),
    calculate: publicProcedure
      .input(chartInput)
      .mutation(({ input }) => calculateChart(input)),
    harmonicForecast: publicProcedure
      .input(z.object({ chart: chartInput, start: z.string().datetime(), steps: z.number().int().min(1).max(48).default(48) }))
      .mutation(({ input }) => calculateHarmonicForecast(input.chart, input.start, input.steps)),
    masterChart: publicProcedure
      .input(
        chartInput.extend({
          mode: z.enum(["natal", "transit", "combined"]).default("natal"),
        })
      )
      .mutation(async ({ input }) => {
        const snapshot = await (input.mode === "natal" && input.worldview === "agent-vs-god"
          ? getMasterNatalChart : buildUnifiedMasterChart)({ ...input, mode: input.mode });
        await synthesizeMasterSnapshot(snapshot, input.mode, "Evaluate the chart's complete method formation before output.");
        return snapshot;
      }),
  }),
  techniqueAudit: router({
    natal: publicProcedure
      .input(chartInput)
      .query(async ({ input }) => {
        const snapshot = await getMasterNatalChart({
          ...input,
          mode: "natal",
          worldview: "agent-vs-god",
        });
        return {
          snapshotId: snapshot.snapshotId,
          validation: snapshot.validation,
          layers: snapshot.methodExecutionLedger.map(layer => ({
            id: layer.id,
            name: layer.name,
            tradition: layer.tradition,
            technique: layer.technique,
            status: layer.status,
            frame: layer.frame,
            evidenceIds: layer.evidenceIds,
            results: layer.results ?? null,
            errorCode: layer.errorCode ?? null,
            notes: layer.notes ?? null,
          })),
        };
      }),
  }),
  vedic: router({
    ashtakavargaVisual: publicProcedure
      .input(chartResultInput)
      .query(({ input }) => getAshtakavargaVisual(input.chart)),
    dashaTimeline: publicProcedure
      .input(chartResultInput)
      .query(({ input }) => buildVimshottariTimeline(input.chart)),

    // Read a chart already saved to the signed-in account. Never recalculate
    // natal astronomy from a birth date, and never trust another user's ID.
    savedDivisionalCharts: protectedProcedure
      .input(z.object({ chartId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const saved = (await db.listSavedCharts(ctx.user.openId))
          .find(row => row.id === input.chartId);
        if (!saved) throw new Error("Saved natal chart not found for this account.");
        const validated = chartPayloadShape.safeParse(saved.chart);
        if (!validated.success) throw new Error("Saved chart does not contain a complete natal chart.");
        const natal = validated.data as ChartResult;
        if (!natal.ascendant || !Number.isFinite(natal.ascendant.longitude))
          throw new Error("Saved natal chart is missing a valid Ascendant.");
        if (!natal.northNode || !natal.southNode || !Number.isFinite(natal.northNode.longitude) || !Number.isFinite(natal.southNode.longitude))
          throw new Error("Saved natal chart is missing its lunar nodes.");
        return buildDivisionalCharts({
          ascendantLongitude: natal.ascendant.longitude,
          planets: [
            ...natal.movingBodies.map(p => ({ name: p.name, longitude: p.longitude })),
            { name: natal.northNode.name, longitude: natal.northNode.longitude },
            { name: natal.southNode.name, longitude: natal.southNode.longitude },
          ],
          d1HouseCusps: natal.houses,
        });
      }),

    // Reuses the active profile's existing natal chart; no calculateChart call.
    // The caller must supply the same chart already shown in the profile UI.
    divisionalCharts: publicProcedure
      .input(chartResultInput)
      .query(({ input }) => {
        const natal = input.chart;
        if (!natal.ascendant || !Number.isFinite(natal.ascendant.longitude))
          throw new Error("A calculated natal Ascendant is required for Vargas.");
        return buildDivisionalCharts({
          ascendantLongitude: natal.ascendant.longitude,
          planets: [
            ...natal.movingBodies.map(p => ({ name: p.name, longitude: p.longitude })),
            { name: natal.northNode.name, longitude: natal.northNode.longitude },
            { name: natal.southNode.name, longitude: natal.southNode.longitude },
          ],
          d1HouseCusps: natal.houses,
        });
      }),
  }),
  astrologyKnowledge: router({
    placementSynthesis: publicProcedure
      .input(
        chartResultInput.extend({
          body: z.string().trim().min(1).max(40),
          question: z.string().trim().max(2000).default(""),
        })
      )
      .mutation(({ input }) => synthesizePlacement(input.chart, input.body, input.question)),
    behavioralReport: publicProcedure
      .input(
        chartResultInput.extend({
          question: z.string().trim().max(2000).default(""),
          mode: z.enum(["natal", "transit", "combined"]).default("combined"),
        })
      )
      .query(async ({ input }) => {
        const master = await buildMasterPipeline(input.chart, input.mode, input.question);
        const report = evaluateBehavioralIntelligence(input.chart, input.question, input.mode);
        return {
          ...report,
          masterSnapshot: master.snapshot,
          masterSynthesis: master.synthesis,
        };
      }),
    diagnose: publicProcedure
      .input(
        chartResultInput.extend({
          question: z.string().trim().min(1).max(2000),
          mode: z.enum(["natal", "transit", "combined"]).default("combined"),
        })
      )
      .mutation(({ input }) => {
        if (process.env.NODE_ENV === "production")
          throw new Error(
            "Evidence Trace is available only in development mode."
          );
        return diagnoseAstrologyEvidence(
          input.chart,
          input.question,
          input.mode
        );
      }),
  }),
  interpretation: router({
    methodOutcomes: publicProcedure
      .input(chartResultInput.extend({ mode: z.enum(["natal", "transit", "combined"]).default("natal") }))
      .query(({ input }) => buildChartMethodOutcomes(input.chart, input.mode)),
    energyReading: publicProcedure.input(chartResultInput).mutation(({ input }) => buildEnergyReading(input.chart)),
    chartPage: publicProcedure.input(z.object({ chart: chartPayload, mode: z.enum(["natal", "transit", "combined"]), names: z.array(z.string().min(1).max(80)).min(1).max(2).default(["Sun", "Moon"]) })).mutation(({ input }) => buildChartPageReading(input.chart, input.mode, input.names)),
    personaMatrix: publicProcedure.input(chartResultInput).query(({ input }) => buildPlanetPersonaMatrix(input.chart)),
    canonicalMappings: publicProcedure
      .input(chartResultInput.extend({ requestedActors: z.array(z.string()).optional() }))
      .query(({ input }) => mapRequestedPlacementsToCanonicalMeaning(input.chart, input.requestedActors)),
    chatWithChart: publicProcedure
      .input(
        z.object({
          chart: chartPayload,
          history: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().max(12000),
              })
            )
            .max(40)
            .default([]),
          question: z.string().min(1).max(2000),
          mode: z.enum(["natal", "transit", "combined"]).default("natal"),
        })
      )
      .mutation(async ({ input }) => {
        return interactiveNatalChat(input.history, input.question, input.chart, input.mode);
      }),
    chartBriefing: publicProcedure.input(z.object({ chart: chartPayload })).mutation(({ input }) => buildChartBriefing(input.chart)),
    focusedPlacement: publicProcedure
      .input(z.object({ chart: chartPayload, target: z.object({ kind: z.enum(["placement", "star", "contact"]), name: z.string().min(1).max(80), otherName: z.string().min(1).max(80).optional(), layer: z.enum(["natal", "transit"]) }) }))
      .mutation(({ input }) => buildFocusedReading(input.chart, input.target, true)),
    host: publicProcedure
      .input(
        z.object({
          history: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().max(12000),
              })
            )
            .max(40)
            .default([]),
          question: z.string().min(1).max(2000),
          chart: chartPayload.optional(),
          mode: z.enum(["natal", "transit", "combined"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return askHost(input.history, input.question, input.chart, input.mode);
      }),
    generate: publicProcedure
      .input(
        chartResultInput.extend({
          mode: z.enum(["natal", "transit", "combined"]).default("combined"),
          question: z
            .string()
            .trim()
            .min(1)
            .max(2000)
            .default("What should I understand from this chart?"),
        })
      )
      .mutation(async ({ input }) => {
        const interpretation = await generateInterpretation(input.chart, input.mode, input.question);
        return { ...interpretation, synthesis: interpretation.masterSynthesis };
      }),
    masterSynthesize: publicProcedure
      .input(
        chartInput.extend({
          chart: chartPayload.optional(),
          mode: z.enum(["natal", "transit", "combined"]).default("natal"),
          question: z
            .string()
            .trim()
            .max(2000)
            .default("What is the core life purpose and integrated trajectory of this chart?"),
        })
      )
      .mutation(async ({ input }) => {
        if (input.chart) {
          const { synthesis } = await synthesizeChartForReading(input.chart, input.mode, input.question);
          return narrateMasterSynthesis(synthesis, input.question);
        }
        const snapshot = await buildUnifiedMasterChart({ ...input, mode: input.mode });
        const { synthesis } = await synthesizeMasterSnapshot(snapshot, input.mode, input.question);
        return narrateMasterSynthesis(synthesis, input.question);
      }),
    chapter: publicProcedure
      .input(
        z.object({
          chart: chartPayload,
          mode: z.enum(["natal", "transit", "combined"]),
          intelligence: z.string(),
          chapterId: z.enum(
            READING_CHAPTERS.map(chapter => chapter.id) as [string, ...string[]]
          ),
          completedChapters: z.array(z.string()).default([]),
          analysis: z.string().default(""),
          question: z.string().trim().max(2000).default(""),
        })
      )
      .mutation(async ({ input }) => {
        return generateChapter(
          input.chart as ChartResult,
          input.mode,
          input.intelligence,
          input.chapterId as any,
          input.completedChapters,
          input.analysis,
          input.question
        );
      }),
    followUp: publicProcedure
      .input(
        z.object({
          chart: chartPayload,
          interpretation: z.object({
            intelligence: z.string(),
            reading: z.string(),
          }),
          history: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ),
          question: z.string().min(1),
          mode: z.enum(["natal", "transit", "combined"]).default("combined"),
        })
      )
      .mutation(async ({ input }) => {
        return followUp(
          input.chart as ChartResult,
          input.interpretation,
          input.history,
          input.question,
          input.mode
        );
      }),
  }),
  horary: router({
    open: publicProcedure
      .input(horaryQuestionInput)
      .mutation(({ input }) => openHoraryQuestion(input)),
    followUp: publicProcedure
      .input(
        z.object({
          chart: horaryPayload,
          history: horaryFollowUpHistorySchema,
          question: z.string().trim().min(1).max(2000),
        })
      )
      .mutation(({ input }) =>
        horaryFollowUp(input.chart, input.history, input.question)
      ),
  }),
  zodiacHorary: router({
    // Separate from traditional Horary: the selected sign's classical ruler
    // anchors Agent House 1 while God View retains 0° Aries.
    read: publicProcedure
      .input(z.object({
        sign: z.enum(ZODIAC_SIGNS),
        date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
        time: z.string().regex(/^\\d{2}:\\d{2}$/),
        question: z.string().trim().max(700).optional(),
      }))
      .mutation(({ input }) => getZodiacSignReading(input)),
  }),
  social: router({
    listLovedOnes: protectedProcedure.query(({ ctx }) => db.listLovedOnes(ctx.user.openId)),
    saveLovedOne: protectedProcedure
      .input(
        z.object({
          id: z.number().optional(),
          name: z.string().trim().min(1).max(100),
          relationship: z.enum([
            "child",
            "partner",
            "parent",
            "sibling",
            "friend",
            "mentor",
            "colleague",
          ]),
          location: z.string().trim().min(2),
          latitude: z.number(),
          longitude: z.number(),
          timezone: z.string(),
          date: z.string(),
          time: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const openId = ctx.user.openId;
        return db.upsertLovedOne(openId, input as any);
      }),
    deleteLovedOne: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const openId = ctx.user.openId;
        return db.deleteLovedOne(openId, input.id);
      }),
    checkInStatus: publicProcedure
      .input(
        z.object({
          name: z.string(),
          relationship: z.enum([
            "child",
            "partner",
            "parent",
            "sibling",
            "friend",
            "mentor",
            "colleague",
          ]),
          location: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          timezone: z.string(),
          date: z.string(),
          time: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const chart = await calculateChart({
          location: input.location,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone,
          date: input.date,
          time: input.time || "12:00",
          worldview: "agent",
          readingScope: "combined",
        });
        const status = evaluateLovedOneCheckIn(chart, input.name, input.relationship);
        return { chart, status };
      }),
    systemIntersect: publicProcedure
      .input(
        z.object({
          userChart: chartPayload,
          targetChart: chartPayload,
        })
      )
      .mutation(async ({ input }) => {
        // Each person's complete calculated doctrine ledger is independent;
        // the existing cross-chart synastry calculation is preserved separately.
        const [user, target] = await Promise.all([
          synthesizeChartForReading(input.userChart as ChartResult, "natal", "Synastry: first person's natal evidence"),
          synthesizeChartForReading(input.targetChart as ChartResult, "natal", "Synastry: second person's natal evidence"),
        ]);
        return {
          ...analyzeSystemIntersect(input.userChart as ChartResult, input.targetChart as ChartResult),
          unifiedSynthesis: {
            scope: "two-natal-ledgers-plus-existing-cross-chart-synastry" as const,
            user: user.synthesis,
            target: target.synthesis,
            // Keep cross-chart aspects and scores from analyzeSystemIntersect;
            // never label either natal ledger as a computed cross-chart doctrine.
          },
        };
      }),
  }),
  ai: router({
    answerChartQuestion: publicProcedure
      .input(
        z.object({
          question: z.string().min(1),
          natalPlacements: z.string().optional(),
          transitPlacements: z.string().optional(),
          context: z.string().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `You are the Master Interpreter in LIFE STORYTELLING MODE for Bible Believers Astrology.
The user is asking: "${input.question}".
Natal context: ${input.natalPlacements || "Calculated Natal Horizon"}
Transit context: ${input.transitPlacements || "Current transit moment"}
Tone: ${input.gender === "male" ? "Active, grounded practical tone" : input.gender === "female" ? "Receptive, healing, and resonant tone" : "Balanced, objective elder guide"}

CRITICAL RULES:
1. Speak in a continuous, flowing biographical life story narrative—never produce 1-liner summaries or formulaic bullet checklists.
2. Ground your answer in their life arc: how formative childhood roots, early trials, and adulthood consolidation shape this exact topic.
3. Translate all astrological symbolism into concrete, observable real-world 2026 living (career, relationships, digital boundaries, personal sovereignty).
4. Give compassionate, grounded, and empowering guidance.`;

        const model = process.env.GEMINI_API_KEY ? "gemini-3.8-flash" : "claude-sonnet-4-6";
        const response = await invokeLLM({
          model,
          messages: [
            { role: "system", content: buildAstrologyInterpreterSystem(prompt) },
            { role: "user", content: input.question },
          ],
          maxTokens: 2500,
        });
        return String(response.choices[0]?.message?.content ?? "I could not complete that reading right now.");
      }),

    askTransitQuestion: publicProcedure
      .input(
        z.object({
          question: z.string().min(1),
          transitPlacements: z.string(),
          transitDate: z.string().optional(),
          transitTime: z.string().optional(),
  transitInstantUtc: z.string().datetime({ offset: true }).optional(),
  instantUtc: z.string().datetime({ offset: true }).optional(),
          transitLocation: z.string().optional(),
          conversationHistory: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(12000) })).max(40).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `You are the Master Interpreter in LIFE STORYTELLING MODE answering transit questions.
The user is asking: "${input.question}".
Current transit sky: ${input.transitPlacements} at ${input.transitLocation || "Observatory"} on ${input.transitDate || "today"}.
Speak in a generous, flowing narrative connecting this present celestial moment to their ongoing life story in real-world 2026 terms. Absolutely no dismissive 1-liners.`;
        const model = process.env.GEMINI_API_KEY ? "gemini-3.8-flash" : "claude-sonnet-4-6";
        const historyMessages = (input.conversationHistory || []).map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        const response = await invokeLLM({
          model,
          messages: [
            { role: "system", content: buildAstrologyInterpreterSystem(prompt) },
            ...historyMessages,
            { role: "user", content: input.question },
          ],
          maxTokens: 2200,
        });
        return { answer: String(response.choices[0]?.message?.content ?? "Unable to read transits right now.") };
      }),

    generateSoulmatePrediction: publicProcedure
      .input(
        z.object({
          natalPlacements: z.string(),
          gender: z.enum(["male", "female", "other"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `${FULL_SYNTHESIS_STYLE}\n\nThis is a natal relationship-potential reading, not actual two-person synastry. Never claim to know an unprovided future partner or meeting event. You are the Master Interpreter evaluating relationship symbolism.
Placements: ${input.natalPlacements}
Gender: ${input.gender || "other"}
Analyze their 7th house, Venus, Moon, and descendant aspects to describe their cosmic soulmate connection in deep, evocative 2026 relational terms. Return a JSON with:
{
  "soulmatePrediction": "A multi-paragraph flowing description of their soulmate's energy, demeanor, values, how they meet, and mutual dynamic",
  "descriptors": ["3-5 vivid adjectives/traits"]
}`;
        const model = process.env.GEMINI_API_KEY ? "gemini-3.8-flash" : "claude-sonnet-4-6";
        const response = await invokeLLM({
          model,
          messages: [{ role: "system", content: prompt }, { role: "user", content: "Generate soulmate prediction." }],
          maxTokens: 2000,
          responseFormat: { type: "json_object" },
        });
        const content = String(response.choices[0]?.message?.content ?? "");
        let parsed: any;
        try { parsed = JSON.parse(content); } catch { throw new Error("SOULMATE_AI_INVALID_JSON: AI returned invalid JSON."); }
        if (typeof parsed.soulmatePrediction !== "string" || parsed.soulmatePrediction.trim().length < 100 || !Array.isArray(parsed.descriptors) || parsed.descriptors.length === 0) {
          throw new Error("SOULMATE_AI_INVALID_RESPONSE: AI reading failed validation.");
        }
        return { soulmatePrediction: parsed.soulmatePrediction, descriptors: parsed.descriptors };
      }),

    generateSynastryBreakdown: publicProcedure
      .input(
        z.object({
          natalPlacements: z.string(),
          soulmatePlacements: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `${FULL_SYNTHESIS_STYLE}\n\nAnalyze synastry between:
Person 1: ${input.natalPlacements}
Person 2: ${input.soulmatePlacements}
Do not invent cross-chart aspects, orbs or compatibility scores. If the inputs contain placements but no verified cross-aspect calculations, return an empty aspects array and explain only the relationship themes that those natal placements can actually support. Generate a grounded relationship interpretation in JSON format with:
{
  "interpretation": "A flowing, comprehensive synthesis of this relationship's potential and spiritual purpose",
  "aspectGroups": [
    {
      "type": "harmonious",
      "aspects": [
        
      ]
    },
    {
      "type": "challenging",
      "aspects": [
        
      ]
    }
  ]
}`;
        const model = process.env.GEMINI_API_KEY ? "gemini-3.8-flash" : "claude-sonnet-4-6";
        const response = await invokeLLM({
          model,
          messages: [{ role: "system", content: prompt }, { role: "user", content: "Analyze synastry." }],
          maxTokens: 2500,
          responseFormat: { type: "json_object" },
        });
        const content = String(response.choices[0]?.message?.content ?? "");
        let parsed: any;
        try { parsed = JSON.parse(content); } catch { throw new Error("SYNASTRY_AI_INVALID_JSON: AI returned invalid JSON."); }
        if (typeof parsed.interpretation !== "string" || parsed.interpretation.trim().length < 100 || !Array.isArray(parsed.aspectGroups)) {
          throw new Error("SYNASTRY_AI_INVALID_RESPONSE: AI reading failed validation.");
        }
        return { interpretation: parsed.interpretation, aspectGroups: parsed.aspectGroups };
      }),

    genesisReading: publicProcedure
      .input(
        chartResultInput.extend({
          question: z.string().default(""),
          focusArea: z.enum(["career", "relationships", "health", "finance", "spirituality", "general", "creativity", "home"]).default("general"),
        })
      )
      .mutation(({ input }) => {
        const pipeline = runGenesisPatternPipeline(input.chart);
        return generateReading(
          pipeline.analysis,
          {
            question: input.question,
            focusArea: input.focusArea,
            preferredTone: "direct",
          },
          input.chart.input?.location || "Observatory",
          input.chart.input?.time || "12:00",
          input.chart.input?.date || new Date().toISOString().split("T")[0]
        );
      }),
  }),
  lifeStory: router({
    calculateCycles: publicProcedure
      .input(
        chartResultInput.extend({
          targetAge: z.number().min(0).max(120).optional(),
        })
      )
      .query(({ input }) => {
        const birthDate = input.chart.input?.date || "1990-01-01";
        const currentAge = calculatePersonAge(birthDate);
        const selectedAge = input.targetAge ?? currentAge;
        const profection = calculateAnnualProfection(selectedAge, input.chart);
        const cycles = generatePlanetaryCycles(input.chart, currentAge);
        const chapters = compileLifeStoryChapters(input.chart, currentAge, cycles);
        const audit = runAstrologyEngineAudit(input.chart);

        return {
          currentAge,
          selectedAge,
          profection,
          cycles,
          chapters,
          audit,
        };
      }),

    generateChapter: publicProcedure
      .input(
        chartResultInput.extend({
          chapterKey: z.enum([
            "birth_origins",
            "childhood",
            "adolescence",
            "early_adulthood",
            "adult_development",
            "later_life",
            "turning_points",
            "future_chapters",
          ]),
          selectedAge: z.number().min(0).max(120).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { synthesis } = await synthesizeChartForReading(input.chart as ChartResult, "natal", `Life story chapter: ${input.chapterKey}`);
        return generateLifeStoryChapter(
          input.chart as ChartResult,
          input.chapterKey,
          input.selectedAge,
          formatCompactSynthesisContext(synthesis)
        );
      }),

    audit: publicProcedure
      .input(chartResultInput)
      .query(({ input }) => {
        const layers = runAstrologyEngineAudit(input.chart);
        const verifiedCount = layers.filter(
          l => l.status === "implemented-verified"
        ).length;
        return {
          layers,
          totalLayers: layers.length,
          verifiedCount,
          isFullyOperational: verifiedCount >= 19,
        };
      }),
  }),
});
export type AppRouter = typeof appRouter;
