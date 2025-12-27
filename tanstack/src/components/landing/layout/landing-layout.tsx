import { FooterSection } from '../sections/footer-section'
import type { ReactNode } from 'react'
import { Navbar } from '@/components/ui/navbar'

interface LandingLayoutProps {
  children: ReactNode
  navbarVariant?: 'landing' | 'doa'
  navbarProps?: {
    onBackClick?: () => void
  }
}

export function LandingLayout({
  children,
  navbarVariant = 'landing',
  navbarProps,
}: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar variant={navbarVariant} {...navbarProps} />
      <main className="flex-1 pt-16 pb-16">{children}</main>
      <FooterSection />
    </div>
  )
}
