import { useRef, useState, useCallback, useEffect } from 'react'
import { Crown, Calendar, AlertCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cancelUserSubscription } from '@/server-functions/dashboard/subscription'
import type { SubscriptionInfo } from '@/lib/subscription'
import { useRouter } from '@tanstack/react-router'

interface SubscriptionStatusProps {
  subscription: SubscriptionInfo
  userId: string
}

export function SubscriptionStatus({ subscription, userId }: SubscriptionStatusProps) {
  const router = useRouter()
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Refs to prevent stale closures and race conditions
  const isMountedRef = useRef(true)
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  // Cleanup on unmount - required for isMountedRef to work
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleCancel = useCallback(
    async (immediately: boolean = false) => {
      setIsCancelling(true)
      setError(null)

      try {
        const result = await cancelUserSubscription({
          data: { userId: userIdRef.current, cancelImmediately: immediately },
        })

        if (!isMountedRef.current) return

        if (result.success) {
          setDialogOpen(false)
          router.invalidate() // Refresh route data
        } else {
          setError(result.error.message)
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError('Failed to cancel subscription')
        }
      } finally {
        if (isMountedRef.current) {
          setIsCancelling(false)
        }
      }
    },
    [router],
  )

  if (!subscription.isSubscribed) {
    return null
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="w-5 h-5 text-amber-500" />
            Premium Subscription
          </CardTitle>
          <Badge
            variant={subscription.cancelAtPeriodEnd ? 'secondary' : 'default'}
            className={!subscription.cancelAtPeriodEnd ? 'bg-emerald-500' : ''}
          >
            {subscription.isAdminGranted
              ? 'Granted'
              : subscription.cancelAtPeriodEnd
                ? 'Cancelling'
                : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{subscription.planName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{subscription.status}</span>
          </div>
          {!subscription.isAdminGranted && subscription.currentPeriodEnd && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing'}
              </span>
              <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
            </div>
          )}
          {subscription.isAdminGranted && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-amber-600">Admin Granted (No expiry)</span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Only show cancel for non-admin-granted subscriptions */}
        {!subscription.isAdminGranted && !subscription.cancelAtPeriodEnd && (
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger
              render={<Button variant="outline" size="sm" className="w-full" />}
            >
              Cancel Subscription
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your premium access will continue until the end of your current billing period (
                  {formatDate(subscription.currentPeriodEnd)}). You won't be charged again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive p-2 bg-destructive/10 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isCancelling}>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault() // Prevent auto-close
                    handleCancel(false)
                  }}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Cancel at Period End
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {subscription.cancelAtPeriodEnd && (
          <p className="text-sm text-muted-foreground text-center">
            Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. You can
            resubscribe anytime.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
