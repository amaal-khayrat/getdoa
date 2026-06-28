import { Outlet, createFileRoute } from '@tanstack/react-router'
import { LandingLayout } from '@/components/landing/layout/landing-layout'

export const Route = createFileRoute('/doa')({
  component: DoaLayout,
  head: () => ({
    title: 'Doa - GetDoa',
    meta: [
      {
        name: 'description',
        content:
          'Explore our comprehensive collection of authentic Islamic prayers and supplications with translations and references.',
      },
    ],
  }),
})

function DoaLayout() {
  return (
    <LandingLayout navbarVariant="doa" bgClassName="bg-page-gradient">
      <Outlet />
    </LandingLayout>
  )
}
