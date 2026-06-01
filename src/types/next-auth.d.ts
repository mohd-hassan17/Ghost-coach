import type { DefaultSession } from "next-auth"

import type { ExperienceLevel, UserRole } from "@/src/lib/cricket"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      experienceLevel: ExperienceLevel
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    experienceLevel: ExperienceLevel
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    experienceLevel: ExperienceLevel
  }
}
