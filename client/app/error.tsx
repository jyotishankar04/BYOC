'use client'

import { useEffect } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <HugeiconsIcon icon={Alert01Icon} className="size-6 text-destructive" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex gap-2">
          <Button onClick={reset} variant="outline" size="sm">
            Try again
          </Button>
          <Button asChild size="sm">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
