'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase/client'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm mx-auto space-y-6 text-center"
      >
        <div className="p-6 rounded-[2rem] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] w-24 h-24 mx-auto flex items-center justify-center shadow-inner-lg border-2 border-[hsl(var(--accent))]/20">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-[hsl(var(--foreground))]">Check your email</h1>
          <p className="text-[hsl(var(--foreground-muted))] font-bold">
            We&apos;ve sent a confirmation link to <br />
            <span className="text-[hsl(var(--foreground))] underline decoration-wavy decoration-[hsl(var(--accent))]">{email}</span>.
          </p>
        </div>
        <Link href="/login" className="btn-game-ghost w-full">
          Back to login
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-sm mx-auto space-y-8"
    >
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))] leading-none">Create account</h1>
        <p className="text-[hsl(var(--foreground-muted))] font-bold">
          Start building your pet&apos;s digital home
        </p>
      </div>

      <div className="block-card p-8 space-y-6">
        <OAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[hsl(var(--border))]" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[hsl(var(--surface-raised))] px-2 text-[hsl(var(--foreground-muted))] font-bold">Or use email</span></div>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 text-sm font-bold rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-inner"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[hsl(var(--foreground-muted))] ml-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="input-block font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[hsl(var(--foreground-muted))] ml-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              className="input-block font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              min={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-game-primary w-full py-4 text-lg"
          >
            {loading ? 'Creating...' : 'Get Started'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm font-bold text-[hsl(var(--foreground-muted))]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[hsl(var(--accent))] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
