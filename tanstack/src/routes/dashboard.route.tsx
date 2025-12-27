import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LanguageProvider } from '@/contexts/language-context'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { useSession } from '@/lib/auth-client'
import { useSpaceStore } from '@/stores/space-store'
import { Loader2 } from 'lucide-react'
import { getUserSpaces } from './dashboard/functions'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
  head: () => ({
    title: 'Dashboard - GetDoa',
    meta: [
      {
        name: 'description',
        content: 'Your personal prayer dashboard. Manage your doa lists and track your spiritual journey.',
      },
    ],
  }),
})

function DashboardLayout() {
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending } = useSession()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      navigate({ to: '/login' })
    }
  }, [isSessionPending, session, navigate])

  // Show loading while checking auth
  if (isSessionPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!session?.user) {
    return null
  }

  return (
    <LanguageProvider>
      <SpaceLoader userId={session.user.id}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SpaceLoader>
    </LanguageProvider>
  )
}

// Client-side space loader component
function SpaceLoader({ userId, children }: { userId: string; children: React.ReactNode }) {
  const navigate = useNavigate()
  const { spaces, setSpaces, isLoading, setLoading, isHydrated } = useSpaceStore()

  useEffect(() => {
    async function fetchSpaces() {
      if (!userId || spaces.length > 0) return

      setLoading(true)
      try {
        const userSpaces = await getUserSpaces({ data: { userId } })
        setSpaces(userSpaces)

        // Redirect to onboarding if no spaces
        if (userSpaces.length === 0) {
          navigate({ to: '/onboarding' })
        }
      } catch (error) {
        console.error('Failed to fetch spaces:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isHydrated) {
      fetchSpaces()
    }
  }, [userId, isHydrated, spaces.length, setSpaces, setLoading, navigate])

  if (isLoading || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your spaces...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
