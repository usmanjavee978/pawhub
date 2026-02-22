import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar userId={user.id} />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <div className="page-enter flex-1">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
