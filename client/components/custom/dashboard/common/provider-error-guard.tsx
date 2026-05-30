"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudServerIcon, AlertCircleIcon, Settings01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import type { StorageProvider } from "@/lib/workspace-context"

interface ProviderErrorGuardProps {
  workspaceId: string
  storage: StorageProvider | null
}

export function ProviderErrorGuard({ workspaceId, storage }: ProviderErrorGuardProps) {
  const isError = !storage || storage.status === "Error"
  if (!isError) return null

  const noProvider = !storage
  const settingsUrl = `/app/workspaces/${workspaceId}/settings?section=storage`

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <HugeiconsIcon
          icon={noProvider ? CloudServerIcon : AlertCircleIcon}
          className="size-8 text-destructive"
          strokeWidth={1.5}
        />
      </div>

      <div className="max-w-sm space-y-2 text-center">
        <h2 className="text-base font-semibold">
          {noProvider ? "No storage connected" : "Storage connection failed"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {noProvider
            ? "Connect a cloud storage provider to start managing your files."
            : "The last health check could not reach your storage provider. Update your credentials and re-verify to restore access."}
        </p>
      </div>

      <Button asChild size="sm" className="gap-2">
        <Link href={settingsUrl}>
          <HugeiconsIcon icon={Settings01Icon} className="size-3.5" strokeWidth={1.5} />
          Go to Storage Settings
        </Link>
      </Button>
    </div>
  )
}
