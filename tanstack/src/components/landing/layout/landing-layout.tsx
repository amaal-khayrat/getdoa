import { Navigation } from '../components/navigation'
import { FooterSection } from '../sections/footer-section'
import type { ReactNode } from 'react'

interface LandingLayoutProps {
  children: ReactNode
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-grow pt-16">{children}</main>
      <FooterSection />
    </div>
  )
}
