import { createFileRoute } from '@tanstack/react-router'
import { DoaLibraryContent } from '@/components/doa/doa-library-content'

export const Route = createFileRoute('/doa/')({
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
  return <DoaLibraryContent />
}