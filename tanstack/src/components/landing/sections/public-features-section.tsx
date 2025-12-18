import { Edit3, Globe, GraduationCap, ShieldCheck } from 'lucide-react'
import { LANDING_CONTENT } from '@/lib/constants'

// Map Material Icons to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  edit_note: Edit3,
  public: Globe,
  verified: ShieldCheck,
  school: GraduationCap,
}

export function PublicFeaturesSection() {
  return (
    <section
      className="py-24 bg-slate-50 dark:bg-slate-900 relative z-10"
      id="features"
    >
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
                const IconComponent = iconMap[feature.icon]

                // Exact color mapping from HTML
                const getIconColors = (color: string) => {
                  switch (color) {
                    case 'blue':
                      return {
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                        text: 'text-blue-600 dark:text-blue-400',
                      }
                    case 'purple':
                      return {
                        bg: 'bg-purple-50 dark:bg-purple-900/20',
                        text: 'text-purple-600 dark:text-purple-400',
                      }
                    case 'emerald':
                      return {
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        text: 'text-emerald-600 dark:text-emerald-400',
                      }
                    case 'amber':
                      return {
                        bg: 'bg-amber-50 dark:bg-amber-900/20',
                        text: 'text-amber-600 dark:text-amber-400',
                      }
                    default:
                      return {
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                        text: 'text-blue-600 dark:text-blue-400',
                      }
                  }
                }

                const iconColors = getIconColors(feature.color)

                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl hover:shadow-lg transition-all duration-300 group border border-slate-100 dark:border-slate-700/50"
                  >
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl ${iconColors.bg} ${iconColors.text} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
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
