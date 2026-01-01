import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { db } from '@/db'
import { referralCode, referral, user, userListBonus } from '@/db/schema'
import { eq, sql, desc, asc, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { generateReferralCode, isValidReferralCodeFormat } from '@/lib/referral'
import { getDisplayName, type DisplayPreference } from '@/lib/censor'
import { BONUS_TYPES, LIST_LIMIT_CONFIG } from '@/lib/list-limit'

// ============================================
// Auth Helper
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
// GET USER'S REFERRAL CODE
// ============================================
export const getUserReferralCode = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ code: string } | null> => {
    await requireAuth(data.userId)

    // Check if user already has a code
    let existing = await db.query.referralCode.findFirst({
      where: eq(referralCode.userId, data.userId),
    })

    // Generate one if not exists (lazy creation)
    if (!existing) {
      let code = generateReferralCode()
      let attempts = 0
      const MAX_ATTEMPTS = 10

      while (attempts < MAX_ATTEMPTS) {
        try {
          const [created] = await db
            .insert(referralCode)
            .values({
              userId: data.userId,
              code,
            })
            .returning()
          existing = created
          break
        } catch {
          // Collision, regenerate
          code = generateReferralCode()
          attempts++
        }
      }

      if (attempts >= MAX_ATTEMPTS) {
        console.error(`Failed to generate unique referral code for user ${data.userId}`)
        return null
      }
    }

    return existing ? { code: existing.code } : null
  })

// ============================================
// GET REFERRAL STATS (with pagination)
// ============================================
export interface ReferralStats {
  totalReferrals: number
  referrals: Array<{
    id: string
    referredUserName: string
    referredUserImage: string | null
    createdAt: Date
  }>
  hasMore: boolean
}

export const getReferralStats = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string; limit?: number; offset?: number }) => data)
  .handler(async ({ data }): Promise<ReferralStats> => {
    await requireAuth(data.userId)

    const { userId, limit = 10, offset = 0 } = data

    // Count total referrals
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referral)
      .where(eq(referral.referrerId, userId))

    const totalReferrals = countResult?.count ?? 0

    // Get paginated referrals with user info
    const referrals = await db.query.referral.findMany({
      where: eq(referral.referrerId, userId),
      with: {
        referredUser: {
          columns: { id: true, name: true, image: true },
        },
      },
      orderBy: [desc(referral.createdAt)],
      limit: limit + 1, // Fetch one extra to check hasMore
      offset,
    })

    const hasMore = referrals.length > limit
    const paginatedReferrals = hasMore ? referrals.slice(0, limit) : referrals

    return {
      totalReferrals,
      referrals: paginatedReferrals.map((r) => ({
        id: r.id,
        referredUserName: r.referredUser.name,
        referredUserImage: r.referredUser.image,
        createdAt: r.createdAt,
      })),
      hasMore,
    }
  })

// ============================================
// SYNC REFERRAL BONUS (internal helper)
// ============================================

// Type helper to extract transaction type from db.transaction
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * Sync the referral bonus record for a user.
 * This ensures the bonus amount matches the actual referral count (capped).
 * Uses transaction-safe operations to prevent race conditions.
 *
 * @param tx - Database transaction
 * @param userId - The user ID to sync bonus for
 */
async function syncReferralBonus(
  tx: DbTransaction,
  userId: string,
): Promise<void> {
  const { MAX_REFERRAL_BONUS, BONUS_PER_REFERRAL } = LIST_LIMIT_CONFIG

  // Count actual referrals
  const [countResult] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(referral)
    .where(eq(referral.referrerId, userId))

  const referralCount = countResult?.count ?? 0
  const bonusAmount = Math.min(
    referralCount * BONUS_PER_REFERRAL,
    MAX_REFERRAL_BONUS,
  )

  // Skip if no bonus to grant
  if (bonusAmount === 0) return

  const description =
    referralCount >= MAX_REFERRAL_BONUS
      ? `${referralCount} referrals (max bonus reached)`
      : `${referralCount} referral${referralCount === 1 ? '' : 's'}`

  // Find existing referral bonus (within transaction for consistency)
  const existingBonus = await tx.query.userListBonus.findFirst({
    where: and(
      eq(userListBonus.userId, userId),
      eq(userListBonus.bonusType, BONUS_TYPES.REFERRAL),
    ),
  })

  if (existingBonus) {
    // Update if amount changed
    if (existingBonus.amount !== bonusAmount) {
      await tx
        .update(userListBonus)
        .set({ amount: bonusAmount, description })
        .where(eq(userListBonus.id, existingBonus.id))
    }
  } else {
    // Create new bonus record
    await tx.insert(userListBonus).values({
      userId,
      bonusType: BONUS_TYPES.REFERRAL,
      amount: bonusAmount,
      description,
    })
  }
}

// ============================================
// PROCESS REFERRAL (after login)
// ============================================
export type ProcessReferralResult =
  | { success: true; message: string }
  | { success: false; message: string; code: 'INVALID_FORMAT' | 'ALREADY_REFERRED' | 'CODE_NOT_FOUND' | 'SELF_REFERRAL' | 'DB_ERROR' }

