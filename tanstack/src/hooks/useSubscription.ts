import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/lib/auth-client'

export type SubscriptionTier = 'free' | 'unlimited'

export interface SubscriptionData {
  id: string
  status: string
  planId: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  paidCount: number | null
  totalCount: number | null
}

export interface TierLimits {
  maxDoaLists: number
  customBackgrounds: boolean
  customFonts: boolean
  prioritySupport: boolean
}

export interface SubscriptionState {
  subscription: SubscriptionData | null
  tier: SubscriptionTier
  limits: TierLimits
  isLoading: boolean
  error: string | null
}

const DEFAULT_LIMITS: TierLimits = {
  maxDoaLists: 1,
  customBackgrounds: false,
  customFonts: false,
  prioritySupport: false,
}

export function useSubscription() {
  const { data: session } = useSession()
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    tier: 'free',
    limits: DEFAULT_LIMITS,
    isLoading: true,
    error: null,
  })

  const fetchSubscription = useCallback(async () => {
    if (!session?.user) {
      setState({
        subscription: null,
        tier: 'free',
        limits: DEFAULT_LIMITS,
        isLoading: false,
        error: null,
      })
      return
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/subscriptions/current')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription')
      }

      setState({
        subscription: data.subscription,
        tier: data.tier,
        limits: data.limits,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [session?.user])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const createSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      // Redirect to Razorpay checkout
      if (data.subscription?.shortUrl) {
        window.location.href = data.subscription.shortUrl
      }

      return data
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error')
    }
  }, [])

  const cancelSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      // Refresh subscription data
      await fetchSubscription()

      return data
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error')
    }
  }, [fetchSubscription])

  return {
    ...state,
    isSubscribed: state.tier === 'unlimited',
    isActive: ['authenticated', 'active'].includes(state.subscription?.status || ''),
    refetch: fetchSubscription,
    createSubscription,
    cancelSubscription,
  }
}
