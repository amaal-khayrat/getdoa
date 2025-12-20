// Base types from doa.json
export interface DoaItem {
  slug: string
  name_my: string
  name_en: string
  content: string // Arabic text
  meaning_my: string
  meaning_en: string
  reference_my: string
  reference_en: string
  category_names: Array<string>
  description_my?: string
  description_en?: string
  context_my?: string
  context_en?: string
}

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
