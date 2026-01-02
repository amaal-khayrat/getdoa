import { createServerFn } from '@tanstack/react-start'

// Re-export profile functions
export * from './profile'
import { getRequest } from '@tanstack/react-start/server'
import { db } from '@/db'
import {
  doaList,
  doaListItem,
  savedDoa,
  favoriteList,
  exportLog,
  userListBonus,
  referral,
} from '@/db/schema'
import { eq, and, desc, sql, asc, or, ilike } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import {
  getListLimitInfo,
  type ListLimitInfo,
  type UserListBonusRecord,
} from '@/lib/list-limit'
import type {
  DoaListRecord,
  DoaListWithUser,
  DoaListWithUserAndItems,
  CreateDoaListInput,
  UpdateDoaListInput,
  SavedDoaRecord,
  CreateDoaListResult,
} from '@/types/doa-list.types'

// ============================================
// Auth Helper (internal use only)
// ============================================

async function requireAuth(expectedUserId?: string) {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  if (expectedUserId && session.user.id !== expectedUserId) {
    throw new Error('Unauthorized: User ID mismatch')
  }

  return session
}

// ============================================
// Session Server Function (for route loaders)
// ============================================

export const getSessionFromServer = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    return session
  },
)

// ============================================
// DOA LIST CRUD
// ============================================

// Get user's own lists with item count
export const getUserDoaLists = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<(DoaListRecord & { itemCount: number })[]> => {
    await requireAuth(data.userId)

    const lists = await db.query.doaList.findMany({
      where: eq(doaList.userId, data.userId),
      orderBy: [desc(doaList.updatedAt)],
      with: {
        items: {
          columns: { id: true },
        },
      },
    })

    return lists.map((list) => ({
      ...list,
      itemCount: list.items.length,
    }))
  })

// Check if user has any lists (for onboarding redirect)
export const checkUserHasDoaLists = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ hasLists: boolean }> => {
    await requireAuth(data.userId)

    const existingList = await db.query.doaList.findFirst({
      where: eq(doaList.userId, data.userId),
      columns: { id: true },
    })

    return { hasLists: !!existingList }
  })

// ============================================
// GET USER LIST LIMIT INFO
// ============================================
export const getUserListLimitInfo = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<ListLimitInfo> => {
    await requireAuth(data.userId)

    // Run all queries in parallel for performance
    const [listCountResult, referralCountResult, bonusesResult] =
      await Promise.all([
        // Count user's lists
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(doaList)
          .where(eq(doaList.userId, data.userId)),

        // Count user's successful referrals
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(referral)
          .where(eq(referral.referrerId, data.userId)),

        // Get user's bonus records
        db.query.userListBonus.findMany({
          where: eq(userListBonus.userId, data.userId),
        }),
      ])

    const currentListCount = listCountResult[0]?.count ?? 0
    const referralCount = referralCountResult[0]?.count ?? 0
    const bonuses = bonusesResult as UserListBonusRecord[]

    return getListLimitInfo(currentListCount, referralCount, bonuses)
  })

// Create new list (with limit checking)
export const createDoaList = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { userId: string; input: CreateDoaListInput }) => data,
  )
  .handler(async ({ data }): Promise<CreateDoaListResult> => {
    await requireAuth(data.userId)

    const { userId, input } = data

    // Use a transaction to prevent race conditions (TOCTOU)
    // This ensures the limit check and insert are atomic
    return await db.transaction(async (tx) => {
      // Fetch all data needed for limit check within transaction
      const [listCountResult, referralCountResult, bonusesResult] =
        await Promise.all([
          tx
            .select({ count: sql<number>`count(*)::int` })
            .from(doaList)
            .where(eq(doaList.userId, userId)),
          tx
            .select({ count: sql<number>`count(*)::int` })
            .from(referral)
            .where(eq(referral.referrerId, userId)),
          tx.query.userListBonus.findMany({
            where: eq(userListBonus.userId, userId),
          }),
        ])

      const currentCount = listCountResult[0]?.count ?? 0
      const referralCount = referralCountResult[0]?.count ?? 0
      const bonuses = bonusesResult as UserListBonusRecord[]

      const limitInfo = getListLimitInfo(currentCount, referralCount, bonuses)

      // Check limit
      if (!limitInfo.canCreate) {
        return {
          success: false as const,
          error: {
            code: 'LIST_LIMIT_REACHED' as const,
            message: `You've reached your list limit of ${limitInfo.limit}. Invite friends or upgrade to create more!`,
            currentCount: limitInfo.current,
            limit: limitInfo.limit,
            breakdown: limitInfo.breakdown,
          },
        }
      }

      // Insert the list
      const [newList] = await tx
        .insert(doaList)
        .values({
          userId,
          name: input.name,
          description: input.description,
          showTranslations: input.showTranslations ?? true,
          translationLayout: input.translationLayout ?? 'grouped',
          language: input.language ?? 'en',
          status: input.status ?? 'draft',
          visibility: input.visibility ?? 'private',
        })
        .returning()

      // Insert items if provided
      if (input.prayers && input.prayers.length > 0) {
        await tx.insert(doaListItem).values(
          input.prayers.map((p) => ({
            listId: newList.id,
            doaSlug: p.slug,
            order: p.order,
          })),
        )
      }

      return { success: true as const, list: newList }
    })
  })

