import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LANDING_CONTENT } from '@/lib/constants'

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Animated Blobs */}
      <div className="blob bg-teal-200/40 w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-teal-900/30"></div>
      <div className="blob bg-emerald-200/40 w-96 h-96 rounded-full bottom-0 -right-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-emerald-900/30"></div>
      <div className="absolute inset-0 hero-pattern"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-medium text-foreground tracking-tight leading-[1.1] mb-6">
          <span className="text-gradient font-display font-semibold italic">
            {LANDING_CONTENT.hero.subtitle}
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
          {LANDING_CONTENT.hero.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none sm:mx-0">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 min-h-14 justify-center"
          >
            {LANDING_CONTENT.hero.primaryCTA}
            <ArrowRight className="w-5 h-5 shrink-0" />
          </Button>
          <a href="/doa" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 min-h-14 justify-center"
              variant="outline"
            >
              {LANDING_CONTENT.hero.secondaryCTA}
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
