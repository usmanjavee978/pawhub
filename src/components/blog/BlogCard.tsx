import Link from 'next/link'
import Image from 'next/image'
import { Heart, Eye, MessageCircle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { BlogPost, Profile } from '@/types/database'

interface BlogCardProps {
    post: BlogPost & {
        profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
    }
}

export function BlogCard({ post }: BlogCardProps) {
    const hasCover = !!post.cover_image_url

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group block block-card-hover overflow-hidden h-full flex flex-col active:translate-y-1 active:shadow-[0_2px_0_0_hsl(var(--border-depth))] transition-all"
        >
            {hasCover ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[hsl(var(--surface-overlay))]">
                    <Image
                        src={post.cover_image_url!}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                        sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                    />
                    {/* Category Badge overlay on image */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-[hsl(var(--foreground))] uppercase tracking-widest shadow-sm border border-white/20 z-10">
                        {post.category}
                    </div>
                    {/* Inner shadow overlay for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_2px_12px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>
            ) : (
                <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-[hsl(var(--accent))]/10 to-[hsl(var(--secondary))]/10 flex items-center justify-center">
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-[hsl(var(--foreground))] uppercase tracking-widest shadow-sm border border-white/20">
                        {post.category}
                    </div>
                    <span className="text-4xl opacity-20 group-hover:scale-125 transition-transform duration-500 select-none">🐾</span>
                </div>
            )}

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-black text-[hsl(var(--foreground))] mb-3 line-clamp-2 leading-tight group-hover:text-[hsl(var(--accent))] transition-colors">
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p className="text-sm font-bold text-[hsl(var(--foreground-muted))] line-clamp-3 mb-6 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                {/* Footer info: Author, Date, Stats */}
                <div className="mt-auto pt-5 border-t border-[hsl(var(--border-depth))]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl overflow-hidden bg-[hsl(var(--surface-overlay))] border border-[hsl(var(--border))] shadow-inner">
                            {post.profiles?.avatar_url ? (
                                <Image
                                    src={post.profiles.avatar_url}
                                    alt={post.profiles.display_name || 'Author'}
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] font-black text-xs">
                                    {(post.profiles?.display_name || 'A')[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-[hsl(var(--foreground))] leading-none">
                                {post.profiles?.display_name || post.profiles?.username || 'Anonymous'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[hsl(var(--foreground-muted))]">
                            <Eye size={14} className="opacity-50" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{post.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[hsl(var(--foreground-muted))] group-hover:text-pink-500 transition-colors">
                            <Heart size={14} className="opacity-50 group-hover:opacity-100" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{post.like_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
