export type DisplayPreference = 'full' | 'censored' | 'anonymous'

/**
 * Censor a name or email for public display.
 *
 * Examples:
 * - "john@gmail.com" -> "j***"
 * - "John Doe" -> "J*** D**"
 * - "Alice" -> "A***"
 */
export function censorName(name: string | null, preference: DisplayPreference): string {
  if (!name) return 'Anonymous'

  switch (preference) {
    case 'full':
      return name

    case 'anonymous':
      return 'Anonymous'

    case 'censored':
    default:
      return censorString(name)
  }
}

/**
 * Internal censoring logic.
 * Shows first letter of each word, rest as asterisks.
 */
function censorString(str: string): string {
  // Handle email format
  if (str.includes('@')) {
    const [local] = str.split('@')
    if (local.length <= 1) return `${local}***`
    return `${local[0]}***`
  }

  // Handle regular name (possibly multi-word)
  const words = str.trim().split(/\s+/)

  return words
    .map((word) => {
      if (word.length <= 1) return word
      const firstChar = word[0]
      const stars = '*'.repeat(Math.min(word.length - 1, 3)) // Max 3 stars
      return `${firstChar}${stars}`
    })
    .join(' ')
}

/**
 * Get display name based on preference.
 * Uses user's name, falls back to email if no name.
 */
export function getDisplayName(
  user: { name: string | null; email: string },
  preference: DisplayPreference
): string {
  if (preference === 'anonymous') return 'Anonymous'

  const nameToUse = user.name || user.email
  return censorName(nameToUse, preference)
}
