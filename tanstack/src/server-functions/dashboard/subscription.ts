import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { db } from '@/db'
import { userSubscription, subscriptionEvent, userListBonus } from '@/db/schema'
import { eq, and, desc, sql, type SQL } from 'drizzle-orm'
import { user } from '@/db/schema/auth'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import {
  createSubscription,
  cancelSubscription as rzpCancel,
} from '@/lib/razorpay'
import {
  SUBSCRIPTION_CONFIG,
  hasPremiumAccess,
  isTestMode,
  type SubscriptionInfo,
  type SubscriptionStatus,
} from '@/lib/subscription'
import { BONUS_TYPES, LIST_LIMIT_CONFIG } from '@/lib/list-limit'

// ============================================
// Auth Helper
// ============================================
async function requireAuth() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  return session
}

/**
 * Check if user can access subscription features.
 * In test mode, only admins can subscribe.
 */
async function canAccessSubscription(email: string): Promise<boolean> {
  if (!isTestMode()) return true
  return isAdminEmail(email)
}

// ============================================
// GET SUBSCRIPTION STATUS
// ============================================
export const getSubscriptionStatus = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<SubscriptionInfo> => {
    await requireAuth()

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
    })

    if (!subscription) {
      return {
        isSubscribed: false,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        planName: null,
        isAdminGranted: false,
        adminGrantedBy: null,
      }
    }

    const isAdminGranted = subscription.isAdminGranted
    return {
      isSubscribed: hasPremiumAccess(subscription.status as SubscriptionStatus, isAdminGranted),
      status: subscription.status as SubscriptionStatus,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      planName: SUBSCRIPTION_CONFIG.PREMIUM_MONTHLY.name, // From config, not DB
      isAdminGranted,
      adminGrantedBy: subscription.adminGrantedBy,
    }
  })

// ============================================
// CHECK PREMIUM ACCESS (lightweight check)
// ============================================
export const checkPremiumAccess = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ isPremium: boolean; isAdminGranted: boolean }> => {
    await requireAuth()

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
      columns: { status: true, isAdminGranted: true },
    })

    const isAdminGranted = subscription?.isAdminGranted ?? false
    const isPremium = hasPremiumAccess(
      subscription?.status as SubscriptionStatus | null,
      isAdminGranted,
    )

    return { isPremium, isAdminGranted }
  })

// ============================================
// CREATE SUBSCRIPTION
// ============================================
type CreateSubscriptionResult =
  | { success: true; subscriptionId: string; shortUrl: string }
  | { success: false; error: { code: string; message: string } }

export const createUserSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<CreateSubscriptionResult> => {
    const session = await requireAuth()

    // Check test mode access
    if (!(await canAccessSubscription(session.user.email))) {
      return {
        success: false,
        error: {
          code: 'TEST_MODE_RESTRICTED',
          message: 'Subscriptions are currently in testing. Please check back soon!',
        },
      }
    }

    // Check for existing active subscription
    const existing = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
    })

    if (existing && hasPremiumAccess(existing.status as SubscriptionStatus, existing.isAdminGranted)) {
      return {
        success: false,
        error: {
          code: 'ALREADY_SUBSCRIBED',
          message: 'You already have an active subscription.',
        },
      }
    }

    // Get plan ID from environment variable
    const razorpayPlanId = process.env.RAZORPAY_PLAN_ID
    if (!razorpayPlanId) {
      console.error('RAZORPAY_PLAN_ID not configured')
      return {
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Subscription service is not configured.',
        },
      }
    }

    try {
      // Create Razorpay subscription
      // Note: customerNotify must be 0 or 1, not boolean
      const rzpSubscription = await createSubscription({
        planId: razorpayPlanId,
        totalCount: 1200, // ~100 years of monthly billing
        customerNotify: 1, // 1 = Razorpay sends notifications
        notes: {
          userId: data.userId,
          userEmail: session.user.email,
        },
      })

      // Store in database
      await db.transaction(async (tx) => {
        // Remove existing subscription record if any
        if (existing) {
          await tx.delete(userSubscription).where(eq(userSubscription.id, existing.id))
        }

        // Create new subscription record
        const [newSub] = await tx
          .insert(userSubscription)
          .values({
            userId: data.userId,
            razorpaySubscriptionId: rzpSubscription.id,
            razorpayCustomerId: rzpSubscription.customer_id || null,
            razorpayPlanId: razorpayPlanId, // Store for reference
            status: 'created',
            shortUrl: rzpSubscription.short_url,
            razorpayData: rzpSubscription as unknown as Record<string, unknown>,
          })
          .returning()

        // Log event
        await tx.insert(subscriptionEvent).values({
          subscriptionId: newSub.id,
          event: 'subscription.created',
          newStatus: 'created',
          payload: rzpSubscription as unknown as Record<string, unknown>,
        })
      })

      return {
        success: true,
        subscriptionId: rzpSubscription.id,
        shortUrl: rzpSubscription.short_url,
      }
    } catch (error) {
      console.error('Failed to create subscription:', error)
      return {
        success: false,
        error: {
          code: 'RAZORPAY_ERROR',
          message: 'Failed to create subscription. Please try again.',
        },
      }
    }
  })

