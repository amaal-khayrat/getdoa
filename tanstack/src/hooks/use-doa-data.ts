import { useMemo } from 'react'
import doaDataRaw from '../../data/doa.json?raw'
import type { DoaItem } from '@/types/doa.types'

// Import and type the raw doa data
type RawDoaItem = {
  slug: string
  name_my: string
  name_en: string
  content: string
  meaning_my: string
  meaning_en: string
  reference_my: string
  reference_en: string
  category_names: Array<string>
  description_my?: string
  description_en?: string
  context_my?: string
  context_en?: string
}

// Process the raw data to ensure it matches our types
function processDoaData(raw: Array<RawDoaItem>): Array<DoaItem> {
  return raw.map((item) => ({
    ...item,
    // Ensure all required fields are present and properly typed
    slug: item.slug || '',
    name_my: item.name_my || '',
    name_en: item.name_en || '',
    content: item.content || '',
    meaning_my: item.meaning_my || '',
    meaning_en: item.meaning_en || '',
    reference_my: item.reference_my || '',
    reference_en: item.reference_en || '',
    category_names: Array.isArray(item.category_names)
      ? item.category_names
      : [],
    description_my: item.description_my,
    description_en: item.description_en,
    context_my: item.context_my,
    context_en: item.context_en,
  }))
}

export function useDoaData() {
  const processedData = useMemo(() => {
    const parsed = JSON.parse(doaDataRaw)
    const processed = processDoaData(parsed as Array<RawDoaItem>)
    return processed
  }, [])

  const categories = useMemo(() => {
    const allCategories = processedData.flatMap((doa) => doa.category_names)
    const uniqueCategories = Array.from(new Set(allCategories))
    return uniqueCategories.sort()
  }, [processedData])

  return {
    prayers: processedData,
    categories,
    totalPrayers: processedData.length,
  }
}
