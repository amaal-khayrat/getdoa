import { createFileRoute } from '@tanstack/react-router'
import * as cheerio from 'cheerio'

const FETCH_TIMEOUT = 15000 // 15 seconds
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

interface CacheEntry {
  data: ShopeeOgData
  timestamp: number
}

// Simple in-memory cache (resets on server restart)
const ogCache = new Map<string, CacheEntry>()

interface ShopeeOgData {
  title: string
  image: string
  price: string
  originalPrice?: string
  location?: string
}

console.log('[ShopeeOG] API route loaded')

export const Route = createFileRoute('/api/shopee-og/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url).searchParams.get('url')
        console.log('[ShopeeOG] GET request, url:', url)

        if (!url) {
          console.log('[ShopeeOG] Missing url parameter')
          return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        if (!url.includes('shopee.com.my')) {
          console.log('[ShopeeOG] Invalid URL - not Shopee')
          return new Response(JSON.stringify({ error: 'Invalid Shopee URL' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Check cache first
        const cached = ogCache.get(url)
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          console.log('[ShopeeOG] Cache hit for:', url.slice(0, 50))
          return new Response(JSON.stringify(cached.data), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
        console.log('[ShopeeOG] Cache miss, fetching fresh data')

        try {
          // Single request with redirect following - response.url will be final URL after redirects
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

          console.log('[ShopeeOG] Fetching URL:', url)
          // DO NOT use redirect: 'follow' - Shopee uses JS/meta redirects which fetch won't follow
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
          console.log('[ShopeeOG] Response status:', response.status, 'URL:', response.url)

          let html = await response.text()
          console.log('[ShopeeOG] HTML length:', html.length)
          console.log('[ShopeeOG] HTML preview:', html.slice(0, 2000))
          let $ = cheerio.load(html)

          // Step 1: Find redirect from short link page
          // Shopee short links use JS to redirect to /opaanlp/
          let currentUrl = response.url

          if (currentUrl.includes('/opaanlp/')) {
            // Already on /opaanlp/, need second redirect
            console.log('[ShopeeOG] On /opaanlp/ page, looking for product redirect...')
          } else if (currentUrl.includes('s.shopee.com.my')) {
            // On short link page, need to find first redirect
            console.log('[ShopeeOG] On short link page, looking for redirect...')

            // Look for JS redirect in scripts
            let foundScriptRedirect = false
            let scriptCount = 0

            $('script').each((_, el) => {
              scriptCount++
              const scriptContent = $(el).html() || ''

              // Debug: log script length and if it contains shopee
              if (scriptContent.includes('shopee') && scriptContent.includes('opaanlp')) {
                console.log('[ShopeeOG] Script', scriptCount, 'contains shopee+opaanlp, length:', scriptContent.length)
                console.log('[ShopeeOG] Script content preview:', scriptContent.slice(0, 500))
              }

              // Look for window.location.href pattern
              const match = scriptContent.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/)
              if (match) {
                currentUrl = match[1]
                console.log('[ShopeeOG] Found window.location.href redirect:', currentUrl)
                foundScriptRedirect = true
              }

              // Look for Shopee opaanlp URL pattern (the actual redirect URL)
              // Pattern found in HTML: httpUrl:"https:\/\/shopee.com.my\/opaanlp\/261096280\/54502188380?...
              if (!foundScriptRedirect) {
                // Look for httpUrl configuration with shopee URL
                const httpUrlMatch = scriptContent.match(/httpUrl:"([^"]+opaanlp[^"]+)"/)
                if (httpUrlMatch) {
                  const httpUrl = httpUrlMatch[1]
                  console.log('[ShopeeOG] Found httpUrl in CONFIG:', httpUrl.slice(0, 80))
                  // The URL has escaped slashes: \/ - unescape first then match
                  const unescapedUrl = httpUrl.replace(/\\\//g, '/')
                  const idMatch = unescapedUrl.match(/\/opaanlp\/(\d+)\/(\d+)/)
                  if (idMatch) {
                    currentUrl = `https://shopee.com.my/opaanlp/${idMatch[1]}/${idMatch[2]}`
                    console.log('[ShopeeOG] Extracted opaanlp URL:', currentUrl)
                    foundScriptRedirect = true
                  }
                }
              }
            })

            console.log('[ShopeeOG] Total scripts checked:', scriptCount, 'foundScriptRedirect:', foundScriptRedirect)

            // Also look for meta refresh
            if (currentUrl === response.url) {
              const metaRefresh = $('meta[http-equiv="refresh"]').attr('content')
              if (metaRefresh) {
                const match = metaRefresh.match(/url=(.+)/i)
                if (match) {
                  currentUrl = match[1]
                  console.log('[ShopeeOG] Found meta refresh:', currentUrl)
                }
              }
            }

            // If we found a new URL, fetch it (this should be /opaanlp/)
            if (currentUrl !== response.url) {
              console.log('[ShopeeOG] Fetching redirect URL:', currentUrl)
              const controller2 = new AbortController()
              const timeoutId2 = setTimeout(() => controller2.abort(), FETCH_TIMEOUT)

              const secondResponse = await fetch(currentUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                },
                signal: controller2.signal,
              })

              clearTimeout(timeoutId2)
              console.log('[ShopeeOG] Second fetch status:', secondResponse.status)

              if (secondResponse.ok) {
                html = await secondResponse.text()
                currentUrl = secondResponse.url
                console.log('[ShopeeOG] Second page HTML length:', html.length)
                $ = cheerio.load(html)
              }
            }
          }

          // Step 2: Check if we're on /opaanlp/ page - need to find product redirect
          const opaanlpUrl = new URL(currentUrl)
          if (opaanlpUrl.pathname.includes('/opaanlp/')) {
            console.log('[ShopeeOG] On /opaanlp/ page, extracting product URL...')

            // Look for meta refresh redirect
            let productUrl = ''
            const metaRefresh = $('meta[http-equiv="refresh"]').attr('content')
            console.log('[ShopeeOG] Meta refresh:', metaRefresh)

            if (metaRefresh) {
              const match = metaRefresh.match(/url=(.+)/i)
              if (match) {
                productUrl = match[1]
                console.log('[ShopeeOG] Found product URL in meta refresh:', productUrl)
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
                console.log('[ShopeeOG] Constructed product URL:', productUrl)
              }
            }

            if (productUrl) {
              console.log('[ShopeeOG] Fetching product page:', productUrl)
              const controller2 = new AbortController()
              const timeoutId2 = setTimeout(() => controller2.abort(), FETCH_TIMEOUT)

              const productResponse = await fetch(productUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                },
                signal: controller2.signal,
              })

              clearTimeout(timeoutId2)
              console.log('[ShopeeOG] Product fetch status:', productResponse.status)

              if (productResponse.ok) {
                html = await productResponse.text()
                console.log('[ShopeeOG] Product page HTML length:', html.length)
                $ = cheerio.load(html)
              }
            }
          }

          // Parse meta tags from whatever page we're on
          console.log('[ShopeeOG] Parsing meta tags...')
          console.log('[ShopeeOG] HTML preview:', html.slice(0, 200))

          const allMetaTags: Record<string, string> = {}
          $('meta').each((_, el) => {
            const prop = $(el).attr('property') || $(el).attr('name') || $(el).attr('itemprop')
            const content = $(el).attr('content')
            if (prop && content) {
              allMetaTags[prop] = content
            }
          })
          console.log('[ShopeeOG] Meta tags count:', Object.keys(allMetaTags).length)
          console.log('[ShopeeOG] og:title:', allMetaTags['og:title'])
          console.log('[ShopeeOG] og:image:', allMetaTags['og:image'])

          // Also check for data in scripts - Shopee might embed OG data in JavaScript
          console.log('[ShopeeOG] Checking script tags for data...')
          $('script').each((_, el) => {
            const scriptContent = $(el).html() || ''
            if (scriptContent.includes('"og:title"') || scriptContent.includes('ogImage') || scriptContent.includes('itemImages')) {
              console.log('[ShopeeOG] Found potential data in script, content preview:', scriptContent.slice(0, 500))
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
          console.log('[ShopeeOG] Final data:', { title: ogData.title?.slice(0, 30), image: ogData.image?.slice(0, 50), price: ogData.price })

          // Cache the successful result
          ogCache.set(url, { data: ogData, timestamp: Date.now() })
          console.log('[ShopeeOG] Cached result for:', url.slice(0, 50))

          return new Response(JSON.stringify(ogData), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message =
            error instanceof Error && error.name === 'AbortError'
              ? 'Request timeout'
              : `Failed to fetch OG data: ${error instanceof Error ? error.message : String(error)}`

          console.log('[ShopeeOG] Error:', message)
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})

function parseOgTags(
  $: cheerio.CheerioAPI,
  allMetaTags: Record<string, string>,
  jsonLdData: unknown,
): ShopeeOgData {
  // Try standard OG tags first
  let title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    'Shopee Product'

  let image = $('meta[property="og:image"]').attr('content') || ''

  let ogDescription =
    $('meta[property="og:description"]').attr('content') || ''

  // Try twitter tags as fallback
  if (!title || title === 'Shopee Product') {
    title = allMetaTags['twitter:title'] || allMetaTags['title'] || title
  }

  if (!image) {
    image = allMetaTags['twitter:image'] || allMetaTags['twitter:image:src'] || image
  }

  if (!ogDescription) {
    ogDescription = allMetaTags['twitter:description'] || allMetaTags['description'] || ''
  }

  // Try JSON-LD Product type
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
        } else if (Array.isArray(imageObj)) {
          if (imageObj.length > 0) {
            const firstImg = imageObj[0]
            if (typeof firstImg === 'string') {
              image = firstImg
            } else if (firstImg && typeof firstImg === 'object') {
              image = (firstImg as { url?: string }).url || ''
            }
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

  // Look for price in page data attributes (Shopee uses data-* attributes)
  $('[data-price]').each((_, el) => {
    const price = $(el).attr('data-price')
    if (price && !ogDescription.includes('RM')) {
      ogDescription = `RM ${price}`
    }
  })

  // Look for itemprop price
  $('[itemprop="price"]').each((_, el) => {
    const price = $(el).attr('content') || $(el).text()
    if (price && !ogDescription.includes('RM')) {
      ogDescription = `RM ${price}`
    }
  })

  // Extract price
  const priceMatch = ogDescription.match(/RM\s?[\d,]+\.?\d*/)
  const price = priceMatch ? priceMatch[0] : 'See on Shopee'

  // Extract original price
  const priceMatches = ogDescription.matchAll(/RM\s?[\d,]+\.?\d*/g)
  const prices = Array.from(priceMatches, m => m[0])
  const originalPrice =
    prices.length > 1 && prices[0] !== prices[1] ? prices[0] : undefined

  // Extract location
  const locationMatch = ogDescription.match(/Deliver from:\s*([^\n]+)/)
  const location = locationMatch ? locationMatch[1].trim() : undefined

  return { title, image, price, originalPrice, location }
}
