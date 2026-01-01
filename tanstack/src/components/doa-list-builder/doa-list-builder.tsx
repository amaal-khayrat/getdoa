import React, {
  use,
  useCallback,
  useMemo,
  useReducer,
  useState,
  useEffect,
  useRef,
} from 'react'
import { useNavigate, useBlocker } from '@tanstack/react-router'
import {
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { ResponsiveDoaLayout } from './responsive-layout'
import type { DoaItem, DoaList, PreviewSettings } from '@/types/doa.types'
import type {
  ListStatus,
  ListVisibility,
  PrayerReference,
} from '@/types/doa-list.types'
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
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DEFAULT_PREVIEW_SETTINGS } from '@/types/doa.types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createDoaList, updateDoaList } from '@/routes/dashboard/functions'
import type { BuilderInitialState } from '@/routes/dashboard.create-doa-list'
import type { ListLimitInfo } from '@/lib/list-limit'
// Components will be imported where needed to avoid circular dependencies

// Simple notification system for better error handling
type NotificationType = 'error' | 'success' | 'warning'

interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

function Notification({
  notification,
  onDismiss,
}: {
  notification: Notification
  onDismiss: (id: string) => void
}) {
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
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getStyles()} max-w-md`}
    >
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
  addNotification: (
    type: NotificationType,
    message: string,
    duration?: number,
  ) => void
  dismissNotification: (id: string) => void
}>({
  addNotification: () => {},
  dismissNotification: () => {},
})

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration?: number) => {
      const id = Math.random().toString(36).substr(2, 9)
      setNotifications((prev) => [...prev, { id, type, message, duration }])
    },
    [],
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{ addNotification, dismissNotification }}
    >
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
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type DoaListState = {
  // List metadata (from route loader)
  listId: string | null
  listName: string
  listStatus: ListStatus
  listVisibility: ListVisibility
  // Save state
  isDirty: boolean
  saveStatus: SaveStatus
  // Prayer selection
  selectedPrayers: Array<DoaItem>
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
    userId?: string
  }
  availablePrayers: Array<DoaItem>
  currentPage: number
  itemsPerPage: number
  // Mode from props
  mode: 'create' | 'edit'
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
  | { type: 'SET_LIST_NAME'; payload: string }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'SET_LIST_ID'; payload: string }
  | { type: 'SET_LIST_STATUS'; payload: ListStatus }
  | { type: 'SET_LIST_VISIBILITY'; payload: ListVisibility }

// Reducer function for state management
function doaListReducer(
  state: DoaListState,
  action: DoaListAction,
): DoaListState {
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
        isDirty: true,
      }

    case 'REMOVE_PRAYER':
      return {
        ...state,
        selectedPrayers: state.selectedPrayers.filter(
          (p) => p.slug !== action.payload,
        ),
        isDirty: true,
      }

    case 'REORDER_PRAYERS': {
      const { fromIndex, toIndex } = action.payload
      const newPrayers = [...state.selectedPrayers]
      const [moved] = newPrayers.splice(fromIndex, 1)
      newPrayers.splice(toIndex, 0, moved)
      return {
        ...state,
        selectedPrayers: newPrayers,
        isDirty: true,
      }
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

    case 'SET_LIST_NAME':
      return {
        ...state,
        listName: action.payload,
        isDirty: true,
      }

    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      }

    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: action.payload,
      }

    case 'SET_LIST_ID':
      return {
        ...state,
        listId: action.payload,
      }

    case 'SET_LIST_STATUS':
      return {
        ...state,
        listStatus: action.payload,
        isDirty: true,
      }

    case 'SET_LIST_VISIBILITY':
      return {
        ...state,
        listVisibility: action.payload,
        isDirty: true,
      }

    default:
      return state
  }
}

// Create a context for sharing state
const DoaListStateContext = React.createContext<DoaListState>({
  listId: null,
  listName: '',
  listStatus: 'draft',
  listVisibility: 'private',
  isDirty: false,
  saveStatus: 'idle',
  selectedPrayers: [],
  availablePrayers: [],
  searchQuery: '',
  selectedCategory: 'All Categories',
  language: 'en',
  isGeneratingImage: false,
  showPreview: false,
  isPreviewLoading: false,
  previewSettings: DEFAULT_PREVIEW_SETTINGS,
  user: { isAuthenticated: false, username: undefined, userId: undefined },
  currentPage: 1,
  itemsPerPage: 10,
  mode: 'create',
})

const DoaListActionsContext = React.createContext<{
  updateState: (updates: Partial<DoaListState>) => void
  addPrayer: (prayer: DoaItem) => void
  removePrayer: (slug: string) => void
  reorderPrayers: (fromIndex: number, toIndex: number) => void
  generateImage: () => Promise<void>
  setCurrentPage: (page: number) => void
  resetToFirstPage: () => void
  handlePreview: () => void
  handleSave: (options?: { status?: ListStatus; visibility?: ListVisibility }) => Promise<void>
  setListName: (name: string) => void
}>({
  updateState: () => {},
  addPrayer: () => {},
  removePrayer: () => {},
  reorderPrayers: () => {},
  generateImage: async () => {},
  setCurrentPage: () => {},
  resetToFirstPage: () => {},
  handlePreview: () => {},
  handleSave: async () => {},
  setListName: () => {},
})

// Props for the builder
interface DoaListBuilderProps {
  mode: 'create' | 'edit'
  initialState: BuilderInitialState
  listLimitInfo?: ListLimitInfo
}

// Inner provider with access to notifications
function DoaListProviderWithNotifications({
  children,
  mode,
  initialState,
}: {
  children: React.ReactNode
  mode: 'create' | 'edit'
  initialState: BuilderInitialState
}) {
  const { data: session } = useSession()
  const { language } = useLanguage()
  const { prayers } = useDoaData()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  // Ref to prevent concurrent saves
  const isSavingRef = useRef(false)

  // Initialize state from props directly (NO useEffect for data initialization)
  const [state, dispatch] = useReducer(doaListReducer, {
    // From route loader
    listId: initialState.listId,
    listName: initialState.listName,
    listStatus: initialState.listStatus,
    listVisibility: initialState.listVisibility,
    selectedPrayers: initialState.selectedPrayers,
    previewSettings: {
      ...DEFAULT_PREVIEW_SETTINGS,
      showTranslations: initialState.previewSettings.showTranslations,
      translationLayout: initialState.previewSettings.translationLayout,
    },
    // Save state
    isDirty: false,
    saveStatus: 'idle',
    mode,
    // Local state
    searchQuery: '',
    selectedCategory: 'All Categories',
    language: language as 'en' | 'my',
    isGeneratingImage: false,
    showPreview: false,
    isPreviewLoading: false,
    user: {
      isAuthenticated: !!session?.user,
      username: session?.user?.name,
      userId: session?.user?.id,
    },
    availablePrayers: prayers,
    currentPage: 1,
    itemsPerPage: 10,
  })

  // Ref to always have access to current state in callbacks (avoids stale closure)
  const stateRef = useRef(state)
  stateRef.current = state

  // Wrap dispatch actions in callbacks for API compatibility
  const updateState = useCallback((updates: Partial<DoaListState>) => {
    dispatch({ type: 'UPDATE_STATE', payload: updates })
  }, [])

  const addPrayer = useCallback(
    (prayer: DoaItem) => {
      const currentState = state // Capture current state for limit check
      if (currentState.selectedPrayers.length >= 15) {
        addNotification('warning', 'Maximum 15 prayers allowed')
        return
      }
      dispatch({ type: 'ADD_PRAYER', payload: prayer })
    },
    [state.selectedPrayers.length, addNotification],
  )

  const removePrayer = useCallback((slug: string) => {
    dispatch({ type: 'REMOVE_PRAYER', payload: slug })
  }, [])

  const reorderPrayers = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_PRAYERS', payload: { fromIndex, toIndex } })
  }, [])

  const generateImage = useCallback(async () => {
    const validation = validateDoaList({
      title: state.listName,
      prayers: state.selectedPrayers,
    })

    if (!validation.isValid) {
      addNotification('error', validation.errors.join('\n'))
      return
    }

    dispatch({ type: 'SET_GENERATING', payload: true })

    try {
      const doaList: DoaList = {
        title: state.listName,
        description: '',
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

      const filename = `${state.listName.replace(/[^a-z0-9]/gi, '_')}.png`
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

  // Set list name
  const setListName = useCallback((name: string) => {
    dispatch({ type: 'SET_LIST_NAME', payload: name })
  }, [])

  // Handle save to database
  const handleSave = useCallback(
    async (options?: { status?: ListStatus; visibility?: ListVisibility }) => {
      // Prevent concurrent saves
      if (isSavingRef.current) {
        return
      }

      // Use ref to get current state (avoids stale closure)
      const currentState = stateRef.current

      const userId = session?.user?.id
      if (!userId) {
        addNotification('error', 'Please sign in to save your list.')
        return
      }

      if (currentState.selectedPrayers.length === 0) {
        addNotification('warning', 'Please add at least one prayer to save.')
        return
      }

      if (!currentState.listName.trim()) {
        addNotification('warning', 'Please enter a name for your list.')
        return
      }

      isSavingRef.current = true
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' })

      try {
        const prayers: PrayerReference[] = currentState.selectedPrayers.map(
          (p, index) => ({
            slug: p.slug,
            order: index,
          }),
        )

        if (currentState.listId) {
          // Update existing list
          await updateDoaList({
            data: {
              listId: currentState.listId,
              userId,
              input: {
                name: currentState.listName,
                prayers,
                showTranslations: currentState.previewSettings.showTranslations,
                translationLayout: currentState.previewSettings.translationLayout,
                language: currentState.language,
                status: options?.status ?? currentState.listStatus,
                visibility: options?.visibility ?? currentState.listVisibility,
              },
            },
          })

          dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' })
          dispatch({ type: 'SET_DIRTY', payload: false })
          if (options?.status) {
            dispatch({ type: 'SET_LIST_STATUS', payload: options.status })
            dispatch({ type: 'SET_DIRTY', payload: false }) // Reset dirty after status change
          }
          if (options?.visibility) {
            dispatch({ type: 'SET_LIST_VISIBILITY', payload: options.visibility })
            dispatch({ type: 'SET_DIRTY', payload: false }) // Reset dirty after visibility change
          }
          addNotification('success', 'List saved successfully!')
        } else {
          // Create new list
          const result = await createDoaList({
            data: {
              userId,
              input: {
                name: currentState.listName,
                prayers,
                showTranslations: currentState.previewSettings.showTranslations,
                translationLayout: currentState.previewSettings.translationLayout,
                language: currentState.language,
                status: options?.status ?? 'draft',
                visibility: options?.visibility ?? 'private',
              },
            },
          })

          if (!result.success) {
            if (result.error.code === 'LIST_LIMIT_REACHED') {
              addNotification('error', result.error.message)
              dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' })
              return
            }
            throw new Error(result.error.message)
          }

          // Set the new list ID for subsequent saves
          dispatch({ type: 'SET_LIST_ID', payload: result.list.id })
          dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' })
          dispatch({ type: 'SET_DIRTY', payload: false })
          addNotification('success', 'List created successfully!')

          // Navigate to dashboard after first save
          navigate({ to: '/dashboard' })
        }
      } catch (error) {
        console.error('Save error:', error)
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' })
        addNotification('error', 'Failed to save list. Please try again.')
      } finally {
        isSavingRef.current = false
      }
    },
    [session?.user?.id, addNotification, navigate],
  )

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
      dispatch({
        type: 'UPDATE_STATE',
        payload: { language: language as 'en' | 'my' },
      })
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
  }, [
    state.user.username,
    state.previewSettings.attribution.username,
    state.previewSettings,
  ])

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
          handleSave,
          setListName,
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

export function DoaListBuilder({ mode, initialState, listLimitInfo }: DoaListBuilderProps) {
  return (
    <NotificationProvider>
      <DoaListProviderWithNotifications mode={mode} initialState={initialState}>
        <DoaListBuilderContent listLimitInfo={listLimitInfo} />
      </DoaListProviderWithNotifications>
    </NotificationProvider>
  )
}

function DoaListBuilderContent({ listLimitInfo }: { listLimitInfo?: ListLimitInfo }) {
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
    listName,
    isDirty,
    saveStatus,
    listId,
  } = useDoaListState()

  // Check if user can save: edit mode always allowed, create mode only if within limit
  const isNewList = !listId
  const canSave = !isNewList || (listLimitInfo?.canCreate ?? true)

  const {
    updateState,
    generateImage,
    setCurrentPage,
    resetToFirstPage,
    handlePreview,
    handleSave,
    setListName,
  } = useDoaListActions()

  const navigate = useNavigate()

  // useBlocker for unsaved changes
  const blocker = useBlocker({
    condition: isDirty && saveStatus !== 'saving',
  })

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
    const allCategories = availablePrayers.flatMap((p) => p.categoryNames || [])
    return ['All Categories', ...Array.from(new Set(allCategories))].sort()
  }, [availablePrayers])

  // Handle export
  const handleExport = useCallback(async () => {
    await generateImage()
  }, [generateImage])

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Page Header */}
      <div className="bg-background/95 backdrop-blur pt-8 supports-backdrop-filter:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col sm:hidden gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/dashboard' })}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Input
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="List name..."
                className="text-lg font-bold border-0 border-b border-transparent hover:border-border focus:border-primary bg-transparent px-1 h-auto py-1 flex-1"
              />
              <div className="text-sm text-muted-foreground font-medium shrink-0">
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
                <Eye className="w-4 h-4 mr-1" />
                <span className="text-xs">Preview</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={selectedPrayers.length === 0 || isGeneratingImage}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-1" />
                <span className="text-xs">Export</span>
              </Button>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      size="sm"
                      onClick={() => handleSave()}
                      disabled={!canSave || saveStatus === 'saving' || (!isDirty && saveStatus === 'saved')}
                      className="flex-1"
                    />
                  }
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      <span className="text-xs">Saving</span>
                    </>
                  ) : saveStatus === 'saved' && !isDirty ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      <span className="text-xs">Save</span>
                    </>
                  )}
                </TooltipTrigger>
                {!canSave && (
                  <TooltipContent>
                    List limit reached. Invite friends to unlock more slots.
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* Tablet & Desktop Layout - Side by side */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/dashboard' })}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <Input
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name..."
                  className="text-xl md:text-2xl font-bold border-0 border-b border-transparent hover:border-border focus:border-primary bg-transparent px-0 h-auto py-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPrayers.length} of 15 prayers selected
                  {isDirty && <span className="ml-2 text-primary">• Unsaved changes</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={selectedPrayers.length === 0 || isPreviewLoading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={selectedPrayers.length === 0 || isGeneratingImage}
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingImage ? 'Generating...' : 'Export'}
              </Button>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      onClick={() => handleSave()}
                      disabled={!canSave || saveStatus === 'saving' || (!isDirty && saveStatus === 'saved')}
                    />
                  }
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus === 'saved' && !isDirty ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </TooltipTrigger>
                {!canSave && (
                  <TooltipContent>
                    List limit reached. Invite friends to unlock more slots.
                  </TooltipContent>
                )}
              </Tooltip>
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

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={blocker.status === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your
              changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
