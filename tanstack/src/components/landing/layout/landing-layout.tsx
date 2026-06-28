import { FooterSection } from '../sections/footer-section'
import type { ReactNode } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { LanguageProvider } from '@/contexts/language-context'

interface LandingLayoutProps {
  children: ReactNode
  navbarVariant?: 'landing' | 'doa'
  bgClassName?: string
}

export function LandingLayout({
  children,
  navbarVariant = 'landing',
  bgClassName = 'bg-background',
}: LandingLayoutProps) {
  return (
    <LanguageProvider>
      <div className={`min-h-screen ${bgClassName} text-foreground flex flex-col`}>
        <Navbar variant={navbarVariant} />
        <main className="flex-1 pt-16">{children}</main>
        <FooterSection />
      </div>
    </LanguageProvider>
  )
}
