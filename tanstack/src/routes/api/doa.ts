import { createFileRoute } from '@tanstack/react-router'
import {
  getPaginatedDoa,
  searchDoa,
} from '@/utils/doa.server'

console.log('[DoaAPI] DOA list endpoint loaded')

// Default pagination settings
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

interface PaginationQuery {
  page?: string
  limit?: string
  search?: string
}

export const Route = createFileRoute('/api/doa')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const query: PaginationQuery = {
          page: url.searchParams.get('page') || undefined,
          limit: url.searchParams.get('limit') || undefined,
          search: url.searchParams.get('search') || undefined,
        }

        console.log('[DoaAPI] GET request, query:', query)

        try {
          // Handle search query first
          if (query.search && query.search.trim().length > 0) {
            const results = await searchDoa(query.search)
            console.log('[DoaAPI] Search results:', results.length, 'items')

            // Apply pagination to search results
            const page = parseInt(query.page || String(DEFAULT_PAGE), 10)
            const limit = parseInt(query.limit || String(DEFAULT_LIMIT), 10)
            const validLimit = Math.max(1, Math.min(MAX_LIMIT, limit))
            const offset = (page - 1) * validLimit
            const paginatedResults = results.slice(offset, offset + validLimit)

            return new Response(
              JSON.stringify({
                data: paginatedResults,
                pagination: {
                  page,
                  limit: validLimit,
                  total: results.length,
                  totalPages: Math.ceil(results.length / validLimit),
                  hasNextPage: offset + validLimit < results.length,
                  hasPrevPage: page > 1,
                },
                search: query.search,
              }),
              {
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Parse pagination parameters
          const page = parseInt(query.page || String(DEFAULT_PAGE), 10)
          const limit = parseInt(query.limit || String(DEFAULT_LIMIT), 10)

          // Validate page
          if (isNaN(page) || page < 1) {
            console.log('[DoaAPI] Invalid page parameter:', query.page)
            return new Response(
              JSON.stringify({
                error: 'Invalid page parameter. Page must be a positive integer.',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          // Validate limit
          if (isNaN(limit) || limit < 1 || limit > MAX_LIMIT) {
            console.log('[DoaAPI] Invalid limit parameter:', query.limit)
            return new Response(
              JSON.stringify({
                error: `Invalid limit parameter. Limit must be between 1 and ${MAX_LIMIT}.`,
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          }

          console.log('[DoaAPI] Fetching page', page, 'with limit', limit)
          const result = await getPaginatedDoa(page, limit)

          console.log('[DoaAPI] Returning', result.data.length, 'items')

          return new Response(JSON.stringify(result), {
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