// Get single list by ID
export const getDoaList = createServerFn({ method: 'GET' })
  .inputValidator((data: { listId: string; userId?: string }) => data)
  .handler(async ({ data }): Promise<DoaListWithUserAndItems | null> => {
    const list = await db.query.doaList.findFirst({
      where: eq(doaList.id, data.listId),
      with: {
        user: {
          columns: { id: true, name: true, image: true },
          with: {
            profile: {
              columns: {
                showAvatar: true,
                showFullName: true,
                displayName: true,
              },
            },
          },
        },
        items: {
          with: {
            doa: true,
          },
          orderBy: [asc(doaListItem.order)],
        },
      },
    })

    if (!list) return null

    // If private, only owner can view
    if (list.visibility === 'private') {
      if (!data.userId || list.userId !== data.userId) {
        return null
      }
    }

    // Increment view count for published public lists (non-blocking)
    if (list.status === 'published' && list.visibility === 'public') {
      db.update(doaList)
        .set({ viewCount: sql`${doaList.viewCount} + 1` })
        .where(eq(doaList.id, data.listId))
        .catch(() => {
          // Non-critical, ignore errors
        })
    }

    // Build the result with author privacy settings
    const authorPrivacy = list.user.profile
      ? {
          showAvatar: list.user.profile.showAvatar,
          showFullName: list.user.profile.showFullName,
          displayName: list.user.profile.displayName,
        }
      : {
          // Default privacy settings when profile doesn't exist
          showAvatar: true,
          showFullName: true,
          displayName: null,
        }

    return {
      ...list,
      user: {
        id: list.user.id,
        name: list.user.name,
        image: list.user.image,
      },
      authorPrivacy,
    } as DoaListWithUserAndItems
  })

// Update list
export const updateDoaList = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { listId: string; userId: string; input: UpdateDoaListInput }) =>
      data,
  )
  .handler(async ({ data }): Promise<DoaListRecord> => {
    await requireAuth(data.userId)

    const { listId, userId, input } = data

    // Verify ownership
    const existingList = await db.query.doaList.findFirst({
      where: and(eq(doaList.id, listId), eq(doaList.userId, userId)),
    })

    if (!existingList) {
      throw new Error('List not found')
    }

    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined)
      updateData.description = input.description
    if (input.showTranslations !== undefined)
      updateData.showTranslations = input.showTranslations
    if (input.translationLayout !== undefined)
      updateData.translationLayout = input.translationLayout
    if (input.language !== undefined) updateData.language = input.language
    if (input.status !== undefined) {
      updateData.status = input.status
      if (input.status === 'published' && !existingList.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (input.visibility !== undefined) updateData.visibility = input.visibility

    const [updatedList] = await db
      .update(doaList)
      .set(updateData)
      .where(eq(doaList.id, listId))
      .returning()

    // Update items if provided (delete all and re-insert)
    if (input.prayers !== undefined) {
      // Delete existing items
      await db.delete(doaListItem).where(eq(doaListItem.listId, listId))

      // Insert new items
      if (input.prayers.length > 0) {
        await db.insert(doaListItem).values(
          input.prayers.map((p) => ({
            listId,
            doaSlug: p.slug,
            order: p.order,
          })),
        )
      }
    }

    return updatedList
  })

// Delete list
export const deleteDoaList = createServerFn({ method: 'POST' })
  .inputValidator((data: { listId: string; userId: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId)

    const { listId, userId } = data

    // Verify ownership
    const existingList = await db.query.doaList.findFirst({
      where: and(eq(doaList.id, listId), eq(doaList.userId, userId)),
    })

    if (!existingList) {
      throw new Error('List not found')
    }

    await db.delete(doaList).where(eq(doaList.id, listId))

    return { success: true }
  })

// ============================================
// SAVED DUAS (Individual favorites)
// ============================================

export const getSavedDoas = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<SavedDoaRecord[]> => {
    await requireAuth(data.userId)

    const saved = await db.query.savedDoa.findMany({
      where: eq(savedDoa.userId, data.userId),
      orderBy: [desc(savedDoa.createdAt)],
    })

    return saved
  })

