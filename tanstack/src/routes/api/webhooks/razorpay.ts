import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { subscription } from '@/db/schema'
import {
  verifyWebhookSignature,
  parseWebhookPayload,
  type RazorpayWebhookPayload,
} from '@/lib/razorpay'
import {
  upsertSubscription,
  updateSubscriptionStatus,
  recordPayment,
} from '@/lib/subscription'

export const Route = createFileRoute('/api/webhooks/razorpay')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          // Get raw body for signature verification
          const rawBody = await request.text()
          const signature = request.headers.get('X-Razorpay-Signature')

          if (!signature) {
            console.error('[RazorpayWebhook] Missing signature header')
            return new Response(
              JSON.stringify({ error: 'Missing signature' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          // Verify webhook signature
          const isValid = verifyWebhookSignature(rawBody, signature)
          if (!isValid) {
            console.error('[RazorpayWebhook] Invalid signature')
            return new Response(
              JSON.stringify({ error: 'Invalid signature' }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }

          // Parse webhook payload
          const payload: RazorpayWebhookPayload = parseWebhookPayload(rawBody)
          const eventType = payload.event

          console.log('[RazorpayWebhook] Received event:', eventType)

          // Handle subscription events
          if (eventType.startsWith('subscription.')) {
            await handleSubscriptionEvent(payload)
          }

          // Return success
          return new Response(
            JSON.stringify({ success: true }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error) {
          console.error('[RazorpayWebhook] Error:', error)
          const message = error instanceof Error ? error.message : 'Unknown error'

          // Return 200 to prevent webhook retries for processing errors
          // Razorpay will retry on 4xx/5xx responses
          return new Response(
            JSON.stringify({ error: message }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }
      },
    },
  },
})

async function handleSubscriptionEvent(payload: RazorpayWebhookPayload) {
  const eventType = payload.event
  const subscriptionEntity = payload.payload.subscription?.entity
  const paymentEntity = payload.payload.payment?.entity

  if (!subscriptionEntity) {
    console.error('[RazorpayWebhook] Missing subscription entity')
    return
  }

  const subscriptionId = subscriptionEntity.id
  console.log(`[RazorpayWebhook] Processing ${eventType} for subscription ${subscriptionId}`)

  // Find the subscription in our database to get the user ID
  const existingSubscription = await db.query.subscription.findFirst({
    where: eq(subscription.id, subscriptionId),
  })

  // Get user ID from notes if subscription doesn't exist in DB yet
  const userId = existingSubscription?.userId || subscriptionEntity.notes?.user_id

  if (!userId) {
    console.error('[RazorpayWebhook] Cannot determine user ID for subscription', subscriptionId)
    return
  }

  switch (eventType) {
    case 'subscription.authenticated':
      // First payment completed, update subscription
      await upsertSubscription(userId, subscriptionEntity)
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} authenticated`)
      break

    case 'subscription.activated':
      // Subscription is now active
      await upsertSubscription(userId, subscriptionEntity)
      if (paymentEntity) {
        await recordPayment(userId, subscriptionId, paymentEntity)
      }
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} activated`)
      break

    case 'subscription.charged':
      // Recurring payment successful
      await upsertSubscription(userId, subscriptionEntity)
      if (paymentEntity) {
        await recordPayment(userId, subscriptionId, paymentEntity)
      }
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} charged`)
      break

    case 'subscription.completed':
      // All billing cycles completed
      await updateSubscriptionStatus(subscriptionId, 'completed')
      if (paymentEntity) {
        await recordPayment(userId, subscriptionId, paymentEntity)
      }
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} completed`)
      break

    case 'subscription.pending':
      // Charge failed, retrying
      await updateSubscriptionStatus(subscriptionId, 'pending')
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} pending (charge failed)`)
      break

    case 'subscription.halted':
      // All retries failed
      await updateSubscriptionStatus(subscriptionId, 'halted')
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} halted`)
      break

    case 'subscription.cancelled':
      // Subscription cancelled
      await updateSubscriptionStatus(subscriptionId, 'cancelled')
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} cancelled`)
      break

    case 'subscription.paused':
      // Subscription paused
      await updateSubscriptionStatus(subscriptionId, 'paused')
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} paused`)
      break

    case 'subscription.resumed':
      // Subscription resumed
      await updateSubscriptionStatus(subscriptionId, 'active')
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} resumed`)
      break

    case 'subscription.updated':
      // Subscription updated
      await upsertSubscription(userId, subscriptionEntity)
      console.log(`[RazorpayWebhook] Subscription ${subscriptionId} updated`)
      break

    default:
      console.log(`[RazorpayWebhook] Unhandled event type: ${eventType}`)
  }
}
