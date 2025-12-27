import { createFileRoute } from '@tanstack/react-router'
import { DoaImageGenerator } from '@/components/doa-image'

export const Route = createFileRoute('/dashboard/doa-image')({
  component: DoaImagePage,
  head: () => ({
    title: 'Create Doa Image - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Create beautiful shareable images of your favorite duas. Select a doa, choose a stunning background, and generate a ready-to-share image.',
      },
    ],
  }),
})

function DoaImagePage() {
  return (
    <div className="p-6">
      <DoaImageGenerator />
    </div>
  )
}
