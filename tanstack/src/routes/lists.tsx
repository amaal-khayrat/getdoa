import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import {
  getPublicLists,
  getSessionFromServer,
} from './dashboard/functions'
import { fetchShopeeReferrals } from '@/utils/shopee-fetch.server'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { LanguageProvider } from '@/contexts/language-context'
import { ListDiscoveryCard } from '@/components/list/list-discovery-card'
import { ListDiscoverySkeleton } from '@/components/list/list-discovery-skeleton'
import { ListFilterBar } from '@/components/list/list-filter-bar'
import { ListsEmptyState } from '@/components/list/lists-empty-state'
import { ListsPagination } from '@/components/list/lists-pagination'
import { ShopeeReferralsSection } from '@/components/shopee/shopee-referrals-section'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Search params schema for URL state
const listsSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  sort: z
    .enum(['newest', 'popular', 'favorites'])
    .optional()
    .default('newest'),
  q: z.string().optional().default(''),
})

export const Route = createFileRoute('/lists')({
  validateSearch: listsSearchSchema,

  // Server-side data loading - NO useEffect needed!
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    const session = await getSessionFromServer()

    // Fetch lists and shopee referrals in parallel
    // Use Promise.allSettled so shopee failure doesn't break the page
    const [listsResult, shopeeResult] = await Promise.allSettled([
      getPublicLists({
        data: {
          page: search.page,
          limit: 12,
          sortBy: search.sort,
          search: search.q,
          userId: session?.user?.id,
        },
      }),
      fetchShopeeReferrals({ count: 8 }),
    ])

    // Lists are required - throw if failed
    if (listsResult.status === 'rejected') {
      throw listsResult.reason
    }

    // Shopee referrals are optional - use empty array on failure
    // Map to only include url and ogData (component doesn't need error field)
    const shopeeReferrals =
      shopeeResult.status === 'fulfilled'
        ? shopeeResult.value.map(({ url, ogData }) => ({ url, ogData }))
        : []

    return {
      ...listsResult.value,
      isAuthenticated: !!session?.user,
      userId: session?.user?.id,
      shopeeReferrals,
    }
  },

  // Skeleton while loading
  pendingComponent: ListsPageSkeleton,

  component: ListsPage,

  head: ({ loaderData }) => {
    const count = loaderData?.total ?? 0
    return {
      title: 'Discover Prayer Lists - GetDoa',
      meta: [
        {
          name: 'description',
          content: `Browse ${count}+ curated prayer lists created by our community. Find and save your favorite doa collections.`,
        },
        { property: 'og:title', content: 'Discover Prayer Lists - GetDoa' },
        { property: 'og:type', content: 'website' },
        { name: 'robots', content: 'index, follow' },
      ],
    }
  },
})

function ListsPageSkeleton() {
  return (
    <LanguageProvider>
      <LandingLayout navbarVariant="doa">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <ListDiscoverySkeleton />
        </div>
      </LandingLayout>
    </LanguageProvider>
  )
}

function ListsPage() {
  const { lists, total, page, totalPages, isAuthenticated, userId, shopeeReferrals } =
    Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate()

  // URL-based state handlers - no useState needed for these!
  const handleSearchChange = (q: string) => {
    navigate({
      to: '/lists',
      search: { ...search, q, page: 1 }, // Reset to page 1 on search
      replace: true, // Don't add to history for every keystroke
    })
  }

  const handleSortChange = (sort: 'newest' | 'popular' | 'favorites') => {
    navigate({
      to: '/lists',
      search: { ...search, sort, page: 1 },
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      to: '/lists',
      search: { ...search, page: newPage },
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <LanguageProvider>
      <LandingLayout navbarVariant="doa">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-display mb-2">
              Discover Prayer Lists
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse curated doa collections from our community
            </p>
          </div>

          {/* Filter Bar with Search and Sort */}
          <ListFilterBar
            searchQuery={search.q}
            sortBy={search.sort}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
          />

          {/* Results */}
          {lists.length === 0 ? (
            <ListsEmptyState searchQuery={search.q} />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {total} list{total === 1 ? '' : 's'} found
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lists.map((list) => (
                  <ListDiscoveryCard
                    key={list.id}
                    list={list}
                    isAuthenticated={isAuthenticated}
                    userId={userId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <ListsPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}

          {/* CTA for unauthenticated users */}
          {!isAuthenticated && lists.length > 0 && (
            <div className="mt-12">
              <Card className="p-8 bg-primary/5 border-primary/20 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Create Your Own Prayer List
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sign up for free and start building your personalized doa
                  collection.
                </p>
                <Link to="/login" className={buttonVariants()}>
                  Get Started
                </Link>
              </Card>
            </div>
          )}

          {/* Shopee Referrals - loaded from server */}
          <ShopeeReferralsSection referrals={shopeeReferrals} />
        </div>
      </LandingLayout>
    </LanguageProvider>
  )
}
