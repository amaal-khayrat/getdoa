import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { userSubscription, subscriptionEvent, userListBonus } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { BONUS_TYPES, LIST_LIMIT_CONFIG } from '@/lib/list-limit'
import type { SubscriptionStatus } from '@/lib/subscription'

// Razorpay webhook event payload types
// Based on https://razorpay.com/docs/api/subscriptions/#response-parameters
interface RazorpaySubscriptionEntity {
  id: string // sub_00000000000001
  entity: 'subscription'
  plan_id: string
  status: string // created | authenticated | active | pending | halted | cancelled | completed | expired | paused
  current_start?: number // Unix timestamp
  current_end?: number // Unix timestamp
  ended_at?: number // Unix timestamp when subscription ended
  quantity: number
  notes?: Record<string, string>
  charge_at?: number // Unix timestamp for next charge
  start_at?: number // Unix timestamp when subscription started
  end_at?: number // Unix timestamp when subscription will end
  auth_attempts?: number
  total_count: number
  paid_count: number
  customer_notify: 0 | 1
  created_at: number
  expire_by?: number
  short_url: string
  has_scheduled_changes: boolean
  change_scheduled_at?: string // 'now' | 'cycle_end'
  remaining_count: number
  customer_id?: string // Populated after authentication
  offer_id?: string
}

interface RazorpayWebhookPayload {
  subscription?: { entity: RazorpaySubscriptionEntity }
  payment?: { entity: { id: string } }
}

interface RazorpayWebhookEvent {
  event: string
  payload: RazorpayWebhookPayload
  account_id: string
  contains: string[]
  created_at: number
}

export const Route = createFileRoute('/api/razorpay-webhook')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = await request.text()
        const signature = request.headers.get('x-razorpay-signature')

        if (!signature) {
          return new Response(JSON.stringify({ error: 'Missing signature' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Verify webhook signature
        if (!verifyWebhookSignature(body, signature)) {
          console.error('[RazorpayWebhook] Invalid signature')
          return new Response(JSON.stringify({ error: 'Invalid signature' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        let event: RazorpayWebhookEvent
        try {
          event = JSON.parse(body) as RazorpayWebhookEvent
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const eventType = event.event
        console.log(`[RazorpayWebhook] Received: ${eventType}`)

        try {
          await handleWebhookEvent(event)
          return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          console.error('[RazorpayWebhook] Processing error:', error)
          // Return 200 to prevent Razorpay retries for non-recoverable errors
          // Log the error for manual investigation
          return new Response(
            JSON.stringify({ received: true, warning: 'Processing error logged' }),
            { headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})

async function handleWebhookEvent(event: RazorpayWebhookEvent): Promise<void> {
  const { event: eventType, payload } = event
  const subscriptionData = payload.subscription?.entity

  if (!subscriptionData) {
    console.log('[RazorpayWebhook] No subscription data in webhook')
    return
  }

  const razorpaySubscriptionId = subscriptionData.id

  // Find our subscription record
  const subscription = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.razorpaySubscriptionId, razorpaySubscriptionId),
  })

  if (!subscription) {
    // This can happen if webhook arrives before our createSubscription completes
    // Log and return - Razorpay will retry
    console.warn(`[RazorpayWebhook] Subscription not found: ${razorpaySubscriptionId}`)
    return
  }

  // Map Razorpay status to our status
  const newStatus = mapRazorpayStatus(subscriptionData.status)

  switch (eventType) {
    case 'subscription.authenticated':
    case 'subscription.activated':
      await handleSubscriptionActivated(subscription, newStatus, event, payload)
      break

    case 'subscription.charged':
      await handleSubscriptionCharged(subscription, newStatus, event, payload)
      break

    case 'subscription.pending':
      // Payment failed but retries in progress - KEEP premium access
      await handleSubscriptionPending(subscription, newStatus, event)
      break

    case 'subscription.halted':
      // All retries exhausted - REVOKE premium access
      // Per Razorpay docs: "invoices continue to be generated but no auto-charge is attempted"
      await handleSubscriptionHalted(subscription, newStatus, event)
      break

    case 'subscription.cancelled':
    case 'subscription.completed':
    case 'subscription.expired':
      await handleSubscriptionEnded(subscription, newStatus, event)
      break

    // Note: Users cannot pause - only subscribe or cancel.
    // These handlers exist in case admin pauses/resumes from Razorpay Dashboard.
    case 'subscription.paused':
      await handleSubscriptionPaused(subscription, newStatus, event)
      break

    case 'subscription.resumed':
      await handleSubscriptionResumed(subscription, newStatus, event, payload)
      break

    default:
      console.log(`[RazorpayWebhook] Unhandled event: ${eventType}`)
  }
}

function mapRazorpayStatus(razorpayStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    created: 'created',
    authenticated: 'authenticated',
    active: 'active',
    pending: 'pending',
    halted: 'halted',
    cancelled: 'cancelled',
    completed: 'completed',
    expired: 'expired',
    paused: 'paused',
  }
  return statusMap[razorpayStatus] || 'created'
}

interface SubscriptionRecord {
  id: string
  userId: string
  status: string
  lastGeneratedAt?: Date | null
  totalGenerations?: number
}

async function handleSubscriptionActivated(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  event: RazorpayWebhookEvent,
  payload: RazorpayWebhookPayload,
) {
  const subscriptionData = payload.subscription!.entity

  await db.transaction(async (tx) => {
    // Update subscription
    await tx
      .update(userSubscription)
      .set({
        status: newStatus,
        currentPeriodStart: subscriptionData.current_start
          ? new Date(subscriptionData.current_start * 1000)
          : null,
        currentPeriodEnd: subscriptionData.current_end
          ? new Date(subscriptionData.current_end * 1000)
          : null,
        razorpayCustomerId: subscriptionData.customer_id,
        razorpayData: subscriptionData as unknown as Record<string, unknown>,
      })
      .where(eq(userSubscription.id, subscription.id))

    // Create or update subscription bonus
    const existingBonus = await tx.query.userListBonus.findFirst({
      where: and(
        eq(userListBonus.userId, subscription.userId),
        eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
      ),
    })

    if (existingBonus) {
      await tx
        .update(userListBonus)
        .set({
          amount: LIST_LIMIT_CONFIG.SUBSCRIPTION_BONUS,
          isActive: true,
          expiresAt: subscriptionData.current_end
            ? new Date(subscriptionData.current_end * 1000)
            : null,
          description: 'Premium subscription',
        })
        .where(eq(userListBonus.id, existingBonus.id))
    } else {
      await tx.insert(userListBonus).values({
        userId: subscription.userId,
        bonusType: BONUS_TYPES.SUBSCRIPTION,
        amount: LIST_LIMIT_CONFIG.SUBSCRIPTION_BONUS,
        sourceId: subscription.id,
        description: 'Premium subscription',
        expiresAt: subscriptionData.current_end
          ? new Date(subscriptionData.current_end * 1000)
          : null,
        isActive: true,
      })
    }

    // Log event
    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      razorpayPaymentId: payload.payment?.entity?.id,
      payload: event as unknown as Record<string, unknown>,
    })
  })
}

async function handleSubscriptionCharged(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  event: RazorpayWebhookEvent,
  payload: RazorpayWebhookPayload,
) {
  const subscriptionData = payload.subscription!.entity

  await db.transaction(async (tx) => {
    // Update subscription period
    await tx
      .update(userSubscription)
      .set({
        status: newStatus,
        currentPeriodStart: subscriptionData.current_start
          ? new Date(subscriptionData.current_start * 1000)
          : null,
        currentPeriodEnd: subscriptionData.current_end
          ? new Date(subscriptionData.current_end * 1000)
          : null,
        razorpayData: subscriptionData as unknown as Record<string, unknown>,
      })
      .where(eq(userSubscription.id, subscription.id))

    // Update bonus expiry
    await tx
      .update(userListBonus)
      .set({
        expiresAt: subscriptionData.current_end
          ? new Date(subscriptionData.current_end * 1000)
          : null,
        isActive: true,
      })
      .where(
        and(
          eq(userListBonus.userId, subscription.userId),
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
        ),
      )

    // Log event
    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      razorpayPaymentId: payload.payment?.entity?.id,
      payload: event as unknown as Record<string, unknown>,
    })
  })
}

async function handleSubscriptionPending(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  event: RazorpayWebhookEvent,
) {
  // Payment failed but retries in progress - KEEP premium access
  // Per Razorpay docs: "We continue to retry the payment while it is in this state"
  await db.transaction(async (tx) => {
    await tx
      .update(userSubscription)
      .set({ status: newStatus })
      .where(eq(userSubscription.id, subscription.id))

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      payload: event as unknown as Record<string, unknown>,
    })
  })
}

