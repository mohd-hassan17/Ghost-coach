import Image from "next/image"
import { and, asc, eq } from "drizzle-orm"
import { format } from "date-fns"
import { notFound, redirect } from "next/navigation"
import type { UIMessage } from "ai"
import {
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Flame,
} from "lucide-react"

import { SessionChat } from "@/components/dashboard/session-chat"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/src/db"
import { chatMessages, sessions } from "@/src/db/schema"
import { auth } from "@/src/lib/auth"
import { scoreRingTone } from "@/src/lib/scores"

type SessionPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const authSession = await auth()

  if (!authSession?.user) {
    redirect("/login")
  }

  const { id } = await params
  const [coachingSession] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.userId, authSession.user.id)))
    .limit(1)

  if (!coachingSession) {
    notFound()
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, coachingSession.id))
    .orderBy(asc(chatMessages.createdAt))

  const initialMessages: UIMessage[] = messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text", text: message.content }],
  }))

  return (
    <div className="space-y-6">
      <Card>
        <div className="relative aspect-[16/10] bg-muted">
          <Image
            src={coachingSession.imageUrl}
            alt="Uploaded cricket technique photo"
            fill
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-contain"
          />
        </div>
        <CardHeader className="gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <div
            className={`flex size-24 items-center justify-center rounded-full border-4 text-3xl font-semibold ${scoreRingTone(coachingSession.overallScore)}`}
          >
            {coachingSession.overallScore}
          </div>
          <div>
            <CardTitle className="text-2xl">
              {authSession.user.name ?? "Cricketer"}
            </CardTitle>
            <CardDescription>
              {format(coachingSession.createdAt, "PPP")} ·{" "}
              {authSession.user.role} · {authSession.user.experienceLevel}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {coachingSession.confidenceLevel} confidence
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="size-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {coachingSession.strengths.map((strength) => (
                <li key={strength} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="size-5" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {coachingSession.areasToImprove.map((area) => (
                <li key={area} className="flex gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-red-500/30 bg-red-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Flame className="size-5" />
              Priority Fix
            </CardTitle>
            <CardDescription className="text-red-700/80">
              Focus here first during your next cricket net session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-red-950">
              {coachingSession.priorityFix}
            </p>
          </CardContent>
        </Card>

        <Card className="border-sky-500/30 bg-sky-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sky-700">
              <Dumbbell className="size-5" />
              Drill Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-sky-950">
              {coachingSession.drillSuggestion}
            </p>
          </CardContent>
        </Card>
      </div>

      <SessionChat
        sessionId={coachingSession.id}
        priorityFix={coachingSession.priorityFix}
        initialMessages={initialMessages}
      />
    </div>
  )
}
