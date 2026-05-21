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
// USER LIST BONUS - Legacy referral bonus records
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

    // Type of legacy bonus, currently only 'referral' is written.
    bonusType: varchar('bonus_type', { length: 30 }).notNull(),

    // Legacy amount retained for existing data.
    amount: integer('amount').notNull(),

    // Optional reference to the source, such as a referral ID.
    sourceId: varchar('source_id', { length: 100 }),

    // Optional description.
    description: varchar('description', { length: 255 }),

    // Optional expiration for historical records.
    expiresAt: timestamp('expires_at'),

    // Soft delete flag for historical records.
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
