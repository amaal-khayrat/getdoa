import { useCallback, useEffect, useState } from 'react'
import { ShopeeReferralsSection } from './shopee-referrals-section'
import type { ShopeeReferralItem } from './shopee-referrals-section'

interface ShopeeReferralsApiResponse {
  items?: Array<ShopeeReferralItem>
}

interface ShopeeReferralsClientSectionProps {
  count?: number
  enabled?: boolean
}

export function ShopeeReferralsClientSection({
  count = 4,
  enabled = true,
}: ShopeeReferralsClientSectionProps) {
  const [referrals, setReferrals] = useState<Array<ShopeeReferralItem>>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)

  const loadReferrals = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/shopee-referrals?count=${count}`, {
          signal,
        })

        if (!response.ok) {
          throw new Error('Failed to fetch shopee referrals')
        }

        const data = (await response.json()) as ShopeeReferralsApiResponse
        const items = Array.isArray(data.items) ? data.items : []
        const displayableItems = items.filter((item) => item.ogData?.image)

        if (displayableItems.length === 0) {
          throw new Error('No shopee referrals are available right now')
        }

        setReferrals(displayableItems)
      } catch (caught) {
        if (signal?.aborted) return
        setReferrals([])
        setError(caught instanceof Error ? caught : new Error('Unknown error'))
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [count],
  )

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      setReferrals([])
      setError(null)
      return
    }

    const controller = new AbortController()
    void loadReferrals(controller.signal)

    return () => controller.abort()
  }, [enabled, loadReferrals])

  if (!enabled) return null

  return (
    <ShopeeReferralsSection
      referrals={referrals}
      isLoading={isLoading}
      error={error ?? undefined}
      onRetry={() => void loadReferrals()}
    />
  )
}
