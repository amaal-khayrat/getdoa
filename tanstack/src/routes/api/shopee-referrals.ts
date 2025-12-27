import { createFileRoute } from '@tanstack/react-router'
import { fetchShopeeReferrals } from '@/utils/shopee-fetch.server'

console.log('[ShopeeReferralsAPI] API route loaded')

export const Route = createFileRoute('/api/shopee-referrals')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const countParam = url.searchParams.get('count')
        const count = countParam ? parseInt(countParam, 10) : 4

        console.log('[ShopeeReferralsAPI] GET request, count:', count)

        if (isNaN(count) || count < 1 || count > 10) {
          console.log('[ShopeeReferralsAPI] Invalid count parameter')
          return new Response(JSON.stringify({ error: 'Invalid count parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        try {
          console.log('[ShopeeReferralsAPI] Starting fetch...')
          const startTime = Date.now()

          const results = await fetchShopeeReferrals({ count })

          const duration = Date.now() - startTime
          console.log('[ShopeeReferralsAPI] Completed in', duration, 'ms')

          const successfulCount = results.filter((r) => r.ogData).length
          console.log('[ShopeeReferralsAPI] Results:', successfulCount, 'of', count, 'successful')

          const responseData = {
            items: results,
            summary: {
              total: count,
              successful: successfulCount,
              failed: count - successfulCount,
            },
          }

          return new Response(JSON.stringify(responseData), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          console.log('[ShopeeReferralsAPI] Error:', message)

          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
