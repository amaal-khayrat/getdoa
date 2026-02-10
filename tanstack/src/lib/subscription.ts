/**
 * Subscription configuration and utilities.
 */

export const SUBSCRIPTION_CONFIG = {
  // Plan details
  PREMIUM_MONTHLY: {
    name: 'Premium Monthly',
    amount: 990, // RM9.90 in sen
    currency: 'MYR',
    period: 'monthly' as const,
    intervalCount: 1,
  },

  // Feature limits
  PREMIUM_LIST_BONUS: 50,
  PREMIUM_IMAGE_LIMIT: 15,
  FREE_IMAGE_LIMIT: 1,
  FREE_BASE_IMAGE_LIMIT: 1,
  FREE_REFERRAL_IMAGE_BONUS: 1, // +1 per referral
  FREE_MAX_IMAGE_BONUS: 2, // Max +2 from referrals

  // Environment flag for test mode
  TEST_MODE_ENV_KEY: 'RAZORPAY_TEST_MODE',

  // Active subscription statuses (for billing purposes)
  ACTIVE_STATUSES: ['active', 'authenticated'] as const,

  // Statuses that provide premium access
  // Note: 'pending' keeps access during payment retry period
  // Note: 'halted' does NOT grant access (all retries exhausted)
  PREMIUM_ACCESS_STATUSES: ['active', 'authenticated', 'pending'] as const,
} as const

export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'pending'
  | 'halted'
  | 'cancelled'
  | 'completed'
  | 'expired'
  | 'paused'

export interface SubscriptionInfo {
  isSubscribed: boolean
  status: SubscriptionStatus | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  planName: string | null
  // New fields for admin grants
  isAdminGranted: boolean
  adminGrantedBy: string | null
}

/**
 * Check if a subscription grants premium access.
 * Admin-granted subscriptions ALWAYS have access regardless of Razorpay status.
 * Users keep access during 'pending' (failed payment retry period).
 */
export function hasPremiumAccess(
  status: SubscriptionStatus | null,
  isAdminGranted: boolean = false,
): boolean {
  // Admin-granted users always have access
  if (isAdminGranted) return true

  // Regular subscription status check
  if (!status) return false
  return (SUBSCRIPTION_CONFIG.PREMIUM_ACCESS_STATUSES as readonly string[]).includes(status)
}

/**
 * Check if subscription is in a terminal state.
 */
export function isTerminalStatus(status: SubscriptionStatus): boolean {
  return ['cancelled', 'completed', 'expired'].includes(status)
}

/**
 * Check if Razorpay test mode is enabled.
 * In test mode, only admins can access subscription features.
 */
export function isTestMode(): boolean {
  return process.env[SUBSCRIPTION_CONFIG.TEST_MODE_ENV_KEY] === 'true'
}
