"use client"

import { useActionState } from "react"
import Link from "next/link"
import { UserPlus } from "lucide-react"

import { registerAction, type RegisterState } from "@/app/(auth)/register/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { experienceLevelValues, roleValues } from "@/src/lib/cricket"

const initialState: RegisterState = {}

function firstError(errors: string[] | undefined) {
  return errors?.[0]
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserPlus className="size-5" />
          Join Ghost Coach
        </CardTitle>
        <CardDescription>
          Create a cricket profile so your technique feedback matches your role.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state.error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" required />
            {firstError(state.fieldErrors?.name) ? (
              <p className="text-sm text-destructive">
                {firstError(state.fieldErrors?.name)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            {firstError(state.fieldErrors?.email) ? (
              <p className="text-sm text-destructive">
                {firstError(state.fieldErrors?.email)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            {firstError(state.fieldErrors?.password) ? (
              <p className="text-sm text-destructive">
                {firstError(state.fieldErrors?.password)}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select name="role" defaultValue="Batsman" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleValues.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                name="experienceLevel"
                defaultValue="Beginner"
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevelValues.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating profile..." : "Create cricket profile"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
