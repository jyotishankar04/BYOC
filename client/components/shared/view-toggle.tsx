"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export function ViewToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border p-0.5">
      {(["grid", "list"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onViewModeChange(mode)}
          className={cn(
            "rounded p-1 transition-colors",
            viewMode === mode
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <HugeiconsIcon
            icon={mode === "grid" ? GridViewIcon : ListViewIcon}
            className="size-3.5"
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
