import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LANDING_CONTENT } from '@/lib/constants'

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Animated Blobs */}
      <div className="blob bg-secondary w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-secondary/30"></div>
      <div className="blob bg-accent w-96 h-96 rounded-full bottom-0 -right-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-accent/30"></div>
      <div className="absolute inset-0 hero-pattern"></div>

      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 relative z-10 text-center">
        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight leading-[1.4] mb-6">
          <span className="bg-linear-to-r from-teal-700 via-teal-600 to-teal-500 bg-clip-text text-transparent font-display font-semibold italic inline-block">
            {LANDING_CONTENT.hero.subtitle}
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
          {LANDING_CONTENT.hero.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none sm:mx-0">
          <Link
            to="/create-doa-list"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'primary-gradient' }),
              'w-full sm:w-auto px-8 py-4 text-lg shadow-green hover:shadow-green-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 min-h-14 justify-center',
            )}
          >
            {LANDING_CONTENT.hero.primaryCTA}
            <ArrowRight className="w-5 h-5 shrink-0" />
          </Link>
          <Link
            to="/doa"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'green-outline' }),
              'w-full sm:w-auto px-8 py-4 text-lg shadow-green hover:shadow-green-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 min-h-14 justify-center',
            )}
          >
            {LANDING_CONTENT.hero.secondaryCTA}
          </Link>
        </div>
      </div>
    </section>
  )
}
