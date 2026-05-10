"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics01Icon,
  HardDriveIcon,
  Folder01Icon,
  LinkSquare01Icon,
  CloudUploadIcon,
  ArrowUpIcon,
  Image01Icon,
  Video01Icon,
  LegalDocument01Icon,
  FolderAddIcon,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const STORAGE_TREND = [
  { month: "Nov", used: 42 },
  { month: "Dec", used: 58 },
  { month: "Jan", used: 71 },
  { month: "Feb", used: 89 },
  { month: "Mar", used: 104 },
  { month: "Apr", used: 118 },
  { month: "May", used: 128 },
]

const UPLOAD_ACTIVITY = [
  { day: "Mon", uploads: 12, downloads: 5 },
  { day: "Tue", uploads: 28, downloads: 14 },
  { day: "Wed", uploads: 9,  downloads: 21 },
  { day: "Thu", uploads: 34, downloads: 8  },
  { day: "Fri", uploads: 19, downloads: 32 },
  { day: "Sat", uploads: 7,  downloads: 4  },
  { day: "Sun", uploads: 3,  downloads: 2  },
]

const STORAGE_BREAKDOWN = [
  { name: "Videos",    value: 61,  color: "#3b82f6" },
  { name: "Images",    value: 42,  color: "#8b5cf6" },
  { name: "Documents", value: 18,  color: "#f59e0b" },
  { name: "Others",    value: 7.4, color: "#94a3b8" },
]

const TOP_LINKS = [
  { name: "project-demo.mp4",    visits: 248, trend: "+18%", type: "Video"    },
  { name: "design-assets.zip",   visits: 134, trend: "+6%",  type: "Archive"  },
  { name: "invoice-q1.pdf",      visits: 97,  trend: "-3%",  type: "Document" },
  { name: "team-photo.png",      visits: 56,  trend: "+42%", type: "Image"    },
  { name: "presentation.pptx",   visits: 31,  trend: "+11%", type: "Slides"   },
]

const RECENT_ACTIVITY = [
  { icon: CloudUploadIcon, text: "Uploaded project-demo.mp4",       time: "Just now",    color: "text-blue-500",    bg: "bg-blue-500/10"    },
  { icon: LinkSquare01Icon, text: "Generated share link for invoice.pdf", time: "1h ago", color: "text-violet-500", bg: "bg-violet-500/10"  },
  { icon: CloudUploadIcon, text: "Uploaded design-assets.zip",      time: "3h ago",      color: "text-blue-500",    bg: "bg-blue-500/10"    },
  { icon: FolderAddIcon,   text: "Created folder 'College Notes'",  time: "Yesterday",   color: "text-amber-500",   bg: "bg-amber-500/10"   },
  { icon: Image01Icon,     text: "Uploaded 6 images to Gallery",    time: "2 days ago",  color: "text-violet-500",  bg: "bg-violet-500/10"  },
]

const RANGES = ["7 days", "30 days", "90 days"] as const
type Range = typeof RANGES[number]

const STATS = [
  { label: "Total Storage",    value: "128.4 GB", sub: "+10.4 GB this month", icon: HardDriveIcon,    iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
  { label: "Total Files",      value: "2,430",    sub: "+84 this month",      icon: Folder01Icon,     iconColor: "text-blue-500",   iconBg: "bg-blue-500/10"   },
  { label: "Active Share Links", value: "18",     sub: "6 expire this week",  icon: LinkSquare01Icon, iconColor: "text-emerald-500",iconBg: "bg-emerald-500/10"},
  { label: "Uploads This Week", value: "112",     sub: "↑24% vs last week",   icon: CloudUploadIcon,  iconColor: "text-amber-500",  iconBg: "bg-amber-500/10"  },
]

const TYPE_ICON: Record<string, typeof Image01Icon> = {
  Video: Video01Icon,
  Image: Image01Icon,
  Document: LegalDocument01Icon,
  Slides: LegalDocument01Icon,
  Archive: Folder01Icon,
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

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
  const [range, setRange] = useState<Range>("7 days")

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

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
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
            <CardDescription className="text-xs">Total GB used over the last 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={STORAGE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
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
          </CardContent>
        </Card>

        {/* Breakdown — 1/3 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Storage Breakdown</CardTitle>
            <CardDescription className="text-xs">128.4 GB total across file types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={STORAGE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {STORAGE_BREAKDOWN.map((entry) => (
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
              {STORAGE_BREAKDOWN.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                  <span className="text-muted-foreground">{cat.value} GB</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload activity + Top links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload activity — 2/3 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Upload & Download Activity</CardTitle>
            <CardDescription className="text-xs">File operations per day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={UPLOAD_ACTIVITY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ActivityTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  iconType="circle"
                  iconSize={7}
                />
                <Bar dataKey="uploads"   name="Uploads"   fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar dataKey="downloads" name="Downloads" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top shared links — 1/3 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top Shared Links</CardTitle>
            <CardDescription className="text-xs">By visit count this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TOP_LINKS.map((link, i) => {
                const Icon = TYPE_ICON[link.type] ?? Folder01Icon
                const isUp = link.trend.startsWith("+")
                return (
                  <div key={link.name} className="flex items-center gap-3">
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
                    <Badge
                      variant="secondary"
                      className={cn(
                        "shrink-0 text-[10px]",
                        isUp
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-red-500/10 text-red-600",
                      )}
                    >
                      {link.trend}
                    </Badge>
                  </div>
                )
              })}
            </div>
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
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", a.bg)}>
                  <HugeiconsIcon icon={a.icon} className={cn("size-3.5", a.color)} strokeWidth={1.5} />
                </div>
                <p className="flex-1 text-xs">{a.text}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
