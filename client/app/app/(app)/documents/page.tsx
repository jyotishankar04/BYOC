"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  CloudUploadIcon,
  Download01Icon,
  Share01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  EyeIcon,
  Copy01Icon,
  LinkSquare01Icon,
  MoveIcon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/shared/search-input"
import { ViewToggle } from "@/components/shared/view-toggle"
import { KebabTrigger } from "@/components/shared/kebab-trigger"
import {
  FileDetailsSidebar,
  type FileItem,
  type FileActivity,
} from "@/components/custom/dashboard/common/file-details-sidebar"
import { UploadDialog } from "@/components/custom/dashboard/common/upload-dialog"
import { CreateShareLinkDialog } from "@/components/custom/dashboard/common/create-share-link-dialog"

// ─── Types ─────────────────────────────────────────────────────────────────────

type DocType = "PDF" | "Word" | "Excel" | "Slides" | "Text"

interface DocItem {
  id: string
  name: string
  extension: string
  docType: DocType
  size: string
  sizeBytes: number
  pages?: number
  folder: string
  uploadedAt: string
  lastModified: string
  uploadedMs: number
  status: "Private" | "Shared"
  owner: string
  storagePath: string
  shareLink?: string
}

// ─── Visual config ─────────────────────────────────────────────────────────────

const TYPE_VISUAL: Record<
  DocType,
  { iconColor: string; gradFrom: string; gradTo: string; badgeClass: string; dot: string }
> = {
  PDF:    { iconColor: "text-rose-500",    gradFrom: "from-rose-500/15",    gradTo: "to-rose-600/5",    badgeClass: "bg-rose-500/10 text-rose-600",       dot: "bg-rose-500"    },
  Word:   { iconColor: "text-blue-500",    gradFrom: "from-blue-500/15",    gradTo: "to-blue-600/5",    badgeClass: "bg-blue-500/10 text-blue-600",       dot: "bg-blue-500"    },
  Excel:  { iconColor: "text-emerald-500", gradFrom: "from-emerald-500/15", gradTo: "to-emerald-600/5", badgeClass: "bg-emerald-500/10 text-emerald-600", dot: "bg-emerald-500" },
  Slides: { iconColor: "text-orange-500",  gradFrom: "from-orange-500/15",  gradTo: "to-orange-600/5",  badgeClass: "bg-orange-500/10 text-orange-600",   dot: "bg-orange-500"  },
  Text:   { iconColor: "text-slate-500",   gradFrom: "from-slate-500/15",   gradTo: "to-slate-600/5",   badgeClass: "bg-slate-500/10 text-slate-600",     dot: "bg-slate-500"   },
}

// ─── Dummy data ────────────────────────────────────────────────────────────────

