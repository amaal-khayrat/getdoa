import { createFileRoute } from '@tanstack/react-router'
import { getSessionFromRequest } from '@/lib/auth'
import { createSubscription } from '@/lib/razorpay'
import { upsertSubscription, getActiveSubscription } from '@/lib/subscription'

const RAZORPAY_PLAN_ID = process.env.RAZORPAY_PLAN_ID!
const TOTAL_COUNT = 12 // 12 months subscription

export const Route = createFileRoute('/api/subscriptions/create')({
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
          const userEmail = session.user.email

          // Check if user already has an active subscription
          const existingSubscription = await getActiveSubscription(userId)
          if (existingSubscription) {
            return new Response(
              JSON.stringify({
                error: 'You already have an active subscription',
                subscription: existingSubscription,
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          // Create subscription in Razorpay
          const razorpaySubscription = await createSubscription({
            planId: RAZORPAY_PLAN_ID,
            totalCount: TOTAL_COUNT,
            customerNotify: true,
            notes: {
              user_id: userId,
              email: userEmail,
            },
          })

          // Save subscription to database
          await upsertSubscription(userId, razorpaySubscription)

          return new Response(
            JSON.stringify({
              success: true,
              subscription: {
                id: razorpaySubscription.id,
                status: razorpaySubscription.status,
                shortUrl: razorpaySubscription.short_url,
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          console.error('[SubscriptionCreate] Error:', error)
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
