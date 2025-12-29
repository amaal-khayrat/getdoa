import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { payment, subscription } from '@/db/schema'
import type { RazorpaySubscription, RazorpayPayment } from './razorpay'

// Active subscription statuses
const ACTIVE_STATUSES = ['authenticated', 'active'] as const

// Subscription tier
export type SubscriptionTier = 'free' | 'unlimited'

// Get user's current subscription
export async function getUserSubscription(userId: string) {
  return db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
    orderBy: [desc(subscription.createdAt)],
  })
}

// Get user's active subscription
export async function getActiveSubscription(userId: string) {
  return db.query.subscription.findFirst({
    where: and(
      eq(subscription.userId, userId),
      inArray(subscription.status, [...ACTIVE_STATUSES]),
    ),
    orderBy: [desc(subscription.createdAt)],
  })
}

// Check if user has an active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await getActiveSubscription(userId)
  return !!sub
}

// Get user's subscription tier
export async function getSubscriptionTier(
  userId: string,
): Promise<SubscriptionTier> {
  const isActive = await hasActiveSubscription(userId)
  return isActive ? 'unlimited' : 'free'
}

// Create or update subscription in database from Razorpay data
export async function upsertSubscription(
  userId: string,
  razorpaySub: RazorpaySubscription,
) {
  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.id, razorpaySub.id),
  })

  const subscriptionData = {
    id: razorpaySub.id,
    userId,
    planId: razorpaySub.plan_id,
    status: razorpaySub.status,
    currentPeriodStart: razorpaySub.current_start
      ? new Date(razorpaySub.current_start * 1000)
      : null,
    currentPeriodEnd: razorpaySub.current_end
      ? new Date(razorpaySub.current_end * 1000)
      : null,
    chargeAt: razorpaySub.charge_at
      ? new Date(razorpaySub.charge_at * 1000)
      : null,
    totalCount: razorpaySub.total_count,
    paidCount: razorpaySub.paid_count,
    shortUrl: razorpaySub.short_url,
    updatedAt: new Date(),
  }

  if (existingSubscription) {
    await db
      .update(subscription)
      .set(subscriptionData)
      .where(eq(subscription.id, razorpaySub.id))
  } else {
    await db.insert(subscription).values({
      ...subscriptionData,
      createdAt: new Date(),
    })
  }

  return subscriptionData
}

// Update subscription status
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: RazorpaySubscription['status'],
) {
  await db
    .update(subscription)
    .set({ status, updatedAt: new Date() })
    .where(eq(subscription.id, subscriptionId))
}

// Record a payment
export async function recordPayment(
  userId: string,
  subscriptionId: string,
  razorpayPayment: RazorpayPayment,
) {
  await db.insert(payment).values({
    id: razorpayPayment.id,
    subscriptionId,
    userId,
    amount: razorpayPayment.amount,
    currency: razorpayPayment.currency,
    status: razorpayPayment.status,
    method: razorpayPayment.method,
    createdAt: new Date(razorpayPayment.created_at * 1000),
  })
}

// Get user's payment history
export async function getUserPayments(userId: string) {
  return db.query.payment.findMany({
    where: eq(payment.userId, userId),
    orderBy: [desc(payment.createdAt)],
  })
}

// Feature limits based on subscription tier
export const TIER_LIMITS = {
  free: {
    maxDoaLists: 1,
    customBackgrounds: false,
    customFonts: false,
    prioritySupport: false,
  },
  unlimited: {
    maxDoaLists: 50,
    customBackgrounds: true,
    customFonts: true,
    prioritySupport: true,
  },
} as const

// Check if user can create more doa lists
export async function canCreateDoaList(
  userId: string,
  currentListCount: number,
): Promise<boolean> {
  const tier = await getSubscriptionTier(userId)
  const limit = TIER_LIMITS[tier].maxDoaLists
  return currentListCount < limit
}

// Check if user has access to a premium feature
export async function hasPremiumFeature(
  userId: string,
  feature: 'customBackgrounds' | 'customFonts' | 'prioritySupport',
): Promise<boolean> {
  const tier = await getSubscriptionTier(userId)
  return TIER_LIMITS[tier][feature]
}