const DOCUMENTS: DocItem[] = [
  { id: "1",  name: "invoice-may-2026.pdf",   extension: "pdf",  docType: "PDF",    size: "2.1 MB",  sizeBytes: 2202009,  pages: 3,   folder: "Finance",          uploadedAt: "May 9, 2026",  lastModified: "May 9, 2026",  uploadedMs: 1746748800000, status: "Shared",  owner: "John Doe", storagePath: "finance/invoices/invoice-may-2026.pdf",    shareLink: "https://byoc.app/share/inv-abc123" },
  { id: "2",  name: "q2-report.docx",         extension: "docx", docType: "Word",   size: "540 KB",  sizeBytes: 552960,   pages: 24,  folder: "Reports",          uploadedAt: "May 5, 2026",  lastModified: "May 6, 2026",  uploadedMs: 1746403200000, status: "Private", owner: "John Doe", storagePath: "reports/2026/q2-report.docx" },
  { id: "3",  name: "project-proposal.pdf",   extension: "pdf",  docType: "PDF",    size: "1.8 MB",  sizeBytes: 1887437,  pages: 12,  folder: "Projects",         uploadedAt: "May 3, 2026",  lastModified: "May 3, 2026",  uploadedMs: 1746230400000, status: "Private", owner: "John Doe", storagePath: "projects/project-proposal.pdf" },
  { id: "4",  name: "budget-2026.xlsx",       extension: "xlsx", docType: "Excel",  size: "380 KB",  sizeBytes: 389120,   folder: "Finance",          uploadedAt: "Apr 28, 2026", lastModified: "May 1, 2026",  uploadedMs: 1745798400000, status: "Private", owner: "John Doe", storagePath: "finance/budget-2026.xlsx" },
  { id: "5",  name: "product-roadmap.pptx",   extension: "pptx", docType: "Slides", size: "5.2 MB",  sizeBytes: 5452595,  pages: 32,  folder: "Projects",         uploadedAt: "Apr 25, 2026", lastModified: "Apr 26, 2026", uploadedMs: 1745539200000, status: "Shared",  owner: "John Doe", storagePath: "projects/product-roadmap.pptx",          shareLink: "https://byoc.app/share/rm-def456" },
  { id: "6",  name: "meeting-notes.txt",      extension: "txt",  docType: "Text",   size: "12 KB",   sizeBytes: 12288,    folder: "Personal",         uploadedAt: "Apr 22, 2026", lastModified: "Apr 22, 2026", uploadedMs: 1745280000000, status: "Private", owner: "John Doe", storagePath: "personal/meeting-notes.txt" },
  { id: "7",  name: "tax-return-2025.pdf",    extension: "pdf",  docType: "PDF",    size: "3.7 MB",  sizeBytes: 3881165,  pages: 8,   folder: "Finance",          uploadedAt: "Apr 15, 2026", lastModified: "Apr 15, 2026", uploadedMs: 1744675200000, status: "Private", owner: "John Doe", storagePath: "finance/tax-return-2025.pdf" },
  { id: "8",  name: "employee-handbook.pdf",  extension: "pdf",  docType: "PDF",    size: "4.1 MB",  sizeBytes: 4299366,  pages: 45,  folder: "HR",               uploadedAt: "Apr 10, 2026", lastModified: "Apr 10, 2026", uploadedMs: 1744243200000, status: "Shared",  owner: "John Doe", storagePath: "hr/employee-handbook.pdf",              shareLink: "https://byoc.app/share/eh-ghi789" },
  { id: "9",  name: "analytics-report.xlsx",  extension: "xlsx", docType: "Excel",  size: "720 KB",  sizeBytes: 737280,   folder: "Reports",          uploadedAt: "Apr 5, 2026",  lastModified: "Apr 7, 2026",  uploadedMs: 1743811200000, status: "Private", owner: "John Doe", storagePath: "reports/analytics-report.xlsx" },
  { id: "10", name: "onboarding-slides.pptx", extension: "pptx", docType: "Slides", size: "8.9 MB",  sizeBytes: 9334374,  pages: 48,  folder: "HR",               uploadedAt: "Mar 28, 2026", lastModified: "Mar 30, 2026", uploadedMs: 1743120000000, status: "Shared",  owner: "John Doe", storagePath: "hr/onboarding-slides.pptx",             shareLink: "https://byoc.app/share/os-jkl012" },
  { id: "11", name: "terms-of-service.pdf",   extension: "pdf",  docType: "PDF",    size: "890 KB",  sizeBytes: 911360,   pages: 18,  folder: "Legal",            uploadedAt: "Mar 20, 2026", lastModified: "Mar 20, 2026", uploadedMs: 1742428800000, status: "Shared",  owner: "John Doe", storagePath: "legal/terms-of-service.pdf",            shareLink: "https://byoc.app/share/tos-mno345" },
  { id: "12", name: "dev-notes.txt",          extension: "txt",  docType: "Text",   size: "8 KB",    sizeBytes: 8192,     folder: "Projects",         uploadedAt: "Mar 15, 2026", lastModified: "Mar 17, 2026", uploadedMs: 1741996800000, status: "Private", owner: "John Doe", storagePath: "projects/dev-notes.txt" },
  { id: "13", name: "client-contacts.xlsx",   extension: "xlsx", docType: "Excel",  size: "156 KB",  sizeBytes: 159744,   folder: "Sales",            uploadedAt: "Mar 10, 2026", lastModified: "Mar 12, 2026", uploadedMs: 1741564800000, status: "Private", owner: "John Doe", storagePath: "sales/client-contacts.xlsx" },
  { id: "14", name: "annual-review.docx",     extension: "docx", docType: "Word",   size: "1.2 MB",  sizeBytes: 1258291,  pages: 36,  folder: "HR",               uploadedAt: "Mar 5, 2026",  lastModified: "Mar 8, 2026",  uploadedMs: 1741132800000, status: "Private", owner: "John Doe", storagePath: "hr/annual-review.docx" },
  { id: "15", name: "pitch-deck.pptx",        extension: "pptx", docType: "Slides", size: "12 MB",   sizeBytes: 12582912, pages: 22,  folder: "Sales",            uploadedAt: "Feb 28, 2026", lastModified: "Mar 1, 2026",  uploadedMs: 1740700800000, status: "Shared",  owner: "John Doe", storagePath: "sales/pitch-deck.pptx",                shareLink: "https://byoc.app/share/pd-pqr678" },
  { id: "16", name: "research-notes.docx",    extension: "docx", docType: "Word",   size: "340 KB",  sizeBytes: 348160,   pages: 15,  folder: "Personal / Study", uploadedAt: "Feb 20, 2026", lastModified: "Feb 20, 2026", uploadedMs: 1739836800000, status: "Private", owner: "John Doe", storagePath: "personal/study/research-notes.docx" },
  { id: "17", name: "invoice-apr-2026.pdf",   extension: "pdf",  docType: "PDF",    size: "1.9 MB",  sizeBytes: 1992294,  pages: 3,   folder: "Finance",          uploadedAt: "Apr 30, 2026", lastModified: "Apr 30, 2026", uploadedMs: 1746057600000, status: "Shared",  owner: "John Doe", storagePath: "finance/invoices/invoice-apr-2026.pdf",   shareLink: "https://byoc.app/share/inv-stu901" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function docToFileItem(doc: DocItem): FileItem {
  const activities: FileActivity[] = [
    {
      action: "File uploaded",
      time: `${doc.uploadedAt} · 10:00 AM`,
      icon: FileUploadIcon,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
  ]
  if (doc.lastModified !== doc.uploadedAt) {
    activities.push({
      action: "File updated",
      time: `${doc.lastModified} · 2:00 PM`,
      icon: PencilEdit01Icon,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
    })
  }
  if (doc.status === "Shared") {
    activities.push({
      action: "Link shared",
      time: `${doc.uploadedAt} · 11:00 AM`,
      icon: Share01Icon,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
    })
  }
  return {
    id: doc.id,
    name: doc.name,
    type: "Document",
    extension: doc.extension,
    size: doc.size,
    folder: doc.folder,
    uploadedAt: doc.uploadedAt,
    lastModified: doc.lastModified,
    status: doc.status,
    owner: doc.owner,
    bucket: "byoc-user-storage",
    storagePath: doc.storagePath,
    shareLink: doc.shareLink,
    activities,
  }
}

// ─── Filter / Sort ─────────────────────────────────────────────────────────────

const DOC_FILTERS = ["All", "PDF", "Word", "Excel", "Slides", "Text"] as const
type DocFilter = (typeof DOC_FILTERS)[number]

type SortKey = "recent" | "oldest" | "name-az" | "name-za" | "size-desc" | "size-asc"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent",    label: "Most Recent"    },
  { key: "oldest",    label: "Oldest First"   },
  { key: "name-az",   label: "Name A → Z"    },
  { key: "name-za",   label: "Name Z → A"    },
  { key: "size-desc", label: "Largest First"  },
  { key: "size-asc",  label: "Smallest First" },
]

function applyFilterSort(docs: DocItem[], filter: DocFilter, sort: SortKey, query: string): DocItem[] {
  const q = query.toLowerCase()
  const filtered = docs.filter((d) => {
    if (filter !== "All" && d.docType !== filter) return false
    if (q && !d.name.toLowerCase().includes(q)) return false
    return true
  })
  const sorted = [...filtered]
  switch (sort) {
    case "recent":    sorted.sort((a, b) => b.uploadedMs - a.uploadedMs);          break
    case "oldest":    sorted.sort((a, b) => a.uploadedMs - b.uploadedMs);          break
    case "name-az":   sorted.sort((a, b) => a.name.localeCompare(b.name));         break
    case "name-za":   sorted.sort((a, b) => b.name.localeCompare(a.name));         break
    case "size-desc": sorted.sort((a, b) => b.sizeBytes - a.sizeBytes);            break
    case "size-asc":  sorted.sort((a, b) => a.sizeBytes - b.sizeBytes);            break
  }
  return sorted
}

// ─── Shared menu ───────────────────────────────────────────────────────────────

function DocMenuItems({
  as: As,
  Sep,
  doc,
  onPreview,
  onShare,
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  doc: DocItem
  onPreview: () => void
  onShare: () => void
}) {
  return (
    <>
      <As onClick={onPreview} className="gap-2">
        <HugeiconsIcon icon={EyeIcon} className="size-3.5" strokeWidth={1.5} />
        Preview
      </As>
      <As className="gap-2">
        <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
        Download
      </As>
      <Sep />
      <As onClick={onShare} className="gap-2">
        <HugeiconsIcon icon={Share01Icon} className="size-3.5" strokeWidth={1.5} />
        {doc.status === "Shared" ? "Manage Link" : "Share"}
      </As>
      {doc.status === "Shared" && (
        <As className="gap-2">
          <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
          Copy Link
        </As>
      )}
      {doc.status === "Private" && (
        <As className="gap-2">
          <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
          Get Link
        </As>
      )}
      <Sep />
      <As className="gap-2">
        <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" strokeWidth={1.5} />
        Rename
      </As>
      <As className="gap-2">
        <HugeiconsIcon icon={MoveIcon} className="size-3.5" strokeWidth={1.5} />
        Move to
      </As>
      <Sep />
      <As variant="destructive" className="gap-2">
        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
        Delete
      </As>
    </>
  )
}

// ─── Document Card (grid) ──────────────────────────────────────────────────────

function DocCard({
  doc,
  isSelected,
  onClick,
  onShare,
}: {
  doc: DocItem
  isSelected: boolean
  onClick: () => void
  onShare: () => void
}) {
  const v = TYPE_VISUAL[doc.docType]
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-card text-left",
            "transition-all duration-150 hover:border-border/80 hover:shadow-md",
            isSelected && "border-primary/30 ring-2 ring-primary",
          )}
        >
          <div className={cn("relative flex h-28 items-center justify-center bg-gradient-to-br", v.gradFrom, v.gradTo)}>
            <HugeiconsIcon
              icon={LegalDocument01Icon}
              className={cn("size-10 opacity-70 transition-transform duration-200 group-hover:scale-110", v.iconColor)}
              strokeWidth={1.2}
            />
            {/* Extension badge */}
            <span className={cn("absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", v.badgeClass)}>
              {doc.extension}
            </span>
            {/* Pages badge */}
            {doc.pages && (
              <span className="absolute right-2 top-2 rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
                {doc.pages}p
              </span>
            )}
            {/* 3-dot — nudged below extension badge */}
            <div className="absolute right-1.5 top-8 opacity-0 transition-opacity group-hover:opacity-100">
              <DropdownMenu>
                <KebabTrigger className="bg-background/80 backdrop-blur-sm" />
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DocMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} doc={doc} onPreview={onClick} onShare={onShare} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="border-t px-3 py-2.5">
            <p className="truncate text-xs font-medium">{doc.name}</p>
            <div className="mt-1 flex items-center justify-between gap-1">
              <span className="text-[11px] text-muted-foreground">{doc.size}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "px-1.5 py-0 text-[10px]",
                  doc.status === "Shared"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {doc.status}
              </Badge>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <DocMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} doc={doc} onPreview={onClick} onShare={onShare} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Document List Row ─────────────────────────────────────────────────────────

