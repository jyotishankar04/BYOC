'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ArrowRight, Sparkles, ImageIcon, BarChart3, Users, Palette, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const STORAGE_KEY = 'bb-announcement-v0.7.0-dismissed'

const updates = [
  {
    icon: Palette,
    title: 'Workspace branding',
    description: 'Upload a custom logo and cover banner for each workspace from Workspace Settings.',
  },
  {
    icon: ImageIcon,
    title: 'User avatar upload',
    description: 'Click your profile picture in settings to upload a photo — stored in your own bucket.',
  },
  {
    icon: Sparkles,
    title: 'Default workspace logo',
    description: 'New accounts automatically use your Google profile photo as the workspace logo.',
  },
  {
    icon: BarChart3,
    title: 'Analytics auto-scaling units',
    description: 'Storage charts now show B / KB / MB / GB based on your actual data range.',
  },
  {
    icon: Users,
    title: 'Team plan for all beta users',
    description: 'Everyone gets Team-tier features — unlimited members, audit logs, integrations — during beta.',
  },
  {
    icon: Globe,
    title: 'Branded OG image & favicon',
    description: 'New dynamic Open Graph image and favicon using the BringBucket logo mark.',
  },
]

const ease = [0.25, 0.1, 0.25, 1] as const

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.05 } },
}

const modalVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, ease },
  },
  exit: {
    opacity: 0, y: 16, scale: 0.97,
    transition: { duration: 0.2, ease },
  },
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease } },
}

export default function AnnouncementBar() {
  const [barVisible, setBarVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function setVisible(v: boolean) { setBarVisible(v) }

  function dismiss(e: React.MouseEvent) {
    e.stopPropagation()
    localStorage.setItem(STORAGE_KEY, '1')
    setBarVisible(false)
    setModalOpen(false)
  }

  function openModal() { setModalOpen(true) }
  function closeModal() { setModalOpen(false) }

  return (
    <>
      {/* ── Floating bar ─────────────────────────────── */}
      <AnimatePresence>
        {barVisible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <button
              onClick={openModal}
              className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-background/90 px-4 py-2.5 shadow-xl backdrop-blur-md transition-shadow hover:shadow-2xl cursor-pointer"
            >
              {/* Badge */}
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                v0.7.0
              </span>

              <span className="text-muted-foreground/40 select-none">·</span>

              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Workspace branding, avatars &amp; Team plan for all beta users
              </span>

              <span className="ml-1 flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors group-hover:bg-secondary/80">
                See what&apos;s new
                <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>

              {/* Dismiss */}
              <span
                role="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="ml-1 rounded-md p-1 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                <X className="size-3.5" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border px-6 py-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      v0.7.0
                    </span>
                    <span className="text-xs text-muted-foreground">May 2026</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">
                    What&apos;s new in BringBucket
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Workspace branding, avatars &amp; Team plan for all beta users
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Update list */}
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-border/60 px-6 py-2"
              >
                {updates.map(({ icon: Icon, title, description }) => (
                  <motion.li
                    key={title}
                    variants={itemVariants}
                    className="flex gap-4 py-4"
                  >
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                      <Icon className="size-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <span className="text-xs text-muted-foreground">
                  More updates on the way ✦
                </span>
                <Link
                  href="/changelog"
                  onClick={closeModal}
                  className="group flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Full changelog
                  <ArrowRight className="size-3 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
