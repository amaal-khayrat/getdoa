import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { LANDING_CONTENT } from '@/lib/constants'

export function PublicFeaturesSection() {
  return (
    <section className="py-24 relative z-10" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            {LANDING_CONTENT.publicFeatures.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {LANDING_CONTENT.publicFeatures.subtitle}
          </p>
        </div>

        {/* Features Container - 2 Column Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Features List (3 rows) */}
            <div className="space-y-6">
              {LANDING_CONTENT.publicFeatures.items.map((feature, index) => {
                // First item ("Discover Shared Doa") links to /lists
                const isClickable = index === 0

                const cardContent = (
                  <>
                    {/* Content */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                    {isClickable && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3 group-hover:gap-2 transition-all">
                        Explore Lists
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </>
                )

                const cardClasses =
                  'bg-white dark:bg-slate-800/50 p-6 rounded-3xl hover:shadow-lg transition-all duration-300 group border border-slate-100 dark:border-slate-700/50 shadow-[-8px_0_25px_-5px_rgba(20,184,166,0.4)]'

                if (isClickable) {
                  return (
                    <Link
                      key={index}
                      to="/lists"
                      className={`${cardClasses} block cursor-pointer`}
                    >
                      {cardContent}
                    </Link>
                  )
                }

                return (
                  <div key={index} className={cardClasses}>
                    {cardContent}
                  </div>
                )
              })}
            </div>

            {/* Right Column - Illustration */}
            <div className="flex justify-center items-center order-first lg:order-last">
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src="/people_berdoa.svg"
                  alt="People praying together"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
