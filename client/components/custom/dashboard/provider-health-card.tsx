import { HugeiconsIcon } from "@hugeicons/react"
import { CloudServerIcon } from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function ProviderHealthCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Provider Health</CardTitle>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
            Healthy
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <HugeiconsIcon icon={CloudServerIcon} className="size-4 text-amber-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium">AWS S3</p>
            <p className="text-[11px] text-muted-foreground">ap-south-1</p>
          </div>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">Last checked 2 minutes ago</p>

        <Separator className="my-3" />

        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Permissions</p>
          <div className="flex flex-wrap gap-1.5">
            {["Read", "Write", "Delete"].map((perm) => (
              <Badge key={perm} variant="outline" className="text-[11px]">
                {perm}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
