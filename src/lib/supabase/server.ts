import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Used in Server Components, Server Actions, Route Handlers
export function createServerClient() {
  const cookieStore = cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return a dummy client that doesn't throw on creation
    return createSupabaseServerClient<Database>('https://placeholder.supabase.co', 'placeholder', {
      cookies: {
        getAll: () => [],
        setAll: () => { },
      }
    })
  }

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          const store = await cookieStore
          return store.getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore
            cookiesToSet.forEach(({ name, value, options }) =>
              store.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

// Helper: get the current user or null (never throws)
export async function getCurrentUser() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper: get user + full profile or redirect
export async function getAuthenticatedUser() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}
