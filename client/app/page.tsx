import React from 'react'
import { HeroHeader } from '@/components/custom/landing/hero-header'
import HeroSection from '@/components/custom/landing/hero-section'
import TrustBar from '@/components/custom/landing/trust-bar'
import FeaturesSection from '@/components/custom/landing/features-section'
import IntegrationsSection from '@/components/custom/landing/integration-section'
import StepsSection from '@/components/custom/landing/integration-steps'
import SecurityFeatures from '@/components/custom/landing/security-section'
import UseCases from '@/components/custom/landing/use-case'
import Pricing from '@/components/custom/landing/pricing-section'
import FAQSection from '@/components/custom/landing/faq-section'
import TestimonialsSection from '@/components/custom/landing/testimonials-section'
import CTASection from '@/components/custom/landing/cta-section'
import Footer from '@/components/custom/landing/footer-section'
import AnnouncementBar from '@/components/custom/landing/announcement-bar'

export default function LandingPage() {
  return (
    <>
      <HeroHeader />
      <main id="main-content" className="w-full">
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <IntegrationsSection />
        <StepsSection />
        <SecurityFeatures />
        <UseCases />
        <Pricing />
        <FAQSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <AnnouncementBar />
    </>
  )
}
