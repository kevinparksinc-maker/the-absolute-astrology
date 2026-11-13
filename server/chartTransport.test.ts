import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import { createServer, type Server } from "node:http";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import superjson from "superjson";
import { appRouter, type AppRouter } from "./routers";
import { calculateChart } from "./astronomy";
import {
  chartQueryServerTransport,
  chartQueryTransport,
} from "../shared/trpcTransport";

const input = {
  location: "Dallas, Texas, USA",
  latitude: 32.7767,
  longitude: -96.797,
  timezone: "America/Chicago",
  date: "1986-11-20",
  time: "10:06",
  worldview: "agent" as const,
  readingScope: "natal" as const,
};

describe("full chart HTTP transport", () => {
  let server: Server;
  let url: string;
  beforeAll(async () => {
    const app = express();
    app.use(express.json({ limit: "50mb" }));
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        ...chartQueryServerTransport,
        router: appRouter,
        createContext: () => ({ user: null, req: {} as any, res: {} as any }),
      })
    );
    server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Missing test address");
    url = `http://127.0.0.1:${address.port}/api/trpc`;
  });
  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  });
  it("reproduces oversized GET failure and loads all three real Vedic queries through POST", async () => {
    const chart = await calculateChart(input);
    expect(JSON.stringify(chart).length).toBeGreaterThan(16384);
    const oldClient = createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url, transformer: superjson })],
    });
    await expect(
      oldClient.vedic.divisionalCharts.query({ chart })
    ).rejects.toThrow();
    const requests: { method: string; length: number }[] = [];
    const client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          ...chartQueryTransport,
          url,
          transformer: superjson,
          fetch: (request, init) => {
            requests.push({
              method: init?.method ?? "GET",
              length: String(request).length,
            });
            return fetch(request, init);
          },
        }),
      ],
    });
    const [divisions, dasha, strengths] = await Promise.all([
      client.vedic.divisionalCharts.query({ chart }),
      client.vedic.dashaTimeline.query({ chart }),
      client.vedic.ashtakavargaVisual.query({ chart }),
    ]);
    expect(divisions.map(d => d.division)).toEqual([
      "D1",
      "D2",
      "D3",
      "D9",
      "D10",
    ]);
    expect(dasha.available).toBe(true);
    expect(strengths.available).toBe(true);
    if (strengths.available) expect(strengths.total).toBe(337);
    expect(requests.every(r => r.method === "POST" && r.length < 1024)).toBe(
      true
    );
  });
});
