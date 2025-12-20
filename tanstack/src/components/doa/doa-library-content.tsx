import { useMemo, useState } from 'react'
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
import doaDataRaw from '../../../data/doa.json'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/language-context'

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
    existingMetaDescription.content = t('pageDescription')
  } else {
    const metaDescription = document.createElement('meta')
    metaDescription.name = 'description'
    metaDescription.content = t('pageDescription')
    document.head.appendChild(metaDescription)
  }

  return null // This component doesn't render anything
}

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
    Array.isArray(item.category_names)
  )
}

// Constants
const DOAS_PER_PAGE = 10

// Prayer Card Component
function PrayerCard({
  doa,
  language,
}: {
  doa: DoaItem
  language: 'en' | 'my'
}) {
  // Get localized content
  const getTitle = () => {
    if (language === 'my') {
      return doa.name_my
        .replace(/^\[PAGI\]|\[PETANG\]|\[JEMA'AH\]\s*/i, '')
        .trim()
    }
    return doa.name_en
      .replace(/^(MORNING|EVENING|JEMA'AH)\s*[-:]?\s*/i, '')
      .trim()
  }

  const getMeaning = () => {
    return language === 'my' ? doa.meaning_my : doa.meaning_en
  }

  const getReference = () => {
    return language === 'my' ? doa.reference_my : doa.reference_en
  }

  const getCategories = () => {
    // Return categories that match the current language
    const malayCategories = ['Bacaan Pagi', 'Bacaan Petang', 'Bacaan Harian']
    const englishCategories = ['Morning Supplication', 'Evening Supplication']

    return doa.category_names.filter((cat) => {
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
              title="Copy"
              onClick={() => navigator.clipboard.writeText(doa.content)}
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              title="Favorite"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              title="Share"
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
  onPageChange,
  t,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  t: (key: string) => string
}) {
  const pages = useMemo(() => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

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
            String(Math.min(currentPage * DOAS_PER_PAGE, filteredDoas.length)),
          )
          .replace('{total}', String(filteredDoas.length))}
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
    <div className="bg-card rounded-2xl p-4 shadow-green border border-border mb-10 sticky top-20 z-30 transition-all duration-300">
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

// Filter and search logic
let filteredDoas: Array<DoaItem> = []
const doaDataTyped = (doaDataRaw as Array<any>).filter(isDoaItem)

// Main content component
export function DoaLibraryContent() {
  const { language, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and search logic
  filteredDoas = useMemo(() => {
    let filtered = doaDataTyped

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
            doa.name_my.toLowerCase().includes(query) ||
            doa.meaning_my.toLowerCase().includes(query) ||
            doa.reference_my.toLowerCase().includes(query) ||
            doa.category_names.some((cat) => cat.toLowerCase().includes(query))
          )
        } else {
          return (
            contentMatch ||
            doa.name_en.toLowerCase().includes(query) ||
            doa.meaning_en.toLowerCase().includes(query) ||
            doa.reference_en.toLowerCase().includes(query) ||
            doa.category_names.some((cat) => cat.toLowerCase().includes(query))
          )
        }
      })
    }

    return filtered
  }, [searchQuery, language])

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
            <PrayerCard key={doa.slug} doa={doa} language={language} />
          ))}
        </div>

        {filteredDoas.length > DOAS_PER_PAGE && (
          <div className="mt-16">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
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
