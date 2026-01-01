import { useRef } from 'react'
import { useSearch } from '@tanstack/react-router'
import { storeReferralCode } from '@/lib/referral-storage'
import { isValidReferralCodeFormat } from '@/lib/referral'

/**
 * Client component that captures referral code from URL.
 * Uses a ref to ensure we only capture once per mount.
 *
 * This pattern is preferred over useEffect because:
 * 1. It's explicit that this is a one-time capture
 * 2. No dependency array to manage
 * 3. Works correctly with React strict mode
 */
export function ReferralCapture() {
  const hasCaptured = useRef(false)

  // Type-safe search params from root route
  const search = useSearch({ from: '__root__' })

  // Only run once per component lifecycle
  if (!hasCaptured.current && typeof window !== 'undefined') {
    const code = search?.ref

    if (code && typeof code === 'string') {
      const normalizedCode = code.toUpperCase().trim()

      if (isValidReferralCodeFormat(normalizedCode)) {
        storeReferralCode(normalizedCode)
        hasCaptured.current = true
      }
    }
  }

  return null // This component renders nothing
}
