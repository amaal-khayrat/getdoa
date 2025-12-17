import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { RefundPage } from '@/components/pages/refund-page'

export const Route = createFileRoute('/refund')({
  component: Refund,
  head: () => ({
    title: 'Refund Policy - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          "GetDoa's refund policy: Full refund within 14 working days if you haven't used any paid features. Learn about our commitment to customer satisfaction.",
      },
    ],
  }),
})

function Refund() {
  return (
    <LandingLayout>
      <RefundPage />
    </LandingLayout>
  )
}
