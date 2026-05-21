import {
  fetchShopeeOgData,
  getFreshUrl,
  getRandomUrls,
  getReferralUrlCount,
} from './shopee-og-parser'
import type { ShopeeOgData } from './shopee-og-parser'

export interface ShopeeReferralResult {
  url: string
  ogData?: ShopeeOgData
  error?: Error
}

export interface FetchReferralsOptions {
  count?: number
  maxRetries?: number
}

const MAX_CONCURRENT = 4

/**
 * Fetch OG data for multiple URLs in parallel with concurrency limit
 */
async function fetchBatchOgData(
  urls: Array<string>,
): Promise<Array<ShopeeReferralResult>> {
  const results: Array<ShopeeReferralResult> = []

  for (let i = 0; i < urls.length; i += MAX_CONCURRENT) {
    const batch = urls.slice(i, i + MAX_CONCURRENT)
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const ogData = await fetchShopeeOgData(url)
        return { url, ogData } as ShopeeReferralResult
      }),
    )
    results.push(...batchResults)
  }

  return results
}

/**
 * Fetch shopee referrals with OG data
 * Fetches random URLs in parallel, retries failures, returns results
 */
export async function fetchShopeeReferrals(
  options: FetchReferralsOptions = {},
): Promise<Array<ShopeeReferralResult>> {
  const { count = 4, maxRetries = 3 } = options

  const successfulResults: Array<ShopeeReferralResult> = []
  const failedResults: Array<ShopeeReferralResult> = []
  const attemptedUrls = new Set<string>()
  const targetCount = Math.max(1, count)
  let attemptsRemaining = targetCount * (maxRetries + 1)
  let urlsToFetch = getRandomUrls(Math.min(targetCount, attemptsRemaining))

  while (
    successfulResults.length < targetCount &&
    attemptsRemaining > 0 &&
    urlsToFetch.length > 0
  ) {
    for (const url of urlsToFetch) {
      attemptedUrls.add(url)
    }

    attemptsRemaining -= urlsToFetch.length
    const fetchResults = await fetchBatchOgData(urlsToFetch)

    for (const result of fetchResults) {
      if (result.ogData?.image) {
        successfulResults.push(result)
      } else {
        failedResults.push(result)
      }
    }

    const remainingNeeded = targetCount - successfulResults.length
    const nextBatchSize = Math.min(remainingNeeded, attemptsRemaining)
    const nextUrls: Array<string> = []

    while (nextUrls.length < nextBatchSize) {
      const freshUrl = getFreshUrl([...Array.from(attemptedUrls), ...nextUrls])
      if (attemptedUrls.has(freshUrl) || nextUrls.includes(freshUrl)) break
      nextUrls.push(freshUrl)
    }

    urlsToFetch = nextUrls
  }

  return successfulResults.length > 0
    ? successfulResults.slice(0, targetCount)
    : failedResults.slice(0, targetCount)
}

/**
 * Get count of available referral URLs
 */
export function getReferralCount(): number {
  return getReferralUrlCount()
}
