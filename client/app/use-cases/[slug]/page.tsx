import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCases } from '@/components/custom/landing/use-cases-data'
import { faqs } from '@/components/custom/landing/faq-section'

interface PageProps {
  params: Promise<{ slug: string }>
}

function getUseCaseBySlug(slug: string) {
  const map: Record<string, string> = {
    'personal-cloud': 'item-1',
    'student-storage': 'item-2',
    'startup-file-manager': 'item-3',
    'developer-asset-storage': 'item-4',
  }
  const key = map[slug]
  return useCases.find((u) => u.key === key) ?? null
}

export async function generateStaticParams() {
  const map: Record<string, string> = {
    'personal-cloud': 'item-1',
    'student-storage': 'item-2',
    'startup-file-manager': 'item-3',
    'developer-asset-storage': 'item-4',
  }
  return Object.keys(map).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)
  return {
    title: `${useCase?.title ?? 'Use Case'} — BringBucket`,
  }
}

const benefitsMap: Record<string, string[]> = {
  'item-1': [
    'Store photos, videos, and backups in one place',
    'Access files from any device',
    'Your storage costs stay predictable',
    'Files never expire or get deleted without your action',
    'End-to-end encrypted credentials',
    'No per-file fees from BringBucket',
  ],
  'item-2': [
    'Files persist beyond graduation or trial expiration',
    'Pay your cloud provider directly — no SaaS markup',
    'Organize by course, semester, or project',
    'Share files with classmates via secure links',
    'Free plan covers all basic student needs',
    'Works with AWS free tier storage',
  ],
  'item-3': [
    'Give your whole team a shared file UI on your existing S3',
    'Role-based access: Owner, Admin, Member, Viewer',
    'Skip per-seat SaaS pricing — one flat interface fee',
    'Activity logs for compliance and auditing',
    'Connect multiple buckets for different projects',
    'Storage costs go directly to your cloud provider',
  ],
  'item-4': [
    'Browse S3 buckets without writing scripts',
    'Preview images, videos, and documents inline',
    'Monitor storage and bandwidth usage with cost estimates',
    'Share project assets with stakeholders via expiring links',
    'Audit access with activity logs',
    'Works with R2 for zero-egress asset delivery',
  ],
}

// FAQ indices: 0 (does BB store files), 1 (credentials security), 6 (large file uploads / no limit)
const faqIndices = [0, 1, 6]

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)

  if (!useCase) {
    notFound()
  }

  const benefits = benefitsMap[useCase.key] ?? []
  const selectedFaqs = faqIndices.map((i) => faqs[i]).filter(Boolean)

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      {/* 1. Hero */}
      <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
        {useCase.title}
      </span>

      <h1 className="mt-4 font-semibold text-4xl tracking-tight lg:text-5xl">
        {useCase.title}
      </h1>

      <p className="mt-4 max-w-xl text-muted-foreground">{useCase.description}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" asChild>
          <Link href="/auth/signup">Get Started Free</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/#pricing">View Pricing</Link>
        </Button>
      </div>

      {/* 2. Benefits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-12">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-start gap-3">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-5 text-primary shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <span className="text-sm text-muted-foreground">{benefit}</span>
          </div>
        ))}
      </div>

      {/* 3. Screenshot */}
      <div className="mt-16 rounded-2xl border overflow-hidden shadow-md bg-zinc-900">
        <Image
          src={useCase.image}
          alt={useCase.alt}
          width={1207}
          height={929}
          className="w-full object-cover"
        />
      </div>

      {/* 4. Mini FAQ */}
      <h2 className="mt-16 font-semibold text-2xl tracking-tight">
        Common questions
      </h2>

      <Accordion type="single" collapsible className="mt-6">
        {selectedFaqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index}`}>
            <AccordionTrigger className="text-start">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* 5. CTA strip */}
      <div className="mt-16 rounded-xl border bg-primary/5 p-10 text-center">
        <h2 className="font-semibold text-2xl tracking-tight">
          Ready to get started?
        </h2>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Connect your own cloud storage in minutes and manage it with a clean,
          modern interface — no vendor lock-in, no surprises.
        </p>
        <div className="mt-6">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Connect Your Cloud Free</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
