import { ShoppingBag } from 'lucide-react'
import { ShopeeReferralCard } from './shopee-referral-card'
import { ShopeeReferralsSkeleton } from './shopee-referrals-skeleton'
import { ShopeeReferralsError } from './shopee-referrals-error'
import type { ShopeeOgData } from '@/types/shopee.types'
import { useLanguage } from '@/contexts/language-context'

export interface ShopeeReferralItem {
  url: string
  ogData?: ShopeeOgData
}

interface ShopeeReferralsSectionProps {
  referrals?: ShopeeReferralItem[]
  isLoading?: boolean
  error?: Error
  onRetry?: () => void
}

export function ShopeeReferralsSection({
  referrals = [],
  isLoading = false,
  error,
  onRetry,
}: ShopeeReferralsSectionProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: 'Shop & Support Us',
      loading: 'Loading products...',
      partialSuccess: '{successful} of {total} products loaded',
    },
    my: {
      title: 'Belian & Sokong Kami',
      loading: 'Memuatkan produk...',
      partialSuccess: '{successful} daripada {total} produk dimuatkan',
    },
  }

  const t = translations[language]

  // Loading state
  if (isLoading) {
    return <ShopeeReferralsSkeleton />
  }

  // Error state
  if (error) {
    return <ShopeeReferralsError error={error} onRetry={onRetry} />
  }

  // Empty state - no referrals at all
  if (!referrals || referrals.length === 0) {
    return null
  }

  // Calculate partial success
  const successfulCount = referrals.filter((r) => r.ogData?.image).length
  const showPartialSuccess =
    successfulCount > 0 && successfulCount < referrals.length

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-semibold text-foreground">{t.title}</h3>
        </div>
        {showPartialSuccess && (
          <span className="text-xs text-muted-foreground">
            {t.partialSuccess
              .replace('{successful}', String(successfulCount))
              .replace('{total}', String(referrals.length))}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {referrals.map((item, index) => (
          <ShopeeReferralCard
            key={item.url}
            url={item.url}
            ogData={item.ogData}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  )
}
