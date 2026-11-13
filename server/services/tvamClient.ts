import { z } from "zod";
import { VedicSnapshotSchema, type VedicSnapshot } from "../patterns/types";

export type TvamChartRequest = {
  chartId?: string;
  birthDate?: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

const TvamResponseSchema = z
  .object({
    signals: z.array(z.unknown()).optional(),
    planets: z.array(z.unknown()).optional(),
    data: z
      .object({
        signals: z.array(z.unknown()).optional(),
        planets: z.array(z.unknown()).optional(),
      })
      .optional(),
  })
  .passthrough();

export interface VedicProvider {
  readonly name: string;
  getAnalysis(request: TvamChartRequest): Promise<VedicSnapshot>;
}

function parseSignal(value: unknown) {
  const object =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const planet = String(object.planet ?? object.name ?? "Unknown");
  const longitude =
    typeof object.longitude === "number" ? object.longitude : undefined;
  const dignity = [
    "exalted",
    "own-sign",
    "neutral",
    "debilitated",
    "unknown",
  ].includes(String(object.dignity))
    ? (String(object.dignity) as
        | "exalted"
        | "own-sign"
        | "neutral"
        | "debilitated"
        | "unknown")
    : "unknown";
  return {
    planet,
    ...(longitude == null
      ? {}
      : { longitude: ((longitude % 360) + 360) % 360 }),
    sign: typeof object.sign === "string" ? object.sign : undefined,
    house: typeof object.house === "number" ? object.house : undefined,
    nakshatra:
      typeof object.nakshatra === "string" ? object.nakshatra : undefined,
    pada: typeof object.pada === "number" ? object.pada : undefined,
    dignity,
    themes: Array.isArray(object.themes)
      ? object.themes.filter(
          (theme): theme is string => typeof theme === "string"
        )
      : [],
    raw: object,
  };
}

export function parseTvamResponse(payload: unknown): VedicSnapshot {
  const parsed = TvamResponseSchema.parse(payload);
  const container = parsed.data ?? parsed;
  const rows =
    parsed.signals ??
    parsed.planets ??
    container.signals ??
    container.planets ??
    [];
  return VedicSnapshotSchema.parse({
    signals: rows.map(parseSignal),
    provider: "tvam",
  });
}

export type TvamClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

/** A deliberately thin adapter. It only calls an endpoint when an authorized URL is supplied. */
export class TvamClient implements VedicProvider {
  readonly name = "tvam";
  private readonly options: TvamClientOptions;

  constructor(options: TvamClientOptions = {}) {
    this.options = options;
  }

  async getAnalysis(request: TvamChartRequest): Promise<VedicSnapshot> {
    if (!this.options.baseUrl)
      throw new Error(
        "TvamClient requires an authorized baseUrl; use MockTvamProvider for local development."
      );
    const fetchImpl = this.options.fetchImpl ?? fetch;
    const response = await fetchImpl(
      `${this.options.baseUrl.replace(/\/$/, "")}/analysis`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.options.apiKey
            ? { authorization: `Bearer ${this.options.apiKey}` }
            : {}),
        },
        body: JSON.stringify(request),
      }
    );
    if (!response.ok)
      throw new Error(`Tvam provider returned HTTP ${response.status}.`);
    return parseTvamResponse(await response.json());
  }
}

export class MockTvamProvider implements VedicProvider {
  readonly name = "mock-tvam";
  constructor(
    private readonly snapshot: VedicSnapshot = {
      provider: "mock-tvam",
      signals: [],
    }
  ) {}
  async getAnalysis(_request: TvamChartRequest): Promise<VedicSnapshot> {
    return VedicSnapshotSchema.parse(this.snapshot);
  }
}
