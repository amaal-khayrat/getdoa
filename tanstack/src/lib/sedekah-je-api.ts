// API Types for Sedekah.je
export interface SedekahJeResponse {
  id: number
  name: string
  category: 'mosque' | 'other'
  state: string
  city: string
  qrImage: string
  qrContent: string
  supportedPayment: Array<string>
  coords: [number, number]
}

// Cache interface for storing API responses
interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Simple in-memory cache with TTL
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly ttl = 5 * 60 * 1000 // 5 minutes in milliseconds

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }
}

const apiCache = new ApiCache()

// API configuration
const API_CONFIG = {
  BASE_URL: 'https://sedekah.je',
  ENDPOINTS: {
    RANDOM_MOSQUE: '/api/random',
  },
  TIMEOUT: 10000, // 10 seconds
} as const

// Error types for better error handling
export class SedekahJeApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'SedekahJeApiError'
  }
}

// Fetch wrapper with timeout and error handling
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GetDoa/1.0',
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new SedekahJeApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        'HTTP_ERROR',
      )
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof SedekahJeApiError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new SedekahJeApiError('Request timeout', undefined, 'TIMEOUT')
      }
      throw new SedekahJeApiError(
        `Network error: ${error.message}`,
        undefined,
        'NETWORK_ERROR',
      )
    }

    throw new SedekahJeApiError(
      'Unknown error occurred',
      undefined,
      'UNKNOWN_ERROR',
    )
  }
}

// Response validation
function validateSedekahJeResponse(data: unknown): SedekahJeResponse {
  if (!data || typeof data !== 'object') {
    throw new SedekahJeApiError(
      'Invalid response: Expected object',
      undefined,
      'VALIDATION_ERROR',
    )
  }

  const obj = data as Record<string, unknown>

  // Required fields validation
  const requiredFields = [
    'id',
    'name',
    'category',
    'state',
    'city',
    'qrContent',
    'supportedPayment',
    'coords',
  ]
  for (const field of requiredFields) {
    if (!(field in obj)) {
      throw new SedekahJeApiError(
        `Invalid response: Missing required field '${field}'`,
        undefined,
        'VALIDATION_ERROR',
      )
    }
  }

  // Type validation
  if (typeof obj.id !== 'number') {
    throw new SedekahJeApiError(
      'Invalid response: id must be a number',
      undefined,
      'VALIDATION_ERROR',
    )
  }

  if (typeof obj.name !== 'string') {
    throw new SedekahJeApiError(
      'Invalid response: name must be a string',
      undefined,
      'VALIDATION_ERROR',
    )
  }

  if (typeof obj.qrContent !== 'string') {
    throw new SedekahJeApiError(
      'Invalid response: qrContent must be a string',
      undefined,
      'VALIDATION_ERROR',
    )
  }

  if (!Array.isArray(obj.supportedPayment)) {
    throw new SedekahJeApiError(
      'Invalid response: supportedPayment must be an array',
      undefined,
      'VALIDATION_ERROR',
    )
  }

  return data as SedekahJeResponse
}

// API functions
export async function getRandomMosque(): Promise<SedekahJeResponse> {
  const cacheKey = 'random-mosque'
  const cachedData = apiCache.get<SedekahJeResponse>(cacheKey)

  if (cachedData) {
    return cachedData
  }

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RANDOM_MOSQUE}`
    const response = await fetchWithTimeout(url)
    const data = await response.json()
    const validatedData = validateSedekahJeResponse(data)

    // Cache the valid response
    apiCache.set(cacheKey, validatedData)

    return validatedData
  } catch (error) {
    if (error instanceof SedekahJeApiError) {
      throw error
    }
    throw new SedekahJeApiError(
      'Failed to fetch random mosque data',
      undefined,
      'FETCH_ERROR',
    )
  }
}

// Utility function to check if QR content is valid
export function isValidQrContent(qrContent: string): boolean {
  // Basic validation - QR content should not be empty and should be a reasonable length
  return (
    typeof qrContent === 'string' &&
    qrContent.trim().length > 0 &&
    qrContent.length <= 1000
  )
}

// Utility function to get payment method display name
export function getPaymentMethodDisplayName(method: string): string {
  const displayNames: Record<string, string> = {
    duitnow: 'DuitNow',
    tng: "Touch 'n Go",
    boost: 'Boost',
    grabpay: 'GrabPay',
  }
  return displayNames[method.toLowerCase()] || method
}
