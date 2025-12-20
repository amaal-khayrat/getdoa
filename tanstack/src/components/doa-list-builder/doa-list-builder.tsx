import React, { use, useCallback, useMemo, useReducer, useState, useEffect, useRef } from 'react'
import { Download, Eye, AlertCircle, CheckCircle, X } from 'lucide-react'
import { ResponsiveDoaLayout } from './responsive-layout'
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
import { DEFAULT_PREVIEW_SETTINGS } from '@/types/doa.types'
// Components will be imported where needed to avoid circular dependencies

// Simple notification system for better error handling
type NotificationType = 'error' | 'success' | 'warning'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

function Notification({ notification, onDismiss }: { notification: Notification; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id)
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.id, notification.duration, onDismiss])

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStyles = () => {
    switch (notification.type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900'
      case 'success':
        return 'border-green-200 bg-green-50 text-green-900'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-900'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-900'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getStyles()} max-w-md`}>
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{notification.message}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDismiss(notification.id)}
        className="h-6 w-6 p-0 hover:bg-black/10"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}

// Notification provider context
const NotificationContext = React.createContext<{
  addNotification: (type: NotificationType, message: string, duration?: number) => void
  dismissNotification: (id: string) => void
}>({
  addNotification: () => {},
  dismissNotification: () => {},
})

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((type: NotificationType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [...prev, { id, type, message, duration }])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ addNotification, dismissNotification }}>
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </NotificationContext.Provider>
  )
}

function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

// Type definitions for useReducer
type DoaListState = {
  selectedPrayers: Array<DoaItem>
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
  availablePrayers: Array<DoaItem>
  currentPage: number
  itemsPerPage: number
}

type DoaListAction =
  | { type: 'UPDATE_STATE'; payload: Partial<DoaListState> }
  | { type: 'ADD_PRAYER'; payload: DoaItem }
  | { type: 'REMOVE_PRAYER'; payload: string }
  | { type: 'REORDER_PRAYERS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'TOGGLE_PREVIEW'; payload?: boolean }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_PAGE' }

// Reducer function for state management
function doaListReducer(state: DoaListState, action: DoaListAction): DoaListState {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload }

    case 'ADD_PRAYER':
      if (state.selectedPrayers.length >= 15) {
        // Return state unchanged, will handle alert in component
        return state
      }
      return {
        ...state,
        selectedPrayers: [...state.selectedPrayers, action.payload],
      }

    case 'REMOVE_PRAYER':
      return {
        ...state,
        selectedPrayers: state.selectedPrayers.filter((p) => p.slug !== action.payload),
      }

    case 'REORDER_PRAYERS':
      const { fromIndex, toIndex } = action.payload
      const newPrayers = [...state.selectedPrayers]
      const [moved] = newPrayers.splice(fromIndex, 1)
      newPrayers.splice(toIndex, 0, moved)
      return {
        ...state,
        selectedPrayers: newPrayers,
      }

    case 'SET_GENERATING':
      return {
        ...state,
        isGeneratingImage: action.payload,
      }

    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        showPreview: action.payload ?? !state.showPreview,
        isPreviewLoading: false,
      }

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
      }

    case 'RESET_PAGE':
      return {
        ...state,
        currentPage: 1,
      }

    default:
      return state
  }
}

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
  isPreviewLoading: boolean
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
  isPreviewLoading: false,
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
  handlePreview: () => Promise<void>
}>({
  updateState: () => {},
  addPrayer: () => {},
  removePrayer: () => {},
  reorderPrayers: () => {},
  generateImage: async () => {},
  setCurrentPage: () => {},
  resetToFirstPage: () => {},
  handlePreview: async () => {},
})

// Inner provider with access to notifications
function DoaListProviderWithNotifications({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { language } = useLanguage()
  const { prayers } = useDoaData()
  const { addNotification } = useNotifications()

  // Initialize state with useReducer
  const [state, dispatch] = useReducer(doaListReducer, {
    selectedPrayers: [],
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
  })

  // Wrap dispatch actions in callbacks for API compatibility
  const updateState = useCallback((updates: Partial<DoaListState>) => {
    dispatch({ type: 'UPDATE_STATE', payload: updates })
  }, [])

  const addPrayer = useCallback((prayer: DoaItem) => {
    const currentState = state // Capture current state for limit check
    if (currentState.selectedPrayers.length >= 15) {
      addNotification('warning', 'Maximum 15 prayers allowed')
      return
    }
    dispatch({ type: 'ADD_PRAYER', payload: prayer })
  }, [state.selectedPrayers.length, addNotification])

  const removePrayer = useCallback((slug: string) => {
    dispatch({ type: 'REMOVE_PRAYER', payload: slug })
  }, [])

  const reorderPrayers = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_PRAYERS', payload: { fromIndex, toIndex } })
  }, [])

  const generateImage = useCallback(async () => {
    const validation = validateDoaList({
      title: state.title,
      prayers: state.selectedPrayers,
    })

    if (!validation.isValid) {
      addNotification('error', validation.errors.join('\n'))
      return
    }

    dispatch({ type: 'SET_GENERATING', payload: true })

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
        backgroundColor: '#ffffff',
        textColor: state.previewSettings.textColor,
        minImageWidth: 1080,
        maxImageWidth: 3000,
      })

      const filename = `${state.title.replace(/[^a-z0-9]/gi, '_')}.png`
      downloadImage(blob, filename)
      addNotification('success', 'Image generated successfully!')
    } catch (error) {
      console.error('Error generating image:', error)
      addNotification('error', 'Failed to generate image. Please try again.')
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false })
    }
  }, [state, addNotification])

  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page })
  }, [])

  const resetToFirstPage = useCallback(() => {
    dispatch({ type: 'RESET_PAGE' })
  }, [])

  // Handle preview - removed artificial delay to eliminate flashing
  const handlePreview = useCallback(() => {
    dispatch({ type: 'TOGGLE_PREVIEW', payload: true })
  }, [])

  // Handle external data updates with useEffect to avoid render-time state updates
  useEffect(() => {
    if (state.availablePrayers.length !== prayers.length) {
      dispatch({ type: 'UPDATE_STATE', payload: { availablePrayers: prayers } })
    }
  }, [prayers.length, state.availablePrayers.length])

  useEffect(() => {
    const currentUser = {
      isAuthenticated: !!session?.user,
      username: session?.user?.name,
    }
    if (JSON.stringify(state.user) !== JSON.stringify(currentUser)) {
      dispatch({ type: 'UPDATE_STATE', payload: { user: currentUser } })
    }
  }, [session?.user, state.user])

  useEffect(() => {
    if (state.language !== language) {
      dispatch({ type: 'UPDATE_STATE', payload: { language: language as 'en' | 'my' } })
    }
  }, [language, state.language])

  useEffect(() => {
    const currentUsername = state.user.username
    if (state.previewSettings.attribution.username !== currentUsername) {
      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          previewSettings: {
            ...state.previewSettings,
            attribution: {
              ...state.previewSettings.attribution,
              username: currentUsername,
            },
          },
        },
      })
    }
  }, [state.user.username, state.previewSettings.attribution.username, state.previewSettings])

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
          handlePreview,
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

// Import components where needed - NO LAZY LOADING to prevent flash
import { PreviewModal } from './preview-modal'

export function DoaListBuilder() {
  return (
    <NotificationProvider>
      <DoaListProviderWithNotifications>
        <DoaListBuilderContent />
      </DoaListProviderWithNotifications>
    </NotificationProvider>
  )
}

function DoaListBuilderContent() {
  const {
    searchQuery,
    selectedCategory,
    availablePrayers,
    isGeneratingImage,
    showPreview,
    isPreviewLoading,
    selectedPrayers,
    currentPage,
    itemsPerPage,
  } = useDoaListState()

  const {
    updateState,
    generateImage,
    setCurrentPage,
    resetToFirstPage,
    handlePreview,
  } = useDoaListActions()

  // Debounced search to optimize performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Update debounced search with delay
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms debounce delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery])

  // Filter prayers based on debounced search and category
  const filteredPrayers = useMemo(() => {
    let filtered = availablePrayers

    if (debouncedSearchQuery) {
      filtered = searchPrayers(filtered, debouncedSearchQuery)
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filterByCategory(filtered, selectedCategory)
    }

    return filtered
  }, [availablePrayers, debouncedSearchQuery, selectedCategory])

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
                onClick={handlePreview}
                disabled={selectedPrayers.length === 0 || isPreviewLoading}
                className="flex-1"
              >
                {isPreviewLoading ? (
                  <>
                    <div className="w-4 h-4 mr-1 sm:mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="text-xs sm:text-sm">Loading...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Preview</span>
                  </>
                )}
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
                onClick={handlePreview}
                disabled={selectedPrayers.length === 0 || isPreviewLoading}
                className="min-w-25"
              >
                {isPreviewLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="hidden sm:inline">Loading...</span>
                    <span className="sm:hidden text-xs">Load</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Preview</span>
                    <span className="sm:hidden text-xs">View</span>
                  </>
                )}
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

      {/* Preview Modal - NO SUSPENSE, instant rendering */}
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
