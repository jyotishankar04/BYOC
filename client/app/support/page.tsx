'use client'
import { useState } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, MessageQuestionIcon } from '@hugeicons/core-free-icons'
import { faqs } from '@/components/custom/landing/faq-section'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/custom/common/empty-state'

export default function SupportPage() {
  const [query, setQuery] = useState('')
  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <div className="text-center">
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          Help Center
        </span>
        <h1 className="mt-6 font-semibold text-4xl tracking-tight">How can we help?</h1>
        <p className="mt-3 text-muted-foreground">
          Search our FAQ or browse common questions below.
        </p>
      </div>

      {/* Search */}
      <div className="relative mt-10">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder="Search questions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            icon={MessageQuestionIcon}
            title="No results found"
            description={`No questions match "${query}". Try different keywords or contact us directly.`}
          >
            <Button asChild variant="outline" size="sm">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </EmptyState>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filtered.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border bg-card px-4"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-xl border bg-card p-8 text-center">
        <h2 className="font-semibold text-xl">Still need help?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Our team is happy to help.
        </p>
        <Button asChild className="mt-5">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  )
}
