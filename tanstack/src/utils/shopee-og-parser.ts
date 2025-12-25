import * as cheerio from 'cheerio'
import referrals from '../../data/referrals.json'

type ReferralUrl = (typeof referrals)[number]

const FETCH_TIMEOUT = 15000

export interface ShopeeOgData {
  title: string
  image: string
  price: string
  originalPrice?: string
  location?: string
}

export interface ShopeeReferralResult {
  url: string
  ogData?: ShopeeOgData
  error?: Error
}

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
export function getRandomUrls(count: number): ReferralUrl[] {
  return shuffleArray(referrals).slice(0, count)
}

/**
 * Get a fresh random URL excluding the given URLs
 */
export function getFreshUrl(excludeUrls: ReferralUrl[]): ReferralUrl {
  const available = referrals.filter((url: ReferralUrl) => !excludeUrls.includes(url))

  if (available.length === 0) {
    return referrals[Math.floor(Math.random() * referrals.length)] as ReferralUrl
  }

  return shuffleArray(available)[0]
}

/**
 * Fetch OG data directly from Shopee URL (no API call)
 */
export async function fetchShopeeOgData(url: string): Promise<ShopeeOgData | null> {
  console.log('[ShopeeParser] Fetching OG data for:', url)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    console.log('[ShopeeParser] Making request to:', url)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log('[ShopeeParser] Response not OK:', response.status)
      return null
    }

    console.log('[ShopeeParser] Response status:', response.status, 'URL:', response.url)

    let html = await response.text()
    let $ = cheerio.load(html)
    let currentUrl = response.url

    // Step 1: Find redirect from short link page
    if (currentUrl.includes('/opaanlp/')) {
      console.log('[ShopeeParser] Already on /opaanlp/ page')
    } else if (currentUrl.includes('s.shopee.com.my')) {
      console.log('[ShopeeParser] On short link page, looking for redirect...')

      let foundScriptRedirect = false

      $('script').each((_, el) => {
        const scriptContent = $(el).html() || ''

        // Look for window.location.href pattern
        const match = scriptContent.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/)
        if (match) {
          currentUrl = match[1]
          console.log('[ShopeeParser] Found window.location.href redirect:', currentUrl)
          foundScriptRedirect = true
        }

        // Look for Shopee opaanlp URL pattern
        if (!foundScriptRedirect) {
          const httpUrlMatch = scriptContent.match(/httpUrl:"([^"]+opaanlp[^"]+)"/)
          if (httpUrlMatch) {
            const httpUrl = httpUrlMatch[1]
            const unescapedUrl = httpUrl.replace(/\\\//g, '/')
            const idMatch = unescapedUrl.match(/\/opaanlp\/(\d+)\/(\d+)/)
            if (idMatch) {
              currentUrl = `https://shopee.com.my/opaanlp/${idMatch[1]}/${idMatch[2]}`
              console.log('[ShopeeParser] Extracted opaanlp URL:', currentUrl)
              foundScriptRedirect = true
            }
          }
        }
      })

      // If we found a new URL, fetch it
      if (currentUrl !== response.url) {
        console.log('[ShopeeParser] Fetching redirect URL:', currentUrl)
        const controller2 = new AbortController()
        const timeoutId2 = setTimeout(() => controller2.abort(), FETCH_TIMEOUT)

        const secondResponse = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          },
          signal: controller2.signal,
        })

        clearTimeout(timeoutId2)

        if (secondResponse.ok) {
          html = await secondResponse.text()
          currentUrl = secondResponse.url
          $ = cheerio.load(html)
        }
      }
    }

    // Step 2: Check if we're on /opaanlp/ page
    const opaanlpUrl = new URL(currentUrl)
    if (opaanlpUrl.pathname.includes('/opaanlp/')) {
      console.log('[ShopeeParser] On /opaanlp/ page, extracting product URL...')

      // Try meta refresh first
      const metaRefresh = $('meta[http-equiv="refresh"]').attr('content')
      let productUrl = ''

      if (metaRefresh) {
        const match = metaRefresh.match(/url=(.+)/i)
        if (match) {
          productUrl = match[1]
        }
      }

      // Fallback: construct from path pattern
      if (!productUrl) {
        const pathParts = opaanlpUrl.pathname.split('/')
        const opaanlpIndex = pathParts.indexOf('opaanlp')
        if (opaanlpIndex >= 0 && pathParts.length >= opaanlpIndex + 3) {
          const shopId = pathParts[opaanlpIndex + 1]
          const itemId = pathParts[opaanlpIndex + 2]
          opaanlpUrl.pathname = `/product/${shopId}/${itemId}`
          opaanlpUrl.searchParams.delete('__mobile__')
          productUrl = opaanlpUrl.toString()
        }
      }

      if (productUrl) {
        console.log('[ShopeeParser] Fetching product page:', productUrl)
        const controller2 = new AbortController()
        const timeoutId2 = setTimeout(() => controller2.abort(), FETCH_TIMEOUT)

        const productResponse = await fetch(productUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          },
          signal: controller2.signal,
        })

        clearTimeout(timeoutId2)

        if (productResponse.ok) {
          html = await productResponse.text()
          $ = cheerio.load(html)
        }
      }
    }

    // Parse meta tags
    const allMetaTags: Record<string, string> = {}
    $('meta').each((_, el) => {
      const prop = $(el).attr('property') || $(el).attr('name') || $(el).attr('itemprop')
      const content = $(el).attr('content')
      if (prop && content) {
        allMetaTags[prop] = content
      }
    })

    let jsonLdData: unknown = null
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const content = $(el).html()
        if (content) jsonLdData = JSON.parse(content)
      } catch {}
    })

    const ogData = parseOgTags($, allMetaTags, jsonLdData)
    console.log('[ShopeeParser] Final data:', { title: ogData.title?.slice(0, 30), price: ogData.price })

    return ogData
  } catch (error) {
    console.log('[ShopeeParser] Error:', error instanceof Error ? error.message : String(error))
    return null
  }
}

