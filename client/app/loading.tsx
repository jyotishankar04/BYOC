import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  )
}
