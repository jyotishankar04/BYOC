'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const CTASection = () => {
  return (
    <div className="px-0 py-20 sm:px-6">
      <div className="relative flex w-full flex-col items-center justify-center py-16">
        <h2 className="font-medium text-5xl tracking-tighter">
          Your storage, your way.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-center text-muted-foreground text-xl/normal">
          Connect your first bucket in minutes — no migration, no vendor
          lock-in, no surprises. Start free, upgrade when you&apos;re ready.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button size={"lg"} asChild>
            <Link href="#">Get Started Free</Link>
          </Button>
          <Button size={"lg"} variant="outline" asChild>
            <Link href="#">View Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CTASection