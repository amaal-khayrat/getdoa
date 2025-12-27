import { createFileRoute } from '@tanstack/react-router'
import { getRandomDoa, getRandomDoaBatch } from '@/utils/doa.server'

console.log('[DoaAPI] DOA random endpoint loaded')

interface RandomQuery {
  count?: string
  category?: string
}

export const Route = createFileRoute('/api/doa/random')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const query: RandomQuery = {
          count: url.searchParams.get('count') || undefined,
          category: url.searchParams.get('category') || undefined,
        }

        console.log('[DoaAPI] Random request, query:', query)

        try {
          // Parse count parameter
          const count = query.count
            ? parseInt(query.count, 10)
            : undefined

          // Validate count
          if (count !== undefined && (isNaN(count) || count < 1 || count > 10)) {
            console.log('[DoaAPI] Invalid count parameter:', query.count)
            return new Response(
              JSON.stringify({
                error:
                  'Invalid count parameter. Count must be a number between 1 and 10.',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Handle batch request (count > 1)
          if (count && count > 1) {
            const items = await getRandomDoaBatch(count, query.category)
            console.log('[DoaAPI] Returning', items.length, 'random items')

            return new Response(
              JSON.stringify({
                data: items,
                count: items.length,
                category: query.category || null,
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Single random DOA
          const doa = await getRandomDoa(query.category)

          if (!doa) {
            console.log('[DoaAPI] No DOA found for category:', query.category)
            return new Response(
              JSON.stringify({
                error: query.category
                  ? `No DOA found for category: ${query.category}`
                  : 'No DOA data available',
              }),
              {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          console.log('[DoaAPI] Returning random DOA:', doa.slug)

          return new Response(JSON.stringify({ data: doa }), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          console.error('[DoaAPI] Error:', message)

          return new Response(
            JSON.stringify({ error: `Internal server error: ${message}` }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },
    },
  },
})
