import {
  ArrowRight,
  BookmarkPlus,
  Download,
  Edit3,
  Languages,
  LockOpen,
  QrCode,
  Sparkles,
} from 'lucide-react'
import { LANDING_CONTENT } from '@/lib/constants'

// Map Material Icons to Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  auto_awesome: Sparkles,
  download_for_offline: Download,
  edit_note: Edit3,
  translate: Languages,
  qr_code_2: QrCode,
  bookmark_added: BookmarkPlus,
}

export function EnhancedFeaturesSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
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
          {LANDING_CONTENT.enhancedFeatures.items.map((feature, index) => {
            const IconComponent = iconMap[feature.icon]

            // Exact color mapping from HTML
            const getIconColors = (color: string) => {
              switch (color) {
                case 'violet':
                  return {
                    bg: 'bg-violet-50 dark:bg-violet-900/20',
                    text: 'text-violet-600 dark:text-violet-400',
                    glowBg: 'bg-violet-500/5',
                  }
                case 'indigo':
                  return {
                    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                    text: 'text-indigo-600 dark:text-indigo-400',
                    glowBg: 'bg-indigo-500/5',
                  }
                case 'teal':
                  return {
                    bg: 'bg-teal-50 dark:bg-teal-900/20',
                    text: 'text-teal-600 dark:text-teal-400',
                    glowBg: 'bg-teal-500/5',
                  }
                case 'rose':
                  return {
                    bg: 'bg-rose-50 dark:bg-rose-900/20',
                    text: 'text-rose-600 dark:text-rose-400',
                    glowBg: 'bg-rose-500/5',
                  }
                case 'cyan':
                  return {
                    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
                    text: 'text-cyan-600 dark:text-cyan-400',
                    glowBg: 'bg-cyan-500/5',
                  }
                case 'orange':
                  return {
                    bg: 'bg-orange-50 dark:bg-orange-900/20',
                    text: 'text-orange-600 dark:text-orange-400',
                    glowBg: 'bg-orange-500/5',
                  }
                default:
                  return {
                    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
                    text: 'text-indigo-600 dark:text-indigo-400',
                    glowBg: 'bg-indigo-500/5',
                  }
              }
            }

            const iconColors = getIconColors(feature.color)

            return (
              <div
                key={index}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-2rem)] bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700 group relative overflow-hidden"
              >
                {/* Background decoration */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 ${iconColors.glowBg} rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:opacity-100`}
                />

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${iconColors.bg} ${iconColors.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 gap-2">
            {LANDING_CONTENT.enhancedFeatures.ctaButton}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
