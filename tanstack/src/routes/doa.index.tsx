import { createFileRoute } from '@tanstack/react-router'
import { DoaLibraryContent } from '@/components/doa/doa-library-content'
import { ShopeeReferralsClientSection } from '@/components/shopee/shopee-referrals-client-section'
import { getAllDoas } from '@/server-functions/dashboard/doa'
import {
  getSavedDoas,
  getSessionFromServer,
} from '@/server-functions/dashboard'

export const Route = createFileRoute('/doa/')({
  loader: async () => {
    const session = await getSessionFromServer()
    const user = session?.user

    const [doasResult, savedResult] = await Promise.allSettled([
      getAllDoas({ data: { limit: 100 } }),
      user ? getSavedDoas({ data: { userId: user.id } }) : Promise.resolve([]),
    ])

    if (doasResult.status === 'rejected') {
      throw doasResult.reason
    }

    const savedDoaSlugs =
      savedResult.status === 'fulfilled'
        ? savedResult.value.map((saved) => saved.doaSlug)
        : []

    if (savedResult.status === 'rejected') {
      console.error('Failed to fetch saved doas:', savedResult.reason)
    }

    return {
      doas: doasResult.value.data,
      savedDoaSlugs,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        : null,
    }
  },
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
  const { doas, savedDoaSlugs, user } = Route.useLoaderData()

  return (
    <>
      <DoaLibraryContent
        initialDoas={doas}
        initialSavedSlugs={savedDoaSlugs}
        user={user}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ShopeeReferralsClientSection />
      </div>
    </>
  )
}
