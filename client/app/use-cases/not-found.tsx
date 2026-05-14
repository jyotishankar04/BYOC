import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { File01Icon } from '@hugeicons/core-free-icons'
import { EmptyState } from '@/components/custom/common/empty-state'
import { Button } from '@/components/ui/button'

export default function UseCasesNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <EmptyState
        icon={File01Icon}
        title="Use case not found"
        description="We couldn't find that use case. Browse all available use cases below."
      >
        <Button asChild variant="outline">
          <Link href="/#use-cases">Browse Use Cases</Link>
        </Button>
      </EmptyState>
    </div>
  )
}
