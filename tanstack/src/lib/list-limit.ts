import type { InferSelectModel } from 'drizzle-orm'
import type { userListBonus } from '@/db/schema'

/**
 * Configuration for doa list limits.
 * Centralized so it's easy to change.
 */
export const LIST_LIMIT_CONFIG = {
  /** Practical ceiling used for UI/math now that list creation is free. */
  BASE_LIMIT: 999_999,

  /** Referrals no longer unlock limits; kept for legacy bonus records. */
  MAX_REFERRAL_BONUS: 0,

  /** Referrals no longer unlock limits; kept for legacy bonus records. */
  BONUS_PER_REFERRAL: 0,

  /** Practical ceiling above the current library size. */
  MAX_PRAYERS_PER_LIST_FREE: 999,
} as const

export const BONUS_TYPES = {
  /** Legacy bonus type from older referral records */
  REFERRAL: 'referral',
} as const

export type BonusType = (typeof BONUS_TYPES)[keyof typeof BONUS_TYPES]
export type UserListBonusRecord = InferSelectModel<typeof userListBonus>

/**
 * Get the maximum prayers allowed per list.
 */
export function getMaxPrayersPerList(): number {
  return LIST_LIMIT_CONFIG.MAX_PRAYERS_PER_LIST_FREE
}

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
  bonuses: Array<UserListBonusRecord>,
  now: Date = new Date(),
): Array<UserListBonusRecord> {
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
  }

  /** Raw referral count (before cap) */
  referralCount: number

  /** Additional referral bonuses available (before hitting cap) */
  referralPotential: number

}

/**
 * Calculate list limit.
 *
 * @param referralCount - Legacy referral count, ignored
 * @param bonuses - Legacy bonus records, ignored
 * @returns Total list limit
 */
export function calculateListLimit(
  referralCount: number,
  bonuses: Array<UserListBonusRecord>,
): number {
  void referralCount
  void bonuses
  return LIST_LIMIT_CONFIG.BASE_LIMIT
}

/**
 * Get detailed limit info for UI.
 */
export function getListLimitInfo(
  currentListCount: number,
  referralCount: number,
  bonuses: Array<UserListBonusRecord>,
): ListLimitInfo {
  void bonuses

  const { BASE_LIMIT } = LIST_LIMIT_CONFIG
  const limit = BASE_LIMIT
  const remaining = Math.max(0, limit - currentListCount)

  return {
    current: currentListCount,
    limit,
    remaining,
    canCreate: true,
    breakdown: {
      base: limit,
      referral: 0,
    },
    referralCount,
    referralPotential: 0,
  }
}

/**
 * Check if user can create more lists.
 */
export function canCreateList(
  currentListCount: number,
  referralCount: number,
  bonuses: Array<UserListBonusRecord>,
): boolean {
  void currentListCount
  void referralCount
  void bonuses
  return true
}
