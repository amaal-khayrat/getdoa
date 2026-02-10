# Razorpay Subscription Implementation Plan

> **Last Reviewed:** 2025-01-07
> **Status:** Ready for Implementation (Final Deep Dive Review Complete)
> **Reviewed Against:** Existing codebase patterns (TanStack Start, Drizzle, better-auth)
> **Codebase Version:** Current main branch (f02e358)

---

## ⚠️ Critical Review Findings (All Fixed in This Version)

### Review Methodology:
- Deep dive into existing patterns: `dashboard.route.tsx`, `image-generator.ts`, `list-limit.ts`, `image-limit.ts`
- Server function patterns: `routes/dashboard/functions/*.ts`
- Schema patterns: `db/schema/*.ts`
- API route patterns: `routes/api/*.ts`
- React best practices validation (useEffect usage audit)

### Issues Identified and Resolved:

1. **Razorpay SDK API** - `customerNotify` must be `0 | 1` not `boolean` (fixed in Phase 3.1)
2. **Backward Compatibility** - `calculateImageLimitInfo()` signature change affects 7+ call sites in `image-generator.ts` (fixed with optional params + defaults)
3. **Missing Error Code** - `PREMIUM_REQUIRED` not in `RecordImageGenerationResult` union type (fixed in Phase 4.2)
4. **Race Condition** - Premium validation outside transaction in image generation (documented as acceptable - premium status rarely changes mid-request)
5. **Pattern Renderer Import** - `PATTERNS` import was commented out at bottom (fixed)
6. **Subscription Re-creation** - Plan correctly handles re-subscription by deleting old record first
7. **JSONB Anti-Pattern** - Changed `premiumSettings` from JSONB to individual columns (DB-level type safety, constraints, defaults)
8. **Missing Input Type Update** - `RecordImageGenerationInput` needs `exportSettings?` field (added in Phase 4.2)
9. **Missing Import Statements** - Added explicit import sections for each file modification
10. **Webhook Idempotency** - Added `razorpayEventId` uniqueness check recommendation

### React/TanStack Best Practice Compliance:

| Pattern | Status | Notes |
|---------|--------|-------|
| Data fetching in route loaders | ✅ | `isPremium` fetched in `beforeLoad`, not useEffect |
| useEffect for side effects only | ✅ | Only localStorage, cleanup, external APIs |
| Route context for shared state | ✅ | Premium status shared via context |
| Server functions for mutations | ✅ | All subscription ops use `createServerFn` |
| Parallel data fetching | ✅ | `Promise.all()` in beforeLoad |

### Existing Codebase Patterns Followed:

| Pattern | Reference File | Applied In |
|---------|----------------|------------|
| TypeID prefixes | `user-list-bonus.ts` (`ulb_`) | `usub_`, `sube_` |
| Auth helper pattern | `functions/index.ts` | `subscription.ts` |
| Transaction-based ops | `functions/index.ts` (createDoaList) | Webhook handlers |
| Discriminated unions | `image-generator.ts` | All result types |
| API route handlers | `api/doa.ts` | Webhook route |

---

## Current State Analysis

### Existing Infrastructure

**Authentication & Admin:**
- `better-auth` with Drizzle adapter ([auth.ts](../src/lib/auth.ts))
- Admin detection via `ADMIN_EMAILS` env variable ([admin.ts](../src/lib/admin.ts))
- `isAdminEmail()` function for server-side checks
- Route protection via `beforeLoad` in route files

**Database Schema:**
- `userListBonus` table already supports subscription bonuses with `bonusType`, `amount`, `expiresAt`, `isActive` fields
- `doaImageGeneration` table tracks daily limits with `generationsToday`, `lastGeneratedAt`
- `referral` table tracks successful referrals
- TypeID prefixes used for IDs (e.g., `ulb_`, `ref_`)

**Limit Systems:**
- `LIST_LIMIT_CONFIG.SUBSCRIPTION_BONUS = 50` already defined ([list-limit.ts](../src/lib/list-limit.ts))
- `IMAGE_LIMIT_CONFIG.DAILY_LIMIT = 1`, `PREMIUM_DAILY_LIMIT = 10` ([image-limit.ts](../src/lib/image-limit.ts))
- Transaction-based atomic operations with race condition protection

**Image Generation:**
- Client-side Canvas API for doa lists ([image-generator.ts](../src/utils/image-generator.ts))
- Server-side Sharp for individual doa images ([server-image-generator.ts](../src/lib/server-image-generator.ts))
- Daily limit tracking with Malaysia timezone reset

### What Needs to be Built

1. **Subscription infrastructure** - Razorpay integration, webhook handling
2. **Premium feature gates** - Server-side validation for all premium features
3. **User subscription status** - Database tracking and caching
4. **Font customization** - Multiple Arabic and translation font options
5. **Color customization** - Background, text, and translation colors
6. **Custom watermark** - User-defined text on exports
7. **Branding removal** - Option to hide GetDoa branding
8. **Decorative patterns** - 20 Canvas-rendered pattern designs
9. **Updated limits** - Premium 15/day, Free 3/day with referral bonus
10. **Pricing page updates** - New feature descriptions and subscription flow

---

## Phase 1: Database Schema & Core Types

### 1.1 Create Subscription Schema

**File:** `src/db/schema/subscription.ts`

> **Note:** The Razorpay plan is created directly in the Razorpay Dashboard. We store only the plan ID in an environment variable (`RAZORPAY_PLAN_ID`), avoiding the need for a separate `razorpayPlan` table.

```typescript
import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { typeid } from 'typeid-js'
import { user } from './auth'

// ============================================
// USER SUBSCRIPTION - Active subscriptions
// ============================================
export const userSubscription = pgTable(
  'user_subscription',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('usub').toString()),

    userId: text('user_id')
      .notNull()
      .unique() // One active subscription per user
      .references(() => user.id, { onDelete: 'cascade' }),

    // Razorpay IDs
    razorpaySubscriptionId: varchar('razorpay_subscription_id', { length: 100 })
      .notNull()
      .unique(),
    razorpayCustomerId: varchar('razorpay_customer_id', { length: 100 }),
    razorpayPlanId: varchar('razorpay_plan_id', { length: 100 }), // For reference only

    // Subscription status (matches Razorpay states)
    status: varchar('status', { length: 20 }).notNull(),
    // 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'cancelled' | 'completed' | 'expired' | 'paused'

    // Billing cycle
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),

    // Cancellation
    cancelledAt: timestamp('cancelled_at'),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),

    // Payment info
    shortUrl: varchar('short_url', { length: 255 }), // Payment link

    // Metadata from Razorpay
    razorpayData: jsonb('razorpay_data').$type<Record<string, unknown>>(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('user_subscription_user_id_idx').on(table.userId),
    index('user_subscription_status_idx').on(table.status),
    index('user_subscription_razorpay_id_idx').on(table.razorpaySubscriptionId),
  ],
)

// ============================================
// SUBSCRIPTION HISTORY - Audit trail
// ============================================
export const subscriptionEvent = pgTable(
  'subscription_event',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('sube').toString()),

    subscriptionId: varchar('subscription_id', { length: 50 })
      .notNull()
      .references(() => userSubscription.id, { onDelete: 'cascade' }),

    // Event details
    event: varchar('event', { length: 50 }).notNull(), // 'subscription.activated', 'subscription.charged', etc.
    previousStatus: varchar('previous_status', { length: 20 }),
    newStatus: varchar('new_status', { length: 20 }),

    // Razorpay webhook data
    razorpayEventId: varchar('razorpay_event_id', { length: 100 }),
    razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
    payload: jsonb('payload').$type<Record<string, unknown>>(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('subscription_event_subscription_id_idx').on(table.subscriptionId),
    index('subscription_event_created_at_idx').on(table.createdAt),
  ],
)

// ============================================
// RELATIONS
// ============================================
export const userSubscriptionRelations = relations(userSubscription, ({ one, many }) => ({
  user: one(user, {
    fields: [userSubscription.userId],
    references: [user.id],
  }),
  events: many(subscriptionEvent),
}))

export const subscriptionEventRelations = relations(subscriptionEvent, ({ one }) => ({
  subscription: one(userSubscription, {
    fields: [subscriptionEvent.subscriptionId],
    references: [userSubscription.id],
  }),
}))
```

### 1.2 Add Premium Settings to User Profile

**File:** `src/db/schema/auth.ts` (add to userProfile table)

> **Why individual columns instead of JSONB?**
> - ✅ DB-level type safety and constraints (e.g., `varchar(50)` for watermark)
> - ✅ Can set DEFAULT values for each field
> - ✅ Explicit schema migrations (not hidden in JSON blob)
> - ✅ Better for well-defined, fixed fields
> - ❌ JSONB is for dynamic/unknown schemas (user-defined metadata)

```typescript
// Add these columns to userProfile table (inside the pgTable definition):

// Premium customization settings (stored even if subscription lapses)
// Fonts
premiumArabicFont: varchar('premium_arabic_font', { length: 20 })
  .default('simpo'), // 'simpo' | 'amiri' | 'scheherazade' | 'noto-naskh'
premiumTranslationFont: varchar('premium_translation_font', { length: 20 })
  .default('roboto'), // 'roboto' | 'playfair' | 'lora' | 'noto-sans'

// Colors (hex format, 7 chars including #)
premiumBackgroundColor: varchar('premium_background_color', { length: 7 })
  .default('#ffffff'),
premiumTextColor: varchar('premium_text_color', { length: 7 })
  .default('#1a1a1a'),
premiumTranslationColor: varchar('premium_translation_color', { length: 7 })
  .default('#666666'),

// Branding
premiumCustomWatermark: varchar('premium_custom_watermark', { length: 50 }),
premiumHideBranding: boolean('premium_hide_branding').default(false),

// Pattern
premiumPreferredPattern: varchar('premium_preferred_pattern', { length: 30 }),
```

