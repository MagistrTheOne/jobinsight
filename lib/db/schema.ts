import { pgTable, text, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";

// Users table (Better Auth compatible - using existing plural table name)
// Better Auth adapter should exclude createdAt/updatedAt during insert if they have defaultNow()
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
}));

// Better Auth accounts table (for OAuth providers - using existing plural table name)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("accounts_user_id_idx").on(table.userId),
  providerIdx: index("accounts_provider_idx").on(table.providerId, table.accountId),
}));

// Better Auth sessions table (using existing plural table name)
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  tokenIdx: index("sessions_token_idx").on(table.token),
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
}));

// Better Auth verification table (for email verification, password reset, etc.)
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  identifierIdx: index("verifications_identifier_idx").on(table.identifier),
  valueIdx: index("verifications_value_idx").on(table.value),
}));

// NextAuth verification tokens (legacy, kept for backward compatibility)
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

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  plan: text("plan").$type<"free" | "pro">().notNull().default("free"),
  polarCustomerId: text("polar_customer_id"),
  polarSubscriptionId: text("polar_subscription_id"),
  status: text("status").$type<"active" | "cancelled" | "expired">().notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
}));

export const usageLimits = pgTable("usage_limits", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  periodStart: timestamp("period_start").notNull(),
  resumeCount: integer("resume_count").notNull().default(0),
  jobCount: integer("job_count").notNull().default(0),
  coverLetterCount: integer("cover_letter_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("usage_limits_user_id_idx").on(table.userId),
  periodStartIdx: index("usage_limits_period_start_idx").on(table.periodStart),
  userPeriodIdx: index("usage_limits_user_period_idx").on(table.userId, table.periodStart),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AnalysisHistory = typeof analysisHistory.$inferSelect;
export type NewAnalysisHistory = typeof analysisHistory.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type UsageLimits = typeof usageLimits.$inferSelect;
export type NewUsageLimits = typeof usageLimits.$inferInsert;

export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("chats_user_id_idx").on(table.userId),
  createdAtIdx: index("chats_created_at_idx").on(table.createdAt),
}));

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").references(() => chats.id, { onDelete: "cascade" }).notNull(),
  role: text("role").$type<"user" | "assistant" | "system">().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  chatIdIdx: index("chat_messages_chat_id_idx").on(table.chatId),
  createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
}));

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

// Job Postings - сохраненные вакансии для отслеживания
export const jobPostings = pgTable("job_postings", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  company: text("company"),
  url: text("url"),
  description: text("description"), // Полное описание вакансии
  location: text("location"),
  salary: text("salary"),
  jobType: text("job_type"), // full-time, part-time, contract, etc.
  jobGrade: text("job_grade"), // Junior, Middle, Senior, Lead
  source: text("source"), // hh.ru, linkedin, direct, etc.
  rawData: jsonb("raw_data"), // Сырые данные для будущего использования
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("job_postings_user_id_idx").on(table.userId),
  companyIdx: index("job_postings_company_idx").on(table.company),
  createdAtIdx: index("job_postings_created_at_idx").on(table.createdAt),
  sourceIdx: index("job_postings_source_idx").on(table.source),
}));

// Applications - отклики на вакансии
export const applications = pgTable("applications", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  jobPostingId: text("job_posting_id").references(() => jobPostings.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // Название позиции
  company: text("company").notNull(),
  status: text("status").$type<"saved" | "applied" | "viewed" | "phone_screen" | "interview" | "technical_interview" | "final_interview" | "offer" | "rejected" | "withdrawn">().notNull().default("saved"),
  appliedDate: timestamp("applied_date"),
  applicationUrl: text("application_url"), // URL отклика
  resumeVersion: text("resume_version"), // ID версии резюме, которое использовали
  coverLetter: text("cover_letter"), // Текст cover letter для этого отклика
  notes: text("notes"), // Заметки пользователя
  salaryOffer: text("salary_offer"), // Предложенная зарплата
  nextFollowUp: timestamp("next_follow_up"), // Дата следующего follow-up
  isFavorite: integer("is_favorite").default(0), // 0 или 1 для boolean
  tags: jsonb("tags"), // Массив тегов ["urgent", "dream-job", etc.]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("applications_user_id_idx").on(table.userId),
  jobPostingIdIdx: index("applications_job_posting_id_idx").on(table.jobPostingId),
  statusIdx: index("applications_status_idx").on(table.status),
  appliedDateIdx: index("applications_applied_date_idx").on(table.appliedDate),
  nextFollowUpIdx: index("applications_next_follow_up_idx").on(table.nextFollowUp),
}));

// Application Status History - история изменения статусов
export const applicationStatusHistory = pgTable("application_status_history", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").references(() => applications.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull(),
  notes: text("notes"), // Заметки при смене статуса
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  applicationIdIdx: index("application_status_history_application_id_idx").on(table.applicationId),
  createdAtIdx: index("application_status_history_created_at_idx").on(table.createdAt),
}));

// Resume Versions - управление версиями резюме
export const resumeVersions = pgTable("resume_versions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(), // "Frontend Developer", "Full Stack Engineer", etc.
  content: text("content").notNull(), // Полный текст резюме
  template: text("template").default("modern"), // modern, classic, creative, technical
  isDefault: integer("is_default").default(0), // 0 или 1
  optimizedFor: text("optimized_for"), // ID вакансии, под которую оптимизировано
  tags: jsonb("tags"), // Теги для категоризации
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index("resume_versions_user_id_idx").on(table.userId),
  isDefaultIdx: index("resume_versions_is_default_idx").on(table.isDefault),
  createdAtIdx: index("resume_versions_created_at_idx").on(table.createdAt),
}));

export type JobPosting = typeof jobPostings.$inferSelect;
export type NewJobPosting = typeof jobPostings.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ApplicationStatusHistory = typeof applicationStatusHistory.$inferSelect;
export type NewApplicationStatusHistory = typeof applicationStatusHistory.$inferInsert;
export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type NewResumeVersion = typeof resumeVersions.$inferInsert;

