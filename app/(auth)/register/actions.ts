"use server"

import { hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

import { db } from "@/src/db"
import { users } from "@/src/db/schema"
import { type RegisterInput, registerSchema } from "@/src/lib/validation"

export type RegisterState = {
  error?: string
  fieldErrors?: Partial<Record<keyof RegisterInput, string[]>>
}

export async function registerAction(
  _previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    experienceLevel: formData.get("experienceLevel"),
  })

  if (!parsed.success) {
    return {
      error: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)

  if (existingUser) {
    return {
      error: "That email is already registered. Try logging in instead.",
      fieldErrors: {
        email: ["Email already registered"],
      },
    }
  }

  const passwordHash = await hash(parsed.data.password, 12)

  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: parsed.data.role,
    experienceLevel: parsed.data.experienceLevel,
  })

  redirect("/login?registered=1")
}
