import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Inter, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/common/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const interHeading = Inter({subsets:['latin'],variable:'--font-heading'});

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bringbucket.com'),
  title: {
    default: 'BringBucket — Bring Your Own Cloud',
    template: '%s | BringBucket',
  },
  description: 'Connect your own S3-compatible cloud storage and manage your files from one place. No vendor lock-in. No data on our servers.',
  keywords: ['S3', 'cloud storage', 'file manager', 'BYOC', 'Cloudflare R2', 'AWS S3', 'self-hosted'],
  authors: [{ name: 'BringBucket' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bringbucket.com',
    siteName: 'BringBucket',
    title: 'BringBucket — Bring Your Own Cloud',
    description: 'Connect your own S3-compatible cloud storage and manage your files from one place.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BringBucket' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BringBucket — Bring Your Own Cloud',
    description: 'Connect your own S3-compatible cloud storage and manage your files from one place.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, jetbrainsMono.variable, interHeading.variable, "font-sans", inter.variable)}
    >

      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
        >
          Skip to main content
        </a>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
