"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { MoreVerticalCircle01Icon } from "@hugeicons/core-free-icons"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function KebabTrigger({ className }: { className?: string }) {
  return (
    <DropdownMenuTrigger asChild>
      <button
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex size-6 items-center justify-center rounded-md text-muted-foreground",
          "transition-all hover:bg-accent hover:text-foreground focus:outline-none",
          className,
        )}
      >
        <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" strokeWidth={1.5} />
      </button>
    </DropdownMenuTrigger>
  )
}
