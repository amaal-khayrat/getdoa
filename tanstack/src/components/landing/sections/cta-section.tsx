import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, ImagePlus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
            <h2 className="text-3xl md:text-5xl font-serif font-medium bg-linear-to-r from-teal-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-[1.2] mb-8">
              {LANDING_CONTENT.cta.title}
            </h2>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/onboarding"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'primary-gradient' }),
                  'order-1 sm:order-2 px-8 py-4 text-base rounded-full shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all gap-2',
                )}
              >
                Create Your Doa List
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/lists"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'green-outline' }),
                  'order-2 sm:order-1 px-8 py-4 text-base rounded-full hover:-translate-y-0.5 transition-all gap-2',
                )}
              >
                <BookOpen className="w-5 h-5" />
                Browse Lists
              </Link>
              <Link
                to="/login"
                search={{ ref: '/dashboard/doa-image' }}
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'green-outline' }),
                  'order-3 px-8 py-4 text-base rounded-full hover:-translate-y-0.5 transition-all gap-2',
                )}
              >
                <ImagePlus className="w-5 h-5" />
                Create Doa Image
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
