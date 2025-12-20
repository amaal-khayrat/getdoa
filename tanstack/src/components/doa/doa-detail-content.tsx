import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { BookOpen, Copy, Heart, Share2 } from 'lucide-react'
import doaDataRaw from '../../../data/doa.json'
import { DoaNotFound } from './doa-not-found'
import { MosqueDonationCard } from './mosque-donation-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/language-context'
import { SedekahJeApiError, getRandomMosque } from '@/lib/sedekah-je-api'

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

// Structured data for SEO
function StructuredData({
  doa,
  language,
}: {
  doa: DoaItem
  language: 'en' | 'my'
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: language === 'my' ? doa.name_my : doa.name_en,
    description:
      language === 'my'
        ? doa.description_my || doa.meaning_my
        : doa.description_en || doa.meaning_en,
    author: {
      '@type': 'Organization',
      name: 'GetDoa',
    },
    datePublished: '2024-01-01',
    dateModified: '2024-12-18',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://getdoa.com/doa/${doa.slug}`,
    },
    articleSection: doa.category_names.join(', '),
    keywords: doa.category_names.join(', '),
    inLanguage: language,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}

// Breadcrumb navigation
function BreadcrumbNav({ doa }: { doa: DoaItem }) {
  const { t, language } = useLanguage()

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground transition-colors">
        {language === 'my' ? 'Utama' : 'Home'}
      </Link>
      <span>/</span>
      <Link to="/doa" className="hover:text-foreground transition-colors">
        {language === 'my' ? 'Perpustakaan Doa' : 'Doa Library'}
      </Link>
      <span>/</span>
      <span className="text-foreground truncate max-w-[200px]">
        {language === 'my' ? doa.name_my : doa.name_en}
      </span>
    </nav>
  )
}

// Prayer display component
function PrayerDisplay({ content, title }: { content: string; title: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
  }

  return (
    <Card className="p-6 sm:p-8 bg-gradient-bg-section border-border">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="shrink-0 ml-2"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-right">
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-2xl sm:text-3xl leading-relaxed text-primary dark:text-primary-foreground"
        >
          {content}
        </p>
      </div>
    </Card>
  )
}

// Reference card component
function ReferenceCard({
  doa,
  language,
}: {
  doa: DoaItem
  language: 'en' | 'my'
}) {
  return (
    <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-2 mb-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          {language === 'my' ? 'Rujukan' : 'Reference'}
        </h3>
      </div>
      <p className="text-muted-foreground">
        {language === 'my' ? doa.reference_my : doa.reference_en}
      </p>
    </Card>
  )
}

// Meaning section component
function MeaningSection({
  doa,
  language,
}: {
  doa: DoaItem
  language: 'en' | 'my'
}) {
  const meaning = language === 'my' ? doa.meaning_my : doa.meaning_en
  const title = language === 'my' ? 'Maksud' : 'Meaning'

  return (
    <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{meaning}</p>
    </Card>
  )
}

// Context section component
function ContextSection({
  doa,
  language,
}: {
  doa: DoaItem
  language: 'en' | 'my'
}) {
  const context = language === 'my' ? doa.context_my : doa.context_en
  const description =
    language === 'my' ? doa.description_my : doa.description_en
  const title =
    language === 'my' ? 'Konteks & Penjelasan' : 'Context & Explanation'

  // Only show if there's actual content
  if (!context && !description) return null

  return (
    <Card className="p-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      {description && (
        <p className="text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
      )}
      {context && (
        <p className="text-muted-foreground leading-relaxed">{context}</p>
      )}
    </Card>
  )
}

// Action buttons component
function ActionButtons({ doa }: { doa: DoaItem }) {
  const { language } = useLanguage()
  const [isFavorited, setIsFavorited] = useState(false)

  const shareText =
    language === 'my'
      ? `${doa.name_my} - ${doa.meaning_my.slice(0, 100)}...`
      : `${doa.name_en} - ${doa.meaning_en.slice(0, 100)}...`

  // Fix SSR issue by using useEffect to get window.location.href
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'my' ? doa.name_my : doa.name_en,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    }
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
    // Here you could implement actual favorite storage logic
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Button
        variant={isFavorited ? 'default' : 'outline'}
        onClick={toggleFavorite}
        className="flex items-center space-x-2"
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        <span>{language === 'my' ? 'Favorit' : 'Favorite'}</span>
      </Button>
      <Button
        variant="outline"
        onClick={handleShare}
        className="flex items-center space-x-2"
      >
        <Share2 className="h-4 w-4" />
        <span>{language === 'my' ? 'Kongsi' : 'Share'}</span>
      </Button>
    </div>
  )
}

