export const roleValues = [
  "Batsman",
  "Bowler",
  "All-Rounder",
  "Wicket-Keeper",
] as const

export const experienceLevelValues = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const

export const confidenceLevelValues = ["Low", "Medium", "High"] as const

export const chatRoleValues = ["user", "assistant"] as const

export type UserRole = (typeof roleValues)[number]
export type ExperienceLevel = (typeof experienceLevelValues)[number]
export type ConfidenceLevel = (typeof confidenceLevelValues)[number]
export type ChatRole = (typeof chatRoleValues)[number]
