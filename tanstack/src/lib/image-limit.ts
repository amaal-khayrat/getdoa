/**
 * Configuration for doa image generation limits.
 */
export const IMAGE_LIMIT_CONFIG = {
  /** Daily limit for free users */
  DAILY_LIMIT: 1,

  /** Timezone for daily reset (Malaysia Time) */
  TIMEZONE: 'Asia/Kuala_Lumpur', // GMT+8

  /** Future: Premium user daily limit */
  PREMIUM_DAILY_LIMIT: 10,
} as const

/**
 * Image generation limit info for UI display.
 */
export interface ImageLimitInfo {
  /** Number of generations used today */
  usedToday: number

  /** Maximum allowed per day */
  dailyLimit: number

  /** Remaining generations today */
  remaining: number

  /** Whether user can generate now */
  canGenerate: boolean

  /** Time until reset (ISO string) */
  resetAt: string

  /** Milliseconds until reset */
  msUntilReset: number

  /** Last generation timestamp (if any) */
  lastGeneratedAt: string | null

  /** Total lifetime generations */
  totalGenerations: number
}

/**
 * Get the start of "today" in Malaysia timezone (GMT+8).
 * Returns a UTC Date object representing midnight Malaysia time.
 */
export function getMalaysiaMidnightUtc(date: Date = new Date()): Date {
  // Format the date in Malaysia timezone to get the date parts
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IMAGE_LIMIT_CONFIG.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(date)
  const year = parseInt(parts.find((p) => p.type === 'year')!.value)
  const month = parseInt(parts.find((p) => p.type === 'month')!.value) - 1
  const day = parseInt(parts.find((p) => p.type === 'day')!.value)

  // Create a date at midnight Malaysia time, then convert to UTC
  // Malaysia is UTC+8, so midnight Malaysia = 16:00 UTC previous day
  const midnightMalaysia = new Date(Date.UTC(year, month, day, -8, 0, 0, 0))

  return midnightMalaysia
}

/**
 * Calculate when the daily limit resets.
 * Resets at midnight Malaysia time (GMT+8).
 */
export function getNextResetTime(): Date {
  const now = new Date()
  const todayMidnight = getMalaysiaMidnightUtc(now)

  // If we're past today's midnight, next reset is tomorrow's midnight
  if (now >= todayMidnight) {
    return new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000)
  }

  return todayMidnight
}

/**
 * Check if a timestamp is from "today" (Malaysia timezone).
 */
export function isToday(timestamp: Date | null): boolean {
  if (!timestamp) return false

  const todayMidnight = getMalaysiaMidnightUtc()
  const tomorrowMidnight = new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000)

  return timestamp >= todayMidnight && timestamp < tomorrowMidnight
}

/**
 * Calculate image limit info from database record.
 */
export function calculateImageLimitInfo(
  generationsToday: number,
  lastGeneratedAt: Date | null,
  totalGenerations: number,
): ImageLimitInfo {
  const { DAILY_LIMIT } = IMAGE_LIMIT_CONFIG

  // Reset count if last generation was not today
  const actualUsedToday = isToday(lastGeneratedAt) ? generationsToday : 0
  const remaining = Math.max(0, DAILY_LIMIT - actualUsedToday)
  const resetAt = getNextResetTime()

  return {
    usedToday: actualUsedToday,
    dailyLimit: DAILY_LIMIT,
    remaining,
    canGenerate: remaining > 0,
    resetAt: resetAt.toISOString(),
    msUntilReset: Math.max(0, resetAt.getTime() - Date.now()),
    lastGeneratedAt: lastGeneratedAt?.toISOString() ?? null,
    totalGenerations,
  }
}
