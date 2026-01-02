import type { InferSelectModel } from 'drizzle-orm'
import type {
  doaList,
  doaListItem,
  savedDoa,
  favoriteList,
  exportLog,
} from '@/db/schema'
import type { Doa } from './doa.types'

// Infer types from Drizzle schema
export type DoaListRecord = InferSelectModel<typeof doaList>
export type DoaListItemRecord = InferSelectModel<typeof doaListItem>
export type SavedDoaRecord = InferSelectModel<typeof savedDoa>
export type FavoriteListRecord = InferSelectModel<typeof favoriteList>
export type ExportLogRecord = InferSelectModel<typeof exportLog>

// Status and visibility types
export type ListStatus = 'draft' | 'published'
export type ListVisibility = 'public' | 'private'

// Prayer reference for input (when creating/updating lists)
export interface PrayerReference {
  slug: string
  order: number
}

// List item with resolved doa data
export interface DoaListItemWithDoa extends DoaListItemRecord {
  doa: Doa
}

// Author privacy settings (from userProfile table)
export interface AuthorPrivacySettings {
  showAvatar: boolean
  showFullName: boolean
  displayName: string | null
}

// Extended list with user info (for public lists)
export interface DoaListWithUser extends DoaListRecord {
  user: {
    id: string
    name: string
    image: string | null
  }
  // Author's privacy settings - included when fetching for public display
  authorPrivacy?: AuthorPrivacySettings
}

// List with items (prayers) included
export interface DoaListWithItems extends DoaListRecord {
  items: DoaListItemWithDoa[]
}

// List with both user and items
export interface DoaListWithUserAndItems extends DoaListWithUser {
  items: DoaListItemWithDoa[]
}

// Create input
export interface CreateDoaListInput {
  name: string
  description?: string
  prayers?: PrayerReference[]
  showTranslations?: boolean
  translationLayout?: 'grouped' | 'interleaved'
  language?: 'en' | 'my'
  status?: ListStatus
  visibility?: ListVisibility
}

// Update input
export interface UpdateDoaListInput {
  name?: string
  description?: string
  prayers?: PrayerReference[]
  showTranslations?: boolean
  translationLayout?: 'grouped' | 'interleaved'
  language?: 'en' | 'my'
  status?: ListStatus
  visibility?: ListVisibility
}

// For onboarding - simple name collection
export interface OnboardingInput {
  listName: string
  templateId?: string // Optional quick-start template
}

// List template for onboarding
export interface ListTemplate {
  id: string
  name: string
  nameMs: string
  description: string
  descriptionMs: string
  icon: string
  doaSlugs: string[]
}

// ============================================
// CREATE DOA LIST RESULT TYPES
// ============================================

/** Error when list limit is reached */
export interface ListLimitReachedError {
  code: 'LIST_LIMIT_REACHED'
  message: string
  currentCount: number
  limit: number
  breakdown: {
    base: number
    referral: number
    purchase: number
    subscription: number
  }
}

/** Error for unauthorized access */
export interface UnauthorizedError {
  code: 'UNAUTHORIZED'
  message: string
}

/** All possible create list errors */
export type CreateDoaListError = ListLimitReachedError | UnauthorizedError

/** Discriminated union for create list result */
export type CreateDoaListResult =
  | { success: true; list: DoaListRecord }
  | { success: false; error: CreateDoaListError }
