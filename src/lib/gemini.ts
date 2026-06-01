import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { GoogleGenerativeAI } from "@google/generative-ai"

export function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required")
  }

  return apiKey
}

export function createGeminiClient() {
  return new GoogleGenerativeAI(getGeminiApiKey())
}

export function createGeminiAiSdkProvider() {
  return createGoogleGenerativeAI({
    apiKey: getGeminiApiKey(),
  })
}
