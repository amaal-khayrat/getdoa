import { Bookmark, Share2, Sun } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'

interface PrayerCarouselProps {
  className?: string
}

export function PrayerCarousel({ className = '' }: PrayerCarouselProps) {
  return (
    <section className={`relative pb-32 lg:pb-40 overflow-hidden ${className}`}>
      {/* Animated Blobs */}
      <div className="blob bg-teal-200/40 w-96 h-96 rounded-full top-0 -left-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-teal-900/30"></div>
      <div className="blob bg-emerald-200/40 w-96 h-96 rounded-full bottom-0 -right-20 mix-blend-multiply dark:mix-blend-overlay dark:bg-emerald-900/30"></div>
      <div className="absolute inset-0 hero-pattern"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Carousel Container */}
        <div className="relative bg-card dark:bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>

          {/* Carousel Track */}
          <div className="prayer-carousel-track">
            {/* Clone the array for seamless loop */}
            {[
              ...LANDING_CONTENT.prayerCarousel,
              ...LANDING_CONTENT.prayerCarousel,
            ].map((prayer, index) => (
              <div key={index} className="prayer-carousel-item">
                <Card className="border-0 shadow-none rounded-none">
                  <CardContent className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                          <Sun className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">
                            {prayer.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {prayer.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Bookmark prayer"
                        >
                          <Bookmark className="w-5 h-5" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Share prayer"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Prayer Content */}
                    <div className="space-y-6 text-center">
                      {/* Arabic Text */}
                      <p
                        className="font-arabic text-3xl md:text-4xl text-foreground leading-loose"
                        dir="rtl"
                        lang="ar"
                      >
                        {prayer.arabicText}
                      </p>

                      {/* Divider */}
                      <div className="h-1 w-24 bg-teal-500/20 rounded-full mx-auto"></div>

                      {/* Translation */}
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                          Meanings
                        </p>
                        <p className="font-serif text-lg text-muted-foreground italic max-w-2xl mx-auto">
                          "{prayer.translation}"
                        </p>
                      </div>

                      {/* Reference */}
                      <p className="text-sm text-muted-foreground">
                        {prayer.reference}
                      </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-8 flex justify-center gap-2">
                      {LANDING_CONTENT.prayerCarousel.map((_, dotIndex) => (
                        <div
                          key={dotIndex}
                          className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                            index % LANDING_CONTENT.prayerCarousel.length ===
                            dotIndex
                              ? 'bg-teal-500'
                              : 'bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Overlay for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent z-10"></div>
        </div>

        {/* Floating Badge */}
        <div
          className="absolute -bottom-4 -right-4 bg-green-100 text-green-600 rounded-lg p-4 shadow-lg border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 flex items-center gap-3 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <div className="bg-green-500 text-white rounded-lg p-2">
            <Bookmark className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">
              Daily Goal
            </p>
            <p className="text-sm font-bold text-green-800 dark:text-green-200">
              Completed
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
