'use client'

import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export function useSession() {
    const supabase = createBrowserClient()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
            setUser(data.user)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    return { user, loading }
}
