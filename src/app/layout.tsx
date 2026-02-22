import type { Metadata, Viewport } from 'next'
import { Inter, Lora } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

// ─── Fonts ─────────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// ─── Metadata ──────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'PawHub — Pet Care & Community',
    template: '%s | PawHub',
  },
  description:
    "Track your pet's health, food, and vaccines. Connect with a community of pet owners.",
  keywords: ['pet care', 'pet tracking', 'dog health', 'cat health', 'pet community'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PawHub',
  },
  openGraph: {
    type: 'website',
    siteName: 'PawHub',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf8f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
}

// ─── Root Layout ───────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable}`}
    >
      <body className="font-sans" data-mood="idle">
        <Providers>
          {/* Compositor-thread ambient background — no JS cost */}
          <div className="ambient-bg" aria-hidden="true" />
          <div className="cursor-light" aria-hidden="true" />

          {children}
        </Providers>
      </body>
    </html>
  )
}