function parseOgTags(
  $: cheerio.CheerioAPI,
  allMetaTags: Record<string, string>,
  jsonLdData: unknown,
): ShopeeOgData {
  let title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    'Shopee Product'

  let image = $('meta[property="og:image"]').attr('content') || ''

  let ogDescription =
    $('meta[property="og:description"]').attr('content') || ''

  // Twitter fallback
  if (!title || title === 'Shopee Product') {
    title = allMetaTags['twitter:title'] || allMetaTags['title'] || title
  }

  if (!image) {
    image = allMetaTags['twitter:image'] || allMetaTags['twitter:image:src'] || image
  }

  if (!ogDescription) {
    ogDescription = allMetaTags['twitter:description'] || allMetaTags['description'] || ''
  }

  // JSON-LD fallback
  if (jsonLdData && typeof jsonLdData === 'object') {
    const jsonLd = jsonLdData as Record<string, unknown>

    if (jsonLd['@type'] === 'Product' || (Array.isArray(jsonLd['@type']) && jsonLd['@type'].includes('Product'))) {
      if (!title || title === 'Shopee Product') {
        title = (jsonLd.name as string) || title
      }

      if (!image) {
        const imageObj = jsonLd.image as string | { url?: string } | Array<unknown>
        if (typeof imageObj === 'string') {
          image = imageObj
        } else if (Array.isArray(imageObj) && imageObj.length > 0) {
          const firstImg = imageObj[0]
          if (typeof firstImg === 'string') {
            image = firstImg
          } else if (firstImg && typeof firstImg === 'object') {
            image = (firstImg as { url?: string }).url || ''
          }
        } else if (imageObj && typeof imageObj === 'object') {
          image = (imageObj as { url?: string }).url || ''
        }
      }

      const offers = jsonLd.offers as unknown
      if (offers && typeof offers === 'object') {
        const offersObj = offers as { price?: string | number; priceCurrency?: string }
        if (offersObj.price) {
          const priceCurrency = offersObj.priceCurrency || 'MYR'
          ogDescription = `${priceCurrency} ${offersObj.price}`
        }
      }
    }
  }

  // Price from data attributes
  $('[data-price]').each((_, el) => {
    const price = $(el).attr('data-price')
    if (price && !ogDescription.includes('RM')) {
      ogDescription = `RM ${price}`
    }
  })

  $('[itemprop="price"]').each((_, el) => {
    const price = $(el).attr('content') || $(el).text()
    if (price && !ogDescription.includes('RM')) {
      ogDescription = `RM ${price}`
    }
  })

  // Extract price
  const priceMatch = ogDescription.match(/RM\s?[\d,]+\.?\d*/)
  const price = priceMatch ? priceMatch[0] : 'See on Shopee'

  // Original price
  const priceMatches = ogDescription.matchAll(/RM\s?[\d,]+\.?\d*/g)
  const prices = Array.from(priceMatches, m => m[0])
  const originalPrice =
    prices.length > 1 && prices[0] !== prices[1] ? prices[0] : undefined

  // Location
  const locationMatch = ogDescription.match(/Deliver from:\s*([^\n]+)/)
  const location = locationMatch ? locationMatch[1].trim() : undefined

  return { title, image, price, originalPrice, location }
}
