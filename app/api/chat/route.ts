import { and, eq } from "drizzle-orm"
import { type UIMessage, convertToModelMessages, streamText } from "ai"
import { z } from "zod"

import { db } from "@/src/db"
import { chatMessages, sessions, users } from "@/src/db/schema"
import { createGeminiAiSdkProvider } from "@/src/lib/gemini"
import { buildChatSystemPrompt } from "@/src/lib/prompts"
import { auth } from "@/src/lib/auth"

export const runtime = "nodejs"

const textPartSchema = z
  .object({
    type: z.literal("text"),
    text: z.string(),
  })
  .passthrough()

const messagePartSchema = z
  .object({
    type: z.string(),
  })
  .passthrough()

const uiMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(["system", "user", "assistant"]),
    parts: z.array(z.union([textPartSchema, messagePartSchema])),
  })
  .passthrough()

const chatRequestSchema = z.object({
  sessionId: z.string().uuid(),
  messages: z.array(uiMessageSchema).min(1),
})

function toTextOnlyUiMessages(messages: z.infer<typeof uiMessageSchema>[]) {
  return messages
    .map<UIMessage>((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts
        .filter((part): part is z.infer<typeof textPartSchema> => {
          return part.type === "text" && typeof part.text === "string"
        })
        .map((part) => ({
          type: "text",
          text: part.text,
        })),
    }))
    .filter((message) => message.parts.length > 0)
}

function textFromMessage(message: UIMessage | undefined) {
  if (!message) {
    return ""
  }

  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim()
}

export async function POST(request: Request) {
  const authSession = await auth()

  if (!authSession?.user?.id) {
    return Response.json(
      { error: "Log in before chatting with Ghost Coach." },
      { status: 401 }
    )
  }

  const parsed = chatRequestSchema.safeParse(await request.json())

  if (!parsed.success) {
    return Response.json(
      { error: "Send a valid Ghost Coach chat message." },
      { status: 400 }
    )
  }

  const [sessionWithUser] = await db
    .select({
      id: sessions.id,
      overallScore: sessions.overallScore,
      priorityFix: sessions.priorityFix,
      strengths: sessions.strengths,
      areasToImprove: sessions.areasToImprove,
      userName: users.name,
      userRole: users.role,
      experienceLevel: users.experienceLevel,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.id, parsed.data.sessionId),
        eq(sessions.userId, authSession.user.id)
      )
    )
    .limit(1)

  if (!sessionWithUser) {
    return Response.json(
      { error: "That cricket coaching session was not found." },
      { status: 404 }
    )
  }

  const messages = toTextOnlyUiMessages(parsed.data.messages)
  const modelMessages = await convertToModelMessages(messages)
  const google = createGeminiAiSdkProvider()

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: buildChatSystemPrompt({
      name: sessionWithUser.userName,
      role: sessionWithUser.userRole,
      experienceLevel: sessionWithUser.experienceLevel,
      score: sessionWithUser.overallScore,
      priorityFix: sessionWithUser.priorityFix,
      strengths: sessionWithUser.strengths,
      areasToImprove: sessionWithUser.areasToImprove,
    }),
    messages: modelMessages,
    temperature: 0.4,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      const latestUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === "user")
      const latestAssistantMessage = [...finalMessages]
        .reverse()
        .find((message) => message.role === "assistant")
      const userText = textFromMessage(latestUserMessage)
      const assistantText = textFromMessage(latestAssistantMessage)

      if (!userText || !assistantText) {
        return
      }

      await db.insert(chatMessages).values([
        {
          sessionId: sessionWithUser.id,
          role: "user",
          content: userText,
        },
        {
          sessionId: sessionWithUser.id,
          role: "assistant",
          content: assistantText,
        },
      ])
    },
  })
}
