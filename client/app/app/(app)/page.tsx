"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudServerIcon,
  InformationCircleIcon,
  UserAdd01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/custom/dashboard/home/stats-cards"
import { StorageUsageCard } from "@/components/custom/dashboard/home/storage-usage-card"
import { RecentFilesTable } from "@/components/custom/dashboard/home/recent-files-table"
import { QuickActions } from "@/components/custom/dashboard/home/quick-actions"
import { RecentActivity } from "@/components/custom/dashboard/home/recent-activity"
import { ProviderHealthCard } from "@/components/custom/dashboard/home/provider-health-card"
import { useWorkspace } from "@/lib/workspace-context"
import { useSession } from "@/lib/auth-client"
import { useDashboard } from "@/lib/analytics"
import {
  useMyInvites,
  useAcceptInviteFromList,
  useDeclineInviteFromList,
  type MyInvite,
} from "@/lib/members"
import { cn } from "@/lib/utils"

// ─── Per-invite action row ─────────────────────────────────────────────────────

function InviteActionRow({ invite }: { invite: MyInvite }) {
  const { data: session } = useSession()
  const userId = session?.user.id ?? ""
  const accept  = useAcceptInviteFromList(invite.workspaceId)
  const decline = useDeclineInviteFromList(invite.workspaceId)

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white",
        invite.workspace.color,
      )}>
        {invite.workspace.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invite.workspace.name}</p>
        {invite.invitedBy && (
          <p className="text-[11px] text-muted-foreground">
            Invited by <span className="font-medium text-foreground">{invite.invitedBy.name}</span>
          </p>
        )}
      </div>
      <Badge className="shrink-0 bg-amber-500/10 text-amber-600 text-[10px]">{invite.role}</Badge>
      <div className="flex shrink-0 gap-1.5">
        <Button
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => accept.mutate(userId)}
          disabled={accept.isPending || decline.isPending}
        >
          {accept.isPending ? (
            <HugeiconsIcon icon={Loading01Icon} className="size-3 animate-spin" strokeWidth={2} />
          ) : (
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3" strokeWidth={2} />
          )}
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          onClick={() => decline.mutate(userId)}
          disabled={accept.isPending || decline.isPending}
        >
          {decline.isPending ? (
            <HugeiconsIcon icon={Loading01Icon} className="size-3 animate-spin" strokeWidth={2} />
          ) : (
            <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
          )}
          Decline
        </Button>
      </div>
    </div>
  )
}

// ─── Pending invitations card ──────────────────────────────────────────────────

function PendingInvitationsCard() {
  const { data: invites = [] } = useMyInvites()
  if (invites.length === 0) return null

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardContent className="p-0">
        <div className="flex items-center gap-2.5 border-b px-4 py-3">
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4 text-primary" strokeWidth={1.5} />
          <p className="text-sm font-semibold">
            Pending workspace invitation{invites.length > 1 ? "s" : ""}
          </p>
          <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5">
            {invites.length}
          </Badge>
        </div>
        <div className="divide-y">
          {invites.map((invite) => (
            <InviteActionRow key={invite.id} invite={invite} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspace()
  const provider = currentWorkspace?.storage
  const ownerName = currentWorkspace?.owner ?? "there"
  const workspaceId = currentWorkspace?.id
  const { data: dashboard, isLoading } = useDashboard(workspaceId)

  return (
    <div className="space-y-6">
      <PendingInvitationsCard />

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <HugeiconsIcon icon={Loading01Icon} className="size-5 animate-spin text-muted-foreground" strokeWidth={2} />
        </div>
      ) : dashboard ? (
        <>
          {/* Stats */}
          <StatsCards
            totalFiles={dashboard.totalFiles}
            totalSize={dashboard.totalSize}
            activeShareLinks={dashboard.activeShareLinks}
            uploadsThisWeek={dashboard.uploadsThisWeek}
          />

          {/* Main content grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              <StorageUsageCard
                storageByKind={dashboard.storageByKind}
                totalSize={dashboard.totalSize}
              />
              <RecentFilesTable files={dashboard.recentFiles} />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <QuickActions />
              <RecentActivity activities={dashboard.recentActivity} />
              <ProviderHealthCard
                provider={dashboard.providerStatus}
                providerName={provider?.name}
                providerRegion={provider?.region}
              />
            </div>
          </div>
        </>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">Failed to load dashboard data</p>
      )}

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
