import { Bookmark, CheckCircle, Clock, Languages } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'

// Icon mapping
const iconMap = {
  collections_bookmark: Bookmark,
  schedule: Clock,
  translate: Languages,
}

// Color classes for different feature colors
const colorClasses = {
  teal: {
    bg: 'bg-teal-100/50 dark:bg-teal-900/30',
    text: 'text-teal-600 dark:text-teal-400',
    hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
  },
  purple: {
    bg: 'bg-purple-100/50 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
  },
  amber: {
    bg: 'bg-amber-100/50 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
  },
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background dark:bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
            {LANDING_CONTENT.features.title}
          </h2>
          <p className="text-muted-foreground">
            {LANDING_CONTENT.features.subtitle}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {LANDING_CONTENT.features.items.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap]
            const colors =
              colorClasses[feature.color as keyof typeof colorClasses]

            return (
              <Card
                key={index}
                className={`p-8 rounded-2xl border border-transparent ${colors.hover} hover:shadow-lg transition-all duration-300 group`}
              >
                <CardContent className="p-0">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-medium text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
