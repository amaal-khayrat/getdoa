/**
 * Backfill referral bonuses for existing referrers.
 *
 * This script should be run once after deploying the list limit feature
 * to create bonus records for users who already have referrals.
 *
 * Usage: pnpm db:backfill-bonuses
 */

import { config } from 'dotenv'
import { db } from './index'
import { referral, userListBonus } from './schema'
import { eq, sql, and } from 'drizzle-orm'
import { BONUS_TYPES, LIST_LIMIT_CONFIG } from '../lib/list-limit'

config()

async function backfillReferralBonuses() {
  console.log('Backfilling referral bonuses...')
  console.log(
    `Config: MAX_REFERRAL_BONUS=${LIST_LIMIT_CONFIG.MAX_REFERRAL_BONUS}`,
  )

  // Get all users with referrals
  const referrers = await db
    .select({
      userId: referral.referrerId,
      count: sql<number>`count(*)::int`,
    })
    .from(referral)
    .groupBy(referral.referrerId)

  console.log(`Found ${referrers.length} users with referrals`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const { userId, count } of referrers) {
    const bonusAmount = Math.min(
      count * LIST_LIMIT_CONFIG.BONUS_PER_REFERRAL,
      LIST_LIMIT_CONFIG.MAX_REFERRAL_BONUS,
    )

    const description =
      count >= LIST_LIMIT_CONFIG.MAX_REFERRAL_BONUS
        ? `${count} referrals (max bonus reached)`
        : `${count} referral${count === 1 ? '' : 's'}`

    // Check if bonus already exists
    const existing = await db.query.userListBonus.findFirst({
      where: and(
        eq(userListBonus.userId, userId),
        eq(userListBonus.bonusType, BONUS_TYPES.REFERRAL),
      ),
    })

    if (existing) {
      // Update if amount different
      if (existing.amount !== bonusAmount) {
        await db
          .update(userListBonus)
          .set({ amount: bonusAmount, description })
          .where(eq(userListBonus.id, existing.id))
        console.log(`  Updated: user=${userId}, amount=${bonusAmount}`)
        updated++
      } else {
        skipped++
      }
    } else {
      // Create new
      await db.insert(userListBonus).values({
        userId,
        bonusType: BONUS_TYPES.REFERRAL,
        amount: bonusAmount,
        description,
      })
      console.log(`  Created: user=${userId}, amount=${bonusAmount}`)
      created++
    }
  }

  console.log('\nBackfill complete!')
  console.log(`  Created: ${created}`)
  console.log(`  Updated: ${updated}`)
  console.log(`  Skipped (no change): ${skipped}`)
}

// Run with proper cleanup
backfillReferralBonuses()
  .then(() => {
    console.log('\nExiting...')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exit(1)
  })
