import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { TermsPage } from '@/components/pages/terms-page'

export const Route = createFileRoute('/terms')({
  component: Terms,
  head: () => ({
    title: 'Terms of Service - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          "Read GetDoa's terms of service to understand your rights and responsibilities when using our Islamic prayer and supplication platform.",
      },
    ],
  }),
})

function Terms() {
  return (
    <LandingLayout>
      <TermsPage />
    </LandingLayout>
  )
}
