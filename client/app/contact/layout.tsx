import type { Metadata } from 'next'
import PublicPageLayout from '@/components/custom/layout/public-layout'

export const metadata: Metadata = {
  title: 'Contact Us — BringBucket',
  description: 'Get in touch with the BringBucket team. We are here to help with any questions about our BYOC file management platform.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicPageLayout>{children}</PublicPageLayout>
}
