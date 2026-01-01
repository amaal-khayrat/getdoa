import { Plus, Search } from 'lucide-react'
import { useDoaListActions, useDoaListState } from './doa-list-builder'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { isPrayerSelected, truncateText } from '@/utils/text-helpers'

export function PrayerBrowserPanel({
  filteredPrayers,
  categories,
  onSearchChange,
  onCategoryChange,
  searchQuery,
  selectedCategory,
  paginationData,
  onPageChange,
}: {
  filteredPrayers: Array<any>
  categories: Array<string>
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  searchQuery: string
  selectedCategory: string
  paginationData: {
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    totalCount: number
  }
  onPageChange: (page: number) => void
}) {
  const { language, selectedPrayers } = useDoaListState()
  const { addPrayer } = useDoaListActions()

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
    <div className="bg-card rounded-lg border flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prayers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-11 text-base sm:h-10 sm:text-sm"
            type="search"
            autoComplete="off"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={selectedCategory}
          onValueChange={(value) => onCategoryChange(value || '')}
        >
          <SelectTrigger className="h-11 text-base sm:h-10 sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prayers List */}
      <div className="min-h-[300px] max-h-[calc(100vh-24rem)] overflow-y-auto p-3 sm:p-4 lg:min-h-[350px] lg:max-h-[calc(100vh-20rem)]">
        {filteredPrayers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No prayers found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredPrayers.map((prayer) => {
              const isSelected = isPrayerSelected(selectedPrayers, prayer.slug)
              const canAdd = selectedPrayers.length < 15 && !isSelected

              return (
                <div
                  key={prayer.slug}
                  className={`group rounded-lg border p-4 transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-background hover:shadow-sm active:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Category Badge */}
                      {prayer.categoryNames &&
                        prayer.categoryNames.length > 0 && (
                          <div className="mb-2">
                            <Badge
                              variant={getCategoryVariant(
                                prayer.categoryNames[0],
                              )}
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
                        {language === 'my'
                          ? prayer.meaningMy
                          : prayer.meaningEn}
                      </p>

                      {/* Reference */}
                      <p className="text-xs text-muted-foreground">
                        {language === 'my'
                          ? prayer.referenceMy
                          : prayer.referenceEn}
                      </p>
                    </div>

                    {/* Add Button */}
                    <Button
                      variant={isSelected ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => {
                        if (canAdd) {
                          addPrayer(prayer)
                        }
                      }}
                      disabled={!canAdd}
                      className="shrink-0 h-10 px-4 sm:h-9 sm:px-3 text-sm active:scale-95 transition-transform"
                    >
                      {isSelected ? (
                        <span className="text-xs sm:text-xs">Added</span>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Add</span>
                          <span className="sm:hidden">+</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t bg-muted/30 space-y-3">
        <div className="text-xs text-muted-foreground text-center">
          {paginationData.totalCount}{' '}
          {paginationData.totalCount === 1 ? 'prayer' : 'prayers'} found
          {selectedPrayers.length > 0 && (
            <span className="ml-2">• {selectedPrayers.length} selected</span>
          )}
          {paginationData.totalPages > 1 && (
            <span className="ml-2">
              • Page {paginationData.currentPage} of {paginationData.totalPages}
            </span>
          )}
        </div>

        {/* Pagination Controls */}
        {paginationData.totalPages > 1 && (
          <Pagination className="w-full justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(paginationData.currentPage - 1)}
                  className={
                    !paginationData.hasPreviousPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from(
                { length: Math.min(5, paginationData.totalPages) },
                (_, i) => {
                  let pageNumber
                  if (paginationData.totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (paginationData.currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (
                    paginationData.currentPage >=
                    paginationData.totalPages - 2
                  ) {
                    pageNumber = paginationData.totalPages - 4 + i
                  } else {
                    pageNumber = paginationData.currentPage - 2 + i
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => onPageChange(pageNumber)}
                        isActive={pageNumber === paginationData.currentPage}
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
                  onClick={() => onPageChange(paginationData.currentPage + 1)}
                  className={
                    !paginationData.hasNextPage
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
