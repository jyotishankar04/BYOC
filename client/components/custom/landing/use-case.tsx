'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Cloud, GraduationCap, Rocket, Code2 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'

type UseCaseKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'

export const useCases = [
  {
    key: 'item-1' as const,
    icon: Cloud,
    title: 'Personal cloud',
    short: 'Your photos, documents, and backups in one place',
    description:
      'Manage personal photos, documents, videos, and backups from one dashboard — your bucket, your rules, your data.',
    image: '/personal-cloud.png',
    alt: 'Personal cloud dashboard with photos and documents',
  },
  {
    key: 'item-2' as const,
    icon: GraduationCap,
    title: 'Student storage',
    short: 'Notes, PDFs, and projects that won’t disappear at semester end',
    description:
      'Store notes, PDFs, assignments, projects, and study materials securely. No paywall surprises, no expiring trials — just your own bucket.',
    image: '/student-view.png',
    alt: 'Student file dashboard with PDFs and notes',
  },
  {
    key: 'item-3' as const,
    icon: Rocket,
    title: 'Startup file manager',
    short: 'A file UI for your team, on top of cloud you already pay for',
    description:
      'Give small teams a simple file management layer over their own cloud storage. Skip the per-seat SaaS pricing — pay your provider, not a middleman.',
    image: '/startup-files.png',
    alt: 'Team file management dashboard',
  },
  {
    key: 'item-4' as const,
    icon: Code2,
    title: 'Developer asset storage',
    short: 'Project files, exports, and logs in a bucket you control',
    description:
      'Store project files, images, exports, logs, and app assets in your own bucket. Browse, preview, and audit usage without writing a custom dashboard.',
    image: '/developer-assets.png',
    alt: 'Developer asset browser with logs and exports',
  },
]

export default function UseCasesSection() {
  const [activeItem, setActiveItem] = useState<UseCaseKey>('item-1')
  const active = useCases.find((u) => u.key === activeItem) ?? useCases[0]

  return (
    <section className="py-12 md:py-20 lg:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
        {/* Header */}
        <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-6xl">
            Built for every kind of file
          </h2>
          <p className="text-muted-foreground">
            From a few personal photos to terabytes of project assets — BringBucket is
            the management layer over storage you already own.
          </p>
        </div>

        {/* Accordion + image */}
        <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
          <Accordion
            type="single"
            value={activeItem}
            onValueChange={(value) => value && setActiveItem(value as UseCaseKey)}
            className="w-full"
          >
            {useCases.map(({ key, icon: Icon, title, description }) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-base">
                    <Icon className="size-4" />
                    {title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>{description}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
            {/* Diagonal hatched right gutter */}
            <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]" />

            <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeItem}-id`}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md"
                >
                  <Image
                    src={active.image}
                    className="size-full object-cover object-left-top dark:mix-blend-lighten"
                    alt={active.alt}
                    width={1207}
                    height={929}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <BorderBeam
              duration={6}
              size={200}
              className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
            />
          </div>
        </div>
      </div>
    </section>
  )
}