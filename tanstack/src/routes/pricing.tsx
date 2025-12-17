import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { PricingPage } from '@/components/pages/pricing-page'

export const Route = createFileRoute('/pricing')({
  component: Pricing,
  head: () => ({
    title: 'Pricing Plans - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Choose the perfect GetDoa plan for your spiritual journey. From basic doa lists to premium features with custom backgrounds and fonts. Plans starting at RM4.99.',
      },
    ],
  }),
})

function Pricing() {
  return (
    <LandingLayout>
      <PricingPage />
    </LandingLayout>
  )
}
