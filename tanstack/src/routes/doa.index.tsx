import { createFileRoute } from '@tanstack/react-router'
import { fetchShopeeReferrals } from '@/utils/shopee-fetch.server'
import { DoaLibraryContent } from '@/components/doa/doa-library-content'
import { ShopeeReferralsSection } from '@/components/shopee/shopee-referrals-section'

export const Route = createFileRoute('/doa/')({
  loader: async () => {
    // Fetch shopee referrals - wrapped in try-catch so failure doesn't break the page
    try {
      const results = await fetchShopeeReferrals({ count: 8 })
      // Map to only include url and ogData (component doesn't need error field)
      return {
        shopeeReferrals: results.map(({ url, ogData }) => ({ url, ogData })),
      }
    } catch (error) {
      console.error('Failed to fetch shopee referrals:', error)
      return { shopeeReferrals: [] }
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
  const { shopeeReferrals } = Route.useLoaderData()

  return (
    <>
      <DoaLibraryContent />
      {/* Shopee Referrals - loaded from server */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <ShopeeReferralsSection referrals={shopeeReferrals} />
      </div>
    </>
  )
}