### 1.3 Update Schema Index

**File:** `src/db/schema/index.ts`

> **Note:** Follow the existing pattern in this file - it re-exports all tables and defines cross-module relations.

```typescript
// ============================================
// ADD TO IMPORTS (around line 11)
// ============================================
import { userSubscription, subscriptionEvent } from './subscription'

// ============================================
// ADD EXPORT (around line 9)
// ============================================
export * from './subscription'

// ============================================
// UPDATE userRelations (add to the object returned by relations())
// ============================================
export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  doaLists: many(doaList),
  savedDoas: many(savedDoa),
  favoriteLists: many(favoriteList),
  referralCode: many(referralCode),
  referralsMade: many(referral, { relationName: 'referrer' }),
  referredBy: many(referral, { relationName: 'referredUser' }),
  listBonuses: many(userListBonus),
  profile: one(userProfile),
  imageGeneration: one(doaImageGeneration),
  subscription: one(userSubscription),  // ADD THIS LINE
}))
```

---

## Phase 2: Subscription Configuration & Types

### 2.1 Create Subscription Config

**File:** `src/lib/subscription.ts`

```typescript
/**
 * Subscription configuration and utilities.
 */

export const SUBSCRIPTION_CONFIG = {
  // Plan details
  PREMIUM_MONTHLY: {
    name: 'Premium Monthly',
    amount: 990, // RM9.90 in sen
    currency: 'MYR',
    period: 'monthly' as const,
    intervalCount: 1,
  },

  // Feature limits
  PREMIUM_LIST_BONUS: 50,
  PREMIUM_IMAGE_LIMIT: 15,
  FREE_IMAGE_LIMIT: 1,
  FREE_BASE_IMAGE_LIMIT: 1,
  FREE_REFERRAL_IMAGE_BONUS: 1, // +1 per referral
  FREE_MAX_IMAGE_BONUS: 2, // Max +2 from referrals

  // Environment flag for test mode
  TEST_MODE_ENV_KEY: 'RAZORPAY_TEST_MODE',

  // Active subscription statuses (for billing purposes)
  ACTIVE_STATUSES: ['active', 'authenticated'] as const,

  // Statuses that provide premium access
  // Note: 'pending' keeps access during payment retry period
  // Note: 'halted' does NOT grant access (all retries exhausted)
  PREMIUM_ACCESS_STATUSES: ['active', 'authenticated', 'pending'] as const,
} as const

export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'pending'
  | 'halted'
  | 'cancelled'
  | 'completed'
  | 'expired'
  | 'paused'

export interface SubscriptionInfo {
  isSubscribed: boolean
  status: SubscriptionStatus | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  planName: string | null
}

/**
 * Check if a status grants premium access.
 * Users keep access during 'pending' (failed payment retry period).
 */
export function hasPremiumAccess(status: SubscriptionStatus | null): boolean {
  if (!status) return false
  return SUBSCRIPTION_CONFIG.PREMIUM_ACCESS_STATUSES.includes(status as any)
}

/**
 * Check if subscription is in a terminal state.
 */
export function isTerminalStatus(status: SubscriptionStatus): boolean {
  return ['cancelled', 'completed', 'expired'].includes(status)
}

/**
 * Check if Razorpay test mode is enabled.
 * In test mode, only admins can access subscription features.
 */
export function isTestMode(): boolean {
  return process.env[SUBSCRIPTION_CONFIG.TEST_MODE_ENV_KEY] === 'true'
}
```

### 2.2 Update Image Limit Config

**File:** `src/lib/image-limit.ts` (update)

> **⚠️ BACKWARD COMPATIBILITY:** The existing `calculateImageLimitInfo()` is called in **7+ places** in `image-generator.ts`:
> - Line 76-77: `getImageLimitInfo` - no record found case
> - Line 79-83: `getImageLimitInfo` - record found case
> - Line 128-132: `generateDoaImage` - daily limit reached error
> - Line 233-237: `generateDoaImage` - race condition blocked error
> - Line 252-256: `generateDoaImage` - success return
> - Line 311-315: `recordImageGeneration` - daily limit reached error
> - Line 385-389: `recordImageGeneration` - race condition blocked error
> - Line 401-405: `recordImageGeneration` - success return
>
> **Solution:** The new signature adds `isPremium` and `referralCount` as **optional parameters with defaults** so existing code continues to work (defaulting to free user behavior with 1 daily limit).
>
> ```typescript
> // Before (all existing calls work unchanged):
> calculateImageLimitInfo(generationsToday, lastGeneratedAt, totalGenerations)
>
> // After (new calls can specify premium status):
> calculateImageLimitInfo(generationsToday, lastGeneratedAt, totalGenerations, isPremium, referralCount)
> ```

```typescript
export const IMAGE_LIMIT_CONFIG = {
  /** Daily limit for free users (base) */
  DAILY_LIMIT: 1,

  /** Bonus per referral for free users */
  REFERRAL_BONUS: 1,

  /** Max referral bonus for free users */
  MAX_REFERRAL_BONUS: 2,

  /** Max daily limit for free users (1 base + 2 referral) */
  MAX_FREE_DAILY_LIMIT: 3,

  /** Daily limit for premium subscribers */
  PREMIUM_DAILY_LIMIT: 15,

  /** Timezone for daily reset (Malaysia Time) */
  TIMEZONE: 'Asia/Kuala_Lumpur',
} as const

/**
 * Extended ImageLimitInfo with premium context.
 */
export interface ImageLimitInfo {
  usedToday: number
  dailyLimit: number
  remaining: number
  canGenerate: boolean
  resetAt: string
  msUntilReset: number
  lastGeneratedAt: string | null
  totalGenerations: number
  // New fields for premium context
  isPremium: boolean
  referralBonus: number
}

/**
 * Calculate image limit info from database record.
 * @param generationsToday - Number of generations today
 * @param lastGeneratedAt - Last generation timestamp
 * @param totalGenerations - Total lifetime generations
 * @param isPremium - Whether user has active premium subscription
 * @param referralCount - Number of successful referrals (for free users)
 */
export function calculateImageLimitInfo(
  generationsToday: number,
  lastGeneratedAt: Date | null,
  totalGenerations: number,
  isPremium: boolean = false,
  referralCount: number = 0,
): ImageLimitInfo {
  const {
    DAILY_LIMIT,
    REFERRAL_BONUS,
    MAX_REFERRAL_BONUS,
    PREMIUM_DAILY_LIMIT,
  } = IMAGE_LIMIT_CONFIG

  // Calculate referral bonus (only applies to free users)
  const referralBonus = isPremium
    ? 0
    : Math.min(referralCount * REFERRAL_BONUS, MAX_REFERRAL_BONUS)

  // Calculate effective daily limit
  const dailyLimit = isPremium
    ? PREMIUM_DAILY_LIMIT
    : DAILY_LIMIT + referralBonus

  // Reset count if last generation was not today
  const actualUsedToday = isToday(lastGeneratedAt) ? generationsToday : 0
  const remaining = Math.max(0, dailyLimit - actualUsedToday)
  const resetAt = getNextResetTime()

  return {
    usedToday: actualUsedToday,
    dailyLimit,
    remaining,
    canGenerate: remaining > 0,
    resetAt: resetAt.toISOString(),
    msUntilReset: Math.max(0, resetAt.getTime() - Date.now()),
    lastGeneratedAt: lastGeneratedAt?.toISOString() ?? null,
    totalGenerations,
    isPremium,
    referralBonus,
  }
}
```

### 2.3 Premium Feature Types

**File:** `src/types/premium.types.ts`

