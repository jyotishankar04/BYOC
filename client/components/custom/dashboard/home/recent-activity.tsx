import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileUploadIcon,
  Share01Icon,
  FolderAddIcon,
  CloudServerIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const ACTIVITIES = [
  {
    icon: FileUploadIcon,
    text: "Uploaded project-demo.mp4",
    time: "Just now",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: Share01Icon,
    text: "Shared invoice.pdf",
    time: "2 hours ago",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: FolderAddIcon,
    text: "Created folder 'College Notes'",
    time: "Yesterday",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: CloudServerIcon,
    text: "Connected AWS S3 bucket",
    time: "3 days ago",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
] as const

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {ACTIVITIES.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", activity.iconBg)}>
              <HugeiconsIcon icon={activity.icon} className={cn("size-3.5", activity.iconColor)} strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-snug">{activity.text}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
