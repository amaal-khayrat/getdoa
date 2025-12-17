import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LANDING_CONTENT } from '@/lib/constants'

export function SpiritualGrowthSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight">
              {LANDING_CONTENT.spiritualGrowth.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {LANDING_CONTENT.spiritualGrowth.description}
            </p>

            {/* Feature List */}
            <ul className="space-y-4 mt-6">
              {LANDING_CONTENT.spiritualGrowth.features.map(
                (feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span className="text-foreground dark:text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ),
              )}
            </ul>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                className="text-primary hover:text-primary/90 font-medium flex items-center gap-2 group"
                variant="ghost"
              >
                Explore all features
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="lg:w-1/2 relative">
            {/* Background decoration */}
            <div className="absolute top-10 left-10 -z-10 w-full h-full bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl transform -rotate-3 opacity-60"></div>

            {/* Main App Mockup */}
            <div className="relative z-10 bg-card dark:bg-card rounded-2xl shadow-xl border border-border p-6 max-w-md mx-auto transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    <span className="text-lg">☀️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">
                      Morning Adhkar
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      12 prayers • 5 mins
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground">⋯</span>
              </div>

              {/* Progress indicators */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Today's Progress
                  </span>
                  <span className="font-medium text-foreground">
                    8/12 completed
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-teal-500 rounded-full"></div>
                </div>
              </div>

              {/* List of prayers */}
              <div className="space-y-3">
                {[
                  'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى...',
                  'رَضِيتُ بِاللَّهِ رَبًّا...',
                  'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ...',
                ].map((prayer, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        index < 2
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {index < 2 && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <p
                      className="text-sm font-arabic text-foreground flex-1"
                      dir="rtl"
                    >
                      {prayer}
                    </p>
                  </div>
                ))}
              </div>

              {/* Start Button */}
              <div className="mt-6">
                <Button className="w-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-100 dark:border-teal-800">
                  Continue Morning Adhkar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
