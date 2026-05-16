import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — BringBucket',
  description: 'Read the terms and conditions governing the use of BringBucket services, including account responsibilities and usage limits.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div>
      <h1 className="font-semibold text-3xl tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Effective date: May 1, 2025</p>

      <Section title="Acceptance">
        <p>
          By accessing or using BringBucket (the "Service"), you agree to be bound by these Terms of
          Service ("Terms") and our{' '}
          <a href="/legal/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          . These Terms constitute a legally binding agreement between you and BringBucket, Inc.
          ("BringBucket", "we", "us", or "our").
        </p>
        <p>
          If you do not agree with any part of these Terms, you must not access or use the Service.
          Your continued use of the Service following any updates to these Terms constitutes
          acceptance of those changes.
        </p>
      </Section>

      <Section title="Account Registration">
        <p>
          To use BringBucket, you must create an account. By registering, you represent and warrant
          that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>You are at least 13 years of age.</li>
          <li>
            All information you provide during registration is accurate, current, and complete, and
            you will keep it up to date.
          </li>
          <li>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account.
          </li>
          <li>
            You will notify us immediately at{' '}
            <a href="mailto:support@bringbucket.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
              support@bringbucket.com
            </a>{' '}
            if you suspect any unauthorized use of your account.
          </li>
        </ul>
        <p>
          BringBucket reserves the right to suspend or terminate accounts that provide false
          information or that have been inactive for an extended period.
        </p>
      </Section>

      <Section title="Acceptable Use">
        <p>
          You agree to use BringBucket only for lawful purposes and in accordance with these Terms.
          You agree NOT to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Use the Service for any illegal activity, including but not limited to distributing
            malware, engaging in fraud, or violating export control laws.
          </li>
          <li>
            Upload, store, or transmit any content that contains viruses, trojans, worms, or other
            harmful or malicious code.
          </li>
          <li>
            Attempt to reverse-engineer, decompile, disassemble, or derive the source code of the
            BringBucket platform or any part thereof.
          </li>
          <li>
            Share your account credentials or provide access to the Service to any unauthorized
            third party.
          </li>
          <li>
            Circumvent, disable, or otherwise interfere with rate limits, access controls, or any
            security feature of the Service.
          </li>
          <li>
            Use the Service in any manner that infringes, misappropriates, or violates the
            intellectual property rights, privacy rights, or other rights of any third party.
          </li>
          <li>
            Use automated scripts, bots, or scrapers to access the Service in a manner that
            excessively burdens our infrastructure.
          </li>
          <li>
            Resell or sublicense access to the Service without our express written consent.
          </li>
        </ul>
        <p>
          Violation of this Acceptable Use policy may result in immediate suspension or termination
          of your account without refund.
        </p>
      </Section>

      <Section title="Your Storage Credentials">
        <p>
          To use BringBucket, you may provide cloud storage access credentials (such as AWS access
          keys or similar). By doing so, you represent and warrant that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            You have full authorization to connect the storage accounts you configure, whether as the
            account owner or as a user with delegated permission.
          </li>
          <li>
            The credentials you provide comply with any applicable policies of your cloud storage
            provider.
          </li>
        </ul>
        <p>
          BringBucket accesses your cloud storage solely to provide the specific Service features you
          request — such as listing files, uploading, downloading, or managing objects. We do not
          access your storage for any other purpose, and we do not retain copies of your files.
        </p>
        <p>
          Your credentials are encrypted at rest using AES-256-GCM and are never shared with third
          parties. You may disconnect any storage provider and delete your credentials at any time
          from your workspace settings.
        </p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          BringBucket and its licensors own all intellectual property rights in the Service,
          including but not limited to the platform, interface, software, documentation, trademarks,
          and trade dress. Nothing in these Terms grants you any right to use BringBucket's
          trademarks, logos, or other brand features without prior written consent.
        </p>
        <p>
          You retain all rights, title, and interest in and to your files, data, and content that
          you store in your connected cloud storage. BringBucket claims no ownership over your
          content and acquires no license to it other than what is strictly necessary to provide the
          Service to you.
        </p>
      </Section>

      <Section title="Disclaimer of Warranties">
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, BRINGBUCKET
          DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          BringBucket does not warrant that the Service will be uninterrupted, error-free, or free
          of harmful components, or that any defects will be corrected. You use the Service at your
          own risk. We strongly recommend maintaining your own backups of important data.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BRINGBUCKET, ITS
          DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
          LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING
          FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE.
        </p>
        <p>
          In any event, BringBucket's total cumulative liability to you for all claims arising out
          of or relating to the Service is limited to the total amount paid by you to BringBucket
          in the twelve (12) months immediately preceding the event giving rise to the claim.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion or limitation of certain warranties or
          liabilities, so the above limitations may not apply to you in full.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          BringBucket reserves the right to suspend or permanently terminate your access to the
          Service, with or without notice, if you violate these Terms or engage in conduct that we
          determine, in our sole discretion, to be harmful to other users, third parties, or the
          integrity of the Service.
        </p>
        <p>
          You may cancel your BringBucket account at any time through your account settings or by
          contacting{' '}
          <a href="mailto:support@bringbucket.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
            support@bringbucket.com
          </a>
          . Upon cancellation, your BringBucket account and associated metadata will be scheduled
          for deletion. Importantly, your files always remain in your own cloud storage — cancelling
          BringBucket has no effect on your cloud provider account or the files stored there.
        </p>
        <p>
          Provisions of these Terms that by their nature should survive termination will survive,
          including but not limited to Intellectual Property, Disclaimer of Warranties, Limitation
          of Liability, and Governing Law.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms and any dispute arising out of or in connection with them shall be governed by
          and construed in accordance with the laws of the State of Delaware, United States, without
          regard to its conflict of law provisions.
        </p>
        <p>
          You agree that any legal action or proceeding relating to these Terms or the Service shall
          be brought exclusively in the state or federal courts located in Delaware, and you
          irrevocably consent to the personal jurisdiction of those courts.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We reserve the right to modify these Terms at any time. If we make material changes, we
          will provide at least 14 days' notice by emailing the address associated with your account
          before the changes take effect.
        </p>
        <p>
          Minor or non-material changes (such as clarifications or corrections) may be made without
          prior notice, and the updated effective date will be reflected at the top of this page.
          Your continued use of the Service after changes take effect constitutes your acceptance of
          the revised Terms.
        </p>
        <p>
          If you have questions about these Terms, please contact us at{' '}
          <a href="mailto:legal@bringbucket.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
            legal@bringbucket.com
          </a>
          .
        </p>
      </Section>
    </div>
  )
}
