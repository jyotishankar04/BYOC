import { HeroHeader } from '@/components/custom/landing/hero-header'
import Footer from '@/components/custom/landing/footer-section'

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeroHeader />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
