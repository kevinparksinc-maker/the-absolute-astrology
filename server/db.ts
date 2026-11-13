import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertSavedChart, InsertSavedReading, InsertUser, savedCharts, savedReadings, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// In-memory mock fallback when DATABASE_URL is not configured in AI Studio
const mockUsers = new Map<string, typeof users.$inferSelect>();
const mockCharts: Array<typeof savedCharts.$inferSelect> = [];
const mockReadings: Array<typeof savedReadings.$inferSelect> = [];
let nextUserId = 1;
let nextChartId = 1;
let nextReadingId = 1;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to initialize the configured connection:", error);
      _db = null;
    }
  }
  if (!_db && process.env.NODE_ENV === "production") throw new Error("Persistent account storage is unavailable. Configure DATABASE_URL; no temporary production records will be created.");
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    const now = new Date();
    const existing = mockUsers.get(user.openId);
    const role = user.role ?? existing?.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
    mockUsers.set(user.openId, {
      id: existing?.id ?? nextUserId++,
      openId: user.openId,
      name: user.name !== undefined ? (user.name ?? null) : (existing?.name ?? null),
      email: user.email !== undefined ? (user.email ?? null) : (existing?.email ?? null),
      loginMethod: user.loginMethod !== undefined ? (user.loginMethod ?? null) : (existing?.loginMethod ?? null),
      role,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn ?? now,
    });
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return mockUsers.get(openId);
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createSavedChart(input: InsertSavedChart) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const id = nextChartId++;
    mockCharts.unshift({
      id,
      openId: input.openId,
      title: input.title,
      location: input.location,
      input: input.input,
      chart: input.chart,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }
  const result = await db.insert(savedCharts).values(input);
  return Number(result[0].insertId);
}

export async function listSavedCharts(openId: string) {
  const db = await getDb();
  if (!db) return mockCharts.filter(c => c.openId === openId);
  return db.select().from(savedCharts).where(eq(savedCharts.openId, openId)).orderBy(desc(savedCharts.updatedAt));
}

export async function createSavedReading(input: InsertSavedReading) {
  const db = await getDb();
  if (input.chartId != null) {
    const owned = db
      ? await db.select({ id: savedCharts.id }).from(savedCharts).where(and(eq(savedCharts.id, input.chartId), eq(savedCharts.openId, input.openId))).limit(1)
      : mockCharts.filter(chart => chart.id === input.chartId && chart.openId === input.openId);
    if (!owned.length) throw new Error("The saved chart does not belong to this account.");
  }
  if (!db) {
    const now = new Date();
    const id = nextReadingId++;
    mockReadings.unshift({
      id,
      openId: input.openId,
      chartId: input.chartId ?? null,
      title: input.title,
      mode: input.mode,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  }
  const result = await db.insert(savedReadings).values(input);
  return Number(result[0].insertId);
}

export async function listSavedReadings(openId: string) {
  const db = await getDb();
  if (!db) return mockReadings.filter(r => r.openId === openId);
  return db.select().from(savedReadings).where(eq(savedReadings.openId, openId)).orderBy(desc(savedReadings.updatedAt));
}

// ==========================================
// Pinned Loved Ones & Social Network Matrix
// ==========================================
import type { LovedOneRecord, LovedOneInput } from "../shared/social";

let nextLovedOneId = 1;
const mockLovedOnes: Array<LovedOneRecord> = [];

export async function listLovedOnes(openId: string): Promise<LovedOneRecord[]> {
  if (!openId) throw new Error("Authentication required.");
  return mockLovedOnes.filter(item => item.openId === openId);
}

export async function upsertLovedOne(openId: string, input: LovedOneInput): Promise<LovedOneRecord> {
  const now = new Date().toISOString();
  if (input.id) {
    const idx = mockLovedOnes.findIndex(l => l.id === input.id && l.openId === openId);
    if (idx !== -1) {
      mockLovedOnes[idx] = {
        ...mockLovedOnes[idx],
        ...input,
        updatedAt: now,
      };
      return mockLovedOnes[idx];
    }
  }
  const newRecord: LovedOneRecord = {
    id: nextLovedOneId++,
    openId,
    name: input.name,
    relationship: input.relationship,
    location: input.location,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    date: input.date,
    time: input.time,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  mockLovedOnes.unshift(newRecord);
  return newRecord;
}

export async function deleteLovedOne(openId: string, id: number): Promise<boolean> {
  const idx = mockLovedOnes.findIndex(l => l.id === id && l.openId === openId);
  if (idx !== -1) {
    mockLovedOnes.splice(idx, 1);
    return true;
  }
  return false;
}

