'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase/client'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError('App keys missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-sm mx-auto space-y-8"
    >
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))]">Welcome back</h1>
        <p className="text-[hsl(var(--foreground-muted))] font-bold">
          Enter your details to sign in
        </p>
      </div>

      <div className="block-card p-8 space-y-6">
        <OAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[hsl(var(--border))]" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[hsl(var(--surface-raised))] px-2 text-[hsl(var(--foreground-muted))] font-bold">Or continue with</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-black uppercase tracking-wider text-[hsl(var(--foreground-muted))]" htmlFor="password">Password</label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--accent))] hover:text-[hsl(var(--accent-hover))]"
              >
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="input-block font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-game-primary w-full py-4 text-lg"
          >
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm font-bold text-[hsl(var(--foreground-muted))]">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-[hsl(var(--accent))] hover:underline"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  )
}
