/**
 * Smart text truncation with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Simple search function for filtering prayers
 */
export function searchPrayers(prayers: Array<any>, query: string): Array<any> {
  if (!query.trim()) return prayers

  const searchTerm = query.toLowerCase()

  return prayers.filter((prayer) => {
    return (
      prayer.name_en?.toLowerCase().includes(searchTerm) ||
      prayer.name_my?.toLowerCase().includes(searchTerm) ||
      prayer.content?.toLowerCase().includes(searchTerm) ||
      prayer.meaning_en?.toLowerCase().includes(searchTerm) ||
      prayer.meaning_my?.toLowerCase().includes(searchTerm) ||
      prayer.reference_en?.toLowerCase().includes(searchTerm) ||
      prayer.reference_my?.toLowerCase().includes(searchTerm)
    )
  })
}

/**
 * Filter prayers by category
 */
export function filterByCategory(
  prayers: Array<any>,
  category: string,
): Array<any> {
  if (!category || category === 'All Categories') return prayers

  return prayers.filter((prayer) => prayer.category_names?.includes(category))
}

/**
 * Check if prayer is already selected
 */
export function isPrayerSelected(
  prayers: Array<any>,
  prayerSlug: string,
): boolean {
  return prayers.some((p) => p.slug === prayerSlug)
}

/**
 * Validate the doa list
 */
export function validateDoaList(list: {
  title?: string
  prayers?: Array<any>
}): {
  isValid: boolean
  errors: Array<string>
} {
  const errors: Array<string> = []

  if (!list.title || list.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (list.title && list.title.length > 100) {
    errors.push('Title must be under 100 characters')
  }

  if (!list.prayers || list.prayers.length === 0) {
    errors.push('Please select at least one prayer')
  }

  if (list.prayers && list.prayers.length > 15) {
    errors.push('Maximum 15 prayers allowed')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