export const processReferral = createServerFn({ method: 'POST' })
  .inputValidator((data: { referredUserId: string; code: string }) => data)
  .handler(async ({ data }): Promise<ProcessReferralResult> => {
    await requireAuth(data.referredUserId)

    const { referredUserId, code: rawCode } = data
    const code = rawCode.toUpperCase()

    // Validate code format
    if (!isValidReferralCodeFormat(code)) {
      return { success: false, message: 'Invalid referral code format', code: 'INVALID_FORMAT' }
    }

    // Check if user was already referred
    const existingReferral = await db.query.referral.findFirst({
      where: eq(referral.referredUserId, referredUserId),
    })

    if (existingReferral) {
      return { success: false, message: 'You have already been referred', code: 'ALREADY_REFERRED' }
    }

    // Look up the referral code
    const codeRecord = await db.query.referralCode.findFirst({
      where: eq(referralCode.code, code),
    })

    if (!codeRecord) {
      return { success: false, message: 'Referral code not found', code: 'CODE_NOT_FOUND' }
    }

    // Can't refer yourself
    if (codeRecord.userId === referredUserId) {
      return { success: false, message: 'Cannot use your own referral code', code: 'SELF_REFERRAL' }
    }

    // Create the referral record and sync bonus in a transaction
    try {
      await db.transaction(async (tx) => {
        await tx.insert(referral).values({
          referrerId: codeRecord.userId,
          referredUserId,
          codeUsed: code,
        })

        // Sync the referral bonus for the referrer
        await syncReferralBonus(tx, codeRecord.userId)
      })
    } catch (err) {
      // Handle unique constraint violation (race condition)
      console.error('Failed to create referral:', err)
      return { success: false, message: 'Failed to process referral', code: 'DB_ERROR' }
    }

    return { success: true, message: 'Referral recorded successfully' }
  })

// ============================================
// CHECK IF USER WAS REFERRED
// ============================================
export const checkUserReferralStatus = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ wasReferred: boolean; referrerName?: string }> => {
    await requireAuth(data.userId)

    const existing = await db.query.referral.findFirst({
      where: eq(referral.referredUserId, data.userId),
      with: {
        referrer: {
          columns: { name: true },
        },
      },
    })

    return {
      wasReferred: !!existing,
      referrerName: existing?.referrer.name,
    }
  })

// ============================================
// GET PUBLIC LEADERBOARD (No auth required)
// ============================================
export interface LeaderboardEntry {
  rank: number
  displayName: string
  referralCount: number
  joinedAt: Date
}

export const getLeaderboard = createServerFn({ method: 'GET' })
  .inputValidator((data: { limit?: number }) => data)
  .handler(async ({ data }): Promise<LeaderboardEntry[]> => {
    const limit = data.limit ?? 30

    // Query users with referral counts, only those visible on leaderboard
    const results = await db
      .select({
        userId: referralCode.userId,
        code: referralCode.code,
        displayPreference: referralCode.displayPreference,
        createdAt: referralCode.createdAt,
        userName: user.name,
        userEmail: user.email,
        referralCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM referral
          WHERE referral.referrer_id = referral_code.user_id
        )`.as('referral_count'),
      })
      .from(referralCode)
      .innerJoin(user, eq(referralCode.userId, user.id))
      .where(eq(referralCode.leaderboardVisible, true))
      .orderBy(desc(sql`referral_count`), asc(referralCode.createdAt))
      .limit(limit)

    // Filter out users with 0 referrals and transform
    return results
      .filter((r) => r.referralCount > 0)
      .map((r, index) => ({
        rank: index + 1,
        displayName: getDisplayName(
          { name: r.userName, email: r.userEmail },
          r.displayPreference as DisplayPreference
        ),
        referralCount: r.referralCount,
        joinedAt: r.createdAt,
      }))
  })

// ============================================
// GET USER'S LEADERBOARD SETTINGS
// ============================================
export interface LeaderboardSettings {
  leaderboardVisible: boolean
  displayPreference: DisplayPreference
  currentRank: number | null
  previewName: string
}

export const getLeaderboardSettings = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<LeaderboardSettings | null> => {
    await requireAuth(data.userId)

    const codeRecord = await db.query.referralCode.findFirst({
      where: eq(referralCode.userId, data.userId),
    })

    if (!codeRecord) return null

    // Get user info for preview
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, data.userId),
      columns: { name: true, email: true },
    })

    if (!userRecord) return null

    // Calculate current rank if visible
    let currentRank: number | null = null
    if (codeRecord.leaderboardVisible) {
      const rankResult = await db.execute(sql`
        WITH ranked AS (
          SELECT
            user_id,
            RANK() OVER (ORDER BY (
              SELECT COUNT(*) FROM referral WHERE referral.referrer_id = referral_code.user_id
            ) DESC) as rank
          FROM referral_code
          WHERE leaderboard_visible = true
          AND (SELECT COUNT(*) FROM referral WHERE referral.referrer_id = referral_code.user_id) > 0
        )
        SELECT rank FROM ranked WHERE user_id = ${data.userId}
      `)
      currentRank = (rankResult.rows[0]?.rank as number) ?? null
    }

    return {
      leaderboardVisible: codeRecord.leaderboardVisible,
      displayPreference: codeRecord.displayPreference as DisplayPreference,
      currentRank,
      previewName: getDisplayName(
        { name: userRecord.name, email: userRecord.email },
        codeRecord.displayPreference as DisplayPreference
      ),
    }
  })

// ============================================
// UPDATE LEADERBOARD SETTINGS
// ============================================
export const updateLeaderboardSettings = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; leaderboardVisible: boolean; displayPreference: DisplayPreference }) => data)
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    await requireAuth(data.userId)

    await db
      .update(referralCode)
      .set({
        leaderboardVisible: data.leaderboardVisible,
        displayPreference: data.displayPreference,
      })
      .where(eq(referralCode.userId, data.userId))

    return { success: true }
  })
