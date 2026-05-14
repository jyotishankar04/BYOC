'use client'

import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PlanCtaButtonProps {
  plan: 'free' | 'pro' | 'team'
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  label?: string
}

export function PlanCtaButton({
  plan,
  variant = 'default',
  size = 'sm',
  className,
  label,
}: PlanCtaButtonProps) {
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user

  const href = isLoggedIn
    ? plan === 'free'
      ? '/app'
      : '/app/billing'
    : plan === 'free'
      ? '/auth/signup'
      : `/auth/signup?plan=${plan}`

  const defaultLabel = isLoggedIn
    ? plan === 'free'
      ? 'Go to Dashboard'
      : 'Upgrade Now'
    : plan === 'free'
      ? 'Get Started Free'
      : 'Get Started'

  if (isPending) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        {label ?? defaultLabel}
      </Button>
    )
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>{label ?? defaultLabel}</Link>
    </Button>
  )
}
