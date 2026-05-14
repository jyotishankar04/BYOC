import PublicPageLayout from '@/components/custom/layout/public-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicPageLayout>{children}</PublicPageLayout>
}
