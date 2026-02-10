import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export { razorpay }

/**
 * Verify Razorpay webhook signature.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET!,
): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

/**
 * Create a Razorpay subscription.
 * @see https://razorpay.com/docs/api/subscriptions/#create-a-subscription
 *
 * Key parameters from Razorpay API:
 * - plan_id (required): The plan ID from Razorpay Dashboard
 * - total_count (required): Number of billing cycles
 * - quantity: Number of plan units (default: 1)
 * - start_at: Unix timestamp for future start (creates trial period)
 * - expire_by: Unix timestamp for auth payment expiry
 * - customer_notify: 1 = Razorpay sends emails, 0 = you handle it
 * - notes: Key-value pairs for reference
 */
export async function createSubscription(params: {
  planId: string
  totalCount: number
  quantity?: number
  startAt?: number // Unix timestamp for future start date (trial period)
  expireBy?: number // Unix timestamp for auth payment expiry
  customerNotify?: 0 | 1 // 1 = Razorpay notifies, 0 = business notifies
  notes?: Record<string, string>
}) {
  return razorpay.subscriptions.create({
    plan_id: params.planId,
    total_count: params.totalCount,
    quantity: params.quantity,
    start_at: params.startAt,
    expire_by: params.expireBy,
    customer_notify: params.customerNotify ?? 1, // Default: Razorpay handles notifications
    notes: params.notes,
  })
}

/**
 * Cancel a Razorpay subscription.
 * @param subscriptionId - The Razorpay subscription ID
 * @param cancelAtCycleEnd - true = cancel at end of billing cycle, false = cancel immediately
 * @see https://razorpay.com/docs/api/subscriptions/#cancel-a-subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtCycleEnd: boolean = true,
) {
  // Razorpay SDK cancel accepts subscription ID and cancel_at_cycle_end boolean
  // POST /v1/subscriptions/:id/cancel with { cancel_at_cycle_end: boolean }
  return razorpay.subscriptions.cancel(subscriptionId, cancelAtCycleEnd)
}

/**
 * Fetch subscription details from Razorpay.
 */
export async function fetchSubscription(subscriptionId: string) {
  return razorpay.subscriptions.fetch(subscriptionId)
}
