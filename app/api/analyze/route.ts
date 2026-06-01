import { put } from "@vercel/blob"

import { db } from "@/src/db"
import { sessions } from "@/src/db/schema"
import { createGeminiClient } from "@/src/lib/gemini"
import {
  buildAnalyzeUserPrompt,
  GHOST_ANALYZE_SYSTEM_PROMPT,
} from "@/src/lib/prompts"
import { auth } from "@/src/lib/auth"
import { analyzeFeedbackSchema, uuidSchema } from "@/src/lib/validation"

export const runtime = "nodejs"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"])

function extensionForMimeType(mimeType: string) {
  return mimeType === "image/png" ? "png" : "jpg"
}

function friendlyError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return friendlyError("Log in before uploading a cricket technique photo.", 401)
  }

  const formData = await request.formData()
  const image = formData.get("image")

  if (!(image instanceof File)) {
    return friendlyError("Upload a JPEG or PNG cricket technique photo.", 400)
  }

  if (!ACCEPTED_IMAGE_TYPES.has(image.type)) {
    return friendlyError("Ghost Coach accepts JPEG or PNG images only.", 400)
  }

  if (image.size > MAX_IMAGE_SIZE) {
    return friendlyError("Keep your cricket photo under 5MB.", 400)
  }

  const requestedSessionId = formData.get("sessionId")
  const parsedSessionId =
    typeof requestedSessionId === "string"
      ? uuidSchema.safeParse(requestedSessionId)
      : null
  const sessionId = parsedSessionId?.success
    ? parsedSessionId.data
    : crypto.randomUUID()

  const buffer = Buffer.from(await image.arrayBuffer())
  const base64Image = buffer.toString("base64")
  const imageExtension = extensionForMimeType(image.type)
  const pathname = `sessions/${session.user.id}/${sessionId}.${imageExtension}`

  const blob = await put(pathname, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: image.type,
  })

  const model = createGeminiClient().getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: GHOST_ANALYZE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  })

  const userPrompt = buildAnalyzeUserPrompt({
    name: session.user.name ?? "Player",
    role: session.user.role,
    experienceLevel: session.user.experienceLevel,
  })

  let rawFeedback = ""

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
      { text: userPrompt },
    ])

    rawFeedback = result.response.text()
    const parsedJson = JSON.parse(rawFeedback) as unknown
    const feedback = analyzeFeedbackSchema.parse(parsedJson)

    const [createdSession] = await db
      .insert(sessions)
      .values({
        id: sessionId,
        userId: session.user.id,
        imageUrl: blob.url,
        overallScore: feedback.overallScore,
        strengths: feedback.strengths,
        areasToImprove: feedback.areasToImprove,
        priorityFix: feedback.priorityFix,
        drillSuggestion: feedback.drillSuggestion,
        confidenceLevel: feedback.confidenceLevel,
        rawFeedback,
      })
      .returning()

    return Response.json(createdSession)
  } catch (error) {
    if (rawFeedback) {
      console.error("Ghost Coach received non-JSON analysis feedback:", rawFeedback)
    } else {
      console.error("Ghost Coach analysis failed:", error)
    }

    return friendlyError(
      "Ghost Coach could not turn that photo into a coaching report. Try another clear cricket stance image.",
      422
    )
  }
}
