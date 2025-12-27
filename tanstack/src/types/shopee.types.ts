// OG metadata fetched from Shopee product pages
export interface ShopeeOgData {
  title: string
  image: string
  price: string
  originalPrice?: string
  location?: string
}

// Internal representation of a referral item with state
export interface ShopeeReferralItem {
  url: string
  retryCount: number
}

// Discriminated union for referral fetch states
export type ShopeeReferralState =
  | { status: 'loading'; url: string }
  | { status: 'success'; url: string; ogData: ShopeeOgData }
  | { status: 'error'; url: string; error: Error }

// API response from /api/shopee-referrals
export interface ShopeeReferralsApiResponse {
  items: Array<{
    url: string
    ogData?: ShopeeOgData
  }>
  summary: {
    total: number
    successful: number
    failed: number
  }
}

// Props for ShopeeReferralsSection component
export interface ShopeeReferralsSectionProps {
  referrals: Array<{
    url: string
    ogData?: ShopeeOgData
  }>
  isLoading?: boolean
  error?: Error
  onRetry?: () => void
}

// Props for ShopeeReferralCard component
export interface ShopeeReferralCardProps {
  url: string
  ogData?: ShopeeOgData
  isLoading?: boolean
  priority?: boolean
}
