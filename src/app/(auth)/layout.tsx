import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Welcome',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* PawHub brand mark */}
      <Link href="/" className="flex items-center gap-2 mb-10 group">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-200">🐾</span>
        <span className="font-display text-3xl font-semibold text-[hsl(var(--foreground))]">
          PawHub
        </span>
      </Link>

      {/* Form card */}
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg">
          {children}
        </div>
      </div>

      <p className="mt-8 text-xs text-[hsl(var(--foreground-muted))]">
        Made with 🐾 for pet lovers everywhere
      </p>
    </div>
  )
}