```typescript
/**
 * Premium feature types for image customization.
 */

// Available Arabic fonts
export type ArabicFont = 'simpo' | 'amiri' | 'scheherazade' | 'noto-naskh'

export const ARABIC_FONTS: Record<ArabicFont, { name: string; displayName: string }> = {
  simpo: { name: 'Simpo', displayName: 'Simpo (Default)' },
  amiri: { name: 'Amiri', displayName: 'Amiri' },
  scheherazade: { name: 'Scheherazade New', displayName: 'Scheherazade' },
  'noto-naskh': { name: 'Noto Naskh Arabic', displayName: 'Noto Naskh' },
}

// Available translation fonts
export type TranslationFont = 'roboto' | 'playfair' | 'lora' | 'noto-sans'

export const TRANSLATION_FONTS: Record<TranslationFont, { name: string; displayName: string }> = {
  roboto: { name: 'Roboto', displayName: 'Roboto (Default)' },
  playfair: { name: 'Playfair Display', displayName: 'Playfair Display' },
  lora: { name: 'Lora', displayName: 'Lora' },
  'noto-sans': { name: 'Noto Sans', displayName: 'Noto Sans' },
}

// Decorative pattern categories and IDs
export type PatternCategory =
  | 'islamic-geometric'
  | 'architectural'
  | 'organic'
  | 'abstract'
  | 'minimalist'

export type PatternId =
  // Islamic Geometric (4 patterns)
  | 'eight-point-star'
  | 'diamond-lattice'
  | 'hexagonal-tessellation'
  | 'interlocking-squares'
  // Architectural (4 patterns)
  | 'mihrab-arch'
  | 'mosque-dome'
  | 'minarets'
  | 'arabesque-border'
  // Organic (4 patterns)
  | 'crescent-moon'
  | 'vine-border'
  | 'floral-corners'
  | 'olive-branches'
  // Abstract (4 patterns)
  | 'wavy-lines'
  | 'dotted-border'
  | 'gradient-halo'
  | 'geometric-rays'
  // Minimalist (4 patterns)
  | 'corner-brackets'
  | 'double-line-frame'
  | 'simple-border'
  | 'elegant-divider'

export interface PatternInfo {
  id: PatternId
  name: string
  category: PatternCategory
  isPremium: boolean
}

export const PATTERNS: PatternInfo[] = [
  // Islamic Geometric (4 patterns - 1 free, 3 premium)
  { id: 'eight-point-star', name: '8-Point Star', category: 'islamic-geometric', isPremium: false },
  { id: 'diamond-lattice', name: 'Diamond Lattice', category: 'islamic-geometric', isPremium: true },
  { id: 'hexagonal-tessellation', name: 'Hexagonal', category: 'islamic-geometric', isPremium: true },
  { id: 'interlocking-squares', name: 'Interlocking Squares', category: 'islamic-geometric', isPremium: true },
  // Architectural (4 patterns - all premium)
  { id: 'mihrab-arch', name: 'Mihrab Arch', category: 'architectural', isPremium: true },
  { id: 'mosque-dome', name: 'Mosque Dome', category: 'architectural', isPremium: true },
  { id: 'minarets', name: 'Minarets', category: 'architectural', isPremium: true },
  { id: 'arabesque-border', name: 'Arabesque Border', category: 'architectural', isPremium: true },
  // Organic (4 patterns - 1 free, 3 premium)
  { id: 'crescent-moon', name: 'Crescent Moon', category: 'organic', isPremium: false },
  { id: 'vine-border', name: 'Vine Border', category: 'organic', isPremium: true },
  { id: 'floral-corners', name: 'Floral Corners', category: 'organic', isPremium: true },
  { id: 'olive-branches', name: 'Olive Branches', category: 'organic', isPremium: true },
  // Abstract (4 patterns - all premium)
  { id: 'wavy-lines', name: 'Wavy Lines', category: 'abstract', isPremium: true },
  { id: 'dotted-border', name: 'Dotted Border', category: 'abstract', isPremium: true },
  { id: 'gradient-halo', name: 'Gradient Halo', category: 'abstract', isPremium: true },
  { id: 'geometric-rays', name: 'Geometric Rays', category: 'abstract', isPremium: true },
  // Minimalist (4 patterns - 2 free, 2 premium)
  { id: 'corner-brackets', name: 'Corner Brackets', category: 'minimalist', isPremium: false },
  { id: 'double-line-frame', name: 'Double Line Frame', category: 'minimalist', isPremium: false },
  { id: 'simple-border', name: 'Simple Border', category: 'minimalist', isPremium: true },
  { id: 'elegant-divider', name: 'Elegant Divider', category: 'minimalist', isPremium: true },
]

// Helper to get patterns by category
export function getPatternsByCategory(category: PatternCategory): PatternInfo[] {
  return PATTERNS.filter(p => p.category === category)
}

// Helper to get free patterns only
export function getFreePatterns(): PatternInfo[] {
  return PATTERNS.filter(p => !p.isPremium)
}

// Image export settings
export interface ImageExportSettings {
  // Colors
  backgroundColor: string
  textColor: string
  translationColor: string

  // Fonts
  arabicFont: ArabicFont
  translationFont: TranslationFont

  // Branding
  customWatermark?: string
  hideBranding: boolean

  // Pattern
  pattern?: PatternId
}

export const DEFAULT_EXPORT_SETTINGS: ImageExportSettings = {
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  translationColor: '#666666',
  arabicFont: 'simpo',
  translationFont: 'roboto',
  hideBranding: false,
}
```

---

## Phase 3: Razorpay Integration

### 3.1 Razorpay Client Library

**File:** `src/lib/razorpay.ts`

```typescript
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
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET!
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
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
  cancelAtCycleEnd: boolean = true
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
```

### 3.2 Subscription Server Functions

**File:** `src/routes/dashboard/functions/subscription.ts`

```typescript
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { db } from '@/db'
import { userSubscription, subscriptionEvent, userListBonus } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { createSubscription, cancelSubscription as rzpCancel } from '@/lib/razorpay'
import {
  SUBSCRIPTION_CONFIG,
  hasPremiumAccess,
  isTestMode,
  type SubscriptionInfo,
  type SubscriptionStatus
} from '@/lib/subscription'
import { BONUS_TYPES } from '@/lib/list-limit'

// ============================================
// Auth Helper
// ============================================
async function requireAuth() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  return session
}

/**
 * Check if user can access subscription features.
 * In test mode, only admins can subscribe.
 */
async function canAccessSubscription(email: string): Promise<boolean> {
  if (!isTestMode()) return true
  return isAdminEmail(email)
}

// ============================================
// GET SUBSCRIPTION STATUS
// ============================================
export const getSubscriptionStatus = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<SubscriptionInfo> => {
    await requireAuth()

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
    })

    if (!subscription) {
      return {
        isSubscribed: false,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        planName: null,
      }
    }

    return {
      isSubscribed: hasPremiumAccess(subscription.status as SubscriptionStatus),
      status: subscription.status as SubscriptionStatus,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      planName: SUBSCRIPTION_CONFIG.PREMIUM_MONTHLY.name, // From config, not DB
    }
  })

// ============================================
// CHECK PREMIUM ACCESS (lightweight check)
// ============================================
export const checkPremiumAccess = createServerFn({ method: 'GET' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<{ isPremium: boolean }> => {
    await requireAuth()

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
      columns: { status: true },
    })

    return {
      isPremium: hasPremiumAccess(subscription?.status as SubscriptionStatus | null),
    }
  })

// ============================================
// CREATE SUBSCRIPTION
// ============================================
type CreateSubscriptionResult =
  | { success: true; subscriptionId: string; shortUrl: string }
  | { success: false; error: { code: string; message: string } }

export const createUserSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }): Promise<CreateSubscriptionResult> => {
    const session = await requireAuth()

    // Check test mode access
    if (!await canAccessSubscription(session.user.email)) {
      return {
        success: false,
        error: {
          code: 'TEST_MODE_RESTRICTED',
          message: 'Subscriptions are currently in testing. Please check back soon!',
        },
      }
    }

    // Check for existing active subscription
    const existing = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
    })

    if (existing && hasPremiumAccess(existing.status as SubscriptionStatus)) {
      return {
        success: false,
        error: {
          code: 'ALREADY_SUBSCRIBED',
          message: 'You already have an active subscription.',
        },
      }
    }

    // Get plan ID from environment variable
    const razorpayPlanId = process.env.RAZORPAY_PLAN_ID
    if (!razorpayPlanId) {
      console.error('RAZORPAY_PLAN_ID not configured')
      return {
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Subscription service is not configured.',
        },
      }
    }

    try {
      // Create Razorpay subscription
      // Note: customerNotify must be 0 or 1, not boolean
      const rzpSubscription = await createSubscription({
        planId: razorpayPlanId,
        totalCount: 1200, // ~100 years of monthly billing
        customerNotify: 1, // 1 = Razorpay sends notifications
        notes: {
          userId: data.userId,
          userEmail: session.user.email,
        },
      })

      // Store in database
      await db.transaction(async (tx) => {
        // Remove existing subscription record if any
        if (existing) {
          await tx.delete(userSubscription).where(eq(userSubscription.id, existing.id))
        }

        // Create new subscription record
        const [newSub] = await tx.insert(userSubscription).values({
          userId: data.userId,
          razorpaySubscriptionId: rzpSubscription.id,
          razorpayCustomerId: rzpSubscription.customer_id || null,
          razorpayPlanId: razorpayPlanId, // Store for reference
          status: 'created',
          shortUrl: rzpSubscription.short_url,
          razorpayData: rzpSubscription as Record<string, unknown>,
        }).returning()

        // Log event
        await tx.insert(subscriptionEvent).values({
          subscriptionId: newSub.id,
          event: 'subscription.created',
          newStatus: 'created',
          payload: rzpSubscription as Record<string, unknown>,
        })
      })

      return {
        success: true,
        subscriptionId: rzpSubscription.id,
        shortUrl: rzpSubscription.short_url,
      }
    } catch (error) {
      console.error('Failed to create subscription:', error)
      return {
        success: false,
        error: {
          code: 'RAZORPAY_ERROR',
          message: 'Failed to create subscription. Please try again.',
        },
      }
    }
  })

// ============================================
// CANCEL SUBSCRIPTION
// ============================================
// Note: Users can only SUBSCRIBE or CANCEL.
// No pause/resume functionality exposed to users.
// (Pause/resume webhooks still handled in case admin does it from Razorpay Dashboard)

type CancelSubscriptionResult =
  | { success: true }
  | { success: false; error: { code: string; message: string } }

export const cancelUserSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string; cancelImmediately?: boolean }) => data)
  .handler(async ({ data }): Promise<CancelSubscriptionResult> => {
    await requireAuth()

    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, data.userId),
    })

    if (!subscription) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'No subscription found.' },
      }
    }

    if (!hasPremiumAccess(subscription.status as SubscriptionStatus)) {
      return {
        success: false,
        error: { code: 'NOT_ACTIVE', message: 'Subscription is not active.' },
      }
    }

    try {
      // Cancel in Razorpay
      const cancelAtCycleEnd = !data.cancelImmediately
      await rzpCancel(subscription.razorpaySubscriptionId, cancelAtCycleEnd)

      // Update database
      await db.transaction(async (tx) => {
        await tx
          .update(userSubscription)
          .set({
            cancelAtPeriodEnd: cancelAtCycleEnd,
            cancelledAt: data.cancelImmediately ? new Date() : null,
            status: data.cancelImmediately ? 'cancelled' : subscription.status,
          })
          .where(eq(userSubscription.id, subscription.id))

        await tx.insert(subscriptionEvent).values({
          subscriptionId: subscription.id,
          event: data.cancelImmediately ? 'subscription.cancelled' : 'subscription.cancel_scheduled',
          previousStatus: subscription.status,
          newStatus: data.cancelImmediately ? 'cancelled' : subscription.status,
        })

        // If immediate cancellation, deactivate subscription bonus
        if (data.cancelImmediately) {
          await tx
            .update(userListBonus)
            .set({ isActive: false })
            .where(
              and(
                eq(userListBonus.userId, data.userId),
                eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION)
              )
            )
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      return {
        success: false,
        error: { code: 'RAZORPAY_ERROR', message: 'Failed to cancel subscription.' },
      }
    }
  })

// ============================================
// CHECK TEST MODE ACCESS
// ============================================
export const checkSubscriptionAccess = createServerFn({ method: 'GET' })
  .handler(async (): Promise<{ canAccess: boolean; isTestMode: boolean }> => {
    const session = await requireAuth()

    const testMode = isTestMode()
    const canAccess = testMode ? isAdminEmail(session.user.email) : true

    return { canAccess, isTestMode: testMode }
  })
```

