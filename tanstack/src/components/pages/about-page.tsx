import {
  Accessibility,
  Building,
  Heart,
  Lightbulb,
  Verified,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'

// Icon mapping for company values
const iconMap = {
  verified: Verified,
  accessibility: Accessibility,
  lightbulb: Lightbulb,
}

// Color classes for different value colors
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

export function AboutPage() {
  const aboutContent = LANDING_CONTENT.pages.about

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Pattern */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent dark:from-teal-500/10 dark:via-emerald-500/10" />

        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-gradient mb-6">
            {aboutContent.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            {aboutContent.hero.subtitle}
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {aboutContent.hero.description}
          </p>
        </div>
      </section>

      {/* Company Information Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Company Info Card */}
            <Card className="p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                    <Building className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-foreground">
                      {aboutContent.company.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Founded {aboutContent.company.founded}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Business Registration
                    </p>
                    <p className="font-mono text-foreground">
                      {aboutContent.company.registration}
                    </p>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {aboutContent.company.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mission Statement */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                <h3 className="text-2xl font-serif font-medium text-foreground">
                  {aboutContent.mission.title}
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {aboutContent.mission.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do at GetDoa
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {aboutContent.values.map((value, index) => {
              const IconComponent = iconMap[value.icon as keyof typeof iconMap]
              const colors =
                colorClasses[value.color as keyof typeof colorClasses]

              return (
                <Card
                  key={index}
                  className={`p-8 rounded-2xl border border-transparent ${colors.hover} hover:shadow-lg transition-all duration-300 group`}
                >
                  <CardContent className="p-0">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
