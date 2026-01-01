import type { InferSelectModel } from 'drizzle-orm'
import type { userListBonus } from '@/db/schema'

/**
 * Configuration for doa list limits.
 * Centralized so it's easy to change.
 */
export const LIST_LIMIT_CONFIG = {
  /** Base number of lists every user gets for free */
  BASE_LIMIT: 1,

  /** Maximum bonus from referrals */
  MAX_REFERRAL_BONUS: 10,

  /** Bonus amount per referral */
  BONUS_PER_REFERRAL: 1,

  /** Bonus for active subscription (future) */
  SUBSCRIPTION_BONUS: 50,

  // Future purchase tiers (for reference)
  PURCHASE_TIERS: {
    PACK_5: { amount: 5, price: 'TBD' },
    PACK_10: { amount: 10, price: 'TBD' },
    PACK_25: { amount: 25, price: 'TBD' },
  },
} as const

export const BONUS_TYPES = {
  /** Bonus from referring other users */
  REFERRAL: 'referral',

  /** Bonus from one-time purchases */
  PURCHASE: 'purchase',

  /** Bonus from active subscription */
  SUBSCRIPTION: 'subscription',
} as const

export type BonusType = (typeof BONUS_TYPES)[keyof typeof BONUS_TYPES]
export type UserListBonusRecord = InferSelectModel<typeof userListBonus>

/**
 * Calculate the referral bonus (capped).
 */
export function calculateReferralBonus(referralCount: number): number {
  const { BONUS_PER_REFERRAL, MAX_REFERRAL_BONUS } = LIST_LIMIT_CONFIG
  const safeCount = Math.max(0, Math.floor(referralCount))
  return Math.min(safeCount * BONUS_PER_REFERRAL, MAX_REFERRAL_BONUS)
}

/**
 * Filter and return only active bonuses.
 * Extracted for reusability and testability.
 */
export function filterActiveBonuses(
  bonuses: UserListBonusRecord[],
  now: Date = new Date(),
): UserListBonusRecord[] {
  return bonuses.filter((b) => {
    if (!b.isActive) return false
    if (b.expiresAt && b.expiresAt < now) return false
    return true
  })
}

/**
 * Detailed limit breakdown for UI display.
 */
export interface ListLimitInfo {
  /** Current number of lists the user has */
  current: number

  /** Total maximum allowed lists */
  limit: number

  /** Remaining lists that can be created */
  remaining: number

  /** Whether user can create more lists */
  canCreate: boolean

  /** Breakdown by source */
  breakdown: {
    base: number
    referral: number
    purchase: number
    subscription: number
  }

  /** Raw referral count (before cap) */
  referralCount: number

  /** Additional referral bonuses available (before hitting cap) */
  referralPotential: number

  /** Whether user has active subscription */
  hasSubscription: boolean
}

/**
 * Calculate list limit from bonuses.
 *
 * @param referralCount - Number of successful referrals
 * @param bonuses - Active bonus records from database
 * @returns Total list limit
 */
export function calculateListLimit(
  referralCount: number,
  bonuses: UserListBonusRecord[],
): number {
  const { BASE_LIMIT } = LIST_LIMIT_CONFIG

  // Calculate referral bonus (capped)
  const referralBonus = calculateReferralBonus(referralCount)

  // Sum up other active bonuses by type
  const activeBonuses = filterActiveBonuses(bonuses)

  const purchaseBonus = activeBonuses
    .filter((b) => b.bonusType === BONUS_TYPES.PURCHASE)
    .reduce((sum, b) => sum + Math.max(0, b.amount), 0)

  const subscriptionBonus = activeBonuses
    .filter((b) => b.bonusType === BONUS_TYPES.SUBSCRIPTION)
    .reduce((sum, b) => sum + Math.max(0, b.amount), 0)

  return BASE_LIMIT + referralBonus + purchaseBonus + subscriptionBonus
}

/**
 * Get detailed limit info for UI.
 */
export function getListLimitInfo(
  currentListCount: number,
  referralCount: number,
  bonuses: UserListBonusRecord[],
): ListLimitInfo {
  const { BASE_LIMIT, MAX_REFERRAL_BONUS } = LIST_LIMIT_CONFIG

  // Filter active bonuses
  const activeBonuses = filterActiveBonuses(bonuses)

  // Calculate each bonus type
  const referralBonus = calculateReferralBonus(referralCount)

  const purchaseBonus = activeBonuses
    .filter((b) => b.bonusType === BONUS_TYPES.PURCHASE)
    .reduce((sum, b) => sum + Math.max(0, b.amount), 0)

  const subscriptionBonus = activeBonuses
    .filter((b) => b.bonusType === BONUS_TYPES.SUBSCRIPTION)
    .reduce((sum, b) => sum + Math.max(0, b.amount), 0)

  const limit = BASE_LIMIT + referralBonus + purchaseBonus + subscriptionBonus
  const remaining = Math.max(0, limit - currentListCount)

  return {
    current: currentListCount,
    limit,
    remaining,
    canCreate: currentListCount < limit,
    breakdown: {
      base: BASE_LIMIT,
      referral: referralBonus,
      purchase: purchaseBonus,
      subscription: subscriptionBonus,
    },
    referralCount,
    referralPotential: Math.max(0, MAX_REFERRAL_BONUS - referralBonus),
    hasSubscription: subscriptionBonus > 0,
  }
}

/**
 * Check if user can create more lists.
 */
export function canCreateList(
  currentListCount: number,
  referralCount: number,
  bonuses: UserListBonusRecord[],
): boolean {
  const limit = calculateListLimit(referralCount, bonuses)
  return currentListCount < limit
}
