import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { LanguageProvider } from '@/contexts/language-context'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  getSessionFromServer,
  getUserDoaLists,
  getUserListLimitInfo,
} from './dashboard/functions'
import { ReferralProcessor } from '@/components/referral-processor'
import { isAdminEmail } from '@/lib/admin'
import type { DoaListRecord } from '@/types/doa-list.types'
import type { ListLimitInfo } from '@/lib/list-limit'

// Extend route context type
declare module '@tanstack/react-router' {
  interface RouteContext {
    user?: {
      id: string
      name: string
      email: string
      image: string | null
    }
    lists?: DoaListRecord[]
    listLimitInfo?: ListLimitInfo
    isAdmin?: boolean
  }
}

export const Route = createFileRoute('/dashboard')({
  // beforeLoad puts data into context for child routes
  beforeLoad: async () => {
    const session = await getSessionFromServer()

    if (!session?.user) {
      throw redirect({ to: '/login' })
    }

    const user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image ?? null,
    }

    // Get list limit info - this goes into context for child routes
    const listLimitInfo = await getUserListLimitInfo({
      data: { userId: user.id },
    })

    // Check admin status server-side
    const isAdmin = isAdminEmail(user.email)

    // Return data to be available in context for child routes
    return { user, listLimitInfo, isAdmin }
  },
  // loader fetches data needed for this route's component
  loader: async ({ context }) => {
    const { user } = context as { user: { id: string } }

    // Load user's lists for dashboard display
    const lists = await getUserDoaLists({ data: { userId: user.id } })

    return { lists }
  },
  component: DashboardLayout,
  head: () => ({
    title: 'Dashboard - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Your personal prayer dashboard. Manage your doa lists and track your spiritual journey.',
      },
    ],
  }),
})

function DashboardLayout() {
  // user and isAdmin come from beforeLoad (context)
  const { user, isAdmin } = Route.useRouteContext()

  return (
    <LanguageProvider>
      {/* Process referral on dashboard mount */}
      <ReferralProcessor userId={user.id} />
      <SidebarProvider>
        <AppSidebar isAdmin={isAdmin} />
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
    </LanguageProvider>
  )
}
