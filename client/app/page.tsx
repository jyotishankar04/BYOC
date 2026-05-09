'use client'

import React from 'react'
import { HeroHeader } from '@/components/custom/landing/hero-header'
import HeroSection from '@/components/custom/landing/hero-section'
import FeaturesSection from '@/components/custom/landing/features-section'
import IntegrationsSection from '@/components/custom/landing/integration-section'
import StepsSection from '@/components/custom/landing/integration-steps'
import SecurityFeatures from '@/components/custom/landing/security-section'
import UseCases from '@/components/custom/landing/use-case'
import Pricing from '@/components/custom/landing/pricing-section'
import FAQSection from '@/components/custom/landing/faq-section'
import CTASection from '@/components/custom/landing/cta-section'
import Footer from '@/components/custom/landing/footer-section'

export default function LandingPage() {
  return (
    <div className='w-full'>
      <HeroHeader />
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <StepsSection />
      <SecurityFeatures />
      <UseCases />
      <Pricing />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}
