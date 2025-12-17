import { createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'
import { AboutPage } from '@/components/pages/about-page'

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({
    title: 'About GetDoa - Our Journey of Digital Spirituality',
    meta: [
      {
        name: 'description',
        content:
          "Learn about GetDoa's mission to make Islamic supplications accessible through technology. A product of Ellzaf Empire, dedicated to enriching spiritual lives.",
      },
    ],
  }),
})

function About() {
  return (
    <LandingLayout>
      <AboutPage />
    </LandingLayout>
  )
}
