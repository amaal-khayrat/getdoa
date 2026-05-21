import { relations } from 'drizzle-orm'

// Import for cross-module relations
import { account, session, user, userProfile } from './auth'
import { doa, doaHadithMatch, doaImageGeneration } from './doa'
import { doaList, doaListItem, favoriteList, savedDoa } from './doa-list'
import { referral, referralCode } from './referral'
import { userListBonus } from './user-list-bonus'

// Re-export all tables
export * from './auth'
export * from './doa'
export * from './doa-list'
export * from './referral'
export * from './user-list-bonus'

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
  hadithMatches: many(doaHadithMatch),
}))

export const doaHadithMatchRelations = relations(doaHadithMatch, ({ one }) => ({
  doa: one(doa, {
    fields: [doaHadithMatch.doaSlug],
    references: [doa.slug],
  }),
}))
