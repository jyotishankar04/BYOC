"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative max-w-xs flex-1">
      <HugeiconsIcon
        icon={Search01Icon}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
        strokeWidth={1.5}
      />
      <Input
        placeholder={placeholder ?? "Search..."}
        className="pl-8 h-7"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
