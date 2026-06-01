import Image from "next/image"
import Link from "next/link"
import { desc, eq } from "drizzle-orm"
import { format } from "date-fns"
import { redirect } from "next/navigation"
import { ArrowRight, Clock } from "lucide-react"

import { ScoreTrendChart } from "@/components/dashboard/score-trend-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/src/db"
import { sessions } from "@/src/db/schema"
import { auth } from "@/src/lib/auth"
import { scoreTone } from "@/src/lib/scores"

export default async function HistoryPage() {
  const authSession = await auth()

  if (!authSession?.user) {
    redirect("/login")
  }

  const userSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, authSession.user.id))
    .orderBy(desc(sessions.createdAt))

  const chartData = [...userSessions].reverse().map((session) => ({
    date: format(session.createdAt, "MMM d"),
    score: session.overallScore,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Session History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your cricket technique scores and priority fixes over time.
        </p>
      </div>

      {userSessions.length >= 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
            <CardDescription>
              Track your Ghost Coach score across cricket sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={chartData} />
          </CardContent>
        </Card>
      ) : null}

      {userSessions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Clock className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No cricket sessions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload a photo to create your first Ghost Coach report.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/upload">Analyze New Stance</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={session.imageUrl}
                  alt="Cricket technique session thumbnail"
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{format(session.createdAt, "PPP")}</span>
                  <Badge className={scoreTone(session.overallScore)}>
                    {session.overallScore}/10
                  </Badge>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {session.priorityFix}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/sessions/${session.id}`}>
                    View Full Report
                    <ArrowRight />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
