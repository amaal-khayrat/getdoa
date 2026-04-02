import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { PricingPage } from '@/components/pages/pricing-page'
import {
  getSessionFromServer,
  checkPremiumAccess,
} from '@/server-functions/dashboard'

export const Route = createFileRoute('/pricing')({
  loader: async () => {
    // Get session (user may or may not be logged in)
    const session = await getSessionFromServer()

    if (!session?.user) {
      return { user: null, isPremium: false, isAdminGranted: false }
    }

    // Check premium status for logged-in users
    const premiumResult = await checkPremiumAccess({
      data: { userId: session.user.id },
    })

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      isPremium: premiumResult.isPremium,
      isAdminGranted: premiumResult.isAdminGranted,
    }
  },
  component: Pricing,
  head: () => ({
    title: 'Pricing Plans - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Choose the perfect GetDoa plan for your spiritual journey. From basic doa lists to premium features with custom backgrounds and fonts. Plans starting at RM9.90/month.',
      },
    ],
  }),
})

function Pricing() {
  const { user, isPremium, isAdminGranted } = Route.useLoaderData()

  return (
    <LandingLayout>
      <PricingPage
        userId={user?.id}
        isPremium={isPremium}
        isAdminGranted={isAdminGranted}
      />
    </LandingLayout>
  )
}
