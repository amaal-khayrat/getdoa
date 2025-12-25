import {
  fetchShopeeOgData,
  getRandomUrls,
  getFreshUrl,
  type ShopeeOgData,
} from './shopee-og-parser'

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
async function fetchBatchOgData(urls: string[]): Promise<ShopeeReferralResult[]> {
  const results: ShopeeReferralResult[] = []

  for (let i = 0; i < urls.length; i += MAX_CONCURRENT) {
    const batch = urls.slice(i, i + MAX_CONCURRENT)
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const ogData = await fetchShopeeOgData(url)
        return { url, ogData } as ShopeeReferralResult
      })
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
  options: FetchReferralsOptions = {}
): Promise<ShopeeReferralResult[]> {
  const {
    count = 4,
    maxRetries = 2,
  } = options

  const results: ShopeeReferralResult[] = []
  const attemptedUrls = new Set<string>()
  let urlsToFetch = getRandomUrls(count)

  // Initial fetch
  let fetchResults = await fetchBatchOgData(urlsToFetch)

  for (const result of fetchResults) {
    attemptedUrls.add(result.url)
    results.push(result)
  }

  // Retry failed items
  let retries = 0
  while (retries < maxRetries) {
    const failedItems = results.filter((r) => !r.ogData && r.url)

    if (failedItems.length === 0) {
      break
    }

    // Get fresh URLs for failed items
    const retryUrls = failedItems.map(() =>
      getFreshUrl(Array.from(attemptedUrls))
    )

    // Add new URLs to attempted set
    for (const url of retryUrls) {
      attemptedUrls.add(url)
    }

    const retryResults = await fetchBatchOgData(retryUrls)

    // Update results with retry data
    for (let i = 0; i < retryResults.length; i++) {
      const failedIndex = failedItems[i]?.url
        ? results.findIndex((r) => r.url === failedItems[i]?.url)
        : -1

      if (failedIndex >= 0) {
        results[failedIndex] = retryResults[i]
      } else {
        results.push(retryResults[i])
      }
    }

    retries++
  }

  return results
}

/**
 * Get count of available referral URLs
 */
export function getReferralCount(): number {
  return getRandomUrls(0).length
}
