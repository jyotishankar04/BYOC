import { HeroHeader } from '@/components/custom/landing/hero-header'
import Footer from '@/components/custom/landing/footer-section'
import { LegalSidebarNav } from './sidebar-nav'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeroHeader />
      <div className="min-h-screen bg-background pt-16">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[200px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <LegalSidebarNav />
              </div>
            </aside>
            {/* Mobile nav */}
            <div className="lg:hidden mb-8">
              <LegalSidebarNav />
            </div>
            <main className="min-w-0 space-y-2">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
