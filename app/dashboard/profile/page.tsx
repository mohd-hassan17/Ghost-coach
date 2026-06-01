import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/src/lib/auth"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Cricket Profile</CardTitle>
        <CardDescription>
          Ghost Coach uses this profile to tailor technique feedback.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="mt-1 font-medium">{session.user.name}</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Sport</p>
          <p className="mt-1 font-medium">Cricket</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Role</p>
          <Badge className="mt-2">{session.user.role}</Badge>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Experience</p>
          <Badge variant="secondary" className="mt-2">
            {session.user.experienceLevel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
