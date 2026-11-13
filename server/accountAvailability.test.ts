import { describe, expect, it, vi } from "vitest";
import { getAccountAvailability } from "./accountAuth";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("account availability before sign-in", () => {
  it("reports a missing database without requesting credentials or creating a session", async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const cookie = vi.fn();
    try {
      const status = await getAccountAvailability();
      expect(status).toMatchObject({ available: false, reason: "not-configured" });
      expect(status.message).toContain("preserved");
      expect(status.message).not.toContain("DATABASE_URL");
      const caller = appRouter.createCaller({ req: { headers: {} }, res: { cookie }, user: null } as unknown as TrpcContext);
      expect(await caller.auth.availability()).toEqual(status);
      expect(cookie).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });
});