function DocListRow({
  doc,
  isSelected,
  onClick,
  showBorder,
  onShare,
}: {
  doc: DocItem
  isSelected: boolean
  onClick: () => void
  showBorder: boolean
  onShare: () => void
}) {
  const v = TYPE_VISUAL[doc.docType]
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
            showBorder && "border-t",
            isSelected && "bg-primary/5 ring-inset ring-1 ring-primary/20",
          )}
        >
          {/* Icon chip */}
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", v.gradFrom, v.gradTo)}>
            <HugeiconsIcon icon={LegalDocument01Icon} className={cn("size-4", v.iconColor)} strokeWidth={1.5} />
          </div>

          {/* Name + folder */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{doc.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{doc.folder}</p>
          </div>

          {/* Metadata (hidden on mobile) */}
          <div className="hidden items-center gap-4 sm:flex">
            <Badge variant="secondary" className={cn("text-[10px]", v.badgeClass)}>
              {doc.extension.toUpperCase()}
            </Badge>
            <span className="hidden w-16 text-right text-[11px] text-muted-foreground md:block">
              {doc.pages ? `${doc.pages} pages` : "—"}
            </span>
            <span className="w-14 text-right text-[11px] text-muted-foreground">{doc.size}</span>
            <span className="hidden w-28 text-right text-[11px] text-muted-foreground lg:block">
              {doc.lastModified}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px]",
                doc.status === "Shared"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {doc.status}
            </Badge>
          </div>

          {/* Kebab */}
          <DropdownMenu>
            <KebabTrigger />
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DocMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} doc={doc} onPreview={onClick} onShare={onShare} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <DocMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} doc={doc} onPreview={onClick} onShare={onShare} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [filter, setFilter]           = useState<DocFilter>("All")
  const [sort, setSort]               = useState<SortKey>("recent")
  const [viewMode, setViewMode]       = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null)
  const [uploadOpen, setUploadOpen]   = useState(false)
  const [shareFileName, setShareFileName] = useState<string | null>(null)

  const visible      = applyFilterSort(DOCUMENTS, filter, sort, searchQuery)
  const isDetailOpen = selectedDoc !== null

  const handleDocClick = (doc: DocItem) =>
    setSelectedDoc((prev) => (prev?.id === doc.id ? null : doc))

  const typeCounts = (DOC_FILTERS.slice(1) as DocType[]).reduce<Record<string, number>>(
    (acc, t) => ({ ...acc, [t]: DOCUMENTS.filter((d) => d.docType === t).length }),
    {},
  )

  const activeSort = SORT_OPTIONS.find((s) => s.key === sort)!

  return (
    <>
      <div className={cn("flex flex-col gap-5 transition-all duration-300", isDetailOpen && "lg:mr-[420px]")}>

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Documents</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {DOCUMENTS.length} documents &middot; {DOCUMENTS.filter((d) => d.status === "Shared").length} shared
            </p>
          </div>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
            Upload Document
          </Button>
        </div>

        {/* ── Type stat pills ── */}
        <div className="flex flex-wrap gap-2">
          {(DOC_FILTERS.slice(1) as DocType[]).map((t) => {
            const v = TYPE_VISUAL[t]
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  filter === t
                    ? "border-transparent bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full", v.dot)} />
                {t}
                <span className="tabular-nums">{typeCounts[t]}</span>
              </button>
            )
          })}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search documents..."
          />

          {/* Filter tabs */}
          <ButtonGroup>
            {DOC_FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </ButtonGroup>

          <div className="ml-auto flex items-center gap-2">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  {activeSort.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.key}
                    onClick={() => setSort(opt.key)}
                    className="gap-2 text-xs"
                  >
                    {opt.label}
                    {sort === opt.key && <span className="ml-auto text-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* ── Empty state ── */}
        {visible.length === 0 && (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
            <HugeiconsIcon icon={LegalDocument01Icon} className="size-9 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm font-medium text-muted-foreground">No documents found</p>
            {searchQuery && (
              <p className="text-xs text-muted-foreground">Try a different search or filter</p>
            )}
          </div>
        )}

        {/* ── Grid view ── */}
        {visible.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {visible.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                isSelected={selectedDoc?.id === doc.id}
                onClick={() => handleDocClick(doc)}
                onShare={() => setShareFileName(doc.name)}
              />
            ))}
          </div>
        )}

        {/* ── List view ── */}
        {visible.length > 0 && viewMode === "list" && (
          <div className="overflow-hidden rounded-xl border">
            {/* Column header */}
            <div className="hidden items-center gap-3 border-b bg-muted/30 px-4 py-2 sm:flex">
              <div className="size-9 shrink-0" />
              <div className="flex-1 text-[11px] font-medium text-muted-foreground">Name</div>
              <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
                <span className="w-14">Type</span>
                <span className="hidden w-16 text-right md:block">Pages</span>
                <span className="w-14 text-right">Size</span>
                <span className="hidden w-28 text-right lg:block">Modified</span>
                <span className="w-14">Status</span>
              </div>
              <div className="size-6 shrink-0" />
            </div>

            {visible.map((doc, i) => (
              <DocListRow
                key={doc.id}
                doc={doc}
                isSelected={selectedDoc?.id === doc.id}
                onClick={() => handleDocClick(doc)}
                showBorder={i > 0}
                onShare={() => setShareFileName(doc.name)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDoc && (
        <FileDetailsSidebar
          file={docToFileItem(selectedDoc)}
          isOpen
          onClose={() => setSelectedDoc(null)}
        />
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <CreateShareLinkDialog
        open={shareFileName !== null}
        onOpenChange={(open) => { if (!open) setShareFileName(null) }}
        defaultFileName={shareFileName ?? undefined}
      />
    </>
  )
}
