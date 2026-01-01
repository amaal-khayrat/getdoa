import { useState, useMemo } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
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

const ITEMS_PER_PAGE = 8

export function DoaSelector({
  prayers,
  categories,
  selectedDoa,
  onSelect,
  language,
}: DoaSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter prayers based on search and category
  const filteredPrayers = useMemo(() => {
    let filtered = prayers

    if (searchQuery) {
      filtered = searchPrayers(filtered, searchQuery)
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filterByCategory(filtered, selectedCategory)
    }

    return filtered
  }, [prayers, searchQuery, selectedCategory])

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
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  }, [filteredPrayers, currentPage])

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

    if (morningCategories.some((cat) => category.includes(cat))) {
      return 'default'
    } else if (eveningCategories.some((cat) => category.includes(cat))) {
      return 'secondary'
    }
    return 'outline'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and filter */}
      <div className="p-4 border-b space-y-3">
        <h3 className="font-semibold text-lg">Select a Doa</h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prayers..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={(value) => handleCategoryChange(value || '')}>
          <SelectTrigger>
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

      {/* Prayers List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {paginatedData.prayers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No prayers found</p>
            </div>
          ) : (
            paginatedData.prayers.map((prayer) => {
              const isSelected = selectedDoa?.slug === prayer.slug

              return (
                <button
                  key={prayer.slug}
                  type="button"
                  onClick={() => onSelect(prayer)}
                  className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                      : 'bg-background hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Category Badge */}
                      {prayer.categoryNames?.[0] && (
                        <Badge
                          variant={getCategoryVariant(prayer.categoryNames[0])}
                          className="text-xs mb-2"
                        >
                          {prayer.categoryNames[0]}
                        </Badge>
                      )}

                      {/* Prayer Title */}
                      <h4 className="font-medium text-sm mb-1.5 leading-tight">
                        {language === 'my' ? prayer.nameMy : prayer.nameEn}
                      </h4>

                      {/* Arabic Text Preview */}
                      <p
                        className="font-arabic text-sm text-muted-foreground line-clamp-1"
                        dir="rtl"
                      >
                        {truncateText(prayer.content, 60)}
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
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer with pagination */}
      {paginatedData.totalPages > 1 && (
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground text-center mb-2">
            {filteredPrayers.length} prayers found
          </div>
          <Pagination className="justify-center">
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
        </div>
      )}
    </div>
  )
}
