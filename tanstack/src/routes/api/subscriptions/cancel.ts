import { createFileRoute } from '@tanstack/react-router'
import { getSessionFromRequest } from '@/lib/auth'
import { cancelSubscription as cancelRazorpaySubscription } from '@/lib/razorpay'
import {
  getActiveSubscription,
  updateSubscriptionStatus,
} from '@/lib/subscription'

export const Route = createFileRoute('/api/subscriptions/cancel')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          // Check authentication
          const session = await getSessionFromRequest(request)
          if (!session?.user) {
            return new Response(
              JSON.stringify({ error: 'Unauthorized' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          const userId = session.user.id

          // Get user's active subscription
          const subscription = await getActiveSubscription(userId)
          if (!subscription) {
            return new Response(
              JSON.stringify({ error: 'No active subscription found' }),
              {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          // Cancel subscription in Razorpay (at end of billing cycle)
          const cancelledSubscription = await cancelRazorpaySubscription(
            subscription.id,
            true, // cancel at cycle end
          )

          // Update status in database
          await updateSubscriptionStatus(subscription.id, cancelledSubscription.status)

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Subscription will be cancelled at the end of the current billing period',
              subscription: {
                id: cancelledSubscription.id,
                status: cancelledSubscription.status,
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          console.error('[SubscriptionCancel] Error:', error)
          const message = error instanceof Error ? error.message : 'Unknown error'

          return new Response(
            JSON.stringify({ error: message }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})
