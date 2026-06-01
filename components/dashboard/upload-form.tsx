"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { AlertCircle, ImagePlus, Send } from "lucide-react"

import { CricketBatIcon } from "@/components/dashboard/cricket-bat-icon"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

type AnalyzeResponse = {
  id?: unknown
  error?: unknown
}

function rejectionMessage(rejection: FileRejection) {
  const code = rejection.errors[0]?.code

  if (code === "file-too-large") {
    return "That cricket photo is over 5MB. Choose a smaller JPEG or PNG."
  }

  if (code === "file-invalid-type") {
    return "Ghost Coach accepts JPEG or PNG images only."
  }

  return "Choose one clear cricket technique photo."
}

export function UploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0] ?? null)
    setError(null)
  }, [])

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0]
    setFile(null)
    setError(rejection ? rejectionMessage(rejection) : "Choose a cricket photo.")
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: MAX_IMAGE_SIZE,
    onDropAccepted,
    onDropRejected,
  })

  async function handleSubmit() {
    if (!file) {
      setError("Choose a cricket stance or technique photo first.")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.set("image", file)

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    })
    const data = (await response.json()) as AnalyzeResponse

    if (!response.ok) {
      setLoading(false)
      setError(
        typeof data.error === "string"
          ? data.error
          : "Ghost Coach could not analyze that cricket photo."
      )
      return
    }

    if (typeof data.id !== "string") {
      setLoading(false)
      setError("Ghost Coach finished, but the report link was missing.")
      return
    }

    router.push(`/dashboard/sessions/${data.id}`)
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Analyze New Stance</CardTitle>
          <CardDescription>
            Upload a clear batting, bowling, keeping, or fielding technique photo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Upload issue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div
            {...getRootProps()}
            className={cn(
              "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center transition-colors",
              isDragActive && "border-primary bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-lg border bg-background">
                <Image
                  src={previewUrl}
                  alt="Selected cricket technique preview"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                  <ImagePlus className="size-6" />
                </span>
                <div>
                  <p className="font-medium">
                    Drop your cricket photo here or click to browse
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    JPEG or PNG, maximum 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={!file || loading}>
            <Send />
            Analyze technique
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Queue</CardTitle>
          <CardDescription>
            Ghost Coach reviews cricket posture, balance, and movement cues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <CricketBatIcon className="text-primary" />
                <p className="text-sm font-medium">
                  Ghost Coach is analyzing your technique...
                </p>
              </div>
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              A front-on or side-on image with your full stance in frame gives the
              sharpest cricket feedback.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
