import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const savedCharts = mysqlTable("saved_charts", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  location: varchar("location", { length: 240 }).notNull(),
  input: json("input").notNull(),
  chart: json("chart").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ openIdIdx: index("saved_charts_open_id_idx").on(table.openId) }));

export const savedReadings = mysqlTable("saved_readings", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull(),
  chartId: int("chartId"),
  title: varchar("title", { length: 180 }).notNull(),
  mode: mysqlEnum("mode", ["natal", "transit", "combined"]).notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ openIdIdx: index("saved_readings_open_id_idx").on(table.openId) }));

export type SavedChart = typeof savedCharts.$inferSelect;
export type InsertSavedChart = typeof savedCharts.$inferInsert;
export type SavedReading = typeof savedReadings.$inferSelect;
export type InsertSavedReading = typeof savedReadings.$inferInsert;

/** Independent account credentials; hashes are never returned by account APIs. */
export const accountCredentials = mysqlTable("account_credentials", {
  email: varchar("email", { length: 320 }).primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
