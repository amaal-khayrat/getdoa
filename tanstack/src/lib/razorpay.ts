import crypto from 'crypto'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!

const BASE_URL = 'https://api.razorpay.com/v1'

// Auth header for API calls
const getAuthHeader = () =>
  Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')

// Types
export interface RazorpaySubscription {
  id: string
  entity: 'subscription'
  plan_id: string
  customer_id?: string
  status:
    | 'created'
    | 'authenticated'
    | 'active'
    | 'pending'
    | 'halted'
    | 'paused'
    | 'cancelled'
    | 'expired'
    | 'completed'
  current_start?: number
  current_end?: number
  ended_at?: number
  quantity: number
  notes: Record<string, string>
  charge_at?: number
  offer_id?: string
  short_url: string
  has_scheduled_changes: boolean
  change_scheduled_at?: number
  source: string
  payment_method?: string
  created_at: number
  total_count: number
  paid_count: number
  customer_notify: number
  auth_attempts: number
}

export interface RazorpayPayment {
  id: string
  entity: 'payment'
  amount: number
  currency: string
  status: 'captured' | 'failed' | 'refunded'
  method: string
  description?: string
  bank?: string
  fee: number
  tax: number
  created_at: number
}

export interface RazorpayWebhookPayload {
  entity: 'event'
  account_id: string
  event: string
  contains: string[]
  payload: {
    subscription?: { entity: RazorpaySubscription }
    payment?: { entity: RazorpayPayment }
  }
  created_at: number
}

export interface CreateSubscriptionParams {
  planId: string
  totalCount: number
  customerId?: string
  notes?: Record<string, string>
  expireBy?: number
  customerNotify?: boolean
}

// Create subscription
export async function createSubscription(
  params: CreateSubscriptionParams,
): Promise<RazorpaySubscription> {
  const response = await fetch(`${BASE_URL}/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${getAuthHeader()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: params.planId,
      total_count: params.totalCount,
      customer_notify: params.customerNotify ? 1 : 0,
      notes: params.notes,
      ...(params.customerId && { customer_id: params.customerId }),
      ...(params.expireBy && { expire_by: params.expireBy }),
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.description || 'Failed to create subscription')
  }

  return response.json()
}

// Fetch subscription by ID
export async function getSubscription(
  subscriptionId: string,
): Promise<RazorpaySubscription> {
  const response = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Basic ${getAuthHeader()}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.description || 'Failed to fetch subscription')
  }

  return response.json()
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtCycleEnd = true,
): Promise<RazorpaySubscription> {
  const response = await fetch(
    `${BASE_URL}/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${getAuthHeader()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancel_at_cycle_end: cancelAtCycleEnd,
      }),
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.description || 'Failed to cancel subscription')
  }

  return response.json()
}

// Pause subscription
export async function pauseSubscription(
  subscriptionId: string,
): Promise<RazorpaySubscription> {
  const response = await fetch(
    `${BASE_URL}/subscriptions/${subscriptionId}/pause`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${getAuthHeader()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pause_at: 'now',
      }),
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.description || 'Failed to pause subscription')
  }

  return response.json()
}

// Resume subscription
export async function resumeSubscription(
  subscriptionId: string,
): Promise<RazorpaySubscription> {
  const response = await fetch(
    `${BASE_URL}/subscriptions/${subscriptionId}/resume`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${getAuthHeader()}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.description || 'Failed to resume subscription')
  }

  return response.json()
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not configured')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  } catch {
    return false
  }
}

// Parse webhook payload
export function parseWebhookPayload(body: string): RazorpayWebhookPayload {
  return JSON.parse(body)
}
