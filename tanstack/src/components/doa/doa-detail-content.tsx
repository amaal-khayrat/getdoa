import { useEffect, useState } from 'react'
import { Link, getRouteApi } from '@tanstack/react-router'
import {
  BookOpen,
  Copy,
  ExternalLink,
  Heart,
  Library,
  Quote,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import { MosqueDonationCard } from './mosque-donation-card'
import type { Doa, DoaHadithMatch, SearchableDoa } from '@/types/doa.types'
import { ShopeeReferralsClientSection } from '@/components/shopee/shopee-referrals-client-section'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useLanguage } from '@/contexts/language-context'
import { SedekahJeApiError, getRandomMosque } from '@/lib/sedekah-je-api'

// Get the route API for typed access to loader data
const routeApi = getRouteApi('/doa/$slug')

// Structured data for SEO
function StructuredData({
  doa,
  language,
}: {
  doa: Doa
  language: 'en' | 'my'
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: language === 'my' ? doa.nameMy : doa.nameEn,
    description:
      language === 'my'
        ? doa.descriptionMy || doa.meaningMy
        : doa.descriptionEn || doa.meaningEn,
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
    articleSection: doa.categoryNames.join(', '),
    keywords: doa.categoryNames.join(', '),
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
function BreadcrumbNav({ doa }: { doa: Doa }) {
  const { language } = useLanguage()

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
        {language === 'my' ? doa.nameMy : doa.nameEn}
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
          className="font-arabic text-2xl sm:text-3xl leading-relaxed text-foreground dark:text-primary-foreground"
        >
          {content}
        </p>
      </div>
    </Card>
  )
}

// Reference card component
function ReferenceCard({ doa, language }: { doa: Doa; language: 'en' | 'my' }) {
  return (
    <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-2 mb-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          {language === 'my' ? 'Rujukan' : 'Reference'}
        </h3>
      </div>
      <p className="text-muted-foreground">
        {language === 'my' ? doa.referenceMy : doa.referenceEn}
      </p>
    </Card>
  )
}

// Meaning section component
function MeaningSection({
  doa,
  language,
}: {
  doa: Doa
  language: 'en' | 'my'
}) {
  const meaning = language === 'my' ? doa.meaningMy : doa.meaningEn
  const title = language === 'my' ? 'Maksud' : 'Meaning'

  return (
    <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <p className="font-reading text-muted-foreground leading-relaxed">{meaning}</p>
    </Card>
  )
}

// Context section component
function ContextSection({
  doa,
  language,
}: {
  doa: Doa
  language: 'en' | 'my'
}) {
  const context = language === 'my' ? doa.contextMy : doa.contextEn
  const description = language === 'my' ? doa.descriptionMy : doa.descriptionEn
  const title =
    language === 'my' ? 'Konteks & Penjelasan' : 'Context & Explanation'

  // Only show if there's actual content
  if (!context && !description) return null

  return (
    <Card className="p-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      {description && (
        <p className="font-reading text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
      )}
      {context && (
        <p className="font-reading text-muted-foreground leading-relaxed">{context}</p>
      )}
    </Card>
  )
}

function formatHadithChapterNumber(
  chapterNumber: number | null,
): string | null {
  if (chapterNumber === null || Number.isNaN(chapterNumber)) {
    return null
  }

  return Number.isInteger(chapterNumber)
    ? chapterNumber.toString()
    : chapterNumber.toString()
}

function buildHadithAccordionValue(
  match: DoaHadithMatch,
  index: number,
): string {
  return [
    match.referenceUrl,
    match.matchedReference,
    match.book,
    match.inBookReference,
    String(index),
  ]
    .filter(Boolean)
    .join('::')
}

function HadithMetaItem({
  label,
  value,
  dir,
}: {
  label: string
  value: string | null
  dir?: 'rtl'
}) {
  if (!value) {
    return null
  }

  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-4">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p
        dir={dir}
        className="mt-2 break-words text-sm leading-relaxed text-foreground whitespace-pre-line"
      >
        {value}
      </p>
    </div>
  )
}

