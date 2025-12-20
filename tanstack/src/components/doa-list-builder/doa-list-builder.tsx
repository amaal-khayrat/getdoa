import React, { use, useCallback, useMemo, useState } from 'react'
import { Download, Eye } from 'lucide-react'
import type { DoaItem, DoaList, PreviewSettings } from '@/types/doa.types'
import { useSession } from '@/lib/auth-client'
import { useLanguage } from '@/contexts/language-context'
import { useDoaData } from '@/hooks/use-doa-data'
import {
  filterByCategory,
  searchPrayers,
  validateDoaList,
} from '@/utils/text-helpers'
import { downloadImage, generateDoaImage } from '@/utils/image-generator'
import { Button } from '@/components/ui/button'
import { DEFAULT_PREVIEW_SETTINGS, IMAGE_SIZE_PRESETS } from '@/types/doa.types'
import { ResponsiveDoaLayout } from './responsive-layout'
// Components will be imported where needed to avoid circular dependencies

// Create a context for sharing state
const DoaListStateContext = React.createContext<{
  selectedPrayers: Array<DoaItem>
  availablePrayers: Array<DoaItem>
  title: string
  description: string
  searchQuery: string
  selectedCategory: string
  language: 'en' | 'my'
  isGeneratingImage: boolean
  showPreview: boolean
  previewSettings: PreviewSettings
  user: {
    isAuthenticated: boolean
    username?: string
  }
  currentPage: number
  itemsPerPage: number
}>({
  selectedPrayers: [],
  availablePrayers: [],
  title: 'My Daily Prayers',
  description: '',
  searchQuery: '',
  selectedCategory: 'All Categories',
  language: 'en',
  isGeneratingImage: false,
  showPreview: false,
  previewSettings: DEFAULT_PREVIEW_SETTINGS,
  user: { isAuthenticated: false, username: undefined },
  currentPage: 1,
  itemsPerPage: 10,
})

const DoaListActionsContext = React.createContext<{
  updateState: (updates: Partial<any>) => void
  addPrayer: (prayer: DoaItem) => void
  removePrayer: (slug: string) => void
  reorderPrayers: (fromIndex: number, toIndex: number) => void
  generateImage: () => Promise<void>
  setCurrentPage: (page: number) => void
  resetToFirstPage: () => void
}>({
  updateState: () => {},
  addPrayer: () => {},
  removePrayer: () => {},
  reorderPrayers: () => {},
  generateImage: async () => {},
  setCurrentPage: () => {},
  resetToFirstPage: () => {},
})

// Provider component
function DoaListProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { language } = useLanguage()
  const { prayers } = useDoaData()

  const [state, setState] = useState(() => ({
    selectedPrayers: [] as Array<DoaItem>,
    title: 'My Daily Prayers',
    description: '',
    searchQuery: '',
    selectedCategory: 'All Categories',
    language: language as 'en' | 'my',
    isGeneratingImage: false,
    showPreview: false,
    previewSettings: DEFAULT_PREVIEW_SETTINGS,
    user: {
      isAuthenticated: !!session?.user,
      username: session?.user?.name,
    },
    availablePrayers: prayers,
    currentPage: 1,
    itemsPerPage: 10,
  }))

  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }, [])

  const addPrayer = useCallback((prayer: DoaItem) => {
    setState((prev) => {
      if (prev.selectedPrayers.length >= 15) {
        alert('Maximum 15 prayers allowed')
        return prev
      }
      return {
        ...prev,
        selectedPrayers: [...prev.selectedPrayers, prayer],
      }
    })
  }, [])

  const removePrayer = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      selectedPrayers: prev.selectedPrayers.filter((p) => p.slug !== slug),
    }))
  }, [])

  const reorderPrayers = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newPrayers = [...prev.selectedPrayers]
      const [moved] = newPrayers.splice(fromIndex, 1)
      newPrayers.splice(toIndex, 0, moved)
      return { ...prev, selectedPrayers: newPrayers }
    })
  }, [])

  const generateImage = useCallback(async () => {
    const validation = validateDoaList({
      title: state.title,
      prayers: state.selectedPrayers,
    })

    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }

    setState((prev) => ({ ...prev, isGeneratingImage: true }))

    try {
      const doaList: DoaList = {
        title: state.title,
        description: state.description,
        prayers: state.selectedPrayers,
        language: state.language,
        showTranslations: state.previewSettings.showTranslations,
        translationLayout: state.previewSettings.translationLayout,
        createdBy: state.user.username,
        createdAt: new Date(),
      }

      const blob = await generateDoaImage({
        doaList,
        imageSize: IMAGE_SIZE_PRESETS[state.previewSettings.imageSize],
        backgroundColor: state.previewSettings.backgroundColor,
        textColor: state.previewSettings.textColor,
      })

      const filename = `${state.title.replace(/[^a-z0-9]/gi, '_')}.png`
      downloadImage(blob, filename)
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setState((prev) => ({ ...prev, isGeneratingImage: false }))
    }
  }, [state])

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }))
  }, [])

  const resetToFirstPage = useCallback(() => {
    setState((prev) => ({ ...prev, currentPage: 1 }))
  }, [])

  // Update available prayers when data changes
  if (state.availablePrayers.length !== prayers.length) {
    setState((prev) => ({ ...prev, availablePrayers: prayers }))
  }

  // Update user info when session changes
  const currentUser = {
    isAuthenticated: !!session?.user,
    username: session?.user?.name,
  }
  if (JSON.stringify(state.user) !== JSON.stringify(currentUser)) {
    setState((prev) => ({ ...prev, user: currentUser }))
  }

  // Update language preference
  if (state.language !== language) {
    setState((prev) => ({ ...prev, language: language as 'en' | 'my' }))
  }

  // Update attribution when user changes
  const currentUsername = state.user.username
  if (state.previewSettings.attribution.username !== currentUsername) {
    setState((prev) => ({
      ...prev,
      previewSettings: {
        ...prev.previewSettings,
        attribution: {
          ...prev.previewSettings.attribution,
          username: currentUsername,
        },
      },
    }))
  }

  return (
    <DoaListStateContext.Provider value={state}>
      <DoaListActionsContext.Provider
        value={{
          updateState,
          addPrayer,
          removePrayer,
          reorderPrayers,
          generateImage,
          setCurrentPage,
          resetToFirstPage,
        }}
      >
        {children}
      </DoaListActionsContext.Provider>
    </DoaListStateContext.Provider>
  )
}

