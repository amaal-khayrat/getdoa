import { useCallback, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  Search,
  Share,
} from 'lucide-react'
import { toast } from 'sonner'
import type { SearchableDoa } from '@/types/doa.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/contexts/language-context'
import { saveDoa, unsaveDoa } from '@/server-functions/dashboard'
import { searchPrayers } from '@/utils/text-helpers'

// Constants
const DOAS_PER_PAGE = 10

// Prayer Card Component
interface PrayerCardProps {
  doa: SearchableDoa
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
  const [isChainExpanded, setIsChainExpanded] = useState(false)
  const [isReferenceHovered, setIsReferenceHovered] = useState(false)

  const getTitle = () => {
    if (language === 'my') {
      return doa.nameMy.replace(/^\[PAGI\]|\[PETANG\]|\[JEMA'AH\]\s*/i, '').trim()
    }
    return doa.nameEn.replace(/^(MORNING|EVENING|JEMA'AH)\s*[-:]?\s*/i, '').trim()
  }

  const getMeaning = () => (language === 'my' ? doa.meaningMy : doa.meaningEn)
  const getReference = () => (language === 'my' ? doa.referenceMy : doa.referenceEn)
  const getContext = () => (language === 'my' ? doa.contextMy : doa.contextEn)

  const getCategories = () => {
    const malayCategories = ['Bacaan Pagi', 'Bacaan Petang', 'Bacaan Harian']
    const englishCategories = ['Morning Supplication', 'Evening Supplication']
    return doa.categoryNames.filter((cat) => {
      if (language === 'my') {
        return malayCategories.some((mc) => cat.includes(mc)) || !englishCategories.some((ec) => cat.includes(ec))
      }
      return englishCategories.some((ec) => cat.includes(ec)) || !malayCategories.some((mc) => cat.includes(mc))
    })
  }

  const reference = getReference()
  const categories = getCategories().slice(0, 2)

  return (
    <Link to="/doa/$slug" params={{ slug: doa.slug }}>
      <article style={{ background: '#fdfcf8', borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e0d5', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 14px' }}>
          <div className="flex justify-between items-start">
            <h2
              className="font-serif"
              style={{ fontSize: 20, fontWeight: 700, color: '#153830', lineHeight: 1.35, flex: 1, marginRight: 12 }}
            >
              {getTitle()}
            </h2>
            <div className="flex items-center shrink-0" style={{ gap: 2 }}>
              <button
                style={{ color: '#888780', background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
                title={language === 'my' ? 'Salin' : 'Copy'}
                onClick={(e) => {
                  e.preventDefault()
                  navigator.clipboard.writeText(doa.content)
                  toast.success(language === 'my' ? 'Disalin ke papan klip' : 'Copied to clipboard')
                }}
              >
                <Copy style={{ width: 17, height: 17 }} />
              </button>
              <button
                style={{
                  color: isSaved ? '#cd9c54' : '#888780',
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1,
                }}
                title={
                  !isAuthenticated
                    ? language === 'my' ? 'Log masuk untuk simpan' : 'Sign in to save'
                    : isSaved
                      ? language === 'my' ? 'Buang dari simpanan' : 'Remove from saved'
                      : language === 'my' ? 'Simpan doa' : 'Save prayer'
                }
                onClick={(e) => {
                  e.preventDefault()
                  onToggleSave(doa.slug)
                }}
                disabled={isSaving}
              >
                <Heart style={{ width: 17, height: 17 }} className={isSaved ? 'fill-current' : ''} />
              </button>
              <button
                style={{ color: '#888780', background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
                title={language === 'my' ? 'Kongsi' : 'Share'}
                onClick={(e) => {
                  e.preventDefault()
                  const shareUrl = `${window.location.origin}/doa/${doa.slug}`
                  const shareText =
                    language === 'my'
                      ? `${doa.nameMy} - ${doa.meaningMy?.slice(0, 100) || ''}...`
                      : `${doa.nameEn} - ${doa.meaningEn?.slice(0, 100) || ''}...`
                  if (navigator.share) {
                    navigator.share({ title: language === 'my' ? doa.nameMy : doa.nameEn, text: shareText, url: shareUrl })
                  } else {
                    navigator.clipboard.writeText(shareUrl)
                    toast.success(language === 'my' ? 'Pautan disalin ke papan klip' : 'Link copied to clipboard')
                  }
                }}
              >
                <Share style={{ width: 17, height: 17 }} />
              </button>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 6, marginTop: 7 }}>
              {categories.map((cat, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'transparent',
                    color: '#0f5f50',
                    border: '0.5px solid rgba(30,138,116,0.4)',
                    borderRadius: 20,
                    padding: '3px 10px',
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arabic block */}
        <div
          style={{
            background: 'rgba(30, 138, 116, 0.06)',
            borderTop: '0.5px solid #d8d4c8',
            borderBottom: '0.5px solid #d8d4c8',
            padding: 20,
          }}
        >
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-center"
            style={{ fontSize: 21, color: '#153830', lineHeight: 2.1 }}
          >
            {doa.content}
          </p>
        </div>

        {/* Meaning */}
        <div style={{ padding: '16px 20px 12px' }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#1e8a74',
                whiteSpace: 'nowrap',
              }}
            >
              {language === 'my' ? 'Maksud' : 'Meaning'}
            </span>
            <div style={{ flex: 1, height: '2px', background: 'rgba(30,138,116,0.2)' }} />
          </div>
          <p className="font-serif italic" style={{ fontSize: 14, color: '#5F5E5A', lineHeight: 1.75 }}>
            {getMeaning()}
          </p>
        </div>

        {/* Context & Explanation (collapsible) */}
        {getContext() && (
          <div style={{ padding: '0 20px 14px' }}>
            <button
              type="button"
              className="flex items-center w-full"
              style={{ gap: 8, marginBottom: isChainExpanded ? 8 : 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsChainExpanded((v) => !v)
              }}
            >
              <span
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#1e8a74',
                  whiteSpace: 'nowrap',
                }}
              >
                {language === 'my' ? 'Konteks & Penjelasan' : 'Context & Explanation'}
              </span>
              <div style={{ flex: 1, height: '2px', background: 'rgba(30,138,116,0.2)' }} />
              <ChevronDown
                style={{
                  width: 14,
                  height: 14,
                  color: '#1e8a74',
                  flexShrink: 0,
                  transform: isChainExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
            {isChainExpanded && (
              <p className="font-serif italic" style={{ fontSize: 14, color: '#5F5E5A', lineHeight: 1.75 }}>
                {getContext()}
              </p>
            )}
          </div>
        )}

        {/* Hadith reference row */}
        {reference && (
          <div
            style={{
              background: isReferenceHovered ? '#f5e9d4' : '#faf3e8',
              padding: '11px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
            onMouseEnter={() => setIsReferenceHovered(true)}
            onMouseLeave={() => setIsReferenceHovered(false)}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: '#cd9c54',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen style={{ width: 15, height: 15, color: '#fff' }} />
            </div>
            <span className="font-serif" style={{ fontSize: 13, fontWeight: 500, color: '#8a6830' }}>
              {reference}
            </span>
          </div>
        )}
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
    const range: Array<number> = []
    const rangeWithDots: Array<number | string> = []
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

interface DoaLibraryContentProps {
  initialDoas: Array<SearchableDoa>
  initialSavedSlugs: Array<string>
  user: {
    id: string
    name: string
    email: string
    image: string | null | undefined
  } | null
}

// Main content component
export function DoaLibraryContent({
  initialDoas,
  initialSavedSlugs,
  user,
}: DoaLibraryContentProps) {
  const { language, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(
    () => new Set(initialSavedSlugs),
  )
  const [savingSlug, setSavingSlug] = useState<string | null>(null)

  const isAuthenticated = !!user

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
    return searchPrayers(initialDoas, searchQuery)
  }, [searchQuery, initialDoas])

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
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          t={t}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
