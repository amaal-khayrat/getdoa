import { createFileRoute } from '@tanstack/react-router'
import { getSessionFromRequest } from '@/lib/auth'
import {
  getUserSubscription,
  getSubscriptionTier,
  TIER_LIMITS,
} from '@/lib/subscription'

export const Route = createFileRoute('/api/subscriptions/current')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
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

          // Get user's subscription
          const subscription = await getUserSubscription(userId)
          const tier = await getSubscriptionTier(userId)
          const limits = TIER_LIMITS[tier]

          return new Response(
            JSON.stringify({
              subscription: subscription
                ? {
                    id: subscription.id,
                    status: subscription.status,
                    planId: subscription.planId,
                    currentPeriodStart: subscription.currentPeriodStart,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                    paidCount: subscription.paidCount,
                    totalCount: subscription.totalCount,
                  }
                : null,
              tier,
              limits,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          console.error('[SubscriptionCurrent] Error:', error)
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
