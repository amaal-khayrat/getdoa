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

    // Admin grant tracking
    isAdminGranted: boolean('is_admin_granted').default(false).notNull(),
    adminGrantedBy: text('admin_granted_by').references(() => user.id, { onDelete: 'set null' }),
    adminGrantedAt: timestamp('admin_granted_at', { mode: 'date' }),
    adminGrantNote: varchar('admin_grant_note', { length: 255 }),

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
    index('user_subscription_admin_granted_idx').on(table.isAdminGranted),
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
export const userSubscriptionRelations = relations(
  userSubscription,
  ({ one, many }) => ({
    user: one(user, {
      fields: [userSubscription.userId],
      references: [user.id],
    }),
    // Relation to admin who granted access
    grantedByUser: one(user, {
      fields: [userSubscription.adminGrantedBy],
      references: [user.id],
      relationName: 'adminGrantedSubscriptions', // Disambiguate multiple user relations
    }),
    events: many(subscriptionEvent),
  }),
)

export const subscriptionEventRelations = relations(
  subscriptionEvent,
  ({ one }) => ({
    subscription: one(userSubscription, {
      fields: [subscriptionEvent.subscriptionId],
      references: [userSubscription.id],
    }),
  }),
)