// ============================================
// CANCEL SUBSCRIPTION
// ============================================
// Note: Users can only SUBSCRIBE or CANCEL.
// No pause/resume functionality exposed to users.
// (Pause/resume webhooks still handled in case admin does it from Razorpay Dashboard)

type CancelSubscriptionResult =
  | { success: true }
  | { success: false; error: { code: string; message: string } }

export const cancelUserSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; cancelImmediately?: boolean }) => data)
  .handler(async ({ data }): Promise<CancelSubscriptionResult> => {
    await requireAuth()

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
    })

    if (!subscription) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'No subscription found.' },
      }
    }

    if (!hasPremiumAccess(subscription.status as SubscriptionStatus, subscription.isAdminGranted)) {
      return {
        success: false,
        error: { code: 'NOT_ACTIVE', message: 'Subscription is not active.' },
      }
    }

    try {
      // Cancel in Razorpay
      const cancelAtCycleEnd = !data.cancelImmediately
      await rzpCancel(subscription.razorpaySubscriptionId, cancelAtCycleEnd)

      // Update database
      await db.transaction(async (tx) => {
        await tx
          .update(userSubscription)
          .set({
            cancelAtPeriodEnd: cancelAtCycleEnd,
            cancelledAt: data.cancelImmediately ? new Date() : null,
            status: data.cancelImmediately ? 'cancelled' : subscription.status,
          })
          .where(eq(userSubscription.id, subscription.id))

        await tx.insert(subscriptionEvent).values({
          subscriptionId: subscription.id,
          event: data.cancelImmediately
            ? 'subscription.cancelled'
            : 'subscription.cancel_scheduled',
          previousStatus: subscription.status,
          newStatus: data.cancelImmediately ? 'cancelled' : subscription.status,
        })

        // If immediate cancellation, deactivate subscription bonus
        if (data.cancelImmediately) {
          await tx
            .update(userListBonus)
            .set({ isActive: false })
            .where(
              and(
                eq(userListBonus.userId, data.userId),
                eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
              ),
            )
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      return {
        success: false,
        error: { code: 'RAZORPAY_ERROR', message: 'Failed to cancel subscription.' },
      }
    }
  })

// ============================================
// CHECK TEST MODE ACCESS
// ============================================
export const checkSubscriptionAccess = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ canAccess: boolean; isTestMode: boolean }> => {
    const session = await requireAuth()

    const testMode = isTestMode()
    const canAccess = testMode ? isAdminEmail(session.user.email) : true

    return { canAccess, isTestMode: testMode }
  },
)

// ============================================
// ADMIN: GRANT FREE PREMIUM
// ============================================
type AdminGrantResult =
  | { success: true; subscription: { id: string; userId: string } }
  | { success: false; error: { code: string; message: string } }

