import { useState } from 'react'
import { SelectedPrayersPanel } from './selected-prayers-panel'
import { PrayerBrowserPanel } from './prayer-browser-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ResponsiveDoaLayoutProps {
  filteredPrayers: Array<any>
  categories: Array<string>
  searchQuery: string
  selectedCategory: string
  onSearchChange: (value: string) => void
  onCategoryChange: (category: string) => void
  selectedPrayersCount: number
  paginationData: {
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    totalCount: number
  }
  onPageChange: (page: number) => void
}

export function ResponsiveDoaLayout({
  filteredPrayers,
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  selectedPrayersCount,
  paginationData,
  onPageChange,
}: ResponsiveDoaLayoutProps) {
  const [activeTab, setActiveTab] = useState<'selected' | 'browse'>('browse')

  return (
    <div className="min-h-0">
      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left Panel - Selected Prayers */}
        <div className="flex flex-col">
          <SelectedPrayersPanel filteredPrayers={filteredPrayers} />
        </div>

        {/* Right Panel - Prayer Browser */}
        <div className="flex flex-col">
          <PrayerBrowserPanel
            filteredPrayers={filteredPrayers}
            categories={categories}
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            paginationData={paginationData}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* Mobile Layout - Tabbed interface */}
      <div className="lg:hidden flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'selected' | 'browse')
          }
          className="flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="selected" className="flex items-center gap-2">
              My Prayer
              {selectedPrayersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {selectedPrayersCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="browse">All DOAs</TabsTrigger>
          </TabsList>

          <TabsContent value="selected" className="flex-1 mt-0">
            <SelectedPrayersPanel filteredPrayers={filteredPrayers} />
          </TabsContent>

          <TabsContent value="browse" className="flex-1 mt-0">
            <PrayerBrowserPanel
              filteredPrayers={filteredPrayers}
              categories={categories}
              onSearchChange={onSearchChange}
              onCategoryChange={onCategoryChange}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              paginationData={paginationData}
              onPageChange={onPageChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
