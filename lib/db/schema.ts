import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// Users table (compatible with NextAuth)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  name: text("name"),
  image: text("image"),
  password: text("password"), // Only for credentials provider (hashed with bcrypt)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

// NextAuth accounts table (for OAuth providers)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // oauth, credentials, etc.
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: timestamp("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
}, (table) => ({
  userIdIdx: index("accounts_user_id_idx").on(table.userId),
  providerIdx: index("accounts_provider_idx").on(table.provider, table.providerAccountId),
}));

// NextAuth sessions table
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expires: timestamp("expires").notNull(),
}, (table) => ({
  sessionTokenIdx: index("sessions_session_token_idx").on(table.sessionToken),
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
}));

// NextAuth verification tokens
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
}, (table) => ({
  tokenIdx: index("verification_tokens_token_idx").on(table.token, table.identifier),
  // Composite primary key for verification tokens
  pk: index("verification_tokens_pk").on(table.identifier, table.token),
}));

export const analysisHistory = pgTable("analysis_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").$type<"job" | "resume" | "cover-letter">().notNull(),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),
  jobUrl: text("job_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  typeIdx: index("type_idx").on(table.type),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AnalysisHistory = typeof analysisHistory.$inferSelect;
export type NewAnalysisHistory = typeof analysisHistory.$inferInsert;

