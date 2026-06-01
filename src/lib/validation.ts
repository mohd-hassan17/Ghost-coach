import { z } from "zod"

import {
  confidenceLevelValues,
  experienceLevelValues,
  roleValues,
} from "@/src/lib/cricket"

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Use at least 8 characters").max(128),
  role: z.enum(roleValues),
  experienceLevel: z.enum(experienceLevelValues),
})

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Enter your password"),
})

export const analyzeFeedbackSchema = z.object({
  overallScore: z
    .number()
    .min(1)
    .max(10)
    .transform((score) => Math.round(score)),
  strengths: z.array(z.string().trim().min(1)).min(1).max(4),
  areasToImprove: z.array(z.string().trim().min(1)).min(1).max(4),
  priorityFix: z.string().trim().min(1),
  drillSuggestion: z.string().trim().min(1),
  confidenceLevel: z.enum(confidenceLevelValues),
})

export const uuidSchema = z.string().uuid()

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AnalyzeFeedback = z.infer<typeof analyzeFeedbackSchema>