### 3.3 Webhook Handler

**File:** `src/routes/api/razorpay-webhook.ts`

> **Note:** Uses `new Response(JSON.stringify(...))` pattern consistent with existing API routes like `api/doa.ts`.

```typescript
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
          return new Response(
            JSON.stringify({ error: 'Missing signature' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }

        // Verify webhook signature
        if (!verifyWebhookSignature(body, signature)) {
          console.error('[RazorpayWebhook] Invalid signature')
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        let event: RazorpayWebhookEvent
        try {
          event = JSON.parse(body) as RazorpayWebhookEvent
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const eventType = event.event
        console.log(`[RazorpayWebhook] Received: ${eventType}`)

        try {
          await handleWebhookEvent(event)
          return new Response(
            JSON.stringify({ received: true }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('[RazorpayWebhook] Processing error:', error)
          // Return 200 to prevent Razorpay retries for non-recoverable errors
          // Log the error for manual investigation
          return new Response(
            JSON.stringify({ received: true, warning: 'Processing error logged' }),
            { headers: { 'Content-Type': 'application/json' } }
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
      await handleSubscriptionPending(subscription, newStatus, event, payload)
      break

    case 'subscription.halted':
      // All retries exhausted - REVOKE premium access
      // Per Razorpay docs: "invoices continue to be generated but no auto-charge is attempted"
      await handleSubscriptionHalted(subscription, newStatus, event, payload)
      break

    case 'subscription.cancelled':
    case 'subscription.completed':
    case 'subscription.expired':
      await handleSubscriptionEnded(subscription, newStatus, event, payload)
      break

    // Note: Users cannot pause - only subscribe or cancel.
    // These handlers exist in case admin pauses/resumes from Razorpay Dashboard.
    case 'subscription.paused':
      await handleSubscriptionPaused(subscription, newStatus, event, payload)
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

async function handleSubscriptionActivated(
  subscription: any,
  newStatus: SubscriptionStatus,
  event: any,
  payload: any
) {
  const subscriptionData = payload.subscription.entity

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
        razorpayData: subscriptionData,
      })
      .where(eq(userSubscription.id, subscription.id))

    // Create or update subscription bonus
    const existingBonus = await tx.query.userListBonus.findFirst({
      where: and(
        eq(userListBonus.userId, subscription.userId),
        eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION)
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
      razorpayEventId: event.id,
      razorpayPaymentId: payload.payment?.entity?.id,
      payload: event,
    })
  })
}

async function handleSubscriptionCharged(
  subscription: any,
  newStatus: SubscriptionStatus,
  event: any,
  payload: any
) {
  const subscriptionData = payload.subscription.entity

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
        razorpayData: subscriptionData,
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
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION)
        )
      )

    // Log event
    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      razorpayEventId: event.id,
      razorpayPaymentId: payload.payment?.entity?.id,
      payload: event,
    })
  })
}

async function handleSubscriptionPending(
  subscription: any,
  newStatus: SubscriptionStatus,
  event: any,
  _payload: any
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
      razorpayEventId: event.id,
      payload: event,
    })
  })
}

async function handleSubscriptionHalted(
  subscription: any,
  newStatus: SubscriptionStatus,
  event: any,
  _payload: any
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
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION)
        )
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      razorpayEventId: event.id,
      payload: event,
    })
  })
}

async function handleSubscriptionEnded(
  subscription: any,
  newStatus: SubscriptionStatus,
  event: any,
  _payload: any
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
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION)
        )
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      razorpayEventId: event.id,
      payload: event,
    })
  })
}

async function handleSubscriptionPaused(
  subscription: any,
  newStatus: SubscriptionStatus,
  event: any,
  _payload: any
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
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION)
        )
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      razorpayEventId: event.id,
      payload: event,
    })
  })
}

async function handleSubscriptionResumed(
  subscription: any,
  newStatus: SubscriptionStatus,
  event: any,
  payload: any
) {
  // Restore premium access
  const subscriptionData = payload.subscription.entity

  await db.transaction(async (tx) => {
    await tx
      .update(userSubscription)
      .set({
        status: newStatus,
        razorpayData: subscriptionData,
      })
      .where(eq(userSubscription.id, subscription.id))

    await tx
      .update(userListBonus)
      .set({ isActive: true })
      .where(
        and(
          eq(userListBonus.userId, subscription.userId),
          eq(userListBonus.bonusType, BONUS_TYPES.SUBSCRIPTION)
        )
      )

    await tx.insert(subscriptionEvent).values({
      subscriptionId: subscription.id,
      event: event.event,
      previousStatus: subscription.status,
      newStatus,
      razorpayEventId: event.id,
      payload: event,
    })
  })
}
```

### 3.4 Dashboard Route Integration

**File:** `src/routes/dashboard.route.tsx` (update)

> **Important:** Add subscription status to route context so all dashboard child routes have access without additional fetching.

```typescript
// Add to imports
import { checkPremiumAccess } from './dashboard/functions/subscription'

// Update RouteContext interface
declare module '@tanstack/react-router' {
  interface RouteContext {
    user?: { /* existing */ }
    lists?: DoaListRecord[]
    listLimitInfo?: ListLimitInfo
    isAdmin?: boolean
    isPremium?: boolean  // ADD THIS
  }
}

// Update beforeLoad
beforeLoad: async () => {
  const session = await getSessionFromServer()

  if (!session?.user) {
    throw redirect({ to: '/login' })
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  }

  // Fetch list limit and premium status in parallel
  const [listLimitInfo, premiumResult] = await Promise.all([
    getUserListLimitInfo({ data: { userId: user.id } }),
    checkPremiumAccess({ data: { userId: user.id } }),
  ])

  const isAdmin = isAdminEmail(user.email)
  const isPremium = premiumResult.isPremium

  return { user, listLimitInfo, isAdmin, isPremium }
},
```

> **React Best Practice:** Data fetching happens in route loaders/beforeLoad, NOT in useEffect. Child routes access premium status via `Route.useRouteContext()`.

---

## Phase 4: Premium Feature Gates

### 4.1 Premium Validation Helper

**File:** `src/lib/premium-gate.ts`

```typescript
import { db } from '@/db'
import { userSubscription, referral } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { hasPremiumAccess, type SubscriptionStatus } from './subscription'
import type { ArabicFont, TranslationFont, PatternId } from '@/types/premium.types'
import { PATTERNS } from '@/types/premium.types'

/**
 * Server-side premium feature validation.
 * All premium feature access MUST go through these functions.
 */

export interface PremiumStatus {
  isPremium: boolean
  referralCount: number
  imageLimit: number
}

/**
 * Get user's premium status and referral count.
 */
export async function getUserPremiumStatus(userId: string): Promise<PremiumStatus> {
  const [subscription, referralResult] = await Promise.all([
    db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
      columns: { status: true },
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(referral)
      .where(eq(referral.referrerId, userId)),
  ])

  const isPremium = hasPremiumAccess(subscription?.status as SubscriptionStatus | null)
  const referralCount = referralResult[0]?.count ?? 0

  // Calculate image limit
  let imageLimit: number
  if (isPremium) {
    imageLimit = 15
  } else {
    const referralBonus = Math.min(referralCount, 2)
    imageLimit = 1 + referralBonus // Base 1 + up to 2 from referrals = max 3
  }

  return { isPremium, referralCount, imageLimit }
}

/**
 * Validate font selection.
 * Non-premium users can only use default fonts.
 */
export function validateFont(
  font: ArabicFont | TranslationFont,
  isPremium: boolean,
  type: 'arabic' | 'translation'
): boolean {
  const defaultFonts = {
    arabic: 'simpo' as ArabicFont,
    translation: 'roboto' as TranslationFont,
  }

  if (!isPremium && font !== defaultFonts[type]) {
    return false
  }
  return true
}

/**
 * Validate color customization.
 * Non-premium users can only use default colors.
 */
export function validateColors(
  colors: { backgroundColor?: string; textColor?: string; translationColor?: string },
  isPremium: boolean
): boolean {
  if (!isPremium) {
    const defaults = {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      translationColor: '#666666',
    }

    if (
      (colors.backgroundColor && colors.backgroundColor !== defaults.backgroundColor) ||
      (colors.textColor && colors.textColor !== defaults.textColor) ||
      (colors.translationColor && colors.translationColor !== defaults.translationColor)
    ) {
      return false
    }
  }
  return true
}

/**
 * Sanitize watermark text to prevent XSS and invalid characters.
 * Only allows alphanumeric, spaces, and common punctuation.
 */
export function sanitizeWatermark(text: string): string {
  // Remove any HTML tags
  const noHtml = text.replace(/<[^>]*>/g, '')
  // Only allow safe characters
  const sanitized = noHtml.replace(/[^\w\s\-_.@#]/g, '').trim()
  // Limit length
  return sanitized.slice(0, 50)
}

/**
 * Validate branding options.
 */
export function validateBranding(
  options: { hideBranding?: boolean; customWatermark?: string },
  isPremium: boolean
): { valid: boolean; sanitizedWatermark?: string } {
  if (!isPremium) {
    if (options.hideBranding || options.customWatermark) {
      return { valid: false }
    }
  }

  // Validate and sanitize watermark
  if (options.customWatermark) {
    const sanitized = sanitizeWatermark(options.customWatermark)
    if (sanitized.length === 0) {
      return { valid: false }
    }
    return { valid: true, sanitizedWatermark: sanitized }
  }

  return { valid: true }
}

/**
 * Validate pattern selection.
 */
export function validatePattern(
  patternId: PatternId | undefined,
  isPremium: boolean
): boolean {
  if (!patternId) return true

  const pattern = PATTERNS.find(p => p.id === patternId)
  if (!pattern) return false

  if (pattern.isPremium && !isPremium) {
    return false
  }

  return true
}

/**
 * Comprehensive validation for all export settings.
 * Returns sanitized settings if valid.
 */
export function validateExportSettings(
  settings: {
    arabicFont?: ArabicFont
    translationFont?: TranslationFont
    backgroundColor?: string
    textColor?: string
    translationColor?: string
    hideBranding?: boolean
    customWatermark?: string
    pattern?: PatternId
  },
  isPremium: boolean
): { valid: boolean; errors: string[]; sanitizedSettings?: typeof settings } {
  const errors: string[] = []
  const sanitizedSettings = { ...settings }

  if (settings.arabicFont && !validateFont(settings.arabicFont, isPremium, 'arabic')) {
    errors.push('Premium Arabic fonts require a subscription')
  }

  if (settings.translationFont && !validateFont(settings.translationFont, isPremium, 'translation')) {
    errors.push('Premium translation fonts require a subscription')
  }

  if (!validateColors(settings, isPremium)) {
    errors.push('Custom colors require a subscription')
  }

  const brandingResult = validateBranding(settings, isPremium)
  if (!brandingResult.valid) {
    errors.push('Custom branding options require a subscription')
  } else if (brandingResult.sanitizedWatermark) {
    sanitizedSettings.customWatermark = brandingResult.sanitizedWatermark
  }

  if (!validatePattern(settings.pattern, isPremium)) {
    errors.push('This decorative pattern requires a subscription')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedSettings: errors.length === 0 ? sanitizedSettings : undefined,
  }
}
```

