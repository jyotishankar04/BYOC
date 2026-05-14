"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  Video01Icon,
  Image01Icon,
  ZipIcon,
  Folder01Icon,
  LinkSquare01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  Loading01Icon,
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
import { useCreateShareLink } from "@/lib/share-links"
import { useWorkspace } from "@/lib/workspace-context"
import { useSubscriptionSnapshot, featureUpgradeMessage } from "@/lib/subscription"
import { UpgradeTooltip } from "@/components/custom/subscription/upgrade-tooltip"

type FileType    = "Document" | "Video" | "Image" | "Spreadsheet" | "Slides" | "Archive"
type AccessType  = "Public" | "PasswordProtected" | "Private"
type ExpiryOption = "never" | "1d" | "7d" | "30d" | "custom"

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

const FOLDER_VISUAL = {
  icon: Folder01Icon,
  iconColor: "text-amber-500",
  gradFrom: "from-amber-500/15",
  gradTo: "to-amber-600/5",
} as const

function detectFileType(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext))              return "Video"
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "Image"
  if (["xlsx", "xls", "csv"].includes(ext))                             return "Spreadsheet"
  if (["pptx", "ppt"].includes(ext))                                    return "Slides"
  if (["zip", "rar", "tar", "gz", "7z"].includes(ext))                 return "Archive"
  return "Document"
}

const ACCESS_LABELS: Record<AccessType, string> = {
  Public: "Public",
  PasswordProtected: "Password Protected",
  Private: "Private",
}

const EXPIRY_DATES: Record<string, Date | undefined> = {
  never: undefined,
  "1d": new Date(Date.now() + 86400000),
  "7d": new Date(Date.now() + 7 * 86400000),
  "30d": new Date(Date.now() + 30 * 86400000),
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultName?: string
  fileId?: string
  folderId?: string
}

export function CreateShareLinkDialog({ open, onOpenChange, defaultName, fileId, folderId }: Props) {
  const { currentWorkspace } = useWorkspace()
  const { subscription, workspaceUsage, loading } = useSubscriptionSnapshot()
  const createLink = useCreateShareLink(currentWorkspace?.id)

  const targetKind = folderId ? "folder" : "file"
  const fileType = defaultName && targetKind === "file" ? detectFileType(defaultName) : "Document"
  const visual = targetKind === "folder" ? FOLDER_VISUAL : FILE_TYPE_VISUAL[fileType]

  const [accessType, setAccessType]     = useState<AccessType>("Public")
  const [password, setPassword]           = useState("")
  const [expiry, setExpiry]               = useState<ExpiryOption>("never")
  const [customExpiry, setCustomExpiry]   = useState("")
  const [allowDownload, setAllowDownload] = useState(true)
  const [copied, setCopied]              = useState(false)

  const result = createLink.data
  const isPending = createLink.isPending
  const shareLinkLimitReached =
    subscription?.limits.maxActiveShareLinks !== null &&
    (workspaceUsage?.activeLinksCount ?? 0) >= (subscription?.limits.maxActiveShareLinks ?? Number.POSITIVE_INFINITY)

  const reset = () => {
    createLink.reset()
    setAccessType("Public")
    setPassword("")
    setExpiry("never")
    setCustomExpiry("")
    setAllowDownload(true)
    setCopied(false)
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) reset()
    onOpenChange(o)
  }

  const handleSubmit = () => {
    if (!fileId && !folderId) return
    let expiresAt: Date | undefined
    if (expiry === "custom" && customExpiry) {
      expiresAt = new Date(customExpiry)
    } else if (expiry !== "never") {
      expiresAt = EXPIRY_DATES[expiry]
    }
    createLink.mutate({
      fileId,
      folderId,
      accessType,
      password: accessType === "PasswordProtected" ? password : undefined,
      expiresAt: expiresAt?.toISOString(),
      allowDownload,
    })
  }

  const shareUrl = result?.shareUrl ?? (result?.slug ? `${window.location.origin}/s/${result.slug}` : "")

  const copyLink = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-sm font-semibold">
            {result ? "Share link created" : "Create Share Link"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {result
              ? "Copy the link below to share your item."
              : "Generate a shareable link for a file or folder in your cloud storage."}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm font-medium">{defaultName ?? "Item"}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-md border bg-muted/30 px-3 py-2 text-xs font-mono">
                {shareUrl}
              </div>
              <Button size="icon-sm" variant="outline" onClick={copyLink}>
                {copied
                  ? <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5 text-emerald-500" strokeWidth={2} />
                  : <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
                }
              </Button>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5">{result.accessType === "PasswordProtected" ? "Password Protected" : result.accessType}</span>
              {result.expiresAt && <span>Expires {new Date(result.expiresAt).toLocaleDateString()}</span>}
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-5 py-4">
            {defaultName && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {targetKind === "folder" ? "Folder" : "File"}
                </Label>
                <div className={cn("flex items-center gap-2.5 rounded-lg border px-3 py-2 bg-gradient-to-r", visual.gradFrom, visual.gradTo)}>
                  <HugeiconsIcon icon={visual.icon} className={cn("size-4 shrink-0", visual.iconColor)} strokeWidth={1.5} />
                  <span className="truncate text-xs font-medium">{defaultName}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access type</Label>
              <ButtonGroup>
                {(["Public", "PasswordProtected", "Private"] as AccessType[]).map((t) => (
                  <UpgradeTooltip
                    key={t}
                    disabled={
                      (t === "PasswordProtected" && !subscription?.featureAccess.passwordProtectedLinks) ||
                      (t === "Private" && !subscription?.featureAccess.teamManagement)
                    }
                    message={
                      t === "PasswordProtected"
                        ? featureUpgradeMessage("passwordProtectedLinks")
                        : featureUpgradeMessage("teamManagement")
                    }
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={accessType === t ? "default" : "outline"}
                      disabled={
                        (t === "PasswordProtected" && !subscription?.featureAccess.passwordProtectedLinks) ||
                        (t === "Private" && !subscription?.featureAccess.teamManagement)
                      }
                      onClick={() => setAccessType(t)}
                    >
                      {ACCESS_LABELS[t]}
                    </Button>
                  </UpgradeTooltip>
                ))}
              </ButtonGroup>
            </div>

            {accessType === "PasswordProtected" && (
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

            <div className="flex items-center justify-between rounded-lg border px-3 py-3">
              <div>
                <p className="text-xs font-medium">Allow download</p>
                <p className="text-[11px] text-muted-foreground">Recipients can download the original file</p>
              </div>
              <Switch size="sm" checked={allowDownload} onCheckedChange={setAllowDownload} />
            </div>
          </div>
        )}

        <DialogFooter className="border-t px-5 py-3">
          {result ? (
            <Button size="sm" onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <UpgradeTooltip
                disabled={shareLinkLimitReached || loading}
                message={`Upgrade to ${subscription?.plan === "Free" ? "Pro" : "Team"} to create more share links.`}
              >
                <Button size="sm" onClick={handleSubmit} disabled={isPending || (!fileId && !folderId) || shareLinkLimitReached || loading}>
                {isPending && <HugeiconsIcon icon={Loading01Icon} className="size-3.5 animate-spin" strokeWidth={1.5} />}
                <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
                Create Link
                </Button>
              </UpgradeTooltip>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
