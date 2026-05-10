"use client"

import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  Video01Icon,
  Image01Icon,
  ZipIcon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type FileType    = "Document" | "Video" | "Image" | "Spreadsheet" | "Slides" | "Archive"
type AccessType  = "Public" | "Password Protected" | "Private"
type ExpiryOption = "never" | "1d" | "7d" | "30d" | "custom"

// ─── Visual config ────────────────────────────────────────────────────────────

const FILE_TYPE_VISUAL: Record<FileType, {
  icon: typeof LegalDocument01Icon
  iconColor: string
  gradFrom: string
  gradTo: string
}> = {
  Document:    { icon: LegalDocument01Icon, iconColor: "text-amber-500",   gradFrom: "from-amber-500/15",   gradTo: "to-amber-600/5"   },
  Video:       { icon: Video01Icon,         iconColor: "text-blue-500",    gradFrom: "from-blue-500/15",    gradTo: "to-blue-600/5"    },
  Image:       { icon: Image01Icon,         iconColor: "text-violet-500",  gradFrom: "from-violet-500/15",  gradTo: "to-violet-600/5"  },
  Spreadsheet: { icon: LegalDocument01Icon, iconColor: "text-emerald-500", gradFrom: "from-emerald-500/15", gradTo: "to-emerald-600/5" },
  Slides:      { icon: LegalDocument01Icon, iconColor: "text-orange-500",  gradFrom: "from-orange-500/15",  gradTo: "to-orange-600/5"  },
  Archive:     { icon: ZipIcon,            iconColor: "text-slate-500",   gradFrom: "from-slate-500/15",   gradTo: "to-slate-600/5"   },
}

// Selectable files when no file is pre-selected (e.g. from Shared Links page)
const SELECTABLE_FILES: { name: string; type: FileType; folder: string }[] = [
  { name: "invoice-may-2026.pdf",   type: "Document",    folder: "Finance"           },
  { name: "project-demo.mp4",       type: "Video",       folder: "Projects / Videos" },
  { name: "hero-banner.png",        type: "Image",       folder: "Projects / Assets" },
  { name: "q2-report.docx",        type: "Document",    folder: "Reports"           },
  { name: "budget-2026.xlsx",      type: "Spreadsheet", folder: "Finance"           },
  { name: "product-roadmap.pptx",  type: "Slides",      folder: "Projects"          },
  { name: "profile-photo.jpg",     type: "Image",       folder: "Personal / Photos" },
  { name: "employee-handbook.pdf", type: "Document",    folder: "HR"                },
  { name: "pitch-deck.pptx",      type: "Slides",      folder: "Sales"             },
  { name: "assets-backup.zip",    type: "Archive",     folder: "Root"              },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectFileType(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext))              return "Video"
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "Image"
  if (["xlsx", "xls", "csv"].includes(ext))                             return "Spreadsheet"
  if (["pptx", "ppt"].includes(ext))                                    return "Slides"
  if (["zip", "rar", "tar", "gz", "7z"].includes(ext))                 return "Archive"
  return "Document"
}

function calcExpiryLabel(expiry: ExpiryOption, custom: string): string | null {
  if (expiry === "never") return null
  if (expiry === "custom") return custom || "Custom"
  const days = expiry === "1d" ? 1 : expiry === "7d" ? 7 : 30
  const d = new Date(Date.now() + days * 86400000)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-selected file name — locks the file field (used when sharing from Files/Docs/Gallery) */
  defaultFileName?: string
}

export function CreateShareLinkDialog({ open, onOpenChange, defaultFileName }: Props) {
  const locked    = Boolean(defaultFileName)
  const fileType  = defaultFileName ? detectFileType(defaultFileName) : "Document"
  const visual    = FILE_TYPE_VISUAL[fileType]

  // Form state
  const [selectedFile,  setSelectedFile]  = useState(SELECTABLE_FILES[0].name)
  const [accessType,    setAccessType]    = useState<AccessType>("Public")
  const [password,      setPassword]      = useState("")
  const [expiry,        setExpiry]        = useState<ExpiryOption>("never")
  const [customExpiry,  setCustomExpiry]  = useState("")
  const [allowDownload, setAllowDownload] = useState(true)

  const fileName = locked ? defaultFileName! : selectedFile

  const reset = () => {
    setSelectedFile(SELECTABLE_FILES[0].name)
    setAccessType("Public")
    setPassword("")
    setExpiry("never")
    setCustomExpiry("")
    setAllowDownload(true)
  }

  const handleSubmit = () => {
    const slug = Math.random().toString(36).slice(2, 10)
    const url  = `https://byoc.app/share/${slug}`
    toast.success("Share link created", {
      description: url,
    })
    onOpenChange(false)
    reset()
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) reset()
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-sm font-semibold">Create Share Link</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Generate a shareable link for a file in your cloud storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">

          {/* File — locked display or selector */}
          {locked ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">File</Label>
              <div className={cn("flex items-center gap-2.5 rounded-lg border px-3 py-2 bg-gradient-to-r", visual.gradFrom, visual.gradTo)}>
                <HugeiconsIcon icon={visual.icon} className={cn("size-4 shrink-0", visual.iconColor)} strokeWidth={1.5} />
                <span className="truncate text-xs font-medium">{fileName}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">File</Label>
              <Select value={selectedFile} onValueChange={setSelectedFile}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SELECTABLE_FILES.map((f) => (
                    <SelectItem key={f.name} value={f.name} className="text-xs">
                      <span className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={FILE_TYPE_VISUAL[f.type].icon}
                          className={cn("size-3.5", FILE_TYPE_VISUAL[f.type].iconColor)}
                          strokeWidth={1.5}
                        />
                        {f.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Access type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Access type</Label>
            <ButtonGroup>
              {(["Public", "Password Protected", "Private"] as AccessType[]).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={accessType === t ? "default" : "outline"}
                  onClick={() => setAccessType(t)}
                >
                  {t}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          {/* Password — shown only when Password Protected */}
          {accessType === "Password Protected" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Password</Label>
              <Input
                type="password"
                placeholder="Set a password for this link"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          {/* Expiry */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Expiry</Label>
            <Select value={expiry} onValueChange={(v) => setExpiry(v as ExpiryOption)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never"  className="text-xs">Never expires</SelectItem>
                <SelectItem value="1d"     className="text-xs">1 Day</SelectItem>
                <SelectItem value="7d"     className="text-xs">7 Days</SelectItem>
                <SelectItem value="30d"    className="text-xs">30 Days</SelectItem>
                <SelectItem value="custom" className="text-xs">Custom date</SelectItem>
              </SelectContent>
            </Select>
            {expiry === "custom" && (
              <Input
                type="date"
                value={customExpiry}
                onChange={(e) => setCustomExpiry(e.target.value)}
                className="h-8 text-xs"
              />
            )}
          </div>

          {/* Allow download */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p className="text-xs font-medium">Allow download</p>
              <p className="text-[11px] text-muted-foreground">Recipients can download the original file</p>
            </div>
            <Switch size="sm" checked={allowDownload} onCheckedChange={setAllowDownload} />
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-3">
          <Button size="sm" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
            Create Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
