import { useState, useDeferredValue, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ListFilterBarProps {
  searchQuery: string
  sortBy: 'newest' | 'popular' | 'favorites'
  onSearchChange: (query: string) => void
  onSortChange: (sort: 'newest' | 'popular' | 'favorites') => void
}

export function ListFilterBar({
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
}: ListFilterBarProps) {
  // Local state for immediate input feedback
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Deferred value for non-blocking updates (React 18+ pattern)
  const deferredSearch = useDeferredValue(localSearch)

  // Sync local state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Update URL when deferred search changes (natural debounce effect)
  useEffect(() => {
    if (deferredSearch !== searchQuery) {
      onSearchChange(deferredSearch)
    }
  }, [deferredSearch, searchQuery, onSearchChange])

  const handleClearSearch = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border mb-8 sticky top-20 z-30">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lists by name or description..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search prayer lists"
          />
          {localSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sort Select */}
        <Select
          value={sortBy}
          onValueChange={(value) => {
            if (value) onSortChange(value as 'newest' | 'popular' | 'favorites')
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Sort lists by">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Viewed</SelectItem>
            <SelectItem value="favorites">Most Favorited</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
