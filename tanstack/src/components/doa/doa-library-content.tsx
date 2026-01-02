import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  Search,
  Share,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/language-context'
import { useSession } from '@/lib/auth-client'
import { getAllDoas } from '@/routes/dashboard/functions/doa'
import { getSavedDoas, saveDoa, unsaveDoa } from '@/routes/dashboard/functions'
import type { Doa } from '@/types/doa.types'

// Dynamic meta component for SEO
function DynamicMetaTags() {
  const { t } = useLanguage()

  // Update document title and meta description based on language
  document.title = t('pageTitle')

  // Update or create meta description
  const existingMetaDescription = document.querySelector(
    'meta[name="description"]',
  )
  if (existingMetaDescription) {
    existingMetaDescription.setAttribute('content', t('pageDescription'))
  } else {
    const metaDescription = document.createElement('meta')
    metaDescription.name = 'description'
    metaDescription.content = t('pageDescription')
    document.head.appendChild(metaDescription)
  }

  return null // This component doesn't render anything
}

// Constants
const DOAS_PER_PAGE = 10

// Prayer Card Component
interface PrayerCardProps {
  doa: Doa
  language: 'en' | 'my'
  isSaved: boolean
  isAuthenticated: boolean
  isSaving: boolean
  onToggleSave: (slug: string) => void
}

