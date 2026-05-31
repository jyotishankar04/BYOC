"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  Cancel01Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { usePreviewUrl } from "@/lib/files"

interface PdfLightboxProps {
  fileId: string
  fileName: string
  mimeType: string | null | undefined
  workspaceId: string | undefined
  onClose: () => void
  onDownload: () => void
}

export function PdfLightbox({
  fileId,
  fileName,
  mimeType,
  workspaceId,
  onClose,
  onDownload,
}: PdfLightboxProps) {
  const { data: previewData, isLoading } = usePreviewUrl(workspaceId, fileId, mimeType, true)
  const pdfUrl = previewData?.url

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-[92vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{fileName}</DialogTitle>

        {/* Top bar */}
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2.5">
          <HugeiconsIcon icon={LegalDocument01Icon} className="size-4 shrink-0 text-amber-500" strokeWidth={1.5} />
          <p className="min-w-0 flex-1 truncate text-xs font-medium">{fileName}</p>
          <Button size="icon-sm" variant="ghost" onClick={onDownload} title="Download">
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </Button>
        </div>

        {/* PDF area */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-muted/30">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={fileName}
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              {isLoading ? (
                <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground/40" />
              ) : (
                <>
                  <HugeiconsIcon icon={LegalDocument01Icon} className="size-16 text-muted-foreground/40" strokeWidth={1} />
                  <span className="text-xs">Preview unavailable</span>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
