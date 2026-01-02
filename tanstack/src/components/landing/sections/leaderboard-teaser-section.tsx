import { Link } from '@tanstack/react-router'
import { Trophy, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LeaderboardTeaserSection() {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-br from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 rounded-[2rem] p-8 md:p-12 relative overflow-hidden border border-teal-200/50 dark:border-teal-800/50">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Icon */}
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                Community Leaderboard
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl">
                See who's spreading the word about GetDoa. Join our referral
                program and climb the ranks!
              </p>
            </div>

            {/* CTA */}
            <div className="shrink-0">
              <Link
                to="/leaderboard"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'primary-gradient' }),
                  'px-6 py-3 rounded-full shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all gap-2',
                )}
              >
                View Leaderboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
