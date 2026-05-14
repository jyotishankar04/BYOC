import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileUploadIcon,
  Share01Icon,
  FolderAddIcon,
  CloudServerIcon,
  Download01Icon,
  Delete01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/file-utils"

interface ActivityItem {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const ACTION_CONFIG: Record<string, { icon: typeof FileUploadIcon; text: (a: ActivityItem) => string; iconColor: string; iconBg: string }> = {
  FILE_UPLOAD: {
    icon: FileUploadIcon,
    text: (a) => a.details ?? "Uploaded a file",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  FILE_DOWNLOAD: {
    icon: Download01Icon,
    text: (a) => a.details ?? "Downloaded a file",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  FILE_DELETE: {
    icon: Delete01Icon,
    text: (a) => a.details ?? "Deleted a file",
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
  },
  FILE_SHARE: {
    icon: Share01Icon,
    text: (a) => a.details ?? "Shared a file",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  LINK_CREATED: {
    icon: LinkSquare01Icon,
    text: (a) => a.details ?? "Created a share link",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  FOLDER_CREATED: {
    icon: FolderAddIcon,
    text: (a) => a.details ?? "Created a folder",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  PROVIDER_CONNECTED: {
    icon: CloudServerIcon,
    text: (a) => a.details ?? "Connected a storage provider",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
};

function getActionConfig(action: string, fallback: ActivityItem) {
  return ACTION_CONFIG[action] ?? {
    icon: FileUploadIcon,
    text: () => fallback.details ?? action,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
  };
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-2 text-xs text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {activities.map((activity) => {
          const config = getActionConfig(activity.action, activity)
          const Icon = config.icon
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", config.iconBg)}>
                <HugeiconsIcon icon={Icon} className={cn("size-3.5", config.iconColor)} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug">{config.text(activity)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(activity.createdAt)}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