### 4.2 Update Image Generator with Premium Validation

**File:** `src/routes/dashboard/functions/image-generator.ts` (update)

> **⚠️ MULTIPLE UPDATES REQUIRED:**
>
> **1. Update imports (add at top of file):**
> ```typescript
> import { getUserPremiumStatus, validateExportSettings } from '@/lib/premium-gate'
> import type { ImageExportSettings } from '@/types/premium.types'
> ```
>
> **2. Update `RecordImageGenerationInput` interface:**
> ```typescript
> interface RecordImageGenerationInput {
>   doaSlug: string
>   exportSettings?: ImageExportSettings  // NEW: Premium customization options
> }
> ```
>
> **3. Update `RecordImageGenerationResult` type (around line 273):**
> ```typescript
> type RecordImageGenerationResult =
>   | { success: true; limitInfo: ImageLimitInfo }
>   | {
>       success: false
>       error: {
>         code: 'DAILY_LIMIT_REACHED' | 'UNAUTHORIZED' | 'PREMIUM_REQUIRED'  // Added PREMIUM_REQUIRED
>         message: string
>         limitInfo?: ImageLimitInfo
>       }
>     }
> ```
>
> **4. Similarly update `GenerateImageResult` type (around line 32):**
> ```typescript
> type GenerateImageResult =
>   | { success: true; imageBase64: string; filename: string; mimeType: string; limitInfo: ImageLimitInfo }
>   | {
>       success: false
>       error: {
>         code: 'DAILY_LIMIT_REACHED' | 'DOA_NOT_FOUND' | 'GENERATION_FAILED' | 'PREMIUM_REQUIRED'
>         message: string
>         limitInfo?: ImageLimitInfo
>       }
>     }
> ```

**5. Update `recordImageGeneration` handler:**

```typescript
// ============================================
// RECORD IMAGE GENERATION (updated with premium support)
// ============================================
export const recordImageGeneration = createServerFn({
  method: 'POST',
})
  .inputValidator((data: RecordImageGenerationInput) => {
    if (!data.doaSlug || typeof data.doaSlug !== 'string') {
      throw new Error('Invalid doa slug')
    }
    return data
  })
  .handler(async ({ data }): Promise<RecordImageGenerationResult> => {
    const session = await requireAuth()
    const userId = session.user.id

    // Get premium status and calculate effective daily limit
    const { isPremium, referralCount, imageLimit } = await getUserPremiumStatus(userId)

    // Validate premium-only features in export settings (if provided)
    if (data.exportSettings) {
      const validation = validateExportSettings(data.exportSettings, isPremium)
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'PREMIUM_REQUIRED',
            message: validation.errors[0],
          },
        }
      }
    }

    // Step 1: Check limit FIRST (outside transaction - read only)
    const existingRecord = await db.query.doaImageGeneration.findFirst({
      where: eq(doaImageGeneration.userId, userId),
    })

    const currentUsed =
      existingRecord && isToday(existingRecord.lastGeneratedAt)
        ? existingRecord.generationsToday
        : 0

    // Use dynamic imageLimit (15 for premium, 1-3 for free based on referrals)
    if (currentUsed >= imageLimit) {
      const limitInfo = calculateImageLimitInfo(
        currentUsed,
        existingRecord?.lastGeneratedAt ?? null,
        existingRecord?.totalGenerations ?? 0,
        isPremium,
        referralCount,
      )

      return {
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message: isPremium
            ? 'Daily limit reached. You can generate 15 images per day.'
            : `Daily limit reached. ${imageLimit === 1 ? 'Invite friends to unlock more!' : 'Upgrade to Premium for 15/day.'}`,
          limitInfo,
        },
      }
    }

    // Step 2: Update count in a transaction (existing code unchanged)
    const now = new Date()
    const result = await db.transaction(async (tx) => {
      // Re-check limit inside transaction to prevent race conditions
      const record = await tx.query.doaImageGeneration.findFirst({
        where: eq(doaImageGeneration.userId, userId),
      })

      const usedToday =
        record && isToday(record.lastGeneratedAt)
          ? record.generationsToday
          : 0

      // Double-check limit with dynamic imageLimit (race condition protection)
      if (usedToday >= imageLimit) {
        return {
          blocked: true as const,
          usedToday,
          totalGenerations: record?.totalGenerations ?? 0,
        }
      }

      if (record) {
        const newCount = isToday(record.lastGeneratedAt)
          ? record.generationsToday + 1
          : 1

        await tx
          .update(doaImageGeneration)
          .set({
            generationsToday: newCount,
            lastGeneratedAt: now,
            totalGenerations: record.totalGenerations + 1,
          })
          .where(eq(doaImageGeneration.userId, userId))

        return {
          blocked: false as const,
          usedToday: newCount,
          totalGenerations: record.totalGenerations + 1,
        }
      } else {
        await tx.insert(doaImageGeneration).values({
          userId,
          generationsToday: 1,
          lastGeneratedAt: now,
          totalGenerations: 1,
        })

        return { blocked: false as const, usedToday: 1, totalGenerations: 1 }
      }
    })

    // Handle race condition
    if (result.blocked) {
      const limitInfo = calculateImageLimitInfo(
        result.usedToday,
        existingRecord?.lastGeneratedAt ?? null,
        result.totalGenerations,
        isPremium,
        referralCount,
      )
      return {
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message: 'Daily limit reached. Please try again tomorrow.',
          limitInfo,
        },
      }
    }

    // Return success with updated limit info (including premium context)
    const limitInfo = calculateImageLimitInfo(
      result.usedToday,
      now,
      result.totalGenerations,
      isPremium,
      referralCount,
    )

    return {
      success: true,
      limitInfo,
    }
  })
```

---

## Phase 5: Decorative Patterns

### 5.1 Pattern Renderer

**File:** `src/utils/patterns.ts`

