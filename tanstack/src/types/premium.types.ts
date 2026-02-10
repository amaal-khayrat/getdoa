/**
 * Premium feature types for image customization.
 */

// Available Arabic fonts
export type ArabicFont = 'simpo' | 'amiri' | 'scheherazade' | 'noto-naskh'

export const ARABIC_FONTS: Record<ArabicFont, { name: string; displayName: string }> = {
  simpo: { name: 'Simpo', displayName: 'Simpo (Default)' },
  amiri: { name: 'Amiri', displayName: 'Amiri' },
  scheherazade: { name: 'Scheherazade New', displayName: 'Scheherazade' },
  'noto-naskh': { name: 'Noto Naskh Arabic', displayName: 'Noto Naskh' },
}

// Available translation fonts
export type TranslationFont = 'roboto' | 'playfair' | 'lora' | 'noto-sans'

export const TRANSLATION_FONTS: Record<
  TranslationFont,
  { name: string; displayName: string }
> = {
  roboto: { name: 'Roboto', displayName: 'Roboto (Default)' },
  playfair: { name: 'Playfair Display', displayName: 'Playfair Display' },
  lora: { name: 'Lora', displayName: 'Lora' },
  'noto-sans': { name: 'Noto Sans', displayName: 'Noto Sans' },
}

// Decorative pattern categories and IDs
export type PatternCategory =
  | 'islamic-geometric'
  | 'architectural'
  | 'organic'
  | 'abstract'
  | 'minimalist'

export type PatternId =
  // Islamic Geometric (4 patterns)
  | 'eight-point-star'
  | 'diamond-lattice'
  | 'hexagonal-tessellation'
  | 'interlocking-squares'
  // Architectural (4 patterns)
  | 'mihrab-arch'
  | 'mosque-dome'
  | 'minarets'
  | 'arabesque-border'
  // Organic (4 patterns)
  | 'crescent-moon'
  | 'vine-border'
  | 'floral-corners'
  | 'olive-branches'
  // Abstract (4 patterns)
  | 'wavy-lines'
  | 'dotted-border'
  | 'gradient-halo'
  | 'geometric-rays'
  // Minimalist (4 patterns)
  | 'corner-brackets'
  | 'double-line-frame'
  | 'simple-border'
  | 'elegant-divider'

export interface PatternInfo {
  id: PatternId
  name: string
  category: PatternCategory
  isPremium: boolean
}

export const PATTERNS: PatternInfo[] = [
  // Islamic Geometric (4 patterns - 1 free, 3 premium)
  {
    id: 'eight-point-star',
    name: '8-Point Star',
    category: 'islamic-geometric',
    isPremium: false,
  },
  {
    id: 'diamond-lattice',
    name: 'Diamond Lattice',
    category: 'islamic-geometric',
    isPremium: true,
  },
  {
    id: 'hexagonal-tessellation',
    name: 'Hexagonal',
    category: 'islamic-geometric',
    isPremium: true,
  },
  {
    id: 'interlocking-squares',
    name: 'Interlocking Squares',
    category: 'islamic-geometric',
    isPremium: true,
  },
  // Architectural (4 patterns - all premium)
  { id: 'mihrab-arch', name: 'Mihrab Arch', category: 'architectural', isPremium: true },
  { id: 'mosque-dome', name: 'Mosque Dome', category: 'architectural', isPremium: true },
  { id: 'minarets', name: 'Minarets', category: 'architectural', isPremium: true },
  {
    id: 'arabesque-border',
    name: 'Arabesque Border',
    category: 'architectural',
    isPremium: true,
  },
  // Organic (4 patterns - 1 free, 3 premium)
  { id: 'crescent-moon', name: 'Crescent Moon', category: 'organic', isPremium: false },
  { id: 'vine-border', name: 'Vine Border', category: 'organic', isPremium: true },
  { id: 'floral-corners', name: 'Floral Corners', category: 'organic', isPremium: true },
  { id: 'olive-branches', name: 'Olive Branches', category: 'organic', isPremium: true },
  // Abstract (4 patterns - all premium)
  { id: 'wavy-lines', name: 'Wavy Lines', category: 'abstract', isPremium: true },
  { id: 'dotted-border', name: 'Dotted Border', category: 'abstract', isPremium: true },
  { id: 'gradient-halo', name: 'Gradient Halo', category: 'abstract', isPremium: true },
  { id: 'geometric-rays', name: 'Geometric Rays', category: 'abstract', isPremium: true },
  // Minimalist (4 patterns - 2 free, 2 premium)
  {
    id: 'corner-brackets',
    name: 'Corner Brackets',
    category: 'minimalist',
    isPremium: false,
  },
  {
    id: 'double-line-frame',
    name: 'Double Line Frame',
    category: 'minimalist',
    isPremium: false,
  },
  { id: 'simple-border', name: 'Simple Border', category: 'minimalist', isPremium: true },
  {
    id: 'elegant-divider',
    name: 'Elegant Divider',
    category: 'minimalist',
    isPremium: true,
  },
]

// Helper to get patterns by category
export function getPatternsByCategory(category: PatternCategory): PatternInfo[] {
  return PATTERNS.filter((p) => p.category === category)
}

// Helper to get free patterns only
export function getFreePatterns(): PatternInfo[] {
  return PATTERNS.filter((p) => !p.isPremium)
}

// Image export settings
export interface ImageExportSettings {
  // Colors
  backgroundColor: string
  textColor: string
  translationColor: string

  // Fonts
  arabicFont: ArabicFont
  translationFont: TranslationFont

  // Branding
  customWatermark?: string
  hideBranding: boolean

  // Pattern
  pattern?: PatternId
}

export const DEFAULT_EXPORT_SETTINGS: ImageExportSettings = {
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  translationColor: '#666666',
  arabicFont: 'simpo',
  translationFont: 'roboto',
  hideBranding: false,
}
