import type { Metadata } from 'next'
import PublicPageLayout from '@/components/custom/layout/public-layout'

export const metadata: Metadata = {
  title: 'Support — BringBucket',
  description: 'Find answers to common questions about BringBucket. Browse our FAQ or reach out for help managing your cloud storage.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicPageLayout>{children}</PublicPageLayout>
}
