import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import type { DoaItem, Language } from '@/types/doa.types'
import {
  searchPrayers,
  filterByCategory,
  truncateText,
} from '@/utils/text-helpers'

interface DoaSelectorProps {
  prayers: DoaItem[]
  categories: string[]
  selectedDoa: DoaItem | null
  onSelect: (doa: DoaItem) => void
  language: Language
}

const ITEMS_PER_PAGE = 10

export function DoaSelector({
  prayers,
  categories,
  selectedDoa,
  onSelect,
  language,
}: DoaSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [currentPage, setCurrentPage] = useState(1)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search to optimize performance
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery])

  // Filter prayers based on debounced search and category
  const filteredPrayers = useMemo(() => {
    let filtered = prayers

    if (debouncedSearchQuery) {
      filtered = searchPrayers(filtered, debouncedSearchQuery)
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filterByCategory(filtered, selectedCategory)
    }

    return filtered
  }, [prayers, debouncedSearchQuery, selectedCategory])

  // Pagination
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(filteredPrayers.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedPrayers = filteredPrayers.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    )

    return {
      prayers: paginatedPrayers,
      totalPages,
      totalCount: filteredPrayers.length,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  }, [filteredPrayers, currentPage])

  // Reset to first page when filters change and page is out of bounds
  useMemo(() => {
    if (currentPage > paginatedData.totalPages && paginatedData.totalPages > 0) {
      setCurrentPage(1)
    }
  }, [filteredPrayers.length, currentPage, paginatedData.totalPages])

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  const getCategoryVariant = (category: string) => {
    const morningCategories = ['Bacaan Pagi', 'Morning Supplication']
    const eveningCategories = ['Bacaan Petang', 'Evening Supplication']
    const forgivenessCategories = [
      'Keampunan',
      'Forgiveness',
      'Taubat',
      'Repentance',
    ]

    if (morningCategories.some((cat) => category.includes(cat))) {
      return 'default'
    } else if (eveningCategories.some((cat) => category.includes(cat))) {
      return 'secondary'
    } else if (forgivenessCategories.some((cat) => category.includes(cat))) {
      return 'outline'
    }
    return 'secondary'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and filter */}
      <div className="p-3 sm:p-4 border-b space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prayers..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-11 text-base sm:h-10 sm:text-sm"
            type="search"
            autoComplete="off"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) => handleCategoryChange(value || '')}
        >
          <SelectTrigger className="h-11 text-base sm:h-10 sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Categories">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prayers List - Scrollable container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {paginatedData.prayers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No prayers found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {paginatedData.prayers.map((prayer) => {
              const isSelected = selectedDoa?.slug === prayer.slug

              return (
                <button
                  key={prayer.slug}
                  type="button"
                  onClick={() => onSelect(prayer)}
                  className={`w-full text-left rounded-lg border p-4 transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                      : 'bg-background hover:shadow-sm active:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Category Badge */}
                      {prayer.categoryNames && prayer.categoryNames.length > 0 && (
                        <div className="mb-2">
                          <Badge
                            variant={getCategoryVariant(prayer.categoryNames[0])}
                            className="text-xs"
                          >
                            {prayer.categoryNames[0]}
                          </Badge>
                        </div>
                      )}

                      {/* Prayer Title */}
                      <h4 className="font-medium text-sm sm:text-sm mb-2 leading-tight">
                        {language === 'my' ? prayer.nameMy : prayer.nameEn}
                      </h4>

                      {/* Arabic Text */}
                      <p
                        className="font-arabic text-sm sm:text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed"
                        dir="rtl"
                      >
                        {truncateText(prayer.content, 100)}
                      </p>

                      {/* Meaning */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                        {language === 'my' ? prayer.meaningMy : prayer.meaningEn}
                      </p>

                      {/* Reference */}
                      <p className="text-xs text-muted-foreground">
                        {language === 'my' ? prayer.referenceMy : prayer.referenceEn}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      <div className="p-3 sm:p-4 border-t bg-muted/30 space-y-3">
        <div className="text-xs text-muted-foreground text-center">
          {paginatedData.totalCount}{' '}
          {paginatedData.totalCount === 1 ? 'prayer' : 'prayers'} found
          {selectedDoa && (
            <span className="ml-2">• 1 selected</span>
          )}
          {paginatedData.totalPages > 1 && (
            <span className="ml-2">
              • Page {currentPage} of {paginatedData.totalPages}
            </span>
          )}
        </div>

        {/* Pagination Controls */}
        {paginatedData.totalPages > 1 && (
          <Pagination className="w-full justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={
                    !paginatedData.hasPreviousPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from(
                { length: Math.min(5, paginatedData.totalPages) },
                (_, i) => {
                  let pageNumber: number
                  if (paginatedData.totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= paginatedData.totalPages - 2) {
                    pageNumber = paginatedData.totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={pageNumber === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                },
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(paginatedData.totalPages, p + 1),
                    )
                  }
                  className={
                    !paginatedData.hasNextPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}
