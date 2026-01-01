import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LANDING_CONTENT } from '@/lib/constants'

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground">
              {LANDING_CONTENT.testimonials.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {LANDING_CONTENT.testimonials.subtitle}
            </p>

            {/* Active Users */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-4">
                {/* Avatar placeholders */}
                <div className="w-10 h-10 rounded-full bg-muted border-2 border-background"></div>
                <div className="w-10 h-10 rounded-full bg-muted/80 border-2 border-background"></div>
                <div className="w-10 h-10 rounded-full bg-muted/60 border-2 border-background"></div>
                <div className="w-10 h-10 rounded-full bg-muted/40 border-2 border-background"></div>
                <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs text-primary font-medium">
                  2k+
                </div>
              </div>
              <div className="text-sm font-medium text-foreground">
                {LANDING_CONTENT.testimonials.activeUsers}
              </div>
            </div>
          </div>

          {/* Right - Testimonial Card */}
          <div className="relative">
            <Card className="bg-card dark:bg-card p-8 rounded-2xl shadow-lg border border-border relative z-10">
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-muted-foreground/20 absolute top-6 right-6" />

              {/* Testimonial Content */}
              <CardContent className="p-0 relative z-10">
                <p className="text-lg font-serif italic text-foreground mb-6">
                  {LANDING_CONTENT.testimonials.items[0].quote}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {LANDING_CONTENT.testimonials.items[0].avatar}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {LANDING_CONTENT.testimonials.items[0].author}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {LANDING_CONTENT.testimonials.items[0].role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background shadow effect */}
            <div className="absolute top-4 left-4 right-[-1rem] bottom-[-1rem] bg-muted/30 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
