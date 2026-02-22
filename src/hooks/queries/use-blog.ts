import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrowserClient } from '@/lib/supabase/client'
import type { BlogPost, Profile } from '@/types/database'

type BlogPostWithAuthor = BlogPost & {
    profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
}

export function useBlogPosts(category?: string, searchQuery?: string) {
    const supabase = createBrowserClient()

    return useQuery({
        queryKey: ['blog_posts', { category, searchQuery }],
        queryFn: async () => {
            let query = supabase
                .from('blog_posts')
                .select(`
          *,
          profiles:author_id(username, display_name, avatar_url)
        `)
                .eq('is_published', true)
                .order('published_at', { ascending: false })

            if (category && category !== 'all') {
                query = query.eq('category', category)
            }

            // Supabase's simple ILIKE search for title/excerpt
            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
            }

            const { data, error } = await query

            if (error) throw error
            return data as BlogPostWithAuthor[]
        },
    })
}

export function useUserBlogPosts() {
    const supabase = createBrowserClient()

    return useQuery({
        queryKey: ['blog_posts', 'me'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as BlogPost[]
        },
    })
}

export function useBlogPost(slug: string) {
    const supabase = createBrowserClient()

    return useQuery({
        queryKey: ['blog_post', slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select(`
          *,
          profiles:author_id(username, display_name, avatar_url)
        `)
                .eq('slug', slug)
                .single()

            if (error) throw error
            return data as BlogPostWithAuthor
        },
        enabled: !!slug,
    })
}

export function useCreateBlogPost() {
    const queryClient = useQueryClient()
    const supabase = createBrowserClient()

    return useMutation({
        mutationFn: async (postData: Partial<BlogPost> & { title: string; slug: string; content_text: string }) => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('blog_posts')
                .insert({
                    ...postData,
                    author_id: user.id,
                })
                .select()
                .single()

            if (error) throw error
            return data as BlogPost
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog_posts'] })
        },
    })
}

export function useUpdateBlogPost() {
    const queryClient = useQueryClient()
    const supabase = createBrowserClient()

    return useMutation({
        mutationFn: async ({ id, ...updateData }: Partial<BlogPost> & { id: string }) => {
            const { data, error } = await supabase
                .from('blog_posts')
                .update(updateData)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as BlogPost
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['blog_posts'] })
            queryClient.invalidateQueries({ queryKey: ['blog_post', data.slug] })
        },
    })
}

export function useDeleteBlogPost() {
    const queryClient = useQueryClient()
    const supabase = createBrowserClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog_posts'] })
        },
    })
}

export function useIncrementViewCount() {
    const supabase = createBrowserClient()

    return useMutation({
        mutationFn: async (id: string) => {
            // Typically need a postgres function for atomic increment if high concurrency, 
            // but simple RLS bypass / RPC is best. For now we will do a targeted RPC call or skip 
            // if we haven't defined an RPC. Let's assume we have an RPC or do a standard fetch-then-update.
            // Easiest is to try a direct update (if RLS allows) or use a raw RPC.

            // Checking the TRD, we didn't add a specific RPC for view_count increment. 
            // We will read current and write back. In production, an RPC is needed.
            const { data: current, error: fetchError } = await supabase
                .from('blog_posts')
                .select('view_count')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const { error } = await supabase
                .from('blog_posts')
                .update({ view_count: current.view_count + 1 })
                .eq('id', id)

            if (error) throw error
        },
    })
}