// Related prayers component
function RelatedPrayers({
  currentDoa,
  language,
}: {
  currentDoa: DoaItem
  language: 'en' | 'my'
}) {
  const doaDataTyped = useMemo(() => doaDataRaw.filter(isDoaItem), [])

  const relatedPrayers = useMemo(() => {
    return doaDataTyped
      .filter(
        (item) =>
          item.slug !== currentDoa.slug && // Exclude current prayer
          item.category_names.some(
            (
              cat, // Find prayers with same categories
            ) => currentDoa.category_names.includes(cat),
          ),
      )
      .slice(0, 3) // Limit to 3 related prayers
  }, [currentDoa, doaDataTyped])

  if (relatedPrayers.length === 0) return null

  const title = language === 'my' ? 'Doa Berkaitan' : 'Related Prayers'

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold text-foreground mb-6">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {relatedPrayers.map((prayer) => (
          <Card
            key={prayer.slug}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <Link
              to="/doa/$slug"
              params={{ slug: prayer.slug }}
              className="block group"
            >
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors mb-2">
                {language === 'my' ? prayer.name_my : prayer.name_en}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {language === 'my' ? prayer.meaning_my : prayer.meaning_en}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {prayer.category_names.slice(0, 2).map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DoaDetailContent() {
  const { slug } = useParams({ from: '/doa/$slug' })
  const { language } = useLanguage()

  const doa = useMemo(() => {
    const doaDataTyped = doaDataRaw.filter(isDoaItem)
    return doaDataTyped.find((item) => item.slug === slug)
  }, [slug])

  // Mosque donation state management
  const [mosqueData, setMosqueData] = useState<Awaited<
    ReturnType<typeof getRandomMosque>
  > | null>(null)
  const [mosqueError, setMosqueError] = useState<string | null>(null)
  const [isMosqueLoading, setIsMosqueLoading] = useState(false)

  // Fetch mosque data when component mounts
  useEffect(() => {
    const fetchMosqueData = async () => {
      setIsMosqueLoading(true)
      setMosqueError(null)

      try {
        const data = await getRandomMosque()
        setMosqueData(data)
      } catch (error) {
        console.error('Failed to fetch mosque donation data:', error)
        if (error instanceof SedekahJeApiError) {
          setMosqueError(error.message)
        } else {
          setMosqueError('Unable to load donation options at this time')
        }
      } finally {
        setIsMosqueLoading(false)
      }
    }

    fetchMosqueData()
  }, [])

  if (!doa) {
    return <DoaNotFound searchedSlug={slug} />
  }

  const title = language === 'my' ? doa.name_my : doa.name_en
  const prayerTitle = language === 'my' ? 'Doa' : 'Prayer'

  return (
    <>
      <StructuredData doa={doa} language={language} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BreadcrumbNav doa={doa} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-display">
            {title}
          </h1>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {doa.category_names.map((category, index) => (
              <Badge
                key={index}
                variant="default"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons doa={doa} />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Prayer Text */}
          <PrayerDisplay content={doa.content} title={prayerTitle} />

          {/* Meaning */}
          <MeaningSection doa={doa} language={language} />

          {/* Context & Description */}
          <ContextSection doa={doa} language={language} />

          {/* Reference */}
          <ReferenceCard doa={doa} language={language} />
        </div>

        {/* Mosque Donations */}
        {(isMosqueLoading || mosqueData || mosqueError) && (
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-semibold text-foreground">Sedekah</h3>
            </div>

            {isMosqueLoading && (
              <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
                  <span className="text-muted-foreground">
                    {language === 'my'
                      ? 'Memuatkan pilihan derma...'
                      : 'Loading donation options...'}
                  </span>
                </div>
              </Card>
            )}

            {mosqueError && (
              <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <div className="text-center">
                  <p className="text-red-600 dark:text-red-400 mb-2">
                    {language === 'my'
                      ? 'Pilihan derma tidak tersedia sekarang'
                      : 'Donation options unavailable'}
                  </p>
                  <p className="text-sm text-red-500 dark:text-red-500">
                    {mosqueError}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    {language === 'my' ? 'Cuba lagi' : 'Try again'}
                  </button>
                </div>
              </Card>
            )}

            {mosqueData && !isMosqueLoading && (
              <MosqueDonationCard
                name={mosqueData.name}
                qrContent={mosqueData.qrContent}
                supportedPayment={mosqueData.supportedPayment}
              />
            )}
          </div>
        )}

        {/* Related Prayers */}
        <RelatedPrayers currentDoa={doa} language={language} />
      </div>
    </>
  )
}
