import { HeroSection } from './sections/hero-section'
import { PrayerCarouselMotion } from './components/prayer-carousel-motion'
import { SpiritualGrowthSection } from './sections/spiritual-growth-section'
import { CTASection } from './sections/cta-section'
import { QRCodeSection } from './components/qr-code-section'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <PrayerCarouselMotion />
      <SpiritualGrowthSection />
      <QRCodeSection />
      <CTASection />
    </div>
  )
}
