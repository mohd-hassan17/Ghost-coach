import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { auth } from "@/src/lib/auth"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? "Cricketer",
        experienceLevel: session.user.experienceLevel,
      }}
    >
      {children}
    </DashboardShell>
  )
}
