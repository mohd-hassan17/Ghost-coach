import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { db } from "@/src/db"
import { users } from "@/src/db/schema"
import {
  experienceLevelValues,
  roleValues,
  type ExperienceLevel,
  type UserRole,
} from "@/src/lib/cricket"
import { loginSchema } from "@/src/lib/validation"

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && roleValues.includes(value as UserRole)
}

function isExperienceLevel(value: unknown): value is ExperienceLevel {
  return (
    typeof value === "string" &&
    experienceLevelValues.includes(value as ExperienceLevel)
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)

        if (!parsed.success) {
          return null
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email))
          .limit(1)

        if (!user) {
          return null
        }

        const passwordMatches = await compare(
          parsed.data.password,
          user.passwordHash
        )

        if (!passwordMatches) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          experienceLevel: user.experienceLevel,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.experienceLevel = user.experienceLevel
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : ""
        session.user.role = isUserRole(token.role) ? token.role : "Batsman"
        session.user.experienceLevel = isExperienceLevel(
          token.experienceLevel
        )
          ? token.experienceLevel
          : "Beginner"
      }

      return session
    },
  },
})
