import Link from 'next/link'
import { cn } from '@/lib/utils'

type LogoProps = {
  variant?: 'icon' | 'full'
  href?: string
  className?: string
}

export function Logo({
  variant = 'full',
  href = '/',
  className,
}: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <span className="text-sm font-bold">B</span>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight">
            BYOC
          </span>
          <span className="text-xs text-muted-foreground">
            Cloud Manager
          </span>
        </div>
      )}
    </div>
  )

  if (!href) return content

  return (
    <Link href={href} aria-label="BYOC Home">
      {content}
    </Link>
  )
}