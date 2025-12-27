import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SpaceWithDoa } from '@/types/space.types'

interface SpaceState {
  // Data
  spaces: SpaceWithDoa[]
  currentSpaceId: string | null
  isLoading: boolean
  isHydrated: boolean
  error: string | null

  // Actions
  setSpaces: (spaces: SpaceWithDoa[]) => void
  setCurrentSpaceId: (id: string | null) => void
  addSpace: (space: SpaceWithDoa) => void
  updateSpace: (id: string, updates: Partial<SpaceWithDoa>) => void
  removeSpace: (id: string) => void

  // Doa management within current space
  addDoaToCurrentSpace: (slug: string) => void
  removeDoaFromCurrentSpace: (slug: string) => void

  // Loading states
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setHydrated: (hydrated: boolean) => void

  // Reset
  reset: () => void
}

const initialState = {
  spaces: [],
  currentSpaceId: null,
  isLoading: false,
  isHydrated: false,
  error: null,
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSpaces: (spaces) => {
        const { currentSpaceId } = get()
        // If current space doesn't exist in new spaces, set to first one
        const spaceExists = spaces.some((s) => s.id === currentSpaceId)
        set({
          spaces,
          currentSpaceId: spaceExists
            ? currentSpaceId
            : (spaces[0]?.id ?? null),
        })
      },

      setCurrentSpaceId: (id) => set({ currentSpaceId: id }),

      addSpace: (space) =>
        set((state) => ({
          spaces: [space, ...state.spaces],
          // If this is the first space, set it as current
          currentSpaceId: state.currentSpaceId ?? space.id,
        })),

      updateSpace: (id, updates) =>
        set((state) => ({
          spaces: state.spaces.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),

      removeSpace: (id) =>
        set((state) => {
          const newSpaces = state.spaces.filter((s) => s.id !== id)
          return {
            spaces: newSpaces,
            currentSpaceId:
              state.currentSpaceId === id
                ? (newSpaces[0]?.id ?? null)
                : state.currentSpaceId,
          }
        }),

      addDoaToCurrentSpace: (slug) =>
        set((state) => {
          const { currentSpaceId, spaces } = state
          if (!currentSpaceId) return state

          return {
            spaces: spaces.map((s) =>
              s.id === currentSpaceId
                ? {
                    ...s,
                    doaItems: [
                      ...s.doaItems,
                      {
                        id: crypto.randomUUID(),
                        spaceId: currentSpaceId,
                        doaSlug: slug,
                        order: s.doaItems.length,
                        addedAt: new Date(),
                      },
                    ],
                  }
                : s,
            ),
          }
        }),

      removeDoaFromCurrentSpace: (slug) =>
        set((state) => {
          const { currentSpaceId, spaces } = state
          if (!currentSpaceId) return state

          return {
            spaces: spaces.map((s) =>
              s.id === currentSpaceId
                ? {
                    ...s,
                    doaItems: s.doaItems.filter((d) => d.doaSlug !== slug),
                  }
                : s,
            ),
          }
        }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      reset: () => set(initialState),
    }),
    {
      name: 'getdoa-space-storage',
      // Only persist the currentSpaceId, not the full spaces data
      partialize: (state) => ({ currentSpaceId: state.currentSpaceId }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)

// Selector hooks for common patterns
export const useCurrentSpace = () => {
  const spaces = useSpaceStore((state) => state.spaces)
  const currentSpaceId = useSpaceStore((state) => state.currentSpaceId)
  return spaces.find((s) => s.id === currentSpaceId) ?? null
}

export const useSpaceDoaSlugs = () => {
  const currentSpace = useCurrentSpace()
  return currentSpace?.doaItems.map((d) => d.doaSlug) ?? []
}
