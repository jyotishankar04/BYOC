import type { Metadata } from 'next'
import PublicPageLayout from '@/components/custom/layout/public-layout'

export const metadata: Metadata = {
  title: 'Pricing — BringBucket',
  description:
    'Simple, transparent pricing. Connect your own cloud storage and pay only for the features you need.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicPageLayout>{children}</PublicPageLayout>
}
