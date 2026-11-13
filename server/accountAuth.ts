import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { accountCredentials, users } from "../drizzle/schema";
import { ENV, sessionConfiguration } from "./_core/env";

const scrypt = promisify(scryptCallback);
export async function hashPassword(password: string) {
  const salt = randomBytes(32).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, encoded] = stored.split(":");
  if (
    algorithm !== "scrypt" ||
    !/^[a-f0-9]{64}$/.test(salt || "") ||
    !/^[a-f0-9]{128}$/.test(encoded || "")
  )
    return false;
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(hash, Buffer.from(encoded, "hex"));
}
const attempts = new Map<string, { count: number; until: number }>();
export function checkAccountRateLimit(key: string, now = Date.now()) {
  for (const [id, value] of Array.from(attempts.entries()))
    if (value.until <= now) attempts.delete(id);
  const value = attempts.get(key) ?? { count: 0, until: now + 15 * 60 * 1000 };
  if (value.count >= 10 || attempts.size >= 10000)
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many sign-in attempts. Try again in 15 minutes.",
    });
  value.count++;
  attempts.set(key, value);
}
let schemaReady: Promise<void> | undefined;
async function accountDb() {
  let db;
  try {
    db = await getDb();
  } catch {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Account storage is unavailable. Check the server's DATABASE_URL. Existing device profiles have been preserved.",
    });
  }
  if (!db)
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Account storage is unavailable. Configure the server's DATABASE_URL to enable sign-in. Your existing device profiles have been preserved.",
    });
  // Idempotent schema setup for existing installations; no account data is replaced.
  schemaReady ??= db
    .execute(
      sql`CREATE TABLE IF NOT EXISTS account_credentials (
    email varchar(320) NOT NULL PRIMARY KEY,
    openId varchar(64) NOT NULL UNIQUE,
    passwordHash varchar(255) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`
    )
    .then(() => undefined)
    .catch(error => {
      schemaReady = undefined;
      throw error;
    });
  try {
    await schemaReady;
  } catch {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Account storage needs setup. Check the database connection and schema permissions.",
    });
  }
  return db;
}
export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
}) {
  const db = await accountDb();
  const email = input.email.trim().toLowerCase();
  const openId = `account:${randomUUID()}`;
  const passwordHash = await hashPassword(input.password);
  try {
    await db.transaction(async tx => {
      // Never attach a password to an existing OAuth identity by matching its email.
      const existing = await tx
        .select({ openId: users.openId })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existing.length)
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "An account already uses this email. Sign in using its existing method.",
        });
      await tx
        .insert(users)
        .values({
          openId,
          name: input.name.trim(),
          email,
          loginMethod: "password",
          lastSignedIn: new Date(),
        });
      await tx
        .insert(accountCredentials)
        .values({ openId, email, passwordHash });
    });
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY" || error?.cause?.code === "ER_DUP_ENTRY")
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account already uses this email. Sign in instead.",
      });
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Unable to create the account. Check the database schema and try again.",
    });
  }
  return { openId, name: input.name.trim() };
}
// Same work for unknown accounts prevents the obvious password-hash timing shortcut.
const dummyHash = hashPassword(randomBytes(32).toString("hex"));
async function authenticateAccount(input: { email: string; password: string }) {
  const db = await accountDb();
  const email = input.email.trim().toLowerCase();
  const [credential] = await db
    .select()
    .from(accountCredentials)
    .where(eq(accountCredentials.email, email))
    .limit(1);
  const valid = await verifyPassword(
    input.password,
    credential?.passwordHash || (await dummyHash)
  );
  if (!credential || !valid)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Email or password is incorrect.",
    });
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.openId, credential.openId))
    .limit(1);
  if (!user)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Email or password is incorrect.",
    });
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.openId, user.openId));
  return { openId: user.openId, name: user.name || "" };
}

export async function loginAccount(input: { email: string; password: string }) {
  try {
    return await authenticateAccount(input);
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to check the account. Please try again.",
    });
  }
}

/** Check real account storage before presenting registration or sign-in fields. */
export async function getAccountAvailability(): Promise<{ available: boolean; reason: "ready" | "not-configured" | "unreachable" | "schema-required" | "session-unavailable"; message: string; legacySignInAvailable?: boolean }> {
  try { sessionConfiguration(); }
  catch { return { available: false, reason: "session-unavailable", message: "The account session service needs configuration. Your existing device profiles have been preserved." }; }
  if (!process.env.DATABASE_URL?.trim()) return {
    available: false, reason: "not-configured",
    message: "Account sign-in is not connected yet. Existing profiles saved on this device have been preserved.",
  };
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      (async () => {
        const db = await accountDb();
        await db.select({ id: users.id }).from(users).limit(1);
      })(),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Account database timeout")), 5000); }),
    ]);
    return { available: true, reason: "ready", message: "Account connection is ready.", legacySignInAvailable: Boolean(ENV.oAuthServerUrl && (process.env.MANUS_OAUTH_PORTAL_URL?.trim() || process.env.VITE_OAUTH_PORTAL_URL?.trim())) };
  } catch {
    return { available: false, reason: "unreachable", message: "The account connection is temporarily unavailable. Your existing device profiles have been preserved. Try checking the connection again." };
  } finally { if (timeout) clearTimeout(timeout); }
}