export const adminGrantPremium = createServerFn({ method: 'POST' })
  .inputValidator((data: { targetUserId: string; note?: string }) => data)
  .handler(async ({ data }): Promise<AdminGrantResult> => {
    const session = await requireAuth()

    // Verify admin
    if (!isAdminEmail(session.user.email)) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Admin access required' },
      }
    }

    // Prevent self-grant (audit trail integrity)
    if (data.targetUserId === session.user.id) {
      return {
        success: false,
        error: { code: 'SELF_GRANT', message: 'Cannot grant premium to yourself' },
      }
    }

    // Check if user exists
    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, data.targetUserId),
      columns: { id: true, email: true },
    })

    if (!targetUser) {
      return {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      }
    }

    // Check for existing subscription
    const existing = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.targetUserId),
    })

    try {
      await db.transaction(async (tx) => {
        if (existing) {
          // Update existing to admin-granted
          await tx
            .update(userSubscription)
            .set({
              isAdminGranted: true,
              adminGrantedBy: session.user.id,
              adminGrantedAt: new Date(),
              adminGrantNote: data.note || 'Admin granted premium access',
              status: 'active', // Force active status
            })
            .where(eq(userSubscription.id, existing.id))
        } else {
          // Create new admin-granted subscription
          await tx.insert(userSubscription).values({
            userId: data.targetUserId,
            razorpaySubscriptionId: `admin_grant_${data.targetUserId}_${Date.now()}`,
            status: 'active',
            isAdminGranted: true,
            adminGrantedBy: session.user.id,
            adminGrantedAt: new Date(),
            adminGrantNote: data.note || 'Admin granted premium access',
          })
        }

        // Create/update subscription bonus
        const existingBonus = await tx.query.userListBonus.findFirst({
          where: and(
            eq(userListBonus.userId, data.targetUserId),
            eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
          ),
        })

        if (existingBonus) {
          await tx
            .update(userListBonus)
            .set({
              amount: LIST_LIMIT_CONFIG.SUBSCRIPTION_BONUS,
              isActive: true,
              expiresAt: null, // Never expires for admin grants
              description: 'Admin granted premium',
            })
            .where(eq(userListBonus.id, existingBonus.id))
        } else {
          await tx.insert(userListBonus).values({
            userId: data.targetUserId,
            bonusType: BONUS_TYPES.SUBSCRIPTION,
            amount: LIST_LIMIT_CONFIG.SUBSCRIPTION_BONUS,
            description: 'Admin granted premium',
            expiresAt: null, // Never expires
            isActive: true,
          })
        }

        // Log event
        const [sub] = await tx.query.userSubscription.findMany({
          where: eq(userSubscription.userId, data.targetUserId),
          limit: 1,
        })

        if (sub) {
          await tx.insert(subscriptionEvent).values({
            subscriptionId: sub.id,
            event: 'admin.premium_granted',
            newStatus: 'active',
            payload: {
              grantedBy: session.user.email,
              note: data.note,
            },
          })
        }
      })

      const subscription = await db.query.userSubscription.findFirst({
        where: eq(userSubscription.userId, data.targetUserId),
      })

      return {
        success: true,
        subscription: { id: subscription!.id, userId: data.targetUserId },
      }
    } catch (error) {
      console.error('Failed to grant premium:', error)
      return {
        success: false,
        error: { code: 'GRANT_FAILED', message: 'Failed to grant premium access' },
      }
    }
  })

// ============================================
// ADMIN: REVOKE FREE PREMIUM
// ============================================
type AdminRevokeResult =
  | { success: true }
  | { success: false; error: { code: string; message: string } }

