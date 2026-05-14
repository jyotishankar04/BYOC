import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common/logo'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo href="/" />
      <div>
        <p className="font-semibold text-8xl text-muted-foreground/20 leading-none select-none">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/support">Get Support</Link>
        </Button>
      </div>
    </div>
  )
}
