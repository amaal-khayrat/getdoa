import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFromServer } from './dashboard/functions'
import { getImageLimitInfo } from './dashboard/functions/image-generator'
import { getAllDoas, getDoaCategories } from './dashboard/functions/doa'
import { DoaImageGenerator } from '@/components/doa-image'
import { ShopeeReferralsSection } from '@/components/shopee/shopee-referrals-section'
import { Skeleton } from '@/components/ui/skeleton'
import type { ShopeeOgData } from '@/types/shopee.types'

export const Route = createFileRoute('/dashboard/doa-image')({
  loader: async () => {
    const session = await getSessionFromServer()
    if (!session?.user) throw redirect({ to: '/login' })

    // Fetch all data in parallel for optimal performance
    const [limitInfo, doasResult, categories] = await Promise.all([
      getImageLimitInfo({ data: { userId: session.user.id } }),
      getAllDoas({ data: { limit: 100 } }),
      getDoaCategories(),
    ])

    return {
      limitInfo,
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
  const { limitInfo, prayers, categories } = Route.useLoaderData()

  // Shopee referrals state management
  const [shopeeReferrals, setShopeeReferrals] = useState<
    Array<{ url: string; ogData?: ShopeeOgData }>
  >([])
  const [shopeeError, setShopeeError] = useState<Error | null>(null)
  const [isShopeeLoading, setIsShopeeLoading] = useState(true)

  // Fetch shopee referrals when component mounts
  useEffect(() => {
    const fetchShopeeReferrals = async () => {
      setIsShopeeLoading(true)
      setShopeeError(null)

      try {
        const response = await fetch('/api/shopee-referrals?count=8')
        if (!response.ok) {
          throw new Error('Failed to fetch shopee referrals')
        }
        const data = await response.json()
        setShopeeReferrals(data.items || [])
      } catch (error) {
        console.error('Failed to fetch shopee referrals:', error)
        setShopeeError(
          error instanceof Error ? error : new Error('Unknown error'),
        )
      } finally {
        setIsShopeeLoading(false)
      }
    }

    fetchShopeeReferrals()
  }, [])

  const handleShopeeRetry = () => {
    setShopeeReferrals([])
    setShopeeError(null)
    setIsShopeeLoading(true)
    fetch('/api/shopee-referrals?count=8')
      .then((res) => res.json())
      .then((data) => {
        setShopeeReferrals(data.items || [])
        setIsShopeeLoading(false)
      })
      .catch((err) => {
        setShopeeError(
          err instanceof Error ? err : new Error('Unknown error'),
        )
        setIsShopeeLoading(false)
      })
  }

  return (
    <div className="p-4 md:p-6">
      <DoaImageGenerator
        initialLimitInfo={limitInfo}
        prayers={prayers}
        categories={categories}
      />
      <ShopeeReferralsSection
        referrals={shopeeReferrals}
        isLoading={isShopeeLoading}
        error={shopeeError || undefined}
        onRetry={handleShopeeRetry}
      />
    </div>
  )
}
