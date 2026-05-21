import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFromServer } from '@/server-functions/dashboard'
import { getAllDoas, getDoaCategories } from '@/server-functions/dashboard/doa'
import { DoaImageGenerator } from '@/components/doa-image'
import { ShopeeReferralsClientSection } from '@/components/shopee/shopee-referrals-client-section'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/dashboard/doa-image')({
  loader: async () => {
    const session = await getSessionFromServer()
    if (!session?.user) throw redirect({ to: '/login' })

    const [doasResult, categories] = await Promise.all([
      getAllDoas({ data: { limit: 100 } }),
      getDoaCategories(),
    ])

    return {
      prayers: doasResult.data,
      categories,
    }
  },
  component: DoaImagePage,
  pendingComponent: DoaImagePageSkeleton,
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

function DoaImagePageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-96" />
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-125 lg:col-span-2" />
        <Skeleton className="h-125 lg:col-span-3" />
      </div>
    </div>
  )
}

function DoaImagePage() {
  const { prayers, categories } = Route.useLoaderData()

  return (
    <div className="p-4 md:p-6">
      <DoaImageGenerator prayers={prayers} categories={categories} />
      <div className="mx-auto max-w-5xl">
        <ShopeeReferralsClientSection />
      </div>
    </div>
  )
}
