import { createHash } from 'crypto'

export interface DoaJsonEntry {
  slug: string
  name_my: string
  name_en: string
  content: string
  reference_my: string
  reference_en: string
  meaning_my: string
  meaning_en: string
  category_names: string[]
  description_my: string
  description_en: string
  context_my: string
  context_en: string
}

/**
 * Compute SHA-256 hash of all doa content fields.
 * Used for quick change detection during seeding.
 */
export function computeDoaHash(entry: DoaJsonEntry): string {
  const contentString = JSON.stringify({
    // Order matters for consistent hashing
    name_my: entry.name_my || '',
    name_en: entry.name_en || '',
    content: entry.content || '',
    reference_my: entry.reference_my || '',
    reference_en: entry.reference_en || '',
    meaning_my: entry.meaning_my || '',
    meaning_en: entry.meaning_en || '',
    category_names: entry.category_names || [],
    description_my: entry.description_my || '',
    description_en: entry.description_en || '',
    context_my: entry.context_my || '',
    context_en: entry.context_en || '',
  })

  return createHash('sha256').update(contentString).digest('hex')
}

/**
 * Convert JSON entry to database record format.
 */
export function toDoaRecord(entry: DoaJsonEntry & { contentHash: string }) {
  return {
    slug: entry.slug,
    nameMy: entry.name_my,
    nameEn: entry.name_en,
    content: entry.content,
    referenceMy: entry.reference_my || null,
    referenceEn: entry.reference_en || null,
    meaningMy: entry.meaning_my || null,
    meaningEn: entry.meaning_en || null,
    categoryNames: entry.category_names || [],
    descriptionMy: entry.description_my || null,
    descriptionEn: entry.description_en || null,
    contextMy: entry.context_my || null,
    contextEn: entry.context_en || null,
    contentHash: entry.contentHash,
  }
}
