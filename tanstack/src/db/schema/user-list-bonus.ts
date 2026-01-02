import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'
import { typeid } from 'typeid-js'
import { user } from './auth'

// ============================================
// USER LIST BONUS - Tracks list limit bonuses
// ============================================
export const userListBonus = pgTable(
  'user_list_bonus',
  {
    id: varchar('id', { length: 50 })
      .primaryKey()
      .$defaultFn(() => typeid('ulb').toString()),

    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Type of bonus
    // 'referral' - from referring other users
    // 'purchase' - from buying add-on packs
    // 'subscription' - from active subscription tier
    bonusType: varchar('bonus_type', { length: 30 }).notNull(),

    // Number of additional lists granted
    amount: integer('amount').notNull(),

    // Optional reference to the source (e.g., referral ID, purchase ID, subscription ID)
    sourceId: varchar('source_id', { length: 100 }),

    // Optional description (e.g., "10-pack purchase", "Pro subscription")
    description: varchar('description', { length: 255 }),

    // For expiring bonuses (like subscriptions)
    expiresAt: timestamp('expires_at'),

    // Soft delete for when subscription lapses (preserves history)
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('user_list_bonus_user_id_idx').on(table.userId),
    index('user_list_bonus_type_idx').on(table.bonusType),
    index('user_list_bonus_active_idx').on(table.userId, table.isActive),
    // Index for finding expired bonuses
    index('user_list_bonus_expires_idx').on(table.expiresAt),
  ],
)

// ============================================
// RELATIONS
// ============================================
export const userListBonusRelations = relations(userListBonus, ({ one }) => ({
  user: one(user, {
    fields: [userListBonus.userId],
    references: [user.id],
  }),
}))
