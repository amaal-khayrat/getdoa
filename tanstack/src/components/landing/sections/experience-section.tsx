import { BookOpen, CheckCircle } from 'lucide-react'
import { PrayerCard } from '../components/prayer-card'
import { Card } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'

export function ExperienceSection() {
  return (
    <section id="experience" className="relative -mt-20 z-20 px-4 mb-32">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-card dark:bg-card border-border shadow-2xl overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
              {/* Header with Icon */}
              <div className="flex items-center gap-3 mb-2">
                <span className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                  <BookOpen className="w-6 h-6" />
                </span>
                <h3 className="text-2xl font-serif font-semibold text-foreground">
                  {LANDING_CONTENT.experience.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {LANDING_CONTENT.experience.description}
              </p>

              {/* Features List */}
              <div className="space-y-3 pt-4">
                {LANDING_CONTENT.experience.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Prayer Card Mockup */}
            <div className="bg-muted/50 p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl"></div>

              {/* Prayer Card */}
              <div className="relative z-10">
                <PrayerCard />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
