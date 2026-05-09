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
    question: 'Do you store files?',
    answer:
      'No. Your files stay inside your own connected cloud storage bucket. BYOC only provides the dashboard and management layer.',
  },
  {
    question: 'Are credentials safe?',
    answer:
      'Yes. Cloud credentials are encrypted before saving and are only used to securely access your connected storage.',
  },
  {
    question: 'Which providers are supported?',
    answer:
      'AWS S3 is supported first. Google Cloud Storage, Azure Blob, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, Wasabi, and MinIO are planned.',
  },
  {
    question: 'Can I disconnect anytime?',
    answer:
      'Yes. You can disconnect your storage provider anytime. Your files will remain in your own cloud bucket.',
  },
]

const FAQSection = () => {
  return (
    <div className="px-6 py-20">
      <div className="mx-auto w-full max-w-2xl flex flex-col items-center">
        <h2 className="font-medium text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-muted-foreground ">
          Quick answers about how BYOC works with your storage.
        </p>
        <div className="mt-8 w-full rounded-xl border border-border/65 bg-muted p-1 sm:mt-10">
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
                      'flex flex-1 items-center justify-between pt-4 pb-3 font-medium tracking-tight transition-all hover:underline [&[data-state=open]>svg]:rotate-45',
                      'text-start text-lg'
                    )}
                  >
                    {question}
                    <PlusIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionContent className="text-base text-muted-foreground">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

export default FAQSection