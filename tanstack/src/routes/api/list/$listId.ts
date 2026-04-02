import { createFileRoute } from '@tanstack/react-router'
import { db } from '@/db'
import { doaList, doaListItem } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

console.log('[ListAPI] List JSON endpoint loaded')

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  })
}

export const Route = createFileRoute('/api/list/$listId')({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: JSON_HEADERS })
      },

      GET: async ({ params }: { params: { listId: string }; request: Request }) => {
        const { listId } = params

        console.log('[ListAPI] GET request for listId:', listId)

        try {
          // Step 1: fetch metadata only — avoids loading items for non-public lists
          const list = await db.query.doaList.findFirst({
            where: eq(doaList.id, listId),
          })

          if (!list) {
            console.log('[ListAPI] List not found:', listId)
            return jsonResponse({ error: 'List not found' }, 404)
          }

          if (list.status !== 'published' || list.visibility !== 'public') {
            console.log('[ListAPI] List is not public:', listId)
            return jsonResponse({ error: 'List is not publicly accessible' }, 403)
          }

          // Step 2: fetch items only for public lists
          const items = await db.query.doaListItem.findMany({
            where: eq(doaListItem.listId, listId),
            with: { doa: true },
            orderBy: [asc(doaListItem.order)],
          })

          const isEnglish = list.language === 'en'

          const entries = items.map((item) => {
            const doa = item.doa
            return {
              slug: doa.slug,
              title: isEnglish ? doa.nameEn : doa.nameMy,
              text: doa.content,
              translation: isEnglish
                ? (doa.meaningEn ?? null)
                : (doa.meaningMy ?? null),
              source: isEnglish
                ? (doa.referenceEn ?? null)
                : (doa.referenceMy ?? null),
            }
          })

          const response = {
            id: list.id,
            title: list.name,
            description: list.description ?? null,
            language: list.language,
            entries,
            meta: {
              itemCount: entries.length,
              createdAt: list.createdAt.toISOString(),
              updatedAt: list.updatedAt.toISOString(),
            },
          }

          console.log(
            '[ListAPI] Returning list:',
            list.id,
            'with',
            entries.length,
            'entries',
          )

          return jsonResponse(response)
        } catch (error) {
          console.error('[ListAPI] Error while fetching list:', listId, error)

          return jsonResponse(
            { error: 'Internal server error' },
            500,
          )
        }
      },
    },
  },
})
