import referrals from '../../data/referrals.json'

type ReferralUrl = (typeof referrals)[number]

console.log('[ShopeeReferrals] Utility loaded, total referrals:', referrals.length)

/**
 * Shuffle array using Fisher-Yates algorithm for true randomness
 */
function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get N random unique referral URLs from the referrals pool
 */
export function getRandomReferrals(count: number): ReferralUrl[] {
  const result = shuffleArray(referrals).slice(0, count)
  console.log('[ShopeeReferrals] getRandomReferrals called, count:', count, 'result:', result.length)
  return result
}

/**
 * Get a fresh random URL excluding the given URLs
 * Used when a referral link fails and needs to be replaced
 */
export function getFreshReferralUrl(excludeUrls: ReferralUrl[]): ReferralUrl {
  const available = referrals.filter(url => !excludeUrls.includes(url))
  console.log('[ShopeeReferrals] getFreshReferralUrl, exclude:', excludeUrls.length, 'available:', available.length)

  if (available.length === 0) {
    console.log('[ShopeeReferrals] No available URLs, using fallback random')
    return referrals[Math.floor(Math.random() * referrals.length)] as ReferralUrl
  }

  const result = shuffleArray(available)[0]
  console.log('[ShopeeReferrals] Fresh URL selected:', result)
  return result
}
