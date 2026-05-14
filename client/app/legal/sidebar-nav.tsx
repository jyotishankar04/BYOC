'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const legalLinks = [
  { title: 'Privacy Policy', href: '/legal/privacy' },
  { title: 'Terms of Service', href: '/legal/terms' },
  { title: 'Cookie Policy', href: '/legal/cookies' },
  { title: 'Data Processing', href: '/legal/dpa' },
  { title: 'Security', href: '/legal/security' },
]

export function LegalSidebarNav() {
  const pathname = usePathname()
  return (
    <nav>
      <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to home
      </Link>
      <ul className="mt-8 space-y-1">
        {legalLinks.map(link => (
          <li key={link.href}>
            <Link href={link.href} className={cn(
              'block rounded-md px-3 py-1.5 text-sm transition-colors',
              pathname === link.href
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}>
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-muted-foreground">Last updated: May 2025</p>
    </nav>
  )
}
