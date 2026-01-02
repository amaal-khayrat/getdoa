import { FooterSection } from '../sections/footer-section'
import type { ReactNode } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { LanguageProvider } from '@/contexts/language-context'

interface LandingLayoutProps {
  children: ReactNode
  navbarVariant?: 'landing' | 'doa'
}

export function LandingLayout({
  children,
  navbarVariant = 'landing',
}: LandingLayoutProps) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar variant={navbarVariant} />
        <main className="flex-1 pt-16 pb-16">{children}</main>
        <FooterSection />
      </div>
    </LanguageProvider>
  )
}
