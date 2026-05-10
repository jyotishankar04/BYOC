"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CloudServerIcon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatsCards } from "@/components/custom/dashboard/home/stats-cards"
import { StorageUsageCard } from "@/components/custom/dashboard/home/storage-usage-card"
import { RecentFilesTable } from "@/components/custom/dashboard/home/recent-files-table"
import { QuickActions } from "@/components/custom/dashboard/home/quick-actions"
import { RecentActivity } from "@/components/custom/dashboard/home/recent-activity"
import { ProviderHealthCard } from "@/components/custom/dashboard/home/provider-health-card"
import { useWorkspace } from "@/lib/workspace-context"

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspace()
  const provider = currentWorkspace?.storage
  const ownerName = currentWorkspace?.owner ?? "there"

  return (
    <div className="space-y-6">
      {/* Welcome + Connected Provider */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Welcome back, {ownerName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your cloud files, storage usage, and provider settings from one place.
          </p>
        </div>
        {provider && (
          <Card className="w-full shrink-0 sm:w-auto">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <HugeiconsIcon icon={CloudServerIcon} className="size-4 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{provider.name}</span>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  >
                    {provider.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{provider.bucket} · {provider.region}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <StorageUsageCard />
          <RecentFilesTable />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
          <ProviderHealthCard />
        </div>
      </div>

      {/* Billing note */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4 px-4">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="mt-0.5 size-4 shrink-0 text-blue-500"
            strokeWidth={1.5}
          />
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              No storage charges from BYOC
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              BYOC does not charge for your storage usage. Storage and bandwidth costs are billed
              directly by your connected cloud provider (AWS S3).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
