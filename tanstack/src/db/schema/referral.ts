import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'
import { typeid } from 'typeid-js'
import { user } from './auth'

// ============================================
// REFERRAL CODE - One per user
// ============================================
export const referralCode = pgTable(
  'referral_code',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('rfc').toString()),
    userId: text('user_id')
      .notNull()
      .unique() // Each user has exactly one code
      .references(() => user.id, { onDelete: 'cascade' }),

    // Short, user-friendly code (e.g., "ABC123")
    code: varchar('code', { length: 20 }).notNull().unique(),

    // Leaderboard settings
    leaderboardVisible: boolean('leaderboard_visible').default(true).notNull(),
    displayPreference: varchar('display_preference', { length: 20 })
      .default('censored')
      .notNull(), // 'full' | 'censored' | 'anonymous'

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('referral_code_user_id_idx').on(table.userId),
    index('referral_code_code_idx').on(table.code),
  ],
)

// ============================================
// REFERRAL - Tracks successful referrals
// ============================================
export const referral = pgTable(
  'referral',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('ref').toString()),

    // The user who referred (owns the referral code)
    referrerId: text('referrer_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // The user who was referred (signed up using the code)
    referredUserId: text('referred_user_id')
      .notNull()
      .unique() // A user can only be referred once
      .references(() => user.id, { onDelete: 'cascade' }),

    // The code used (for audit trail)
    codeUsed: varchar('code_used', { length: 20 }).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('referral_referrer_id_idx').on(table.referrerId),
    index('referral_referred_user_id_idx').on(table.referredUserId),
    unique('referral_referred_user_unique').on(table.referredUserId),
  ],
)

// ============================================
// REFERRAL RELATIONS
// ============================================
export const referralCodeRelations = relations(referralCode, ({ one }) => ({
  user: one(user, {
    fields: [referralCode.userId],
    references: [user.id],
  }),
}))

export const referralRelations = relations(referral, ({ one }) => ({
  referrer: one(user, {
    fields: [referral.referrerId],
    references: [user.id],
    relationName: 'referrer',
  }),
  referredUser: one(user, {
    fields: [referral.referredUserId],
    references: [user.id],
    relationName: 'referredUser',
  }),
}))
