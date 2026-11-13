import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { createServer, type Server } from "node:http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { sdk } from "./_core/sdk";
import { sessionConfiguration } from "./_core/env";
import * as accounts from "./accountAuth";
import * as db from "./db";
import { COOKIE_NAME } from "../shared/const";

let server: Server | undefined;
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  if (server) { server.closeAllConnections(); await new Promise<void>(resolve => server!.close(() => resolve())); server = undefined; }
});

async function application() {
  const app = express();
  app.use(express.json());
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  server = createServer(app);
  await new Promise<void>(resolve => server!.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;
  return async (route: string, input?: unknown, cookie?: string) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/trpc/${route}`, {
      method: input === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
      ...(input === undefined ? {} : { body: JSON.stringify({ json: input }) }),
    });
    const body = await response.json();
    return { response, data: body.result?.data?.json, error: body.error?.json };
  };
}

describe("account session configuration", () => {
  it("does not mint self-rejecting sessions when optional environment aliases are blank", async () => {
    vi.stubEnv("MANUS_PROJECT_ID", ""); vi.stubEnv("VITE_APP_ID", "");
    vi.stubEnv("MANUS_JWT_SECRET", ""); vi.stubEnv("JWT_SECRET", "fixture-session-secret-at-least-thirty-two-characters");
    const token = await sdk.createSessionToken("account:blank-env", { name: "Fixture" });
    expect(await sdk.verifySession(token)).toMatchObject({ openId: "account:blank-env", appId: "firmament-guardian" });
    expect(sessionConfiguration({ NODE_ENV: "production", MANUS_JWT_SECRET: " ", JWT_SECRET: "fixture-session-secret-at-least-thirty-two-characters" }).secret).toContain("fixture-session-secret");
    expect(() => sessionConfiguration({ NODE_ENV: "production", JWT_SECRET: "short" })).toThrow(/32 characters/);
  });
  it("rejects expired sessions and tokens issued for another application", async () => {
    expect(await sdk.verifySession(await sdk.createSessionToken("account:expired", { expiresInMs: -10000 }))).toBeNull();
    expect(await sdk.verifySession(await sdk.signSession({ openId: "account:other", name: "Other", appId: "other-application" }))).toBeNull();
  });
});

describe("real HTTP session lifecycle (credential repository stubbed)", () => {
  it("sets an HttpOnly cookie, restores its identity, isolates history, and clears the cookie on sign-out", async () => {
    const ids = ["account:http-a", "account:http-b"];
    for (const openId of ids) await db.upsertUser({ openId, name: openId, email: `${openId}@example.com` });
    vi.spyOn(accounts, "loginAccount").mockResolvedValue({ openId: ids[0], name: "A" });
    const request = await application();
    const login = await request("auth.login", { email: "a@example.com", password: "fixture-password" });
    expect(login.response.status).toBe(200);
    const setCookie = login.response.headers.get("set-cookie")!;
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    const cookie = setCookie.split(";")[0];
    expect((await request("auth.me", undefined, cookie)).data.openId).toBe(ids[0]);
    const saved = await request("history.saveChart", { title: "Account A chart", location: "Dallas", input: {}, chart: {} }, cookie);
    expect(saved.response.status).toBe(200);
    const bCookie = `${COOKIE_NAME}=${await sdk.createSessionToken(ids[1])}`;
    expect((await request("history.charts", undefined, cookie)).data.some((row: { id: number }) => row.id === saved.data)).toBe(true);
    expect((await request("history.charts", undefined, bCookie)).data.some((row: { id: number }) => row.id === saved.data)).toBe(false);
    const logout = await request("auth.logout", {}, cookie);
    expect(logout.data.success).toBe(true);
    expect(logout.response.headers.get("set-cookie")).toContain(`${COOKIE_NAME}=`);
    expect((await request("auth.me")).data).toBeNull();
    expect((await request("history.charts")).response.status).toBe(401);
  });
  it("reports database failure without pretending the account signed out, while logout remains available", async () => {
    const token = await sdk.createSessionToken("account:database-offline");
    vi.spyOn(db, "getUserByOpenId").mockRejectedValue(new Error("fixture database offline"));
    const request = await application();
    const cookie = `${COOKIE_NAME}=${token}`;
    expect((await request("auth.me", undefined, cookie)).response.status).toBe(503);
    expect((await request("history.charts", undefined, cookie)).response.status).toBe(503);
    expect((await request("auth.logout", {}, cookie)).data.success).toBe(true);
  });
});
