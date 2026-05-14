import { PlusIcon } from 'lucide-react'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export const faqs = [
  {
    question: 'Does BringBucket store my files?',
    answer:
      'No. Your files stay entirely inside your own connected cloud storage bucket. BringBucket only provides the dashboard and management interface — we never receive, store, or process your file content.',
  },
  {
    question: 'How are my cloud credentials protected?',
    answer:
      'Your access keys and secrets are encrypted with AES-256-GCM before being saved. They are never logged, never exposed in API responses, and are only used transiently to fulfill requests to your cloud provider.',
  },
  {
    question: 'Which storage providers are supported?',
    answer:
      'AWS S3 and Cloudflare R2 are fully supported today. MinIO and Supabase Storage are available on Pro and above. Google Cloud Storage, Azure Blob Storage, DigitalOcean Spaces, Backblaze B2, and Wasabi are on the roadmap.',
  },
  {
    question: 'Can I disconnect my storage provider anytime?',
    answer:
      'Yes, at any time. Disconnecting removes your credentials from BringBucket. Your files remain intact in your own cloud bucket — nothing is deleted from your storage.',
  },
  {
    question: 'How is BringBucket different from Dropbox or Google Drive?',
    answer:
      'Dropbox and Google Drive host your data on their own servers and charge you per GB. BringBucket is a management layer — you bring your own storage (AWS S3, Cloudflare R2, etc.) and we provide the interface. You control the infrastructure, keep the data, and pay your cloud provider directly.',
  },
  {
    question: 'What happens to my files if I cancel my BringBucket plan?',
    answer:
      'Nothing. Since your files are stored in your own cloud bucket, they are completely unaffected. You can continue to access them directly through your cloud provider console at any time.',
  },
  {
    question: 'Does BringBucket support large file uploads?',
    answer:
      'Yes. BringBucket uses multipart upload for large files, allowing uploads of files that are many gigabytes in size. Progress is tracked in real time and uploads resume automatically on interruption where supported.',
  },
  {
    question: 'Can I share files with people who don\'t have an account?',
    answer:
      'Yes, on Pro and above. You can generate scoped pre-signed URLs for any file, giving time-limited access to specific objects without requiring the recipient to log in.',
  },
  {
    question: 'Is there a limit on how many files I can upload?',
    answer:
      'BringBucket does not impose any file count or storage limits. The limits are those of your cloud provider. You pay your provider for what you use — BringBucket never adds a storage markup.',
  },
  {
    question: 'Do you offer team or enterprise plans?',
    answer:
      'Yes. The Team plan ($29/month) supports shared workspaces, role-based access control, and activity logs. For larger organizations or custom requirements, contact us to discuss an Enterprise arrangement.',
  },
]

const FAQSection = () => {
  return (
    <section id="faq" className="px-6 py-20 md:py-28">
      <div className="mx-auto w-full max-w-2xl flex flex-col items-center">
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">FAQ</span>
        <h2 className="mt-6 font-semibold text-4xl tracking-tight text-center">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          Everything you need to know about BringBucket and how it works with your storage.
        </p>
        <div className="mt-10 w-full rounded-xl border border-border/65 bg-muted/40 p-1">
          <Accordion
            className="space-y-px rounded-lg border border-border/65 bg-border/20"
            collapsible
            defaultValue="question-0"
            type="single"
          >
            {faqs.map(({ question, answer }, index) => (
              <AccordionItem
                className="border-none bg-background px-4 first:rounded-t-lg last:rounded-b-lg"
                key={question}
                value={`question-${index}`}
              >
                <AccordionPrimitive.Header className="flex items-center">
                  <AccordionPrimitive.Trigger
                    className={cn(
                      'flex flex-1 items-center justify-between pt-4 pb-3 font-medium tracking-tight transition-all [&[data-state=open]>svg]:rotate-45',
                      'text-start text-base hover:text-foreground'
                    )}
                  >
                    {question}
                    <PlusIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
