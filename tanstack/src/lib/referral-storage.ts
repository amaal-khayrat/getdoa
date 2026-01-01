const REFERRAL_CODE_KEY = 'getdoa_referral_code'
const REFERRAL_TIMESTAMP_KEY = 'getdoa_referral_timestamp'
const REFERRAL_PROCESSED_KEY = 'getdoa_referral_processed' // Prevents duplicate processing
const REFERRAL_MAX_AGE_DAYS = 30 // Expire after 30 days

/**
 * Store referral code in localStorage.
 * Only stores if no existing code (first-touch attribution).
 */
export function storeReferralCode(code: string): void {
  if (typeof window === 'undefined') return

  try {
    // First-touch attribution: don't overwrite existing code
    const existing = localStorage.getItem(REFERRAL_CODE_KEY)
    if (existing) return

    localStorage.setItem(REFERRAL_CODE_KEY, code.toUpperCase())
    localStorage.setItem(REFERRAL_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // localStorage might be disabled or full - fail silently
    console.warn('Failed to store referral code')
  }
}

/**
 * Get stored referral code if valid and not expired.
 */
export function getReferralCode(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const code = localStorage.getItem(REFERRAL_CODE_KEY)
    const timestamp = localStorage.getItem(REFERRAL_TIMESTAMP_KEY)

    if (!code || !timestamp) return null

    // Check if expired
    const age = Date.now() - parseInt(timestamp, 10)
    const maxAge = REFERRAL_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

    if (age > maxAge) {
      clearReferralCode()
      return null
    }

    return code
  } catch {
    return null
  }
}

/**
 * Clear referral code from localStorage.
 */
export function clearReferralCode(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(REFERRAL_CODE_KEY)
    localStorage.removeItem(REFERRAL_TIMESTAMP_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Mark referral as processed to prevent duplicate API calls.
 * Uses a separate key so we can track even after clearing the code.
 */
export function markReferralProcessed(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(REFERRAL_PROCESSED_KEY, Date.now().toString())
  } catch {
    // Ignore errors
  }
}

/**
 * Check if referral was already processed in this browser.
 */
export function wasReferralProcessed(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return localStorage.getItem(REFERRAL_PROCESSED_KEY) !== null
  } catch {
    return false
  }
}
