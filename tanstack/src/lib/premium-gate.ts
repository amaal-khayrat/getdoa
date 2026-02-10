import { db } from '@/db'
import { userSubscription, referral } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { hasPremiumAccess, type SubscriptionStatus } from './subscription'
import type { ArabicFont, TranslationFont, PatternId } from '@/types/premium.types'
import { PATTERNS } from '@/types/premium.types'

/**
 * Server-side premium feature validation.
 * All premium feature access MUST go through these functions.
 */

export interface PremiumStatus {
  isPremium: boolean
  referralCount: number
  imageLimit: number
}

/**
 * Get user's premium status and referral count.
 */
export async function getUserPremiumStatus(userId: string): Promise<PremiumStatus> {
  const [subscription, referralResult] = await Promise.all([
    db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
      columns: { status: true, isAdminGranted: true },
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(referral)
      .where(eq(referral.referrerId, userId)),
  ])

  const isAdminGranted = subscription?.isAdminGranted ?? false
  const isPremium = hasPremiumAccess(
    subscription?.status as SubscriptionStatus | null,
    isAdminGranted,
  )
  const referralCount = referralResult[0]?.count ?? 0

  // Calculate image limit
  let imageLimit: number
  if (isPremium) {
    imageLimit = 15
  } else {
    const referralBonus = Math.min(referralCount, 2)
    imageLimit = 1 + referralBonus // Base 1 + up to 2 from referrals = max 3
  }

  return { isPremium, referralCount, imageLimit }
}

/**
 * Validate font selection.
 * Non-premium users can only use default fonts.
 */
export function validateFont(
  font: ArabicFont | TranslationFont,
  isPremium: boolean,
  type: 'arabic' | 'translation',
): boolean {
  const defaultFonts = {
    arabic: 'simpo' as ArabicFont,
    translation: 'roboto' as TranslationFont,
  }

  if (!isPremium && font !== defaultFonts[type]) {
    return false
  }
  return true
}

/**
 * Validate color customization.
 * Non-premium users can only use default colors.
 */
export function validateColors(
  colors: { backgroundColor?: string; textColor?: string; translationColor?: string },
  isPremium: boolean,
): boolean {
  if (!isPremium) {
    const defaults = {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      translationColor: '#666666',
    }

    if (
      (colors.backgroundColor && colors.backgroundColor !== defaults.backgroundColor) ||
      (colors.textColor && colors.textColor !== defaults.textColor) ||
      (colors.translationColor && colors.translationColor !== defaults.translationColor)
    ) {
      return false
    }
  }
  return true
}

/**
 * Sanitize watermark text to prevent XSS and invalid characters.
 * Only allows alphanumeric, spaces, and common punctuation.
 */
export function sanitizeWatermark(text: string): string {
  // Remove any HTML tags
  const noHtml = text.replace(/<[^>]*>/g, '')
  // Only allow safe characters
  const sanitized = noHtml.replace(/[^\w\s\-_.@#]/g, '').trim()
  // Limit length
  return sanitized.slice(0, 50)
}

/**
 * Validate branding options.
 */
export function validateBranding(
  options: { hideBranding?: boolean; customWatermark?: string },
  isPremium: boolean,
): { valid: boolean; sanitizedWatermark?: string } {
  if (!isPremium) {
    if (options.hideBranding || options.customWatermark) {
      return { valid: false }
    }
  }

  // Validate and sanitize watermark
  if (options.customWatermark) {
    const sanitized = sanitizeWatermark(options.customWatermark)
    if (sanitized.length === 0) {
      return { valid: false }
    }
    return { valid: true, sanitizedWatermark: sanitized }
  }

  return { valid: true }
}

/**
 * Validate pattern selection.
 */
export function validatePattern(
  patternId: PatternId | undefined,
  isPremium: boolean,
): boolean {
  if (!patternId) return true

  const pattern = PATTERNS.find((p) => p.id === patternId)
  if (!pattern) return false

  if (pattern.isPremium && !isPremium) {
    return false
  }

  return true
}

/**
 * Comprehensive validation for all export settings.
 * Returns sanitized settings if valid.
 */
export function validateExportSettings(
  settings: {
    arabicFont?: ArabicFont
    translationFont?: TranslationFont
    backgroundColor?: string
    textColor?: string
    translationColor?: string
    hideBranding?: boolean
    customWatermark?: string
    pattern?: PatternId
  },
  isPremium: boolean,
): { valid: boolean; errors: string[]; sanitizedSettings?: typeof settings } {
  const errors: string[] = []
  const sanitizedSettings = { ...settings }

  if (settings.arabicFont && !validateFont(settings.arabicFont, isPremium, 'arabic')) {
    errors.push('Premium Arabic fonts require a subscription')
  }

  if (
    settings.translationFont &&
    !validateFont(settings.translationFont, isPremium, 'translation')
  ) {
    errors.push('Premium translation fonts require a subscription')
  }

  if (!validateColors(settings, isPremium)) {
    errors.push('Custom colors require a subscription')
  }

  const brandingResult = validateBranding(settings, isPremium)
  if (!brandingResult.valid) {
    errors.push('Custom branding options require a subscription')
  } else if (brandingResult.sanitizedWatermark) {
    sanitizedSettings.customWatermark = brandingResult.sanitizedWatermark
  }

  if (!validatePattern(settings.pattern, isPremium)) {
    errors.push('This decorative pattern requires a subscription')
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedSettings: errors.length === 0 ? sanitizedSettings : undefined,
  }
}
