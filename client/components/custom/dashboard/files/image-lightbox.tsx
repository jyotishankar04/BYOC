"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image01Icon,
  Cancel01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useThumbnailUrl } from "@/lib/files"

interface ImageLightboxProps {
  fileId: string
  fileName: string
  mimeType: string | null | undefined
  workspaceId: string | undefined
  onClose: () => void
  onDownload: () => void
}

export function ImageLightbox({
  fileId,
  fileName,
  mimeType,
  workspaceId,
  onClose,
  onDownload,
}: ImageLightboxProps) {
  const { data: previewData, isLoading } = useThumbnailUrl(workspaceId, fileId, mimeType, "lg", true)
  const imgUrl = previewData?.url ?? undefined

  const [scale, setScale]       = useState(1)
  const [offset, setOffset]     = useState({ x: 0, y: 0 })
  const [isDragging, setIsDrag] = useState(false)
  const dragStart               = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = Math.min(5, Math.max(0.25, s + delta))
      if (next <= 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    zoomBy(e.deltaY < 0 ? 0.25 : -0.25)
  }, [zoomBy])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
    setIsDrag(true)
  }, [scale, offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    })
  }, [])

  const stopDrag = useCallback(() => {
    dragStart.current = null
    setIsDrag(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoomBy(0.25)
      else if (e.key === "-") zoomBy(-0.25)
      else if (e.key === "0") resetZoom()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoomBy, resetZoom])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-[88vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{fileName}</DialogTitle>

        {/* Top bar */}
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2.5">
          <HugeiconsIcon icon={Image01Icon} className="size-4 shrink-0 text-violet-500" strokeWidth={1.5} />
          <p className="min-w-0 flex-1 truncate text-xs font-medium">{fileName}</p>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </Button>
        </div>

        {/* Image area */}
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/90 dark:bg-black"
          style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={fileName}
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.15s ease",
              }}
              className="max-h-full max-w-full object-contain select-none pointer-events-none"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40">
              {isLoading ? (
                <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              ) : (
                <>
                  <HugeiconsIcon icon={Image01Icon} className="size-16" strokeWidth={1} />
                  <span className="text-xs">Preview unavailable</span>
                </>
              )}
            </div>
          )}

          {/* Floating controls */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-md">
            <button
              onClick={() => zoomBy(-0.25)}
              title="Zoom out (−)"
              className="flex size-7 items-center justify-center rounded-full text-[15px] font-light text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              −
            </button>
            <button
              onClick={resetZoom}
              title="Reset zoom (0)"
              className="flex min-w-[3rem] items-center justify-center rounded-full px-1.5 py-1 text-[11px] tabular-nums text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={() => zoomBy(0.25)}
              title="Zoom in (+)"
              className="flex size-7 items-center justify-center rounded-full text-[15px] font-light text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              +
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
              Download
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
