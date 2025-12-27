import fs from 'node:fs/promises'
import path from 'node:path'
import type { DoaItem } from '@/types/doa.types'

// Path to DOA data file (relative to this file)
const DOA_DATA_PATH = path.resolve(import.meta.dirname, '../../data/doa.json')

// In-memory cache for DOA data (avoids repeated file reads)
let cachedDoaData: DoaItem[] | null = null

/**
 * Load DOA data from JSON file with caching
 */
export async function loadDoaData(): Promise<DoaItem[]> {
  if (cachedDoaData !== null) {
    return cachedDoaData
  }

  try {
    const fileContent = await fs.readFile(DOA_DATA_PATH, 'utf-8')
    cachedDoaData = JSON.parse(fileContent) as DoaItem[]

    if (!Array.isArray(cachedDoaData)) {
      throw new Error('DOA data is not an array')
    }

    console.log('[DoaAPI] Loaded', cachedDoaData.length, 'doa items')
    return cachedDoaData
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[DoaAPI] Failed to load DOA data:', message)
    throw new Error(`Failed to load DOA data: ${message}`)
  }
}

/**
 * Get all unique categories from DOA data
 */
export async function getDoaCategories(): Promise<string[]> {
  const doaData = await loadDoaData()
  const categories = new Set<string>()

  for (const item of doaData) {
    if (item.category_names) {
      for (const category of item.category_names) {
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
  data: DoaItem[]
  pagination: PaginationMeta
}

/**
 * Get paginated DOA data
 */
export async function getPaginatedDoa(
  page: number,
  limit: number,
): Promise<PaginatedDoaResponse> {
  const allDoa = await loadDoaData()

  // Validate parameters
  const validPage = Math.max(1, page)
  const validLimit = Math.max(1, Math.min(100, limit)) // Cap at 100

  const total = allDoa.length
  const totalPages = Math.ceil(total / validLimit)
  const validPageNumber = Math.min(validPage, totalPages || 1)

  const offset = (validPageNumber - 1) * validLimit
  const data = allDoa.slice(offset, offset + validLimit)

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
export async function getRandomDoa(category?: string): Promise<DoaItem | null> {
  const allDoa = await loadDoaData()

  // If no category specified, return random from all
  if (!category) {
    const randomIndex = Math.floor(Math.random() * allDoa.length)
    return allDoa[randomIndex] || null
  }

  // Filter by category (case-insensitive)
  const filteredDoa = allDoa.filter((item) =>
    item.category_names?.some(
      (cat) => cat.toLowerCase() === category.toLowerCase(),
    ),
  )

  if (filteredDoa.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * filteredDoa.length)
  return filteredDoa[randomIndex]
}

/**
 * Get random DOA items with optional category filter
 */
export async function getRandomDoaBatch(
  count: number,
  category?: string,
): Promise<DoaItem[]> {
  const allDoa = await loadDoaData()

  let pool = allDoa

  // Filter by category if specified
  if (category) {
    pool = allDoa.filter((item) =>
      item.category_names?.some(
        (cat) => cat.toLowerCase() === category.toLowerCase(),
      ),
    )
  }

  if (pool.length === 0) {
    return []
  }

  // Shuffle and pick random items
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, pool.length))
}

/**
 * Get DOA item by slug
 */
export async function getDoaBySlug(slug: string): Promise<DoaItem | null> {
  const allDoa = await loadDoaData()
  return allDoa.find((item) => item.slug === slug) || null
}

/**
 * Search DOA items by query (searches name and content)
 */
export async function searchDoa(query: string): Promise<DoaItem[]> {
  const allDoa = await loadDoaData()
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) {
    return []
  }

  return allDoa.filter((item) => {
    return (
      item.name_my?.toLowerCase().includes(lowerQuery) ||
      item.name_en?.toLowerCase().includes(lowerQuery) ||
      item.content?.includes(query) ||
      item.meaning_my?.toLowerCase().includes(lowerQuery) ||
      item.meaning_en?.toLowerCase().includes(lowerQuery)
    )
  })
}
