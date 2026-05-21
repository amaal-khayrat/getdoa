/**
 * Image customization types.
 */

export type ArabicFont = 'simpo' | 'amiri' | 'scheherazade' | 'noto-naskh'

export const ARABIC_FONTS: Record<
  ArabicFont,
  { name: string; displayName: string }
> = {
  simpo: { name: 'Simpo', displayName: 'Simpo (Default)' },
  amiri: { name: 'Amiri', displayName: 'Amiri' },
  scheherazade: { name: 'Scheherazade New', displayName: 'Scheherazade' },
  'noto-naskh': { name: 'Noto Naskh Arabic', displayName: 'Noto Naskh' },
}

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

export type PatternCategory =
  | 'islamic-geometric'
  | 'architectural'
  | 'organic'
  | 'abstract'
  | 'minimalist'

export type PatternId =
  | 'eight-point-star'
  | 'diamond-lattice'
  | 'hexagonal-tessellation'
  | 'interlocking-squares'
  | 'mihrab-arch'
  | 'mosque-dome'
  | 'minarets'
  | 'arabesque-border'
  | 'crescent-moon'
  | 'vine-border'
  | 'floral-corners'
  | 'olive-branches'
  | 'wavy-lines'
  | 'dotted-border'
  | 'gradient-halo'
  | 'geometric-rays'
  | 'corner-brackets'
  | 'double-line-frame'
  | 'simple-border'
  | 'elegant-divider'

export interface PatternInfo {
  id: PatternId
  name: string
  category: PatternCategory
}

export const PATTERNS: Array<PatternInfo> = [
  {
    id: 'eight-point-star',
    name: '8-Point Star',
    category: 'islamic-geometric',
  },
  {
    id: 'diamond-lattice',
    name: 'Diamond Lattice',
    category: 'islamic-geometric',
  },
  {
    id: 'hexagonal-tessellation',
    name: 'Hexagonal',
    category: 'islamic-geometric',
  },
  {
    id: 'interlocking-squares',
    name: 'Interlocking Squares',
    category: 'islamic-geometric',
  },
  { id: 'mihrab-arch', name: 'Mihrab Arch', category: 'architectural' },
  { id: 'mosque-dome', name: 'Mosque Dome', category: 'architectural' },
  { id: 'minarets', name: 'Minarets', category: 'architectural' },
  {
    id: 'arabesque-border',
    name: 'Arabesque Border',
    category: 'architectural',
  },
  { id: 'crescent-moon', name: 'Crescent Moon', category: 'organic' },
  { id: 'vine-border', name: 'Vine Border', category: 'organic' },
  { id: 'floral-corners', name: 'Floral Corners', category: 'organic' },
  { id: 'olive-branches', name: 'Olive Branches', category: 'organic' },
  { id: 'wavy-lines', name: 'Wavy Lines', category: 'abstract' },
  { id: 'dotted-border', name: 'Dotted Border', category: 'abstract' },
  { id: 'gradient-halo', name: 'Gradient Halo', category: 'abstract' },
  { id: 'geometric-rays', name: 'Geometric Rays', category: 'abstract' },
  { id: 'corner-brackets', name: 'Corner Brackets', category: 'minimalist' },
  {
    id: 'double-line-frame',
    name: 'Double Line Frame',
    category: 'minimalist',
  },
  { id: 'simple-border', name: 'Simple Border', category: 'minimalist' },
  { id: 'elegant-divider', name: 'Elegant Divider', category: 'minimalist' },
]

export function getPatternsByCategory(
  category: PatternCategory,
): Array<PatternInfo> {
  return PATTERNS.filter((pattern) => pattern.category === category)
}

export interface ImageExportSettings {
  backgroundColor: string
  textColor: string
  translationColor: string
  arabicFont: ArabicFont
  translationFont: TranslationFont
  customWatermark?: string
  hideBranding: boolean
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
