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
  hadith_matches?: DoaJsonHadithMatchEntry[]
}

export interface DoaJsonHadithMatchEntry {
  matched_reference: string | null
  hadith_book: string | null
  hadith_chapter_number: number | null
  hadith_chapter_title_arabic: string | null
  hadith_chapter_title_english: string | null
  hadith_arabic_text: string | null
  hadith_english_text: string | null
  hadith_grade: string | null
  hadith_reference_url: string | null
  hadith_inbook_reference: string | null
}

/**
 * Compute SHA-256 hash of all doa content fields.
 * Used for quick change detection during seeding.
 */
export function computeDoaHash(entry: DoaJsonEntry): string {
  const hadithMatches =
    entry.hadith_matches && entry.hadith_matches.length > 0
      ? entry.hadith_matches.map((match) => ({
          matched_reference: match.matched_reference || '',
          hadith_book: match.hadith_book || '',
          hadith_chapter_number: match.hadith_chapter_number ?? null,
          hadith_chapter_title_arabic: match.hadith_chapter_title_arabic || '',
          hadith_chapter_title_english:
            match.hadith_chapter_title_english || '',
          hadith_arabic_text: match.hadith_arabic_text || '',
          hadith_english_text: match.hadith_english_text || '',
          hadith_grade: match.hadith_grade || '',
          hadith_reference_url: match.hadith_reference_url || '',
          hadith_inbook_reference: match.hadith_inbook_reference || '',
        }))
      : undefined

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
    hadith_matches: hadithMatches,
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

/**
 * Convert hadith matches from JSON to database record format.
 */
export function toDoaHadithMatchRecords(
  entry: DoaJsonEntry,
): Array<{
  doaSlug: string
  sortOrder: number
  matchedReference: string | null
  book: string | null
  chapterNumber: number | null
  chapterTitleArabic: string | null
  chapterTitleEnglish: string | null
  arabicText: string | null
  englishText: string | null
  grade: string | null
  referenceUrl: string | null
  inBookReference: string | null
}> {
  return (entry.hadith_matches ?? []).map((match, index) => ({
    doaSlug: entry.slug,
    sortOrder: index,
    matchedReference: match.matched_reference || null,
    book: match.hadith_book || null,
    chapterNumber: match.hadith_chapter_number ?? null,
    chapterTitleArabic: match.hadith_chapter_title_arabic || null,
    chapterTitleEnglish: match.hadith_chapter_title_english || null,
    arabicText: match.hadith_arabic_text || null,
    englishText: match.hadith_english_text || null,
    grade: match.hadith_grade || null,
    referenceUrl: match.hadith_reference_url || null,
    inBookReference: match.hadith_inbook_reference || null,
  }))
}
