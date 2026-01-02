import { relations } from 'drizzle-orm'

// Re-export all tables
export * from './auth'
export * from './doa'
export * from './doa-list'
export * from './referral'
export * from './user-list-bonus'

// Import for cross-module relations
import { user, session, account, userProfile } from './auth'
import { doa, doaImageGeneration } from './doa'
import { doaList, doaListItem, savedDoa, favoriteList } from './doa-list'
import { referralCode, referral } from './referral'
import { userListBonus } from './user-list-bonus'

// ============================================
// USER RELATIONS (combines all domains)
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
}))

// ============================================
// DOA RELATIONS
// ============================================
export const doaRelations = relations(doa, ({ many }) => ({
  savedDoas: many(savedDoa),
  listItems: many(doaListItem),
}))
