"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { SendHorizonal } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type SessionChatProps = {
  sessionId: string
  priorityFix: string
  initialMessages: UIMessage[]
}

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function SessionChat({
  sessionId,
  priorityFix,
  initialMessages,
}: SessionChatProps) {
  const [input, setInput] = useState("")
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { sessionId },
      }),
    [sessionId]
  )
  const { messages, sendMessage, status, error } = useChat({
    id: sessionId,
    transport,
    messages: initialMessages,
  })
  const busy = status === "submitted" || status === "streaming"
  const suggestions = [
    `How do I fix my ${priorityFix}?`,
    "Give me a warm-up drill",
    "What should I focus on next practice?",
  ]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()

    if (!text) {
      return
    }

    setInput("")
    await sendMessage({ text })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask Ghost Coach</CardTitle>
        <CardDescription>
          Follow up on this cricket report with focused practice questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Chat issue</AlertTitle>
            <AlertDescription>
              Ghost Coach could not answer that follow-up. Try again in a moment.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void sendMessage({ text: suggestion })}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-80 rounded-lg border bg-muted/20 p-3">
          <div className="space-y-3 pr-3">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ask about stance, bat path, elbow position, footwork, or next
                practice.
              </p>
            ) : null}
            {messages.map((message) => {
              const text = messageText(message)

              if (!text) {
                return null
              }

              return (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg border px-3 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-background"
                  )}
                >
                  {text}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your cricket technique"
            disabled={busy}
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            <SendHorizonal />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
