/**
 * Admin authorization utilities.
 *
 * Admin status is determined by matching the user's email against
 * a comma-separated list of admin emails in the ADMIN_EMAILS env variable.
 *
 * NOTE: All functions in this module are server-side only.
 * Environment variables are not exposed to the client.
 */

/**
 * Get list of admin emails from environment variable.
 * Returns empty array if not configured.
 */
export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS
  if (!adminEmailsEnv) return []

  return adminEmailsEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0)
}

/**
 * Check if an email belongs to an admin.
 * Case-insensitive comparison.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false

  const adminEmails = getAdminEmails()
  return adminEmails.includes(email.toLowerCase())
}

/**
 * Throw if user is not an admin.
 * For use in server functions.
 */
export function requireAdmin(email: string | null | undefined): void {
  if (!isAdminEmail(email)) {
    throw new Error('Unauthorized: Admin access required')
  }
}
