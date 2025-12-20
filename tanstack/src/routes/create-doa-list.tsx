import { createFileRoute } from '@tanstack/react-router'
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
})

function DoaListBuilderPage() {
  return (
    <LanguageProvider>
      <LandingLayout
        navbarVariant="doa"
        navbarProps={{
          onBackClick: () => window.history.back(),
        }}
      >
        <DoaListBuilder />
      </LandingLayout>
    </LanguageProvider>
  )
}
