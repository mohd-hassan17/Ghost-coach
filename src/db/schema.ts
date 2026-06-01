import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm"
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

import {
  chatRoleValues,
  confidenceLevelValues,
  experienceLevelValues,
  roleValues,
} from "@/src/lib/cricket"

export const roleEnum = pgEnum("role", roleValues)
export const experienceLevelEnum = pgEnum(
  "experience_level",
  experienceLevelValues
)
export const confidenceLevelEnum = pgEnum(
  "confidence_level",
  confidenceLevelValues
)
export const chatRoleEnum = pgEnum("chat_role", chatRoleValues)

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  sport: text("sport").notNull().default("Cricket"),
  role: roleEnum("role").notNull(),
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  overallScore: integer("overall_score").notNull(),
  strengths: text("strengths").array().notNull(),
  areasToImprove: text("areas_to_improve").array().notNull(),
  priorityFix: text("priority_fix").notNull(),
  drillSuggestion: text("drill_suggestion").notNull(),
  confidenceLevel: confidenceLevelEnum("confidence_level").notNull(),
  rawFeedback: text("raw_feedback").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  chatMessages: many(chatMessages),
}))

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(sessions, {
    fields: [chatMessages.sessionId],
    references: [sessions.id],
  }),
}))

export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users)
export const selectSessionSchema = createSelectSchema(sessions)
export const insertSessionSchema = createInsertSchema(sessions)
export const selectChatMessageSchema = createSelectSchema(chatMessages)
export const insertChatMessageSchema = createInsertSchema(chatMessages)

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
export type CoachingSession = InferSelectModel<typeof sessions>
export type NewCoachingSession = InferInsertModel<typeof sessions>
export type ChatMessage = InferSelectModel<typeof chatMessages>
export type NewChatMessage = InferInsertModel<typeof chatMessages>
