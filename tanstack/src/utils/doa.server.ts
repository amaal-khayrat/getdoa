import { db } from '@/db'
import { doa } from '@/db/schema'
import { eq, ilike, or, sql } from 'drizzle-orm'
import type { Doa } from '@/types/doa.types'

/**
 * Load all DOA data from database
 */
export async function loadDoaData(): Promise<Doa[]> {
  return db.select().from(doa)
}

/**
 * Get all unique categories from DOA data
 */
export async function getDoaCategories(): Promise<string[]> {
  const results = await db.selectDistinct({ categoryNames: doa.categoryNames }).from(doa)
  const categories = new Set<string>()

  for (const item of results) {
    if (item.categoryNames) {
      for (const category of item.categoryNames) {
        categories.add(category)
      }
    }
  }

  return Array.from(categories).sort()
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Paginated DOA response
 */
export interface PaginatedDoaResponse {
  data: Doa[]
  pagination: PaginationMeta
}

/**
 * Get paginated DOA data
 */
export async function getPaginatedDoa(
  page: number,
  limit: number,
): Promise<PaginatedDoaResponse> {
  // Validate parameters
  const validPage = Math.max(1, page)
  const validLimit = Math.max(1, Math.min(100, limit)) // Cap at 100

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(doa)
  const total = countResult?.count || 0
  const totalPages = Math.ceil(total / validLimit)
  const validPageNumber = Math.min(validPage, totalPages || 1)

  const offset = (validPageNumber - 1) * validLimit
  const data = await db.select().from(doa).limit(validLimit).offset(offset)

  return {
    data,
    pagination: {
      page: validPageNumber,
      limit: validLimit,
      total,
      totalPages: totalPages || 0,
      hasNextPage: validPageNumber < totalPages,
      hasPrevPage: validPageNumber > 1,
    },
  }
}

/**
 * Get a random DOA item, optionally filtered by category
 */
export async function getRandomDoa(category?: string): Promise<Doa | null> {
  const whereClause = category
    ? sql`${doa.categoryNames} @> ${JSON.stringify([category])}::jsonb`
    : undefined

  const [result] = await db
    .select()
    .from(doa)
    .where(whereClause)
    .orderBy(sql`RANDOM()`)
    .limit(1)

  return result ?? null
}

/**
 * Get random DOA items with optional category filter
 */
export async function getRandomDoaBatch(
  count: number,
  category?: string,
): Promise<Doa[]> {
  const whereClause = category
    ? sql`${doa.categoryNames} @> ${JSON.stringify([category])}::jsonb`
    : undefined

  return db
    .select()
    .from(doa)
    .where(whereClause)
    .orderBy(sql`RANDOM()`)
    .limit(count)
}

/**
 * Get DOA item by slug
 */
export async function getDoaBySlug(slug: string): Promise<Doa | null> {
  const result = await db.query.doa.findFirst({
    where: eq(doa.slug, slug),
  })
  return result ?? null
}

/**
 * Search DOA items by query (searches name and content)
 */
export async function searchDoa(query: string): Promise<Doa[]> {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) {
    return []
  }

  const searchTerm = `%${lowerQuery}%`

  return db
    .select()
    .from(doa)
    .where(
      or(
        ilike(doa.nameMy, searchTerm),
        ilike(doa.nameEn, searchTerm),
        ilike(doa.content, searchTerm),
        ilike(doa.meaningMy, searchTerm),
        ilike(doa.meaningEn, searchTerm),
      ),
    )
}
