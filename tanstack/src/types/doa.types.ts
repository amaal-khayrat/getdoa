import type { InferSelectModel } from 'drizzle-orm'
import { z } from 'zod'
import type { doa } from '@/db/schema'

// ============================================
// DATABASE TYPES
// ============================================

// Database model type - inferred from Drizzle schema
export type Doa = InferSelectModel<typeof doa>

// Alias for backward compatibility with existing code
export type DoaItem = Doa

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

// Pagination defaults and limits
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100, // Prevent excessive queries
} as const

export const getAllDoasSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  page: z.number().int().positive().default(PAGINATION_DEFAULTS.page),
  limit: z
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.maxLimit)
    .default(PAGINATION_DEFAULTS.limit),
})

export const getDoaBySlugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
})

export const getDoasBySlugsSchema = z.object({
  slugs: z.array(z.string().min(1).max(255)).max(100), // Limit to 100 slugs per request
})

export const getRandomDoaSchema = z.object({
  category: z.string().max(100).optional(),
})

export type GetAllDoasInput = z.infer<typeof getAllDoasSchema>
export type GetDoaBySlugInput = z.infer<typeof getDoaBySlugSchema>
export type GetDoasBySlugsInput = z.infer<typeof getDoasBySlugsSchema>
export type GetRandomDoaInput = z.infer<typeof getRandomDoaSchema>

// Simplified DoaList for POC (no ID needed)
export interface DoaList {
  title: string
  description?: string
  prayers: Array<DoaItem>
  language: Language
  showTranslations: boolean
  translationLayout: TranslationLayout
  createdBy?: string // username from OAuth
  createdAt: Date
}

export type Language = 'en' | 'my'
export type TranslationLayout = 'grouped' | 'interleaved'

export interface PreviewSettings {
  showTranslations: boolean
  translationLayout: TranslationLayout
  attribution: AttributionSettings
  textColor: string
}

export interface AttributionSettings {
  showUsername: boolean
  username?: string
  showBranding: boolean
}

// Simple validation
export interface ValidationError {
  field: string
  message: string
}

// State interface for the doa list builder
export interface DoaListBuilderState {
  availablePrayers: Array<DoaItem>
  selectedPrayers: Array<DoaItem>
  title: string
  description: string
  searchQuery: string
  selectedCategory: string
  language: Language
  isGeneratingImage: boolean
  showPreview: boolean
  previewSettings: PreviewSettings
  user: {
    isAuthenticated: boolean
    username?: string
  }
}

// Default preview settings
export const DEFAULT_PREVIEW_SETTINGS: PreviewSettings = {
  showTranslations: true,
  translationLayout: 'grouped',
  attribution: {
    showUsername: true,
    showBranding: true,
  },
  textColor: '#000000',
}