```typescript
/**
 * Canvas-based decorative pattern renderer.
 * All patterns are programmatically drawn - no image assets needed.
 */

import { PATTERNS, type PatternId, type PatternCategory } from '@/types/premium.types'

interface PatternConfig {
  width: number
  height: number
  primaryColor: string
  secondaryColor?: string
  opacity?: number
}

type PatternRenderer = (ctx: CanvasRenderingContext2D, config: PatternConfig) => void

/**
 * Draw an 8-point star pattern (Islamic geometric).
 */
function draw8PointStar(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.15 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 2

  const size = 60
  const padding = 40

  for (let x = padding; x < width - padding; x += size * 1.5) {
    for (let y = padding; y < height - padding; y += size * 1.5) {
      // Only draw in border areas
      if (x > padding + size * 2 && x < width - padding - size * 2 &&
          y > padding + size * 2 && y < height - padding - size * 2) {
        continue
      }

      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4
        const innerRadius = size * 0.3
        const outerRadius = size * 0.5

        const innerX = x + Math.cos(angle) * innerRadius
        const innerY = y + Math.sin(angle) * innerRadius
        const outerX = x + Math.cos(angle + Math.PI / 8) * outerRadius
        const outerY = y + Math.sin(angle + Math.PI / 8) * outerRadius

        if (i === 0) ctx.moveTo(innerX, innerY)
        else ctx.lineTo(innerX, innerY)
        ctx.lineTo(outerX, outerY)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }

  ctx.restore()
}

/**
 * Draw diamond lattice pattern.
 */
function drawDiamondLattice(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.12 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 1

  const size = 40
  const borderWidth = 80

  // Draw lattice only in border area
  for (let x = 0; x < width; x += size) {
    for (let y = 0; y < height; y += size) {
      // Skip center area
      if (x > borderWidth && x < width - borderWidth &&
          y > borderWidth && y < height - borderWidth) {
        continue
      }

      ctx.beginPath()
      ctx.moveTo(x + size / 2, y)
      ctx.lineTo(x + size, y + size / 2)
      ctx.lineTo(x + size / 2, y + size)
      ctx.lineTo(x, y + size / 2)
      ctx.closePath()
      ctx.stroke()
    }
  }

  ctx.restore()
}

/**
 * Draw mihrab arch pattern (architectural).
 */
function drawMihrabArch(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.2 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 3

  const centerX = width / 2
  const archWidth = Math.min(width * 0.8, 600)
  const archHeight = height * 0.15

  // Draw pointed arch at top
  ctx.beginPath()
  ctx.moveTo(centerX - archWidth / 2, archHeight + 50)
  ctx.quadraticCurveTo(centerX - archWidth / 4, 30, centerX, 20)
  ctx.quadraticCurveTo(centerX + archWidth / 4, 30, centerX + archWidth / 2, archHeight + 50)
  ctx.stroke()

  // Draw inner arch
  ctx.beginPath()
  ctx.moveTo(centerX - archWidth / 2 + 20, archHeight + 50)
  ctx.quadraticCurveTo(centerX - archWidth / 4 + 10, 50, centerX, 40)
  ctx.quadraticCurveTo(centerX + archWidth / 4 - 10, 50, centerX + archWidth / 2 - 20, archHeight + 50)
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw crescent moon and stars (organic).
 */
function drawCrescentMoon(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.15 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = primaryColor

  // Crescent in top-right corner
  const moonX = width - 80
  const moonY = 80
  const moonRadius = 40

  ctx.beginPath()
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = config.secondaryColor || '#ffffff'
  ctx.beginPath()
  ctx.arc(moonX + 15, moonY - 5, moonRadius * 0.85, 0, Math.PI * 2)
  ctx.fill()

  // Small stars
  ctx.fillStyle = primaryColor
  const starPositions = [
    [moonX - 60, moonY - 20],
    [moonX - 40, moonY + 40],
    [moonX + 20, moonY - 50],
  ]

  for (const [sx, sy] of starPositions) {
    drawStar(ctx, sx, sy, 8, 4)
  }

  ctx.restore()
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, outerR: number, innerR: number) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

/**
 * Draw simple corner brackets (minimalist).
 */
function drawCornerBrackets(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.3 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor
  ctx.lineWidth = 3

  const bracketSize = 60
  const margin = 30

  // Top-left
  ctx.beginPath()
  ctx.moveTo(margin, margin + bracketSize)
  ctx.lineTo(margin, margin)
  ctx.lineTo(margin + bracketSize, margin)
  ctx.stroke()

  // Top-right
  ctx.beginPath()
  ctx.moveTo(width - margin - bracketSize, margin)
  ctx.lineTo(width - margin, margin)
  ctx.lineTo(width - margin, margin + bracketSize)
  ctx.stroke()

  // Bottom-left
  ctx.beginPath()
  ctx.moveTo(margin, height - margin - bracketSize)
  ctx.lineTo(margin, height - margin)
  ctx.lineTo(margin + bracketSize, height - margin)
  ctx.stroke()

  // Bottom-right
  ctx.beginPath()
  ctx.moveTo(width - margin - bracketSize, height - margin)
  ctx.lineTo(width - margin, height - margin)
  ctx.lineTo(width - margin, height - margin - bracketSize)
  ctx.stroke()

  ctx.restore()
}

/**
 * Draw double line frame (minimalist).
 */
function drawDoubleLineFrame(ctx: CanvasRenderingContext2D, config: PatternConfig) {
  const { width, height, primaryColor, opacity = 0.2 } = config
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = primaryColor

  // Outer frame
  ctx.lineWidth = 2
  ctx.strokeRect(20, 20, width - 40, height - 40)

  // Inner frame
  ctx.lineWidth = 1
  ctx.strokeRect(30, 30, width - 60, height - 60)

  ctx.restore()
}

// Pattern registry
const PATTERN_RENDERERS: Record<PatternId, PatternRenderer> = {
  'eight-point-star': draw8PointStar,
  'diamond-lattice': drawDiamondLattice,
  'hexagonal-tessellation': drawDiamondLattice, // Placeholder - implement full version
  'interlocking-squares': drawDiamondLattice, // Placeholder
  'mihrab-arch': drawMihrabArch,
  'mosque-dome': drawMihrabArch, // Placeholder
  'minarets': drawMihrabArch, // Placeholder
  'arabesque-border': drawDiamondLattice, // Placeholder
  'crescent-moon': drawCrescentMoon,
  'vine-border': drawDiamondLattice, // Placeholder
  'floral-corners': drawCornerBrackets, // Placeholder
  'olive-branches': drawDiamondLattice, // Placeholder
  'wavy-lines': drawDoubleLineFrame, // Placeholder
  'dotted-border': drawDoubleLineFrame, // Placeholder
  'gradient-halo': drawCrescentMoon, // Placeholder
  'geometric-rays': draw8PointStar, // Placeholder
  'corner-brackets': drawCornerBrackets,
  'double-line-frame': drawDoubleLineFrame,
  'simple-border': drawDoubleLineFrame,
  'elegant-divider': drawCornerBrackets, // Placeholder
}

/**
 * Render a pattern onto a canvas context.
 */
export function renderPattern(
  ctx: CanvasRenderingContext2D,
  patternId: PatternId,
  config: PatternConfig
): void {
  const renderer = PATTERN_RENDERERS[patternId]
  if (renderer) {
    renderer(ctx, config)
  }
}

/**
 * Get available patterns for a premium status.
 */
export function getAvailablePatterns(isPremium: boolean): PatternId[] {
  return PATTERNS
    .filter((p) => isPremium || !p.isPremium)
    .map((p) => p.id)
}
```

---

## Phase 6: Update Pricing Page

### 6.1 Update Constants

**File:** `src/lib/constants.ts` (update pricing section)

```typescript
// Replace the pricing plans section:
plans: [
  {
    name: 'Free',
    price: 'RM0',
    period: 'forever',
    description: 'Everything you need to start your spiritual journey',
    features: [
      '1 personalized doa list (up to 11 with referrals)',
      '1 image export per day (up to 3 with referrals)',
      'Access to authentic prayers library',
      'Cloud synchronization',
      'Basic email support',
    ],
    excluded: [
      'Premium fonts',
      'Custom colors',
      'Custom watermark',
      'Remove branding',
      'Decorative patterns',
    ],
    popular: false,
  },
  {
    name: 'Premium',
    price: 'RM9.90',
    period: 'per month',
    description: 'Complete freedom to customize your spiritual journey',
    features: [
      '+50 additional doa lists (total up to 61)',
      '15 image exports per day',
      'Premium Arabic fonts (Amiri, Scheherazade, Noto Naskh)',
      'Custom translation fonts',
      'Custom background & text colors',
      'Add personal watermark',
      'Remove GetDoa branding',
      '20 decorative patterns',
      'Priority support',
      'Early access to new features',
    ],
    excluded: [],
    popular: true,
    badge: 'Best Value',
  },
],
```

### 6.2 Update Feature Comparison Table

Update the pricing page component to show correct feature comparisons for Free vs Premium.

---

## Phase 7: Environment Variables & Database Migration

### 7.1 Update .env.example

```env
# Existing
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
ADMIN_EMAILS=

# New - Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_ID=plan_xxxxxxxxxxxxx  # Create plan in Razorpay Dashboard first

# Subscription Test Mode (set to 'true' for admin-only testing)
RAZORPAY_TEST_MODE=true
```

### 7.2 Database Schema (Drizzle)

> **Note:** We use Drizzle ORM for schema management. Focus on the schema files - Drizzle handles the migration automatically.

**After creating/updating schema files:**

```bash
# Push schema changes directly to database
cd tanstack && pnpm db:push

# Verify tables created
pnpm db:studio
```

> **Schema Files to Create/Update:**
> - `src/db/schema/subscription.ts` - New file (Phase 1.1)
> - `src/db/schema/auth.ts` - Add premium columns to `userProfile` (Phase 1.2)
> - `src/db/schema/index.ts` - Export + add relation (Phase 1.3)
>
> The schema definitions include all indexes and constraints. Drizzle creates them automatically with `pnpm db:push`.

### 7.3 Razorpay Dashboard Setup

> **Important:** Flash Checkout must be enabled for Subscriptions to work!
> Go to Dashboard → Account & Settings → Checkout settings → Enable Flash Checkout

1. **Create Plan in Razorpay Dashboard:**
   - Go to Dashboard → Subscriptions → Plans
   - Create monthly plan: RM9.90 (990 sen)
   - Copy the `plan_id` to `RAZORPAY_PLAN_ID` env variable

2. **Configure Webhooks:**
   - Go to Dashboard → Settings → Webhooks
   - Add endpoint: `https://your-domain.com/api/razorpay-webhook`
   - Select events:
     - `subscription.authenticated`
     - `subscription.activated`
     - `subscription.charged`
     - `subscription.pending`
     - `subscription.halted`
     - `subscription.cancelled`
     - `subscription.completed`
     - `subscription.expired`
     - `subscription.paused`
     - `subscription.resumed`
   - Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

---

## Phase 8: Files Summary

### Files to Create

| File | Description |
|------|-------------|
| `src/db/schema/subscription.ts` | Subscription schema (userSubscription, subscriptionEvent) |
| `src/lib/razorpay.ts` | Razorpay client initialization |
| `src/lib/subscription.ts` | Subscription config and utilities |
| `src/lib/premium-gate.ts` | Server-side premium validation |
| `src/types/premium.types.ts` | Premium feature types |
| `src/utils/patterns.ts` | Canvas pattern renderers |
| `src/routes/api/razorpay-webhook.ts` | Webhook handler |
| `src/routes/dashboard/functions/subscription.ts` | Subscription server functions |
| `src/components/subscription/subscribe-button.tsx` | Subscription CTA component |
| `src/components/subscription/subscription-status.tsx` | Status display component |
| `src/components/doa-image/pattern-picker.tsx` | Pattern selection UI |
| `src/components/doa-image/font-picker.tsx` | Font selection UI |
| `src/components/doa-image/color-picker.tsx` | Color customization UI |

