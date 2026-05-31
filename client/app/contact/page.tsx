'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { HugeiconsIcon } from '@hugeicons/react'
import { Mail02Icon, Clock01Icon, Building04Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

const infoCards = [
  {
    icon: Mail02Icon,
    title: 'Email support',
    text: 'support@bringbucket.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: Clock01Icon,
    title: 'Response time',
    text: 'Within 24 hours',
    sub: 'Monday–Friday, 9am–6pm UTC',
  },
  {
    icon: Building04Icon,
    title: 'Enterprise',
    text: 'enterprise@bringbucket.com',
    sub: 'Custom plans & SLAs available',
  },
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    const subjectLabel = subject || 'General Question'
    const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subjectLabel}\n\n${message}`
    window.location.href = `mailto:support@bringbucket.com?subject=${encodeURIComponent(`[${subjectLabel}] Contact form`)}&body=${encodeURIComponent(body)}`
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="max-w-xl">
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          Contact
        </span>
        <h1 className="mt-6 font-semibold text-4xl tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Have a question, found a bug, or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Question</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us how we can help…"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Message'}
          </Button>
        </form>

        {/* Info cards */}
        <div className="space-y-4">
          {infoCards.map((card) => (
            <div
              key={card.title}
              className="flex items-start gap-4 rounded-xl border bg-card p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary shrink-0">
                <HugeiconsIcon icon={card.icon} className="size-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium text-sm">{card.title}</p>
                <p className="mt-0.5 text-sm text-foreground">{card.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl border bg-muted/30 p-5 mt-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              For bug reports, please include your browser, OS, and steps to reproduce the issue.
              For billing questions, include your account email. We aim to respond to all inquiries
              within 24 business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
