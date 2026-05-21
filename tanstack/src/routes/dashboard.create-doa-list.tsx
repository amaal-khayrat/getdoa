import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import type { DoaItem } from '@/types/doa.types'
import type { ListStatus, ListVisibility } from '@/types/doa-list.types'
import type { ShopeeReferralItem } from '@/components/shopee/shopee-referrals-section'
import { DoaListBuilder } from '@/components/doa-list-builder/doa-list-builder'
import { ShopeeReferralsSection } from '@/components/shopee/shopee-referrals-section'
import { getDoaList } from '@/server-functions/dashboard'
import { getDoasBySlugs } from '@/server-functions/dashboard/doa'
import { getTemplateById } from '@/lib/list-templates'
import { fetchShopeeReferrals } from '@/utils/shopee-fetch.server'
import { DEFAULT_PREVIEW_SETTINGS } from '@/types/doa.types'

// Search params schema for creating/editing lists
const createDoaListSearchSchema = z.object({
  // For creating new list (from onboarding)
  name: z.string().optional(),
  template: z.string().optional(),
  // For editing existing list
  listId: z.string().optional(),
})

export type CreateDoaListSearch = z.infer<typeof createDoaListSearchSchema>

// Initial state for the builder (from route loader)
export interface BuilderInitialState {
  listId: string | null
  listName: string
  selectedPrayers: Array<DoaItem>
  listStatus: ListStatus
  listVisibility: ListVisibility
  previewSettings: {
    showTranslations: boolean
    translationLayout: 'grouped' | 'interleaved'
  }
}

async function loadShopeeReferrals(): Promise<Array<ShopeeReferralItem>> {
  try {
    const referrals = await fetchShopeeReferrals({ count: 8 })
    return referrals.map(({ url, ogData }) => ({ url, ogData }))
  } catch (error) {
    console.error('Failed to fetch shopee referrals:', error)
    return []
  }
}

export const Route = createFileRoute('/dashboard/create-doa-list')({
  validateSearch: createDoaListSearchSchema,
  loaderDeps: ({ search }) => ({
    listId: search.listId,
    template: search.template,
    name: search.name,
  }),
  loader: async ({ deps, context }) => {
    const { listId, template, name } = deps
    const shopeeReferralsPromise = loadShopeeReferrals()

    // Get user and access context from parent route
    const { user } = context as {
      user?: { id: string; name: string; email: string; image: string | null }
    }

    // EDIT MODE: Load existing list with all data
    if (listId && user) {
      const existingList = await getDoaList({
        data: { listId, userId: user.id },
      })

      if (!existingList) {
        // List not found - redirect to dashboard
        throw redirect({ to: '/dashboard' })
      }

      // Transform list items to DoaItem format IN THE LOADER
      const selectedPrayers: Array<DoaItem> = existingList.items.map(
        (item) => ({
          ...item.doa,
        }),
      )

      return {
        mode: 'edit' as const,
        initialState: {
          listId: existingList.id,
          listName: existingList.name,
          selectedPrayers,
          listStatus: existingList.status as ListStatus,
          listVisibility: existingList.visibility as ListVisibility,
          previewSettings: {
            showTranslations: existingList.showTranslations,
            translationLayout: existingList.translationLayout as
              | 'grouped'
              | 'interleaved',
          },
        } satisfies BuilderInitialState,
        shopeeReferrals: await shopeeReferralsPromise,
      }
    }

    // CREATE MODE: Load template prayers if specified
    let templatePrayers: Array<DoaItem> = []

    if (template && template !== 'empty') {
      const templateData = getTemplateById(template)
      if (templateData && templateData.doaSlugs.length > 0) {
        // Fetch template prayers from database IN THE LOADER
        const prayers = await getDoasBySlugs({
          data: { slugs: templateData.doaSlugs },
        })
        templatePrayers = prayers
      }
    }

    return {
      mode: 'create' as const,
      initialState: {
        listId: null,
        listName: name || '',
        selectedPrayers: templatePrayers,
        listStatus: 'draft' as const,
        listVisibility: 'private' as const,
        previewSettings: {
          showTranslations: DEFAULT_PREVIEW_SETTINGS.showTranslations,
          translationLayout: DEFAULT_PREVIEW_SETTINGS.translationLayout,
        },
      } satisfies BuilderInitialState,
      shopeeReferrals: await shopeeReferralsPromise,
    }
  },
  component: CreateDoaListPage,
  head: ({ loaderData }) => {
    const isEdit = loaderData?.mode === 'edit'
    return {
      title: isEdit
        ? `Edit ${loaderData.initialState.listName || 'List'} - GetDoa`
        : 'Create Your Prayer List - GetDoa',
      meta: [
        {
          name: 'description',
          content: isEdit
            ? 'Edit your prayer list and update your collection.'
            : 'Create and customize your personal prayer list. Select prayers, arrange them in your preferred order, and share your collection.',
        },
      ],
    }
  },
})

function CreateDoaListPage() {
  const { mode, initialState, shopeeReferrals } = Route.useLoaderData()

  return (
    <div className="p-0">
      <DoaListBuilder mode={mode} initialState={initialState} />
      <div className="mx-auto max-w-5xl px-4 pb-6 md:px-6">
        <ShopeeReferralsSection referrals={shopeeReferrals} />
      </div>
    </div>
  )
}
