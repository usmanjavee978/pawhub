import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Singleton pattern — one client instance per browser session
let client: ReturnType<typeof createSupabaseBrowserClient<Database>> | null = null

export function createBrowserClient() {
  if (client) return client

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase keys missing. App will run in "Preview Only" mode.')
    return createSupabaseBrowserClient<Database>('https://placeholder.supabase.co', 'placeholder')
  }

  client = createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return client
}
