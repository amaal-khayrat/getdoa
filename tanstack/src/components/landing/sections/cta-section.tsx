import { LANDING_CONTENT } from '@/lib/constants'

export function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-muted dark:bg-card rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-foreground">
              {LANDING_CONTENT.cta.title}
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}
