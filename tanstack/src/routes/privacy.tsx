import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { PrivacyPage } from '@/components/pages/privacy-page'

export const Route = createFileRoute('/privacy')({
  component: Privacy,
  head: () => ({
    title: 'Privacy Policy - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Learn how GetDoa protects your privacy and handles your data. Our commitment to keeping your personal information secure while providing spiritual services.',
      },
    ],
  }),
})

function Privacy() {
  return (
    <LandingLayout>
      <PrivacyPage />
    </LandingLayout>
  )
}