function PrayerCard({
  doa,
  language,
  isSaved,
  isAuthenticated,
  isSaving,
  onToggleSave,
}: PrayerCardProps) {
  // Get localized content
  const getTitle = () => {
    if (language === 'my') {
      return doa.nameMy
        .replace(/^\[PAGI\]|\[PETANG\]|\[JEMA'AH\]\s*/i, '')
        .trim()
    }
    return doa.nameEn
      .replace(/^(MORNING|EVENING|JEMA'AH)\s*[-:]?\s*/i, '')
      .trim()
  }

  const getMeaning = () => {
    return language === 'my' ? doa.meaningMy : doa.meaningEn
  }

  const getReference = () => {
    return language === 'my' ? doa.referenceMy : doa.referenceEn
  }

  const getCategories = () => {
    // Return categories that match the current language
    const malayCategories = ['Bacaan Pagi', 'Bacaan Petang', 'Bacaan Harian']
    const englishCategories = ['Morning Supplication', 'Evening Supplication']

    return doa.categoryNames.filter((cat) => {
      if (language === 'my') {
        return (
          malayCategories.some((mc) => cat.includes(mc)) ||
          !englishCategories.some((ec) => cat.includes(ec))
        )
      } else {
        return (
          englishCategories.some((ec) => cat.includes(ec)) ||
          !malayCategories.some((mc) => cat.includes(mc))
        )
      }
    })
  }

  return (
    <Link to="/doa/$slug" params={{ slug: doa.slug }} className="p-2">
      <article className="bg-card rounded-3xl p-6 md:p-8 shadow-green-sm hover:shadow-green-lg border border-transparent hover:border-border transition-all duration-300 group cursor-pointer">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground font-sans tracking-tight">
              {getTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              title={language === 'my' ? 'Salin' : 'Copy'}
              onClick={(e) => {
                e.preventDefault()
                navigator.clipboard.writeText(doa.content)
                toast.success(
                  language === 'my'
                    ? 'Disalin ke papan klip'
                    : 'Copied to clipboard',
                )
              }}
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${
                isSaved
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'text-muted-foreground hover:text-red-500 hover:bg-secondary'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                !isAuthenticated
                  ? language === 'my'
                    ? 'Log masuk untuk simpan'
                    : 'Sign in to save'
                  : isSaved
                    ? language === 'my'
                      ? 'Buang dari simpanan'
                      : 'Remove from saved'
                    : language === 'my'
                      ? 'Simpan doa'
                      : 'Save prayer'
              }
              onClick={(e) => {
                e.preventDefault()
                onToggleSave(doa.slug)
              }}
              disabled={isSaving}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              title={language === 'my' ? 'Kongsi' : 'Share'}
              onClick={(e) => {
                e.preventDefault()
                const shareUrl = `${window.location.origin}/doa/${doa.slug}`
                const shareText =
                  language === 'my'
                    ? `${doa.nameMy} - ${doa.meaningMy?.slice(0, 100) || ''}...`
                    : `${doa.nameEn} - ${doa.meaningEn?.slice(0, 100) || ''}...`

                if (navigator.share) {
                  navigator.share({
                    title: language === 'my' ? doa.nameMy : doa.nameEn,
                    text: shareText,
                    url: shareUrl,
                  })
                } else {
                  navigator.clipboard.writeText(shareUrl)
                  toast.success(
                    language === 'my'
                      ? 'Pautan disalin ke papan klip'
                      : 'Link copied to clipboard',
                  )
                }
              }}
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-secondary/50 dark:bg-muted/50 rounded-2xl p-8 flex items-center justify-center min-h-[160px] border border-border">
            <p
              className="text-center font-arabic text-foreground text-2xl md:text-3xl leading-relaxed"
              dir="rtl"
              lang="ar"
            >
              {doa.content}
            </p>
          </div>

          <div className="px-2 md:px-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              {language === 'my' ? 'Maksud' : 'Meaning'}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              {getMeaning()}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium italic">{getReference()}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getCategories()
              .slice(0, 2)
              .map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                >
                  {cat}
                </span>
              ))}
          </div>
        </div>
      </article>
    </Link>
  )
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  t,
}: {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  t: (key: string) => string
}) {
  const pages = useMemo(() => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <Button
          variant="green-outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-full disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-1 bg-card dark:bg-card px-1 py-1 rounded-full border border-border shadow-sm">
          {pages.map((page, idx) =>
            page === '...' ? (
              <span
                key={idx}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground text-xs"
              >
                ...
              </span>
            ) : (
              <Button
                key={idx}
                variant={page === currentPage ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onPageChange(page as number)}
                className={`w-9 h-9 rounded-full ${
                  page === currentPage
                    ? 'bg-gradient-primary shadow-green text-white hover:shadow-green-lg'
                    : 'hover:bg-secondary hover:text-primary'
                }`}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="green-outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-full disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">
        {t('showingPrayers')
          .replace('{from}', String((currentPage - 1) * DOAS_PER_PAGE + 1))
          .replace(
            '{to}',
            String(Math.min(currentPage * DOAS_PER_PAGE, totalItems)),
          )
          .replace('{total}', String(totalItems))}
      </p>
    </div>
  )
}

// Filter component
function FilterBar({
  searchQuery,
  onSearchChange,
  t,
}: {
  searchQuery: string
  onSearchChange: (query: string) => void
  t: (key: string) => string
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-green border border-border mb-10 sticky top-24 z-30 transition-all duration-300">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-none text-sm text-foreground placeholder-muted-foreground focus:ring-0"
        />
      </div>
    </div>
  )
}

// Main content component
export function DoaLibraryContent() {
  const { language, t } = useLanguage()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [allDoas, setAllDoas] = useState<Doa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set())
  const [savingSlug, setSavingSlug] = useState<string | null>(null)

  const user = session?.user
  const isAuthenticated = !!user

  // Fetch all duas and saved doas on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch duas
        const result = await getAllDoas({ data: { limit: 100 } })
        setAllDoas(result.data)
      } catch (error) {
        console.error('Failed to fetch duas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch saved doas when user becomes authenticated
  useEffect(() => {
    if (!user) {
      setSavedSlugs(new Set())
      return
    }

    const fetchSavedDoas = async () => {
      try {
        const saved = await getSavedDoas({ data: { userId: user.id } })
        setSavedSlugs(new Set(saved.map((s) => s.doaSlug)))
      } catch (error) {
        console.error('Failed to fetch saved doas:', error)
      }
    }

    fetchSavedDoas()
  }, [user])

  // Handle toggle save with optimistic updates
  const handleToggleSave = useCallback(
    async (slug: string) => {
      if (!user) {
        toast.error(
          language === 'my'
            ? 'Sila log masuk untuk simpan doa'
            : 'Please sign in to save prayers',
        )
        return
      }

      // Prevent double-clicks
      if (savingSlug) return
      setSavingSlug(slug)

      const wasSaved = savedSlugs.has(slug)

      // Optimistic update
      setSavedSlugs((prev) => {
        const next = new Set(prev)
        if (wasSaved) {
          next.delete(slug)
        } else {
          next.add(slug)
        }
        return next
      })

      try {
        if (wasSaved) {
          await unsaveDoa({ data: { userId: user.id, doaSlug: slug } })
          toast.success(
            language === 'my'
              ? 'Doa dibuang dari simpanan'
              : 'Prayer removed from saved',
          )
        } else {
          await saveDoa({ data: { userId: user.id, doaSlug: slug } })
          toast.success(language === 'my' ? 'Doa disimpan!' : 'Prayer saved!')
        }
      } catch (error) {
        // Rollback on error
        setSavedSlugs((prev) => {
          const next = new Set(prev)
          if (wasSaved) {
            next.add(slug)
          } else {
            next.delete(slug)
          }
          return next
        })
        console.error('Failed to toggle save:', error)
        toast.error(
          language === 'my'
            ? 'Gagal menyimpan. Sila cuba lagi.'
            : 'Failed to save. Please try again.',
        )
      } finally {
        setSavingSlug(null)
      }
    },
    [user, savedSlugs, savingSlug, language],
  )

  // Filter and search logic (client-side for instant feedback)
  const filteredDoas = useMemo(() => {
    let filtered = allDoas

    // Language-aware search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((doa) => {
        // Always search in Arabic content (language-independent)
        const contentMatch = doa.content.toLowerCase().includes(query)

        // Search in language-specific fields
        if (language === 'my') {
          return (
            contentMatch ||
            doa.nameMy.toLowerCase().includes(query) ||
            (doa.meaningMy || '').toLowerCase().includes(query) ||
            (doa.referenceMy || '').toLowerCase().includes(query) ||
            doa.categoryNames.some((cat) => cat.toLowerCase().includes(query))
          )
        } else {
          return (
            contentMatch ||
            doa.nameEn.toLowerCase().includes(query) ||
            (doa.meaningEn || '').toLowerCase().includes(query) ||
            (doa.referenceEn || '').toLowerCase().includes(query) ||
            doa.categoryNames.some((cat) => cat.toLowerCase().includes(query))
          )
        }
      })
    }

    return filtered
  }, [searchQuery, language, allDoas])

  // Pagination
  const totalPages = Math.ceil(filteredDoas.length / DOAS_PER_PAGE)
  const currentDoas = useMemo(() => {
    const startIndex = (currentPage - 1) * DOAS_PER_PAGE
    return filteredDoas.slice(startIndex, startIndex + DOAS_PER_PAGE)
  }, [currentPage, filteredDoas])

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of results
    window.scrollTo({ top: 200, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span className="text-muted-foreground">
            {language === 'my' ? 'Memuatkan doa...' : 'Loading prayers...'}
          </span>
        </div>
      </main>
    )
  }

  return (
    <>
      <DynamicMetaTags />
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          t={t}
        />

        <div className="space-y-16">
          {currentDoas.map((doa) => (
            <PrayerCard
              key={doa.slug}
              doa={doa}
              language={language}
              isSaved={savedSlugs.has(doa.slug)}
              isAuthenticated={isAuthenticated}
              isSaving={savingSlug === doa.slug}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>

        {filteredDoas.length > DOAS_PER_PAGE && (
          <div className="mt-16">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDoas.length}
              onPageChange={handlePageChange}
              t={t}
            />
          </div>
        )}

        {filteredDoas.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('noPrayersFound')}
            </h3>
            <p className="text-muted-foreground">{t('tryAdjustingSearch')}</p>
          </div>
        )}
      </main>
    </>
  )
}
