"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LinkSquare01Icon,
  LockedIcon,
  Download01Icon,
  EyeIcon,
  Loading01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  File01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/common/logo"
import { cn } from "@/lib/utils"
import { accessPublicShareLink, type PublicShareResponse } from "@/lib/public-share"

type PageState = "loading" | "password" | "error" | "success"

export default function PublicSharePage() {
  const { slug } = useParams<{ slug: string }>()
  const [state, setState]           = useState<PageState>("loading")
  const [data, setData]             = useState<PublicShareResponse | null>(null)
  const [error, setError]           = useState<{ title: string; message: string; code?: string } | null>(null)
  const [password, setPassword]     = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied]         = useState(false)

  const fetchLink = useCallback(async (pw?: string) => {
    if (!slug) return
    setState("loading")
    try {
      const result = await accessPublicShareLink(slug, pw)
      setData(result)
      setState("success")
    } catch (err: any) {
      const status = err.status ?? 0
      const code = err.code

      if (status === 401 && code === "PASSWORD_REQUIRED") {
        setState("password")
        setPasswordError("")
        return
      }

      if (status === 401 && code === "INVALID_PASSWORD") {
        setPasswordError("Invalid password. Please try again.")
        setState("password")
        return
      }

      if (status === 401 && code === "AUTH_REQUIRED") {
        setError({ title: "Authentication Required", message: "You need to log in to access this private share link.", code: "AUTH_REQUIRED" })
        setState("error")
        return
      }

      if (status === 403) {
        setError({ title: "Access Denied", message: err.message || "You don't have permission to access this file.", code: "FORBIDDEN" })
        setState("error")
        return
      }

      if (status === 410) {
        setError({ title: "Link Expired", message: "This share link has expired." })
        setState("error")
        return
      }

      setError({ title: "Link Not Found", message: err.message || "This share link does not exist or has been removed." })
      setState("error")
    }
  }, [slug])

  useEffect(() => { fetchLink() }, [fetchLink])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { setPasswordError("Please enter a password"); return }
    setSubmitting(true)
    setPasswordError("")
    try {
      await fetchLink(password)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <Logo className="size-7" />
        <span className="text-[11px] text-muted-foreground">Powered by BYOC</span>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-lg">

          {/* ── Loading ── */}
          {state === "loading" && (
            <div className="flex flex-col items-center gap-4 py-20">
              <HugeiconsIcon icon={Loading01Icon} className="size-8 animate-spin text-muted-foreground" strokeWidth={2} />
              <p className="text-sm text-muted-foreground">Loading share link...</p>
            </div>
          )}

          {/* ── Error ── */}
          {state === "error" && error && (
            <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-500/10">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-6 text-rose-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-lg font-semibold">{error.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
              {error.code === "AUTH_REQUIRED" && (
                <Button size="sm" className="mt-4" onClick={() => window.location.href = "/auth/login"}>
                  Log In
                </Button>
              )}
            </div>
          )}

          {/* ── Password form ── */}
          {state === "password" && (
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-500/10">
                <HugeiconsIcon icon={LockedIcon} className="size-6 text-amber-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-center text-lg font-semibold">Password Required</h1>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                This shared item is protected. Enter the password to access it.
              </p>

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter share link password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError("") }}
                    className={cn("h-9 text-sm", passwordError && "border-rose-500")}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-xs text-rose-500">{passwordError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <HugeiconsIcon icon={Loading01Icon} className="size-3.5 animate-spin" strokeWidth={2} />}
                  <HugeiconsIcon icon={EyeIcon} className="size-3.5" strokeWidth={1.5} />
                  Access Item
                </Button>
              </form>
            </div>
          )}

          {/* ── Success ── */}
          {state === "success" && data && (
            <div className="space-y-4">
              {data.kind === "file" ? (
              <div className="rounded-xl border bg-card shadow-sm">
                {data.fileType?.startsWith("image/") ? (
                  <div className="relative flex items-center justify-center rounded-t-xl bg-black/5 p-4">
                    <img
                      src={data.previewUrl}
                      alt={data.fileName}
                      className="max-h-[60vh] rounded-lg object-contain"
                    />
                  </div>
                ) : data.fileType?.startsWith("video/") ? (
                  <div className="rounded-t-xl bg-black/5 p-4">
                    <video
                      src={data.previewUrl}
                      controls
                      className="max-h-[60vh] w-full rounded-lg"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-t-xl bg-gradient-to-b from-muted/50 to-muted/10 p-12">
                    <HugeiconsIcon icon={File01Icon} className="size-16 text-muted-foreground/30" strokeWidth={1} />
                  </div>
                )}

                {/* File info */}
                <div className="space-y-4 p-5">
                  <div>
                    <h1 className="text-base font-semibold">{data.fileName}</h1>
                    {data.fileType && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{data.fileType}</p>
                    )}
                    {data.fileSize > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {data.fileSize >= 1048576
                          ? `${(data.fileSize / 1048576).toFixed(1)} MB`
                          : data.fileSize >= 1024
                            ? `${(data.fileSize / 1024).toFixed(1)} KB`
                            : `${data.fileSize} B`}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={handleCopy}>
                      <HugeiconsIcon icon={copied ? CheckmarkCircle01Icon : Copy01Icon} className="size-3.5" strokeWidth={1.5} />
                      {copied ? "Copied!" : "Copy Link"}
                    </Button>
                    {data.allowDownload && data.downloadUrl && (
                      <Button size="sm" className="gap-2" asChild>
                        <a href={data.downloadUrl} download={data.fileName}>
                          <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
                          Download
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-2 ml-auto" asChild>
                      <a href={data.previewUrl} target="_blank" rel="noopener noreferrer">
                        <HugeiconsIcon icon={EyeIcon} className="size-3.5" strokeWidth={1.5} />
                        Open Original
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              ) : (
                <div className="rounded-xl border bg-card shadow-sm">
                  <div className="flex items-center justify-center rounded-t-xl bg-gradient-to-b from-muted/50 to-muted/10 p-12">
                    <HugeiconsIcon icon={Folder01Icon} className="size-16 text-amber-500/40" strokeWidth={1} />
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h1 className="text-base font-semibold">{data.folderName}</h1>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Shared folder • {data.itemCount} file{data.itemCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={handleCopy}>
                        <HugeiconsIcon icon={copied ? CheckmarkCircle01Icon : Copy01Icon} className="size-3.5" strokeWidth={1.5} />
                        {copied ? "Copied!" : "Copy Link"}
                      </Button>
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                      {data.items.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                          This shared folder is empty.
                        </div>
                      ) : (
                        data.items.map((item, index) => (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-center justify-between gap-3 px-4 py-3",
                              index > 0 && "border-t",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{item.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{item.relativePath}</p>
                            </div>
                            {data.allowDownload && item.downloadUrl ? (
                              <Button size="sm" variant="outline" asChild>
                                <a href={item.downloadUrl} download={item.name}>
                                  <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
                                  Download
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