### Files to Modify

| File | Changes |
|------|---------|
| `src/db/schema/index.ts` | Export subscription schema, add `subscription` relation to userRelations |
| `src/db/schema/auth.ts` | Add 8 premium settings columns to userProfile table (individual columns, not JSONB) |
| `src/lib/image-limit.ts` | Update config and `calculateImageLimitInfo()` signature for premium + referral |
| `src/lib/constants.ts` | Update pricing plans array with new premium features |
| `src/routes/dashboard/functions/index.ts` | Add `export * from './subscription'` at top of file |
| `src/routes/dashboard/functions/image-generator.ts` | Add `getUserPremiumStatus()` call and premium validation |
| `src/utils/image-generator.ts` | Add pattern rendering, font loading, color customization |
| `src/components/pages/pricing-page.tsx` | Update feature comparison for new premium tier |
| `src/routes/dashboard.route.tsx` | Add `isPremium` to route context via parallel `checkPremiumAccess` call |
| `.env.example` | Add Razorpay environment variables |

### Key Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard Route (beforeLoad)                  │
│  ┌─────────────────┐    ┌──────────────────┐                    │
│  │getUserListLimit │    │checkPremiumAccess│  ← Promise.all()   │
│  └────────┬────────┘    └────────┬─────────┘                    │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      ▼                                           │
│       Route Context: { user, listLimitInfo, isAdmin, isPremium } │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Child Routes (Route.useRouteContext())              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ doa-image    │  │ saved-lists  │  │ profile            │     │
│  │ (premium     │  │ (list limit  │  │ (subscription      │     │
│  │  validation) │  │  check)      │  │  management)       │     │
│  └──────────────┘  └──────────────┘  └────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 9: Testing Checklist

### Unit Tests
- [ ] `hasPremiumAccess()` correctly identifies active subscriptions
- [ ] `validateExportSettings()` blocks premium features for free users
- [ ] `calculateImageLimitInfo()` returns correct limits based on premium + referrals
- [ ] Pattern renderers draw without errors

### Integration Tests
- [ ] Webhook signature verification
- [ ] Subscription lifecycle: created → authenticated → active
- [ ] Subscription cancellation (immediate and at period end)
- [ ] Bonus creation/deactivation on subscription events
- [ ] Image generation respects premium limits

### E2E Tests
- [ ] Subscribe flow: click subscribe → Razorpay checkout → webhook → premium access
- [ ] Cancel flow: cancel subscription → webhook → access revoked
- [ ] Premium features enabled only for subscribers
- [ ] Free user cannot bypass premium validation

### Manual Testing
- [ ] Test mode: only admins see subscribe button
- [ ] Live mode: all users can subscribe
- [ ] Razorpay Dashboard: verify subscription created
- [ ] Webhook events received and processed
- [ ] Premium badge appears in UI
- [ ] Pattern picker shows correct patterns
- [ ] Font picker works with new fonts
- [ ] Color picker customization applies to export

---

## Security Considerations

1. **Server-side validation**: All premium features validated server-side, never trust client
2. **Webhook verification**: Signature verification prevents spoofed webhooks
3. **Input sanitization**: Validate all user inputs (colors, watermark text via `sanitizeWatermark()`)
4. **Rate limiting**: Consider adding rate limiting to subscription creation
5. **Idempotent webhooks**: Handle duplicate webhook deliveries gracefully
6. **Secure secrets**: Razorpay secrets stored in environment variables only
7. **XSS Prevention**: Custom watermark text is sanitized before storage and rendering

---

## Server/Client Boundary Guidelines

### ✅ Server-Only Code (NEVER import in client components)

| File | Reason |
|------|--------|
| `src/lib/razorpay.ts` | Uses `crypto` module, Razorpay SDK, env secrets |
| `src/lib/subscription.ts` | `isTestMode()` reads `process.env` |
| `src/lib/premium-gate.ts` | Database queries, server-side validation |
| `src/routes/dashboard/functions/subscription.ts` | Server functions with `createServerFn` |
| `src/routes/api/razorpay-webhook.ts` | API route handler |

### ✅ Shared Code (Safe for both server and client)

| File | Notes |
|------|-------|
| `src/types/premium.types.ts` | Type definitions only |
| `src/lib/image-limit.ts` | Pure functions, no DB/env access |
| `src/utils/patterns.ts` | Canvas rendering, client-side only in practice |

### ⚠️ Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Importing server module in client component
import { isTestMode } from '@/lib/subscription'  // Uses process.env!

function SubscribeButton() {
  if (isTestMode()) { ... }  // Will fail on client!
}

// ✅ CORRECT: Get server data via route loader
// In route file:
export const Route = createFileRoute('/dashboard/pricing')({
  loader: async () => {
    const { canAccess, isTestMode } = await checkSubscriptionAccess()
    return { canAccess, isTestMode }
  },
  component: PricingPage,
})

// In component:
function PricingPage() {
  const { canAccess, isTestMode } = Route.useLoaderData()
  // Now safe to use
}
```

### Data Flow Pattern

```
Route Loader (Server)           Component (Client)
        │                              │
        │  beforeLoad/loader           │
        │  ────────────────►           │
        │                              │
        │  Return serializable data    │
        │  (no functions, no classes)  │
        │                              │
        │                    useLoaderData()
        │                    useRouteContext()
        │                              │
        │                    User Action (click)
        │                              │
        │  Server Function Call        │
        │  ◄────────────────           │
        │                              │
        │  Return result               │
        │  ────────────────►           │
        ▼                              ▼
```

---

## Edge Cases & Error Handling

### Webhook Edge Cases

| Scenario | Handling |
|----------|----------|
| Webhook arrives before DB record exists | Return without error, Razorpay retries automatically |
| Duplicate webhook (same event ID) | Idempotent operations - re-running produces same result |
| Webhooks arrive out of order | Status updates are based on Razorpay's status field, not event sequence |
| Webhook processing fails | Return 200 to prevent retry loops, log error for investigation |

> **⚠️ IDEMPOTENCY RECOMMENDATION:** For production, consider adding a check for duplicate `razorpayEventId` before processing:
> ```typescript
> // In handleWebhookEvent, before processing:
> const existingEvent = await db.query.subscriptionEvent.findFirst({
>   where: eq(subscriptionEvent.razorpayEventId, event.id),
> })
> if (existingEvent) {
>   console.log(`[RazorpayWebhook] Duplicate event ${event.id}, skipping`)
>   return
> }
> ```
> This prevents any side effects from Razorpay's automatic retries when our 200 response doesn't reach them.

### Subscription Edge Cases

| Scenario | Handling |
|----------|----------|
| User clicks subscribe while pending subscription exists | Check for existing subscription in `createUserSubscription`, return error |
| Session expires during Razorpay checkout | Razorpay handles auth independently; webhook still processes |
| User refreshes during checkout | `shortUrl` is stored; user can be redirected to same checkout |
| Payment fails | Razorpay handles retries; status goes to 'pending' then 'halted' |
| User cancels in Razorpay dashboard | Webhook handles `subscription.cancelled` event |

### Premium Access Edge Cases

> **User Actions:** Users can only **subscribe** or **cancel**. No pause option is exposed to users.

| Scenario | Handling |
|----------|----------|
| Subscription in 'pending' (payment retry) | User KEEPS premium access during retry period |
| Subscription 'halted' (all retries exhausted) | Premium access REVOKED via `handleSubscriptionHalted()` |
| User cancels mid-billing (`cancel_at_cycle_end: true`) | Access continues until `currentPeriodEnd` |
| User cancels immediately (`cancel_at_cycle_end: false`) | Access revoked immediately |
| Admin pauses from Razorpay Dashboard | Premium access revoked (handled by webhook) |
| Admin resumes from Razorpay Dashboard | Premium access restored (handled by webhook) |
| Premium settings after subscription ends | Settings preserved in `userProfile.premiumSettings` for re-subscription |

### Image Generation Edge Cases

| Scenario | Handling |
|----------|----------|
| User becomes premium mid-generation | No issue - limit checked at start, premium gives higher limit |
| User loses premium mid-generation | Generation completes (limit was valid when started) |
| User uses premium font, then loses subscription | Export still works but validation blocks new premium features |
| Concurrent image generation requests | Transaction with re-check prevents exceeding limit |
| Premium user downgraded between validation and transaction | Acceptable race - premium rarely changes mid-request |

### Database Edge Cases

| Scenario | Handling |
|----------|----------|
| User deletes account | Cascade delete removes subscription records |
| Webhook arrives for deleted user | Subscription lookup fails, logged, returns 200 |
| Multiple webhooks for same event | Idempotent - updating to same status is safe |
| Database connection lost during webhook | Return 500, Razorpay retries automatically |
| User re-subscribes after cancellation | Old record deleted in `createUserSubscription` before new insert |

### Authentication Transaction (from Razorpay Docs)

| Start Date | Upfront Amount | Auth Amount | Refunded? |
|------------|----------------|-------------|-----------|
| Immediate | No | Plan Amount | **No** |
| Future | No | RM 5 | **Yes** (auto) |
| Immediate | Yes | Upfront + Plan | **No** |
| Future | Yes | Upfront Amount | **No** |

> **Note:** For GetDoa's immediate-start monthly subscription, the first charge is the Plan Amount (RM 9.90) and is NOT refunded.

---

## React & TanStack Best Practices Applied

### ✅ DO (This Plan Follows)

1. **Data fetching in route loaders/beforeLoad** - Subscription status fetched in `dashboard.route.tsx` beforeLoad
2. **Parallel data fetching** - Use `Promise.all()` for independent queries
3. **Server functions for mutations** - All subscription operations use `createServerFn`
4. **Route context for shared state** - `isPremium` available to all dashboard child routes
5. **Type-safe API responses** - Discriminated unions for success/error results
6. **Transaction-based atomic operations** - Database updates wrapped in transactions
7. **Invalidate route on state change** - Use `router.invalidate()` when subscription status changes

### ❌ DON'T (Avoided in This Plan)

1. **useEffect for data fetching** - Route loaders handle all initial data
2. **Client-side premium checks** - All validation happens server-side
3. **Polling for subscription status** - Webhooks provide real-time updates
4. **Storing sensitive data in client state** - Razorpay handles payment details

### ⚠️ Existing Codebase Anti-Patterns (DO NOT REPLICATE)

> **Note:** The following patterns exist in the codebase but should NOT be used for new features:

| File | Anti-Pattern | Better Approach |
|------|--------------|-----------------|
| `dashboard.saved-lists.tsx` | Uses `useSession()` + `useEffect` for data fetching | Use route `loader` with session from parent context |
| `dashboard.saved-lists.tsx` | Returns empty object from loader, fetches in component | Fetch in loader, pass via `useLoaderData()` |

**Why `dashboard.saved-lists.tsx` pattern is problematic:**
```typescript
// ❌ Current (anti-pattern):
export const Route = createFileRoute('/dashboard/saved-lists')({
  loader: async () => {
    return {} // Empty! Data loaded client-side
  },
  component: SavedListsPage,
})

