import { createServerFn } from '@tanstack/react-start'
import {  and, asc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import type {SQL} from 'drizzle-orm';
import type { DoaDetail, SearchableDoa } from '@/types/doa.types'
import { db } from '@/db'
import { doa, doaHadithMatch } from '@/db/schema'
import { PAGINATION_DEFAULTS } from '@/types/doa.types'

// ============================================
// Helper: Escape special characters for ILIKE
// ============================================
function escapeIlike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

function buildHadithSearchCondition(searchTerm: string): SQL {
  return sql`exists (
    select 1 from ${doaHadithMatch}
    where ${doaHadithMatch.doaSlug} = ${doa.slug}
    and (
      ${doaHadithMatch.matchedReference} ilike ${searchTerm}
      or ${doaHadithMatch.book} ilike ${searchTerm}
      or ${doaHadithMatch.chapterTitleArabic} ilike ${searchTerm}
      or ${doaHadithMatch.chapterTitleEnglish} ilike ${searchTerm}
      or ${doaHadithMatch.arabicText} ilike ${searchTerm}
      or ${doaHadithMatch.englishText} ilike ${searchTerm}
      or ${doaHadithMatch.grade} ilike ${searchTerm}
      or ${doaHadithMatch.referenceUrl} ilike ${searchTerm}
      or ${doaHadithMatch.inBookReference} ilike ${searchTerm}
      or cast(${doaHadithMatch.chapterNumber} as text) ilike ${searchTerm}
    )
  )`
}

// ============================================
// GET ALL DUAS (with pagination & filtering)
// ============================================
export const getAllDoas = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { search?: string; category?: string; page?: number; limit?: number }) => data,
  )
  .handler(async ({ data }) => {
    const { search, category } = data
    // Enforce maximum limit with defaults
    const page = Math.max(1, data.page ?? PAGINATION_DEFAULTS.page)
    const limit = Math.min(data.limit ?? PAGINATION_DEFAULTS.limit, PAGINATION_DEFAULTS.maxLimit)
    const offset = (page - 1) * limit

    // Build where conditions using drizzle-orm's `and()`
    const conditions: Array<SQL> = []

    if (search && search.trim()) {
      const searchTerm = `%${escapeIlike(search.trim())}%`
      conditions.push(
        or(
          ilike(doa.nameMy, searchTerm),
          ilike(doa.nameEn, searchTerm),
          ilike(doa.content, searchTerm),
          ilike(doa.meaningMy, searchTerm),
          ilike(doa.meaningEn, searchTerm),
          ilike(doa.referenceMy, searchTerm),
          ilike(doa.referenceEn, searchTerm),
          ilike(doa.descriptionMy, searchTerm),
          ilike(doa.descriptionEn, searchTerm),
          ilike(doa.contextMy, searchTerm),
          ilike(doa.contextEn, searchTerm),
          buildHadithSearchCondition(searchTerm),
        )!,
      )
    }

    if (category && category.trim()) {
      // JSONB array contains - properly parameterized
      conditions.push(
        sql`${doa.categoryNames} @> ${JSON.stringify([category.trim()])}::jsonb`,
      )
    }

    // Use `and()` from drizzle-orm instead of manual reduce
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Count total (single query with same conditions)
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(doa)
      .where(whereClause)

    const total = countResult.count

    // Get paginated data with hadith metadata so the client can search instantly.
    const results: Array<SearchableDoa> = await db.query.doa.findMany({
      where: whereClause,
      with: {
        hadithMatches: {
          columns: {
            matchedReference: true,
            book: true,
            chapterNumber: true,
            chapterTitleArabic: true,
            chapterTitleEnglish: true,
            arabicText: true,
            englishText: true,
            grade: true,
            referenceUrl: true,
            inBookReference: true,
          },
          orderBy: [asc(doaHadithMatch.sortOrder)],
        },
      },
      limit,
      offset,
      orderBy: [asc(doa.nameEn)],
    })

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    }
  })

// ============================================
// GET SINGLE DOA BY SLUG
// ============================================
export const getDoaBySlug = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<DoaDetail | null> => {
    const result = await db.query.doa.findFirst({
      where: eq(doa.slug, data.slug),
      with: {
        hadithMatches: {
          columns: {
            matchedReference: true,
            book: true,
            chapterNumber: true,
            chapterTitleArabic: true,
            chapterTitleEnglish: true,
            arabicText: true,
            englishText: true,
            grade: true,
            referenceUrl: true,
            inBookReference: true,
          },
          orderBy: [asc(doaHadithMatch.sortOrder)],
        },
      },
    })
    return result ?? null
  })

// ============================================
// GET MULTIPLE DUAS BY SLUGS (for list resolution)
// ============================================
export const getDoasBySlugs = createServerFn({ method: 'GET' })
  .inputValidator((data: { slugs: Array<string> }) => data)
  .handler(async ({ data }) => {
    if (data.slugs.length === 0) return []

    // Dedupe slugs while preserving order
    const uniqueSlugs = [...new Set(data.slugs)]

    const results = await db
      .select()
      .from(doa)
      .where(inArray(doa.slug, uniqueSlugs as [string, ...Array<string>]))

    // Maintain order from input slugs
    const slugMap = new Map(results.map((d) => [d.slug, d]))
    return data.slugs
      .map((slug) => slugMap.get(slug))
      .filter((d): d is NonNullable<typeof d> => d !== undefined)
  })

// ============================================
// GET ALL UNIQUE CATEGORIES (with simple caching)
// ============================================
let categoriesCache: { data: Array<string>; timestamp: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export const getDoaCategories = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Simple in-memory cache for categories (rarely change)
    const now = Date.now()
    if (categoriesCache && now - categoriesCache.timestamp < CACHE_TTL_MS) {
      return categoriesCache.data
    }

    const results = await db
      .selectDistinct({ categoryNames: doa.categoryNames })
      .from(doa)

    // Flatten and dedupe
    const categories = new Set<string>()
    results.forEach((r) => {
      r.categoryNames.forEach((cat) => {
        if (cat && cat.trim()) categories.add(cat.trim())
      })
    })

    const sortedCategories = Array.from(categories).sort()

    // Update cache
    categoriesCache = { data: sortedCategories, timestamp: now }

    return sortedCategories
  },
)

// ============================================
// GET RANDOM DOA (for daily doa feature)
// ============================================
export const getRandomDoa = createServerFn({ method: 'GET' })
  .inputValidator((data: { category?: string }) => data)
  .handler(async ({ data }) => {
    const whereClause = data.category?.trim()
      ? sql`${doa.categoryNames} @> ${JSON.stringify([data.category.trim()])}::jsonb`
      : undefined

    const [result] = await db
      .select()
      .from(doa)
      .where(whereClause)
      .orderBy(sql`RANDOM()`)
      .limit(1)

    return result
  })

// ============================================
// GET DOA COUNT (for stats/analytics)
// ============================================
export const getDoaCount = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(doa)
    return result.count
  },
)
