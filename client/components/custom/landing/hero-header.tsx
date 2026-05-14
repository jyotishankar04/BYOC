'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/common/logo'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { useSession } from '@/lib/auth-client'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CloudUploadIcon,
  FolderOpenIcon,
  Share01Icon,
  Analytics01Icon,
  CloudServerIcon,
  Shield01Icon,
  Home01Icon,
  BookOpen02Icon,
  Building04Icon,
  SourceCodeIcon,
  BookOpen01Icon,
  News01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  MessageQuestionIcon,
} from '@hugeicons/core-free-icons'

// ─── Types ─────────────────────────────────────────────────────────────────────

type DropdownItem = {
  icon: typeof CloudUploadIcon
  label: string
  description: string
  href: string
}

type NavItem =
  | { label: string; href: string; dropdown?: undefined }
  | { label: string; href: string; dropdown: DropdownItem[]; columns: 1 | 2 }

// ─── Nav data ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Features',
    href: '#features',
    columns: 2,
    dropdown: [
      { icon: CloudUploadIcon,      label: 'File Uploads',     description: 'Upload directly to your cloud bucket',   href: '#features'     },
      { icon: FolderOpenIcon,       label: 'Folders',          description: 'Organize files with nested folders',     href: '#features'     },
      { icon: Share01Icon,          label: 'File Sharing',     description: 'Generate expirable share links',         href: '#features'     },
      { icon: Analytics01Icon,      label: 'Analytics',        description: 'Track storage and bandwidth usage',      href: '#features'     },
      { icon: CloudServerIcon,      label: 'Multi-provider',   description: 'S3, R2, MinIO and more',                href: '#integrations' },
      { icon: Shield01Icon,         label: 'AES-256 Security', description: 'Credentials encrypted at rest',         href: '#security'     },
    ],
  },
  {
    label: 'Solutions',
    href: '#use-cases',
    columns: 2,
    dropdown: [
      { icon: Home01Icon,     label: 'Personal Cloud', description: 'Your files, your bucket',          href: '/use-cases/personal-cloud'         },
      { icon: BookOpen02Icon, label: 'Students',       description: 'Free tier for academic use',       href: '/use-cases/student-storage'        },
      { icon: Building04Icon, label: 'Startups',       description: 'Scale without vendor lock-in',    href: '/use-cases/startup-file-manager'   },
      { icon: SourceCodeIcon, label: 'Developers',     description: 'Asset hosting and CDN delivery',  href: '/use-cases/developer-asset-storage' },
    ],
  },
  {
    label: 'Resources',
    href: '/docs',
    columns: 1,
    dropdown: [
      { icon: BookOpen01Icon,        label: 'Documentation', description: 'Guides, concepts, and API reference',  href: '/docs'      },
      { icon: News01Icon,            label: 'Blog',          description: 'Product updates and tutorials',        href: '/blog'      },
      { icon: Clock01Icon,           label: 'Changelog',     description: "What's new in each release",           href: '/changelog' },
      { icon: CheckmarkCircle01Icon, label: 'Status',        description: 'System health and incidents',          href: '/status'    },
      { icon: MessageQuestionIcon,   label: 'Support',       description: 'Get help from our team',               href: '/support'   },
    ],
  },
  {
    label: 'Pricing',
    href: '/pricing',
  },
]

// ─── Dropdown panel ─────────────────────────────────────────────────────────────

function DropdownPanel({ items, columns }: { items: DropdownItem[]; columns: 1 | 2 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'absolute left-1/2 top-full mt-3 -translate-x-1/2',
        'overflow-hidden rounded-xl border bg-background/98 shadow-xl backdrop-blur-xl',
        columns === 2 ? 'min-w-[480px]' : 'min-w-[300px]',
      )}
    >
      {/* Top accent */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className={cn('p-2', columns === 2 && 'grid grid-cols-2 gap-0.5')}>
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/70"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
              <HugeiconsIcon icon={item.icon} className="size-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-none text-foreground">{item.label}</p>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

export const HeroHeader = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null)
  const pathname = usePathname()
  const { data: session } = useSession()
  const firstMobileItemRef = React.useRef<HTMLAnchorElement>(null)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null)
        if (menuOpen) setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  React.useEffect(() => {
    if (menuOpen) firstMobileItemRef.current?.focus()
  }, [menuOpen])

  const openMenu = (label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setActiveMenu(label)
  }

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setActiveMenu(null), 150)
  }

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }

  return (
    <header>
      {/* Backdrop scrim when any dropdown is open */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-10"
            onClick={() => setActiveMenu(null)}
          />
        )}
      </AnimatePresence>

      <nav role="navigation" aria-label="Main navigation" className="fixed z-20 w-full px-2">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
            (isScrolled || activeMenu)
              ? 'bg-background/90 max-w-4xl rounded-2xl border backdrop-blur-xl shadow-xs lg:px-5'
              : '',
          )}
        >
          <div className="relative flex items-center justify-between gap-6 py-3 lg:py-4">
            {/* Logo */}
            <Logo />

            {/* Desktop center nav */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex items-center gap-0.5 text-sm">
                {NAV_ITEMS.map((item) => (
                  <li key={item.label} className="relative">
                    {item.dropdown ? (
                      <div
                        onMouseEnter={() => openMenu(item.label)}
                        onMouseLeave={scheduleClose}
                        className="relative"
                      >
                        <button
                          className={cn(
                            'flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors',
                            activeMenu === item.label
                              ? 'bg-muted/60 text-foreground'
                              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                          )}
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              'size-3 transition-transform duration-200',
                              activeMenu === item.label && 'rotate-180',
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {activeMenu === item.label && (
                            <div
                              onMouseEnter={cancelClose}
                              onMouseLeave={scheduleClose}
                            >
                              <DropdownPanel
                                items={item.dropdown}
                                columns={item.columns}
                              />
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? 'page' : undefined}
                        className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden items-center gap-3 lg:flex">
              {session?.user ? (
                <Button asChild size="sm">
                  <Link href="/app">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="relative z-20 -m-2 p-2 lg:hidden"
            >
              <Menu
                className={cn(
                  'size-5 transition-all duration-200',
                  menuOpen && 'rotate-180 scale-0 opacity-0 absolute',
                )}
              />
              <X
                className={cn(
                  'size-5 transition-all duration-200',
                  !menuOpen && '-rotate-180 scale-0 opacity-0 absolute',
                )}
              />
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                id="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden lg:hidden"
              >
                <div className="border-t pb-6 pt-4">
                  <ul className="space-y-0.5">
                    {NAV_ITEMS.map((item, i) => (
                      <li key={item.label}>
                        <Link
                          ref={i === 0 ? firstMobileItemRef : undefined}
                          href={item.href}
                          aria-current={pathname === item.href ? 'page' : undefined}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {item.dropdown && (
                          <ul className="ml-3 mt-0.5 space-y-0.5">
                            {item.dropdown.map((sub) => (
                              <li key={sub.label}>
                                <Link
                                  href={sub.href}
                                  className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  <HugeiconsIcon icon={sub.icon} className="size-3.5 shrink-0" strokeWidth={1.5} />
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                    {session?.user ? (
                      <Button asChild size="sm">
                        <Link href="/app" onClick={() => setMenuOpen(false)}>
                          Go to Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                            Login
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
                            Get Started Free
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </nav>
    </header>
  )
}
