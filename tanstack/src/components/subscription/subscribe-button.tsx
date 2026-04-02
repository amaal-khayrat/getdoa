import { useRef, useState, useCallback, useEffect } from 'react'
import { Loader2, Sparkles, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createUserSubscription } from '@/server-functions/dashboard/subscription'
import { cn } from '@/lib/utils'

interface SubscribeButtonProps {
  userId: string
  isPremium: boolean
  isAdminGranted?: boolean
  variant?: 'default' | 'compact' | 'full'
  className?: string
}

export function SubscribeButton({
  userId,
  isPremium,
  isAdminGranted = false,
  variant = 'default',
  className,
}: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref to track if component is mounted (prevents state updates after unmount)
  const isMountedRef = useRef(true)

  // Ref to prevent double-clicks during async operation
  const isProcessingRef = useRef(false)

  // Store userId in ref to avoid stale closures
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  // Cleanup on unmount - required for isMountedRef to work
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleSubscribe = useCallback(async () => {
    // Prevent double-click
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    setIsLoading(true)
    setError(null)

    try {
      const result = await createUserSubscription({ data: { userId: userIdRef.current } })

      // Check if still mounted before updating state
      if (!isMountedRef.current) return

      if (result.success) {
        // Redirect to Razorpay payment page
        window.location.href = result.shortUrl
      } else {
        setError(result.error.message)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Failed to start subscription. Please try again.')
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      isProcessingRef.current = false
    }
  }, [])

  // Already premium - show status badge
  if (isPremium) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {isAdminGranted ? 'Premium (Granted)' : 'Premium'}
          </span>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Button
        size="sm"
        onClick={handleSubscribe}
        disabled={isLoading}
        className={cn(
          'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white',
          className,
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-1" />
            Upgrade
          </>
        )}
      </Button>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade to Premium - RM9.90/month
          </>
        )}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  )
}
