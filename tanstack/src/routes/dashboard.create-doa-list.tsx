import { createFileRoute } from '@tanstack/react-router'
import { DoaListBuilder } from '@/components/doa-list-builder/doa-list-builder'

export const Route = createFileRoute('/dashboard/create-doa-list')({
  component: CreateDoaListPage,
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

function CreateDoaListPage() {
  return (
    <div className="p-6">
      <DoaListBuilder />
    </div>
  )
}
