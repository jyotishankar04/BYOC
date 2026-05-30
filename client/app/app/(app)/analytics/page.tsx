"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HardDriveIcon,
  Folder01Icon,
  LinkSquare01Icon,
  CloudUploadIcon,
  Image01Icon,
  Video01Icon,
  LegalDocument01Icon,
  File01Icon,
  AudioBook01Icon,
  ZipIcon,
} from "@hugeicons/core-free-icons"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatFileSize, formatDate } from "@/lib/file-utils"
import { useWorkspace } from "@/lib/workspace-context"
import { ProviderErrorGuard } from "@/components/custom/dashboard/common/provider-error-guard"
import { useDashboard, useAnalytics } from "@/lib/analytics"
import type { FileKind } from "@/lib/analytics"
import { useSubscriptionSnapshot } from "@/lib/subscription"
import { LockedState } from "@/components/custom/subscription/locked-state"

const RANGES = ["7 days", "30 days", "90 days"] as const
type Range = typeof RANGES[number]

const RANGE_DAYS: Record<Range, number> = {
  "7 days": 7,
  "30 days": 30,
  "90 days": 90,
}

const KIND_COLORS: Record<FileKind, string> = {
  video: "#3b82f6",
  image: "#8b5cf6",
  document: "#f59e0b",
  audio: "#ef4444",
  archive: "#06b6d4",
  other: "#94a3b8",
}

const KIND_LABEL: Record<FileKind, string> = {
  video: "Videos",
  image: "Images",
  document: "Documents",
  audio: "Audio",
  archive: "Archives",
  other: "Others",
}

const KIND_ICON: Record<string, typeof File01Icon> = {
  mp4: Video01Icon,
  mov: Video01Icon,
  avi: Video01Icon,
  mkv: Video01Icon,
  webm: Video01Icon,
  png: Image01Icon,
  jpg: Image01Icon,
  jpeg: Image01Icon,
  gif: Image01Icon,
  webp: Image01Icon,
  svg: Image01Icon,
  pdf: LegalDocument01Icon,
  doc: LegalDocument01Icon,
  docx: LegalDocument01Icon,
  xls: LegalDocument01Icon,
  xlsx: LegalDocument01Icon,
  ppt: LegalDocument01Icon,
  pptx: LegalDocument01Icon,
  mp3: AudioBook01Icon,
  wav: AudioBook01Icon,
  flac: AudioBook01Icon,
  zip: ZipIcon,
  rar: ZipIcon,
  "7z": ZipIcon,
  tar: ZipIcon,
  gz: ZipIcon,
}

function getKindIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  return KIND_ICON[ext] ?? File01Icon
}

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short" })
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

function bytesToGb(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10
}

// ─── Custom Tooltips ───────────────────────────────────────────────────────────

function StorageTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} GB used</p>
    </div>
  )
}

function ActivityTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspace()
  const { subscription, loading: subscriptionLoading } = useSubscriptionSnapshot()
  const workspaceId = currentWorkspace?.id
  const [range, setRange] = useState<Range>("30 days")

  const days = RANGE_DAYS[range]

  const { data: dashboard } = useDashboard(workspaceId)
  const { data: analytics, isLoading } = useAnalytics(workspaceId, days)

  const storageTrend = useMemo(() => {
    if (!analytics?.storageTrend) return []
    return analytics.storageTrend.map((d) => ({
      month: formatMonth(d.date),
      used: bytesToGb(d.size),
    }))
  }, [analytics])

  const storageBreakdown = useMemo(() => {
    if (!analytics?.storageByKind) return []
    return analytics.storageByKind.map((s) => ({
      name: KIND_LABEL[s.kind],
      value: bytesToGb(s.size),
      color: KIND_COLORS[s.kind] ?? "#94a3b8",
    }))
  }, [analytics])

  const uploadActivity = useMemo(() => {
    if (!analytics?.uploadDownloadActivity) return []
    const map = new Map<string, { day: string; uploads: number; downloads: number }>()
    for (const entry of analytics.uploadDownloadActivity) {
      if (!map.has(entry.date)) {
        map.set(entry.date, { day: formatDay(entry.date), uploads: 0, downloads: 0 })
      }
      const item = map.get(entry.date)!
      if (entry.action === "FILE_UPLOAD") item.uploads += entry.count
      if (entry.action === "FILE_DOWNLOAD") item.downloads += entry.count
    }
    return Array.from(map.values())
  }, [analytics])

  const topLinks = useMemo(() => {
    if (!analytics?.topSharedLinks) return []
    return analytics.topSharedLinks.map((l) => ({
      name: l.fileName,
      visits: l.visits,
      ext: l.fileName.split(".").pop() ?? "",
    }))
  }, [analytics])

  const recentActivity = useMemo(() => {
    if (!analytics?.recentActivity) return []
    return analytics.recentActivity.map((a) => {
      const actionLower = a.action.toLowerCase()
      let icon = CloudUploadIcon
      let color = "text-blue-500"
      let bg = "bg-blue-500/10"

      if (actionLower.includes("upload")) {
        icon = CloudUploadIcon; color = "text-blue-500"; bg = "bg-blue-500/10"
      } else if (actionLower.includes("share") || actionLower.includes("link")) {
        icon = LinkSquare01Icon; color = "text-violet-500"; bg = "bg-violet-500/10"
      } else if (actionLower.includes("download")) {
        icon = CloudUploadIcon; color = "text-emerald-500"; bg = "bg-emerald-500/10"
      } else if (actionLower.includes("folder")) {
        icon = File01Icon; color = "text-amber-500"; bg = "bg-amber-500/10"
      } else if (actionLower.includes("delete")) {
        icon = File01Icon; color = "text-red-500"; bg = "bg-red-500/10"
      }

      return {
        icon,
        text: a.details ?? `${a.action.replace(/_/g, " ")} by ${a.user.name}`,
        time: formatDate(a.createdAt),
        color,
        bg,
      }
    })
  }, [analytics])

  const totalGb = dashboard ? bytesToGb(dashboard.totalSize) : 0

  if (workspaceId && (!currentWorkspace?.storage || currentWorkspace.storage.status === "Error")) {
    return <ProviderErrorGuard workspaceId={workspaceId} storage={currentWorkspace?.storage ?? null} />
  }

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <HugeiconsIcon icon={File01Icon} className="size-5 animate-spin text-muted-foreground" strokeWidth={2} />
      </div>
    )
  }

  if (!subscription?.featureAccess.advancedAnalytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Storage usage, upload activity, and link performance insights.
          </p>
        </div>
        <LockedState
          title="Advanced analytics are not included in your current plan"
          description="Upgrade to Pro to unlock trend charts, link performance, and richer storage insights."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Storage usage, upload activity, and link performance insights.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {RANGES.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "secondary" : "ghost"}
              className="h-7 text-xs"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <HugeiconsIcon icon={File01Icon} className="size-5 animate-spin text-muted-foreground" strokeWidth={2} />
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Storage", value: formatFileSize(dashboard?.totalSize ?? 0), sub: dashboard ? `${totalGb} GB total` : "", icon: HardDriveIcon, iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
              { label: "Total Files", value: (dashboard?.totalFiles ?? 0).toLocaleString(), sub: `${dashboard?.uploadsThisWeek ?? 0} uploaded this week`, icon: Folder01Icon, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
              { label: "Active Share Links", value: String(dashboard?.activeShareLinks ?? 0), sub: "Currently active", icon: LinkSquare01Icon, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
              { label: "Uploads This Week", value: String(dashboard?.uploadsThisWeek ?? 0), sub: "In the last 7 days", icon: CloudUploadIcon, iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
            ].map((s) => (
              <Card key={s.label}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">{s.label}</CardDescription>
                    <div className={cn("flex size-7 items-center justify-center rounded-md", s.iconBg)}>
                      <HugeiconsIcon icon={s.icon} className={cn("size-3.5", s.iconColor)} strokeWidth={1.5} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">{s.value}</CardTitle>
                  <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Storage trend — 2/3 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Storage Growth</CardTitle>
                <CardDescription className="text-xs">GB used over time</CardDescription>
              </CardHeader>
              <CardContent>
                {storageTrend.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">No data available yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={storageTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}GB`} />
                      <Tooltip content={<StorageTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="used"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#storageGrad)"
                        dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Breakdown — 1/3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Storage Breakdown</CardTitle>
                <CardDescription className="text-xs">{formatFileSize(dashboard?.totalSize ?? 0)} total across file types</CardDescription>
              </CardHeader>
              <CardContent>
                {storageBreakdown.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">No data available yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={storageBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {storageBreakdown.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v) => [`${v} GB`, ""]}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {storageBreakdown.map((cat) => (
                        <div key={cat.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-muted-foreground">{cat.value} GB</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upload activity + Top links */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Upload activity — 2/3 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Upload & Download Activity</CardTitle>
                <CardDescription className="text-xs">File operations per day</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadActivity.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">No activity data available yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={uploadActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ActivityTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                        iconType="circle"
                        iconSize={7}
                      />
                      <Bar dataKey="uploads" name="Uploads" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="downloads" name="Downloads" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top shared links — 1/3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Top Shared Links</CardTitle>
                <CardDescription className="text-xs">By visit count</CardDescription>
              </CardHeader>
              <CardContent>
                {topLinks.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">No shared links yet</p>
                ) : (
                  <div className="space-y-3">
                    {topLinks.slice(0, 5).map((link, i) => {
                      const Icon = getKindIcon(link.name)
                      return (
                        <div key={`${link.name}-${i}`} className="flex items-center gap-3">
                          <span className="w-4 shrink-0 text-center text-[11px] font-medium text-muted-foreground">
                            {i + 1}
                          </span>
                          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted">
                            <HugeiconsIcon icon={Icon} className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{link.name}</p>
                            <p className="text-[11px] text-muted-foreground">{link.visits} visits</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-xs">Latest actions across your storage</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", a.bg)}>
                        <HugeiconsIcon icon={a.icon} className={cn("size-3.5", a.color)} strokeWidth={1.5} />
                      </div>
                      <p className="flex-1 text-xs">{a.text}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{a.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
