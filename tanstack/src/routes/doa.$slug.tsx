import { createFileRoute, notFound } from '@tanstack/react-router'
import { DoaDetailContent } from '@/components/doa/doa-detail-content'
import doaDataRaw from '../../data/doa.json'

// Type definitions
interface DoaItem {
  name_my: string
  name_en: string
  content: string
  reference_my: string
  reference_en: string
  meaning_my: string
  meaning_en: string
  category_names: Array<string>
  slug: string
  description_my: string
  description_en: string
  context_my: string
  context_en: string
}

// Type guard for doa data
const isDoaItem = (item: any): item is DoaItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.name_my === 'string' &&
    typeof item.name_en === 'string' &&
    typeof item.content === 'string' &&
    typeof item.reference_my === 'string' &&
    typeof item.reference_en === 'string' &&
    typeof item.meaning_my === 'string' &&
    typeof item.meaning_en === 'string' &&
    Array.isArray(item.category_names) &&
    typeof item.slug === 'string'
  )
}

export const Route = createFileRoute('/doa/$slug')({
  component: DoaDetailPage,
  loader: ({ params }) => {
    // Filter and validate DOA data
    const doaDataTyped = doaDataRaw.filter(isDoaItem)
    const doa = doaDataTyped.find((item) => item.slug === params.slug)

    if (!doa) {
      throw notFound()
    }

    return { doa }
  },
  head: ({ params }) => {
    // Filter and validate DOA data for meta generation
    const doaDataTyped = doaDataRaw.filter(isDoaItem)
    const doa = doaDataTyped.find((item) => item.slug === params.slug)

    if (!doa) {
      return {
        title: 'Prayer Not Found - GetDoa',
        meta: [
          {
            name: 'description',
            content: 'The requested prayer could not be found.',
          },
        ],
      }
    }

    const title = `${doa.name_en} - GetDoa`
    const description = `${doa.meaning_en.slice(0, 160)}...`

    return {
      title,
      meta: [
        { name: 'description', content: description },
        {
          name: 'keywords',
          content: `${doa.category_names.join(', ')}, prayer, doa, islamic supplication`,
        },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: `https://getdoa.com/doa/${doa.slug}` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'GetDoa' },
        { name: 'language', content: 'en' },
        { rel: 'canonical', href: `https://getdoa.com/doa/${doa.slug}` },
      ],
    }
  },
})

function DoaDetailPage() {
  return <DoaDetailContent />
}