async function handleSubscriptionHalted(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  event: RazorpayWebhookEvent,
) {
  // All payment retries exhausted - REVOKE premium access
  // Per Razorpay docs: "A Subscription goes to the halted state when the last
  // auto-charge is unsuccessful and all retries are exhausted"
  // Note: Invoices continue to be generated but no auto-charge is attempted
  await db.transaction(async (tx) => {
    await tx
      .update(userSubscription)
      .set({ status: newStatus })
      .where(eq(userSubscription.id, subscription.id))

    // Deactivate subscription bonus - user loses premium access
    await tx
      .update(userListBonus)
      .set({ isActive: false })
      .where(
        and(
          eq(userListBonus.userId, subscription.userId),
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
        ),
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      payload: event as unknown as Record<string, unknown>,
    })
  })
}

async function handleSubscriptionEnded(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  event: RazorpayWebhookEvent,
) {
  await db.transaction(async (tx) => {
    await tx
      .update(userSubscription)
      .set({
        status: newStatus,
        cancelledAt: new Date(),
      })
      .where(eq(userSubscription.id, subscription.id))

    // Deactivate subscription bonus
    await tx
      .update(userListBonus)
      .set({ isActive: false })
      .where(
        and(
          eq(userListBonus.userId, subscription.userId),
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
        ),
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      payload: event as unknown as Record<string, unknown>,
    })
  })
}

async function handleSubscriptionPaused(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  event: RazorpayWebhookEvent,
) {
  // Remove premium access when paused
  await db.transaction(async (tx) => {
    await tx
      .update(userSubscription)
      .set({ status: newStatus })
      .where(eq(userSubscription.id, subscription.id))

    await tx
      .update(userListBonus)
      .set({ isActive: false })
      .where(
        and(
          eq(userListBonus.userId, subscription.userId),
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
        ),
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      payload: event as unknown as Record<string, unknown>,
    })
  })
}

async function handleSubscriptionResumed(
  subscription: SubscriptionRecord,
  newStatus: SubscriptionStatus,
  event: RazorpayWebhookEvent,
  payload: RazorpayWebhookPayload,
) {
  // Restore premium access
  const subscriptionData = payload.subscription!.entity

  await db.transaction(async (tx) => {
    await tx
      .update(userSubscription)
      .set({
        status: newStatus,
        razorpayData: subscriptionData as unknown as Record<string, unknown>,
      })
      .where(eq(userSubscription.id, subscription.id))

    await tx
      .update(userListBonus)
      .set({ isActive: true })
      .where(
        and(
          eq(userListBonus.userId, subscription.userId),
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION),
        ),
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      payload: event as unknown as Record<string, unknown>,
    })
  })
}
