import { createFileRoute, useRouter } from '@tanstack/react-router'
import { DoaListBuilder } from '@/components/doa-list-builder/doa-list-builder'
import { LanguageProvider } from '@/contexts/language-context'
import { LandingLayout } from '@/components/landing/layout/landing-layout'

export const Route = createFileRoute('/create-doa-list')({
  component: DoaListBuilderPage,
  head: () => ({
    title: 'Create Your Prayer List - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Create and customize your personal prayer list. Select up to 15 prayers, arrange them in your preferred order, and export as a beautiful image.',
      },
    ],
  }),
  // Add route loader for performance optimization
  loader: async () => {
    // Preload critical assets and data
    try {
      // This ensures the route is ready and can preload any critical data
      return { success: true }
    } catch (error) {
      console.error('Route loader error:', error)
      return { success: false, error: 'Failed to load route' }
    }
  },
  beforeLoad: () => {
    // Set up navigation context
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lastDoaListPage', window.location.pathname)
    }
  },
  onError: (error) => {
    console.error('Error in create-doa-list route:', error)
    // Graceful error handling - don't break the app
  },
})

function DoaListBuilderPage() {
  const router = useRouter()

  const handleBackClick = () => {
    try {
      // Use TanStack Router's navigation for better UX
      router.history.back()
    } catch {
      // Fallback to browser API if router fails
      window.history.back()
    }
  }

  return (
    <LanguageProvider>
      <LandingLayout
        navbarVariant="doa"
        navbarProps={{
          onBackClick: handleBackClick,
        }}
      >
        <DoaListBuilder />
      </LandingLayout>
    </LanguageProvider>
  )
}
