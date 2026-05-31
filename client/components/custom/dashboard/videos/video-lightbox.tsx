"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  Download01Icon,
  Delete01Icon,
  Cancel01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { usePreviewUrl } from "@/lib/files"

export type Resolution = "4K" | "1080p" | "720p" | "480p" | "Unknown"

export interface VideoItem {
  id: string
  name: string
  extension: string
  mimeType: string | null
  resolution: Resolution
  duration: string
  durationSecs: number
  size: string
  sizeBytes: number
  folder: string
  uploadedAt: string
  uploadedMs: number
  status: "Private" | "Shared"
  shareLink?: string
}

export function VideoLightbox({
  video,
  workspaceId,
  onClose,
  onDownload,
  onDelete,
}: {
  video: VideoItem
  workspaceId: string | undefined
  onClose: () => void
  onDownload: () => void
  onDelete: () => void
}) {
  const { data: previewData, isLoading: urlLoading } = usePreviewUrl(
    workspaceId,
    video.id,
    video.mimeType ?? "video/mp4",
    true,
  )
  const videoUrl = previewData?.url

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="w-full max-w-6xl gap-0 overflow-hidden p-0 sm:max-w-6xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{video.name}</DialogTitle>

        {/* ── Top bar ── */}
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <HugeiconsIcon icon={Video01Icon} className="size-4 shrink-0 text-blue-500" strokeWidth={1.5} />
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-xs font-medium">{video.name}</p>
          </div>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </Button>
        </div>

        {/* ── Player ── */}
        <div className="relative aspect-video w-full bg-black">
          {videoUrl ? (
            <video
              key={videoUrl}
              src={videoUrl}
              className="h-full w-full"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              {urlLoading ? (
                <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <HugeiconsIcon icon={Video01Icon} className="size-12" strokeWidth={1} />
                  <span className="text-xs">Preview unavailable</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-4 border-t px-5 py-3">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {video.resolution !== "Unknown" && (
              <span className="font-semibold text-foreground">{video.resolution}</span>
            )}
            {video.duration !== "Unknown" && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Clock01Icon} className="size-3" strokeWidth={1.5} />
                {video.duration}
              </span>
            )}
            <span>{video.size}</span>
            {video.resolution === "Unknown" && video.duration === "Unknown" && (
              <span className="italic">Processing metadata…</span>
            )}
            <span className="hidden border-l pl-3 sm:block">{video.uploadedAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onDownload}>
              <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
              Download
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