export const adminRevokePremium = createServerFn({ method: 'POST' })
  .inputValidator((data: { targetUserId: string }) => data)
  .handler(async ({ data }): Promise<AdminRevokeResult> => {
    const session = await requireAuth()

    // Verify admin
    if (!isAdminEmail(session.user.email)) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Admin access required' },
      }
    }

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.targetUserId),
    })

    if (!subscription) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'No subscription found for user' },
      }
    }

    if (!subscription.isAdminGranted) {
      return {
        success: false,
        error: {
          code: 'NOT_ADMIN_GRANTED',
          message: 'Cannot revoke paid subscription. User must cancel through Razorpay.',
        },
      }
    }

    try {
      await db.transaction(async (tx) => {
        // Log the revoke event BEFORE deleting (for audit trail)
        await tx.insert(subscriptionEvent).values({
          subscriptionId: subscription.id,
          event: 'admin.premium_revoked',
          previousStatus: subscription.status,
          newStatus: null,
          payload: {
            revokedBy: session.user.email,
            revokedUserId: data.targetUserId,
            wasAdminGranted: subscription.isAdminGranted,
          },
        })

        // Delete the subscription
        await tx
          .delete(userSubscription)
          .where(eq(userSubscription.id, subscription.id))

        // Deactivate bonus
        await tx
          .update(userListBonus)
          .set({ isActive: false })
          .where(
            and(
              eq(userListBonus.userId, data.targetUserId),
              eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
            ),
          )
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to revoke premium:', error)
      return {
        success: false,
        error: { code: 'REVOKE_FAILED', message: 'Failed to revoke premium access' },
      }
    }
  })

// ============================================
// ADMIN: LIST ALL SUBSCRIBERS (with pagination)
// ============================================
export interface SubscriberInfo {
  userId: string
  userEmail: string
  userName: string
  status: SubscriptionStatus
  isAdminGranted: boolean
  adminGrantedBy: string | null
  adminGrantNote: string | null
  currentPeriodEnd: Date | null
  createdAt: Date
}

export interface PaginatedSubscribers {
  items: SubscriberInfo[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

type AdminListSubscribersResult =
  | { success: true; data: PaginatedSubscribers }
  | { success: false; error: { code: string; message: string } }

// Helper: Escape ILIKE special characters
function escapeIlike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

export const adminListSubscribers = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      page?: number
      limit?: number
      filter?: 'all' | 'admin_granted' | 'paid'
      search?: string
    }) => data,
  )
  .handler(async ({ data }): Promise<AdminListSubscribersResult> => {
    const session = await requireAuth()

    // Return error instead of throwing (consistent with other admin functions)
    if (!isAdminEmail(session.user.email)) {
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Admin access required' },
      }
    }

    // Pagination with sensible defaults
    const page = Math.max(1, data.page ?? 1)
    const limit = Math.min(50, Math.max(1, data.limit ?? 20))
    const offset = (page - 1) * limit

    // Build where conditions - SERVER-SIDE filtering (not client-side!)
    const conditions: SQL[] = []

    if (data.filter === 'admin_granted') {
      conditions.push(eq(userSubscription.isAdminGranted, true))
    } else if (data.filter === 'paid') {
      conditions.push(eq(userSubscription.isAdminGranted, false))
    }

    // IMPORTANT: Search filtering MUST be server-side with SQL ILIKE
    // Client-side filtering after pagination would miss results!
    if (data.search?.trim()) {
      const searchTerm = `%${escapeIlike(data.search.trim())}%`
      // Join with user table for search (subquery approach for count accuracy)
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM "user" u
          WHERE u.id = ${userSubscription.userId}
          AND (u.email ILIKE ${searchTerm} OR u.name ILIKE ${searchTerm})
        )`,
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count (with search filter applied!)
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userSubscription)
      .where(whereClause)

    const total = countResult?.count ?? 0

    // Get paginated results
    const subscriptions = await db.query.userSubscription.findMany({
      where: whereClause,
      with: {
        user: {
          columns: { id: true, name: true, email: true },
        },
      },
      orderBy: [desc(userSubscription.createdAt)],
      limit,
      offset,
    })

    return {
      success: true,
      data: {
        items: subscriptions.map((sub) => ({
          userId: sub.userId,
          userEmail: sub.user.email,
          userName: sub.user.name,
          status: sub.status as SubscriptionStatus,
          isAdminGranted: sub.isAdminGranted,
          adminGrantedBy: sub.adminGrantedBy,
          adminGrantNote: sub.adminGrantNote,
          currentPeriodEnd: sub.currentPeriodEnd,
          createdAt: sub.createdAt,
        })),
        total,
        page,
        limit,
        hasMore: offset + limit < total,
      },
    }
  })
