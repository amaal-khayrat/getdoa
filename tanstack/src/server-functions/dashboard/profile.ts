import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { db } from '@/db'
import { user, userProfile, doaList, favoriteList } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'

// ============================================
// Types
// ============================================

export interface PublicProfileData {
  userId: string
  displayName: string
  avatar: string | null
  bio: string | null
  showAvatar: boolean
  showFullName: boolean
  joinedAt: Date
  lists: {
    id: string
    name: string
    description: string | null
    itemCount: number
    language: string
    viewCount: number
    favoriteCount: number
    publishedAt: Date | null
  }[]
  favorites: {
    id: string
    name: string
    description: string | null
    itemCount: number
    language: string
    authorName: string
  }[] | null // null if showFavorites is false
}

export interface MyProfileData {
  userId: string
  name: string
  email: string
  image: string | null
  profile: {
    displayName: string | null
    bio: string | null
    profileVisibility: string
    showAvatar: boolean
    showFullName: boolean
    showFavorites: boolean
  }
}

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
// Helper Functions
// ============================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ============================================
// Public Profile (no auth required)
// ============================================

export const getPublicProfile = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<PublicProfileData | null> => {
    // Fetch user with profile
    const userData = await db.query.user.findFirst({
      where: eq(user.id, data.userId),
      columns: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
      with: {
        profile: true,
      },
    })

    if (!userData) return null

    // Check profile visibility (default to public if no profile record)
    const profile = userData.profile
    if (profile?.profileVisibility === 'private') {
      return null // Profile is private
    }

    // Determine display name based on privacy settings
    const showFullName = profile?.showFullName ?? true
    const displayName =
      profile?.displayName ??
      (showFullName ? userData.name : getInitials(userData.name))

    // Fetch user's public published lists
    const userLists = await db.query.doaList.findMany({
      where: and(
        eq(doaList.userId, data.userId),
        eq(doaList.status, 'published'),
        eq(doaList.visibility, 'public'),
      ),
      orderBy: [desc(doaList.publishedAt)],
      with: {
        items: {
          columns: { id: true },
        },
      },
    })

    // Fetch user's favorites if showFavorites is enabled
    let userFavorites: PublicProfileData['favorites'] = null
    if (profile?.showFavorites) {
      const favorites = await db.query.favoriteList.findMany({
        where: eq(favoriteList.userId, data.userId),
        orderBy: [desc(favoriteList.createdAt)],
        with: {
          list: {
            with: {
              user: {
                columns: { name: true },
              },
              items: {
                columns: { id: true },
              },
            },
          },
        },
      })

      // Filter to only public published lists
      userFavorites = favorites
        .filter(
          (f) =>
            f.list.status === 'published' && f.list.visibility === 'public',
        )
        .map((f) => ({
          id: f.list.id,
          name: f.list.name,
          description: f.list.description,
          itemCount: f.list.items.length,
          language: f.list.language,
          authorName: f.list.user.name,
        }))
    }

    return {
      userId: userData.id,
      displayName,
      avatar: (profile?.showAvatar ?? true) ? userData.image : null,
      bio: profile?.bio ?? null,
      showAvatar: profile?.showAvatar ?? true,
      showFullName,
      joinedAt: userData.createdAt,
      lists: userLists.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        itemCount: list.items.length,
        language: list.language,
        viewCount: list.viewCount,
        favoriteCount: list.favoriteCount,
        publishedAt: list.publishedAt,
      })),
      favorites: userFavorites,
    }
  })

// ============================================
// My Profile (auth required)
// ============================================

export const getMyProfile = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<MyProfileData> => {
    await requireAuth(data.userId)

    // Get user with profile
    const userData = await db.query.user.findFirst({
      where: eq(user.id, data.userId),
      with: {
        profile: true,
      },
    })

    if (!userData) throw new Error('User not found')

    // Return profile or defaults
    return {
      userId: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      profile: userData.profile ?? {
        displayName: null,
        bio: null,
        profileVisibility: 'public',
        showAvatar: true,
        showFullName: true,
        showFavorites: false,
      },
    }
  })

// ============================================
// Update Profile (auth required)
// ============================================

export const updateMyProfile = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      userId: string
      input: {
        displayName?: string | null
        bio?: string | null
        profileVisibility?: 'public' | 'private'
        showAvatar?: boolean
        showFullName?: boolean
        showFavorites?: boolean
      }
    }) => data,
  )
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId)

    const { userId, input } = data

    // Sanitize inputs
    const sanitizedDisplayName = input.displayName?.trim().slice(0, 100) || null
    const sanitizedBio = input.bio?.trim().slice(0, 500) || null

    // Upsert profile record
    await db
      .insert(userProfile)
      .values({
        userId,
        displayName: sanitizedDisplayName,
        bio: sanitizedBio,
        profileVisibility: input.profileVisibility ?? 'public',
        showAvatar: input.showAvatar ?? true,
        showFullName: input.showFullName ?? true,
        showFavorites: input.showFavorites ?? false,
      })
      .onConflictDoUpdate({
        target: userProfile.userId,
        set: {
          ...(input.displayName !== undefined && {
            displayName: sanitizedDisplayName,
          }),
          ...(input.bio !== undefined && { bio: sanitizedBio }),
          ...(input.profileVisibility !== undefined && {
            profileVisibility: input.profileVisibility,
          }),
          ...(input.showAvatar !== undefined && { showAvatar: input.showAvatar }),
          ...(input.showFullName !== undefined && {
            showFullName: input.showFullName,
          }),
          ...(input.showFavorites !== undefined && {
            showFavorites: input.showFavorites,
          }),
          updatedAt: new Date(),
        },
      })

    return { success: true }
  })
