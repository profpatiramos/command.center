import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, unique } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const commands = mysqlTable("commands", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(), slashCommand: varchar("slashCommand", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(), description: text("description").notNull(), category: mysqlEnum("category", ["PENSAR", "ESCREVER", "CRIAR", "CRESCER"]).notNull(),
  subcategory: varchar("subcategory", { length: 120 }).notNull(), objective: varchar("objective", { length: 120 }).notNull(), outputType: varchar("outputType", { length: 80 }).notNull(), platform: varchar("platform", { length: 120 }).notNull(),
  promptTemplate: text("promptTemplate").notNull(), tags: text("tags").notNull(), difficulty: varchar("difficulty", { length: 40 }).notNull(), featured: boolean("featured").default(false).notNull(), active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("commands_category_idx").on(table.category), index("commands_active_idx").on(table.active)]);

export const placeholders = mysqlTable("placeholders", {
  id: int("id").autoincrement().primaryKey(), commandId: int("commandId").notNull(), name: varchar("name", { length: 80 }).notNull(), label: varchar("label", { length: 120 }).notNull(), type: varchar("type", { length: 30 }).notNull(), required: boolean("required").default(true).notNull(), options: text("options"), defaultValue: text("defaultValue"),
}, (table) => [index("placeholders_command_idx").on(table.commandId)]);

export const favorites = mysqlTable("favorites", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), commandId: int("commandId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => [unique("favorite_user_command_unique").on(table.userId, table.commandId)]);
export const usages = mysqlTable("usages", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), commandId: int("commandId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => [index("usage_user_idx").on(table.userId, table.createdAt)]);
export const imports = mysqlTable("commandImports", { id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), filename: varchar("filename", { length: 255 }).notNull(), format: mysqlEnum("format", ["json", "csv"]).notNull(), importedCount: int("importedCount").default(0).notNull(), status: varchar("status", { length: 40 }).default("completed").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, (table) => [index("imports_user_idx").on(table.userId, table.createdAt)]);

export type User = typeof users.$inferSelect; export type InsertUser = typeof users.$inferInsert;
export type Command = typeof commands.$inferSelect; export type InsertCommand = typeof commands.$inferInsert;
