"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  Video01Icon,
  Image01Icon,
  LegalDocument01Icon,
  ZipIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  CloudServerIcon,
  LockedIcon,
  Globe02Icon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type FileKind   = "Video" | "Image" | "Document" | "Archive" | "Other"
type Privacy    = "Private" | "Shared"
type UploadPhase = "idle" | "uploading" | "success"

interface UploadFile {
  id: string
  name: string
  size: string
  kind: FileKind
  progress: number
  status: "pending" | "uploading" | "done"
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const FOLDERS = [
  { value: "root",                label: "Root"                },
  { value: "college-notes",       label: "College Notes"       },
  { value: "project-assets",      label: "Project Assets"      },
  { value: "marketing-campaigns", label: "Marketing Campaigns" },
  { value: "financial-reports",   label: "Financial Reports"   },
] as const

const KIND_META: Record<FileKind, {
  icon: typeof CloudUploadIcon
  color: string
  bg: string
}> = {
  Video:    { icon: Video01Icon,         color: "text-blue-500",         bg: "bg-blue-500/10"   },
  Image:    { icon: Image01Icon,         color: "text-violet-500",       bg: "bg-violet-500/10" },
  Document: { icon: LegalDocument01Icon, color: "text-amber-500",        bg: "bg-amber-500/10"  },
  Archive:  { icon: ZipIcon,            color: "text-slate-500",        bg: "bg-slate-500/10"  },
  Other:    { icon: FileUploadIcon,      color: "text-muted-foreground", bg: "bg-muted"         },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  if (bytes >= 1e3) return `${Math.round(bytes / 1e3)} KB`
  return `${bytes} B`
}

function detectKind(file: File): FileKind {
  const t = file.type
  const n = file.name.toLowerCase()
  if (t.startsWith("video/")) return "Video"
  if (t.startsWith("image/")) return "Image"
  if (
    t.includes("pdf") || t.includes("document") || t.includes("sheet") || t.includes("presentation") ||
    n.endsWith(".docx") || n.endsWith(".xlsx") || n.endsWith(".pptx")
  ) return "Document"
  if (
    t.includes("zip") || t.includes("tar") || t.includes("rar") ||
    n.endsWith(".7z") || n.endsWith(".gz")
  ) return "Archive"
  return "Other"
}

// ─── Single file row ───────────────────────────────────────────────────────────

function FileRow({
  file,
  showProgress,
  onRemove,
}: {
  file: UploadFile
  showProgress: boolean
  onRemove?: (id: string) => void
}) {
  const meta   = KIND_META[file.kind]
  const isDone = file.status === "done"

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-2.5 px-3 pb-2 pt-2.5">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", meta.bg)}>
          <HugeiconsIcon icon={meta.icon} className={cn("size-4", meta.color)} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{file.name}</p>
          <p className="text-[11px] text-muted-foreground">{file.kind} · {file.size}</p>
        </div>
        {isDone ? (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5 text-emerald-500" strokeWidth={2} />
          </div>
        ) : onRemove ? (
          <button
            onClick={() => onRemove(file.id)}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {showProgress && (
        <div className="px-3 pb-2.5">
          <Progress
            value={file.progress}
            className={cn("h-1", isDone && "[&>[data-slot=progress-indicator]]:bg-emerald-500")}
          />
          <p className="mt-1 text-right text-[10px] tabular-nums text-muted-foreground">
            {isDone ? "Done" : `${Math.round(file.progress)}%`}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Upload body (shared between Dialog & Sheet) ───────────────────────────────

interface BodyProps {
  files: UploadFile[]
  folder: string
  privacy: Privacy
  isDragging: boolean
  phase: UploadPhase
  inputRef: React.RefObject<HTMLInputElement | null>
  onDragEnter:     (e: React.DragEvent) => void
  onDragLeave:     (e: React.DragEvent) => void
  onDragOver:      (e: React.DragEvent) => void
  onDrop:          (e: React.DragEvent) => void
  onBrowse:        () => void
  onFileInput:     (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove:        (id: string) => void
  onFolderChange:  (v: string) => void
  onPrivacyChange: (v: Privacy) => void
  onCancel:        () => void
  onUpload:        () => void
}

function UploadBody(p: BodyProps) {
  // ── Success screen ─────────────────────────────────────────────────────────
  if (p.phase === "success") {
    return (
      <>
        <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-5 py-10">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-8 text-emerald-500" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Files uploaded successfully</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {p.files.length} file{p.files.length !== 1 ? "s" : ""} added to{" "}
              <span className="font-medium text-foreground">byoc-user-storage</span>
            </p>
          </div>
          <div className="w-full space-y-2">
            {p.files.map(f => <FileRow key={f.id} file={f} showProgress={false} />)}
          </div>
        </div>
        <div className="shrink-0 border-t px-5 py-4">
          <Button className="w-full" onClick={p.onCancel}>Done</Button>
        </div>
      </>
    )
  }

  const isUploading = p.phase === "uploading"
  const canUpload   = p.files.length > 0 && !isUploading

  return (
    <>
      {/* ── Scrollable body ── */}
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <input
          ref={p.inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={p.onFileInput}
        />

        {/* Dropzone */}
        <div
          onDragEnter={p.onDragEnter}
          onDragLeave={p.onDragLeave}
          onDragOver={p.onDragOver}
          onDrop={p.onDrop}
          onClick={p.onBrowse}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-all duration-150",
            p.isDragging
              ? "scale-[1.01] border-primary bg-primary/5"
              : "border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
          )}
        >
          <div className={cn(
            "flex size-12 items-center justify-center rounded-xl transition-colors",
            p.isDragging ? "bg-primary/10" : "bg-muted",
          )}>
            <HugeiconsIcon
              icon={CloudUploadIcon}
              className={cn("size-6 transition-colors", p.isDragging ? "text-primary" : "text-muted-foreground")}
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <p className={cn("text-sm font-medium", p.isDragging ? "text-primary" : "text-foreground")}>
              {p.isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">or browse files from your device</p>
          </div>
        </div>

        {/* Selected files */}
        {p.files.length > 0 && (
          <div>
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Selected files ({p.files.length})
            </p>
            <div className="space-y-2">
              {p.files.map(f => (
                <FileRow
                  key={f.id}
                  file={f}
                  showProgress={isUploading}
                  onRemove={!isUploading ? p.onRemove : undefined}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Settings */}
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Upload settings
          </p>

          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-xs text-muted-foreground">Destination</span>
            <Select value={p.folder} onValueChange={p.onFolderChange}>
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLDERS.map(f => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-xs text-muted-foreground">Privacy</span>
            <ButtonGroup>
              <Button
                size="sm"
                variant={p.privacy === "Private" ? "default" : "outline"}
                onClick={() => p.onPrivacyChange("Private")}
              >
                <HugeiconsIcon icon={LockedIcon} className="size-3" strokeWidth={2} />
                Private
              </Button>
              <Button
                size="sm"
                variant={p.privacy === "Shared" ? "default" : "outline"}
                onClick={() => p.onPrivacyChange("Shared")}
              >
                <HugeiconsIcon icon={Globe02Icon} className="size-3" strokeWidth={2} />
                Shared
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* Provider card */}
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
              <HugeiconsIcon icon={CloudServerIcon} className="size-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium">Uploading to AWS S3</p>
              <p className="truncate text-[11px] text-muted-foreground">byoc-user-storage · ap-south-1</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div className="shrink-0 flex items-center justify-between gap-3 border-t px-5 py-4">
        <Button variant="outline" size="sm" onClick={p.onCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button size="sm" disabled={!canUpload} onClick={p.onUpload}>
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
              Upload {p.files.length > 0
                ? `${p.files.length} file${p.files.length > 1 ? "s" : ""}`
                : "Files"}
            </>
          )}
        </Button>
      </div>
    </>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────

export interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultFolder?: string
}

export function UploadDialog({
  open,
  onOpenChange,
  defaultFolder = "root",
}: UploadDialogProps) {
  const isMobile = useIsMobile()

  const [files,      setFiles]      = useState<UploadFile[]>([])
  const [folder,     setFolder]     = useState(defaultFolder)
  const [privacy,    setPrivacy]    = useState<Privacy>("Private")
  const [isDragging, setIsDragging] = useState(false)
  const [phase,      setPhase]      = useState<UploadPhase>("idle")

  const inputRef  = useRef<HTMLInputElement>(null)
  const intervals = useRef<ReturnType<typeof setInterval>[]>([])
  const timeouts  = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAll = useCallback(() => {
    intervals.current.forEach(clearInterval)
    timeouts.current.forEach(clearTimeout)
    intervals.current = []
    timeouts.current  = []
  }, [])

  // ── Watch for all files done ────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "uploading" && files.length > 0 && files.every(f => f.status === "done")) {
      clearAll()
      const t = setTimeout(() => setPhase("success"), 350)
      timeouts.current.push(t)
    }
  }, [files, phase, clearAll])

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => () => clearAll(), [clearAll])

  // ── Add files ──────────────────────────────────────────────────────────────
  const addFiles = useCallback((list: FileList | File[]) => {
    const items: UploadFile[] = Array.from(list).map(f => ({
      id:       `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:     f.name,
      size:     formatBytes(f.size),
      kind:     detectKind(f),
      progress: 0,
      status:   "pending",
    }))
    setFiles(prev => [...prev, ...items])
  }, [])

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleBrowse = useCallback(() => inputRef.current?.click(), [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = ""
    }
  }, [addFiles])

  const removeFile = useCallback((id: string) =>
    setFiles(prev => prev.filter(f => f.id !== id)), [])

  // ── Upload simulation ──────────────────────────────────────────────────────
  const startUpload = useCallback(() => {
    if (files.length === 0) return
    setPhase("uploading")

    files.forEach((file, idx) => {
      const speed = 4 + Math.random() * 7 // % gained per 100 ms tick

      const tid = setTimeout(() => {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: "uploading" } : f
        ))

        const iid = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id !== file.id) return f
            const next = Math.min(f.progress + speed, 100)
            return { ...f, progress: next, status: next >= 100 ? "done" : "uploading" }
          }))
        }, 100)

        intervals.current.push(iid)
      }, idx * 200)

      timeouts.current.push(tid)
    })
  }, [files])

  // ── Close + reset ──────────────────────────────────────────────────────────
  const handleOpenChange = useCallback((next: boolean) => {
    if (!next) {
      clearAll()
      const t = setTimeout(() => {
        setFiles([])
        setPhase("idle")
        setFolder(defaultFolder)
        setPrivacy("Private")
        setIsDragging(false)
      }, 200)
      timeouts.current.push(t)
    }
    onOpenChange(next)
  }, [onOpenChange, defaultFolder, clearAll])

  const bodyProps: BodyProps = {
    files, folder, privacy, isDragging, phase,
    inputRef,
    onDragEnter:     handleDragEnter,
    onDragLeave:     handleDragLeave,
    onDragOver:      handleDragOver,
    onDrop:          handleDrop,
    onBrowse:        handleBrowse,
    onFileInput:     handleFileInput,
    onRemove:        removeFile,
    onFolderChange:  setFolder,
    onPrivacyChange: setPrivacy,
    onCancel:        () => handleOpenChange(false),
    onUpload:        startUpload,
  }

  // ── Mobile: bottom Sheet ───────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex max-h-[92vh] flex-col overflow-hidden rounded-t-xl p-0"
        >
          <SheetHeader className="shrink-0 border-b px-5 pb-4 pt-5 text-left">
            <SheetTitle className="text-base">Upload Files</SheetTitle>
            <p className="text-xs text-muted-foreground">
              Upload files directly to your connected cloud storage.
            </p>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            <UploadBody {...bodyProps} />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // ── Desktop: centered Dialog ───────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0"
      >
        <div className="shrink-0 border-b px-5 pb-4 pt-5">
          <DialogTitle className="text-base">Upload Files</DialogTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload files directly to your connected cloud storage.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <UploadBody {...bodyProps} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