export const saveDoa = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; doaSlug: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId)

    try {
      await db.insert(savedDoa).values({
        userId: data.userId,
        doaSlug: data.doaSlug,
      })
      return { success: true }
    } catch {
      // Already saved (unique constraint)
      return { success: false }
    }
  })

export const unsaveDoa = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; doaSlug: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId)

    await db
      .delete(savedDoa)
      .where(
        and(
          eq(savedDoa.userId, data.userId),
          eq(savedDoa.doaSlug, data.doaSlug),
        ),
      )

    return { success: true }
  })

// Check if a doa is saved by user
export const isDoaSaved = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; doaSlug: string }) => data)
  .handler(async ({ data }): Promise<{ isSaved: boolean }> => {
    await requireAuth(data.userId)

    const saved = await db.query.savedDoa.findFirst({
      where: and(
        eq(savedDoa.userId, data.userId),
        eq(savedDoa.doaSlug, data.doaSlug),
      ),
    })

    return { isSaved: !!saved }
  })

// ============================================
// FAVORITE LISTS (Other users' lists)
// ============================================

export const getFavoriteLists = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<(DoaListWithUser & { itemCount: number })[]> => {
    await requireAuth(data.userId)

    const favorites = await db.query.favoriteList.findMany({
      where: eq(favoriteList.userId, data.userId),
      with: {
        list: {
          with: {
            user: {
              columns: { id: true, name: true, image: true },
            },
            items: {
              columns: { id: true },
            },
          },
        },
      },
      orderBy: [desc(favoriteList.createdAt)],
    })

    return favorites
      .filter(
        (f) => f.list.status === 'published' && f.list.visibility === 'public',
      )
      .map((f) => ({
        ...(f.list as DoaListWithUser),
        itemCount: f.list.items.length,
      }))
  })

export const addFavoriteList = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; listId: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId)

    // Verify list is public and published
    const list = await db.query.doaList.findFirst({
      where: and(
        eq(doaList.id, data.listId),
        eq(doaList.status, 'published'),
        eq(doaList.visibility, 'public'),
      ),
    })

    if (!list) {
      throw new Error('List not found or not public')
    }

    // Can't favorite own list
    if (list.userId === data.userId) {
      throw new Error('Cannot favorite your own list')
    }

    try {
      await db.insert(favoriteList).values({
        userId: data.userId,
        listId: data.listId,
      })

      // Increment favorite count
      await db
        .update(doaList)
        .set({ favoriteCount: sql`${doaList.favoriteCount} + 1` })
        .where(eq(doaList.id, data.listId))

      return { success: true }
    } catch {
      return { success: false }
    }
  })

export const removeFavoriteList = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; listId: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId)

    const result = await db
      .delete(favoriteList)
      .where(
        and(
          eq(favoriteList.userId, data.userId),
          eq(favoriteList.listId, data.listId),
        ),
      )
      .returning()

    if (result.length > 0) {
      // Decrement favorite count
      await db
        .update(doaList)
        .set({ favoriteCount: sql`${doaList.favoriteCount} - 1` })
        .where(eq(doaList.id, data.listId))
    }

    return { success: true }
  })

// Check if a list is favorited by user
export const isListFavorited = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; listId: string }) => data)
  .handler(async ({ data }): Promise<{ isFavorited: boolean }> => {
    await requireAuth(data.userId)

    const fav = await db.query.favoriteList.findFirst({
      where: and(
        eq(favoriteList.userId, data.userId),
        eq(favoriteList.listId, data.listId),
      ),
    })

    return { isFavorited: !!fav }
  })

// ============================================
// EXPORT TRACKING
// ============================================

