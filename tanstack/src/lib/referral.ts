// Characters that are unambiguous (no I, O, 0, 1 to avoid confusion)
const REFERRAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const REFERRAL_CODE_LENGTH = 6

/**
 * Generate a short, readable referral code using crypto for better randomness.
 * Format: 6 alphanumeric characters (uppercase + numbers)
 * Example: "A3B7X9"
 */
export function generateReferralCode(): string {
  // Use crypto.getRandomValues for better randomness in production
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(REFERRAL_CODE_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array)
      .map((byte) => REFERRAL_CHARS[byte % REFERRAL_CHARS.length])
      .join('')
  }

  // Fallback for environments without crypto
  let code = ''
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += REFERRAL_CHARS.charAt(Math.floor(Math.random() * REFERRAL_CHARS.length))
  }
  return code
}

/**
 * Validate a referral code format.
 * Only allows characters from our defined charset.
 */
export function isValidReferralCodeFormat(code: string): boolean {
  if (!code || code.length !== REFERRAL_CODE_LENGTH) return false
  const validChars = new Set(REFERRAL_CHARS)
  return code.toUpperCase().split('').every((char) => validChars.has(char))
}
