import { Link } from '@tanstack/react-router'
import { ArrowRight, ImagePlus, LockOpen } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LANDING_CONTENT } from '@/lib/constants'

export function EnhancedFeaturesSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wide mb-6">
            <LockOpen className="w-4 h-4" />
            {LANDING_CONTENT.enhancedFeatures.badge}
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            {LANDING_CONTENT.enhancedFeatures.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            {LANDING_CONTENT.enhancedFeatures.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
          {LANDING_CONTENT.enhancedFeatures.items.map((feature, index) => (
            <div
              key={index}
              className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-2rem)] bg-white dark:bg-slate-800 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 shadow-[0_-8px_25px_-5px_rgba(20,184,166,0.4)]"
            >
              {/* Content */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'primary-gradient' }),
              'px-8 py-4 text-base rounded-full shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all gap-2',
            )}
          >
            {LANDING_CONTENT.enhancedFeatures.ctaButton}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            search={{ ref: '/dashboard/doa-image' }}
            className={cn(
              buttonVariants({ size: 'lg', variant: 'green-outline' }),
              'px-8 py-4 text-base rounded-full hover:-translate-y-0.5 transition-all gap-2',
            )}
          >
            <ImagePlus className="w-5 h-5" />
            Create Doa Image
          </Link>
        </div>
      </div>
    </section>
  )
}