export const logExport = createServerFn({ method: 'POST' })
  .inputValidator((data: { listId: string; userId?: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const request = getRequest()

    await db.insert(exportLog).values({
      listId: data.listId,
      userId: data.userId,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // Increment export count
    await db
      .update(doaList)
      .set({ exportCount: sql`${doaList.exportCount} + 1` })
      .where(eq(doaList.id, data.listId))

    return { success: true }
  })

// ============================================
// PUBLIC LIST DISCOVERY
// ============================================

// Types for public lists
export interface PublicListItem extends DoaListWithUser {
  itemCount: number
  isFavorited: boolean
  // Author privacy settings are always included in public lists
  authorPrivacy: {
    showAvatar: boolean
    showFullName: boolean
    displayName: string | null
  }
}

export interface PublicListsResult {
  lists: PublicListItem[]
  total: number
  page: number
  totalPages: number
}

// Get all public published lists for discovery
// NOTE: No auth required - this is a public endpoint
export const getPublicLists = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      page?: number
      limit?: number
      sortBy?: 'newest' | 'popular' | 'favorites'
      search?: string
      userId?: string // Optional: for checking favorites status
    }) => data,
  )
  .handler(async ({ data }): Promise<PublicListsResult> => {
    // Clamp and validate inputs
    const page = Math.max(1, data.page ?? 1)
    const limit = Math.min(50, Math.max(1, data.limit ?? 12)) // Clamp between 1-50
    const offset = (page - 1) * limit
    const sortBy = data.sortBy ?? 'newest'

    // Sanitize search input - trim and limit length
    const searchTerm = data.search?.trim().slice(0, 100) || ''

    try {
      // Build base conditions
      const baseConditions = and(
        eq(doaList.status, 'published'),
        eq(doaList.visibility, 'public'),
      )

      // Build where clause with optional search
      const whereClause = searchTerm
        ? and(
            baseConditions,
            or(
              ilike(doaList.name, `%${searchTerm}%`),
              ilike(doaList.description, `%${searchTerm}%`),
            ),
          )
        : baseConditions

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(doaList)
        .where(whereClause)

      const total = countResult?.count ?? 0

      // Early return if no results
      if (total === 0) {
        return {
          lists: [],
          total: 0,
          page: 1,
          totalPages: 0,
        }
      }

      // Determine sort order (COALESCE handles null publishedAt edge case)
      const orderByClause =
        sortBy === 'popular'
          ? [desc(doaList.viewCount)]
          : sortBy === 'favorites'
            ? [desc(doaList.favoriteCount)]
            : [desc(sql`COALESCE(${doaList.publishedAt}, ${doaList.createdAt})`)]

      // Get paginated results with user info and privacy settings
      const lists = await db.query.doaList.findMany({
        where: whereClause,
        orderBy: orderByClause,
        limit,
        offset,
        with: {
          user: {
            columns: { id: true, name: true, image: true },
            with: {
              profile: {
                columns: {
                  showAvatar: true,
                  showFullName: true,
                  displayName: true,
                },
              },
            },
          },
          items: {
            columns: { id: true },
          },
        },
      })

      // If user is authenticated, fetch their favorites in one query
      let favoritedListIds = new Set<string>()
      if (data.userId) {
        const userFavorites = await db.query.favoriteList.findMany({
          where: eq(favoriteList.userId, data.userId),
          columns: { listId: true },
        })
        favoritedListIds = new Set(userFavorites.map((f) => f.listId))
      }

      const totalPages = Math.ceil(total / limit)

      return {
        lists: lists.map((list) => ({
          ...list,
          user: {
            id: list.user.id,
            name: list.user.name,
            image: list.user.image,
          },
          // Include author's privacy settings
          authorPrivacy: list.user.profile
            ? {
                showAvatar: list.user.profile.showAvatar,
                showFullName: list.user.profile.showFullName,
                displayName: list.user.profile.displayName,
              }
            : {
                // Default privacy settings when profile doesn't exist
                showAvatar: true,
                showFullName: true,
                displayName: null,
              },
          itemCount: list.items.length,
          isFavorited: favoritedListIds.has(list.id),
        })),
        total,
        page: Math.min(page, totalPages), // Clamp page to valid range
        totalPages,
      }
    } catch (error) {
      console.error('Failed to fetch public lists:', error)
      throw new Error('Failed to fetch public lists')
    }
  })
