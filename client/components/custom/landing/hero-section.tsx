'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroPreview from '@/components/custom/landing/hero-preview'
import { motion } from 'motion/react'
import { useSession } from '@/lib/auth-client'

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const easing = [0.25, 0.1, 0.25, 1] as const

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easing },
  },
}

const previewVariants = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: easing, delay: 0.45 },
  },
}

export default function HeroSection() {
  const { data: session } = useSession()
  const ctaHref = session?.user ? '/app' : '/auth/signup'

  return (
    <section className="relative">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative pt-28 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="max-w-3xl text-center sm:mx-auto lg:mr-auto lg:w-4/5"
          >
            <motion.div variants={itemVariants}>
              <Link
                href="#how-it-works"
                className="group rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3 transition-colors hover:bg-accent/50"
              >
                <span className="bg-primary/10 text-primary rounded-[calc(var(--radius)-0.25rem)] px-2 py-1 text-xs font-medium">
                  Now available
                </span>
                <span className="text-sm text-muted-foreground">
                  Connect AWS S3, Cloudflare R2, and more
                </span>
                <span className="bg-(--color-border) block h-4 w-px" />
                <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-8 text-balance text-4xl font-semibold tracking-tighter md:text-5xl xl:text-7xl xl:leading-[1.08]"
            >
              Your files.
              <br />
              <span className="text-primary">Your cloud.</span>
              <br />
              One simple dashboard.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 hidden max-w-2xl text-pretty text-lg text-muted-foreground sm:block"
            >
              BringBucket lets users connect their own S3-compatible storage and manage
              files, folders, billing insights, and access from one clean
              platform.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground sm:hidden"
            >
              Connect your own S3-compatible storage and manage everything from
              one dashboard.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button size="lg" asChild>
                <Link href={ctaHref}>
                  <Rocket className="size-4" />
                  {session?.user ? 'Go to Dashboard' : 'Connect Your Cloud'}
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href="/docs#getting-started">
                  See How It Works
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="mt-4 text-xs text-muted-foreground/70"
            >
              Free to start · No credit card required · Your data stays in your bucket
            </motion.p>
          </motion.div>

          <motion.div
            variants={previewVariants}
            initial="initial"
            animate="animate"
          >
            <HeroPreview />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
