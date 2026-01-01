import { createFileRoute, notFound } from '@tanstack/react-router'
import { getDoaBySlug } from './dashboard/functions/doa'
import { DoaDetailContent } from '@/components/doa/doa-detail-content'

export const Route = createFileRoute('/doa/$slug')({
  component: DoaDetailPage,
  loader: async ({ params }) => {
    const doa = await getDoaBySlug({ data: { slug: params.slug } })

    if (!doa) {
      throw notFound()
    }

    return { doa }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.doa) {
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

    const { doa } = loaderData
    const title = `${doa.nameEn} - GetDoa`
    const description = `${(doa.meaningEn || '').slice(0, 160)}...`

    return {
      title,
      meta: [
        { name: 'description', content: description },
        {
          name: 'keywords',
          content: `${doa.categoryNames.join(', ')}, prayer, doa, islamic supplication`,
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
