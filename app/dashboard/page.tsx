import Link from "next/link"
import { desc, eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { ArrowRight, ScanSearch, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/src/db"
import { sessions } from "@/src/db/schema"
import { auth } from "@/src/lib/auth"
import { scoreTone } from "@/src/lib/scores"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const [lastSession] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, session.user.id))
    .orderBy(desc(sessions.createdAt))
    .limit(1)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome, {session.user.name ?? "cricketer"}
          </CardTitle>
          <CardDescription>
            Ghost Coach is ready for your next cricket technique check.
          </CardDescription>
          <CardAction>
            <Button asChild>
              <Link href="/dashboard/upload">
                <ScanSearch />
                Analyze New Stance
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {lastSession ? (
            <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <div
                className={`flex size-16 items-center justify-center rounded-full border text-xl font-semibold ${scoreTone(lastSession.overallScore)}`}
              >
                {lastSession.overallScore}/10
              </div>
              <div>
                <p className="font-medium">Last session focus</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lastSession.priorityFix}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {lastSession.confidenceLevel} confidence
                </Badge>
              </div>
              <Button asChild variant="outline">
                <Link href={`/dashboard/sessions/${lastSession.id}`}>
                  View Report
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-6 text-center">
              <Trophy className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Upload your first cricket photo</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start with a clear stance, bowling stride, or keeping position.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/upload">Analyze New Stance</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
