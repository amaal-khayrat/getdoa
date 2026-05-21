import type {
  ArabicFont,
  PatternId,
  TranslationFont,
} from '@/types/image-customization.types'
import { PATTERNS } from '@/types/image-customization.types'

export function validateFont(
  font: ArabicFont | TranslationFont,
  type: 'arabic' | 'translation',
): boolean {
  void type
  return Boolean(font)
}

export function validateColors(colors: {
  backgroundColor?: string
  textColor?: string
  translationColor?: string
}): boolean {
  const values = [
    colors.backgroundColor,
    colors.textColor,
    colors.translationColor,
  ].filter(Boolean)

  return values.every(
    (value) => typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value),
  )
}

export function sanitizeWatermark(text: string): string {
  const noHtml = text.replace(/<[^>]*>/g, '')
  const sanitized = noHtml.replace(/[^\w\s\-_.@#]/g, '').trim()
  return sanitized.slice(0, 50)
}

export function validateBranding(options: {
  hideBranding?: boolean
  customWatermark?: string
}): { valid: boolean; sanitizedWatermark?: string } {
  void options.hideBranding

  if (options.customWatermark) {
    const sanitized = sanitizeWatermark(options.customWatermark)
    if (sanitized.length === 0) {
      return { valid: false }
    }
    return { valid: true, sanitizedWatermark: sanitized }
  }

  return { valid: true }
}

export function validatePattern(patternId: PatternId | undefined): boolean {
  if (!patternId) return true
  return PATTERNS.some((pattern) => pattern.id === patternId)
}

export function validateExportSettings(settings: {
  arabicFont?: ArabicFont
  translationFont?: TranslationFont
  backgroundColor?: string
  textColor?: string
  translationColor?: string
  hideBranding?: boolean
  customWatermark?: string
  pattern?: PatternId
}): {
  valid: boolean
  errors: Array<string>
  sanitizedSettings?: typeof settings
} {
  const errors: Array<string> = []
  const sanitizedSettings = { ...settings }

  if (settings.arabicFont && !validateFont(settings.arabicFont, 'arabic')) {
    errors.push('Invalid Arabic font')
  }

  if (
    settings.translationFont &&
    !validateFont(settings.translationFont, 'translation')
  ) {
    errors.push('Invalid translation font')
  }

  if (!validateColors(settings)) {
    errors.push('Invalid custom colors')
  }

  const brandingResult = validateBranding(settings)
  if (!brandingResult.valid) {
    errors.push('Invalid branding options')
  } else if (brandingResult.sanitizedWatermark) {
    sanitizedSettings.customWatermark = brandingResult.sanitizedWatermark
  }

  if (!validatePattern(settings.pattern)) {
    errors.push('Invalid decorative pattern')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedSettings: errors.length === 0 ? sanitizedSettings : undefined,
  }
}