function HadithMatchesSection({
  matches,
  language,
}: {
  matches: Array<DoaHadithMatch>
  language: 'en' | 'my'
}) {
  if (matches.length === 0) {
    return null
  }

  const copy =
    language === 'my'
      ? {
          eyebrow: 'Sumber Hadis',
          title: 'Hadis Berkaitan',
          description:
            'Padanan hadis yang ditemui untuk doa ini, lengkap dengan teks sumber dan pautan rujukan apabila tersedia.',
          singleResult: 'padanan',
          multipleResults: 'padanan',
          fallbackTitle: 'Hadis',
          summaryFallback: 'Tekan untuk melihat butiran hadis penuh.',
          sourceButton: 'Buka sumber',
          matchedReferenceLabel: 'Rujukan padanan',
          chapterNumberLabel: 'Bab',
          chapterTitleEnglishLabel: 'Tajuk bab (Inggeris)',
          chapterTitleArabicLabel: 'Tajuk bab (Arab)',
          inBookReferenceLabel: 'Rujukan dalam kitab',
          sourceUrlLabel: 'URL sumber',
          arabicTextLabel: 'Teks hadis Arab',
          englishTextLabel: 'Teks hadis Inggeris',
          grade: 'Darjat',
        }
      : {
          eyebrow: 'Hadith Source',
          title: 'Supporting Hadith',
          description:
            'Matched hadith entries for this doa, with source text and reference links when available.',
          singleResult: 'match',
          multipleResults: 'matches',
          fallbackTitle: 'Hadith',
          summaryFallback: 'Open this item to see the full hadith details.',
          sourceButton: 'Open source',
          matchedReferenceLabel: 'Matched reference',
          chapterNumberLabel: 'Chapter',
          chapterTitleEnglishLabel: 'Chapter title (English)',
          chapterTitleArabicLabel: 'Chapter title (Arabic)',
          inBookReferenceLabel: 'In-book reference',
          sourceUrlLabel: 'Source URL',
          arabicTextLabel: 'Arabic hadith text',
          englishTextLabel: 'English source text',
          grade: 'Grade',
        }

  const defaultValue =
    matches.length === 1 ? [buildHadithAccordionValue(matches[0], 0)] : []

  return (
    <Card className="overflow-hidden rounded-2xl border-border py-0 shadow-green-sm">
      <div className="border-b border-border bg-gradient-bg-section px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>{copy.eyebrow}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">
              {copy.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy.description}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="h-auto rounded-full px-3 py-1.5 text-sm font-semibold"
          >
            {matches.length}{' '}
            {matches.length === 1 ? copy.singleResult : copy.multipleResults}
          </Badge>
        </div>
      </div>

      <Accordion multiple defaultValue={defaultValue} className="w-full">
        {matches.map((match, index) => {
          const itemValue = buildHadithAccordionValue(match, index)
          const chapterNumber = formatHadithChapterNumber(match.chapterNumber)
          const heading =
            match.matchedReference ?? `${copy.fallbackTitle} ${index + 1}`
          const subheading =
            match.chapterTitleEnglish ??
            match.chapterTitleArabic ??
            match.inBookReference ??
            copy.summaryFallback

          return (
            <AccordionItem
              key={itemValue}
              value={itemValue}
              className="border-border/70 last:border-b-0"
            >
              <AccordionTrigger className="px-5 py-5 hover:no-underline sm:px-6">
                <div className="flex min-w-0 flex-1 flex-col gap-3 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {match.book && (
                      <Badge
                        variant="secondary"
                        className="h-auto rounded-full px-3 py-1.5 text-xs font-semibold"
                      >
                        <Library className="mr-1 h-3 w-3" />
                        {match.book}
                      </Badge>
                    )}
                    {match.inBookReference && (
                      <Badge
                        variant="outline"
                        className="h-auto rounded-full px-3 py-1.5 text-xs"
                      >
                        {match.inBookReference}
                      </Badge>
                    )}
                    {match.grade && (
                      <Badge
                        variant="outline"
                        className="h-auto rounded-full border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                      >
                        {copy.grade}: {match.grade}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-left">
                    <p className="break-words text-sm font-semibold text-foreground sm:text-base">
                      {heading}
                    </p>
                    <p className="break-words text-sm text-muted-foreground">
                      {subheading}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-6 sm:px-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <HadithMetaItem
                    label={copy.matchedReferenceLabel}
                    value={match.matchedReference}
                  />
                  <HadithMetaItem
                    label={copy.chapterNumberLabel}
                    value={chapterNumber}
                  />
                  <HadithMetaItem
                    label={copy.chapterTitleEnglishLabel}
                    value={match.chapterTitleEnglish}
                  />
                  <HadithMetaItem
                    label={copy.chapterTitleArabicLabel}
                    value={match.chapterTitleArabic}
                    dir="rtl"
                  />
                  <HadithMetaItem
                    label={copy.inBookReferenceLabel}
                    value={match.inBookReference}
                  />
                </div>

                {match.arabicText && (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-gradient-bg-section p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      <Quote className="h-3.5 w-3.5" />
                      <span>{copy.arabicTextLabel}</span>
                    </div>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="mt-4 font-arabic text-xl leading-loose text-foreground whitespace-pre-line sm:text-2xl"
                    >
                      {match.arabicText}
                    </p>
                  </div>
                )}

                {match.englishText && (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/40 p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-muted-foreground">
                      <Quote className="h-3.5 w-3.5" />
                      <span>{copy.englishTextLabel}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {match.englishText}
                    </p>
                  </div>
                )}

                {match.referenceUrl && (
                  <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {copy.sourceUrlLabel}
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="break-all text-sm text-muted-foreground">
                        {match.referenceUrl}
                      </p>
                      <a
                        href={match.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({
                          variant: 'outline',
                          size: 'sm',
                          className: 'w-full sm:w-auto',
                        })}
                      >
                        {copy.sourceButton}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </Card>
  )
}

// Action buttons component
function ActionButtons({ doa }: { doa: Doa }) {
  const { language } = useLanguage()
  const [isFavorited, setIsFavorited] = useState(false)

  const shareText =
    language === 'my'
      ? `${doa.nameMy} - ${(doa.meaningMy || '').slice(0, 100)}...`
      : `${doa.nameEn} - ${(doa.meaningEn || '').slice(0, 100)}...`

  const handleShare = async () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://getdoa.com/doa/${doa.slug}`

    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: language === 'my' ? doa.nameMy : doa.nameEn,
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
  relatedPrayers,
  language,
}: {
  relatedPrayers: Array<SearchableDoa>
  language: 'en' | 'my'
}) {
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
                {language === 'my' ? prayer.nameMy : prayer.nameEn}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {language === 'my' ? prayer.meaningMy : prayer.meaningEn}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {prayer.categoryNames.slice(0, 2).map((category, index) => (
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
  const { doa, relatedPrayers } = routeApi.useLoaderData()
  const { language } = useLanguage()

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

  const title = language === 'my' ? doa.nameMy : doa.nameEn
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
            {doa.categoryNames.map((category: string, index: number) => (
              <Badge key={index} variant="default">
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

          {/* Supporting Hadith */}
          <HadithMatchesSection
            matches={doa.hadithMatches}
            language={language}
          />

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
              <>
                <MosqueDonationCard
                  name={mosqueData.name}
                  qrContent={mosqueData.qrContent}
                  supportedPayment={mosqueData.supportedPayment}
                />
                <ShopeeReferralsClientSection />
              </>
            )}
          </div>
        )}

        {/* Related Prayers */}
        <RelatedPrayers relatedPrayers={relatedPrayers} language={language} />
      </div>
    </>
  )
}
