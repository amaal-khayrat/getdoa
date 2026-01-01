import { useRef, useEffect } from 'react'
import {
  getReferralCode,
  clearReferralCode,
  markReferralProcessed,
  wasReferralProcessed,
} from '@/lib/referral-storage'
import { processReferral } from '@/routes/dashboard/functions/referral'
import { toast } from 'sonner'

interface ReferralProcessorProps {
  userId: string
}

/**
 * Processes stored referral code after user authentication.
 *
 * This component:
 * 1. Checks if there's a stored referral code
 * 2. Checks if it was already processed (prevents duplicate calls)
 * 3. Calls the server to record the referral
 * 4. Cleans up localStorage
 *
 * Uses useEffect here because:
 * - This is a side effect that should happen AFTER render
 * - It involves async operations (server call)
 * - It needs cleanup logic
 */
export function ReferralProcessor({ userId }: ReferralProcessorProps) {
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double-processing in strict mode
    if (hasProcessed.current) return

    const processStoredReferral = async () => {
      // Check if already processed in this browser
      if (wasReferralProcessed()) {
        clearReferralCode() // Clean up any stale code
        return
      }

      const storedCode = getReferralCode()
      if (!storedCode) return

      hasProcessed.current = true

      try {
        const result = await processReferral({
          data: {
            referredUserId: userId,
            code: storedCode,
          },
        })

        if (result.success) {
          // Optional: Show success toast
          toast.success('Welcome! Your referral has been recorded.')
        }
        // Don't show error toast - user doesn't need to know about referral issues
      } catch {
        // Network error - don't clear storage, allow retry on next visit
        hasProcessed.current = false
        return
      }

      // Only clear after successful processing (or known failure like self-referral)
      markReferralProcessed()
      clearReferralCode()
    }

    processStoredReferral()
  }, [userId])

  return null
}
