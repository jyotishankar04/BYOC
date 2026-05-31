"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { usePreviewUrl } from "@/lib/files"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoThumbnailProps {
  workspaceId: string | undefined
  fileId: string
  mimeType: string | null | undefined
  alt: string
  className?: string
  fallback: React.ReactNode
}

export function VideoThumbnail({
  workspaceId,
  fileId,
  mimeType,
  alt,
  className,
  fallback,
}: VideoThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [frame, setFrame] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  const isVideo = !!mimeType?.startsWith("video/")

  useEffect(() => {
    if (!ref.current || !isVideo) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVideo])

  const { data } = usePreviewUrl(workspaceId, fileId, mimeType, inView)
  const url = data?.url

  useEffect(() => {
    if (!url || status !== "idle") return

    setStatus("loading")
    let cancelled = false

    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true
    video.playsInline = true

    const capture = () => {
      if (cancelled) return
      try {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth || 320
        canvas.height = video.videoHeight || 180
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("no ctx")
        ctx.drawImage(video, 0, 0)
        setFrame(canvas.toDataURL("image/jpeg", 0.8))
        setStatus("done")
      } catch {
        setStatus("error")
      } finally {
        video.src = ""
      }
    }

    video.addEventListener("seeked", capture, { once: true })
    video.addEventListener("error", () => { if (!cancelled) setStatus("error") }, { once: true })
    video.addEventListener("loadedmetadata", () => {
      // Seek slightly into the video to avoid black opening frames
      video.currentTime = Math.min(1, (video.duration || 0) * 0.1)
    }, { once: true })

    video.src = url

    return () => {
      cancelled = true
      video.src = ""
    }
  }, [url, status])

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {status === "loading" && <Skeleton className="absolute inset-0 rounded-none" />}

      {frame && status === "done" && (
        <img
          src={frame}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div
        className={cn(
          "flex h-full w-full items-center justify-center",
          frame && status === "done" ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        {fallback}
      </div>
    </div>
  )
}
