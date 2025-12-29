# Razorpay Curlec Subscription Integration

This document describes the complete Razorpay Curlec subscription flow for GetDoa's Unlimited Access tier.

## Overview

- **Provider**: Razorpay Curlec (Malaysia)
- **Currency**: MYR (Malaysian Ringgit)
- **Plan ID**: `plan_RxFbky3H771io5`
- **Billing Cycle**: Monthly
- **Payment Methods**: FPX, Cards (Visa/Mastercard), E-wallets (Touch n Go, GrabPay, Boost, ShopeePay)

## Subscription Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUBSCRIPTION LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. User clicks "Subscribe" on Pricing page                             │
│           ↓                                                              │
│  2. Backend: POST /v1/subscriptions (creates subscription)              │
│           ↓                                                              │
│  3. User redirected to Razorpay checkout (short_url)                    │
│           ↓                                                              │
│  4. User completes payment (FPX/Card/E-wallet)                          │
│           ↓                                                              │
│  5. Webhook: subscription.authenticated                                  │
│           ↓                                                              │
│  6. Webhook: subscription.activated                                      │
│           ↓                                                              │
│  7. Subscription ACTIVE → User gets unlimited access                    │
│           ↓                                                              │
│  8. Monthly: Razorpay auto-charges → Webhook: subscription.charged      │
│           ↓                                                              │
│  9. End of subscription: Webhook: subscription.completed                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Subscription States

| State | Description | Triggered By |
|-------|-------------|--------------|
| `created` | Initial state when subscription is established | Subscription creation via API |
| `authenticated` | Customer completes authentication transaction | First successful payment |
| `active` | Billing cycle begins, charges are occurring | Payment confirmed |
| `pending` | Auto-charge failed but retries continue | Payment attempt failure |
| `halted` | All retry attempts exhausted | Final retry failure |
| `paused` | Subscription temporarily stopped | User initiates pause |
| `cancelled` | Subscription permanently ended | User cancels |
| `expired` | Start date deadline missed | Auth not completed by `start_at` |
| `completed` | All billing cycles finished | Reached `total_count` |

### State Transitions

```
Normal Flow:
  created → authenticated → active → completed

Failure Path:
  active → pending → halted

Recovery:
  pending/halted → active (new card authenticated)

Pause Flow:
  active → paused → active (resumed)
```

## Webhook Events

Razorpay sends webhook notifications for subscription lifecycle events.

### Event Types

| Event | Description | Contains |
|-------|-------------|----------|
| `subscription.authenticated` | First payment completed | Subscription entity |
| `subscription.activated` | Subscription now active | Subscription + Payment |
| `subscription.charged` | Successful recurring charge | Subscription + Payment |
| `subscription.completed` | All invoices generated | Subscription + Payment |
| `subscription.updated` | Subscription modified | Subscription entity |
| `subscription.pending` | Charge failed, retrying | Subscription entity |
| `subscription.halted` | All retries exhausted | Subscription entity |
| `subscription.paused` | User paused subscription | Subscription entity |
| `subscription.resumed` | Resumed from pause | Subscription entity |
| `subscription.cancelled` | Subscription cancelled | Subscription entity |

### Webhook Payload Structure

```json
{
  "entity": "event",
  "account_id": "acc_xxxxx",
  "event": "subscription.authenticated",
  "contains": ["subscription"],
  "payload": {
    "subscription": {
      "entity": {
        "id": "sub_xxxxx",
        "entity": "subscription",
        "plan_id": "plan_RxFbky3H771io5",
        "customer_id": "cust_xxxxx",
        "status": "authenticated",
        "current_start": 1234567890,
        "current_end": 1234567890,
        "ended_at": null,
        "quantity": 1,
        "notes": {},
        "charge_at": 1234567890,
        "offer_id": null,
        "short_url": "https://rzp.io/i/xxxxx",
        "has_scheduled_changes": false,
        "change_scheduled_at": null,
        "source": "api",
        "payment_method": "card",
        "created_at": 1234567890,
        "total_count": 12,
        "paid_count": 1,
        "customer_notify": 1,
        "auth_attempts": 0
      }
    },
    "payment": {
      "entity": {
        "id": "pay_xxxxx",
        "amount": 1990,
        "currency": "MYR",
        "status": "captured",
        "method": "fpx",
        "description": "Subscription payment",
        "bank": "maybank2u",
        "fee": 50,
        "tax": 0,
        "created_at": 1234567890
      }
    }
  },
  "created_at": 1234567890
}
```

### Webhook Signature Verification

Razorpay signs all webhook payloads using HMAC-SHA256.