// Hook to use the state context
function useDoaListState() {
  const context = use(DoaListStateContext)
  if (!context) {
    throw new Error('useDoaListState must be used within DoaListProvider')
  }
  return context
}

// Hook to use the actions context
function useDoaListActions() {
  const context = use(DoaListActionsContext)
  if (!context) {
    throw new Error('useDoaListActions must be used within DoaListProvider')
  }
  return context
}

// Combined hook for convenience
function useDoaListBuilder() {
  const state = useDoaListState()
  const actions = useDoaListActions()

  return { ...state, ...actions }
}

// Export the hooks so other components can use them
export { useDoaListState, useDoaListActions, useDoaListBuilder }

// Import components where needed
const PreviewModal = React.lazy(() =>
  import('./preview-modal').then((m) => ({ default: m.PreviewModal })),
)

export function DoaListBuilder() {
  return (
    <DoaListProvider>
      <DoaListBuilderContent />
    </DoaListProvider>
  )
}

function DoaListBuilderContent() {
  const {
    searchQuery,
    selectedCategory,
    availablePrayers,
    isGeneratingImage,
    showPreview,
    selectedPrayers,
    currentPage,
    itemsPerPage,
  } = useDoaListState()

  const { updateState, generateImage, setCurrentPage, resetToFirstPage } =
    useDoaListActions()

  // Filter prayers based on search and category
  const filteredPrayers = useMemo(() => {
    let filtered = availablePrayers

    if (searchQuery) {
      filtered = searchPrayers(filtered, searchQuery)
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filterByCategory(filtered, selectedCategory)
    }

    return filtered
  }, [availablePrayers, searchQuery, selectedCategory])

  // Pagination logic
  const paginatedData = useMemo(() => {
    const totalPages = Math.ceil(filteredPrayers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedPrayers = filteredPrayers.slice(startIndex, endIndex)

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedPrayers,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  }, [filteredPrayers, currentPage, itemsPerPage])

  // Reset to first page when search or category changes
  useMemo(() => {
    const totalPages = Math.ceil(filteredPrayers.length / itemsPerPage)
    if (currentPage > totalPages && totalPages > 0) {
      resetToFirstPage()
    }
  }, [filteredPrayers.length, currentPage, itemsPerPage, resetToFirstPage])

  // Get all unique categories
  const categories = useMemo(() => {
    const allCategories = availablePrayers.flatMap(
      (p) => p.category_names || [],
    )
    return ['All Categories', ...Array.from(new Set(allCategories))].sort()
  }, [availablePrayers])

  // Handle export
  const handleExport = useCallback(async () => {
    await generateImage()
  }, [generateImage])

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Page Header */}
      <div className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col sm:hidden gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">
                Create Prayer List
              </h1>
              <div className="text-sm text-muted-foreground font-medium">
                {selectedPrayers.length}/15
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateState({ showPreview: true })}
                disabled={selectedPrayers.length === 0}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Preview</span>
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                disabled={selectedPrayers.length === 0 || isGeneratingImage}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">
                  {isGeneratingImage ? 'Generating...' : 'Export'}
                </span>
              </Button>
            </div>
          </div>

          {/* Tablet & Desktop Layout - Side by side */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1 truncate">
                Create Prayer List
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {selectedPrayers.length} of 15 prayers selected
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => updateState({ showPreview: true })}
                disabled={selectedPrayers.length === 0}
                className="min-w-25"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden text-xs">View</span>
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedPrayers.length === 0 || isGeneratingImage}
                className="min-w-30"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {isGeneratingImage ? 'Generating...' : 'Export'}
                </span>
                <span className="sm:hidden text-xs">
                  {isGeneratingImage ? '...' : 'Export'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-[calc(100vh-7rem)]">
          <ResponsiveDoaLayout
            filteredPrayers={paginatedData.paginatedPrayers}
            categories={categories}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSearchChange={(value) => {
              updateState({ searchQuery: value })
              resetToFirstPage()
            }}
            onCategoryChange={(category) => {
              updateState({ selectedCategory: category })
              resetToFirstPage()
            }}
            selectedPrayersCount={selectedPrayers.length}
            paginationData={{
              currentPage,
              totalPages: paginatedData.totalPages,
              hasNextPage: paginatedData.hasNextPage,
              hasPreviousPage: paginatedData.hasPreviousPage,
              totalCount: filteredPrayers.length,
            }}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          onClose={() => updateState({ showPreview: false })}
          onExport={handleExport}
          isGenerating={isGeneratingImage}
        />
      )}
    </div>
  )
}
