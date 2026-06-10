import { HeroSection } from './sections/hero-section'
import { PublicFeaturesSection } from './sections/public-features-section'
import { EnhancedFeaturesSection } from './sections/enhanced-features-section'
import { CTASection } from './sections/cta-section'

export function LandingPage() {
  return (
    <div className="min-h-screen text-foreground">
      <HeroSection />
      <PublicFeaturesSection />
      <EnhancedFeaturesSection />
      <CTASection />
    </div>
  )
}