**Algorithm**: HMAC-SHA256
**Header**: `X-Razorpay-Signature`

```typescript
import crypto from "crypto";

function verifyWebhookSignature(
  body: string,      // RAW request body (do not parse)
  signature: string, // X-Razorpay-Signature header
  secret: string     // Webhook secret from Razorpay dashboard
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Important**: Use the RAW request body. Do not parse or cast before verification.

## API Endpoints

### Create Subscription

```bash
POST https://api.razorpay.com/v1/subscriptions

# Headers
Authorization: Basic base64(key_id:key_secret)
Content-Type: application/json

# Body
{
  "plan_id": "plan_RxFbky3H771io5",
  "total_count": 12,
  "customer_notify": 1,
  "notes": {
    "user_id": "user_xxxxx",
    "email": "user@example.com"
  }
}

# Response
{
  "id": "sub_xxxxx",
  "entity": "subscription",
  "plan_id": "plan_RxFbky3H771io5",
  "status": "created",
  "short_url": "https://rzp.io/i/xxxxx",
  ...
}
```

### Cancel Subscription

```bash
POST https://api.razorpay.com/v1/subscriptions/{sub_id}/cancel

# Body
{
  "cancel_at_cycle_end": true
}
```

### Fetch Subscription

```bash
GET https://api.razorpay.com/v1/subscriptions/{sub_id}
```

### Pause Subscription

```bash
POST https://api.razorpay.com/v1/subscriptions/{sub_id}/pause

# Body
{
  "pause_at": "now"
}
```

### Resume Subscription

```bash
POST https://api.razorpay.com/v1/subscriptions/{sub_id}/resume
```

## Environment Variables

```env
# Razorpay API Credentials (from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxx       # Test mode key
RAZORPAY_KEY_SECRET=xxxxx            # Test mode secret
RAZORPAY_WEBHOOK_SECRET=xxxxx        # Webhook signing secret
RAZORPAY_PLAN_ID=plan_RxFbky3H771io5 # Monthly subscription plan
```

## Database Schema

### Subscription Table

```sql
CREATE TABLE subscription (
  id TEXT PRIMARY KEY,                    -- Razorpay sub_xxxxx
  user_id TEXT NOT NULL REFERENCES user(id),
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  charge_at TIMESTAMP,
  total_count INTEGER,
  paid_count INTEGER DEFAULT 0,
  short_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Payment Table

```sql
CREATE TABLE payment (
  id TEXT PRIMARY KEY,                    -- Razorpay pay_xxxxx
  subscription_id TEXT REFERENCES subscription(id),
  user_id TEXT NOT NULL REFERENCES user(id),
  amount INTEGER NOT NULL,                -- In sen (smallest unit)
  currency TEXT DEFAULT 'MYR',
  status TEXT NOT NULL,
  method TEXT,                            -- fpx, card, wallet
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### Test Mode

Use Razorpay test credentials (prefix `rzp_test_`).

### Test Cards

| Card Number | Type |
|-------------|------|
| `4111 1111 1111 1111` | Visa (Success) |
| `5555 5555 5555 4444` | Mastercard (Success) |
| `4000 0000 0000 0002` | Visa (Decline) |

### Test FPX

In test mode, FPX will simulate successful payments.

### Webhook Testing

Use ngrok to expose local webhook endpoint:

```bash
ngrok http 3000
# Configure webhook URL in Razorpay Dashboard:
# https://xxxxx.ngrok.io/api/webhooks/razorpay
```

## Implementation Files

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Subscription & payment tables |
| `src/lib/razorpay.ts` | Razorpay API client |
| `src/lib/subscription.ts` | Subscription helper functions |
| `src/routes/api/subscriptions/create.ts` | Create subscription endpoint |
| `src/routes/api/subscriptions/current.ts` | Get current subscription |
| `src/routes/api/subscriptions/cancel.ts` | Cancel subscription |
| `src/routes/api/webhooks/razorpay.ts` | Webhook handler |
| `src/hooks/useSubscription.ts` | React hook for subscription state |

## Feature Access Control

```typescript
// Check if user has active subscription
async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await db.query.subscription.findFirst({
    where: and(
      eq(subscription.userId, userId),
      inArray(subscription.status, ["authenticated", "active"])
    ),
  });
  return !!sub;
}

// Feature gating example
if (await hasActiveSubscription(userId)) {
  // Allow unlimited access features
} else {
  // Restrict to free tier limits
}
```

## Unlimited Access Features

When subscription is active, user gets:
- Up to 50 doa lists (vs 1 for free)
- Custom background images
- Custom fonts
- Priority support
