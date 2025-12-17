import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { LandingPage } from '@/components/landing/landing-page'

export const Route = createFileRoute('/')({
  component: App,
  head: () => ({
    title: 'GetDoa - Your Personalized Prayer Journey',
    meta: [
      {
        name: 'description',
        content:
          'Immerse yourself in a sanctuary of digital serenity. Access authentic Doa, curate your daily supplications, and connect with the divine through a beautifully crafted experience.',
      },
    ],
  }),
})

function App() {
  return (
    <LandingLayout>
      <LandingPage />
    </LandingLayout>
  )
}
