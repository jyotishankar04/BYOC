import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  FolderAddIcon,
  LinkSquare01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ACTIONS = [
  { label: "Upload File",           description: "Add files to your bucket",  icon: CloudUploadIcon,  href: "#" },
  { label: "Create Folder",         description: "Organize with folders",      icon: FolderAddIcon,    href: "#" },
  { label: "Generate Private Link", description: "Share files securely",       icon: LinkSquare01Icon, href: "#" },
  { label: "View Analytics",        description: "Storage insights",           icon: Analytics01Icon,  href: "#" },
] as const

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 pt-0">
        {ACTIONS.map((action) => (
          <Link key={action.label} href={action.href}>
            <div className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 active:scale-[0.98]">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={action.icon} className="size-4 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium leading-snug">{action.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