function SavedListsPage() {
  const { data: session } = useSession()  // Client-side session
  const [favoriteLists, setFavoriteLists] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetches data AFTER render, causes loading flash
    async function loadFavorites() { ... }
    loadFavorites()
  }, [session?.user])
}

// ✅ Better (follow dashboard.doa-image.tsx pattern):
export const Route = createFileRoute('/dashboard/saved-lists')({
  loader: async ({ context }) => {
    const { user } = context  // From parent beforeLoad
    const lists = await getFavoriteLists({ data: { userId: user.id } })
    return { lists }
  },
  component: SavedListsPage,
})

function SavedListsPage() {
  const { lists } = Route.useLoaderData()  // Available immediately
}
```

**This plan follows the correct pattern** - subscription status is fetched in `dashboard.route.tsx` `beforeLoad` and shared via route context.

### When useEffect IS Appropriate (Reference from existing codebase)

The codebase uses `useEffect` in specific legitimate cases:

| Use Case | Example | Why It's OK |
|----------|---------|-------------|
| **Cleanup** | `URL.revokeObjectURL()` on unmount | Browser API cleanup |
| **localStorage** | `ReferralProcessor` | Browser-only storage |
| **Non-critical fetch** | Shopee referrals in `doa-image.tsx` | Supplementary data, not blocking |
| **External library** | Carousel keyboard handling | Third-party integration |

**Rule of thumb:** If the data is needed for initial render, use route loaders. If it's supplementary or browser-only, `useEffect` is acceptable.

### Subscription Status: No useEffect Needed

```typescript
// ❌ WRONG: Fetching subscription in useEffect
function DashboardPage() {
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    checkPremiumAccess().then(result => setIsPremium(result.isPremium))
  }, [])

  // Component renders twice, first with wrong state
}

// ✅ CORRECT: Fetch in route loader, available immediately
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const { isPremium } = await checkPremiumAccess({ data: { userId } })
    return { isPremium }
  },
  component: () => {
    const { isPremium } = Route.useRouteContext()
    // Available on first render, no loading state needed
  }
})
```

---

## Rollout Plan

### Phase A: Test Mode (Admin Only)
1. Deploy with `RAZORPAY_TEST_MODE=true`
2. Only admins can access subscription features
3. Test full subscription lifecycle
4. Monitor webhook processing

### Phase B: Soft Launch
1. Set `RAZORPAY_TEST_MODE=false`
2. Deploy to production
3. Monitor for errors
4. Verify payment processing

### Phase C: Full Launch
1. Update marketing materials
2. Send announcement to users
3. Monitor subscription metrics

---

## Production Readiness Checklist

### Pre-Deployment

- [ ] **Environment Variables**
  - [ ] `RAZORPAY_KEY_ID` set (use live key, not test)
  - [ ] `RAZORPAY_KEY_SECRET` set (use live secret)
  - [ ] `RAZORPAY_WEBHOOK_SECRET` set
  - [ ] `RAZORPAY_PLAN_ID` set (create plan in Razorpay Dashboard first)
  - [ ] `RAZORPAY_TEST_MODE` set to `true` initially for admin testing

- [ ] **Razorpay Dashboard Configuration**
  - [ ] Flash Checkout enabled (required for subscriptions)
  - [ ] Webhook URL configured: `https://your-domain.com/api/razorpay-webhook`
  - [ ] All subscription events selected in webhook settings
  - [ ] Plan created with correct amount (RM 9.90 = 990 sen)

- [ ] **Database**
  - [ ] Migration generated (`pnpm db:generate`)
  - [ ] Migration applied (`pnpm db:migrate`)
  - [ ] Tables created: `user_subscription`, `subscription_event`
  - [ ] `userProfile.premiumSettings` column added

- [ ] **Code Review**
  - [ ] No `process.env` access in client components
  - [ ] All server functions use `createServerFn`
  - [ ] Discriminated union types for all API responses
  - [ ] Transaction wrapping for all multi-step DB operations

### Post-Deployment Monitoring

- [ ] **Webhook Health**
  - [ ] Check Razorpay Dashboard → Webhooks → Recent Deliveries
  - [ ] Verify 200 responses for all events
  - [ ] Set up alerting for 4xx/5xx responses

- [ ] **Error Tracking**
  - [ ] Monitor `console.error` logs for `[RazorpayWebhook]` prefix
  - [ ] Track `RAZORPAY_ERROR` response codes from server functions
  - [ ] Alert on subscription creation failures

- [ ] **Business Metrics**
  - [ ] New subscriptions per day
  - [ ] Churn rate (cancellations)
  - [ ] Failed payment rate (pending → halted transitions)
  - [ ] Premium feature usage

### Rollback Plan

If critical issues found:

1. Set `RAZORPAY_TEST_MODE=true` (blocks new subscriptions except admins)
2. Existing subscribers keep access (webhooks still processed)
3. Fix issues and redeploy
4. Set `RAZORPAY_TEST_MODE=false` to re-enable

### Performance Considerations

| Operation | Expected Latency | Notes |
|-----------|-----------------|-------|
| `checkPremiumAccess()` | <50ms | Single DB query, cached in route context |
| `createUserSubscription()` | 500-2000ms | Razorpay API call + DB transaction |
| Webhook processing | <100ms | Should be fast to avoid Razorpay timeouts |
| Pattern rendering | 50-200ms | Client-side Canvas, depends on pattern complexity |

### Known Limitations

1. **No offline support**: Subscription status requires server check
2. **No pause/resume UI**: Users can only subscribe or cancel
3. **Single plan only**: One subscription tier (Premium Monthly)
4. **Malaysia currency only**: RM pricing hardcoded
5. **No proration**: Mid-cycle plan changes not supported
6. **Pattern placeholders**: Many decorative patterns use placeholder implementations

### Local Webhook Testing

For local development, use a tunnel service to receive webhooks:

```bash
# Option 1: ngrok (recommended)
ngrok http 3000
# Use the https URL in Razorpay Dashboard webhook settings

# Option 2: Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000

# Option 3: localtunnel
npx localtunnel --port 3000
```

> **Test Mode Tip:** Use Razorpay's test mode keys and test card numbers:
> - Test Card: `4111 1111 1111 1111`
> - Any future expiry date
> - Any CVV
> - Any name

### Monitoring & Debugging

```typescript
// Add to webhook handler for debugging
console.log('[RazorpayWebhook] Event received:', {
  event: event.event,
  subscriptionId: payload.subscription?.entity?.id,
  status: payload.subscription?.entity?.status,
})
```

Check Razorpay Dashboard → Webhooks → Recent Deliveries for webhook status.

---

## Quick Implementation Order

For efficient implementation, follow this order:

### Step 1: Foundation (No Breaking Changes)
```
1. Create src/db/schema/subscription.ts
2. Create src/lib/subscription.ts
3. Create src/types/premium.types.ts
4. Update src/db/schema/index.ts (add exports and relation)
5. Run: pnpm db:push
```

### Step 2: Backend Infrastructure
```
6. Create src/lib/razorpay.ts
7. Create src/lib/premium-gate.ts
8. Create src/routes/dashboard/functions/subscription.ts
9. Update src/routes/dashboard/functions/index.ts (add export)
10. Create src/routes/api/razorpay-webhook.ts
```

### Step 3: Premium Feature Integration
```
11. Update src/lib/image-limit.ts (add premium params with defaults)
12. Update src/routes/dashboard/functions/image-generator.ts
13. Update src/routes/dashboard.route.tsx (add isPremium to context)
```

### Step 4: Patterns & UI (Can be parallel)
```
14. Create src/utils/patterns.ts
15. Update src/db/schema/auth.ts (add premium settings columns)
16. Update src/lib/constants.ts (update pricing)
17. Create UI components (subscribe button, pattern picker, etc.)
```

### Step 5: Testing & Deployment
```
18. Set up ngrok for local webhook testing
19. Configure Razorpay Dashboard (plan, webhooks)
20. Test subscription flow end-to-end
21. Set RAZORPAY_TEST_MODE=true for admin-only testing
22. Deploy and monitor
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-07 | 1.0 | Initial comprehensive plan |
| 2025-01-07 | 1.1 | Final deep dive review - added backward compatibility details, React best practices validation, codebase anti-patterns, migration checklist, local testing guide |
