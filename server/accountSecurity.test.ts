import { describe, expect, it, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  checkAccountRateLimit,
} from "./accountAuth";
import { sdk } from "./_core/sdk";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

const context = (openId?: string): TrpcContext => ({
  req: {
    headers: {},
    hostname: "localhost",
    socket: { remoteAddress: "127.0.0.1" },
  } as any,
  res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
  user: openId
    ? {
        id: 1,
        openId,
        name: openId,
        email: `${openId}@example.com`,
        role: "user",
        loginMethod: "password",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null,
});

describe("independent account security", () => {
  it("salts each password and rejects wrong or malformed hashes", async () => {
    const first = await hashPassword("a-long-private-password");
    const second = await hashPassword("a-long-private-password");
    expect(first).not.toBe(second);
    expect(first).not.toContain("a-long-private-password");
    expect(await verifyPassword("a-long-private-password", first)).toBe(true);
    expect(await verifyPassword("wrong-password", first)).toBe(false);
    expect(await verifyPassword("anything", "not-a-valid-hash")).toBe(false);
  });
  it("limits repeated attempts and releases the limit after its window", () => {
    const key = `test:${Math.random()}`;
    for (let n = 0; n < 10; n++) checkAccountRateLimit(key, 1000);
    expect(() => checkAccountRateLimit(key, 1000)).toThrow("Too many");
    expect(() =>
      checkAccountRateLimit(key, 1000 + 15 * 60 * 1000)
    ).not.toThrow();
  });
  it("accepts signed sessions and rejects tampered session tokens", async () => {
    const token = await sdk.createSessionToken("account:test", {
      name: "Test",
    });
    expect((await sdk.verifySession(token))?.openId).toBe("account:test");
    expect(
      await sdk.verifySession(token.slice(0, -12) + "invalidtoken")
    ).toBeNull();
    expect(await sdk.verifySession(undefined)).toBeNull();
  });
  it("rejects unauthenticated private reads and writes", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.history.charts()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(caller.history.readings()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(
      caller.history.saveChart({
        title: "Private",
        location: "Dallas",
        input: {},
        chart: {},
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("isolates saved charts and readings by authenticated account and rejects foreign chart links", async () => {
    const a = appRouter.createCaller(context("security-user-a"));
    const b = appRouter.createCaller(context("security-user-b"));
    const chartId = await a.history.saveChart({
      title: "Only A",
      location: "Dallas",
      input: {},
      chart: {},
    });
    expect((await a.history.charts()).some(chart => chart.id === chartId)).toBe(
      true
    );
    expect((await b.history.charts()).some(chart => chart.id === chartId)).toBe(
      false
    );
    await expect(
      b.history.saveReading({
        chartId,
        title: "Foreign",
        mode: "natal",
        content: {},
      })
    ).rejects.toThrow("does not belong");
    await a.history.saveReading({
      chartId,
      title: "Only A",
      mode: "natal",
      content: { reading: "Private" },
    });
    expect(
      (await b.history.readings()).some(reading => reading.title === "Only A")
    ).toBe(false);
  });
  it("refuses password sign-in when persistent storage is absent", async () => {
    if (process.env.DATABASE_URL) return;
    await expect(
      appRouter
        .createCaller(context())
        .auth.login({ email: "test@example.com", password: "password" })
    ).rejects.toThrow("storage is unavailable");
  });
});
