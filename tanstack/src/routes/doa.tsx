import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { DoaLibraryContent } from '@/components/doa/doa-library-content'
import { LanguageProvider } from '@/contexts/language-context'

export const Route = createFileRoute('/doa')({
  component: DoaLibraryPage,
  head: () => ({
    title: 'Doa Library - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Explore our comprehensive collection of authentic Islamic prayers and supplications with translations and references.',
      },
    ],
  }),
})

function DoaLibraryPage() {
  return (
    <LanguageProvider>
      <LandingLayout
        navbarVariant="doa"
        navbarProps={{
          onBackClick: () => window.history.back(),
        }}
      >
        <DoaLibraryContent />
      </LandingLayout>
    </LanguageProvider>
  )
}
