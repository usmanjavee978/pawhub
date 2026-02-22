'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

import { useNotifications, useMarkNotificationsRead, type NotificationWithActor } from '@/hooks/queries/use-notifications'
import { cn } from '@/lib/utils'

export function NotificationBell({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const { data: notifications = [] } = useNotifications(userId)
    const { mutate: markAsRead } = useMarkNotificationsRead()

    const unreadCount = notifications.filter(n => !n.is_read).length

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleOpen = () => {
        setIsOpen(!isOpen)
        if (!isOpen && unreadCount > 0) {
            markAsRead(userId)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className="p-2 rounded-full hover:bg-[hsl(var(--surface-overlay))] transition-colors relative"
            >
                <Bell size={20} className="text-[hsl(var(--foreground-muted))]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl shadow-[0_4px_24px_-12px_rgba(0,0,0,0.2)] z-50">
                    <div className="p-3 border-b border-[hsl(var(--border))]">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>

                    <div className="divide-y divide-[hsl(var(--border))]">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-[hsl(var(--foreground-muted))]">
                                No new notifications.
                            </div>
                        ) : (
                            notifications.map((n: NotificationWithActor) => {
                                const actorName = n.actor?.display_name || n.actor?.username || 'Someone'
                                let text = ''
                                let linkUrl = ''

                                if (n.type === 'like') {
                                    text = `liked your ${n.target_type}`
                                    linkUrl = n.target_type === 'question' ? `/community/${n.target_id}` : '#'
                                } else if (n.type === 'comment') {
                                    text = n.target_type === 'question' ? 'answered your question' : 'replied to your comment'
                                    linkUrl = `/community/${n.target_id}`
                                } else if (n.type === 'accepted_answer') {
                                    text = 'accepted your answer'
                                    linkUrl = `/community/${n.target_id}`
                                }

                                return (
                                    <Link
                                        key={n.id}
                                        href={linkUrl}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-start gap-3 p-3 hover:bg-[hsl(var(--surface-overlay))] transition-colors",
                                            !n.is_read ? "bg-[hsl(var(--accent))]/5" : ""
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--surface-overlay))] overflow-hidden shrink-0">
                                            {n.actor?.avatar_url ? (
                                                <Image src={n.actor.avatar_url} alt={actorName} width={32} height={32} className="object-cover w-full h-full" />
                                            ) : <span className="flex items-center justify-center w-full h-full text-xs">👤</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-semibold text-[hsl(var(--foreground))]">{actorName}</span>{' '}
                                                <span className="text-[hsl(var(--foreground-muted))]">{text}</span>
                                            </p>
                                            <p className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] shrink-0 mt-2" />}
                                    </Link>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
