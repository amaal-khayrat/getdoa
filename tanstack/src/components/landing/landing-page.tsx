import { HeroSection } from './sections/hero-section'
import { PrayerCarouselMotion } from './components/prayer-carousel-motion'
import { PublicFeaturesSection } from './sections/public-features-section'
import { EnhancedFeaturesSection } from './sections/enhanced-features-section'
import { CTASection } from './sections/cta-section'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <PrayerCarouselMotion />
      <PublicFeaturesSection />
      <EnhancedFeaturesSection />
      <CTASection />
    </div>
  )
}
